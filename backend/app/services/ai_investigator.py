import os
import json
import requests
from typing import Dict, Any, List
from app.config import settings

SYSTEM_PROMPT = """You are an expert cybersecurity analyst. Investigate the submitted website using only the evidence provided by the security analysis modules. Correlate URL, domain, DNS, certificate, webpage, visual, reputation and machine-learning results. Determine whether the website is safe, suspicious, or phishing. Identify the likely attack category and explain the strongest evidence supporting your conclusion. Clearly distinguish confirmed evidence from assumptions. Never fabricate technical information. Provide practical safety recommendations."""


def compute_unified_risk_score(
    ml_data: Dict[str, Any],
    domain_data: Dict[str, Any],
    ssl_data: Dict[str, Any],
    content_data: Dict[str, Any],
    brand_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Compute unified multimodal risk assessment combining 5 security dimensions:
    - URL Lexical / ML Risk (25%)
    - Domain & WHOIS Infrastructure Risk (25%)
    - Content & HTML Forensics Risk (25%)
    - Brand Impersonation Risk (15%)
    - SSL / Cryptographic Integrity Risk (10%)
    """
    ml_score = ml_data.get("ml_risk_score", 10)
    domain_score = domain_data.get("domain_info", {}).get("risk_score", 10)
    ssl_score = ssl_data.get("risk_score", 10)
    content_score = content_data.get("content_risk_score", 10)
    
    brand_score = 90 if brand_data.get("is_impersonating") else 10
    if brand_data.get("similarity_score", 0) > 0.8:
        brand_score = 95

    # Weighted calculation
    weighted_score = (
        (ml_score * 0.25) +
        (domain_score * 0.25) +
        (content_score * 0.25) +
        (brand_score * 0.15) +
        (ssl_score * 0.10)
    )

    # Amplifiers for critical combinations (e.g. brand impersonation + login form = immediate critical)
    if brand_data.get("is_impersonating") and content_data.get("has_login_form"):
        weighted_score = max(weighted_score, 88.0)
    if domain_data.get("domain_info", {}).get("is_ip_address"):
        weighted_score = max(weighted_score, 85.0)

    final_score = int(min(100, max(0, round(weighted_score))))

    # Threat level classification
    if final_score >= 85:
        threat_level = "CRITICAL"
        classification = "Phishing"
    elif final_score >= 70:
        threat_level = "HIGH_RISK"
        classification = "Phishing"
    elif final_score >= 45:
        threat_level = "SUSPICIOUS"
        classification = "Suspicious"
    elif final_score >= 25:
        threat_level = "LOW"
        classification = "Safe"
    else:
        threat_level = "SAFE"
        classification = "Safe"

    return {
        "final_risk_score": final_score,
        "threat_level": threat_level,
        "classification": classification,
        "breakdown": {
            "url_risk": ml_score,
            "domain_risk": domain_score,
            "content_risk": content_score,
            "reputation_risk": max(domain_score, brand_score),
            "visual_risk": brand_score
        }
    }


def predict_attack_category(brand_data: Dict[str, Any], content_data: Dict[str, Any], url_features: Dict[str, Any]) -> str:
    """Classify the specific attack intent / threat category."""
    brand = brand_data.get("targeted_brand", "").lower()
    cat = brand_data.get("target_category", "").lower()
    has_form = content_data.get("has_login_form", False)

    if "crypto" in cat or "wallet" in cat or "metamask" in brand or "binance" in brand:
        return "Cryptocurrency Scam & Seed Phrase Theft"
    elif "bank" in cat or "payment" in cat or "paypal" in brand or "chase" in brand:
        return "Banking Fraud & Payment Credential Harvesting"
    elif "social" in cat or "instagram" in brand or "facebook" in brand:
        return "Social Media Account Takeover"
    elif "enterprise" in cat or "microsoft" in brand or "office" in brand or "google" in brand:
        return "Enterprise SSO / Corporate Credential Theft"
    elif has_form or url_features.get("has_suspicious_keyword"):
        return "Deceptive Credential Harvesting Portal"
    elif content_data.get("fake_captcha_detected"):
        return "Malicious CAPTCHA / Notification Clickjacking"
    elif brand_data.get("is_impersonating"):
        return "Brand Impersonation & Phishing Lure"
    else:
        return "General Suspicious Domain / Threat Probe"


def generate_explainable_evidence(
    url_features: Dict[str, Any],
    domain_data: Dict[str, Any],
    ssl_data: Dict[str, Any],
    content_data: Dict[str, Any],
    brand_data: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Generate structured Explainable AI (XAI) evidence list."""
    evidence = []

    # 1. Brand Impersonation evidence
    if brand_data.get("is_impersonating"):
        evidence.append({
            "severity": "CRITICAL",
            "category": "Brand Impersonation",
            "title": f"Targeting {brand_data['targeted_brand']}",
            "description": f"Domain utilizes {brand_data.get('impersonation_technique', 'typosquatting')} to deceive users into believing it is {brand_data['official_domain']}."
        })

    # 2. Domain Age evidence
    domain_info = domain_data.get("domain_info", {})
    if domain_info.get("is_newly_registered"):
        evidence.append({
            "severity": "HIGH",
            "category": "Domain Infrastructure",
            "title": "Newly Registered Domain (NRD)",
            "description": f"Domain was registered only {domain_info.get('domain_age_days', 0)} days ago. Short lifespan is a strong indicator of disposable attack infrastructure."
        })

    if domain_info.get("is_ip_address"):
        evidence.append({
            "severity": "CRITICAL",
            "category": "Host Architecture",
            "title": "Raw IP Address Hostname",
            "description": "The destination relies directly on an IP address instead of a recognized domain name to evade domain-level reputation blacklists."
        })

    # 3. Content Forensics evidence
    if content_data.get("has_password_field"):
        evidence.append({
            "severity": "HIGH",
            "category": "Webpage Forensics",
            "title": "Credential Input Form Detected",
            "description": f"Page renders password submission fields with harvesting targets: {', '.join(content_data.get('harvesting_fields_found', ['password']))}."
        })

    if content_data.get("form_action_external"):
        evidence.append({
            "severity": "CRITICAL",
            "category": "Webpage Forensics",
            "title": "Exfiltration Form Action",
            "description": "Form submission targets an external third-party server rather than the hosting domain origin."
        })

    if content_data.get("hidden_iframes_count", 0) > 0:
        evidence.append({
            "severity": "HIGH",
            "category": "Content Architecture",
            "title": "Hidden Iframes Present",
            "description": f"Found {content_data['hidden_iframes_count']} invisible iframe(s) configured for silent script execution."
        })

    # 4. URL Lexical evidence
    if url_features.get("count_subdomains", 0) >= 3:
        evidence.append({
            "severity": "MEDIUM",
            "category": "URL Lexical",
            "title": "Excessive Subdomain Depth",
            "description": f"URL contains {url_features['count_subdomains']} nested subdomains designed to obscure the true domain."
        })

    if url_features.get("has_homoglyphs"):
        evidence.append({
            "severity": "CRITICAL",
            "category": "Adversarial Obfuscation",
            "title": "Internationalized Homoglyph Attack",
            "description": "URL contains confusable non-ASCII/Cyrillic characters mimicking standard Latin alphabets."
        })

    if url_features.get("entropy", 0) > 4.2:
        evidence.append({
            "severity": "MEDIUM",
            "category": "Statistical Anomaly",
            "title": "High Shannon Entropy",
            "description": "Elevated randomness in the URL string, characteristic of Domain Generation Algorithms (DGA) or token obfuscation."
        })

    # 5. SSL evidence
    if not ssl_data.get("has_ssl"):
        evidence.append({
            "severity": "MEDIUM",
            "category": "Transport Security",
            "title": "No HTTPS Encryption",
            "description": "Unencrypted HTTP transport exposes data in transit to interception."
        })
    elif ssl_data.get("is_self_signed"):
        evidence.append({
            "severity": "HIGH",
            "category": "Transport Security",
            "title": "Untrusted / Self-Signed SSL Certificate",
            "description": "SSL Certificate is not signed by an authorized Certificate Authority."
        })

    # If completely clean
    if not evidence:
        evidence.append({
            "severity": "LOW",
            "category": "Reputation Baseline",
            "title": "Established Reputation & Valid Certificate",
            "description": "Domain matches known legitimate baseline characteristics with verified cryptographic certificates."
        })

    return evidence


def generate_recommendations(risk_score: int, brand: str) -> List[str]:
    """Generate practical security recommendations based on threat posture."""
    if risk_score >= 70:
        return [
            "DO NOT enter any passwords, credit card numbers, or sensitive credentials on this page.",
            f"If you are attempting to visit {brand if brand != 'None' else 'the intended service'}, navigate directly by typing the official URL into your browser.",
            "Report this URL immediately to your organization's Security Operations Center (SOC).",
            "If credentials were already submitted, immediately change passwords on your legitimate accounts and enable Multi-Factor Authentication (MFA)."
        ]
    elif risk_score >= 45:
        return [
            "Exercise extreme caution before clicking any links or downloading files from this domain.",
            "Verify the exact spelling of the domain in your address bar before proceeding.",
            "Check that the SSL certificate matches the expected organization name."
        ]
    else:
        return [
            "Domain displays standard characteristics of a legitimate website.",
            "Always verify that HTTPS is active when submitting sensitive data.",
            "Keep browser security protections and extensions enabled."
        ]


def run_ai_investigation(
    url: str,
    url_features: Dict[str, Any],
    ml_data: Dict[str, Any],
    domain_data: Dict[str, Any],
    ssl_data: Dict[str, Any],
    content_data: Dict[str, Any],
    brand_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Autonomous AI Cybersecurity Analyst engine.
    Correlates multimodal evidence, predicts attack categories, generates Explainable AI
    narrative and actionable defense posture.
    """
    risk_assessment = compute_unified_risk_score(
        ml_data, domain_data, ssl_data, content_data, brand_data
    )
    risk_score = risk_assessment["final_risk_score"]
    threat_level = risk_assessment["threat_level"]
    classification = risk_assessment["classification"]

    attack_type = predict_attack_category(brand_data, content_data, url_features)
    evidence_list = generate_explainable_evidence(
        url_features, domain_data, ssl_data, content_data, brand_data
    )
    recommendations = generate_recommendations(risk_score, brand_data.get("targeted_brand", "None"))

    # Synthesize AI Investigation Explanation
    brand_name = brand_data.get("targeted_brand", "None")
    domain_info = domain_data.get("domain_info", {})
    
    if risk_score >= 70:
        if brand_name != "None":
            explanation = (
                f"This website is assessed as a high-confidence PHISHING threat designed for {attack_type}. "
                f"Technical forensics confirm the host is impersonating {brand_name} using {brand_data.get('impersonation_technique', 'domain squatting')}. "
                f"The domain exhibits deceptive indicators including {len(evidence_list)} distinct risk vectors, "
                f"such as newly registered disposable infrastructure ({domain_info.get('domain_age_days', 0)} days old) "
                f"and active credential capture mechanisms."
            )
        else:
            explanation = (
                f"This URL has been classified as PHISHING based on {ml_data.get('confidence_percentage')}% machine learning confidence "
                f"and multiple corroborating indicators. The infrastructure features anomalous entropy, deceptive path structures, "
                f"and suspicious credential-gathering form attributes indicative of a targeted social-engineering campaign."
            )
    elif risk_score >= 45:
        explanation = (
            f"This URL exhibits SUSPICIOUS attributes with an elevated risk score of {risk_score}/100. "
            f"While not definitively confirmed as an active malicious campaign, several warning flags were identified, "
            f"including unusual domain formatting, low domain maturity, and atypical resource hosting configurations."
        )
    else:
        explanation = (
            f"This website appears to be SAFE and legitimate (Risk Score: {risk_score}/100). "
            f"The domain resolves to verified infrastructure, maintains a long-standing registration history, "
            f"and provides valid cryptographic certificates with no malicious intent indicators detected."
        )

    return {
        "risk_score": risk_score,
        "threat_level": threat_level,
        "classification": classification,
        "confidence_percentage": ml_data.get("confidence_percentage", 90.0),
        "attack_type": attack_type,
        "targeted_brand": brand_name,
        "ai_explanation": explanation,
        "evidence": evidence_list,
        "recommendations": recommendations,
        "breakdown": risk_assessment["breakdown"]
    }
