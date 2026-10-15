import { describe, expect, it } from "vitest";
import { checkLibrary } from "../model/check.ts";
import { library } from "./library.ts";
import { placements } from "./placements.ts";

describe("the assets library", () => {
    it("is sound: unique coded assets, described variables, variants that edit their own asset, requirements and placements that exist", () => {
        expect(checkLibrary(library, placements)).toEqual([]);
    });

    it("holds the owner's split of the buttons: the x and the plus are one asset, the i is another", () => {
        const box = library.assets.find(a => a.name === "box button");
        const info = library.assets.find(a => a.name === "info button");
        expect(box?.code).toBe("BTN.001");
        expect(box?.variants.map(v => v.code)).toEqual(["BTN.DLT.001.001", "BTN.ADD.001.002"]);
        expect(info?.code).toBe("BTN.002");
        expect(info?.variants).toEqual([]);
    });

    it("has every category, and no asset twice", () => {
        const categories = new Set(library.assets.map(a => a.category));
        expect([...categories].sort()).toEqual(["card", "component", "field", "frame", "tile"]);
        const names = library.assets.map(a => a.category + "|" + a.name.toLowerCase());
        expect(new Set(names).size).toBe(names.length);
    });

    it("builds fields from components and cards from fields", () => {
        const field = library.assets.find(a => a.category === "field");
        expect(field?.requires.some(r => r.asset.startsWith("LBL"))).toBe(true);
        const card = library.assets.find(a => a.category === "card" && a.name !== "floating card");
        expect(card?.requires.some(r => r.asset.startsWith("CRD"))).toBe(true);
        expect(card?.requires.some(r => r.asset.startsWith("FLD"))).toBe(true);
    });
});
