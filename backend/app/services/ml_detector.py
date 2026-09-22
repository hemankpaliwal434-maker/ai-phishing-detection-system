import os
import joblib
import numpy as np
from typing import Dict, Any, Tuple
from app.services.feature_extractor import extract_feature_vector, FEATURE_NAMES

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models", "phishing_model.joblib")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models", "scaler.joblib")

_model = None
_scaler = None


def load_ml_model():
    """Lazy load serialized ML model and scaler."""
    global _model, _scaler
    if _model is None and os.path.exists(MODEL_PATH):
        try:
            _model = joblib.load(MODEL_PATH)
            if os.path.exists(SCALER_PATH):
                _scaler = joblib.load(SCALER_PATH)
        except Exception as e:
            print(f"[!] Warning: Could not load ML model: {e}")
    return _model, _scaler


def predict_url_phishing(url: str, raw_features: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run Machine Learning inference on the URL.
    Returns prediction ('Safe', 'Suspicious', 'Phishing'), probability, confidence,
    and top contributing features.
    """
    feature_vector = extract_feature_vector(url)
    model, scaler = load_ml_model()

    if model is not None:
        try:
            X = np.array([feature_vector])
            # Check if model has predict_proba
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(X)[0]
                phish_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
            else:
                pred = model.predict(X)[0]
                phish_prob = 0.95 if pred == 1 else 0.05
        except Exception as e:
            print(f"[!] Model inference fallback error: {e}")
            phish_prob = _heuristic_ml_fallback(feature_vector, raw_features)
    else:
        phish_prob = _heuristic_ml_fallback(feature_vector, raw_features)

    # Classification thresholding
    if phish_prob >= 0.70:
        classification = "Phishing"
        confidence = round(phish_prob * 100, 1)
    elif phish_prob >= 0.35:
        classification = "Suspicious"
        confidence = round(phish_prob * 100, 1)
    else:
        classification = "Safe"
        confidence = round((1.0 - phish_prob) * 100, 1)

    # Calculate feature contributions for Explainable AI
    feature_contributions = []
    for idx, name in enumerate(FEATURE_NAMES):
        val = feature_vector[idx]
        weight = 1.0
        if name in ["has_ip_address", "has_homoglyphs", "brand_in_subdomain", "has_at_symbol_trick"]:
            weight = 3.5
        elif name in ["is_suspicious_tld", "has_double_slash_redirect", "tld_in_subdomain"]:
            weight = 2.5
        elif name in ["has_suspicious_keyword", "is_shortened"]:
            weight = 2.0

        if val > 0:
            feature_contributions.append({
                "feature": name,
                "value": val,
                "impact": round(val * weight, 2)
            })

    feature_contributions.sort(key=lambda x: x["impact"], reverse=True)

    return {
        "classification": classification,
        "phishing_probability": round(phish_prob, 4),
        "confidence_percentage": confidence,
        "ml_risk_score": int(round(phish_prob * 100)),
        "top_contributing_features": feature_contributions[:6]
    }


def _heuristic_ml_fallback(feat: list, raw: Dict[str, Any] = None) -> float:
    """Robust fallback heuristic engine if model file has not yet been compiled."""
    score = 0.0
    # feat mapping: 15=has_ip, 16=is_https, 17=has_susp_kw, 19=is_shortened, 21=entropy, 22=homoglyphs, 25=brand_in_sub, 26=is_susp_tld
    if len(feat) >= 27:
        if feat[15] == 1: score += 0.40 # IP host
        if feat[16] == 0: score += 0.15 # No HTTPS
        if feat[17] == 1: score += 0.25 # Suspicious KW
        if feat[19] == 1: score += 0.15 # Shortener
        if feat[21] > 4.2: score += 0.20 # High entropy
        if feat[22] == 1: score += 0.50 # Homoglyph
        if feat[24] == 1: score += 0.35 # TLD in subdomain
        if feat[25] == 1: score += 0.45 # Brand in subdomain
        if feat[26] == 1: score += 0.25 # Suspicious TLD
        if feat[0] > 75: score += 0.15   # URL length > 75
        if feat[4] >= 3: score += 0.20   # Dots >= 3
    return min(0.99, max(0.01, score))
