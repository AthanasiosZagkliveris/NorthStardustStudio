import { SEGMENT_QUESTIONS } from "./SegmentQuestions.ts";
import { asText } from "../answers/Readers.ts";

/*
    THE VISION'S TWO CHOICES, PB7 AND PB8 (Questions 9, section 3.8; owner, 2026-11-12, D1 and D21; built 2026-11-19, the owner's approved plan of 2026-11-18, §3, B2):
    in the Mission & Vision dialog, in the Vision's column, under its text, one question per band. PB7: what the business will be when the Vision comes true
    (ticks, 3 max), each option putting a Strategic Theme first. PB8: where its customers will be (one choice), sharing the Segment's reach ids and rank (D21),
    the Segment's widest answer shown under it. Saved in the Identity System's Definition (section 1) as `visionAmbitions` and `visionReach`.
*/

/** PB7's options: each the Theme it puts first and its phrase for the Business Plan (Questions 9, 3.8). */
export const VISION_AMBITIONS = [
    { id: "customers", label: "Serving a large, growing customer base", theme: "Growth & Market", phrase: "serving a large, growing customer base" },
    { id: "loved", label: "Loved & recommended by its customers", theme: "Customers & Experience", phrase: "recommended by loyal customers" },
    { id: "range", label: "Offering a strong, growing range", theme: "Products & Innovation", phrase: "offering a strong, growing range" },
    { id: "profitable", label: "Profitable & paying its own way", theme: "Revenue & Financial Sustainability", phrase: "profitable, paying its own way" },
    { id: "trusted", label: "Known & trusted in its field", theme: "Brand & Positioning", phrase: "trusted in its field" },
    { id: "smooth", label: "Running smoothly with a strong team", theme: "Operations & Capability", phrase: "running smoothly with a strong team" },
    { id: "partners", label: "Working closely with strong partners", theme: "Partnerships & Expansion", phrase: "working closely with strong partners" }
] as const;

/** PB8's options, with the rank they share with the Segment's reach (D21) and the Business Plan's phrase (Questions 9, 3.8). */
export const VISION_REACH = [
    { id: "city", rank: 1, label: "In my city / town", phrase: "in our city / town" },
    { id: "region", rank: 2, label: "In my state / region", phrase: "across our state / region" },
    { id: "country", rank: 3, label: "Across my country", phrase: "across our country" },
    { id: "countries", rank: 4, label: "In several countries", phrase: "in several countries" },
    { id: "worldwide", rank: 5, label: "Worldwide", phrase: "worldwide" }
] as const;

/** The most PB7 takes. */
export const VISION_AMBITIONS_MAX = 3;

/** The rank of a reach, the Vision's or a Segment's: the Segment's "Anywhere online" stands level with Worldwide (Questions 9, 3.8). */
export function reachRank(id: string): number {
    return id === "online" ? 5 : VISION_REACH.find(entry => entry.id === id)?.rank ?? 0;
}

export const PB7_INFO = ["The kind of future your Vision describes.", "Your choices put the matching Strategic Themes first on the Strategy page."];
export const PB8_INFO = ["Where your customers will be when your Vision comes true.", "The distance from today's reach, shown below, guides the growth choices on the Strategy page."];

/** PB7 as saved: known ids, each once, three at most. */
export function asVisionAmbitions(value: unknown): string[] {
    const ids = new Set<string>(VISION_AMBITIONS.map(entry => entry.id));
    return [...new Set((Array.isArray(value) ? value : []).map(asText).filter(id => ids.has(id)))].slice(0, VISION_AMBITIONS_MAX);
}

/** PB8 as saved: a known id, or "". */
export function asVisionReach(value: unknown): string {
    const id = asText(value);
    return VISION_REACH.some(entry => entry.id === id) ? id : "";
}

/** The Segment's widest reach today, with its Segment's name: what PB8's muted line says ("Today: Across my country (London Homemakers)"); null with none answered. */
export function widestSegmentReach(segments: readonly { name: string; questions?: Record<string, readonly string[] | undefined> }[]): { label: string; segment: string; rank: number } | null {
    const reach = SEGMENT_QUESTIONS.find(question => question.id === "reach");
    let best: { label: string; segment: string; rank: number } | null = null;
    for (const segment of segments) {
        const id = segment.questions?.reach?.[0] ?? "";
        const rank = reachRank(id);
        if (rank > 0 && (!best || rank > best.rank)) {
            best = { label: reach?.options.find(option => option.id === id)?.label ?? id, segment: segment.name.trim() || "Segment", rank };
        }
    }
    return best;
}

/** The Business Plan's sentence (Questions 9, 3.8): "When our Vision comes true, the business will be [PB7 phrases, joined with commas and 'and'], with customers [PB8 phrase]."
    It needs PB7 (the doc gives no sentence without it): "" until then; PB8's clause where it is answered. */
export function visionChoicesSentence(ambitions: readonly string[], reach: string): string {
    const phrases = ambitions.map(id => VISION_AMBITIONS.find(entry => entry.id === id)?.phrase ?? "").filter(Boolean);
    if (phrases.length === 0) {
        return "";
    }
    const where = VISION_REACH.find(entry => entry.id === reach)?.phrase ?? "";
    const joined = phrases.length === 1 ? phrases[0] : phrases.slice(0, -1).join(", ") + " and " + phrases[phrases.length - 1];
    return "When our Vision comes true, the business will be " + joined + (where ? ", with customers " + where : "") + ".";
}
