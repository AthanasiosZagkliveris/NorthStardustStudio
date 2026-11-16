import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";

import CardTile from "./CardTile";

afterEach(cleanup);

/* Owner, 2026-11-16 19:18: a tile shared by several cards (one subchannel, each Offering's card) names each linked line by the card it opens, so the carousel of the
   floating card finds the line of the card it steps to (SectionTiles' opener: the tile haloed, the line marked, scrolled into view). */
describe("a card tile's linked lines", () => {

    it("are named by the card each opens, and a press still says which line it was", () => {
        const onLine = vi.fn();
        const { container } = render(
            <CardTile id="c1" name="Instagram" number={1} lines={["1. Rugs", "2. Classes"]} linkedLines={[true, true]} lineCards={["c1", "c2"]} onLine={onLine} onOpen={() => undefined} label="Instagram" tone="channel" />
        );
        const links = [...container.querySelectorAll<HTMLElement>(".section-tile-link")];
        expect(links.map(link => link.getAttribute("data-link"))).toEqual(["c1", "c2"]);
        fireEvent.click(links[1]);
        expect(onLine).toHaveBeenCalledWith(1, expect.anything());
    });

    it("keep their numbers where no card is named", () => {
        const { container } = render(
            <CardTile id="c1" name="Instagram" number={1} lines={["Rugs", "Classes"]} linkedLines={[true, true]} onLine={() => undefined} onOpen={() => undefined} label="Instagram" tone="channel" />
        );
        expect([...container.querySelectorAll(".section-tile-link")].map(link => link.getAttribute("data-link"))).toEqual(["0", "1"]);
    });

});
