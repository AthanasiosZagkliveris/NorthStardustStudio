/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

/* ==========================================================
   Presenting amounts
========================================================== */

/**
 * An amount in a currency, rounded to whole units -- a planning
 * model, not a ledger. Falls back to the plain number with its code
 * when the code is not one the browser knows.
 */
/**
 * The locale a currency is written in at home, so dollars read "$1,200"
 * rather than "US$1,200". Others use the device's own.
 */
const CURRENCY_LOCALES: Record<string, string> = {
    USD: "en-US", GBP: "en-GB", EUR: "en-IE", CAD: "en-CA", AUD: "en-AU", NZD: "en-NZ"
};

export function moneyFormatter(
    currency: string,
    options?: {
        /**
         * Always whole units, even under 1000 with pence -- for a
         * read-only table where several rows sit side by side and a
         * mix of "$496.55" and "$5,263" reads as two different
         * conventions rather than one table. An amount someone can
         * still edit is never drawn from this formatter (it shows
         * the typed text itself), so this never hides pence anyone
         * is actively entering.
         */
        wholeOnly?: boolean;
    }
): (amount: number) => string {

    /* Whole amounts in whole units; an amount with pence keeps them,
       so a £2.20 card is not shown as £2 -- unless `wholeOnly`. */
    const locale = CURRENCY_LOCALES[currency];

    const make = (digits: number) => {
        if (currency) {
            try {
                return new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency,
                    minimumFractionDigits: digits,
                    maximumFractionDigits: digits
                });
            } catch {
                // An unknown code: shown after a plain number below.
            }
        }
        return null;
    };

    const whole = make(0);
    const exact = make(2);
    const plainWhole = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
    const plainExact = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (amount: number) => {
        const rounded = Math.abs(amount) < 0.005 ? 0 : amount;
        // Pence matter only on small amounts; large ones read as whole.
        const withPence = !options?.wholeOnly &&
            Math.abs(rounded) < 1000 && Math.abs(rounded - Math.round(rounded)) >= 0.005;
        const format = withPence ? exact : whole;
        return format
            ? format.format(rounded)
            : (withPence ? plainExact : plainWhole).format(rounded) + (currency ? " " + currency : "");
    };

}

/** A count of units, to one decimal where it is not whole. */
export function formatUnits(value: number): string {
    return Number.isInteger(Math.round(value * 10) / 10)
        ? String(Math.round(value))
        : (Math.round(value * 10) / 10).toFixed(1);
}
