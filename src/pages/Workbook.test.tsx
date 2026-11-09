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

import Workbook, { GLOSSARY_INFO, WorkbookRedirect, letterRanges } from "./Workbook";
import { WorkbookButton } from "../components/notepad/Notepad";
import { NotepadService } from "../services/NotepadService";
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

/** A bullet of the Workbook's page tab (its tabs, as on a System page's Pages rail). */
const railTab = (name: string) => within(screen.getByRole("navigation", { name: "Go to a section" })).getByRole("button", { name });

function open() {
    render(
        <MemoryRouter initialEntries={["/assistant"]}>
            <WorkbookButton total />
            <Routes>
                <Route path="/assistant" element={<Where name="System Selection" />} />
                <Route path="/workbook" element={<Workbook />} />
            </Routes>
        </MemoryRouter>
    );
    act(() => { fireEvent.click(screen.getAllByRole("button", { name: /^Workbook/ })[0]); });
    act(() => { fireEvent.click(railTab("Glossary")); });
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
        fireEvent.click(railTab("References"));
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
        fireEvent.click(railTab("References"));
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

describe("the Workbook, a whole page (owner, 2026-11-09)", () => {

    function openFrom(pathname: string, button: "workbook" | "landing" = "workbook") {
        render(
            <MemoryRouter initialEntries={[pathname]}>
                <WorkbookButton total={button === "landing"} />
                <Routes>
                    <Route path="/assistant" element={<Where name="System Selection" />} />
                    <Route path="/conversation" element={<Where name="The interview" />} />
                    <Route path="/workbook" element={<Workbook />} />
                </Routes>
            </MemoryRouter>
        );
        act(() => { fireEvent.click(screen.getAllByRole("button", { name: /^Workbook/ })[0]); });
    }

    it("opens from the header's Workbook on the Card Notes, with the Review, the Glossary and the References as its other tabs", () => {
        NotepadService.addNote(OrganizationService.getSelected()!);
        openFrom("/assistant");
        const tabs = within(screen.getByRole("navigation", { name: "Go to a section" })).getAllByRole("button").map(tab => tab.textContent);
        expect(tabs).toEqual(["Card Notes", "Review", "Glossary", "References", "Business Documents"]);
        expect(screen.getByRole("heading", { name: /^Card Notes$/ })).toBeTruthy();
        expect(screen.getByText(/^No card notes yet/)).toBeTruthy();
        // The person's own notes are the Notes tool's (owner, 2026-11-09: "Card Notes and Notes tool are different"), not the page's.
        expect(screen.queryByRole("button", { name: "+ Add note" })).toBeNull();
        expect(screen.queryByRole("textbox", { name: "Note" })).toBeNull();
        act(() => { fireEvent.click(railTab("Review")); });
        expect(document.querySelector(".review-organization")).toBeTruthy();
        // Pressed again on the page: it stays.
        act(() => { fireEvent.click(screen.getAllByRole("button", { name: /^Workbook/ })[0]); });
        expect(screen.getByRole("navigation", { name: "Go to a section" })).toBeTruthy();
    });

    it("opens from the Landing page's Workbook (the same button) with the Landing's tabs: the total review, the Glossary and the References", () => {
        openFrom("/assistant", "landing");
        const tabs = within(screen.getByRole("navigation", { name: "Go to a section" })).getAllByRole("button").map(tab => tab.textContent);
        expect(tabs).toEqual(["Review", "Glossary", "References"]);
        act(() => { fireEvent.click(railTab("Review")); });
        expect(screen.getByRole("heading", { name: /^Total review$/ })).toBeTruthy();
    });

    it("leaves the Notes tool as it was: opening the Workbook does not close its side panel", () => {
        act(() => { NotepadService.open(); });
        openFrom("/assistant");
        expect(NotepadService.view().open).toBe(true);
        act(() => { NotepadService.close(); });
    });

    it("filters the total review by Organisation: all ticked at first, one ticked off leaves its review out (owner, 2026-11-09)", () => {
        OrganizationService.create("Quillfield");
        openFrom("/assistant", "landing");
        act(() => { fireEvent.click(railTab("Review")); });
        const names = () => [...document.querySelectorAll("section.review-organization")].map(section => section.getAttribute("aria-label") ?? "");
        expect(names()).toContain("Lumen");
        expect(names()).toContain("Quillfield");
        act(() => { fireEvent.click(screen.getByRole("button", { name: "Choose which Organisations show" })); });
        expect(screen.getByRole("checkbox", { name: "Lumen" })).toHaveProperty("checked", true);
        expect(screen.getByRole("checkbox", { name: "Quillfield" })).toHaveProperty("checked", true);
        act(() => { fireEvent.click(screen.getByRole("checkbox", { name: "Lumen" })); });
        expect(names()).toEqual(["Quillfield"]);
        act(() => { fireEvent.click(screen.getByRole("checkbox", { name: "Quillfield" })); });
        expect(screen.getByText("No Organisations to show: the funnel leaves them all out.")).toBeTruthy();
    });

    it("has no Organisation funnel on one Organisation's review (the header's Workbook)", () => {
        openFrom("/assistant");
        act(() => { fireEvent.click(railTab("Review")); });
        expect(screen.queryByRole("button", { name: "Choose which Organisations show" })).toBeNull();
    });

    it("is drawn as a dialog of the app: the title over its rule, the sections in one framed panel with arrows and a tab of bullets (owner, 2026-11-09)", async () => {
        openFrom("/assistant");
        expect(screen.getByRole("heading", { level: 1, name: "Workbook" })).toBeTruthy();
        expect(document.querySelector(".workbook .interview-header .interview-divider")).toBeTruthy();
        expect(document.querySelector(".workbook .workbook-panel.section-tile-dialog .section-tile-dialog-body")).toBeTruthy();
        const rail = screen.getByRole("navigation", { name: "Go to a section" });
        expect(rail.querySelector(".bullet-rail-item.active")?.textContent).toBe("Card Notes");
        act(() => { fireEvent.click(screen.getByRole("button", { name: "Next section" })); });
        expect(screen.getByRole("heading", { level: 2, name: /^Review/ })).toBeTruthy();
        act(() => { fireEvent.click(screen.getByRole("button", { name: "Previous section" })); });
        expect(screen.getByRole("heading", { level: 2, name: /^Card Notes/ })).toBeTruthy();
        act(() => { fireEvent.click(railTab("Glossary")); });
        expect(rail.querySelector(".bullet-rail-item.active")?.textContent).toBe("Glossary");
        expect(screen.getByRole("heading", { name: /^Glossary/ })).toBeTruthy();
    });

    it("lists every Organisation's terms in the Landing page's Glossary, each named, under the one funnel", () => {
        OrganizationService.create("Quillfield");
        openFrom("/assistant", "landing");
        act(() => { fireEvent.click(railTab("Glossary")); });
        const tags = () => [...document.querySelectorAll(".glossary-entry-yours .glossary-term-tag")].map(node => node.textContent);
        expect(tags()).toEqual(expect.arrayContaining(["Segment of Lumen", "Segment of Quillfield"]));
        act(() => { fireEvent.click(screen.getByRole("button", { name: "Choose which terms show" })); });
        act(() => { fireEvent.click(screen.getByRole("checkbox", { name: "Lumen" })); });
        expect(tags().length).toBeGreaterThan(0);
        expect(tags().every(tag => tag === "Segment of Quillfield")).toBe(true);
    });

    it("lists the open Organisation's terms alone, with no Organisation in the funnel, inside an Organisation", () => {
        OrganizationService.create("Quillfield");
        openFrom("/assistant");
        act(() => { fireEvent.click(railTab("Glossary")); });
        expect([...document.querySelectorAll(".glossary-entry-yours .glossary-term-tag")].map(node => node.textContent)).toEqual(["Segment"]);
        act(() => { fireEvent.click(screen.getByRole("button", { name: "Choose which terms show" })); });
        expect(screen.queryByRole("checkbox", { name: "Quillfield" })).toBeNull();
    });

    it("keeps the old addresses: /glossary, /review and /documents open the Workbook on their section", () => {
        for (const [path, heading] of [["/glossary", /^Glossary/], ["/review", /^Review$/], ["/documents", /^Business Documents/]] as const) {
            const view = render(
                <MemoryRouter initialEntries={[path]}>
                    <Routes>
                        <Route path="/glossary" element={<WorkbookRedirect tab="glossary" />} />
                        <Route path="/review" element={<WorkbookRedirect tab="review" />} />
                        <Route path="/documents" element={<WorkbookRedirect tab="documents" />} />
                        <Route path="/workbook" element={<Workbook />} />
                    </Routes>
                </MemoryRouter>
            );
            expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
            view.unmount();
        }
    });

});
