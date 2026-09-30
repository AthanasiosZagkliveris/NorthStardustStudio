import { describe, expect, it } from "vitest";
import {
    businessAutoResponsibleId,
    businessResponsibleId,
    type BusinessActivityValue
} from "./AnswerUtils";

const founders = ["founder-ann", "founder-bob", "founder-cy"];

function activity(performerIds: string[], responsibleId = ""): BusinessActivityValue {
    return { id: "activity-1", name: "Deliver", description: "", performerIds, responsibleId, completed: false } as BusinessActivityValue;
}

describe("an Activity's Responsibility, set by its Performers", () => {

    it("is the one founder among the Performers", () => {
        expect(businessAutoResponsibleId(founders, ["founder-bob"])).toBe("founder-bob");
    });

    it("is that founder even beside partners and providers", () => {
        expect(businessAutoResponsibleId(founders, ["partner-x", "founder-cy", "provider-y"])).toBe("founder-cy");
    });

    it("follows the Performers to a different single founder", () => {
        const before = activity(["founder-ann"]);
        expect(businessResponsibleId(before, founders)).toBe("founder-ann");
        const after = { ...before, performerIds: ["founder-bob", "partner-x"] };
        expect(businessResponsibleId(after, founders)).toBe("founder-bob");
    });

    it("is a choice with two or more founders, and the choice is kept", () => {
        expect(businessAutoResponsibleId(founders, ["founder-ann", "founder-bob"])).toBe("");
        expect(businessResponsibleId(activity(["founder-ann", "founder-bob"], "founder-bob"), founders)).toBe("founder-bob");
    });

    it("stays empty with no founder among the Performers", () => {
        expect(businessAutoResponsibleId(founders, ["partner-x"])).toBe("");
        expect(businessResponsibleId(activity(["partner-x"]), founders)).toBe("");
        expect(businessResponsibleId(activity([]), founders)).toBe("");
    });

    it("is the only founder of a one-founder organisation", () => {
        expect(businessAutoResponsibleId(["founder-ann"], [])).toBe("founder-ann");
    });

});
