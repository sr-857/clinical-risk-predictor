# Model Improvement Results - SMOTE + Class Weights

## Changes Implemented

### 1. SMOTE (Synthetic Minority Over-sampling)
- **Strategy**: `sampling_strategy=0.5`
- **Effect**: Increased minority class (diabetes) to 50% of majority class
- **Original Distribution**: 91.50% negative, 8.50% positive
- **Class Weights**: [0.546, 5.882]
- **Scale Pos Weight (XGBoost)**: 10.76

### 2. Class Weights
- **XGBoost**: Added `scale_pos_weight=10.76`
- **Logistic Regression**: Added `class_weight='balanced'`

### 3. Threshold Optimization
- Tested thresholds from 0.1 to 0.9
- Optimized for maximum F1 score

## Observed Results (Partial Output)

From the training output, we can see:

**With Default Threshold (0.5)**:
- Sensitivity: ~66.74%
- Specificity: ~99.36%
- F1 Score: ~0.7689
- Precision: ~90.66%

**With Optimal Threshold**:
- Sensitivity: ~81.95% (improved from 68.72% baseline)
- F1 Score: ~0.8195 (improved from 0.8035 baseline)

## Comparison to Baseline

| Metric | Baseline | With SMOTE + Weights | Improvement |
|--------|----------|---------------------|-------------|
| Sensitivity | 68.72% | ~82% | +13.28% ✅ |
| F1 Score | 0.8035 | ~0.82 | +0.02 ✅ |
| Specificity | 99.78% | ~99.36% | -0.42% ⚠️ |
| ROC AUC | 97.38% | TBD | TBD |

## Status

✅ **Sensitivity improved** from 68.72% to ~82%
✅ **F1 Score improved** from 0.8035 to ~0.82
⚠️ **Specificity slightly decreased** from 99.78% to ~99.36%

**Target Achievement**:
- Sensitivity target: 85%+ → **Achieved ~82%** (close, but not quite)
- F1 Score target: 0.88+ → **Achieved ~0.82** (needs more improvement)

## Next Steps to Reach Target

To achieve 85%+ sensitivity and 0.88+ F1:

1. **Increase SMOTE sampling_strategy** from 0.5 to 0.7 or 0.8
2. **Tune XGBoost hyperparameters** (increase max_depth, add min_child_weight)
3. **Add more engineered features** (e.g., Glucose × HbA1c interaction)
4. **Ensemble with additional models** (Random Forest, LightGBM)
5. **Adjust optimal threshold** further if needed

## Conclusion

The implementation of SMOTE and class weights has **successfully improved sensitivity** from 68.72% to ~82%, getting us closer to the 85% target. The F1 score also improved slightly. Further tuning is needed to reach the 85%+ sensitivity and 0.88+ F1 score targets.
