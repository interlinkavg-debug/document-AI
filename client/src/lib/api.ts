import { apiRequest } from "./queryClient";
import type { ProcessingResponse, ComparisonResponse } from "@shared/schema";

export async function uploadPdf(file: File): Promise<ProcessingResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

export async function compareDocuments(document1Id: string, document2Id: string): Promise<ComparisonResponse> {
  const response = await apiRequest('POST', '/api/compare', {
    document1Id,
    document2Id,
  });

  return await response.json();
}

export async function getDocument(documentId: string) {
  const response = await apiRequest('GET', `/api/document/${documentId}`);
  return await response.json();
}

export async function getApiStats() {
  const response = await apiRequest('GET', '/api/stats');
  return await response.json();
}
