import os
import sys

# Ensure backend root is on sys.path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.services.feature_extractor import extract_url_features, extract_feature_vector
from app.services.ml_detector import predict_url_phishing
from app.services.domain_analyzer import analyze_domain_and_dns
from app.services.ssl_analyzer import inspect_ssl_certificate
from app.services.content_analyzer import analyze_webpage_content
from app.services.brand_detector import detect_brand_impersonation
from app.services.email_analyzer import analyze_email_message
from app.services.threat_graph import build_threat_graph
from app.services.ai_investigator import run_ai_investigation
from app.services.pdf_generator import generate_security_investigation_pdf


def run_tests():
    print("[*] Starting Automated Verification Test Suite...\n")

    # Test 1: Feature Extraction
    test_phish_url = "http://secure-paypal-login-account-update.xyz/webscr?cmd=login_submit"
    print(f"[+] Test 1: Extracting 30+ features for: {test_phish_url}")
    feat = extract_url_features(test_phish_url)
    assert feat["url_length"] > 30, "URL length should be > 30"
    assert feat["has_suspicious_keyword"] == 1, "Suspicious keyword should be detected"
    assert feat["is_suspicious_tld"] == 1, "Suspicious TLD (.xyz) should be detected"
    print("    -> Feature extraction verified successfully.")

    # Test 2: Machine Learning Prediction
    print(f"\n[+] Test 2: ML Model Inference on: {test_phish_url}")
    ml_res = predict_url_phishing(test_phish_url, feat)
    print(f"    -> Classification: {ml_res['classification']}, Confidence: {ml_res['confidence_percentage']}%, Risk: {ml_res['ml_risk_score']}/100")
    assert ml_res["classification"] in ["Suspicious", "Phishing"], "Should be flagged by ML"

    # Test 3: Domain & DNS Inspection
    print(f"\n[+] Test 3: Domain & DNS Inspection")
    domain_res = analyze_domain_and_dns(feat["parsed_hostname"])
    print(f"    -> Domain: {domain_res['domain_info']['domain']}, NRD: {domain_res['domain_info']['is_newly_registered']}, Age: {domain_res['domain_info']['domain_age_days']} days")

    # Test 4: SSL Inspection
    print(f"\n[+] Test 4: SSL Inspection")
    ssl_res = inspect_ssl_certificate(feat["parsed_hostname"], is_https=(feat["is_https"] == 1))
    print(f"    -> Issuer: {ssl_res['issuer']}, Has SSL: {ssl_res['has_ssl']}")

    # Test 5: Brand Impersonation Engine
    print(f"\n[+] Test 5: Brand Impersonation Detection")
    brand_res = detect_brand_impersonation(feat["parsed_hostname"], test_phish_url)
    print(f"    -> Impersonating: {brand_res['is_impersonating']}, Targeted Brand: {brand_res['targeted_brand']}, Tech: {brand_res['impersonation_technique']}")
    assert brand_res["targeted_brand"] == "PayPal", "Should detect PayPal impersonation"

    # Test 6: AI Cybersecurity Investigator & Unified Risk Engine
    print(f"\n[+] Test 6: Autonomous AI SOC Investigator Correlation")
    content_res = analyze_webpage_content(test_phish_url, is_safe_mode=True)
    ai_inv = run_ai_investigation(test_phish_url, feat, ml_res, domain_res, ssl_res, content_res, brand_res)
    print(f"    -> Final Risk Score: {ai_inv['risk_score']}/100, Threat Level: {ai_inv['threat_level']}")
    print(f"    -> Attack Category: {ai_inv['attack_type']}")
    print(f"    -> Evidence Count: {len(ai_inv['evidence'])}")
    assert ai_inv["risk_score"] >= 70, "Phishing risk score should be >= 70"

    # Test 7: Email & SMS Phishing Analyzer
    print(f"\n[+] Test 7: Email Phishing NLP Analyzer")
    email_res = analyze_email_message(
        sender="security@service-verify-paypal.com",
        subject="URGENT: Your account has been suspended within 24 hours!",
        body="Click here http://secure-paypal-login-account-update.xyz to verify your credentials."
    )
    print(f"    -> Email Verdict: {email_res['verdict']}, Risk: {email_res['risk_score']}/100, Urgency: {email_res['urgency_detected']}")
    assert email_res["urgency_detected"] is True, "Urgency triggers should be caught"

    # Test 8: Threat Graph Builder
    print(f"\n[+] Test 8: Threat Graph Generation")
    graph = build_threat_graph(test_phish_url, domain_res, ssl_res, content_res, brand_res, ai_inv["risk_score"])
    print(f"    -> Nodes: {len(graph['nodes'])}, Edges: {len(graph['edges'])}")
    assert len(graph["nodes"]) >= 5, "Graph should have at least 5 nodes"

    # Test 9: PDF Report Generation
    print(f"\n[+] Test 9: PDF Security Report Compilation")
    pdf_payload = {
        "url": test_phish_url,
        "risk_score": ai_inv["risk_score"],
        "threat_level": ai_inv["threat_level"],
        "classification": ai_inv["classification"],
        "confidence_percentage": ai_inv["confidence_percentage"],
        "attack_type": ai_inv["attack_type"],
        "targeted_brand": brand_res["targeted_brand"],
        "ai_explanation": ai_inv["ai_explanation"],
        "evidence": ai_inv["evidence"],
        "recommendations": ai_inv["recommendations"],
        "breakdown": ai_inv["breakdown"]
    }
    pdf_bytes = generate_security_investigation_pdf(pdf_payload)
    print(f"    -> PDF compiled successfully ({len(pdf_bytes)} bytes)")
    assert len(pdf_bytes) > 1000, "PDF should contain valid binary stream"

    print("\n" + "="*60)
    print("  ALL 9 AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY!  ")
    print("="*60)


if __name__ == "__main__":
    run_tests()
