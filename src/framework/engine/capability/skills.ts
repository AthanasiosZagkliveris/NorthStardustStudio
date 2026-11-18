/**
 * THE SKILLS THE BUSINESS STILL NEEDS (LC1; owner, 2026-11-16 20:39: "capacity and capability should be unified, and the capability section to be removed").
 * Capacity & Delivery on 3. Infrastructure & Capability asks which skills the plan needs that the team lacks today; each one's cover is read from the Team of
 * the activities in its group, never typed twice. The Legal Entity's Gaps and Cover text (FoundersProfile `teamGaps`, `teamCover`) is read once into it.
 */
import type { BusinessCapabilityValue } from "./types.ts";

/** LC1's options, in order; Other is written in, one name a row (`skillsOther`). */
export const SKILLS = [
    { id: "bookkeeping", label: "Bookkeeping and tax" },
    { id: "legal", label: "Legal and contracts" },
    { id: "marketing", label: "Marketing and social media" },
    { id: "selling", label: "Selling" },
    { id: "design", label: "Design" },
    { id: "website", label: "Website and technology" },
    { id: "making", label: "Making or producing" },
    { id: "service", label: "Customer service" },
    { id: "delivery", label: "Delivery and logistics" },
    { id: "other", label: "Other" }
] as const;

/** LC1's "i". */
export const SKILLS_HELP = ["Skills the plan needs that the team lacks today. Each one's cover comes from the Team of its activities: Marketing's and Production's for marketing and making, and for the others the activities whose name says the skill (bookkeeping, a contract, the website)."];

/** The activity groups whose Team covers a skill: Marketing; Sales & Customer; Production; the rest Infrastructure's Pre-Operational and Operational. */
const SKILL_GROUPS: Readonly<Record<string, readonly string[]>> = {
    marketing: ["marketing"],
    selling: ["sales"],
    service: ["sales"],
    making: ["production"],
    delivery: ["production"]
};
const INFRASTRUCTURE_GROUPS = ["pre-operational", "operational"];

/**
 * THE SKILL AN ACTIVITY USES, BY ITS NAME (owner, 2026-11-18 02:31: the lawyer and the accountant covered Website and technology, as every Infrastructure performer
 * covered every Infrastructure skill): a skill shared with other skills in its groups is covered by the activities whose name says it, in any group -- "Monthly
 * bookkeeping", "Register trade mark", "Launch website and journal". Marketing and Making keep their whole group, which is theirs alone; Other, Infrastructure's.
 */
const SKILL_WORDS: Readonly<Record<string, RegExp>> = {
    bookkeeping: /book-?keep|account|xero|quickbooks|\btax|\bvat\b|payroll|invoic|bank|financ|budget/i,
    legal: /legal|lawyer|contract|trade ?mark|\bico\b|privacy|gdpr|licen[cs]|insur|regist|complian|terms/i,
    website: /web|\bsite\b|online (store|shop)|shopify|\bseo\b|domain|hosting|password|\bit\b|technolog/i,
    design: /design|brand|logo|photo|packag|graphic|visual/i,
    selling: /\bsell|\bsales?\b|price|proposal|quote|wholesale|stockist|referral|pitch|\btrade\b|order/i,
    service: /service|support|customer|aftercare|repair|enquir|onboard/i,
    delivery: /deliver|ship|\bpost|courier|dispatch|install|handover|fulfil/i
};

/** The activity groups whose Team covers a skill (a skill written under Other: Infrastructure's). */
export function skillGroups(skillId: string): readonly string[] {
    return SKILL_GROUPS[skillId] ?? INFRASTRUCTURE_GROUPS;
}

/** What the business still needs, as saved or, before the first save, read from the Legal Entity's Gaps and Cover. */
export interface SkillsNeeded {
    /** SKILLS ids ticked, "other" among them where names are written. */
    ticked: string[];
    /** The names written under Other, one a row. */
    other: string[];
    /** The band's Notes. */
    notes: string;
}

/**
 * THE SKILLS AS EVERY READER SEES THEM: the capability answer's, or -- while it has never been saved with them -- the Legal Entity's Gaps text read as Other rows,
 * one a sentence, and its Cover text as the Notes (the migration, once: the editor saves it).
 */
export function skillsOf(capability: Pick<BusinessCapabilityValue, "skillsNeeded" | "skillsOther" | "skillsNotes">, legacy?: { teamGaps?: string; teamCover?: string }): SkillsNeeded {
    if (capability.skillsNeeded !== undefined) {
        return { ticked: [...capability.skillsNeeded], other: [...(capability.skillsOther ?? [])], notes: capability.skillsNotes ?? "" };
    }
    const sentences = (legacy?.teamGaps ?? "").split(/(?<=[.!?])\s+|\n+/).map(text => text.trim()).filter(Boolean);
    return { ticked: sentences.length > 0 ? ["other"] : [], other: sentences, notes: (legacy?.teamCover ?? "").trim() };
}

/** Who covers a skill: the names on the Team of the activities in its groups (founders, staff, partners, suppliers), each once, by id. */
export function skillCover(capability: BusinessCapabilityValue, skillId: string, nameOf: (id: string) => string): { id: string; name: string }[] {
    const groups = skillGroups(skillId);
    const words = SKILL_WORDS[skillId];
    const every = [...capability.activities.flatMap(category => category.activities.map(activity => ({ ...activity, category: category.id }))), ...capability.offering.activities];
    // (Selling keeps the Sales activities that are not customer service, whatever their words: the group is theirs but for service.)
    const activities = words
        ? every.filter(activity => words.test(activity.name) || (skillId === "selling" && activity.category === "sales" && !SKILL_WORDS.service.test(activity.name)))
        : [
            ...capability.activities.filter(category => groups.includes(category.id)).flatMap(category => category.activities),
            ...capability.offering.activities.filter(activity => groups.includes(activity.category))
        ];
    const ids = [...new Set(activities.flatMap(activity => activity.performerIds).filter(id => id !== ""))];
    return ids.map(id => ({ id, name: nameOf(id) })).filter(entry => entry.name !== "");
}

/** Every name a Team can hold, by id: the founders, the Staff, the partners and suppliers of both places. */
export function teamNames(capability: BusinessCapabilityValue, founderNames: Readonly<Record<string, string>>): (id: string) => string {
    const cards = [
        ...Object.values(capability.resources).flat().flatMap(entry => entry.slots),
        ...capability.offering.resources,
        ...capability.professionals, ...capability.providers,
        ...capability.offering.professionals, ...capability.offering.providers
    ];
    return (id: string) => founderNames[id] ?? cards.find(card => card.id === id)?.name.trim() ?? "";
}

/** The label of a ticked skill, or the written name of an Other row. */
function skillLabel(skillId: string): string {
    return SKILLS.find(skill => skill.id === skillId)?.label ?? skillId;
}

/** One needed skill as the documents and the Review read it: its words, and who covers it (empty: not covered yet). */
export interface NeededSkill {
    label: string;
    cover: string[];
}

/** Every needed skill with its cover: the ticked ones in LC1's order, then each written under Other (covered from Infrastructure's activities). */
export function neededSkills(capability: BusinessCapabilityValue, legacy: { teamGaps?: string; teamCover?: string } | undefined, founderNames: Readonly<Record<string, string>>): NeededSkill[] {
    const skills = skillsOf(capability, legacy);
    const names = teamNames(capability, founderNames);
    const rows = [
        ...skills.ticked.filter(id => id !== "other" && SKILLS.some(skill => skill.id === id)).map(id => ({ id, label: skillLabel(id) })),
        ...(skills.ticked.includes("other") ? skills.other.map(name => name.trim()).filter(Boolean).map(name => ({ id: "other", label: name })) : [])
    ];
    return rows.map(row => ({ label: row.label, cover: skillCover(capability, row.id, names).map(entry => entry.name) }));
}

/** A needed skill as one line: "Selling: covered by Jordan Ellis, SCORE mentor" or "Selling: not covered yet". */
export function neededSkillLine(skill: NeededSkill): string {
    return skill.label + ": " + (skill.cover.length > 0 ? "covered by " + skill.cover.join(", ") : "not covered yet");
}
