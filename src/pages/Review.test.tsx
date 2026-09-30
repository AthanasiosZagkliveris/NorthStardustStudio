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

describe("Review across Organizations", () => {

    it("has a section per Organization, the open one first and open, the others folded with their counts; Go there selects the other one first", () => {
        const other = OrganizationService.create("Quillfield");
        const current = OrganizationService.getSelected()!;

        render(
            <MemoryRouter initialEntries={["/review"]}>
                <Routes>
                    <Route path="/review" element={<Review />} />
                    <Route path="/introduction" element={<Where name="The interview" />} />
                </Routes>
            </MemoryRouter>
        );

        const heads = screen.getAllByRole("button", { expanded: true }).concat(screen.getAllByRole("button", { expanded: false }))
            .filter(button => button.classList.contains("review-organization-head"));
        expect(heads.map(head => head.querySelector(".review-organization-name")?.textContent)).toEqual(["Lumen", "Quillfield"]);
        expect(heads.map(head => head.getAttribute("aria-expanded"))).toEqual(["true", "false"]);
        // Nothing started: the four Foundation Systems each still open.
        expect(heads[1].querySelector(".review-group-count")?.textContent).toBe("4");

        act(() => { fireEvent.click(heads[1]); });
        const quill = screen.getByRole("region", { name: "Quillfield" });
        act(() => { fireEvent.click(quill.querySelectorAll<HTMLButtonElement>(".review-go")[0]); });
        expect(OrganizationService.getSelected()).toBe(other.id);
        expect(current).not.toBe(other.id);
        expect(screen.getByText("The interview at /introduction")).toBeTruthy();
    });

});
