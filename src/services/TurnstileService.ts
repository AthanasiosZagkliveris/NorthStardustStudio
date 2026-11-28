/*
    THE HUMAN CHECK FOR THE BETA QUESTIONNAIRE (Research 8, section 8.3): Cloudflare Turnstile. Its site key comes with the build
    (VITE_TURNSTILE_SITE_KEY, set in the Cloudflare Pages project with the receiver's secret, Research 8, section 8.4); without
    it no check is made and the receiver asks for none. A token is asked for at the moment the answers are sent, so one that
    waited offline is never stale (a token lasts five minutes and is used once). The widget stays out of sight and shows itself
    only in the rare case Cloudflare needs the person to press it.
*/

/** Cloudflare's script, loaded only when a check is made. */
const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** How long a check may take before the sending waits for the next try. */
const MOST_MS = 60_000;

interface Turnstile {
    render(container: HTMLElement, options: Record<string, unknown>): string;
    execute(widget: string): void;
    remove(widget: string): void;
}

function siteKey(): string | undefined {
    const env = (import.meta as { env?: Record<string, string | undefined> }).env;
    return env?.VITE_TURNSTILE_SITE_KEY || undefined;
}

let loading: Promise<Turnstile> | null = null;

function load(): Promise<Turnstile> {
    const ready = (window as { turnstile?: Turnstile }).turnstile;
    if (ready) {
        return Promise.resolve(ready);
    }
    loading ??= new Promise<Turnstile>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = TURNSTILE_SCRIPT;
        script.async = true;
        script.onload = () => {
            const loaded = (window as { turnstile?: Turnstile }).turnstile;
            if (loaded) {
                resolve(loaded);
            } else {
                reject(new Error("Turnstile did not start."));
            }
        };
        script.onerror = () => {
            loading = null;
            reject(new Error("Turnstile could not load."));
        };
        document.head.appendChild(script);
    });
    return loading;
}

export const TurnstileService = {

    /** Whether this build checks (its site key is set). */
    checks(key: string | undefined = siteKey()): boolean {
        return key !== undefined;
    },

    /** A fresh token, or `undefined` where this build makes no check; rejects when the check cannot be made now (the answers then keep waiting). */
    async token(key: string | undefined = siteKey()): Promise<string | undefined> {
        if (!key) {
            return undefined;
        }
        const turnstile = await load();
        return new Promise<string>((resolve, reject) => {
            // (Its place: the bottom centre of the window, empty unless Cloudflare asks the person to press it.)
            const place = document.createElement("div");
            place.className = "turnstile-place";
            place.style.cssText = "position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:1000";
            document.body.appendChild(place);
            let widget = "";
            const done = () => {
                window.clearTimeout(timer);
                if (widget) {
                    turnstile.remove(widget);
                }
                place.remove();
            };
            const timer = window.setTimeout(() => { done(); reject(new Error("The check took too long.")); }, MOST_MS);
            widget = turnstile.render(place, {
                sitekey: key,
                execution: "execute",
                appearance: "interaction-only",
                callback: (token: string) => { done(); resolve(token); },
                "error-callback": () => { done(); reject(new Error("The check did not pass.")); }
            });
            turnstile.execute(widget);
        });
    },

};
