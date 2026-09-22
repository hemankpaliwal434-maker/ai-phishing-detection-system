import re
from typing import Dict, Any, Optional, Tuple

TARGET_BRANDS = {
    "paypal": {"name": "PayPal", "domain": "paypal.com", "category": "Payment / Fintech"},
    "google": {"name": "Google", "domain": "google.com", "category": "Technology / SSO"},
    "microsoft": {"name": "Microsoft", "domain": "microsoft.com", "category": "Enterprise / Cloud"},
    "apple": {"name": "Apple", "domain": "apple.com", "category": "Technology / ID"},
    "amazon": {"name": "Amazon", "domain": "amazon.com", "category": "E-Commerce"},
    "netflix": {"name": "Netflix", "domain": "netflix.com", "category": "Streaming / Entertainment"},
    "chase": {"name": "Chase Bank", "domain": "chase.com", "category": "Banking / Finance"},
    "bankofamerica": {"name": "Bank of America", "domain": "bankofamerica.com", "category": "Banking / Finance"},
    "wellsfargo": {"name": "Wells Fargo", "domain": "wellsfargo.com", "category": "Banking / Finance"},
    "citibank": {"name": "CitiBank", "domain": "citi.com", "category": "Banking / Finance"},
    "binance": {"name": "Binance", "domain": "binance.com", "category": "Cryptocurrency"},
    "coinbase": {"name": "Coinbase", "domain": "coinbase.com", "category": "Cryptocurrency"},
    "metamask": {"name": "MetaMask", "domain": "metamask.io", "category": "Web3 / Crypto Wallet"},
    "steam": {"name": "Steam", "domain": "steampowered.com", "category": "Gaming"},
    "instagram": {"name": "Instagram", "domain": "instagram.com", "category": "Social Media"},
    "facebook": {"name": "Facebook", "domain": "facebook.com", "category": "Social Media"},
    "office365": {"name": "Office 365", "domain": "office.com", "category": "Enterprise / Email"},
    "outlook": {"name": "Outlook", "domain": "outlook.com", "category": "Email / SSO"},
    "dropbox": {"name": "Dropbox", "domain": "dropbox.com", "category": "Cloud Storage"},
    "spotify": {"name": "Spotify", "domain": "spotify.com", "category": "Streaming Music"},
    "dhl": {"name": "DHL Express", "domain": "dhl.com", "category": "Logistics / Delivery"},
    "fedex": {"name": "FedEx", "domain": "fedex.com", "category": "Logistics / Delivery"},
    "irs": {"name": "IRS (Internal Revenue)", "domain": "irs.gov", "category": "Government / Tax"},
    "whatsapp": {"name": "WhatsApp", "domain": "whatsapp.com", "category": "Messaging"},
    "telegram": {"name": "Telegram", "domain": "telegram.org", "category": "Messaging"}
}

TYPO_REPLACEMENTS = {
    '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '8': 'b',
    'vv': 'w', 'rn': 'm', 'cl': 'd'
}


def levenshtein_distance(s1: str, s2: str) -> int:
    """Compute Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


def normalize_typos(text: str) -> str:
    """Normalize common character substitutions in typo-squatting."""
    norm = text.lower()
    for typo, orig in TYPO_REPLACEMENTS.items():
        norm = norm.replace(typo, orig)
    return norm


def detect_brand_impersonation(hostname: str, url: str = "") -> Dict[str, Any]:
    """
    Detect whether the domain or URL is impersonating a well-known brand.
    Combines exact token checks, fuzzy Levenshtein matching, and typo-squatting normalization.
    """
    host_clean = hostname.split(':')[0].lower()
    norm_host = normalize_typos(host_clean)
    parts = host_clean.split('.')

    result = {
        "is_impersonating": False,
        "targeted_brand": "None",
        "target_category": "None",
        "impersonation_technique": "None",
        "similarity_score": 0.0,
        "official_domain": "",
        "flags": []
    }

    # If domain is the official legitimate domain, it's NOT an impersonation
    for brand_key, brand_data in TARGET_BRANDS.items():
        official = brand_data["domain"]
        if host_clean == official or host_clean.endswith("." + official):
            result["targeted_brand"] = brand_data["name"]
            result["target_category"] = brand_data["category"]
            result["official_domain"] = official
            result["is_impersonating"] = False
            return result

    # Check for Subdomain Brand Deception (e.g. paypal.com.verify-account.xyz)
    for brand_key, brand_data in TARGET_BRANDS.items():
        # Check if official domain or brand name is a subdomain prefix
        if f"{brand_key}.com." in host_clean or f"{brand_key}." in host_clean:
            result["is_impersonating"] = True
            result["targeted_brand"] = brand_data["name"]
            result["target_category"] = brand_data["category"]
            result["official_domain"] = brand_data["domain"]
            result["impersonation_technique"] = "Subdomain Deception (Brand in Subdomain)"
            result["similarity_score"] = 0.98
            result["flags"].append(f"Deceptive subdomain embedding legitimate brand name: '{brand_data['name']}'")
            return result

    # Check for Hyphenated / Combo Squatting (e.g. paypal-login-verify.com, secure-google-auth.net)
    for brand_key, brand_data in TARGET_BRANDS.items():
        if brand_key in host_clean or brand_key in norm_host:
            result["is_impersonating"] = True
            result["targeted_brand"] = brand_data["name"]
            result["target_category"] = brand_data["category"]
            result["official_domain"] = brand_data["domain"]
            result["impersonation_technique"] = "Combo-Squatting / Keyword Injection"
            result["similarity_score"] = 0.94
            result["flags"].append(f"Targeting brand '{brand_data['name']}' using combo-squatting structure")
            return result

    # Check for Levenshtein Typosquatting on the root domain token
    root_token = parts[-2] if len(parts) >= 2 else parts[0]
    for brand_key, brand_data in TARGET_BRANDS.items():
        dist = levenshtein_distance(root_token, brand_key)
        norm_dist = levenshtein_distance(normalize_typos(root_token), brand_key)

        if dist in [1, 2] or norm_dist == 0 or (norm_dist == 1 and len(brand_key) > 4):
            sim = 1.0 - (min(dist, norm_dist) / max(len(root_token), len(brand_key)))
            result["is_impersonating"] = True
            result["targeted_brand"] = brand_data["name"]
            result["target_category"] = brand_data["category"]
            result["official_domain"] = brand_data["domain"]
            result["impersonation_technique"] = "Typosquatting / Visual Character Mimicry"
            result["similarity_score"] = round(sim, 2)
            result["flags"].append(f"Visually deceptive domain '{root_token}' mimics legitimate brand '{brand_data['name']}'")
            return result

    return result
