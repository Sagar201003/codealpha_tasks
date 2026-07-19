"""
FAQ Chatbot NLP Engine (Python Implementation)
----------------------------------------------
Demonstrates text preprocessing, TF-IDF vectorization, and Cosine Similarity
matching for FAQ retrieval using Python scikit-learn & NLTK.

Usage:
    python nlp_engine.py
"""

import json
import re
from typing import Dict, List, Tuple

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    print("scikit-learn is required. Install via: pip install scikit-learn")
    exit(1)


def preprocess_text(text: str) -> str:
    """Clean text by lowercasing, removing punctuation and special characters."""
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


class FAQChatbotNLP:

    def __init__(self, faqs_path: str = "faqs.json"):
        with open(faqs_path, "r", encoding="utf-8") as f:
            self.faqs = json.load(f)

        # Preprocess FAQ questions and tags for better matching index
        self.documents = [
            f"{preprocess_text(faq['question'])} {' '.join(faq.get('tags', []))}"
            for faq in self.faqs
        ]

        # Initialize TF-IDF Vectorizer
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.tfidf_matrix = self.vectorizer.fit_transform(self.documents)

    def find_best_match(
        self, user_query: str, threshold: float = 0.25
    ) -> Tuple[Dict, float]:
        """Process user query, calculate cosine similarity against FAQs, and return best match."""
        cleaned_query = preprocess_text(user_query)
        if not cleaned_query:
            return None, 0.0

        query_vector = self.vectorizer.transform([cleaned_query])
        similarities = cosine_similarity(query_vector, self.tfidf_matrix)[0]

        best_idx = similarities.argmax()
        best_score = float(similarities[best_idx])

        if best_score >= threshold:
            return self.faqs[best_idx], best_score
        else:
            return None, best_score


if __name__ == "__main__":
    print("=" * 60)
    print("🤖 Intelligent FAQ Chatbot Engine (Python CLI Mode)")
    print("=" * 60)
    print("Type your question below (or type 'exit' to quit).\n")

    bot = FAQChatbotNLP("faqs.json")

    while True:
        try:
            user_input = input("You: ")
            if user_input.strip().lower() in ["exit", "quit", "q"]:
                print("Goodbye!")
                break

            match, confidence = bot.find_best_match(user_input)

            if match:
                print(
                    f"\n🤖 Bot ({confidence*100:.1f}% confidence - Category: {match['category']}):"
                )
                print(f"   Q: {match['question']}")
                print(f"   A: {match['answer']}\n")
            else:
                print(
                    f"\n🤖 Bot ({confidence*100:.1f}% confidence - Low Match):"
                )
                print(
                    "   I'm sorry, I couldn't find a confident answer for that question."
                )
                print(
                    "   Please try rephrasing or contact support at support@example.com.\n"
                )
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye!")
            break
