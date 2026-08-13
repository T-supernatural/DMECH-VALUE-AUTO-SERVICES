import { Logo } from "@/components/Logo";

const PHOTOS = [
  "/splash/01_cars_road.jpg",
  "/splash/02_cargo_port.jpg",
  "/splash/04-workshop.jpg",
  "/splash/05-ev-charging.jpg",
  "/splash/07-ev-assembly.jpg",
  "/splash/08-ev-battery.jpg",
];

// Full-bleed backdrop of six real vehicle/shipping/workshop/EV photos,
// crossfading via CSS. Rendered unconditionally in the server HTML (no
// client state gating it, no session tracking — plays on every load, same
// as the ops splash) and hidden entirely by its own CSS animation once it's
// done. A JS-driven "show after hydration" version of this let the real
// page content paint first on content-heavy pages before the splash caught
// up, which is backwards — this version has no such dependency.
//
// Exactly six entries by design — marketing.css's crossfade timing
// (.msplash-photo:nth-child(1..6), 1s stagger, synced to the splash's fixed
// 5.9s total lifetime) is tuned for six. Swap photos in/out freely, but
// adding a 7th/8th needs matching CSS timing changes, not just an array
// entry, or the extra photos won't get a stagger slot and will flash in
// sync with photo 1 instead of taking their own turn. car-lot.jpg and
// car-transport.jpg (both import/inventory, redundant with cars_road/
// cargo_port already in the mix) were swapped out for the EV assembly line
// and high-voltage battery photos to match the site's identity-led
// positioning.
export function MarketingSplash() {
  return (
    <div className="msplash">
      <div className="msplash-photos">
        {PHOTOS.map((src) => (
          <div key={src} className="msplash-photo" style={{ backgroundImage: `url(${src})` }} />
        ))}
      </div>
      <div className="msplash-scrim" />
      <div className="msplash-content">
        <Logo variant="splash" />
        <div className="msplash-tagline">We Keep It Running.</div>
        <div className="msplash-bar-wrap">
          <div className="msplash-bar" />
        </div>
      </div>
    </div>
  );
}
