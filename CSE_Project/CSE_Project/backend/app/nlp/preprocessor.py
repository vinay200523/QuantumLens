import re
import hashlib
from typing import List, Tuple, Set

STANDARD_STOPWORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any',
    'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between',
    'both', 'but', 'by', 'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down',
    'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having',
    'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if',
    'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my',
    'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or',
    'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she',
    'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
    'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to',
    'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where',
    'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours',
    'yourself', 'yourselves', 'also', 'said', 'new', 'one', 'two', 'using', 'used'
}

class SimpleLemmatizerFallback:
    def lemmatize(self, word: str, pos: str = 'n') -> str:
        if word.endswith('ies') and len(word) > 4:
            return word[:-3] + 'y'
        elif word.endswith('s') and not word.endswith('ss') and len(word) > 3:
            return word[:-1]
        return word

LEMMATIZER = SimpleLemmatizerFallback()
STOPWORDS_SET = STANDARD_STOPWORDS

try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.stem import WordNetLemmatizer
    STOPWORDS_SET = set(stopwords.words('english')).union(STANDARD_STOPWORDS)
    wnl = WordNetLemmatizer()
    wnl.lemmatize('qubits')
    LEMMATIZER = wnl
except Exception:
    pass

class NLPPreprocessor:
    def __init__(self, stopwords_set: Set[str] = STOPWORDS_SET, lemmatizer=LEMMATIZER):
        self.stopwords = stopwords_set
        self.lemmatizer = lemmatizer

    def strip_html_and_markup(self, text: str) -> str:
        return re.sub(r'<[^>]+>', ' ', text)

    def normalize_whitespace(self, text: str) -> str:
        return re.sub(r'\s+', ' ', text).strip()

    def tokenize(self, text: str) -> List[str]:
        cleaned = self.strip_html_and_markup(text)
        return re.findall(r'\b[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*\b', cleaned.lower())

    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        return [t for t in tokens if t not in self.stopwords and len(t) > 1]

    def lemmatize(self, tokens: List[str]) -> List[str]:
        return [self.lemmatizer.lemmatize(t) for t in tokens]

    def preprocess_document(self, raw_text: str) -> Tuple[str, List[str], str]:
        raw_preserved = self.normalize_whitespace(self.strip_html_and_markup(raw_text))
        tokens = self.tokenize(raw_preserved)
        filtered_tokens = self.remove_stopwords(tokens)
        lemmatized_tokens = self.lemmatize(filtered_tokens)
        cleaned_text = ' '.join(lemmatized_tokens)
        return raw_preserved, lemmatized_tokens, cleaned_text

    @staticmethod
    def compute_text_hash(text: str) -> str:
        normalized = re.sub(r'\s+', ' ', text.lower().strip())
        return hashlib.md5(normalized.encode('utf-8')).hexdigest()
