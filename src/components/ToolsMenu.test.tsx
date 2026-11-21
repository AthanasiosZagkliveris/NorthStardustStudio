import { readFileSync } from "node:fs";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";

import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import ToolsMenu from "./ToolsMenu";
import { NotepadService } from "../services/NotepadService";
import { FocusModeService } from "../services/FocusModeService";
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

/** The header's Tools button. */
const trigger = () => screen.getByRole("button", { name: "Tools" });

/** Opens the menu where it is closed. */
function openMenu() {
    if (trigger().getAttribute("aria-expanded") !== "true") {
        fireEvent.click(trigger());
    }
}

/** Chooses a mode the way a pointer does: open the menu, press the mode. */
function pick(label: string) {
    openMenu();
    fireEvent.click(within(screen.getByRole("group", { name: "Reading mode" })).getByRole("menuitem", { name: label }));
}

/** The mode the menu marks as chosen (the menu closed again after). */
function shown(): string | null {
    openMenu();
    const chosen = within(screen.getByRole("group", { name: "Reading mode" })).getAllByRole("menuitem").find(row => row.getAttribute("aria-current") === "true");
    fireEvent.click(trigger());
    return chosen ? (chosen.textContent ?? "").replace("•", "") : null;
}

/** Where the app is: the page, and the state it was opened with. */
let where: { pathname: string; state: unknown } = { pathname: "", state: null };
function Where() {
    const location = useLocation();
    where = { pathname: location.pathname, state: location.state };
    return null;
}

/** The menu in the header, on an interview page (or with no Organisation open). */
function renderMenu({ organizationOpen = false, focusable = false }: { organizationOpen?: boolean; focusable?: boolean } = {}) {
    return render(
        <MemoryRouter initialEntries={["/conversation"]}>
            <ToolsMenu organizationOpen={organizationOpen} focusable={focusable} />
            <Routes><Route path="*" element={<Where />} /></Routes>
        </MemoryRouter>
    );
}

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

describe("the Tools menu (layout rules, section 6, \"The Tools menu\")", () => {

    it("holds Search, Notes, Calendar, Focus and Settings, then the reading modes, under their titles; Focus on an interview page only", () => {
        mockSystem(false);
        stop = ThemeService.start();
        renderMenu({ organizationOpen: true, focusable: true });
        expect(trigger().getAttribute("aria-haspopup")).toBe("menu");
        fireEvent.click(trigger());
        const tools = screen.getByRole("group", { name: "Tools" });
        expect(within(tools).getAllByRole("menuitem").map(row => row.getAttribute("aria-label") ?? (row.textContent ?? "").replace("•", "").replace("Ctrl+K", ""))).toEqual(["Search", "Notes, 0 notes", "Calendar", "Focus", "Settings"]);
        expect(within(screen.getByRole("group", { name: "Reading mode" })).getAllByRole("menuitem").map(row => (row.textContent ?? "").replace("•", ""))).toEqual(["Light", "Sepia", "Dark", "Auto"]);
        cleanup();
        renderMenu({ organizationOpen: true, focusable: false });
        fireEvent.click(trigger());
        expect(within(screen.getByRole("group", { name: "Tools" })).queryByRole("menuitem", { name: "Focus" })).toBeNull();
    });

    it("holds the reading modes alone where no Organisation is open", () => {
        mockSystem(false);
        stop = ThemeService.start();
        renderMenu();
        fireEvent.click(trigger());
        expect(screen.queryByRole("group", { name: "Tools" })).toBeNull();
        expect(screen.getByRole("group", { name: "Reading mode" })).toBeTruthy();
    });

    it("opens each tool and closes: Search's dialog, the Notes' panel, Focus, the Global Settings and System Selection's Calendar", () => {
        mockSystem(false);
        stop = ThemeService.start();
        renderMenu({ organizationOpen: true, focusable: true });
        const press = (name: RegExp) => {
            openMenu();
            fireEvent.click(within(screen.getByRole("group", { name: "Tools" })).getByRole("menuitem", { name }));
            expect(screen.queryByRole("menu")).toBeNull();
        };
        const asked = vi.fn();
        window.addEventListener("search:open", asked);
        press(/^Search/);
        window.removeEventListener("search:open", asked);
        expect(asked).toHaveBeenCalledTimes(1);

        const toggle = vi.spyOn(NotepadService, "toggle");
        press(/^Notes/);
        expect(toggle).toHaveBeenCalledTimes(1);

        press(/^Focus/);
        expect(FocusModeService.isOn()).toBe(true);
        act(() => FocusModeService.set(false));

        press(/^Settings/);
        expect(where.pathname).toBe("/settings");
        expect((where.state as { from?: { pathname: string } }).from?.pathname).toBe("/conversation");

        press(/^Calendar/);
        expect(where.pathname).toBe("/assistant");
        expect(typeof (where.state as { calendar?: unknown }).calendar).toBe("number");
    });

});

describe("the Tools menu's reading modes", () => {

    it("offers Light, Sepia, Dark and Auto, Auto by default", () => {
        mockSystem(false);
        stop = ThemeService.start();
        renderMenu();
        expect(shown()).toBe("Auto");
        expect(theme()).toBe("light");
    });

    it("sets data-theme and remembers each: Light, Sepia, Dark and Auto", () => {
        mockSystem(true);
        stop = ThemeService.start();
        renderMenu();
        pick("Light");
        expect(theme()).toBe("light");
        expect(localStorage.getItem(THEME_KEY)).toBe("light");
        expect(shown()).toBe("Light");
        pick("Sepia");
        expect(theme()).toBe("sepia");
        expect(localStorage.getItem(THEME_KEY)).toBe("sepia");
        pick("Dark");
        expect(theme()).toBe("dark");
        // Auto: the system's setting, dark here.
        pick("Auto");
        expect(theme()).toBe("dark");
        expect(localStorage.getItem(THEME_KEY)).toBe("auto");
    });

    it("starts from the remembered choice", () => {
        mockSystem(false);
        localStorage.setItem(THEME_KEY, "sepia");
        stop = ThemeService.start();
        renderMenu();
        expect(theme()).toBe("sepia");
        expect(shown()).toBe("Sepia");
    });

    it("under Auto, follows the system's light or dark; once Light or Sepia is chosen, it does not", () => {
        const system = mockSystem(false);
        stop = ThemeService.start();
        renderMenu();
        act(() => system.set(true));
        expect(theme()).toBe("dark");
        act(() => system.set(false));
        expect(theme()).toBe("light");
        pick("Sepia");
        act(() => system.set(true));
        expect(theme()).toBe("sepia");
        pick("Light");
        expect(theme()).toBe("light");
        pick("Auto");
        expect(theme()).toBe("dark");
        expect(ThemeService.resolve("auto", false)).toBe("light");
    });

    it("follows a choice made in another window", () => {
        mockSystem(false);
        stop = ThemeService.start();
        renderMenu();
        localStorage.setItem(THEME_KEY, "sepia");
        act(() => { window.dispatchEvent(new StorageEvent("storage", { key: THEME_KEY, newValue: "sepia" })); });
        expect(theme()).toBe("sepia");
        expect(shown()).toBe("Sepia");
        pick("Auto");
    });

    it("closes on a click elsewhere or Escape, choosing nothing", () => {
        mockSystem(false);
        stop = ThemeService.start();
        renderMenu();
        fireEvent.click(trigger());
        expect(trigger().getAttribute("aria-expanded")).toBe("true");
        fireEvent.mouseDown(document.body);
        expect(screen.queryByRole("menu")).toBeNull();
        fireEvent.click(trigger());
        fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
        expect(screen.queryByRole("menu")).toBeNull();
        expect(shown()).toBe("Auto");
    });

    it("falls back to Auto when storage cannot be read, and still switches", () => {
        mockSystem(true);
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
        expect(ThemeService.getChoice()).toBe("auto");
        stop = ThemeService.start();
        renderMenu();
        expect(theme()).toBe("dark");
        expect(shown()).toBe("Auto");
        pick("Light");
        expect(theme()).toBe("light");
        expect(shown()).toBe("Light");
        pick("Auto");
    });

});

/* The script that sets the theme before the first paint (public/theme-init.js,
   loaded by index.html): the same choices and rule as ThemeService. */
describe("the pre-paint theme script", () => {

    // Read from the project root, where the test runner runs.
    const source = readFileSync("public/theme-init.js", "utf8");
    it("is loaded by index.html before the app", () => {
        const html = readFileSync("index.html", "utf8");
        expect(html.indexOf("<script src=\"/theme-init.js\"></script>")).toBeGreaterThan(-1);
        expect(html.indexOf("/theme-init.js")).toBeLessThan(html.indexOf("/src/main.tsx"));
    });
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
