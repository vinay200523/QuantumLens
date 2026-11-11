from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class DocumentInput(BaseModel):
    doc_id: Optional[str] = None
    title: str = "Untitled Document"
    text: str
    source: Optional[str] = "User Input"
    publication_date: Optional[str] = "Undated"

class AnalysisConfigRequest(BaseModel):
    documents: List[DocumentInput]
    k_neighbors: int = Field(default=3, ge=1, le=20)
    similarity_threshold: float = Field(default=0.20, ge=0.01, le=0.99)
    summary_sentences: int = Field(default=2, ge=1, le=10)
    summarization_mode: str = Field(default="extractive", description="'extractive' or 'abstractive'")

class NeighborInfo(BaseModel):
    neighbor_id: str
    title: str
    cosine_distance: float
    cosine_similarity: float
    edge_accepted: bool

class DocumentExplanationResponse(BaseModel):
    doc_id: str
    title: str
    source: str
    publication_date: str
    text_raw: str
    text_clean: str
    clean_token_count: int
    
    cluster_id: int
    cluster_label: str
    is_isolated: bool
    
    summary_text: str
    summary_words: int
    original_words: int
    compression_ratio: float
    summary_method: str
    
    doc_keywords: List[str]
    cluster_keywords: List[str]
    shared_keywords: List[str]
    nearest_neighbors: List[NeighborInfo]
    connectivity_type: str
    shortest_path: str
    alternative_cluster: str
    margin_delta: float
    assignment_status: str
    explanation: str

class ClusterSummaryResponse(BaseModel):
    cluster_id: int
    cluster_label: str
    member_count: int
    thematic_medoid: str
    shared_keywords: List[str]
    thematic_synthesis: str
    member_doc_ids: List[str]
    subtopic_divergence: List[str] = []

class GraphNode(BaseModel):
    id: str
    title: str
    cluster_id: int
    degree: int
    is_isolated: bool

class GraphEdge(BaseModel):
    source: str
    target: str
    weight: float

class SimilarityGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class PcaPoint(BaseModel):
    doc_id: str
    title: str
    cluster_id: int
    x: float
    y: float

class EvaluationMetricsResponse(BaseModel):
    mean_intra_cluster_similarity: float
    mean_inter_cluster_similarity: float
    cohesion_ratio: float
    silhouette_score: Optional[float] = None
    pca_projection: List[PcaPoint]
    cluster_size_distribution: Dict[str, int]

class AnalysisResponse(BaseModel):
    run_id: str
    created_at: datetime
    config: Dict[str, Any]
    summary_metrics: Dict[str, Any]
    global_corpus_summary: str
    clusters: List[ClusterSummaryResponse]
    documents: List[DocumentExplanationResponse]
    graph: SimilarityGraphResponse
    evaluation: EvaluationMetricsResponse
