import { type Document, type InsertDocument, type Comparison, type InsertComparison, type ApiUsage, type InsertApiUsage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Comparison operations
  createComparison(comparison: InsertComparison): Promise<Comparison>;
  getComparison(id: string): Promise<Comparison | undefined>;
  updateComparison(id: string, updates: Partial<Comparison>): Promise<Comparison | undefined>;
  getComparisonByDocuments(doc1Id: string, doc2Id: string): Promise<Comparison | undefined>;
  
  // API Usage tracking
  createApiUsage(usage: InsertApiUsage): Promise<ApiUsage>;
  getApiUsageStats(): Promise<{
    totalTokens: number;
    totalCost: number;
    totalOperations: number;
    averageProcessingTime: number;
  }>;
}

export class MemStorage implements IStorage {
  private documents: Map<string, Document>;
  private comparisons: Map<string, Comparison>;
  private apiUsage: Map<string, ApiUsage>;

  constructor() {
    this.documents = new Map();
    this.comparisons = new Map();
    this.apiUsage = new Map();
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      id,
      uploadedAt: new Date(),
      extractedText: null,
      summary: null,
      processingStatus: "uploaded",
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...updates };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  async createComparison(insertComparison: InsertComparison): Promise<Comparison> {
    const id = randomUUID();
    const comparison: Comparison = {
      ...insertComparison,
      id,
      similarityScore: null,
      similarities: null,
      differences: null,
      analysis: null,
      createdAt: new Date(),
    };
    this.comparisons.set(id, comparison);
    return comparison;
  }

  async getComparison(id: string): Promise<Comparison | undefined> {
    return this.comparisons.get(id);
  }

  async updateComparison(id: string, updates: Partial<Comparison>): Promise<Comparison | undefined> {
    const comparison = this.comparisons.get(id);
    if (!comparison) return undefined;
    
    const updatedComparison = { ...comparison, ...updates };
    this.comparisons.set(id, updatedComparison);
    return updatedComparison;
  }

  async getComparisonByDocuments(doc1Id: string, doc2Id: string): Promise<Comparison | undefined> {
    return Array.from(this.comparisons.values()).find(
      (comp) => 
        (comp.document1Id === doc1Id && comp.document2Id === doc2Id) ||
        (comp.document1Id === doc2Id && comp.document2Id === doc1Id)
    );
  }

  async createApiUsage(insertUsage: InsertApiUsage): Promise<ApiUsage> {
    const id = randomUUID();
    const usage: ApiUsage = {
      ...insertUsage,
      id,
      createdAt: new Date(),
    };
    this.apiUsage.set(id, usage);
    return usage;
  }

  async getApiUsageStats(): Promise<{
    totalTokens: number;
    totalCost: number;
    totalOperations: number;
    averageProcessingTime: number;
  }> {
    const usages = Array.from(this.apiUsage.values());
    
    return {
      totalTokens: usages.reduce((sum, usage) => sum + usage.tokensUsed, 0),
      totalCost: usages.reduce((sum, usage) => sum + usage.estimatedCost, 0),
      totalOperations: usages.length,
      averageProcessingTime: usages.length > 0 
        ? usages.reduce((sum, usage) => sum + usage.processingTime, 0) / usages.length 
        : 0,
    };
  }
}

export const storage = new MemStorage();
