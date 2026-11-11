import numpy as np
import scipy.sparse as sp
import networkx as nx
from sklearn.neighbors import NearestNeighbors
from typing import List, Dict, Any, Optional

class KNNGraphClusterer:
    def __init__(self, k_neighbors: int = 3, similarity_threshold: float = 0.25):
        self.k = k_neighbors
        self.threshold = similarity_threshold
        self.graph: Optional[nx.Graph] = None
        self.cluster_assignments: Dict[str, int] = {}
        self.cluster_labels: Dict[int, str] = {}
        self.cluster_centroids: Dict[int, np.ndarray] = {}
        self.neighbor_cache: Dict[str, List[Dict[str, Any]]] = {}
        self.isolated_docs: List[str] = []

    def fit_predict(
        self,
        tfidf_matrix: sp.csr_matrix,
        doc_ids: List[str],
        feature_names: np.ndarray,
        titles: List[str]
    ) -> Dict[str, Any]:
        n_docs = tfidf_matrix.shape[0]
        doc_id_to_idx = {doc_ids[i]: i for i in range(n_docs)}
        idx_to_doc_id = {i: doc_ids[i] for i in range(n_docs)}
        id_to_title = {doc_ids[i]: titles[i] for i in range(n_docs)}

        # Scikit-learn NearestNeighbors using Cosine Distance
        query_k = min(self.k + 1, n_docs)
        nn = NearestNeighbors(n_neighbors=query_k, metric='cosine')
        nn.fit(tfidf_matrix)
        distances, indices = nn.kneighbors(tfidf_matrix)

        # Build Undirected Graph G
        G = nx.Graph()
        for doc_id in doc_ids:
            G.add_node(doc_id, title=id_to_title[doc_id])

        self.neighbor_cache = {}
        for i in range(n_docs):
            u_id = idx_to_doc_id[i]
            neighbors_list = []
            for rank in range(1, query_k):
                v_idx = indices[i, rank]
                v_id = idx_to_doc_id[v_idx]
                cos_dist = float(distances[i, rank])
                cos_sim = max(0.0, 1.0 - cos_dist)
                is_connected = bool(cos_sim >= self.threshold)

                neighbors_list.append({
                    'neighbor_id': v_id,
                    'title': id_to_title[v_id],
                    'cosine_distance': round(cos_dist, 4),
                    'cosine_similarity': round(cos_sim, 4),
                    'edge_accepted': is_connected
                })

                if is_connected:
                    G.add_edge(u_id, v_id, weight=cos_sim)

            self.neighbor_cache[u_id] = neighbors_list

        self.graph = G

        # Connected Components
        raw_components = list(nx.connected_components(G))
        raw_components.sort(key=lambda c: len(c), reverse=True)

        self.cluster_assignments = {}
        self.isolated_docs = []
        cluster_counter = 0

        for comp in raw_components:
            comp_nodes = list(comp)
            if len(comp_nodes) == 1 and G.degree(comp_nodes[0]) == 0:
                self.cluster_assignments[comp_nodes[0]] = -1
                self.isolated_docs.append(comp_nodes[0])
            else:
                for node in comp_nodes:
                    self.cluster_assignments[node] = cluster_counter
                cluster_counter += 1

        # Centroid vectors & labels
        self.cluster_centroids = {}
        self.cluster_labels = {}
        self.cluster_labels[-1] = "Cluster -1: Isolated / Low-Similarity Outliers"

        for c_id in range(cluster_counter):
            c_members = [doc_id for doc_id, assigned_c in self.cluster_assignments.items() if assigned_c == c_id]
            c_indices = [doc_id_to_idx[d] for d in c_members]
            sub_matrix = tfidf_matrix[c_indices]
            centroid_dense = np.asarray(sub_matrix.mean(axis=0)).ravel()
            norm = np.linalg.norm(centroid_dense)
            if norm > 0:
                centroid_dense = centroid_dense / norm
            self.cluster_centroids[c_id] = centroid_dense

            top_term_indices = np.argsort(centroid_dense)[::-1][:4]
            top_terms = [feature_names[idx] for idx in top_term_indices if centroid_dense[idx] > 0]
            label_terms = ' • '.join([t.capitalize() for t in top_terms])
            if not label_terms:
                label_terms = f"Thematic Group {c_id + 1}"
            self.cluster_labels[c_id] = f"Cluster {c_id}: {label_terms}"

        return {
            'num_clusters': cluster_counter,
            'num_isolated': len(self.isolated_docs),
            'cluster_labels': self.cluster_labels,
            'cluster_assignments': self.cluster_assignments
        }
