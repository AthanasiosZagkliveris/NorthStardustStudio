import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import Conversation from "./Conversation";
import { OrganizationService } from "../services/OrganizationService";
import { systems } from "../data/systems";
import { FocusModeService } from "../services/FocusModeService";

// The Strategy confirmation is only reached through real Strategy
// content; a stand-in Foundation page asks for it directly.
vi.mock("../components/interview/editors/StrategyFoundationEditor.tsx", () => ({
    default: (props: { guardSituationRefresh?: (apply: () => void) => void }) => (
        <button type="button" onClick={() => props.guardSituationRefresh?.(() => {})}>
            Ask to refresh
        </button>
    )
}));

vi.mock("../components/OrganizationCalendarPanel", () => ({
    default: () => null
}));

const strategy = systems.find(system => system.id === "strategy")!;
const client = systems.find(system => system.id === "client")!;

// Stands in for the System Selection page: shows which capability
// Back asked it to open.
function AssistantProbe() {
    const location = useLocation();
    return <p>Assistant {location.state?.capability}</p>;
}

// A cross-System jump: the same Conversation route, another System.
function JumpToClient() {
    const navigate = useNavigate();
    return (
        <button type="button" onClick={() => navigate("/conversation", { state: { system: client } })}>
            Jump to Client
        </button>
    );
}

function renderConversation() {
    return render(
        <MemoryRouter initialEntries={[{ pathname: "/conversation", state: { system: strategy } }]}>
            <JumpToClient />
            <Routes>
                <Route path="/conversation" element={<Conversation />} />
                <Route path="/assistant" element={<AssistantProbe />} />
            </Routes>
        </MemoryRouter>
    );
}

beforeEach(() => {
    localStorage.clear();
    vi.spyOn(OrganizationService, "getSelected").mockReturnValue("org-1");
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe("Conversation Escape", () => {

    it("closes the Strategy confirmation and stays on the page", () => {

        renderConversation();

        fireEvent.click(screen.getByRole("button", { name: "Start Interview" }));
        fireEvent.click(screen.getByRole("button", { name: "Ask to refresh" }));
        expect(screen.getByText("Replace your Current Situation?")).toBeTruthy();

        fireEvent.keyDown(window, { key: "Escape" });

        expect(screen.queryByText("Replace your Current Situation?")).toBeNull();
        expect(screen.queryByText(/^Assistant/)).toBeNull();
        expect(screen.getByRole("button", { name: "Ask to refresh" })).toBeTruthy();

    });

    it("offers Focus on an interview page only, and in focus mode leaves it before leaving the page, after a dialog has closed", () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);
        renderConversation();

        // (Focus in the Menu, on an interview page only.)
        fireEvent.click(screen.getByRole("button", { name: "Menu" }));
        expect(screen.queryByRole("menuitem", { name: "Focus" })).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Menu" }));
        fireEvent.click(screen.getByRole("button", { name: "Start Interview" }));
        fireEvent.click(screen.getByRole("button", { name: "Menu" }));
        fireEvent.click(screen.getByRole("menuitem", { name: "Focus" }));
        expect(document.documentElement.classList.contains("focus-mode")).toBe(true);

        // A dialog closes first ...
        fireEvent.click(screen.getByRole("button", { name: "Ask to refresh" }));
        fireEvent.keyDown(window, { key: "Escape" });
        expect(screen.queryByText("Replace your Current Situation?")).toBeNull();
        expect(document.documentElement.classList.contains("focus-mode")).toBe(true);

        // ... then focus mode, and the page stays.
        fireEvent.keyDown(window, { key: "Escape" });
        expect(document.documentElement.classList.contains("focus-mode")).toBe(false);
        expect(FocusModeService.isOn()).toBe(false);
        expect(screen.queryByText(/^Assistant/)).toBeNull();

        // Then Back, as ever.
        fireEvent.keyDown(window, { key: "Escape" });
        expect(screen.getByText(`Assistant ${strategy.capability}`)).toBeTruthy();

    });

    it("goes Back to the current System's capability after a cross-System jump", () => {

        renderConversation();

        fireEvent.click(screen.getByRole("button", { name: "Jump to Client" }));
        fireEvent.keyDown(window, { key: "Escape" });

        expect(screen.getByText(`Assistant ${client.capability}`)).toBeTruthy();

    });

});

describe("Conversation records the last place worked", () => {

    const identity = systems.find(system => system.id === "identity")!;

    const business = systems.find(system => system.id === "business")!;

    function renderSystem(system: typeof identity, state: Record<string, unknown>) {
        return render(
            <MemoryRouter initialEntries={[{ pathname: "/conversation", state: { system, ...state } }]}>
                <Routes>
                    <Route path="/conversation" element={<Conversation />} />
                </Routes>
            </MemoryRouter>
        );
    }

    // The Identity System is one page: the Definition chapter and the Purpose chapter.
    function renderIdentity(state: Record<string, unknown>) {
        return renderSystem(identity, state);
    }

    // The Business System has three pages: 1. Foundation & Engagement (sections 1 and 2), 2. Infrastructure & Capability (3), 3. Financials (4 and 5).
    function renderBusiness(state: Record<string, unknown>) {
        return renderSystem(business, state);
    }

    const pagesRail = () => screen.getByRole("navigation", { name: "Pages" });
    const current = () => pagesRail().querySelector("[aria-current='true']")?.getAttribute("aria-label");

    it("records the System and page once the interview shows, and the card a field is focused in", () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);

        renderIdentity({});

        // The Introduction alone is not working on anything.
        expect(OrganizationService.getLastPlace(organization.id)).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Start Interview" }));
        expect(OrganizationService.getLastPlace(organization.id)).toEqual({ systemNumber: 1, sectionIndex: 0 });

        // (The Identity System's one page holds the Definition chapter and the Purpose chapter: Philosophy & Manifesto's dialog opens, and the field in it is focused.)
        fireEvent.click(screen.getByRole("button", { name: /^Philosophy/ }));
        const card = document.querySelector<HTMLElement>(".column-tile-content[data-rail]")!;
        const field = card.querySelector<HTMLElement>("textarea, input")!;
        fireEvent.focus(field);

        expect(OrganizationService.getLastPlace(organization.id)).toEqual({
            systemNumber: 1,
            sectionIndex: 0,
            anchor: card.dataset.rail
        });
        cleanup();

        // A System of several pages records the page opened from the Pages rail, found by its name.
        renderBusiness({});
        fireEvent.click(screen.getByRole("button", { name: "Start Interview" }));
        expect(OrganizationService.getLastPlace(organization.id)).toEqual({ systemNumber: 3, sectionIndex: 0 });
        fireEvent.click(within(pagesRail()).getByRole("button", { name: /Infrastructure & Capability/ }));
        expect(OrganizationService.getLastPlace(organization.id)).toEqual({ systemNumber: 3, sectionIndex: 2 });

    });

    it("has no Sections rail on a page of tiles; the tile carries the column", () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);

        renderIdentity({ targetSectionNumber: 1, resume: {} });

        expect(screen.queryByRole("navigation", { name: "Sections" })).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: /^Organisation/ }));
        fireEvent.change(document.querySelector<HTMLTextAreaElement>(".column-tile-content[data-rail] textarea")!, {
            target: { value: "We automate small offices." }
        });

        expect(screen.getAllByRole("button", { name: /^Organisation/ }).length).toBeGreaterThan(0);

    });

    it("draws Founders & Ownership and Registrations & Expenses on Definition, each saved in the Legal Entity's answer as before (owner, 2026-11-09 and 2026-11-20)", async () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);

        renderIdentity({ targetSectionNumber: 1, resume: {} });

        const tilesOf = (frame: Element) => [...frame.querySelectorAll(".section-tile[data-tile]")].map(tile => tile.getAttribute("data-tile"));
        // Registrations & Expenses stands fourth in the Definition chapter, keeping the Legal Entity's field key.
        expect(tilesOf(document.querySelectorAll(".column-tiles-page")[0])).toEqual(["organization", "positioning", "legal-entity-founders", "legal-entity-registrations"]);
        const registrations = document.querySelector<HTMLElement>(".section-tile[data-tile=legal-entity-registrations]")!;
        expect(registrations.dataset.fieldSection).toBe("3");
        // (It is drawn once the Legal Entity has handed it over, and marked when the page sees it come.)
        await waitFor(() => expect((registrations.closest<HTMLElement>(".section-tile-slot") ?? registrations).dataset.fieldKey).toBe("1.3:legal-entity-registrations"));

        // Its dialog is the Ownership; a founder named there is saved in the Legal Entity section (3), not in Definition.
        fireEvent.click(screen.getByRole("button", { name: /^Founders & Ownership/ }));
        fireEvent.change(document.querySelector<HTMLElement>(".section-tile-dialog textarea, .section-tile-dialog input[type=text]")!, { target: { value: "Jordan Ellis" } });
        const saved = OrganizationService.loadSystemState(organization.id, 1) as { responses: Array<{ sectionNumber: number; value: Record<string, unknown> }> };
        const section = (number: number) => saved.responses.find(response => response.sectionNumber === number)?.value ?? {};
        expect(JSON.stringify(section(3).founders)).toContain("Jordan Ellis");
        expect(section(1).founders).toBeUndefined();

        // The Identity System is one page: the Pages rail holds the Introduction and "Identity System", with no Legal Entity page.
        expect([...pagesRail().querySelectorAll(".bullet-rail-item")].map(item => (item.textContent ?? "").split(":")[0])).toEqual(["Introduction", "Identity System"]);
        expect(within(pagesRail()).queryByRole("button", { name: /Legal Entity/ })).toBeNull();

    });

    it("draws Purpose as three pair tiles, Mission & Vision saved in Definition under its own keys (doc 45)", () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);

        renderIdentity({ targetSectionNumber: 1, resume: {} });

        // The two frames: Definition without Mission and Vision; Purpose with the three pairs, in their order.
        const heads = [...document.querySelectorAll(".tiles-frame-head")].map(head => head.textContent?.trim());
        expect(heads).toEqual(["1. Definition", "2. Purpose"]);
        const frames = [...document.querySelectorAll(".column-tiles-page")];
        const tilesOf = (frame: Element) => [...frame.querySelectorAll(".section-tile[data-tile]")].map(tile => tile.getAttribute("data-tile"));
        expect(tilesOf(frames[0])).not.toContain("mission");
        expect(tilesOf(frames[0])).not.toContain("vision");
        expect(tilesOf(frames[1])).toEqual(["mission-vision", "values-principles", "philosophy-manifesto"]);

        // The pair's dialog holds both texts, each with its heading; what is written is saved where it always was.
        fireEvent.click(screen.getByRole("button", { name: /^Mission & Vision/ }));
        const mission = screen.getByRole("textbox", { name: "Mission" });
        const vision = screen.getByRole("textbox", { name: "Vision" });
        fireEvent.change(mission, { target: { value: "We automate small offices." } });
        fireEvent.change(vision, { target: { value: "Every small office runs itself." } });
        const saved = OrganizationService.loadSystemState(organization.id, 1) as { responses: Array<{ sectionNumber: number; value: Record<string, unknown> }> };
        const section = (number: number) => saved.responses.find(response => response.sectionNumber === number)?.value ?? {};
        expect(section(1).mission).toBe("We automate small offices.");
        expect(section(1).vision).toBe("Every small office runs itself.");
        expect(section(2).mission).toBeUndefined();

    });

    it("turns the page with the arrows above the rails and with ← / →, back to the Introduction from the first page", () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);

        renderBusiness({ targetSectionNumber: 1, resume: {} });

        expect(current()).toMatch(/^1. /);
        fireEvent.click(screen.getByRole("button", { name: "Next page" }));
        expect(current()).toMatch(/^2. /);
        fireEvent.keyDown(document.body, { key: "ArrowLeft" });
        expect(current()).toMatch(/^1. /);
        fireEvent.keyDown(document.body, { key: "ArrowRight" });
        expect(current()).toMatch(/^2. /);

        // From the second page, back to the first.
        fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
        expect(current()).toMatch(/^1. /);

        // Then to the Introduction.
        fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
        expect(screen.getByRole("button", { name: "Start Interview" })).toBeTruthy();

    });

    it("keeps the page while typing: ← in a box of the Identity System's one page stays there", () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);

        renderIdentity({ targetSectionNumber: 1, resume: {} });
        expect(current()).toMatch(/^Identity System/);

        // (The Organisation tile's dialog holds boxes.)
        fireEvent.click(screen.getByRole("button", { name: /^Organisation/ }));
        const box = document.querySelector<HTMLElement>("[role='dialog'] textarea, [role='dialog'] input, .section-tile-dialog textarea, .section-tile-dialog input")!;
        fireEvent.keyDown(box, { key: "ArrowLeft" });
        expect(current()).toMatch(/^Identity System/);
        fireEvent.keyDown(document.body, { key: "Escape" });

        // Its one page leads back to the Introduction.
        fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
        expect(screen.getByRole("button", { name: "Start Interview" })).toBeTruthy();

    });

    it("lists the Introduction first on the Pages rail, unnumbered and with no status, and opens it from there", () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);

        renderBusiness({ targetSectionNumber: 3, resume: {} });
        const items = pagesRail().querySelectorAll(".bullet-rail-item");
        expect(items[0].textContent).toBe("Introduction");
        // Drawn in capitals.
        expect(items[0].classList.contains("bullet-rail-item-capitals")).toBe(true);
        expect(items[0].querySelector(".bullet-rail-dot")?.getAttribute("data-status")).toBeNull();
        expect(items[1].textContent).toMatch(/^1. /);

        fireEvent.click(items[0]);
        expect(screen.getByRole("button", { name: "Start Interview" })).toBeTruthy();
        // The Introduction lists the pages itself: no rails there.
        expect(screen.queryByRole("navigation", { name: "Pages" })).toBeNull();

    });

    it("starts the interview at its first page, whichever page was last open", () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);

        renderBusiness({ targetSectionNumber: 3, resume: {} });
        expect(current()).toMatch(/^2. /);

        fireEvent.click(screen.getByRole("button", { name: "Introduction" }));
        fireEvent.click(screen.getByRole("button", { name: "Start Interview" }));
        expect(current()).toMatch(/^1. /);

        // And → on the Introduction does the same.
        fireEvent.click(within(pagesRail()).getByRole("button", { name: /Infrastructure & Capability/ }));
        fireEvent.click(screen.getByRole("button", { name: "Introduction" }));
        fireEvent.keyDown(document.body, { key: "ArrowRight" });
        expect(current()).toMatch(/^1. /);

    });

    it("opens the interview itself, at the page, when continued", () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);

        renderBusiness({ targetSectionNumber: 3, resume: {} });

        expect(screen.queryByRole("button", { name: "Start Interview" })).toBeNull();
        expect(current()).toMatch(/^2. Infrastructure & Capability/);
        expect(OrganizationService.getLastPlace(organization.id)).toEqual({ systemNumber: 3, sectionIndex: 2 });

    });

    it("opens the Identity System's one page when continued at the Legal Entity", () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);

        renderIdentity({ targetSectionNumber: 3, resume: {} });

        expect(screen.queryByRole("button", { name: "Start Interview" })).toBeNull();
        expect(current()).toMatch(/^Identity System/);
        expect(document.querySelector("[data-tile=legal-entity-registrations]")).toBeTruthy();

    });

});

describe("A System's opening screen", () => {

    function renderOpening(id: string) {
        const system = systems.find(candidate => candidate.id === id)!;
        return render(
            <MemoryRouter initialEntries={[{ pathname: "/conversation", state: { system } }]}>
                <Routes>
                    <Route path="/conversation" element={<Conversation />} />
                </Routes>
            </MemoryRouter>
        );
    }

    // What a fact says: the content after its title, or, for What it
    // covers (whose title shares the first row with the question), the
    // group its title labels.
    function fact(label: string) {
        const title = screen.queryByRole("heading", { name: label });
        if (!title) {
            return null;
        }
        const group = document.querySelector("[aria-labelledby='" + title.id + "']");
        return (group ?? title.nextElementSibling)?.textContent ?? "";
    }

    it("shows a Foundation System's guiding question, pages, what it uses from earlier and its thinking time", () => {

        renderOpening("business");

        expect(screen.getByText("How do we create, deliver and capture value?").className)
            .toBe("intro-guiding-question");

        // In the shared numbered list, which draws the numbers.
        expect(document.querySelector(".intro-page")?.closest("ol")?.className).toBe("numbered-list-static");
        expect(Array.from(document.querySelectorAll(".intro-page")).map(page => page.textContent)).toEqual([
            "Foundation & Engagement",
            "Infrastructure & Capability",
            "Financials"
        ]);
        expect(fact("What it covers")).toContain("Defines how the organization creates, delivers, and sustains value over time.");
        expect(fact("Uses from earlier")).toBe("Your target audience, founders and legal details from 1. Identity System.");
        // The System's name in it is bold.
        expect(screen.getByText("1. Identity System", { selector: "strong" })).toBeTruthy();
        expect(Array.from(screen.getByRole("heading", { name: "Thinking time" }).nextElementSibling!.children)
            .map(line => line.textContent)).toEqual([
                "About 3–4 hr",
                "You can stop at any time; everything is saved."
            ]);

        // The button is as it was.
        expect(screen.getByRole("button", { name: "Start Interview" })).toBeTruthy();

    });

    it("names each page in bold in the introduction, without repeating the question", () => {

        renderOpening("identity");

        expect(Array.from(document.querySelectorAll(".intro-sentence strong")).map(name => name.textContent)).toEqual([
            "Definition", "Purpose", "Legal Entity", "Founders Profile"
        ]);
        expect(document.querySelector(".intro-sentence")!.textContent).not.toContain("why do we exist");

    });

    it("opens the interview at a page named under What it covers", () => {

        renderOpening("business");

        fireEvent.click(screen.getByRole("button", { name: "Infrastructure & Capability" }));

        expect(screen.queryByRole("button", { name: "Start Interview" })).toBeNull();
        expect(screen.getByRole("navigation", { name: "Pages" }).querySelector("[aria-current='true']")?.getAttribute("aria-label"))
            .toMatch(/^2. Infrastructure & Capability/);

    });

    it("offers Start Interview under the content as one arrow-shaped button, with no separate arrow; → starts it too", () => {

        renderOpening("identity");
        const start = screen.getByRole("button", { name: "Start Interview" });
        expect(start.classList.contains("start-arrow-button")).toBe(true);
        expect(start.closest(".intro-start")).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Next page" })).toBeNull();
        fireEvent.click(start);
        expect(screen.queryByRole("button", { name: "Start Interview" })).toBeNull();
        cleanup();

        renderOpening("identity");
        fireEvent.keyDown(document.body, { key: "ArrowRight" });
        expect(screen.queryByRole("button", { name: "Start Interview" })).toBeNull();

    });

    it("is titled as a page is: the System, then the separator and Introduction in the page-title weight", () => {
        renderOpening("identity");
        const title = screen.getByRole("heading", { level: 1 });
        expect(title.textContent).toBe("1. Identity System — Introduction");
        expect(title.querySelector(".interview-header-page-title")?.textContent).toBe(" — Introduction");
        // In capitals on screen, by CSS; the words stay "Introduction".
        expect(title.querySelector(".interview-header-page-title")?.classList.contains("interview-header-page-title-capitals")).toBe(true);
    });

    it("says the Identity System is the starting point", () => {

        renderOpening("identity");

        expect(screen.getByText("Who are we, and why do we exist?")).toBeTruthy();
        expect(fact("Uses from earlier")).toBe("Nothing. It's the starting point.");

    });

    it("shows only what another System's content has", () => {

        renderOpening("client");

        expect(document.querySelector(".intro-guiding-question")).toBeNull();
        expect(fact("Uses from earlier")).toBeNull();
        expect(fact("Thinking time")).toBeNull();
        expect(fact("What it covers")).toContain("Clients");

    });

});

describe("3. Infrastructure & Capability folds its guidance per title", () => {

    it("has no Hide Help button: each column title has its own arrow, the guidance hidden to begin with; other pages keep their button", () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);
        const business = systems.find(system => system.id === "business")!;

        const renderPage = (targetSectionNumber: number) => render(
            <MemoryRouter initialEntries={[{ pathname: "/conversation", state: { system: business, targetSectionNumber, resume: {} } }]}>
                <Routes>
                    <Route path="/conversation" element={<Conversation />} />
                </Routes>
            </MemoryRouter>
        );

        // Page 3 (a number per page: Foundation 1, Customer Engagement 2).
        const page = renderPage(3);
        expect(screen.queryByRole("button", { name: /Hide Help|Need Help/ })).toBeNull();
        const arrow = screen.getByRole("button", { name: "Show help for Infrastructure" });
        expect(arrow.getAttribute("aria-expanded")).toBe("false");
        expect(screen.getByRole("button", { name: "Show help for Offering's Capability" })).toBeTruthy();
        expect(document.querySelector(".answer-column-questions")).toBeNull();
        fireEvent.click(arrow);
        expect(document.querySelectorAll(".answer-column-questions")).toHaveLength(1);
        page.unmount();

        // Page 2 (Customer Engagement) has none either: the guidance of each section title is its "i".
        const second = renderPage(2);
        expect(screen.queryByRole("button", { name: /Hide Help|Need Help/ })).toBeNull();
        second.unmount();

        // Page 1 (Foundation) is drawn as tiles too: no Hide Help button.
        renderPage(1);
        expect(screen.queryByRole("button", { name: /Hide Help|Need Help/ })).toBeNull();
        expect(screen.queryByRole("button", { name: /^(Show|Hide) help for / })).toBeNull();

    });

});
