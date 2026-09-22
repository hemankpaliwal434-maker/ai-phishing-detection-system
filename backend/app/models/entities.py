import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, Boolean
from app.database import Base


class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(Integer, primary_key=True, index=True)
    target_url = Column(String(2048), index=True, nullable=False)
    scan_type = Column(String(50), default="url")  # url, qr, visual, email
    risk_score = Column(Integer, nullable=False)  # 0 to 100
    threat_level = Column(String(50), nullable=False)  # SAFE, LOW, SUSPICIOUS, HIGH_RISK, CRITICAL
    classification = Column(String(50), nullable=False)  # Safe, Suspicious, Phishing
    confidence = Column(Float, nullable=False)
    ml_score = Column(Float, nullable=False)
    domain_risk = Column(Integer, default=0)
    content_risk = Column(Integer, default=0)
    reputation_risk = Column(Integer, default=0)
    visual_risk = Column(Integer, default=0)
    brand_detected = Column(String(100), default="None")
    attack_type = Column(String(100), default="None")
    ai_explanation = Column(Text, default="")
    recommendations = Column(JSON, default=list)
    indicators = Column(JSON, default=list)
    forensics = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id = Column(Integer, primary_key=True, index=True)
    target_url = Column(String(2048), nullable=False)
    reporter_name = Column(String(100), default="Anonymous")
    reporter_email = Column(String(150), default="")
    report_type = Column(String(50), default="phishing")  # phishing, false_positive, false_negative
    notes = Column(Text, default="")
    status = Column(String(50), default="Reported")  # Reported, Investigating, Confirmed, Blocked, Resolved
    assigned_analyst = Column(String(100), default="SOC AI Agent")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class ThreatCampaign(Base):
    __tablename__ = "threat_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    campaign_name = Column(String(150), index=True, nullable=False)
    target_brand = Column(String(100), nullable=False)
    domains_count = Column(Integer, default=1)
    primary_ip = Column(String(50), default="")
    primary_asn = Column(String(100), default="")
    threat_actor = Column(String(100), default="Unknown Group")
    risk_level = Column(String(50), default="HIGH_RISK")
    status = Column(String(50), default="Active")
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)


class SimulationCampaign(Base):
    __tablename__ = "simulation_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    target_group = Column(String(100), default="All Employees")
    template_subject = Column(String(200), nullable=False)
    template_body = Column(Text, nullable=False)
    difficulty = Column(String(50), default="Medium")
    total_sent = Column(Integer, default=0)
    clicked_count = Column(Integer, default=0)
    reported_count = Column(Integer, default=0)
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class UserSecurityScore(Base):
    __tablename__ = "user_security_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), unique=True, index=True, nullable=False)
    display_name = Column(String(100), default="Cyber Defender")
    score = Column(Integer, default=80)  # 0 - 100
    quizzes_completed = Column(Integer, default=0)
    simulations_caught = Column(Integer, default=0)
    badges = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
