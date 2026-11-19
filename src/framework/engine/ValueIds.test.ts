import { describe, expect, it } from "vitest";

import { valueId, valuesWithIds, withValuesText } from "./ValueIds.ts";

/* THE VALUES' IDS (doc 46, section 5, step 1). */
describe("the Values gain ids", () => {

    /** A saved answer from before 2026-11-19: the Values as one numbered text, no ids. */
    const old = { values: "1. Honest prices\n2. Care in every stitch", principles: "1. Reply within a day" };

    it("loads an old save unchanged, with ids made from each line's words and place, the same on every read", () => {
        const read = valuesWithIds(old);
        expect(read).toEqual([{ id: valueId("Honest prices", 0), text: "Honest prices" }, { id: valueId("Care in every stitch", 1), text: "Care in every stitch" }]);
        expect(valuesWithIds(old)).toEqual(read);
        expect(old).toEqual({ values: "1. Honest prices\n2. Care in every stitch", principles: "1. Reply within a day" });
    });

    it("keeps each unchanged line's id through an edit, its text exactly as written", () => {
        const [first, second] = valuesWithIds(old);
        const edited = withValuesText(old, "1. Fair prices\n2. Care in every stitch\n3. Local wool");
        expect(edited.values).toBe("1. Fair prices\n2. Care in every stitch\n3. Local wool");
        const ids = valuesWithIds(edited).map(entry => entry.id);
        expect(ids[1]).toBe(second.id);
        expect(ids[0]).toBe(first.id);
        expect(new Set(ids).size).toBe(3);
        expect(edited.principles).toBe(old.principles);
    });

    it("reads no Values as none", () => {
        expect(valuesWithIds({})).toEqual([]);
        expect(valuesWithIds(undefined)).toEqual([]);
    });

});
