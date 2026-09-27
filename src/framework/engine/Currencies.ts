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
