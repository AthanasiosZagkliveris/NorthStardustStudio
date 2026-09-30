import { describe, expect, it } from "vitest";

import { hasContent, removalPatches, removesContent, undoRemoval } from "./RemovalPatch";

describe("undoing a removal", () => {

    const page = {
        segments: [
            { id: "s1", name: "Retail", profiles: [{ id: "p1", name: "Anna" }, { id: "p2", name: "Ben" }, { id: "p3", name: "Cara" }] },
            { id: "s2", name: "Trade", profiles: [] }
        ],
        activities: [{ id: "a1", name: "Weaving", performerId: "p2" }]
    };

    it("puts a removed card back at its place, with its id and all its data", () => {
        const after = { ...page, segments: [{ ...page.segments[0], profiles: [page.segments[0].profiles[0], page.segments[0].profiles[2]] }, page.segments[1]] };
        const patches = removalPatches(page, after);
        expect(removesContent(patches)).toBe(true);
        expect(undoRemoval(after, patches)).toEqual(page);
    });

    it("puts back what referred to it, and keeps edits made elsewhere since", () => {
        const removed = {
            segments: [{ ...page.segments[0], profiles: [page.segments[0].profiles[0], page.segments[0].profiles[2]] }, page.segments[1]],
            activities: [{ id: "a1", name: "Weaving", performerId: "" }]
        };
        const patches = removalPatches(page, removed);
        // Since: Trade renamed, Anna renamed, a new activity added.
        const later = {
            segments: [
                { ...removed.segments[0], profiles: [{ id: "p1", name: "Annie" }, removed.segments[0].profiles[1]] },
                { ...removed.segments[1], name: "Wholesale" }
            ],
            activities: [...removed.activities, { id: "a2", name: "Packing", performerId: "" }]
        };
        const restored = undoRemoval(later, patches) as typeof page;
        expect(restored.segments[0].profiles).toEqual([{ id: "p1", name: "Annie" }, { id: "p2", name: "Ben" }, { id: "p3", name: "Cara" }]);
        expect(restored.segments[1].name).toBe("Wholesale");
        expect(restored.activities).toEqual([{ id: "a1", name: "Weaving", performerId: "p2" }, { id: "a2", name: "Packing", performerId: "" }]);
    });

    it("does not overwrite a value changed since, nor put a card back twice", () => {
        const removed = { ...page, activities: [{ id: "a1", name: "Weaving", performerId: "" }], segments: [page.segments[1]] };
        const patches = removalPatches(page, removed);
        const later = { ...removed, activities: [{ id: "a1", name: "Weaving", performerId: "p9" }] };
        const once = undoRemoval(later, patches) as typeof page;
        expect(once.activities[0].performerId).toBe("p9");
        expect(once.segments.map(segment => segment.id)).toEqual(["s1", "s2"]);
        expect((undoRemoval(once, patches) as typeof page).segments.length).toBe(2);
    });

    it("puts back a line of a list without ids at its position", () => {
        const before = { items: ["one", "two", "three"] };
        const after = { items: ["one", "three"] };
        const patches = removalPatches(before, after);
        expect(undoRemoval(after, patches)).toEqual(before);
        expect(undoRemoval({ items: ["one", "three", "four"] }, patches)).toEqual({ items: ["one", "two", "three", "four"] });
    });

    it("puts back an optional text emptied", () => {
        const before = { streams: [{ id: "r1", description: "Prices rise in May" }] };
        const after = { streams: [{ id: "r1", description: "" }] };
        const patches = removalPatches(before, after);
        expect(removesContent(patches)).toBe(true);
        expect(undoRemoval(after, patches)).toEqual(before);
    });

    it("counts only what a person wrote as content: an empty row is not worth an undo", () => {
        expect(hasContent({ id: "x1", name: "", offeringIds: ["o1"], items: [] })).toBe(false);
        expect(hasContent({ id: "x1", name: " Ben " })).toBe(true);
        const patches = removalPatches({ rows: [{ id: "r1", name: "" }, { id: "r2", name: "Kept" }] }, { rows: [{ id: "r2", name: "Kept" }] });
        expect(removesContent(patches)).toBe(false);
    });

});
