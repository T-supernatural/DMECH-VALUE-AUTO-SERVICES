import { describe, expect, it } from "vitest";
import { calculateFinancing } from "../src/lib/financing-calculator";

describe("calculateFinancing", () => {
  it("adds interest before applying the deposit", () => {
    const result = calculateFinancing(1_250_000_000, 40, { months: 3, interestPct: 15 });

    expect(result.interestKobo).toBe(187_500_000);
    expect(result.financedPriceKobo).toBe(1_437_500_000);
    expect(result.depositAmountKobo).toBe(575_000_000);
    expect(result.balanceKobo).toBe(862_500_000);
    expect(result.monthlyAmountKobo).toBe(287_500_000);
    expect(result.schedule.reduce((total, amount) => total + amount, 0)).toBe(result.balanceKobo);
  });
});