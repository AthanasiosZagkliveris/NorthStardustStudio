import type { AnswerDefinition } from "../model";
import type { InterviewSession } from "../interview";
import { AnswerType } from "../enums/AnswerType.ts";
import { businessPlan, readFoundation, type FoundationSessions } from "./BusinessDocuments.ts";
import { fieldKey, type FieldKey } from "./FieldKeys.ts";
import { pageRailItems } from "../../components/interview/rails/railItems.ts";
import { openItemsOf } from "./OpenItems.ts";
import { pageStatuses } from "./PageStatus.ts";
import { stageMessages, stageOf } from "./BusinessStage.ts";
import { positioningName } from "./ActivityClassification.ts";
import { keyDateText, keyDatesOfSessions } from "./KeyDates.ts";
import { asGlobalSettings, stageDurationsOf } from "./GlobalSettings.ts";

/** A page as the rail names it: "4. Financial Foundation". */
function pageName(section: { number: number; title: string }): string {
    return pageRailItems([section])[0].label;
}

/*
    WHAT IS LEFT TO LOOK AT, across the four Foundation Systems -- the
    Review page (Review.tsx), in four groups:

      open         Still open: the cards (or sections) with required
                   information missing, and activities with no
                   responsible founder where there are several
                   (OpenItems.ts).
      second-look  Worth a second look: what the financial pages
                   signal (a funding gap, a short runway).
      missing      Missing from the documents: what the Business Plan
                   says the Foundation answers do not cover, where an
                   answer in the Foundation would cover it.
      key-dates    Key dates: the milestones of the organization, past and
                   to come (KeyDates.ts); not counted among what is left
                   to look at.

    Only what can be acted on in the app, each item one sentence and
    the place to go and answer it. Worked out from the saved answers
    every time.
*/

export type ReviewGroup = "open" | "second-look" | "key-dates" | "missing";

export interface ReviewPlace {
    systemNumber: number;
    /** The page (a Section number). */
    sectionNumber: number;
    /** The section, card or field to open on it (FieldKeys.ts). */
    key?: FieldKey;
    anchors?: string[];
}

export interface ReviewItem {
    group: ReviewGroup;
    text: string;
    /** Where to go and answer it; absent when there is nowhere to go. */
    place?: ReviewPlace;
    /** The Capability of the System it is in ("foundation"), for grouping. */
    capability?: string;
    /** A key date: whether it is behind, today or ahead (the Review draws a past one quieter). */
    when?: "past" | "today" | "ahead";
}

export interface ReviewInput {
    /**
     * The Systems' saved sessions, by System number: the four
     * Foundation Systems always (null where not started), any other
     * System where it has been worked on.
     */
    sessions: Record<number, InterviewSession | null>;
    /** The Systems' titles, by number: "1. Identity System". */
    titles: Record<number, string>;
    /** Each System's Capability, by number (the Foundation's four when absent). */
    capabilities?: Record<number, string>;
    /** The Systems in the app's order: by Capability, then number (1 to 4 when absent). */
    order?: number[];
    /** Reads the value behind a Shared Answer (see PageStatus.pageStatuses). */
    resolveSharedValue?: (answer: AnswerDefinition) => unknown;
    organisationName: string;
    /** The organization's Global Settings (the Opening Date), as saved. */
    globalSettings?: unknown;
    /** The day the stage's time is counted at (today). */
    today?: Date;
}

function pageOf(session: InterviewSession | null, type: AnswerType) {
    return session?.getSections().find(section => section.answer?.type === type);
}

const FOUNDATION_SYSTEMS = [1, 2, 3, 4];

/**
 * Still open, across the whole app: what is missing, by card or
 * section (OpenItems.ts), in every System worked on -- the four
 * Foundation Systems always, and a Foundation System not started yet
 * as one item; any other System once it holds an answer, so one never
 * opened is not a list of everything it asks. A Resource whose Status
 * is Needs Investigation is a complete answer (its work is its
 * activity), so it is not here.
 */
function stillOpen(input: ReviewInput): ReviewItem[] {

    const items: ReviewItem[] = [];
    const order = input.order ?? FOUNDATION_SYSTEMS;

    for (const systemNumber of order) {
        const session = input.sessions[systemNumber];
        const system = input.titles[systemNumber];
        const capability = input.capabilities?.[systemNumber] ?? "foundation";
        const foundation = FOUNDATION_SYSTEMS.includes(systemNumber);
        if (!session) {
            if (foundation) {
                items.push({ group: "open", text: system + " is not started yet.", place: { systemNumber, sectionNumber: 1 }, capability });
            }
            continue;
        }
        if (!foundation && ![...pageStatuses(session, input.resolveSharedValue).values()].some(status => status !== "not-started")) {
            continue;
        }
        const settings = input.globalSettings === undefined ? undefined : asGlobalSettings(input.globalSettings);
        const stage = stageOf(settings?.openingDate ?? "", input.today ?? new Date(), settings ? stageDurationsOf(settings) : undefined);
        for (const item of openItemsOf(systemNumber, session, section => system + " → " + pageName(section), input.resolveSharedValue, positioningName(stage))) {
            items.push({ group: "open", text: item.text, place: item.place, capability });
        }
    }

    return items;

}

function foundationSessions(input: ReviewInput): FoundationSessions {
    return {
        identity: input.sessions[1],
        brand: input.sessions[2],
        business: input.sessions[3],
        strategy: input.sessions[4],
        organisationName: input.organisationName,
        globalSettings: input.globalSettings
    };
}

/** What the financial pages signal: risks and cautions, each a sentence. */
function secondLook(input: ReviewInput): ReviewItem[] {

    const session = input.sessions[3];
    if (!session) {
        return [];
    }

    const f = readFoundation(foundationSessions(input));
    const foundation = pageOf(session, AnswerType.FinancialFoundation);
    const sustainability = pageOf(session, AnswerType.FinancialSustainability);
    const title = input.titles[3];

    const items: ReviewItem[] = [];
    const add = (signals: { tone: string; title: string; text: string }[], page: typeof foundation) => {
        for (const signal of signals) {
            if ((signal.tone === "risk" || signal.tone === "caution") && page) {
                items.push({
                    group: "second-look",
                    text: title + " → " + pageName(page) + ": " + signal.title + ". " + signal.text,
                    place: { systemNumber: 3, sectionNumber: page.number },
                    capability: "foundation"
                });
            }
        }
    };

    add(f.position.signals, foundation);
    add(f.outlook.signals, sustainability);

    return items;

}

/**
 * HOW MUCH OF THE STAGE'S TIME IS LEFT (the owner: the timings are indicators, written on the Review): the stage comes from the Opening Date, and the Review says how far into its window the
 * business is and what is left of it (BusinessStage.ts). The plan's first day is the earlier of the Opening Date and the earliest cost (derivedPlanStart).
 */
function timing(input: ReviewInput): ReviewItem[] {
    // (An organization with nothing started has no stage's time to look at.)
    if (!input.sessions[1] && !input.sessions[3]) {
        return [];
    }
    const openingDate = input.globalSettings === undefined ? "" : asGlobalSettings(input.globalSettings).openingDate;
    let planStart = "";
    if (input.sessions[3]) {
        const start = readFoundation(foundationSessions(input)).financial.planStart;
        planStart = start.year && start.month ? start.year + "-" + String(start.month).padStart(2, "0") + "-01" : "";
    }
    const durations = input.globalSettings === undefined ? undefined : stageDurationsOf(asGlobalSettings(input.globalSettings));
    return stageMessages(openingDate, planStart, input.today, durations).map(text => ({ group: "second-look" as const, text, capability: "foundation" }));
}

/** THE KEY DATES, the organization's milestones, past and to come, in time order (KeyDates.ts): the plan's start, the registration, the opening and the ends of the stages' windows. */
function keyDateItems(input: ReviewInput): ReviewItem[] {
    if (!input.sessions[1] && !input.sessions[3]) {
        return [];
    }
    return keyDatesOfSessions(foundationSessions(input), input.today).map(entry => ({ group: "key-dates" as const, text: keyDateText(entry, input.today), capability: "foundation", when: entry.when }));
}

/** Where the Business Plan says the Foundation answers do not cover something, and where to answer it. */
const MISSING_PLACES: Record<string, { systemNumber: number; type: AnswerType; section?: string }> = {
    "Market Size and Industry Outlook": { systemNumber: 3, type: AnswerType.BusinessFoundation, section: "customer-segment-and-profile" },
    "Experience and CVs": { systemNumber: 1, type: AnswerType.FoundersProfile, section: "founders" },
    "Capability Gaps and Cover": { systemNumber: 1, type: AnswerType.FoundersProfile, section: "capability-gaps-cover" }
};

function missing(input: ReviewInput): ReviewItem[] {

    const plan = businessPlan(foundationSessions(input));
    const items: ReviewItem[] = [];

    for (const section of plan.sections ?? []) {
        section.blocks.forEach((block, index) => {
            const next = section.blocks[index + 1];
            if (block.kind !== "subheading" || next?.kind !== "paragraph" || next.text !== "Not covered by the Foundation answers.") {
                return;
            }
            const target = MISSING_PLACES[block.text];
            const page = target ? pageOf(input.sessions[target.systemNumber], target.type) : undefined;
            if (!target || !page) {
                return;
            }
            items.push({
                group: "missing",
                capability: "foundation",
                text: "The Business Plan's " + block.text + " is not covered yet: " + input.titles[target.systemNumber] + " → " + pageName(page) + ".",
                place: {
                    systemNumber: target.systemNumber,
                    sectionNumber: page.number,
                    ...(target.section ? { key: fieldKey({ systemNumber: target.systemNumber, sectionNumber: page.number, path: [target.section] }) } : {})
                }
            });
        });
    }

    return items;

}

/** Everything left to look at, in the Review page's order. */
export function reviewItems(input: ReviewInput): ReviewItem[] {
    return [...stillOpen(input), ...secondLook(input), ...timing(input), ...keyDateItems(input), ...missing(input)];
}

/** Whether nothing is left to answer: nothing still open or missing from the documents. */
export function nothingOpen(items: readonly ReviewItem[]): boolean {
    return !items.some(item => item.group === "open" || item.group === "missing");
}

/** How many items there are to act on: those with a place to go. */
export function reviewCount(items: readonly ReviewItem[]): number {
    return items.filter(item => item.place).length;
}

/** How the count of what is left reads: "3 items to look at", or "Nothing open". */
export function reviewCountText(count: number): string {
    return count === 0 ? "Nothing open" : count + (count === 1 ? " item" : " items") + " to look at";
}

/** The header's Review count: what is still open or worth a second look. */
export function headerCount(items: readonly ReviewItem[]): number {
    return items.filter(item => item.group === "open" || item.group === "second-look").length;
}
