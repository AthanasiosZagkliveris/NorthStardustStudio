import { describe, expect, it, test } from "vitest";
import { DERIVED_ACTIVITY_CATEGORY, activityCategoryLabel, asBusinessCapabilityValue, businessAutoResponsibleId, businessPartnerResponsibleId, businessResponsibleId, strategyObjectiveOwnerId, type BusinessActivityValue } from "./answers/AnswerUtils";

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

describe("the categories of an activity", () => {
    const activity = (fields: Record<string, unknown>) => ({ id: "a", name: "", description: "", performerIds: [], responsibleId: "", completed: false, offeringIds: [], type: "", ...fields });

    describe("an activity's category (stage B), read from saved answers", () => {

        test("an Infrastructure activity's category is the category it is filed in; a made category is listed with its name", () => {
            const value = asBusinessCapabilityValue({
                formatVersion: 3,
                activities: [
                    { id: "pre-operational", name: "", activities: [activity({ id: "a1" })] },
                    { id: "category-legal", name: "Legal", activities: [activity({ id: "a2" })] }
                ]
            });
            expect(value.activities.flatMap(container => container.activities).map(entry => entry.category)).toEqual(["pre-operational", "category-legal"]);
            expect(value.activityCategories).toEqual([{ id: "category-legal", name: "Legal" }]);
            expect(activityCategoryLabel(value.activityCategories, "category-legal")).toBe("Legal");
            expect(activityCategoryLabel(value.activityCategories, "sales")).toBe("Sales & Customer");
        });

        test("an Offering activity saved without a category is Production; one saved with a category keeps it, and an unknown one is Production", () => {
            const value = asBusinessCapabilityValue({
                formatVersion: 3,
                offering: { activities: [activity({ id: "o1" }), activity({ id: "o2" }), activity({ id: "o3", category: "marketing" }), activity({ id: "o4", category: "gone" })] }
            });
            expect(value.offering.activities.map(entry => entry.category)).toEqual([
                DERIVED_ACTIVITY_CATEGORY.offering, DERIVED_ACTIVITY_CATEGORY.offering, "marketing", DERIVED_ACTIVITY_CATEGORY.offering
            ]);
            expect(DERIVED_ACTIVITY_CATEGORY).toEqual({ infrastructure: "operational", offering: "production" });
        });

        test("an answer saved before the nine categories: an activity whose category its place no longer has is in No category, its old category named in its description", () => {
            const value = asBusinessCapabilityValue({
                activities: [
                    { id: "operational", name: "", activities: [activity({ id: "a1" })] },
                    { id: "marketing", name: "", activities: [activity({ id: "a2", description: "Posters" })] },
                    { id: "category-legal", name: "Legal", activities: [activity({ id: "a3" })] }
                ],
                activityCategories: [{ id: "category-legal", name: "Legal" }],
                offering: { activities: [activity({ id: "o1", category: "operational" }), activity({ id: "o2", category: "sales" })] }
            });
            const infrastructure = value.activities.flatMap(container => container.activities);
            expect(infrastructure.map(entry => [entry.id, entry.category])).toEqual([["a1", "operational"], ["a2", "unassigned"], ["a3", "unassigned"]]);
            expect(infrastructure.map(entry => entry.description)).toEqual(["", "Earlier category: Marketing. Posters", "Earlier category: Legal."]);
            expect(value.offering.activities.map(entry => entry.category)).toEqual(["unassigned", "sales"]);
            expect(value.activityCategories).toEqual([]);
            expect(value.formatVersion).toBe(3);
            // Read again, nothing moves a second time.
            expect(asBusinessCapabilityValue(value)).toEqual(value);
        });

    });
});
