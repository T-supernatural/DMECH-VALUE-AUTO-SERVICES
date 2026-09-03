import type { Metadata } from "next";
import { SectionHeading } from "../../components/SectionHeading";
import { InterestForm } from "../../components/InterestForm";

export const metadata: Metadata = { title: "Register Interest | DMECH Academy", description: "Register your interest in practical automotive technician training with DMECH Academy.", alternates: { canonical: "/register-interest" } };

export default function RegisterInterestPage() { return <main><section className="academy-page-hero"><div className="academy-container"><div className="academy-kicker">Start here</div><h1>Tell us what you want to build.</h1><p>Register your interest in an Academy programme or describe the capability your team wants to develop. Programme availability and next steps will be confirmed by DMECH.</p></div></section><section className="academy-section academy-section-white"><div className="academy-container academy-form-layout"><div><SectionHeading eyebrow="Register interest" title="A practical next step." text="This is an initial expression of interest, not an enrollment or payment. We will use the details to understand the right programme conversation." /></div><InterestForm /></div></section></main>; }
