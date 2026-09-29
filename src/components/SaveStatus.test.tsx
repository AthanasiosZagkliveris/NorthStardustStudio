import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";

import type { SaveState } from "../services/OrganizationStore";

// A stand-in store whose save state the test sets.
const saveState = vi.hoisted(() => {

    let state: { status: string; reason?: string } = { status: "saved" };
    const listeners = new Set<() => void>();

    return {
        get: () => state,
        set(next: { status: string; reason?: string }) {
            state = next;
            listeners.forEach(listener => listener());
        },
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => { listeners.delete(listener); };
        }
    };

});

vi.mock("../services/OrganizationService", () => ({
    OrganizationService: {
        getSaveState: () => saveState.get() as SaveState,
        subscribeSaveState: saveState.subscribe
    }
}));

import AppHeader from "./AppHeader";

afterEach(() => {
    cleanup();
    saveState.set({ status: "saved" });
});

describe("The header's saved signal", () => {

    it("is shown only while an Organization is open", () => {

        const { rerender } = render(<AppHeader />);

        expect(document.querySelector(".save-status")).toBeNull();

        rerender(<AppHeader organizationName="Quillfield" />);

        expect(document.querySelector(".save-status")).not.toBeNull();

    });

    it("says Saving… while a save is pending, then ✓ Saved, politely announced", () => {

        render(<AppHeader organizationName="Quillfield" />);

        const signal = document.querySelector(".save-status") as HTMLElement;

        expect(signal.getAttribute("aria-live")).toBe("polite");
        expect(screen.getByText("✓ Saved")).toBeTruthy();

        act(() => saveState.set({ status: "saving" }));
        expect(screen.getByText("Saving…")).toBeTruthy();
        expect(signal.getAttribute("title")).toBeNull();

        act(() => saveState.set({ status: "saved" }));
        expect(screen.getByText("✓ Saved")).toBeTruthy();

        // A signal, not a control.
        expect(screen.queryByRole("button", { name: /sav/i })).toBeNull();

    });

    it("names the reason when a save failed, in the warning style, with what to do in its tooltip", () => {

        render(<AppHeader organizationName="Quillfield" />);

        act(() => saveState.set({ status: "error", reason: "storage is full" }));

        const signal = document.querySelector(".save-status") as HTMLElement;

        expect(screen.getByText("Not saved: storage is full")).toBeTruthy();
        expect(signal.classList.contains("save-status-error")).toBe(true);
        expect(signal.getAttribute("title")).toMatch(/Export Organization/);

    });

});
