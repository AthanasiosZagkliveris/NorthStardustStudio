import { COUNTRIES } from "./LegalEntityJurisdictions.ts";

/**
 * Every currency an amount can be in: the currencies of the countries
 * the Legal Entity page registers organisations in, once each, in
 * code order.
 *
 * Found by typing a country as well as a code -- "Greece" finds EUR
 * -- because a founder knows where money comes from before they know
 * its three letters.
 */
export const CURRENCY_CODES: readonly string[] =
    [...new Set(COUNTRIES.map(country => country.currency))].sort();

export const CURRENCY_SEARCH_ALIASES: Record<string, string> = Object.fromEntries(
    CURRENCY_CODES.map(code => [
        code,
        COUNTRIES
            .filter(country => country.currency === code)
            .map(country => country.name)
            .join(" ")
    ])
);

/**
 * How a label names a currency it does not let you choose: its symbol
 * where that says which currency it is ("£", "$", "€", "CA$"), its
 * code where the currency has no symbol of its own ("CHF", "SEK").
 * The symbols are the ones the platform prints for the currency in
 * English, which marks the dollars that are not the US one ("A$").
 */
export function currencyMark(code: string): string {
    const trimmed = code.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(trimmed)) {
        return trimmed;
    }
    try {
        const symbol = new Intl.NumberFormat("en-US", { style: "currency", currency: trimmed, currencyDisplay: "symbol" })
            .formatToParts(0).find(part => part.type === "currency")?.value ?? trimmed;
        return /^[A-Za-z]+$/.test(symbol) ? trimmed : symbol;
    } catch {
        return trimmed;
    }
}

/**
 * A money field's label with its fixed currency after it: "Price (£)",
 * "Capital ($)", "Price (CHF)". Without a currency, the label alone.
 */
export function labelWithCurrency(label: string, code: string | undefined): string {
    return code && code.trim() ? label + " (" + currencyMark(code) + ")" : label;
}

/** The same for a field's accessible name, with the code: "Price (GBP)". */
export function nameWithCurrency(name: string, code: string | undefined): string {
    return code && code.trim() ? name + " (" + code.trim().toUpperCase() + ")" : name;
}
