import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import Review from "./Review";
import ReviewButton from "../components/ReviewButton";
import { OrganizationService } from "../services/OrganizationService";

/** Where the app is, and how many times it has moved. */
let moves = 0;
function Where({ name }: { name: string }) {
    const location = useLocation();
    moves++;
    return <p>{name + " at " + location.pathname}</p>;
}

beforeEach(() => {
    localStorage.clear();
    const organization = OrganizationService.create("Lumen");
    OrganizationService.setSelected(organization.id);
    moves = 0;
});

afterEach(cleanup);

describe("opening Review", () => {

    it("opens from the header and stays; pressing Review again there does nothing", async () => {
        render(
            <MemoryRouter initialEntries={["/assistant"]}>
                <ReviewButton />
                <Routes>
                    <Route path="/assistant" element={<Where name="System Selection" />} />
                    <Route path="/review" element={<Review />} />
                </Routes>
            </MemoryRouter>
        );

        act(() => { fireEvent.click(screen.getAllByRole("button", { name: /^Review,/ })[0]); });
        expect(screen.getByRole("heading", { name: "Review" })).toBeTruthy();

        // Still there after the page has settled (its effects have run).
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
        expect(screen.getByRole("heading", { name: "Review" })).toBeTruthy();

        act(() => { fireEvent.click(screen.getAllByRole("button", { name: /^Review,/ })[0]); });
        expect(screen.getByRole("heading", { name: "Review" })).toBeTruthy();
    });

    it("returns, on Escape and on Back, to where it was opened from", () => {
        const opened = [{ pathname: "/review", state: { from: { pathname: "/introduction", state: null } } }];

        const first = render(
            <MemoryRouter initialEntries={opened}>
                <Routes>
                    <Route path="/introduction" element={<Where name="The interview" />} />
                    <Route path="/review" element={<Review />} />
                </Routes>
            </MemoryRouter>
        );
        act(() => { fireEvent.keyDown(window, { key: "Escape" }); });
        expect(screen.getByText("The interview at /introduction")).toBeTruthy();
        first.unmount();

        render(
            <MemoryRouter initialEntries={opened}>
                <Routes>
                    <Route path="/introduction" element={<Where name="The interview" />} />
                    <Route path="/review" element={<Review />} />
                </Routes>
            </MemoryRouter>
        );
        act(() => { fireEvent.click(screen.getByRole("button", { name: /Back/ })); });
        expect(screen.getByText("The interview at /introduction")).toBeTruthy();
    });

});
