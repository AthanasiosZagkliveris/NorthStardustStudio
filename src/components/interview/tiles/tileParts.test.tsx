import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { CarouselArrows } from "./CarouselArrows";
import { titledLines } from "./SectionTileGeometry";
import CardTile from "./CardTile";
import DialogSectionBand from "./DialogSectionBand";

/* THE PARTS OF A TILE: the card tile, the carousel arrows and the titles over what they title. */

describe("a card tile", () => {
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
});

describe("the carousel arrows", () => {
    afterEach(() => {
        cleanup();
        document.querySelectorAll("[data-test-layer]").forEach(layer => layer.remove());
    });

    /** A layer with its carousel arrows, as a dialog or a floating card draws them. */
    function Layer() {
        const target = useRef<HTMLDivElement | null>(null);
        return (
            <div data-carousel="">
                <div ref={target}>The layer</div>
                <CarouselArrows target={target} hue={200} step={{ what: "section", previous: () => undefined, next: () => undefined }} />
            </div>
        );
    }

    describe("only the topmost layer shows its carousel arrows", () => {

        it("hides a layer's arrows when a layer over it becomes a carousel after it is drawn (its step known later)", async () => {
            render(<Layer />);
            expect(await screen.findByRole("button", { name: /Previous section/ })).toBeTruthy();
            // A layer drawn over it, not yet a carousel: the arrows stay.
            const over = document.createElement("div");
            over.setAttribute("data-test-layer", "");
            document.body.appendChild(over);
            await new Promise(resolve => setTimeout(resolve, 20));
            expect(screen.queryByRole("button", { name: /Previous section/ })).toBeTruthy();
            // It becomes one: the layer under it hides its arrows.
            over.setAttribute("data-carousel", "");
            await waitFor(() => expect(screen.queryByRole("button", { name: /Previous section/ })).toBeNull());
            // And shows them again when it goes.
            over.remove();
            expect(await screen.findByRole("button", { name: /Previous section/ })).toBeTruthy();
        });

    });
});

describe("the titles", () => {
    afterEach(cleanup);

    /* TITLES ONLY OVER WHAT THEY TITLE (owner, 2026-11-19 22:48 UTC+2: "Titles - only when they have been defined, or already exist."; layout rules section 9). */
    describe("a title stands only over what it titles", () => {

        it("puts a tile's sub-title over its lines, in capitals, centred, the lines bulleted", () => {
            expect(titledLines("Profiles", ["The Considered Nester"])).toEqual({ items: ["PROFILES", "The Considered Nester"], itemMarks: [{ centre: true }, { bullet: true }] });
        });

        it("leaves the sub-title out where nothing stands under it", () => {
            expect(titledLines("Profiles", [])).toEqual({ items: [], itemMarks: [] });
        });

        it("draws a dialog's titled section only where it holds something", () => {
            const { container } = render(<DialogSectionBand title="Offerings">{[]}</DialogSectionBand>);
            expect(container.firstChild).toBeNull();
            render(<DialogSectionBand title="Profiles"><p>One</p></DialogSectionBand>);
            expect(screen.getByRole("heading", { name: "Profiles" })).toBeTruthy();
        });

    });
});
