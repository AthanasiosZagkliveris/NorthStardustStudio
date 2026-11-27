/*
    THE EDITION (Records 2, 5.7: the owner's option B of 2026-11-27, "Go with B"). One app, two builds:

    - "foundation": the Beta and Version 1, the web and store version (built with VITE_EDITION=foundation, as the Cloudflare
      Pages project `tiles` does): the Foundation capability alone, Systems 1 to 4;
    - "full": every capability, the owner's own build (`npm run dev`, `npm run tauri dev`).

    Only what the founder SEES follows the edition: the Capabilities page, the header's lists, Search, the Review, Notes, the
    Glossary, the Card Notes and the Calendar read the edition's lists (data/capabilities.ts `editionCapabilities`,
    data/systems.ts `editionSystems`). Every lookup of a saved answer keeps the whole list, so an Organisation made in the
    full app keeps every System's answers in the Foundation edition (StorageService discards a session whose System it does
    not know).
*/

export type Edition = "full" | "foundation";

/** The capabilities the Foundation edition shows. */
const FOUNDATION_EDITION_CAPABILITIES = new Set(["foundation"]);

function readEdition(): Edition {
    // (import.meta.env exists in the Vite build and the tests; the Node scripts that read the data files have none.)
    const env = (import.meta as { env?: Record<string, string | undefined> }).env;
    return env?.VITE_EDITION === "foundation" ? "foundation" : "full";
}

export const EDITION: Edition = readEdition();

/** Whether this build shows a capability (by its id, data/capabilities.ts). */
export function capabilityInEdition(capabilityId: string, edition: Edition = EDITION): boolean {
    return edition === "full" || FOUNDATION_EDITION_CAPABILITIES.has(capabilityId);
}

/*
    THE BETA (Research 8, section 8.2): in the Foundation edition, while the Beta runs, the Business and Financial Documents
    download once the Beta questionnaire is sent. Built with VITE_BETA=on beside VITE_EDITION=foundation, set in the Cloudflare
    Pages project once its receiver is ready (Research 8, section 8.4); left off, nothing is locked. Off for Version 1.
*/
function readBeta(): boolean {
    const env = (import.meta as { env?: Record<string, string | undefined> }).env;
    return env?.VITE_BETA === "on";
}

/** Whether the document downloads wait for the Beta questionnaire (the Foundation edition, during the Beta). */
export const BETA_QUESTIONNAIRE_ON: boolean = EDITION === "foundation" && readBeta();
