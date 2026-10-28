"""FastAPI backend for the Churn Risk Predictor UI.

Run:  cd backend
      pip install -r requirements.txt
      uvicorn main:app --reload --port 8000

Uses the artifacts saved by 03_train_models.py (copied to backend/model/).
"""
import os

os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("OMP_NUM_THREADS", "1")

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

MODEL_DIR = Path(__file__).parent / "model"
model = joblib.load(MODEL_DIR / "best_model.pkl")
scaler = joblib.load(MODEL_DIR / "scaler.pkl")
best_name = joblib.load(MODEL_DIR / "best_model_name.pkl")
feature_cols = joblib.load(MODEL_DIR / "feature_columns.pkl")

app = FastAPI(title="Churn Risk API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Customer(BaseModel):
    tenure: int = Field(ge=0, le=72)
    monthlyCharges: float = Field(ge=0)
    totalCharges: float = Field(ge=0)
    contract: str
    internetService: str
    paymentMethod: str
    seniorCitizen: str  # "Yes" / "No"


# Friendly names shown in the UI instead of raw column names
LABELS = {
    "InternetService_Fiber optic": "Fiber optic internet",
    "InternetService_No": "No internet service",
    "Contract_One year": "One-year contract",
    "Contract_Two year": "Two-year contract",
    "PaymentMethod_Electronic check": "Electronic check payment",
    "PaymentMethod_Mailed check": "Mailed check payment",
    "PaymentMethod_Credit card (automatic)": "Credit card payment",
    "tenure": "Months with the company",
    "MonthlyCharges": "Monthly charges",
    "TotalCharges": "Total charges",
    "ChargesPerTenure": "Charges per month of tenure",
    "SeniorCitizen": "Senior citizen",
}


# Only explain features the form actually asks about (others are baseline defaults)
FORM_FEATURES = [c for c in LABELS]
NUMERIC = {"tenure", "MonthlyCharges", "TotalCharges", "ChargesPerTenure", "SeniorCitizen"}
NOT_LABELS = {"InternetService_No": "Has internet service"}


def label_for(col: str, value: float) -> str:
    label = LABELS[col]
    if col in NUMERIC or value == 1:
        return label
    return NOT_LABELS.get(col, "No " + label[0].lower() + label[1:])


def build_features(c: Customer) -> pd.DataFrame:
    """Same steps as 02_features.py / app.py: derive, one-hot, align to training columns."""
    raw = pd.DataFrame([{
        "tenure": c.tenure,
        "MonthlyCharges": c.monthlyCharges,
        "TotalCharges": c.totalCharges,
        "SeniorCitizen": 1 if c.seniorCitizen == "Yes" else 0,
        "Contract": c.contract,
        "InternetService": c.internetService,
        "PaymentMethod": c.paymentMethod,
    }])
    raw["ChargesPerTenure"] = raw["TotalCharges"] / (raw["tenure"] + 1)
    raw["TenureBucket"] = pd.cut(
        raw["tenure"], bins=[-1, 12, 24, 48, 72], labels=["0-12", "13-24", "25-48", "49-72"]
    )
    encoded = pd.get_dummies(raw)
    # Columns the form doesn't ask about become 0 (the baseline category), as in app.py
    return encoded.reindex(columns=feature_cols, fill_value=0).astype(float)


@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok", "model": best_name}


@app.post("/predict")
@app.post("/api/predict")
def predict(customer: Customer):
    X = build_features(customer)
    X_eval = scaler.transform(X) if best_name == "Logistic Regression" else X.values
    prob = float(model.predict_proba(X_eval)[0, 1])

    # Per-feature contribution. For Logistic Regression on standardized inputs,
    # coefficient x scaled value is each feature's push on the log-odds
    # (the same quantity SHAP's LinearExplainer reports). Swap in shap.TreeExplainer
    # here if you ever switch to Random Forest / XGBoost.
    contrib = model.coef_[0] * X_eval[0]
    allowed = [i for i, col in enumerate(feature_cols) if col in FORM_FEATURES]
    top = sorted(allowed, key=lambda i: -abs(contrib[i]))[:5]
    drivers = [
        {"feature": label_for(feature_cols[i], X.iloc[0, i]), "impact": round(float(contrib[i]), 3)}
        for i in top
    ]
    return {"probability": round(prob, 3), "drivers": drivers}


# In production the built React app (../dist) is served by this same server.
# Mounted last so the API routes above take priority.
DIST_DIR = Path(__file__).parent.parent / "dist"
if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="frontend")
