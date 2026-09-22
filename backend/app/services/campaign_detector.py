from typing import Dict, Any, List

KNOWN_CAMPAIGNS = [
    {
        "id": "CAMP-2026-081",
        "name": "Operation ShadowBank",
        "target_brand": "Chase Bank",
        "target_category": "Banking / Finance",
        "threat_actor": "Storm-0982 (FIN-Cluster)",
        "tactics": "Subdomain combo-squatting, fake 2FA OTP collection, Russian bulletproof hosting",
        "domains_count": 48,
        "risk_level": "CRITICAL"
    },
    {
        "id": "CAMP-2026-042",
        "name": "PhantomWallet Heist",
        "target_brand": "MetaMask",
        "target_category": "Web3 / Crypto Wallet",
        "threat_actor": "Scam-Club Lazarus Affiliate",
        "tactics": "Seed phrase harvesting, fake sync modal, Base64 obfuscated payload delivery",
        "domains_count": 89,
        "risk_level": "CRITICAL"
    },
    {
        "id": "CAMP-2026-019",
        "name": "CloudHarvest 365",
        "target_brand": "Microsoft",
        "target_category": "Enterprise / Email",
        "threat_actor": "Midnight Blizzard Clone",
        "tactics": "Reverse-proxy AiTM (Adversary-in-the-Middle) session cookie hijacking",
        "domains_count": 134,
        "risk_level": "HIGH_RISK"
    },
    {
        "id": "CAMP-2026-099",
        "name": "PayDeceit Global",
        "target_brand": "PayPal",
        "target_category": "Payment / Fintech",
        "threat_actor": "Unknown PhishKit Ring",
        "tactics": "Typo-squatting domains (.xyz, .top), credit card verification page impersonation",
        "domains_count": 62,
        "risk_level": "HIGH_RISK"
    }
]


def detect_campaign_cluster(brand: str, domain_info: Dict[str, Any], dns_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Cluster the investigated URL against known threat campaigns.
    """
    for camp in KNOWN_CAMPAIGNS:
        if brand.lower() in camp["target_brand"].lower() or camp["target_brand"].lower() in brand.lower():
            return {
                "matched": True,
                "campaign_id": camp["id"],
                "campaign_name": camp["name"],
                "threat_actor": camp["threat_actor"],
                "tactics": camp["tactics"],
                "active_cluster_domains": camp["domains_count"],
                "campaign_risk": camp["risk_level"]
            }

    # If newly identified cluster
    if brand != "None":
        return {
            "matched": True,
            "campaign_id": "CAMP-2026-GEN-01",
            "campaign_name": f"Emerging {brand} Impersonation Cluster",
            "threat_actor": "Uncategorized Threat Group",
            "tactics": "Targeted brand credential harvesting, disposable registrar infrastructure",
            "active_cluster_domains": 12,
            "campaign_risk": "HIGH_RISK"
        }

    return {
        "matched": False,
        "campaign_id": "N/A",
        "campaign_name": "Isolated Incident",
        "threat_actor": "Unknown",
        "tactics": "Generic probing",
        "active_cluster_domains": 1,
        "campaign_risk": "LOW"
    }
