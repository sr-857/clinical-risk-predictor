import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface ShapExplainerProps {
    shapValues: Record<string, number>;
}

const ShapExplainer: React.FC<ShapExplainerProps> = ({ shapValues }) => {
    // Mapping for readable feature names
    const featureLabels: Record<string, string> = {
        'age': 'Age',
        'gender': 'Gender',
        'bmi': 'BMI',
        'hypertension': 'Hypertension',
        'heart_disease': 'Heart Disease',
        'smoking_history': 'Smoking History',
        'HbA1c_level': 'HbA1c Level',
        'blood_glucose_level': 'Blood Glucose',
        'BMI_Age_Interaction': 'BMI & Age Synergy',
        'Glucose_HbA1c_Interaction': 'Glucose & HbA1c Synergy',
        'BMI_Category': 'BMI Category'
    };

    // Convert object to array and sort by absolute value to show most important features
    const data = Object.entries(shapValues)
        .map(([feature, value]) => ({
            feature: featureLabels[feature] || feature,
            value
        }))
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        .slice(0, 8); // Show top 8 features

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 w-full">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Top Risk Contributors (SHAP)
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="feature"
                            width={80}
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <ReferenceLine x={0} stroke="#9ca3af" />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#ef4444' : '#22c55e'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
                    <span>Increases Risk</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                    <span>Decreases Risk</span>
                </div>
            </div>
        </div>
    );
};

export default ShapExplainer;
