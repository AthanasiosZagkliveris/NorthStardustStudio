import { describe, expect, it } from "vitest";

import { tipPlace } from "./Tooltip.tsx";

/* EVERY TOOLTIP STANDS IN ONE PLACE (owner, 2026-11-21 16:02 UTC+2; Interface 8): above its control, its left edge on the control's left edge, 6px over its top;
   under it only where the window has no room above. */
describe("tipPlace", () => {

    const box = (top: number) => ({ left: 200, right: 230, top, bottom: top + 36, width: 30, height: 36, x: 200, y: top, toJSON: () => ({}) } as DOMRect);
    const size = { width: 250, height: 32 } as DOMRect;

    it("stands above its control, on its left edge, whatever stands there", () => {
        Object.defineProperty(window, "innerWidth", { value: 1920, configurable: true });
        Object.defineProperty(window, "innerHeight", { value: 1100, configurable: true });
        const arrow = document.createElement("button");
        const place = tipPlace(box(550), size, arrow);
        expect(place).toEqual({ left: 200, top: 550 - 6 - 32 });
    });

    it("stands under its control only where there is no room above", () => {
        const arrow = document.createElement("button");
        const place = tipPlace(box(20), size, arrow);
        expect(place).toEqual({ left: 200, top: 20 + 36 + 6 });
    });
});
