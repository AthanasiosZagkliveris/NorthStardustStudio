/**
 * WHAT A CARD STILL LACKS, for the cards of the Identity, Brand, Business Foundation and Strategy Systems (the Infrastructure & Capability cards have their own:
 * CardCompleteness.ts). A card that holds nothing yet is not flagged (it is taken away when it is closed); one that holds something but not what it needs is, and
 * its tile glows red, flashing, as an incomplete Resource's does. Each function lists what is missing (empty = complete or still blank).
 */

const filled = (text: string | undefined): boolean => (text ?? "").trim().length > 0;

/** Whether anything is written in a value: a non-empty text, a non-empty list, an object holding such a thing. */
export function hasContent(value: unknown): boolean {
    if (typeof value === "string") {
        return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
        return value.some(hasContent);
    }
    if (value && typeof value === "object") {
        return Object.values(value as Record<string, unknown>).some(hasContent);
    }
    return false;
}

/** A card of a Segment (a Profile, a Competitor, an Offering) or a Strategy Goal, Objective or Metric: with anything written in it, it needs its name. */
export function cardNameMissing(card: { name: string } & Record<string, unknown>, ignore: readonly string[] = []): string[] {
    const { id: _id, name, ...rest } = card as Record<string, unknown>;
    void _id;
    const others = Object.entries(rest).filter(([key]) => !ignore.includes(key)).some(([, value]) => hasContent(value));
    return lacking(others || filled(name as string), filled(name as string) ? [] : ["Name"]);
}

/** Lists the missing fields only when the card holds something. */
const lacking = (holds: boolean, missing: readonly string[]): string[] => holds ? [...missing] : [];

export function legalExpenseMissing(expense: { name: string; cost: string; frequency: string; description: string; responsibility: string }): string[] {
    return lacking(
        [expense.name, expense.cost, expense.frequency, expense.description, expense.responsibility].some(filled),
        [...(filled(expense.name) ? [] : ["Name"]), ...(filled(expense.cost) ? [] : ["Cost"]), ...(filled(expense.frequency) ? [] : ["Frequency"])]
    );
}

export function legalRequirementMissing(requirement: { type: string; name: string; reference: string; notes: string }): string[] {
    return lacking(
        [requirement.type, requirement.name, requirement.reference, requirement.notes].some(filled),
        [...(filled(requirement.type) ? [] : ["Type"]), ...(filled(requirement.name) ? [] : ["Name"])]
    );
}

export function brandColourMissing(colour: { name: string; hex: string; usage: string }): string[] {
    return lacking([colour.name, colour.hex, colour.usage].some(filled), [...(filled(colour.name) ? [] : ["Name"]), ...(filled(colour.hex) ? [] : ["Colour"])]);
}

export function brandTypefaceMissing(typeface: { font: string; purpose: string }): string[] {
    return lacking([typeface.font, typeface.purpose].some(filled), filled(typeface.font) ? [] : ["Name"]);
}

export function brandImageMissing(image: { dataUrl: string; name: string; description: string }): string[] {
    return lacking([image.dataUrl, image.name, image.description].some(filled), [...(filled(image.dataUrl) ? [] : ["Image"]), ...(filled(image.name) ? [] : ["Name"])]);
}

/** A Profile, Competitor or Offering of a Segment, a Strategy Goal, Objective or Metric: it needs a name once anything else is written. */
export function namedCardMissing(card: { name: string }, others: readonly string[]): string[] {
    return lacking(others.some(filled) || filled(card.name), filled(card.name) ? [] : ["Name"]);
}
