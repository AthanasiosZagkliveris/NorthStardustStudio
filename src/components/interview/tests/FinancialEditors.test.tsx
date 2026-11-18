import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render as renderBase, screen } from "@testing-library/react";
import { openFolds } from "../../../test/openFolds.ts";

/** The page as it opens, its structural sections opened (every fold arrow starts closed: see openFolds). */
function render(ui: Parameters<typeof renderBase>[0], options?: Parameters<typeof renderBase>[1]) {
    const result = renderBase(ui, options);
    openFolds(result.container);
    return result;
}

import FinancialFoundationEditor from "../editors/FinancialFoundationEditor";
import FinancialSustainabilityEditor from "../editors/FinancialSustainabilityEditor";
import FinancialPlanSettings from "../editors/FinancialPlanSettings";
import { asLegalEntityValue } from "../../../framework/engine/AnswerUtils";
import { openTile, typeInto } from "../../../test/interviewTestUtils";

/** A revenue stream's card, opened from its tile in the Revenue Streams dialog (owner, 2026-11-18 10:38: the streams are tiles). */
function openStream(number: number) {
    const tiles = [...document.querySelectorAll<HTMLElement>(".section-tile-overlay [aria-label='Revenue Streams'] button.card-tile")];
    fireEvent.click(tiles[number - 1]);
}
/** The words of the stream tiles. */
const streamTiles = () => [...document.querySelectorAll<HTMLElement>(".section-tile-overlay [aria-label='Revenue Streams'] button.card-tile")].map(tile => tile.textContent ?? "");
import { asFinancialFoundationValue, asFinancialSustainabilityValue, createFundingSource } from "../../../framework/engine/FinancialModel";

function Harness({ initial }: { initial: unknown }) {
    const [value, setValue] = useState<unknown>(initial);
    return <FinancialFoundationEditor value={value} onChange={setValue} />;
}


afterEach(cleanup);

describe("FinancialFoundationEditor folding", () => {

    it("draws each funding source as a tile whose card opens from it (owner, 2026-11-18 12:41: \"make the Funding Sources into tiles\")", () => {

        const initial = {
            ...asFinancialFoundationValue(undefined),
            funding: [{ ...createFundingSource("internal"), name: "Savings" }, { ...createFundingSource("internal"), name: "Reinvested" }]
        };

        render(<Harness initial={initial} />);
        openTile("Capital & Funding");

        const tiles = [...document.querySelectorAll<HTMLElement>(".section-tile-overlay [aria-label='Internal funding sources'] button.card-tile")];
        expect(tiles.map(tile => tile.textContent ?? "").map(text => text.includes("Savings") || text.includes("Reinvested"))).toEqual([true, true]);
        fireEvent.click(tiles[0]);
        expect(screen.getByLabelText("Savings amount")).toBeTruthy();

    });

});

describe("FinancialSustainabilityEditor folding", () => {

    // One Offering per stream, no add button on this page: streams
    // are derived from the Foundation page's Offerings, so folding
    // is only meaningful as "do they start closed", not "does
    // adding one open it".
    const foundation = {
        segments: [{
            offerings: [
                { id: "offering-1", name: "Offering One" },
                { id: "offering-2", name: "Offering Two" }
            ]
        }]
    };

    it("draws each revenue stream as a tile whose card opens from it", () => {

        render(
            <FinancialSustainabilityEditor
                value={asFinancialSustainabilityValue(undefined)}
                foundation={foundation}
                onChange={() => {}}
            />
        );
        openTile("Revenue Streams");

        expect(streamTiles().length).toBe(2);
        openStream(1);
        expect(screen.getByLabelText(/Revenue Stream 1 price/)).toBeTruthy();

    });

    it("shows the frequency's label on a stream's tile, not its raw id", () => {

        const value = asFinancialSustainabilityValue({
            streams: [
                { offeringId: "offering-1", price: "1200", unit: "Client", frequency: "monthly" }
            ]
        });

        render(
            <FinancialSustainabilityEditor
                value={value}
                foundation={foundation}
                onChange={() => {}}
            />
        );
        openTile("Revenue Streams");

        expect(streamTiles()[0]).toMatch(/1\D?200 \/ Client/);
        expect(streamTiles()[0]).toContain("Monthly");
        expect(streamTiles()[0]).not.toMatch(/monthly/);

    });

    it("formats a stream tile's price as money and drops an empty unit", () => {

        const value = asFinancialSustainabilityValue({
            streams: [
                { offeringId: "offering-1", price: "1200", unit: "Client", frequency: "monthly" },
                { offeringId: "offering-2", price: "80", unit: "", frequency: "monthly" }
            ]
        });

        render(
            <FinancialSustainabilityEditor
                value={value}
                foundation={foundation}
                currency="GBP"
                onChange={() => {}}
            />
        );
        openTile("Revenue Streams");

        expect(streamTiles()[0]).toContain("£1,200 / Client");
        expect(streamTiles()[1]).toContain("£80");
        expect(streamTiles()[1]).not.toContain("/");

    });

});

/** Types into a box one keystroke at a time. */

describe("FinancialFoundationEditor number limits", () => {

    it("refuses an interest rate over 100%, a minus sign and more than 600 payments", () => {

        const initial = {
            ...asFinancialFoundationValue(undefined),
            funding: [{ ...createFundingSource("external"), type: "bank-loan" }]
        };

        render(<Harness initial={initial} />);
        openTile("Capital & Funding");

        // (The source's card floats from its tile: owner, 2026-11-18 12:41.)
        fireEvent.click(document.querySelector<HTMLElement>(".section-tile-overlay [aria-label='External funding sources'] button.card-tile")!);

        const rate = screen.getByLabelText("Bank Loan interest rate") as HTMLInputElement;
        typeInto(rate, "150");
        expect(rate.value).toBe("15");

        const amount = screen.getByLabelText("Bank Loan amount") as HTMLInputElement;
        typeInto(amount, "-5");
        expect(amount.value).toBe("");

        const payments = screen.getByLabelText("Bank Loan number of payments") as HTMLInputElement;
        typeInto(payments, "6001");
        expect(payments.value).toBe("600");

    });

});

describe("FinancialSustainabilityEditor number limits", () => {

    it("refuses an Upfront share over 100% and letters in a price", () => {

        function StreamHarness() {
            const [value, setValue] = useState<unknown>(asFinancialSustainabilityValue({
                streams: [{ offeringId: "offering-1", paymentTiming: "split" }]
            }));
            return (
                <FinancialSustainabilityEditor
                    value={value}
                    foundation={{ segments: [{ offerings: [{ id: "offering-1", name: "Offering One" }] }] }}
                    onChange={setValue}
                />
            );
        }

        render(<StreamHarness />);
        openTile("Revenue Streams");

        openStream(1);

        const upfront = screen.getByLabelText(/percent paid at start$/) as HTMLInputElement;
        typeInto(upfront, "101");
        expect(upfront.value).toBe("10");

        const price = screen.getByLabelText(/ price$/) as HTMLInputElement;
        typeInto(price, "30x");
        expect(price.value).toBe("30");

    });

});

describe("the plan's income tax setting (Global Settings)", () => {

    it("asks for a basis, with none chosen at first, and a rate from 0 to 100 with two decimals", () => {

        let saved: unknown;
        function TaxHarness() {
            const [value, setValue] = useState<unknown>(asFinancialFoundationValue(undefined));
            return (
                <FinancialPlanSettings
                    value={asFinancialFoundationValue(value)}
                    legalEntity={asLegalEntityValue(undefined)}
                    planStart={{ month: "10", year: "2026" }}
                    onChange={(next) => { saved = next; setValue(next); }}
                />
            );
        }

        render(<TaxHarness />);

        expect(screen.getByRole("button", { name: "Income Tax: what this means" })).toBeTruthy();
        expect(screen.queryByLabelText("Tax rate (%)")).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Income tax: Select" }));
        expect(screen.getAllByRole("option").map(option => option.textContent))
            .toEqual(["No tax at business level", "Rate on profit"]);
        fireEvent.click(screen.getByRole("option", { name: "Rate on profit" }));
        expect(asFinancialFoundationValue(saved).incomeTax).toBe("rate");

        const rate = screen.getByLabelText("Tax rate (%)") as HTMLInputElement;
        // The keystroke that would take it past 100 is refused.
        typeInto(rate, "120");
        expect(rate.value).toBe("12");
        typeInto(rate, "21.125");
        expect(rate.value).toBe("21.12");
        expect(asFinancialFoundationValue(saved).incomeTaxRate).toBe("21.12");

    });

});

describe("the Operating need's Loan Repayments column", () => {

    const withFunding = (funding: unknown[]) => ({ ...asFinancialFoundationValue(undefined), funding });
    const loanHead = () => screen.queryAllByRole("columnheader", { name: "Loan repayments" })[0];

    it("is there, with its i, when a loan is recorded, whatever its status", () => {
        render(<Harness initial={withFunding([{ ...createFundingSource("external"), type: "bank-loan", name: "Start Up Loan", amount: "9000", status: "requested" }])} />);
        openTile("Financial Position"); // (The Funding Need is inside Financial Position: owner, 2026-11-18 16:55.)
        expect(loanHead()).toBeDefined();
        expect(screen.getByRole("button", { name: "Loan Repayments: what this means" })).toBeTruthy();
    });

    it("is not there when no loan is recorded", () => {
        render(<Harness initial={withFunding([{ ...createFundingSource("external"), type: "grant", amount: "5000", status: "received" }])} />);
        openTile("Financial Position"); // (The Funding Need is inside Financial Position: owner, 2026-11-18 16:55.)
        expect(screen.queryAllByRole("columnheader").some(head => /Running Costs/.test(head.textContent ?? ""))).toBe(true);
        expect(loanHead()).toBeUndefined();
    });
});

describe("a revenue stream's Begins and Payment and Orders & Delivery", () => {

    // A courier at 6 a delivery: a cost per order, so the stream asks about orders.
    const capability = {
        offering: { professionals: [], providers: [{ id: "courier", name: "Courier", offeringId: "offering-1", startDate: "2026-10-01",
            cost: { price: "6", frequency: "per-order", frequencyOther: "", currency: "" } }], resources: [], activities: [] }
    };
    const foundation = { segments: [{ offerings: [{ id: "offering-1", name: "Offering One" }] }] };

    function band(paymentTiming: string, withOrders = true) {
        render(
            <FinancialSustainabilityEditor
                value={asFinancialSustainabilityValue({ streams: [{ offeringId: "offering-1", paymentTiming }] })}
                foundation={foundation}
                capability={withOrders ? capability : undefined}
                onChange={() => {}}
            />
        );
        // (The stream cards are in the Revenue Streams tile's dialog.)
        openTile("Revenue Streams");
        openStream(1);
        return document.querySelector(".financial-stream-floating")!;
    }
    /** The titles of the floating card's boxes, in order (owner, 2026-11-18 10:38: its groups as Customer Engagement's boxes of bands). */
    const boxTitles = (card: Element) => [...card.querySelectorAll(".business-segment-box > .legal-entity-org-section:first-child [role='heading']")].map(head => head.textContent ?? "");

    it("stand as boxes of the shared bands, Begins and Payment then Orders & Delivery", () => {
        const heads = boxTitles(band(""));
        expect(heads[0].startsWith("Price")).toBe(true);
        expect(heads.findIndex(head => head.startsWith("Begins and Payment"))).toBeGreaterThan(0);
        expect(heads.findIndex(head => head.startsWith("Begins and Payment"))).toBeLessThan(heads.findIndex(head => head.startsWith("Orders & Delivery")));
        // The group says why it is asked; its fields what they ask.
        for (const name of ["Orders & Delivery", "Items per Order", "Delivery Charge"]) {
            expect(screen.queryAllByRole("button", { name: new RegExp("^" + name.replace(/[()£]/g, ".") + ".*: what this means$") }).length).toBeGreaterThan(0);
        }
    });

    it("ask about orders only where the Offering has a cost per order", () => {
        expect(boxTitles(band("split")).some(head => head.startsWith("Orders & Delivery"))).toBe(true);
        cleanup();
        expect(boxTitles(band("", false)).some(head => head.startsWith("Orders & Delivery"))).toBe(false);
    });

});

describe("FinancialSustainabilityEditor starts from Page 1 (phase 5f, 2026-11-09)", () => {

    const foundation = {
        segments: [{
            id: "s",
            name: "Firms",
            offerings: [
                { id: "offering-1", name: "Build", category: "Service", questions: { o3: ["project"], o3t: ["deposit"] } },
                { id: "offering-2", name: "Care", category: "Service", questions: { o3: ["licence"], o3t: ["before"] } }
            ]
        }]
    };

    it("starts Charged from O3, and shows Customer Pays as the record of O3's second row (When do they pay?)", () => {
        render(<FinancialSustainabilityEditor value={asFinancialSustainabilityValue(undefined)} foundation={foundation} onChange={() => {}} />);
        openTile("Revenue Streams");
        openStream(1);
        expect(screen.getByRole("button", { name: "Revenue Stream 1 charged: Per project" })).toBeTruthy();
        // (WHEN THEY PAY HAS ONE OWNER, the Offering's O3t: one option, a record, read only; owner, 2026-11-16.)
        const timing = (stream: number, words: string) => screen.getByRole("textbox", { name: "Revenue Stream " + stream + " payment timing: " + words });
        expect(timing(1, "Split").getAttribute("aria-readonly")).toBe("true");
        openStream(2);
        expect(screen.getByRole("button", { name: "Revenue Stream 2 charged: Annually" })).toBeTruthy();
        expect(timing(2, "Upfront").getAttribute("aria-readonly")).toBe("true");
    });

    it("keeps the page's own stream over the starts, and saves the starts with the first thing written", () => {
        let saved: unknown;
        const value = asFinancialSustainabilityValue({ streams: [{ id: "stream-offering-1", offeringId: "offering-1", frequency: "per-sale", paymentTiming: "" }] });
        render(<FinancialSustainabilityEditor value={value} foundation={foundation} onChange={(next) => { saved = next; }} />);
        openTile("Revenue Streams");
        openStream(1);
        expect(screen.getByRole("button", { name: "Revenue Stream 1 charged: Per sale" })).toBeTruthy();
        // (The page's own timing gives way to O3t's record: the Offering is paid by a deposit, so Split.)
        expect(screen.getByRole("textbox", { name: "Revenue Stream 1 payment timing: Split" }).getAttribute("aria-readonly")).toBe("true");
        openStream(2);
        fireEvent.change(screen.getByLabelText("Revenue Stream 2 price"), { target: { value: "90" } });
        expect(asFinancialSustainabilityValue(saved).streams.find(stream => stream.offeringId === "offering-2")).toMatchObject({ frequency: "annually", paymentTiming: "upfront", price: "90" });
    });

});

/* THE FINANCIAL PAGES' CHAPTERS (doc 48, sections 1, 2 and 11; owner, 2026-11-17 07:36): Revenue & Pricing holds the Revenue chapter; Costs, Funding & Position
   holds Financial Foundation and, beside it, Break Even. */
describe("the Financial pages' chapters", () => {

    it("draws Revenue & Pricing as the Revenue chapter alone", () => {
        render(<FinancialSustainabilityEditor value={asFinancialSustainabilityValue(undefined)} onChange={() => {}} />);
        const tiles = screen.getAllByRole("button").map(button => button.textContent ?? "");
        expect(tiles.some(text => text.startsWith("Revenue Streams"))).toBe(true);
        // (One card: the Revenue Summary and the Delivery Check in the Revenue Streams dialog; owner, 2026-11-18 10:38.)
        expect(tiles.some(text => text.startsWith("Revenue Summary"))).toBe(false);
        expect(tiles.some(text => text.startsWith("Break-Even Point"))).toBe(false);
    });

    it("draws Costs, Funding & Position with Break Even beside Financial Foundation, writing nothing to the revenue", () => {
        let wrote = false;
        render(
            <FinancialFoundationEditor
                value={asFinancialFoundationValue(undefined)}
                onChange={() => {}}
                beside={<FinancialSustainabilityEditor part="break-even" value={asFinancialSustainabilityValue(undefined)} onChange={() => { wrote = true; }} disabled />}
            />
        );
        const tiles = screen.getAllByRole("button").map(button => button.textContent ?? "");
        for (const title of ["Costs", "Financial Position", "Break-Even", "Sustainability"]) {
            expect(tiles.some(text => text.startsWith(title))).toBe(true);
        }
        // (Break-Even Point and Time one tile, Sustainability and the Stress Test one tile: owner, 2026-11-18 16:55, "Do all 8".)
        for (const title of ["Break-Even Point", "Break-Even Time", "Stress Test"]) {
            expect(tiles.some(text => text.startsWith(title))).toBe(false);
        }
        openTile("Break-Even");
        expect(screen.getByRole("heading", { name: "Break-Even Time" })).toBeTruthy();
        expect(wrote).toBe(false);
    });

});
