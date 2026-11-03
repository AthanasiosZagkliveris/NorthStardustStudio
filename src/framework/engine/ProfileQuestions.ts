import { JOB_INFO, JOB_LEVELS, JOB_RENAMED, type SegmentAnswers, type SegmentContext, type SegmentOption } from "./SegmentQuestions.ts";

/**
 * THE PROFILE'S QUESTIONS (document 36): a typical person of the Segment, asked only what the Segment cannot. A Profile keeps its answers as `questions` (question id -> the option ids chosen; the
 * exact age, A1, is the number as text). Which are asked follows the Segment's own answers; an answer to a question no longer asked is removed; starting values come from the Segment and
 * can be changed. Not built yet: A4 (the kind of business) and A6 (the specialised needs).
 * The job (owner, 2026-11-03): one question per Profile, A3 the kind of work (B2C) or A3b the job level (B2B); A7 who they live with (B2C).
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

/** A7: the ONS household types (Census 2021, household composition 8a), in plain words. */
const HOUSEHOLDS = [
    { id: "alone", label: "Alone" }, { id: "partner", label: "With a partner" }, { id: "family", label: "With a partner and children" },
    { id: "single-parent", label: "Single parent with children" }, { id: "relatives", label: "With parents / relatives" }, { id: "sharing", label: "With friends / housemates" }
] as const;

/** A3b: a B2B Profile's job level (LinkedIn's ten seniority values merged into five). */
const SENIORITY = [
    { id: "owner", label: "Owner / partner" }, { id: "executive", label: "Senior executive" }, { id: "director", label: "Director / head of department" },
    { id: "manager", label: "Manager / team lead" }, { id: "specialist", label: "Specialist / team member" }
] as const;

/** A B2B Profile's kind of work saved before A3b, read as a job level (owner, 2026-11-03). */
const LEVEL_OF_WORK: Record<string, string> = { owner: "owner", manager: "manager", professional: "specialist", technician: "specialist", service: "specialist", operator: "specialist" };

const CARES = ["Lower price", "Speed", "Ease and convenience", "Quality and results", "Trust and reputation", "Expert knowledge", "A service made for them", "Good support", "Safety and low risk", "Shared values or identity"];
const GOALS = ["Get easier access", "Learn something new", "Express who they are", "Meet a requirement", "Win customers or earn more", "Stay within the rules"];
const FRUSTRATIONS = ["It costs too much", "It takes too long", "It is too complicated", "The quality is inconsistent", "It is hard to find someone they trust", "They lack the know-how", "Support is poor", "They worry about mistakes or rules", "They have no time or capacity", "Prices are unclear"];
/** The words of an option said of one person and in no pronoun (the ids stay those of the first wording: they are saved answers). */
const WORDS: Record<string, string> = {
    "express-who-they-are": "Self-expression", "a-service-made-for-them": "A tailored service", "your-website": "Your website",
    "it-costs-too-much": "Cost too high", "it-takes-too-long": "Takes too long", "it-is-too-complicated": "Too complicated", "the-quality-is-inconsistent": "Inconsistent quality",
    "it-is-hard-to-find-someone-they-trust": "Hard to find someone trustworthy", "they-lack-the-know-how": "Lack of know-how", "support-is-poor": "Poor support",
    "they-worry-about-mistakes-or-rules": "Fear of mistakes or breaking rules", "they-have-no-time-or-capacity": "No time / capacity", "prices-are-unclear": "Unclear prices",
    "the-price-or-their-budget": "The price / budget", "whether-they-can-trust-you": "Whether you can be trusted", "whether-it-fits-their-needs": "Whether it fits the need",
    "support-after-they-buy": "Support after the sale", "the-effort-of-switching-from-what-they-use-now": "The effort of switching from the current option",
    "shared-values-or-identity": "Shared values / identity", "risk-or-security": "Risk / security",
    "a-demo-trial-or-sample": "A demo / trial / sample", "a-quote-or-proposal": "A quote / proposal", "a-meeting-or-call": "A meeting / call"
};
const WORRIES = ["The price or their budget", "Whether they can trust you", "How long it takes to start", "How hard it is to use", "Risk or security", "Whether it fits their needs", "Support after they buy", "The effort of switching from what they use now"];

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** What an option says (owner, 2026-11-03): similar things are joined with a slash ("Laptop / desktop"), different things with the word "or" ("Win customers or earn more"). The words shown are the ones written, or their entry in WORDS; the id stays the slug of the words it was first written with. */
const list = (labels: readonly string[]): SegmentOption[] => labels.map(label => ({ id: slug(label), label: WORDS[slug(label)] ?? label }));

const QUESTIONS: readonly ProfileQuestion[] = [
    {
        id: "a2", box: "personal", label: "What is this person's gender?", many: false,
        options: [{ id: "woman", label: "Woman" }, { id: "man", label: "Man" }, { id: "non-binary", label: "Non-binary" }, { id: "other", label: "Another gender" }],
        info: ["Asked only when the Segment's mix leans one way, and it starts from the mix.", "Nothing reads it but the note."]
    },
    {
        id: "a1", box: "personal", label: "How old is {s}?", many: false, number: true, options: [],
        info: ["An exact age within the Segment's age group, for a typical person of the group, not the average.", "If the Segment's age group changes and this age is no longer inside it, the age is cleared."]
    },
    {
        id: "a7", box: "personal", label: "Who does {s} live with?", many: false, options: HOUSEHOLDS,
        info: ["Based on: household types (ONS, Census 2021).", "Children: children living at home. With parents / relatives includes several generations under one roof."]
    },
    {
        id: "a3", box: "personal", label: "What kind of work does {s} do?", many: false, options: JOB_LEVELS,
        info: JOB_INFO
    },
    {
        id: "a3b", box: "personal", label: "What is {p} job level?", many: false, options: SENIORITY,
        info: [
            "Based on: the seniority levels B2B platforms use (LinkedIn), merged into five.",
            "Senior executive: the chief executive, a C-level or a vice president. Trainees and interns: Specialist / team member.",
            "It starts the role in buying: an owner or senior executive makes the final decision; a specialist uses it."
        ]
    },
    {
        id: "a5", box: "personal", label: "What is {p} role in buying?", many: true,
        options: [
            { id: "use", label: "Uses it" }, { id: "influence", label: "Influences the decision" }, { id: "order", label: "Places the order" },
            { id: "decide", label: "Makes the final decision" }, { id: "gate", label: "Controls who reaches the decision-maker" }
        ],
        info: ["The five buying-centre roles credited to Webster and Wind (1972).", "\"Uses it\" is the person who uses the offering day to day, who may be neither the one who pays nor the one who decides."]
    },
    {
        id: "b1", box: "psychographics", label: "What matters most to {o}?", many: true, max: 3, options: list(CARES),
        info: ["What matters most to a typical person of the Segment when choosing.", "Interests, lifestyle and aspirations stay in the note."]
    },
    {
        id: "c1", box: "hubs", label: "Which devices does {s} use?", many: true,
        options: [{ id: "phone", label: "Smartphone" }, { id: "computer", label: "Laptop / desktop" }, { id: "tablet", label: "Tablet" }, { id: "shared", label: "A shared / public device" }, OTHER], other: true,
        info: ["The devices they use to find and buy, not those they own.", "The Segment's choice of where they buy starts this; change it freely."]
    },
    {
        id: "c2", box: "hubs", label: "Which social media does {s} use?", many: true,
        options: [...["Instagram", "Facebook", "LinkedIn", "YouTube", "TikTok", "Pinterest", "X (Twitter)"].map(label => ({ id: slug(label), label })), OTHER], other: true,
        info: ["The platforms they actually use, if any.", "Tick Other to write one that is not listed."]
    },
    {
        id: "c3", box: "hubs", label: "Which communities does {s} belong to?", many: true,
        options: [...["Facebook Group", "Discord", "Reddit", "Slack", "Meetup"].map(label => ({ id: slug(label), label })), OTHER], other: true,
        info: ["Where they ask, read and recommend.", "The names of the groups stay in the note."]
    },
    {
        id: "c4", box: "hubs", label: "Which events does {s} attend?", many: true,
        options: [{ id: "market", label: "Market / Pop-up" }, { id: "fair", label: "Trade Fair / Exhibition" }, { id: "workshop", label: "Workshop / Class" }, { id: "talk", label: "Talk / Conference" }, OTHER], other: true,
        info: ["The kinds of events a typical person of the Segment attends.", "The names of the events stay in the note."]
    },
    {
        id: "d1", box: "habits", label: "How does {s} compare options?", many: true,
        // The ids stay those of the first wording (they are saved answers and the Segment reads them): only the words changed, so a review online and a recommendation by people are told apart.
        options: list(["Your website", "Reviews and recommendations online", "A demo, trial or sample", "A quote or proposal", "What other people recommend", "Comparison sites", "A meeting or call"]).map(option => option.id === "reviews-and-recommendations-online" ? { ...option, label: "Online reviews / ratings" } : option.id === "what-other-people-recommend" ? { ...option, label: "Word of mouth / referrals" } : option),
        info: ["How they weigh options before choosing.", "How they pay and where they buy are the Segment's questions."]
    },
    {
        id: "d2", box: "habits", label: "How much help does {s} want before buying?", many: false,
        options: [{ id: "alone", label: "Works it out alone" }, { id: "little", label: "Likes a little guidance" }, { id: "person", label: "Wants to talk to a person" }, { id: "formal", label: "Needs a formal demonstration or proposal" }],
        info: ["The help a typical person wants before buying; it can differ from how comfortable the Segment is online."]
    },
    { id: "e1", box: "goals", label: "What are {p} main goals?", many: true, max: 3, options: list(GOALS), info: ["Choose up to three.", "What they want to achieve. What matters to them when choosing is asked under Psychographics. Based on: gains (Value Proposition Canvas)."] },
    { id: "e2", box: "challenges", label: "What frustrates {o} about the way it is done now?", many: true, max: 3, options: list(FRUSTRATIONS), info: ["Choose up to three.", "What goes wrong for them today, before they buy from you. Based on: pains (Value Proposition Canvas)."] },
    { id: "e3", box: "objections", label: "What might stop {o} buying from you?", many: true, max: 3, options: list(WORRIES), info: ["Choose up to three.", "Their doubts about buying from you; what frustrates them today is asked above.", "Starts with the price where the Segment's household income is Low; change it freely."] }
];

export const PROFILE_QUESTIONS = QUESTIONS;

/**
 * A Profile is one person, so its questions are written of one: she, he, her, him, his once the gender is answered (the first question), "this person" until then
 * and for any other answer. The questions are stored with {s} (subject: she, he), {o} (object: her, him) and {p} (possessive: her, his); the documents list them as "this person".
 */
export function profileWho(label: string, gender?: string): string {
    const woman = gender === "woman", man = gender === "man";
    return label
        .replace(/{s}/g, woman ? "she" : man ? "he" : "this person")
        .replace(/{o}/g, woman ? "her" : man ? "him" : "this person")
        .replace(/{p}/g, woman ? "her" : man ? "his" : "this person's");
}

/** What the note under each box is for: what the questions above it do not ask (the questions already hold the rest). A point is at most 160 characters. */
export const PROFILE_NOTE_HINTS: Record<ProfileBox, string> = {
    personal: "The note is for what is not asked above: a name, their job title, where they live. Their age, household and work are asked above.",
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
            return !business && (segment.work ?? []).includes("working");
        case "a3b":
            // Self-employed customers: the job level is Owner / partner, set and not asked (profileSettle).
            return business && !(segment.orgtype ?? []).includes("self");
        case "a7": {
            const ages = segment.age ?? [];
            return !business && !context.endsUser && !(ages.length > 0 && ages.every(id => id === "minor"));
        }
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
function startOf(question: ProfileQuestion, segment: SegmentAnswers, context: SegmentContext, answers: SegmentAnswers = {}): string[] | undefined {
    const first = (ids: readonly string[] | undefined) => ids?.[0];
    switch (question.id) {
        case "a2": {
            const mix = first(segment.gender);
            return mix === "men" || mix === "leans-men" ? ["man"] : mix === "women" || mix === "leans-women" ? ["woman"] : undefined;
        }
        case "a5": {
            if ((segment.authorise ?? []).includes("solo")) {
                return ["use", "influence", "order", "decide", "gate"];
            }
            if (context.endsUser) {
                return ["order", "decide"];
            }
            const level = answers.a3b?.[0];
            return level === "owner" || level === "executive" ? ["decide"] : level === "specialist" ? ["use"] : undefined;
        }
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
            const start = startOf(question, segment, context, shown);
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
export function profileSettle(saved: SegmentAnswers, segment: SegmentAnswers, context: SegmentContext): SegmentAnswers {
    const settled: SegmentAnswers = {};
    const business = context.frame === "business";
    const answers: SegmentAnswers = { ...saved };
    // The job as saved before 2026-11-03: a B2B Profile's kind of work becomes its job level; a retired kind of work reads as the one it is now.
    if (business && answers.a3 && !answers.a3b) {
        const level = LEVEL_OF_WORK[answers.a3[0]];
        if (level) {
            answers.a3b = [level];
        }
    }
    if (answers.a3) {
        answers.a3 = answers.a3.map(id => JOB_RENAMED[id] ?? id);
    }
    if (business && (segment.orgtype ?? []).includes("self")) {
        settled.a3b = ["owner"];
    }
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
        return [{ label: profileWho(question.label, answers.a2?.[0]), value: words }];
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
