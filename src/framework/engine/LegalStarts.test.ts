import { describe, expect, it } from "vitest";
import { LEGAL_ENTITY_EXPENSE_FREQUENCIES } from "./LegalEntityJurisdictions.ts";

import lumen from "../../data/examples/lumen-and-loom-studio.json";
import quill from "../../data/examples/quillfield-automation-llc.json";
import { asLegalEntityValue } from "./AnswerLegal.ts";
import { legalStartsFor, paysAnyone, pendingLegalStarts, withLegalStarts } from "./LegalStarts.ts";

/* THE LEGAL STARTS, STAGE 1 (doc 53, section 6, decisions 1 (a), 5 and 8). */
type Example = { systems: Record<string, { responses: { sectionNumber: number; value?: { formation?: unknown } }[] }> };
const legalOf = (example: Example) => asLegalEntityValue(example.systems["1"].responses.find(response => response.value?.formation)!.value);
const capabilityOf = (example: Example) => example.systems["3"].responses.find(response => response.sectionNumber === 3)!.value;
const entityWith = (organisation: Record<string, string>, registrationNumber = "") => asLegalEntityValue({ organisation, formation: { registrationNumber } });
const rules = (starts: readonly { rule: string }[]) => starts.map(start => start.rule);
let counter = 0;
const id = (prefix: string) => prefix + "-" + (counter += 1);

describe("the legal starts", () => {

    it("make a UK limited company's filings, with the official fees, and PAYE once anyone is paid", () => {
        const entity = entityWith({ country: "GB", legalForm: "Private Company Limited by Shares (Ltd)" });
        expect(rules(legalStartsFor({ entity, paid: false }))).toEqual(["GB1", "GB2", "GB3", "GB4", "GB6", "GB7"]);
        expect(rules(legalStartsFor({ entity, paid: true }))).toContain("GB10");
        const fees = legalStartsFor({ entity, paid: false }).filter(start => start.fee).map(start => [start.rule, start.fee!.amount, start.fee!.frequency]);
        expect(fees).toEqual([["GB1", "100", "One time"], ["GB2", "50", "Annually"]]);
    });

    it("make no incorporation fee once the company is registered, and nothing for a sole trader", () => {
        expect(rules(legalStartsFor({ entity: entityWith({ country: "GB", legalForm: "Private Company Limited by Shares (Ltd)" }, "16234587"), paid: false }))).not.toContain("GB1");
        expect(legalStartsFor({ entity: entityWith({ country: "GB", legalForm: "Sole Trader" }), paid: true })).toEqual([]);
    });

    // (Owner, 2026-11-19 21:44 UTC+2: "I need the registrations, tax and legal docs to cover the whole USA, not only NY".)
    it("make a New York LLC's state items and the federal EIN; every other state its own row's", () => {
        expect(rules(legalStartsFor({ entity: entityWith({ country: "US", subdivision: "New York", legalForm: "Limited Liability Company (LLC)" }), paid: false }))).toEqual(["US1", "US2", "US3", "US4"]);
        expect(rules(legalStartsFor({ entity: entityWith({ country: "US", subdivision: "California", legalForm: "Limited Liability Company (LLC)" }), paid: false }))).toEqual(["US1", "US2", "US4", "US10"]);
        // (The Legal Entity's two-year filings keep Every two years: New York's Biennial Statement; owner, 2026-11-20 13:31 UTC+2.)
        expect(legalStartsFor({ entity: entityWith({ country: "US", subdivision: "NY", legalForm: "Limited Liability Company (LLC)" }), paid: false }).find(start => start.rule === "US4")?.fee?.frequency).toBe("Every two years");
        expect(LEGAL_ENTITY_EXPENSE_FREQUENCIES).toContain("Every two years");
        const ca = legalStartsFor({ entity: entityWith({ country: "US", subdivision: "CA", legalForm: "C Corporation" }), paid: false });
        expect(ca.find(start => start.rule === "US10")?.fee).toMatchObject({ amount: "800", frequency: "Annually" });
        // (Publication only where the state asks for it: an Arizona LLC publishes, a Texas one does not; a state with no confirmed figure makes the EIN alone.)
        expect(rules(legalStartsFor({ entity: entityWith({ country: "US", subdivision: "Arizona", legalForm: "Limited Liability Company (LLC)" }), paid: false }))).toContain("US3");
        expect(rules(legalStartsFor({ entity: entityWith({ country: "US", subdivision: "Texas", legalForm: "Limited Liability Company (LLC)" }), paid: false }))).not.toContain("US3");
        expect(rules(legalStartsFor({ entity: entityWith({ country: "US", subdivision: "", legalForm: "Limited Liability Company (LLC)" }), paid: false }))).toEqual(["US1"]);
    });

    it("make each item once, by its rule or its name, and never one the founder removed", () => {
        const entity = entityWith({ country: "GB", legalForm: "Private Company Limited by Shares (Ltd)" });
        const made = withLegalStarts(entity, pendingLegalStarts({ entity, paid: false }), id, "2026-10-01");
        expect(pendingLegalStarts({ entity: made, paid: false })).toEqual([]);
        expect(made.requirements.find(requirement => requirement.rule === "GB2")!.notes).toContain("Official source: https://www.gov.uk/");
        expect(made.expenses.find(expense => expense.rule === "GB1")).toMatchObject({ cost: "100", frequency: "One time", links: ["formation-registration-number"], date: "2026-10-01" });
        const removed = { ...made, requirements: made.requirements.filter(requirement => requirement.rule !== "GB7"), dismissedStarts: ["GB7"] };
        expect(pendingLegalStarts({ entity: removed, paid: false })).toEqual([]);
    });

    it("leave the examples as they are: Lumen holds its UK set, Quillfield, a sole proprietorship, needs none", () => {
        const entity = legalOf(lumen as Example);
        expect(pendingLegalStarts({ entity, paid: paysAnyone(capabilityOf(lumen as Example)) })).toEqual([]);
        expect(entity.requirements.map(requirement => requirement.rule).filter(Boolean)).toEqual(["GB4", "GB2", "GB3", "GB6", "GB7"]);
        expect(legalStartsFor({ entity: legalOf(quill as Example), paid: true })).toEqual([]);
    });

});
