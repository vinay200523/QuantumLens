import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { NetworkGraph } from '../components/NetworkGraph';
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
  Share2,
  BarChart2,
  Download,
  Clock,
  Layers,
  Info,
  ShieldAlert
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const GROUP_PALETTE = [
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#ea580c', // Orange
];

export const ExplainabilityEvaluationPage: React.FC = () => {
  const { 
    analysisResults, 
    selectedDocId, 
    setSelectedDocId, 
    setActiveTab, 
    navigateToCluster 
  } = useAnalysis();

  const [showAdvancedProximity, setShowAdvancedProximity] = useState(false);
  const [showCleanText, setShowCleanText] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!analysisResults) {
    return (
      <div className="academic-card p-12 text-center bg-white space-y-3">
        <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-semibold text-slate-800">No Experiment Results Available</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please run an analysis in the Document Lab before inspecting assignment explanations and evaluation metrics.
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
    documents, 
    clusters, 
    evaluation, 
    summary_metrics, 
    config, 
    graph, 
    run_id, 
    created_at,
    global_corpus_summary
  } = analysisResults;

  // Selected Document
  const currentDoc = documents.find((d) => d.doc_id === selectedDocId) || documents[0];
  const assignedCluster = clusters.find((c) => c.cluster_id === currentDoc?.cluster_id);

  // Comprehensive Experiment Report CSV Export
  const handleExportFullReport = () => {
    const reportTimestamp = new Date().toISOString();
    const headers = [
      'Experiment Run ID',
      'Timestamp',
      'Config k_neighbors',
      'Config similarity_threshold',
      'Config summary_sentences',
      'Processing Duration (sec)',
      'Document ID',
      'Title',
      'Source',
      'Publication Date',
      'Assigned Group ID',
      'Group Label',
      'Is Isolated',
      'Original Words',
      'Summary Words',
      'Compression Ratio',
      'Summary Text',
      'Document Keywords',
      'Group Keywords',
      'Shared Keywords',
      'Nearest Neighbors (ID:Sim)',
      'Connectivity Type',
      'Shortest Path',
      'Alternative Group',
      'Separation Margin Delta',
      'Assignment Status',
      'Full Explanation Verdict'
    ];

    const rows = documents.map((d) => {
      const neighborsStr = d.nearest_neighbors
        .map((n) => `${n.neighbor_id}:${n.cosine_similarity.toFixed(3)}${n.edge_accepted ? '(connected)' : ''}`)
        .join('; ');

      return [
        run_id,
        reportTimestamp,
        config.k_neighbors.toString(),
        config.similarity_threshold.toString(),
        config.summary_sentences.toString(),
        (summary_metrics.processing_duration_sec ?? 0).toString(),
        d.doc_id,
        d.title,
        d.source,
        d.publication_date,
        d.cluster_id.toString(),
        d.cluster_label,
        d.is_isolated ? 'True' : 'False',
        d.original_words.toString(),
        d.summary_words.toString(),
        d.compression_ratio.toString(),
        d.summary_text,
        d.doc_keywords.join('; '),
        d.cluster_keywords.join('; '),
        d.shared_keywords.join('; '),
        neighborsStr,
        d.connectivity_type,
        d.shortest_path,
        d.alternative_cluster,
        d.margin_delta.toString(),
        d.assignment_status,
        d.explanation
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((item) => `"${(item || '').toString().replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `quantumlens_experiment_${run_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* =========================================================================
          SECTION 1: EXPLAINABLE CLUSTER ASSIGNMENT REPORT
      ========================================================================= */}
      <div className="space-y-5">
        {/* Top Document Selector Bar */}
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
              Select Document:
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
            <span className="text-xs text-slate-500">Assigned Group:</span>
            <button
              onClick={() => currentDoc.cluster_id !== -1 && navigateToCluster(currentDoc.cluster_id)}
              className="text-xs font-bold px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
            >
              {currentDoc.cluster_id === -1 ? 'Isolated Outlier (-1)' : `Group ${currentDoc.cluster_id}`}
            </button>
          </div>
        </div>

        {/* Main Document Card & Summary */}
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
            <strong className="text-slate-900 font-semibold block">Individual Document Summary (TextRank):</strong>
            <p className="italic">&ldquo;{currentDoc.summary_text}&rdquo;</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
            <span>Original: <strong>{currentDoc.original_words} words</strong></span>
            <span className="text-slate-300">&bull;</span>
            <span>Summary: <strong>{currentDoc.summary_words} words</strong></span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Compression: {(currentDoc.compression_ratio * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Evidence-Based Assignment Explanation Verdict Box */}
        <div className="academic-card p-6 bg-blue-50/50 border border-blue-200 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-blue-600 text-white">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Why This Group? — Assignment Verdict
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans bg-white p-4 rounded border border-blue-100 shadow-2xs">
            {currentDoc.explanation}
          </p>

          {/* Chaining and Ambiguity Alert Callout */}
          {currentDoc.connectivity_type.includes('Multi-Hop') && (
            <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Graph Chaining Note:</strong> This document connects to the group medoid indirectly across multiple hops. 
                In graph clustering, indirectly connected documents share transitively similar path connections rather than uniform pairwise similarity to all group members.
              </span>
            </div>
          )}
          {currentDoc.assignment_status.includes('AMBIGUOUS') && (
            <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Ambiguity Warning:</strong> This document lies near a decision boundary (margin delta = {currentDoc.margin_delta}) relative to its alternative group.
              </span>
            </div>
          )}
        </div>

        {/* Three Key Evidence Factors: Document, Group, and Shared Keywords */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Document Keywords */}
          <div className="academic-card p-4 bg-white space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              1. Document Keywords
            </span>
            <p className="text-[11px] text-slate-500">
              Top TF-IDF terms distinct or prominent in this document.
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

        {/* Nearest Neighboring Documents Table */}
        <div className="academic-card p-5 bg-white space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <Share2 className="w-4 h-4 mr-1.5 text-blue-600" />
            Nearest Neighboring Documents & Text Similarity
          </h3>
          <p className="text-xs text-slate-500">
            Computed using Scikit-Learn cosine distance on TF-IDF vectors. Edges are formed if similarity &ge; {config.similarity_threshold}.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-200 rounded">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Neighbor ID</th>
                  <th className="py-2.5 px-3 font-semibold">Document Title</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Text Similarity</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Graph Connection</th>
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
                          Connected (&ge; {config.similarity_threshold})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
                          Below Threshold (&lt; {config.similarity_threshold})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expandable Advanced Graph & Text Details */}
        <div className="academic-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <GitCommit className="w-4 h-4 mr-1.5 text-blue-600" />
              Advanced Graph Topology & Text Token Inspection
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
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">Topology Type</span>
                  <span className="font-bold text-slate-800">{currentDoc.connectivity_type}</span>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">Shortest Path to Hub</span>
                  <span className="font-mono text-slate-800">{currentDoc.shortest_path}</span>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">Alternative Group</span>
                  <span className="font-bold text-slate-800">{currentDoc.alternative_cluster} (Margin Delta: {currentDoc.margin_delta})</span>
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
                      Clean Tokens ({currentDoc.clean_token_count})
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

      {/* =========================================================================
          SECTION 2: CONCISE EXPERIMENT EVALUATION & TECHNICAL DETAILS
      ========================================================================= */}
      <div className="academic-card p-6 bg-white space-y-5 border-t-4 border-t-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-blue-600" />
              Experiment Evaluation & Model Validation
            </h2>
            <p className="text-xs text-slate-500">
              Quantitative validation of group separation, intra-group cohesion, and processing performance.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportFullReport}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-2xs transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Full Report (CSV)
            </button>
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {showTechnicalDetails ? 'Hide Projections' : 'Show Projections'}
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Discovered Groups</span>
            <span className="text-xl font-bold text-slate-900">{summary_metrics.num_clusters}</span>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Cohesion Ratio</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-bold text-slate-900">{evaluation.cohesion_ratio}x</span>
              <span className="text-[10px] text-slate-500">intra/inter</span>
            </div>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Silhouette Score</span>
            <span className="text-xl font-bold text-slate-900">
              {evaluation.silhouette_score !== null && evaluation.silhouette_score !== undefined
                ? evaluation.silhouette_score.toFixed(3)
                : 'N/A*'}
            </span>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Analysis Duration</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-bold text-slate-900">
                {summary_metrics.processing_duration_sec ?? 0.25}s
              </span>
              <Clock className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Plain-Language Metric Interpretations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded bg-blue-50/40 border border-blue-100 text-slate-700 space-y-1">
            <strong className="text-blue-900 font-semibold block">Silhouette Score Interpretation:</strong>
            <p className="leading-relaxed text-[11px]">
              {evaluation.silhouette_score !== null && evaluation.silhouette_score > 0.15
                ? `A positive silhouette score of ${evaluation.silhouette_score.toFixed(3)} confirms that documents are substantially more similar to members of their assigned group than to external groups.`
                : 'Silhouette score measures cluster separation. Values near +1.0 indicate dense separation, ~0 indicates overlapping boundaries, and negative values indicate potential misclustering. *Requires at least 2 multi-member groups.'}
            </p>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
            <strong className="text-slate-900 font-semibold block">Group Size Distribution:</strong>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {Object.entries(evaluation.cluster_size_distribution).map(([grp, count]) => (
                <span key={grp} className="px-2 py-0.5 rounded text-xs font-semibold bg-white border border-slate-200 text-slate-800">
                  {grp.replace('Cluster', 'Group')}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Expandable Technical Details (2D PCA Projection Map & Proximity Graph) */}
        {showTechnicalDetails && (
          <div className="pt-3 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Dimensionality Reduction & Graph Visualizations
              </h4>
              <p className="text-[11px] text-slate-500">
                2D spatial representation via Principal Component Analysis (PCA) and NetworkX similarity graph.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 2D PCA Chart */}
              <div className="p-3 rounded border border-slate-200 bg-slate-50/50 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">2D PCA Document Mapping</span>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                      <XAxis type="number" dataKey="x" name="PCA 1" stroke="#94a3b8" fontSize={10} />
                      <YAxis type="number" dataKey="y" name="PCA 2" stroke="#94a3b8" fontSize={10} />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-2 rounded shadow-md text-xs">
                                <p className="font-bold">{data.doc_id}: {data.title}</p>
                                <p className="text-slate-300">Group {data.cluster_id}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter data={evaluation.pca_projection}>
                        {evaluation.pca_projection.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.cluster_id === -1 ? '#94a3b8' : GROUP_PALETTE[entry.cluster_id % GROUP_PALETTE.length]} 
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Network Graph */}
              <div className="p-3 rounded border border-slate-200 bg-slate-50/50 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Proximity Graph Connections</span>
                <NetworkGraph 
                  nodes={graph.nodes} 
                  edges={graph.edges} 
                  onNodeClick={(id) => setSelectedDocId(id)}
                  height={256}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
