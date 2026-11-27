import { describe, expect, it, vi } from "vitest";
import { AppInstallService } from "./AppInstallService";

describe("AppInstallService", () => {

    it("offers Install once the browser fires its install prompt, and opens the browser's dialog", async () => {
        AppInstallService.start();
        expect(AppInstallService.state().canInstall).toBe(false);

        const prompt = vi.fn(async () => {});
        const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), { prompt });
        window.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(AppInstallService.state().canInstall).toBe(true);

        await AppInstallService.install();
        expect(prompt).toHaveBeenCalledOnce();
        expect(AppInstallService.state().canInstall).toBe(false);
    });

    it("reloads the page when no new version waits", async () => {
        const reload = vi.fn();
        const original = window.location;
        Object.defineProperty(window, "location", { configurable: true, value: { ...original, reload } });
        await AppInstallService.reload();
        expect(reload).toHaveBeenCalledOnce();
        Object.defineProperty(window, "location", { configurable: true, value: original });
    });

});
