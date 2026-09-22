import re
import math
import urllib.parse
import ipaddress
from typing import Dict, Any, List, Tuple

# Suspicious keywords frequently used in phishing attacks
SUSPICIOUS_KEYWORDS = [
    "login", "signin", "sign-in", "log-in", "verify", "verification", "account",
    "update", "security", "secure", "banking", "authenticate", "confirm", "wallet",
    "password", "credential", "suspend", "recovery", "alert", "service", "support",
    "billing", "payment", "ebayisapi", "webscr", "auth", "session", "validation",
    "unlock", "tax", "refund", "claim", "prize", "gift", "crypto", "free", "giftcard"
]

# Known URL shorteners
SHORTENER_DOMAINS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "ow.ly", "buff.ly", "adf.ly",
    "bit.do", "tiny.cc", "cutt.ly", "rebrand.ly", "qr.ae", "shorte.st", "goo.gl"
}

# Suspicious TLDs with high abuse rates
SUSPICIOUS_TLDS = {
    "xyz", "top", "work", "loan", "club", "online", "site", "vip", "icu",
    "buzz", "gq", "ml", "cf", "ga", "tk", "click", "fit", "surf", "rest"
}

# Targeted brand names for token checks
TARGET_BRAND_NAMES = [
    "paypal", "google", "microsoft", "apple", "netflix", "amazon", "facebook",
    "instagram", "chase", "bankofamerica", "wellsfargo", "citibank", "dropbox",
    "binance", "coinbase", "metamask", "steam", "spotify", "adobe", "yahoo",
    "outlook", "office365", "twitter", "whatsapp", "telegram", "ebay"
]


def calculate_entropy(text: str) -> float:
    """Calculate Shannon Entropy of a string to detect random DGA generation."""
    if not text:
        return 0.0
    prob = [float(text.count(c)) / len(text) for c in dict.fromkeys(list(text))]
    entropy = -sum([p * math.log(p) / math.log(2.0) for p in prob])
    return round(entropy, 4)


def is_ip_address(hostname: str) -> int:
    """Check if the hostname is a raw IPv4 or IPv6 address."""
    # Strip port if present
    host = hostname.split(':')[0]
    try:
        ipaddress.ip_address(host)
        return 1
    except ValueError:
        return 0


def detect_homoglyphs(text: str) -> int:
    """Detect non-ASCII or mixed script homoglyph characters."""
    try:
        text.encode('ascii')
        return 0
    except UnicodeEncodeError:
        return 1


def deobfuscate_url(url: str) -> str:
    """Attempt deobfuscation of percent-encoded and hex sequences."""
    try:
        decoded = urllib.parse.unquote(url)
        # Handle double encoding
        if '%' in decoded:
            decoded = urllib.parse.unquote(decoded)
        return decoded
    except Exception:
        return url


def extract_url_features(url: str) -> Dict[str, Any]:
    """
    Extract 30+ lexical, structural, statistical, and heuristic features
    from the given URL for Machine Learning prediction and forensic analysis.
    """
    url_cleaned = url.strip()
    if not (url_cleaned.startswith("http://") or url_cleaned.startswith("https://")):
        url_cleaned = "http://" + url_cleaned

    deobfuscated = deobfuscate_url(url_cleaned)
    parsed = urllib.parse.urlparse(deobfuscated)
    hostname = parsed.netloc.lower()
    path = parsed.path
    query = parsed.query

    # Remove port from hostname for domain checks
    host_no_port = hostname.split(':')[0]

    # Host subdomains calculation
    host_parts = host_no_port.split('.')
    if is_ip_address(host_no_port):
        num_subdomains = 0
        tld = ""
    else:
        num_subdomains = max(0, len(host_parts) - 2) if len(host_parts) >= 2 else 0
        tld = host_parts[-1] if host_parts else ""

    # Check for presence of IP address
    has_ip = is_ip_address(host_no_port)

    # Check for shorteners
    is_shortener = 1 if any(short in host_no_port for short in SHORTENER_DOMAINS) else 0

    # Count characters
    url_len = len(deobfuscated)
    host_len = len(host_no_port)
    path_len = len(path)
    query_len = len(query)

    count_dots = deobfuscated.count('.')
    count_hyphens = deobfuscated.count('-')
    count_at = deobfuscated.count('@')
    count_question = deobfuscated.count('?')
    count_percent = deobfuscated.count('%')
    count_equal = deobfuscated.count('=')
    count_underscore = deobfuscated.count('_')
    count_slash = deobfuscated.count('/')
    count_digits = sum(c.isdigit() for c in deobfuscated)
    digit_ratio = round(count_digits / max(1, url_len), 4)

    is_https = 1 if parsed.scheme == "https" else 0

    # Suspicious keywords
    lowered_url = deobfuscated.lower()
    detected_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in lowered_url]
    has_suspicious_kw = 1 if len(detected_keywords) > 0 else 0
    kw_count = len(detected_keywords)

    # Entropy
    entropy = calculate_entropy(deobfuscated)

    # Homoglyphs
    homoglyphs = detect_homoglyphs(host_no_port)

    # Redirection trick '//' in path
    has_double_slash_redirect = 1 if "//" in path else 0

    # TLD in path or subdomain
    tld_in_sub = 0
    for stld in ["com", "net", "org", "xyz", "top", "gov", "edu"]:
        if f".{stld}." in host_no_port or f".{stld}/" in deobfuscated:
            tld_in_sub = 1
            break

    # Custom port
    has_custom_port = 1 if parsed.port and parsed.port not in [80, 443] else 0

    # Brand in subdomain
    brand_in_sub = 0
    if num_subdomains > 0:
        subdomain_str = ".".join(host_parts[:-2])
        for brand in TARGET_BRAND_NAMES:
            if brand in subdomain_str:
                brand_in_sub = 1
                break

    # Suspicious TLD check
    is_suspicious_tld = 1 if tld in SUSPICIOUS_TLDS else 0

    # Hex/Base64 indicators
    has_hex = 1 if bool(re.search(r"%[0-9a-fA-F]{2}", url)) else 0
    has_base64 = 1 if bool(re.search(r"([A-Za-z0-9+/]{20,}={0,2})", query)) else 0

    features = {
        "url_length": url_len,
        "hostname_length": host_len,
        "path_length": path_len,
        "query_length": query_len,
        "count_dots": count_dots,
        "count_hyphens": count_hyphens,
        "count_at": count_at,
        "count_question": count_question,
        "count_percent": count_percent,
        "count_equal": count_equal,
        "count_underscore": count_underscore,
        "count_slash": count_slash,
        "count_digits": count_digits,
        "digit_ratio": digit_ratio,
        "count_subdomains": num_subdomains,
        "has_ip_address": has_ip,
        "is_https": is_https,
        "has_suspicious_keyword": has_suspicious_kw,
        "suspicious_keyword_count": kw_count,
        "is_shortened": is_shortener,
        "has_custom_port": has_custom_port,
        "entropy": entropy,
        "has_homoglyphs": homoglyphs,
        "has_double_slash_redirect": has_double_slash_redirect,
        "tld_in_subdomain": tld_in_sub,
        "brand_in_subdomain": brand_in_sub,
        "is_suspicious_tld": is_suspicious_tld,
        "has_hex_encoding": has_hex,
        "has_base64": has_base64,
        "detected_keywords": detected_keywords,
        "parsed_hostname": host_no_port,
        "parsed_scheme": parsed.scheme,
        "parsed_path": path,
        "parsed_query": query
    }
    return features


# Ordered list of numeric features passed to the ML classifier
FEATURE_NAMES = [
    "url_length", "hostname_length", "path_length", "query_length",
    "count_dots", "count_hyphens", "count_at", "count_question",
    "count_percent", "count_equal", "count_underscore", "count_slash",
    "count_digits", "digit_ratio", "count_subdomains", "has_ip_address",
    "is_https", "has_suspicious_keyword", "suspicious_keyword_count",
    "is_shortened", "has_custom_port", "entropy", "has_homoglyphs",
    "has_double_slash_redirect", "tld_in_subdomain", "brand_in_subdomain",
    "is_suspicious_tld", "has_hex_encoding", "has_base64"
]


def extract_feature_vector(url: str) -> List[float]:
    """Convert URL features to ordered numerical vector for ML model inference."""
    raw = extract_url_features(url)
    return [float(raw[feat]) for feat in FEATURE_NAMES]
