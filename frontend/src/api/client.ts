import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface PredictionInput {
    gender: string;
    age: number;
    hypertension: number;
    heart_disease: number;
    smoking_history: string;
    bmi: number;
    HbA1c_level: number;
    blood_glucose_level: number;
}

export interface PredictionResponse {
    risk_score: number;
    risk_level: string;
    shap_values?: Record<string, number>;
    explanations?: Array<{
        feature: string;
        impact_score: number;
        impact_description: string;
    }>;
}

export const predictRisk = async (data: PredictionInput): Promise<PredictionResponse> => {
    const predictionRes = await apiClient.post<{ risk_score: number; risk_level: string }>('/predict', data);

    let explanations: PredictionResponse['explanations'] = [];
    try {
        const explainRes = await apiClient.post<{ explanations: PredictionResponse['explanations'] }>('/explain', data);
        explanations = explainRes.data.explanations;
    } catch (error) {
        console.warn("Could not fetch explanations:", error);
    }

    const shap_values: Record<string, number> = {};
    explanations?.forEach(exp => {
        shap_values[exp.feature] = exp.impact_score;
    });

    return {
        ...predictionRes.data,
        explanations,
        shap_values
    };
};

export interface SimulationResponse {
    original_risk: number;
    new_risk: number;
    risk_reduction: number;
}

export const simulateRisk = async (
    patient: PredictionInput,
    modifications: Record<string, any>
): Promise<SimulationResponse> => {
    const response = await apiClient.post<SimulationResponse>('/simulate', {
        patient,
        modifications
    });
    return response.data;
};

export interface ReportResponse {
    report: string;
    pdf_url?: string;
}

export const generateReport = async (patient: PredictionInput): Promise<ReportResponse> => {
    const response = await apiClient.post<ReportResponse>('/report', patient);
    return response.data;
};

export const generateSimulationReport = async (
    patient: PredictionInput,
    modifications: Record<string, any>
): Promise<ReportResponse> => {
    const response = await apiClient.post<ReportResponse>('/simulate/report', {
        patient,
        modifications
    });
    return response.data;
};

// --- New Feature Interfaces ---

export interface CohortAnalysis {
    percentiles: Record<string, number>;
}

export interface DigitalTwin {
    gender: string;
    age: number;
    bmi: number;
    HbA1c_level: number;
    blood_glucose_level: number;
    diabetes: number;
}

export const getCohortAnalysis = async (patient: PredictionInput): Promise<CohortAnalysis> => {
    const response = await apiClient.post<CohortAnalysis>('/cohort/analysis', patient);
    return response.data;
};

export const getDigitalTwins = async (patient: PredictionInput): Promise<DigitalTwin[]> => {
    const response = await apiClient.post<{ twins: DigitalTwin[] }>('/cohort/twins', patient);
    return response.data.twins;
};

export interface HistoryRecord {
    timestamp: string;
    patient_data: PredictionInput;
    risk_assessment: {
        score: number;
        level: string;
    };
}

export interface HistoryResponse {
    history: HistoryRecord[];
    trend_analysis?: {
        velocity: number;
        status: string;
    };
}

export const getHistory = async (limit: number = 10): Promise<HistoryResponse> => {
    // Determine if the backend returns List or Dict (Velocity update changed it to Dict)
    // We handle the update.
    const response = await apiClient.get<HistoryResponse | HistoryRecord[]>('/history', { params: { limit } });

    // Normalize response if backend is still old version (just in case, though we updated it)
    if (Array.isArray(response.data)) {
        return { history: response.data };
    }
    return response.data;
};

export const submitFeedback = async (
    patient: PredictionInput,
    predicted_risk: number,
    agreed: boolean,
    notes: string,
    actual_diagnosis?: number
): Promise<void> => {
    await apiClient.post('/feedback/', {
        patient_data: patient,
        predicted_risk,
        agreed,
        clinician_notes: notes,
        actual_diagnosis
    });
};

export const getFHIRBundle = async (patient: PredictionInput): Promise<any> => {
    const response = await apiClient.post('/fhir/bundle', patient);
    return response.data;
};
