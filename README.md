# Churn Risk Predictor – React UI

React (Vite) front end + FastAPI backend serving the trained Logistic Regression model.

## Run it
Terminal 1 (backend):
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

Terminal 2 (front end):
    npm install
    npm run dev        # http://localhost:5173
    npm test           # unit tests

## Structure
- src/api.js            REST call (fetch + JSON)
- src/riskLevel.js      risk buckets, unit tested
- src/components/       Field, CustomerForm, RiskResult (reusable components)
- backend/main.py       FastAPI /predict endpoint using backend/model/*.pkl
- backend/model/        best_model.pkl, scaler.pkl, feature_columns.pkl, best_model_name.pkl
