import { describe, expect, it } from "vitest";

import { holdsOfferings, removedOfferingIds, withoutOfferings } from "./offeringRemoval.ts";
import { asBusinessCapabilityValue } from "./AnswerBusinessCapability.ts";
import { asLegalEntityValue } from "./AnswerLegal.ts";
import { asBusinessEngagementValue } from "./businessFoundation/engagementReaders.ts";

/* AN OFFERING REMOVED LEAVES NO CARD POINTING AT IT (owner, 2026-11-19): its id is unticked on every card that stores Offering ids, found by the field's name. */
describe("removing an Offering", () => {

    it("says which Offerings an answer no longer holds", () => {
        expect(removedOfferingIds(["a", "b", "c"], ["a", "c"])).toEqual(["b"]);
        expect(removedOfferingIds(["a"], ["a", "b"])).toEqual([]);
    });

    it("unticks it on Offering's Capability's resources, activities, partners and suppliers, with its share", () => {
        const capability = asBusinessCapabilityValue({
            offering: {
                resources: [{ id: "r1", name: "Yarn", status: "costs", offeringIds: ["a", "b"], offeringShares: { a: "60", b: "40", "~basis": "own" }, cost: { price: "5", frequency: "monthly" } }],
                activities: [{ id: "x1", name: "Weave", offeringIds: ["b"] }],
                professionals: [{ id: "p1", name: "Tutor", offeringIds: ["a", "b"] }],
                providers: [{ id: "s1", name: "Mill", offeringIds: ["b"] }]
            }
        });
        const cleared = withoutOfferings(capability, ["b"]);
        expect(cleared.offering.resources[0].offeringIds).toEqual(["a"]);
        expect(cleared.offering.resources[0].offeringShares).toEqual({ a: "60", "~basis": "own" });
        expect(cleared.offering.activities[0].offeringIds).toEqual([]);
        expect(cleared.offering.professionals[0].offeringIds).toEqual(["a"]);
        expect(cleared.offering.providers[0].offeringIds).toEqual([]);
        // (Read back as the app reads it: nothing else on the cards changes.)
        expect(asBusinessCapabilityValue(cleared).offering.resources[0].name).toBe("Yarn");
        expect(holdsOfferings(capability, ["b"])).toBe(true);
        expect(holdsOfferings(cleared, ["b"])).toBe(false);
    });

    it("unticks it on a Legal Entity expense, with its share", () => {
        const entity = asLegalEntityValue({ expenses: [{ id: "e1", name: "Licence", offeringIds: ["a", "b"], offeringShares: { a: "50", b: "50" } }, { id: "e2", name: "Fee" }] });
        const cleared = withoutOfferings(entity, ["a"]);
        expect(cleared.expenses[0].offeringIds).toEqual(["b"]);
        expect(cleared.expenses[0].offeringShares).toEqual({ b: "50" });
        expect(cleared.expenses[1].offeringIds).toEqual([]);
    });

    it("unticks it on a Customer Engagement channel, keeping what is keyed by Offering", () => {
        const engagement = asBusinessEngagementValue({
            segments: [{ segmentId: "seg", channels: [{ id: "c1", category: "website", name: "Shop", offerings: ["a", "b"], stages: ["purchase"] }] }],
            demand: { a: { sources: [] }, b: { sources: [] } }
        });
        const cleared = withoutOfferings(engagement, ["b"]);
        expect(cleared.segments[0].channels[0].offerings).toEqual(["a"]);
        // (The Offering's demand is keyed by it, not ticked: it stays, as its revenue stream does.)
        expect(Object.keys(cleared.demand).sort()).toEqual(Object.keys(engagement.demand).sort());
    });

    it("leaves an answer that holds none of them as it is", () => {
        const entity = asLegalEntityValue({ expenses: [{ id: "e1", offeringIds: ["a"] }] });
        expect(withoutOfferings(entity, [])).toBe(entity);
        expect(holdsOfferings(entity, ["z"])).toBe(false);
    });

});
