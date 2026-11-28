/* Part of BusinessDocuments.ts: the Strategy page's SWOT suggestions, SW2 (Questions 21, sections 2.3 and 10). */

import { type Foundation, type FoundationSessions, readFoundation, swotStartsOf } from "./reading.ts";
import { segmentIdentityOf, settledSegmentAnswers } from "../SegmentContext.ts";
import { effectiveOfferingAnswers, effectiveProfileAnswers } from "../answers/EffectiveAnswers.ts";
import { COMPETITOR_VALUES, clearOpenings, competitorRatings, valueInSentence } from "../choices/CompetitorQuestions.ts";
import { DIFFERENTIATION_WORDS } from "../ActivityClassification.ts";
import { VISION_REACH, asVisionReach, reachRank, widestSegmentReach } from "../choices/VisionChoices.ts";
import { changeEffectLines } from "../choices/StrategyChoices.ts";

/** The four quadrants' suggestions, each a line as it is written into the quadrant. */
interface SwotSuggestions {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

/**
 * SW2, "WHICH OF THESE FIT YOU?" (Questions 21, sections 2.3 and 10; the round of 2026-11-20 18:35 UTC+2, approved by the owner at 22:08, "All, Values A"): the
 * suggestions of section 2.3 for each quadrant, read from what the Business System records, each a line the founder ticks into the quadrant's list. A line is
 * offered once; the market's starts and SW1's lines (swotStartsOf) are among them, in their own words, so a ticked one is the same line as the start.
 * Built: the Differentiation, the funding and the break even (Strengths); the funding gap, the break even beyond the plan and an Offering still being built
 * (Weaknesses); the clear opening, the market, SW1 and PB8 (Opportunities); the market, SW1, a Competitor hard to beat and a growing Competitor (Threats).
 * Not built yet, kept in section 2.3: the founders' skills and the skills gap (the skill areas, 2.9), the spare hours and the delivery shortfall, the Stress
 * Test's case, the price below the cost of each sale, the unmet value, the K10 openings.
 */
export function swotSuggestionsOf(f: Foundation): SwotSuggestions {
    const s: SwotSuggestions = { strengths: [], weaknesses: [], opportunities: [], threats: [] };
    const identity = segmentIdentityOf(f.legalEntity.organisation, f.stage);
    const starts = swotStartsOf(f);

    // STRENGTHS.
    for (const segment of f.segments) {
        const answers = settledSegmentAnswers(segment, f.legalEntity.organisation);
        for (const id of answers.differentiation ?? []) {
            if (DIFFERENTIATION_WORDS[id]) {
                s.strengths.push("Your chosen point of difference: " + DIFFERENTIATION_WORDS[id]);
            }
        }
    }
    if (f.position.need > 0.005 && f.position.gap <= 0.005) {
        s.strengths.push("The funding need is covered");
    }
    const breakEven = f.outlook.breakEvenMonth;
    if (breakEven !== null) {
        const label = f.outlook.months.find(month => month.month === breakEven)?.label;
        if (label) {
            s.strengths.push("Breaks even in " + label);
        }
    }

    // WEAKNESSES.
    if (f.position.gap > 0.005) {
        s.weaknesses.push("Funding gap of " + f.format(f.position.gap));
    }
    if (breakEven === null && f.outlook.expectedRevenue > 0.5) {
        s.weaknesses.push("Break even falls beyond the plan");
    }
    if (f.stage !== "plan") {
        for (const segment of f.segments) {
            for (const offering of segment.offerings) {
                const ready = effectiveOfferingAnswers(offering, segment, identity).o2?.[0];
                if ((ready === "building" || ready === "idea") && offering.name.trim()) {
                    s.weaknesses.push(offering.name.trim() + " is still being built");
                }
            }
        }
    }

    // OPPORTUNITIES AND THREATS: the market's starts and SW1's lines first, in their own words.
    s.opportunities.push(...starts.opportunities, ...changeEffectLines(f.strategyFoundation.changeEffects).opportunities);
    s.threats.push(...starts.threats, ...changeEffectLines(f.strategyFoundation.changeEffects).threats);
    for (const segment of f.segments) {
        const profiles = segment.profiles.map(profile => effectiveProfileAnswers(profile, segment, identity));
        const competitors = segment.competitors.map(competitor => competitor.questions ?? {});
        for (const value of clearOpenings(profiles, competitors)) {
            s.opportunities.push("Customers rate " + valueInSentence(value) + " highly, and competitors fall short on it");
        }
        const valued = (value: string) => profiles.some(profile => (profile.b1 ?? []).includes(value) && (profile["b1-rating"] ?? []).some(entry => entry === value + ":4" || entry === value + ":5"));
        for (const competitor of segment.competitors) {
            const name = competitor.name.trim();
            if (!name) {
                continue;
            }
            const answers = competitor.questions ?? {};
            for (const value of COMPETITOR_VALUES.map(option => option.id)) {
                if (competitorRatings(answers, "k8")[value] === 5 && valued(value)) {
                    s.threats.push(name + " is hard to beat on " + valueInSentence(value));
                }
            }
            if (Number(answers.k4?.[0]) >= 4) {
                s.threats.push(name + " is growing");
            }
        }
    }
    const reach = asVisionReach((f.definition as Record<string, unknown> | undefined)?.visionReach);
    const today = widestSegmentReach(f.segments.map(segment => ({ name: segment.name, questions: settledSegmentAnswers(segment, f.legalEntity.organisation) })));
    if (reach && reachRank(reach) > (today?.rank ?? 0)) {
        s.opportunities.push("Customers beyond your reach today: " + (VISION_REACH.find(entry => entry.id === reach)?.label ?? reach));
    }

    const once = (lines: string[]) => [...new Set(lines.map(line => line.trim()).filter(Boolean))];
    return { strengths: once(s.strengths), weaknesses: once(s.weaknesses), opportunities: once(s.opportunities), threats: once(s.threats) };
}

/** SW2's suggestions (swotSuggestionsOf), from the sessions, for the Strategy page. */
export function strategySwotSuggestions(sessions: FoundationSessions): SwotSuggestions {
    return swotSuggestionsOf(readFoundation(sessions));
}
