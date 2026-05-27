import { describe, expect, it } from "vitest";
import { calculateBudget, calculateGasCost, compareScenarios } from "./budget";
import { defaultBudgetInputs } from "../types/budget";

describe("calculateGasCost", () => {
  it("computes round-trip gas from miles, mpg, and price", () => {
    const inputs = { ...defaultBudgetInputs(), distance_miles: 100, mpg: 25, gas_price_per_gallon: 5 };
    expect(calculateGasCost(inputs)).toBe(20);
  });
});

describe("calculateBudget", () => {
  it("splits gas, fixed costs, and per-person share", () => {
    const inputs = {
      distance_miles: 100,
      mpg: 25,
      gas_price_per_gallon: 5,
      campsite_permit_cost: 50,
      meals_cost: 40,
      extra_cost: 10,
    };
    const result = calculateBudget(inputs, 10);
    expect(result.gas_cost).toBe(20);
    expect(result.fixed_costs).toBe(100);
    expect(result.total).toBe(120);
    expect(result.per_person).toBe(12);
  });
});

describe("compareScenarios", () => {
  it("reports deltas between baseline and variant", () => {
    const base = defaultBudgetInputs();
    const variant = { ...base, gas_price_per_gallon: 6 };
    const delta = compareScenarios("Higher gas", base, 12, variant, 12);
    expect(delta.total_diff).toBeGreaterThan(0);
    expect(delta.per_person_diff).toBeGreaterThan(0);
  });
});
