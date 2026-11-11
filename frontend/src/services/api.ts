import axios from 'axios';
import { DocumentInput, AnalysisConfig, AnalysisResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://quantumlens-doc-api.onrender.com/api' : 'http://localhost:8000/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

export const api = {
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  getSampleDocuments: async (): Promise<DocumentInput[]> => {
    const res = await apiClient.get<DocumentInput[]>('/sample');
    return res.data;
  },

  uploadCsv: async (file: File): Promise<DocumentInput[]> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<DocumentInput[]>('/upload/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  uploadTxtFiles: async (files: FileList | File[]): Promise<DocumentInput[]> => {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    const res = await apiClient.post<DocumentInput[]>('/upload/txt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  runAnalysis: async (documents: DocumentInput[], config: AnalysisConfig): Promise<AnalysisResponse> => {
    const payload = {
      documents,
      k_neighbors: config.k_neighbors,
      similarity_threshold: config.similarity_threshold,
      summary_sentences: config.summary_sentences,
      summarization_mode: config.summarization_mode,
    };
    const res = await apiClient.post<AnalysisResponse>('/analyze', payload);
    return res.data;
  },

  getPastRuns: async () => {
    const res = await apiClient.get('/runs');
    return res.data;
  },

  getRunDetails: async (runId: string) => {
    const res = await apiClient.get(`/runs/${runId}`);
    return res.data;
  },
};

