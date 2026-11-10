import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import { entry } from "../framework/engine/Search";
import { stylesheet } from "../test/stylesheet";

const navigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => ({
    ...(await importOriginal<typeof import("react-router-dom")>()),
    useNavigate: () => navigate,
    useLocation: () => ({ pathname: "/conversation", state: { page: 1 }, key: "here" })
}));

vi.mock("../services/SearchService", () => ({
    organizationSearchIndex: () => [
        entry("page", "1. Identity System", "System", { systemNumber: 1 }, 0),
        entry("page", "3. Legal Entity", "1. Identity System", { systemNumber: 1, sectionNumber: 3 }, 1),
        entry("field", "Legal Form", "1. Identity System → 3. Legal Entity", { systemNumber: 1, sectionNumber: 3, key: "1.3:legal-structure/legal-form", anchors: [] }, 2),
        entry("term", "Legal form", "App term", { systemNumber: 0, term: { key: "legal-form", kind: "app" } }, 3, ["kind of legal entity"]),
        entry("answer", "Registered as a legal entity in Lyon", "1. Identity System → 3. Legal Entity", { systemNumber: 1, sectionNumber: 3, text: "Registered as a legal entity in Lyon", ids: ["req-1"] }, 3)
    ]
}));

import SearchDialog from "./SearchDialog";
import SearchButton from "./SearchButton";
import { OrganizationService } from "../services/OrganizationService";

afterEach(() => {
    cleanup();
    navigate.mockReset();
});

function box() {
    return screen.getByRole("combobox", { name: "Search pages, fields, the glossary and your answers" });
}

describe("the search dialog", () => {

    it("is a dialog with one box, focused, whose results are one listbox in groups", () => {
        render(<SearchDialog organizationId="org-1" onClose={() => undefined} />);
        expect(screen.getByRole("dialog", { name: "Search" })).toBeTruthy();
        expect(document.activeElement).toBe(box());
        expect(box().getAttribute("aria-expanded")).toBe("false");

        fireEvent.change(box(), { target: { value: "legal" } });
        expect(box().getAttribute("aria-expanded")).toBe("true");
        expect(screen.getAllByRole("group").map(group => group.textContent?.split(/(?=\d\.|Legal|Registered)/)[0])).toEqual(["Pages", "Fields", "Glossary", "Your answers"]);
        expect(screen.getAllByRole("option")).toHaveLength(4);
        // A Glossary term is drawn in its kind's colour.
        expect(document.querySelector(".search-option-term-app")?.textContent).toContain("Legal form");
        // The answer's words found are marked.
        expect(document.querySelector(".search-mark")?.textContent).toBe("legal");
    });

    it("opens a page with Enter, the first result chosen until the arrows move", () => {
        const onClose = vi.fn();
        render(<SearchDialog organizationId="org-1" onClose={onClose} />);
        fireEvent.change(box(), { target: { value: "legal" } });
        const first = screen.getAllByRole("option")[0];
        expect(box().getAttribute("aria-activedescendant")).toBe(first.id);
        expect(first.getAttribute("aria-selected")).toBe("true");

        fireEvent.keyDown(box(), { key: "Enter" });
        expect(onClose).toHaveBeenCalledWith(true);
        expect(navigate).toHaveBeenCalledWith("/introduction", { state: expect.objectContaining({ targetSectionNumber: 3, resume: {} }) });
    });

    it("opens a field, focused in its card, and an answer, in the box that holds it", () => {
        render(<SearchDialog organizationId="org-1" onClose={() => undefined} />);
        fireEvent.change(box(), { target: { value: "legal" } });
        fireEvent.keyDown(box(), { key: "ArrowDown" });
        fireEvent.keyDown(box(), { key: "Enter" });
        expect(navigate).toHaveBeenLastCalledWith("/introduction", {
            state: expect.objectContaining({ targetSectionNumber: 3, focusField: { key: "1.3:legal-structure/legal-form", anchors: [] } })
        });

        cleanup();
        render(<SearchDialog organizationId="org-1" onClose={() => undefined} />);
        fireEvent.change(box(), { target: { value: "lyon" } });
        fireEvent.click(screen.getByRole("option"));
        expect(navigate).toHaveBeenLastCalledWith("/introduction", {
            state: expect.objectContaining({ targetSectionNumber: 3, focusField: { key: "", text: "Registered as a legal entity in Lyon", ids: ["req-1"] } })
        });
    });

    it("opens a Glossary term on the Workbook page's Glossary, found by its other words too, and Back returns here", () => {
        render(<SearchDialog organizationId="org-1" onClose={() => undefined} />);
        fireEvent.change(box(), { target: { value: "kind of legal entity" } });
        fireEvent.click(screen.getByRole("option"));
        expect(navigate).toHaveBeenLastCalledWith("/workbook", {
            state: { tab: "glossary", term: "legal-form", from: { pathname: "/conversation", state: { page: 1 } } }
        });
    });

    it("closes on Escape without opening anything, and says when nothing matches", () => {
        const onClose = vi.fn();
        const onWindow = vi.fn();
        window.addEventListener("keydown", onWindow);
        render(<SearchDialog organizationId="org-1" onClose={onClose} />);
        fireEvent.change(box(), { target: { value: "zebra" } });
        expect(screen.getByText("No match for that.")).toBeTruthy();
        fireEvent.keyDown(box(), { key: "Escape" });
        window.removeEventListener("keydown", onWindow);
        expect(onClose).toHaveBeenCalledWith(false);
        expect(onWindow).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
    });

});

describe("the header's Search button", () => {

    it("opens the search on a click or on Ctrl+K / Cmd+K, and gives the focus back when it closes", async () => {
        const organization = OrganizationService.create("Lumen");
        OrganizationService.setSelected(organization.id);
        render(<SearchButton />);
        const button = screen.getByRole("button", { name: "Search" });
        expect(button.getAttribute("aria-keyshortcuts")).toBe("Control+K Meta+K");

        button.focus();
        fireEvent.keyDown(window, { key: "k", ctrlKey: true });
        expect(await screen.findByRole("dialog", { name: "Search" })).toBeTruthy();
        fireEvent.keyDown(box(), { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(document.activeElement).toBe(button);

        await act(async () => { fireEvent.keyDown(window, { key: "K", metaKey: true }); });
        expect(await screen.findByRole("dialog", { name: "Search" })).toBeTruthy();
    });

});

describe("the search box's look", () => {

    it("is a cell of the app: the shared cell look and the one ring, with the floating card's edge and shadow round the dialog", () => {
        const cells = stylesheet("cell-focus.css");
        expect(cells).toContain(":is(.settings-page, .business-documents, .search-dialog) :is(input.interview-input");
        expect(cells).toContain(".search-dialog { background-color: var(--bg-card-tint);");
        const search = stylesheet("search.css");
        expect(search).toContain("border-radius: var(--radius-lg);");
        expect(search).toContain("box-shadow: var(--shadow-drop);");
        expect(search).toContain("font-size: var(--font-body);");
        // (No colour of its own: every colour is a token, in light, dark and sepia.)
        expect(search).not.toMatch(/#[0-9a-f]{3,6}\b|rgba?\(/i);
    });

});
