import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import SystemSelection from "./SystemSelection";

// The page bounces to "/" without a selected Organization, and the
// Navigator rail reads a whole Organization document -- neither is
// what these tests are about, so both are stubbed.
const SAVED = vi.hoisted(() => ({ status: "saved" }));

// The last place worked, as each test sets it.
const lastPlace = vi.hoisted(() => ({ value: null as null | { systemNumber: number; sectionIndex: number; anchor?: string } }));

vi.mock("../services/OrganizationService", () => ({
    OrganizationService: {
        getSelected: () => "org-1",
        getSummary: () => ({ id: "org-1", name: "Test Org" }),
        getSaveState: () => SAVED,
        subscribeSaveState: () => () => undefined,
        getLastPlace: () => lastPlace.value
    }
}));

vi.mock("../components/calendar/OrganizationCalendarPanel", () => ({
    default: () => null
}));

// Stands in for the Conversation page: shows which System it was
// opened with, so a test can see where a click landed.
function IntroductionProbe() {

    const location = useLocation();

    return (
        <p>
            Opened {location.state?.system?.title}
            {location.state?.targetSectionNumber ? " at page " + location.state.targetSectionNumber : ""}
            {location.state?.resume ? " to continue" + (location.state.resume.anchor ? " at " + location.state.resume.anchor : "") : ""}
        </p>
    );

}

function renderAt(state?: unknown) {

    return render(
        <MemoryRouter initialEntries={[{ pathname: "/assistant", state }]}>
            <Routes>
                <Route path="/assistant" element={<SystemSelection />} />
                <Route path="/introduction" element={<IntroductionProbe />} />
            </Routes>
        </MemoryRouter>
    );

}

afterEach(() => {
    cleanup();
    lastPlace.value = null;
});

/* CAPABILITIES AS MASTER TILES (owner, 2026-11-22 20:35 UTC+2): the page is titled Capabilities; a tile for each Capability lists its Systems; pressed, its dialog
   holds a tile for each System, which opens it at once. */
describe("SystemSelection: the Capabilities as tiles", () => {

    it("is titled Capabilities, with a tile for each Capability listing its Systems", () => {

        renderAt();

        expect(screen.getByRole("heading", { level: 1, name: "Capabilities" })).toBeTruthy();
        const foundation = screen.getByRole("button", { name: /^Foundation/ });
        expect(foundation.closest(".section-tile-slot")?.textContent).toContain("Identity");
        // (By its name alone: owner, 2026-11-22 21:11 UTC+2, "remove the System word".)
        expect(foundation.closest(".section-tile-slot")?.textContent).not.toContain("System");
        expect(screen.getByRole("button", { name: /^Deliver/ })).toBeTruthy();

    });

    it("opens a Capability's page of its Systems, its description under the title's arrow (owner, 2026-11-23 16:19 UTC+2), the arrow keys turn its pages, and a System opens at once", () => {

        renderAt();

        fireEvent.click(screen.getByRole("button", { name: /^Foundation/ }));
        expect(document.querySelector(".interview-header h1")?.textContent).toContain("Foundation");
        fireEvent.click(screen.getByRole("button", { name: "Show help for Foundation" }));
        expect(screen.getByText("Developing organizational alignment")).toBeTruthy();
        expect(screen.getByText("Core principle")).toBeTruthy();
        fireEvent.keyDown(window, { key: "Escape" });
        expect(screen.queryByText("Core principle")).toBeNull();
        fireEvent.keyDown(window, { key: "ArrowRight" });
        expect(document.querySelector(".interview-header h1")?.textContent).toContain("Deliver Value");
        fireEvent.keyDown(window, { key: "ArrowLeft" });
        expect(document.querySelector(".interview-header h1")?.textContent).toContain("Foundation");
        fireEvent.click(screen.getByRole("button", { name: /^01. Identity System/ }));

        expect(screen.getByText("Opened Identity System")).toBeTruthy();

    });

    it("reopens the Capability's page that Back from a System passes, and Escape returns to the Capabilities", () => {

        renderAt({ capability: "foundation" });

        expect(screen.getByRole("button", { name: /^01. Identity System/ })).toBeTruthy();
        fireEvent.keyDown(window, { key: "Escape" });
        expect(screen.getByRole("button", { name: /^Deliver/ })).toBeTruthy();

    });

});

describe("SystemSelection continue where you left off", () => {

    it("offers one line back to the last place worked, and opens it there", () => {

        lastPlace.value = { systemNumber: 3, sectionIndex: 2, anchor: "founders" };

        renderAt();

        const line = screen.getByRole("button", { name: "Continue: 3. Business System — 3. Infrastructure & Capability" });

        fireEvent.click(line);

        expect(screen.getByText("Opened Business System at page 3 to continue at founders")).toBeTruthy();

    });

    it("is hidden when nothing has been worked on", () => {

        renderAt();

        expect(screen.queryByRole("button", { name: /^Continue:/ })).toBeNull();

    });

    it("is hidden when the place no longer exists", () => {

        lastPlace.value = { systemNumber: 3, sectionIndex: 40 };

        renderAt();

        expect(screen.queryByRole("button", { name: /^Continue:/ })).toBeNull();

    });

});
