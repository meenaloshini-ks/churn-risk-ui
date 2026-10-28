import { useState } from "react";
import CustomerForm from "./components/CustomerForm.jsx";
import RiskResult from "./components/RiskResult.jsx";
import { predictChurn } from "./api.js";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePredict = async (customer) => {
    setLoading(true);
    setError("");
    try {
      setResult(await predictChurn(customer));
    } catch (err) {
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <header>
        <h1>Churn Risk Predictor</h1>
        <p>Score a telecom customer and see which factors drive the prediction.</p>
      </header>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="layout">
        <CustomerForm onSubmit={handlePredict} loading={loading} />
        <RiskResult result={result} />
      </div>
    </main>
  );
}
