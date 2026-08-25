import { redirect } from "next/navigation";
import { TopBar } from "@/components/ops/TopBar";
import { FinancingSettingsForm } from "@/components/ops/FinancingSettingsForm";
import { roleGuard } from "@/lib/guards";
import { getFinancingConfig } from "@/lib/financing-config";

export default async function FinancingSettingsPage() {
  const staff = await roleGuard(["super_admin", "managing_partner", "it_manager"]);
  if (!staff) redirect("/ops/dashboard");

  return (
    <>
      <TopBar title="Financing Settings" />
      <div className="ops-content">
        <FinancingSettingsForm initialConfig={await getFinancingConfig()} />
      </div>
    </>
  );
}
