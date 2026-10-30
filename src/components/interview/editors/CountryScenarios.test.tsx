import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";

import LegalEntityEditor from "./LegalEntityEditor";
import { asLegalEntityValue } from "../../../framework/engine/AnswerLegal.ts";
import { COUNTRIES, legalFormOptions } from "../../../framework/engine/LegalEntityJurisdictions.ts";
import { SCHEME_CODE_LABEL, activitiesLine, loadClassification, pathOf, schemeKeyOf, type ClassificationScheme } from "../../../framework/engine/ActivityClassification.ts";
import { fitPositioningToStage } from "./legal/shared.tsx";
import { RELATIONSHIP_FITS, relationshipFits, relationshipFitsBuyerStage, userStageFits } from "../../../framework/engine/RelationshipFit.ts";
import { positioningLacks } from "../../../framework/engine/OpenItems.ts";
import { purposeRelevance } from "../../../framework/engine/PurposeRelevance.ts";
import { OUTCOME_IDS, PURPOSE_IDS, DIFFERENTIATION_IDS, USER_OUTCOME_IDS } from "../../../framework/engine/PositioningIds.ts";

/**
 * TEN SCENARIOS FOR EACH OF THE SIX COUNTRIES (the owner's request, 2026-10-30): sixty organizations made from a seeded random generator, each put through the data the Organization and the Positioning tiles keep and
 * through the editor. THREE OF THE TEN ARE THE OWNER'S TARGET AUDIENCE (the document "Target Audience Selection": Tier 1, the knowledge-based service businesses: AI automation and software development agencies, UI/UX
 * and design studios, marketing agencies, business consulting firms; Tier 2: architecture and engineering practices, game studios, digital product studios, early-stage SaaS companies). The seed is fixed, so a failure
 * names the same scenario every time.
 */

afterEach(cleanup);

/** A small seeded generator (mulberry32): the same numbers every run. */
function generator(seed: number) {
    let state = seed >>> 0;
    const next = () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const pick = <T,>(list: readonly T[]): T => list[Math.floor(next() * list.length)];
    const some = <T,>(list: readonly T[], count: number): T[] => {
        const left = [...list];
        const out: T[] = [];
        while (out.length < count && left.length > 0) {
            out.push(left.splice(Math.floor(next() * left.length), 1)[0]);
        }
        return out;
    };
    return { next, pick, some };
}

const COUNTRY_SEEDS: Record<string, number> = { GB: 101, IE: 202, US: 303, CA: 404, AU: 505, NZ: 606 };
const WORDS = ["Amber", "Birch", "Cedar", "Delta", "Ember", "Fjord", "Grove", "Harbour", "Indigo", "Juniper", "Kestrel", "Linden", "Meridian", "Nimbus", "Orchard", "Pioneer"];
const NOUNS = ["Works", "Studio", "Partners", "Labs", "Collective", "Group", "Systems", "Trading"];

/** The target audience: the first final code of the scheme whose title matches (a kind of business of the Tier 1 and Tier 2 lists). */
const TARGET_KINDS: { kind: string; tier: number; title: RegExp }[] = [
    { kind: "AI automation or software development agency (Tier 1)", tier: 1, title: /^(business and domestic software development|computer programming activities|custom computer programming services|computer systems? design and related services|computer programming service)/i },
    { kind: "Marketing agency (Tier 1)", tier: 1, title: /advertising agenc|advertising service/i },
    { kind: "Business consulting firm (Tier 1)", tier: 1, title: /management consult|management advice|business and other management|administrative management and general management/i }
];

function finalCodeMatching(scheme: ClassificationScheme, title: RegExp): string | undefined {
    return scheme.items.find(item => (item as { final?: boolean }).final && title.test(item.title))?.code;
}

interface Scenario {
    index: number;
    kind: string;
    target: boolean;
    organisation: Record<string, unknown>;
}

const B2C_RELATIONS = Object.keys(RELATIONSHIP_FITS).filter(id => ["rel:parent", "rel:caregiver", "rel:family", "rel:partner", "rel:friend", "rel:commercial", "rel:otherpersonal"].includes(id));
const B2B_RELATIONS = Object.keys(RELATIONSHIP_FITS).filter(id => ["rel:employer", "rel:copartner", "rel:serving", "rel:intermediary", "rel:sponsor", "rel:otherbusiness"].includes(id));
const USER_STAGES = ["age:minor", "age:young", "age:adult", "age:senior"];

/** The Positioning answers of one random business, valid by construction (the rules of the lists are applied as the editor applies them). */
function positioningOf(random: ReturnType<typeof generator>, forTarget: boolean) {
    const model = forTarget ? "b2b" : random.pick(["b2c", "b2b"]);
    const audience = model === "b2b" ? [random.pick(forTarget ? ["solo", "smb"] : ["solo", "smb", "mid", "enterprise"])] : [random.pick(["young", "adult", "senior"])];
    const category = random.pick(["direct", "proxy", "dual"]);
    let endUser: string[] = [];
    if (category !== "direct") {
        const relations = (model === "b2b" ? B2B_RELATIONS : B2C_RELATIONS).filter(id => relationshipFits(id, category as "proxy" | "dual") && relationshipFitsBuyerStage(id, audience));
        endUser = [random.pick(relations)];
        if (model === "b2c") {
            const stages = USER_STAGES.filter(id => userStageFits(endUser, id, audience));
            endUser.push(random.pick(stages));
        }
    }
    const purpose = forTarget ? random.some(["productivity", "growth", "learning", "creation", "everyday"], 2) : random.some(PURPOSE_IDS, 2);
    const differentiation = forTarget ? random.some(["convenience", "performance", "ecosystem", "cost"], 2) : random.some(DIFFERENTIATION_IDS, 2);
    const outcome = random.some(OUTCOME_IDS, 1);
    const outcomeUser = category === "direct" ? [] : random.some(USER_OUTCOME_IDS, 1);
    return { customerType: [model], audience, buyerCategory: [model + ":" + category], endUser: [...endUser, ...[]], purpose, differentiation, outcome, outcomeUser };
}

async function scenariosOf(country: string): Promise<{ scheme: ClassificationScheme; scenarios: Scenario[] }> {
    const scheme = await loadClassification(schemeKeyOf(country));
    const random = generator(COUNTRY_SEEDS[country]);
    const finals = scheme.items.filter(item => (item as { final?: boolean }).final);
    const forms = legalFormOptions(country, "");
    const scenarios: Scenario[] = [];
    for (let index = 0; index < 10; index++) {
        const target = index < 3;
        const kind = target ? TARGET_KINDS[index].kind : "Random business";
        const code = target ? finalCodeMatching(scheme, TARGET_KINDS[index].title) : random.pick(finals).code;
        // The seeded draws are made in the same order for every scenario, target or not, so the random ones stay the same.
        const name = random.pick(WORDS) + " " + random.pick(NOUNS);
        const form = random.pick(forms).label;
        const positioning = positioningOf(random, target);
        scenarios.push({
            index, kind, target,
            organisation: { name, country, legalForm: form, activities: code ? [{ code, edition: scheme.edition }] : [], marketType: "single", ...positioning }
        });
    }
    return { scheme, scenarios };
}

function Org({ value, audienceOnly, organizationOnly }: { value: unknown; audienceOnly?: boolean; organizationOnly?: boolean }) {
    const [state, setState] = useState<unknown>(value);
    return <LegalEntityEditor value={state} onChange={setState} audienceOnly={audienceOnly} organizationOnly={organizationOnly} businessStage="grow" />;
}

describe.each(["GB", "IE", "US", "CA", "AU", "NZ"])("ten scenarios for %s, three of them the target audience", (country) => {

    it("has the target audience's kinds of business in the country's classification", async () => {
        const { scheme } = await scenariosOf(country);
        for (const kind of TARGET_KINDS) {
            expect(finalCodeMatching(scheme, kind.title), kind.kind + " in " + country).toBeTruthy();
        }
    });

    it("keeps each organization's country, legal form, activity and positioning through the answer", async () => {
        const { scheme, scenarios } = await scenariosOf(country);
        expect(scenarios).toHaveLength(10);
        expect(scenarios.filter(scenario => scenario.target)).toHaveLength(3);
        const countryName = COUNTRIES.find(entry => entry.code === country)!.name;
        for (const scenario of scenarios) {
            const where = country + " #" + scenario.index + " (" + scenario.kind + ")";
            const value = asLegalEntityValue({ organisation: scenario.organisation });
            const organisation = value.organisation;
            // The country and the legal form: one of the country's own forms.
            expect(organisation.country, where).toBe(country);
            expect(legalFormOptions(country, "").map(form => form.label), where + ": legal form").toContain(organisation.legalForm);
            // The activity: one final code of the country's scheme, with every level above it named.
            const activity = organisation.activities[0];
            expect(activity?.code, where + ": activity code").toBeTruthy();
            const path = pathOf(scheme, activity.code);
            expect(path.length, where + ": the levels of " + activity.code).toBeGreaterThanOrEqual(2);
            expect(path.every(item => item.title.trim().length > 0), where + ": every level has a title").toBe(true);
            expect(path.map(item => item.level), where + ": the levels run top down").toEqual(path.map((_, at) => at + 1));
            expect(path[path.length - 1].code).toBe(activity.code);
            // The code is said with its scheme's initials.
            expect(activitiesLine(country, organisation.activities), where).toContain(SCHEME_CODE_LABEL[schemeKeyOf(country)] + " " + activity.code);
            // The positioning survives the reader, the stage fit (Growing: no limit) and is complete.
            expect(organisation.customerType, where).toEqual(scenario.organisation.customerType);
            expect(organisation.purpose, where).toEqual(scenario.organisation.purpose);
            expect(organisation.differentiation, where).toEqual(scenario.organisation.differentiation);
            expect(organisation.outcome, where).toEqual(scenario.organisation.outcome);
            expect(organisation.buyerCategory, where).toEqual(scenario.organisation.buyerCategory);
            expect(organisation.endUser, where).toEqual(scenario.organisation.endUser);
            expect(fitPositioningToStage(organisation, "grow"), where + ": the stage fit changes nothing").toBe(organisation);
            expect(positioningLacks(organisation), where + ": nothing lacking").toEqual([]);
            // The purpose list exists for it and is led by what its tables call relevant.
            expect(purposeRelevance({
                models: organisation.customerType,
                categories: organisation.buyerCategory,
                relationships: organisation.endUser.filter(id => id.startsWith("rel:")),
                buyerStages: organisation.audience.filter(id => ["young", "adult", "senior"].includes(id)),
                userStages: organisation.endUser.filter(id => id.startsWith("age:")),
                businessScales: organisation.audience.filter(id => ["solo", "smb", "mid", "enterprise"].includes(id))
            }), where).not.toBeNull();
            expect(countryName, where).toBeTruthy();
        }
    });

    it("shows the country, the legal form and the activity code with the scheme's name in the editor (the first two: a software business of the target audience and another of it)", async () => {
        const { scenarios } = await scenariosOf(country);
        const countryName = COUNTRIES.find(entry => entry.code === country)!.name;
        // (The first two, both of the target audience: drawing an editor is the slow part of the suite, and all ten are tested above.)
        for (const scenario of scenarios.slice(0, 2)) {
            const where = country + " #" + scenario.index + " (" + scenario.kind + ")";
            const value = asLegalEntityValue({ organisation: scenario.organisation });
            // (The Organization tile alone: the whole page's editor is slow to draw sixty times.)
            const { container, unmount } = render(<Org value={value} organizationOnly />);
            const text = container.textContent ?? "";
            expect(text, where + ": country").toContain(countryName);
            expect(text, where + ": legal form").toContain(value.organisation.legalForm.split(" (")[0]);
            // (The folded activity says its code with the scheme's initials, once the scheme is loaded.)
            const code = SCHEME_CODE_LABEL[schemeKeyOf(country)] + " " + value.organisation.activities[0].code;
            await screen.findAllByText(code, { exact: false });
            expect(container.textContent, where + ": activity").toContain(code);
            unmount();
        }
    });

    it("shows the positioning answers ticked in the Positioning tile (the first two: a software business of the target audience and another of it)", async () => {
        const { scenarios } = await scenariosOf(country);
        for (const scenario of scenarios.slice(0, 2)) {
            const where = country + " #" + scenario.index + " (" + scenario.kind + ")";
            const value = asLegalEntityValue({ organisation: scenario.organisation });
            const { container, unmount } = render(<Org value={value} audienceOnly />);
            const checked = [...container.querySelectorAll("input:checked")].map(input => (input.closest("label")?.textContent ?? "").trim());
            // One answer for each question that is asked: the relationship, its audience, the category, the purposes, the differentiations, the outcome (and, for a Proxy or Dual-Intent buyer, the user's).
            const expected = 1 + 1 + 1 + value.organisation.purpose.length + value.organisation.differentiation.length + value.organisation.outcome.length
                + value.organisation.endUser.length + value.organisation.outcomeUser.length;
            expect(checked.length, where + ": " + checked.join(" | ")).toBe(expected);
            // (The groups are told apart by double divider lines, no subtitles: one between the Offering and the Outcome, and one between the Business and the User where there is a user.)
            const user = !value.organisation.buyerCategory[0].endsWith("direct");
            expect(container.querySelectorAll(".business-capability-card-rule-double").length, where).toBe(user ? 2 : 1);
            expect(container.textContent?.includes("Buyer & User relationship"), where).toBe(user);
            unmount();
        }
    });

});
