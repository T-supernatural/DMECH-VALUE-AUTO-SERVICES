"use client";

import { FormEvent, useState } from "react";
import { PROGRAMMES } from "@academy-lib/programmes";

export function InterestForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    window.setTimeout(() => setStatus("sent"), 500);
  }
  if (status === "sent") return <div className="academy-form-success" role="status"><strong>Interest recorded for this foundation.</strong><p>This frontend is not connected to a backend yet. Your form structure is ready for the Academy application workflow.</p></div>;
  return <form className="academy-form" onSubmit={submit} noValidate>
    <div className="academy-form-grid"><label>Full name<input name="name" required autoComplete="name" /></label><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Phone<input name="phone" type="tel" required autoComplete="tel" /></label><label>Programme of interest<select name="programme" defaultValue=""><option value="" disabled>Select a programme</option>{PROGRAMMES.map((programme) => <option key={programme.code} value={programme.code}>{programme.code} · {programme.title}</option>)}<option value="technician-standard">Technician Standard</option><option value="corporate">Corporate training</option></select></label><label>Current experience level<select name="experience" defaultValue=""><option value="" disabled>Select your level</option><option>New to automotive work</option><option>Apprentice</option><option>Working technician</option><option>Lead technician</option><option>Organisation / fleet manager</option></select></label><label>Organization / company (optional)<input name="organization" autoComplete="organization" /></label></div>
    <label>Message<textarea name="message" rows={5} placeholder="Tell us what you want to learn or develop." /></label>
    {status === "error" && <p className="academy-form-error" role="alert">Something went wrong. Please try again.</p>}
    <button className="academy-button academy-button-primary" disabled={status === "submitting"}>{status === "submitting" ? "Sending..." : "Register Interest"}</button>
  </form>;
}
