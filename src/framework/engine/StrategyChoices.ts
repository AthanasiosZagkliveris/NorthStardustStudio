import { COMPETITOR_CHANGES, namesInSentence } from "./CompetitorQuestions.ts";
import { DIFFERENTIATION_PHRASES } from "./AmbassadorChoices.ts";

/*
    THE STRATEGY PAGE'S CHOICE QUESTIONS, SW1 AND SC1 TO SC3 (doc 49, 2.3 and 2.4; owner, 2026-11-12, D16 to D22; built 2026-11-19, the owner's approved plan of
    2026-11-18, §3, B2). SW1, in the SWOT dialog above the Opportunities and Threats: how each change could affect the business, 1 = Threat to 5 = Opportunity, the
    changes the Segments named ticked first. SC1 to SC3, in the Strategic Compass dialog above its text: the stance (TOWS), where growth comes from (Ansoff), the
    Segment that comes first; then "Add a draft" writes the Compass sentence. Saved in the Strategy Foundation (`changeEffects`, `stance`, `growth`,
    `firstSegmentId`); a key never saved follows its start (SW1's ticks, SC1 and SC2 from their answers above).
*/

/** SW1's rows: the Segment's change list, as built (COMPETITOR_CHANGES' short words). */
export const SW1_CHANGES = COMPETITOR_CHANGES;

export const SW1_LABEL = "How could these changes affect you?";
export const SW1_INFO = [
    "1 = Threat, 5 = Opportunity; 3 = little effect either way.",
    "How each change could help or hurt your business. The changes your Segments named start ticked.",
    "Based on: Aguilar (1967), Scanning the business environment (the external scan behind PESTLE)."
];

/** SC1's options (doc 49, SC1). */
export const SC1_STANCES = [
    { id: "so", label: "Use your strengths to seize opportunities", phrase: "using our strengths to seize opportunities" },
    { id: "wo", label: "Close your gaps by seizing opportunities", phrase: "closing our gaps by seizing opportunities" },
    { id: "st", label: "Use your strengths to guard against threats", phrase: "using our strengths to guard against threats" },
    { id: "wt", label: "Close your gaps & steer clear of threats", phrase: "closing our gaps and steering clear of threats" }
] as const;

/** SC2's options (doc 49, SC2); `launch` at Planning and Launching only. */
export const SC2_GROWTH = [
    { id: "launch", label: "Your first customers, won at launch", phrase: "win our first customers at launch" },
    { id: "penetration", label: "More sales to the customers you serve", phrase: "sell more to the customers we serve" },
    { id: "market", label: "New customers or places for what you offer", phrase: "take what we offer to new customers or places" },
    { id: "product", label: "New Offerings for the customers you serve", phrase: "bring new Offerings to the customers we serve" },
    { id: "diversification", label: "New Offerings for new customers", phrase: "bring new Offerings to new customers" }
] as const;

export const SC_LABELS = {
    sc1: "What will this period's strategy mainly do?",
    sc2: "Where will growth come from in this period?",
    sc3: "Which Segment comes first?"
} as const;

export const SC_INFO = {
    sc1: ["Match what is inside your business with what is outside it, then choose where the effort goes.", "Your gaps are your SWOT's Weaknesses. Your SWOT suggests a start; change it freely.", "Based on: Weihrich (1982), The TOWS matrix: a tool for situational analysis."],
    sc2: ["The direction your sales grow in during this period: Ansoff's four directions, plus a first launch for a business yet to sell.", "Based on: Ansoff (1957), Strategies for diversification."],
    sc3: ["The customers you focus on first in this period. Your other Segments stay in the plan, with less of your time."]
} as const;

/** The most SC2 takes. */
export const SC2_MAX = 2;

/** What the choices read from the other Systems (strategyChoiceContext): the business stage, the Segments, the changes they named, PB8 against today's reach. */
export interface StrategyChoiceContext {
    stage: string;
    /** The changes ticked on any Segment, the most ticked first: SW1's start. */
    changeStarts: string[];
    /** Each Segment: its id, its name and its Differentiation ids (K14), for SC3 and the Compass draft. */
    segments: { id: string; name: string; differentiation: string[] }[];
    /** PB8's rank above every Segment's reach today (doc 45, 3.8): starts SC2's `market`. */
    reachBeyond: boolean;
}

const early = (stage: string) => stage === "plan" || stage === "launch";

/** SW1 as shown: the rows ticked (saved, or the Segments' changes while never saved) and their ratings. */
export function changeEffectsShown(saved: Readonly<Record<string, number>> | undefined, starts: readonly string[]): { ticked: string[]; ratings: Record<string, number> } {
    const known = new Set(SW1_CHANGES.map(change => change.id));
    if (!saved) {
        return { ticked: starts.filter(id => known.has(id)), ratings: {} };
    }
    const ids = Object.keys(saved).filter(id => known.has(id));
    return { ticked: ids, ratings: Object.fromEntries(ids.filter(id => saved[id] >= 1 && saved[id] <= 5).map(id => [id, saved[id]])) };
}

/** SW1's rows in their order: the ticked first, the Segments' order of their changes, then the rest. */
export function changeRows(starts: readonly string[]): { id: string; label: string }[] {
    return [...starts.map(id => SW1_CHANGES.find(change => change.id === id)).filter((change): change is (typeof SW1_CHANGES)[number] => !!change), ...SW1_CHANGES.filter(change => !starts.includes(change.id))].map(change => ({ id: change.id, label: change.label }));
}

/** The SWOT lines SW1 starts (doc 49, 2.3): a change rated 4 or 5 could help, 1 or 2 could hurt. */
export function changeEffectLines(saved: Readonly<Record<string, number>> | undefined): { opportunities: string[]; threats: string[] } {
    const opportunities: string[] = [];
    const threats: string[] = [];
    for (const change of SW1_CHANGES) {
        const point = saved?.[change.id] ?? 0;
        if (point >= 4) opportunities.push("Changes in " + change.label.toLowerCase() + " could help you.");
        else if (point >= 1 && point <= 2) threats.push("Changes in " + change.label.toLowerCase() + " could hurt you.");
    }
    return { opportunities, threats };
}

/**
 * SC1's start from the SWOT (doc 49, SC1): the pair of quadrants with the most lines, the first two lines of each list counting double; a tie in the options'
 * order. At Planning and Launching it chooses between `so` and `wo` only. "" with an empty SWOT.
 */
export function stanceStart(swot: Readonly<Record<string, readonly string[]>>, stage: string): string {
    const weight = (id: string) => (swot[id] ?? []).filter(line => line.trim()).reduce((sum, _line, at) => sum + (at < 2 ? 2 : 1), 0);
    const score: Record<string, number> = {
        so: weight("strengths") + weight("opportunities"), wo: weight("weaknesses") + weight("opportunities"),
        st: weight("strengths") + weight("threats"), wt: weight("weaknesses") + weight("threats")
    };
    const offered = SC1_STANCES.filter(stance => !early(stage) || stance.id === "so" || stance.id === "wo");
    const best = offered.reduce((top, stance) => score[stance.id] > score[top.id] ? stance : top, offered[0]);
    return score[best.id] > 0 ? best.id : "";
}

/** SC2's options at the stage: "Your first customers" at Planning and Launching only. */
export function growthOptions(stage: string): { id: string; label: string }[] {
    return SC2_GROWTH.filter(option => option.id !== "launch" || early(stage)).map(option => ({ id: option.id, label: option.label }));
}

/** SC2's start (doc 49, SC2): Planning or Launching ticks `launch`; PB8 wider than every Segment's reach ticks `market`. */
export function growthStart(context: Pick<StrategyChoiceContext, "stage" | "reachBeyond">): string[] {
    return [...(early(context.stage) ? ["launch"] : []), ...(context.reachBeyond ? ["market"] : [])].slice(0, SC2_MAX);
}

/** The three choices as the dialog shows them: each saved one, or its start. */
export function compassChoicesShown(saved: { stance?: string; growth?: string[]; firstSegmentId?: string }, swot: Readonly<Record<string, readonly string[]>>, context: StrategyChoiceContext): { stance: string; growth: string[]; firstSegmentId: string } {
    const offered = new Set(growthOptions(context.stage).map(option => option.id));
    const segment = context.segments.find(entry => entry.id === saved.firstSegmentId) ?? context.segments[0];
    return {
        stance: SC1_STANCES.some(stance => stance.id === saved.stance) ? saved.stance! : stanceStart(swot, context.stage),
        growth: (saved.growth ?? growthStart(context)).filter(id => offered.has(id)).slice(0, SC2_MAX),
        firstSegmentId: segment?.id ?? ""
    };
}

/**
 * THE COMPASS DRAFT (doc 49, 2.4): "Over [the period], our focus is [SC3]. We will [SC2 phrases, joined with 'and'], [SC1 phrase], and stand out for [SC3's K14
 * phrases]. This takes us towards our Vision." A part with no answer is left out; "" with none.
 */
export function compassDraft(period: string, shown: ReturnType<typeof compassChoicesShown>, context: StrategyChoiceContext): string {
    const segment = context.segments.find(entry => entry.id === shown.firstSegmentId);
    const name = segment?.name.trim() ?? "";
    const growth = namesInSentence(shown.growth.map(id => SC2_GROWTH.find(option => option.id === id)?.phrase ?? "").filter(Boolean));
    const stance = SC1_STANCES.find(option => option.id === shown.stance)?.phrase ?? "";
    const standOut = namesInSentence((segment?.differentiation ?? []).map(id => DIFFERENTIATION_PHRASES[id] ?? "").filter(Boolean));
    const sentences: string[] = [];
    if (name) {
        sentences.push((period ? "Over " + period + ", our" : "Our") + " focus is " + name + ".");
    }
    if (growth || standOut) {
        sentences.push("We will " + growth +(growth && stance ? ", " + stance : "") + (standOut ? (growth ? ", and " : "") + "stand out for " + standOut : "") + ".");
    }
    return sentences.length > 0 ? [...sentences, "This takes us towards our Vision."].join(" ") : "";
}
