import { AcademyFooter } from "@academy-components/AcademyFooter";
import { AcademyNav } from "@academy-components/AcademyNav";

export function AcademyShell({ children }: { children: React.ReactNode }) {
  return <div className="academy-shell"><AcademyNav />{children}<AcademyFooter /></div>;
}
