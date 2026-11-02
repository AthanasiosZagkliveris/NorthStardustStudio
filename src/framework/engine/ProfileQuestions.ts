import { JOB_LEVELS, type SegmentAnswers, type SegmentContext, type SegmentOption } from "./SegmentQuestions.ts";

/**
 * THE PROFILE'S QUESTIONS (document 36): a typical person of the Segment, asked only what the Segment cannot. A Profile keeps its answers as `questions` (question id -> the option ids chosen; the
 * exact age, A1, is the number as text). Which are asked follows the Segment's own answers; an answer to a question no longer asked is removed; starting values come from the Segment and
 * can be changed. Not built yet: A4 (the kind of business) and A6 (the specialized needs).
 */

export type ProfileBox = "personal" | "psychographics" | "hubs" | "habits" | "goals" | "challenges" | "objections";

export interface ProfileQuestion {
    id: string;
    box: ProfileBox;
    label: string;
    many: boolean;
    /** The most that can be ticked. */
    max?: number;
    /** A number of years, not a choice (A1). */
    number?: boolean;
    options: readonly SegmentOption[];
    /** The list ends with an Other that the user writes in: its words are kept as the answer `<id>-other`. */
    other?: boolean;
    info: readonly string[];
}

const OTHER = { id: "other", label: "Other" } as const;

const CARES = ["Lower price", "Speed", "Ease and convenience", "Quality and results", "Trust and reputation", "Expert knowledge", "A service made for them", "Good support", "Safety and low risk", "Shared values or identity"];
const GOALS = ["Save time", "Save money", "Lower their risk", "Get better results", "Get easier access", "Learn something new", "Express who they are", "Meet a requirement", "Win customers or earn more", "Stay within the rules"];
const FRUSTRATIONS = ["It costs too much", "It takes too long", "It is too complicated", "The quality is inconsistent", "It is hard to find someone they trust", "They lack the know-how", "Support is poor", "They worry about mistakes or rules", "They have no time or capacity", "Prices are unclear"];
const WORRIES = ["The price or their budget", "Whether they can trust you", "How long it takes to start", "How hard it is to use", "Risk or security", "Whether it fits their needs", "Support after they buy", "The effort of switching from what they use now"];

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** What an option says: alternatives are named with a slash, not the word "or" (owner, 2026-11-02); its id stays the slug of the words it was written with. */
const said = (text: string) => /(^|[ ,])or /.test(text) ? text.replace(/, or /g, " / ").replace(/ or /g, " / ").replace(/, /g, " / ") : text;
const list = (labels: readonly string[]): SegmentOption[] => labels.map(label => ({ id: slug(label), label: said(label) }));

const QUESTIONS: readonly ProfileQuestion[] = [
    {
        id: "a1", box: "personal", label: "How old is this typical customer?", many: false, number: true, options: [],
        info: ["An exact age within the Segment's age group, for a typical person of the group, not the average.", "If the Segment's age group changes and this age is no longer inside it, the age is cleared."]
    },
    {
        id: "a2", box: "personal", label: "What is their gender?", many: false,
        options: [{ id: "woman", label: "Woman" }, { id: "man", label: "Man" }, { id: "non-binary", label: "Non-binary" }, { id: "other", label: "Another gender" }],
        info: ["Asked only when the Segment's mix leans one way, and it starts from the mix.", "Nothing reads it but the note."]
    },
    {
        id: "a3", box: "personal", label: "What kind of work do they do?", many: false, options: JOB_LEVELS,
        info: ["The ISCO-08 major groups in plain words: choose the group that fits the role.", "Armed forces: choose the group that fits the role; clergy count as professionals."]
    },
    {
        id: "a5", box: "personal", label: "What part do they play in the purchase?", many: true,
        options: [
            { id: "use", label: "They will use it" }, { id: "influence", label: "They influence the decision" }, { id: "order", label: "They place the order" },
            { id: "decide", label: "They make the final decision" }, { id: "gate", label: "They control who gets to the decision-maker" }
        ],
        info: ["The five buying-centre roles credited to Webster and Wind (1972).", "\"They will use it\" is the person who uses the offering day to day, who may be neither the one who pays nor the one who decides."]
    },
    {
        id: "b1", box: "psychographics", label: "What do they care about most?", many: true, max: 3, options: list(CARES),
        info: ["What matters most to a typical person of the Segment when choosing.", "Interests, lifestyle and aspirations stay in the note."]
    },
    {
        id: "c1", box: "hubs", label: "Which devices do they use?", many: true,
        options: [{ id: "phone", label: "Smartphone" }, { id: "computer", label: "Laptop / desktop" }, { id: "tablet", label: "Tablet" }, { id: "shared", label: "A shared / public device" }, OTHER], other: true,
        info: ["The devices they use to find and buy, not those they own.", "The Segment's choice of where they buy starts this; change it freely."]
    },
    {
        id: "c2", box: "hubs", label: "Which social media do they use?", many: true,
        options: [...["Instagram", "Facebook", "LinkedIn", "YouTube", "TikTok", "Pinterest", "X (Twitter)"].map(label => ({ id: slug(label), label })), OTHER], other: true,
        info: ["The platforms they actually use, if any.", "Tick Other to write one that is not listed."]
    },
    {
        id: "c3", box: "hubs", label: "Which communities do they belong to?", many: true,
        options: [...["Facebook Group", "Discord", "Reddit", "Slack", "Meetup"].map(label => ({ id: slug(label), label })), OTHER], other: true,
        info: ["Where they ask, read and recommend.", "The names of the groups stay in the note."]
    },
    {
        id: "c4", box: "hubs", label: "Which events do they go to?", many: true,
        options: [{ id: "market", label: "Market / Pop-up" }, { id: "fair", label: "Trade Fair / Exhibition" }, { id: "workshop", label: "Workshop / Class" }, { id: "talk", label: "Event / Talk" }, OTHER], other: true,
        info: ["The kinds of events a typical person of the Segment attends.", "The names of the events stay in the note."]
    },
    {
        id: "d1", box: "habits", label: "How do they compare their options?", many: true,
        // The ids stay those of the first wording (they are saved answers and the Segment reads them): only the words changed, so a review online and a recommendation by people are told apart.
        options: list(["Your website", "Reviews and recommendations online", "A demo, trial or sample", "A quote or proposal", "What other people recommend", "Comparison sites", "A meeting or call"]).map(option => option.id === "reviews-and-recommendations-online" ? { ...option, label: "Online reviews / ratings" } : option.id === "what-other-people-recommend" ? { ...option, label: "Word of mouth / referrals" } : option),
        info: ["How they weigh options before choosing.", "How they pay and where they buy are the Segment's questions."]
    },
    {
        id: "d2", box: "habits", label: "How much help do they want before they buy?", many: false,
        options: [{ id: "alone", label: "They work it out themselves" }, { id: "little", label: "They like a little guidance" }, { id: "person", label: "They want to talk to a person" }, { id: "formal", label: "They need a formal demonstration / proposal" }],
        info: ["The help a typical person wants before buying; it can differ from how comfortable the Segment is online."]
    },
    { id: "e1", box: "goals", label: "What are they trying to achieve?", many: true, max: 3, options: list(GOALS), info: ["Choose up to three."] },
    { id: "e2", box: "challenges", label: "What frustrates them today?", many: true, max: 3, options: list(FRUSTRATIONS), info: ["Choose up to three."] },
    { id: "e3", box: "objections", label: "What might stop them buying?", many: true, max: 3, options: list(WORRIES), info: ["Choose up to three.", "Starts with the price where the Segment's household income is Low; change it freely."] }
];

export const PROFILE_QUESTIONS = QUESTIONS;

/** What the note under each box is for: what the questions above it do not ask (the questions already hold the rest). A point is at most 160 characters. */
export const PROFILE_NOTE_HINTS: Record<ProfileBox, string> = {
    personal: "The note is for what is not asked above: a name, who they live with, where they live. Their age and the kind of work are asked above.",
    psychographics: "The note is for what they value, believe in and enjoy, in your words. What matters most when choosing is asked above.",
    hubs: "The note is for names: the groups, accounts, events and places. Which kinds of platform and event they use is asked above.",
    habits: "The note is for what the choices above do not hold: where and when they buy, the terms, the steps.",
    goals: "The note is for what the list above does not say: the details that are theirs.",
    challenges: "The note is for what the list above does not say: the details that are theirs.",
    objections: "The note is for what the list above does not say: the details that are theirs."
};

/** The ages each of the Segment's age terms holds (first number up to, not including, the second). */
const AGE_RANGES: Record<string, [number, number]> = {
    minor: [13, 18], young: [18, 25], established: [25, 40], peak: [40, 55], mature: [55, 65], active: [65, 75], dependent: [75, 130]
};

/** The range of years the Segment's age group allows, or null where it holds none (no group chosen). */
export function profileAgeRange(segment: SegmentAnswers): [number, number] | null {
    const ranges = (segment.age ?? []).map(id => AGE_RANGES[id]).filter((range): range is [number, number] => !!range);
    return ranges.length === 0 ? null : [Math.min(...ranges.map(range => range[0])), Math.max(...ranges.map(range => range[1]))];
}

export function profileQuestionAsked(question: ProfileQuestion, segment: SegmentAnswers, context: SegmentContext): boolean {
    const business = context.frame === "business";
    switch (question.id) {
        case "a2":
            return !business && !!segment.gender?.length && !segment.gender.includes("balanced");
        case "a3":
            // Self-employed customers: the job level is Owner / senior executive and is not asked.
            return business ? !(segment.orgtype ?? []).includes("self") : (segment.work ?? []).includes("working");
        case "a5":
            return business || context.endsUser || (segment.age ?? []).includes("minor");
        case "c2":
            return !(segment.comfort ?? []).includes("averse") || (segment.comfort ?? []).length === 0;
        case "c3":
            return (segment.discover ?? []).includes("communities");
        case "c4":
            return (segment.social ?? []).some(id => id === "mixed" || id === "inperson");
        case "d1":
            return !(segment.path ?? []).includes("impulse");
        default:
            return true;
    }
}

/** The questions of one box a Profile is asked. */
export function profileQuestionsOf(box: ProfileBox, segment: SegmentAnswers, context: SegmentContext): ProfileQuestion[] {
    return QUESTIONS.filter(question => question.box === box && profileQuestionAsked(question, segment, context));
}

/** What the Segment sets for a question that is not shown, or starts for one that is (the user can change a start). */
function startOf(question: ProfileQuestion, segment: SegmentAnswers, context: SegmentContext): string[] | undefined {
    const first = (ids: readonly string[] | undefined) => ids?.[0];
    switch (question.id) {
        case "a2": {
            const mix = first(segment.gender);
            return mix === "men" || mix === "leans-men" ? ["man"] : mix === "women" || mix === "leans-women" ? ["woman"] : undefined;
        }
        case "a5":
            return (segment.authorise ?? []).includes("solo") ? ["use", "influence", "order", "decide", "gate"] : context.endsUser ? ["order", "decide"] : undefined;
        case "c1": {
            const setting = first(segment.setting);
            return setting === "mobile" ? ["phone"] : setting === "desktop" ? ["computer"] : setting === "multi" ? ["phone", "computer"] : undefined;
        }
        case "d1": {
            const path = first(segment.path);
            return path === "researcher" ? ["reviews-and-recommendations-online"] : path === "validator" ? ["what-other-people-recommend"] : undefined;
        }
        case "d2": {
            if ((segment.authorise ?? []).includes("procurement")) {
                return ["formal"];
            }
            const comfort = first(segment.comfort);
            return comfort === "savvy" ? ["alone"] : comfort === "averse" ? ["person"] : undefined;
        }
        case "e3":
            return (segment.income ?? []).includes("low") ? ["the-price-or-their-budget"] : undefined;
        default:
            return undefined;
    }
}

/** The answers a Profile shows: its own, with a start for each question asked and never answered. */
export function profileShown(answers: SegmentAnswers, segment: SegmentAnswers, context: SegmentContext): SegmentAnswers {
    const shown: SegmentAnswers = { ...answers };
    for (const question of QUESTIONS) {
        if (!(question.id in shown) && profileQuestionAsked(question, segment, context)) {
            const start = startOf(question, segment, context);
            if (start) {
                shown[question.id] = start;
            }
        }
    }
    return profileSettle(shown, segment, context);
}

/** A choice made on a question: a limit is held. */
export function profileChoose(question: ProfileQuestion, answers: SegmentAnswers, next: string[]): SegmentAnswers {
    let chosen = next;
    if (question.max !== undefined) {
        chosen = chosen.slice(0, question.max);
    }
    return { ...answers, [question.id]: chosen };
}

/** The answers settled against what is asked now: a question no longer asked, an option not offered, an age outside the Segment's group, a limit passed, is removed. */
export function profileSettle(answers: SegmentAnswers, segment: SegmentAnswers, context: SegmentContext): SegmentAnswers {
    const settled: SegmentAnswers = {};
    for (const question of QUESTIONS) {
        const chosen = answers[question.id];
        if (!chosen || !profileQuestionAsked(question, segment, context)) {
            continue;
        }
        if (question.number) {
            const age = Number(chosen[0]);
            const range = profileAgeRange(segment);
            if (Number.isFinite(age) && chosen[0] !== "" && (!range || (age >= range[0] && age < range[1]))) {
                settled[question.id] = chosen;
            }
            continue;
        }
        const offered = chosen.filter(id => question.options.some(option => option.id === id));
        const held = question.max !== undefined ? offered.slice(0, question.max) : offered;
        settled[question.id] = question.many ? held : held.slice(0, 1);
        const written = answers[question.id + "-other"];
        if (question.other && held.includes("other") && written) {
            settled[question.id + "-other"] = written;
        }
    }
    return settled;
}

/** What a Profile's answers say, as lines for the documents and the exports. */
export function profileAnswerLines(answers: SegmentAnswers): { label: string; value: string }[] {
    return QUESTIONS.flatMap(question => {
        const chosen = answers[question.id] ?? [];
        if (chosen.length === 0) {
            return [];
        }
        const other = (answers[question.id + "-other"]?.[0] ?? "").trim();
        const words = question.number ? chosen[0] + " years" : chosen.map(id => id === "other" && other ? "Other: " + other : question.options.find(option => option.id === id)?.label ?? id).join("; ");
        return [{ label: question.label, value: words }];
    });
}

export function asProfileAnswers(source: unknown): SegmentAnswers {
    if (!source || typeof source !== "object") {
        return {};
    }
    const result: SegmentAnswers = {};
    for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
        if (Array.isArray(value) && value.every(entry => typeof entry === "string")) {
            result[key] = value as string[];
        }
    }
    return result;
}
