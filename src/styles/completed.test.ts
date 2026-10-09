import { describe, expect, it } from "vitest";

import { stylesheet, themeBlock } from "../test/stylesheet";

/* Everything completed -- the "Completed N" group, the cards in it,
   a founder's done tag -- is one neutral grey family, light, dark and
   sepia (a warm grey there). */
describe("the completed grey", () => {

    type Theme = "light" | "dark" | "sepia";
    const token = (name: string, theme: Theme) => {
        const match = themeBlock(theme).match(new RegExp("--" + name + ": (#[0-9a-f]{6});"));
        if (!match) throw new Error("no " + name);
        return match[1];
    };

    const luminance = (hex: string) => {
        const [r, g, b] = [1, 3, 5].map(at => parseInt(hex.slice(at, at + 2), 16) / 255)
            .map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (one: string, other: string) => {
        const [a, b] = [luminance(one), luminance(other)].sort((x, y) => y - x);
        return (a + 0.05) / (b + 0.05);
    };

    for (const theme of ["light", "dark", "sepia"] as Theme[]) {
        it("holds its head text at 4.5:1 on its grounds, " + theme, () => {
            for (const ground of ["bg-completed-ground", "bg-completed-card"]) {
                expect(contrast(token("text-completed-ink", theme), token(ground, theme))).toBeGreaterThanOrEqual(4.5);
            }
            // Grey: red, green and blue close together (a cool or warm grey at most).
            for (const name of ["bg-completed-ground", "bg-completed-card", "line-completed", "text-completed-ink"]) {
                const hex = token(name, theme);
                const channels = [1, 3, 5].map(at => parseInt(hex.slice(at, at + 2), 16));
                expect(Math.max(...channels) - Math.min(...channels), name).toBeLessThanOrEqual(30);
            }
        });
    }

    it("draws the group's head, its cards and the done tag from the family", () => {
        const css = stylesheet("conversation.css");
        const rule = (selector: string) => css.slice(css.indexOf(selector + "{"), css.indexOf("}", css.indexOf(selector + "{")));
        // The group itself has no frame and no ground (only its cards are tinted).
        expect(rule(".business-capability-completed")).not.toMatch(/background|box-shadow|border:/);
        expect(rule(".business-capability-completed .business-foundation-label")).toContain("var(--text-completed-ink)");
        expect(rule(".business-capability-completed .business-capability-activity")).toContain("var(--bg-completed-card)");
        expect(rule(".business-capability-done-tag")).toContain("var(--text-completed-ink)");
        expect(css).not.toMatch(/--(bg|line|text)-done-/);
    });

});
