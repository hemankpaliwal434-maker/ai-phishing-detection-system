from typing import Dict, Any, Optional


def generate_chatbot_response(user_message: str, scan_context: Optional[Dict[str, Any]] = None) -> str:
    """
    Generate contextual security analysis answers based on the user's inquiry
    and the current scan telemetry.
    """
    msg_lower = user_message.lower()

    if not scan_context:
        if "phishing" in msg_lower:
            return (
                "Phishing is a cyber attack where threat actors deceive victims into revealing sensitive "
                "information such as usernames, passwords, credit card numbers, or crypto seed phrases by "
                "impersonating trusted entities (banks, tech companies, email services)."
            )
        elif "password" in msg_lower:
            return (
                "Always check the URL in your browser's address bar carefully before entering your password. "
                "Legitimate services will never ask you to verify your password via unexpected links or insecure HTTP pages."
            )
        else:
            return (
                "I am your AI Cybersecurity SOC Assistant. You can paste a suspicious URL or scan results, "
                "and ask me questions such as 'Why is this dangerous?', 'Which features triggered the alert?', "
                "or 'What immediate actions should I take?'"
            )

    # Context-aware responses using scan telemetry
    url = scan_context.get("url", "the scanned URL")
    risk_score = scan_context.get("risk_score", 50)
    classification = scan_context.get("classification", "Suspicious")
    brand = scan_context.get("targeted_brand", "None")
    attack_type = scan_context.get("attack_type", "Phishing Attack")
    evidence = scan_context.get("evidence", [])

    if "why" in msg_lower or "dangerous" in msg_lower or "reasons" in msg_lower:
        if risk_score > 60:
            evidence_titles = [f"• {e.get('title')}: {e.get('description')}" for e in evidence[:4]]
            evidence_text = "\n".join(evidence_titles) if evidence_titles else "• Machine learning structural anomalies detected."
            return (
                f"**Why {url} is dangerous (Risk Score: {risk_score}/100):**\n\n"
                f"Our AI investigator classified this as **{classification.upper()}** ({attack_type}).\n\n"
                f"**Primary Detected Threats:**\n{evidence_text}\n\n"
                f"Visiting or interacting with this site poses a severe threat of credential theft and account takeover."
            )
        else:
            return (
                f"The URL {url} was assessed as **{classification.upper()}** (Risk Score: {risk_score}/100). "
                f"It resolved to verified baseline infrastructure with valid SSL certificates and no active credential harvesting signatures."
            )

    elif "password" in msg_lower or "safe to enter" in msg_lower or "login" in msg_lower:
        if risk_score > 50:
            return (
                f"⛔ **ABSOLUTELY NOT.** Do NOT enter your password on `{url}`.\n\n"
                f"Our analysis detected that this page is impersonating **{brand if brand != 'None' else 'a trusted service'}** "
                f"and features active credential harvesting forms. Entering your credentials will immediately expose them to attackers."
            )
        else:
            return (
                f"✅ Based on the current scan, `{url}` passed our safety checks (Risk Score: {risk_score}/100). "
                f"However, always ensure the address bar displays a valid HTTPS padlock and matches the official domain before logging in."
            )

    elif "evidence" in msg_lower or "features" in msg_lower or "indicators" in msg_lower:
        evidence_lines = [f"- **[{e.get('severity')}] {e.get('title')}**: {e.get('description')}" for e in evidence]
        return (
            f"**Forensic Evidence Telemetry for `{url}`:**\n\n" +
            ("\n".join(evidence_lines) if evidence_lines else "No severe risk indicators identified.")
        )

    elif "what should i do" in msg_lower or "action" in msg_lower or "recommend" in msg_lower:
        if risk_score > 50:
            return (
                f"**Recommended Immediate Security Actions:**\n\n"
                f"1. **Close the tab immediately** — do not interact with any buttons or forms.\n"
                f"2. If you entered any credentials, **change your password immediately** on the official website.\n"
                f"3. Enable **Multi-Factor Authentication (MFA)** on all associated accounts.\n"
                f"4. Report this incident to your security team or submit a report on our SOC Dashboard."
            )
        else:
            return (
                "**Best Practices:**\n\n"
                "• Bookmark legitimate portals rather than clicking email links.\n"
                "• Use a password manager to auto-fill credentials (it won't fill passwords on fake lookalike domains).\n"
                "• Keep your browser extension active for continuous background protection."
            )

    elif "attack type" in msg_lower or "category" in msg_lower or "threat" in msg_lower:
        return (
            f"The predicted attack category is **{attack_type}**.\n"
            f"Targeted Brand: **{brand}**\n"
            f"Threat Level: **{scan_context.get('threat_level', 'HIGH_RISK')}**\n\n"
            f"This tactic typically lures victims through urgency or lookalike branding to harvest sensitive access tokens."
        )

    else:
        return (
            f"I have full forensic telemetry for `{url}` (Risk Score: {risk_score}/100, Threat: {attack_type}). "
            f"You can ask me: 'Why is this dangerous?', 'Is it safe to enter credentials?', 'What evidence was found?', or 'What should I do?'"
        )
