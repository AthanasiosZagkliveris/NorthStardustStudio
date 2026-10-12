import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import FinancialFoundationEditor from "./FinancialFoundationEditor";
import FinancialSustainabilityEditor from "./FinancialSustainabilityEditor";
import FinancialPlanSettings from "./FinancialPlanSettings";
import { asLegalEntityValue } from "../../framework/engine/AnswerUtils";
import { toggles, typeInto } from "../../test/interviewTestUtils";
import { asFinancialFoundationValue, asFinancialSustainabilityValue, createFundingSource } from "../../framework/engine/FinancialModel";

function Harness({ initial }: { initial: unknown }) {
    const [value, setValue] = useState<unknown>(initial);
    return <FinancialFoundationEditor value={value} onChange={setValue} />;
}


afterEach(cleanup);

describe("FinancialFoundationEditor folding", () => {

    it("starts funding sources collapsed and opens a new one", () => {

        const initial = {
            ...asFinancialFoundationValue(undefined),
            funding: [createFundingSource("internal"), createFundingSource("internal")]
        };

        render(<Harness initial={initial} />);

        toggles(/Source \d+$/).forEach(t => expect(t.getAttribute("aria-expanded")).toBe("false"));

        fireEvent.click(screen.getAllByRole("button", { name: /\+ Add/ }).find(b => /source/i.test(b.textContent ?? ""))!);

        const sources = toggles(/Source \d+$/);
        expect(sources[sources.length - 1].getAttribute("aria-expanded")).toBe("true");

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

    it("starts revenue streams collapsed", () => {

        render(
            <FinancialSustainabilityEditor
                value={asFinancialSustainabilityValue(undefined)}
                foundation={foundation}
                onChange={() => {}}
            />
        );

        const streams = toggles(/Revenue Stream \d+$/);
        expect(streams.length).toBe(2);
        streams.forEach(t => expect(t.getAttribute("aria-expanded")).toBe("false"));

    });

    it("shows the frequency's label in a folded stream's summary, not its raw id", () => {

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

        expect(screen.getByText(/1\D?200 \/ Client · Monthly/)).toBeTruthy();
        expect(screen.queryByText(/· monthly$/)).toBeNull();

    });

    it("formats a folded stream's price as money and drops an empty unit", () => {

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

        expect(screen.getByText("£1,200 / Client · Monthly")).toBeTruthy();
        expect(screen.getByText("£80 · Monthly")).toBeTruthy();

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

        const card = toggles(/Source 1$/)[0];
        if (card.getAttribute("aria-expanded") === "false") {
            fireEvent.click(card);
        }

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

        fireEvent.click(toggles(/Revenue Stream 1$/)[0]);

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
                    openingDate=""
                    planStart={{ month: "10", year: "2026" }}
                    onChange={(next) => { saved = next; setValue(next); }}
                    onChangeOpeningDate={() => undefined}
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
        expect(loanHead()).toBeDefined();
        expect(screen.getByRole("button", { name: "Loan Repayments: what this means" })).toBeTruthy();
    });

    it("is not there when no loan is recorded", () => {
        render(<Harness initial={withFunding([{ ...createFundingSource("external"), type: "grant", amount: "5000", status: "received" }])} />);
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
        const { container } = render(
            <FinancialSustainabilityEditor
                value={asFinancialSustainabilityValue({ streams: [{ offeringId: "offering-1", paymentTiming }] })}
                foundation={foundation}
                capability={withOrders ? capability : undefined}
                onChange={() => {}}
            />
        );
        fireEvent.click(toggles(/Revenue Stream 1$/)[0]);
        return container.querySelector(".financial-stream-band")!;
    }

    it("sit side by side on one band while payment takes two fields", () => {
        const element = band("");
        expect(element.classList.contains("financial-stream-band-paired")).toBe(true);
        const heads = [...element.querySelectorAll(".financial-stream-subhead")].map(head => head.textContent ?? "");
        expect(heads.length).toBe(2);
        expect(heads[0].startsWith("Begins and Payment")).toBe(true);
        expect(heads[1].startsWith("Orders & Delivery")).toBe(true);
        // The group says why it is asked; its fields what they ask.
        for (const name of ["Orders & Delivery", "Items per Order", "Delivery Charge"]) {
            expect(screen.queryAllByRole("button", { name: new RegExp("^" + name.replace(/[()£]/g, ".") + ".*: what this means$") }).length).toBeGreaterThan(0);
        }
    });

    it("stack when payment needs more fields, or there are no orders to ask about", () => {
        expect(band("split").classList.contains("financial-stream-band-paired")).toBe(false);
        cleanup();
        const alone = band("", false);
        expect(alone.classList.contains("financial-stream-band-paired")).toBe(false);
        expect(alone.querySelectorAll(".financial-stream-group").length).toBe(1);
    });

});
