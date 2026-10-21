/**
 * THE FOUNDERS PROFILE page.
 * Split out of AnswerUtils.ts (still importable from there).
 */
import { asText } from "./Readers.ts";
import { LegalEntityFounderValue } from "./AnswerLegal.ts";

/* ==========================================================
   Founders Profile (see AnswerType.FoundersProfile)

   One card per founder the Legal Entity names, keyed by that
   founder's id, so a rename or a reorder there is followed here.
   Roles and a short bio used to be asked on the Legal Entity
   itself; a founder saved then carries them on its Legal Entity
   row, and founderProfiles reads them from there until this page
   holds an entry of its own for that founder.
========================================================== */

/** The two subsections, in the order the page asks them. */
export const FOUNDERS_PROFILE_SECTIONS = [
    "Founders",
    "Capability Gaps & Cover"
] as const;

/**
 * What a Skills, Expertise & Qualifications entry is, in the order
 * the page offers them and the documents list them.
 */
export const FOUNDER_CREDENTIAL_TYPES = [
    { id: "skill", label: "Skill" },
    { id: "expertise", label: "Professional / Technical Expertise" },
    { id: "qualification", label: "Degree / Qualification" },
    { id: "certification", label: "Certification" },
    { id: "licence", label: "Licence" },
    { id: "membership", label: "Membership / Other Credential" }
] as const;

/** One Skills, Expertise & Qualifications entry. */
export interface FounderSkillValue {
    /** A FOUNDER_CREDENTIAL_TYPES id, or "" while none is chosen. */
    type: string;
    text: string;
}

export interface FounderProfileValue {
    /** The Legal Entity founder's id. */
    id: string;
    /** One line per role: a founder is often several things. */
    roles: string[];
    /** Where, in what, and for how long: companies, sectors, positions, projects, markets. */
    industryExperience: string;
    /** Teams led, budgets or P&L owned, businesses run. */
    managementExperience: string;
    /** As many as they have: what, their part in it, the result. */
    achievements: string[];
    /** Skills, expertise, degrees, certifications, licences, memberships -- each typed. */
    skills: FounderSkillValue[];
}

export interface FoundersProfileValue {
    founders: FounderProfileValue[];
    /** Which capabilities the team lacks. */
    teamGaps: string;
    /** How they are covered: planned hires, advisors, mentors, partners, contractors, training. */
    teamCover: string;
}

/** A founder's profile, named as the Legal Entity names them. */
export interface NamedFounderProfile extends FounderProfileValue {
    name: string;
}

export function createFounderProfile(id: string): FounderProfileValue {
    return {
        id,
        roles: [""],
        industryExperience: "",
        managementExperience: "",
        achievements: [""],
        skills: [{ type: "", text: "" }]
    };
}

/** A list line by line, never empty: a list input always shows one line. */
export function profileList(value: unknown): string[] {
    const items = (Array.isArray(value) ? value : []).map(asText);
    return items.length > 0 ? items : [""];
}

/**
 * The typed entries, never empty: the page always shows one row.
 * Saved before entries had a type, an entry is a plain string -- it
 * is kept, untyped; a type the page does not offer is read as none.
 */
export function profileSkills(value: unknown): FounderSkillValue[] {

    const items = (Array.isArray(value) ? value : []).map(item => {

        if (item && typeof item === "object" && !Array.isArray(item)) {
            const row = item as Record<string, unknown>;
            const type = asText(row.type);
            return {
                type: FOUNDER_CREDENTIAL_TYPES.some(entry => entry.id === type) ? type : "",
                text: asText(row.text)
            };
        }

        return { type: "", text: asText(item) };

    });

    return items.length > 0 ? items : [{ type: "", text: "" }];

}

/**
 * The Relevant Industry Experience, with the years in the industry an
 * entry saved them in -- a box of their own until the text took them
 * over -- put back at its start ("12 years in the industry. ..."),
 * unless the text already starts with them. Nothing saved is lost.
 */
export function experienceWithYears(years: string, experience: string): string {

    const count = years.trim();

    if (count.length === 0 || experience.trimStart().startsWith(count)) {
        return experience;
    }

    const said = count + (count === "1" ? " year" : " years") + " in the industry.";

    return experience.trim().length > 0 ? said + " " + experience : said;

}

/**
 * A founder's Skills, Expertise & Qualifications as the documents
 * list them: in FOUNDER_CREDENTIAL_TYPES' order, each after its
 * type ("Certification: Microsoft Power Platform"), and the untyped
 * last, as written. Entries with no text are left out.
 */
export function founderSkillLines(skills: readonly FounderSkillValue[]): string[] {

    const written = skills.filter(entry => entry.text.trim().length > 0);

    return [
        ...FOUNDER_CREDENTIAL_TYPES.flatMap(kind => written
            .filter(entry => entry.type === kind.id)
            .map(entry => kind.label + ": " + entry.text.trim())),
        ...written
            .filter(entry => !FOUNDER_CREDENTIAL_TYPES.some(kind => kind.id === entry.type))
            .map(entry => entry.text.trim())
    ];

}

export function asFoundersProfileValue(value: unknown): FoundersProfileValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    const founders = (Array.isArray(source.founders) ? source.founders : [])
        .map(entry => entry && typeof entry === "object" && !Array.isArray(entry)
            ? entry as Record<string, unknown>
            : {})
        // An entry means nothing without the founder it describes.
        .filter(row => asText(row.id).length > 0)
        .map(row => ({
            id: asText(row.id),
            roles: profileList(row.roles),
            industryExperience: experienceWithYears(asText(row.years), asText(row.industryExperience)),
            managementExperience: asText(row.managementExperience),
            achievements: profileList(row.achievements),
            skills: profileSkills(row.skills)
        }));

    return {
        founders,
        teamGaps: asText(source.teamGaps),
        teamCover: asText(source.teamCover)
    };

}

/**
 * One Legal Entity founder's profile: this page's own entry for
 * them, or -- until there is one -- what the Legal Entity row saved
 * before this page existed carries: its Roles, and its Experience &
 * Skills as the Relevant Industry Experience.
 */
export function founderProfileOf(
    founder: LegalEntityFounderValue,
    profile: unknown
): FounderProfileValue {

    const own = asFoundersProfileValue(profile).founders.find(entry => entry.id === founder.id);

    if (own) {
        return own;
    }

    return {
        ...createFounderProfile(founder.id),
        roles: founder.roles.length > 0 ? [...founder.roles] : [""],
        industryExperience: founder.experience
    };

}

/**
 * Every NAMED Legal Entity founder's profile, in the Legal Entity's
 * order -- the one place anything reads roles or experience from,
 * so the documents, the exports and the Business System see the
 * same answer whether or not this page has been opened.
 */
export function founderProfiles(
    legalFounders: readonly LegalEntityFounderValue[],
    profile: unknown
): NamedFounderProfile[] {

    return legalFounders
        .filter(founder => founder.name.trim().length > 0)
        .map(founder => ({ ...founderProfileOf(founder, profile), name: founder.name.trim() }));

}

/**
 * The page's value with an entry for every named Legal Entity
 * founder -- seeded from the Legal Entity row where it has none (see
 * founderProfileOf) -- which is what the page writes back, once, so
 * the seeded answers become its own.
 *
 * Entries for founders the Legal Entity no longer names are KEPT:
 * clearing a name and typing it again should not cost the profile.
 */
export function withFounderProfiles(
    profile: unknown,
    legalFounders: readonly LegalEntityFounderValue[]
): FoundersProfileValue {

    const value = asFoundersProfileValue(profile);

    const missing = legalFounders
        .filter(founder => founder.name.trim().length > 0)
        .filter(founder => !value.founders.some(entry => entry.id === founder.id))
        .map(founder => founderProfileOf(founder, value));

    return missing.length === 0
        ? value
        : { ...value, founders: [...value.founders, ...missing] };

}

/** Whether a profile says anything beyond the founder's roles. */
export function founderProfileHasText(entry: FounderProfileValue): boolean {
    return entry.industryExperience.trim().length > 0 ||
        entry.managementExperience.trim().length > 0 ||
        entry.achievements.some(item => item.trim().length > 0) ||
        entry.skills.some(item => item.text.trim().length > 0);
}

/** Whether a profile holds anything at all, its roles included. */
export function founderProfileHasContent(entry: FounderProfileValue): boolean {
    return entry.roles.some(role => role.trim().length > 0) || founderProfileHasText(entry);
}
