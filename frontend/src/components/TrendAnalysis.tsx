import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getHistory, type HistoryResponse } from '../api/client';
import { Activity } from 'lucide-react';

const TrendAnalysis: React.FC = () => {
    const [data, setData] = useState<HistoryResponse | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getHistory(10);
                setData(result);
            } catch (e) {
                console.error("Failed to fetch history", e);
            }
        };
        fetchData();

        // Poll every 10s to see updates if user predicts
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    if (!data || !data.history.length) return null;

    // Process for chart (reverse to show chronological)
    const chartData = [...data.history].reverse().map((rec, i) => ({
        index: i + 1,
        date: new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        risk: (rec.risk_assessment.score * 100).toFixed(1)
    }));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                    <Activity className="text-blue-600 dark:text-blue-400" size={24} />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Longitudinal Risk Velocity</h3>
                </div>
                {data.trend_analysis && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${data.trend_analysis.status.includes('Critical') ? 'bg-red-100 text-red-700' :
                        data.trend_analysis.status.includes('Warning') ? 'bg-yellow-100 text-yellow-800' :
                            data.trend_analysis.status.includes('Positive') ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                        }`}>
                        {data.trend_analysis.status}
                        <span className="ml-2 text-xs opacity-75">
                            (v={data.trend_analysis.velocity})
                        </span>
                    </div>
                )}
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} unit="%" />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="risk"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRisk)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
                Visualizing risk progression over last 10 assessments. Velocity metric indicates rate of change.
            </p>
        </div>
    );
};

export default TrendAnalysis;
