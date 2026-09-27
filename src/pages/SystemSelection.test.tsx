import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import SystemSelection from "./SystemSelection";

// The page bounces to "/" without a selected Organization, and the
// Navigator rail reads a whole Organization document -- neither is
// what these tests are about, so both are stubbed.
vi.mock("../services/OrganizationService", () => ({
    OrganizationService: {
        getSelected: () => "org-1",
        getSummary: () => ({ id: "org-1", name: "Test Org" })
    }
}));

vi.mock("../components/OrganizationCalendarPanel", () => ({
    default: () => null
}));

// Stands in for the Conversation page: shows which System it was
// opened with, so a test can see where a click landed.
function IntroductionProbe() {

    const location = useLocation();

    return <p>Opened {location.state?.system?.title}</p>;

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

afterEach(cleanup);

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
