import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertComparisonSchema, ProcessingResponseSchema, ComparisonResponseSchema } from "@shared/schema";
import multer from "multer";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const execAsync = promisify(exec);

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads',
    filename: (req: any, file: any, cb: any) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.pdf`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Ensure uploads directory exists
const initializeUploadsDir = async () => {
  try {
    await fs.mkdir('./uploads', { recursive: true });
  } catch (error) {
    console.error('Failed to create uploads directory:', error);
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  await initializeUploadsDir();

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Upload and process PDF endpoint
  app.post("/api/upload-pdf", upload.single('file'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const startTime = Date.now();

      // Create document record
      const document = await storage.createDocument({
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
      });

      // Update status to processing
      await storage.updateDocument(document.id, {
        processingStatus: "processing"
      });

      try {
        // Process PDF using Python service
        const filePath = path.join('./uploads', req.file.filename);
        const { stdout, stderr } = await execAsync(`python3 server/services/pdf_service.py "${filePath}"`);
        
        if (stderr) {
          console.error('PDF processing stderr:', stderr);
        }

        const result = JSON.parse(stdout);
        
        if (!result.success) {
          throw new Error(result.error || 'PDF processing failed');
        }

        const processingTime = (Date.now() - startTime) / 1000;

        // Update document with results
        const updatedDocument = await storage.updateDocument(document.id, {
          extractedText: result.text,
          summary: result.summary,
          processingStatus: "completed"
        });

        // Track API usage
        await storage.createApiUsage({
          operation: "pdf_processing",
          tokensUsed: result.tokens_used || 0,
          estimatedCost: result.estimated_cost || 0,
          processingTime,
          success: true
        });

        const response: any = {
          success: true,
          message: "PDF processed successfully",
          documentId: document.id,
          extractedText: result.text,
          summary: result.summary,
          processingTime,
          tokensUsed: result.tokens_used || 0,
          estimatedCost: result.estimated_cost || 0
        };

        res.json(response);

      } catch (processingError) {
        console.error('PDF processing failed:', processingError);
        
        await storage.updateDocument(document.id, {
          processingStatus: "failed"
        });

        await storage.createApiUsage({
          operation: "pdf_processing",
          tokensUsed: 0,
          estimatedCost: 0,
          processingTime: (Date.now() - startTime) / 1000,
          success: false
        });

        res.status(500).json({
          success: false,
          message: `PDF processing failed: ${processingError instanceof Error ? processingError.message : String(processingError)}`
        });
      }

    } catch (error) {
      console.error('Upload endpoint error:', error);
      res.status(500).json({
        success: false,
        message: `Upload failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  });

  // Compare documents endpoint
  app.post("/api/compare", async (req, res) => {
    try {
      const { document1Id, document2Id } = req.body;

      if (!document1Id || !document2Id) {
        return res.status(400).json({
          success: false,
          message: "Both document IDs are required"
        });
      }

      const startTime = Date.now();

      const doc1 = await storage.getDocument(document1Id);
      const doc2 = await storage.getDocument(document2Id);

      if (!doc1 || !doc2) {
        return res.status(404).json({
          success: false,
          message: "One or both documents not found"
        });
      }

      if (!doc1.extractedText || !doc2.extractedText) {
        return res.status(400).json({
          success: false,
          message: "Both documents must be processed before comparison"
        });
      }

      // Check if comparison already exists
      let comparison = await storage.getComparisonByDocuments(document1Id, document2Id);
      
      if (!comparison) {
        comparison = await storage.createComparison({
          document1Id,
          document2Id
        });
      }

      try {
        // Create temporary files for the text content to avoid command line length/character issues
        const tempDir = './temp';
        await fs.mkdir(tempDir, { recursive: true });
        
        const tempFile1 = path.join(tempDir, `doc1_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.txt`);
        const tempFile2 = path.join(tempDir, `doc2_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.txt`);
        
        await fs.writeFile(tempFile1, doc1.extractedText);
        await fs.writeFile(tempFile2, doc2.extractedText);
        
        // Perform comparison using Python service with file paths
        const { stdout, stderr } = await execAsync(
          `python3 server/services/llm_client.py compare-files "${tempFile1}" "${tempFile2}"`
        );
        
        // Clean up temporary files
        try {
          await fs.unlink(tempFile1);
          await fs.unlink(tempFile2);
        } catch (cleanupError) {
          console.warn('Failed to clean up temporary files:', cleanupError);
        }
        
        if (stderr) {
          console.error('Comparison stderr:', stderr);
        }

        const result = JSON.parse(stdout);
        
        if (!result.success) {
          throw new Error(result.error || 'Comparison failed');
        }

        const processingTime = (Date.now() - startTime) / 1000;

        // Update comparison with results
        const updatedComparison = await storage.updateComparison(comparison.id, {
          similarityScore: result.similarity_score,
          similarities: result.similarities,
          differences: result.differences,
          analysis: result.analysis
        });

        // Track API usage
        await storage.createApiUsage({
          operation: "document_comparison",
          tokensUsed: result.tokens_used || 0,
          estimatedCost: result.estimated_cost || 0,
          processingTime,
          success: true
        });

        const response: any = {
          success: true,
          message: "Documents compared successfully",
          comparisonId: comparison.id,
          similarityScore: result.similarity_score,
          similarities: result.similarities,
          differences: result.differences,
          analysis: result.analysis,
          processingTime,
          tokensUsed: result.tokens_used || 0,
          estimatedCost: result.estimated_cost || 0
        };

        res.json(response);

      } catch (comparisonError) {
        console.error('Comparison failed:', comparisonError);
        
        await storage.createApiUsage({
          operation: "document_comparison",
          tokensUsed: 0,
          estimatedCost: 0,
          processingTime: (Date.now() - startTime) / 1000,
          success: false
        });

        res.status(500).json({
          success: false,
          message: `Comparison failed: ${comparisonError instanceof Error ? comparisonError.message : String(comparisonError)}`
        });
      }

    } catch (error) {
      console.error('Compare endpoint error:', error);
      res.status(500).json({
        success: false,
        message: `Comparison failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  });

  // Get document endpoint
  app.get("/api/document/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found"
        });
      }

      res.json({
        success: true,
        document
      });

    } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({
        success: false,
        message: `Failed to retrieve document: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  });

  // Get API usage stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getApiUsageStats();
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Stats endpoint error:', error);
      res.status(500).json({
        success: false,
        message: `Failed to retrieve stats: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
