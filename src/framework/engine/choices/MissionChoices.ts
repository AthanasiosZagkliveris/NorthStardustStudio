import { GOAL_PHRASES, PROFILE_QUESTIONS } from "./ProfileQuestions.ts";
import { effectiveProfileAnswers } from "../answers/EffectiveAnswers.ts";
import { asText } from "../answers/Readers.ts";
import type { BusinessCustomerSegmentValue } from "../businessFoundation/foundationPage.ts";
import type { SegmentIdentity } from "../SegmentContext.ts";

/*
    THE MISSION'S THREE CHOICES, PB10 TO PB12, AND THE VALUES' KINDS, PB13 (Questions 9, section 8; the round of 2026-11-20 18:35 UTC+2, approved by the owner at
    22:08: "All, Values A"). Every part of a Mission -- who, what, why (Questions 9, 3.1) -- is already answered on the Business System: PB10 the Segments served
    first, PB11 their Offerings, PB12 what they gain (the goals ticked on their Profiles, "What does this person want to achieve?", the Value Proposition
    Canvas's gains). The Mission's draft is written from them; the founder edits it freely. PB13 the kind of value that matters most in how the business works
    (the Competing Values Framework: Cameron and Quinn, 2011, University of Michigan), each tick starting a line of the Values. Saved in the Identity System:
    PB10 to PB12 in Definition (section 1) beside the Mission, PB13 in Purpose (section 2) beside the Values.
*/

/** The most each takes. */
export const MISSION_SERVES_MAX = 2;
export const MISSION_OFFERS_MAX = 3;
export const MISSION_GAINS_MAX = 2;
export const VALUE_KINDS_MAX = 2;

export const PB10_LABEL = "Who do you serve first?";
export const PB11_LABEL = "What do you offer them?";
export const PB12_LABEL = "What do they gain?";
export const PB13_LABEL = "What matters most in how you work?";

export const PB10_INFO = ["The customers your Mission speaks of first: your Segments.", "Your choices write the Mission's draft; change the text freely."];
export const PB11_INFO = ["What you offer those customers: the Offerings of the Segments you chose."];
export const PB12_INFO = ["Why it matters to them: what they want to achieve, as ticked on their Profiles, the most chosen first.", "Based on: gains (Value Proposition Canvas)."];
export const PB13_INFO = [
    "The kind of value your business holds to in its daily work.",
    "Each choice starts a line of your Values; finish it in your own words.",
    "Based on: Cameron, K. S. and Quinn, R. E. (2011), Diagnosing and Changing Organizational Culture (the Competing Values Framework), University of Michigan."
];

/** PB13's options: the four kinds of the Competing Values Framework, each with the word its Values line starts with. */
export const VALUE_KINDS = [
    { id: "collaborate", label: "Caring for people & working together", word: "Care" },
    { id: "create", label: "Making new & better things", word: "Craft" },
    { id: "compete", label: "Winning customers & results", word: "Results" },
    { id: "control", label: "Doing things right, every time", word: "Reliability" }
] as const;

/** A list of ids as saved: strings, each once, at most `max`, only the known ones where `known` is given. */
function asIds(value: unknown, max: number, known?: ReadonlySet<string>): string[] {
    return [...new Set((Array.isArray(value) ? value : []).map(asText).filter(id => id !== "" && (!known || known.has(id))))].slice(0, max);
}

export function asMissionServes(value: unknown): string[] {
    return asIds(value, MISSION_SERVES_MAX);
}
export function asMissionOffers(value: unknown): string[] {
    return asIds(value, MISSION_OFFERS_MAX);
}
export function asMissionGains(value: unknown): string[] {
    return asIds(value, MISSION_GAINS_MAX);
}
export function asValueKinds(value: unknown): string[] {
    return asIds(value, VALUE_KINDS_MAX, new Set(VALUE_KINDS.map(kind => kind.id)));
}

/** A Segment's name as the choices show it. */
function segmentName(segment: BusinessCustomerSegmentValue, at: number): string {
    return segment.name.trim() || "Segment " + (at + 1);
}

/** PB10's options: the Segments by name. */
export function missionServeOptions(segments: readonly BusinessCustomerSegmentValue[]): { id: string; label: string }[] {
    return segments.map((segment, at) => ({ id: segment.id, label: segmentName(segment, at) }));
}

/** The Segments PB10 chose, or every Segment while none is chosen. */
function servedSegments(segments: readonly BusinessCustomerSegmentValue[], serves: readonly string[]): readonly BusinessCustomerSegmentValue[] {
    const chosen = segments.filter(segment => serves.includes(segment.id));
    return chosen.length > 0 ? chosen : segments;
}

/** PB11's options: the named Offerings of the Segments served, each once. */
export function missionOfferOptions(segments: readonly BusinessCustomerSegmentValue[], serves: readonly string[]): { id: string; label: string }[] {
    const seen = new Set<string>();
    return servedSegments(segments, serves).flatMap(segment => segment.offerings ?? [])
        .filter(offering => offering.name.trim() !== "" && !seen.has(offering.id) && (seen.add(offering.id), true))
        .map(offering => ({ id: offering.id, label: offering.name.trim() }));
}

/** PB12's options: the goals ticked on the served Segments' Profiles, the most chosen first (ties in the list's order); with none ticked, every goal. */
export function missionGainOptions(segments: readonly BusinessCustomerSegmentValue[], serves: readonly string[], identity?: SegmentIdentity): { id: string; label: string }[] {
    const goals = PROFILE_QUESTIONS.find(question => question.id === "e1")?.options ?? [];
    const counts = new Map<string, number>();
    for (const segment of servedSegments(segments, serves)) {
        for (const profile of segment.profiles ?? []) {
            for (const id of effectiveProfileAnswers(profile, segment, identity).e1 ?? []) {
                counts.set(id, (counts.get(id) ?? 0) + 1);
            }
        }
    }
    const every = goals.map((option, order) => ({ id: option.id, label: option.label, order }));
    const shown = counts.size === 0 ? every : every.filter(option => counts.has(option.id)).sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) || a.order - b.order);
    return shown.map(({ id, label }) => ({ id, label }));
}

/** Names joined as a sentence says them: "A", "A and B", "A, B and C". */
function joined(names: readonly string[]): string {
    return names.length <= 1 ? names.join("") : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}

/**
 * The Mission's draft (Questions 9, section 8): "We help [PB10] with [PB11], so that they can [PB12]." It needs PB10 and PB11: "" until then; PB12's clause where it
 * is answered. The goals are said in their own words, in lower case after "can" ("so that they can save time / money"); the choices show their short words, as the Profiles do.
 */
export function missionDraft(segments: readonly BusinessCustomerSegmentValue[], serves: readonly string[], offers: readonly string[], gains: readonly string[]): string {
    const who = missionServeOptions(segments).filter(option => serves.includes(option.id)).map(option => option.label);
    const what = missionOfferOptions(segments, serves).filter(option => offers.includes(option.id)).map(option => option.label);
    if (who.length === 0 || what.length === 0) {
        return "";
    }
    const goals = (PROFILE_QUESTIONS.find(question => question.id === "e1")?.options ?? []).filter(option => gains.includes(option.id)).map(option => GOAL_PHRASES[option.id] ?? option.label).map(phrase => phrase.charAt(0).toLowerCase() + phrase.slice(1));
    return "We help " + joined(who) + " with " + joined(what) + (goals.length > 0 ? ", so that they can " + joined(goals) : "") + ".";
}

/** The Values' draft (Questions 9, section 8): one line a kind ticked, its word then a colon, for the founder to finish ("Care: "). */
export function valuesDraft(kinds: readonly string[]): string {
    return VALUE_KINDS.filter(kind => kinds.includes(kind.id)).map(kind => kind.word + ": ").join("\n");
}

/** The Principles' draft (Questions 9, section 8): one "We always ..." line under each Value, the Value's word before it. */
export function principlesDraft(values: readonly string[]): string {
    return values.map(line => line.split(":")[0].trim()).filter(Boolean).map(word => word + ": We always ").join("\n");
}

/** The Manifesto's draft (Questions 9, section 8): "We are for [the Values' words]." and the Philosophy's first sentence. */
export function manifestoDraft(values: readonly string[], philosophy: string): string {
    const words = values.map(line => line.split(":")[0].trim().toLowerCase()).filter(Boolean);
    const first = (philosophy.trim().match(/^[^.!?]*[.!?]/)?.[0] ?? "").trim();
    return [words.length > 0 ? "We are for " + joined(words) + "." : "", first].filter(Boolean).join(" ");
}
