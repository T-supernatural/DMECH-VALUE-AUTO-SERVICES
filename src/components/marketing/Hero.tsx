import { Calculator } from "@/components/marketing/Calculator";
import { AnimatedCounter } from "@/components/marketing/AnimatedCounter";

interface HeroProps {
  ngnRate: number;
  marketPriceBenchmarks: Record<string, number>;
}

export function Hero({ ngnRate, marketPriceBenchmarks }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-headlights" aria-hidden="true">
        <span className="hero-headlight-glow hl-1" />
        <span className="hero-headlight-glow hl-2" />
      </div>
      <div className="hero-inner">
        <div>
          <div className="hero-badge">
            <span className="pulse" /> Import duties reduced — effective July 1, 2026
          </div>
          <h1>
            Know Your Landed Cost. <span>Instantly.</span>
          </h1>
          <p>
            An accurate, itemised import estimate before you commit — duties, shipping, and
            fees, no guesswork. Backed by a decade of DMECH workshop expertise, we also source,
            ship, clear, and service every vehicle we import.
          </p>
          <div className="hero-stats">
            <div>
              <AnimatedCounter value={5} suffix="%" className="hero-stat-value" />
              <div className="hero-stat-label">Used Levy (was 15%)</div>
            </div>
            <div>
              <AnimatedCounter value={10} suffix="%" className="hero-stat-value" />
              <div className="hero-stat-label">New Levy (was 20%)</div>
            </div>
            <div>
              <AnimatedCounter value={40} suffix="%" className="hero-stat-value" />
              <div className="hero-stat-label">Tariff (was 70%)</div>
            </div>
          </div>
        </div>
        <Calculator ngnRate={ngnRate} marketPriceBenchmarks={marketPriceBenchmarks} />
      </div>
    </section>
  );
}
