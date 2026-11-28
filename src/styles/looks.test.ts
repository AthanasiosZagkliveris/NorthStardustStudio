import { describe, expect, it } from "vitest";
import { stylesheet, themeBlock } from "../test/stylesheet";

/* THE LOOKS THE STYLESHEETS MUST KEEP, one block for each look. */

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

/* A button takes the colour of the card it sits in: the card sets
   the --accent-* family, the buttons read it, and no page colours
   a button of its own. */
describe("the button colour family", () => {

    const global = stylesheet("global.css");
    const css = stylesheet("conversation.css");

    /** The declarations of the rule that starts with `start` (a selector and its "{"). */
    const rule = (sheet: string, start: string) => {
        const at = sheet.indexOf(start);
        if (at < 0) throw new Error("no rule " + start);
        return sheet.slice(at, sheet.indexOf("}", at));
    };

    const family = ["--accent-ink", "--accent-line", "--accent-ground", "--accent-ground-hover", "--accent-hover-ink"];

    it("is the app's blue out on the page", () => {
        expect(global).toContain("--accent-ink: var(--text-primary);");
        expect(global).toContain("--accent-ground-hover: var(--bg-button-hover);");
    });

    it("is set by a Segment, Theme or section card from its palette colour", () => {
        const card = rule(global, ".business-foundation-input, .strategy-theme-box, .roadmap-theme-box {");
        // A ground is the hue mixed toward the page's paper (colors.css).
        for (const name of family) expect(card).toMatch(new RegExp(name + ": (color-mix\\(in srgb, )?hsl\\(var\\(--strategy-theme-hue, 0\\)"));
    });

    it("is set by the Completed group in its grey", () => {
        const completed = rule(css, ".business-capability-completed{");
        for (const name of family) expect(completed).toContain(name + ": var(--");
        expect(completed).toContain("--accent-ground-hover: var(--bg-completed-hover);");
    });

    it("is what the outlined buttons read, at rest and under the pointer", () => {
        const accent = stylesheet("accent-button.css");
        const add = rule(accent, ".strategy-add-button, .header-tool, .org-calendar-chip {");
        expect(add).toContain("color: var(--accent-ink);");
        expect(add).toContain("border: 1px solid var(--accent-line);");
        expect(add).toContain("background: var(--accent-ground);");
        expect(accent).toMatch(/:hover:not\(:disabled\)[^{]*\{[^}]*background: var\(--accent-ground-hover\);/);
        expect(rule(css, ".interview-help-toggle:hover{")).toContain("color:var(--accent-hover-ink);");
        expect(rule(stylesheet("workspace.css"), ".secondary-button:hover:not(:disabled) {")).toContain("background: var(--accent-ground-hover);");
    });

    it("leaves no page colouring an add button of its own", () => {
        expect(css.includes(".business-foundation-input .strategy-add-button")).toBe(false);
        expect(css.includes(".strategy-theme-panel .strategy-add-button{ color:hsl")).toBe(false);
    });

});

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

    it("draws the group's head and its cards from the family (the done tag is no longer drawn: no screen renders it)", () => {
        const css = stylesheet("conversation.css");
        const rule = (selector: string) => css.slice(css.indexOf(selector + "{"), css.indexOf("}", css.indexOf(selector + "{")));
        // The group itself has no frame and no ground (only its cards are tinted).
        expect(rule(".business-capability-completed")).not.toMatch(/background|box-shadow|border:/);
        expect(rule(".business-capability-completed .business-foundation-label")).toContain("var(--text-completed-ink)");
        expect(rule(".business-capability-completed .business-capability-activity")).toContain("var(--bg-completed-card)");
        expect(css).not.toMatch(/--(bg|line|text)-done-/);
    });

});

/* The drag hand is one rule (conversation.css, "THE DRAG HAND"):
   every grip and every drag-scrolling row takes the drawn hand, and
   nothing is left on the browser's own pixelated one. */
describe("the drag hand", () => {

    const css = stylesheet("conversation.css");

    it("is drawn, sharp at 1x and 2x, with the browser's hand as the fallback", () => {
        expect(css).toContain("cursor:url(\"../../assets/cursors/grab.svg\") 32 32, grab;");
        expect(css).toContain("cursor:image-set(url(\"../../assets/cursors/grab.svg\") 1x, url(\"../../assets/cursors/grab-2x.png\") 2x) 32 32, grab;");
        expect(css).toContain("cursor:image-set(url(\"../../assets/cursors/grabbing.svg\") 1x, url(\"../../assets/cursors/grabbing-2x.png\") 2x) 32 32, grabbing;");
    });

    it("reaches every grip, and no rule falls back to the bare keyword", () => {
        const rule = css.slice(css.indexOf("THE DRAG HAND"), css.indexOf("cursor:url(\"../../assets/cursors/grab.svg\")"));
        for (const grip of [".numbered-list-number", ".answer-variant-cards", ".profile-cards-row", ".dynamic-table-scroll"]) {
            expect(rule).toContain(grip);
        }
        expect(css).not.toMatch(/cursor:\s*grab(bing)?\s*;/);
    });

});

/* Every label-and-amount list of the financial pages spaces its rows by
   one shared token and stands each amount on its label's first line. */
describe("the financial label-and-amount lists", () => {

    const css = stylesheet("conversation.css");

    it("space their rows by --space-field, in one rule", () => {
        // (The coverage, obligations and mix lists were the Financial Position's and the Break-Even's, records now in the Workbook: Questions 20, section 14.)
        expect(css).toMatch(/\.financial-cost-inputs\s*\{[^}]*gap:\s*var\(--space-field\)/);
    });

    it("put each amount on the first line of its label", () => {
        for (const row of [".financial-cost-inputs > li"]) {
            const escaped = row.replace(/[.>]/g, m => "\\" + m);
            expect(css, row).toMatch(new RegExp(escaped + "\\s*\\{[^}]*align-items:\\s*first baseline"));
        }
    });
});

/* Every Capability and System row -- the Calendar panel's lists -- is
   highlighted by one rule, and none by its own. */
describe("the Capability and System row highlight", () => {

    const global = stylesheet("global.css");

    it("is one rule for both kinds of row", () => {
        expect(global).toContain(".org-rail-capability-item:hover, .org-rail-system-item:hover { background: var(--bg-list-hover); }");
    });

    it("leaves no list its own highlight colour", () => {
        for (const sheet of ["organization-calendar.css"]) {
            const css = stylesheet(sheet);
            expect(css, sheet).not.toMatch(/(capability-item|system-item)[^{}]*:hover[^{}]*\{[^}]*background/);
            expect(css, sheet).not.toMatch(/capability-item\.active[^{}]*\{[^}]*background/);
        }
    });

    it("draws every row's text through the list ink, and gives each theme its highlight", () => {
        const colours = stylesheet("colors.generated.css");
        // The ink is set for light and dark; sepia's grounds are light, so it takes the light ink.
        expect(colours.match(/--capability-list-ink-weight: /g)).toHaveLength(2);
        expect(colours.match(/--bg-list-hover: /g)).toHaveLength(3);
        expect(colours.match(/--bg-list-selected: /g)).toHaveLength(3);
        expect(stylesheet("organization-calendar.css")).toContain("var(--capability-list-ink-weight)");
    });

});

describe("one tick box", () => {

    it("gives every checkbox one fixed size that a wrapping label cannot squeeze, beside its label's first line", () => {
        const css = stylesheet("global.css");
        expect(css).toContain("input[type=\"checkbox\"] { flex: none; width: var(--size-mark); height: var(--size-mark); margin: 0; font: inherit; line-height: inherit;");
        expect(css).toContain("label:has(> input[type=\"checkbox\"]) { align-items: flex-start;");
        expect(css).toContain("label:has(> input[type=\"checkbox\"]) > input[type=\"checkbox\"] { margin-top: calc((1lh - var(--size-mark)) / 2); }");
    });

    it("leaves no checkbox a size of its own", () => {
        for (const name of ["conversation.css", "global.css", "notepad.css"]) {
            const css = stylesheet(name);
            // A rule for a checkbox's own class that sets a width.
            expect(css).not.toMatch(/answer-checklist-checkbox\s*\{[^}]*width:\s*20px/);
            expect(css).not.toMatch(/business-foundation-tick > \.brand-tick-box\s*\{[^}]*margin-top/);
        }
    });


    it("underlines a tick-box option's words under the pointer, and gives its box a field's hover", () => {
        const css = stylesheet("global.css");
        expect(css).toContain("label:has(> input[type=\"checkbox\"]:not(:disabled)):hover > :not(input),");
        // A tick box that is not inside its label (a Text Hierarchy level's)
        // reacts the same, under the pointer on the box itself.
        expect(css).toContain(".brand-tick:has(> input[type=\"checkbox\"]:not(:disabled):hover) > :not(input) { text-decoration: underline;");
        // The box itself takes a field's hover: the soft glow round it (no wire), flat when ticked.
        expect(css).toContain("input[type=\"checkbox\"]:hover:not(:disabled):not(:focus-visible) { box-shadow: var(--cell-inset-recess), var(--choice-glow); }");
        expect(css).toContain("input[type=\"checkbox\"]:checked { box-shadow: none;");
    });

});

describe("a tick box's click area", () => {

    it("is only the box and its words: the label is as wide as they are", () => {
        const css = stylesheet("global.css");
        expect(css).toMatch(/label:has\(> input\[type="checkbox"\]\) \{[^}]*width: fit-content;[^}]*max-width: 100%;/);
    });

});

describe("a radio's reaction", () => {

    it("reacts under the pointer as a tick box does: its words underlined and the round's glow ring", () => {
        const css = stylesheet("radio-choice.css");
        // The round is drawn (a circle in the box's own look, its edge in every state: owner, 2026-11-04), so its ring is a ring: 4px at 18% round it, as a tick box's.
        expect(css).toContain(".radio-choice-option > input[type=\"radio\"] { appearance: none; flex: none; box-sizing: border-box; width: var(--size-radio); height: var(--size-radio); margin: 0; border: 1px solid var(--text-muted); border-radius: 50%;");
        expect(css).toContain(".radio-choice-option > input[type=\"radio\"]:hover:not(:disabled):not(:focus-visible) { box-shadow: var(--cell-inset-recess), var(--choice-glow); }");
        expect(css).toContain(".radio-choice-option:has(> input[type=\"radio\"]:not(:disabled)):hover > :not(input) { text-decoration: underline;");
    });

});
