import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ExportFlow, { type ExportFlowProps } from "./ExportFlow";
import { InterviewSession } from "../framework/interview";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { asLegalEntityValue } from "../framework/engine/AnswerUtils.ts";
import { reviewManager } from "./conversationHelpers";

/*
    THE EXPORT DIALOGS (written 2026-11-11 when they moved out of Conversation.tsx: the owner, "Can you do both?"). Finish is hidden, so no
    page reaches them today; these keep them working: the empty answers listed with Cancel and Continue, the Export Options' Capability and
    formats, the Operations picker that starts again from All Processes each time the dialog opens, and the Markdown written on Export.
*/

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

function props(overrides: Partial<ExportFlowProps> = {}): ExportFlowProps {
    return {
        step: "options",
        onStep: vi.fn(),
        onContinue: vi.fn(),
        openCount: 0,
        validationIssues: [],
        session: new InterviewSession(frameworkRegistry.getFramework("identity")),
        system: { id: "identity" },
        organizationId: null,
        organizationName: "",
        selectedProductName: undefined,
        operationsProcesses: [],
        legalEntity: asLegalEntityValue(undefined),
        foundersProfile: undefined,
        organisationCurrency: "",
        ...overrides
    };
}

describe("ExportFlow", () => {

    it("draws nothing while closed", () => {
        const { container } = render(<ExportFlow {...props({ step: "none" })} />);
        expect(container.innerHTML).toBe("");
    });

    it("lists the empty answers under their page, and Cancel and Continue do their part", () => {
        const session = new InterviewSession(frameworkRegistry.getFramework("identity"));
        const first = session.getFramework().sections[0];
        const onStep = vi.fn();
        const onContinue = vi.fn();
        render(<ExportFlow {...props({
            step: "warning",
            session,
            onStep,
            onContinue,
            validationIssues: [{ sectionNumber: first.number, sectionTitle: first.title, message: "" } as never]
        })} />);
        expect(screen.getByText("Sections Incomplete")).toBeTruthy();
        expect(screen.getByText(first.number + ". " + first.title)).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onStep).toHaveBeenCalledWith("none");
        fireEvent.click(screen.getByRole("button", { name: "Continue" }));
        expect(onContinue).toHaveBeenCalled();
    });

    it("waits for a Capability name and a format before it exports", () => {
        render(<ExportFlow {...props()} />);
        const exportButton = () => screen.getByRole("button", { name: "Export" }) as HTMLButtonElement;
        expect(exportButton().disabled).toBe(false);
        fireEvent.click(screen.getByLabelText("Another Capability"));
        expect(exportButton().disabled).toBe(true);
        fireEvent.change(screen.getByPlaceholderText("Capability name"), { target: { value: "Design" } });
        expect(exportButton().disabled).toBe(false);
        fireEvent.click(screen.getByLabelText("Markdown (.md)"));
        expect(exportButton().disabled).toBe(true);
    });

    it("writes the Markdown on Export and closes", () => {
        const exportMarkdown = vi.spyOn(reviewManager, "exportMarkdown").mockImplementation(() => undefined);
        const onStep = vi.fn();
        render(<ExportFlow {...props({ onStep })} />);
        fireEvent.click(screen.getByRole("button", { name: "Export" }));
        expect(exportMarkdown).toHaveBeenCalledTimes(1);
        expect(onStep).toHaveBeenCalledWith("none");
    });

    it("starts the Operations picker again from All Processes each time the dialog opens", () => {
        const base = props({ system: { id: "operations" }, session: new InterviewSession(frameworkRegistry.getFramework("operations")) });
        const { rerender } = render(<ExportFlow {...base} />);
        fireEvent.click(screen.getByLabelText("Selected Processes"));
        expect(screen.getByText("No Processes yet.")).toBeTruthy();
        expect((screen.getByRole("button", { name: "Export" }) as HTMLButtonElement).disabled).toBe(true);
        rerender(<ExportFlow {...base} openCount={1} />);
        expect((screen.getByLabelText("All Processes") as HTMLInputElement).checked).toBe(true);
        expect(screen.queryByText("No Processes yet.")).toBeNull();
    });

});
