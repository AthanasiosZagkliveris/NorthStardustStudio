import type { BusinessCustomerSegmentValue } from "./AnswerBusinessFoundation.ts";
import type { BusinessSegmentEngagementValue } from "./businessFoundation/engagementReaders.ts";
import { namesInSentence } from "./CompetitorQuestions.ts";
import { effectiveOfferingAnswers, effectiveProfileAnswers } from "./EffectiveAnswers.ts";
import { offeringRelationshipsFor } from "./JourneySuggestions.ts";
import { PROFILE_QUESTIONS } from "./ProfileQuestions.ts";
import { type SegmentIdentity, segmentIsBusiness } from "./SegmentContext.ts";
import { asText } from "./Readers.ts";

/*
    THE AMBASSADOR'S CHOICES, BA1 TO BA4 AND BA6 TO BA8 (doc 46; owner, 2026-11-12, D3 to D5; built 2026-11-19, the owner's approved plan of 2026-11-18, §3, B2):
    a few choices above each of the four texts of the Brand System's Ambassador, saved under the section's own key `ambassador`, and an "Add a draft" that writes
    a sentence at the end of the text (the Value Proposition's pattern, doc 42). Aesthetics holds BA1 to BA3, Body Language BA4, Communication & Voice BA6 and BA7,
    Imprint BA8 (BA9 follows once the Values have ids, doc 46, section 5). A start follows its source until the founder changes it (doc 46, section 6): the
    ratings of BA4 and BA6 follow BA1, BA3 follows the Offerings' O6; only what the founder sets is saved.
*/

/** BA1's options: Aaker's five facets, each with its "i", its draft phrase and the ratings it starts (BA4: Energy, Expression; BA6: Formality, Humour, Respect, Enthusiasm). */
export const AMBASSADOR_CHARACTERS = [
    { id: "sincere", label: "Warm and honest", info: "Sincere, down-to-earth, cheerful.", phrase: "warm and honest", energy: 3, expression: 4, tone: { formality: 2, humour: 3, respect: 4, enthusiasm: 4 } },
    { id: "exciting", label: "Lively and bold", info: "Daring, spirited, imaginative.", phrase: "lively and bold", energy: 5, expression: 5, tone: { formality: 2, humour: 4, respect: 3, enthusiasm: 5 } },
    { id: "competent", label: "Capable and reliable", info: "Hard-working, intelligent, confident.", phrase: "capable and reliable", energy: 2, expression: 2, tone: { formality: 4, humour: 2, respect: 4, enthusiasm: 2 } },
    { id: "sophisticated", label: "Refined and elegant", info: "Glamorous, charming, polished.", phrase: "refined and elegant", energy: 2, expression: 2, tone: { formality: 5, humour: 2, respect: 5, enthusiasm: 2 } },
    { id: "rugged", label: "Tough and practical", info: "Outdoorsy, rugged, hard-wearing.", phrase: "tough and practical", energy: 3, expression: 2, tone: { formality: 2, humour: 3, respect: 3, enthusiasm: 2 } }
] as const;

/** BA2's options (doc 46, BA2). */
export const AMBASSADOR_DRESS = [
    { id: "formal", label: "Formal / tailored", phrase: "formal, tailored" },
    { id: "smart", label: "Smart casual", phrase: "smart casual" },
    { id: "relaxed", label: "Relaxed / casual", phrase: "relaxed, casual" },
    { id: "practical", label: "Practical / workwear", phrase: "practical, workwear" },
    { id: "creative", label: "Creative / artistic", phrase: "creative, artistic" }
] as const;

/** BA3's options (doc 46, BA3). */
export const AMBASSADOR_SETTINGS = [
    { id: "workshop", label: "A workshop / studio", phrase: "in a workshop or studio" },
    { id: "office", label: "An office", phrase: "in an office" },
    { id: "home", label: "A home", phrase: "in a home" },
    { id: "venue", label: "A shop, café or venue", phrase: "in a shop, café or venue" },
    { id: "outdoors", label: "Outdoors", phrase: "outdoors" },
    { id: "online", label: "Online", phrase: "online" }
] as const;

/** BA4's two rows, each its own single Rating Scale: its row name at 5, what 1 and 5 mean first in its "i" (doc 46, 1.3). */
export const AMBASSADOR_PRESENCE = [
    { id: "energy", label: "Energy", low: "Calm", high: "Energetic", info: "The pace and movement your Ambassador brings." },
    { id: "expression", label: "Expression", low: "Reserved", high: "Expressive", info: "How openly your Ambassador shows feeling." }
] as const;

/** BA6's four rows (NN/g's four dimensions of tone), in the order a tie goes by (doc 46, section 9). */
export const AMBASSADOR_TONE = [
    { id: "formality", label: "Formality", low: "Casual", high: "Formal" },
    { id: "humour", label: "Humour", low: "Serious", high: "Funny" },
    { id: "respect", label: "Respect", low: "Irreverent", high: "Respectful" },
    { id: "enthusiasm", label: "Enthusiasm", low: "Matter-of-fact", high: "Enthusiastic" }
] as const;

/** BA7's options (doc 46, BA7). */
export const AMBASSADOR_WORDS = [
    { id: "plain", label: "Plain, everyday words", phrase: "plain, everyday words" },
    { id: "explained", label: "Expert words, explained", phrase: "expert words, explained simply" },
    { id: "trade", label: "The trade's own terms", phrase: "the trade's own terms" }
] as const;

/** The relationship types (J3, doc 47) from the least to the most personal, each with its Body Language phrase (doc 46, section 3). */
const RELATIONSHIP_PHRASES = [
    { id: "self-service", phrase: "let customers help themselves, with help close at hand" },
    { id: "automated-service", phrase: "help customers at any hour" },
    { id: "community", phrase: "bring customers together" },
    { id: "personal-assistance", phrase: "step in personally when customers need them" },
    { id: "dedicated-support", phrase: "stay close to every customer" }
] as const;

export type PresenceRow = (typeof AMBASSADOR_PRESENCE)[number]["id"];
export type ToneRow = (typeof AMBASSADOR_TONE)[number]["id"];

/** The most BA3 and BA8 take, and BA1 from Managing on. */
export const AMBASSADOR_TICKS_MAX = 2;

export const BA_INFO = {
    ba1: ["Picture your brand as a person: the character people describe after meeting it.", "Your choice starts the ratings on Body Language and Communication & Voice.", "Based on: Aaker (1997), Dimensions of brand personality."],
    ba2: ["Clothing speaks before a word is said.", "Colours, grooming and scent go in the text below."],
    ba3: ["The surroundings that suit your brand: the places in your photos and the feel of your spaces."],
    ba4: ["How your Ambassador stands, moves and reacts.", "Your character choice starts both ratings."],
    ba6: ["Your voice stays the same; your tone shifts with the moment. Rate the tone you use most.", "Your character choice starts all four ratings.", "Based on: Nielsen Norman Group, The four dimensions of tone of voice."],
    ba7: ["Choose the words your customers use themselves.", "Words to use and words to leave out go in the text below."],
    ba8: ["Chosen from what your customers want to feel, on their Profiles.", "Your Value Proposition shows how each Offering gives it."]
} as const;

export const BA_LABELS = {
    ba1: "Which character fits your Ambassador best?",
    ba2: "How does your Ambassador dress?",
    ba3: "Where would people meet your Ambassador?",
    ba4: "How does your Ambassador come across?",
    ba6: "What tone does your Ambassador use?",
    ba7: "Which words suit your customers?",
    ba8: "How should people feel when they first meet your brand?"
} as const;

/** The Ambassador's choices as saved: only what the founder set (a missing key keeps following its start). */
export interface AmbassadorChoices {
    character?: string[];
    dress?: string;
    setting?: string[];
    energy?: number;
    expression?: number;
    tone?: Partial<Record<ToneRow, number>>;
    words?: string;
    feeling?: string[];
}

const ids = (list: readonly { id: string }[]) => new Set<string>(list.map(entry => entry.id));
const known = (value: unknown, allowed: Set<string>, most: number): string[] => [...new Set((Array.isArray(value) ? value : []).map(asText).filter(id => allowed.has(id)))].slice(0, most);
const rating = (value: unknown): number | undefined => typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5 ? value : undefined;

/** The saved choices, read from the section's answer (`ambassador`): known ids and ratings only; a key the founder never set stays missing. */
export function asAmbassadorChoices(sectionValue: unknown): AmbassadorChoices {
    const section = sectionValue && typeof sectionValue === "object" && !Array.isArray(sectionValue) ? sectionValue as Record<string, unknown> : {};
    const saved = section.ambassador && typeof section.ambassador === "object" && !Array.isArray(section.ambassador) ? section.ambassador as Record<string, unknown> : {};
    const out: AmbassadorChoices = {};
    if ("character" in saved) out.character = known(saved.character, ids(AMBASSADOR_CHARACTERS), AMBASSADOR_TICKS_MAX);
    if (ids(AMBASSADOR_DRESS).has(asText(saved.dress))) out.dress = asText(saved.dress);
    if ("setting" in saved) out.setting = known(saved.setting, ids(AMBASSADOR_SETTINGS), AMBASSADOR_TICKS_MAX);
    if (rating(saved.energy)) out.energy = rating(saved.energy);
    if (rating(saved.expression)) out.expression = rating(saved.expression);
    const tone = saved.tone && typeof saved.tone === "object" ? saved.tone as Record<string, unknown> : {};
    const rated = Object.fromEntries(AMBASSADOR_TONE.map(row => [row.id, rating(tone[row.id])]).filter(([, point]) => point !== undefined));
    if (Object.keys(rated).length > 0) out.tone = rated;
    if (ids(AMBASSADOR_WORDS).has(asText(saved.words))) out.words = asText(saved.words);
    if ("feeling" in saved) out.feeling = (Array.isArray(saved.feeling) ? saved.feeling : []).map(asText).filter(Boolean).slice(0, AMBASSADOR_TICKS_MAX);
    return out;
}

/** BA1's limit by the business stage (K14's pattern, doc 46, BA1): one choice at Planning and Launching, 2 from Managing on. */
export function characterLimit(stage: string): number {
    return stage === "manage" || stage === "grow" ? AMBASSADOR_TICKS_MAX : 1;
}

/** What the Ambassador's choices read from the Business System: its Segments (their Offerings and Profiles), the relationships kept, and Identity. */
export interface AmbassadorContext {
    segments: readonly BusinessCustomerSegmentValue[];
    /** The Customer Engagement's Segments (their relationships by Offering), as saved. */
    engagement?: readonly BusinessSegmentEngagementValue[];
    identity?: SegmentIdentity;
}

/** BA3's start from the Offerings' O6 (doc 46, BA3): in person or collected starts a shop, café or venue; any online delivery starts Online; posted starts nothing. */
export function settingStart(context: AmbassadorContext): string[] {
    const delivered = new Set(context.segments.flatMap(segment => segment.offerings.flatMap(offering => effectiveOfferingAnswers(offering, segment, context.identity).o6 ?? [])));
    return [
        ...(delivered.has("inperson") || delivered.has("collect") ? ["venue"] : []),
        ...(["auto", "byyou", "live", "access"].some(id => delivered.has(id)) ? ["online"] : [])
    ];
}

/** BA7's options in their order: the trade's own terms first where every Segment is a business (doc 46, BA7). */
export function wordsOptions(context: AmbassadorContext): { id: string; label: string }[] {
    const trade = context.segments.length > 0 && context.segments.every(segmentIsBusiness);
    const options = AMBASSADOR_WORDS.map(option => ({ id: option.id, label: option.label }));
    return trade ? [...options.filter(option => option.id === "trade"), ...options.filter(option => option.id !== "trade")] : options;
}

/**
 * BA8's options (doc 46, BA8): the emotional and social needs ticked on the Profiles of every Segment, the most chosen first (ties in the lists' order), each in its
 * short word ("Calm", "Confident"); with none ticked yet, the full emotional list (the business one where every Segment is a business).
 */
export function feelingOptions(context: AmbassadorContext): { id: string; label: string }[] {
    const lists = PROFILE_QUESTIONS.filter(question => ["emotional", "emotional-b2b", "social", "social-b2b"].includes(question.id));
    const counts = new Map<string, number>();
    for (const segment of context.segments) {
        for (const profile of segment.profiles) {
            const answers = effectiveProfileAnswers(profile, segment, context.identity);
            for (const question of lists) {
                for (const id of answers[question.id] ?? []) {
                    counts.set(id, (counts.get(id) ?? 0) + 1);
                }
            }
        }
    }
    const every = lists.flatMap(question => question.options.map(option => ({ id: option.id, label: option.label })));
    if (counts.size === 0) {
        const business = context.segments.length > 0 && context.segments.every(segmentIsBusiness);
        return (PROFILE_QUESTIONS.find(question => question.id === (business ? "emotional-b2b" : "emotional"))?.options ?? []).map(option => ({ id: option.id, label: option.label }));
    }
    return every.filter(option => counts.has(option.id)).map((option, order) => ({ ...option, order })).sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) || a.order - b.order).map(({ id, label }) => ({ id, label }));
}

/** The choices as the tiles show them: each start where the founder set nothing (BA3 from O6, BA4 and BA6 from the first character). */
export function ambassadorShown(saved: AmbassadorChoices, context: AmbassadorContext): Required<Omit<AmbassadorChoices, "energy" | "expression">> & { energy?: number; expression?: number } {
    const first = AMBASSADOR_CHARACTERS.find(entry => entry.id === saved.character?.[0]);
    const offered = new Set(feelingOptions(context).map(option => option.id));
    return {
        character: saved.character ?? [],
        dress: saved.dress ?? "",
        setting: saved.setting ?? settingStart(context),
        energy: saved.energy ?? first?.energy,
        expression: saved.expression ?? first?.expression,
        tone: { ...(first?.tone ?? {}), ...(saved.tone ?? {}) },
        words: saved.words ?? "",
        // (A need no Profile holds any more is not shown, and leaves on the next choice: doc 46, section 6.)
        feeling: (saved.feeling ?? []).filter(id => offered.has(id))
    };
}

/* ---- The drafts (doc 46, section 3 and section 9) ---- */

/** BA1's phrase: two characters join with "as well as". */
function characterPhrase(character: readonly string[]): string {
    return character.map(id => AMBASSADOR_CHARACTERS.find(entry => entry.id === id)?.phrase ?? "").filter(Boolean).join(" as well as ");
}

/** Aesthetics: "Our Ambassador is [BA1], dresses in a [BA2] way and is found [BA3, joined with 'and']." Each clause where answered; "" with none. */
export function aestheticsDraft(shown: ReturnType<typeof ambassadorShown>): string {
    const character = characterPhrase(shown.character);
    const dress = AMBASSADOR_DRESS.find(entry => entry.id === shown.dress)?.phrase ?? "";
    const places = shown.setting.map(id => AMBASSADOR_SETTINGS.find(entry => entry.id === id)?.phrase ?? "").filter(Boolean);
    const clauses = [character ? "is " + character : "", dress ? "dresses in a " + dress + " way" : "", places.length > 0 ? "is found " + namesInSentence(places) : ""].filter(Boolean);
    return clauses.length > 0 ? "Our Ambassador " + namesInSentence(clauses) + "." : "";
}

/** BA4 in words: Energy 1-2 "calm", 4-5 "energetic"; Expression 1-2 "reserved", 4-5 "expressive"; a 3 left out; both at 3 "balanced"; "" unrated. */
export function presenceWords(shown: { energy?: number; expression?: number }): string {
    const points = AMBASSADOR_PRESENCE.map(row => ({ row, point: shown[row.id] }));
    if (points.every(entry => entry.point === undefined)) {
        return "";
    }
    const words = points.flatMap(({ row, point }) => point === undefined || point === 3 ? [] : [(point < 3 ? row.low : row.high).toLowerCase()]);
    return words.length > 0 ? namesInSentence(words) : "balanced";
}

/** The most personal relationship type kept with any Segment's Offering (J3), as its phrase; "" with none. */
export function relationshipPhrase(context: AmbassadorContext): string {
    let best = -1;
    for (const entry of context.engagement ?? []) {
        const segment = context.segments.find(candidate => candidate.id === entry.segmentId);
        if (!segment) continue;
        for (const relationship of offeringRelationshipsFor(entry, segment, context.identity)) {
            for (const type of relationship.types) {
                best = Math.max(best, RELATIONSHIP_PHRASES.findIndex(entry => entry.id === type));
            }
        }
    }
    return best >= 0 ? RELATIONSHIP_PHRASES[best].phrase : "";
}

/** Body Language: "They come across as [BA4 in words], and [J3 phrase]." Without J3 the sentence ends after BA4; "" while BA4 is unrated. */
export function bodyLanguageDraft(shown: ReturnType<typeof ambassadorShown>, context: AmbassadorContext): string {
    const words = presenceWords(shown);
    if (!words) {
        return "";
    }
    const relationship = relationshipPhrase(context);
    return "They come across as " + words + (relationship ? ", and " + relationship : "") + ".";
}

/** The tone words: the two BA6 rows furthest from 3, each as the end word it leans to; a tie in the rows' order; a row at 3 never; all at 3 "balanced"; "" unrated. */
export function toneWords(tone: Partial<Record<ToneRow, number>>): string {
    const rated = AMBASSADOR_TONE.map((row, order) => ({ row, order, point: tone[row.id] })).filter((entry): entry is typeof entry & { point: number } => entry.point !== undefined);
    if (rated.length === 0) {
        return "";
    }
    const leaning = rated.filter(entry => entry.point !== 3).sort((a, b) => Math.abs(b.point - 3) - Math.abs(a.point - 3) || a.order - b.order).slice(0, 2);
    return leaning.length > 0 ? leaning.map(entry => (entry.point < 3 ? entry.row.low : entry.row.high).toLowerCase()).join(", ") : "balanced";
}

/** Communication & Voice: "They speak in [BA7 phrase], with a [tone words] tone." Each part where answered; "" with neither. */
export function voiceDraft(shown: ReturnType<typeof ambassadorShown>): string {
    const words = AMBASSADOR_WORDS.find(entry => entry.id === shown.words)?.phrase ?? "";
    const tone = toneWords(shown.tone);
    if (!words && !tone) {
        return "";
    }
    return "They speak" + (words ? " in " + words : "") + (tone ? (words ? ", with a " : " with a ") + tone + " tone" : "") + ".";
}

/** Imprint, the First impression: "People feel [BA8 labels, lower case]." ("" with none chosen); written into the First impression's text. */
export function firstImpressionDraft(shown: ReturnType<typeof ambassadorShown>, context: AmbassadorContext): string {
    const options = feelingOptions(context);
    const labels = shown.feeling.map(id => options.find(option => option.id === id)?.label.toLowerCase() ?? "").filter(Boolean);
    return labels.length > 0 ? "People feel " + namesInSentence(labels) + "." : "";
}

/** The Business Plan's opening line of Brand & Voice: "Our brand is [BA1 phrase], with a [tone words] tone." ("" without BA1). */
export function brandVoiceLine(shown: ReturnType<typeof ambassadorShown>): string {
    const character = characterPhrase(shown.character);
    if (!character) {
        return "";
    }
    const tone = toneWords(shown.tone);
    return "Our brand is " + character + (tone ? ", with a " + tone + " tone" : "") + ".";
}
