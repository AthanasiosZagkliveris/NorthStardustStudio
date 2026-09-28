/** What the user chose: a theme, or "auto" -- follow the system. */
export type ThemeChoice = "light" | "dark" | "auto";

/** What the app is drawn in. */
export type Theme = "light" | "dark";

/**
 * Where the choice is remembered, on this device. index.html reads
 * the same key before the first paint -- keep the two in step.
 */
export const THEME_KEY = "northstardust-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * The choice when localStorage cannot be read or written (a
 * locked-down WebView, a private window): kept for this session
 * only, and Auto until the user picks something.
 */
let sessionChoice: ThemeChoice = "auto";

function isChoice(value: unknown): value is ThemeChoice {

    return value === "light" || value === "dark" || value === "auto";

}

function readChoice(): ThemeChoice {

    try {

        const stored = localStorage.getItem(THEME_KEY);

        return isChoice(stored) ? stored : "auto";

    } catch {

        return sessionChoice;

    }

}

function systemPrefersDark(): boolean {

    try {

        return typeof window.matchMedia === "function" && window.matchMedia(DARK_QUERY).matches;

    } catch {

        return false;

    }

}

function notify(): void {

    listeners.forEach(listener => listener());

}

/**
 * The app's light or dark theme. The choice (Light, Dark or Auto) is
 * remembered in localStorage; Auto follows the system's setting and
 * changes with it while the app is open. The resolved theme is set
 * as `data-theme` on <html>, which is all colors.css looks at.
 */
export const ThemeService = {

    /** The user's choice: "light", "dark" or "auto" (the default). */
    getChoice(): ThemeChoice {

        return readChoice();

    },

    /** Remembers the choice and redraws the app in it. */
    setChoice(choice: ThemeChoice): void {

        try {

            localStorage.setItem(THEME_KEY, choice);

        } catch {

            // Not remembered past this session; still applied below.
            sessionChoice = choice;

        }

        ThemeService.apply();

        notify();

    },

    /** The theme a choice comes to, given the system's setting. */
    resolve(choice: ThemeChoice, prefersDark: boolean = systemPrefersDark()): Theme {

        if (choice === "auto") {

            return prefersDark ? "dark" : "light";

        }

        return choice;

    },

    /** Sets `data-theme` on <html> from the current choice. */
    apply(): Theme {

        const theme = ThemeService.resolve(readChoice());

        document.documentElement.setAttribute("data-theme", theme);

        return theme;

    },

    /** Calls `listener` whenever the choice or, under Auto, the system's setting changes. */
    subscribe(listener: Listener): () => void {

        listeners.add(listener);

        return () => {

            listeners.delete(listener);

        };

    },

    /**
     * Applies the theme and follows the system's setting from here on:
     * under Auto, a change to it redraws the app at once. Returns a
     * function that stops following. Called once, before React renders.
     */
    start(): () => void {

        ThemeService.apply();

        if (typeof window.matchMedia !== "function") {

            return () => {};

        }

        const query = window.matchMedia(DARK_QUERY);

        const onChange = () => {

            if (readChoice() === "auto") {

                ThemeService.apply();

                notify();

            }

        };

        query.addEventListener("change", onChange);

        return () => query.removeEventListener("change", onChange);

    }

};
