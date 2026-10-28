import { getRiskLevel } from "../riskLevel.js";

export default function RiskResult({ result }) {
  if (!result) {
    return (
      <section className="panel result empty">
        <h2>Prediction</h2>
        <p>Fill in the customer details and select “Predict churn risk” to see the score.</p>
      </section>
    );
  }

  const percent = Math.round(result.probability * 100);
  const { label, tone } = getRiskLevel(result.probability);
  const maxImpact = Math.max(...result.drivers.map((d) => Math.abs(d.impact)), 0.01);

  return (
    <section className={`panel result ${tone}`} aria-live="polite">
      <h2>Prediction</h2>
      <p className="score" data-testid="score">{percent}%</p>
      <p className="level">{label}: chance this customer leaves</p>
      <div className="meter" role="img" aria-label={`${percent} percent churn probability`}>
        <span style={{ width: `${percent}%` }} />
      </div>

      <h3>Top factors for this customer</h3>
      <ul className="drivers">
        {result.drivers.map((d) => (
          <li key={d.feature}>
            <span className="name">{d.feature}</span>
            <span className="bar-track">
              <span
                className={`bar ${d.impact >= 0 ? "up" : "down"}`}
                style={{ width: `${(Math.abs(d.impact) / maxImpact) * 100}%` }}
              />
            </span>
            <span className="dir">{d.impact >= 0 ? "raises risk" : "lowers risk"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
