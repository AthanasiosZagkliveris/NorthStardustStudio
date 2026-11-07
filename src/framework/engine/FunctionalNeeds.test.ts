import { describe, expect, it } from "vitest";
import { asBusinessFoundationValue, businessOfferingNeedTexts, businessProfileOfferings, businessSegmentFunctionalItems, functionalNeedId, reconcileLineIds } from "./AnswerBusinessFoundation";

/** A saved answer of 2026-11-06: functional items with no ids, an Offering ticking them by their words. */
const saved = {
    segments: [{
        id: "s1", name: "S", profiles: [
            { id: "p1", name: "A", needs: { functional: ["Send invoices fast", "Keep records"], emotional: [""], social: [""] } },
            { id: "p2", name: "B", needs: { functional: ["send invoices fast "], emotional: [""], social: [""] } }
        ],
        offerings: [{ id: "o1", name: "Tool", needsAddressed: ["Keep records", "An item that is gone"] }]
    }]
};

describe("the Offering ticks the Profiles' functional items by id (owner, 2026-11-07)", () => {
    it("gives every saved item an id made from its words and place, the same on every read", () => {
        const first = asBusinessFoundationValue(saved).segments[0].profiles[0].needs.functionalIds;
        expect(first).toEqual([functionalNeedId("Send invoices fast", 0), functionalNeedId("Keep records", 1)]);
        expect(asBusinessFoundationValue(saved).segments[0].profiles[0].needs.functionalIds).toEqual(first);
    });
    it("reads a tick saved as words as the item's id, and keeps a tick that matches nothing", () => {
        const segment = asBusinessFoundationValue(saved).segments[0];
        const keep = segment.profiles[0].needs.functionalIds![1];
        expect(segment.offerings[0].needsAddressed).toEqual([keep, "An item that is gone"]);
        expect(businessOfferingNeedTexts(segment, segment.offerings[0])).toEqual(["Keep records"]);
    });
    it("pools the same words on two Profiles as one item with both ids", () => {
        const segment = asBusinessFoundationValue(saved).segments[0];
        const items = businessSegmentFunctionalItems(segment);
        expect(items.map(item => item.text)).toEqual(["Send invoices fast", "Keep records"]);
        expect(items[0].ids).toHaveLength(2);
    });
    it("keeps a tick when the item's words are edited, and matches the Profile by id", () => {
        const segment = asBusinessFoundationValue(saved).segments[0];
        const profile = segment.profiles[0];
        const edited = { ...profile, needs: { ...profile.needs, functional: ["Send invoices fast", "Keep all records"] } };
        expect(businessProfileOfferings(edited, segment.offerings).map(offering => offering.id)).toEqual(["o1"]);
    });
    it("keeps each line's id through an edit, a new line, a split and a removal", () => {
        let n = 0;
        const fresh = () => "new-" + (++n);
        expect(reconcileLineIds(["a", "b"], ["1", "2"], ["a", "bb"], fresh)).toEqual(["1", "2"]);
        expect(reconcileLineIds(["a", "b"], ["1", "2"], ["a", "b", ""], fresh)).toEqual(["1", "2", "new-1"]);
        expect(reconcileLineIds(["abc", "d"], ["1", "2"], ["ab", "c", "d"], fresh)).toEqual(["1", "new-2", "2"]);
        expect(reconcileLineIds(["a", "b", "c"], ["1", "2", "3"], ["a", "c"], fresh)).toEqual(["1", "3"]);
    });
});
