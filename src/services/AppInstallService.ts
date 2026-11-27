/*
    THE INSTALLED APP AND ITS UPDATES (docs/proposals/apps-on-every-system.md, G3.2 and G3.4; the user guide, section 2, items 6
    and 7). In a browser: whether the browser offers to install the app (Chrome and Edge fire `beforeinstallprompt`), whether this
    is an iPhone or iPad (installed through Share, Add to Home Screen), whether the app already runs installed, and whether a new
    version waits (the service worker of vite.config.ts, registered here, holds it until the founder presses Reload). Inside the
    desktop app (Tauri) there is nothing to install and no service worker. The Organisations screen shows the lines.
*/

type Listener = () => void;

/** Chrome's install prompt (not in the DOM types). */
interface InstallPromptEvent extends Event {
    prompt(): Promise<void>;
}

export interface AppInstallState {
    /** The browser offers Install (Chrome, Edge). */
    canInstall: boolean;
    /** An iPhone or iPad in a browser: installed through Share, Add to Home Screen. */
    appleShare: boolean;
    /** A new version is ready; Reload takes it. */
    updateReady: boolean;
}

const listeners = new Set<Listener>();
let state: AppInstallState = { canInstall: false, appleShare: false, updateReady: false };
let installPrompt: InstallPromptEvent | null = null;
let applyUpdate: (() => Promise<void>) | null = null;
let started = false;

function set(next: Partial<AppInstallState>): void {
    state = { ...state, ...next };
    listeners.forEach(listener => listener());
}

function insideTauri(): boolean {
    return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/** The app runs as an installed app (its own window, or the Home Screen on an iPhone). */
function runsInstalled(): boolean {
    const standalone = typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches;
    return standalone || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** An iPhone or iPad (an iPad says "Macintosh" but has a touch screen). */
function appleTouchDevice(): boolean {
    return /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
}

export const AppInstallService = {

    /** Once, at start (main.tsx). */
    start(): void {
        if (started || typeof window === "undefined" || insideTauri()) {
            return;
        }
        started = true;
        if (!runsInstalled()) {
            set({ appleShare: appleTouchDevice() });
            window.addEventListener("beforeinstallprompt", event => {
                event.preventDefault();
                installPrompt = event as InstallPromptEvent;
                set({ canInstall: true });
            });
            window.addEventListener("appinstalled", () => {
                installPrompt = null;
                set({ canInstall: false });
            });
        }
        // The built web app only: the development server has no service worker (it keeps hot reload).
        if (import.meta.env.PROD && "serviceWorker" in navigator) {
            void import("workbox-window").then(({ Workbox }) => {
                const worker = new Workbox("/sw.js", { scope: "/" });
                worker.addEventListener("waiting", () => set({ updateReady: true }));
                applyUpdate = async () => {
                    worker.addEventListener("controlling", () => window.location.reload());
                    worker.messageSkipWaiting();
                };
                return worker.register();
            }).catch(() => {
                // No service worker: the app works the same, online.
            });
        }
    },

    state(): AppInstallState {
        return state;
    },

    /** Opens the browser's own Install dialog. */
    async install(): Promise<void> {
        const prompt = installPrompt;
        if (!prompt) {
            return;
        }
        installPrompt = null;
        set({ canInstall: false });
        await prompt.prompt();
    },

    /** Reloads the app, with the new version when one waits. */
    async reload(): Promise<void> {
        if (state.updateReady && applyUpdate) {
            await applyUpdate();
            return;
        }
        window.location.reload();
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },

};
