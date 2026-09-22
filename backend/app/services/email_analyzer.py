import re
from typing import Dict, Any, List
from app.services.brand_detector import detect_brand_impersonation

URGENCY_KEYWORDS = [
    "immediately", "urgent", "suspended", "suspension", "within 24 hours", "locked",
    "unauthorized access", "terminate", "action required", "compromised", "verify now",
    "limited time", "final notice", "security alert", "tax refund", "prize winner"
]

CREDENTIAL_LURE_KEYWORDS = [
    "password", "credentials", "pin", "ssn", "social security", "credit card",
    "banking details", "seed phrase", "secret key", "one-time password", "otp"
]


def extract_urls_from_text(text: str) -> List[str]:
    """Extract URLs from message text."""
    url_pattern = r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[^\s]*'
    return re.findall(url_pattern, text)


def analyze_email_message(sender: str, subject: str, body: str) -> Dict[str, Any]:
    """
    Analyze email/SMS message for social engineering, sender spoofing,
    urgency tactics, and malicious links.
    """
    combined_text = f"{subject} {body}".lower()
    
    # 1. Detect Urgency / Coercion Tactics
    urgency_matches = [kw for kw in URGENCY_KEYWORDS if kw in combined_text]
    has_urgency = len(urgency_matches) > 0

    # 2. Detect Credential Request / Phishing Lures
    lure_matches = [kw for kw in CREDENTIAL_LURE_KEYWORDS if kw in combined_text]
    has_lure = len(lure_matches) > 0

    # 3. Extract links
    embedded_urls = extract_urls_from_text(body)

    # 4. Check Sender Domain Spoofing
    sender_domain = ""
    sender_spoofed = False
    sender_flags = []
    
    if "@" in sender:
        sender_domain = sender.split("@")[-1].strip().lower()
        # Check if sender claims to be a brand on a free or mismatch domain
        brand_check = detect_brand_impersonation(sender_domain)
        if brand_check["is_impersonating"]:
            sender_spoofed = True
            sender_flags.append(f"Sender address domain '{sender_domain}' impersonates brand: {brand_check['targeted_brand']}")
        elif any(free in sender_domain for free in ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]):
            if any(brand in subject.lower() for brand in ["paypal", "chase", "bank", "microsoft", "apple", "netflix"]):
                sender_spoofed = True
                sender_flags.append(f"Enterprise notice sent from public free webmail provider (@{sender_domain})")

    # 5. Compute Risk Score
    risk_score = 15
    if has_urgency:
        risk_score += 25
    if has_lure:
        risk_score += 25
    if sender_spoofed:
        risk_score += 30
    if embedded_urls:
        risk_score += 15

    risk_score = min(100, max(5, risk_score))

    if risk_score >= 70:
        threat_level = "HIGH_RISK"
        verdict = "Phishing Email"
    elif risk_score >= 40:
        threat_level = "SUSPICIOUS"
        verdict = "Suspicious Email"
    else:
        threat_level = "SAFE"
        verdict = "Likely Legitimate"

    return {
        "verdict": verdict,
        "threat_level": threat_level,
        "risk_score": risk_score,
        "urgency_detected": has_urgency,
        "urgency_triggers": urgency_matches,
        "credential_harvesting_detected": has_lure,
        "credential_triggers": lure_matches,
        "sender_spoofed": sender_spoofed,
        "sender_flags": sender_flags,
        "extracted_urls": embedded_urls,
        "social_engineering_tactics": [
            "Fear of account loss / suspension",
            "Artificial time constraint pressure",
            "Deceptive authority impersonation"
        ] if has_urgency else ["Normal informative context"]
    }
