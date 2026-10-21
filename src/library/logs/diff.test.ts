import { describe, expect, it } from "vitest";
import { diffState, emptyState, stateOf } from "./diff.ts";
import type { Library, Placement } from "../model/types.ts";
import type { TableData } from "../tables/types.ts";

const library: Library = {
    variables: [{ code: "VAR001", name: "state", description: "How it looks.", values: [{ name: "rest", description: "Not touched." }] }],
    assets: [
        { code: "BTN.001", name: "box button", category: "component", summary: "A box.", variables: ["VAR001"], catalogue: [], requires: [], variants: [] },
        { code: "FLD.001", name: "Start date", category: "field", summary: "A date.", variables: [], catalogue: [], requires: [], variants: [] }
    ]
};
const tables: TableData[] = [{ code: "P", title: "Pages", note: "", columns: ["id", "name"], rows: [{ id: "P01", name: "Infrastructure" }] }];
const names = new Map(library.assets.map(a => [a.code, a.name]));
const at = (card: string, position = 1): Placement => ({ asset: "FLD.001", system: "Business System", page: "Infrastructure", card, position });
const run = (prev: Placement[], now: Placement[], lib = library, t = tables) => diffState(stateOf(library, prev, tables), stateOf(lib, now, t), "2026-10-15", names);

describe("the log difference", () => {
    it("has no change when nothing changed", () => {
        const d = run([at("CRD.002")], [at("CRD.002")]);
        expect(d.library).toEqual([]);
        expect(d.app).toEqual([]);
    });

    it("case 1: a new asset, placed: both logs, with where", () => {
        const added: Library = { ...library, assets: [...library.assets, { code: "BTN.003", name: "back button", category: "component", summary: "Back.", variables: [], catalogue: [], requires: [], variants: [] }] };
        const d = run([], [{ asset: "BTN.003", system: "Business System", page: "Infrastructure", card: "CRD.002" }], added);
        expect(d.library.map(e => e.change + " " + e.asset)).toEqual(["added BTN.003", "placed BTN.003"]);
        expect(d.library[1].where).toBe("Business System / Infrastructure / CRD.002");
        expect(d.app.map(e => e.change + " " + e.notInLibrary)).toEqual(["placed false"]);
    });

    it("case 2: an existing asset placed, moved, and removed: the library log states where", () => {
        expect(run([], [at("CRD.002")]).library.map(e => e.change + " " + e.where)).toEqual(["placed Business System / Infrastructure / CRD.002"]);
        const moved = run([at("CRD.002")], [at("CRD.003")]);
        expect(moved.library.map(e => e.change + " " + e.where)).toEqual(["moved from Business System / Infrastructure / CRD.002 to Business System / Infrastructure / CRD.003"]);
        expect(moved.app.map(e => e.change)).toEqual(["moved"]);
        const removed = run([at("CRD.002")], []);
        expect(removed.library.map(e => e.change + " " + e.where)).toEqual(["removed Business System / Infrastructure / CRD.002"]);
    });

    it("case 3: a component placed without the library: the app log only, marked not in the library", () => {
        const d = run([], [{ asset: "NEW:star button", system: "Business System", page: "Infrastructure", card: "CRD.002" }]);
        expect(d.library).toEqual([]);
        expect(d.app).toHaveLength(1);
        expect(d.app[0]).toMatchObject({ change: "placed", notInLibrary: true, asset: "NEW:star button" });
    });

    it("logs an edit of an asset, naming the fields that changed, and a table row change in the app log", () => {
        const edited: Library = { ...library, assets: [{ ...library.assets[0], summary: "A square box." }, library.assets[1]] };
        expect(run([], [], edited).library.map(e => e.change + " " + e.what)).toEqual(["edited box button: summary"]);
        const t2: TableData[] = [{ ...tables[0], rows: [{ id: "P01", name: "Infrastructure & Capability" }, { id: "P02", name: "Sustainability" }] }];
        expect(run([], [], library, t2).app.map(e => e.change + " " + e.where)).toEqual(["edited P P01", "placed P P02"]);
    });

    it("logs every asset as added from an empty state", () => {
        const d = diffState(emptyState(), stateOf(library, [], []), "2026-10-15", names);
        expect(d.library.map(e => e.change)).toEqual(["added", "added"]);
    });
});
