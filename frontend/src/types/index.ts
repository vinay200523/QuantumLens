export interface DocumentInput {
  doc_id?: string;
  title: string;
  text: string;
  source?: string;
  publication_date?: string;
}

export interface NeighborInfo {
  neighbor_id: string;
  title: string;
  cosine_distance: number;
  cosine_similarity: number;
  edge_accepted: bool_type;
}

type bool_type = boolean;

export interface DocumentExplanationResponse {
  doc_id: string;
  title: string;
  source: string;
  publication_date: string;
  text_raw: string;
  text_clean: string;
  clean_token_count: number;
  
  cluster_id: number;
  cluster_label: string;
  is_isolated: boolean;
  
  summary_text: string;
  summary_words: number;
  original_words: number;
  compression_ratio: number;
  summary_method: string;
  
  doc_keywords: string[];
  cluster_keywords: string[];
  shared_keywords: string[];
  nearest_neighbors: NeighborInfo[];
  connectivity_type: string;
  shortest_path: string;
  alternative_cluster: string;
  margin_delta: number;
  assignment_status: string;
  explanation: string;
}

export interface ClusterSummaryResponse {
  cluster_id: number;
  cluster_label: string;
  member_count: number;
  thematic_medoid: string;
  shared_keywords: string[];
  thematic_synthesis: string;
  member_doc_ids: string[];
  subtopic_divergence?: string[];
}

export interface GraphNode {
  id: string;
  title: string;
  cluster_id: number;
  degree: number;
  is_isolated: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface SimilarityGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface PcaPoint {
  doc_id: string;
  title: string;
  cluster_id: number;
  x: number;
  y: number;
}

export interface EvaluationMetricsResponse {
  mean_intra_cluster_similarity: number;
  mean_inter_cluster_similarity: number;
  cohesion_ratio: number;
  silhouette_score?: number | null;
  pca_projection: PcaPoint[];
  cluster_size_distribution: Record<string, number>;
}

export interface AnalysisResponse {
  run_id: string;
  created_at: string;
  config: {
    k_neighbors: number;
    similarity_threshold: number;
    summary_sentences: number;
    summarization_mode: string;
  };
  summary_metrics: {
    num_documents: number;
    submitted_documents_count?: number;
    excluded_documents_count?: number;
    excluded_documents?: { doc_id: string; title: string; reason: string }[];
    num_clusters: number;
    num_isolated: number;
    mean_doc_words: number;
    mean_compression_ratio: number;
    processing_duration_sec?: number;
  };
  global_corpus_summary: string;
  clusters: ClusterSummaryResponse[];
  documents: DocumentExplanationResponse[];
  graph: SimilarityGraphResponse;
  evaluation: EvaluationMetricsResponse;
}

export interface AnalysisConfig {
  k_neighbors: number;
  similarity_threshold: number;
  summary_sentences: number;
  summarization_mode: 'extractive' | 'abstractive';
}
