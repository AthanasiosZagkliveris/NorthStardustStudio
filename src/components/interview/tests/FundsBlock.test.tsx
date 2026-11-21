import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, render as renderBase, screen } from "@testing-library/react";
import { openFolds } from "../../../test/openFolds.ts";
import { openTile } from "../../../test/interviewTestUtils.ts";

/** The page as it opens, its structural sections opened (every fold arrow starts closed: see openFolds). */
function render(ui: Parameters<typeof renderBase>[0], options?: Parameters<typeof renderBase>[1]) {
    const result = renderBase(ui, options);
    openFolds(result.container);
    return result;
}

import FinancialFoundationEditor from "../editors/FinancialFoundationEditor";
import { asBusinessCapabilityValue, asLegalEntityValue, createBusinessResourceSlot } from "../../../framework/engine/answers/AnswerUtils";
import { calculatedLines } from "../../../framework/engine/financial/CalculatedLines";
import { launchNeedOf } from "../../../framework/engine/financial/ContingencyFunds";
import { asFinancialFoundationValue, asFinancialSustainabilityValue, assetUnitCostsOf, consolidateCosts, financialPosition, fundingNeeds } from "../../../framework/engine/financial/FinancialModel";
import { createGlobalSettings } from "../../../framework/engine/GlobalSettings";

/* I6: the cash to raise before the opening and the Operational Contingency Fund, said by the Workbook's Funding Request (Questions 20, section 14). */

afterEach(cleanup);

const cost = (price: string, frequency: string, unit = "") => ({ price, frequency, frequencyOther: "", unit, currency: "" });
const base = asBusinessCapabilityValue(undefined);
const capability = {
    ...base,
    resources: {
        equipment: [{ id: "devices-tools", name: "", slots: [{ ...createBusinessResourceSlot(), id: "machine", name: "Loom", status: "costs", category: "equipment", group: "devices-tools", quantity: "1", startDate: "2027-02-01", cost: cost("30000", "per-unit", "item") }] }],
        utilities: [{ id: "premises-utilities", name: "", slots: [{ ...createBusinessResourceSlot(), id: "rent", name: "Rent", status: "costs", category: "utilities", group: "premises-utilities", startDate: "2027-04-01", cost: cost("4000", "monthly") }] }]
    }
};

/** The launch need and its contingency funds, as the Funding Request reads them (Questions 20, section 14). */
function launchedOf(openingDate: string) {
    const foundation = { ...asFinancialFoundationValue({}), planStart: { month: "01", year: "2027" } };
    const value = asBusinessCapabilityValue(capability);
    const lines = consolidateCosts(foundation, { legalEntity: asLegalEntityValue({}), capability: value, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: false });
    const settings = { ...createGlobalSettings(), capitalisationLimit: "500" };
    const calculated = calculatedLines({ foundation, revenuePage: asFinancialSustainabilityValue({ streams: [] }), lines, capability: value, settings, openingDate, drawings: false });
    return launchNeedOf(lines, { openingDate, capitalisationLimit: 500, assetUnitCosts: assetUnitCostsOf(value) }, settings, {}, calculated);
}

describe("the funds before and after the opening", () => {

    it("the Costs tile asks for the Opening Date while there is none", () => {
        render(
            <FinancialFoundationEditor
                value={{ ...asFinancialFoundationValue(undefined), planStart: { month: "01", year: "2027" } }}
                onChange={() => undefined}
                capability={capability}
                currency="EUR"
                openingDate=""
                globalSettings={{ ...createGlobalSettings(), capitalisationLimit: "500" }}
            />
        );
        openTile("Cost of each Offering");
        expect(screen.getByText(/Give the Opening Date, on the Organization tile/)).toBeTruthy();
    });

    it("works out the budget before the opening, the Startup Contingency and the cash to raise: 30,000 of CapEx + 10% = 33,000", () => {
        const { funds } = launchedOf("2027-04-01")!;
        expect(funds.schedule.total).toBe(30000);
        expect(funds.startupRate).toBe(10);
        expect(funds.startupFund).toBe(3000);
        expect(funds.cashToRaise).toBe(33000);
    });

    it("works out the Operational Contingency: OpEx a month, the target and the months to reach it", () => {
        const { funds } = launchedOf("2027-04-01")!;
        expect(funds.monthlyOpEx).toBe(4000);
        expect(funds.target).toBe(12000);
        expect(funds.monthsToTarget).toBe(57);
    });

});

describe("the Costs and Funding Need sections with the cost nature and the cash to raise (I7)", () => {

    function Stateful({ onValue }: { onValue?: (value: ReturnType<typeof asFinancialFoundationValue>) => void }) {
        const [value, setValue] = useState<unknown>({ ...asFinancialFoundationValue(undefined), planStart: { month: "01", year: "2027" } });
        return (
            <FinancialFoundationEditor
                value={value}
                onChange={(next) => { setValue(next); onValue?.(next); }}
                capability={capability}
                currency="EUR"
                openingDate="2027-04-01"
                globalSettings={{ ...createGlobalSettings(), capitalisationLimit: "500" }}
            />
        );
    }

    it("is read only: the three totals on top, then the cost of each Offering (Questions 20, 15.2); every cost in full is the Inventory's, and nothing is typed", () => {
        render(<Stateful />);
        openTile("Cost of each Offering");
        const costs = (document.querySelector("[data-anchor=financial-costs]") as HTMLElement).textContent ?? "";
        expect(costs).toMatch(/Launch budget/);
        expect(costs).toMatch(/Running costs a month/);
        expect(costs).toMatch(/Cost of each sale/);
        const table = document.querySelector(".financial-offering-costs") as HTMLElement;
        expect(table.textContent).toMatch(/No Revenue Stream yet/);
        // (The ledger of every cost and its filters are gone: they repeated the Inventory.)
        expect(document.querySelector(".financial-cost-filters")).toBeNull();
        expect(table.textContent).not.toMatch(/Establishment/);
        expect(document.querySelector("[data-anchor=financial-costs] input, [data-anchor=financial-costs] textarea")).toBeNull();
    });

    it("says what the Global Settings contribute: the Opening Date, the capitalisation limit and the reserves", () => {
        render(<Stateful />);
        openTile("Cost of each Offering");
        expect(document.body.textContent).toMatch(/From the Global Settings: Opening Date 2027-04-01 .* capitalisation limit 500/);
    });

    it("shows the Total Pre-operational Budget under the costs", () => {
        render(<Stateful />);
        openTile("Cost of each Offering");
        const total = document.querySelector("[data-anchor='financial-pre-operational-budget']") as HTMLElement;
        expect(total.textContent).toMatch(/Total Pre-operational Budget.*: €30,000/);
        // (Its parts in its "i", no brackets: the round of 2026-11-20 18:35 UTC+2, item 9.)
        expect(total.textContent).not.toContain("(Capital expenditure");
    });

    it("the Establishment need is the cash to raise before the opening: the 30,000 of CapEx and its 3,000 contingency, not counted again as running costs", () => {
        // (The Funding Need is a record, in the Workbook's Funding Request since 2026-11-20: Questions 20, section 14. Its figures, from the engine.)
        const { funds } = launchedOf("2027-04-01")!;
        expect(funds.schedule.capex).toBe(30000);
        expect(funds.startupFund).toBe(3000);
        expect(funds.cashToRaise).toBe(33000);
    });
});

describe("fundingNeeds and financialPosition with a launch", () => {

    it("a launch replaces the one-time costs it counts and the running months before the opening", () => {
        const foundation = { ...asFinancialFoundationValue({}), planStart: { month: "01", year: "2027" }, planYears: "1" };
        const value = asBusinessCapabilityValue(capability);
        const lines = consolidateCosts(foundation, { legalEntity: asLegalEntityValue({}), capability: value, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: false });
        const settings = { ...createGlobalSettings(), capitalisationLimit: "500" };
        const context = { openingDate: "2027-04-01", capitalisationLimit: 500, assetUnitCosts: assetUnitCostsOf(value) };
        const calculated = calculatedLines({ foundation, revenuePage: asFinancialSustainabilityValue({ streams: [] }), lines, capability: value, settings, openingDate: "2027-04-01", drawings: false });
        const launched = launchNeedOf(lines, context, settings, {}, calculated)!;
        expect(launched.launch.cashToRaise).toBe(33000);
        const plain = fundingNeeds(foundation, lines, asLegalEntityValue({}), undefined, String);
        const withLaunch = fundingNeeds(foundation, lines, asLegalEntityValue({}), undefined, String, launched.launch);
        expect(withLaunch.find(need => need.id === "establishment")!.amount).toBe(33000);
        expect(plain.find(need => need.id === "establishment")!.amount).toBe(30000);
        const position = financialPosition(foundation, lines, asLegalEntityValue({}), "EUR", String, undefined, launched.launch);
        expect(position.need).toBeGreaterThanOrEqual(33000);
    });

    it("no launch without an Opening Date after the first month", () => {
        const foundation = { ...asFinancialFoundationValue({}), planStart: { month: "01", year: "2027" } };
        const value = asBusinessCapabilityValue(capability);
        const lines = consolidateCosts(foundation, { legalEntity: asLegalEntityValue({}), capability: value, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: false });
        const settings = createGlobalSettings();
        const calculated = calculatedLines({ foundation, revenuePage: asFinancialSustainabilityValue({ streams: [] }), lines, capability: value, settings, openingDate: "", drawings: false });
        expect(launchNeedOf(lines, { openingDate: "", capitalisationLimit: null }, settings, {}, calculated)).toBeUndefined();
    });

});


describe("Cost of each Offering, with an Offering sold (Questions 20, 15.2)", () => {

    it("draws a card for each Offering: its price, direct cost, contribution, full cost with its running share, and margin", async () => {
        const { default: lumen } = await import("../../../data/examples/lumen-and-loom-studio.json");
        const business = (lumen as unknown as { systems: Record<string, { responses: { sectionNumber: number; value: unknown }[] }> }).systems["3"].responses;
        const valueOf = (section: number) => business.find(response => response.sectionNumber === section)?.value;
        render(
            <FinancialFoundationEditor
                value={valueOf(5)}
                onChange={() => undefined}
                foundation={valueOf(1)}
                engagement={valueOf(2)}
                capability={valueOf(3)}
                sustainability={valueOf(4)}
                currency="GBP"
                openingDate="2025-04-01"
            />
        );
        openTile("Cost of each Offering");
        const cards = [...document.querySelectorAll<HTMLElement>(".financial-offering-cost")];
        expect(cards.map(card => card.querySelector(".financial-total")?.textContent)).toEqual(["Homeware Collection", "Weaving Workshops", "Bespoke Commissions", "Trade Collection"]);
        const labels = [...cards[0].querySelectorAll(".financial-tile-label")].map(label => (label.textContent ?? "").replace(/i$/, ""));
        expect(labels).toEqual(["Price", "Direct cost", "Contribution", "Full cost", "Margin"]);
        expect(cards[0].textContent).toMatch(/Running costs £/);
        expect(document.querySelector("[data-anchor=financial-offering-rate]")?.textContent).toMatch(/a delivery hour/);
    });

});
