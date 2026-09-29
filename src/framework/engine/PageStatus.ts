import type { AnswerDefinition, Section } from "../model";
import type { InterviewSession } from "../interview";
import { AnswerType } from "../enums/AnswerType.ts";
import { defaultAnswerValue } from "./AnswerUtils.ts";
import { InterviewValidator } from "./InterviewValidator.ts";

/**
 * Where a page stands, computed from its answers and never set by
 * the user:
 *
 * - `not-started`  -- nothing answered on it yet;
 * - `in-progress`  -- something answered, but a required answer
 *                     still missing;
 * - `defined`      -- every required answer given, by
 *                     InterviewValidator's rules.
 *
 * A System's status is the same three, derived from its pages (see
 * systemStatus).
 */
export type PageStatus = "not-started" | "in-progress" | "defined";

/** The status in words, as the rail's tooltip and the System list say it. */
export const PAGE_STATUS_WORDS: Record<PageStatus, string> = {
    "not-started": "not started",
    "in-progress": "in progress",
    "defined": "defined"
};

// Keys that carry identity or bookkeeping rather than an answer: a
// row's id, a link to another row, a React key.
const BOOKKEEPING_KEY = /^(id|key)$|(Id|Key|Ids|Keys)$/;

// A string longer than this is never a default (defaults are words
// and short codes), so it is not looked up among them -- an image's
// data URL can run to megabytes.
const LONGEST_DEFAULT = 200;

/** Every answer-like leaf in a value: text with a non-space, or a non-zero number. */
function collectLeaves(value: unknown, into: (leaf: string) => void, key = ""): void {

    if (BOOKKEEPING_KEY.test(key)) {
        return;
    }

    if (typeof value === "string") {
        if (/\S/.test(value)) {
            into(value);
        }
        return;
    }

    if (typeof value === "number") {
        if (Number.isFinite(value) && value !== 0) {
            into(String(value));
        }
        return;
    }

    if (Array.isArray(value)) {
        value.forEach(item => collectLeaves(item, into));
        return;
    }

    if (value && typeof value === "object") {
        for (const [childKey, child] of Object.entries(value as Record<string, unknown>)) {
            collectLeaves(child, into, childKey);
        }
    }

}

/**
 * Whether anything has been answered on a page: any text or number
 * in its value that its untouched default does not already hold.
 * Deliberately looser than completeness -- one word in one box is
 * an answer, and turns a page from not started to in progress.
 */
export function hasAnyAnswer(answer: AnswerDefinition, value: unknown): boolean {

    return differsFromDefault(defaultAnswerValue(answer), value);

}

/**
 * Whether a value holds any text or number its untouched default
 * does not: hasAnyAnswer for a whole page, and for one part of a
 * page's value (a section, see SectionStatus.ts) against the same
 * part of the default.
 */
export function differsFromDefault(defaultValue: unknown, value: unknown): boolean {

    const defaults = new Set<string>();

    collectLeaves(defaultValue, leaf => defaults.add(leaf));

    let found = false;

    collectLeaves(value, leaf => {
        if (!found && (leaf.length > LONGEST_DEFAULT || !defaults.has(leaf))) {
            found = true;
        }
    });

    return found;

}

const validator = new InterviewValidator();

/**
 * Every page's status, keyed by Section number.
 *
 * `resolveSharedValue` reads the value behind a Shared Answer from
 * the System it mirrors (as for InterviewValidator.validate); without
 * it such a page is judged by what the session can see.
 *
 * The Strategy System's Roadmap asks nothing -- it is drawn from the
 * pages before it -- so it takes their combined status rather than
 * staying "not started" for ever.
 */
export function pageStatuses(
    session: InterviewSession,
    resolveSharedValue?: (answer: AnswerDefinition) => unknown
): Map<number, PageStatus> {

    const statuses = new Map<number, PageStatus>();
    const derived: Section[] = [];

    for (const section of session.getSections()) {

        if (section.answer?.type === AnswerType.StrategicRoadmap) {
            derived.push(section);
            continue;
        }

        statuses.set(section.number, pageStatus(session, section, resolveSharedValue));

    }

    const answered = Array.from(statuses.values());

    for (const section of derived) {
        statuses.set(section.number, systemStatus(answered));
    }

    return statuses;

}

/** One page's status (see PageStatus). */
export function pageStatus(
    session: InterviewSession,
    section: Section,
    resolveSharedValue?: (answer: AnswerDefinition) => unknown
): PageStatus {

    const answer = section.answer;

    const mirrored = answer?.type === AnswerType.SharedAnswer
        ? validator.mirroredAnswer(answer)
        : undefined;

    const shown = mirrored ?? answer;

    const value = mirrored
        ? resolveSharedValue?.(answer)
        : session.getResponse(section.number);

    if (!shown || !hasAnyAnswer(shown, value)) {
        return "not-started";
    }

    return validator.isPageComplete(session, section, resolveSharedValue)
        ? "defined"
        : "in-progress";

}

/**
 * A System's status from its pages': not started while none has an
 * answer, defined once every page is, and in progress in between.
 */
export function systemStatus(statuses: readonly PageStatus[]): PageStatus {

    if (statuses.every(status => status === "not-started")) {
        return "not-started";
    }

    if (statuses.every(status => status === "defined")) {
        return "defined";
    }

    return "in-progress";

}
