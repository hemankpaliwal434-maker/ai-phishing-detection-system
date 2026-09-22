import os
import sys
import json
import numpy as np
import joblib

# Ensure backend root is on sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from sklearn.preprocessing import StandardScaler

from app.services.feature_extractor import extract_feature_vector, FEATURE_NAMES
from ml.dataset import generate_synthetic_samples


def train_and_evaluate():
    print("[*] Generating dataset of legitimate and phishing URLs...")
    urls, labels = generate_synthetic_samples(num_samples_each=1200)
    print(f"[+] Total samples generated: {len(urls)} (Legitimate: {labels.count(0)}, Phishing: {labels.count(1)})")

    print("[*] Extracting 30+ feature vectors...")
    X = np.array([extract_feature_vector(u) for u in urls])
    y = np.array(labels)

    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    models = {
        "Random Forest": RandomForestClassifier(n_estimators=120, max_depth=16, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=6, random_state=42),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42)
    }

    results = {}
    best_model_name = None
    best_f1 = -1.0
    best_model_obj = None

    print("\n" + "="*60)
    print("            MODEL EVALUATION & BENCHMARKS")
    print("="*60)

    for name, clf in models.items():
        if name == "Logistic Regression":
            clf.fit(X_train_scaled, y_train)
            y_pred = clf.predict(X_test_scaled)
            y_prob = clf.predict_proba(X_test_scaled)[:, 1]
        else:
            clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)
            y_prob = clf.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_prob)
        cm = confusion_matrix(y_test, y_pred).tolist()

        results[name] = {
            "accuracy": round(float(acc) * 100, 2),
            "precision": round(float(prec) * 100, 2),
            "recall": round(float(rec) * 100, 2),
            "f1_score": round(float(f1) * 100, 2),
            "roc_auc": round(float(roc_auc) * 100, 2),
            "confusion_matrix": {
                "true_negative": cm[0][0],
                "false_positive": cm[0][1],
                "false_negative": cm[1][0],
                "true_positive": cm[1][1]
            }
        }

        print(f"\nModel: {name}")
        print(f"  Accuracy:  {results[name]['accuracy']}%")
        print(f"  Precision: {results[name]['precision']}%")
        print(f"  Recall:    {results[name]['recall']}%")
        print(f"  F1-Score:  {results[name]['f1_score']}%")
        print(f"  ROC-AUC:   {results[name]['roc_auc']}%")
        print(f"  Confusion Matrix: TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = clf

    # Extract feature importances from best model (Random Forest / Gradient Boosting)
    feature_importances = {}
    if hasattr(best_model_obj, "feature_importances_"):
        raw_importances = best_model_obj.feature_importances_
        sorted_indices = np.argsort(raw_importances)[::-1]
        for idx in sorted_indices:
            feat_name = FEATURE_NAMES[idx]
            feature_importances[feat_name] = round(float(raw_importances[idx]) * 100, 2)

    # Save artifacts
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)

    model_save_path = os.path.join(models_dir, "phishing_model.joblib")
    scaler_save_path = os.path.join(models_dir, "scaler.joblib")
    metrics_save_path = os.path.join(models_dir, "metrics.json")

    joblib.dump(best_model_obj, model_save_path)
    joblib.dump(scaler, scaler_save_path)

    metrics_payload = {
        "best_model": best_model_name,
        "feature_names": FEATURE_NAMES,
        "feature_importances": feature_importances,
        "models_benchmark": results,
        "dataset_summary": {
            "total_samples": len(urls),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "feature_count": len(FEATURE_NAMES)
        }
    }

    with open(metrics_save_path, "w") as f:
        json.dump(metrics_payload, f, indent=2)

    print("\n" + "="*60)
    print(f"[+] Best Model Selected: {best_model_name} (F1: {round(best_f1*100, 2)}%)")
    print(f"[+] Model saved to: {model_save_path}")
    print(f"[+] Metrics saved to: {metrics_save_path}")
    print("="*60)


if __name__ == "__main__":
    train_and_evaluate()
