/**
 * Split out of AnswerBusinessCapability.ts (2026-11-11, the folder report's item 6); that file re-exports what is exported here.
 */
import { parseAmount } from "../Amounts.ts";
import { asObject, asText } from "../Readers.ts";
import { businessDecimalText } from "./paymentPlans.ts";

/**
 * HOW A SHARED COST IS SHARED (owner, 2026-11-16; closes doc 3, R3): a fixed or one-time cost linked to several Offerings is shared by the hours each uses (its
 * Delivery card), by the revenue each brings, in equal parts, or by the user's own split (whole percents totalling 100%). A cost paid per unit or as a share of
 * revenue needs no share: each Offering pays it in full on what it sells. The basis is a reserved entry of the shares, OFFERING_BASIS_KEY; with none saved the
 * default stands -- by hours where the Offerings have Delivery cards, else by revenue.
 */
export type ShareBasis = "hours" | "revenue" | "equal" | "own";

export const SHARE_BASES: readonly { id: ShareBasis; label: string }[] = [
    { id: "hours", label: "By the hours each one uses" },
    { id: "revenue", label: "By the revenue each one brings" },
    { id: "equal", label: "In equal parts" },
    { id: "own", label: "My own split" }
];

/** The "i" of "How is it shared?". */
export const SHARE_BASIS_HELP = [
    "Share a fixed cost by how much each Offering uses it: hours for a loom, a studio or a van; revenue for rent or software.",
    "Based on: The Open University, OpenLearn, Fundamentals of cost accounting."
];

export const OFFERING_BASIS_KEY = "~basis";

/** What each Offering uses, a month, for the shares by hours and by revenue: its delivery hours (Delivery card x expected sales) and its revenue. */
export interface ShareWeights {
    hours: Readonly<Record<string, number>>;
    revenue: Readonly<Record<string, number>>;
}

/** Whole percents of at most two digits: three Offerings are 33, 33 and 34. */
export function equalOfferingShares(offeringIds: readonly string[]): Record<string, string> {
    const each = Math.floor(100 / Math.max(1, offeringIds.length));
    return Object.fromEntries(offeringIds.map((id, at) => [id, String(at === offeringIds.length - 1 ? 100 - each * (offeringIds.length - 1) : each)]));
}

/**
 * THE SHARES COUNTED IN UNITS, as saved before 2026-11-16: a reserved entry holding "1". Retired: a card saved so is read as the user's own split, its units
 * turned into percents (asOfferingShares).
 */
export const OFFERING_UNITS_KEY = "~units";

/** The basis saved on the card; null where none is saved (the default stands). */
export function savedShareBasis(shares: Record<string, string>): ShareBasis | null {
    const saved = shares[OFFERING_BASIS_KEY];
    return SHARE_BASES.some(basis => basis.id === saved) ? saved as ShareBasis : null;
}

/** The basis a card is shared by: its own, or the default -- by hours where the Offerings have delivery hours, else by revenue. */
export function shareBasisOf(offeringIds: readonly string[], shares: Record<string, string>, weights?: ShareWeights): ShareBasis {
    return savedShareBasis(shares) ?? (weights && offeringIds.some(id => (weights.hours[id] ?? 0) > 0) ? "hours" : "revenue");
}

/** What the typed shares of the linked Offerings add up to (an Offering with none typed counts nothing). */
export function offeringSharesTotal(offeringIds: readonly string[], shares: Record<string, string>): number {
    return Math.round(offeringIds.reduce((sum, id) => sum + (parseAmount(shares[id] ?? "") ?? 0), 0) * 100) / 100;
}

/** Whether the user's own split of a card linked to several Offerings is short of 100%. Any other basis is never incomplete. */
export function offeringSharesIncomplete(offeringIds: readonly string[], shares: Record<string, string>): boolean {
    return offeringIds.length > 1 && savedShareBasis(shares) === "own" && offeringSharesTotal(offeringIds, shares) !== 100;
}

/**
 * The fraction of a card each linked Offering carries: the user's own split when it totals 100%; by hours or by revenue, each Offering's of their total (in equal
 * parts while none is known); else equal parts.
 */
export function offeringFractions(offeringIds: readonly string[], shares: Record<string, string>, weights?: ShareWeights): Record<string, number> {
    const equal = Object.fromEntries(offeringIds.map(id => [id, 1 / Math.max(1, offeringIds.length)]));
    if (offeringIds.length < 2) {
        return equal;
    }
    const basis = shareBasisOf(offeringIds, shares, weights);
    if (basis === "own") {
        return offeringSharesIncomplete(offeringIds, shares) ? equal : Object.fromEntries(offeringIds.map(id => [id, (parseAmount(shares[id] ?? "") ?? 0) / 100]));
    }
    if (basis === "hours" || basis === "revenue") {
        const of = weights ? weights[basis] : {};
        const total = offeringIds.reduce((sum, id) => sum + Math.max(0, of[id] ?? 0), 0);
        return total > 0 ? Object.fromEntries(offeringIds.map(id => [id, Math.max(0, of[id] ?? 0) / total])) : equal;
    }
    return equal;
}

/**
 * The shares kept: those of the Offerings the card is linked to, cleaned to numbers, with its basis. A card saved in units becomes the user's own split in percents;
 * a split saved before the bases that differs from equal parts was typed by the user, and stays theirs; equal parts saved so take the default.
 */
export function asOfferingShares(value: unknown, offeringIds: readonly string[]): Record<string, string> {
    const source = asObject(value);
    const kept: Record<string, string> = Object.fromEntries(offeringIds.filter(id => id in source).map(id => [id, businessDecimalText(asText(source[id]))]));
    if (offeringIds.length < 2) {
        return kept;
    }
    const saved = asText(source[OFFERING_BASIS_KEY]);
    if (SHARE_BASES.some(basis => basis.id === saved)) {
        return { ...kept, [OFFERING_BASIS_KEY]: saved };
    }
    if (source[OFFERING_UNITS_KEY] === "1") {
        const units = offeringIds.map(id => Math.max(0, parseAmount(kept[id] ?? "") ?? 0));
        const total = units.reduce((sum, amount) => sum + amount, 0);
        if (total <= 0) {
            return { ...equalOfferingShares(offeringIds), [OFFERING_BASIS_KEY]: "own" };
        }
        const percents = units.map(amount => Math.round(amount / total * 100));
        percents[percents.length - 1] = 100 - percents.slice(0, -1).reduce((sum, amount) => sum + amount, 0);
        return { ...Object.fromEntries(offeringIds.map((id, at) => [id, String(percents[at])])), [OFFERING_BASIS_KEY]: "own" };
    }
    const equal = equalOfferingShares(offeringIds);
    const typed = offeringIds.some(id => (kept[id] ?? "") !== "" && (kept[id] ?? "") !== equal[id]);
    return typed ? { ...kept, [OFFERING_BASIS_KEY]: "own" } : kept;
}

/**
 * The shares after the linked Offerings change: the user's own split keeps its typed shares, a new Offering at 0 and a removed one's share gone; any other basis
 * holds no numbers of its own (they are worked out), only the basis chosen.
 */
export function offeringSharesFor(next: readonly string[], shares: Record<string, string>): Record<string, string> {
    const basis = shares[OFFERING_BASIS_KEY];
    if (next.length < 2) {
        return {};
    }
    return basis === "own"
        ? { ...Object.fromEntries(next.map(id => [id, shares[id] ?? "0"])), [OFFERING_BASIS_KEY]: basis }
        : basis ? { [OFFERING_BASIS_KEY]: basis } : {};
}

/**
 * Whether a cost of this frequency is shared between Offerings: one paid once or each period -- an asset bought at a price per unit (a purchase) is paid once, so it is
 * too. One paid per unit of what is sold, or as a share of revenue, each pays in full.
 */
export function costIsShared(frequency: string, purchase = false): boolean {
    return ["one-time", "monthly", "quarterly", "annually", "biennially"].includes(frequency) || (purchase && frequency === "per-unit");
}
