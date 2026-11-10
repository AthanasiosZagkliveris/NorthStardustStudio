/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

import { asObject, asText, randomId } from "../Readers.ts";
import { type StrategyMonthValue } from "../AnswerUtils.ts";
import { EMPTY_MONTH } from "./stored.ts";
import { asList, asMonth, oneOf } from "./period.ts";

/* ==========================================================
   Page 5 -- what is stored
========================================================== */

export const REVENUE_UNITS = [
    "Product", "Project", "Session", "Participant", "Hour", "Day",
    "Client", "Licence", "Subscription", "Other"
] as const;

/**
 * How a stream is charged: the one question that used to be two
 * (Revenue Model and Frequency). A sale or a project is paid once;
 * a subscription or retainer every period, by those active.
 */
export const REVENUE_CHARGES = [
    { id: "per-sale", label: "Per sale", model: "Sale" },
    { id: "per-project", label: "Per project", model: "Project / Contract" },
    { id: "monthly", label: "Monthly", model: "Subscription / Retainer" },
    { id: "quarterly", label: "Quarterly", model: "Subscription / Retainer" },
    { id: "annually", label: "Annually", model: "Subscription / Licence" }
] as const;

/** The revenue model a stream's charging implies, for the documents. */
export function revenueModelLabel(stream: RevenueStreamValue): string {
    return REVENUE_CHARGES.find(entry => entry.id === stream.frequency)?.model ?? "";
}

/** Earlier ways of charging, as the ones asked now. */
function asCharge(frequency: string): RevenueFrequency | "" {
    if (frequency === "per-contract") {
        return "per-project";
    }
    if (frequency === "one-time" || frequency === "usage-based" || frequency === "other") {
        return "per-sale";
    }
    return REVENUE_CHARGES.some(entry => entry.id === frequency) ? frequency as RevenueFrequency : "";
}

export const REVENUE_FREQUENCIES = [
    { id: "one-time", label: "One-time", factor: 1 },
    { id: "per-sale", label: "Per sale", factor: 1 },
    { id: "monthly", label: "Monthly", factor: 1 },
    { id: "quarterly", label: "Quarterly", factor: 1 / 3 },
    { id: "annually", label: "Annually", factor: 1 / 12 },
    { id: "per-project", label: "Per project", factor: 1 },
    { id: "per-contract", label: "Per contract", factor: 1 },
    { id: "usage-based", label: "Usage-based", factor: 1 },
    { id: "other", label: "Other", factor: 1 }
] as const;

type RevenueFrequency = typeof REVENUE_FREQUENCIES[number]["id"];

/** A recurring charge: its volume is how many are ACTIVE, not sold. */
export function isRecurringRevenue(frequency: string): boolean {
    return frequency === "monthly" || frequency === "quarterly" || frequency === "annually";
}

export const REVENUE_DEVELOPMENTS = [
    { id: "steady", label: "Steady from the start", explanation: "The expected volume from the month revenue begins." },
    { id: "gradual", label: "Gradual build-up", explanation: "Starts lower and grows evenly to the expected volume." },
    { id: "detailed", label: "Month by month", explanation: "Enter the volume for the months that differ." }
] as const;

type RevenueDevelopment = typeof REVENUE_DEVELOPMENTS[number]["id"];

export const PAYMENT_TIMINGS = [
    { id: "", label: "When earned" },
    { id: "upfront", label: "Upfront" },
    { id: "completion", label: "On completion" },
    { id: "split", label: "Split" },
    { id: "milestone", label: "Milestones" },
    { id: "other", label: "Other" }
] as const;

type PaymentTiming = typeof PAYMENT_TIMINGS[number]["id"];

export interface RevenueStreamValue {
    /**
     * Months later than planned that customers pay, on top of the
     * payment timing: set only by the stress test, never stored.
     */
    receiptLag?: number;
    id: string;
    /** A Page 1 Offering. */
    offeringId: string;
    model: string;
    modelOther: string;
    price: string;
    unit: string;
    unitOther: string;
    frequency: RevenueFrequency | "";
    /** Units a month at the normal operating level. */
    volume: string;
    /** When revenue begins. Unset: the plan's first month. */
    start: StrategyMonthValue;
    development: RevenueDevelopment;
    /** Gradual: the first month's volume, and months to reach normal. */
    initialVolume: string;
    rampMonths: string;
    /** Month by month: volumes from a month on. */
    detailed: { id: string; month: StrategyMonthValue; volume: string }[];
    /** No longer used: an Offering's costs are recorded on Page 3. Kept empty. */
    variableCost: string;
    /** Units in an average order: what a per-order cost is shared by. "" = 1. */
    itemsPerOrder: string;
    /** What the customer pays towards delivery, per order. */
    deliveryCharge: string;
    paymentTiming: PaymentTiming;
    /** Completion / split: months after the sale the (rest) is paid. */
    paymentDelay: string;
    /** Split / milestone: percent paid at the start. */
    firstPercent: string;
    description: string;
}

export interface FinancialSustainabilityValue {
    streams: RevenueStreamValue[];
}

export function createRevenueStream(): RevenueStreamValue {
    return {
        id: randomId("stream"),
        offeringId: "",
        model: "",
        modelOther: "",
        price: "",
        unit: "",
        unitOther: "",
        frequency: "",
        volume: "",
        start: { ...EMPTY_MONTH },
        development: "steady",
        initialVolume: "",
        rampMonths: "",
        detailed: [],
        variableCost: "",
        itemsPerOrder: "",
        deliveryCharge: "",
        paymentTiming: "",
        paymentDelay: "",
        firstPercent: "",
        description: ""
    };
}

export function createDetailedVolume() {
    return { id: randomId("volume"), month: { ...EMPTY_MONTH }, volume: "" };
}

const DEVELOPMENT_IDS = REVENUE_DEVELOPMENTS.map(entry => entry.id);

const TIMING_IDS = PAYMENT_TIMINGS.map(entry => entry.id);

export function asFinancialSustainabilityValue(value: unknown): FinancialSustainabilityValue {

    const source = asObject(value);

    return {
        streams: asList(source.streams).map(entry => {
            const row = asObject(entry);
            return {
                id: asText(row.id) || randomId("stream"),
                offeringId: asText(row.offeringId),
                model: asText(row.model),
                modelOther: asText(row.modelOther),
                price: asText(row.price),
                unit: asText(row.unit),
                unitOther: asText(row.unitOther),
                frequency: asCharge(asText(row.frequency)),
                volume: asText(row.volume),
                start: asMonth(row.start),
                development: oneOf(row.development, DEVELOPMENT_IDS, "steady"),
                initialVolume: asText(row.initialVolume),
                rampMonths: asText(row.rampMonths),
                detailed: asList(row.detailed).map(item => {
                    const part = asObject(item);
                    return {
                        id: asText(part.id) || randomId("volume"),
                        month: asMonth(part.month),
                        volume: asText(part.volume)
                    };
                }),
                // No longer asked: an Offering's costs are on Page 3.
                variableCost: "",
                itemsPerOrder: asText(row.itemsPerOrder),
                deliveryCharge: asText(row.deliveryCharge),
                paymentTiming: oneOf(row.paymentTiming, TIMING_IDS, ""),
                paymentDelay: asText(row.paymentDelay),
                firstPercent: asText(row.firstPercent),
                description: asText(row.description)
            };
        })
    };

}

export const FINANCIAL_SUSTAINABILITY_SECTIONS = ["Revenue", "Break Even"] as const;

export function financialSustainabilitySectionsEmpty(value: unknown): boolean[] {
    return [asFinancialSustainabilityValue(value).streams.length === 0, false];
}
