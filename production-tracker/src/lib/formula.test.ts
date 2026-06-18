import { describe, expect, it } from "vitest";

import { evaluateFormula } from "@/lib/formula";

describe("evaluateFormula", () => {
  it("calculates arithmetic expressions with field references", () => {
    expect(evaluateFormula("{unit_cost} * {quantity}", { unit_cost: 12.5, quantity: 8 })).toBe(100);
    expect(evaluateFormula("({score} / {total}) * 100", { score: 42, total: 50 })).toBe(84);
  });

  it("treats missing referenced values as zero", () => {
    expect(evaluateFormula("{price} * {missing_quantity}", { price: 99 })).toBe(0);
  });

  it("rejects non-math expressions instead of evaluating arbitrary code", () => {
    expect(evaluateFormula("process.exit()", {})).toBe("#ERROR");
    expect(evaluateFormula("{amount} + Math.max(1, 2)", { amount: 20 })).toBe("#ERROR");
  });
});
