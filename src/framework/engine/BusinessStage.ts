/**
 * THE BUSINESS STAGE, FROM THE OPENING DATE AND THE STAGES' DURATIONS (design document 28, 8.2; the owner's rule, 2026-10-24): the user sets the Opening Date, and the stage follows it. Before the opening
 * the business is Planning; from the opening it is Launching for the Launching duration (months), then Managing for the Managing duration (months), then Growing for the Growing duration (years).
 * With no Opening Date it is Planning. The durations are the Global Settings' (their defaults are below): the user can change them, and the Opening Date, at any time, and the stage follows.
 * The windows are indicators, not rules of law: the Review says how much of the stage's window is left.
 */

export type StageKey = "plan" | "launch" | "manage" | "grow";

/** How long each stage lasts: Planning, Launching and Managing in months, Growing in years. Planning is counted back from the Opening Date; the others from the stage before. */
export interface StageDurations {
    planning: number;
    launching: number;
    managing: number;
    growing: number;
}

/** The defaults (the owner's windows): Planning 3 months, Launching 12, Managing 12 (24 after the opening), Growing 3 years (5 after the opening). */
export const DEFAULT_STAGE_DURATIONS: StageDurations = { planning: 3, launching: 12, managing: 12, growing: 3 };

/** The stages, in order, with the words each is known by. */
export const STAGES: readonly { id: StageKey; label: string }[] = [
    { id: "plan", label: "Planning" },
    { id: "launch", label: "Launching" },
    { id: "manage", label: "Managing" },
    { id: "grow", label: "Growing" }
];

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Day { year: number; month: number; day: number }

function parse(iso: string): Day | null {
    const match = ISO.exec(iso);
    return match ? { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) } : null;
}

function dayOf(date: Date): Day {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

/** Whole months from one day to another (negative before it): a month is complete on the same day of the month. */
function monthsBetween(from: Day, to: Day): number {
    const months = (to.year - from.year) * 12 + (to.month - from.month);
    return to.day < from.day ? months - 1 : months;
}

function addMonths(day: Day, months: number): Day {
    const total = day.year * 12 + (day.month - 1) + months;
    return { year: Math.floor(total / 12), month: (total % 12) + 1, day: day.day };
}

function compare(one: Day, other: Day): number {
    return (one.year - other.year) || (one.month - other.month) || (one.day - other.day);
}

function words(day: Day): string {
    return day.day + " " + MONTH_NAMES[day.month - 1] + " " + day.year;
}

/** How many months, as the Review says it: "1 month", "5 months". */
function monthsText(months: number): string {
    return months + (months === 1 ? " month" : " months");
}

/** The months after the opening at which each stage ends: Launching, then Managing, then Growing. */
export function stageEnds(durations: StageDurations = DEFAULT_STAGE_DURATIONS): { launching: number; managing: number; growing: number } {
    const launching = durations.launching;
    const managing = launching + durations.managing;
    return { launching, managing, growing: managing + durations.growing * 12 };
}

/** The stage the Opening Date gives on a day (planning where there is no Opening Date). */
export function stageOf(openingDate: string, today: Date = new Date(), durations: StageDurations = DEFAULT_STAGE_DURATIONS): StageKey {
    const opening = parse(openingDate);
    if (!opening) {
        return "plan";
    }
    const now = dayOf(today);
    if (compare(now, opening) < 0) {
        return "plan";
    }
    const months = monthsBetween(opening, now);
    const ends = stageEnds(durations);
    return months < ends.launching ? "launch" : months < ends.managing ? "manage" : "grow";
}

/**
 * WHAT THE REVIEW SAYS OF THE STAGE'S TIME, one sentence or two (the owner: "write related messages on the reviews: the remaining time"). `planStart` is the plan's first day
 * ("" where none), worked out elsewhere (the earlier of the Opening Date and the earliest cost).
 */
export function stageMessages(openingDate: string, planStart: string, today: Date = new Date(), durations: StageDurations = DEFAULT_STAGE_DURATIONS): string[] {
    const opening = parse(openingDate);
    const start = parse(planStart);
    const now = dayOf(today);
    const stage = stageOf(openingDate, today, durations);
    const ends = stageEnds(durations);

    if (stage === "plan") {
        if (!opening) {
            return ["Planning: no Opening Date is set, so the business counts as planning. Planning is meant to take " + monthsText(durations.planning) + (start ? " (the plan started in " + MONTH_NAMES[start.month - 1] + " " + start.year + ")" : "") + ". Set the Opening Date to start the launch."];
        }
        const inPlan = start ? monthsBetween(start, now) : 0;
        const toOpening = monthsBetween(now, opening);
        const left = toOpening > 0 ? monthsText(toOpening) : "less than a month";
        const long = inPlan > durations.planning ? " The planning has run " + monthsText(inPlan) + ", longer than the " + durations.planning + " it is meant to take: keep the date, or move it." : "";
        return ["Planning: " + left + " to the Opening Date (" + words(opening) + "). Planning is meant to take " + monthsText(durations.planning) + "." + long];
    }

    // (From here on there is an Opening Date.)
    const open = opening as Day;
    const months = monthsBetween(open, now);

    if (stage === "launch") {
        const left = ends.launching - months;
        const until = addMonths(open, ends.launching);
        return ["Launching: month " + (months + 1) + " of " + ends.launching + " since the Opening Date (" + words(open) + "). " + (left <= 2 ? "Only " + monthsText(left) + " left" : monthsText(left) + " left") + " to prove the Early Positioning Statement or change it, until " + words(until) + "."];
    }

    if (stage === "manage") {
        const left = ends.managing - months;
        const until = addMonths(open, ends.managing);
        return ["Managing: " + monthsText(left) + " left of the Core Market Positioning's horizon, until " + words(until) + " (the Opening Date was " + words(open) + ")."];
    }

    const sinceGrowing = months - ends.managing;
    const years = Math.floor(sinceGrowing / 12);
    const end = addMonths(open, ends.growing);
    return [sinceGrowing >= durations.growing * 12
        ? "Growing: " + years + " years since the stage began, past its " + durations.growing + "-year window that ended on " + words(end) + ". Review the Corporate & Portfolio Positioning and its future positioning."
        : "Growing: year " + (years + 1) + " of " + durations.growing + " of the stage (the Opening Date was " + words(open) + "); the Corporate & Portfolio Positioning looks ahead to " + words(end) + "."];
}

/** "1 Oct 2026". */
export function dayWords(iso: string): string {
    const day = parse(iso);
    return day ? words(day) : iso;
}

/** An ISO day some whole months later (the same day of the month, as the stage's windows count). */
export function addMonthsIso(iso: string, months: number): string {
    const day = parse(iso);
    if (!day) {
        return iso;
    }
    const later = addMonths(day, months);
    return later.year + "-" + String(later.month).padStart(2, "0") + "-" + String(later.day).padStart(2, "0");
}

/** Whole days from one ISO day to another (negative where the second is earlier). */
export function daysBetween(from: string, to: string): number {
    const one = parse(from);
    const other = parse(to);
    if (!one || !other) {
        return 0;
    }
    return Math.round((Date.UTC(other.year, other.month - 1, other.day) - Date.UTC(one.year, one.month - 1, one.day)) / 86400000);
}
