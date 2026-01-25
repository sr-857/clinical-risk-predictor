from pydantic import BaseModel
from typing import List, Dict, Any

class PatientRequest(BaseModel):
    gender: str
    age: float
    hypertension: int
    heart_disease: int
    smoking_history: str
    bmi: float
    HbA1c_level: float
    blood_glucose_level: float

class RiskResponse(BaseModel):
    risk_score: float
    risk_level: str

class ExplanationResponse(BaseModel):
    explanations: List[Dict[str, Any]]

class ReportResponse(BaseModel):
    report: str
    pdf_url: str = None

class SimulationRequest(BaseModel):
    patient: PatientRequest
    modifications: Dict[str, Any]

class SimulationResponse(BaseModel):
    original_risk: float
    new_risk: float
    risk_reduction: float

class CohortAnalysisResponse(BaseModel):
    percentiles: Dict[str, float]

class DigitalTwin(BaseModel):
    gender: str
    age: float
    hypertension: int
    heart_disease: int
    smoking_history: str
    bmi: float
    HbA1c_level: float
    blood_glucose_level: float
    diabetes: int

class DigitalTwinResponse(BaseModel):
    twins: List[DigitalTwin]

class FeedbackRequest(BaseModel):
    patient_data: PatientRequest
    predicted_risk: float
    actual_diagnosis: int = None
    clinician_notes: str = ""
    agreed: bool

