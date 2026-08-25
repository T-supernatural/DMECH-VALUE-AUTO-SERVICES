export function calculateFinancing(
  originalPriceKobo: number,
  depositPct: number,
  tenor: { months: number; interestPct: number },
) {
  const interestKobo = Math.round((originalPriceKobo * tenor.interestPct) / 100);
  const financedPriceKobo = originalPriceKobo + interestKobo;
  const depositAmountKobo = Math.round((financedPriceKobo * depositPct) / 100);
  const balanceKobo = financedPriceKobo - depositAmountKobo;
  const monthlyAmountKobo = Math.round(balanceKobo / tenor.months);
  const scheduled = monthlyAmountKobo * tenor.months;
  const remainder = balanceKobo - scheduled;
  const schedule = Array.from(
    { length: tenor.months },
    (_, index) => monthlyAmountKobo + (index === tenor.months - 1 ? remainder : 0),
  );

  return {
    interestKobo,
    financedPriceKobo,
    depositAmountKobo,
    balanceKobo,
    monthlyAmountKobo,
    remainder,
    schedule,
  };
}
