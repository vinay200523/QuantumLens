import React, { createContext, useContext, useState, useEffect } from 'react';
import { DocumentInput, AnalysisConfig, AnalysisResponse } from '../types';
import { api } from '../services/api';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';

export type NavTab = 'lab' | 'results' | 'explain' | 'input' | 'config' | 'clusters' | 'document' | 'evaluation';

interface AnalysisContextType {
  documents: DocumentInput[];
  config: AnalysisConfig;
  analysisResults: AnalysisResponse | null;
  activeTab: NavTab;
  selectedClusterId: number | null;
  selectedDocId: string | null;
  isAnalyzing: boolean;
  errorMessage: string | null;
  progressStep: string;
  
  // Actions
  setDocuments: React.Dispatch<React.SetStateAction<DocumentInput[]>>;
  addDocument: () => void;
  removeDocument: (index: number) => void;
  updateDocument: (index: number, field: keyof DocumentInput, value: string) => void;
  loadSampleData: () => Promise<void>;
  clearDocuments: () => void;
  setConfig: React.Dispatch<React.SetStateAction<AnalysisConfig>>;
  setActiveTab: (tab: NavTab) => void;
  setSelectedClusterId: (id: number | null) => void;
  setSelectedDocId: (id: string | null) => void;
  startAnalysis: () => Promise<boolean>;
  navigateToDocument: (docId: string) => void;
  navigateToCluster: (clusterId: number) => void;
}

const defaultConfig: AnalysisConfig = {
  k_neighbors: 3,
  similarity_threshold: 0.20,
  summary_sentences: 2,
  summarization_mode: 'extractive',
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentInput[]>(SAMPLE_DOCUMENTS);
  const [config, setConfig] = useState<AnalysisConfig>(defaultConfig);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('lab');
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<string>('Ready');

  // Load sample dataset initially on mount so the user has immediate data
  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = async () => {
    try {
      setErrorMessage(null);
      setProgressStep('Loading Quantum Computing sample dataset...');
      const samples = await api.getSampleDocuments();
      if (samples && samples.length > 0) {
        setDocuments(samples);
      } else {
        setDocuments(SAMPLE_DOCUMENTS);
      }
      setProgressStep('Sample dataset loaded (20 articles).');
    } catch (err: any) {
      console.warn('Backend not responding to /api/sample yet; using embedded 20 sample documents.', err);
      setDocuments(SAMPLE_DOCUMENTS);
      setProgressStep('Sample dataset loaded (20 articles).');
    }
  };

  const addDocument = () => {
    const nextIdx = documents.length + 1;
    setDocuments([
      ...documents,
      {
        doc_id: `DOC_${nextIdx.toString().padStart(2, '0')}`,
        title: `Custom Document ${nextIdx}`,
        text: '',
        source: 'Direct Input',
        publication_date: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const updateDocument = (index: number, field: keyof DocumentInput, value: string) => {
    setDocuments(
      documents.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
    );
  };

  const clearDocuments = () => {
    setDocuments([]);
    setAnalysisResults(null);
  };

  const startAnalysis = async (): Promise<boolean> => {
    if (documents.length < 2) {
      setErrorMessage('Please provide at least 2 documents with sufficient text for clustering.');
      return false;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setProgressStep('Sanitizing inputs and deduplicating corpus...');

    try {
      await new Promise((r) => setTimeout(r, 200));
      setProgressStep('Running dual-stream NLP preprocessing and TextRank summarization...');
      
      const results = await api.runAnalysis(documents, config);
      
      setProgressStep('Constructing KNN proximity graph and computing connected components...');
      setAnalysisResults(results);
      
      // Auto select first cluster and first document
      if (results.clusters.length > 0) {
        setSelectedClusterId(results.clusters[0].cluster_id);
      }
      if (results.documents.length > 0) {
        setSelectedDocId(results.documents[0].doc_id);
      }
      
      setActiveTab('results');
      setIsAnalyzing(false);
      setProgressStep('Analysis complete.');
      return true;
    } catch (err: any) {
      console.error('Analysis failed:', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to complete document analysis. Ensure backend is running.';
      setErrorMessage(msg);
      setIsAnalyzing(false);
      return false;
    }
  };

  const navigateToDocument = (docId: string) => {
    setSelectedDocId(docId);
    setActiveTab('explain');
  };

  const navigateToCluster = (clusterId: number) => {
    setSelectedClusterId(clusterId);
    setActiveTab('results');
  };

  return (
    <AnalysisContext.Provider
      value={{
        documents,
        config,
        analysisResults,
        activeTab,
        selectedClusterId,
        selectedDocId,
        isAnalyzing,
        errorMessage,
        progressStep,
        setDocuments,
        addDocument,
        removeDocument,
        updateDocument,
        loadSampleData,
        clearDocuments,
        setConfig,
        setActiveTab,
        setSelectedClusterId,
        setSelectedDocId,
        startAnalysis,
        navigateToDocument,
        navigateToCluster,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};
