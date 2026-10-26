/**
 * THE KEY DATES, the milestones of an organization, past and to come (the owner, 2026-10-24: "on Review a section with the Key dates, existing and future, as milestones; the same on the Calendar"):
 * the plan's start, the day the organization was registered, the Opening Date, and the ends of the stages' windows that follow from the opening (Launching 12 months after it, Managing 24, the Growing
 * window 5 years). Each says how long ago it was or how long is left. The Review lists them in time order; the Calendar marks them as "Key dates".
 */
import { readFoundation, type FoundationSessions } from "./BusinessDocuments.ts";
import { asGlobalSettings, stageDurationsOf } from "./GlobalSettings.ts";
import { DEFAULT_STAGE_DURATIONS, addMonthsIso, dayWords, daysBetween, stageEnds, type StageDurations } from "./BusinessStage.ts";

export type KeyDateKind = "plan-start" | "registered" | "opening" | "launching-ends" | "managing-ends" | "growing-ends";

export interface KeyDate {
    id: KeyDateKind;
    /** ISO "YYYY-MM-DD". */
    date: string;
    /** What the day is: "Opening Date". */
    label: string;
    /** What it means for the business, one short clause. */
    detail: string;
    when: "past" | "today" | "ahead";
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

function todayIso(today: Date): string {
    return today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
}

/** How far a day is from today, in the words the Review and the Calendar use: "today", "12 days ago", "in 3 months", "2 years ago". */
export function relativeDay(iso: string, today: Date = new Date()): string {
    const days = daysBetween(todayIso(today), iso);
    if (days === 0) {
        return "today";
    }
    const size = Math.abs(days);
    const span = size < 60 ? size + (size === 1 ? " day" : " days") : size < 700 ? Math.round(size / 30.4) + " months" : (Math.round(size / 36.5) / 10) + " years";
    return days < 0 ? span + " ago" : "in " + span;
}

/** The milestones the dates give, in time order. A date that is missing is not a milestone. */
export function keyDates(input: { planStart: string; registrationDate: string; openingDate: string; durations?: StageDurations }, today: Date = new Date()): KeyDate[] {
    const durations = input.durations ?? DEFAULT_STAGE_DURATIONS;
    const ends = stageEnds(durations);
    const now = todayIso(today);
    const entries: Omit<KeyDate, "when">[] = [];
    const add = (id: KeyDateKind, date: string, label: string, detail: string) => {
        if (ISO.test(date)) {
            entries.push({ id, date, label, detail });
        }
    };
    add("plan-start", input.planStart, "Plan starts", "month 1 of the financial plan");
    add("registered", input.registrationDate, "Organization registered", "the registry's day");
    add("opening", input.openingDate, "Opening Date", "the business opens: Launching begins");
    if (ISO.test(input.openingDate)) {
        add("launching-ends", addMonthsIso(input.openingDate, ends.launching), "Launching window ends", "prove the Early Positioning Statement or change it; Managing begins");
        add("managing-ends", addMonthsIso(input.openingDate, ends.managing), "Managing window ends", "Growing begins");
        add("growing-ends", addMonthsIso(input.openingDate, ends.growing), "Growing window ends", "the end of the stage's years");
    }
    return entries
        .sort((one, other) => one.date.localeCompare(other.date))
        .map(entry => ({ ...entry, when: entry.date < now ? "past" as const : entry.date === now ? "today" as const : "ahead" as const }));
}

/** One line for the Review: "Opening Date: 1 Oct 2026 (24 days ago), the business opens: Launching begins". */
export function keyDateText(entry: KeyDate, today: Date = new Date()): string {
    return entry.label + ": " + dayWords(entry.date) + " (" + relativeDay(entry.date, today) + "), " + entry.detail + ".";
}

/** The key dates of an organization, read from its saved Foundation answers. */
export function keyDatesOfSessions(sessions: FoundationSessions, today: Date = new Date()): KeyDate[] {
    const foundation = readFoundation(sessions);
    const start = foundation.financial.planStart;
    const planStart = start.year && start.month ? start.year + "-" + String(start.month).padStart(2, "0") + "-01" : "";
    const formation = foundation.legalEntity.formation;
    return keyDates({
        planStart,
        registrationDate: formation.date,
        openingDate: sessions.globalSettings === undefined ? "" : asGlobalSettings(sessions.globalSettings).openingDate,
        durations: sessions.globalSettings === undefined ? undefined : stageDurationsOf(asGlobalSettings(sessions.globalSettings))
    }, today);
}
