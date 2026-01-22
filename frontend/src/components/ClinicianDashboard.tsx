import React from 'react';
import RiskGauge from './RiskGauge';
import ShapExplainer from './ShapExplainer';
import SimulationDashboard from './SimulationDashboard';
import { type PredictionResponse } from '../api/client';
import { RefreshCcw } from 'lucide-react';

interface ClinicianDashboardProps {
    prediction: PredictionResponse;
    onReset: () => void;
}

const ClinicianDashboard: React.FC<ClinicianDashboardProps> = ({ prediction, onReset }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Clinical Assessment Results</h2>
                <button
                    onClick={onReset}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <RefreshCcw size={16} />
                    <span>New Assessment</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Gauge Section */}
                <div className="space-y-4">
                    <RiskGauge riskScore={prediction.risk_score} />

                </div>

                {/* SHAP Explainer Section */}
                <div>
                    <ShapExplainer shapValues={prediction.shap_values || {}} />
                </div>
            </div>

            {/* Simulation Section */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <SimulationDashboard originalData={prediction as any} />
            </div>
        </div>
    );
};

export default ClinicianDashboard;
