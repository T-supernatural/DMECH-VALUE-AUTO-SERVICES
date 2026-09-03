"use client";

import { MessageCircle, Phone } from "lucide-react";
import { CONTACT, whatsappHref } from "@/lib/contact";
import { trackMarketingEvent } from "@/components/marketing/Analytics";

export function WorkshopContactLinks() {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap", marginTop: 22, color: "var(--muted)", fontSize: 14 }}>
      <a href={`tel:${CONTACT.phoneHref}`} onClick={() => trackMarketingEvent("phone_click", { source: "workshop" })} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
        <Phone size={16} /> {CONTACT.phoneDisplay}
      </a>
      <a href={whatsappHref("Hi DMECH, I would like to book a workshop service.")} onClick={() => trackMarketingEvent("whatsapp_click", { source: "workshop" })} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
        <MessageCircle size={16} /> WhatsApp
      </a>
    </div>
  );
}
