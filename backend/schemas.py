from pydantic import BaseModel
from typing import Optional, Any

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "User"
    employeeId: Optional[str] = ""

class VerifyOtpRequest(BaseModel):
    email: str
    otpCode: str

class ResendOtpRequest(BaseModel):
    email: str

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None
    employeeId: Optional[str] = ""

class ProfileUpdateRequest(BaseModel):
    email: str
    username: str
    employeeId: Optional[str] = ""
    currentPassword: Optional[str] = None
    newPassword: Optional[str] = None

class IdeaCreateRequest(BaseModel):
    title: str
    category: str
    functionalArea: Optional[str] = ""
    targetUser: Optional[str] = ""
    author: Optional[str] = "User"
    authorEmail: Optional[str] = ""
    problemStatement: str
    description: str
    proposedSolution: Optional[str] = ""
    expectedBenefits: Optional[str] = ""
    expectedOutcome: Optional[str] = ""
    attachment: Optional[Any] = None





class IdeaStatusUpdateRequest(BaseModel):
    status: str
    evaluatorNotes: Optional[str] = ""

class AnalysisReportCreateRequest(BaseModel):
    ideaId: Optional[int] = None
    ideaTitle: str
    baName: str
    baEmail: Optional[str] = ""
    reportTitle: str
    summary: str
    estimatedCost: Optional[str] = ""
    projectedRoi: Optional[str] = ""
    attachment: Optional[Any] = None

class AnalysisReportStatusUpdateRequest(BaseModel):
    status: str
    pmNotes: Optional[str] = ""

