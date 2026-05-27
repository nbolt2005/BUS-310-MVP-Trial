import type { BudgetBreakdown, BudgetInputs } from "../types/budget";

/**
 * Round-trip driving miles × price per gallon ÷ mpg.
 * `distance_miles` is total vehicle miles for the trip (round-trip).
 */
export function calculateGasCost(inputs: BudgetInputs): number {
  const { distance_miles, mpg, gas_price_per_gallon } = inputs;
  if (mpg <= 0) return 0;
  return (distance_miles / mpg) * gas_price_per_gallon;
}

export function calculateBudget(
  inputs: BudgetInputs,
  capacity: number,
): BudgetBreakdown {
  const gas_cost = calculateGasCost(inputs);
  const fixed_costs =
    inputs.campsite_permit_cost + inputs.meals_cost + inputs.extra_cost;
  const total = gas_cost + fixed_costs;
  const safeCapacity = Math.max(capacity, 1);
  return {
    gas_cost: round2(gas_cost),
    fixed_costs: round2(fixed_costs),
    total: round2(total),
    per_person: round2(total / safeCapacity),
  };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type ScenarioDelta = {
  label: string;
  baseline: BudgetBreakdown;
  variant: BudgetBreakdown;
  total_diff: number;
  per_person_diff: number;
};

export function compareScenarios(
  label: string,
  baselineInputs: BudgetInputs,
  baselineCapacity: number,
  variantInputs: BudgetInputs,
  variantCapacity: number,
): ScenarioDelta {
  const baseline = calculateBudget(baselineInputs, baselineCapacity);
  const variant = calculateBudget(variantInputs, variantCapacity);
  return {
    label,
    baseline,
    variant,
    total_diff: round2(variant.total - baseline.total),
    per_person_diff: round2(variant.per_person - baseline.per_person),
  };
}
