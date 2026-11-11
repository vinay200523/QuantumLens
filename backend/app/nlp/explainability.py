import numpy as np
import networkx as nx
from typing import List, Dict, Any
from .clustering import KNNGraphClusterer
from .vectorizer import TfidfFeatureExtractor

class ClusterExplainabilityEngine:
    def __init__(self, clusterer: KNNGraphClusterer, extractor: TfidfFeatureExtractor, doc_ids: List[str], titles: List[str], ambiguity_margin: float = 0.08):
        self.clusterer = clusterer
        self.extractor = extractor
        self.doc_ids = doc_ids
        self.titles = titles
        self.ambiguity_margin = ambiguity_margin
        self.doc_id_to_idx = {doc_ids[i]: i for i in range(len(doc_ids))}
        self.doc_id_to_title = {doc_ids[i]: titles[i] for i in range(len(doc_ids))}

    def explain_document(self, doc_id: str) -> Dict[str, Any]:
        row_idx = self.doc_id_to_idx[doc_id]
        title = self.doc_id_to_title[doc_id]
        assigned_c = self.clusterer.cluster_assignments[doc_id]
        assigned_label = self.clusterer.cluster_labels[assigned_c]

        doc_top_features = self.extractor.get_top_features_for_doc(row_idx, top_n=6)
        doc_keywords = [t for t, w in doc_top_features]
        neighbors_info = self.clusterer.neighbor_cache.get(doc_id, [])
        accepted_neighbors = [n for n in neighbors_info if n['edge_accepted']]

        # Handle Isolated Documents (Degree 0)
        if assigned_c == -1:
            max_sim_neighbor = neighbors_info[0] if len(neighbors_info) > 0 else None
            max_sim = max_sim_neighbor['cosine_similarity'] if max_sim_neighbor else 0.0
            explanation = (
                f"Document {doc_id} is designated as an ISOLATED OUTLIER (Cluster -1). "
                f"Its highest neighbor cosine similarity is {max_sim:.3f} (to {max_sim_neighbor['neighbor_id'] if max_sim_neighbor else 'N/A'}), "
                f"which falls below the required clustering threshold of tau = {self.clusterer.threshold:.2f}. "
                f"Its distinctive terms ({', '.join(doc_keywords[:4])}) do not sufficiently overlap with any coherent document community."
            )
            return {
                'doc_id': doc_id,
                'title': title,
                'assigned_cluster': assigned_c,
                'cluster_label': assigned_label,
                'is_isolated': True,
                'doc_keywords': doc_keywords[:5],
                'cluster_keywords': [],
                'shared_keywords': [],
                'nearest_neighbors': neighbors_info,
                'connectivity_type': 'Isolated (Degree 0)',
                'shortest_path': 'None',
                'alternative_cluster': 'None',
                'margin_delta': 0.0,
                'assignment_status': 'ISOLATED_OUTLIER',
                'explanation': explanation
            }

        centroid = self.clusterer.cluster_centroids[assigned_c]
        centroid_top_indices = np.argsort(centroid)[::-1][:6]
        cluster_keywords = [self.extractor.feature_names[i] for i in centroid_top_indices if centroid[i] > 0]

        shared_keywords = [k for k in doc_keywords if k in cluster_keywords]
        if len(shared_keywords) == 0:
            expanded_c_indices = np.argsort(centroid)[::-1][:15]
            expanded_c_kw = [self.extractor.feature_names[i] for i in expanded_c_indices]
            shared_keywords = [k for k in doc_keywords if k in expanded_c_kw]

        cluster_members = [d for d, c in self.clusterer.cluster_assignments.items() if c == assigned_c]
        subgraph = self.clusterer.graph.subgraph(cluster_members)
        exemplar = max(cluster_members, key=lambda n: subgraph.degree(n))

        if doc_id == exemplar:
            conn_type = "Cluster Hub / Exemplar"
            shortest_path_str = f"{doc_id} (Hub Node)"
        elif self.clusterer.graph.has_edge(doc_id, exemplar):
            conn_type = "Direct 1-Hop to Hub"
            shortest_path_str = f"{doc_id} -> {exemplar} (sim = {self.clusterer.graph[doc_id][exemplar]['weight']:.3f})"
        else:
            try:
                path = nx.shortest_path(subgraph, source=doc_id, target=exemplar)
                conn_type = f"Multi-Hop Chained ({len(path)-1} Hops)"
                shortest_path_str = ' -> '.join(path)
            except nx.NetworkXNoPath:
                conn_type = "Local Component"
                shortest_path_str = f"{doc_id} (Local Neighbor Link)"

        doc_vec = self.extractor.tfidf_matrix.getrow(row_idx).toarray().ravel()
        primary_sim = float(np.dot(doc_vec, centroid))

        alt_cluster_id = None
        alt_sim = -1.0
        for other_c, other_cent in self.clusterer.cluster_centroids.items():
            if other_c != assigned_c and other_c != -1:
                sim_c = float(np.dot(doc_vec, other_cent))
                if sim_c > alt_sim:
                    alt_sim = sim_c
                    alt_cluster_id = other_c

        if alt_cluster_id is not None:
            margin_delta = max(0.0, primary_sim - alt_sim)
            alt_label = self.clusterer.cluster_labels.get(alt_cluster_id, f"Cluster {alt_cluster_id}")
            alt_cluster_str = f"Cluster {alt_cluster_id}"
            alt_text = f"Nearest competing group is {alt_label} with similarity {alt_sim:.3f} (Separation Margin Delta = {margin_delta:.3f})."
            if margin_delta < self.ambiguity_margin:
                assignment_status = f"AMBIGUOUS (Narrow Margin Delta = {margin_delta:.3f})"
            else:
                assignment_status = "CONFIDENT_ASSIGNMENT"
        else:
            margin_delta = round(primary_sim, 3)
            alt_cluster_str = "None"
            alt_text = "No competing alternative cluster exists (single coherent group discovered)."
            assignment_status = "CONFIDENT_ASSIGNMENT"

        graph_neighbors = list(self.clusterer.graph.neighbors(doc_id)) if self.clusterer.graph and self.clusterer.graph.has_node(doc_id) else []
        if accepted_neighbors:
            accepted_str = ', '.join([f"{n['neighbor_id']} (sim={n['cosine_similarity']:.3f})" for n in accepted_neighbors])
        elif graph_neighbors:
            accepted_str = ', '.join([f"{nbr} (sim={self.clusterer.graph[doc_id][nbr]['weight']:.3f})" for nbr in graph_neighbors])
        else:
            accepted_str = "intracluster links"

        shared_str = ', '.join(shared_keywords[:4]) if len(shared_keywords) > 0 else 'contextual semantic alignment'
        
        # Build nuanced natural language explanation based on graph topology
        chaining_note = ""
        if "Multi-Hop" in conn_type:
            chaining_note = f" The document exhibits graph chaining, connecting to the group medoid indirectly via {shortest_path_str}."
        elif "Direct 1-Hop" in conn_type:
            chaining_note = f" The document has direct pairwise similarity exceeding threshold tau = {self.clusterer.threshold:.2f} to the group hub [{shortest_path_str}]."
        
        ambiguity_warning = ""
        if "AMBIGUOUS" in assignment_status:
            ambiguity_warning = f" Warning: Group assignment has a narrow margin delta ({margin_delta:.3f}) relative to competing {alt_label}."

        explanation = (
            f"Document {doc_id} is assigned to {assigned_label} because its distinctive terms ({', '.join(doc_keywords[:4])}) "
            f"align with defining group keywords on [{shared_str}]. "
            f"In the thresholded similarity graph (tau={self.clusterer.threshold:.2f}), it connects to neighbor(s) {accepted_str}. "
            f"{chaining_note} {alt_text}{ambiguity_warning}"
        ).strip()

        return {
            'doc_id': doc_id,
            'title': title,
            'assigned_cluster': assigned_c,
            'cluster_label': assigned_label,
            'is_isolated': False,
            'doc_keywords': doc_keywords[:5],
            'cluster_keywords': cluster_keywords[:5],
            'shared_keywords': shared_keywords[:4],
            'nearest_neighbors': neighbors_info,
            'connectivity_type': conn_type,
            'shortest_path': shortest_path_str,
            'alternative_cluster': alt_cluster_str,
            'margin_delta': round(margin_delta, 3),
            'assignment_status': assignment_status,
            'explanation': explanation
        }
