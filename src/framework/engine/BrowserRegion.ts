/**
 * THE COUNTRY A BROWSER SUGGESTS (owner, 2026-11-01): the region of the browser's language ("en-GB" gives GB) or, where the language names none, the time zone ("Europe/London" gives GB). Only the six
 * countries of the first version are suggested; anything else gives "". It is shown as a soft hint in the empty Country picker and never chosen for the user.
 */
const ZONES: Record<string, string> = {
    "Europe/London": "GB", "Europe/Belfast": "GB",
    "Europe/Dublin": "IE",
    "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US", "America/Los_Angeles": "US", "America/Phoenix": "US", "America/Anchorage": "US", "Pacific/Honolulu": "US",
    "America/Toronto": "CA", "America/Vancouver": "CA", "America/Edmonton": "CA", "America/Winnipeg": "CA", "America/Halifax": "CA", "America/St_Johns": "CA",
    "Pacific/Auckland": "NZ",
    "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Brisbane": "AU", "Australia/Perth": "AU", "Australia/Adelaide": "AU", "Australia/Hobart": "AU", "Australia/Darwin": "AU"
};

export function browserCountryHint(languages: readonly string[], timeZone: string, offered: readonly string[]): string {

    for (const language of languages) {
        const region = /^[a-z]{2,3}[-_]([A-Za-z]{2})\b/.exec(language)?.[1]?.toUpperCase();
        if (region && offered.includes(region)) {
            return region;
        }
    }

    const zone = ZONES[timeZone];

    return zone && offered.includes(zone) ? zone : "";

}

/** The hint of this browser (the language list and the time zone it reports); "" where there is none. */
export function currentBrowserCountryHint(offered: readonly string[]): string {

    if (typeof navigator === "undefined") {
        return "";
    }

    let timeZone = "";

    try {
        timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    } catch {
        timeZone = "";
    }

    return browserCountryHint(navigator.languages?.length ? navigator.languages : [navigator.language ?? ""], timeZone, offered);

}
