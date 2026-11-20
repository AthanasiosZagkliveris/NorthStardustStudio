import { afterEach, describe, expect, it } from "vitest";

import { tipPlace } from "./Tooltip.tsx";

/* A TOOLTIP STANDS BESIDE ITS CONTROL, NEVER AT THE WINDOW'S EDGE (owner, 2026-11-21 01:04 UTC+2: the left page arrow's tip stood at the window's right edge;
   doc 24): where every place beside the control covers another control, the tip stands above its control. */
describe("tipPlace", () => {

    const original = document.elementFromPoint;
    afterEach(() => { document.elementFromPoint = original; });

    it("keeps the tip by its control when every place covers another control", () => {
        Object.defineProperty(window, "innerWidth", { value: 1920, configurable: true });
        Object.defineProperty(window, "innerHeight", { value: 1100, configurable: true });
        const arrow = document.createElement("button");
        document.body.appendChild(arrow);
        const box = { left: 200, right: 230, top: 550, bottom: 586, width: 30, height: 36, x: 200, y: 550, toJSON: () => ({}) } as DOMRect;
        arrow.getBoundingClientRect = () => box;
        const other = document.createElement("button");
        document.body.appendChild(other);
        // (Every point near the arrow is another control -- the tiles beside it --; only the far right of the window is clear.)
        document.elementFromPoint = (x: number) => (x > 1500 ? null : other);
        const size = { width: 250, height: 32 } as DOMRect;
        const place = tipPlace(box, size, arrow);
        expect(place.left).toBeLessThan(box.right + 6);
        expect(place.left + size.width).toBeGreaterThan(box.left - 6);
    });
});
