import { readFileSync } from "node:fs";

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

    it("offers Light, Sepia, Dark and Auto as one group, Auto by default", () => {

        mockSystem(false);
        stop = ThemeService.start();

        render(<ThemeSwitch />);

        expect(screen.getByRole("group", { name: "Theme" })).toBeTruthy();
        expect(screen.getAllByRole("radio").map(radio => (radio as HTMLInputElement).value)).toEqual(["light", "sepia", "dark", "auto"]);
        expect((screen.getByRole("radio", { name: "Auto" }) as HTMLInputElement).checked).toBe(true);
        expect(theme()).toBe("light");

    });

    it("cycles through Light, Sepia, Dark and Auto, setting data-theme and remembering each", () => {

        mockSystem(true);
        stop = ThemeService.start();

        render(<ThemeSwitch />);

        fireEvent.click(screen.getByRole("radio", { name: "Light" }));
        expect(theme()).toBe("light");
        expect(localStorage.getItem(THEME_KEY)).toBe("light");
        expect((screen.getByRole("radio", { name: "Light" }) as HTMLInputElement).checked).toBe(true);

        fireEvent.click(screen.getByRole("radio", { name: "Sepia" }));
        expect(theme()).toBe("sepia");
        expect(localStorage.getItem(THEME_KEY)).toBe("sepia");
        expect((screen.getByRole("radio", { name: "Sepia" }) as HTMLInputElement).checked).toBe(true);

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

    it("starts from a remembered Sepia", () => {

        mockSystem(true);
        localStorage.setItem(THEME_KEY, "sepia");
        stop = ThemeService.start();

        render(<ThemeSwitch />);

        expect(theme()).toBe("sepia");
        expect((screen.getByRole("radio", { name: "Sepia" }) as HTMLInputElement).checked).toBe(true);

    });

    it("under Auto, follows the system's light or dark, never sepia", () => {

        const system = mockSystem(false);
        localStorage.setItem(THEME_KEY, "sepia");
        stop = ThemeService.start();

        render(<ThemeSwitch />);
        fireEvent.click(screen.getByRole("radio", { name: "Auto" }));
        expect(theme()).toBe("light");

        act(() => system.set(true));
        expect(theme()).toBe("dark");

        act(() => system.set(false));
        expect(theme()).toBe("light");
        expect(ThemeService.resolve("auto", true)).toBe("dark");
        expect(ThemeService.resolve("auto", false)).toBe("light");

    });

    it("ignores the system's setting once Sepia is chosen", () => {

        const system = mockSystem(false);
        stop = ThemeService.start();

        render(<ThemeSwitch />);
        fireEvent.click(screen.getByRole("radio", { name: "Sepia" }));

        act(() => system.set(true));
        expect(theme()).toBe("sepia");

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

/* The script in index.html that sets the theme before the first
   paint: the same choices and rule as ThemeService. */
describe("the pre-paint theme script", () => {

    // Read from the project root, where the test runner runs.
    const html = readFileSync("index.html", "utf8");
    const source = html.slice(html.indexOf("<script>") + "<script>".length, html.indexOf("</script>"));
    const run = (stored: string | null, prefersDark: boolean) => {
        localStorage.clear();
        if (stored !== null) localStorage.setItem(THEME_KEY, stored);
        mockSystem(prefersDark);
        document.documentElement.removeAttribute("data-theme");
        new Function(source)();
        return theme();
    };

    it("applies a stored Light, Sepia or Dark whatever the system says", () => {
        expect(run("light", true)).toBe("light");
        expect(run("sepia", true)).toBe("sepia");
        expect(run("sepia", false)).toBe("sepia");
        expect(run("dark", false)).toBe("dark");
    });

    it("follows the system's light or dark for Auto, nothing stored, or anything else", () => {
        expect(run("auto", true)).toBe("dark");
        expect(run("auto", false)).toBe("light");
        expect(run(null, true)).toBe("dark");
        expect(run("purple", false)).toBe("light");
    });

    it("falls back to Auto when storage throws", () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
        expect(run(null, true)).toBe("dark");
    });

});
