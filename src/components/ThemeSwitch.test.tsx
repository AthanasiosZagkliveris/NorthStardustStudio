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

/** The picker's button, named for the mode it shows. */
const trigger = () => screen.getByRole("button", { name: /^Reading mode/ });

/** Chooses a mode the way a pointer does: open the list, click the mode. */
function pick(label: string) {
    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole("option", { name: label }));
}

/** The mode the picker says is current. */
const shown = () => trigger().getAttribute("aria-label");

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

    it("offers Light, Sepia, Dark and Auto in one picker, Auto by default", () => {

        mockSystem(false);
        stop = ThemeService.start();

        render(<ThemeSwitch />);

        expect(shown()).toBe("Reading mode: Auto");
        expect(trigger().getAttribute("aria-haspopup")).toBe("listbox");
        expect(trigger().getAttribute("aria-expanded")).toBe("false");

        fireEvent.click(trigger());
        const list = screen.getByRole("listbox", { name: "Reading mode" });
        expect(list).toBeTruthy();
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Light", "Sepia", "Dark", "Auto"]);
        expect(screen.getByRole("option", { name: "Auto" }).getAttribute("aria-selected")).toBe("true");
        expect(screen.getByRole("option", { name: "Light" }).getAttribute("aria-selected")).toBe("false");
        expect(shown()).toBe("Reading mode: Auto");
        expect(theme()).toBe("light");

    });

    it("cycles through Light, Sepia, Dark and Auto, setting data-theme and remembering each", () => {

        mockSystem(true);
        stop = ThemeService.start();

        render(<ThemeSwitch />);

        pick("Light");
        expect(theme()).toBe("light");
        expect(localStorage.getItem(THEME_KEY)).toBe("light");
        expect(shown()).toBe("Reading mode: Light");

        pick("Sepia");
        expect(theme()).toBe("sepia");
        expect(localStorage.getItem(THEME_KEY)).toBe("sepia");
        expect(shown()).toBe("Reading mode: Sepia");

        pick("Dark");
        expect(theme()).toBe("dark");
        expect(localStorage.getItem(THEME_KEY)).toBe("dark");

        // Auto: the system's setting, dark here.
        pick("Auto");
        expect(theme()).toBe("dark");
        expect(localStorage.getItem(THEME_KEY)).toBe("auto");

    });

    it("starts from the remembered choice", () => {

        mockSystem(false);
        localStorage.setItem(THEME_KEY, "dark");
        stop = ThemeService.start();

        render(<ThemeSwitch />);

        expect(theme()).toBe("dark");
        expect(shown()).toBe("Reading mode: Dark");

    });

    it("starts from a remembered Sepia", () => {

        mockSystem(true);
        localStorage.setItem(THEME_KEY, "sepia");
        stop = ThemeService.start();

        render(<ThemeSwitch />);

        expect(theme()).toBe("sepia");
        expect(shown()).toBe("Reading mode: Sepia");

    });

    it("under Auto, follows the system's light or dark, never sepia", () => {

        const system = mockSystem(false);
        localStorage.setItem(THEME_KEY, "sepia");
        stop = ThemeService.start();

        render(<ThemeSwitch />);
        pick("Auto");
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
        pick("Sepia");

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
        expect(shown()).toBe("Reading mode: Auto");

    });

    it("ignores the system's setting once Light or Dark is chosen", () => {

        const system = mockSystem(false);
        stop = ThemeService.start();

        render(<ThemeSwitch />);
        pick("Light");

        act(() => system.set(true));
        expect(theme()).toBe("light");

    });

    it("works from the keyboard: arrows open on the current mode and move, Enter takes, Escape closes", () => {

        mockSystem(false);
        stop = ThemeService.start();

        render(<ThemeSwitch />);

        // Down opens the list on the current mode (Auto, the last).
        fireEvent.keyDown(trigger(), { key: "ArrowDown" });
        const list = screen.getByRole("listbox", { name: "Reading mode" });
        expect(document.activeElement).toBe(list);
        const active = () => document.getElementById(list.getAttribute("aria-activedescendant") ?? "")?.textContent;
        expect(active()).toBe("Auto");

        fireEvent.keyDown(list, { key: "Home" });
        expect(active()).toBe("Light");
        fireEvent.keyDown(list, { key: "ArrowDown" });
        expect(active()).toBe("Sepia");
        fireEvent.keyDown(list, { key: "Enter" });
        expect(theme()).toBe("sepia");
        expect(screen.queryByRole("listbox")).toBeNull();
        expect(document.activeElement).toBe(trigger());

        // Escape closes without changing anything, and stops there.
        const onWindow = vi.fn((event: KeyboardEvent) => event.key);
        const escapes = () => onWindow.mock.results.filter(result => result.value === "Escape").length;
        window.addEventListener("keydown", onWindow);
        fireEvent.keyDown(trigger(), { key: "ArrowUp" });
        fireEvent.keyDown(screen.getByRole("listbox"), { key: "End" });
        fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });
        window.removeEventListener("keydown", onWindow);
        expect(escapes()).toBe(0);
        expect(screen.queryByRole("listbox")).toBeNull();
        expect(theme()).toBe("sepia");

        // Space takes a mode too.
        fireEvent.keyDown(trigger(), { key: "ArrowDown" });
        fireEvent.keyDown(screen.getByRole("listbox"), { key: "ArrowDown" });
        fireEvent.keyDown(screen.getByRole("listbox"), { key: " " });
        expect(theme()).toBe("dark");

        // Back to Auto, so the choice does not leak into other tests.
        pick("Auto");

    });

    it("closes on a click elsewhere, choosing nothing", () => {

        mockSystem(false);
        stop = ThemeService.start();

        render(<ThemeSwitch />);
        fireEvent.click(trigger());
        expect(trigger().getAttribute("aria-expanded")).toBe("true");
        fireEvent.mouseDown(document.body);
        expect(screen.queryByRole("listbox")).toBeNull();
        expect(shown()).toBe("Reading mode: Auto");

    });

    it("falls back to Auto when storage cannot be read, and still switches", () => {

        mockSystem(true);
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });

        expect(ThemeService.getChoice()).toBe("auto");

        stop = ThemeService.start();
        render(<ThemeSwitch />);

        expect(theme()).toBe("dark");
        expect(shown()).toBe("Reading mode: Auto");

        pick("Light");
        expect(theme()).toBe("light");
        expect(shown()).toBe("Reading mode: Light");

        // Back to Auto, so the session's choice does not leak into other tests.
        pick("Auto");

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
