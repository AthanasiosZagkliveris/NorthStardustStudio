import { describe, expect, it } from "vitest";

import { COMPANY_FORM, musicFromCode, personalDataFromCode, productKindsFromCode, professionFromCode } from "./LegalFacts.ts";

/* THE FACTS READ FROM WHAT IS ALREADY ANSWERED (doc 53, stage 4; owner, 2026-11-19 20:59 and 21:05 UTC+2). */
describe("the legal facts read from the activity code", () => {

    it("say what a product is where the code does, in each scheme family", () => {
        expect(productKindsFromCode("GB", "10710")).toEqual(["food"]);
        expect(productKindsFromCode("GB", "32.40")).toEqual(["toys"]);
        expect(productKindsFromCode("US", "311811")).toEqual(["food"]);
        expect(productKindsFromCode("GB", "13921")).toEqual([]);
        expect(productKindsFromCode("GB", "")).toEqual([]);
    });

    it("suggest the music licence for PPL PRS's sectors only, never online-only retail", () => {
        expect(musicFromCode("GB", "56101")).toBe(true);
        expect(musicFromCode("GB", "96020")).toBe(true);
        expect(musicFromCode("GB", "47910")).toBeNull();
        expect(musicFromCode("GB", "13921")).toBeNull();
        expect(musicFromCode("US", "713940")).toBe(true);
    });

    it("read a regulated profession from the code, and leave it open without one", () => {
        expect(professionFromCode("GB", "69201")).toBe(true);
        expect(professionFromCode("GB", "13921")).toBe(false);
        expect(professionFromCode("GB", "")).toBeNull();
        expect(professionFromCode("US", "541211")).toBe(true);
    });

    it("settle the personal details where the activity keeps more than staff, marketing and accounts", () => {
        expect(personalDataFromCode("GB", "86210")).toBe("other");
        expect(personalDataFromCode("GB", "13921")).toBeNull();
    });

    it("know a company form, for HSE40's family exemption", () => {
        expect(COMPANY_FORM.test("Private Company Limited by Shares (Ltd)")).toBe(true);
        expect(COMPANY_FORM.test("Partnership")).toBe(false);
        expect(COMPANY_FORM.test("Sole Trader")).toBe(false);
    });

});
