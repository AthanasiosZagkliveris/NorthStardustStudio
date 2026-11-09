import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

vi.mock("../services/GlossaryService", async (importOriginal) => {
    const original = await importOriginal<typeof import("../services/GlossaryService")>();
    return {
        ...original,
        GlossaryService: {
            appTerms: original.GlossaryService.appTerms,
            userTerms: () => [
                { cardId: "segment-1", name: "Conscious London Homemakers", kind: "Segment", description: "Homeowners who buy handmade.", systemNumber: 3, sectionNumber: 1 }
            ]
        }
    };
});

import Glossary, { GLOSSARY_INFO, letterRanges } from "./Glossary";
import GlossaryButton from "../components/GlossaryButton";
import { OrganizationService } from "../services/OrganizationService";
import { harvardReference, SOURCES } from "../framework/engine/Sources";

function Where({ name }: { name: string }) {
    const location = useLocation();
    return <p>{name + " at " + location.pathname}</p>;
}

beforeEach(() => {
    localStorage.clear();
    const organization = OrganizationService.create("Lumen");
    OrganizationService.setSelected(organization.id);
});

afterEach(cleanup);

function open() {
    render(
        <MemoryRouter initialEntries={["/assistant"]}>
            <GlossaryButton />
            <Routes>
                <Route path="/assistant" element={<Where name="System Selection" />} />
                <Route path="/glossary" element={<Glossary />} />
            </Routes>
        </MemoryRouter>
    );
    act(() => { fireEvent.click(screen.getAllByRole("button", { name: "Glossary and references" })[0]); });
}

describe("the Glossary", () => {

    it("lists the app's terms and yours, each kind in its own colour, A to Z", () => {
        open();
        expect(screen.getByRole("heading", { name: /^Glossary/ })).toBeTruthy();
        // The kinds are named once, in the funnel, and their colours in the title's "i": no legend, and an app term has no tag.
        expect(document.querySelector(".glossary-legend")).toBeNull();
        expect(document.querySelector(".glossary-entry-app .glossary-term-tag")).toBeNull();
        const app = document.querySelector(".glossary-entry-app");
        const yours = document.querySelector(".glossary-entry-yours");
        expect(app).toBeTruthy();
        expect(yours?.textContent).toContain("Conscious London Homemakers");
        expect(yours?.textContent).toContain("Segment");
        expect(within(yours as HTMLElement).getByRole("button", { name: "Open the segment" })).toBeTruthy();
        const names = [...document.querySelectorAll(".glossary-term-name")].map(node => node.textContent ?? "");
        expect([...names].sort((one, other) => one.localeCompare(other, "en-GB", { sensitivity: "base" }))).toEqual(names);
    });

    it("shows either kind, or both, through the funnel", () => {
        open();
        fireEvent.click(screen.getByRole("button", { name: "Choose which terms show" }));
        fireEvent.click(screen.getByRole("checkbox", { name: "App terms" }));
        expect(document.querySelector(".glossary-entry-app")).toBeNull();
        expect(document.querySelector(".glossary-entry-yours")).toBeTruthy();
        fireEvent.click(screen.getByRole("checkbox", { name: "Your terms" }));
        expect(screen.getByText("No terms to show: the funnel leaves them all out.")).toBeTruthy();
    });

    it("has ONE funnel: the kinds of term first, then the letter ranges", () => {
        open();
        expect(document.querySelectorAll(".glossary-bar .funnel-box, .glossary-bar [aria-label^='Choose']")).toHaveLength(1);
        fireEvent.click(screen.getByRole("button", { name: "Choose which terms show" }));
        const options = screen.getAllByRole("checkbox").map(box => box.getAttribute("aria-label") ?? box.closest("label")?.textContent ?? "");
        expect(options.slice(0, 2).join("|")).toMatch(/App terms.*\|.*Your terms/);
        // A letter range ticked off hides its terms, and leaves the kinds alone.
        const ranges = options.slice(2);
        if (ranges.length > 0) {
            const before = document.querySelectorAll(".glossary-entry").length;
            fireEvent.click(screen.getAllByRole("checkbox")[2]);
            expect(document.querySelectorAll(".glossary-entry").length).toBeLessThan(before);
            expect(document.querySelector(".glossary-entry-app")).toBeTruthy();
        }
    });

    it("cites an app term in the Harvard style, and the citation opens its full reference", () => {
        open();
        const citation = screen.getAllByRole("button", { name: "(Franklin, Graybeal and Cooper, 2019)" })[0];
        fireEvent.click(citation);
        expect(screen.getByRole("heading", { name: /^References/ })).toBeTruthy();
        const entry = document.getElementById("reference-breakEvenInDollars");
        expect(entry?.textContent).toBe(harvardReference(SOURCES.breakEvenInDollars));
        expect(entry?.className).toContain("glossary-entry-target");
        // Every source once.
        expect(document.querySelectorAll(".references-entry")).toHaveLength(Object.keys(SOURCES).length);
    });

    it("shows the References under the letter ranges ticked in their funnel", () => {
        open();
        fireEvent.click(screen.getByRole("tab", { name: "References" }));
        fireEvent.click(screen.getByRole("button", { name: "Choose which letter ranges show" }));
        expect(screen.getAllByRole("checkbox")).toHaveLength(2);
        expect(screen.getByRole("checkbox", { name: "K–Z" })).toBeTruthy();
        fireEvent.click(screen.getByRole("checkbox", { name: "A–I" }));
        const left = [...document.querySelectorAll(".references-entry")].map(node => (node.textContent ?? "").charAt(0).toLocaleUpperCase("en-GB"));
        expect(left).toHaveLength(12);
        expect(left.every(letter => letter >= "K")).toBe(true);
    });

});

describe("the References' letter ranges", () => {

    const spread = (counts: Record<string, number>) => Object.entries(counts).flatMap(([letter, count]) => new Array<string>(count).fill(letter));

    it("cut today's 27 references into A–I (15) and K–Z (12)", () => {
        const letters = spread({ A: 2, B: 2, C: 1, D: 1, F: 2, G: 3, I: 4, K: 2, L: 2, S: 2, T: 2, U: 3, V: 1 });
        const ranges = letterRanges(letters);
        expect(ranges.map(range => range.label)).toEqual(["A–I", "K–Z"]);
        expect(ranges.map(range => letters.filter(letter => range.letters.includes(letter)).length)).toEqual([15, 12]);
    });

    it("make three ranges of 45 references, about 15 each, from A to Z", () => {
        const letters = spread({ A: 4, B: 3, C: 3, D: 2, E: 3, F: 3, G: 2, H: 3, J: 4, M: 3, N: 3, P: 3, R: 3, S: 3, W: 3 });
        expect(letters).toHaveLength(45);
        const ranges = letterRanges(letters);
        expect(ranges).toHaveLength(3);
        expect(ranges[0].label.startsWith("A–")).toBe(true);
        expect(ranges[2].label.endsWith("–Z")).toBe(true);
        expect(ranges.map(range => letters.filter(letter => range.letters.includes(letter)).length)).toEqual([15, 15, 15]);
    });

    it("never split one letter between two ranges", () => {
        const letters = spread({ A: 25, B: 5 });
        const ranges = letterRanges(letters);
        expect(ranges.map(range => range.letters)).toEqual([["A"], ["B"]]);
        expect(ranges.map(range => range.label)).toEqual(["A", "B–Z"]);
        expect(letterRanges(spread({ M: 30 })).map(range => range.label)).toEqual(["A–Z"]);
    });

    it("returns on Escape to where it was opened from", () => {
        open();
        act(() => { fireEvent.keyDown(window, { key: "Escape" }); });
        expect(screen.getByText("System Selection at /assistant")).toBeTruthy();
    });

});

describe("the Glossary's titles", () => {

    it("carry an i with what the page is and how to read it, at most three points of 160 characters", () => {
        open();
        fireEvent.click(screen.getByRole("button", { name: "Glossary: what this means" }));
        expect(screen.getByText(/^App terms, in blue: the app's own words/)).toBeTruthy();
        fireEvent.click(screen.getByRole("tab", { name: "References" }));
        fireEvent.click(screen.getByRole("button", { name: "References: what this means" }));
        expect(screen.getByText(/^Written in the Harvard style/)).toBeTruthy();
        for (const points of Object.values(GLOSSARY_INFO)) {
            expect(points.length).toBeLessThanOrEqual(3);
            for (const point of points) {
                expect(point.length).toBeLessThanOrEqual(160);
            }
        }
    });

});
