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

import Glossary, { GLOSSARY_INFO } from "./Glossary";
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
        expect(screen.getByText(/^App terms: the app's own words/)).toBeTruthy();
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
