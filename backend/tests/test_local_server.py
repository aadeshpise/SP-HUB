"""
SCF Platform Backend API Tests (Local In-Memory Version)
Tests all three user flows: Maker, Checker, and Channel Partner (CP)
Covers: Auth, Invoices CRUD, Stats, Channel Partners, Programs, Repayment
"""
import pytest
from fastapi.testclient import TestClient
from backend.server import app
import time

client = TestClient(app)

# Test credentials
MAKER_CREDS = {"email": "ramesh@tatamotors.com", "password": "password"}
CHECKER_CREDS = {"email": "suresh@tatamotors.com", "password": "password"}
CP_CREDS = {"email": "ganga@jagdambamotors.com", "password": "password"}
OTP = "000000"


class TestAuthFlow:
    """Authentication flow tests for all three user roles"""
    
    def test_maker_login(self):
        """Test Maker login returns session_id"""
        response = client.post("/api/auth/login", json=MAKER_CREDS)
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert data["email"] == MAKER_CREDS["email"]
        assert data["role"] == "anchor_maker"
    
    def test_checker_login(self):
        """Test Checker login returns session_id"""
        response = client.post("/api/auth/login", json=CHECKER_CREDS)
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert data["email"] == CHECKER_CREDS["email"]
        assert data["role"] == "anchor_checker"
    
    def test_cp_login(self):
        """Test Channel Partner login returns session_id"""
        response = client.post("/api/auth/login", json=CP_CREDS)
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert data["email"] == CP_CREDS["email"]
        assert data["role"] == "channel_partner"
    
    def test_invalid_login(self):
        """Test invalid credentials return 401"""
        response = client.post("/api/auth/login", json={"email": "invalid@test.com", "password": "wrong"})
        assert response.status_code == 401
    
    def test_otp_verification_maker(self):
        """Test OTP verification for Maker returns token and user"""
        # First login
        login_resp = client.post("/api/auth/login", json=MAKER_CREDS)
        session_id = login_resp.json()["session_id"]
        
        # Verify OTP
        otp_resp = client.post("/api/auth/verify-otp", json={"session_id": session_id, "otp": OTP})
        assert otp_resp.status_code == 200
        data = otp_resp.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["role"] == "anchor_maker"
        assert data["user"]["email"] == MAKER_CREDS["email"]
    
    def test_otp_verification_checker(self):
        """Test OTP verification for Checker returns token and user"""
        login_resp = client.post("/api/auth/login", json=CHECKER_CREDS)
        session_id = login_resp.json()["session_id"]
        
        otp_resp = client.post("/api/auth/verify-otp", json={"session_id": session_id, "otp": OTP})
        assert otp_resp.status_code == 200
        data = otp_resp.json()
        assert data["user"]["role"] == "anchor_checker"
    
    def test_otp_verification_cp(self):
        """Test OTP verification for Channel Partner returns token and user"""
        login_resp = client.post("/api/auth/login", json=CP_CREDS)
        session_id = login_resp.json()["session_id"]
        
        otp_resp = client.post("/api/auth/verify-otp", json={"session_id": session_id, "otp": OTP})
        assert otp_resp.status_code == 200
        data = otp_resp.json()
        assert data["user"]["role"] == "channel_partner"
    
    def test_invalid_otp(self):
        """Test invalid OTP returns 401"""
        login_resp = client.post("/api/auth/login", json=MAKER_CREDS)
        session_id = login_resp.json()["session_id"]
        
        otp_resp = client.post("/api/auth/verify-otp", json={"session_id": session_id, "otp": "123456"})
        assert otp_resp.status_code == 401


# Helper to get token
def get_token(creds):
    login_resp = client.post("/api/auth/login", json=creds)
    session_id = login_resp.json()["session_id"]
    otp_resp = client.post("/api/auth/verify-otp", json={"session_id": session_id, "otp": OTP})
    return otp_resp.json()["token"]


class TestMakerInvoiceFlow:
    """Tests Maker role: view invoices, raise new invoices"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.token = get_token(MAKER_CREDS)
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_invoices(self):
        """Maker can view all invoices"""
        response = client.get("/api/invoices", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_get_invoices_by_status(self):
        """Maker can filter invoices by status"""
        response = client.get("/api/invoices", headers=self.headers, params={"status": "pending_checker_approval"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned should have pending status
        for inv in data:
            assert inv["status"] == "pending_checker_approval"
    
    def test_create_invoice(self):
        """Maker can raise new invoice"""
        invoice_data = {
            "invoice_no": f"TEST-INV-{int(time.time())}",
            "invoice_date": "2024-12-01",
            "due_date": "2025-01-01",
            "channel_partner": "Jagdamba Motors",
            "buyer_name": "Jagdamba Motors Pvt Ltd",
            "seller_name": "Tata Motors Ltd",
            "program_name": "Dealer Finance Program",
            "amount": 500000.0,
            "discount_rate": 8.5,
            "description": "Test invoice from pytest"
        }
        response = client.post("/api/invoices", headers=self.headers, json=invoice_data)
        assert response.status_code == 200
        data = response.json()
        assert data["invoice_no"] == invoice_data["invoice_no"]
        assert data["status"] == "pending_checker_approval"
        assert data["amount"] == invoice_data["amount"]
        assert "id" in data
        
        # Verify by GET
        get_resp = client.get(f"/api/invoices/{data['id']}", headers=self.headers)
        assert get_resp.status_code == 200
        fetched = get_resp.json()
        assert fetched["invoice_no"] == invoice_data["invoice_no"]
    
    def test_get_single_invoice(self):
        """Maker can get single invoice details"""
        # First get list
        list_resp = client.get("/api/invoices", headers=self.headers)
        invoices = list_resp.json()
        assert len(invoices) > 0
        
        invoice_id = invoices[0]["id"]
        response = client.get(f"/api/invoices/{invoice_id}", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == invoice_id


class TestCheckerInvoiceFlow:
    """Tests Checker role: view invoices, approve/reject"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.token = get_token(CHECKER_CREDS)
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_checker_cannot_create_invoice(self):
        """Checker should NOT be able to create invoices"""
        invoice_data = {
            "invoice_no": f"CHECKER-TEST-{int(time.time())}",
            "invoice_date": "2024-12-01",
            "due_date": "2025-01-01",
            "channel_partner": "Jagdamba Motors",
            "buyer_name": "Jagdamba Motors Pvt Ltd",
            "seller_name": "Tata Motors Ltd",
            "program_name": "Dealer Finance Program",
            "amount": 100000.0,
            "discount_rate": 8.5
        }
        response = client.post("/api/invoices", headers=self.headers, json=invoice_data)
        assert response.status_code == 403
    
    def test_get_invoices(self):
        """Checker can view all invoices"""
        response = client.get("/api/invoices", headers=self.headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_approve_invoice_l1(self):
        """Checker can approve pending invoice to L1"""
        # First create invoice as Maker
        maker_token = get_token(MAKER_CREDS)
        maker_headers = {"Authorization": f"Bearer {maker_token}"}
        
        invoice_data = {
            "invoice_no": f"APPROVE-TEST-{int(time.time())}",
            "invoice_date": "2024-12-01",
            "due_date": "2025-01-01",
            "channel_partner": "Jagdamba Motors",
            "buyer_name": "Jagdamba Motors Pvt Ltd",
            "seller_name": "Tata Motors Ltd",
            "program_name": "Dealer Finance Program",
            "amount": 200000.0,
            "discount_rate": 8.5
        }
        create_resp = client.post("/api/invoices", headers=maker_headers, json=invoice_data)
        invoice_id = create_resp.json()["id"]
        
        # Now approve as Checker
        approve_resp = client.put(
            f"/api/invoices/{invoice_id}/status",
            headers=self.headers,
            json={"status": "approved_l1", "remarks": "Approved at L1 by checker"}
        )
        assert approve_resp.status_code == 200
        data = approve_resp.json()
        assert data["status"] == "approved_l1"
        assert data["checker_approved_name"] == "Suresh Sharma"
    
    def test_reject_invoice(self):
        """Checker can reject pending invoice"""
        # First create invoice as Maker
        maker_token = get_token(MAKER_CREDS)
        maker_headers = {"Authorization": f"Bearer {maker_token}"}
        
        invoice_data = {
            "invoice_no": f"REJECT-TEST-{int(time.time())}",
            "invoice_date": "2024-12-01",
            "due_date": "2025-01-01",
            "channel_partner": "Jagdamba Motors",
            "buyer_name": "Jagdamba Motors Pvt Ltd",
            "seller_name": "Tata Motors Ltd",
            "program_name": "Dealer Finance Program",
            "amount": 150000.0,
            "discount_rate": 8.5
        }
        create_resp = client.post("/api/invoices", headers=maker_headers, json=invoice_data)
        invoice_id = create_resp.json()["id"]
        
        # Reject as Checker
        reject_resp = client.put(
            f"/api/invoices/{invoice_id}/status",
            headers=self.headers,
            json={"status": "rejected_checker", "remarks": "Rejected due to credit limit"}
        )
        assert reject_resp.status_code == 200
        data = reject_resp.json()
        assert data["status"] == "rejected_checker"
        assert data["remarks"] == "Rejected due to credit limit"


class TestCPInvoiceFlow:
    """Tests Channel Partner role: view invoices, final approve/reject"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.token = get_token(CP_CREDS)
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_cp_cannot_create_invoice(self):
        """CP should NOT be able to create invoices"""
        invoice_data = {
            "invoice_no": f"CP-TEST-{int(time.time())}",
            "invoice_date": "2024-12-01",
            "due_date": "2025-01-01",
            "channel_partner": "Jagdamba Motors",
            "buyer_name": "Jagdamba Motors Pvt Ltd",
            "seller_name": "Tata Motors Ltd",
            "program_name": "Dealer Finance Program",
            "amount": 100000.0,
            "discount_rate": 8.5
        }
        response = client.post("/api/invoices", headers=self.headers, json=invoice_data)
        assert response.status_code == 403
    
    def test_get_invoices_filtered_for_cp(self):
        """CP sees only their own invoices (Jagdamba Motors)"""
        response = client.get("/api/invoices", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        # All invoices should be for Jagdamba Motors
        for inv in data:
            assert inv["channel_partner"] == "Jagdamba Motors"
    
    def test_cp_final_approve(self):
        """CP can give final approval to L1-approved invoice"""
        # Create and L1 approve first
        maker_token = get_token(MAKER_CREDS)
        maker_headers = {"Authorization": f"Bearer {maker_token}"}
        checker_token = get_token(CHECKER_CREDS)
        checker_headers = {"Authorization": f"Bearer {checker_token}"}
        
        invoice_data = {
            "invoice_no": f"CP-APPROVE-{int(time.time())}",
            "invoice_date": "2024-12-01",
            "due_date": "2025-01-01",
            "channel_partner": "Jagdamba Motors",
            "buyer_name": "Jagdamba Motors Pvt Ltd",
            "seller_name": "Tata Motors Ltd",
            "program_name": "Dealer Finance Program",
            "amount": 300000.0,
            "discount_rate": 8.5
        }
        create_resp = client.post("/api/invoices", headers=maker_headers, json=invoice_data)
        invoice_id = create_resp.json()["id"]
        
        # L1 approve as Checker
        client.put(f"/api/invoices/{invoice_id}/status", headers=checker_headers, json={"status": "approved_l1", "remarks": ""})
        
        # Final approve as CP
        cp_approve_resp = client.put(
            f"/api/invoices/{invoice_id}/status",
            headers=self.headers,
            json={"status": "fully_approved", "remarks": "Final approval granted"}
        )
        assert cp_approve_resp.status_code == 200
        data = cp_approve_resp.json()
        assert data["status"] == "fully_approved"
        assert data["cp_approved_name"] == "Ganga Prasad"
    
    def test_cp_reject(self):
        """CP can reject L1-approved invoice"""
        # Create and L1 approve first
        maker_token = get_token(MAKER_CREDS)
        maker_headers = {"Authorization": f"Bearer {maker_token}"}
        checker_token = get_token(CHECKER_CREDS)
        checker_headers = {"Authorization": f"Bearer {checker_token}"}
        
        invoice_data = {
            "invoice_no": f"CP-REJECT-{int(time.time())}",
            "invoice_date": "2024-12-01",
            "due_date": "2025-01-01",
            "channel_partner": "Jagdamba Motors",
            "buyer_name": "Jagdamba Motors Pvt Ltd",
            "seller_name": "Tata Motors Ltd",
            "program_name": "Dealer Finance Program",
            "amount": 250000.0,
            "discount_rate": 8.5
        }
        create_resp = client.post("/api/invoices", headers=maker_headers, json=invoice_data)
        invoice_id = create_resp.json()["id"]
        
        # L1 approve as Checker
        client.put(f"/api/invoices/{invoice_id}/status", headers=checker_headers, json={"status": "approved_l1", "remarks": ""})
        
        # Reject as CP
        cp_reject_resp = client.put(
            f"/api/invoices/{invoice_id}/status",
            headers=self.headers,
            json={"status": "rejected_cp", "remarks": "Rejected by channel partner"}
        )
        assert cp_reject_resp.status_code == 200
        data = cp_reject_resp.json()
        assert data["status"] == "rejected_cp"


class TestStatsAPI:
    """Tests /api/stats endpoint for all roles"""
    
    def test_maker_stats(self):
        """Maker can get stats"""
        token = get_token(MAKER_CREDS)
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_invoices" in data
        assert "pending_checker" in data
        assert "approved_l1" in data
        assert "rejected" in data
        assert "fully_approved" in data
        assert "approved_amount" in data
    
    def test_checker_stats(self):
        """Checker can get stats"""
        token = get_token(CHECKER_CREDS)
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_invoices" in data
    
    def test_cp_stats_filtered(self):
        """CP gets stats filtered to their channel partner"""
        token = get_token(CP_CREDS)
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_invoices" in data


class TestChannelPartnersAPI:
    """Tests /api/channel-partners endpoint"""
    
    def test_get_channel_partners(self):
        """Can get channel partners list"""
        token = get_token(CHECKER_CREDS)
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/channel-partners", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check required fields
        first = data[0]
        assert "id" in first
        assert "name" in first
        assert "sanctioned_limit" in first
        assert "utilized" in first
        assert "available" in first
    
    def test_get_channel_partner_by_id(self):
        """Can get single channel partner details"""
        token = get_token(CHECKER_CREDS)
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/channel-partners/CP001", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "CP001"
        assert "sanctioned_limit" in data
    
    def test_channel_partner_not_found(self):
        """Returns 404 for non-existent CP"""
        token = get_token(CHECKER_CREDS)
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/channel-partners/INVALID", headers=headers)
        assert response.status_code == 404


class TestProgramsAPI:
    """Tests /api/programs endpoint"""
    
    def test_get_programs_maker(self):
        """Maker can get all programs"""
        token = get_token(MAKER_CREDS)
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/programs", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_get_programs_cp_filtered(self):
        """CP gets only their programs"""
        token = get_token(CP_CREDS)
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/programs", headers=headers)
        assert response.status_code == 200
        data = response.json()
        # All should be Jagdamba Motors
        for p in data:
            assert p["channel_partner"] == "Jagdamba Motors"


class TestRepaymentAPI:
    """Tests /api/repayment endpoint"""
    
    def test_get_repayment(self):
        """Can get repayment ledger"""
        token = get_token(CP_CREDS)
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/repayment", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check required fields
        first = data[0]
        assert "invoice_no" in first
        assert "invoice_amount" in first
        assert "disbursed_amount" in first
        assert "status" in first


class TestUnauthorizedAccess:
    """Tests for unauthorized access"""
    
    def test_invoices_without_token(self):
        """Cannot access invoices without token"""
        response = client.get("/api/invoices")
        assert response.status_code in [401, 403]
    
    def test_stats_without_token(self):
        """Cannot access stats without token"""
        response = client.get("/api/stats")
        assert response.status_code in [401, 403]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
