import { describe, expect, it } from "vitest";
import {
    businessAutoResponsibleId,
    businessPartnerResponsibleId,
    businessResponsibleId,
    asBusinessCapabilityValue,
    strategyObjectiveOwnerId,
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

describe("a Partnership / Provider's Responsible", () => {

    const partner = (responsibleId = "") => ({ responsibleId });

    it("is the founder of a one-founder organisation while nobody is chosen -- derived, nothing written", () => {
        const only = ["founder-ann"];
        const empty = partner();
        expect(businessPartnerResponsibleId(empty, only)).toBe("founder-ann");
        expect(empty.responsibleId).toBe("");
        // A choice that points at nobody who is still a founder is not a choice.
        expect(businessPartnerResponsibleId(partner("founder-gone"), only)).toBe("founder-ann");
    });

    it("keeps an explicit choice, and with two or more founders, or none, is what was chosen (empty until then)", () => {
        expect(businessPartnerResponsibleId(partner("founder-bob"), founders)).toBe("founder-bob");
        expect(businessPartnerResponsibleId(partner("founder-ann"), ["founder-ann"])).toBe("founder-ann");
        expect(businessPartnerResponsibleId(partner(), founders)).toBe("");
        expect(businessPartnerResponsibleId(partner(), [])).toBe("");
        expect(businessPartnerResponsibleId(partner("founder-gone"), founders)).toBe("founder-gone");
    });

});

describe("a Strategy Objective's Responsible", () => {

    it("is the sole founder while nobody is chosen (no field to choose in) -- derived, nothing written; a choice or several founders leave it as chosen", () => {
        const objective = { ownerId: "" };
        expect(strategyObjectiveOwnerId(objective, ["founder-ann"])).toBe("founder-ann");
        expect(objective.ownerId).toBe("");
        expect(strategyObjectiveOwnerId({ ownerId: "founder-bob" }, founders)).toBe("founder-bob");
        expect(strategyObjectiveOwnerId(objective, founders)).toBe("");
        expect(strategyObjectiveOwnerId(objective, [])).toBe("");
    });

});

describe("the Responsible tick (responsibleOff): no responsible by choice", () => {

    it("an unticked activity has no responsible, and the Performers rule does not give it the sole founder", () => {
        expect(businessResponsibleId({ ...activity(["founder-bob"]), responsibleOff: true }, founders)).toBe("");
        expect(businessResponsibleId({ ...activity([], "founder-ann"), responsibleOff: true }, founders)).toBe("");
        expect(businessResponsibleId({ ...activity([], "founder-ann"), responsibleOff: false }, founders)).toBe("founder-ann");
        // The key missing is ticked.
        expect(businessResponsibleId(activity(["founder-bob"]), founders)).toBe("founder-bob");
    });

    it("an unticked partner or objective has none, even with one founder", () => {
        expect(businessPartnerResponsibleId({ responsibleId: "", responsibleOff: true }, ["founder-ann"])).toBe("");
        expect(businessPartnerResponsibleId({ responsibleId: "" }, ["founder-ann"])).toBe("founder-ann");
        expect(strategyObjectiveOwnerId({ ownerId: "founder-bob", responsibleOff: true }, founders)).toBe("");
        expect(strategyObjectiveOwnerId({ ownerId: "founder-bob" }, founders)).toBe("founder-bob");
    });

    it("is stored only when off: reading drops anything else, so older data is unchanged", () => {
        const read = (card: object) => asBusinessCapabilityValue({
            activities: [{ id: "c", name: "", activities: [card] }],
            offering: { professionals: [card] }
        });
        const off = read({ id: "a", name: "A", responsibleOff: true });
        expect(off.activities[0].activities[0].responsibleOff).toBe(true);
        expect(off.offering.professionals[0].responsibleOff).toBe(true);
        for (const card of [{ id: "a", name: "A" }, { id: "a", name: "A", responsibleOff: false }, { id: "a", name: "A", responsibleOff: "yes" }]) {
            expect("responsibleOff" in read(card).activities[0].activities[0]).toBe(false);
            expect("responsibleOff" in read(card).offering.professionals[0]).toBe(false);
        }
    });

});
