import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Share2, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Tag,
  GitCommit,
  Network
} from 'lucide-react';

export const DocumentDetailPage: React.FC = () => {
  const { 
    analysisResults, 
    selectedDocId, 
    setSelectedDocId, 
    setActiveTab, 
    navigateToCluster 
  } = useAnalysis();

  const [showPreprocessed, setShowPreprocessed] = useState(false);

  if (!analysisResults) {
    return <div className="p-8 text-center text-slate-500">No analysis results available.</div>;
  }

  const { documents, clusters } = analysisResults;

  // Selected Document
  const currentDoc = documents.find((d) => d.doc_id === selectedDocId) || documents[0];
  const assignedCluster = clusters.find((c) => c.cluster_id === currentDoc?.cluster_id);

  if (!currentDoc) {
    return <div className="p-8 text-center text-slate-500">Document not found.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Document Selector Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('clusters')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center mr-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Clusters
          </button>
          <span className="text-slate-300">|</span>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select Document:
          </label>
          <select
            value={currentDoc.doc_id}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded px-2.5 py-1 focus:border-blue-500 focus:outline-hidden"
          >
            {documents.map((d) => (
              <option key={d.doc_id} value={d.doc_id}>
                {d.doc_id}: {d.title.slice(0, 45)}...
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">
            Assigned to:
          </span>
          <button
            onClick={() => currentDoc.cluster_id !== -1 && navigateToCluster(currentDoc.cluster_id)}
            className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 hover:underline"
          >
            {currentDoc.cluster_id === -1 ? 'Isolated (-1)' : `Cluster ${currentDoc.cluster_id}`}
          </button>
        </div>
      </div>

      {/* Main Document Header */}
      <div className="academic-card p-6 bg-white border-l-4 border-l-blue-600 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
            {currentDoc.doc_id}
          </span>
          <span className="text-xs text-slate-500">
            Source: <strong>{currentDoc.source}</strong> • Date: <strong>{currentDoc.publication_date}</strong>
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {currentDoc.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <span className="text-slate-600">
            Original Words: <strong>{currentDoc.original_words}</strong>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">
            Summary Words: <strong>{currentDoc.summary_words}</strong>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Compression: {(currentDoc.compression_ratio * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* SECTION 11 & 12: DYNAMIC EVIDENCE-BASED ASSIGNMENT EXPLANATION */}
      <div className="academic-card p-6 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 border border-blue-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-blue-600 text-white">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Evidence-Based Cluster Assignment Explanation
            </h2>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-white border border-blue-200 text-blue-700">
            {currentDoc.assignment_status}
          </span>
        </div>

        {/* Dynamic Computed Explanation Text */}
        <div className="p-4 rounded-lg bg-white border border-blue-100 shadow-2xs text-sm text-slate-800 leading-relaxed font-sans">
          <p className="font-medium text-slate-900">
            {currentDoc.explanation}
          </p>
        </div>

        {/* Uncertainty / Warning Callout */}
        {currentDoc.is_isolated ? (
          <div className="p-3.5 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Isolated Outlier Warning (Degree 0)</p>
              <p className="mt-0.5">
                This document did not achieve sufficient cosine similarity with any neighbor to satisfy the required threshold (&tau;). 
                It has been kept isolated rather than being artificially forced into a mismatching cluster.
              </p>
            </div>
          </div>
        ) : currentDoc.margin_delta < 0.08 ? (
          <div className="p-3.5 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Ambiguous Boundary Document</p>
              <p className="mt-0.5">
                The margin of separation to alternative {currentDoc.alternative_cluster} is narrow (&Delta; = {currentDoc.margin_delta.toFixed(3)}). 
                This document shares vocabulary with multiple thematic areas.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Confident Cluster Assignment:</strong> Separation margin over competing clusters is robust (&Delta; = {currentDoc.margin_delta.toFixed(3)}).
            </span>
          </div>
        )}
      </div>

      {/* 2-Column Deep-Dive: Keywords & Nearest Neighbor Connections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Keyword Attribution Breakdown */}
        <div className="academic-card p-5 bg-white space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Tag className="w-4 h-4 mr-2 text-blue-600" />
            Vocabulary Attribution Breakdown
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <p className="text-slate-500 font-medium mb-1.5">Document Distinctive Keywords (Highest TF-IDF):</p>
              <div className="flex flex-wrap gap-1.5">
                {currentDoc.doc_keywords.map((kw, i) => (
                  <span key={i} className="badge-tag">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-slate-500 font-medium mb-1.5">Defining Cluster Keywords (Centroid Vector):</p>
              <div className="flex flex-wrap gap-1.5">
                {currentDoc.cluster_keywords.length > 0 ? (
                  currentDoc.cluster_keywords.map((kw, i) => (
                    <span key={i} className="badge-keyword">
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">N/A (Isolated Outlier)</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
              <p className="text-emerald-800 font-bold mb-1.5">Shared Overlapping Keywords (&cap;):</p>
              <div className="flex flex-wrap gap-1.5">
                {currentDoc.shared_keywords.length > 0 ? (
                  currentDoc.shared_keywords.map((kw, i) => (
                    <span key={i} className="badge-shared">
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic text-[11px]">No exact lexical overlap; grouped by local graph connectivity.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Graph Topology & Nearest Neighbors */}
        <div className="academic-card p-5 bg-white space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Network className="w-4 h-4 mr-2 text-blue-600" />
            Local Nearest Neighbors & Graph Paths
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
              <span className="text-slate-600">Topological Connectivity:</span>
              <span className="font-bold text-slate-900">{currentDoc.connectivity_type}</span>
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
              <span className="text-slate-600">Graph Shortest Path:</span>
              <span className="font-mono text-blue-700 font-semibold">{currentDoc.shortest_path}</span>
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
              <span className="text-slate-600">Nearest Alternative Group:</span>
              <span className="font-semibold text-slate-800">{currentDoc.alternative_cluster} (Margin &Delta; = {currentDoc.margin_delta})</span>
            </div>

            <div className="pt-2">
              <p className="text-slate-500 font-medium mb-1.5">Evaluated Nearest Neighbors:</p>
              <div className="space-y-1.5">
                {currentDoc.nearest_neighbors.map((n, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedDocId(n.neighbor_id)}
                    className="p-2 rounded border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{n.neighbor_id}</span>
                      <span className="text-slate-500 ml-1.5 line-clamp-1">{n.title}</span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-mono font-bold text-blue-700">sim={n.cosine_similarity.toFixed(3)}</span>
                      <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold ${n.edge_accepted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {n.edge_accepted ? 'Edge &ge; &tau;' : 'Filtered'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extractive Summary & Raw Text Card */}
      <div className="academic-card p-6 bg-white space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-blue-600" />
              {currentDoc.summary_method}
            </h3>
            <span className="text-xs text-slate-500">
              Chronologically Ordered • Saliency Ranked
            </span>
          </div>
          <div className="mt-2 p-3.5 bg-blue-50/50 rounded-lg border border-blue-100 text-sm text-slate-900 leading-relaxed font-sans">
            "{currentDoc.summary_text}"
          </div>
        </div>

        {/* Original Document Text */}
        <div className="pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Verbatim Original Source Text
          </h4>
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans max-h-48 overflow-y-auto">
            {currentDoc.text_raw}
          </div>
        </div>

        {/* Expandable Preprocessed Feature Text */}
        <div className="pt-2">
          <button
            onClick={() => setShowPreprocessed(!showPreprocessed)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
          >
            {showPreprocessed ? <ChevronUp className="w-3.5 h-3.5 mr-1" /> : <ChevronDown className="w-3.5 h-3.5 mr-1" />}
            {showPreprocessed ? 'Hide Preprocessed Tokens' : 'Inspect Cleaned & Lemmatized Tokens (TF-IDF Feature Stream)'}
          </button>

          {showPreprocessed && (
            <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded text-xs font-mono leading-relaxed max-h-36 overflow-y-auto">
              {currentDoc.text_clean}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
