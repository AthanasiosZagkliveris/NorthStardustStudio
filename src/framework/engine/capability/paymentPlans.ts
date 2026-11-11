/**
 * Split out of AnswerBusinessCapability.ts (2026-11-11, the folder report's item 6); that file re-exports what is exported here.
 */
import { parseAmount } from "../Amounts.ts";
import { asObject, asText, randomId } from "../Readers.ts";
import { type BusinessActivityResource, type BusinessPaymentPlan, type BusinessPaymentLine } from "./types.ts";

/**
 * THE PERIOD of an activity group (cost model section 13), as the days its dates must stay inside: Pre-Operational runs from Plan Start to the day before
 * the Opening Date; Operational and Sales & Customer from the Opening Date; Production and Marketing from Plan Start. A bound that is not known (a date
 * not given yet) is "" and holds nothing.
 */
export function activityPeriod(groupId: string, planStart: string, openingDate: string): { from: string; to: string } {
    switch (groupId) {
        case "pre-operational": {
            const opening = isoToTime(openingDate);
            return { from: planStart, to: opening === null ? "" : timeToIso(opening - PAYMENT_DAY) };
        }
        case "operational":
        case "sales":
            return { from: openingDate, to: "" };
        case "production":
        case "marketing":
            return { from: planStart, to: "" };
        default:
            return { from: "", to: "" };
    }
}

/** The last day of an activity: its End date, else its Start date (an activity with no end counts as one day). */
export const activityLastDay = (activity: { startDate: string; endDate: string }) => activity.endDate || activity.startDate;

/** What is wrong with an activity's dates against the period of its group: a start before it, an end after it, an end before its start. */
export function activityDateIssues(activity: { startDate: string; endDate: string }, period: { from: string; to: string }): string[] {
    const issues: string[] = [];
    if (activity.startDate && period.from && activity.startDate < period.from) {
        issues.push("The Start date is before the period begins.");
    }
    if (period.to && ((activity.startDate && activity.startDate > period.to) || (activityLastDay(activity) && activityLastDay(activity) > period.to))) {
        issues.push("The dates run past the end of the period.");
    }
    if (activity.endDate && activity.startDate && activity.endDate < activity.startDate) {
        issues.push("The End date is before the Start date.");
    }
    return issues;
}

/** The linked resources whose Start date falls after the activity ends (its End date, else its Start date): a linked card cannot begin later. */
export function resourcesStartingTooLate(activity: { startDate: string; endDate: string }, starts: Readonly<Record<string, string>>, linked: readonly BusinessActivityResource[]): string[] {
    const last = activityLastDay(activity);
    return last === "" ? [] : linked.filter(entry => entry.id !== "" && (starts[entry.id] ?? "") !== "" && starts[entry.id] > last).map(entry => entry.id);
}

/** The most units of a resource an activity (or a performer) can take: the Qty of the card (whole units); null where the card has no limit to give. */
export function unitsCap(quantity: string): number | null {
    const count = Math.floor(parseAmount(quantity) ?? 0);
    return count >= 1 ? count : null;
}

/** Units typed for a resource or a performer, kept whole and never more than the card holds. */
export function cappedUnits(typed: string, quantity: string): string {
    const digits = typed.replace(/\D/g, "").slice(0, 6);
    const cap = unitsCap(quantity);
    return digits !== "" && cap !== null && Number(digits) > cap ? String(cap) : digits;
}

/**
 * THE PAYMENT PLAN of a Per project price (cost model section 13): when the money leaves, not what the cost is. Not ticked, the price is paid in full on the
 * card's Start date. Ticked, its type is one of three; every payment has a percent and a date, and the percents total 100% or the card is incomplete.
 *
 * - Deposit & Balance: a percent at the Start date and the rest on a second date (the End date unless another is given).
 * - Instalments: a number of payments, dated evenly from the Start date to the End date and equal; the dates and amounts can be moved.
 * - Milestones: a title, a percent and a date for each stage.
 */
export const BUSINESS_PAYMENT_PLANS = [
    { id: "deposit-balance", label: "Deposit & Balance" },
    { id: "instalments", label: "Instalments" },
    { id: "milestones", label: "Milestones" }
] as const;

export const emptyPaymentPlan = (): BusinessPaymentPlan => ({ on: false, type: "", count: "", lines: [] });

export function asPaymentPlan(value: unknown): BusinessPaymentPlan {
    const plan = asObject(value);
    const type = asText(plan.type);
    return {
        on: plan.on === true,
        type: BUSINESS_PAYMENT_PLANS.some(entry => entry.id === type) ? type : "",
        count: asText(plan.count).replace(/\D/g, "").slice(0, 2),
        lines: (Array.isArray(plan.lines) ? plan.lines : []).slice(0, 60).map(entry => {
            const line = asObject(entry);
            return { id: asText(line.id) || randomId("payment"), title: asText(line.title), percent: businessDecimalText(asText(line.percent)), date: isoDateText(line.date) };
        })
    };
}

export const PAYMENT_DAY = 24 * 60 * 60 * 1000;

export function isoToTime(iso: string): number | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

export function timeToIso(time: number): string {
    return new Date(time).toISOString().slice(0, 10);
}

/** Equal shares of 100%, to two decimals, the last taking what rounding leaves: three are 33.33, 33.33 and 33.34. */
export function equalPercents(count: number): string[] {
    if (count < 1) {
        return [];
    }
    // (One decimal at most: the figure fits the percent's square cell, "33.3".)
    const each = Math.floor(1000 / count) / 10;
    const shares = Array.from({ length: count }, () => each);
    shares[count - 1] = Math.round((100 - each * (count - 1)) * 10) / 10;
    return shares.map(share => String(share));
}

/** INSTALMENTS: `count` equal payments, dated evenly from the Start date to the End date (the first on the Start date, the last on the End date). */
export function instalmentLines(count: number, startDate: string, endDate: string): BusinessPaymentLine[] {
    const first = isoToTime(startDate);
    const last = isoToTime(endDate);
    return equalPercents(count).map((percent, at) => ({
        id: randomId("payment"),
        title: "",
        percent,
        date: first === null ? "" : count === 1 || last === null || last < first ? startDate : timeToIso(first + Math.round((last - first) / PAYMENT_DAY * at / (count - 1)) * PAYMENT_DAY)
    }));
}

/** The payments of a plan as they fall: the first of Deposit & Balance on the Start date, the second on its own date else the End date. */
export function paymentPlanLines(plan: BusinessPaymentPlan, startDate: string, endDate: string): BusinessPaymentLine[] {
    if (plan.type === "instalments" && plan.lines.length > 0) {
        // Instalments are dated evenly from the first to the last: those two are the plan's own dates (the card has no Start or End date while it has a plan), the ones between follow them.
        const count = plan.lines.length;
        const first = plan.lines[0].date || startDate;
        const last = plan.lines[count - 1].date || endDate || first;
        const dated = instalmentLines(count, first, last);
        return plan.lines.map((line, at) => ({ ...line, date: dated[at].date }));
    }
    if (plan.type === "milestones" && plan.lines.length > 0) {
        // Milestones with no date of their own take the card's: the first the Start date, the last the End date, the ones between spread evenly.
        const count = plan.lines.length;
        const first = plan.lines[0].date || startDate;
        const last = plan.lines[count - 1].date || endDate || first;
        const spread = instalmentLines(count, first, last);
        return plan.lines.map((line, at) => ({ ...line, date: line.date || spread[at].date }));
    }

    return plan.type === "deposit-balance"
        ? plan.lines.slice(0, 2).map((line, at) => ({ ...line, date: line.date || (at === 0 ? startDate : endDate) }))
        : plan.lines;
}

/** What the percents of a plan add up to. */
export function paymentPlanTotal(plan: BusinessPaymentPlan): number {
    return Math.round(plan.lines.reduce((sum, line) => sum + (parseAmount(line.percent) ?? 0), 0) * 100) / 100;
}

/**
 * Whether the plan of a Per project price leaves the card incomplete: a plan ticked with no type, percents that do not total 100%, or a payment with no date
 * (for Deposit & Balance, no Start date or no End date to fall back on). Nothing is wrong with a plan that is not ticked.
 */
export function paymentPlanIncomplete(cost: { frequency: string }, plan: BusinessPaymentPlan, startDate: string, endDate: string): boolean {
    if (cost.frequency !== "per-project" || !plan.on) {
        return false;
    }
    if (plan.type === "" || plan.lines.length === 0 || paymentPlanTotal(plan) !== 100) {
        return true;
    }
    if (plan.type === "deposit-balance" && plan.lines.length !== 2) {
        return true;
    }
    return paymentPlanLines(plan, startDate, endDate).some(line => line.date === "");
}

/**
 * What a Quantity, Price or Salary box keeps of what was typed:
 * its digits and its first ".", nothing else. "£30" becomes "30"
 * as it is typed, rather than being refused as a whole.
 */
export function businessDecimalText(text: string): string {
    const kept = text.replace(/[^\d.]/g, "");
    const point = kept.indexOf(".");
    return point < 0
        ? kept
        : kept.slice(0, point + 1) + kept.slice(point + 1).replace(/\./g, "");
}

/** An ISO date ("YYYY-MM-DD") as saved; anything else is not a date and reads as none. */
export function isoDateText(value: unknown): string {
    const text = asText(value).trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!match) {
        return "";
    }
    // A real day: 2027-02-30 is none.
    const day = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return day.getUTCFullYear() === Number(match[1]) && day.getUTCMonth() === Number(match[2]) - 1 && day.getUTCDate() === Number(match[3]) ? text : "";
}
