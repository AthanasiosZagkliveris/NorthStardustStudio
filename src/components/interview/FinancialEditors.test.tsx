import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import FinancialFoundationEditor from "./FinancialFoundationEditor";
import FinancialSustainabilityEditor from "./FinancialSustainabilityEditor";
import { asFinancialFoundationValue, asFinancialSustainabilityValue, createFundingSource } from "../../framework/engine/FinancialModel";

function Harness({ initial }: { initial: unknown }) {
    const [value, setValue] = useState<unknown>(initial);
    return <FinancialFoundationEditor value={value} onChange={setValue} />;
}

const toggles = (pattern: RegExp) =>
    screen.getAllByRole("button", { name: pattern }).filter(b => b.classList.contains("strategy-box-toggle"));

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
