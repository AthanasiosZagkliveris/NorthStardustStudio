import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import Conversation from "./Conversation";
import { OrganizationService } from "../services/OrganizationService";
import { systems } from "../data/systems";
import { revealSegmentOf } from "../components/interview/tiles/segmentPage";
import lumen from "../data/examples/lumen-and-loom-studio.json";

/* FOUNDATION & ENGAGEMENT, ONE SEGMENT AT A TIME (PageGroups.ts, segmentPage.ts; the owner's approved plan of 2026-11-18, step 2; owner, 2026-11-19: "Place all
   the Tiles in the same chapter"): the Segment shown is one chapter of its seven Master Tiles, every other Segment drawn and hidden; a jump to a part of a
   hidden Segment shows it. Lumen & Loom has two Segments, both made by the app from its Positioning (B2C and B2B), so neither has an x. */
const EXAMPLE = lumen as unknown as { id: string; name: string; createdAt: number; systems: Record<string, { responses: { sectionNumber: number; value: { segments?: { id: string }[] } }[] }> };
const segmentIds = EXAMPLE.systems["3"].responses.find(response => response.sectionNumber === 1)!.value.segments!.map(segment => segment.id);

beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("northstardust-organization-" + EXAMPLE.id, JSON.stringify(EXAMPLE));
    localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: EXAMPLE.id, name: EXAMPLE.name, createdAt: EXAMPLE.createdAt }]));
    vi.spyOn(OrganizationService, "getSelected").mockImplementation(() => EXAMPLE.id);
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

function openPage(sectionNumber: number) {
    const system = systems.find(candidate => candidate.id === "business")!;
    return render(
        <MemoryRouter initialEntries={[{ pathname: "/conversation", state: { system, targetSectionNumber: sectionNumber, resume: {} } }]}>
            <Routes><Route path="/conversation" element={<Conversation />} /></Routes>
        </MemoryRouter>
    );
}

/** Which Segments' chapters show, found by an anchor the chapter answers to (its own, or Engagement's, which links saved before 2026-11-19 name). */
const shown = (container: HTMLElement, prefix: string) => segmentIds.filter(id => {
    const frame = container.querySelector<HTMLElement>('[data-anchor~="' + prefix + id + '"]');
    return frame !== null && !frame.hasAttribute("hidden");
});
// (Compared without their spaces: a title of two lines is drawn on its lines, "Channels &" over "Journey".)
const TILES = ["Segment Description", "Competitors", "Offerings", "Value Proposition", "Channels & Journey", "Customer's Relationship", "Demand & Conversion"].map(title => title.replace(/\s+/g, ""));
/** The titles of a Segment's chapter's tiles, in order. */
const tilesOf = (container: HTMLElement, id: string) => [...container.querySelector<HTMLElement>('[data-anchor~="' + id + '"]')!.querySelectorAll<HTMLElement>("button.section-tile")]
    .map(tile => (tile.querySelector(".section-tile-title")?.textContent ?? "").replace(/\s+/g, ""));

describe("Foundation & Engagement", () => {

    it("shows the first Segment as one chapter of its seven tiles, and draws the other hidden", () => {
        expect(segmentIds.length).toBe(2);
        const { container } = openPage(1);
        expect(shown(container, "")).toEqual([segmentIds[0]]);
        expect(tilesOf(container, segmentIds[0])).toEqual(TILES);
        // (Drawn with its tiles too, hidden, with the Segment's id.)
        expect(tilesOf(container, segmentIds[1])).toEqual(TILES);
        expect(container.querySelector('[data-anchor~="' + segmentIds[1] + '"]')?.getAttribute("data-segment-hidden")).toBe(segmentIds[1]);
        // (Made by the app from Positioning: no x. madeBy, by id.)
        expect(container.querySelectorAll(".business-foundation-frame-head .card-remove").length).toBe(0);
    });

    it("opens on the same page from either section, as a note or link to Customer Engagement does", () => {
        const { container } = openPage(2);
        expect(shown(container, "")).toEqual([segmentIds[0]]);
        expect(shown(container, "engagement-segment-")).toEqual([segmentIds[0]]);
    });

    it("shows a hidden Segment when a jump reaches a part of it", () => {
        const { container } = openPage(1);
        const hidden = container.querySelector<HTMLElement>('[data-anchor~="' + segmentIds[1] + '"]')!;
        let revealed = false;
        act(() => {
            revealed = revealSegmentOf(hidden.querySelector("button") ?? hidden);
        });
        expect(revealed).toBe(true);
        expect(shown(container, "")).toEqual([segmentIds[1]]);
        expect(shown(container, "engagement-segment-")).toEqual([segmentIds[1]]);
        // (Shown, nothing more to do.)
        expect(revealSegmentOf(hidden)).toBe(false);
    });

});
