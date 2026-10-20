import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import FinancialFoundationEditor from "./editors/FinancialFoundationEditor";
import FinancialPlanSettings from "./editors/FinancialPlanSettings";
import { asBusinessCapabilityValue } from "../../framework/engine/AnswerUtils";
import { asLegalEntityValue } from "../../framework/engine/AnswerUtils";
import { asFinancialFoundationValue, consolidateCosts, splitAtOpening, type CostLine } from "../../framework/engine/FinancialModel";
import { asGlobalSettings } from "../../framework/engine/GlobalSettings";

/* I2: the Opening Date, next to Plan Start, kept in the Global Settings; a card splits by its dates around it. */

afterEach(cleanup);

describe("the Opening Date field", () => {

    function Harness({ onDate, initial = "" }: { onDate: (iso: string) => void; initial?: string }) {
        const [date, setDate] = useState(initial);
        return (
            <FinancialPlanSettings
                value={{ ...asFinancialFoundationValue(undefined), planStart: { month: "03", year: "2027" } }}
                legalEntity={asLegalEntityValue(undefined)}
                openingDate={date}
                planStart={{ month: "03", year: "2027" }}
                onChange={() => undefined}
                onChangeOpeningDate={(next) => { setDate(next); onDate(next); }}
            />
        );
    }

    it("stands in the plan's settings (Global Settings) next to Plan Start and hands the date on", () => {
        let latest = "";
        const { container } = render(<Harness onDate={(iso) => { latest = iso; }} />);
        expect(container.textContent).toMatch(/Plan Start[\s\S]*Opening Date[\s\S]*Plan Length/);
        const box = screen.getByLabelText("Opening Date") as HTMLInputElement;
        fireEvent.change(box, { target: { value: "01/06/2027" } });
        fireEvent.blur(box);
        expect(latest).toMatch(/^2027-0[16]-0[16]$/);
    });

    it("says so when the Opening Date is before the company was formed", () => {
        const formed = { ...asLegalEntityValue(undefined), formation: { ...asLegalEntityValue(undefined).formation, status: "registered", date: "2027-03-01" } } as ReturnType<typeof asLegalEntityValue>;
        render(<FinancialPlanSettings value={asFinancialFoundationValue(undefined)} legalEntity={formed} openingDate="2027-01-15" planStart={{ month: "01", year: "2027" }} onChange={() => undefined} onChangeOpeningDate={() => undefined} />);
        expect(screen.getByText(/The Opening Date is before the company was formed/)).toBeTruthy();
    });

    it("says nothing when it is after the formation", () => {
        render(<Harness onDate={() => undefined} initial="2027-06-01" />);
        expect(screen.queryByText(/before the company was formed/)).toBeNull();
    });

    it("shows the plan's first month, worked out, with nothing to pick", () => {
        render(<Harness onDate={() => undefined} initial="2027-06-01" />);
        expect(screen.queryByLabelText("Plan Start")).toBeNull();
        expect(screen.getAllByText(/Mar\w* 2027/).length).toBeGreaterThan(0);
    });

    it("is no longer a field of the Financial Foundation page", () => {
        render(<FinancialFoundationEditor value={asFinancialFoundationValue(undefined)} onChange={() => undefined} />);
        expect(screen.queryByLabelText("Opening Date")).toBeNull();
    });

});

describe("the Opening Date in the Global Settings", () => {

    it("is kept as an ISO date, and nothing else", () => {
        expect(asGlobalSettings({ openingDate: "2027-04-01" }).openingDate).toBe("2027-04-01");
        expect(asGlobalSettings({ openingDate: "1 April" }).openingDate).toBe("");
        expect(asGlobalSettings(undefined).openingDate).toBe("");
    });

});

describe("a card split at the Opening Date (rule C1)", () => {

    const line = (fields: Partial<CostLine>): CostLine => ({
        id: "x", name: "x", origin: "infrastructure", sourceLabel: "", group: "operating", behaviour: "fixed", offeringIds: [], offeringId: "",
        amountText: "", amount: 1500, quantity: null, unitAmount: null, currency: "EUR", counted: true, frequency: "monthly", frequencyOther: "",
        sourceFrequency: "monthly", month: { month: "", year: "" }, fixedPart: null, variablePerUnit: null, asset: "", own: null, sourcePath: [],
        startDate: "2027-01-01", endDate: "", ...fields
    } as CostLine);

    it("rent of 1,500 from 3 months before the opening is 4,500 before it, and runs past it", () => {
        expect(splitAtOpening(line({}), "2027-04-01")).toEqual({ before: 4500, startsBefore: true, runsPast: true });
    });

    it("stops at the End date when that comes first", () => {
        expect(splitAtOpening(line({ endDate: "2027-02-28" }), "2027-04-01")).toEqual({ before: 3000, startsBefore: true, runsPast: false });
    });

    it("a one-time cost dated before the opening is wholly before it; one dated from it is not", () => {
        expect(splitAtOpening(line({ frequency: "one-time", amount: 800, startDate: "2027-02-10" }), "2027-04-01")).toEqual({ before: 800, startsBefore: true, runsPast: false });
        expect(splitAtOpening(line({ frequency: "one-time", amount: 800, startDate: "2027-04-01" }), "2027-04-01").before).toBe(0);
    });

    it("an annual cost counts a twelfth for each month before the opening", () => {
        expect(splitAtOpening(line({ frequency: "annually", amount: 1200 }), "2027-04-01").before).toBe(300);
    });

    it("counts nothing without an Opening Date, a Start date, or a counted amount", () => {
        expect(splitAtOpening(line({}), "").before).toBe(0);
        expect(splitAtOpening(line({ startDate: "" }), "2027-04-01").before).toBe(0);
        expect(splitAtOpening(line({ counted: false }), "2027-04-01").before).toBe(0);
        expect(splitAtOpening(line({ frequency: "per-unit" }), "2027-04-01").before).toBe(0);
    });

    it("the cost lines carry the dates of their cards", () => {
        const slot = { id: "r1", name: "Studio", status: "costs", category: "utilities", group: "premises-utilities", startDate: "2027-01-01", endDate: "2027-12-31", cost: { price: "100", frequency: "monthly", frequencyOther: "", unit: "", currency: "" } };
        const base = asBusinessCapabilityValue(undefined);
        const capability = asBusinessCapabilityValue({ ...base, resources: { utilities: [{ id: "premises-utilities", name: "", slots: [slot] }] } });
        const lines = consolidateCosts(asFinancialFoundationValue({}), { legalEntity: asLegalEntityValue({}), capability, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: false });
        const found = lines.find(entry => entry.id === "r1")!;
        expect([found.startDate, found.endDate]).toEqual(["2027-01-01", "2027-12-31"]);
    });

});
