import React, { useRef, useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { api } from '../services/api';
import { 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Database,
  RefreshCw
} from 'lucide-react';

export const DocumentInputPage: React.FC = () => {
  const { 
    documents, 
    addDocument, 
    removeDocument, 
    updateDocument, 
    loadSampleData, 
    clearDocuments, 
    setDocuments,
    setActiveTab,
    errorMessage 
  } = useAnalysis();

  const fileInputCsvRef = useRef<HTMLInputElement | null>(null);
  const fileInputTxtRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);

  // Compute validation statistics
  const totalWords = documents.reduce((acc, d) => acc + (d.text ? d.text.trim().split(/\s+/).length : 0), 0);
  const emptyDocs = documents.filter((d) => !d.text || d.text.trim().length === 0);
  const shortDocs = documents.filter((d) => d.text && d.text.trim().split(/\s+/).length < 15);
  
  // Check duplicates
  const textSet = new Set<string>();
  let duplicateCount = 0;
  documents.forEach((d) => {
    const norm = d.text.trim().toLowerCase();
    if (norm) {
      if (textSet.has(norm)) duplicateCount++;
      else textSet.add(norm);
    }
  });

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setLocalFeedback(null);
    try {
      const parsed = await api.uploadCsv(file);
      setDocuments(parsed);
      setLocalFeedback(`Successfully imported ${parsed.length} documents from ${file.name}`);
    } catch (err: any) {
      setLocalFeedback(err.response?.data?.detail || 'Failed to parse CSV file. Ensure valid columns.');
    } finally {
      setIsUploading(false);
      if (fileInputCsvRef.current) fileInputCsvRef.current.value = '';
    }
  };

  const handleTxtUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = e.target.files;
    setIsUploading(true);
    setLocalFeedback(null);
    try {
      const parsed = await api.uploadTxtFiles(files);
      setDocuments([...documents, ...parsed]);
      setLocalFeedback(`Appended ${parsed.length} text documents.`);
    } catch (err: any) {
      setLocalFeedback('Failed to upload TXT files.');
    } finally {
      setIsUploading(false);
      if (fileInputTxtRef.current) fileInputTxtRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero / Introduction Header */}
      <div className="academic-card p-6 border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50/50 to-white">
        <div className="max-w-4xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unsupervised Text Analysis & Attribution Framework</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Document Ingestion & Preparation
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            QuantumLens automatically clusters heterogeneous documents via nearest-neighbor similarity graphs, 
            extracts salient summaries via TextRank, and explains assignments using transparent feature attribution. 
            You can load the benchmark Quantum Computing dataset or input documents about any technical domain.
          </p>
        </div>
      </div>

      {/* Validation & Feedback Banners */}
      {localFeedback && (
        <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800 flex items-center justify-between">
          <span>{localFeedback}</span>
          <button onClick={() => setLocalFeedback(null)} className="text-blue-600 hover:underline text-xs">Dismiss</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Ingestion Action Toolbar */}
      <div className="academic-card p-4 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadSampleData}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Database className="w-3.5 h-3.5 mr-1.5" />
            Load Sample Quantum Dataset (20 Articles)
          </button>

          <button
            onClick={() => fileInputCsvRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Upload CSV
          </button>
          <input
            type="file"
            ref={fileInputCsvRef}
            onChange={handleCsvUpload}
            accept=".csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputTxtRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Upload Multiple .TXT
          </button>
          <input
            type="file"
            ref={fileInputTxtRef}
            onChange={handleTxtUpload}
            accept=".txt"
            multiple
            className="hidden"
          />

          <button
            onClick={addDocument}
            className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Add Blank Document
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {documents.length > 0 && (
            <button
              onClick={clearDocuments}
              className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1"
            >
              Clear All
            </button>
          )}

          <button
            onClick={() => setActiveTab('config')}
            disabled={documents.length < 2}
            className={`inline-flex items-center px-4 py-2 text-xs font-semibold rounded-md shadow-xs transition-colors ${
              documents.length >= 2
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Configure & Process ({documents.length})
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>
      </div>

      {/* Validation Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="academic-card p-3.5">
          <p className="text-xs text-slate-500 font-medium">Total Documents</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{documents.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Minimum 2 required</p>
        </div>

        <div className="academic-card p-3.5">
          <p className="text-xs text-slate-500 font-medium">Total Word Count</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalWords.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all documents</p>
        </div>

        <div className="academic-card p-3.5">
          <p className="text-xs text-slate-500 font-medium">Short / Empty Warnings</p>
          <p className={`text-xl font-bold mt-1 ${shortDocs.length > 0 || emptyDocs.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {shortDocs.length + emptyDocs.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">&lt; 15 words filtered during clustering</p>
        </div>

        <div className="academic-card p-3.5">
          <p className="text-xs text-slate-500 font-medium">Duplicate Documents</p>
          <p className={`text-xl font-bold mt-1 ${duplicateCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {duplicateCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Deduplicated automatically</p>
        </div>
      </div>

      {/* Document List / Interactive Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Document Corpus Queue ({documents.length} Items)
          </h2>
          <span className="text-xs text-slate-500">
            You can edit titles and text directly before starting analysis.
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="academic-card p-12 text-center bg-white">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No Documents in Queue</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              Load the Quantum Computing sample dataset or paste your own documents to get started.
            </p>
            <button
              onClick={loadSampleData}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              <Database className="w-4 h-4 mr-1.5" />
              Load Sample Dataset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {documents.map((doc, idx) => {
              const wordCount = doc.text.trim() ? doc.text.trim().split(/\s+/).length : 0;
              const isShort = wordCount < 15;

              return (
                <div key={idx} className="academic-card p-4 hover:border-blue-200 transition-all bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {doc.doc_id || `DOC_${idx + 1}`}
                      </span>
                      <input
                        type="text"
                        value={doc.title}
                        onChange={(e) => updateDocument(idx, 'title', e.target.value)}
                        placeholder="Document Title"
                        className="text-sm font-semibold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-hidden px-1 py-0.5 w-64 sm:w-96"
                      />
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <span className={`font-medium ${isShort ? 'text-amber-600' : 'text-slate-500'}`}>
                        {wordCount} words {isShort && '(Short)'}
                      </span>
                      <span className="text-slate-400">•</span>
                      <input
                        type="text"
                        value={doc.source || ''}
                        onChange={(e) => updateDocument(idx, 'source', e.target.value)}
                        placeholder="Source"
                        className="text-xs text-slate-600 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-hidden w-28 px-1"
                      />
                      <button
                        onClick={() => removeDocument(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={doc.text}
                    onChange={(e) => updateDocument(idx, 'text', e.target.value)}
                    placeholder="Enter or paste document body text here..."
                    className="w-full text-xs sm:text-sm text-slate-700 font-sans border border-slate-200 rounded-md p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-colors"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      {documents.length > 0 && (
        <div className="sticky bottom-4 academic-card p-4 bg-white/95 backdrop-blur-xs shadow-lg border border-slate-300 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-900">{documents.length}</span> documents ready for analysis.
          </div>
          <button
            onClick={() => setActiveTab('config')}
            className="inline-flex items-center px-5 py-2.5 text-xs font-bold rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            Configure & Run Analysis
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>
      )}
    </div>
  );
};
