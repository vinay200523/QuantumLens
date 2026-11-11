import numpy as np
import scipy.sparse as sp
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Tuple, Optional

class TfidfFeatureExtractor:
    def __init__(self, ngram_range: Tuple[int, int] = (1, 2), max_df: float = 0.85, min_df: int = 1):
        self.ngram_range = ngram_range
        self.max_df = max_df
        self.min_df = min_df
        self.vectorizer = TfidfVectorizer(
            ngram_range=ngram_range,
            max_df=max_df,
            min_df=min_df,
            sublinear_tf=True,
            norm='l2'
        )
        self.feature_names: Optional[np.ndarray] = None
        self.tfidf_matrix: Optional[sp.csr_matrix] = None

    def fit_transform(self, corpus_clean_texts: List[str]) -> sp.csr_matrix:
        # Small corpora (<= 5 docs) should not use strict max_df to prevent empty vocabulary
        effective_max_df = 1.0 if len(corpus_clean_texts) <= 5 else self.max_df
        self.vectorizer.set_params(max_df=effective_max_df)
        try:
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus_clean_texts)
        except ValueError:
            # Fallback if vocabulary was empty: relaxed unigram vectorizer
            try:
                fallback_vec = TfidfVectorizer(ngram_range=(1, 1), min_df=1, max_df=1.0, sublinear_tf=True, norm='l2')
                self.tfidf_matrix = fallback_vec.fit_transform(corpus_clean_texts)
                self.vectorizer = fallback_vec
            except ValueError:
                # If clean_texts were completely empty, fall back on safe tokens
                fallback_vec = TfidfVectorizer(ngram_range=(1, 1), min_df=1, max_df=1.0)
                safe_texts = [txt if txt.strip() else f"document_{i}" for i, txt in enumerate(corpus_clean_texts)]
                self.tfidf_matrix = fallback_vec.fit_transform(safe_texts)
                self.vectorizer = fallback_vec

        self.feature_names = np.array(self.vectorizer.get_feature_names_out())
        return self.tfidf_matrix

    def transform(self, clean_texts: List[str]) -> sp.csr_matrix:
        return self.vectorizer.transform(clean_texts)

    def get_top_features_for_doc(self, doc_idx: int, top_n: int = 8) -> List[Tuple[str, float]]:
        if self.tfidf_matrix is None or doc_idx >= self.tfidf_matrix.shape[0]:
            return []
        row = self.tfidf_matrix.getrow(doc_idx)
        if row.nnz == 0:
            return []
        col_indices = row.indices
        weights = row.data
        sorted_order = np.argsort(weights)[::-1][:top_n]
        return [(str(self.feature_names[col_indices[i]]), float(weights[i])) for i in sorted_order]
