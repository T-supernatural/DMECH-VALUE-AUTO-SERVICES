"use client";

import { useState } from "react";

export interface FaqItem {
  q: string;
  a: string;
}

// The real click-to-expand accordion behavior, extracted out of FAQ.tsx so
// pages with their own distinct FAQ content (ev-workshop, certified) can
// use genuine interactivity too, instead of each faking a static
// "always open" list with `.faq-item.open`/`cursor:default`.
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {items.map((item, i) => (
        <div className={`faq-item ${openIndex === i ? "open" : ""}`} key={item.q}>
          <button className="faq-q" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
            {item.q}
            <span className="faq-icon">+</span>
          </button>
          <div className="faq-a">
            <div className="faq-a-inner">{item.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
