import { describe, expect, it } from "vitest";
import { capabilityInEdition } from "./edition";
import { capabilities } from "./capabilities";
import { systems } from "./systems";

describe("the edition (Records 2, 5.7)", () => {

    it("shows every capability in the full app", () => {
        expect(capabilities.every(capability => capabilityInEdition(capability.id, "full"))).toBe(true);
    });

    it("shows the Foundation capability alone, Systems 1 to 4, in the Foundation edition", () => {
        expect(capabilities.filter(capability => capabilityInEdition(capability.id, "foundation")).map(capability => capability.id)).toEqual(["foundation"]);
        expect(systems.filter(system => capabilityInEdition(system.capability, "foundation")).map(system => system.number)).toEqual([1, 2, 3, 4]);
    });

    it("keeps every System in the data list, so saved answers of any System stay readable", () => {
        expect(systems.length).toBeGreaterThan(4);
    });

});
