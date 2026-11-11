import React, { useRef, useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { api } from '../services/api';
import { 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  Play, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCw,
  RotateCcw,
  Info,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const DocumentLabPage: React.FC = () => {
  const { 
    documents, 
    addDocument, 
    removeDocument, 
    updateDocument, 
    loadSampleData, 
    clearDocuments, 
    setDocuments,
    config,
    setConfig,
    startAnalysis,
    isAnalyzing,
    progressStep,
    errorMessage 
  } = useAnalysis();

  const fileInputCsvRef = useRef<HTMLInputElement | null>(null);
  const fileInputTxtRef = useRef<HTMLInputElement | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  // Pre-analysis Screening Statistics
  const totalWords = documents.reduce((acc, d) => acc + (d.text ? d.text.trim().split(/\s+/).filter(Boolean).length : 0), 0);
  const shortDocs = documents.filter((d) => d.text && d.text.trim().split(/\s+/).filter(Boolean).length < 10);
  const emptyDocs = documents.filter((d) => !d.text || d.text.trim().length === 0);

  // Duplicate Check
  const textHashMap = new Map<string, string[]>();
  documents.forEach((d) => {
    const norm = d.text.trim().toLowerCase();
    if (norm) {
      const existing = textHashMap.get(norm) || [];
      textHashMap.set(norm, [...existing, d.doc_id || 'Untitled']);
    }
  });
  const duplicateGroups = Array.from(textHashMap.values()).filter((ids) => ids.length > 1);

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setStatusNote(null);
    try {
      const parsed = await api.uploadCsv(file);
      setDocuments(parsed);
      setStatusNote(`Successfully imported ${parsed.length} documents from CSV file '${file.name}'.`);
    } catch (err: any) {
      alert(`CSV Upload failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputCsvRef.current) fileInputCsvRef.current.value = '';
    }
  };

  const handleTxtUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setIsUploading(true);
    setStatusNote(null);
    try {
      const parsed = await api.uploadTxtFiles(files);
      setDocuments([...documents, ...parsed]);
      setStatusNote(`Appended ${parsed.length} uploaded .txt document(s) to current laboratory workspace.`);
    } catch (err: any) {
      alert(`TXT Upload failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputTxtRef.current) fileInputTxtRef.current.value = '';
    }
  };

  const handleResetExperiment = () => {
    if (documents.length > 0) {
      const confirmReset = window.confirm(
        'Are you sure you want to reset the experiment? Any unsaved custom documents will be cleared.'
      );
      if (!confirmReset) return;
    }
    clearDocuments();
    setStatusNote('Experiment workspace has been cleared. You can load the sample dataset or enter new documents.');
  };

  return (
    <div className="space-y-6">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputCsvRef}
        onChange={handleCsvUpload}
        accept=".csv"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputTxtRef}
        onChange={handleTxtUpload}
        accept=".txt"
        multiple
        className="hidden"
      />

      {/* 1. Workflow Progress Indicator */}
      <div className="flex flex-wrap items-center justify-between p-3 rounded-md bg-white border border-slate-200 text-xs shadow-2xs gap-2">
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-600 text-white font-bold shadow-2xs">
            1. Document Input & Screening
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 text-slate-600">
            2. Graph Clustering & Summarization
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 text-slate-600">
            3. Results & Assignment Explanations
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              loadSampleData();
              setStatusNote('Loaded curated 20-article Quantum Computing demonstration dataset.');
            }}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Load Sample Dataset (20)
          </button>

          <button
            onClick={handleResetExperiment}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Experiment
          </button>
        </div>
      </div>

      {/* 2. Laboratory Introduction Card */}
      <div className="academic-card p-6 bg-white border-l-4 border-l-blue-600 space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Document Laboratory Workspace
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-4xl leading-relaxed">
          Enter or upload text documents to run explainable text analysis. The system extracts <strong>TF-IDF unigram and bigram features</strong>, 
          generates extractive summaries using <strong>TextRank PageRank</strong>, clusters documents via <strong>K-Nearest Neighbors (KNN) cosine proximity graphs</strong>, 
          and provides rigorous natural-language attribution explaining why each document was assigned to its group.
        </p>

        {/* Status Notification */}
        {statusNote && (
          <div className="mt-3 p-2.5 rounded-md bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800 flex items-center justify-between">
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-blue-600 shrink-0" />
              {statusNote}
            </span>
            <button onClick={() => setStatusNote(null)} className="text-blue-500 hover:text-blue-800 text-xs font-bold ml-2">
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-md bg-red-50 border border-red-200 text-xs font-medium text-red-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-bold">Analysis Pipeline Notice:</strong>
              {errorMessage}
            </div>
          </div>
        )}
      </div>

      {/* 3. Action Toolbar & Pre-Screening Summary */}
      <div className="academic-card p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={addDocument}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Document Field
          </button>
          <button
            onClick={() => fileInputTxtRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Upload TXT Files
          </button>
          <button
            onClick={() => fileInputCsvRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Upload CSV File
          </button>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-600">
          <span>
            Total: <strong>{documents.length}</strong> documents ({totalWords.toLocaleString()} words)
          </span>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center font-semibold text-xs px-2.5 py-1 rounded transition-colors ${
              showAdvanced ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Experiment Parameters
          </button>
        </div>
      </div>

      {/* Screening Warnings (Non-blocking preview warnings) */}
      {(shortDocs.length > 0 || emptyDocs.length > 0 || duplicateGroups.length > 0) && (
        <div className="p-3.5 rounded-md bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="flex items-center font-bold text-amber-800">
            <ShieldAlert className="w-4 h-4 mr-1.5 shrink-0" />
            Input Screening Warning:
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px] pl-1">
            {emptyDocs.length > 0 && (
              <li>{emptyDocs.length} document(s) have empty text and will be skipped during analysis.</li>
            )}
            {shortDocs.length > 0 && (
              <li>
                {shortDocs.length} document(s) have under 10 words ({shortDocs.map(d => d.doc_id || d.title).join(', ')}). 
                Documents under 10 words are excluded to prevent empty TF-IDF vocabulary errors.
              </li>
            )}
            {duplicateGroups.length > 0 && (
              <li>
                Duplicate content detected between: {duplicateGroups.map(grp => `[${grp.join(', ')}]`).join(', ')}. 
                Duplicate documents are deduplicated to protect graph topology.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* 4. Collapsible Advanced Settings Section */}
      {showAdvanced && (
        <div className="academic-card p-5 bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <Sliders className="w-4 h-4 mr-1.5 text-blue-600" />
              Configurable KNN & Summarization Parameters
            </h3>
            <span className="text-[11px] text-slate-500">Defaults are mathematically calibrated for dense multi-cluster formation.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* 1. Nearest Neighbors k */}
            <div className="space-y-1.5 bg-white p-3.5 rounded border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-800">Nearest Neighbors (k)</label>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  k = {config.k_neighbors}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={Math.max(2, Math.min(10, documents.length - 1 || 5))}
                value={config.k_neighbors}
                onChange={(e) => setConfig({ ...config, k_neighbors: parseInt(e.target.value) || 1 })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500">
                Number of most similar documents checked for each document in scikit-learn cosine nearest-neighbor search.
              </p>
            </div>

            {/* 2. Minimum Similarity Threshold tau */}
            <div className="space-y-1.5 bg-white p-3.5 rounded border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-800">Similarity Threshold (&tau;)</label>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {config.similarity_threshold.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={config.similarity_threshold}
                onChange={(e) => setConfig({ ...config, similarity_threshold: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500">
                Minimum cosine similarity required to connect two documents with an edge in the undirected similarity graph.
              </p>
            </div>

            {/* 3. Summary Sentences */}
            <div className="space-y-1.5 bg-white p-3.5 rounded border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-800">Summary Sentence Count</label>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {config.summary_sentences} sentences
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={config.summary_sentences}
                onChange={(e) => setConfig({ ...config, summary_sentences: parseInt(e.target.value) || 1 })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500">
                Number of top salient sentences extracted by TextRank PageRank with chronological discourse reordering.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Prominent "Analyze Documents" Trigger */}
      <div className="p-4 bg-white rounded-md border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Run Analysis Pipeline</h2>
          <p className="text-xs text-slate-500">
            {documents.length < 2
              ? 'Please provide at least 2 non-empty documents to enable clustering.'
              : `${documents.length} document(s) ready. Real-time NLP will execute vectorization, graph clustering, and explainability.`}
          </p>
        </div>

        <button
          onClick={startAnalysis}
          disabled={isAnalyzing || documents.length < 2}
          className={`inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold rounded-md shadow-xs transition-colors shrink-0 ${
            isAnalyzing || documents.length < 2
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Executing Analysis Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2 fill-current" />
              <span>Analyze Documents</span>
            </>
          )}
        </button>
      </div>

      {/* Real-time Step Progress Indicator */}
      {isAnalyzing && (
        <div className="p-3.5 rounded-md bg-blue-50 border border-blue-200 flex items-center space-x-3 text-xs text-blue-900">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
          <span className="font-semibold">{progressStep}</span>
        </div>
      )}

      {/* 6. Compact Document Editor Cards */}
      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="academic-card p-12 text-center bg-white space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">Laboratory Workspace is Empty</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click &quot;Load Sample Dataset (20)&quot; to populate the workspace with the quantum computing news dataset, 
              or click &quot;Add Document Field&quot; to enter custom documents.
            </p>
            <div className="pt-2 flex justify-center space-x-2">
              <button
                onClick={loadSampleData}
                className="px-4 py-2 text-xs font-bold rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-2xs"
              >
                Load Sample Dataset
              </button>
              <button
                onClick={addDocument}
                className="px-4 py-2 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              >
                + Add Empty Document
              </button>
            </div>
          </div>
        ) : (
          documents.map((doc, idx) => {
            const wordCount = doc.text ? doc.text.trim().split(/\s+/).filter(Boolean).length : 0;
            const isShort = wordCount < 10;

            return (
              <div key={idx} className="academic-card p-4 bg-white hover:border-slate-300 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {doc.doc_id || `DOC_${idx + 1}`}
                    </span>
                    <input
                      type="text"
                      value={doc.title}
                      onChange={(e) => updateDocument(idx, 'title', e.target.value)}
                      placeholder="Document Title"
                      className="text-xs sm:text-sm font-semibold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-hidden px-1 py-0.5 w-60 sm:w-96"
                    />
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <span className={`font-medium ${isShort ? 'text-amber-600' : 'text-slate-500'}`}>
                      {wordCount} words {isShort && '(Short: minimum 10 words)'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <input
                      type="text"
                      value={doc.source || ''}
                      onChange={(e) => updateDocument(idx, 'source', e.target.value)}
                      placeholder="Source (Optional)"
                      className="text-xs text-slate-600 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-hidden w-28 px-1"
                    />
                    <button
                      onClick={() => removeDocument(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Remove Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={doc.text}
                  onChange={(e) => updateDocument(idx, 'text', e.target.value)}
                  placeholder="Enter or paste document body text here..."
                  className="w-full text-xs text-slate-700 font-sans border border-slate-200 rounded p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-colors"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
