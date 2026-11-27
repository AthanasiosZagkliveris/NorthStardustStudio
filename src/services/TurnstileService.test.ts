import { afterEach, describe, expect, it, vi } from "vitest";

import { TurnstileService } from "./TurnstileService";

/** The Beta questionnaire's human check (Research 8, section 8.3): Cloudflare Turnstile, only where the build has its site key. */
describe("the human check", () => {
    afterEach(() => {
        delete (window as { turnstile?: unknown }).turnstile;
        document.querySelectorAll(".turnstile-place").forEach(node => node.remove());
    });

    it("makes no check where the build has no site key", async () => {
        expect(TurnstileService.checks(undefined)).toBe(false);
        expect(await TurnstileService.token(undefined)).toBeUndefined();
    });

    it("asks Cloudflare for a fresh token as the answers go, and leaves no widget behind", async () => {
        const remove = vi.fn();
        (window as { turnstile?: unknown }).turnstile = {
            render: (_place: HTMLElement, options: { sitekey: string; callback: (token: string) => void }) => {
                expect(options.sitekey).toBe("site-key");
                setTimeout(() => options.callback("token-1"), 0);
                return "w1";
            },
            execute: vi.fn(),
            remove
        };
        expect(await TurnstileService.token("site-key")).toBe("token-1");
        expect(remove).toHaveBeenCalledWith("w1");
        expect(document.querySelector(".turnstile-place")).toBeNull();
    });

    it("keeps the answers waiting when the check does not pass", async () => {
        (window as { turnstile?: unknown }).turnstile = {
            render: (_place: HTMLElement, options: { "error-callback": () => void }) => { setTimeout(() => options["error-callback"](), 0); return "w2"; },
            execute: vi.fn(),
            remove: vi.fn()
        };
        await expect(TurnstileService.token("site-key")).rejects.toThrow();
    });
});
