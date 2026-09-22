// Dynamically use the current origin for the backend API.
// This works perfectly for localhost, LAN IPs, and public tunnels because the FastAPI backend serves the frontend UI.
export const BACKEND_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';
export const API_BASE = `${BACKEND_URL}/api`;
