import { useState } from "react";
import Field from "./Field.jsx";

// Field names match the `Customer` model in backend/main.py
const INITIAL = {
  tenure: 6,
  monthlyCharges: 85,
  totalCharges: 510,
  contract: "Month-to-month",
  internetService: "Fiber optic",
  paymentMethod: "Electronic check",
  seniorCitizen: "No",
};

export default function CustomerForm({ onSubmit, loading }) {
  const [values, setValues] = useState(INITIAL);
  const [totalEdited, setTotalEdited] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => {
      const next = { ...v, [name]: value };
      if (name === "totalCharges") setTotalEdited(true);
      // Keep total charges in step with tenure x monthly charges until the user edits it
      if (!totalEdited && (name === "tenure" || name === "monthlyCharges")) {
        next.totalCharges = Math.round(Number(next.tenure) * Number(next.monthlyCharges) * 100) / 100;
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...values,
      tenure: Number(values.tenure),
      monthlyCharges: Number(values.monthlyCharges),
      totalCharges: Number(values.totalCharges),
    });
  };

  return (
    <form className="panel form" onSubmit={handleSubmit}>
      <h2>Customer details</h2>
      <div className="grid">
        <Field label="Tenure (months)" name="tenure" type="number" min="0" max="72"
               value={values.tenure} onChange={handleChange} required />
        <Field label="Monthly charges ($)" name="monthlyCharges" type="number" min="0" step="0.01"
               value={values.monthlyCharges} onChange={handleChange} required />
        <Field label="Total charges ($)" name="totalCharges" type="number" min="0" step="0.01"
               value={values.totalCharges} onChange={handleChange} required />
        <Field label="Contract" name="contract" value={values.contract} onChange={handleChange}
               options={["Month-to-month", "One year", "Two year"]} />
        <Field label="Internet service" name="internetService" value={values.internetService} onChange={handleChange}
               options={["DSL", "Fiber optic", "No"]} />
        <Field label="Payment method" name="paymentMethod" value={values.paymentMethod} onChange={handleChange}
               options={["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"]} />
        <Field label="Senior citizen" name="seniorCitizen" value={values.seniorCitizen} onChange={handleChange}
               options={["No", "Yes"]} />
      </div>
      <button type="submit" disabled={loading}>{loading ? "Scoring…" : "Predict churn risk"}</button>
    </form>
  );
}
