/**
 * Split out of AnswerBusinessCapability.ts (2026-11-11, the folder report's item 6); that file re-exports what is exported here.
 */
import { parseAmount } from "../Amounts.ts";
import { asObject, asText } from "../Readers.ts";
import { businessDecimalText } from "./paymentPlans.ts";

/**
 * THE SHARES of the Offerings a card is linked to: the percent of the card each Offering carries, when it is linked to several. They total 100% or the card
 * is incomplete; one Offering carries all of it. Ticking Offerings starts them equal.
 */
export function equalOfferingShares(offeringIds: readonly string[]): Record<string, string> {
    // (Whole percents, of at most two digits: three Offerings are 33, 33 and 34.)
    const each = Math.floor(100 / Math.max(1, offeringIds.length));
    return Object.fromEntries(offeringIds.map((id, at) => [id, String(at === offeringIds.length - 1 ? 100 - each * (offeringIds.length - 1) : each)]));
}

/**
 * THE SHARES COUNT IN UNITS instead of percents when the card says so (a delivery of 3 items of one Offering and 5 of another): a reserved entry of the
 * shares, UNITS_KEY, holds "1". The units are then shares of their own total, and there is nothing to total to 100.
 */
export const OFFERING_UNITS_KEY = "~units";

export const offeringSharesInUnits = (shares: Record<string, string>) => shares[OFFERING_UNITS_KEY] === "1";

/** Every linked Offering one unit, in units. */
export function unitOfferingShares(offeringIds: readonly string[]): Record<string, string> {
    return { ...Object.fromEntries(offeringIds.map(id => [id, "1"])), [OFFERING_UNITS_KEY]: "1" };
}

/** What the typed shares of the linked Offerings add up to (an Offering with none typed counts nothing). */
export function offeringSharesTotal(offeringIds: readonly string[], shares: Record<string, string>): number {
    return Math.round(offeringIds.reduce((sum, id) => sum + (parseAmount(shares[id] ?? "") ?? 0), 0) * 100) / 100;
}

/** Whether a card linked to several Offerings has a share missing, or shares that do not total 100%. One or none: nothing to share. */
export function offeringSharesIncomplete(offeringIds: readonly string[], shares: Record<string, string>): boolean {
    if (offeringSharesInUnits(shares)) {
        return offeringIds.length > 1 && offeringIds.some(id => !((parseAmount(shares[id] ?? "") ?? 0) > 0));
    }
    return offeringIds.length > 1 && (offeringIds.some(id => (shares[id] ?? "") === "") || offeringSharesTotal(offeringIds, shares) !== 100);
}

/** The fraction of a card each linked Offering carries: the typed shares when they total 100%, else equal ones. */
export function offeringFractions(offeringIds: readonly string[], shares: Record<string, string>): Record<string, number> {
    const typed = offeringIds.length > 1 && !offeringSharesIncomplete(offeringIds, shares);
    const whole = offeringSharesInUnits(shares) ? offeringIds.reduce((sum, id) => sum + (parseAmount(shares[id] ?? "") ?? 0), 0) : 100;
    return Object.fromEntries(offeringIds.map(id => [id, typed ? (parseAmount(shares[id] ?? "") ?? 0) / whole : 1 / offeringIds.length]));
}

/** The shares kept: those of the Offerings the card is linked to, cleaned to numbers. */
export function asOfferingShares(value: unknown, offeringIds: readonly string[]): Record<string, string> {
    const source = asObject(value);
    const kept = Object.fromEntries(offeringIds.filter(id => id in source).map(id => [id, businessDecimalText(asText(source[id]))]));
    // A card linked to several Offerings before there were shares was shared equally: it keeps being.
    if (offeringIds.length > 1 && Object.keys(kept).length === 0) {
        return equalOfferingShares(offeringIds);
    }
    return offeringIds.length > 1 && source[OFFERING_UNITS_KEY] === "1" ? { ...kept, [OFFERING_UNITS_KEY]: "1" } : kept;
}
