import { JOB_INFO, JOB_LEVELS, JOB_RENAMED, SEGMENT_QUESTIONS, ratingOptions, ratingWords, segmentServesPeople, type SegmentAnswers, type SegmentContext, type SegmentOption } from "./SegmentQuestions.ts";
import { choiceLimit } from "./PositioningIds.ts";

/**
 * THE PROFILE'S QUESTIONS (document 36): a typical person of the Segment, asked only what the Segment cannot. A Profile keeps its answers as `questions` (question id -> the option ids chosen; the
 * exact age, A1, is the number as text). Which are asked follows the Segment's own answers; an answer to a question no longer asked is removed; starting values come from the Segment and
 * can be changed. Not built yet: A4 (the kind of business) and A6 (the specialised needs).
 * The job (owner, 2026-11-03): one question per Profile, A3 the kind of work (B2C) or A3b the job level (B2B); A7 who they live with (B2C).
 * A Segment with an end user (Proxy or Dual-Intent) splits each Profile into the buyer's part and the end user's (owner, 2026-11-08; see "THE BUYER AND THE END USER" below).
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
// (2026-11-08, the research: "Stay within the rules" merged into "Meet a requirement"; three goals added. "Enjoy themselves" is a person's goal, not offered to a business Profile.)
const GOALS = ["Get easier access", "Learn something new", "Express who they are", "Meet a requirement", "Win customers or earn more", "Save time / money", "Get a problem fixed", "Enjoy themselves"];
/** E1's goal a business Profile is not offered (profileOptionsOf). */
const PEOPLE_GOALS = ["enjoy-themselves"];
const FRUSTRATIONS = ["It costs too much", "It takes too long", "It is too complicated", "The quality is inconsistent", "It is hard to find someone they trust", "They lack the know-how", "They have no time or capacity"];

/** Options merged into another (owner, 2026-11-06; E1, 2026-11-08): a saved tick of the first is read as the second; with both ticked it is one tick, the higher rating kept. */
const MERGED: Readonly<Record<string, Readonly<Record<string, string>>>> = {
    e1: { "stay-within-the-rules": "meet-a-requirement" },
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
    "win-customers-or-earn-more": "Revenue", "save-time-money": "Efficiency", "get-a-problem-fixed": "Resolution", "enjoy-themselves": "Enjoyment",
    // Frustrations (E2, L3; three merged; Hassle and Skills gap renamed 2026-11-08, the ids kept).
    "it-costs-too-much": "Cost", "it-takes-too-long": "Delays", "it-is-too-complicated": "Hassle", "the-quality-is-inconsistent": "Inconsistency",
    "it-is-hard-to-find-someone-they-trust": "Trust", "they-lack-the-know-how": "Skills gap", "they-have-no-time-or-capacity": "Capacity",
    // Worries (E3, L2; Image added 2026-11-08).
    "the-price-or-their-budget": "Price", "whether-they-can-trust-you": "Credibility", "how-long-it-takes-to-start": "Onboarding", "how-hard-it-is-to-use": "Complexity",
    "risk-or-security": "Risk", "whether-it-fits-their-needs": "Fit", "support-after-they-buy": "Support", "the-effort-of-switching-from-what-they-use-now": "Migration",
    "what-others-will-think": "Image",
    // Emotional needs.
    "calm-and-worry-free": "Calm", "rewarded-treated": "Rewarded", "relaxed-looked-after": "Nurtured", "healthy-and-well": "Healthy", "delighted-by-how-it-looks": "Delighted",
    "reminded-of-good-times": "Nostalgic", "fulfilled-as-they-grow": "Fulfilled", "proud-of-what-they-own-or-made": "Proud",
    "sure-they-made-the-right-choice": "Confident", "growing-in-their-work": "Prosperous", "hopeful-about-their-business": "Optimistic", "inspired-about-what-comes-next": "Inspired",
    // Social needs.
    "as-having-good-taste-style": "Stylish", "as-part-of-a-group-they-value": "Included", "as-one-of-the-few-with-access": "Exclusive",
    "as-caring-for-others-or-the-planet": "Altruistic", "as-leaving-something-for-their-family": "Impactful",
    "as-someone-others-trust": "Trusted", "as-well-connected": "Influential", "as-more-valued-in-their-field": "Respected", "as-a-responsible-business": "Responsible",
    // Other questions' words.
    "your-website": "Your website", "a-demo-trial-or-sample": "A demo / trial / sample", "a-quote-or-proposal": "A quote / proposal", "a-meeting-or-call": "A meeting / call"
};
const WORRIES = ["The price or their budget", "Whether they can trust you", "How long it takes to start", "How hard it is to use", "Risk or security", "Whether it fits their needs", "Support after they buy", "The effort of switching from what they use now", "What others will think"];

/** The Emotional and Social needs as choices (doc 36, section 10; owner 2026-11-03): Bain's Elements of Value [FUN-48, FUN-49] in plain words, by the Segment's kind. */
const EMOTIONAL_PEOPLE = ["Calm and worry-free", "Rewarded / treated", "Relaxed / looked after", "Entertained", "Attractive", "Healthy and well", "Delighted by how it looks", "Reminded of good times", "Motivated", "Hopeful", "Fulfilled, as they grow", "Proud of what they own or made"];
const EMOTIONAL_BUSINESS = ["Sure they made the right choice", "Glad to work with you", "Growing in their work", "Hopeful about their business", "Inspired about what comes next"];
const SOCIAL_PEOPLE = ["As having good taste / style", "As part of a group they value", "As one of the few with access", "As caring for others or the planet", "As leaving something for their family"];
/** When they buy (owner, 2026-11-07; L25, doc 34): optional, a people Segment's Profiles only. */
const BUY_TIMES = ["Weekday daytime", "Evenings", "Weekends", "Around seasons / holidays"];
/** The functional jobs (owner, 2026-11-07; L17, doc 34, 5.2c): Bain's functional elements no other question already holds [FUN-48], one word each. */
const FUNCTIONAL = ["Organisation", "Integration", "Connection", "Information", "Variety"];
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
    // C1 opens Information & Shopping Habits (owner, 2026-11-08, P8): the devices they find and buy on are a shopping habit, not a place they meet (the code stays C1).
    {
        id: "c1", box: "habits", label: "Which devices does {s} use?", many: true,
        options: [{ id: "phone", label: "Smartphone" }, { id: "computer", label: "Laptop / desktop" }, { id: "tablet", label: "Tablet" }, { id: "shared", label: "A shared / public device" }, OTHER], other: true,
        info: ["The devices they use to find and buy, not those they own.", "The Segment's choice of where they buy starts this; change it freely."]
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
    { id: "d3", box: "habits", label: "When does {s} usually buy?", many: true, options: list(BUY_TIMES), info: ["When they actually buy, not when they are free: the Segment's work schedule says when they work.", "How they buy, in their words, goes in the Notes."] },
    { id: "e1", box: "goals", label: "What does {s} want to achieve?", many: true, max: 3, options: list(GOALS), rating: { low: "Minor", high: "Main" }, info: ["The results they are after, not what they weigh when choosing (that is \"What matters most\"). Choose up to three, then rate each.", "For example, to learn a new craft, or to win more clients.", "Accessibility: getting something hard to reach. Development: learning something new. Expression: showing who they are. Revenue: winning customers or income.", "Compliance: meeting a requirement or staying within the rules, at work or by law. Efficiency: saving time or money.", "Resolution: getting a specific problem fixed. Enjoyment: having fun or a good time.", "Based on: gains (Value Proposition Canvas)."] },
    { id: "e2", box: "challenges", label: "What frustrates {o} today?", many: true, max: 3, options: list(FRUSTRATIONS), rating: { low: "Mild", high: "Severe" }, info: ["What goes wrong with the way they do it now, before they buy from you. Choose up to three, then rate how much each bothers them.", "For example, the cheap version breaks too soon, or nobody explains how to start.", "Cost: too costly, or unclear prices. Delays: it takes too long. Inconsistency: results vary. Trust: hard to find someone reliable.", "Skills gap: not knowing how, or fearing a mistake. Capacity: no time or staff. Hassle: too complicated, or poor support.", "Based on: pains (Value Proposition Canvas)."] },
    // The Needs (doc 36, section 10): Emotional and Social ticked and rated, by the Segment's kind; Functional stays the numbered list. Each kind's list stays as its note.
    { id: "functional", box: "needs", label: "What kind of job does {s} need done?", many: true, max: 3, options: list(FUNCTIONAL), rating: { low: "Mild", high: "Strong" }, info: ["The jobs they need done, not every task. Choose up to three, then rate each; write their own tasks in the list below.", "Organisation: keeps tasks, records or belongings in order. Integration: works with the tools or routines they already use.", "Connection: helps them reach or work with other people. Variety: gives more options than they had.", "Information: gives answers or facts they need now (learning is the goal Development).", "Based on: Bain's Elements of Value (HBR, 2016)."] },
    { id: "emotional", box: "needs", label: "How does {s} want to feel?", many: true, max: 3, options: list(EMOTIONAL_PEOPLE), rating: { low: "Mild", high: "Strong" }, info: [...NEEDS_INFO("feelings", "For example, calm when a delivery arrives on time, or delighted by how a room looks."), "Rewarded: treated to something special. Nurtured: looked after. Delighted: by how it looks. Nostalgic: reminded of good times. Fulfilled: growing as a person.", "Proud: a sense of self-worth or achievement in what they own or made (Desmet's 25 product emotions, 2012)."] },
    { id: "emotional-b2b", box: "needs", label: "How does {s} want to feel?", many: true, max: 3, options: list(EMOTIONAL_BUSINESS), rating: { low: "Mild", high: "Strong" }, info: [...NEEDS_INFO("feelings", "For example, sure they chose the right supplier, or glad to work with you again."), "Confident: sure they made the right choice. Prosperous: growing in their work. Optimistic: hopeful about their business."] },
    { id: "social", box: "needs", label: "How does {s} want to be seen?", many: true, max: 3, options: list(SOCIAL_PEOPLE), rating: { low: "Mild", high: "Strong" }, info: [...NEEDS_INFO("ways of being seen by others", "For example, as stylish when friends visit, or as caring for the planet."), "Included: part of a group they value. Exclusive: one of the few with access. Altruistic: caring for others or the planet. Impactful: leaving a legacy."] },
    { id: "social-b2b", box: "needs", label: "How does {s} want to be seen?", many: true, max: 3, options: list(SOCIAL_BUSINESS), rating: { low: "Mild", high: "Strong" }, info: [...NEEDS_INFO("ways of being seen by others", "For example, as someone colleagues trust, or as a responsible business."), "Influential: well connected. Respected: valued in their field."] },
    { id: "e3", box: "objections", label: "What might hold {o} back?", many: true, max: 3, options: list(WORRIES), rating: { low: "Minor", high: "Blocking" }, info: ["Their doubts about buying from you, not what frustrates them today. Choose up to three, then rate each.", "For example, whether a beginner can keep up, or whether you will still be there after the sale.", "Credibility: whether you can be trusted. Onboarding: the time to get started. Complexity: how hard it is to use. Fit: whether it suits their need.", "Support: help after buying. Migration: the work of leaving what they use now. Risk: risk or security. Image: what others will think of them.", "Starts with the price where the Segment's household income is rated 1; change it freely."] }
];

export const PROFILE_QUESTIONS = QUESTIONS;

/*
 * THE BUYER AND THE END USER (owner, 2026-11-08: "If the buyer is proxy, the profile should contain questions for both buyer and end user."). On a Segment whose own buyer is
 * Proxy or Dual-Intent (`context.endsUser`), each Profile holds two parts in one card: the buyer (the person who chooses and pays) and the end user (the person it is for; for a
 * Dual-Intent buyer, who also uses it, the people they buy for besides themselves). One rule splits the questions: who they are, how they use it and what they want from it belong to
 * the end user; choosing, paying and deciding belong to the buyer. A Direct Segment's Profile is one person and keeps every question in one part, as before.
 *
 * Saved data. The buyer's answers stay where every Profile's are (`questions`), no key changed. The questions only the end user is asked (E1, E2 and the Needs) keep their keys there
 * too, because a Direct Segment asks them of its one person and the Offerings tick the functional tasks by id: on a Proxy or Dual-Intent Segment they are the end user's. The end
 * user's own answers, to the questions both parts ask with answers that can differ (A1, A7) and to the end user's own (A8 online comfort, E4 the outcome), are saved under
 * `user.questions` on the Profile, its Personal note under `user.note`.
 */

/** Which part of a Proxy or Dual-Intent Segment's Profile asks a question: "buyer" or "user" (the end user). */
export type ProfilePart = "buyer" | "user";

/** The questions of `questions` asked in the end user's part (E1, E2 and the Needs): what they want from it and the jobs, feelings and image they want. */
const USER_PART = ["e1", "e2", "functional", "emotional", "emotional-b2b", "social", "social-b2b"];

/** The part a question of `questions` stands in: the end user's for E1, E2 and the Needs where the Segment has an end user; else the buyer's (a Direct Segment's one person). */
export function profilePartOf(question: Pick<ProfileQuestion, "id">, context: Pick<SegmentContext, "endsUser">): ProfilePart {
    return context.endsUser && USER_PART.includes(question.id) ? "user" : "buyer";
}

const COMFORT_RATING = { low: "Uneasy", high: "Confident" };
const OUTCOME = SEGMENT_QUESTIONS.find(question => question.id === "u-outcome");

/**
 * The end user's own questions (saved under `user.questions`): A1 and A7 asked again of the end user, where the answer can differ from the buyer's; A8 how comfortable the end user
 * is online (from the Segment's End user, 8); E4 the outcome for the end user (the Segment's End user, 9 until 2026-11-08, and Positioning's 10 before it: both are its start).
 */
const USER_QUESTIONS: readonly ProfileQuestion[] = [
    {
        id: "a1", box: "personal", label: "How old is {s}?", many: false, number: true, options: [],
        info: ["One age within the Segment's end-user stage: a typical end user, not the average.", "If the Segment's end-user stage changes and this age falls outside it, the age is cleared."]
    },
    {
        id: "a7", box: "personal", label: "Who does {s} live with?", many: false, options: HOUSEHOLDS,
        info: ["Asked of an adult end user, who may not live with the buyer.", "Based on: household types (ONS, Census 2021).", "Children: children living at home. With parents / relatives includes several generations under one roof."]
    },
    {
        id: "comfort", box: "personal", label: "How comfortable is {s} online?", many: false, rating: COMFORT_RATING, options: ratingOptions(COMFORT_RATING),
        info: ["How easily they use websites, apps and online payment, not whether they own a device.", "The Segment's answer for its end users starts this; change it freely."]
    },
    {
        // Named by the relationship as the rest of the part ("Outcome for the child"; owner, 2026-11-09): profileUserWho.
        id: "outcome", box: "goals", label: (OUTCOME?.label ?? "Outcome for the end user").replace("the end user", "{s}"), many: true, options: OUTCOME?.options ?? [],
        info: [
            "What matters most to the end user, apart from the buyer's own reasons for paying: the result the end user gets.",
            ...(OUTCOME?.info.slice(1) ?? []),
            "The Segment's answer saved before (or Positioning's) starts this; change it freely."
        ]
    }
];

export const PROFILE_USER_QUESTIONS = USER_QUESTIONS;

/** A question of the end user's part, written of the end user ("How old is the end user?"), or of the end user named by the relationship ("How old is the child?": profileUserName). */
export function profileUserWho(label: string, name = "the end user"): string {
    return label.replace(/{s}|{o}/g, name).replace(/{p}/g, name + "'s");
}

/** The end user named by the Segment's relationship (Positioning's End User; 2026-11-09). */
const USER_NAMES: Readonly<Record<string, string>> = {
    "rel:parent": "the child", "rel:partner": "the partner", "rel:caregiver": "the person cared for", "rel:employer": "the employee", "rel:serving": "the client", "rel:institution": "the person it serves"
};

/**
 * How the end user's part names the end user (2026-11-09): from the relationship where one name fits every relationship chosen (Parent or guardian, the child; Spouse or partner,
 * the partner; Caregiver, the person cared for; Employer, the employee; Business serving clients, the client; Institution or membership body, the person it serves), else "the end user".
 */
export function profileUserName(context: Pick<SegmentContext, "relations">): string {
    const names = [...new Set(context.relations.map(id => USER_NAMES[id] ?? "the end user"))];
    return names.length === 1 ? names[0] : "the end user";
}

/** Who a Dual-Intent Segment's end-user part asks E1, E2 and the Needs about: the buyer uses it too, so a typical user, the buyer or the others (2026-11-09). */
export const DUAL_USER = "a typical user";

/** The ages each of the Segment's end-user stages holds (first number up to, not including, the second). */
const USER_AGE_RANGES: Record<string, [number, number]> = {
    baby: [0, 3], child: [3, 11], teen: [11, 18], young: [18, 25], established: [25, 40], peak: [40, 55], mature: [55, 65], active: [65, 75], dependent: [75, 130]
};
const ADULT_USER_AGES = ["young", "established", "peak", "mature", "active", "dependent"];

/** The working ages of a business Segment's end user (its staff): Young adult to Mature, 18 to 64 (phase 5, 2026-11-08). */
const WORKING_USER_AGES = ["young", "established", "peak", "mature"];

/**
 * The range of years the Segment's end-user stage allows (End user, 1), or null where none is chosen. A business Segment's end user is of working age: its range is the stage's where
 * that is a working stage, else 18 to 64 (a retiree's stage saved before is not offered there). The people an institution serves are of any age, so their range is the stage's.
 */
export function profileUserAgeRange(segment: SegmentAnswers, context?: Pick<SegmentContext, "frame" | "relations">): [number, number] | null {
    const stage = (segment["u-age"] ?? [])[0];
    if (context?.frame === "business" && !segmentServesPeople(context) && !WORKING_USER_AGES.includes(stage)) {
        return [18, 65];
    }
    return USER_AGE_RANGES[stage] ?? null;
}

/**
 * Whether the end user's part asks one of its own questions. Only where the Segment has an end user. A7 only of an adult end user of a people Segment (a baby, child or teenager
 * lives with the buyer; a business Segment's end users are staff or clients); A8 not of a baby (as the Segment's End user, 8).
 */
export function profileUserQuestionAsked(question: Pick<ProfileQuestion, "id">, segment: SegmentAnswers, context: SegmentContext): boolean {
    if (!context.endsUser) {
        return false;
    }
    const age = (segment["u-age"] ?? [])[0];
    switch (question.id) {
        case "a7":
            return context.frame !== "business" && ADULT_USER_AGES.includes(age);
        case "comfort":
            return age !== "baby";
        default:
            return true;
    }
}

/** What the outcome (E4) allows at the business stage: Positioning's outcome limit, as the Segment's End user, 9 had it. */
export function profileOutcomeLimit(context: Pick<SegmentContext, "stage">): number | null {
    return choiceLimit(context.stage, "outcome");
}

/**
 * The end user's own answers settled: an age within the end-user stage, an option offered, the outcome within the stage's limit (over it, back to empty, as on Positioning; a
 * cleared outcome stays cleared, an empty list saved). Nothing is kept where the Segment has no end user.
 */
export function profileUserSettle(saved: SegmentAnswers, segment: SegmentAnswers, context: SegmentContext): SegmentAnswers {
    const settled: SegmentAnswers = {};
    for (const question of USER_QUESTIONS) {
        const chosen = saved[question.id];
        if (!chosen || !profileUserQuestionAsked(question, segment, context)) {
            continue;
        }
        if (question.number) {
            const age = Number(chosen[0]);
            const range = profileUserAgeRange(segment, context);
            if (Number.isFinite(age) && chosen[0] !== "" && (!range || (age >= range[0] && age < range[1]))) {
                settled[question.id] = chosen;
            }
            continue;
        }
        const offered = chosen.filter(id => question.options.some(option => option.id === id));
        if (question.id === "outcome") {
            const limit = profileOutcomeLimit(context);
            settled[question.id] = limit !== null && offered.length > limit ? [] : offered;
            continue;
        }
        settled[question.id] = question.many ? offered : offered.slice(0, 1);
    }
    return settled;
}

/**
 * The end user's own answers as the part shows them: its own, with a start where it never answered (no key saved): A8 from the Segment's End user, 8, E4 from the Segment's End user,
 * 9 (with Positioning's answer saved before as its own start: pass the Segment's answers as `segmentPositioningShown` gives them), within the stage's limit. A saved answer wins, even an
 * empty one.
 */
export function profileUserShown(answers: SegmentAnswers, segment: SegmentAnswers, context: SegmentContext): SegmentAnswers {
    const shown: SegmentAnswers = { ...answers };
    if (!("comfort" in shown) && (segment["u-comfort"] ?? []).length > 0) {
        shown.comfort = segment["u-comfort"].slice(0, 1);
    }
    if (!("outcome" in shown) && (segment["u-outcome"] ?? []).length > 0) {
        const limit = profileOutcomeLimit(context);
        shown.outcome = limit === null ? [...segment["u-outcome"]] : segment["u-outcome"].slice(0, limit);
    }
    return profileUserSettle(shown, segment, context);
}

/** The end user's own questions of one box that the part asks. */
export function profileUserQuestionsOf(box: ProfileBox, segment: SegmentAnswers, context: SegmentContext): ProfileQuestion[] {
    return USER_QUESTIONS.filter(question => question.box === box && profileUserQuestionAsked(question, segment, context));
}

/** What the end user's own answers say, as lines for the documents and the exports, written of the end user. */
export function profileUserAnswerLines(answers: SegmentAnswers): { label: string; value: string }[] {
    return USER_QUESTIONS.flatMap(question => {
        const chosen = answers[question.id] ?? [];
        if (chosen.length === 0) {
            return [];
        }
        const value = question.number ? chosen[0] + " years"
            : question.rating ? ratingWords(chosen[0], question.rating)
                : question.options.filter(option => chosen.includes(option.id)).map(option => option.label).join("; ");
        return [{ label: profileUserWho(question.label), value }];
    });
}

/**
 * A Profile is one person, so its questions are written of one: she, he, her, him, his once the gender is answered (the first question), "this person" until then
 * and for any other answer. The questions are stored with {s} (subject: she, he), {o} (object: her, him) and {p} (possessive: her, his); the documents list them as "this person".
 */
/**
 * The Emotional or Social needs ticked on a Segment's Profiles (owner, 2026-11-07), for the Value Proposition: each option once, the strongest first (its
 * highest rating on any Profile; ties, and options ticked unrated, in the options' order), in its words. Pass each Profile's shown answers (profileShown).
 */
export function segmentNeedTicks(profiles: readonly SegmentAnswers[], kind: "emotional" | "social"): string[] {
    const ranked: { label: string; point: number; order: number }[] = [];
    let order = 0;
    for (const question of QUESTIONS.filter(entry => entry.id === kind || entry.id === kind + "-b2b")) {
        for (const option of question.options) {
            order += 1;
            const ticked = profiles.filter(answers => (answers[question.id] ?? []).includes(option.id));
            if (ticked.length > 0) {
                ranked.push({ label: option.label, point: Math.max(0, ...ticked.map(answers => profileRatings(answers, question)[option.id] ?? 0)), order });
            }
        }
    }
    return ranked.sort((a, b) => b.point - a.point || a.order - b.order).map(entry => entry.label);
}

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
    habits: "The note is for what the choices above do not hold: how they buy, in their words.",
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
            // Asked of the buyer of a Proxy or Dual-Intent Segment too (a parent buying for a child: the buyer's household); the end user's part asks its own A7
            // only of an adult end user (profileUserQuestionAsked).
            return !business && !(ages.length > 0 && ages.every(id => id === "minor"));
        }
        case "a5":
            return business || context.endsUser || (segment.age ?? []).includes("minor");
        case "c2":
            // Asked unless the Segment's online comfort is rated 1, Uneasy (doc 36).
            return !(segment.comfort ?? []).includes("1");
        case "c3":
            return (segment.discover ?? []).includes("communities");
        case "c4":
            // A business Segment is not asked how it socialises: its Profiles are asked about events always (owner, 2026-11-08).
            return business || (segment.social ?? []).some(id => id === "mixed" || id === "inperson");
        case "d1":
            // A Segment that buys on impulse, or when it urgently needs it, does not compare options first (2026-11-08); one that buys out of habit is asked, with no start.
            return !(segment.path ?? []).some(id => id === "impulse" || id === "urgent");
        // When they buy (owner, 2026-11-07): a people Segment's Profiles only.
        case "d3":
            return !business;
        // The Needs' lists follow the Segment's kind: a business buyer's, or a person's (doc 36, section 10).
        case "emotional": case "social":
            return !business;
        case "emotional-b2b": case "social-b2b":
            return business;
        default:
            return true;
    }
}

/** The questions of one box a Profile is asked; with a part, only those that part asks (profilePartOf: a Direct Segment's are all the buyer's). */
export function profileQuestionsOf(box: ProfileBox, segment: SegmentAnswers, context: SegmentContext, part?: ProfilePart): ProfileQuestion[] {
    return QUESTIONS.filter(question => question.box === box && profileQuestionAsked(question, segment, context) && (!part || profilePartOf(question, context) === part))
        .map(question => ({ ...question, options: profileOptionsOf(question, context) }));
}

/**
 * The options a question offers a Profile: a business Segment's Profile is not offered a Market / pop-up, a consumer's event (C4; owner, 2026-11-08), nor the
 * goal Enjoyment, a person's own (E1; 2026-11-08).
 */
export function profileOptionsOf(question: ProfileQuestion, context: SegmentContext): ProfileQuestion["options"] {
    if (context.frame !== "business") {
        return question.options;
    }
    return question.id === "c4" ? question.options.filter(option => option.id !== "market")
        : question.id === "e1" ? question.options.filter(option => !PEOPLE_GOALS.includes(option.id))
            : question.options;
}

/** E1's goals and E2's frustrations a minor end user is not offered (2026-11-09): Revenue, Compliance and Efficiency are an adult's goals; Cost is the buyer's (E3's Price). */
const NOT_FOR_MINORS: Readonly<Record<string, readonly string[]>> = { e1: ["win-customers-or-earn-more", "meet-a-requirement", "save-time-money"], e2: ["it-costs-too-much"] };
/** How a baby or a child wants to be seen (2026-11-09): with friends and in style; being one of the few, caring for the planet or leaving a legacy are an older person's. */
const SEEN_BY_A_CHILD = ["as-having-good-taste-style", "as-part-of-a-group-they-value"];
/** How a teenager wants to be seen: all but leaving something for their family, a legacy. */
const NOT_SEEN_BY_A_TEEN = ["as-leaving-something-for-their-family"];
/** Who the buyer lives with, put first by the relationship (A7; 2026-11-09): a parent with a partner and children or a single parent; a partner with a partner. */
const HOUSEHOLD_FIRST: Readonly<Record<string, readonly string[]>> = { "rel:parent": ["family", "single-parent"], "rel:partner": ["partner", "family"] };
/** The worries (E3) the values a Profile ticks in B1 put first (2026-11-09): Affordability, Price; Reputation, Credibility; Safety / security, Risk; Support, Support. */
const VALUE_WORRY: Readonly<Record<string, string>> = {
    "lower-price": "the-price-or-their-budget", "trust-and-reputation": "whether-they-can-trust-you", "safety-and-low-risk": "risk-or-security", "good-support": "support-after-they-buy"
};

/** Whether the Segment's end user is a minor of a Proxy buyer: a baby, a child or a teenager (End user, 1), or only minors chosen in Positioning where that is not answered. */
export function profileMinorUser(segment: SegmentAnswers, context: SegmentContext): "baby" | "child" | "teen" | "" {
    if (!context.endsUser || context.dual) {
        return "";
    }
    const age = (segment["u-age"] ?? [])[0];
    if (age === "baby" || age === "child" || age === "teen") {
        return age;
    }
    return !age && context.userStages.length > 0 && context.userStages.every(stage => stage === "age:minor") ? "teen" : "";
}

/**
 * A question's options as the Profile card shows them (2026-11-09), from the options profileQuestionsOf gives: a minor end user of a Proxy buyer is not offered an adult's goals
 * (E1) nor the cost (E2), and a baby or child only the ways of being seen that fit one (the social need), a teenager all but a legacy; the buyer's household (A7) puts the
 * relationship's households first; the worries (E3) put first those the values ticked in B1 point to, the highest rated first. Never a lock: a saved tick not offered stays shown.
 */
export function profileOptionsShown(question: ProfileQuestion, segment: SegmentAnswers, context: SegmentContext, answers: SegmentAnswers): ProfileQuestion["options"] {
    const chosen = answers[question.id] ?? [];
    const minor = profileMinorUser(segment, context);
    const unfit = question.id === "social" ? question.options.map(option => option.id).filter(id => minor === "teen" ? NOT_SEEN_BY_A_TEEN.includes(id) : !SEEN_BY_A_CHILD.includes(id)) : [];
    const hidden = minor ? [...(NOT_FOR_MINORS[question.id] ?? []), ...unfit] : [];
    const options = question.options.filter(option => !hidden.includes(option.id) || chosen.includes(option.id));
    let first: string[] = [];
    if (question.id === "a7") {
        first = [...new Set(context.relations.flatMap(id => HOUSEHOLD_FIRST[id] ?? []))];
    } else if (question.id === "e3") {
        const b1 = QUESTIONS.find(entry => entry.id === "b1")!;
        const ratings = profileRatings(answers, b1);
        first = [...(answers.b1 ?? [])].sort((a, b) => (ratings[b] ?? 0) - (ratings[a] ?? 0)).map(value => VALUE_WORRY[value]).filter((id): id is string => !!id);
    }
    const rank = (id: string) => first.includes(id) ? first.indexOf(id) : first.length;
    return first.length > 0 ? [...options].sort((a, b) => rank(a.id) - rank(b.id)) : options;
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
                // A Dual-Intent buyer also uses it (2026-11-09).
                return context.dual ? ["use", "order", "decide"] : ["order", "decide"];
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
            if (comfort === "4" || comfort === "5" || comfort === "1" || comfort === "2") {
                return comfort === "4" || comfort === "5" ? ["alone"] : ["person"];
            }
            // With no other start, how they compare options (D1; 2026-11-09): a demo, trial or sample, or a quote or proposal, needs a formal one; a meeting or call, a person.
            const compare = answers.d1 ?? [];
            return compare.includes("a-demo-trial-or-sample") || compare.includes("a-quote-or-proposal") ? ["formal"] : compare.includes("a-meeting-or-call") ? ["person"] : undefined;
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
        const offered = chosen.filter(id => profileOptionsOf(question, context).some(option => option.id === id));
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

/**
 * What a Profile's answers say, as lines for the documents and the exports. With a part (a Segment with an end user), only that part's questions: the end user's are written
 * of the end user ("What does the end user want to achieve?").
 */
export function profileAnswerLines(answers: SegmentAnswers, part?: ProfilePart): { label: string; value: string }[] {
    return QUESTIONS.flatMap(question => {
        const chosen = answers[question.id] ?? [];
        if (chosen.length === 0 || (part && profilePartOf(question, { endsUser: true }) !== part)) {
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
        return [{ label: part === "user" ? profileUserWho(question.label) : profileWho(question.label, answers.a2?.[0]), value: words }];
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
