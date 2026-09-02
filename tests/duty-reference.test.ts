import { describe, expect, it } from "vitest";
import { calculateLandedCost } from "../src/lib/duty";
import { estimatedPriceForYear } from "../src/lib/vehicle-catalog";

describe("model/year duty reference", () => {
  it("keeps Highlander 2019 duty independent of purchase price", () => {
    const dutyReferenceUsd = estimatedPriceForYear(24_000, 2019, false);
    const sharedInput = {
      dutyReferenceUsd,
      shippingUsd: 1_500,
      condition: "used" as const,
      engineSize: "medium" as const,
      isEV: false,
      isDiesel: false,
      ngnRate: 1_580,
    };

    const lowerPrice = calculateLandedCost({ priceUsd: 5_000, ...sharedInput });
    const higherPrice = calculateLandedCost({ priceUsd: 20_000, ...sharedInput });

    expect(lowerPrice.dutyReferenceUsd).toBe(dutyReferenceUsd);
    expect(higherPrice.dutyReferenceUsd).toBe(dutyReferenceUsd);
    expect(lowerPrice.dutyKobo).toBe(higherPrice.dutyKobo);
    expect(lowerPrice.totalLandedKobo).not.toBe(higherPrice.totalLandedKobo);
  });
});
