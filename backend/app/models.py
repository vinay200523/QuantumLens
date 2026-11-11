from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class AnalysisRunDB(Base):
    __tablename__ = "analysis_runs"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    k_neighbors = Column(Integer, default=3)
    similarity_threshold = Column(Float, default=0.25)
    summary_sentences = Column(Integer, default=2)
    num_documents = Column(Integer, default=0)
    num_clusters = Column(Integer, default=0)
    num_isolated = Column(Integer, default=0)
    global_summary = Column(Text, nullable=True)

    documents = relationship("DocumentDB", back_populates="run", cascade="all, delete-orphan")
    clusters = relationship("ClusterDB", back_populates="run", cascade="all, delete-orphan")

class DocumentDB(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    run_id = Column(String, ForeignKey("analysis_runs.id"), index=True)
    doc_id = Column(String, index=True)
    title = Column(String)
    source = Column(String, default="Direct Input")
    publication_date = Column(String, default="Undated")
    text_raw = Column(Text)
    text_clean = Column(Text)
    
    cluster_id = Column(Integer, index=True)
    cluster_label = Column(String)
    is_isolated = Column(Boolean, default=False)
    
    summary_text = Column(Text)
    summary_words = Column(Integer, default=0)
    original_words = Column(Integer, default=0)
    compression_ratio = Column(Float, default=0.0)
    
    keywords_json = Column(Text)       # JSON string list
    neighbors_json = Column(Text)      # JSON string list of {id, sim, status}
    connectivity_type = Column(String)
    shortest_path = Column(String)
    alternative_cluster = Column(String)
    margin_delta = Column(Float, default=0.0)
    status_flag = Column(String)
    explanation = Column(Text)

    run = relationship("AnalysisRunDB", back_populates="documents")

class ClusterDB(Base):
    __tablename__ = "clusters"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    run_id = Column(String, ForeignKey("analysis_runs.id"), index=True)
    cluster_id = Column(Integer, index=True)
    label = Column(String)
    member_count = Column(Integer, default=0)
    thematic_medoid = Column(String)
    keywords_json = Column(Text)       # JSON string list
    synthesis_text = Column(Text)
    members_json = Column(Text)        # JSON string list of doc_ids

    run = relationship("AnalysisRunDB", back_populates="clusters")
