import { describe, expect, it } from "vitest";

import { stylesheet } from "../test/stylesheet";

/* The drag hand is one rule (conversation.css, "THE DRAG HAND"):
   every grip and every drag-scrolling row takes the drawn hand, and
   nothing is left on the browser's own pixelated one. */
describe("the drag hand", () => {

    const css = stylesheet("conversation.css");

    it("is drawn, sharp at 1x and 2x, with the browser's hand as the fallback", () => {
        expect(css).toContain("cursor:url(\"../assets/cursors/grab.svg\") 32 32, grab;");
        expect(css).toContain("cursor:image-set(url(\"../assets/cursors/grab.svg\") 1x, url(\"../assets/cursors/grab-2x.png\") 2x) 32 32, grab;");
        expect(css).toContain("cursor:image-set(url(\"../assets/cursors/grabbing.svg\") 1x, url(\"../assets/cursors/grabbing-2x.png\") 2x) 32 32, grabbing;");
    });

    it("reaches every grip, and no rule falls back to the bare keyword", () => {
        const rule = css.slice(css.indexOf("THE DRAG HAND"), css.indexOf("cursor:url(\"../assets/cursors/grab.svg\")"));
        for (const grip of [".numbered-list-number", ".answer-variant-cards", ".profile-cards-row", ".dynamic-table-scroll"]) {
            expect(rule).toContain(grip);
        }
        expect(css).not.toMatch(/cursor:\s*grab(bing)?\s*;/);
    });

});
