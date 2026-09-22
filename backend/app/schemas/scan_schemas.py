from typing import List, Dict, Any, Optional
from pydantic import BaseModel, HttpUrl, Field


class UrlScanRequest(BaseModel):
    url: str = Field(..., example="http://secure-paypal-login-account.xyz/webscr")
    deep_scan: bool = Field(True, description="Perform deep live domain, SSL, and content inspection")


class EmailScanRequest(BaseModel):
    sender: str = Field("", example="security-alert@service-verify-paypal.com")
    subject: str = Field(..., example="URGENT: Your account has been suspended! Verify immediately")
    body: str = Field(..., example="Dear customer, click here http://paypa1-security.xyz to restore your account.")


class ChatRequest(BaseModel):
    message: str = Field(..., example="Why is this website considered dangerous?")
    scan_context: Optional[Dict[str, Any]] = None


class IncidentReportCreate(BaseModel):
    target_url: str
    reporter_name: Optional[str] = "Anonymous"
    reporter_email: Optional[str] = ""
    report_type: Optional[str] = "phishing"
    notes: Optional[str] = ""


class IncidentStatusUpdate(BaseModel):
    status: str = Field(..., example="Confirmed")


class SimulationCreate(BaseModel):
    name: str
    target_group: str = "All Employees"
    template_subject: str
    template_body: str
    difficulty: str = "Medium"
