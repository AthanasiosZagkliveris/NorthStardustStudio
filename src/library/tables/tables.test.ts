import { describe, expect, it } from "vitest";
import { table, tables } from "./index.ts";

const ids = (code: string) => new Set(table(code).rows.map(r => r.id));

describe("the tables of the app", () => {
    it("has every table, each with rows and with unique ids that start with its code", () => {
        expect(tables.map(t => t.code).sort()).toEqual(["S", "P", "C", "MT", "V", "K", "T", "CAT", "G", "O", "H", "L", "CA", "CO", "R", "F", "FN"].sort());
        for (const t of tables) {
            expect(t.rows.length, t.code + " has rows").toBeGreaterThan(0);
            const seen = new Set<string>();
            for (const r of t.rows) {
                expect(r.id.startsWith(t.code), t.code + " " + r.id).toBe(true);
                expect(seen.has(r.id), "id repeated in " + t.code + ": " + r.id).toBe(false);
                seen.add(r.id);
            }
        }
    });

    it("points from each table to an id that exists in the table above it", () => {
        const systems = ids("S"), pages = ids("P"), chapters = ids("C"), views = ids("V"), fields = ids("F"), types = ids("CO");
        for (const r of table("P").rows) expect(systems.has(String(r.system)), "page " + r.id).toBe(true);
        for (const r of table("C").rows) expect(pages.has(String(r.page)), "chapter " + r.id).toBe(true);
        for (const r of table("MT").rows) expect(chapters.has(String(r.chapter)), "master tile " + r.id).toBe(true);
        for (const r of table("V").rows) {
            expect(pages.has(String(r.page)), "view " + r.id).toBe(true);
            expect(r.parent === "page" || views.has(String(r.parent)), "parent of view " + r.id).toBe(true);
        }
        for (const r of table("K").rows) for (const f of String(r.fields_in_order).split(" ")) expect(fields.has(f), "field " + f + " of " + r.id).toBe(true);
        for (const r of table("F").rows) expect(r.component_id === "-" || types.has(String(r.component_id)), "component of field " + r.id).toBe(true);
    });

    it("holds the four Foundation systems and the three parts of the app", () => {
        expect(table("S").rows.map(r => r.name)).toEqual(["Identity System", "Brand System", "Business System", "Strategy System"]);
        expect(table("H").rows.length).toBe(5);
        expect(table("L").rows.length).toBeGreaterThan(5);
        expect(table("CA").rows.length).toBeGreaterThan(2);
    });
});
