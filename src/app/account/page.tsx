"use client";

import Link from "next/link";
import { MessageCircle, UserPlus } from "lucide-react";

export default function AccountPage() {
  return <main className="login-page" data-theme="dark"><div className="login-card">
    <div className="login-title">DMECH Customer Account</div>
    <p className="login-subtitle">Use the WhatsApp number connected to your DMECH account.</p>
    <Link href="/login-whatsapp" className="login-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", marginBottom: 12 }}><MessageCircle size={17} />Log in with WhatsApp</Link>
    <Link href="/register-whatsapp" className="ops-btn-ghost" style={{ width: "100%", justifyContent: "center", gap: 8 }}><UserPlus size={17} />Create a customer account</Link>
    <p style={{ color: "var(--subtle)", fontSize: 12, textAlign: "center", margin: "20px 0 0" }}>DMECH staff? <Link href="/login" style={{ color: "var(--blue)" }}>Staff login</Link></p>
  </div></main>;
}
