import { describe, expect, test } from "vitest";

import { currencyMark, labelWithCurrency, nameWithCurrency } from "./Currencies.ts";

describe("a fixed currency in a label", () => {

    test("is its symbol where that says which currency it is, else its code", () => {
        expect(currencyMark("GBP")).toBe("£");
        expect(currencyMark("USD")).toBe("$");
        expect(currencyMark("EUR")).toBe("€");
        expect(currencyMark("CAD")).toBe("CA$");
        expect(currencyMark("CHF")).toBe("CHF");
    });

    test("follows the label, and the accessible name keeps the code", () => {
        expect(labelWithCurrency("Price", "GBP")).toBe("Price (£)");
        expect(labelWithCurrency("Capital", "USD")).toBe("Capital ($)");
        expect(labelWithCurrency("Price", "CHF")).toBe("Price (CHF)");
        expect(labelWithCurrency("Price", "")).toBe("Price");
        expect(nameWithCurrency("Stream 1 price", "GBP")).toBe("Stream 1 price (GBP)");
    });

});
