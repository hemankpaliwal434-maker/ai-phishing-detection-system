import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.database import get_db
from app.models.entities import ScanRecord
from app.schemas.scan_schemas import UrlScanRequest, EmailScanRequest
from app.services.feature_extractor import extract_url_features
from app.services.ml_detector import predict_url_phishing
from app.services.domain_analyzer import analyze_domain_and_dns
from app.services.ssl_analyzer import inspect_ssl_certificate
from app.services.content_analyzer import analyze_webpage_content
from app.services.brand_detector import detect_brand_impersonation
from app.services.visual_analyzer import analyze_screenshot_data
from app.services.qr_scanner import decode_qr_image
from app.services.email_analyzer import analyze_email_message
from app.services.threat_graph import build_threat_graph
from app.services.campaign_detector import detect_campaign_cluster
from app.services.ai_investigator import run_ai_investigation
from app.services.pdf_generator import generate_security_investigation_pdf

router = APIRouter(prefix="", tags=["Analysis"])


@router.post("/analyze-url")
def analyze_url(req: UrlScanRequest, db: Session = Depends(get_db)):
    """
    Main URL Phishing & Cybersecurity Investigation Pipeline.
    Executes Lexical Extraction -> ML Prediction -> Domain & DNS -> SSL -> Content Forensics -> Brand Detection -> AI Reasoning -> Threat Graph.
    """
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL must not be empty")

    # 1. Extract 30+ URL Features
    url_features = extract_url_features(url)
    hostname = url_features["parsed_hostname"]
    is_https = url_features["is_https"] == 1

    # 2. Machine Learning Inference
    ml_result = predict_url_phishing(url, url_features)

    # 3. Domain & DNS Analysis
    domain_result = analyze_domain_and_dns(hostname)

    # 4. SSL Certificate Inspection
    ssl_result = inspect_ssl_certificate(hostname, is_https=is_https)

    # 5. Safe Sandboxed Content Forensics
    content_result = analyze_webpage_content(url, is_safe_mode=True)

    # 6. Brand Impersonation & Typosquatting Detection
    brand_result = detect_brand_impersonation(hostname, url)

    # 7. AI Cybersecurity Investigator & Autonomous Reasoning
    ai_investigation = run_ai_investigation(
        url, url_features, ml_result, domain_result, ssl_result, content_result, brand_result
    )

    # 8. Threat Graph Construction
    threat_graph = build_threat_graph(
        url, domain_result, ssl_result, content_result, brand_result, ai_investigation["risk_score"]
    )

    # 9. Campaign Cluster Identification
    campaign_info = detect_campaign_cluster(
        brand_result.get("targeted_brand", "None"),
        domain_result.get("domain_info", {}),
        domain_result.get("dns_records", {})
    )

    # Record scan in database
    try:
        record = ScanRecord(
            target_url=url,
            scan_type="url",
            risk_score=ai_investigation["risk_score"],
            threat_level=ai_investigation["threat_level"],
            classification=ai_investigation["classification"],
            confidence=ai_investigation["confidence_percentage"],
            ml_score=ml_result["ml_risk_score"],
            domain_risk=domain_result["domain_info"]["risk_score"],
            content_risk=content_result["content_risk_score"],
            reputation_risk=ai_investigation["breakdown"]["reputation_risk"],
            visual_risk=ai_investigation["breakdown"]["visual_risk"],
            brand_detected=brand_result.get("targeted_brand", "None"),
            attack_type=ai_investigation["attack_type"],
            ai_explanation=ai_investigation["ai_explanation"],
            recommendations=ai_investigation["recommendations"],
            indicators=ai_investigation["evidence"],
            forensics={
                "domain_info": domain_result["domain_info"],
                "dns_records": domain_result["dns_records"],
                "ssl_info": ssl_result,
                "content_forensics": content_result,
                "brand_analysis": brand_result,
                "campaign_info": campaign_info
            }
        )
        db.add(record)
        db.commit()
    except Exception as e:
        print(f"[!] Warning: Database log error: {e}")

    return {
        "url": url,
        "risk_score": ai_investigation["risk_score"],
        "threat_level": ai_investigation["threat_level"],
        "classification": ai_investigation["classification"],
        "confidence_percentage": ai_investigation["confidence_percentage"],
        "attack_type": ai_investigation["attack_type"],
        "targeted_brand": brand_result.get("targeted_brand", "None"),
        "ai_explanation": ai_investigation["ai_explanation"],
        "evidence": ai_investigation["evidence"],
        "recommendations": ai_investigation["recommendations"],
        "breakdown": ai_investigation["breakdown"],
        "ml_result": ml_result,
        "domain_info": domain_result["domain_info"],
        "dns_records": domain_result["dns_records"],
        "ssl_info": ssl_result,
        "content_forensics": content_result,
        "brand_analysis": brand_result,
        "campaign_info": campaign_info,
        "threat_graph": threat_graph,
        "url_features": url_features
    }


@router.post("/scan-email")
def scan_email(req: EmailScanRequest):
    """Analyze email or SMS text for social engineering, sender spoofing, and phishing lures."""
    return analyze_email_message(req.sender, req.subject, req.body)


@router.post("/scan-qr")
async def scan_qr_code(file: UploadFile = File(...)):
    """Upload and decode a QR code image to analyze the embedded destination URL."""
    contents = await file.read()
    qr_res = decode_qr_image(contents)
    if not qr_res["success"]:
        raise HTTPException(status_code=400, detail=qr_res["message"])

    # Auto run analysis on extracted URL
    target_url = qr_res["extracted_url"]
    url_req = UrlScanRequest(url=target_url)
    analysis = analyze_url(url_req)
    analysis["qr_metadata"] = qr_res
    return analysis


@router.post("/scan-screenshot")
async def scan_screenshot(file: UploadFile = File(...)):
    """Upload a website screenshot for computer vision and visual brand phishing analysis."""
    contents = await file.read()
    vis_res = analyze_screenshot_data(contents, filename=file.filename or "screenshot.png")
    return vis_res


@router.post("/report-pdf")
def download_pdf_report(payload: Dict[str, Any]):
    """Generate and stream a professional PDF Security Investigation Report."""
    pdf_bytes = generate_security_investigation_pdf(payload)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=Investigation_Report_{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
        }
    )


@router.get("/scans/history")
def get_recent_scans(limit: int = 15, db: Session = Depends(get_db)):
    """Fetch recent threat investigations."""
    records = db.query(ScanRecord).order_by(ScanRecord.created_at.desc()).limit(limit).all()
    return records
