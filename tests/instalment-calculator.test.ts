import { describe, it, expect } from 'vitest';
import { calculateInstalment } from '../src/lib/instalment-calculator';

describe('calculateInstalment', () => {
  it('calculates deposit, financed, monthly, remainder, and schedule correctly', () => {
    const total = 1_000_000; // in kobo (₦10,000)
    const depositPct = 40; // 40%
    const tenor = 6;
    const result = calculateInstalment(total, depositPct, tenor);
    expect(result.depositAmountKobo).toBe(Math.round((total * depositPct) / 100));
    const financed = total - result.depositAmountKobo;
    expect(result.financedKobo).toBe(financed);
    expect(result.monthlyAmountKobo).toBe(Math.round(financed / tenor));
    // schedule length
    expect(result.schedule.length).toBe(tenor);
    // sum of schedule equals financed
    expect(result.schedule.reduce((a, b) => a + b, 0)).toBe(financed);
  });
});
