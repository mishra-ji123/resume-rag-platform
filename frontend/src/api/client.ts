import axios from "axios";

export const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

const client = axios.create({
  baseURL: API_BASE_URL,
});

export interface DocumentItem {
  id: number;
  file_name: string;
  upload_status: string;
  processing_status: string;
  total_chunks: number;
  uploaded_at: string;
  processed_at: string;
  error_message: string | null;
}

export interface SearchResult {
  file_name: string;
  chunk_text: string;
  score: number;
}

export interface ChunkItem {
  point_id: number;
  chunk_id: number;
  chunk_text: string;
  file_name: string;
}

export interface DocumentDetail {
  document_id: number;
  file_name: string;
  total_chunks_stored: number;
  chunks: ChunkItem[];
}

export const api = {
  getDocuments: async (): Promise<DocumentItem[]> => {
    const response = await client.get("/resume/");
    return response.data;
  },
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await client.post("/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  resyncDocument: async (docId: number) => {
    const response = await client.post(`/resume/${docId}/resync`);
    return response.data;
  },
  searchDocuments: async (query: string, limit: number = 5): Promise<SearchResult[]> => {
    const response = await client.post("/search/", { query, limit });
    return response.data;
  },
  getDocumentChunks: async (docId: number): Promise<DocumentDetail> => {
    const response = await client.get(`/resume/${docId}/chunks`);
    return response.data;
  }
};
