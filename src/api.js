// All network code lives here, so components stay simple and easy to test.
export async function predictChurn(customer) {
  const res = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });
  if (!res.ok) {
    throw new Error(`The server returned ${res.status}. Check that the API is running on port 8000.`);
  }
  return res.json(); // { probability: 0.73, drivers: [{ feature, impact }] }
}
