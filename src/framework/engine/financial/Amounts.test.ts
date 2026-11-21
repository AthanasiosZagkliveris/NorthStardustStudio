import { describe, expect, test } from "vitest";
import { parseAmount, parseDecimal } from "./Amounts.ts";
import { currencyMark, labelWithCurrency, nameWithCurrency } from "./Currencies.ts";

describe("parseDecimal", () => {
    test("reads a single separator as the decimal point, whatever follows it", () => {
        expect(parseDecimal("33.333")).toBe(33.333);
        expect(parseDecimal("12.500")).toBe(12.5);
        expect(parseDecimal("0.500")).toBe(0.5);
        expect(parseDecimal("12,5")).toBe(12.5);
        expect(parseDecimal("12,500")).toBe(12.5);
        expect(parseDecimal("40")).toBe(40);
        expect(parseDecimal(".5")).toBe(0.5);
    });

    test("reads both separators as an amount does: the last is the decimal point", () => {
        expect(parseDecimal("1,250.50")).toBe(1250.5);
        expect(parseDecimal("1.250,50")).toBe(1250.5);
    });

    test("gives nothing without a number, or with numbers glued together", () => {
        expect(parseDecimal("")).toBeNull();
        expect(parseDecimal(".")).toBeNull();
        expect(parseDecimal("abc")).toBeNull();
        expect(parseDecimal("2x 30")).toBeNull();
        expect(parseDecimal("30 per 12")).toBeNull();
    });
});

describe("parseAmount", () => {
    test("reads amounts as founders type them", () => {
        expect(parseAmount("1200")).toBe(1200);
        expect(parseAmount("1,200")).toBe(1200);
        expect(parseAmount("1.200")).toBe(1200);
        expect(parseAmount("1.200,50")).toBe(1200.5);
        expect(parseAmount("1,200.50")).toBe(1200.5);
        expect(parseAmount("12,5")).toBe(12.5);
        expect(parseAmount("€ 30")).toBe(30);
        expect(parseAmount("")).toBeNull();
        expect(parseAmount("abc")).toBeNull();
    });

    test("keeps its thousands reading for money", () => {
        expect(parseAmount("1,250.50")).toBe(1250.5);
        expect(parseAmount("1.250,50")).toBe(1250.5);
        expect(parseAmount("1,200")).toBe(1200);
        expect(parseAmount("€ 30")).toBe(30);
        expect(parseAmount("30 €")).toBe(30);
    });

    test("gives nothing where digit groups are glued by other characters", () => {
        expect(parseAmount("2x 30")).toBeNull();
        expect(parseAmount("30 per 12")).toBeNull();
        expect(parseAmount("12 - 15")).toBeNull();
    });

    test("reads spaces between groups of three digits as thousands", () => {
        expect(parseAmount("1 200")).toBe(1200);
        expect(parseAmount("1 200 000")).toBe(1200000);
        expect(parseAmount("1 200,50")).toBe(1200.5);
        expect(parseAmount("€ 1 200")).toBe(1200);
        expect(parseAmount("12 34")).toBeNull();
        expect(parseAmount("1 2000")).toBeNull();
    });
});

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
