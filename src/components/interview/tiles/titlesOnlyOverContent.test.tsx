import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import DialogSectionBand from "./DialogSectionBand";
import { titledLines } from "./SectionTileGeometry";

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
