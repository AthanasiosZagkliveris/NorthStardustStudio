import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

// (The Review is the Workbook page's Review tab since 2026-11-09; /review opens it there.)
import Workbook from "./Workbook";
import { WorkbookButton } from "../components/notepad/Notepad";
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

/** A bullet of the Workbook's page tab (its tabs, as on a System page's Pages rail). */
const railTab = (name: string) => within(screen.getByRole("navigation", { name: "Go to a section" })).getByRole("button", { name });

describe("opening Review", () => {

    it("opens from the header Workbook on its Review tab and stays; pressing the Workbook again there does nothing", async () => {
        render(
            <MemoryRouter initialEntries={["/assistant"]}>
                <WorkbookButton />
                <Routes>
                    <Route path="/assistant" element={<Where name="System Selection" />} />
                    <Route path="/workbook" element={<Workbook />} />
                </Routes>
            </MemoryRouter>
        );

        act(() => { fireEvent.click(screen.getAllByRole("button", { name: /^Workbook/ })[0]); });
        act(() => { fireEvent.click(railTab("Review")); });
        expect(screen.getByRole("heading", { name: /^Review$/ })).toBeTruthy();

        // Still there after the page has settled (its effects have run).
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
        expect(screen.getByRole("heading", { name: /^Review$/ })).toBeTruthy();

        act(() => { fireEvent.click(screen.getAllByRole("button", { name: /^Workbook/ })[0]); });
        expect(screen.getByRole("heading", { name: /^Review$/ })).toBeTruthy();
    });

    it("returns, on Escape and on Back, to where it was opened from", () => {
        const opened = [{ pathname: "/workbook", state: { tab: "review", from: { pathname: "/introduction", state: null } } }];

        const first = render(
            <MemoryRouter initialEntries={opened}>
                <Routes>
                    <Route path="/introduction" element={<Where name="The interview" />} />
                    <Route path="/workbook" element={<Workbook />} />
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
                    <Route path="/workbook" element={<Workbook />} />
                </Routes>
            </MemoryRouter>
        );
        act(() => { fireEvent.click(screen.getByRole("button", { name: /Back/ })); });
        expect(screen.getByText("The interview at /introduction")).toBeTruthy();
    });

});

describe("Review across Organisations", () => {

    function renderReview(state?: unknown) {
        render(
            <MemoryRouter initialEntries={[{ pathname: "/workbook", state: { tab: "review", ...(state as object | undefined) } }]}>
                <Routes>
                    <Route path="/workbook" element={<Workbook />} />
                    <Route path="/introduction" element={<Where name="The interview" />} />
                </Routes>
            </MemoryRouter>
        );
    }

    it("shows only the open Organisation, open, with no heading of its name: the header says it (owner, 2026-11-05 and 2026-11-09)", () => {
        OrganizationService.create("Quillfield");
        renderReview();

        expect(document.querySelectorAll(".review-organization-title .strategy-box-toggle")).toHaveLength(0);
        expect(document.querySelectorAll(".review-organization-title")).toHaveLength(0);
        expect(document.querySelectorAll(".review-organization-body")).toHaveLength(1);
        expect(screen.getByRole("heading", { name: /^Review$/ })).toBeTruthy();
    });

    it("the total review has every Organisation, each open with its count; Go there selects the other one first", () => {
        const other = OrganizationService.create("Quillfield");
        const current = OrganizationService.getSelected()!;

        renderReview({ total: true });

        expect(screen.getByRole("heading", { name: /^Total review$/ })).toBeTruthy();
        const heads = [...document.querySelectorAll(".review-organization-title .fold-head")];
        expect(heads.map(head => head.querySelector(".fold-head-name")?.textContent)).toEqual(["Lumen", "Quillfield"]);
        // No arrows: every Organisation is open.
        expect(document.querySelectorAll(".review-organization-title .strategy-box-toggle")).toHaveLength(0);
        expect(document.querySelectorAll(".review-organization-body")).toHaveLength(2);
        // Nothing started: the four Foundation Systems each still open.
        expect(heads[1].querySelector(".fold-head-count")?.textContent).toBe("4");

        const quill = screen.getByRole("region", { name: "Quillfield" });
        act(() => { fireEvent.click(quill.querySelectorAll<HTMLButtonElement>(".review-go")[0]); });
        expect(OrganizationService.getSelected()).toBe(other.id);
        expect(current).not.toBe(other.id);
        expect(screen.getByText("The interview at /introduction")).toBeTruthy();
    });

    it("the total review has the Landing page's header, not the selected Organisation's", () => {
        OrganizationService.create("Quillfield");
        renderReview({ total: true });
        const header = document.querySelector(".app-header")!;
        // (No Organisation's tools -- no Search -- and the Workbook, the same button as on the Landing page.)
        expect([...header.querySelectorAll("button")].some(button => /Search/.test(button.getAttribute("aria-label") ?? ""))).toBe(false);
        expect([...header.querySelectorAll("button")].some(button => /^Workbook/.test(button.getAttribute("aria-label") ?? ""))).toBe(true);
    });

    it("says a count once: a group's count that repeats the Organisation's is left out, and the Capability's sub-head shows only where a group spans several", () => {
        renderReview();
        const groups = [...document.querySelectorAll(".review-group")].filter(group => group.getAttribute("aria-label") !== "Key dates");
        expect(groups.length).toBeGreaterThan(0);
        if (groups.length === 1) {
            expect(groups[0].querySelector(".fold-head-count")).toBeNull();
        }
        for (const group of document.querySelectorAll(".review-group")) {
            const capabilities = group.querySelectorAll(".review-capability").length;
            expect(group.querySelectorAll(".review-capability-title").length).toBe(capabilities > 1 ? capabilities : 0);
        }
    });

});
