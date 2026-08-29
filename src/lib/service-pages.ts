// One dedicated page per workshop service category, for local SEO (Lagos-
// targeted). Slugs and names correspond to the categories already defined
// in ServiceBookingForm.tsx's SERVICES list — no new categories invented.
// Copy stays honest and generic (what's covered, no fabricated
// certifications) matching the honesty-gate convention used everywhere
// else on this site.
import {
  Search,
  Cog,
  Zap,
  Snowflake,
  Car,
  Disc,
  Paintbrush,
  BatteryCharging,
  Wrench,
  Phone,
  Receipt,
  type LucideIcon,
} from "lucide-react";

export interface ServiceFaqItem {
  q: string;
  a: string;
}

export interface ServicePageData {
  slug: string;
  name: string;
  icon: LucideIcon;
  seoTitle: string;
  seoDescription: string;
  intro: string;
  quickAnswer: string;
  symptoms: string[];
  covers: string[];
  faq: ServiceFaqItem[];
}

export const SERVICE_PAGES: ServicePageData[] = [
  {
    slug: "diagnostics",
    name: "Car Diagnostics",
    icon: Search,
    seoTitle: "Car Diagnostics in Lagos — DMECH Services Limited",
    seoDescription:
      "Computerized car diagnostics in Lagos — find the real fault before you pay for repairs. Book a diagnostic check with DMECH's workshop.",
    intro:
      "Not sure what's actually wrong with your car? Our diagnostic check reads your vehicle's onboard computer and inspects the affected systems directly, so you know the real fault before any repair work starts — not a guess.",
    quickAnswer:
      "Car diagnostics in Lagos helps you find the real fault before you spend money on repairs.",
    symptoms: [
      "Engine warning light is on",
      "The car is rough or stalling",
      "Performance feels inconsistent",
      "The battery keeps draining",
    ],
    covers: [
      "Engine warning light investigation",
      "Onboard computer (OBD) fault code reading",
      "Sensor and wiring checks",
      "Pre-purchase inspection for used vehicles",
    ],
    faq: [
      {
        q: "Why does my check engine light come on?",
        a: "It usually means the vehicle's computer has detected a fault. The issue could be minor or serious, so a proper diagnostic read is the best way to know what is actually wrong before you repair anything.",
      },
      {
        q: "Can diagnostics tell me the issue before repair starts?",
        a: "Yes. That is exactly what diagnostics is for. We identify the fault and explain the probable cause before we begin the repair.",
      },
      {
        q: "Do you diagnose electrical faults too?",
        a: "Yes. Many electrical faults show up as engine or performance problems, so we check the full system instead of replacing parts by guesswork.",
      },
    ],
  },
  {
    slug: "engine",
    name: "Engine Repair",
    icon: Cog,
    seoTitle: "Engine Repair in Lagos — DMECH Services Limited",
    seoDescription:
      "Engine repair and overhaul in Lagos — knocking, overheating, oil leaks, and full engine replacement. Book with DMECH's workshop.",
    intro:
      "From a knocking sound to a full engine replacement, our workshop handles engine problems at every level — diagnosed properly first, then repaired or replaced with parts matched to your vehicle.",
    quickAnswer:
      "Engine repair in Lagos is needed when the car has knocking, overheating, poor performance, or repeated warning signs.",
    symptoms: [
      "Knocking or rattling sounds",
      "Overheating or coolant loss",
      "Rough idle and poor acceleration",
      "Oil leaks or engine warning light",
    ],
    covers: [
      "Engine knocking, overheating, and oil leak repair",
      "Head gasket repair",
      "Timing belt/chain replacement",
      "Full engine replacement (used or new)",
    ],
    faq: [
      {
        q: "How do I know my engine needs repair?",
        a: "If you hear unusual sounds, notice poor performance, see warning lights, or the engine overheats, it needs attention so the true fault can be diagnosed before you spend money on the wrong repair.",
      },
      {
        q: "Is it better to repair or replace the engine?",
        a: "It depends on the engine condition, the vehicle value, and the repair cost. We explain your options clearly so you can make an informed decision.",
      },
      {
        q: "Do you work on petrol and diesel engines?",
        a: "Yes. We diagnose and repair engine issues based on the condition of the vehicle, not the fuel type alone.",
      },
    ],
  },
  {
    slug: "electrical",
    name: "Auto Electrical Repair",
    icon: Zap,
    seoTitle: "Car Electrical Repair in Lagos — DMECH Services Limited",
    seoDescription:
      "Car battery, alternator, starter motor, and ignition repair in Lagos. Book an auto electrical diagnosis with DMECH's workshop.",
    intro:
      "Won't start, battery keeps dying, dashboard lights acting up — our electricians trace the fault to its actual source rather than replacing parts by trial and error.",
    quickAnswer:
      "Auto electrical repair in Lagos helps fix battery, charging, starter, wiring, and ignition faults before they create bigger problems.",
    symptoms: [
      "Car will not start",
      "Battery keeps dying",
      "Dashboard lights flicker",
      "Charging system faults",
    ],
    covers: [
      "Battery testing and replacement",
      "Alternator repair and replacement",
      "Starter motor repair",
      "Ignition system and wiring faults",
    ],
    faq: [
      {
        q: "Why does my battery keep dying?",
        a: "A battery may be weak, or the charging system may not be working properly. A diagnosis tells you whether the problem is the battery, alternator, or another electrical fault.",
      },
      {
        q: "Can you diagnose electrical faults without guessing?",
        a: "Yes. We test the actual system and trace the fault to the real source before recommending a fix.",
      },
      {
        q: "Is a bad alternator different from a bad battery?",
        a: "Yes. The battery stores power, while the alternator charges it while the car runs. A proper diagnosis checks both.",
      },
    ],
  },
  {
    slug: "ac",
    name: "Car AC Repair",
    icon: Snowflake,
    seoTitle: "Car AC Repair in Lagos — DMECH Services Limited",
    seoDescription:
      "Car air conditioning repair and regas in Lagos — blowing warm, weak airflow, or AC not turning on. Book with DMECH's workshop.",
    intro:
      "Lagos heat makes a working AC non-negotiable. Whether it's blowing warm, barely blowing at all, or not switching on, we find out why before recommending a fix.",
    quickAnswer:
      "Car AC repair in Lagos helps fix weak airflow, warm air, or AC systems that are not working properly during hot weather.",
    symptoms: [
      "AC blows warm or weak air",
      "Cooling is inconsistent",
      "The AC won't turn on",
      "Cabin smells or airflow is poor",
    ],
    covers: [
      "AC regas (refrigerant top-up)",
      "Compressor repair and replacement",
      "Blocked or leaking AC lines",
      "Cabin filter and blower issues",
    ],
    faq: [
      {
        q: "Why is my AC blowing warm air?",
        a: "It may be low on refrigerant, have a blocked line, or be dealing with a failing compressor or blower issue. A diagnosis shows the real cause.",
      },
      {
        q: "Do you handle AC regas and leak checks?",
        a: "Yes. We inspect the system, identify the cause, and explain the repair before work begins.",
      },
      {
        q: "Is it normal for AC to become weak in Lagos heat?",
        a: "No. Weak cooling or no cooling is a sign you should inspect the system before it gets worse.",
      },
    ],
  },
  {
    slug: "suspension",
    name: "Suspension Repair",
    icon: Car,
    seoTitle: "Suspension Repair in Lagos — DMECH Services Limited",
    seoDescription:
      "Shock absorber, strut, and suspension repair in Lagos — for a smoother ride and safer handling on Lagos roads. Book with DMECH.",
    intro:
      "Lagos roads are hard on suspension. A bouncy ride, uneven tyre wear, or clunking over bumps usually points to worn suspension components — we inspect and replace only what's actually worn.",
    quickAnswer:
      "Suspension repair in Lagos is needed when the ride feels bouncy, uneven, or unsafe over potholes and rough road surfaces.",
    symptoms: [
      "Bouncy or unstable ride",
      "Uneven tyre wear",
      "Clunking over potholes",
      "Steering feels loose or delayed",
    ],
    covers: [
      "Shock absorber and strut replacement",
      "Bushings and control arm repair",
      "Wheel alignment referral",
      "Noise and handling diagnosis",
    ],
    faq: [
      {
        q: "How do I know my suspension is bad?",
        a: "If the ride feels bouncy, the car shakes over bumps, or the tyres wear unevenly, it may be time for a suspension inspection.",
      },
      {
        q: "Can suspension issues affect safety?",
        a: "Yes. Worn suspension parts affect control, braking, and tyre wear, so it is important to inspect them early.",
      },
      {
        q: "Do you check wheel alignment too?",
        a: "We can inspect the suspension and advise on alignment or related issues that affect your ride quality and safety.",
      },
    ],
  },
  {
    slug: "brakes",
    name: "Brake Repair",
    icon: Disc,
    seoTitle: "Brake Repair in Lagos — DMECH Services Limited",
    seoDescription:
      "Brake pad, disc, and fluid service in Lagos — squealing, grinding, or a soft brake pedal. Book a brake inspection with DMECH's workshop.",
    intro:
      "Brakes aren't something to delay. Squealing, grinding, or a pedal that feels soft are all signs worth checking immediately — we inspect the full system, not just the pads.",
    quickAnswer:
      "Brake repair in Lagos is needed when the brakes squeal, grind, feel soft, or do not respond as they should.",
    symptoms: [
      "Squealing or grinding brakes",
      "Soft or spongy pedal",
      "Pulling to one side",
      "Brake warning light is on",
    ],
    covers: [
      "Brake pad replacement",
      "Brake disc/rotor service",
      "Brake fluid change",
      "Full brake system inspection",
    ],
    faq: [
      {
        q: "Why are my brakes squealing?",
        a: "It may be a sign that the brake pads are worn or that the system needs inspection. A brake check will show the actual cause.",
      },
      {
        q: "Should I delay brake repairs?",
        a: "No. Brakes are safety-critical. If you notice a soft pedal, squeal, or grinding, get them checked quickly.",
      },
      {
        q: "Do you inspect the full brake system?",
        a: "Yes. We inspect the full system rather than just the pads, so you know if the issue is bigger than a simple pad replacement.",
      },
    ],
  },
  {
    slug: "body-paint",
    name: "Body & Paint",
    icon: Paintbrush,
    seoTitle: "Car Body Repair & Paint in Lagos — DMECH Services Limited",
    seoDescription:
      "Dent repair, scratch removal, panel beating, and paint matching in Lagos. Book a body and paint job with DMECH's workshop.",
    intro:
      "Dents, scratches, and accident damage affect your car's value as much as its looks. Our body shop repairs the panel and matches the paint, not just covers the damage.",
    quickAnswer:
      "Body and paint repair in Lagos helps fix dents, scratches, and accident damage so the car looks better and holds more value.",
    symptoms: [
      "Dents and scratches",
      "Accident damage",
      "Paint mismatch or faded panels",
      "Body panel damage",
    ],
    covers: [
      "Dent and scratch repair",
      "Panel beating and replacement",
      "Accident damage repair",
      "Full or partial respray with colour matching",
    ],
    faq: [
      {
        q: "Do you repair accident damage?",
        a: "Yes. We repair panels, restore the finish, and advise on what is realistic for the vehicle's condition and intended use.",
      },
      {
        q: "Can you match the paint colour?",
        a: "Yes. We aim for close colour matching and finish quality, especially on damaged panels or partial repairs.",
      },
      {
        q: "Is body repair mainly cosmetic?",
        a: "It is not only cosmetic. It can also affect resale value, finish quality, and the overall condition of the vehicle.",
      },
    ],
  },
  {
    slug: "ev-service",
    name: "EV Service",
    icon: BatteryCharging,
    seoTitle: "EV Service & Repair in Lagos — DMECH Services Limited",
    seoDescription:
      "Electric vehicle servicing in Lagos — battery health checks, charging issues, and EV-specific maintenance. Book with DMECH's workshop.",
    intro:
      "EVs need a different kind of care than a combustion engine — it's an electrical and thermal problem, not a mechanical one. We built our high-voltage capability by extending a decade of diagnostic discipline into battery health, thermal management, and EV-specific components.",
    quickAnswer:
      "EV service in Lagos focuses on battery health, charging issues, thermal management, and high-voltage components.",
    symptoms: [
      "Battery health is dropping",
      "Charging is slow or inconsistent",
      "Warning lights are on",
      "Range has suddenly reduced",
    ],
    covers: [
      "Battery health check",
      "Charging system diagnosis",
      "EV-specific maintenance",
      "Software and system updates where applicable",
    ],
    faq: [
      {
        q: "Do you service EVs in Lagos?",
        a: "Yes. DMECH offers EV diagnostics and support for battery, charging, and high-voltage system issues.",
      },
      {
        q: "Why are EVs different from petrol cars?",
        a: "EVs rely on battery and high-voltage systems, which require different diagnostics, safety checks, and service methods.",
      },
      {
        q: "What is battery certification?",
        a: "Battery certification is an inspection that checks the real condition of the battery so the buyer or lender can understand the vehicle's health and value more accurately.",
      },
    ],
  },
  {
    slug: "routine-maintenance",
    name: "Routine Maintenance",
    icon: Wrench,
    seoTitle: "Car Servicing in Lagos — DMECH Services Limited",
    seoDescription:
      "Interim and full car servicing in Lagos — oil change, fluid checks, and scheduled maintenance. Book a service with DMECH's workshop.",
    intro:
      "Regular servicing catches small problems before they become expensive ones. We follow your vehicle's actual service schedule, not a one-size-fits-all checklist.",
    quickAnswer:
      "Routine maintenance keeps your car reliable, safe, and cheaper to run by catching small issues early.",
    symptoms: [
      "The vehicle has not had a service in a while",
      "You notice unusual noises or vibrations",
      "You want a full health check before the next trip",
    ],
    covers: [
      "Engine oil and filter change",
      "Fluid top-ups and replacement",
      "Multi-point vehicle inspection",
      "Scheduled service intervals",
    ],
    faq: [
      {
        q: "Why is routine maintenance important?",
        a: "It catches small issues before they become costly repairs and helps your vehicle stay reliable.",
      },
      {
        q: "How often should I service my car?",
        a: "The right interval depends on the make, model, driving conditions, and manufacturer schedule. We follow the actual service plan for your vehicle.",
      },
      {
        q: "Do you inspect more than just the oil?",
        a: "Yes. We review the important fluids, performance, safety-related components, and any visible warning signs during the service.",
      },
    ],
  },
];

export function getServicePage(slug: string): ServicePageData | undefined {
  return SERVICE_PAGES.find((s) => s.slug === slug);
}

// Shared "What To Expect" checklist — used on the main /service page and
// every category page for consistency.
export const WHAT_TO_EXPECT: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Phone,
    title: "Confirmation within 30 minutes",
    desc: "We'll call or WhatsApp to confirm your booking and give you a time slot.",
  },
  {
    icon: Receipt,
    title: "A clear quote before work starts",
    desc: "No work begins until you've agreed a price — no surprise charges at pickup.",
  },
  {
    icon: Wrench,
    title: "Updates while it's in the workshop",
    desc: "You'll hear from us if anything changes once the job is underway, not just when it's done.",
  },
  {
    icon: Car,
    title: "Your vehicle back on schedule",
    desc: "We tell you when to expect it and stick to it.",
  },
];
