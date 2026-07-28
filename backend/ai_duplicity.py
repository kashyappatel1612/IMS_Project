import json
import math
import numpy as np

# Global variables for model/vectorizer lazy loading
_sbert_model = None
_tfidf_vectorizer = None

def get_sbert_model():
    """Lazily loads SentenceTransformer if installed."""
    global _sbert_model
    if _sbert_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            print("[AI VECTOR EMBEDDINGS] Loading Sentence-BERT model ('all-MiniLM-L6-v2')...")
            _sbert_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("[AI VECTOR EMBEDDINGS] Sentence-BERT model loaded successfully!")
        except Exception as e:
            _sbert_model = False
    return _sbert_model if _sbert_model is not False else None

def combine_idea_text(title: str = "", category: str = "", problem_statement: str = "", description: str = "", proposedSolution: str = "") -> str:
    """Combines key textual content of an idea into a clean string for vector embedding."""
    parts = []
    if title and title.strip():
        parts.append(title.strip())
    if category and category.strip():
        parts.append(category.strip())
    if problem_statement and problem_statement.strip():
        parts.append(problem_statement.strip())
    if description and description.strip():
        parts.append(description.strip())
    if proposedSolution and proposedSolution.strip():
        parts.append(proposedSolution.strip())
    return " ".join(parts)

def generate_embedding(text: str) -> list:
    """
    Generates vector embedding for the input text using Sentence-BERT or TF-IDF Vectorizer.
    No manual stop-words used. Pure mathematical vector representation.
    """
    if not text or not text.strip():
        return []
    
    sbert = get_sbert_model()
    if sbert is not None:
        try:
            vec = sbert.encode(text, convert_to_numpy=True)
            return vec.tolist()
        except Exception as e:
            print(f"[AI EMBEDDING ERROR] SBERT failed: {e}")

    # Fallback to Scikit-Learn TF-IDF dense vector embeddings
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
        matrix = vectorizer.fit_transform([text])
        dense_vec = matrix.toarray()[0]
        return dense_vec.tolist()
    except Exception as e:
        print(f"[AI EMBEDDING ERROR] Vectorizer fallback error: {e}")
        return []

def cosine_similarity_vectors(vec1: list, vec2: list) -> float:
    """
    Calculates exact Cosine Similarity between two numeric vector embeddings:
    Cosine Similarity = (vec1 . vec2) / (||vec1|| * ||vec2||)
    """
    if not vec1 or not vec2:
        return 0.0
    
    try:
        a = np.array(vec1, dtype=np.float32)
        b = np.array(vec2, dtype=np.float32)
        
        # Pad vectors if dimensions differ due to TFIDF vocabulary size
        len1, len2 = len(a), len(b)
        if len1 != len2:
            max_len = max(len1, len2)
            a = np.pad(a, (0, max_len - len1))
            b = np.pad(b, (0, max_len - len2))
            
        dot = np.dot(a, b)
        norm = np.linalg.norm(a) * np.linalg.norm(b)
        return float(dot / norm) if norm > 0 else 0.0
    except Exception as e:
        print(f"[COSINE SIMILARITY ERROR] {e}")
        return 0.0

def compare_idea_texts_directly(text1: str, text2: str) -> float:
    """
    Computes direct Cosine Similarity between two texts using Scikit-Learn TF-IDF.
    No manual stop-words required.
    """
    if not text1.strip() or not text2.strip():
        return 0.0
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        dense = tfidf_matrix.toarray()
        return cosine_similarity_vectors(dense[0], dense[1])
    except Exception as e:
        print(f"[TEXT SIMILARITY ERROR] {e}")
        return 0.0

def check_duplicity(new_idea: dict, existing_ideas: list) -> dict:
    """
    Compares an idea against all stored ideas in the database using vector embeddings.
    """
    target_id = new_idea.get("id") or new_idea.get("ideaId") or new_idea.get("idea_id")
    
    new_text = combine_idea_text(
        title=new_idea.get("title", ""),
        category=new_idea.get("category", ""),
        problem_statement=new_idea.get("problemStatement", "") or new_idea.get("problem_statement", ""),
        description=new_idea.get("description", ""),
        proposedSolution=new_idea.get("proposedSolution", "") or new_idea.get("proposed_solution", "")
    )
    
    new_vec = new_idea.get("embeddingVector") or new_idea.get("embedding_vector")
    if isinstance(new_vec, str) and new_vec.strip():
        try:
            new_vec = json.loads(new_vec)
        except Exception:
            new_vec = []
            
    if not new_vec:
        new_vec = generate_embedding(new_text)
        
    matches = []
    
    for idea in existing_ideas:
        ext_id = idea.get("id") or idea.get("ideaId") or idea.get("idea_id")
        
        # Skip self-comparison
        if target_id is not None and ext_id is not None and str(target_id) == str(ext_id):
            continue
            
        ext_text = combine_idea_text(
            title=idea.get("title", ""),
            category=idea.get("category", ""),
            problem_statement=idea.get("problemStatement", "") or idea.get("problem_statement", ""),
            description=idea.get("description", ""),
            proposedSolution=idea.get("proposedSolution", "") or idea.get("proposed_solution", "")
        )
        
        existing_vec = idea.get("embeddingVector") or idea.get("embedding_vector")
        if isinstance(existing_vec, str) and existing_vec.strip():
            try:
                existing_vec = json.loads(existing_vec)
            except Exception:
                existing_vec = []
                
        sim_score = 0.0
        
        if new_vec and existing_vec and len(new_vec) == len(existing_vec):
            sim_score = cosine_similarity_vectors(new_vec, existing_vec)
        else:
            sim_score = compare_idea_texts_directly(new_text, ext_text)
            
        sim_percent = round(sim_score * 100, 2)
        
        if sim_percent > 0:
            matches.append({
                "idea_id": ext_id,
                "title": idea.get("title"),
                "author": idea.get("author", "User"),
                "category": idea.get("category"),
                "similarity_score": sim_percent
            })
            
    matches.sort(key=lambda x: x["similarity_score"], reverse=True)
    
    top_match = matches[0] if matches else None
    max_score = top_match["similarity_score"] if top_match else 0.0
    
    if max_score >= 85.0:
        status = "Duplicate Detected (Initial Screening Rejected)"
        is_dup = True
    elif max_score >= 65.0:
        status = "Possible Duplicate (Review Required)"
        is_dup = True
    elif max_score > 0.0:
        status = "Initial Screening Passed (Unique Idea)"
        is_dup = False
    else:
        status = "No Duplicate Matches (0.0% Match)"
        is_dup = False
        
    return {
        "new_embedding": new_vec,
        "is_duplicate": is_dup,
        "max_similarity_score": max_score,
        "duplicity_status": status,
        "matched_idea": top_match,
        "matches": matches[:5]
    }
