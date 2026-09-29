import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import Conversation from "./Conversation";
import { OrganizationService } from "../services/OrganizationService";
import { systems } from "../data/systems";

// The Strategy confirmation is only reached through real Strategy
// content; a stand-in Foundation page asks for it directly.
vi.mock("../components/interview/StrategyFoundationEditor.tsx", () => ({
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

    it("goes Back to the current System's capability after a cross-System jump", () => {

        renderConversation();

        fireEvent.click(screen.getByRole("button", { name: "Jump to Client" }));
        fireEvent.keyDown(window, { key: "Escape" });

        expect(screen.getByText(`Assistant ${client.capability}`)).toBeTruthy();

    });

});

describe("Conversation records the last place worked", () => {

    const identity = systems.find(system => system.id === "identity")!;

    function renderIdentity(state: Record<string, unknown>) {
        return render(
            <MemoryRouter initialEntries={[{ pathname: "/conversation", state: { system: identity, ...state } }]}>
                <Routes>
                    <Route path="/conversation" element={<Conversation />} />
                </Routes>
            </MemoryRouter>
        );
    }

    it("records the System and page once the interview shows, and the card a field is focused in", () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);

        renderIdentity({});

        // The Introduction alone is not working on anything.
        expect(OrganizationService.getLastPlace(organization.id)).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Start Interview" }));
        expect(OrganizationService.getLastPlace(organization.id)).toEqual({ systemNumber: 1, sectionIndex: 0 });

        fireEvent.click(screen.getByRole("navigation", { name: "Pages" }).querySelectorAll("button")[1]);
        expect(OrganizationService.getLastPlace(organization.id)).toEqual({ systemNumber: 1, sectionIndex: 1 });

        const card = document.querySelector<HTMLElement>("[data-rail]")!;
        const field = card.querySelector<HTMLElement>("textarea, input")!;
        fireEvent.focus(field);

        expect(OrganizationService.getLastPlace(organization.id)).toEqual({
            systemNumber: 1,
            sectionIndex: 1,
            anchor: card.dataset.rail
        });

    });

    it("draws each section's status on the Sections rail, and updates it as a column is answered", () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);

        renderIdentity({ targetSectionNumber: 1, resume: {} });

        const sections = () => Array.from(screen.getByRole("navigation", { name: "Sections" }).querySelectorAll("button"))
            .map(button => button.getAttribute("aria-label"));

        expect(sections()).toEqual([
            "1. Description: not started",
            "2. Mission: not started",
            "3. Positioning: not started",
            "4. Vision: not started"
        ]);

        fireEvent.change(document.querySelector<HTMLTextAreaElement>("[data-rail] textarea")!, {
            target: { value: "We automate small offices." }
        });

        expect(sections()[0]).toBe("1. Description: defined");
        expect(screen.getByRole("navigation", { name: "Sections" }).querySelector(".bullet-rail-dot")?.getAttribute("data-status"))
            .toBe("defined");

    });

    it("opens the interview itself, at the page, when continued", () => {

        const organization = OrganizationService.create("Quillfield");
        vi.spyOn(OrganizationService, "getSelected").mockReturnValue(organization.id);

        renderIdentity({ targetSectionNumber: 3, resume: {} });

        expect(screen.queryByRole("button", { name: "Start Interview" })).toBeNull();
        expect(screen.getByRole("navigation", { name: "Pages" }).querySelector("[aria-current='true']")?.getAttribute("aria-label"))
            .toMatch(/^3\. Legal Entity/);
        expect(OrganizationService.getLastPlace(organization.id)).toEqual({ systemNumber: 1, sectionIndex: 2 });

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
            "Foundation",
            "Customer Engagement",
            "Infrastructure & Capability",
            "Financial Foundation",
            "Sustainability"
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
            "Definition", "Ethics", "Legal Entity", "Founders Profile"
        ]);
        expect(document.querySelector(".intro-sentence")!.textContent).not.toContain("why do we exist");

    });

    it("opens the interview at a page named under What it covers", () => {

        renderOpening("identity");

        fireEvent.click(screen.getByRole("button", { name: "Legal Entity" }));

        expect(screen.queryByRole("button", { name: "Start Interview" })).toBeNull();
        expect(screen.getByRole("navigation", { name: "Pages" }).querySelector("[aria-current='true']")?.getAttribute("aria-label"))
            .toMatch(/^3\. Legal Entity/);

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
