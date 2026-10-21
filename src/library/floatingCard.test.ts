import { sheetSource } from "../test/stylesheet.ts";
import { describe, expect, it } from "vitest";
import { collectDefinitions, valuesOf } from "../../tools/scripts/docs/values.ts";
import { assets } from "./index.ts";
import { SCREEN_CLASSES } from "./contract.ts";

/* The floating card base's contract (src/library/assets/floatingCard.ts): its
   size table must be what the stylesheets give (phase 1: the same value in
   every screen class), and its parts must name properties that exist. */

const floatingCard = assets.find(asset => asset.name === "Floating card")!;
const names = Object.keys(import.meta.glob("../styles/*.css")).map(path => path.split("/").pop() as string);
const defs = collectDefinitions(names.map(name => ({ name, text: sheetSource(name) })));

describe("the floating card base's contract", () => {

    it("exists and lists its sizes by screen class and its parts top to bottom", () => {
        expect(floatingCard).toBeDefined();
        expect(floatingCard.sizes!.length).toBeGreaterThan(5);
        expect(floatingCard.anatomy!.length).toBeGreaterThan(4);
        expect(SCREEN_CLASSES).toEqual(["tablet", "laptop", "desktop"]);
    });

    it("has the sizes the stylesheets give: every size row with a property is that property's value in every class", () => {
        for (const row of floatingCard.sizes!.filter(item => item.token)) {
            for (const screen of SCREEN_CLASSES) {
                expect([...valuesOf(row.token!, defs)], row.token + " in " + screen).toEqual([row.values[screen] + row.unit]);
            }
        }
    });

    it("names, in its parts, gaps that are the properties' values", () => {
        for (const part of floatingCard.anatomy!.filter(item => item.gapAbove)) {
            expect([...valuesOf(part.gapAbove!.token, defs)], part.part).toEqual([part.gapAbove!.px + "px"]);
        }
    });

    it("keeps its geometry equal to its size table", () => {
        const g = floatingCard.geometry;
        const by = (token: string) => floatingCard.sizes!.find(row => row.token === token)!.values.desktop;
        expect(g.cardWidth).toBe(by("--open-card-width"));
        expect(g.founderWidth).toBe(by("--founder-card-min"));
        expect(g.radius).toBe(by("--radius-lg"));
        expect(g.padding).toBe(by("--card-padding"));
        expect(g.gap).toBe(by("--space-field"));
        expect(g.labelGap).toBe(by("--space-label"));
        expect(g.cellHeight).toBe(by("--control-square"));
        expect(g.labelColumn).toBe(by("--card-label-col"));
    });

    it("names the WCAG 2.2 criteria that apply", () => {
        expect(floatingCard.accessibility.criteria!.map(criterion => criterion.id)).toEqual(["1.4.3", "1.4.11", "2.4.7", "2.5.8", "1.4.10", "4.1.2"]);
    });

});
