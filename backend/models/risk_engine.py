import joblib
import os
import pandas as pd
import numpy as np
import shap

class RiskEngine:
    def __init__(self, model_dir="backend/models"):
        self.model_path = os.path.join(model_dir, "risk_pipeline_v1.joblib")
        self.bg_path = os.path.join(model_dir, "background_data.joblib")
        
        # Load pipeline
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model not found at {self.model_path}. Run train_pro.py first.")
            
        self.pipeline = joblib.load(self.model_path)
        
        # Initialize Explainer
        self.explainer = None  # Disable SHAP for now due to version compatibility issues
        self.background_data = None
        self.feature_columns = None
        
        # Try to load background data for SHAP (optional, not critical)
        if os.path.exists(self.bg_path):
            try:
                self.background_data = joblib.load(self.bg_path)
                # Store columns for reconstruction
                self.feature_columns = self.background_data.columns.tolist()
            except Exception as bg_e:
                print(f"Warning: Could not load background data for explanations: {bg_e}")

    def _preprocess(self, data: dict) -> pd.DataFrame:
        """
        Replicates the preprocessing steps from training.
        """
        # Convert single dict to DataFrame
        df = pd.DataFrame([data])
        
        # Feature Engineering: BMI Categories
        if 'bmi' in df.columns:
            # Replicate pd.cut logic manually or using numpy to be safe/fast
            # bins=[0, 18.5, 24.9, 29.9, 100], labels=['Underweight', 'Normal', 'Overweight', 'Obese']
            conditions = [
                (df['bmi'] <= 18.5),
                (df['bmi'] > 18.5) & (df['bmi'] <= 24.9),
                (df['bmi'] > 24.9) & (df['bmi'] <= 29.9),
                (df['bmi'] > 29.9)
            ]
            choices = ['Underweight', 'Normal', 'Overweight', 'Obese']
            df['BMI_Category'] = np.select(conditions, choices, default='Obese')

        # Feature Engineering: Interactions
        if 'bmi' in df.columns and 'age' in df.columns:
            df['BMI_Age_Interaction'] = df['bmi'] * df['age']
            
        if 'blood_glucose_level' in df.columns and 'HbA1c_level' in df.columns:
            df['Glucose_HbA1c_Interaction'] = df['blood_glucose_level'] * df['HbA1c_level']
        
        return df

    def _predict_wrapper(self, data):
        """
        Wrapper to handle SHAP passing numpy arrays instead of DataFrames.
        """
        if isinstance(data, np.ndarray):
            # Reconstruct DataFrame using stored column names
            data = pd.DataFrame(data, columns=self.feature_columns)
        
        return self.pipeline.predict_proba(data)

    def predict_risk(self, patient_data: dict) -> float:
        """
        Returns probability of diabetes (0.0 to 1.0)
        """
        df = self._preprocess(patient_data)
        
        try:
            prob = self.pipeline.predict_proba(df)[0, 1]
            return float(prob)
        except Exception as e:
            print(f"Prediction error: {e}")
            raise

    def explain_risk(self, patient_data: dict) -> list:
        """
        Returns list of feature contributions.
        """
        if not self.explainer:
            return []
            
        df = self._preprocess(patient_data)
        
        # SHAP values for binary classification (nsamples, nfeatures)
        shap_values = self.explainer.shap_values(df)
        
        # Handle different SHAP output formats
        if isinstance(shap_values, list):
            # List of arrays [class0_matrix, class1_matrix]
            # Take class 1, sample 0
            risk_shap = shap_values[1][0]
        elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
            # 3D Array (samples, features, classes)
            # Take sample 0, all features, class 1
            risk_shap = shap_values[0, :, 1]
        else:
            # Unexpected format, fallback to printing shape and returning empty
            print(f"Unexpected SHAP output format: {type(shap_values)}")
            return []
        
        explanations = []
        feature_names = df.columns
        
        for name, value in zip(feature_names, risk_shap):
            impact = "Neutral"
            if value > 0.01: impact = "Increase Risk"
            elif value < -0.01: impact = "Decrease Risk"
            
            explanations.append({
                "feature": name,
                "impact_score": float(value),
                "impact_description": impact
            })
            
        # Sort by absolute impact
        explanations.sort(key=lambda x: abs(x['impact_score']), reverse=True)
        return explanations
