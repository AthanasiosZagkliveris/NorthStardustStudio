import { describe, expect, it } from "vitest";
import { registrationDateApplies } from "./LegalEntityJurisdictions.ts";

describe("whether a registration date is asked", () => {

    it("is not asked of a sole trader or a sole proprietorship in the six countries", () => {
        expect(registrationDateApplies("GB", "", "Sole Trader")).toBe(false);
        expect(registrationDateApplies("IE", "", "Sole Trader")).toBe(false);
        expect(registrationDateApplies("US", "New York", "Sole Proprietorship")).toBe(false);
        expect(registrationDateApplies("AU", "", "Sole Trader")).toBe(false);
    });

    it("is asked of a company, of no form chosen yet and of any other country", () => {
        expect(registrationDateApplies("GB", "", "Private Company Limited by Shares (Ltd)")).toBe(true);
        expect(registrationDateApplies("GB", "", "")).toBe(true);
        expect(registrationDateApplies("DE", "", "Einzelunternehmen (sole proprietorship)")).toBe(true);
    });

});
