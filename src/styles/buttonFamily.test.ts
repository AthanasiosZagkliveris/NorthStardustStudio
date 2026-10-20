import { describe, expect, it } from "vitest";

import { stylesheet } from "../test/stylesheet";

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
        const add = rule(accent, ".strategy-add-button, .header-tool, .business-documents-button, .workspace-documents-button, .org-calendar-chip, .org-calendar-month-nav-button {");
        expect(add).toContain("color: var(--accent-ink);");
        expect(add).toContain("border: 1px solid var(--accent-line);");
        expect(add).toContain("background: var(--accent-ground);");
        expect(accent).toMatch(/:hover:not\(:disabled\)[^{]*\{[^}]*background: var\(--accent-ground-hover\);/);
        expect(rule(css, ".interview-help-toggle:hover{")).toContain("color:var(--accent-hover-ink);");
        expect(rule(stylesheet("card-folding.css"), "*/ .fold-all-toggle {")).toContain("color: var(--accent-ink);");
        expect(rule(stylesheet("workspace.css"), ".secondary-button:hover:not(:disabled) {")).toContain("background: var(--accent-ground-hover);");
    });

    it("leaves no page colouring an add button of its own", () => {
        expect(css.includes(".business-foundation-input .strategy-add-button")).toBe(false);
        expect(css.includes(".strategy-theme-panel .strategy-add-button{ color:hsl")).toBe(false);
    });

});
