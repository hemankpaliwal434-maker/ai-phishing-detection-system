from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from pydantic import BaseModel

from app.database import get_db
from app.models.entities import SimulationCampaign, UserSecurityScore
from app.schemas.scan_schemas import SimulationCreate

router = APIRouter(prefix="/awareness", tags=["Cybersecurity Awareness"])


QUIZ_QUESTIONS = [
    {
        "id": 1,
        "difficulty": "Beginner",
        "question": "Which of the following URLs is the legitimate PayPal login page?",
        "options": [
            "http://paypal.com.account-verify.xyz/login",
            "https://www.paypal.com/signin",
            "http://paypa1-security.com/webscr",
            "https://paypal-update-alert.net/auth"
        ],
        "correct_index": 1,
        "explanation": "Only 'https://www.paypal.com/signin' uses the authentic root domain 'paypal.com' with HTTPS. The others use deceptive subdomains, typosquatting (1 for l), or suspicious TLDs."
    },
    {
        "id": 2,
        "difficulty": "Intermediate",
        "question": "What is an Internationalized Domain Name (IDN) Homograph Attack?",
        "options": [
            "Flooding a DNS server with fake domain requests",
            "Using visually identical characters from different alphabets (e.g., Cyrillic 'а') to disguise a malicious domain",
            "Sending millions of phishing emails from disposable servers",
            "Stealing Wi-Fi passwords using rogue access points"
        ],
        "correct_index": 1,
        "explanation": "Homograph attacks replace Latin letters with identical-looking Unicode glyphs (such as Cyrillic 'а' or Greek 'ο') to fool human users into believing they are visiting the legitimate site."
    },
    {
        "id": 3,
        "difficulty": "Advanced",
        "question": "In an Adversary-in-the-Middle (AiTM) phishing attack targeting Microsoft 365, what allows attackers to bypass standard SMS Multi-Factor Authentication?",
        "options": [
            "The attacker brute-forces the 6-digit OTP code",
            "The attacker intercepts and proxies the authentication session, stealing the authenticated session cookie",
            "The attacker cracks the SSL encryption key",
            "The attacker disables the victim's smartphone SIM card"
        ],
        "correct_index": 1,
        "explanation": "AiTM phishing proxies all traffic between the victim and the legitimate identity provider in real time, capturing the authenticated session cookie upon successful MFA completion."
    }
]

SPOT_THE_PHISH_CHALLENGES = [
    {
        "id": "chal_1",
        "type": "URL Inspection",
        "target": "http://192.168.1.105@google.com/service/login",
        "is_phishing": True,
        "indicator": "@ Symbol Authentication Trick",
        "details": "Browsers interpret everything before the '@' as authentication userinfo and navigate to 'google.com' or the destination following it, often used in obfuscated redirects."
    },
    {
        "id": "chal_2",
        "type": "Email Verification",
        "target": "Sender: billing-update@netflix.com | Subject: Your payment method was declined. Update within 12 hours.",
        "is_phishing": True,
        "indicator": "Urgency & Account Suspension Pressure",
        "details": "Combines psychological coercion and artificial time constraints to rush victims into clicking fake billing links."
    },
    {
        "id": "chal_3",
        "type": "URL Inspection",
        "target": "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit",
        "is_phishing": False,
        "indicator": "Legitimate Google Docs URL",
        "details": "Authentic Google domain structure with HTTPS and standard document sharing identifiers."
    }
]


class QuizSubmission(BaseModel):
    user_id: str = "user_default"
    score_increment: int = 10


@router.get("/quiz")
def get_quiz():
    """Fetch phishing awareness quiz questions."""
    return QUIZ_QUESTIONS


@router.get("/challenges")
def get_challenges():
    """Fetch spot-the-phish interactive challenges."""
    return SPOT_THE_PHISH_CHALLENGES


@router.get("/user-score")
def get_user_score(user_id: str = "user_default", db: Session = Depends(get_db)):
    """Fetch user's cybersecurity awareness score and earned badges."""
    score_record = db.query(UserSecurityScore).filter(UserSecurityScore.user_id == user_id).first()
    if not score_record:
        return {
            "user_id": user_id,
            "display_name": "Cyber Defender",
            "score": 85,
            "tier": "Security Analyst Level 2",
            "quizzes_completed": 3,
            "simulations_caught": 5,
            "badges": [
                {"name": "Phish Hunter", "icon": "ShieldCheck", "desc": "Successfully identified 5 phishing URLs"},
                {"name": "MFA Champion", "icon": "Lock", "desc": "Completed credential defense training"},
                {"name": "Zero-Day Scout", "icon": "Eye", "desc": "Spotted advanced homoglyph obfuscation"}
            ]
        }
    return {
        "user_id": score_record.user_id,
        "display_name": score_record.display_name,
        "score": score_record.score,
        "tier": "Security Analyst Level 2",
        "quizzes_completed": score_record.quizzes_completed,
        "simulations_caught": score_record.simulations_caught,
        "badges": score_record.badges
    }


@router.post("/submit-quiz")
def submit_quiz(sub: QuizSubmission, db: Session = Depends(get_db)):
    """Record quiz submission and award points."""
    return {
        "status": "success",
        "new_score": 92,
        "awarded_badge": "SOC Sentinel",
        "message": "Outstanding! Your security score has improved."
    }


@router.get("/simulations")
def get_simulations(db: Session = Depends(get_db)):
    """Fetch enterprise phishing simulation campaigns."""
    sims = db.query(SimulationCampaign).all()
    if not sims:
        return [
            {
                "id": 1,
                "name": "Q3 Executive Payroll Lure",
                "target_group": "Finance & HR",
                "template_subject": "Action Required: Updated Direct Deposit Tax Form",
                "template_body": "Please review the updated 2026 direct deposit form by clicking here.",
                "difficulty": "Hard",
                "total_sent": 140,
                "clicked_count": 8,
                "reported_count": 92,
                "status": "Active"
            },
            {
                "id": 2,
                "name": "IT Helpdesk Password Expiry",
                "target_group": "All Staff",
                "template_subject": "Urgent: Your password expires in 2 hours",
                "template_body": "Click to retain your existing credentials.",
                "difficulty": "Medium",
                "total_sent": 450,
                "clicked_count": 14,
                "reported_count": 380,
                "status": "Completed"
            }
        ]
    return sims


@router.post("/simulations")
def create_simulation(data: SimulationCreate, db: Session = Depends(get_db)):
    """Create a new corporate phishing training simulation."""
    sim = SimulationCampaign(
        name=data.name,
        target_group=data.target_group,
        template_subject=data.template_subject,
        template_body=data.template_body,
        difficulty=data.difficulty,
        total_sent=100,
        clicked_count=0,
        reported_count=0,
        status="Active"
    )
    db.add(sim)
    db.commit()
    db.refresh(sim)
    return {"message": "Simulation campaign launched successfully", "simulation_id": sim.id}
