import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import BackButton from "./BackButton";
import { isShortcut, keyLabel, keyShortcuts } from "./keys";
import TitleTooltips, { tipWords } from "./TitleTooltips";

describe("the shortcut keys (Interface 8, section 5)", () => {

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it("says Ctrl on Windows and ⌘ on an Apple device", () => {
        vi.stubGlobal("navigator", { platform: "Win32" });
        expect(keyLabel("k")).toBe("Ctrl+K");
        expect(keyLabel(",")).toBe("Ctrl+,");
        vi.stubGlobal("navigator", { platform: "MacIntel" });
        expect(keyLabel("z")).toBe("⌘Z");
        vi.stubGlobal("navigator", { platform: "iPad" });
        expect(keyLabel(",")).toBe("⌘,");
        expect(keyShortcuts("k")).toBe("Control+K Meta+K");
    });

    it("answers to Ctrl or ⌘ with the key, and to no other modifier", () => {
        expect(isShortcut(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }), "k")).toBe(true);
        expect(isShortcut(new KeyboardEvent("keydown", { key: ",", metaKey: true }), ",")).toBe(true);
        expect(isShortcut(new KeyboardEvent("keydown", { key: "K", ctrlKey: true, shiftKey: true }), "k")).toBe(false);
        expect(isShortcut(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, altKey: true }), "k")).toBe(false);
        expect(isShortcut(new KeyboardEvent("keydown", { key: "k" }), "k")).toBe(false);
    });

    it("says a key in a tooltip as 'or press'", () => {
        expect(tipWords("Undo (Ctrl+Z)")).toBe("Click to undo, or press Ctrl+Z");
        expect(tipWords("Undo (⌘Z)")).toBe("Click to undo, or press ⌘Z");
        expect(tipWords("Search (Ctrl+K)")).toBe("Click to search, or press Ctrl+K");
        expect(tipWords("Next page (→)")).toBe("Click to go to the next page, or press →");
        expect(tipWords("Back (Escape)")).toBe("Click to go back, or press Escape");
    });

    it("gives a control with words of its own a tip for the key it answers to", () => {
        render(<><TitleTooltips /><BackButton onClick={() => undefined} /><button type="button" title="Undo (Ctrl+Z)" data-testid="undo">Undo</button></>);
        act(() => { fireEvent.pointerOver(screen.getByText("Back"), { clientX: 5, clientY: 5 }); });
        expect(screen.getByRole("tooltip").textContent).toBe("Click to go back, or press Escape");
        act(() => { fireEvent.pointerOver(screen.getByTestId("undo"), { clientX: 5, clientY: 5 }); });
        expect(screen.getByRole("tooltip").textContent).toBe("Click to undo, or press Ctrl+Z");
    });

    it("gives no tip where the words already show the key", () => {
        render(<><TitleTooltips /><button type="button" title="Search (Ctrl+K)" data-testid="s">Search Ctrl+K</button></>);
        act(() => { fireEvent.pointerOver(screen.getByTestId("s"), { clientX: 5, clientY: 5 }); });
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

});
