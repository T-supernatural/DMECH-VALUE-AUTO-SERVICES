import { describe, expect, it } from "vitest";
import { displayStamps } from "../src/lib/vehicle-display";

describe("displayStamps", () => {
  it("keeps selected stamps and derives lifecycle stamps", () => {
    expect(displayStamps({ display_stamps: ["verified"], lifecycle_stage: "sold" })).toEqual([
      "verified",
      "sold",
    ]);
    expect(displayStamps({ display_stamps: [], lifecycle_stage: "reserved" })).toEqual(["reserved"]);
    expect(displayStamps({ display_stamps: [], lifecycle_stage: "delivered" })).toEqual(["delivered"]);
  });
});