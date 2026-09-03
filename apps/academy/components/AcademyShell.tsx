import { AcademyFooter } from "./AcademyFooter";
import { AcademyNav } from "./AcademyNav";

export function AcademyShell({ children }: { children: React.ReactNode }) {
  return <div className="academy-shell"><AcademyNav />{children}<AcademyFooter /></div>;
}
