from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
import os, logging, uuid
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import jwt
from passlib.context import CryptContext
import copy

ROOT_DIR = Path(__file__).parent
app = FastAPI()
api_router = APIRouter(prefix="/api")
SECRET_KEY = "scf_platform_secret_key_2024"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ── Models ──────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class OTPRequest(BaseModel):
    session_id: str
    otp: str

class InvoiceCreate(BaseModel):
    invoice_no: str
    invoice_date: str
    due_date: str
    channel_partner: str
    buyer_name: str
    seller_name: str
    program_name: str
    amount: float
    discount_rate: float
    description: str = ""
    line_items: List[dict] = []
    documents: List[dict] = []

class InvoiceStatusUpdate(BaseModel):
    status: str
    remarks: str = ""

# ── Static Data ──────────────────────────────────────────────────────────────
USERS = {
    "ramesh@tatamotors.com": {"id": "user-001", "name": "Ramesh Kumar", "email": "ramesh@tatamotors.com", "role": "anchor_maker", "company": "Tata Motors Ltd", "password": "password"},
    "suresh@tatamotors.com": {"id": "user-002", "name": "Suresh Sharma", "email": "suresh@tatamotors.com", "role": "anchor_checker", "company": "Tata Motors Ltd", "password": "password"},
    "ganga@jagdambamotors.com": {"id": "user-003", "name": "Ganga Prasad", "email": "ganga@jagdambamotors.com", "role": "channel_partner", "company": "Jagdamba Motors Pvt Ltd", "password": "password"}
}

CHANNEL_PARTNERS_DATA = [
    {"id":"CP001","cp_id":"CPID001","name":"Jagdamba Motors","full_name":"Jagdamba Motors Pvt Ltd","gst":"09AABCJ1234A1Z5","type":"Dealer","city":"Lucknow","state":"Uttar Pradesh","product":"Dealer Finance","bank":"Central Bank of India","pte_days":30,"sanctioned_limit":50000000,"utilized":15000000,"available":35000000,"roi":8.5,"grace_period":4,"stop_supply":10,"stale_invoice":5,"active_since":"01-Apr-2024","contact":"+91 98765 43210","email":"accounts@jagdambamotors.com","address":"123, Transport Nagar, Lucknow, UP - 226010","status":"Active"},
    {"id":"CP002","cp_id":"CPID002","name":"Krishna Auto Dealers","full_name":"Krishna Auto Dealers Pvt Ltd","gst":"09AACKD4567B1Z8","type":"Dealer","city":"Kanpur","state":"Uttar Pradesh","product":"Dealer Finance","bank":"State Bank of India","pte_days":45,"sanctioned_limit":30000000,"utilized":8500000,"available":21500000,"roi":9.0,"grace_period":3,"stop_supply":7,"stale_invoice":5,"active_since":"15-Jun-2024","contact":"+91 97654 32109","email":"finance@krishnaauto.com","address":"45, GT Road, Kanpur, UP - 208001","status":"Active"},
    {"id":"CP003","cp_id":"CPID003","name":"Shree Ganesh Motors","full_name":"Shree Ganesh Motors Pvt Ltd","gst":"27AACSG7890C1Z2","type":"Vendor","city":"Mumbai","state":"Maharashtra","product":"Vendor Finance","bank":"Central Bank of India","pte_days":60,"sanctioned_limit":80000000,"utilized":32000000,"available":48000000,"roi":7.5,"grace_period":5,"stop_supply":12,"stale_invoice":7,"active_since":"01-Jan-2024","contact":"+91 96543 21098","email":"accounts@sgmotors.com","address":"78, Industrial Area, Andheri East, Mumbai - 400093","status":"Active"},
    {"id":"CP004","cp_id":"CPID004","name":"Meenakshi Auto","full_name":"Meenakshi Auto Works Pvt Ltd","gst":"33AACMA3456D1Z4","type":"Dealer","city":"Chennai","state":"Tamil Nadu","product":"Dealer Finance","bank":"State Bank of India","pte_days":30,"sanctioned_limit":25000000,"utilized":9800000,"available":15200000,"roi":9.5,"grace_period":3,"stop_supply":7,"stale_invoice":5,"active_since":"01-Mar-2024","contact":"+91 95432 10987","email":"finance@meenakshiauto.com","address":"22, Anna Salai, Chennai - 600002","status":"Active"},
    {"id":"CP005","cp_id":"CPID005","name":"Sunrise Vehicles","full_name":"Sunrise Vehicles Pvt Ltd","gst":"27AACSV5678E1Z6","type":"Vendor","city":"Pune","state":"Maharashtra","product":"Vendor Finance","bank":"HDFC Bank","pte_days":45,"sanctioned_limit":45000000,"utilized":18000000,"available":27000000,"roi":8.0,"grace_period":4,"stop_supply":10,"stale_invoice":5,"active_since":"15-Feb-2024","contact":"+91 94321 09876","email":"accounts@sunrisevehicles.com","address":"56, Hadapsar, Pune - 411028","status":"Active"},
    {"id":"CP006","cp_id":"CPID006","name":"National Auto Hub","full_name":"National Auto Hub Ltd","gst":"07AACNA2345F1Z0","type":"Dealer","city":"Delhi","state":"Delhi","product":"Dealer Finance","bank":"Central Bank of India","pte_days":90,"sanctioned_limit":60000000,"utilized":22000000,"available":38000000,"roi":8.5,"grace_period":5,"stop_supply":14,"stale_invoice":7,"active_since":"01-Nov-2023","contact":"+91 93210 98765","email":"finance@nationalauto.com","address":"101, Connaught Place, New Delhi - 110001","status":"Inactive"}
]

PROGRAMS_DATA = [
    {"id":"p1","anchor":"Tata Motors Ltd","channel_partner":"Jagdamba Motors","product":"Dealer Finance","pte_days":30,"total_limit":50000000,"utilized":15000000,"available":35000000,"roi":8.5,"bank":"Central Bank of India","status":"Active"},
    {"id":"p2","anchor":"Tata Motors Ltd","channel_partner":"Krishna Auto Dealers","product":"Dealer Finance","pte_days":45,"total_limit":30000000,"utilized":8500000,"available":21500000,"roi":9.0,"bank":"State Bank of India","status":"Active"},
    {"id":"p3","anchor":"Tata Motors Ltd","channel_partner":"Shree Ganesh Motors","product":"Vendor Finance","pte_days":60,"total_limit":80000000,"utilized":32000000,"available":48000000,"roi":7.5,"bank":"Central Bank of India","status":"Active"},
    {"id":"p4","anchor":"Tata Motors Ltd","channel_partner":"Meenakshi Auto","product":"Dealer Finance","pte_days":30,"total_limit":25000000,"utilized":9800000,"available":15200000,"roi":9.5,"bank":"State Bank of India","status":"Active"},
    {"id":"p5","anchor":"Tata Motors Ltd","channel_partner":"Sunrise Vehicles","product":"Vendor Finance","pte_days":45,"total_limit":45000000,"utilized":18000000,"available":27000000,"roi":8.0,"bank":"HDFC Bank","status":"Active"},
    {"id":"p6","anchor":"Tata Motors Ltd","channel_partner":"National Auto Hub","product":"Dealer Finance","pte_days":90,"total_limit":60000000,"utilized":22000000,"available":38000000,"roi":8.5,"bank":"Central Bank of India","status":"Inactive"}
]

SAMPLE_INVOICES = [
    {"id":"inv-seed-001","invoice_no":"INV-2024-001","invoice_date":"2024-11-01","due_date":"2024-12-01","channel_partner":"Jagdamba Motors","buyer_name":"Jagdamba Motors Pvt Ltd","seller_name":"Tata Motors Ltd","program_name":"Dealer Finance Program","amount":1500000.0,"discount_rate":8.5,"discount_amount":10625.0,"net_amount":1489375.0,"description":"Commercial vehicles supply - Nov 2024","line_items":[{"description":"Tata Ace Gold","qty":5,"unit_price":200000,"total":1000000},{"description":"Tata Yodha","qty":2,"unit_price":250000,"total":500000}],"documents":[],"status":"pending_checker_approval","remarks":"","created_by":"user-001","created_by_name":"Ramesh Kumar","created_at":"2024-11-01T10:30:00+00:00","updated_at":"2024-11-01T10:30:00+00:00","checker_approved_by":None,"checker_approved_name":None,"checker_approved_at":None,"cp_approved_by":None,"cp_approved_name":None,"cp_approved_at":None},
    {"id":"inv-seed-002","invoice_no":"INV-2024-002","invoice_date":"2024-11-05","due_date":"2024-12-05","channel_partner":"Jagdamba Motors","buyer_name":"Jagdamba Motors Pvt Ltd","seller_name":"Tata Motors Ltd","program_name":"Dealer Finance Program","amount":2200000.0,"discount_rate":8.5,"discount_amount":15583.33,"net_amount":2184416.67,"description":"Light commercial vehicles - Nov 2024","line_items":[{"description":"Tata 407","qty":4,"unit_price":400000,"total":1600000},{"description":"Tata Intra","qty":3,"unit_price":200000,"total":600000}],"documents":[],"status":"approved_l1","remarks":"Verified and approved at L1","created_by":"user-001","created_by_name":"Ramesh Kumar","created_at":"2024-11-05T09:15:00+00:00","updated_at":"2024-11-06T11:00:00+00:00","checker_approved_by":"user-002","checker_approved_name":"Suresh Sharma","checker_approved_at":"2024-11-06T11:00:00+00:00","cp_approved_by":None,"cp_approved_name":None,"cp_approved_at":None},
    {"id":"inv-seed-003","invoice_no":"INV-2024-003","invoice_date":"2024-11-08","due_date":"2024-12-08","channel_partner":"Krishna Auto Dealers","buyer_name":"Krishna Auto Dealers Pvt Ltd","seller_name":"Tata Motors Ltd","program_name":"Dealer Finance Program","amount":850000.0,"discount_rate":9.0,"discount_amount":6375.0,"net_amount":843625.0,"description":"Passenger vehicles supply - Nov 2024","line_items":[{"description":"Tata Nexon","qty":2,"unit_price":350000,"total":700000},{"description":"Tata Punch","qty":1,"unit_price":150000,"total":150000}],"documents":[],"status":"pending_checker_approval","remarks":"","created_by":"user-001","created_by_name":"Ramesh Kumar","created_at":"2024-11-08T14:00:00+00:00","updated_at":"2024-11-08T14:00:00+00:00","checker_approved_by":None,"checker_approved_name":None,"checker_approved_at":None,"cp_approved_by":None,"cp_approved_name":None,"cp_approved_at":None},
    {"id":"inv-seed-004","invoice_no":"INV-2024-004","invoice_date":"2024-11-10","due_date":"2024-12-10","channel_partner":"Shree Ganesh Motors","buyer_name":"Shree Ganesh Motors","seller_name":"Tata Motors Ltd","program_name":"Vendor Finance Program","amount":3200000.0,"discount_rate":7.5,"discount_amount":20000.0,"net_amount":3180000.0,"description":"Heavy commercial vehicles - Nov 2024","line_items":[{"description":"Tata Prima","qty":2,"unit_price":1200000,"total":2400000},{"description":"Tata Signa","qty":1,"unit_price":800000,"total":800000}],"documents":[],"status":"rejected_checker","remarks":"Credit limit exceeded for this period. Please resubmit with reduced amount.","created_by":"user-001","created_by_name":"Ramesh Kumar","created_at":"2024-11-10T10:00:00+00:00","updated_at":"2024-11-11T09:30:00+00:00","checker_approved_by":None,"checker_approved_name":None,"checker_approved_at":None,"cp_approved_by":None,"cp_approved_name":None,"cp_approved_at":None},
    {"id":"inv-seed-005","invoice_no":"INV-2024-005","invoice_date":"2024-11-12","due_date":"2024-12-12","channel_partner":"Jagdamba Motors","buyer_name":"Jagdamba Motors Pvt Ltd","seller_name":"Tata Motors Ltd","program_name":"Dealer Finance Program","amount":1800000.0,"discount_rate":8.5,"discount_amount":12750.0,"net_amount":1787250.0,"description":"EV vehicles supply - Nov 2024","line_items":[{"description":"Tata Nexon EV","qty":3,"unit_price":500000,"total":1500000},{"description":"Tata Tiago EV","qty":2,"unit_price":150000,"total":300000}],"documents":[],"status":"pending_checker_approval","remarks":"","created_by":"user-001","created_by_name":"Ramesh Kumar","created_at":"2024-11-12T11:45:00+00:00","updated_at":"2024-11-12T11:45:00+00:00","checker_approved_by":None,"checker_approved_name":None,"checker_approved_at":None,"cp_approved_by":None,"cp_approved_name":None,"cp_approved_at":None},
    {"id":"inv-seed-006","invoice_no":"INV-2024-006","invoice_date":"2024-11-15","due_date":"2024-12-15","channel_partner":"Jagdamba Motors","buyer_name":"Jagdamba Motors Pvt Ltd","seller_name":"Tata Motors Ltd","program_name":"Dealer Finance Program","amount":980000.0,"discount_rate":9.5,"discount_amount":7758.33,"net_amount":972241.67,"description":"Utility vehicles - Nov 2024","line_items":[{"description":"Tata Harrier","qty":1,"unit_price":600000,"total":600000},{"description":"Tata Safari","qty":1,"unit_price":380000,"total":380000}],"documents":[],"status":"fully_approved","remarks":"Final approval given","created_by":"user-001","created_by_name":"Ramesh Kumar","created_at":"2024-11-15T08:30:00+00:00","updated_at":"2024-11-16T10:00:00+00:00","checker_approved_by":"user-002","checker_approved_name":"Suresh Sharma","checker_approved_at":"2024-11-15T15:00:00+00:00","cp_approved_by":"user-003","cp_approved_name":"Ganga Prasad","cp_approved_at":"2024-11-16T10:00:00+00:00"},
    {"id":"inv-seed-007","invoice_no":"INV-2024-007","invoice_date":"2024-11-18","due_date":"2024-12-18","channel_partner":"Jagdamba Motors","buyer_name":"Jagdamba Motors Pvt Ltd","seller_name":"Tata Motors Ltd","program_name":"Dealer Finance Program","amount":2750000.0,"discount_rate":8.5,"discount_amount":19479.17,"net_amount":2730520.83,"description":"Commercial & passenger vehicles mix - Nov 2024","line_items":[{"description":"Tata Ace","qty":5,"unit_price":150000,"total":750000},{"description":"Tata Altroz","qty":5,"unit_price":300000,"total":1500000},{"description":"Tata Tigor","qty":5,"unit_price":100000,"total":500000}],"documents":[],"status":"approved_l1","remarks":"L1 approved, pending CP final approval","created_by":"user-001","created_by_name":"Ramesh Kumar","created_at":"2024-11-18T09:00:00+00:00","updated_at":"2024-11-19T10:00:00+00:00","checker_approved_by":"user-002","checker_approved_name":"Suresh Sharma","checker_approved_at":"2024-11-19T10:00:00+00:00","cp_approved_by":None,"cp_approved_name":None,"cp_approved_at":None}
]

REPAYMENT_DATA = [
    {"id":"rep-001","invoice_no":"INV-2024-006","channel_partner":"Jagdamba Motors","invoice_date":"15-Nov-2024","invoice_amount":980000.0,"disbursed_amount":972241.67,"due_date":"15-Dec-2024","repayment_date":"14-Dec-2024","repayment_amount":972241.67,"overdue_days":0,"status":"Paid"},
    {"id":"rep-002","invoice_no":"INV-2024-002","channel_partner":"Jagdamba Motors","invoice_date":"05-Nov-2024","invoice_amount":2200000.0,"disbursed_amount":2184416.67,"due_date":"05-Dec-2024","repayment_date":"-","repayment_amount":2184416.67,"overdue_days":0,"status":"Pending"},
    {"id":"rep-003","invoice_no":"INV-2024-007","channel_partner":"Jagdamba Motors","invoice_date":"18-Nov-2024","invoice_amount":2750000.0,"disbursed_amount":2730520.83,"due_date":"18-Dec-2024","repayment_date":"-","repayment_amount":2730520.83,"overdue_days":5,"status":"Overdue"},
    {"id":"rep-004","invoice_no":"INV-2024-001","channel_partner":"Jagdamba Motors","invoice_date":"01-Nov-2024","invoice_amount":1500000.0,"disbursed_amount":1489375.0,"due_date":"01-Dec-2024","repayment_date":"30-Nov-2024","repayment_amount":1489375.0,"overdue_days":0,"status":"Paid"},
]

# ── In-Memory Storage ────────────────────────────────────────────────────────
INVOICES = copy.deepcopy(SAMPLE_INVOICES)
SESSIONS = []

# ── Auth Helpers ──────────────────────────────────────────────────────────────
def create_token(user_id, email, role):
    return jwt.encode({"user_id": user_id, "email": email, "role": role}, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return decode_token(credentials.credentials)

# ── Auth Routes ───────────────────────────────────────────────────────────────
@api_router.post("/auth/login")
async def login(req: LoginRequest):
    user = USERS.get(req.email)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    session_id = str(uuid.uuid4())
    session_data = {
        "session_id": session_id,
        "user_id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    SESSIONS.append(session_data)
    return {"session_id": session_id, "email": user["email"], "role": user["role"]}

@api_router.post("/auth/verify-otp")
async def verify_otp(req: OTPRequest):
    if req.otp != "000000":
        raise HTTPException(status_code=401, detail="Invalid OTP")

    # Find session
    session = next((s for s in SESSIONS if s["session_id"] == req.session_id), None)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = USERS.get(session["email"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    token = create_token(user["id"], user["email"], user["role"])

    # Remove session
    SESSIONS.remove(session)

    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"], "company": user["company"]}}

# ── Invoice Routes ────────────────────────────────────────────────────────────
@api_router.get("/invoices")
async def get_invoices(status: Optional[str] = None, channel_partner: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    filtered_invoices = INVOICES

    if status and status != "all":
        filtered_invoices = [inv for inv in filtered_invoices if inv["status"] == status]

    if channel_partner:
        filtered_invoices = [inv for inv in filtered_invoices if inv["channel_partner"] == channel_partner]

    if current_user["role"] == "channel_partner":
        # Force filter for CP
        filtered_invoices = [inv for inv in filtered_invoices if inv["channel_partner"] == "Jagdamba Motors"]

    # Sort by created_at desc
    filtered_invoices.sort(key=lambda x: x["created_at"], reverse=True)

    return filtered_invoices

@api_router.post("/invoices")
async def create_invoice(inv: InvoiceCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "anchor_maker":
        raise HTTPException(status_code=403, detail="Only Anchor Maker can raise invoices")

    user = USERS.get(current_user["email"])
    now = datetime.now(timezone.utc).isoformat()
    discount_amount = (inv.amount * inv.discount_rate) / 100 / 12

    doc = {
        "id": str(uuid.uuid4()),
        "invoice_no": inv.invoice_no,
        "invoice_date": inv.invoice_date,
        "due_date": inv.due_date,
        "channel_partner": inv.channel_partner,
        "buyer_name": inv.buyer_name,
        "seller_name": inv.seller_name,
        "program_name": inv.program_name,
        "amount": inv.amount,
        "discount_rate": inv.discount_rate,
        "discount_amount": round(discount_amount, 2),
        "net_amount": round(inv.amount - discount_amount, 2),
        "description": inv.description,
        "line_items": inv.line_items,
        "documents": inv.documents,
        "status": "pending_checker_approval",
        "remarks": "",
        "created_by": current_user["user_id"],
        "created_by_name": user["name"] if user else "Maker",
        "created_at": now,
        "updated_at": now,
        "checker_approved_by": None,
        "checker_approved_name": None,
        "checker_approved_at": None,
        "cp_approved_by": None,
        "cp_approved_name": None,
        "cp_approved_at": None
    }

    INVOICES.append(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: str, current_user: dict = Depends(get_current_user)):
    inv = next((inv for inv in INVOICES if inv["id"] == invoice_id), None)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return inv

@api_router.put("/invoices/{invoice_id}/status")
async def update_invoice_status(invoice_id: str, update: InvoiceStatusUpdate, current_user: dict = Depends(get_current_user)):
    inv_index = next((i for i, inv in enumerate(INVOICES) if inv["id"] == invoice_id), -1)
    if inv_index == -1:
        raise HTTPException(status_code=404, detail="Invoice not found")

    inv = INVOICES[inv_index]
    user = USERS.get(current_user["email"])
    now = datetime.now(timezone.utc).isoformat()
    role = current_user["role"]

    # Update fields
    inv["status"] = update.status
    inv["remarks"] = update.remarks
    inv["updated_at"] = now

    if role == "anchor_checker" and update.status in ["approved_l1", "rejected_checker"]:
        if update.status == "approved_l1":
            inv["checker_approved_by"] = current_user["user_id"]
            inv["checker_approved_name"] = user["name"] if user else "Checker"
            inv["checker_approved_at"] = now
    elif role == "channel_partner" and update.status in ["fully_approved", "rejected_cp"]:
        if update.status == "fully_approved":
            inv["cp_approved_by"] = current_user["user_id"]
            inv["cp_approved_name"] = user["name"] if user else "CP"
            inv["cp_approved_at"] = now
    else:
        raise HTTPException(status_code=403, detail="Not authorized for this action")

    INVOICES[inv_index] = inv
    return inv

# ── Stats ──────────────────────────────────────────────────────────────────────
@api_router.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    filtered_invoices = INVOICES
    if current_user["role"] == "channel_partner":
        filtered_invoices = [inv for inv in INVOICES if inv["channel_partner"] == "Jagdamba Motors"]

    total = len(filtered_invoices)
    pending_checker = len([inv for inv in filtered_invoices if inv["status"] == "pending_checker_approval"])
    approved_l1 = len([inv for inv in filtered_invoices if inv["status"] == "approved_l1"])
    rejected = len([inv for inv in filtered_invoices if inv["status"] in ["rejected_checker", "rejected_cp"]])
    fully_approved_invoices = [inv for inv in filtered_invoices if inv["status"] == "fully_approved"]
    fully_approved = len(fully_approved_invoices)

    approved_amount = sum(inv["amount"] for inv in fully_approved_invoices)

    return {
        "total_invoices": total,
        "pending_checker": pending_checker,
        "approved_l1": approved_l1,
        "rejected": rejected,
        "fully_approved": fully_approved,
        "approved_amount": approved_amount
    }

# ── Programs ──────────────────────────────────────────────────────────────────
@api_router.get("/programs")
async def get_programs(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "channel_partner":
        return [p for p in PROGRAMS_DATA if p["channel_partner"] == "Jagdamba Motors"]
    return PROGRAMS_DATA

# ── Channel Partners ──────────────────────────────────────────────────────────
@api_router.get("/channel-partners")
async def get_channel_partners(current_user: dict = Depends(get_current_user)):
    return CHANNEL_PARTNERS_DATA

@api_router.get("/channel-partners/{cp_id}")
async def get_channel_partner(cp_id: str, current_user: dict = Depends(get_current_user)):
    cp = next((c for c in CHANNEL_PARTNERS_DATA if c["id"] == cp_id), None)
    if not cp:
        raise HTTPException(status_code=404, detail="Channel partner not found")
    return cp

# ── Repayment ──────────────────────────────────────────────────────────────────
@api_router.get("/repayment")
async def get_repayment(current_user: dict = Depends(get_current_user)):
    return REPAYMENT_DATA

app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

