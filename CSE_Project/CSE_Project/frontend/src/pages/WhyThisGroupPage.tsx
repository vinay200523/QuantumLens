import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { 
  HelpCircle, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Tag, 
  Network, 
  ChevronDown, 
  ChevronUp,
  FileText,
  GitCommit,
  Share2
} from 'lucide-react';

export const WhyThisGroupPage: React.FC = () => {
  const { 
    analysisResults, 
    selectedDocId, 
    setSelectedDocId, 
    setActiveTab, 
    navigateToCluster 
  } = useAnalysis();

  const [showAdvancedProximity, setShowAdvancedProximity] = useState(false);
  const [showCleanText, setShowCleanText] = useState(false);

  if (!analysisResults) {
    return (
      <div className="academic-card p-12 text-center bg-white space-y-3">
        <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-semibold text-slate-800">No Document Explanations Available</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please run an analysis in the Document Lab before reviewing assignment explanations.
        </p>
        <button
          onClick={() => setActiveTab('lab')}
          className="px-4 py-2 text-xs font-bold rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-2xs"
        >
          Go to Document Lab
        </button>
      </div>
    );
  }

  const { documents, clusters } = analysisResults;

  // Selected Document
  const currentDoc = documents.find((d) => d.doc_id === selectedDocId) || documents[0];
  const assignedCluster = clusters.find((c) => c.cluster_id === currentDoc?.cluster_id);

  if (!currentDoc) {
    return <div className="p-8 text-center text-slate-500 text-xs">Document not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* 1. Top Document Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('results')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center mr-2 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Results
          </button>
          <span className="text-slate-300">|</span>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Document:
          </label>
          <select
            value={currentDoc.doc_id}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:border-blue-500 focus:outline-hidden max-w-xs sm:max-w-md truncate"
          >
            {documents.map((d) => (
              <option key={d.doc_id} value={d.doc_id}>
                {d.doc_id}: {d.title.slice(0, 50)}{d.title.length > 50 ? '...' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Current Assigned Group Pill */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">Assigned to:</span>
          <button
            onClick={() => currentDoc.cluster_id !== -1 && navigateToCluster(currentDoc.cluster_id)}
            className="text-xs font-bold px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
          >
            {currentDoc.cluster_id === -1 ? 'Isolated Outlier (-1)' : `Group ${currentDoc.cluster_id}`}
          </button>
        </div>
      </div>

      {/* 2. Main Document Card & Summary */}
      <div className="academic-card p-6 bg-white border-l-4 border-l-blue-600 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
            {currentDoc.doc_id}
          </span>
          <span className="text-xs text-slate-500">
            Source: <strong>{currentDoc.source}</strong> • Date: <strong>{currentDoc.publication_date}</strong>
          </span>
        </div>

        <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          {currentDoc.title}
        </h1>

        {/* Extractive Summary */}
        <div className="p-3.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
          <strong className="text-slate-900 font-semibold block">Concise Document Summary:</strong>
          <p className="italic">&ldquo;{currentDoc.summary_text}&rdquo;</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
          <span>Original Length: <strong>{currentDoc.original_words} words</strong></span>
          <span className="text-slate-300">&bull;</span>
          <span>Summary Length: <strong>{currentDoc.summary_words} words</strong></span>
          <span className="text-slate-300">&bull;</span>
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Compression: {(currentDoc.compression_ratio * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 3. Evidence-Based Assignment Explanation Verdict Box */}
      <div className="academic-card p-6 bg-blue-50/50 border border-blue-200 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-blue-600 text-white">
            <HelpCircle className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Assignment Explanation & Verdict
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans bg-white p-4 rounded border border-blue-100 shadow-2xs">
          {currentDoc.explanation}
        </p>
      </div>

      {/* 4. Three Key Evidence Factors: Document, Group, and Shared Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Document Keywords */}
        <div className="academic-card p-4 bg-white space-y-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            1. Document Keywords
          </span>
          <p className="text-[11px] text-slate-500">
            Top TF-IDF terms unique or prominent in this document.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {currentDoc.doc_keywords.map((kw, idx) => (
              <span key={idx} className="badge-keyword text-xs py-0.5 px-2">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Group Keywords */}
        <div className="academic-card p-4 bg-white space-y-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            2. Group Keywords
          </span>
          <p className="text-[11px] text-slate-500">
            Top centroid terms defining this thematic group.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {currentDoc.cluster_keywords.length > 0 ? (
              currentDoc.cluster_keywords.map((kw, idx) => (
                <span key={idx} className="badge-tag text-xs py-0.5 px-2 bg-slate-100 text-slate-800">
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">None (Isolated Document)</span>
            )}
          </div>
        </div>

        {/* Shared Bridge Keywords */}
        <div className="academic-card p-4 bg-white space-y-2 border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            3. Shared Bridge Keywords
          </span>
          <p className="text-[11px] text-slate-500">
            Common terms that anchor this document to the group.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {currentDoc.shared_keywords.length > 0 ? (
              currentDoc.shared_keywords.map((kw, idx) => (
                <span key={idx} className="badge-shared text-xs py-0.5 px-2">
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">Contextual proximity</span>
            )}
          </div>
        </div>
      </div>

      {/* 5. Nearest Neighboring Documents Table */}
      <div className="academic-card p-5 bg-white space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <Share2 className="w-4 h-4 mr-1.5 text-blue-600" />
          Nearest Neighboring Documents & Text Similarity
        </h3>
        <p className="text-xs text-slate-500">
          Scikit-learn NearestNeighbors cosine similarity computed from TF-IDF representations.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Neighbor ID</th>
                <th className="py-2.5 px-3 font-semibold">Document Title</th>
                <th className="py-2.5 px-3 font-semibold text-center">Text Similarity</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentDoc.nearest_neighbors.map((n, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{n.neighbor_id}</td>
                  <td className="py-2.5 px-3 text-slate-900 font-medium max-w-sm truncate">{n.title}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700">
                    {n.cosine_similarity.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {n.edge_accepted ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
                        Below Threshold
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Expandable Advanced Graph & Text Details */}
      <div className="academic-card p-5 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <GitCommit className="w-4 h-4 mr-1.5 text-blue-600" />
            Advanced Proximity & Text Inspection
          </h3>
          <button
            onClick={() => setShowAdvancedProximity(!showAdvancedProximity)}
            className="text-xs font-semibold px-2.5 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {showAdvancedProximity ? 'Hide Details' : 'Show Advanced Details'}
          </button>
        </div>

        {showAdvancedProximity && (
          <div className="pt-3 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
            {/* Graph Network Path Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Connection Type</span>
                <span className="font-bold text-slate-800">{currentDoc.connectivity_type}</span>
              </div>
              <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Shortest Path to Hub</span>
                <span className="font-mono text-slate-800">{currentDoc.shortest_path}</span>
              </div>
              <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Alternative Group</span>
                <span className="font-bold text-slate-800">{currentDoc.alternative_cluster} (Delta: {currentDoc.margin_delta})</span>
              </div>
            </div>

            {/* Original vs Clean Text Toggle */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Document Text Inspector
                </span>
                <div className="flex items-center space-x-1 text-xs">
                  <button
                    onClick={() => setShowCleanText(false)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      !showCleanText ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Original Text
                  </button>
                  <button
                    onClick={() => setShowCleanText(true)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      showCleanText ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Clean Preprocessed Tokens ({currentDoc.clean_token_count})
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 max-h-56 overflow-y-auto leading-relaxed">
                {showCleanText ? currentDoc.text_clean : currentDoc.text_raw}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
