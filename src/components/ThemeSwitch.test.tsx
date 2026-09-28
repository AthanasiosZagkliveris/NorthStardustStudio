import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import ThemeSwitch from "./ThemeSwitch";
import { THEME_KEY, ThemeService } from "../services/ThemeService";

/** A system colour-scheme setting the tests can flip, as matchMedia reports it. */
function mockSystem(prefersDark: boolean) {

    const listeners = new Set<() => void>();

    const query = {
        get matches() { return prefersDark; },
        media: "(prefers-color-scheme: dark)",
        addEventListener: (_: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_: string, listener: () => void) => listeners.delete(listener)
    };

    vi.stubGlobal("matchMedia", vi.fn(() => query));

    return {
        set(dark: boolean) {
            prefersDark = dark;
            listeners.forEach(listener => listener());
        }
    };

}

const theme = () => document.documentElement.getAttribute("data-theme");

let stop: () => void = () => {};

beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
    stop();
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
});

describe("ThemeSwitch", () => {

    it("offers Light, Dark and Auto as one group, Auto by default", () => {

        mockSystem(false);
        stop = ThemeService.start();

        render(<ThemeSwitch />);

        expect(screen.getByRole("group", { name: "Theme" })).toBeTruthy();
        expect(screen.getAllByRole("radio").map(radio => (radio as HTMLInputElement).value)).toEqual(["light", "dark", "auto"]);
        expect((screen.getByRole("radio", { name: "Auto" }) as HTMLInputElement).checked).toBe(true);
        expect(theme()).toBe("light");

    });

    it("cycles through Light, Dark and Auto, setting data-theme and remembering each", () => {

        mockSystem(true);
        stop = ThemeService.start();

        render(<ThemeSwitch />);

        fireEvent.click(screen.getByRole("radio", { name: "Light" }));
        expect(theme()).toBe("light");
        expect(localStorage.getItem(THEME_KEY)).toBe("light");
        expect((screen.getByRole("radio", { name: "Light" }) as HTMLInputElement).checked).toBe(true);

        fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
        expect(theme()).toBe("dark");
        expect(localStorage.getItem(THEME_KEY)).toBe("dark");

        // Auto: the system's setting, dark here.
        fireEvent.click(screen.getByRole("radio", { name: "Auto" }));
        expect(theme()).toBe("dark");
        expect(localStorage.getItem(THEME_KEY)).toBe("auto");

    });

    it("starts from the remembered choice", () => {

        mockSystem(false);
        localStorage.setItem(THEME_KEY, "dark");
        stop = ThemeService.start();

        render(<ThemeSwitch />);

        expect(theme()).toBe("dark");
        expect((screen.getByRole("radio", { name: "Dark" }) as HTMLInputElement).checked).toBe(true);

    });

    it("under Auto, follows the system when its setting changes", () => {

        const system = mockSystem(false);
        stop = ThemeService.start();

        render(<ThemeSwitch />);
        expect(theme()).toBe("light");

        act(() => system.set(true));
        expect(theme()).toBe("dark");

        act(() => system.set(false));
        expect(theme()).toBe("light");
        expect((screen.getByRole("radio", { name: "Auto" }) as HTMLInputElement).checked).toBe(true);

    });

    it("ignores the system's setting once Light or Dark is chosen", () => {

        const system = mockSystem(false);
        stop = ThemeService.start();

        render(<ThemeSwitch />);
        fireEvent.click(screen.getByRole("radio", { name: "Light" }));

        act(() => system.set(true));
        expect(theme()).toBe("light");

    });

    it("falls back to Auto when storage cannot be read, and still switches", () => {

        mockSystem(true);
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });

        expect(ThemeService.getChoice()).toBe("auto");

        stop = ThemeService.start();
        render(<ThemeSwitch />);

        expect(theme()).toBe("dark");
        expect((screen.getByRole("radio", { name: "Auto" }) as HTMLInputElement).checked).toBe(true);

        fireEvent.click(screen.getByRole("radio", { name: "Light" }));
        expect(theme()).toBe("light");
        expect((screen.getByRole("radio", { name: "Light" }) as HTMLInputElement).checked).toBe(true);

        // Back to Auto, so the session's choice does not leak into other tests.
        fireEvent.click(screen.getByRole("radio", { name: "Auto" }));

    });

});
