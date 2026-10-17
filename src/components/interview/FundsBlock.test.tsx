import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, render as renderBase, screen } from "@testing-library/react";
import { openFolds } from "../../test/openFolds.ts";

/** The page as it opens, its structural sections opened (every fold arrow starts closed: see openFolds). */
function render(ui: Parameters<typeof renderBase>[0], options?: Parameters<typeof renderBase>[1]) {
    const result = renderBase(ui, options);
    openFolds(result.container);
    return result;
}

import FinancialFoundationEditor from "./FinancialFoundationEditor";
import { asBusinessCapabilityValue, asLegalEntityValue, createBusinessResourceSlot } from "../../framework/engine/AnswerUtils";
import { calculatedLines } from "../../framework/engine/CalculatedLines";
import { launchNeedOf } from "../../framework/engine/ContingencyFunds";
import { asFinancialFoundationValue, asFinancialSustainabilityValue, assetUnitCostsOf, consolidateCosts, financialPosition, fundingNeeds } from "../../framework/engine/FinancialModel";
import { createGlobalSettings } from "../../framework/engine/GlobalSettings";

/* I6: Funding Need shows the cash to raise before the opening and the Operational Contingency Fund. */

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

function show(openingDate: string) {
    render(
        <FinancialFoundationEditor
            value={{ ...asFinancialFoundationValue(undefined), planStart: { month: "01", year: "2027" } }}
            onChange={() => undefined}
            capability={capability}
            currency="EUR"
            openingDate={openingDate}
            globalSettings={{ ...createGlobalSettings(), capitalisationLimit: "500" }}
        />
    );
}

describe("the funds under Funding Need", () => {

    it("asks for the Opening Date while there is none", () => {
        show("");
        expect(screen.getByText(/Give the Opening Date, next to Plan Start/)).toBeTruthy();
        expect(document.querySelector("[data-anchor='financial-funds']")).toBeNull();
    });

    it("shows the budget before the opening, the Startup Contingency and the cash to raise: 30,000 of CapEx + 10% = 33,000", () => {
        show("2027-04-01");
        const funds = document.querySelector("[data-anchor='financial-funds']") as HTMLElement;
        expect(funds).toBeTruthy();
        const text = funds.textContent ?? "";
        expect(text).toMatch(/Cash to raise before the opening/);
        expect(text).toMatch(/Capital Expenditure.*30,000/);
        expect(text).toMatch(/Startup Contingency Fund \(10%\).*3,000/);
        expect(text).toMatch(/33,000/);
    });

    it("shows the Operational Contingency: OpEx a month, the target and the months to reach it", () => {
        show("2027-04-01");
        const text = (document.querySelector("[data-anchor='financial-funds']") as HTMLElement).textContent ?? "";
        expect(text).toMatch(/OpEx a month.*4,000/);
        expect(text).toMatch(/12,000/);
        expect(text).toMatch(/Months to reach the target.*57/);
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

    it("is a read-only table: the three totals on top, then a line for each cost under its heading, with its group, its amount and its nature, and nothing to type", () => {
        render(<Stateful />);
        const costs = (document.querySelector("[data-anchor=financial-costs]") as HTMLElement).textContent ?? "";
        expect(costs).toMatch(/Launch budget/);
        expect(costs).toMatch(/Running costs a month/);
        expect(costs).toMatch(/Cost of each sale/);
        const table = document.querySelector(".financial-costs-ledger") as HTMLElement;
        expect(table).toBeTruthy();
        expect(table.textContent).toMatch(/Establishment/);
        expect(table.textContent).toMatch(/30,000/);
        expect(screen.queryByLabelText(/cost nature/i)).toBeNull();
    });

    it("says what the Global Settings contribute: the Opening Date, the capitalisation limit and the reserves", () => {
        render(<Stateful />);
        expect(document.body.textContent).toMatch(/From the Global Settings: Opening Date 2027-04-01 .* capitalisation limit 500/);
    });

    it("shows the Total Pre-operational Budget under the costs", () => {
        render(<Stateful />);
        const total = document.querySelector("[data-anchor='financial-pre-operational-budget']") as HTMLElement;
        expect(total.textContent).toMatch(/Total Pre-operational Budget:.*30,000/);
    });

    it("the Establishment need is the cash to raise before the opening: the 30,000 of CapEx and its 3,000 contingency, not counted again as running costs", () => {
        render(<Stateful />);
        const establishment = [...document.querySelectorAll(".financial-need-card")].find(card => card.textContent?.includes("Establishment")) as HTMLElement;
        expect(establishment).toBeTruthy();
        expect(establishment.textContent).toMatch(/33,000/);
        expect(establishment.textContent).toMatch(/Startup Contingency Fund \(10%\)/);
        expect(establishment.textContent).toMatch(/Before Apr 2027/);
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

