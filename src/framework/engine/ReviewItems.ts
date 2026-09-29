import type { AnswerDefinition } from "../model";
import type { InterviewSession } from "../interview";
import { AnswerType } from "../enums/AnswerType.ts";
import {
    asBusinessCapabilityValue,
    asStrategyFoundationValue,
    BUSINESS_CAPABILITY_SECTIONS,
    BUSINESS_RESOURCE_GROUPS
} from "./AnswerUtils.ts";
import { businessPlan, readFoundation, type FoundationSessions } from "./BusinessDocuments.ts";
import { asFinancialFoundationValue, FINANCIAL_FOUNDATION_SECTIONS, incomeTaxMissing } from "./FinancialModel.ts";
import { fieldKey, sectionSegment, type FieldKey } from "./FieldKeys.ts";
import { InterviewValidator } from "./InterviewValidator.ts";
import { pageStatus } from "./PageStatus.ts";
import { sectionStatuses } from "./SectionStatus.ts";
import { pageRailItems, sectionRailItems } from "../../components/interview/rails/railItems.ts";

/** A page as the rail names it: "4. Financial Foundation". */
function pageName(section: { number: number; title: string }): string {
    return pageRailItems([section])[0].label;
}

/*
    WHAT IS LEFT TO LOOK AT, across the four Foundation Systems -- the
    Review page (Review.tsx), in three groups:

      open         Still open: required answers not given yet, and the
                   Resources whose Status is Needs Investigation.
      second-look  Worth a second look: what the financial pages
                   signal (a funding gap, a short runway).
      missing      Missing from the documents: what the Business Plan
                   says the Foundation answers do not cover.

    Each item is one sentence and, where there is one, the place to go
    and answer it. Worked out from the saved answers every time.
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
}

export interface ReviewInput {
    /** The Foundation Systems' saved sessions, by System number (1 to 4); null where not started. */
    sessions: Record<number, InterviewSession | null>;
    /** The Systems' titles, by number: "Identity System". */
    titles: Record<number, string>;
    /** Reads the value behind a Shared Answer (see PageStatus.pageStatuses). */
    resolveSharedValue?: (answer: AnswerDefinition) => unknown;
    organisationName: string;
}

const validator = new InterviewValidator();

function pageOf(session: InterviewSession | null, type: AnswerType) {
    return session?.getSections().find(section => section.answer?.type === type);
}

/** Required answers not given yet: each page not defined, by its unfinished sections. */
function stillOpen(input: ReviewInput): ReviewItem[] {

    const items: ReviewItem[] = [];

    for (const systemNumber of [1, 2, 3, 4]) {

        const session = input.sessions[systemNumber];
        const system = input.titles[systemNumber];

        if (!session) {
            items.push({ group: "open", text: system + " is not started yet.", place: { systemNumber, sectionNumber: 1 } });
            continue;
        }

        const strategy = pageOf(session, AnswerType.StrategyFoundation);
        const themes = strategy ? asStrategyFoundationValue(session.getResponse(strategy.number)).themes : [];

        for (const section of session.getSections()) {

            // The Roadmap is drawn from the pages before it: nothing to answer there.
            if (section.answer?.type === AnswerType.StrategicRoadmap) {
                continue;
            }

            const status = pageStatus(session, section, input.resolveSharedValue);
            if (status === "defined") {
                continue;
            }

            const page = pageName(section);
            const where = system + " → " + page;
            const shared = section.answer?.type === AnswerType.SharedAnswer;
            const answer = shared && section.answer ? validator.mirroredAnswer(section.answer) : section.answer;
            const value = shared && section.answer ? input.resolveSharedValue?.(section.answer) : session.getResponse(section.number);
            const rails = sectionRailItems(answer, themes);
            const statuses = sectionStatuses(answer, value, { railIds: rails.map(item => item.id), themes, periodValue: session.getResponse(section.number) });
            let open = rails.filter(item => statuses.get(item.id) && statuses.get(item.id) !== "defined");

            // Income tax is asked in the page's settings, above its
            // sections: said as itself, not as an unfinished Costs.
            if (section.answer?.type === AnswerType.FinancialFoundation) {
                const financial = asFinancialFoundationValue(session.getResponse(section.number));
                if (incomeTaxMissing(financial)) {
                    items.push({
                        group: "open",
                        text: where + ": Income Tax: " + (financial.incomeTax === "rate" ? "rate not given yet." : "not chosen yet."),
                        place: { systemNumber, sectionNumber: section.number, key: fieldKey({ systemNumber, sectionNumber: section.number, path: ["income-tax"] }) }
                    });
                    if (financial.planStart.month && financial.planStart.year) {
                        open = open.filter(item => item.id !== sectionSegment(FINANCIAL_FOUNDATION_SECTIONS[0]));
                    }
                    if (open.length === 0) {
                        continue;
                    }
                }
            }

            if (open.length === 0) {
                items.push({
                    group: "open",
                    text: where + (status === "not-started" ? " is not started yet." : " still needs an answer."),
                    place: { systemNumber, sectionNumber: section.number }
                });
                continue;
            }

            for (const item of open) {
                items.push({
                    group: "open",
                    text: where + ": " + item.label.replace(/^\d+(\.\d+)*\.\s+/, "") +
                        (statuses.get(item.id) === "not-started" ? " is not answered yet." : " is not finished."),
                    place: { systemNumber, sectionNumber: section.number, key: fieldKey({ systemNumber, sectionNumber: section.number, path: [item.id] }) }
                });
            }

        }

    }

    return items;

}

/** The Resources whose Status is Needs Investigation. */
function investigating(input: ReviewInput): ReviewItem[] {

    const session = input.sessions[3];
    const page = pageOf(session, AnswerType.BusinessCapability);

    if (!session || !page) {
        return [];
    }

    const capability = asBusinessCapabilityValue(session.getResponse(page.number));
    const [infrastructure, offering] = BUSINESS_CAPABILITY_SECTIONS.map(sectionSegment);
    const items: ReviewItem[] = [];
    const where = input.titles[3] + " → " + pageName(page);

    const item = (name: string, rail: string, card: string, anchors: string[]): ReviewItem => ({
        group: "open",
        text: where + ": " + name + " needs investigation.",
        place: { systemNumber: 3, sectionNumber: page.number, key: fieldKey({ systemNumber: 3, sectionNumber: page.number, path: [rail, card, "status"] }), anchors }
    });

    if (capability.workspace.status === "investigation") {
        items.push(item("The Workspace", infrastructure, "resource-group-workspace", ["resource-group-workspace", "section-infrastructure-resources"]));
    }

    for (const group of BUSINESS_RESOURCE_GROUPS) {
        for (const subsection of capability.resources[group.id] ?? []) {
            subsection.slots.forEach((slot, index) => {
                if (slot.status === "investigation") {
                    items.push(item(slot.name.trim() || (subsection.name.trim() || group.label) + " resource " + (index + 1), infrastructure, slot.id,
                        [slot.id, "subsection-" + group.id + "-" + subsection.id, "resource-group-" + group.id, "section-infrastructure-resources"]));
                }
            });
        }
    }

    capability.offering.resources.forEach((slot, index) => {
        if (slot.status === "investigation") {
            items.push(item(slot.name.trim() || "Offering resource " + (index + 1), offering, slot.id, [slot.id, "section-offering-resources"]));
        }
    });

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
                    place: { systemNumber: 3, sectionNumber: page.number }
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
    "Team Capability Gaps and Cover": { systemNumber: 1, type: AnswerType.FoundersProfile, section: "team-capability-gaps-cover" }
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
            items.push(target && page
                ? {
                    group: "missing",
                    text: "The Business Plan's " + block.text + " is not covered yet: " + input.titles[target.systemNumber] + " → " + pageName(page) + ".",
                    place: {
                        systemNumber: target.systemNumber,
                        sectionNumber: page.number,
                        ...(target.section ? { key: fieldKey({ systemNumber: target.systemNumber, sectionNumber: page.number, path: [target.section] }) } : {})
                    }
                }
                : {
                    group: "missing",
                    text: "The Business Plan's " + block.text + " is not asked for by the Foundation."
                });
        });
    }

    return items;

}

/** Everything left to look at, in the Review page's order. */
export function reviewItems(input: ReviewInput): ReviewItem[] {
    return [...stillOpen(input), ...investigating(input), ...secondLook(input), ...missing(input)];
}

/** How many items there are to act on: those with a place to go. */
export function reviewCount(items: readonly ReviewItem[]): number {
    return items.filter(item => item.place).length;
}

/** How the count of what is left reads: "3 items to look at", or "Nothing open". */
export function reviewCountText(count: number): string {
    return count === 0 ? "Nothing open" : count + (count === 1 ? " item" : " items") + " to look at";
}
