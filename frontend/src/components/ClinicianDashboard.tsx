import React, { useState } from 'react';
import RiskGauge from './RiskGauge';
import ShapExplainer from './ShapExplainer';
import SimulationDashboard from './SimulationDashboard';
import CohortCard from './CohortCard';
import TrendAnalysis from './TrendAnalysis';
import { type PredictionResponse, type PredictionInput, generateReport, submitFeedback, getFHIRBundle } from '../api/client';
import SkeletonLoader from './SkeletonLoader';
import { RefreshCcw, FileText, Cpu, Loader2, Download, Code, CheckCircle, XCircle } from 'lucide-react';

interface ClinicianDashboardProps {
    prediction: PredictionResponse;
    patientInput: PredictionInput;
    onReset: () => void;
}

const ClinicianDashboard: React.FC<ClinicianDashboardProps> = ({ prediction, patientInput, onReset }) => {
    const [report, setReport] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loadingReport, setLoadingReport] = useState(false);
    const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'submitted'>('idle');
    const [fhirVisible, setFhirVisible] = useState(false);
    const [fhirBundle, setFhirBundle] = useState<any>(null);

    const handleGenerateReport = async () => {
        setLoadingReport(true);
        try {
            const result = await generateReport(patientInput);
            setReport(result.report);
            if (result.pdf_url) {
                setPdfUrl(`http://localhost:8001${result.pdf_url}`);
            }
        } catch (error) {
            console.error("Failed to generate report:", error);
            setReport("Error: Could not generate report.");
        } finally {
            setLoadingReport(false);
        }
    };

    const handleFeedback = async (agreed: boolean) => {
        try {
            await submitFeedback(patientInput, prediction.risk_score, agreed, "Quick feedback from dashboard");
            setFeedbackStatus('submitted');
            // setTimeout(() => setShowFeedback(false), 2000);
        } catch (e) {
            console.error("Feedback failed", e);
        }
    };

    const handleDownloadFHIR = async () => {
        const bundle = await getFHIRBundle(patientInput);
        setFhirBundle(bundle);
        setFhirVisible(true);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up pb-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Clinical Assessment Results</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={handleDownloadFHIR}
                        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
                        title="View FHIR Resource"
                    >
                        <Code size={16} />
                        <span className="hidden sm:inline">FHIR R4</span>
                    </button>
                    <button
                        onClick={onReset}
                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <RefreshCcw size={16} />
                        <span>New Assessment</span>
                    </button>
                </div>
            </div>

            {/* Top Row: Gauge, Trends, Cohort */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Risk Gauge */}
                <div className="lg:col-span-1 space-y-4">
                    <RiskGauge riskScore={prediction.risk_score} />

                    {/* Feedback Widget */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mx-auto max-w-sm">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-500">Agree with this assessment?</h4>
                            {feedbackStatus === 'submitted' ? (
                                <span className="text-green-600 flex items-center text-sm"><CheckCircle size={14} className="mr-1" /> Thank you!</span>
                            ) : (
                                <div className="flex space-x-2">
                                    <button onClick={() => handleFeedback(true)} className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors" title="Agree">
                                        <CheckCircle size={20} />
                                    </button>
                                    <button onClick={() => handleFeedback(false)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Disagree">
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Middle Column: Trends & History */}
                <div className="lg:col-span-1">
                    <TrendAnalysis />
                </div>

                {/* 3. Right Column: Cohort Context */}
                <div className="lg:col-span-1">
                    <CohortCard patientData={patientInput} />
                </div>
            </div>

            {/* Second Row: Explainability & Report */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ShapExplainer shapValues={prediction.shap_values || {}} />

                {/* Report Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                            <FileText className="text-purple-600 dark:text-purple-400" size={24} />
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">AI Clinical Summary</h3>
                        </div>
                        <div className="flex space-x-2">
                            {pdfUrl && (
                                <a
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm"
                                >
                                    <Download size={16} />
                                    <span>PDF</span>
                                </a>
                            )}
                            <button
                                onClick={handleGenerateReport}
                                disabled={loadingReport}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {loadingReport ? <Loader2 className="animate-spin" size={16} /> : <Cpu size={16} />}
                                <span>Generate</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-grow">
                        {loadingReport ? (
                            <SkeletonLoader />
                        ) : report ? (
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 h-full overflow-y-auto max-h-[300px]">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{report}</p>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col justify-center items-center text-gray-400 text-center p-8">
                                <Cpu size={48} className="mb-4 opacity-20" />
                                <p>Generate an AI report to prepare this case for the EHR.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Simulation Section */}
            <div>
                <SimulationDashboard originalData={patientInput} />
            </div>

            {/* FHIR Modal */}
            {fhirVisible && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4" onClick={() => setFhirVisible(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center">
                                <Code className="mr-2 text-blue-500" /> FHIR R4 Bundle
                            </h3>
                            <button onClick={() => setFhirVisible(false)} className="text-gray-400 hover:text-gray-600"><XCircle /></button>
                        </div>
                        <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto flex-grow font-mono text-sm">
                            <pre>{JSON.stringify(fhirBundle, null, 2)}</pre>
                        </div>
                        <div className="mt-4 text-right">
                            <button onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
                                setFhirVisible(false); // simple close for now
                            }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Copy JSON
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicianDashboard;
