import { describe, expect, it } from "vitest";

import { PALETTE, hueDistance, nearestPaletteColour, nextPaletteHue, paletteHue, paletteHuesInOrder } from "./Palette";
import { createBusinessCustomerSegment, segmentHue, stableCardHue, strategyThemeHues } from "./AnswerUtils";
import { themeBlock } from "../../test/stylesheet";

const hues = PALETTE.map(colour => colour.hue);

describe("the palette", () => {

    it("has seven named colours, each clear of the others on the wheel", () => {
        expect(PALETTE).toHaveLength(7);
        expect(new Set(PALETTE.map(colour => colour.name)).size).toBe(7);
        expect(PALETTE.map(colour => colour.name)).not.toContain("sand");
        for (const one of hues) {
            for (const other of hues.filter(hue => hue !== one)) {
                expect(hueDistance(one, other)).toBeGreaterThanOrEqual(28);
            }
        }
    });

    it("takes the colours closest to the app's blue first, the warm ones last", () => {
        expect(PALETTE.map(colour => colour.name)).toEqual(["sky", "periwinkle", "teal", "sage", "lavender", "rose", "terracotta"]);
        // The first three sit within 45 degrees of the app's blue (hue 217).
        PALETTE.slice(0, 3).forEach(colour => expect(hueDistance(colour.hue, 217)).toBeLessThanOrEqual(45));
        expect(hueDistance(PALETTE[6].hue, 217)).toBeGreaterThan(150);
    });

    it("draws a stored arbitrary hue as the nearest palette colour", () => {
        expect(paletteHue(137.5)).toBe(130);        // a green stays sage
        expect(nearestPaletteColour(350).name).toBe("rose");
        expect(nearestPaletteColour(5).name).toBe("terracotta");
        expect(nearestPaletteColour(44).name).toBe("terracotta");   // sand's hue
        expect(paletteHue(359.9)).toBe(14);  // the short way round
        expect(paletteHue(Number.NaN)).toBe(PALETTE[0].hue);
        for (const hue of hues) expect(paletteHue(hue)).toBe(hue);
    });

    it("leaves a Segment's stored hue alone and draws it from the palette", () => {
        const segment = { id: "segment-x", hue: 57.3 };
        expect(segmentHue(segment)).toBe(14);   // near where sand was: terracotta
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

    it("cycles through all seven, in priority order, before repeating, and never matches its neighbour", () => {
        const taken: number[] = [];
        for (let count = 0; count < 20; count++) {
            const next = nextPaletteHue(taken);
            if (taken.length) expect(next).not.toBe(taken[taken.length - 1]);
            taken.push(next);
        }
        expect(taken.slice(0, 7)).toEqual(hues);
        expect(taken.slice(7, 14)).toEqual(taken.slice(0, 7));
    });

    it("skips to the least-used colour once some are taken twice", () => {
        // Sky and periwinkle twice each, teal once: after teal comes
        // sage, which no one has.
        const taken = [PALETTE[0].hue, PALETTE[1].hue, PALETTE[0].hue, PALETTE[1].hue, PALETTE[2].hue];
        expect(nextPaletteHue(taken)).toBe(PALETTE[3].hue);
        // Everything once except the neighbour: never the neighbour.
        expect(nextPaletteHue([...hues.slice(1), PALETTE[0].hue])).not.toBe(PALETTE[0].hue);
    });

    it("gives new Segments and Themes palette colours only", () => {
        const first = createBusinessCustomerSegment([]);
        expect(first.hue).toBe(PALETTE[0].hue);   // the first Segment is sky
        expect(hues).toContain(first.hue);
        const second = createBusinessCustomerSegment([first.hue!]);
        expect(hues).toContain(second.hue);
        expect(second.hue).not.toBe(first.hue);
        const themes = strategyThemeHues(["c", "a", "b"]);
        expect(themes).toEqual({ a: PALETTE[0].hue, b: PALETTE[1].hue, c: PALETTE[2].hue });
        expect(paletteHuesInOrder(Array.from({ length: 8 }, (_, index) => "t" + index)).t7).toBe(PALETTE[0].hue);
    });

});

/* The families in colors.css, light, dark and sepia, completed with
   each palette hue: every label ink must hold 4.5:1 on every ground
   it sits on, in every theme. A ground is its hue mixed toward the
   page's paper by --theme-ground-weight (all of it in light and dark,
   62% in sepia), as the stylesheets draw it. */
describe("the palette's contrast", () => {

    type Theme = "light" | "dark" | "sepia";

    const family = (token: string, theme: Theme) => {
        const match = themeBlock(theme).match(new RegExp("--" + token + ": ([\\d.]+)% ([\\d.]+)%;"));
        if (!match) throw new Error("no " + token + " in " + theme);
        return [Number(match[1]), Number(match[2])];
    };

    /* The grounds the stylesheets mix toward the paper, and the mix
       (a theme without its own takes the light one's). */
    const mixed = ["theme-bg-wash", "theme-bg-ground", "theme-bg-ground-alt", "theme-bg-raised", "theme-bg-pill", "theme-bg-inner", "theme-bg-hover", "theme-bg-card-wash", "theme-bg-result-wash", "theme-bg-meter", "theme-bg-bar", "theme-bg-bar-hover", "theme-bg-initiative"];
    const mix = (theme: Theme) => {
        const find = (pattern: RegExp) => (themeBlock(theme).match(pattern) ?? themeBlock("light").match(pattern))![1];
        const paper = find(/--theme-ground-paper: #([0-9a-f]{6});/);
        return {
            weight: Number(find(/--theme-ground-weight: ([\d.]+)%;/)) / 100,
            paper: [0, 2, 4].map(at => parseInt(paper.slice(at, at + 2), 16) / 255)
        };
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

    const groundOf = (hue: number, token: string, theme: Theme) => {
        const plain = channels(hue, ...(family(token, theme) as [number, number]));
        if (!mixed.includes(token)) return plain;
        const { weight, paper } = mix(theme);
        return plain.map((c, i) => c * weight + paper[i] * (1 - weight));
    };

    it("warms the grounds toward the paper in sepia only", () => {
        expect(mix("light").weight).toBe(1);
        expect(mix("dark").weight).toBe(1);
        expect(mix("sepia").weight).toBeLessThan(1);
    });

    for (const theme of ["light", "dark", "sepia"] as Theme[]) {
        it("holds every label at 4.5:1 on every ground, " + theme, () => {
            const fails: string[] = [];
            for (const colour of PALETTE) {
                for (const [ink, grounds] of pairs) {
                    for (const ground of grounds) {
                        const ratio = contrast(channels(colour.hue, ...(family(ink, theme) as [number, number])), groundOf(colour.hue, ground, theme));
                        if (ratio < 4.5) fails.push(colour.name + " " + ink + " on " + ground + " " + ratio.toFixed(2));
                    }
                }
            }
            expect(fails).toEqual([]);
        });
    }

});
