import { MessageCircle, Phone } from "lucide-react";
import { CONTACT, whatsappHref } from "@/lib/contact";

interface CTASectionProps {
  heading?: string;
  body?: string;
  whatsappMessage?: string;
}

export function CTASection({
  heading = "Ready to Import Your Next Vehicle?",
  body = "Talk to us today. Whether you know exactly what you want or need guidance, we'll walk you through every step.",
  whatsappMessage = "Hi DMECH, I want to import a vehicle",
}: CTASectionProps) {
  return (
    <section className="cta-section dark-gradient" id="contact">
      <h2>{heading}</h2>
      <p>{body}</p>
      <div className="cta-buttons">
        <a
          className="cta-main cta-wa"
          href={whatsappHref(whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={16} strokeWidth={2} /> Chat on WhatsApp
        </a>
        <a className="cta-secondary" href={`tel:${CONTACT.phoneHref}`}>
          <Phone size={16} strokeWidth={2} /> Call: {CONTACT.phoneDisplay}
        </a>
      </div>
    </section>
  );
}
