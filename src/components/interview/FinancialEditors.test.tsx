import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import FinancialFoundationEditor from "./FinancialFoundationEditor";
import FinancialSustainabilityEditor from "./FinancialSustainabilityEditor";
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

describe("FinancialFoundationEditor income tax", () => {

    it("offers Not estimated by default, and a rate from 0 to 100 with two decimals", () => {

        let saved: unknown;
        function TaxHarness() {
            const [value, setValue] = useState<unknown>(asFinancialFoundationValue(undefined));
            return <FinancialFoundationEditor value={value} onChange={(next) => { saved = next; setValue(next); }} />;
        }

        render(<TaxHarness />);

        expect(screen.getByRole("button", { name: "Income Tax: what this means" })).toBeTruthy();
        expect(screen.queryByLabelText("Tax Rate (%)")).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Income tax: Not estimated" }));
        expect(screen.getAllByRole("option").map(option => option.textContent))
            .toEqual(["Not estimated", "No tax at business level", "Rate on profit"]);
        fireEvent.click(screen.getByRole("option", { name: "Rate on profit" }));
        expect(asFinancialFoundationValue(saved).incomeTax).toBe("rate");

        const rate = screen.getByLabelText("Tax Rate (%)") as HTMLInputElement;
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
    const loanHead = () => screen.queryAllByRole("columnheader").find(head => /Loan Repayments/.test(head.textContent ?? ""));

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
