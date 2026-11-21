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
import { asLegalEntityValue } from "../../../framework/engine/answers/AnswerUtils";
import { openTile, typeInto } from "../../../test/interviewTestUtils";

/** A revenue stream's card, opened from its tile in the Revenue Streams dialog (owner, 2026-11-18 10:38: the streams are tiles). */
function openStream(number: number) {
    const tiles = [...document.querySelectorAll<HTMLElement>(".section-tile-overlay [aria-label='Revenue Streams'] button.card-tile")];
    fireEvent.click(tiles[number - 1]);
}
/** The words of the stream tiles. */
const streamTiles = () => [...document.querySelectorAll<HTMLElement>(".section-tile-overlay [aria-label='Revenue Streams'] button.card-tile")].map(tile => tile.textContent ?? "");
import { asFinancialFoundationValue, asFinancialSustainabilityValue, createFundingSource } from "../../../framework/engine/financial/FinancialModel";

function Harness({ initial }: { initial: unknown }) {
    const [value, setValue] = useState<unknown>(initial);
    return <FinancialFoundationEditor value={value} onChange={setValue} />;
}


afterEach(cleanup);

describe("FinancialFoundationEditor folding", () => {

    it("draws each funding source as a tile whose card opens from it (owner, 2026-11-18 12:41: \"make the Funding Sources into tiles\")", () => {

        const initial = {
            ...asFinancialFoundationValue(undefined),
            // (Internal is removed, 2026-11-20: a source saved under it is read under Other, its figures kept; Questions 20, section 14.)
            funding: [{ ...createFundingSource("other"), category: "internal" as unknown as "other", name: "Savings" }, { ...createFundingSource("other"), name: "Reinvested" }]
        };

        render(<Harness initial={initial} />);
        openTile("Funding");

        const tiles = [...document.querySelectorAll<HTMLElement>(".section-tile-overlay [aria-label='Other funding sources'] button.card-tile")];
        expect(tiles.map(tile => tile.textContent ?? "").map(text => text.includes("Savings") || text.includes("Reinvested"))).toEqual([true, true]);
        fireEvent.click(tiles[0]);
        expect(screen.getByLabelText("Savings amount")).toBeTruthy();
        expect(document.querySelector("[aria-label='Internal funding sources']")).toBeNull();

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
        openTile("Funding");

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

describe("a revenue stream's Begins & Payment and Orders & Delivery", () => {

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

    it("stand as boxes of the shared bands, Begins & Payment then Orders & Delivery", () => {
        const heads = boxTitles(band(""));
        expect(heads[0].startsWith("Price")).toBe(true);
        expect(heads.findIndex(head => head.startsWith("Begins & Payment"))).toBeGreaterThan(0);
        expect(heads.findIndex(head => head.startsWith("Begins & Payment"))).toBeLessThan(heads.findIndex(head => head.startsWith("Orders & Delivery")));
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

/* FINANCIALS' ONE CHAPTER, FINANCIAL FOUNDATION (PageGroups.ts, oneChapter; Questions 20, sections 11 and 14): Revenue & Pricing draws Revenue Streams, Costs, Funding & Position its
   Costs and Funding; each editor alone (outside the page) titles its frame "Financial Foundation" too. */
describe("Financials' chapters", () => {

    it("draws Revenue & Pricing as Financial Foundation, writing nothing until a field is changed", () => {
        let wrote = false;
        render(<FinancialSustainabilityEditor value={asFinancialSustainabilityValue(undefined)} onChange={() => { wrote = true; }} />);
        expect(screen.getByText("Financial Foundation")).toBeTruthy();
        const tiles = screen.getAllByRole("button").map(button => (button.textContent ?? "").replace(/\s+/g, " "));
        // (Break-Even & Sustainability is a record, in the Workbook's Financial Plan since the round of 2026-11-20 18:35 UTC+2: Questions 20, section 14.)
        for (const title of ["Revenue Streams"]) {
            expect(tiles.some(text => text.startsWith(title))).toBe(true);
        }
        // (One card: the Revenue Summary and the Delivery Check in the Revenue Streams dialog; owner, 2026-11-18 10:38. Break-Even Point and Time one tile,
        // Sustainability and the Stress Test one tile: owner, 2026-11-18 16:55, "Do all 8".)
        for (const title of ["Revenue Summary", "Break-Even & Sustainability", "Break-Even Point", "Break-Even Time", "Stress Test", "Cash Flow"]) {
            expect(tiles.some(text => text.startsWith(title))).toBe(false);
        }
        expect(wrote).toBe(false);
    });

    it("draws Costs, Funding & Position as Financial Foundation alone", () => {
        render(<FinancialFoundationEditor value={asFinancialFoundationValue(undefined)} onChange={() => {}} />);
        expect(screen.getByText("Financial Foundation")).toBeTruthy();
        const tiles = screen.getAllByRole("button").map(button => (button.textContent ?? "").replace(/\s+/g, " "));
        // (Capital & Funding and Financial Position, one tile, Funding, since 2026-11-20: Questions 20, section 13, step 3.)
        for (const title of ["Cost of each Offering", "Funding"]) {
            expect(tiles.some(text => text.startsWith(title))).toBe(true);
        }
        for (const title of ["Financial Position", "Capital & Funding", "Break-Even", "Sustainability", "Revenue Streams"]) {
            expect(tiles.some(text => text.startsWith(title))).toBe(false);
        }
    });

});

/* THE REVENUE CARD, 2026-11-20 (owner, 12:49 UTC+2: "proceed to changes"; Questions 20, sections 8 and 12.2): the competitors' range under the price, Volume from
   Each Month folded under Sales Volume, and the one click that charges a stream as its customers buy. */
describe("a revenue stream's card, 2026-11-20", () => {

    const foundation = {
        segments: [{
            offerings: [{ id: "offering-1", name: "Offering One" }],
            competitors: [{ id: "c1", name: "Rival", type: "direct", questions: { k15: ["40", "90"] } }]
        }]
    };

    function card(stream: Record<string, unknown>, engagement?: unknown, onChange: (next: unknown) => void = () => {}) {
        render(
            <FinancialSustainabilityEditor
                value={asFinancialSustainabilityValue({ streams: [{ offeringId: "offering-1", ...stream }] })}
                foundation={foundation}
                engagement={engagement}
                onChange={onChange}
            />
        );
        openTile("Revenue Streams");
        openStream(1);
        return document.querySelector(".financial-stream-floating")!;
    }

    it("says what the competitors charge under the price, writing nothing into it", () => {
        const shown = card({ price: "" });
        expect(shown.textContent).toContain("Your competitors charge about");
        expect(shown.textContent).toMatch(/40.*to.*90/);
    });

    it("folds Volume from Each Month, open while it holds no month, with its count", () => {
        const empty = card({ development: "detailed", detailed: [] });
        expect(empty.querySelector(".financial-schedule")).not.toBeNull();
        cleanup();
        const listed = card({ development: "detailed", detailed: [{ id: "d1", month: "", volume: "4" }] });
        expect(listed.querySelector(".financial-schedule")).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: /Maximise Volume from Each Month/ }));
        expect(document.querySelector(".financial-stream-floating .financial-schedule")).not.toBeNull();
    });

    it("charges a stream as its customers buy, in one click", () => {
        let saved: unknown = null;
        const engagement = { demand: { "offering-1": { recurring: true, sources: [{ id: "s1", kind: "visitors", volume: "100", rate: "10" }] } } };
        card({ frequency: "per-sale" }, engagement, next => { saved = next; });
        const fix = screen.getByRole("button", { name: "Charge it monthly" });
        fireEvent.click(fix);
        expect(JSON.stringify(saved)).toContain("\"frequency\":\"monthly\"");
    });

});
