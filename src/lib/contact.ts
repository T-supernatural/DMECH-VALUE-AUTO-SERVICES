// Single source of truth for DMECH's public contact details. Every phone/
// WhatsApp link on the marketing site reads from here — update once when
// the real numbers are ready, instead of hunting down each call site.
//
// Call and WhatsApp are deliberately two different real numbers.
export const CONTACT = {
  phoneDisplay: "0802 940 1484",
  phoneHref: "08029401484",
  whatsappDisplay: "0815 102 3414",
  whatsappNumber: "2348151023414",
  hours: "Mon–Sat: 8am – 6pm",
  addressLine1: "Sangotedo, Ajah Axis,",
  addressLine2: "Lagos, Nigeria",
} as const;

export const ADDRESS_FULL = "Sangotedo, Ajah Axis, Lagos, Nigeria";

// DMECH is a registered dealer/financing partner with Autochek Africa —
// Partner Finance is fulfilled through them. Link is the one confirmed by
// DMECH; swap for a dealer-specific referral URL if/when one exists.
export const AUTOCHEK_URL = "https://autochek.africa/welcome";

export function whatsappHref(message: string): string {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
