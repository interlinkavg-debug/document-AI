import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  extractedText: text("extracted_text"),
  summary: text("summary"),
  processingStatus: text("processing_status").notNull().default("uploaded"),
});

export const comparisons = pgTable("comparisons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  document1Id: varchar("document1_id").notNull(),
  document2Id: varchar("document2_id").notNull(),
  similarityScore: real("similarity_score"),
  similarities: text("similarities").array(),
  differences: text("differences").array(),
  analysis: text("analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiUsage = pgTable("api_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operation: text("operation").notNull(),
  tokensUsed: integer("tokens_used").notNull(),
  estimatedCost: real("estimated_cost").notNull(),
  processingTime: real("processing_time").notNull(),
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  filename: true,
  originalName: true,
  fileSize: true,
});

export const insertComparisonSchema = createInsertSchema(comparisons).pick({
  document1Id: true,
  document2Id: true,
});

export const insertApiUsageSchema = createInsertSchema(apiUsage).pick({
  operation: true,
  tokensUsed: true,
  estimatedCost: true,
  processingTime: true,
  success: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertComparison = z.infer<typeof insertComparisonSchema>;
export type Comparison = typeof comparisons.$inferSelect;
export type InsertApiUsage = z.infer<typeof insertApiUsageSchema>;
export type ApiUsage = typeof apiUsage.$inferSelect;

// API Response types
export const ProcessingResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  documentId: z.string().optional(),
  extractedText: z.string().optional(),
  summary: z.string().optional(),
  processingTime: z.number().optional(),
  tokensUsed: z.number().optional(),
  estimatedCost: z.number().optional(),
});

export const ComparisonResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  comparisonId: z.string().optional(),
  similarityScore: z.number().optional(),
  similarities: z.array(z.string()).optional(),
  differences: z.array(z.string()).optional(),
  analysis: z.string().optional(),
  processingTime: z.number().optional(),
  tokensUsed: z.number().optional(),
  estimatedCost: z.number().optional(),
});

export type ProcessingResponse = z.infer<typeof ProcessingResponseSchema>;
export type ComparisonResponse = z.infer<typeof ComparisonResponseSchema>;
