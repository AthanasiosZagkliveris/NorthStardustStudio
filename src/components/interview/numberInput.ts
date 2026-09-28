/*
    WHAT A NUMBER BOX ACCEPTS, in one place: every figure the Business
    System and the Legal Entity ask for keeps only what could be that
    figure. A keystroke (or a paste) that would make it something else
    is refused, and the box keeps what it had.
*/

export interface NumberLimit {
    /** The largest value the box accepts. */
    max: number;
    /** Digits after the point; 0 for a whole number. Default 2. */
    decimals?: number;
    // No box takes a minus sign.
}

/** The limits each kind of figure is typed within. */
export const NUMBER_LIMITS = {
    percent: { max: 100, decimals: 2 },
    /** Cancel / Month: 100% would empty the Offering in a month. */
    cancelPercent: { max: 99.9, decimals: 2 },
    /** Three decimals, so three equal owners can hold 33.333% each. */
    ownership: { max: 100, decimals: 3 },
    /** Prospects, referrals or visitors a month: an average, so 1.5 is fine. */
    perMonth: { max: 1_000_000, decimals: 2 },
    bidsPerYear: { max: 10_000, decimals: 0 },
    /** Times each, units per contract. */
    perItem: { max: 10_000, decimals: 0 },
    /** Items in an average order. */
    itemsPerOrder: { max: 10_000, decimals: 2 },
    /** Sales, clients or units a month. */
    volume: { max: 1_000_000, decimals: 2 },
    money: { max: 1_000_000_000, decimals: 2 },
    hoursWeek: { max: 168, decimals: 1 },
    hoursMonth: { max: 730, decimals: 1 },
    /** Hours one unit or client takes, by person. */
    unitHours: { max: 730, decimals: 1 },
    /** Number of payments or periods. */
    payments: { max: 600, decimals: 0 },
    months: { max: 60, decimals: 0 },
    weeks: { max: 520, decimals: 1 },
    quantity: { max: 1_000_000, decimals: 2 },
    pixels: { max: 120, decimals: 0 }
} satisfies Record<string, NumberLimit>;

function fits(text: string, limits: NumberLimit): boolean {
    const decimals = limits.decimals ?? 2;
    const pattern = decimals === 0
        ? /^\d+$/
        : new RegExp("^(\\d+\\.?\\d{0," + decimals + "}|\\.\\d{0," + decimals + "})$");
    return pattern.test(text) && (text === "." ? 0 : Number(text)) <= limits.max;
}

/**
 * What a number box keeps of `next`: `next` itself when it is a
 * number within the limits (or empty, or on its way to one, as "12."
 * is), and `previous` otherwise -- letters, a minus sign, a second
 * point, too many decimals or too large a value.
 *
 * A value saved before the limits existed ("1,200") can still be
 * shortened, so it can be corrected: by deleting characters from it,
 * or to digits, separators and spaces alone.
 */
export function limitedNumberText(next: string, previous: string, limits: NumberLimit): string {
    if (next === "" || fits(next, limits)) {
        return next;
    }
    const shortening = !fits(previous, limits) && next.length < previous.length &&
        (deletedFrom(next, previous) || /^[0-9.,\s]*$/.test(next));
    return shortening ? next : previous;
}

/** Whether `shorter` is `longer` with some of its characters deleted. */
function deletedFrom(shorter: string, longer: string): boolean {
    let position = 0;
    for (const character of longer) {
        if (position < shorter.length && shorter[position] === character) {
            position++;
        }
    }
    return position === shorter.length;
}

/** The keypad a box asks for: whole numbers or decimals. */
export function numberInputMode(limits: NumberLimit): "numeric" | "decimal" {
    return (limits.decimals ?? 2) === 0 ? "numeric" : "decimal";
}

/** What a HEX box keeps: an optional "#" and up to six hex characters. */
export function limitedHexText(next: string, previous: string): string {
    return /^#?[0-9a-f]{0,6}$/i.test(next) ? next : previous;
}
