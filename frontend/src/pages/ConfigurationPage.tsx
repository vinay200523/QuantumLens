import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { 
  Sliders, 
  Play, 
  HelpCircle, 
  Layers, 
  FileCheck, 
  Network, 
  Cpu, 
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const ConfigurationPage: React.FC = () => {
  const { 
    config, 
    setConfig, 
    startAnalysis, 
    isAnalyzing, 
    progressStep, 
    errorMessage, 
    documents 
  } = useAnalysis();

  const handleRun = async () => {
    await startAnalysis();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
          <Sliders className="w-6 h-6 mr-2 text-blue-600" />
          Clustering & Summarization Parameters
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Fine-tune the topological nearest-neighbor graph parameters and sentence extraction lengths. 
          Each parameter directly controls how document communities are formed and explained.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Interactive Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Nearest Neighbors k */}
        <div className="academic-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 flex items-center">
              Nearest Neighbors (k)
              <span className="ml-2 font-mono text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                k = {config.k_neighbors}
              </span>
            </label>
            <HelpCircle className="w-4 h-4 text-slate-400" aria-label="How many candidate neighbors to query per document" />
          </div>

          <input
            type="range"
            min={1}
            max={Math.min(10, Math.max(2, documents.length - 1))}
            value={config.k_neighbors}
            onChange={(e) => setConfig({ ...config, k_neighbors: parseInt(e.target.value, 10) })}
            disabled={isAnalyzing}
            className="w-full accent-blue-600 cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>k=1 (Sparse)</span>
            <span>k=3 (Recommended)</span>
            <span>k=10 (Dense)</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
            <strong>Theoretical Meaning:</strong> Defines the local manifold query size in Scikit-Learn's <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded">NearestNeighbors(metric='cosine')</code>. 
            A larger <span className="font-semibold text-slate-700">k</span> increases cross-document connectivity and permits multi-hop chaining.
          </p>
        </div>

        {/* 2. Cosine Similarity Threshold (tau) */}
        <div className="academic-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 flex items-center">
              Similarity Threshold (&tau;)
              <span className="ml-2 font-mono text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                &tau; = {config.similarity_threshold.toFixed(2)}
              </span>
            </label>
            <HelpCircle className="w-4 h-4 text-slate-400" aria-label="Minimum cosine similarity required to accept a graph edge" />
          </div>

          <input
            type="range"
            min={0.10}
            max={0.50}
            step={0.01}
            value={config.similarity_threshold}
            onChange={(e) => setConfig({ ...config, similarity_threshold: parseFloat(e.target.value) })}
            disabled={isAnalyzing}
            className="w-full accent-blue-600 cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>&tau;=0.10 (Permissive)</span>
            <span>&tau;=0.25 (Balanced)</span>
            <span>&tau;=0.50 (Strict)</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
            <strong>Theoretical Meaning:</strong> Edge cutoff threshold in similarity graph <span className="font-mono text-slate-700">G=(V, E)</span>. 
            Edges with cosine similarity below <span className="font-semibold text-slate-700">&tau;</span> are pruned. Documents with zero accepted edges become isolated outliers (Cluster -1).
          </p>
        </div>

        {/* 3. Summary Sentences */}
        <div className="academic-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 flex items-center">
              Summary Sentence Count
              <span className="ml-2 font-mono text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                {config.summary_sentences} Sentences
              </span>
            </label>
            <HelpCircle className="w-4 h-4 text-slate-400" aria-label="Number of salient sentences extracted by TextRank" />
          </div>

          <input
            type="range"
            min={1}
            max={5}
            value={config.summary_sentences}
            onChange={(e) => setConfig({ ...config, summary_sentences: parseInt(e.target.value, 10) })}
            disabled={isAnalyzing}
            className="w-full accent-blue-600 cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>1 Sentence (Concise)</span>
            <span>2 Sentences (Standard)</span>
            <span>5 Sentences (Deep)</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
            <strong>Theoretical Meaning:</strong> Target length for graph-based <span className="font-semibold text-slate-700">TextRank</span> PageRank sentence extraction. 
            Extracted sentences are reordered chronologically to preserve original author discourse flow.
          </p>
        </div>

        {/* 4. Summarization Mode */}
        <div className="academic-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900">
              Summarization Paradigm
            </label>
            <HelpCircle className="w-4 h-4 text-slate-400" aria-label="Extractive vs Abstractive approach" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfig({ ...config, summarization_mode: 'extractive' })}
              className={`p-2.5 text-xs font-semibold rounded border text-left transition-colors ${
                config.summarization_mode === 'extractive'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-slate-900">Extractive (TextRank)</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Zero hallucination • Verbatim sentences</div>
            </button>

            <button
              type="button"
              onClick={() => setConfig({ ...config, summarization_mode: 'abstractive' })}
              className={`p-2.5 text-xs font-semibold rounded border text-left transition-colors ${
                config.summarization_mode === 'abstractive'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-slate-900">Abstractive (Transformer)</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Paraphrased synthesis • Fallback enabled</div>
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
            <strong>Academic Note:</strong> Extractive TextRank is the required academic baseline because it guarantees complete factual accuracy without fabricating hallucinated claims.
          </p>
        </div>
      </div>

      {/* Transparent Pipeline Stepper Guide */}
      <div className="academic-card p-5 bg-slate-50/60 border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center">
          <Layers className="w-4 h-4 mr-2 text-blue-600" />
          Under-the-Hood NLP Pipeline Stages
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white rounded border border-slate-200">
            <p className="font-bold text-blue-900">1. Preprocessing</p>
            <p className="text-slate-500 text-[11px] mt-1">Dual-stream regex tokenization, stopword removal, lemmatization.</p>
          </div>
          <div className="p-3 bg-white rounded border border-slate-200">
            <p className="font-bold text-blue-900">2. Vectorization</p>
            <p className="text-slate-500 text-[11px] mt-1">Unigram & bigram TF-IDF with sublinear term-frequency scaling.</p>
          </div>
          <div className="p-3 bg-white rounded border border-slate-200">
            <p className="font-bold text-blue-900">3. Graph Clustering</p>
            <p className="text-slate-500 text-[11px] mt-1">KNN search with cosine distance, &tau; filtering & connected components.</p>
          </div>
          <div className="p-3 bg-white rounded border border-slate-200">
            <p className="font-bold text-blue-900">4. Attribution</p>
            <p className="text-slate-500 text-[11px] mt-1">9-factor evidence engine calculating margins & shortest graph paths.</p>
          </div>
        </div>
      </div>

      {/* Execution Action Button */}
      <div className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
        {isAnalyzing ? (
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 text-sm font-semibold text-blue-700">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{progressStep}</span>
            </div>
            <p className="text-xs text-slate-400">Performing mathematical clustering and evidence attribution...</p>
          </div>
        ) : (
          <>
            <button
              onClick={handleRun}
              disabled={documents.length < 2}
              className="inline-flex items-center px-8 py-3 text-sm font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              Execute QuantumLens Pipeline ({documents.length} Documents)
            </button>
            <p className="text-xs text-slate-500">
              Estimated processing time: &lt; 2 seconds for 20 documents.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
