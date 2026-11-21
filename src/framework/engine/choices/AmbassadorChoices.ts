import type { BusinessCustomerSegmentValue } from "../answers/AnswerBusinessFoundation.ts";
import type { BusinessSegmentEngagementValue } from "../businessFoundation/engagementReaders.ts";
import { namesInSentence } from "./CompetitorQuestions.ts";
import { effectiveProfileAnswers } from "../answers/EffectiveAnswers.ts";
import { offeringRelationshipsFor } from "../JourneySuggestions.ts";
import { PROFILE_QUESTIONS } from "./ProfileQuestions.ts";
import { type SegmentIdentity, segmentContextFor, segmentIsBusiness, segmentPositioningShown } from "../SegmentContext.ts";
import { DIFFERENTIATION_WORDS } from "../ActivityClassification.ts";
import { asText } from "../answers/Readers.ts";

/*
    THE AMBASSADOR'S CHOICES, BA1 TO BA4 AND BA6 TO BA8 (doc 46; owner, 2026-11-12, D3 to D5; built 2026-11-19, the owner's approved plan of 2026-11-18, §3, B2):
    a few choices above each of the four texts of the Brand System's Ambassador, saved under the section's own key `ambassador`, and a draft, written in by itself (useAutoDraft), that writes
    a sentence at the end of the text (the Value Proposition's pattern, doc 42). Aesthetics holds BA1 to BA3, Body Language BA4, Communication & Voice BA6 and BA7,
    Imprint BA8 and BA9 (BA9 built once the Values had ids, doc 46, section 5; ValueIds.ts). A start follows its source until the founder changes it (doc 46, section 6): the
    ratings of BA4 and BA6 follow BA1; BA3, the surroundings the imagined Ambassador suits, has no start (2026-11-19); only what the founder sets is saved.
*/

/** BA1's options: Aaker's five dimensions, each "i" in Aaker's own facet words (Aaker, 1997; doc 49, section 9, P4; owner, 2026-11-20 12:49 UTC+2), for the imagined Ambassador, each with its "i", its draft phrase and the ratings it starts (BA4: Energy, Expression; BA6: Formality, Humour, Respect, Enthusiasm). */
export const AMBASSADOR_CHARACTERS = [
    { id: "sincere", label: "Warm & honest", info: "Down-to-earth, honest, wholesome and cheerful (Aaker's Sincerity).", phrase: "warm and honest", energy: 3, expression: 4, tone: { formality: 2, humour: 3, respect: 4, enthusiasm: 4 } },
    { id: "exciting", label: "Lively & bold", info: "Daring, spirited, imaginative and up-to-date (Aaker's Excitement).", phrase: "lively and bold", energy: 5, expression: 5, tone: { formality: 2, humour: 4, respect: 3, enthusiasm: 5 } },
    { id: "competent", label: "Capable & reliable", info: "Reliable, intelligent and successful (Aaker's Competence).", phrase: "capable and reliable", energy: 2, expression: 2, tone: { formality: 4, humour: 2, respect: 4, enthusiasm: 2 } },
    { id: "sophisticated", label: "Refined & elegant", info: "Upper-class and charming (Aaker's Sophistication).", phrase: "refined and elegant", energy: 2, expression: 2, tone: { formality: 5, humour: 2, respect: 5, enthusiasm: 2 } },
    { id: "rugged", label: "Tough & practical", info: "Outdoorsy and tough (Aaker's Ruggedness).", phrase: "tough and practical", energy: 3, expression: 2, tone: { formality: 2, humour: 3, respect: 3, enthusiasm: 2 } }
] as const;

/** BA2's options (doc 46, BA2). */
export const AMBASSADOR_DRESS = [
    { id: "formal", label: "Formal / tailored", phrase: "formal, tailored" },
    { id: "smart", label: "Smart casual", phrase: "smart casual" },
    { id: "relaxed", label: "Relaxed / casual", phrase: "relaxed, casual" },
    { id: "practical", label: "Practical / workwear", phrase: "practical, workwear" },
    { id: "creative", label: "Creative / artistic", phrase: "creative, artistic" }
] as const;

/**
 * BA3's options (doc 46, BA3): THE SURROUNDINGS THE IMAGINED AMBASSADOR SUITS (owner, 2026-11-19 21:44 UTC+2: "He is not a real person, but an idea that the app user could think
 * about him/her. You cannot find him/her in a real place."): settings the founder pictures the persona in -- the feel of the brand's photos and spaces --, never where the
 * business meets its customers. The ids kept from before keep their answers (workshop, office, home, outdoors).
 */
export const AMBASSADOR_SETTINGS = [
    { id: "workshop", label: "A workshop or studio", phrase: "in a workshop or studio" },
    { id: "home", label: "A calm home", phrase: "in a calm home" },
    { id: "outdoors", label: "The outdoors", phrase: "outdoors" },
    { id: "city", label: "A lively city street", phrase: "on a lively city street" },
    { id: "gallery", label: "A gallery or showroom", phrase: "in a gallery or showroom" },
    { id: "office", label: "A modern office", phrase: "in a modern office" },
    { id: "cafe", label: "A café or market", phrase: "in a café or market" }
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

export type ToneRow = (typeof AMBASSADOR_TONE)[number]["id"];

/** K14's phrases, one list shared with the Compass draft (doc 46, section 9; doc 49): what a Differentiation reads as in a sentence. */
export const DIFFERENTIATION_PHRASES: Readonly<Record<string, string>> = {
    cost: "good value", convenience: "making things easy", compliance: "keeping customers safe", premium: "high quality",
    performance: "high performance", ecosystem: "fitting the tools customers already use", personal: "personal service"
};

/** The most BA3, BA8 and BA9 take, and BA1 from Managing on. */
export const AMBASSADOR_TICKS_MAX = 2;

export const BA_INFO = {
    ba1: ["Picture your brand as a person: the character people describe after meeting it.", "Your choice starts the ratings on Body Language and Communication & Voice.", "Based on: Aaker (1997), Dimensions of brand personality."],
    ba2: ["Clothing speaks before a word is said.", "Colours, grooming and scent go in the text below."],
    ba3: ["Picture your Ambassador somewhere: the surroundings that carry your brand's feel, in your photos and your spaces."],
    ba4: ["How your Ambassador stands, moves and reacts.", "Your character choice starts both ratings."],
    ba6: ["Your voice stays the same; your tone shifts with the moment. Rate the tone you use most.", "Your character choice starts all four ratings.", "Based on: Nielsen Norman Group, The four dimensions of tone of voice."],
    ba7: ["Choose the words your customers use themselves.", "Words to use and words to leave out go in the text below."],
    ba8: ["Chosen from what your customers want to feel, on their Profiles.", "Your Value Proposition shows how each Offering gives it."],
    ba9: ["The lasting impression: what people repeat about you to a friend."]
} as const;

export const BA_LABELS = {
    ba1: "Which character fits your Ambassador best?",
    ba2: "How does your Ambassador dress?",
    ba3: "What surroundings suit your Ambassador?",
    ba4: "How does your Ambassador come across?",
    ba6: "What tone does your Ambassador use?",
    ba7: "Which words suit your customers?",
    ba8: "How should people feel when they first meet your brand?",
    ba9: "What should people remember you for?"
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
    /** BA9: Value ids and Differentiation ids (K14). */
    remembered?: string[];
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
    if ("remembered" in saved) out.remembered = (Array.isArray(saved.remembered) ? saved.remembered : []).map(asText).filter(Boolean).slice(0, AMBASSADOR_TICKS_MAX);
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
    /** The Identity System's Values with their ids (ValueIds.ts), for BA9. */
    values?: readonly { id: string; text: string }[];
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

/** BA9's options (doc 46, BA9): the Values' lines, then each Differentiation chosen on the Segments (K14), each once. */
export function rememberedOptions(context: AmbassadorContext): { id: string; label: string; phrase: string }[] {
    const differentiations = [...new Set(context.segments.flatMap(segment => {
        const asked = segmentContextFor(context.identity, segmentIsBusiness(segment));
        return segmentPositioningShown(segment.questions ?? {}, context.identity, asked, segment.competitors).differentiation ?? [];
    }))].filter(id => DIFFERENTIATION_WORDS[id]);
    return [
        ...(context.values ?? []).filter(value => value.text.trim()).map(value => ({ id: value.id, label: value.text, phrase: value.text })),
        ...differentiations.map(id => ({ id, label: DIFFERENTIATION_WORDS[id], phrase: DIFFERENTIATION_PHRASES[id] ?? DIFFERENTIATION_WORDS[id].toLowerCase() }))
    ];
}

/** The choices as the tiles show them: each start where the founder set nothing (BA3 from O6, BA4 and BA6 from the first character). */
export function ambassadorShown(saved: AmbassadorChoices, context: AmbassadorContext): Required<Omit<AmbassadorChoices, "energy" | "expression">> & { energy?: number; expression?: number } {
    const first = AMBASSADOR_CHARACTERS.find(entry => entry.id === saved.character?.[0]);
    const offered = new Set(feelingOptions(context).map(option => option.id));
    return {
        character: saved.character ?? [],
        dress: saved.dress ?? "",
        // (No start: the persona's surroundings are imagined, not where the Offerings are delivered; owner, 2026-11-19 21:44 UTC+2.)
        setting: saved.setting ?? [],
        energy: saved.energy ?? first?.energy,
        expression: saved.expression ?? first?.expression,
        tone: { ...(first?.tone ?? {}), ...(saved.tone ?? {}) },
        words: saved.words ?? "",
        // (A need no Profile holds any more is not shown, and leaves on the next choice: doc 46, section 6.)
        feeling: (saved.feeling ?? []).filter(id => offered.has(id)),
        // (So does a Value or a Differentiation no longer there.)
        remembered: (saved.remembered ?? []).filter(id => rememberedOptions(context).some(option => option.id === id))
    };
}

/* ---- The drafts (doc 46, section 3 and section 9) ---- */

/** BA1's phrase: two characters join with "as well as". */
function characterPhrase(character: readonly string[]): string {
    return character.map(id => AMBASSADOR_CHARACTERS.find(entry => entry.id === id)?.phrase ?? "").filter(Boolean).join(" as well as ");
}

/** Aesthetics: "Our Ambassador is [BA1], dresses in a [BA2] way and is pictured [BA3, joined with 'and']." Each clause where answered; "" with none. */
export function aestheticsDraft(shown: ReturnType<typeof ambassadorShown>): string {
    const character = characterPhrase(shown.character);
    const dress = AMBASSADOR_DRESS.find(entry => entry.id === shown.dress)?.phrase ?? "";
    const places = shown.setting.map(id => AMBASSADOR_SETTINGS.find(entry => entry.id === id)?.phrase ?? "").filter(Boolean);
    const clauses = [character ? "is " + character : "", dress ? "dresses in a " + dress + " way" : "", places.length > 0 ? "is pictured " + namesInSentence(places) : ""].filter(Boolean);
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

/** Imprint, the Lasting impression: "They remember us for [BA9 phrases]." ("" with none chosen; a Value as typed); written into the Lasting impression's text. */
export function lastingImpressionDraft(shown: ReturnType<typeof ambassadorShown>, context: AmbassadorContext): string {
    const options = rememberedOptions(context);
    const phrases = shown.remembered.map(id => options.find(option => option.id === id)?.phrase ?? "").filter(Boolean);
    return phrases.length > 0 ? "They remember us for " + namesInSentence(phrases) + "." : "";
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
