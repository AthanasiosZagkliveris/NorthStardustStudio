import { describe, expect, it } from "vitest";

import { US_STATES, US_STATES_CHECKED, usStateOf, type UsFee } from "./UsStates.ts";

const NO_SALES_TAX = ["AK", "DE", "MT", "NH", "OR"];
const LLC_PUBLICATION = ["AZ", "NE", "NY"];
const CORPORATION_PUBLICATION = ["AZ", "GA", "NE", "PA"];

function allFees(): UsFee[] {
    return US_STATES.flatMap(state => [
        state.llc?.formation, state.llc?.report, state.llc?.publication?.fee,
        state.corporation?.formation, state.corporation?.report, state.corporation?.publication?.fee,
        state.fixedTax?.llc, state.fixedTax?.corporation
    ]).filter((fee): fee is UsFee => fee !== undefined);
}

describe("US_STATES rows", () => {
    it("has 51 rows with unique codes, DC included, alphabetical by name", () => {
        expect(US_STATES).toHaveLength(51);
        expect(new Set(US_STATES.map(s => s.code)).size).toBe(51);
        expect(US_STATES.some(s => s.code === "DC")).toBe(true);
        const names = US_STATES.map(s => s.name);
        expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    });

    it("gives every row a checked date and at least one https source", () => {
        expect(US_STATES_CHECKED).toBe("2026-11-19");
        for (const state of US_STATES) {
            expect(state.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(state.sources.length).toBeGreaterThan(0);
            for (const url of state.sources) expect(url).toMatch(/^https:\/\//);
        }
    });
});

describe("usStateOf", () => {
    it("finds a state by code or name, case-insensitive and trimmed", () => {
        expect(usStateOf("ny")?.code).toBe("NY");
        expect(usStateOf("New York ")?.code).toBe("NY");
        expect(usStateOf("District of Columbia")?.code).toBe("DC");
        expect(usStateOf(" ca ")?.name).toBe("California");
    });

    it("finds nothing for an empty or unknown subdivision", () => {
        expect(usStateOf("")).toBeUndefined();
        expect(usStateOf("Ontario")).toBeUndefined();
    });
});

describe("sales tax family", () => {
    it("has no statewide sales tax in AK, DE, MT, NH and OR, and one everywhere else", () => {
        for (const state of US_STATES) {
            expect(state.salesTax).toBe(!NO_SALES_TAX.includes(state.code));
            if (!state.salesTax) expect(state.salesTaxRegistration).toBeUndefined();
        }
    });
});

describe("publication family", () => {
    it("asks for publication only where the research confirms it", () => {
        for (const state of US_STATES) {
            expect(state.llc?.publication !== undefined).toBe(LLC_PUBLICATION.includes(state.code));
            expect(state.corporation?.publication !== undefined).toBe(CORPORATION_PUBLICATION.includes(state.code));
        }
        expect(usStateOf("NY")?.llc?.publication?.fee?.amount).toBe("50");
    });
});

describe("biennial reporters", () => {
    it("reports every two years in AK, CA (LLC), DC, IN, IA (LLC), NE (LLC), NM (corporation) and NY", () => {
        const biennial = US_STATES.flatMap(state => [
            state.llc?.report?.frequency === "Every two years" ? state.code + " LLC" : undefined,
            state.corporation?.report?.frequency === "Every two years" ? state.code + " corporation" : undefined
        ]).filter(Boolean);
        expect(biennial).toEqual([
            "AK LLC", "AK corporation", "CA LLC", "DC LLC", "DC corporation", "IN LLC", "IN corporation",
            "IA LLC", "NE LLC", "NM corporation", "NY LLC", "NY corporation"
        ]);
        expect(usStateOf("CA")?.corporation?.report?.frequency).toBe("Annually");
    });
});

describe("fixed taxes", () => {
    it("gives California the $800 fixed tax for both forms", () => {
        const ca = usStateOf("California");
        expect(ca?.fixedTax?.llc?.amount).toBe("800");
        expect(ca?.fixedTax?.corporation?.amount).toBe("800");
    });

    it("leaves out the Delaware LLC annual tax, where official pages conflict", () => {
        expect(usStateOf("DE")?.fixedTax?.llc).toBeUndefined();
    });
});

describe("amounts", () => {
    it("writes every amount as plain dollars in digits", () => {
        const fees = allFees();
        expect(fees.length).toBeGreaterThan(0);
        for (const fee of fees) {
            expect(fee.amount).toMatch(/^\d+(\.\d{1,2})?$/);
            expect(fee.name.trim()).not.toBe("");
        }
    });

    it("marks every formation and publication fee as one time", () => {
        for (const state of US_STATES) {
            for (const form of [state.llc, state.corporation]) {
                if (form?.formation) expect(form.formation.frequency).toBe("One time");
                if (form?.publication?.fee) expect(form.publication.fee.frequency).toBe("One time");
            }
        }
    });
});
