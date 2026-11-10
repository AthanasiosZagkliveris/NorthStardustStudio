/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

import { parseAmount, parseDecimal } from "../Amounts.ts";
import { type StrategyMonthValue } from "../AnswerUtils.ts";
import { REVENUE_FREQUENCIES, type FinancialSustainabilityValue, type RevenueStreamValue } from "./revenueStored.ts";
import { MAX_ITEMS, MAX_MONTHS, MODEL_MONTHS, monthOrdinal, parsePercent, planMonth } from "./period.ts";
import { numberAsText, type BreakEvenInputs } from "./breakEven.ts";

/* ==========================================================
   Page 5 -- revenue
========================================================== */

/** A stream's price for one unit, as a monthly equivalent. */
export function monthlyPrice(stream: RevenueStreamValue): number | null {
    const price = parseAmount(stream.price);
    if (price === null) {
        return null;
    }
    // What the customer pays for delivery, shared by the order's items.
    const delivery = (parseAmount(stream.deliveryCharge) ?? 0) / itemsPerOrder(stream);
    return (price + delivery) * chargeFactor(stream);
}

/**
 * The share of a charge that falls in one month: 1 for a monthly or
 * one-off charge, a third for a quarterly one, a twelfth for an annual
 * one. A charge's costs per unit are spread the same way.
 */
function chargeFactor(stream: RevenueStreamValue): number {
    return REVENUE_FREQUENCIES.find(entry => entry.id === stream.frequency)?.factor ?? 1;
}

/**
 * The volume at the normal level: as entered, or, for a stream given
 * month by month, the volume of the last month listed.
 */
export function normalVolume(stream: RevenueStreamValue): number {
    if (stream.development === "detailed") {
        const last = stream.detailed
            .filter(entry => monthOrdinal(entry.month) !== null)
            .sort((a, b) => (monthOrdinal(a.month) ?? 0) - (monthOrdinal(b.month) ?? 0))
            .pop();
        return Math.max(0, parseDecimal(last?.volume ?? "") ?? 0);
    }
    return Math.max(0, parseDecimal(stream.volume) ?? 0);
}

/** Units in an average order: 1 unless said otherwise. */
export function itemsPerOrder(stream: RevenueStreamValue): number {
    const items = parseDecimal(stream.itemsPerOrder);
    // An order holds at least one: fewer counts as 1.
    return items !== null && items >= 1 ? Math.min(MAX_ITEMS, items) : 1;
}

/**
 * The variable cost of one unit of a stream: its Offering's costs per
 * unit, recorded on Page 3, and its costs per order shared by the
 * items in an order.
 */
export function streamVariableCost(stream: RevenueStreamValue, inputs: BreakEvenInputs): number {
    return ((inputs.variableByOffering[stream.offeringId] ?? 0) +
        (inputs.perOrderByOffering[stream.offeringId] ?? 0) / itemsPerOrder(stream)) * chargeFactor(stream);
}

/** Units in each month of the plan, index 0 = Month 1. */
export function streamVolumes(stream: RevenueStreamValue, start: StrategyMonthValue): number[] {

    const volumes = new Array<number>(MODEL_MONTHS).fill(0);
    const normal = Math.max(0, parseDecimal(stream.volume) ?? 0);
    const first = (planMonth(start, stream.start) ?? 1) - 1;

    if (stream.development === "detailed") {

        // Each entry holds from its month until the next one; before
        // the first, nothing.
        const points = stream.detailed
            .map(entry => ({
                index: (planMonth(start, entry.month) ?? 1) - 1,
                volume: Math.max(0, parseDecimal(entry.volume) ?? 0)
            }))
            .sort((a, b) => a.index - b.index);

        let current = 0;
        let next = 0;

        for (let index = 0; index < MODEL_MONTHS; index++) {
            while (next < points.length && points[next].index <= index) {
                current = points[next].volume;
                next++;
            }
            volumes[index] = current;
        }

        return volumes;

    }

    const initial = Math.max(0, parseDecimal(stream.initialVolume) ?? 0);
    const ramp = Math.min(MAX_MONTHS, Math.max(1, Math.floor(parseDecimal(stream.rampMonths) ?? 1)));

    for (let index = first; index < MODEL_MONTHS; index++) {
        const since = index - first;
        volumes[index] = stream.development === "gradual" && since < ramp - 1
            ? initial + (normal - initial) * since / (ramp - 1)
            : normal;
    }

    return volumes;

}

/**
 * Revenue EARNED each month and cash RECEIVED each month. They
 * differ only where the payment timing says so.
 */
export function streamRevenue(
    stream: RevenueStreamValue,
    start: StrategyMonthValue
): { earned: number[]; received: number[] } {

    const price = monthlyPrice(stream) ?? 0;
    const earned = streamVolumes(stream, start).map(volume => volume * price);
    const received = new Array<number>(MODEL_MONTHS).fill(0);

    const delay = Math.min(MAX_MONTHS, Math.max(0, Math.floor(parseDecimal(stream.paymentDelay) ?? 0)));
    const firstShare = Math.min(100, Math.max(0, parsePercent(stream.firstPercent) ?? 50)) / 100;

    const add = (index: number, amount: number) => {
        if (index < MODEL_MONTHS) {
            received[index] += amount;
        }
    };

    /* A quarterly or annual charge paid upfront: what each period
       earns arrives in its first month. */
    const period = stream.frequency === "quarterly" ? 3 : stream.frequency === "annually" ? 12 : 1;
    if (stream.paymentTiming === "upfront" && period > 1) {
        const first = earned.findIndex(amount => amount > 0);
        if (first >= 0) {
            for (let index = first; index < MODEL_MONTHS; index += period) {
                add(index, earned.slice(index, index + period).reduce((sum, amount) => sum + amount, 0));
            }
        }
        return { earned, received: lagged(received, stream.receiptLag) };
    }

    earned.forEach((amount, index) => {
        switch (stream.paymentTiming) {
            case "completion":
                add(index + delay, amount);
                break;
            case "split":
            case "milestone":
                add(index, amount * firstShare);
                add(index + delay, amount * (1 - firstShare));
                break;
            default:
                add(index, amount);
        }
    });

    return { earned, received: lagged(received, stream.receiptLag) };

}

/** Money received some months later than planned: moved on, none lost within the model. */
function lagged(received: number[], months = 0): number[] {
    if (months <= 0) {
        return received;
    }
    const later = new Array<number>(MODEL_MONTHS).fill(0);
    received.forEach((amount, index) => {
        if (index + months < MODEL_MONTHS) {
            later[index + months] += amount;
        }
    });
    return later;
}

/** A month moved by whole months; an unset one counts as the plan's first. */
function shiftMonth(month: StrategyMonthValue, by: number, start: StrategyMonthValue): StrategyMonthValue {
    const base = monthOrdinal(month) ?? monthOrdinal(start);
    if (base === null || by === 0) {
        return month;
    }
    const moved = base + by;
    return { month: String(moved % 12 + 1).padStart(2, "0"), year: String(Math.floor(moved / 12)) };
}

export interface WhatIf {
    /** Percent change in every price. */
    price: number;
    /** Percent change in every volume. */
    volume: number;
    /** Months revenue begins later (negative: earlier). */
    delay: number;
}

/**
 * The revenue assumptions with every price, volume and start moved
 * together -- the what-if on Sustainability. Never stored:
 * it asks "what would it take?", it does not change the plan.
 */
export function withWhatIf(
    page: FinancialSustainabilityValue,
    change: WhatIf,
    start: StrategyMonthValue
): FinancialSustainabilityValue {

    // A price is money, a volume a count: each read as its page reads it.
    const scale = (value: string, percent: number, parse = parseDecimal) => {
        const amount = parse(value);
        return amount === null || percent === 0 ? value : numberAsText(amount * (1 + percent / 100));
    };

    return {
        streams: page.streams.map(stream => ({
            ...stream,
            price: scale(stream.price, change.price, parseAmount),
            volume: scale(stream.volume, change.volume),
            initialVolume: scale(stream.initialVolume, change.volume),
            start: shiftMonth(stream.start, change.delay, start),
            detailed: stream.detailed.map(entry => ({
                ...entry,
                volume: scale(entry.volume, change.volume),
                month: shiftMonth(entry.month, change.delay, start)
            }))
        }))
    };

}
