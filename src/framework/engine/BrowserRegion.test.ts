import { describe, expect, it } from "vitest";
import { browserCountryHint } from "./BrowserRegion.ts";

const SIX = ["GB", "IE", "US", "CA", "AU", "NZ"];

describe("the country a browser suggests", () => {

    it("is the region of the language", () => {
        expect(browserCountryHint(["en-GB"], "", SIX)).toBe("GB");
        expect(browserCountryHint(["fr-CA", "en-US"], "", SIX)).toBe("CA");
        expect(browserCountryHint(["en_AU"], "", SIX)).toBe("AU");
    });

    it("falls back to the time zone where the language names no region of the six", () => {
        expect(browserCountryHint(["en"], "Europe/Dublin", SIX)).toBe("IE");
        expect(browserCountryHint(["de-DE"], "Pacific/Auckland", SIX)).toBe("NZ");
        expect(browserCountryHint([], "America/Chicago", SIX)).toBe("US");
    });

    it("suggests nothing for any other country", () => {
        expect(browserCountryHint(["de-DE"], "Europe/Berlin", SIX)).toBe("");
        expect(browserCountryHint([], "", SIX)).toBe("");
    });

});
