import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.nlp.preprocessor import NLPPreprocessor
from app.nlp.vectorizer import TfidfFeatureExtractor
from app.nlp.summarizer import TextRankSummarizer
from app.nlp.clustering import KNNGraphClusterer
from app.nlp.explainability import ClusterExplainabilityEngine

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "QuantumLens" in data["service"]

def test_get_sample_documents():
    response = client.get("/api/sample")
    assert response.status_code == 200
    docs = response.json()
    assert len(docs) == 20
    assert docs[0]["doc_id"] == "DOC_01"
    assert "qubit" in docs[0]["text"].lower()

def test_nlp_preprocessor_dual_stream():
    preprocessor = NLPPreprocessor()
    raw = "<p>Quantum computing uses <b>superconducting transmons</b> and fault-tolerant qubits.</p>"
    raw_pres, tokens, clean_text = preprocessor.preprocess_document(raw)
    
    # Raw preserved should strip tags but keep words
    assert "superconducting transmons" in raw_pres
    assert "<p>" not in raw_pres
    # Clean text should be lemmatized and lowercase
    assert "qubit" in clean_text
    assert len(tokens) > 0

def test_textrank_summarization():
    summarizer = TextRankSummarizer()
    article = (
        "IBM unveiled the Condor quantum processor with 1121 superconducting transmon qubits. "
        "The system operates near 15 millikelvin inside a dilution refrigerator. "
        "Engineers implemented high-density flexible cables to route microwave control signals. "
        "Quantum System Two connects multiple modular processing units together."
    )
    result = summarizer.summarize_document(article, max_sentences=2)
    assert len(result["summary"]) > 0
    assert result["compression_ratio"] > 0.0
    assert result["summary_words"] < result["original_words"]
    assert "TextRank" in result["summary_method"]

def test_knn_graph_clustering():
    extractor = TfidfFeatureExtractor()
    clean_texts = [
        "superconducting transmon qubit cryogenic processor",
        "superconducting transmon microwave gate fidelity",
        "error correction logical qubit surface code syndrome",
        "surface code syndrome decoding fault-tolerant stabilizer",
        "classical supercomputer exascale top500 benchmark gpu"
    ]
    doc_ids = ["D1", "D2", "D3", "D4", "D5"]
    titles = ["Hardware 1", "Hardware 2", "QEC 1", "QEC 2", "HPC 1"]
    
    matrix = extractor.fit_transform(clean_texts)
    clusterer = KNNGraphClusterer(k_neighbors=2, similarity_threshold=0.20)
    res = clusterer.fit_predict(matrix, doc_ids, extractor.feature_names, titles)
    
    assert res["num_clusters"] >= 2
    # D1 and D2 should cluster together (Hardware)
    assert clusterer.cluster_assignments["D1"] == clusterer.cluster_assignments["D2"]
    # D3 and D4 should cluster together (QEC)
    assert clusterer.cluster_assignments["D3"] == clusterer.cluster_assignments["D4"]
    # D1 and D3 should be in different clusters
    assert clusterer.cluster_assignments["D1"] != clusterer.cluster_assignments["D3"]

def test_explainability_attribution():
    extractor = TfidfFeatureExtractor()
    clean_texts = [
        "quantum hardware qubit transmon processor",
        "quantum qubit transmon fidelity cryogenic",
        "post-quantum cryptography kyber dilithium security"
    ]
    doc_ids = ["D1", "D2", "D3"]
    titles = ["HW1", "HW2", "SEC1"]
    
    matrix = extractor.fit_transform(clean_texts)
    clusterer = KNNGraphClusterer(k_neighbors=2, similarity_threshold=0.20)
    clusterer.fit_predict(matrix, doc_ids, extractor.feature_names, titles)
    
    explainer = ClusterExplainabilityEngine(clusterer, extractor, doc_ids, titles)
    exp = explainer.explain_document("D1")
    
    assert exp["doc_id"] == "D1"
    assert "explanation" in exp
    assert "D2" in [n["neighbor_id"] for n in exp["nearest_neighbors"]]
    assert len(exp["doc_keywords"]) > 0

def test_end_to_end_analyze_api():
    payload = {
        "documents": [
            {
                "doc_id": "TEST_01",
                "title": "Superconducting Qubits",
                "text": "Superconducting transmon qubits operate in cryogenic refrigerators with high gate fidelity and low microwave noise."
            },
            {
                "doc_id": "TEST_02",
                "title": "Cryogenic Transmon Systems",
                "text": "Transmon processor chips are packaged in cryogenic dilution systems to maximize qubit coherence times."
            },
            {
                "doc_id": "TEST_03",
                "title": "Quantum Error Correction",
                "text": "Surface code quantum error correction decodes syndrome measurements to protect logical quantum memory."
            },
            {
                "doc_id": "TEST_04",
                "title": "Fault Tolerant Syndrome Decoding",
                "text": "Real-time syndrome decoding identifies bit flip error chains to maintain fault-tolerant logical states."
            }
        ],
        "k_neighbors": 2,
        "similarity_threshold": 0.20,
        "summary_sentences": 1
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "run_id" in data
    assert data["summary_metrics"]["num_documents"] == 4
    assert len(data["clusters"]) >= 1
    assert len(data["documents"]) == 4
    assert "graph" in data
    assert len(data["graph"]["nodes"]) == 4
    # Check that each document has an explanation and summary
    for doc in data["documents"]:
        assert len(doc["explanation"]) > 0
        assert len(doc["summary_text"]) > 0
        assert doc["cluster_id"] is not None

def test_analyze_with_sample_dataset():
    sample_resp = client.get("/api/sample")
    assert sample_resp.status_code == 200
    sample_docs = sample_resp.json()
    assert len(sample_docs) == 20

    payload = {
        "documents": sample_docs,
        "k_neighbors": 3,
        "similarity_threshold": 0.20,
        "summary_sentences": 2
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["summary_metrics"]["num_documents"] == 20
    assert len(data["clusters"]) >= 2
    assert len(data["documents"]) == 20
    assert len(data["graph"]["nodes"]) == 20
    assert "pca_projection" in data["evaluation"]
    assert len(data["evaluation"]["pca_projection"]) == 20

def test_analyze_validation_errors():
    # Less than 2 documents
    resp1 = client.post("/api/analyze", json={"documents": [{"title": "Only One", "text": "Only one document here with enough words to pass the length constraint."}]})
    assert resp1.status_code == 400

    # Documents with < 10 words
    resp2 = client.post("/api/analyze", json={
        "documents": [
            {"title": "Too short 1", "text": "Too short text."},
            {"title": "Too short 2", "text": "Also too short."}
        ]
    })
    assert resp2.status_code == 400

def test_analyze_small_corpus_2_docs():
    payload = {
        "documents": [
            {
                "doc_id": "T1",
                "title": "Quantum Photonics",
                "text": "Photonic quantum computing utilizes squeezed light pulses and optical interferometers on lithium niobate chips."
            },
            {
                "doc_id": "T2",
                "title": "Optical Qubits",
                "text": "Optical quantum processors guide single photons through beam splitters to perform fault tolerant cluster states."
            }
        ],
        "k_neighbors": 1,
        "similarity_threshold": 0.15,
        "summary_sentences": 1
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["summary_metrics"]["num_documents"] == 2
    assert len(data["documents"]) == 2

def test_runs_and_export_endpoints():
    runs_resp = client.get("/api/runs")
    assert runs_resp.status_code == 200
    runs = runs_resp.json()
    if len(runs) > 0:
        run_id = runs[0]["id"]
        run_detail = client.get(f"/api/runs/{run_id}")
        assert run_detail.status_code == 200
        export_resp = client.get(f"/api/export/{run_id}/csv")
        assert export_resp.status_code == 200
        assert "text/csv" in export_resp.headers["content-type"]

def test_document_exclusion_reasons():
    payload = {
        "documents": [
            {
                "doc_id": "V1",
                "title": "Cryogenic Superconducting Transmon System",
                "text": "Superconducting transmon processor architectures operate in dilution refrigerators with high microwave gate fidelity."
            },
            {
                "doc_id": "V2",
                "title": "Superconducting Qubit Coherence Scaling",
                "text": "Transmon microwave resonators in cryogenic packaging suppress dielectric surface losses to increase qubit coherence."
            },
            {
                "doc_id": "V3",
                "title": "Quantum Error Correction Planar Surface Codes",
                "text": "Planar surface code quantum error correction decodes stabilizer syndrome measurements to protect logical qubits."
            },
            {
                "doc_id": "SHORT_1",
                "title": "Short Document",
                "text": "Too brief."
            },
            {
                "doc_id": "DUP_1",
                "title": "Duplicate Document",
                "text": "Superconducting transmon processor architectures operate in dilution refrigerators with high microwave gate fidelity."
            }
        ],
        "k_neighbors": 2,
        "similarity_threshold": 0.20,
        "summary_sentences": 1
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["summary_metrics"]["submitted_documents_count"] == 5
    assert data["summary_metrics"]["num_documents"] == 3
    assert data["summary_metrics"]["excluded_documents_count"] == 2
    assert "processing_duration_sec" in data["summary_metrics"]
    assert len(data["summary_metrics"]["excluded_documents"]) == 2
    reasons = [e["reason"] for e in data["summary_metrics"]["excluded_documents"]]
    assert any("Fewer than 10 words" in r for r in reasons)
    assert any("Duplicate content detected" in r for r in reasons)

