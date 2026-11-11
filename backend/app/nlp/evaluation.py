import numpy as np
import scipy.sparse as sp
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA
from typing import List, Dict, Any, Optional

class EvaluationEngine:
    def __init__(self, tfidf_matrix: sp.csr_matrix, doc_ids: List[str], titles: List[str], assignments: Dict[str, int]):
        self.tfidf_matrix = tfidf_matrix
        self.doc_ids = doc_ids
        self.titles = titles
        self.assignments = assignments
        self.sim_matrix = cosine_similarity(tfidf_matrix)

    def compute_metrics(self) -> Dict[str, Any]:
        n = len(self.doc_ids)
        intra_sims = []
        inter_sims = []

        for i in range(n):
            ci = self.assignments[self.doc_ids[i]]
            if ci == -1:
                continue
            for j in range(i + 1, n):
                cj = self.assignments[self.doc_ids[j]]
                if cj == -1:
                    continue
                sim = self.sim_matrix[i, j]
                if ci == cj:
                    intra_sims.append(sim)
                else:
                    inter_sims.append(sim)

        mean_intra = float(np.mean(intra_sims)) if intra_sims else 0.0
        mean_inter = float(np.mean(inter_sims)) if inter_sims else 0.0
        cohesion_ratio = round(mean_intra / max(1e-5, mean_inter), 2)

        # Silhouette score
        labels = [self.assignments[d] for d in self.doc_ids]
        unique_non_isolated = set([l for l in labels if l != -1])
        sil_score = None
        if len(unique_non_isolated) >= 2 and n > len(unique_non_isolated):
            try:
                sil_score = round(float(silhouette_score(self.tfidf_matrix, labels, metric='cosine')), 3)
            except Exception:
                sil_score = None

        # 2D PCA projection for visual mapping
        coords = None
        dense_vecs = self.tfidf_matrix.toarray()
        if n >= 2 and dense_vecs.shape[1] >= 2:
            try:
                pca = PCA(n_components=2, random_state=42)
                coords = pca.fit_transform(dense_vecs)
            except Exception:
                coords = None

        if coords is None:
            coords = np.zeros((n, 2))
            for i in range(n):
                coords[i, 0] = float(i)
                coords[i, 1] = 0.0

        pca_points = []
        for i in range(n):
            pca_points.append({
                'doc_id': self.doc_ids[i],
                'title': self.titles[i],
                'cluster_id': self.assignments[self.doc_ids[i]],
                'x': round(float(coords[i, 0]), 4),
                'y': round(float(coords[i, 1]), 4)
            })

        # Cluster size distribution
        size_dist = {}
        for c in labels:
            c_key = f"Cluster {c}" if c != -1 else "Isolated (-1)"
            size_dist[c_key] = size_dist.get(c_key, 0) + 1

        return {
            'mean_intra_cluster_similarity': round(mean_intra, 4),
            'mean_inter_cluster_similarity': round(mean_inter, 4),
            'cohesion_ratio': cohesion_ratio,
            'silhouette_score': sil_score,
            'pca_projection': pca_points,
            'cluster_size_distribution': size_dist
        }
