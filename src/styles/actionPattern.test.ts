import { describe, expect, it } from "vitest";

import { stylesheet, themeBlock } from "../test/stylesheet";

/* Past six colours a mark is striped / cross-hatched with a second colour
   (--pattern-alt): the second colour and every hue's ink keep 3:1 on the
   card ground, light, dark and sepia. */
describe("the second colour of a patterned action mark", () => {

    type Theme = "light" | "dark" | "sepia";
    type Rgb = [number, number, number];

    const toRgb = (hue: number, saturation: number, lightness: number): Rgb => {
        const s = saturation / 100;
        const l = lightness / 100;
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) => {
            const k = (n + hue / 30) % 12;
            return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        };
        return [f(0), f(8), f(4)];
    };
    const luminance = (rgb: Rgb) => {
        const [r, g, b] = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (one: Rgb, other: Rgb) => {
        const [a, b] = [luminance(one), luminance(other)].sort((x, y) => y - x);
        return (a + 0.05) / (b + 0.05);
    };
    const hex = (text: string): Rgb => [1, 3, 5].map(at => parseInt(text.slice(at, at + 2), 16) / 255) as Rgb;
    const global = stylesheet("global.css");
    const hues = [...global.matchAll(/--(?:shared|resource)-hue-\d: (\d+);/g)].map(match => Number(match[1]));

    for (const theme of ["light", "dark", "sepia"] as Theme[]) {
        it("keeps the second colour and every hue's ink at 3:1 on the surface (--bg-surface), " + theme, () => {
            const block = themeBlock(theme);
            const alt = block.match(/--pattern-alt: hsl\((\d+) (\d+)% (\d+)%\);/);
            const mark = block.match(/--theme-mark-ink: (\d+)% (\d+)%;/);
            const paper = block.match(/--bg-surface: (#[0-9a-f]{6});/);
            expect(alt && mark && paper, theme).toBeTruthy();
            expect(hues).toHaveLength(12);
            const ground = hex(paper![1]);
            expect(contrast(toRgb(Number(alt![1]), Number(alt![2]), Number(alt![3])), ground)).toBeGreaterThanOrEqual(3);
            for (const hue of hues) {
                expect(contrast(toRgb(hue, Number(mark![1]), Number(mark![2])), ground), "hue " + hue).toBeGreaterThanOrEqual(3);
            }
        });
    }

    it("is a stripe (4px bands at 45 degrees) and a cross-hatch of it, read as --tint-fill", () => {
        expect(global).toMatch(/\.tint-pattern-stripes \{\s*--tint-fill: repeating-linear-gradient\(45deg, var\(--tint-mark\) 0 4px, var\(--pattern-alt\) 4px 8px\);/);
        expect(global).toMatch(/\.tint-pattern-hatch \{\s*--tint-fill:/);
    });

});
