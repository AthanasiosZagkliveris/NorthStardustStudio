import { beforeEach, describe, expect, it } from "vitest";
import { TermsService, TERMS_KEY, TERMS_VERSION } from "./TermsService";

describe("TermsService (the Terms of Use, agreed once on a device)", () => {

    beforeEach(() => localStorage.clear());

    it("asks the web and store version until the founder agrees, then never again for the same Terms", () => {
        expect(TermsService.mustAsk("foundation")).toBe(true);
        TermsService.agree();
        expect(TermsService.mustAsk("foundation")).toBe(false);
    });

    it("asks again when the Terms change", () => {
        localStorage.setItem(TERMS_KEY, "an earlier version");
        expect(TermsService.agreed()).toBe(false);
        expect(TERMS_VERSION).not.toBe("an earlier version");
    });

    it("never asks in the owner's full app", () => {
        expect(TermsService.mustAsk("full")).toBe(false);
    });

});
