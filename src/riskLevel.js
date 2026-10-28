// Pure function: easy to unit test, reused by the UI.
export function getRiskLevel(probability) {
  if (probability >= 0.6) return { label: "High risk", tone: "high" };
  if (probability >= 0.3) return { label: "Medium risk", tone: "medium" };
  return { label: "Low risk", tone: "low" };
}
