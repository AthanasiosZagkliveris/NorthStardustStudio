import { JOB_INFO, JOB_LEVELS, JOB_RENAMED, type SegmentAnswers, type SegmentContext, type SegmentOption } from "./SegmentQuestions.ts";

/**
 * THE PROFILE'S QUESTIONS (document 36): a typical person of the Segment, asked only what the Segment cannot. A Profile keeps its answers as `questions` (question id -> the option ids chosen; the
 * exact age, A1, is the number as text). Which are asked follows the Segment's own answers; an answer to a question no longer asked is removed; starting values come from the Segment and
 * can be changed. Not built yet: A4 (the kind of business) and A6 (the specialised needs).
 * The job (owner, 2026-11-03): one question per Profile, A3 the kind of work (B2C) or A3b the job level (B2B); A7 who they live with (B2C).
 */

export type ProfileBox = "personal" | "psychographics" | "hubs" | "habits" | "goals" | "challenges" | "objections" | "needs";

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
    /** Each tick is rated from 1 to 5 (doc 36, section 11): the words over its ends. The ratings are kept as the answer `<id>-rating`, one "option:point" each. */
    rating?: { low: string; high: string };
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
const FRUSTRATIONS = ["It costs too much", "It takes too long", "It is too complicated", "The quality is inconsistent", "It is hard to find someone they trust", "They lack the know-how", "They have no time or capacity"];

/** Options merged into another (owner, 2026-11-06): a saved tick of the first is read as the second; with both ticked it is one tick, the higher rating kept. */
const MERGED: Readonly<Record<string, Readonly<Record<string, string>>>> = {
    e2: { "prices-are-unclear": "it-costs-too-much", "they-worry-about-mistakes-or-rules": "they-lack-the-know-how", "support-is-poor": "it-is-too-complicated" }
};
/** The words of an option said of one person and in no pronoun (the ids stay those of the first wording: they are saved answers). */
const WORDS: Record<string, string> = {
    // One word for each option of the six questions (owner, 2026-11-06), what each means a line of its question's "i".
    // What matters most (B1, L1).
    "lower-price": "Affordability", "ease-and-convenience": "Convenience", "quality-and-results": "Quality", "trust-and-reputation": "Reputation", "expert-knowledge": "Expertise",
    "a-service-made-for-them": "Personalisation", "good-support": "Support", "safety-and-low-risk": "Safety / security", "shared-values-or-identity": "Values",
    // Goals (E1, L4).
    "get-easier-access": "Accessibility", "learn-something-new": "Development", "express-who-they-are": "Expression", "meet-a-requirement": "Compliance",
    "win-customers-or-earn-more": "Revenue", "stay-within-the-rules": "Governance",
    // Frustrations (E2, L3; three merged).
    "it-costs-too-much": "Cost", "it-takes-too-long": "Delays", "it-is-too-complicated": "Complexity", "the-quality-is-inconsistent": "Inconsistency",
    "it-is-hard-to-find-someone-they-trust": "Trust", "they-lack-the-know-how": "Insecurity", "they-have-no-time-or-capacity": "Capacity",
    // Worries (E3, L2).
    "the-price-or-their-budget": "Price", "whether-they-can-trust-you": "Credibility", "how-long-it-takes-to-start": "Onboarding", "how-hard-it-is-to-use": "Complexity",
    "risk-or-security": "Risk", "whether-it-fits-their-needs": "Fit", "support-after-they-buy": "Support", "the-effort-of-switching-from-what-they-use-now": "Migration",
    // Emotional needs.
    "calm-and-worry-free": "Calm", "rewarded-treated": "Rewarded", "relaxed-looked-after": "Nurtured", "healthy-and-well": "Healthy", "delighted-by-how-it-looks": "Delighted",
    "reminded-of-good-times": "Nostalgic", "fulfilled-as-they-grow": "Fulfilled",
    "sure-they-made-the-right-choice": "Confident", "growing-in-their-work": "Prosperous", "hopeful-about-their-business": "Optimistic", "inspired-about-what-comes-next": "Inspired",
    // Social needs.
    "as-having-good-taste-style": "Stylish", "as-part-of-a-group-they-value": "Included", "as-one-of-the-few-with-access": "Exclusive",
    "as-caring-for-others-or-the-planet": "Altruistic", "as-leaving-something-for-their-family": "Impactful",
    "as-someone-others-trust": "Trusted", "as-well-connected": "Influential", "as-more-valued-in-their-field": "Respected", "as-a-responsible-business": "Responsible",
    // Other questions' words.
    "your-website": "Your website", "a-demo-trial-or-sample": "A demo / trial / sample", "a-quote-or-proposal": "A quote / proposal", "a-meeting-or-call": "A meeting / call"
};
const WORRIES = ["The price or their budget", "Whether they can trust you", "How long it takes to start", "How hard it is to use", "Risk or security", "Whether it fits their needs", "Support after they buy", "The effort of switching from what they use now"];

/** The Emotional and Social needs as choices (doc 36, section 10; owner 2026-11-03): Bain's Elements of Value [FUN-48, FUN-49] in plain words, by the Segment's kind. */
const EMOTIONAL_PEOPLE = ["Calm and worry-free", "Rewarded / treated", "Relaxed / looked after", "Entertained", "Attractive", "Healthy and well", "Delighted by how it looks", "Reminded of good times", "Motivated", "Hopeful", "Fulfilled, as they grow"];
const EMOTIONAL_BUSINESS = ["Sure they made the right choice", "Glad to work with you", "Growing in their work", "Hopeful about their business", "Inspired about what comes next"];
const SOCIAL_PEOPLE = ["As having good taste / style", "As part of a group they value", "As one of the few with access", "As caring for others or the planet", "As leaving something for their family"];
const SOCIAL_BUSINESS = ["As someone others trust", "As well connected", "As more valued in their field", "As a responsible business"];
const NEEDS_INFO = (what: string, example: string) => ["The " + what + " that make them buy, not every one they have. Choose up to three, then rate each.", example, "Based on: Bain's Elements of Value (HBR, 2016 and 2018)."];

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** What an option says (owner, 2026-11-03): similar things are joined with a slash ("Laptop / desktop"), different things with the word "or" ("Win customers or earn more"). The words shown are the ones written, or their entry in WORDS; the id stays the slug of the words it was first written with. */
const list = (labels: readonly string[]): SegmentOption[] => labels.map(label => ({ id: slug(label), label: WORDS[slug(label)] ?? label }));

const QUESTIONS: readonly ProfileQuestion[] = [
    {
        id: "a2", box: "personal", label: "What is this person's gender?", many: false,
        options: [{ id: "woman", label: "Woman" }, { id: "man", label: "Man" }, { id: "non-binary", label: "Non-binary" }, { id: "other", label: "Another gender" }],
        info: ["Asked only when the Segment's gender mix is not 3 (balanced); it starts from the mix. Change it freely."]
    },
    {
        id: "a1", box: "personal", label: "How old is {s}?", many: false, number: true, options: [],
        info: ["One age within the Segment's age group: a typical person, not the average.", "If the Segment's age group changes and this age falls outside it, the age is cleared."]
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
        id: "b1", box: "psychographics", label: "What matters most to {o}?", many: true, max: 5, options: list(CARES), rating: { low: "Optional", high: "Essential" },
        info: ["What they weigh when choosing between offers. Tick up to five, then rate how much each matters.", "For example, a busy parent may weigh Speed and Convenience; a collector, Quality.",
            "Affordability: a price they can pay. Convenience: easy to find, buy and use. Reputation: a name they trust. Expertise: deep knowledge.",
            "Personalisation: made for them, not for everyone. Safety / security: low risk, nothing goes wrong. Values: it stands for what they believe in.", "Write their interests, lifestyle and hopes in the note."]
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
        info: ["Where they ask, read and recommend.", "Write the names of the groups in the note."]
    },
    {
        id: "c4", box: "hubs", label: "Which events does {s} attend?", many: true,
        options: [{ id: "market", label: "Market / pop-up" }, { id: "fair", label: "Trade fair / exhibition" }, { id: "workshop", label: "Workshop / class" }, { id: "talk", label: "Talk / conference" }, OTHER], other: true,
        info: ["The kinds of events a typical person of the Segment goes to.", "Write the names of the events in the note."]
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
    { id: "e1", box: "goals", label: "What does {s} want to achieve?", many: true, max: 3, options: list(GOALS), rating: { low: "Minor", high: "Main" }, info: ["The results they are after, not what they weigh when choosing (that is \"What matters most\"). Choose up to three, then rate each.", "For example, to learn a new craft, or to win more clients.", "Accessibility: getting something hard to reach. Development: learning something new. Expression: showing who they are. Revenue: winning customers or income.", "Compliance: meeting a requirement, at work or by law. Governance: staying within the rules.", "Based on: gains (Value Proposition Canvas)."] },
    { id: "e2", box: "challenges", label: "What frustrates {o} today?", many: true, max: 3, options: list(FRUSTRATIONS), rating: { low: "Mild", high: "Severe" }, info: ["What goes wrong with the way they do it now, before they buy from you. Choose up to three, then rate how much each bothers them.", "For example, the cheap version breaks too soon, or nobody explains how to start.", "Cost: too costly, or unclear prices. Delays: it takes too long. Inconsistency: results vary. Trust: hard to find someone reliable.", "Insecurity: not knowing how, or fearing a mistake. Capacity: no time or staff. Complexity: too complicated, or poor support.", "Based on: pains (Value Proposition Canvas)."] },
    // The Needs (doc 36, section 10): Emotional and Social ticked and rated, by the Segment's kind; Functional stays the numbered list. Each kind's list stays as its note.
    { id: "emotional", box: "needs", label: "How does {s} want to feel?", many: true, max: 3, options: list(EMOTIONAL_PEOPLE), rating: { low: "Mild", high: "Strong" }, info: [...NEEDS_INFO("feelings", "For example, calm when a delivery arrives on time, or delighted by how a room looks."), "Rewarded: treated to something special. Nurtured: looked after. Delighted: by how it looks. Nostalgic: reminded of good times. Fulfilled: growing as a person."] },
    { id: "emotional-b2b", box: "needs", label: "How does {s} want to feel?", many: true, max: 3, options: list(EMOTIONAL_BUSINESS), rating: { low: "Mild", high: "Strong" }, info: [...NEEDS_INFO("feelings", "For example, sure they chose the right supplier, or glad to work with you again."), "Confident: sure they made the right choice. Prosperous: growing in their work. Optimistic: hopeful about their business."] },
    { id: "social", box: "needs", label: "How does {s} want to be seen?", many: true, max: 3, options: list(SOCIAL_PEOPLE), rating: { low: "Mild", high: "Strong" }, info: [...NEEDS_INFO("ways of being seen by others", "For example, as stylish when friends visit, or as caring for the planet."), "Included: part of a group they value. Exclusive: one of the few with access. Altruistic: caring for others or the planet. Impactful: leaving a legacy."] },
    { id: "social-b2b", box: "needs", label: "How does {s} want to be seen?", many: true, max: 3, options: list(SOCIAL_BUSINESS), rating: { low: "Mild", high: "Strong" }, info: [...NEEDS_INFO("ways of being seen by others", "For example, as someone colleagues trust, or as a responsible business."), "Influential: well connected. Respected: valued in their field."] },
    { id: "e3", box: "objections", label: "What might hold {o} back?", many: true, max: 3, options: list(WORRIES), rating: { low: "Minor", high: "Blocking" }, info: ["Their doubts about buying from you, not what frustrates them today (the question above). Choose up to three, then rate each.", "For example, whether a beginner can keep up, or whether you will still be there after the sale.", "Credibility: whether you can be trusted. Onboarding: the time to get started. Complexity: how hard it is to use. Fit: whether it suits their need.", "Support: help after buying. Migration: the work of leaving what they use now. Risk: risk or security.", "Starts with the price where the Segment's household income is rated 1; change it freely."] }
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
    objections: "The note is for what the list above does not say: the details that are theirs.",
    needs: "What no tick above says, in your words, one line each. The Value Proposition lists these lines."
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
            // The gender mix, a rating: 3 is a balanced mix, where the Profile's gender is not asked.
            return !business && !!segment.gender?.length && !segment.gender.includes("3");
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
            // Asked unless the Segment's online comfort is rated 1, Not comfortable (doc 36).
            return !(segment.comfort ?? []).includes("1");
        case "c3":
            return (segment.discover ?? []).includes("communities");
        case "c4":
            return (segment.social ?? []).some(id => id === "mixed" || id === "inperson");
        case "d1":
            return !(segment.path ?? []).includes("impulse");
        // The Needs' lists follow the Segment's kind: a business buyer's, or a person's (doc 36, section 10).
        case "emotional": case "social":
            return !business;
        case "emotional-b2b": case "social-b2b":
            return business;
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
            return mix === "1" || mix === "2" ? ["man"] : mix === "4" || mix === "5" ? ["woman"] : undefined;
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
            // The online comfort, a rating: 4 or 5 starts Works it out alone, 1 or 2 Wants to talk to a person.
            return comfort === "4" || comfort === "5" ? ["alone"] : comfort === "1" || comfort === "2" ? ["person"] : undefined;
        }
        case "e3":
            // The household income, a rating: 1 (low) starts the worry about price.
            return (segment.income ?? []).includes("1") ? ["the-price-or-their-budget"] : undefined;
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

/** The ratings of a question's ticks, by option id (1 to 5); a tick not rated has none. */
export function profileRatings(answers: SegmentAnswers, question: ProfileQuestion): Partial<Record<string, 1 | 2 | 3 | 4 | 5>> {
    const ratings: Partial<Record<string, 1 | 2 | 3 | 4 | 5>> = {};
    for (const entry of answers[question.id + "-rating"] ?? []) {
        const [id, point] = entry.split(":");
        const value = Number(point);
        if (value >= 1 && value <= 5) {
            ratings[id] = value as 1 | 2 | 3 | 4 | 5;
        }
    }
    return ratings;
}

/** A tick rated, or its rating cleared (`undefined`). */
export function profileRate(question: ProfileQuestion, answers: SegmentAnswers, id: string, point: number | undefined): SegmentAnswers {
    const others = (answers[question.id + "-rating"] ?? []).filter(entry => entry.split(":")[0] !== id);
    const next = point === undefined ? others : [...others, id + ":" + point];
    const result = { ...answers };
    if (next.length > 0) {
        result[question.id + "-rating"] = next;
    } else {
        delete result[question.id + "-rating"];
    }
    return result;
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
        // A tick's rating stays while it is ticked; an untick takes its rating with it.
        if (question.rating) {
            const rated = (answers[question.id + "-rating"] ?? []).filter(entry => {
                const [id, point] = entry.split(":");
                return held.includes(id) && ["1", "2", "3", "4", "5"].includes(point);
            });
            if (rated.length > 0) {
                settled[question.id + "-rating"] = rated;
            }
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
        const ratings = question.rating ? profileRatings(answers, question) : {};
        // A rated list prints each tick with its rating, the highest first; a tick not rated follows, in the order ticked (doc 36, section 11).
        const order = question.rating ? [...chosen].sort((a, b) => (ratings[b] ?? 0) - (ratings[a] ?? 0)) : chosen;
        const words = question.number ? chosen[0] + " years" : order.map(id => {
            const label = id === "other" && other ? "Other: " + other : question.options.find(option => option.id === id)?.label ?? id;
            return ratings[id] ? label + " (" + ratings[id] + "/5)" : label;
        }).join("; ");
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
    // Merged options (owner, 2026-11-06): a tick of a merged one is a tick of the one kept, counted once; its rating is kept where it is the higher.
    for (const [id, merged] of Object.entries(MERGED)) {
        const into = (option: string) => merged[option] ?? option;
        if (result[id]) {
            result[id] = [...new Set(result[id].map(into))];
        }
        const ratings = result[id + "-rating"];
        if (ratings) {
            const best = new Map<string, string>();
            for (const entry of ratings) {
                const [option, point] = entry.split(":");
                const kept = into(option);
                if (!best.has(kept) || Number(point) > Number(best.get(kept))) {
                    best.set(kept, point);
                }
            }
            result[id + "-rating"] = [...best].map(([option, point]) => option + ":" + point);
        }
    }
    return result;
}

/** A Profile the app proposes for a business Segment: its name and its roles in buying (A5), set when it is added. */
export interface ProposedProfile {
    id: "decider" | "user" | "checker" | "buyer" | "checker-buyer";
    name: string;
    roles: string[];
}

const ALL_ROLES = ["use", "influence", "order", "decide", "gate"];

/**
 * The Profiles proposed for a business Segment, by buying role (Webster and Wind, 1972), read from its "Who decides to buy?":
 * one person decides, one Profile with every role; a team or a manager, a user and a decider; several departments, a checker;
 * formal procurement, a buyer; both of the last two, one checker and buyer, so never more than three. A proposal whose name a
 * Profile of the Segment already has is not offered again. Nothing is proposed for people, or before the question is answered.
 */
export function proposedBusinessProfiles(segment: SegmentAnswers, context: SegmentContext, names: string[] = []): ProposedProfile[] {
    if (context.frame !== "business") {
        return [];
    }
    const decides = segment.authorise ?? [];
    const has = (id: string) => decides.includes(id);
    const team = has("champions") || has("executive") || has("multi") || has("procurement");
    const proposed: ProposedProfile[] = [];
    if (team) {
        proposed.push({ id: "user", name: "User", roles: ["use", "influence"] });
        proposed.push({ id: "decider", name: "Decider", roles: ["decide"] });
        if (has("multi") && has("procurement")) {
            proposed.push({ id: "checker-buyer", name: "Checker and buyer", roles: ["influence", "order", "gate"] });
        } else if (has("multi")) {
            proposed.push({ id: "checker", name: "Checker", roles: ["influence"] });
        } else if (has("procurement")) {
            proposed.push({ id: "buyer", name: "Buyer", roles: ["order", "gate"] });
        }
    } else if (has("solo")) {
        proposed.push({ id: "decider", name: "Decider", roles: ALL_ROLES });
    }
    const taken = new Set(names.map(name => name.trim().toLowerCase()));
    return proposed.filter(profile => !taken.has(profile.name.toLowerCase()));
}
