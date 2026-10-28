import { render, screen } from "@testing-library/react";
import RiskResult from "./RiskResult.jsx";
import { getRiskLevel } from "../riskLevel.js";

const sample = {
  probability: 0.73,
  drivers: [
    { feature: "Month-to-month contract", impact: 0.4 },
    { feature: "Long tenure", impact: -0.2 },
  ],
};

test("shows the empty state before any prediction", () => {
  render(<RiskResult result={null} />);
  expect(screen.getByText(/Fill in the customer details/i)).toBeInTheDocument();
});

test("shows percentage, risk label and drivers", () => {
  render(<RiskResult result={sample} />);
  expect(screen.getByTestId("score")).toHaveTextContent("73%");
  expect(screen.getByText(/High risk/)).toBeInTheDocument();
  expect(screen.getByText("Month-to-month contract")).toBeInTheDocument();
  expect(screen.getByText("lowers risk")).toBeInTheDocument();
});

test("getRiskLevel buckets probabilities", () => {
  expect(getRiskLevel(0.1).tone).toBe("low");
  expect(getRiskLevel(0.45).tone).toBe("medium");
  expect(getRiskLevel(0.9).tone).toBe("high");
});
