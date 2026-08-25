import { getConfigValue } from "@/lib/platform-config";

export interface FinancingTenor {
  months: number;
  interestPct: number;
}

export interface FinancingConfig {
  defaultDepositPct: number;
  defaultTenorMonths: number;
  tenors: FinancingTenor[];
}

export const DEFAULT_FINANCING_CONFIG: FinancingConfig = {
  defaultDepositPct: 40,
  defaultTenorMonths: 6,
  tenors: [
    { months: 3, interestPct: 15 },
    { months: 6, interestPct: 20 },
    { months: 9, interestPct: 25 },
    { months: 12, interestPct: 30 },
  ],
};

export async function getFinancingConfig(): Promise<FinancingConfig> {
  const config = await getConfigValue<Partial<FinancingConfig>>(
    "financing_config",
    DEFAULT_FINANCING_CONFIG,
  );

  const tenors = Array.isArray(config.tenors)
    ? config.tenors
        .filter((tenor): tenor is FinancingTenor =>
          Number.isInteger(tenor?.months) && tenor.months > 0 && Number.isFinite(tenor?.interestPct) && tenor.interestPct >= 0,
        )
        .map((tenor) => ({ months: tenor.months, interestPct: tenor.interestPct }))
        .sort((a, b) => a.months - b.months)
    : [];

  const validTenors = tenors.length > 0 ? tenors : DEFAULT_FINANCING_CONFIG.tenors;
  const defaultTenorMonths = validTenors.some((tenor) => tenor.months === config.defaultTenorMonths)
    ? config.defaultTenorMonths!
    : validTenors[0].months;

  return {
    defaultDepositPct: Number.isFinite(config.defaultDepositPct) ? config.defaultDepositPct! : DEFAULT_FINANCING_CONFIG.defaultDepositPct,
    defaultTenorMonths,
    tenors: validTenors,
  };
}
