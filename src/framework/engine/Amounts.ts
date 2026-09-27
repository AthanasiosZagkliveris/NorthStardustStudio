/*
    READING AMOUNTS AS FOUNDERS TYPE THEM, in one place: the Legal
    Entity (Identity) and the financial pages (Business) read the same
    "10,000" the same way.
*/

/**
 * An amount as a founder types it -- "1200", "1,200", "1.200,50",
 * "€ 30" -- as a number, or null when there is none.
 *
 * The one rule that needs stating: where only one kind of separator
 * appears, it is a thousands separator when exactly three digits
 * follow it ("1,200", "1.200") and a decimal point otherwise
 * ("12,5"). Where both appear, whichever comes last is the decimal
 * point.
 */
export function parseAmount(text: string): number | null {

    const cleaned = text.replace(/[^0-9.,-]/g, "");

    if (!/[0-9]/.test(cleaned)) {
        return null;
    }

    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");

    let normalised: string;

    if (lastComma >= 0 && lastDot >= 0) {
        normalised = lastComma > lastDot
            ? cleaned.replace(/\./g, "").replace(",", ".")
            : cleaned.replace(/,/g, "");
    } else if (lastComma >= 0 || lastDot >= 0) {
        const separator = lastComma >= 0 ? "," : ".";
        const parts = cleaned.split(separator);
        // "1.200" or "1,200" is a thousand and two hundred; "0.505"
        // is half a unit: a number never starts its thousands with 0.
        const leadingZero = /^-?0$/.test(parts[0]);
        const thousands = parts.length > 2 ||
            (parts.length === 2 && parts[1].length === 3 && !leadingZero);
        normalised = thousands
            ? parts.join("")
            : parts.join(".");
    } else {
        normalised = cleaned;
    }

    const value = Number(normalised);

    return Number.isFinite(value) ? value : null;

}
