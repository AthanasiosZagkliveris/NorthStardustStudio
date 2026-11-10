/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

import { parseAmount, parseDecimal } from "../Amounts.ts";
import { type LegalEntityValue, type StrategyMonthValue } from "../AnswerUtils.ts";
import { createFundingSource, type FinancialFoundationValue, type FundingSourceValue } from "./stored.ts";
import { MAX_PERIODS, notNegative, parsePercent, planMonth } from "./period.ts";
import { fundingType, periodMonths, statusStanding } from "./lists.ts";

/* ==========================================================
   Page 4 -- funding
========================================================== */

/** One loan repayment. */
interface LoanPayment {
    /** Plan month, 1-based; may run past the plan's end. */
    month: number;
    payment: number;
    principal: number;
    interest: number;
    remaining: number;
}

export interface LoanSchedule {
    payments: LoanPayment[];
    totalInterest: number;
    /** The first payment that repays principal. */
    firstRepayment?: LoanPayment;
    /** The regular payment (the first one, for equal principal). */
    firstPayment: number;
}

/**
 * A loan's repayments, from its terms -- or null while the terms
 * are not complete enough to calculate them (principal, number of
 * payments and first repayment month are needed; a missing rate
 * means interest-free).
 */
export function loanSchedule(
    source: FundingSourceValue,
    start: StrategyMonthValue
): LoanSchedule | null {

    const principal = parseAmount(source.amount);
    const count = Math.min(MAX_PERIODS, Math.floor(parseDecimal(source.loan.payments) ?? 0));
    const firstMonth = planMonth(start, source.loan.repaymentStart);

    if (principal === null || principal <= 0 || count <= 0 || firstMonth === null) {
        return null;
    }

    const step = periodMonths(source.loan.frequency);
    // A negative rate charges nothing, never less than nothing.
    const annualRate = Math.min(100, Math.max(0, parsePercent(source.loan.rate) ?? 0)) / 100;
    const rate = annualRate * step / 12;

    const payments: LoanPayment[] = [];
    let remaining = principal;
    let totalInterest = 0;

    /*
        INTEREST FROM THE MONTH IT IS DRAWN. Between drawing the loan
        and the first repayment period, interest is paid monthly on
        the whole amount (interest only), as small-business loans with
        a deferred first repayment usually are. The first repayment
        then carries interest for the months since, no more than one
        period's. A loan with no drawdown month is taken as drawn one
        period before its first repayment.
    */
    const monthlyRate = annualRate / 12;
    const drawn = planMonth(start, source.loan.start);
    const drawMonth = drawn !== null && drawn < firstMonth ? drawn : firstMonth - step;
    for (let month = drawMonth + 1; month <= firstMonth - step; month++) {
        const interest = principal * monthlyRate;
        totalInterest += interest;
        payments.push({ month, payment: interest, principal: 0, interest, remaining: principal });
    }
    const firstPeriodMonths = Math.min(step, firstMonth - drawMonth);

    const annuity = rate > 0
        ? principal * rate / (1 - Math.pow(1 + rate, -count))
        : principal / count;

    for (let index = 0; index < count; index++) {

        const interest = index === 0
            ? remaining * monthlyRate * firstPeriodMonths
            : remaining * rate;

        const principalPart = source.loan.method === "equal-principal"
            ? principal / count
            : annuity - interest;

        // The last payment clears whatever rounding has left.
        const paid = index === count - 1 ? remaining : Math.min(principalPart, remaining);

        remaining = Math.max(0, remaining - paid);
        totalInterest += interest;

        payments.push({
            month: firstMonth + index * step,
            payment: paid + interest,
            principal: paid,
            interest,
            remaining
        });

    }

    // The first repayment, not an interest-only month before it.
    const firstRepayment = payments.find(payment => payment.principal > 0) ?? payments[0];
    return { payments, totalInterest, firstPayment: firstRepayment?.payment ?? 0, firstRepayment };

}

/**
 * When a funding source's money arrives, as { plan month, amount }
 * -- the WHOLE amount, whatever has already been received.
 */
function fundingArrivals(
    source: FundingSourceValue,
    start: StrategyMonthValue
): { month: number; amount: number }[] {

    const total = parseAmount(source.amount) ?? 0;
    const nature = fundingType(source.type)?.nature;

    if (nature === "debt") {
        return [{ month: planMonth(start, source.loan.start) ?? 1, amount: total }];
    }

    const schedule = source.schedule;

    switch (schedule.kind) {

        case "periodic": {
            const first = planMonth(start, schedule.start) ?? 1;
            const step = periodMonths(schedule.frequency);
            const periods = Math.min(MAX_PERIODS, Math.floor(parseDecimal(schedule.periods) ?? 0));
            const each = notNegative(parseAmount(schedule.periodAmount)) ??
                (periods > 0 ? total / periods : 0);
            const count = Math.min(MAX_PERIODS, periods > 0 ? periods : (each > 0 ? Math.ceil(total / each) : 0));
            // What arrives stops at the agreed total: the last period
            // is trimmed, and any after it bring nothing.
            let left = total > 0 ? total : each * count;
            return Array.from({ length: count }, (_, index) => {
                const amount = Math.max(0, Math.min(each, left));
                left -= amount;
                return { month: first + index * step, amount };
            }).filter(arrival => arrival.amount > 0);
        }

        case "milestone":
            return schedule.milestones.map(milestone => ({
                month: planMonth(start, milestone.month) ?? 1,
                amount: Math.max(0, parseAmount(milestone.amount) ?? 0)
            }));

        default:
            return [{ month: planMonth(start, schedule.month) ?? 1, amount: total }];

    }

}

/** How much of a source has arrived, is confirmed to come, or is hoped for. */
interface FundingStanding {
    total: number;
    received: number;
    confirmedFuture: number;
    pending: number;
    /** Future arrivals, by plan month, of what is not yet received. */
    future: { month: number; amount: number }[];
}

export function fundingStanding(
    source: FundingSourceValue,
    start: StrategyMonthValue
): FundingStanding {

    const total = Math.max(0, parseAmount(source.amount) ?? 0);
    const status = source.status || "planned";

    // Received / Available and Completed / Closed mean it has come,
    // unless a smaller amount received says only part of it has.
    const typedReceived = parseAmount(source.received);
    const received = Math.min(total, Math.max(0,
        typedReceived ?? (status === "received" || status === "closed" ? total : 0)
    ));

    // What is still to come, in the order the schedule brings it:
    // what has been received is taken from the earliest arrivals.
    let alreadyIn = received;
    const future: { month: number; amount: number }[] = [];

    fundingArrivals(source, start)
        .sort((a, b) => a.month - b.month)
        .forEach(arrival => {
            const covered = Math.min(alreadyIn, arrival.amount);
            alreadyIn -= covered;
            if (arrival.amount - covered > 0) {
                future.push({ month: arrival.month, amount: arrival.amount - covered });
            }
        });

    // A schedule adding up to less than the total leaves the rest
    // with no date: it is placed at the end of the schedule.
    const scheduled = future.reduce((sum, entry) => sum + entry.amount, 0);
    const outstanding = total - received;
    if (outstanding - scheduled > 0.005) {
        // At the most arrivals a schedule can have, the rest comes
        // with the last of them rather than as one more.
        if (future.length >= MAX_PERIODS) {
            future[future.length - 1].amount += outstanding - scheduled;
        } else {
            future.push({
                month: future.length > 0 ? future[future.length - 1].month : 1,
                amount: outstanding - scheduled
            });
        }
    }

    const remaining = total - received;

    return statusStanding(status) === "confirmed"
        ? { total, received, confirmedFuture: remaining, pending: 0, future }
        : { total, received, confirmedFuture: 0, pending: remaining, future };

}

/** A founder's capital, from the Legal Entity, as a funding source. */
export function founderCapitalSources(
    _value: FinancialFoundationValue,
    legalEntity: LegalEntityValue
): FundingSourceValue[] {

    if (!legalEntity.capitalApplies) {
        return [];
    }

    return legalEntity.founders
        .filter(founder => (parseAmount(founder.capital) ?? 0) > 0)
        /*
            What a founder puts in is in hand when the plan starts:
            the page asks nothing more about it than the Legal Entity
            already has, the founder and the amount.
        */
        .map(founder => {
            return {
                ...createFundingSource("internal"),
                id: "capital-" + founder.id,
                name: "Founder's Capital: " + (founder.name.trim() || "Unnamed founder"),
                type: "founder-capital",
                provider: founder.name,
                amount: founder.capital,
                status: "received",
                schedule: createFundingSource("internal").schedule
            };
        });

}
