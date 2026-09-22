from typing import Dict, Any, List


def build_threat_graph(url: str, domain_data: Dict[str, Any], ssl_data: Dict[str, Any], content_data: Dict[str, Any], brand_data: Dict[str, Any], risk_score: int) -> Dict[str, Any]:
    """
    Build an interactive node-and-edge relationship graph for SOC infrastructure investigation.
    Nodes: URL, Domain, IP, DNS/Nameserver, SSL Certificate, Redirect Nodes, Target Brand, Threat Campaign.
    """
    nodes = []
    edges = []

    domain_info = domain_data.get("domain_info", {})
    dns_records = domain_data.get("dns_records", {})

    hostname = domain_info.get("hostname", "target.com")
    root_domain = domain_info.get("domain", hostname)
    ip_addr = dns_records.get("ip_address", "Unresolved IP")
    asn_name = dns_records.get("asn", "AS-Unknown")
    ssl_issuer = ssl_data.get("issuer", "No SSL")

    # Determine node color schemes
    danger_color = "#ef4444" if risk_score > 60 else "#eab308" if risk_score > 30 else "#22c55e"

    # 1. URL Node (Root target)
    nodes.append({
        "id": "node_url",
        "label": url[:35] + "..." if len(url) > 35 else url,
        "type": "URL",
        "color": danger_color,
        "size": 28,
        "details": {"url": url, "risk_score": risk_score}
    })

    # 2. Hostname Node
    nodes.append({
        "id": "node_host",
        "label": hostname,
        "type": "Hostname",
        "color": "#3b82f6",
        "size": 22,
        "details": {"hostname": hostname, "subdomains": domain_info.get("count_subdomains", 0)}
    })
    edges.append({"source": "node_url", "target": "node_host", "label": "HOSTED_ON"})

    # 3. Domain / WHOIS Node
    nodes.append({
        "id": "node_domain",
        "label": root_domain,
        "type": "Domain",
        "color": "#8b5cf6",
        "size": 24,
        "details": {
            "registrar": domain_info.get("registrar", "Unknown"),
            "age_days": domain_info.get("domain_age_days", 0),
            "newly_registered": domain_info.get("is_newly_registered", False)
        }
    })
    edges.append({"source": "node_host", "target": "node_domain", "label": "PARENT_ZONE"})

    # 4. IP Address Node
    nodes.append({
        "id": "node_ip",
        "label": ip_addr,
        "type": "IP Address",
        "color": "#f97316",
        "size": 20,
        "details": {"ip": ip_addr, "country": dns_records.get("country", "Unknown")}
    })
    edges.append({"source": "node_host", "target": "node_ip", "label": "RESOLVES_TO"})

    # 5. ASN / Hosting Node
    nodes.append({
        "id": "node_asn",
        "label": asn_name.split(' ')[0] if asn_name else "ASN",
        "type": "Autonomous System",
        "color": "#06b6d4",
        "size": 18,
        "details": {"asn": asn_name}
    })
    edges.append({"source": "node_ip", "target": "node_asn", "label": "ANNOUNCED_BY"})

    # 6. SSL Certificate Node
    nodes.append({
        "id": "node_ssl",
        "label": ssl_issuer.split(' ')[0] if ssl_issuer else "SSL CA",
        "type": "Certificate",
        "color": "#10b981",
        "size": 18,
        "details": {"issuer": ssl_issuer, "valid": ssl_data.get("is_valid", True)}
    })
    edges.append({"source": "node_host", "target": "node_ssl", "label": "SECURED_BY"})

    # 7. Brand Node (If impersonation detected)
    if brand_data.get("is_impersonating"):
        target_brand = brand_data.get("targeted_brand", "Brand")
        nodes.append({
            "id": "node_brand",
            "label": f"Target: {target_brand}",
            "type": "Brand Target",
            "color": "#ec4899",
            "size": 24,
            "details": {
                "brand": target_brand,
                "category": brand_data.get("target_category", "Financial"),
                "technique": brand_data.get("impersonation_technique", "Squatting")
            }
        })
        edges.append({"source": "node_domain", "target": "node_brand", "label": "IMPERSONATES"})

    # 8. Redirect Nodes (if multi-hop)
    redirect_chain = content_data.get("redirect_chain", [])
    if len(redirect_chain) > 1:
        for idx, hop_url in enumerate(redirect_chain[1:], 1):
            hop_id = f"node_redirect_{idx}"
            nodes.append({
                "id": hop_id,
                "label": f"Hop {idx}: " + (hop_url[:20] + "..."),
                "type": "Redirect Hop",
                "color": "#a855f7",
                "size": 16,
                "details": {"url": hop_url}
            })
            prev_id = "node_url" if idx == 1 else f"node_redirect_{idx-1}"
            edges.append({"source": prev_id, "target": hop_id, "label": "REDIRECTS_TO"})

    return {
        "nodes": nodes,
        "edges": edges
    }
