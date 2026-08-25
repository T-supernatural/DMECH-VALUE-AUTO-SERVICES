import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { roleGuard } from "@/lib/guards";
import { logAudit } from "@/lib/audit";
import { getFinancingConfig } from "@/lib/financing-config";
import type { FinancingConfig } from "@/lib/financing-config";

const EDIT_ROLES = ["super_admin", "managing_partner", "it_manager"] as const;

function isValidConfig(value: unknown): value is FinancingConfig {
  if (!value || typeof value !== "object") return false;
  const config = value as Partial<FinancingConfig>;
  return Number.isFinite(config.defaultDepositPct) &&
    config.defaultDepositPct! > 0 && config.defaultDepositPct! < 100 &&
    Number.isInteger(config.defaultTenorMonths) &&
    Array.isArray(config.tenors) && config.tenors.length > 0 &&
    config.tenors.every((tenor) =>
      Number.isInteger(tenor?.months) && tenor.months > 0 &&
      Number.isFinite(tenor?.interestPct) && tenor.interestPct >= 0 && tenor.interestPct <= 100,
    ) && config.tenors.some((tenor) => tenor.months === config.defaultTenorMonths);
}

export async function GET() {
  const staff = await roleGuard([...EDIT_ROLES]);
  if (!staff) return NextResponse.json({ error: "Not permitted to view financing settings." }, { status: 403 });
  return NextResponse.json({ config: await getFinancingConfig() });
}

export async function PATCH(request: Request) {
  const staff = await roleGuard([...EDIT_ROLES]);
  if (!staff) return NextResponse.json({ error: "Not permitted to edit financing settings." }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!isValidConfig(body)) {
    return NextResponse.json({ error: "Enter a valid deposit percentage and at least one tenor with an interest rate." }, { status: 400 });
  }

  const tenors = body.tenors
    .map((tenor) => ({ months: Math.round(tenor.months), interestPct: Number(tenor.interestPct) }))
    .sort((a, b) => a.months - b.months);
  if (new Set(tenors.map((tenor) => tenor.months)).size !== tenors.length) {
    return NextResponse.json({ error: "Each financing tenor must be unique." }, { status: 400 });
  }

  const config: FinancingConfig = {
    defaultDepositPct: Number(body.defaultDepositPct),
    defaultTenorMonths: Math.round(body.defaultTenorMonths),
    tenors,
  };
  const service = createServiceClient();
  const { error } = await service
    .from("platform_config")
    .upsert({ key: "financing_config", value: config, updated_by: staff.id, updated_at: new Date().toISOString() });

  if (error) {
    console.error("Financing configuration update failed", { code: error.code, message: error.message });
    return NextResponse.json({ error: "Could not save financing settings." }, { status: 500 });
  }

  await logAudit({ userId: staff.id, action: "update", tableName: "platform_config", recordId: null, newValue: { financing_config: config } });
  return NextResponse.json({ ok: true, config });
}
