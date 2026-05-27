/** Budget inputs — kept for unit tests / future cost tooling. */
export type BudgetInputs = {
  distance_miles: number;
  mpg: number;
  gas_price_per_gallon: number;
  campsite_permit_cost: number;
  meals_cost: number;
  extra_cost: number;
};

export type BudgetBreakdown = {
  gas_cost: number;
  fixed_costs: number;
  total: number;
  per_person: number;
};

export const defaultBudgetInputs = (): BudgetInputs => ({
  distance_miles: 180,
  mpg: 22,
  gas_price_per_gallon: 4.5,
  campsite_permit_cost: 120,
  meals_cost: 45,
  extra_cost: 30,
});
