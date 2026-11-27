/*
    THE TERMS OF USE, AGREED ONCE ON A DEVICE (northstardust.studio/terms; Research 11, section 3, change 2: acceptance by a tick on first
    use). The web and store version (data/edition.ts, the Foundation edition) asks on the Organisations screen until the founder agrees;
    the agreement is kept on this device with the Terms' version, so a new version of the Terms asks again. Storage that cannot be read or
    written means the question is asked again next time.
*/

import { EDITION, Edition } from "../data/edition";

/** The version of the Terms of Use and the Privacy Policy the founder agrees to: their "Last updated" date. */
export const TERMS_VERSION = "2026-11-27";

export const TERMS_KEY = "northstardust-terms-agreed";

export const TERMS_URL = "https://northstardust.studio/terms";
export const PRIVACY_URL = "https://northstardust.studio/privacy";

export const TermsService = {

    /** Whether this device has agreed to the current Terms. */
    agreed(): boolean {
        try {
            return localStorage.getItem(TERMS_KEY) === TERMS_VERSION;
        } catch {
            return false;
        }
    },

    agree(): void {
        try {
            localStorage.setItem(TERMS_KEY, TERMS_VERSION);
        } catch {
            // Not remembered: asked again next time.
        }
    },

    /** Whether to ask now: the web and store version, until agreed. */
    mustAsk(edition: Edition = EDITION): boolean {
        return edition === "foundation" && !TermsService.agreed();
    },

};
