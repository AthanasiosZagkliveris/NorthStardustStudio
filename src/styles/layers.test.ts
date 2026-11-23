import { describe, expect, it } from "vitest";
import { stylesheet } from "../test/stylesheet.ts";

/*
    THE LAYERS' ORDER (owner, 2026-11-23 17:43 UTC+2: "check and fix the hierachy"; layout rules section 22): from the page up -- the page's rails and arrows, a
    help panel dropped from a title, the Calendar's side panel, the Notes panel, the header with its Menu, the overlays. Read from the stylesheets, so a new
    z-index that breaks the order fails here.
*/

/** The z-index a rule of a stylesheet gives (its first declaration in the rule that opens with the selector). */
function zIndexOf(sheet: string, selector: string): number {
    const css = stylesheet(sheet);
    const at = css.indexOf(selector + " {") >= 0 ? css.indexOf(selector + " {") : css.indexOf(selector + "{");
    const rule = at < 0 ? "" : css.slice(at, css.indexOf("}", at));
    const match = /z-index:\s*(-?\d+)/.exec(rule);
    if (!match) {
        throw new Error("No z-index for " + selector + " in " + sheet);
    }
    return Number(match[1]);
}

describe("the layers' order", () => {

    it("stacks the page's rails, a title's help, the Calendar, Notes and the header in that order, and the header's Menu above the side panels", () => {
        const rails = zIndexOf("bullet-rail.css", ".bullet-rails");
        const help = zIndexOf("title-arrow.css", ".card-title-block > .card-title-help");
        const calendar = zIndexOf("organization-calendar.css", ".org-calendar-panel");
        const notes = zIndexOf("notepad.css", ".notepad-panel");
        const header = zIndexOf("app-header.css", ".app-header");
        expect([rails, help, calendar, notes, header]).toEqual([...[rails, help, calendar, notes, header]].sort((one, other) => one - other));
        expect(new Set([rails, help, calendar, notes, header]).size).toBe(5);
    });

});
