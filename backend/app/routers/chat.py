from fastapi import APIRouter
from app.schemas.scan_schemas import ChatRequest
from app.services.chatbot_service import generate_chatbot_response

router = APIRouter(prefix="", tags=["AI Chatbot"])


@router.post("/chat")
def chat_with_soc_analyst(req: ChatRequest):
    """
    Interactive AI Security Chatbot endpoint.
    Answers technical questions, explains threat findings, and guides incident containment.
    """
    reply = generate_chatbot_response(req.message, req.scan_context)
    return {
        "reply": reply,
        "sender": "Antigravity SOC Analyst AI"
    }
