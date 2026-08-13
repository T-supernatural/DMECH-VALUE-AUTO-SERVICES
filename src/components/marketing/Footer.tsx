import Link from "next/link";
import { MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { Logo } from "@/components/Logo";
import { CONTACT } from "@/lib/contact";

export function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <Logo variant="footer" />
          <div className="footer-about">
            DMECH Services Limited — a decade of mechanical and auto-electrical diagnostic
            expertise since 2016, now extending into high-voltage EV service and battery
            certification. We Keep It Running.
          </div>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <Link href="/service">Vehicle Service</Link>
          <Link href="/ev-workshop">EV &amp; Battery Certification</Link>
          <Link href="/vehicles">Vehicle Import</Link>
          <Link href="/vehicles/sourcing">Reserve From Abroad</Link>
          <Link href="/vehicles/certified">Certified Nigerian-Used</Link>
          <Link href="/vehicles/request">Request a Vehicle</Link>
          <Link href="/financing">Instalment Plans</Link>
          <Link href="/#calculator">Cost Calculator</Link>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link href="/about">Why DMECH</Link>
          <Link href="/about#how">How It Works</Link>
          <Link href="/about#testimonials">Reviews</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/verify">Customer Portal</Link>
        </div>
        <div className="footer-col">
          <h4>Get In Touch</h4>
          <div className="footer-contact-item">
            <span className="fc-icon">
              <MapPin size={16} strokeWidth={1.75} />
            </span>
            <span>
              {CONTACT.addressLine1}
              <br />
              {CONTACT.addressLine2}
            </span>
          </div>
          <div className="footer-contact-item">
            <span className="fc-icon">
              <Phone size={16} strokeWidth={1.75} />
            </span>
            <span>{CONTACT.phoneDisplay}</span>
          </div>
          <div className="footer-contact-item">
            <span className="fc-icon">
              <MessageCircle size={16} strokeWidth={1.75} />
            </span>
            <span>WhatsApp: {CONTACT.whatsappDisplay}</span>
          </div>
          <div className="footer-contact-item">
            <span className="fc-icon">
              <Clock size={16} strokeWidth={1.75} />
            </span>
            <span>{CONTACT.hours}</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div>&copy; {new Date().getFullYear()} DMECH Services Limited. All rights reserved.</div>
        <div>
          Developed and Managed by{" "}
          <a href="https://serialsets.com" target="_blank" rel="noopener noreferrer">
            SERIALSETS
          </a>
        </div>
      </div>
    </footer>
  );
}
