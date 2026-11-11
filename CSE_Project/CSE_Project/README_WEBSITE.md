# QuantumLens — Web Application Guide
## Advanced Social Media and Text Analysis • Academic Research Edition

QuantumLens is a complete full-stack web application designed for unsupervised document summarization, KNN-based graph clustering, and evidence-based cluster attribution.

---

## 1. System Architecture & Tech Stack

```
   +-------------------------------------------------------------------------+
   |                       REACT + TYPESCRIPT FRONTEND                       |
   |   - Tailwind CSS (Clean Academic Aesthetic: Dark Navy & Restrained Blue)|
   |   - Recharts (Cluster Distribution & 2D PCA Projections)                |
   |   - Interactive HTML5 Canvas Proximity Network Graph                    |
   |   - 6 Dedicated Pages: Input, Config, Overview, Clusters, Details, Eval |
   +------------------------------------+------------------------------------+
                                        |  REST API Calls (Axios)
                                        v
   +------------------------------------+------------------------------------+
   |                          FASTAPI BACKEND                                |
   |   - Asynchronous Endpoints: Ingestion, Upload, Analysis, History        |
   |   - SQLite Database (SQLAlchemy ORM for Analysis Runs & Evidence)       |
   |   - Pydantic V2 Strict Schema Validation & Error Reporting              |
   +------------------------------------+------------------------------------+
                                        |  Internal NLP Pipelines
                                        v
   +------------------------------------+------------------------------------+
   |                       NLP & ALGORITHM ENGINE                            |
   |   - Dual-Stream Preprocessing: Verbatim Raw Text vs. Sanitized Tokens   |
   |   - Vector Space Modeling: TF-IDF (Unigrams + Bigrams, Sublinear TF)    |
   |   - Extractive Summarization: TextRank PageRank with Chronological Order|
   |   - KNN Graph Clustering: Scikit-Learn NearestNeighbors (Cosine Metric) |
   |   - Graph Theory: NetworkX Connected Components & Shortest Paths        |
   |   - Attribution Engine: 9-Factor Explainability with Margin Delta       |
   +-------------------------------------------------------------------------+
```

---

## 2. Quick Start & Execution

### Option A: One-Click Launcher (Windows)
Double-click `start_all.bat` in the project root:
```cmd
start_all.bat
```
This automatically launches:
- **Backend API**: `http://localhost:8000` (Interactive Swagger Docs: `http://localhost:8000/docs`)
- **Frontend Web App**: `http://localhost:5173`

---

### Option B: Manual Terminal Execution

#### 1. Start Backend (Terminal 1)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

### Option C: Running Backend Tests (pytest)
```bash
cd backend
pytest -v tests/test_api.py
```
Or double-click `run_tests.bat`.

---

## 3. Walkthrough of the 6 Website Pages

### Page A: Home and Document Input
- **Introduction**: Introduces the QuantumLens research project and methodology.
- **Multiple Input Modalities**:
  - Direct input cards with dynamic "Add Blank Document" and delete actions.
  - One-click **"Load Sample Quantum Dataset (20 Articles)"** button covering diverse subtopics.
  - **Upload CSV**: Automatically extracts `doc_id`, `title`, and `text`.
  - **Upload Multiple .TXT**: Ingests batch text files directly into the corpus queue.
- **Input Validation**: Displays real-time metrics, short document warnings (< 15 words), empty string checks, and duplicate detection.

### Page B: Processing and Configuration
- **Interactive Hyperparameter Tuning**:
  - **Nearest Neighbors ($k$)**: Slider from 1 to 10 (controls local manifold neighborhood).
  - **Similarity Threshold ($\tau$)**: Slider from 0.10 to 0.50 (controls graph edge cutoff).
  - **Summary Sentence Count**: Slider from 1 to 5 sentences.
  - **Summarization Mode**: Extractive TextRank vs. Abstractive Transformer.
- **Plain-Language Explanations**: Details the mathematical role of each parameter.
- **Pipeline Stepper**: Displays real-time progress while algorithms execute.

### Page C: Results Overview
- **Key Metrics Scorecards**: Total documents, discovered clusters count, isolated outlier count, and average TextRank compression ratio.
- **Global Collection Synthesis**: High-level narrative summarizing the full corpus.
- **Cluster Size Distribution Chart**: Recharts bar chart showing document counts per cluster.
- **Cluster Cards Grid**: Cards featuring generated labels, top shared keywords, member counts, and thematic medoids.

### Page D: Cluster Explorer
- **Cluster Switcher**: One-click tabs to switch between discovered thematic groups.
- **Thematic Medoid Callout**: Highlights the central document with highest degree centrality.
- **Interactive Proximity Graph**: HTML5 canvas rendering of NetworkX graph topology with node degree sizes and edge weights.
- **Member Document Summaries**: Chronologically ordered TextRank summaries for all group members.
- **Subtopic Divergence**: Detects and highlights distinctive terms specific to individual members.

### Page E: Document Details and Explainability (Core Requirement)
For every individual document:
1. **Original Source Text**: Verbatim text as authored.
2. **Preprocessed Feature Stream**: Expandable tokenized and lemmatized view used for TF-IDF.
3. **TextRank Summary**: Extracted salient sentences in chronological narrative order.
4. **Assigned Cluster & Generated Label**.
5. **Document Distinctive Keywords**: Top TF-IDF features.
6. **Cluster Centroid Keywords**.
7. **Shared Keywords Overlap ($\cap$)**: Highlighted in green badges.
8. **Nearest Neighbors Table**: Shows all $k$ candidate documents, titles, and exact cosine similarities.
9. **Topological Connectivity**: Identifies Direct 1-Hop connections vs. Multi-Hop Chained paths ($A \rightarrow B \rightarrow C$).
10. **Alternative Cluster & Separation Margin ($\Delta$)**: Identifies closest competing group.
11. **Evidence-Based Natural Language Explanation**: Dynamically synthesized from calculated numbers.
12. **Honest Uncertainty & Isolation Warnings**: Flags isolated outliers (degree 0) and narrow margins ($\Delta < 0.08$).

### Page F: Evaluation and Export
- **Evaluation Scorecards**:
  - Mean Intra-Cluster Cosine Similarity.
  - Mean Inter-Cluster Cosine Separation.
  - Cohesion Ratio ($> 2.5\times$ is superior).
  - Silhouette Score with academic interpretation.
- **2D PCA Projection Scatter Plot**: Interactive dimensional reduction map of documents.
- **Algorithmic Verification Tests**: Reports results of 4 academic unit tests.
- **Multi-Format Export Buttons**:
  - `Export Processed Documents (CSV)`
  - `Export Extractive Summaries (CSV)`
  - `Export Evidence Table (CSV)`
  - `Export Complete Analysis (JSON)`

---

## 4. API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status and service metadata |
| `GET` | `/api/sample` | Returns 20 benchmark Quantum Computing articles |
| `POST` | `/api/upload/csv` | Ingests and parses a CSV file |
| `POST` | `/api/upload/txt` | Ingests multiple `.txt` files |
| `POST` | `/api/analyze` | Executes full NLP, clustering, summarization & explainability pipeline |
| `GET` | `/api/runs` | Lists past analysis runs from SQLite |
| `GET` | `/api/runs/{run_id}` | Retrieves full analysis run details |

---

## 5. Directory Structure

```
c:\Users\nemat\OneDrive\Desktop\CSE_Project\
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app and API routes
│   │   ├── config.py            # App settings
│   │   ├── database.py          # SQLite database connection & session
│   │   ├── models.py            # SQLAlchemy database models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── sample_data.py       # 20 Quantum Computing benchmark articles
│   │   └── nlp/
│   │       ├── preprocessor.py   # Dual-stream NLP preprocessing
│   │       ├── vectorizer.py     # TF-IDF unigram/bigram feature extraction
│   │       ├── summarizer.py     # TextRank PageRank extractive summarization
│   │       ├── clustering.py     # NearestNeighbors cosine graph & connected components
│   │       ├── explainability.py # 9-Factor evidence attribution engine
│   │       └── evaluation.py     # Intra/inter metrics, PCA, sensitivity analysis
│   ├── tests/
│   │   └── test_api.py          # Pytest backend test suite
│   └── requirements.txt         # Backend Python dependencies
├── frontend/
│   ├── package.json             # React, TypeScript, Tailwind, Lucide, Recharts
│   ├── vite.config.ts           # Vite bundler configuration
│   ├── tailwind.config.js       # Tailwind CSS theme
│   ├── src/
│   │   ├── types/index.ts       # TypeScript interfaces
│   │   ├── services/api.ts      # Axios client for FastAPI backend
│   │   ├── context/AnalysisContext.tsx # Centralized state provider
│   │   ├── components/
│   │   │   ├── Navbar.tsx       # Top navigation header
│   │   │   ├── MetricCard.tsx   # Reusable metric card
│   │   │   └── NetworkGraph.tsx # Interactive HTML5 Canvas similarity graph
│   │   └── pages/
│   │       ├── DocumentInputPage.tsx   # Page A
│   │       ├── ConfigurationPage.tsx   # Page B
│   │       ├── ResultsOverviewPage.tsx # Page C
│   │       ├── ClusterExplorerPage.tsx # Page D
│   │       ├── DocumentDetailPage.tsx  # Page E
│   │       └── EvaluationExportPage.tsx# Page F
├── start_backend.bat            # One-click backend starter
├── start_frontend.bat           # One-click frontend starter
├── start_all.bat                # Unified launcher
├── run_tests.bat                # Pytest test runner
└── README_WEBSITE.md            # This documentation
```
