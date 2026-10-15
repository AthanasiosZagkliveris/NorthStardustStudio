import { describe, expect, it } from "vitest";
import { checkLibrary } from "./check.ts";
import type { Library } from "./types.ts";

const state = {
    code: "VAR001", name: "state", description: "How the control looks now.",
    values: [{ name: "rest", description: "Not touched." }, { name: "hover", description: "The pointer is over it." }]
};
const good: Library = {
    variables: [state],
    assets: [{
        code: "BTN.001", name: "box button", category: "component", summary: "A square button with a symbol.", variables: ["VAR001"], catalogue: ["CO001"], requires: [],
        variants: [
            { code: "BTN.DLT.001.001", name: "Delete", description: "The x.", edits: "The symbol is an x and the colour is red.", values: { VAR001: "rest" } },
            { code: "BTN.ADD.001.002", name: "Add", description: "The plus.", edits: "The symbol is a plus.", values: {} }
        ]
    }, {
        code: "BTN.002", name: "info button", category: "component", summary: "A round button with an i.", variables: ["VAR001"], catalogue: [], requires: [], variants: []
    }, {
        code: "FLD.001", name: "Start date", category: "field", summary: "A date.", variables: [], catalogue: [], variants: [],
        requires: [{ asset: "BTN.001", variant: "BTN.DLT.001.001", role: "removes the field" }]
    }]
};
const withAsset = (patch: (library: Library) => Library) => checkLibrary(patch(structuredClone(good) as Library));

describe("the library checks", () => {
    it("accepts a sound library, and the x and the + as variants of one asset", () => {
        expect(checkLibrary(good)).toEqual([]);
    });
    it("rejects a malformed or repeated code", () => {
        expect(withAsset(l => ({ ...l, assets: [{ ...l.assets[0], code: "BTN1" }, ...l.assets.slice(1)] })).join("|")).toContain("asset code is not");
        expect(withAsset(l => ({ ...l, assets: [...l.assets, { ...l.assets[1], name: "other" }] })).join("|")).toContain("asset code used twice");
    });
    it("keeps every asset unique by category and name", () => {
        expect(withAsset(l => ({ ...l, assets: [...l.assets, { ...l.assets[1], code: "BTN.003" }] })).join("|")).toContain("asset is not unique");
    });
    it("rejects letters that are not the category's kind", () => {
        expect(withAsset(l => ({ ...l, assets: [{ ...l.assets[0], category: "tile" }, ...l.assets.slice(1)] })).join("|")).toContain("are component assets");
    });
    it("needs every variable and value named and described", () => {
        expect(withAsset(l => ({ ...l, variables: [{ ...state, description: "" }] })).join("|")).toContain("needs a description");
        expect(withAsset(l => ({ ...l, variables: [{ ...state, values: [{ name: "rest", description: "" }] }] })).join("|")).toContain("a value needs a description");
    });
    it("keeps a variant inside its asset, numbered in order, with values of the asset's variables", () => {
        const variant = good.assets[0].variants[0];
        expect(withAsset(l => ({ ...l, assets: [{ ...l.assets[0], variants: [{ ...variant, code: "BTN.DLT.002.001" }] }, ...l.assets.slice(1)] })).join("|")).toContain("belongs to");
        expect(withAsset(l => ({ ...l, assets: [{ ...l.assets[0], variants: [{ ...variant, code: "BTN.DLT.001.002" }] }, ...l.assets.slice(1)] })).join("|")).toContain("numbered in order");
        expect(withAsset(l => ({ ...l, assets: [{ ...l.assets[0], variants: [{ ...variant, values: { VAR001: "pressed" } }] }, ...l.assets.slice(1)] })).join("|")).toContain("is not a value");
        expect(withAsset(l => ({ ...l, assets: [{ ...l.assets[0], variants: [{ ...variant, edits: "" }] }, ...l.assets.slice(1)] })).join("|")).toContain("must say what it edits");
    });
    it("rejects a requirement or a placement that points at nothing", () => {
        expect(withAsset(l => ({ ...l, assets: [...l.assets.slice(0, 2), { ...l.assets[2], requires: [{ asset: "BTN.009", role: "x" }] }] })).join("|")).toContain("does not exist");
        expect(checkLibrary(good, [{ asset: "BTN.009", system: "Business System" }]).join("|")).toContain("not in the library");
        expect(checkLibrary(good, [{ asset: "BTN.001", variant: "BTN.ADD.001.009", system: "Business System" }]).join("|")).toContain("not a variant");
    });
});
