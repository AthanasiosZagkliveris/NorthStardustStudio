import { describe, expect, test } from "vitest";
import { activityCategoryLabel, asBusinessCapabilityValue, DERIVED_ACTIVITY_CATEGORY } from "./AnswerUtils.ts";

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
