import re
import numpy as np
import networkx as nx
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Tuple, Dict, Any

class TextRankSummarizer:
    def __init__(self, damping_factor: float = 0.85, max_iter: int = 200, tol: float = 1e-6):
        self.damping_factor = damping_factor
        self.max_iter = max_iter
        self.tol = tol

    def split_sentences(self, raw_text: str) -> List[str]:
        sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9])', raw_text.strip())
        res = [s.strip() for s in sentences if len(s.strip().split()) >= 4]
        if not res and raw_text.strip():
            res = [raw_text.strip()]
        return res

    def rank_sentences(self, sentences: List[str]) -> List[Tuple[int, float]]:
        n_sentences = len(sentences)
        if n_sentences <= 1:
            return [(0, 1.0)]

        sent_vectorizer = TfidfVectorizer(stop_words='english', sublinear_tf=True)
        try:
            sent_tfidf = sent_vectorizer.fit_transform(sentences)
        except ValueError:
            return [(i, 1.0 / n_sentences) for i in range(n_sentences)]

        sim_matrix = cosine_similarity(sent_tfidf)
        np.fill_diagonal(sim_matrix, 0.0)

        graph = nx.Graph()
        for i in range(n_sentences):
            graph.add_node(i)
            for j in range(i + 1, n_sentences):
                weight = sim_matrix[i, j]
                if weight > 0.02:
                    graph.add_edge(i, j, weight=weight)

        try:
            scores_dict = nx.pagerank(graph, alpha=self.damping_factor, max_iter=self.max_iter, tol=self.tol, weight='weight')
        except Exception:
            scores_dict = {i: float(np.sum(sim_matrix[i])) for i in range(n_sentences)}

        return sorted(scores_dict.items(), key=lambda x: x[1], reverse=True)

    def summarize_document(self, raw_text: str, max_sentences: int = 2) -> Dict[str, Any]:
        sentences = self.split_sentences(raw_text)
        if len(sentences) == 0:
            return {
                'summary': raw_text,
                'original_words': len(raw_text.split()),
                'summary_words': len(raw_text.split()),
                'compression_ratio': 0.0,
                'summary_method': 'Extractive TextRank (Full Text)'
            }

        target_count = min(max_sentences, len(sentences))
        ranked = self.rank_sentences(sentences)

        selected_indices = [idx for idx, _ in ranked[:target_count]]
        # CHRONOLOGICAL REORDERING to preserve discourse flow
        selected_indices_chronological = sorted(selected_indices)
        extracted = [sentences[i] for i in selected_indices_chronological]
        summary_text = ' '.join(extracted)

        orig_words = len(raw_text.split())
        sum_words = len(summary_text.split())
        comp_ratio = max(0.0, 1.0 - (sum_words / max(1, orig_words)))

        return {
            'summary': summary_text,
            'original_words': orig_words,
            'summary_words': sum_words,
            'compression_ratio': round(comp_ratio, 3),
            'summary_method': 'Extractive TextRank (Chronological)'
        }
