import { describe, expect, it } from "vitest";

import { PALETTE, hueDistance, nearestPaletteColour, nextPaletteHue, paletteHue, paletteHuesInOrder } from "./Palette";
import { createBusinessCustomerSegment, segmentHue, stableCardHue, strategyThemeHues } from "./AnswerUtils";
import { stylesheet } from "../../test/stylesheet";

const hues = PALETTE.map(colour => colour.hue);

describe("the palette", () => {

    it("has eight named colours, each clear of the others on the wheel", () => {
        expect(PALETTE).toHaveLength(8);
        expect(new Set(PALETTE.map(colour => colour.name)).size).toBe(8);
        for (const one of hues) {
            for (const other of hues.filter(hue => hue !== one)) {
                expect(hueDistance(one, other)).toBeGreaterThanOrEqual(25);
            }
        }
    });

    it("draws a stored arbitrary hue as the nearest palette colour", () => {
        expect(paletteHue(137.5)).toBe(130);        // a green stays sage
        expect(nearestPaletteColour(350).name).toBe("rose");
        expect(nearestPaletteColour(5).name).toBe("terracotta");
        expect(paletteHue(359.9)).toBe(14);  // the short way round
        expect(paletteHue(Number.NaN)).toBe(PALETTE[0].hue);
        for (const hue of hues) expect(paletteHue(hue)).toBe(hue);
    });

    it("leaves a Segment's stored hue alone and draws it from the palette", () => {
        const segment = { id: "segment-x", hue: 57.3 };
        expect(segmentHue(segment)).toBe(44);   // sand
        expect(segment.hue).toBe(57.3);
        expect(hues).toContain(segmentHue({ id: "segment-without-a-hue" }));
        expect(hues).toContain(stableCardHue("infrastructure"));
    });

    it("gives a new thing the next palette colour after its neighbour's", () => {
        expect(nextPaletteHue([])).toBe(PALETTE[0].hue);
        expect(nextPaletteHue([], 131)).toBe(130);
        expect(nextPaletteHue([PALETTE[0].hue])).toBe(PALETTE[1].hue);
        expect(nextPaletteHue([PALETTE[3].hue, PALETTE[1].hue])).toBe(PALETTE[2].hue);
        // A stored arbitrary hue counts as the palette colour it draws as.
        expect(nextPaletteHue([205])).toBe(PALETTE[1].hue);
    });

    it("cycles through all eight before repeating, and never matches its neighbour", () => {
        const taken: number[] = [];
        for (let count = 0; count < 20; count++) {
            const next = nextPaletteHue(taken);
            if (taken.length) expect(next).not.toBe(taken[taken.length - 1]);
            taken.push(next);
        }
        expect(new Set(taken.slice(0, 8)).size).toBe(8);
        expect(taken.slice(8, 16)).toEqual(taken.slice(0, 8));
    });

    it("skips to the least-used colour once some are taken twice", () => {
        // Sky and terracotta twice each, sage once: after sage comes
        // lavender, which no one has.
        const taken = [PALETTE[0].hue, PALETTE[1].hue, PALETTE[0].hue, PALETTE[1].hue, PALETTE[2].hue];
        expect(nextPaletteHue(taken)).toBe(PALETTE[3].hue);
        // Everything once except the neighbour: never the neighbour.
        expect(nextPaletteHue([...hues.slice(1), PALETTE[0].hue])).not.toBe(PALETTE[0].hue);
    });

    it("gives new Segments and Themes palette colours only", () => {
        const first = createBusinessCustomerSegment([]);
        expect(hues).toContain(first.hue);
        const second = createBusinessCustomerSegment([first.hue!]);
        expect(hues).toContain(second.hue);
        expect(second.hue).not.toBe(first.hue);
        const themes = strategyThemeHues(["c", "a", "b"]);
        expect(themes).toEqual({ a: PALETTE[0].hue, b: PALETTE[1].hue, c: PALETTE[2].hue });
        expect(paletteHuesInOrder(Array.from({ length: 9 }, (_, index) => "t" + index)).t8).toBe(PALETTE[0].hue);
    });

});

/* The families in colors.css, light and dark, completed with each
   palette hue: every label ink must hold 4.5:1 on every ground it
   sits on, in both themes. */
describe("the palette's contrast", () => {

    const css = stylesheet("colors.css");
    const darkStart = css.indexOf(":root[data-theme=\"dark\"] {");

    const family = (token: string, dark: boolean) => {
        const part = dark ? css.slice(darkStart) : css.slice(0, darkStart);
        const match = part.match(new RegExp("--" + token + ": ([\\d.]+)% ([\\d.]+)%;"));
        if (!match) throw new Error("no " + token);
        return [Number(match[1]), Number(match[2])];
    };

    const channels = (hue: number, saturation: number, lightness: number) => {
        const s = saturation / 100;
        const l = lightness / 100;
        const k = (n: number) => (n + hue / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        return [0, 8, 4].map(n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)));
    };

    const luminance = (rgb: number[]) => {
        const [r, g, b] = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const contrast = (one: number[], other: number[]) => {
        const [a, b] = [luminance(one), luminance(other)].sort((x, y) => y - x);
        return (a + 0.05) / (b + 0.05);
    };

    const pairs: [string, string[]][] = [
        ["theme-text-ink", ["theme-bg-ground", "theme-bg-ground-alt", "theme-bg-inner", "theme-bg-hover", "theme-bg-wash", "theme-bg-raised", "theme-bg-pill", "theme-bg-card-wash", "theme-bg-result-wash"]],
        ["theme-text-ink-deep", ["theme-bg-ground", "theme-bg-inner"]],
        ["theme-text-accent-deeper", ["theme-bg-ground", "theme-bg-inner"]],
        ["theme-text-bar-ink", ["theme-bg-bar", "theme-bg-bar-hover"]]
    ];

    for (const dark of [false, true]) {
        it("holds every label at 4.5:1 on every ground, " + (dark ? "dark" : "light"), () => {
            const fails: string[] = [];
            for (const colour of PALETTE) {
                for (const [ink, grounds] of pairs) {
                    for (const ground of grounds) {
                        const ratio = contrast(channels(colour.hue, ...(family(ink, dark) as [number, number])), channels(colour.hue, ...(family(ground, dark) as [number, number])));
                        if (ratio < 4.5) fails.push(colour.name + " " + ink + " on " + ground + " " + ratio.toFixed(2));
                    }
                }
            }
            expect(fails).toEqual([]);
        });
    }

});
