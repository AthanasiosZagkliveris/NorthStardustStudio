import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import FocusModeButton from "./FocusModeButton";
import { FOCUS_KEY, FocusModeService } from "../services/FocusModeService";
import { stylesheet } from "../test/stylesheet";

beforeEach(() => {
    localStorage.clear();
    FocusModeService.reload();
});

afterEach(() => {
    cleanup();
    act(() => FocusModeService.set(false));
    vi.restoreAllMocks();
    localStorage.clear();
});

const focused = () => document.documentElement.classList.contains("focus-mode");

describe("focus mode", () => {

    it("turns on from the header's Focus tool, and off from the one Exit focus button", () => {
        render(<FocusModeButton />);
        expect(focused()).toBe(false);
        expect(screen.queryByRole("button", { name: "Exit focus" })).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Focus" }));
        expect(focused()).toBe(true);
        expect(localStorage.getItem(FOCUS_KEY)).toBe("on");
        const exit = screen.getByRole("button", { name: "Exit focus" });
        // In the corner, outside the header it hides.
        expect(exit.parentElement).toBe(document.body);

        fireEvent.click(exit);
        expect(focused()).toBe(false);
        expect(localStorage.getItem(FOCUS_KEY)).toBeNull();
    });

    it("is remembered on this device until exited, and only an interview page takes it", () => {
        localStorage.setItem(FOCUS_KEY, "on");
        FocusModeService.reload();
        const { unmount } = render(<FocusModeButton />);
        expect(focused()).toBe(true);
        // Another page (no Focus tool): the page is itself again, the choice kept.
        unmount();
        expect(focused()).toBe(false);
        expect(FocusModeService.isOn()).toBe(true);
    });

    it("still works when storage cannot be written", () => {
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
        render(<FocusModeButton />);
        fireEvent.click(screen.getByRole("button", { name: "Focus" }));
        expect(focused()).toBe(true);
    });

    it("hides the rails, the Help, the progress line and the header's own tools, centres the page at a reading width, with no transition", () => {
        const css = stylesheet("focus-mode.css");
        expect(css).toContain("html.focus-mode :is(.bullet-rails, .interview-progress, .interview-help, .interview-instructions-toggle)");
        expect(css).toContain("html.focus-mode .app-header > :is(.app-logo, .save-status, .theme-switch, .header-tool, .app-header-organization-name)");
        expect(css).toContain("max-width: min(var(--focus-width), 100%);");
        expect(css).not.toContain("transition");
    });

});
