import { describe, expect, it } from "vitest";

import { stylesheet, themeBlock } from "../test/stylesheet";

/* The neutral card ground (--bg-card-tint): white boxes stand out on
   it, and every text token on a card keeps 4.5:1 on it, light, dark and
   sepia (the faint text as --text-faint-on-tint). */
describe("the neutral card ground", () => {

    type Theme = "light" | "dark" | "sepia";
    const token = (name: string, theme: Theme) => {
        const match = themeBlock(theme).match(new RegExp("--" + name + ": (#[0-9a-f]{6});"));
        if (!match) throw new Error("no " + name + " in " + theme);
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
        it("keeps every card text at 4.5:1 on it, and differs from the white boxes, " + theme, () => {
            const ground = token("bg-card-tint", theme);
            for (const text of ["text-default", "text-muted", "text-subtle", "text-faint-on-tint"]) {
                expect(contrast(token(text, theme), ground), text).toBeGreaterThanOrEqual(4.5);
            }
            expect(ground).not.toBe(token("bg-surface", theme));
        });
    }

    it("is the ground of every neutral card", () => {
        const css = stylesheet("conversation.css");
        expect(css).toMatch(/\.legal-entity-card\{[^}]*background:var\(--bg-card-tint\);/);
        expect(css).toMatch(/\.business-foundation-card\{[^}]*background:var\(--bg-card-tint\);/);
    });

});
