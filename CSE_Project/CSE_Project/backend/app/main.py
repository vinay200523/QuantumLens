import uuid
import json
import io
import csv
import logging
import time
from datetime import datetime
from typing import List, Optional
import numpy as np
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("quantumlens")

def pydantic_dump(model_obj):
    if hasattr(model_obj, "model_dump"):
        return model_obj.model_dump()
    elif hasattr(model_obj, "dict"):
        return model_obj.dict()
    return model_obj

from .config import settings
from .database import engine, Base, get_db
from .models import AnalysisRunDB, DocumentDB, ClusterDB
from .schemas import (
    AnalysisConfigRequest,
    AnalysisResponse,
    DocumentInput,
    DocumentExplanationResponse,
    ClusterSummaryResponse,
    SimilarityGraphResponse,
    GraphNode,
    GraphEdge,
    EvaluationMetricsResponse,
    NeighborInfo,
    PcaPoint
)
from .sample_data import SAMPLE_QUANTUM_DOCUMENTS
from .nlp.preprocessor import NLPPreprocessor
from .nlp.vectorizer import TfidfFeatureExtractor
from .nlp.summarizer import TextRankSummarizer
from .nlp.clustering import KNNGraphClusterer
from .nlp.explainability import ClusterExplainabilityEngine
from .nlp.evaluation import EvaluationEngine

# Create tables in SQLite
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Explainable Document Summarization and KNN-Based Document Clustering API"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/sample", response_model=List[DocumentInput])
def get_sample_documents():
    """Returns the 20 curated Quantum Computing news articles."""
    return SAMPLE_QUANTUM_DOCUMENTS

@app.post("/api/upload/csv", response_model=List[DocumentInput])
async def upload_csv_file(file: UploadFile = File(...)):
    """Parses an uploaded CSV file containing doc_id, title, text, source, publication_date."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV (.csv)")
    
    contents = await file.read()
    decoded = contents.decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(decoded))
    
    documents = []
    for idx, row in enumerate(reader):
        text = row.get("text") or row.get("content") or row.get("body") or ""
        if not text.strip():
            continue
        doc_id = row.get("doc_id") or row.get("id") or f"DOC_{idx+1:02d}"
        title = row.get("title") or f"Document {idx+1}"
        source = row.get("source") or "CSV Upload"
        pub_date = row.get("publication_date") or row.get("date") or "Undated"
        documents.append(DocumentInput(
            doc_id=doc_id,
            title=title,
            text=text.strip(),
            source=source,
            publication_date=pub_date
        ))
    
    if not documents:
        raise HTTPException(status_code=400, detail="No valid documents with text found in CSV.")
    return documents

@app.post("/api/upload/txt", response_model=List[DocumentInput])
async def upload_txt_files(files: List[UploadFile] = File(...)):
    """Parses multiple uploaded .txt files."""
    documents = []
    for idx, f in enumerate(files):
        if not f.filename.endswith(".txt"):
            continue
        content = await f.read()
        text = content.decode("utf-8", errors="ignore").strip()
        if not text:
            continue
        title = f.filename.replace(".txt", "").replace("_", " ").title()
        documents.append(DocumentInput(
            doc_id=f"TXT_{idx+1:02d}",
            title=title,
            text=text,
            source=f.filename,
            publication_date=datetime.utcnow().strftime("%Y-%m-%d")
        ))
    if not documents:
        raise HTTPException(status_code=400, detail="No non-empty .txt files provided.")
    return documents

@app.post("/api/analyze", response_model=AnalysisResponse)
def analyze_documents(request: AnalysisConfigRequest, db: Session = Depends(get_db)):
    """
    Core pipeline:
    1. Ingestion & Deduplication
    2. Dual-Stream NLP Preprocessing
    3. TF-IDF Feature Extraction
    4. TextRank Extractive Summarization
    5. KNN Graph Clustering via Connected Components
    6. 9-Factor Explainability Attribution
    7. Cluster-Level Synthesis
    8. Quantitative Evaluation & Persistence
    """
    raw_docs = request.documents
    if len(raw_docs) < 2:
        raise HTTPException(status_code=400, detail="At least 2 documents are required for clustering analysis.")

    start_time = time.time()

    try:
        # 1. Validation, Exclusion Tracking & Deduplication
        preprocessor = NLPPreprocessor()
        seen_hashes = set()
        valid_docs = []
        excluded_docs = []
        
        for idx, d in enumerate(raw_docs):
            text = d.text.strip()
            doc_id = d.doc_id.strip() if d.doc_id else f"DOC_{idx+1:02d}"
            title = d.title.strip() if d.title else f"Document {idx+1}"

            if len(text.split()) < 10:  # Minimum length constraint
                excluded_docs.append({
                    "doc_id": doc_id,
                    "title": title,
                    "reason": f"Fewer than 10 words ({len(text.split())} words found; minimum 10 words required for TF-IDF feature extraction)."
                })
                continue

            h = preprocessor.compute_text_hash(text)
            if h in seen_hashes:
                excluded_docs.append({
                    "doc_id": doc_id,
                    "title": title,
                    "reason": "Duplicate content detected (exact textual match with an earlier document in this dataset)."
                })
                continue

            seen_hashes.add(h)
            valid_docs.append({
                "doc_id": doc_id,
                "title": title,
                "text": text,
                "source": d.source or "User Input",
                "publication_date": d.publication_date or "Undated"
            })

        if len(valid_docs) < 2:
            reasons = "; ".join([f"{e['doc_id']}: {e['reason']}" for e in excluded_docs])
            raise HTTPException(
                status_code=400,
                detail=f"Fewer than 2 valid documents remained after screening. {reasons}"
            )

        logger.info(f"Starting analysis on {len(valid_docs)} valid documents (submitted: {len(raw_docs)}, excluded: {len(excluded_docs)}, k={request.k_neighbors}, tau={request.similarity_threshold})")

        # 2. Preprocessing
        doc_ids = [d["doc_id"] for d in valid_docs]
        titles = [d["title"] for d in valid_docs]
        raw_texts = []
        clean_texts = []
        token_counts = []

        for d in valid_docs:
            raw_pres, tokens, clean_txt = preprocessor.preprocess_document(d["text"])
            raw_texts.append(raw_pres)
            clean_texts.append(clean_txt)
            token_counts.append(len(tokens))

        # 3. TF-IDF Vectorization
        tfidf_extractor = TfidfFeatureExtractor(ngram_range=(1, 2), max_df=0.95, min_df=1)
        tfidf_matrix = tfidf_extractor.fit_transform(clean_texts)

        # 4. TextRank Summarization
        summarizer = TextRankSummarizer(damping_factor=0.85)
        summaries = []
        for raw_t in raw_texts:
            s_res = summarizer.summarize_document(raw_t, max_sentences=request.summary_sentences)
            summaries.append(s_res)

        # 5. KNN-Based Graph Clustering
        k_val = max(1, min(request.k_neighbors, len(valid_docs) - 1))
        clusterer = KNNGraphClusterer(k_neighbors=k_val, similarity_threshold=request.similarity_threshold)
        cluster_res = clusterer.fit_predict(tfidf_matrix, doc_ids, tfidf_extractor.feature_names, titles)

        # 6. Explainability Engine
        explainer = ClusterExplainabilityEngine(clusterer, tfidf_extractor, doc_ids, titles, ambiguity_margin=0.08)
        doc_responses = []

        for i in range(len(valid_docs)):
            d_id = doc_ids[i]
            exp = explainer.explain_document(d_id)
            s_info = summaries[i]

            doc_responses.append(DocumentExplanationResponse(
                doc_id=d_id,
                title=titles[i],
                source=valid_docs[i]["source"],
                publication_date=valid_docs[i]["publication_date"],
                text_raw=raw_texts[i],
                text_clean=clean_texts[i],
                clean_token_count=token_counts[i],
                cluster_id=exp["assigned_cluster"],
                cluster_label=exp["cluster_label"],
                is_isolated=exp["is_isolated"],
                summary_text=s_info["summary"],
                summary_words=s_info["summary_words"],
                original_words=s_info["original_words"],
                compression_ratio=s_info["compression_ratio"],
                summary_method=s_info["summary_method"],
                doc_keywords=exp["doc_keywords"],
                cluster_keywords=exp["cluster_keywords"],
                shared_keywords=exp["shared_keywords"],
                nearest_neighbors=[NeighborInfo(**n) for n in exp["nearest_neighbors"]],
                connectivity_type=exp["connectivity_type"],
                shortest_path=exp["shortest_path"],
                alternative_cluster=exp["alternative_cluster"],
                margin_delta=exp["margin_delta"],
                assignment_status=exp["assignment_status"],
                explanation=exp["explanation"]
            ))

        # 7. Cluster-Level Syntheses
        cluster_responses = []
        active_c_ids = sorted([c for c in set(clusterer.cluster_assignments.values()) if c != -1])

        for c_id in active_c_ids:
            members = [d for d, c in clusterer.cluster_assignments.items() if c == c_id]
            subg = clusterer.graph.subgraph(members)
            medoid_id = max(members, key=lambda n: subg.degree(n))
            medoid_title = titles[doc_ids.index(medoid_id)]

            centroid = clusterer.cluster_centroids[c_id]
            top_indices = np.argsort(centroid)[::-1][:6]
            top_kw = [tfidf_extractor.feature_names[idx] for idx in top_indices if centroid[idx] > 0]

            subtopics = []
            for m_id in members:
                m_idx = doc_ids.index(m_id)
                m_top = [t for t, _ in tfidf_extractor.get_top_features_for_doc(m_idx, top_n=2)]
                unique_kw = [t for t in m_top if t not in top_kw[:3]]
                if unique_kw:
                    subtopics.append(f"{m_id}: {', '.join(unique_kw)}")

            synthesis_text = (
                f"Cluster {c_id} brings together {len(members)} documents highlighting research in {', '.join(top_kw[:3]) if top_kw else 'core domain concepts'}. "
                f"The primary structural medoid is {medoid_id} ('{medoid_title}'). "
                f"Internal variations: {'; '.join(subtopics[:3]) if subtopics else 'Homogeneous terminology'}."
            )

            cluster_responses.append(ClusterSummaryResponse(
                cluster_id=c_id,
                cluster_label=clusterer.cluster_labels[c_id],
                member_count=len(members),
                thematic_medoid=f"{medoid_id}: {medoid_title}",
                shared_keywords=top_kw,
                thematic_synthesis=synthesis_text,
                member_doc_ids=members,
                subtopic_divergence=subtopics[:4]
            ))

        # 8. Graph Response
        graph_nodes = []
        for d_id in doc_ids:
            c_id = clusterer.cluster_assignments[d_id]
            deg = clusterer.graph.degree(d_id) if clusterer.graph.has_node(d_id) else 0
            graph_nodes.append(GraphNode(
                id=d_id,
                title=titles[doc_ids.index(d_id)],
                cluster_id=c_id,
                degree=deg,
                is_isolated=(c_id == -1)
            ))

        graph_edges = []
        for u, v, data in clusterer.graph.edges(data=True):
            graph_edges.append(GraphEdge(
                source=u,
                target=v,
                weight=round(float(data["weight"]), 3)
            ))

        # 9. Evaluation Metrics
        eval_engine = EvaluationEngine(tfidf_matrix, doc_ids, titles, clusterer.cluster_assignments)
        eval_res = eval_engine.compute_metrics()

        evaluation_response = EvaluationMetricsResponse(
            mean_intra_cluster_similarity=eval_res["mean_intra_cluster_similarity"],
            mean_inter_cluster_similarity=eval_res["mean_inter_cluster_similarity"],
            cohesion_ratio=eval_res["cohesion_ratio"],
            silhouette_score=eval_res["silhouette_score"],
            pca_projection=[PcaPoint(**p) for p in eval_res["pca_projection"]],
            cluster_size_distribution=eval_res["cluster_size_distribution"]
        )

        # 10. Global Corpus Summary
        top_cluster_labels = [c.cluster_label.replace(f"Cluster {c.cluster_id}: ", "") for c in cluster_responses[:3]]
        cluster_labels_str = ', '.join(top_cluster_labels) if top_cluster_labels else "thematic groups"
        avg_comp = float(np.mean([s['compression_ratio'] for s in summaries])) if summaries else 0.0
        global_summary = (
            f"QuantumLens analyzed {len(valid_docs)} documents using KNN-based graph clustering (k={k_val}, tau={request.similarity_threshold}). "
            f"The system uncovered {len(cluster_responses)} thematic clusters spanning {cluster_labels_str}, "
            f"with {len(clusterer.isolated_docs)} isolated outlier(s). "
            f"The collection exhibits a cohesion ratio of {eval_res['cohesion_ratio']}x with an average compression ratio of "
            f"{avg_comp * 100:.1f}%."
        )

        # 11. Database Persistence
        run_id = f"run_{uuid.uuid4().hex[:10]}"
        now = datetime.utcnow()

        try:
            db_run = AnalysisRunDB(
                id=run_id,
                created_at=now,
                k_neighbors=k_val,
                similarity_threshold=request.similarity_threshold,
                summary_sentences=request.summary_sentences,
                num_documents=len(valid_docs),
                num_clusters=len(cluster_responses),
                num_isolated=len(clusterer.isolated_docs),
                global_summary=global_summary
            )
            db.add(db_run)

            for doc_resp in doc_responses:
                db_doc = DocumentDB(
                    run_id=run_id,
                    doc_id=doc_resp.doc_id,
                    title=doc_resp.title,
                    source=doc_resp.source,
                    publication_date=doc_resp.publication_date,
                    text_raw=doc_resp.text_raw,
                    text_clean=doc_resp.text_clean,
                    cluster_id=doc_resp.cluster_id,
                    cluster_label=doc_resp.cluster_label,
                    is_isolated=doc_resp.is_isolated,
                    summary_text=doc_resp.summary_text,
                    summary_words=doc_resp.summary_words,
                    original_words=doc_resp.original_words,
                    compression_ratio=doc_resp.compression_ratio,
                    keywords_json=json.dumps(doc_resp.doc_keywords, default=str),
                    neighbors_json=json.dumps([pydantic_dump(n) for n in doc_resp.nearest_neighbors], default=str),
                    connectivity_type=doc_resp.connectivity_type,
                    shortest_path=doc_resp.shortest_path,
                    alternative_cluster=doc_resp.alternative_cluster,
                    margin_delta=doc_resp.margin_delta,
                    status_flag=doc_resp.assignment_status,
                    explanation=doc_resp.explanation
                )
                db.add(db_doc)

            for c_resp in cluster_responses:
                db_cluster = ClusterDB(
                    run_id=run_id,
                    cluster_id=c_resp.cluster_id,
                    label=c_resp.cluster_label,
                    member_count=c_resp.member_count,
                    thematic_medoid=c_resp.thematic_medoid,
                    keywords_json=json.dumps(c_resp.shared_keywords, default=str),
                    synthesis_text=c_resp.thematic_synthesis,
                    members_json=json.dumps(c_resp.member_doc_ids, default=str)
                )
                db.add(db_cluster)

            db.commit()
        except Exception as db_err:
            db.rollback()
            logger.error(f"Failed to persist analysis run to database: {db_err}", exc_info=True)

        return AnalysisResponse(
            run_id=run_id,
            created_at=now,
            config={
                "k_neighbors": k_val,
                "similarity_threshold": request.similarity_threshold,
                "summary_sentences": request.summary_sentences,
                "summarization_mode": request.summarization_mode
            },
            summary_metrics={
                "num_documents": len(valid_docs),
                "submitted_documents_count": len(raw_docs),
                "excluded_documents_count": len(excluded_docs),
                "excluded_documents": excluded_docs,
                "num_clusters": len(cluster_responses),
                "num_isolated": len(clusterer.isolated_docs),
                "mean_doc_words": int(np.mean([s["original_words"] for s in summaries])) if summaries else 0,
                "mean_compression_ratio": round(float(np.mean([s["compression_ratio"] for s in summaries])), 3) if summaries else 0.0,
                "processing_duration_sec": round(time.time() - start_time, 2),
            },
            global_corpus_summary=global_summary,
            clusters=cluster_responses,
            documents=doc_responses,
            graph=SimilarityGraphResponse(nodes=graph_nodes, edges=graph_edges),
            evaluation=evaluation_response
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error executing analyze_documents pipeline: %s", str(exc))
        raise HTTPException(
            status_code=500,
            detail=f"Analysis pipeline error: {str(exc)}"
        )

@app.get("/api/runs")
def list_analysis_runs(db: Session = Depends(get_db)):
    """Lists saved analysis runs from SQLite."""
    runs = db.query(AnalysisRunDB).order_by(AnalysisRunDB.created_at.desc()).limit(20).all()
    return [
        {
            "id": r.id,
            "created_at": r.created_at.isoformat(),
            "k_neighbors": r.k_neighbors,
            "similarity_threshold": r.similarity_threshold,
            "num_documents": r.num_documents,
            "num_clusters": r.num_clusters,
            "num_isolated": r.num_isolated
        }
        for r in runs
    ]

@app.get("/api/runs/{run_id}")
def get_run_details(run_id: str, db: Session = Depends(get_db)):
    """Retrieves full analysis run details from SQLite."""
    run = db.query(AnalysisRunDB).filter(AnalysisRunDB.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
    
    docs = db.query(DocumentDB).filter(DocumentDB.run_id == run_id).all()
    clusters = db.query(ClusterDB).filter(ClusterDB.run_id == run_id).all()
    
    return {
        "run_id": run.id,
        "created_at": run.created_at.isoformat(),
        "config": {
            "k_neighbors": run.k_neighbors,
            "similarity_threshold": run.similarity_threshold,
            "summary_sentences": run.summary_sentences
        },
        "summary_metrics": {
            "num_documents": run.num_documents,
            "num_clusters": run.num_clusters,
            "num_isolated": run.num_isolated
        },
        "global_corpus_summary": run.global_summary,
        "clusters": [
            {
                "cluster_id": c.cluster_id,
                "cluster_label": c.label,
                "member_count": c.member_count,
                "thematic_medoid": c.thematic_medoid,
                "shared_keywords": json.loads(c.keywords_json),
                "thematic_synthesis": c.synthesis_text,
                "member_doc_ids": json.loads(c.members_json)
            }
            for c in clusters
        ],
        "documents": [
            {
                "doc_id": d.doc_id,
                "title": d.title,
                "source": d.source,
                "publication_date": d.publication_date,
                "cluster_id": d.cluster_id,
                "cluster_label": d.cluster_label,
                "is_isolated": d.is_isolated,
                "summary_text": d.summary_text,
                "summary_words": d.summary_words,
                "original_words": d.original_words,
                "compression_ratio": d.compression_ratio,
                "doc_keywords": json.loads(d.keywords_json),
                "nearest_neighbors": json.loads(d.neighbors_json),
                "connectivity_type": d.connectivity_type,
                "shortest_path": d.shortest_path,
                "alternative_cluster": d.alternative_cluster,
                "margin_delta": d.margin_delta,
                "assignment_status": d.status_flag,
                "explanation": d.explanation
            }
            for d in docs
        ]
    }

@app.get("/api/export/{run_id}/csv")
def export_run_csv(run_id: str, db: Session = Depends(get_db)):
    """Exports document analysis results for a run as a downloadable CSV."""
    docs = db.query(DocumentDB).filter(DocumentDB.run_id == run_id).all()
    if not docs:
        raise HTTPException(status_code=404, detail=f"No documents found for run '{run_id}'.")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "doc_id", "title", "source", "publication_date", "cluster_id", "cluster_label",
        "is_isolated", "summary_text", "doc_keywords", "assignment_status", "explanation"
    ])
    for d in docs:
        writer.writerow([
            d.doc_id, d.title, d.source, d.publication_date, d.cluster_id, d.cluster_label,
            d.is_isolated, d.summary_text, d.keywords_json, d.status_flag, d.explanation
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=quantumlens_run_{run_id}.csv"}
    )

