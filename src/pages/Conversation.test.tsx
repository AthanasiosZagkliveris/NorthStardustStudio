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
