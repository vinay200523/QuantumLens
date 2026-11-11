import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { 
  Layers, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  ExternalLink,
  Tag,
  ArrowRight,
  Clock,
  ShieldAlert,
  Info
} from 'lucide-react';

export const AnalysisResultsPage: React.FC = () => {
  const { 
    analysisResults, 
    selectedClusterId, 
    setSelectedClusterId, 
    navigateToDocument,
    setActiveTab 
  } = useAnalysis();

  if (!analysisResults) {
    return (
      <div className="academic-card p-12 text-center bg-white space-y-3">
        <Layers className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-semibold text-slate-800">No Analysis Results Found</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please load or enter documents in the Document Lab and click "Analyze Documents".
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

  const { 
    summary_metrics, 
    global_corpus_summary, 
    clusters, 
    documents, 
    run_id,
    config
  } = analysisResults;

  // Active group selection
  const activeGroup = clusters.find((c) => c.cluster_id === selectedClusterId) || clusters[0];
  const memberDocuments = documents.filter((d) => d.cluster_id === activeGroup?.cluster_id);
  const excludedDocs = summary_metrics.excluded_documents || [];

  return (
    <div className="space-y-6">
      {/* 1. Header & Experiment Audit Metrics */}
      <div className="academic-card p-6 bg-white border-l-4 border-l-blue-600 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Analysis Results & Group Explorer
            </h1>
            <p className="text-xs text-slate-500">
              Experiment Run: <strong className="font-mono text-slate-700">{run_id}</strong> • Parameters: k={config.k_neighbors}, similarity threshold &tau;={config.similarity_threshold}, summary length={config.summary_sentences} sentences.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('lab')}
              className="text-xs font-semibold px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0"
            >
              &larr; Modify Documents
            </button>
            <button
              onClick={() => setActiveTab('explain')}
              className="text-xs font-bold px-3.5 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 shrink-0 shadow-2xs flex items-center"
            >
              Explainability &amp; Evaluation &rarr;
            </button>
          </div>
        </div>

        {/* 6 Audit Metric Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Submitted</span>
            <span className="text-lg font-bold text-slate-900">{summary_metrics.submitted_documents_count ?? summary_metrics.num_documents}</span>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Processed</span>
            <span className="text-lg font-bold text-slate-900">{summary_metrics.num_documents}</span>
          </div>

          <div className="p-3 rounded-md bg-blue-50/60 border border-blue-200">
            <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider block">Groups Found</span>
            <span className="text-lg font-bold text-blue-900">{summary_metrics.num_clusters}</span>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Outliers</span>
            <span className="text-lg font-bold text-slate-900">{summary_metrics.num_isolated}</span>
          </div>

          <div className="p-3 rounded-md bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">Avg Compression</span>
            <span className="text-lg font-bold text-emerald-900">{(summary_metrics.mean_compression_ratio * 100).toFixed(0)}%</span>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Duration</span>
            <span className="text-lg font-bold text-slate-900">{summary_metrics.processing_duration_sec ?? 0.25}s</span>
          </div>
        </div>

        {/* Excluded Documents Screening Notice */}
        {excludedDocs.length > 0 && (
          <div className="p-3 rounded-md bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="flex items-center font-bold text-amber-800">
              <ShieldAlert className="w-4 h-4 mr-1.5 shrink-0" />
              Document Screening Notice: {excludedDocs.length} submitted document(s) were excluded:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px] pl-1">
              {excludedDocs.map((exc, i) => (
                <li key={i}>
                  <strong>{exc.doc_id}</strong> ({exc.title}): {exc.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Overall Collection Summary */}
        <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900 font-semibold block mb-1">Collection Synthesis:</strong>
          {global_corpus_summary}
        </div>
      </div>

      {/* 2. Discovered Groups Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <Layers className="w-4 h-4 mr-1.5 text-blue-600" />
            Discovered Document Groups ({clusters.length})
          </h2>
          <span className="text-xs text-slate-500">Select a group tab to inspect member documents</span>
        </div>

        {/* Group Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {clusters.map((c) => {
            const isSelected = c.cluster_id === activeGroup?.cluster_id;
            const cleanLabel = c.cluster_label.replace(/Cluster \d+:\s*/, '');
            return (
              <button
                key={c.cluster_id}
                onClick={() => setSelectedClusterId(c.cluster_id)}
                className={`px-3 py-2 text-xs font-semibold rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>Group {c.cluster_id}: {cleanLabel.slice(0, 25)}{cleanLabel.length > 25 ? '...' : ''}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {c.member_count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Group Card */}
        {activeGroup && (
          <div className="academic-card p-5 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeGroup.cluster_label.replace('Cluster', 'Group')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Contains {activeGroup.member_count} document(s) • Thematic Medoid: <strong>{activeGroup.thematic_medoid}</strong>
                </p>
              </div>

              {/* Group Keywords */}
              <div className="flex flex-wrap items-center gap-1.5">
                {activeGroup.shared_keywords.map((kw, idx) => (
                  <span key={idx} className="badge-keyword text-[11px] py-0.5 px-2">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Group Summary */}
            <div className="p-3 rounded bg-blue-50/40 border border-blue-100 text-xs text-slate-700 leading-relaxed">
              <strong className="text-blue-900 font-semibold block mb-0.5">Thematic Group Summary:</strong>
              {activeGroup.thematic_synthesis}
            </div>

            {/* Member Documents List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Documents in Group {activeGroup.cluster_id} ({memberDocuments.length})
              </h4>

              <div className="space-y-2.5">
                {memberDocuments.map((doc) => (
                  <div 
                    key={doc.doc_id}
                    className="p-4 rounded-md border border-slate-200 bg-white hover:border-blue-300 transition-colors space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {doc.doc_id}
                        </span>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                          {doc.title}
                        </h5>
                      </div>

                      {/* Prominent "Why this group?" Action */}
                      <button
                        onClick={() => navigateToDocument(doc.doc_id)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-2xs transition-colors shrink-0"
                      >
                        <HelpCircle className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        Why this group?
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>

                    {/* Concise Summary */}
                    <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-2.5 rounded border border-slate-100">
                      &ldquo;{doc.summary_text}&rdquo;
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Source: <strong>{doc.source}</strong> • Words: <strong>{doc.original_words}</strong> &rarr; <strong>{doc.summary_words}</strong></span>
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {(doc.compression_ratio * 100).toFixed(0)}% Compressed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Callout Card to Section 3 (Explainability & Evaluation) */}
      <div className="p-5 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Ready for Document Attribution &amp; Model Evaluation</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Inspect individual document assignment evidence, nearest neighbor similarity scores, graph paths, silhouette metrics, and export the experiment report.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('explain')}
          className="inline-flex items-center px-5 py-2.5 text-xs font-bold rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors shrink-0"
        >
          Open Explainability &amp; Evaluation
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
};
