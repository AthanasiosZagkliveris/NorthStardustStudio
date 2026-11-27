import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import Workbook from "../../pages/Workbook";
import { OrganizationService } from "../../services/OrganizationService";
import { BetaQuestionnaireService } from "../../services/BetaQuestionnaireService";
import { allBetaQuestions, SUS_STATEMENTS, type BetaAnswer } from "../../data/betaQuestionnaire";
import quillfield from "../../data/examples/quillfield-automation-llc.json";

// (The Foundation edition during the Beta: the questionnaire is a section of the Workbook, and the downloads wait for it.)
vi.mock("../../data/edition", async (original) => ({ ...(await original<typeof import("../../data/edition")>()), BETA_QUESTIONNAIRE_ON: true }));

const EXAMPLE = quillfield as unknown as { id: string; name: string; createdAt: number };

beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("northstardust-organization-" + EXAMPLE.id, JSON.stringify(EXAMPLE));
    localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: EXAMPLE.id, name: EXAMPLE.name, createdAt: EXAMPLE.createdAt }]));
    OrganizationService.setSelected(EXAMPLE.id);
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

function open(tab: "documents" | "beta") {
    render(
        <MemoryRouter initialEntries={[{ pathname: "/workbook", state: { tab } }]}>
            <Routes><Route path="/workbook" element={<Workbook />} /></Routes>
        </MemoryRouter>
    );
}

const questionnaire = () => screen.getByRole("region", { name: "Beta Questionnaire" });

/** The Beta questionnaire in the Workbook (Research 8, section 8.2). */
describe("the Beta questionnaire", () => {

    it("opens from a document's download until it is sent, asking about each System answered in", () => {
        open("documents");
        act(() => { fireEvent.click(screen.getByRole("button", { name: /^Export the Business Plan/ })); });
        act(() => { fireEvent.click(screen.getByRole("menuitem", { name: "PDF" })); });
        expect(screen.getByRole("heading", { level: 2, name: /^Beta Questionnaire/ })).toBeTruthy();
        const headings = within(questionnaire()).getAllByRole("heading", { level: 3 }).map(node => node.textContent);
        expect(headings).toContain("The Systems: Identity");
        expect(headings).toContain("The Systems: Strategy");
        expect(headings).toContain("The documents");
    });

    it("marks the answers still to give when Send is pressed early", () => {
        open("beta");
        act(() => { fireEvent.click(within(questionnaire()).getByRole("button", { name: "Send" })); });
        expect(within(questionnaire()).getByRole("alert").textContent).toContain("still to give");
        expect(questionnaire().querySelector("[data-beta-key=\"1\"]")!.className).toContain("business-field-missing");
    });

    it("thanks the founder once sent, and opens the downloads", async () => {
        open("beta");
        const record = BetaQuestionnaireService.read();
        for (const question of allBetaQuestions()) {
            if (question.optional) {
                continue;
            }
            const value: BetaAnswer = question.kind === "consent" ? true : question.kind === "multi" ? [question.options![0]] : question.kind === "single" ? question.options![0]
                : question.kind === "country" ? "Greece" : question.kind === "scale" ? question.from! : question.kind === "sus" ? SUS_STATEMENTS.map(() => 4) : "Clear";
            const keys = question.when === "per-system" ? (record.systems ?? []).map(system => question.number + ":" + system) : [String(question.number)];
            keys.forEach(key => act(() => BetaQuestionnaireService.answer(key, value)));
        }
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ receipt: "r-1" }), { status: 200 })));
        await act(async () => {
            fireEvent.click(within(questionnaire()).getByRole("button", { name: "Send" }));
            await BetaQuestionnaireService.flush();
        });
        expect(within(questionnaire()).getByRole("status").textContent).toContain("ready to download");
        expect(BetaQuestionnaireService.downloadsOpen()).toBe(true);
        act(() => { fireEvent.click(within(questionnaire()).getByRole("button", { name: "Go to the documents" })); });
        expect(screen.getByRole("heading", { level: 2, name: /^Business Documents/ })).toBeTruthy();
    });

});
