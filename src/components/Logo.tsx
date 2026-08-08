import Image from "next/image";

// Two real logo crops from the DMECH Services Limited rebrand artwork, both
// tight-cropped to content with the white canvas converted to alpha via
// Pillow (same treatment as the previous asset):
//   - public/logo.png (604x235) — wordmark + "Services Limited" tagline
//     only, no icon mark. Used wherever height is constrained (nav bar,
//     footer, sidebar) since the full stacked lockup below reads as an
//     illegible near-square blob at those heights.
//   - public/logo-full.png (604x691) — the complete lockup (icon mark +
//     wordmark + tagline), stacked. Used only on the splash screen, which
//     has the vertical room for the icon to actually read.
const WORDMARK_ASPECT = 604 / 235;
const FULL_ASPECT = 604 / 691;

const HEIGHT: Record<"nav" | "footer" | "splash" | "sidebar", number> = {
  nav: 30,
  footer: 32,
  splash: 170,
  sidebar: 26,
};

export function Logo({ variant = "nav" }: { variant?: "nav" | "footer" | "splash" | "sidebar" }) {
  const height = HEIGHT[variant];
  const isFull = variant === "splash";
  const width = Math.round(height * (isFull ? FULL_ASPECT : WORDMARK_ASPECT));
  return (
    <Image
      src={isFull ? "/logo-full.png" : "/logo.png"}
      alt="DMECH Services Limited"
      width={width}
      height={height}
      style={{ height, width: "auto" }}
      priority={variant === "nav"}
    />
  );
}
