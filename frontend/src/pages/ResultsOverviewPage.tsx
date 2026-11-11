import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { MetricCard } from '../components/MetricCard';
import { 
  FileText, 
  Layers, 
  HelpCircle, 
  TrendingUp, 
  ArrowRight, 
  Sparkles,
  ExternalLink,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const CLUSTER_COLORS = [
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#ea580c', // Orange
];

export const ResultsOverviewPage: React.FC = () => {
  const { analysisResults, navigateToCluster, setActiveTab } = useAnalysis();

  if (!analysisResults) {
    return (
      <div className="academic-card p-12 text-center bg-white">
        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">No Analysis Results Found</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
          Execute the clustering pipeline to inspect discovered document communities.
        </p>
        <button
          onClick={() => setActiveTab('config')}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          <Sliders className="w-4 h-4 mr-1.5" />
          Go to Configuration
        </button>
      </div>
    );
  }

  const { summary_metrics, global_corpus_summary, clusters, config, evaluation } = analysisResults;

  // Prepare chart data for cluster size distribution
  const chartData = clusters.map((c, i) => ({
    name: `Cluster ${c.cluster_id}`,
    label: c.cluster_label,
    count: c.member_count,
    color: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
  }));

  if (summary_metrics.num_isolated > 0) {
    chartData.push({
      name: 'Isolated (-1)',
      label: 'Isolated Outliers',
      count: summary_metrics.num_isolated,
      color: '#64748b',
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Analysis Run: {analysisResults.run_id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Corpus Results & Cluster Overview
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
            KNN Graph: k={config.k_neighbors}, &tau;={config.similarity_threshold}
          </span>
          <button
            onClick={() => setActiveTab('clusters')}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800"
          >
            Explore Clusters
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Documents Processed"
          value={summary_metrics.num_documents}
          subtitle="Validated & deduplicated"
          icon={<FileText className="w-5 h-5" />}
          color="blue"
        />

        <MetricCard
          title="Thematic Clusters"
          value={summary_metrics.num_clusters}
          subtitle="Connected graph components"
          icon={<Layers className="w-5 h-5" />}
          color="emerald"
        />

        <MetricCard
          title="Isolated Outliers"
          value={summary_metrics.num_isolated}
          subtitle="Degree 0 (similarity < &tau;)"
          icon={<HelpCircle className="w-5 h-5" />}
          color="amber"
        />

        <MetricCard
          title="Compression Ratio"
          value={`${(summary_metrics.mean_compression_ratio * 100).toFixed(1)}%`}
          subtitle="TextRank sentence reduction"
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Global Corpus Synthesis */}
      <div className="academic-card p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex items-center space-x-2 text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Global Collection Synthesis</span>
        </div>
        <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-normal">
          {global_corpus_summary}
        </p>
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-300">
          <span>Intra/Inter Cohesion Ratio: <strong>{evaluation.cohesion_ratio}x</strong></span>
          <span>Mean Intra-Cluster Cosine Similarity: <strong>{evaluation.mean_intra_cluster_similarity}</strong></span>
          <span>Mean Inter-Cluster Separation: <strong>{evaluation.mean_inter_cluster_similarity}</strong></span>
        </div>
      </div>

      {/* Visual Chart: Cluster Size Distribution */}
      <div className="academic-card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Cluster Size Distribution</h2>
            <p className="text-xs text-slate-500">Document counts partitioned across discovered topological communities</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Metric: Connected Components</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2.5 border border-slate-200 rounded shadow-md text-xs">
                        <p className="font-bold text-slate-900">{data.name}: {data.label}</p>
                        <p className="text-blue-600 font-semibold mt-1">Documents: {data.count}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Discovered Cluster Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Discovered Thematic Clusters ({clusters.length})
          </h2>
          <span className="text-xs text-slate-500">Click any card to explore member documents & similarity graph</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clusters.map((cluster, idx) => {
            const color = CLUSTER_COLORS[idx % CLUSTER_COLORS.length];

            return (
              <div
                key={cluster.cluster_id}
                onClick={() => navigateToCluster(cluster.cluster_id)}
                className="academic-card p-5 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-200 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded text-white shadow-2xs"
                      style={{ backgroundColor: color }}
                    >
                      Cluster {cluster.cluster_id}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {cluster.member_count} {cluster.member_count === 1 ? 'Doc' : 'Docs'}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-900 line-clamp-1">
                    {cluster.cluster_label.replace(`Cluster ${cluster.cluster_id}: `, '')}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {cluster.thematic_synthesis}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {cluster.shared_keywords.slice(0, 4).map((kw, i) => (
                      <span key={i} className="badge-keyword text-[10px]">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="line-clamp-1 italic text-[11px]">Medoid: {cluster.thematic_medoid.split(':')[0]}</span>
                  <span className="font-semibold text-blue-600 flex items-center">
                    Explore <ExternalLink className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
