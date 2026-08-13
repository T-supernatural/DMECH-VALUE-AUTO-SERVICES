import { redirect } from "next/navigation";
import { TopBar } from "@/components/ops/TopBar";
import { DocumentUploadManager } from "@/components/ops/DocumentUploadManager";
import { Reveal } from "@/components/marketing/Reveal";
import { customerGuard } from "@/lib/guards";

export default async function PortalDocumentsPage() {
  const customer = await customerGuard();
  if (!customer) redirect("/verify");

  return (
    <>
      <TopBar title="Documents" />
      <div className="ops-content">
        <Reveal>
          <DocumentUploadManager customerId={customer.id} canUpload />
        </Reveal>
      </div>
    </>
  );
}
