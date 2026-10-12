import type { AnswerDefinition } from "../model";
import type { InterviewSession } from "../interview";
import { AnswerType } from "../enums/AnswerType.ts";
import { businessPlan, readFoundation, type FoundationSessions } from "./BusinessDocuments.ts";
import { fieldKey, type FieldKey } from "./FieldKeys.ts";
import { pageRailItems } from "../../components/interview/rails/railItems.ts";
import { openItemsOf } from "./OpenItems.ts";
import { pageStatuses } from "./PageStatus.ts";

/** A page as the rail names it: "4. Financial Foundation". */
function pageName(section: { number: number; title: string }): string {
    return pageRailItems([section])[0].label;
}

/*
    WHAT IS LEFT TO LOOK AT, across the four Foundation Systems -- the
    Review page (Review.tsx), in three groups:

      open         Still open: the cards (or sections) with required
                   information missing, and activities with no
                   responsible founder where there are several
                   (OpenItems.ts).
      second-look  Worth a second look: what the financial pages
                   signal (a funding gap, a short runway).
      missing      Missing from the documents: what the Business Plan
                   says the Foundation answers do not cover, where an
                   answer in the Foundation would cover it.

    Only what can be acted on in the app, each item one sentence and
    the place to go and answer it. Worked out from the saved answers
    every time.
*/

export type ReviewGroup = "open" | "second-look" | "missing";

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
        for (const item of openItemsOf(systemNumber, session, section => system + " → " + pageName(section), input.resolveSharedValue)) {
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
        organisationName: input.organisationName
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
    return [...stillOpen(input), ...secondLook(input), ...missing(input)];
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
