import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { NetworkGraph } from '../components/NetworkGraph';
import { 
  Network, 
  ArrowRight, 
  Layers, 
  FileText, 
  Award, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';

export const ClusterExplorerPage: React.FC = () => {
  const { 
    analysisResults, 
    selectedClusterId, 
    setSelectedClusterId, 
    navigateToDocument 
  } = useAnalysis();

  const [activeTabSub, setActiveTabSub] = useState<'members' | 'graph' | 'subtopics'>('members');

  if (!analysisResults) {
    return <div className="p-8 text-center text-slate-500">No analysis results available.</div>;
  }

  const { clusters, documents, graph } = analysisResults;

  // Current selected cluster
  const currentCluster = clusters.find((c) => c.cluster_id === selectedClusterId) || clusters[0];
  const memberDocs = documents.filter((d) => d.cluster_id === currentCluster?.cluster_id);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cluster Switcher Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Select Cluster:
        </span>
        {clusters.map((c) => {
          const isSelected = c.cluster_id === currentCluster?.cluster_id;
          return (
            <button
              key={c.cluster_id}
              onClick={() => setSelectedClusterId(c.cluster_id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Cluster {c.cluster_id} ({c.member_count})
            </button>
          );
        })}
      </div>

      {currentCluster && (
        <>
          {/* Cluster Banner */}
          <div className="academic-card p-6 bg-white border-l-4 border-l-blue-600 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                Cluster ID: {currentCluster.cluster_id}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {currentCluster.member_count} Member Documents
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {currentCluster.cluster_label}
            </h1>

            <p className="text-sm text-slate-700 leading-relaxed max-w-4xl">
              {currentCluster.thematic_synthesis}
            </p>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center">
                  <Tag className="w-3 h-3 mr-1" /> Top Keywords:
                </span>
                {currentCluster.shared_keywords.map((kw, i) => (
                  <span key={i} className="badge-keyword text-xs">
                    {kw}
                  </span>
                ))}
              </div>

              <div className="text-xs text-slate-600 flex items-center bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                <Award className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                <span>Thematic Medoid: <strong>{currentCluster.thematic_medoid}</strong></span>
              </div>
            </div>
          </div>

          {/* Sub-view switcher */}
          <div className="flex items-center space-x-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTabSub('members')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTabSub === 'members'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Member Documents ({memberDocs.length})
            </button>
            <button
              onClick={() => setActiveTabSub('graph')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTabSub === 'graph'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sub-Graph Proximity Network
            </button>
            {currentCluster.subtopic_divergence && currentCluster.subtopic_divergence.length > 0 && (
              <button
                onClick={() => setActiveTabSub('subtopics')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                  activeTabSub === 'subtopics'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Subtopic Divergence
              </button>
            )}
          </div>

          {/* Sub-View Content */}
          {activeTabSub === 'members' && (
            <div className="grid grid-cols-1 gap-4">
              {memberDocs.map((doc) => (
                <div
                  key={doc.doc_id}
                  onClick={() => navigateToDocument(doc.doc_id)}
                  className="academic-card p-5 bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all duration-150 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {doc.doc_id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        {doc.title}
                      </h3>
                    </div>

                    <span className="text-xs text-slate-500 font-medium">
                      {doc.source} • {doc.publication_date}
                    </span>
                  </div>

                  <div className="bg-slate-50/80 p-3 rounded border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans">
                    <p className="font-semibold text-slate-900 mb-0.5 flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      Extractive TextRank Summary ({doc.compression_ratio * 100}% Compression):
                    </p>
                    <p className="italic">"{doc.summary_text}"</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {doc.doc_keywords.slice(0, 4).map((kw, i) => (
                        <span key={i} className="badge-tag text-[10px]">
                          {kw}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-3 text-slate-500">
                      <span>Connectivity: <strong>{doc.connectivity_type}</strong></span>
                      <span className="text-blue-600 font-semibold flex items-center hover:underline">
                        Explain Assignment <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTabSub === 'graph' && (
            <div className="space-y-3">
              <div className="academic-card p-4 bg-white">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Local Cluster Similarity Graph (Cluster {currentCluster.cluster_id})
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Interactive NetworkX topology. Nodes in Cluster {currentCluster.cluster_id} are highlighted; 
                  edge thickness reflects calculated pairwise cosine similarity.
                </p>
                <NetworkGraph
                  nodes={graph.nodes}
                  edges={graph.edges}
                  highlightClusterId={currentCluster.cluster_id}
                  onNodeClick={(nodeId) => navigateToDocument(nodeId)}
                  height={480}
                />
              </div>
            </div>
          )}

          {activeTabSub === 'subtopics' && (
            <div className="academic-card p-6 bg-white space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Intra-Cluster Subtopic Divergence
              </h3>
              <p className="text-xs text-slate-600">
                While all member documents share common cluster keywords, individual articles focus on distinct technical sub-domains:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentCluster.subtopic_divergence?.map((sub, idx) => (
                  <div key={idx} className="p-3 rounded border border-slate-200 bg-slate-50 text-xs text-slate-700">
                    <p className="font-bold text-slate-900">{sub.split(':')[0]}</p>
                    <p className="text-slate-600 mt-0.5">{sub.split(':')[1]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
