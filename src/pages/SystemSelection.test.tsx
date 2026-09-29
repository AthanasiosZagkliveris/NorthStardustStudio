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

// What is left to look at: not what these tests are about.
vi.mock("../services/ReviewService", () => ({
    organizationReview: () => []
}));

vi.mock("../components/OrganizationCalendarPanel", () => ({
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

describe("SystemSelection capability description and System opening", () => {

    it("selects a capability on click and opens its description dialog, which Escape closes first", () => {

        renderAt();

        fireEvent.click(screen.getByRole("button", { name: "Foundation" }));

        expect(screen.getByText("Developing organizational alignment")).toBeTruthy();
        expect(screen.getByText("Core principle")).toBeTruthy();
        expect(screen.queryByText("About Foundation")).toBeNull();
        expect(screen.getByRole("button", { name: /Identity System/ })).toBeTruthy();

        fireEvent.keyDown(window, { key: "Escape" });

        expect(screen.queryByText("Developing organizational alignment")).toBeNull();
        expect(screen.getByRole("button", { name: /Identity System/ })).toBeTruthy();

    });

    it("opens a System immediately, with no confirmation step", () => {

        renderAt();

        fireEvent.click(screen.getByRole("button", { name: "Foundation" }));
        fireEvent.click(screen.getByRole("button", { name: /Identity System/ }));

        expect(screen.getByText("Opened Identity System")).toBeTruthy();

    });

});

describe("SystemSelection capability memory", () => {

    it("starts with the capability passed back in router state", () => {

        renderAt({ capability: "foundation" });

        expect(screen.getByRole("button", { name: /Identity System/ })).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Foundation" })).toBeTruthy();
        expect(screen.queryByText("Developing organizational alignment")).toBeNull();

    });

    it("starts with nothing selected when no capability is passed", () => {

        renderAt();

        expect(screen.queryByRole("button", { name: /Identity System/ })).toBeNull();

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
