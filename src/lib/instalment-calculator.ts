export function calculateInstalment(totalPriceKobo: number, depositPct: number, tenorMonths: number) {
  const depositAmountKobo = Math.round((totalPriceKobo * depositPct) / 100);
  const financedKobo = totalPriceKobo - depositAmountKobo;
  const monthlyAmountKobo = Math.round(financedKobo / tenorMonths);
  const scheduled = monthlyAmountKobo * tenorMonths;
  const remainder = financedKobo - scheduled;
  const schedule = Array.from({ length: tenorMonths }, (_, i) => monthlyAmountKobo + (i === tenorMonths - 1 ? remainder : 0));
  return { depositAmountKobo, financedKobo, monthlyAmountKobo, remainder, schedule };
}
