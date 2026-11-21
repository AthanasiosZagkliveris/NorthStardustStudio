import { describe, expect, it } from "vitest";

import { asValueKinds, manifestoDraft, missionDraft, missionGainOptions, missionOfferOptions, missionServeOptions, principlesDraft, valuesDraft } from "./MissionChoices.ts";
import type { BusinessCustomerSegmentValue } from "../businessFoundation/foundationPage.ts";

/* PB10 to PB13 (doc 45, section 8; the owner's approval of 2026-11-20 22:08 UTC+2, "All, Values A"). */

const segment = (id: string, name: string, offerings: { id: string; name: string }[], goals: string[][] = []): BusinessCustomerSegmentValue => ({
    id, name, description: {}, questions: {}, valueProposition: "", competitors: [],
    offerings: offerings.map(offering => ({ ...offering, category: "", needsAddressed: [] })),
    profiles: goals.map((e1, at) => ({ id: id + "-p" + at, name: "", questions: { e1 } }))
} as unknown as BusinessCustomerSegmentValue);

const homes = segment("homes", "London Homemakers", [{ id: "throws", name: "Homeware Collection" }, { id: "classes", name: "Weaving Workshops" }], [["learn-something-new", "save-time-money"], ["learn-something-new"]]);
const hotels = segment("hotels", "Boutique Hotels", [{ id: "commissions", name: "Bespoke Commissions" }]);

describe("the Mission's choices", () => {

    it("offer the Segments, then the Offerings of those chosen (every Segment's while none is)", () => {
        expect(missionServeOptions([homes, hotels]).map(option => option.label)).toEqual(["London Homemakers", "Boutique Hotels"]);
        expect(missionOfferOptions([homes, hotels], []).map(option => option.label)).toEqual(["Homeware Collection", "Weaving Workshops", "Bespoke Commissions"]);
        expect(missionOfferOptions([homes, hotels], ["hotels"]).map(option => option.label)).toEqual(["Bespoke Commissions"]);
    });

    it("offer the goals ticked on the Profiles, the most chosen first; every goal while none is ticked", () => {
        expect(missionGainOptions([homes], ["homes"]).map(option => option.id)).toEqual(["learn-something-new", "save-time-money"]);
        expect(missionGainOptions([hotels], ["hotels"]).length).toBeGreaterThan(5);
    });

    it("write the Mission's draft once who and what are chosen", () => {
        expect(missionDraft([homes, hotels], ["homes"], [], [])).toBe("");
        expect(missionDraft([homes, hotels], ["homes"], ["throws", "classes"], ["learn-something-new"]))
            .toBe("We help London Homemakers with Homeware Collection and Weaving Workshops, so that they can learn something new.");
        expect(missionDraft([homes, hotels], ["homes", "hotels"], ["throws"], [])).toBe("We help London Homemakers and Boutique Hotels with Homeware Collection.");
    });
});

describe("the Values' kinds and the drafts that follow them", () => {

    it("keep known kinds only, two at most, and start a line for each", () => {
        expect(asValueKinds(["create", "unknown", "collaborate", "control"])).toEqual(["create", "collaborate"]);
        expect(valuesDraft(["create", "collaborate"])).toBe("Care: \nCraft: ");
    });

    it("start a Principle under each Value, and the Manifesto from the Values and the Philosophy's first sentence", () => {
        expect(principlesDraft(["Craft: every piece finished by hand", "Care: we listen"])).toBe("Craft: We always \nCare: We always ");
        expect(manifestoDraft(["Craft: by hand", "Care: we listen"], "We believe slow things last. So we make fewer.")).toBe("We are for craft and care. We believe slow things last.");
        expect(manifestoDraft([], "")).toBe("");
    });
});
