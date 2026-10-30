/**
 * THE ACTIVITY CLASSIFICATIONS: the official industry classification of the organization's country, as the cascade of the Organization tile's Activities
 * (design document 35, sections 5.7 to 5.10). The files are in src/data/classifications (code, level, title, parent, in the order of the official document);
 * each is loaded on demand, since the six countries' files are 1.2MB together.
 *
 * An activity is stored as its final code only; its levels and titles are looked up from the code, because codes nest.
 */

export interface ClassificationItem {
    code: string;
    /** 1 is the top level. */
    level: number;
    title: string;
    parent: string | null;
    /** No children: a code a business may state. */
    final?: boolean;
    /** UK only: on Companies House's list, the only codes it accepts. */
    ch?: boolean;
}

export interface ClassificationScheme {
    scheme: string;
    country: string;
    edition: string;
    /** The scheme's own level names, top first. */
    levels: string[];
    items: ClassificationItem[];
}

export type SchemeKey = "uk" | "ie" | "us" | "ca" | "au" | "nz" | "isic";

const SCHEME_OF_COUNTRY: Record<string, SchemeKey> = { GB: "uk", IE: "ie", US: "us", CA: "ca", AU: "au", NZ: "nz" };

/** The name of the code in each scheme's own words (document 35, 5.8). */
export const SCHEME_CODE_LABEL: Record<SchemeKey, string> = { uk: "SIC", ie: "NACE", us: "NAICS", ca: "NAICS", au: "ANZSIC", nz: "BIC", isic: "ISIC" };

/** The scheme a country's organizations use; ISIC (the United Nations' own) for a country the app has no scheme for. */
export function schemeKeyOf(country: string): SchemeKey {
    return SCHEME_OF_COUNTRY[country] ?? "isic";
}

const loaders: Record<SchemeKey, () => Promise<{ default: unknown }>> = {
    uk: () => import("../../data/classifications/uk-sic-2007.json"),
    ie: () => import("../../data/classifications/ie-nace-rev2.json"),
    us: () => import("../../data/classifications/us-naics-2022.json"),
    ca: () => import("../../data/classifications/ca-naics-2022.json"),
    au: () => import("../../data/classifications/au-anzsic-2006.json"),
    nz: () => import("../../data/classifications/nz-bic-2022.json"),
    isic: () => import("../../data/classifications/isic-rev4.json")
};

const loaded = new Map<SchemeKey, Promise<ClassificationScheme>>();

/** The scheme's file, loaded once. */
export function loadClassification(key: SchemeKey): Promise<ClassificationScheme> {
    let promise = loaded.get(key);
    if (!promise) {
        promise = loaders[key]().then(module => module.default as ClassificationScheme);
        loaded.set(key, promise);
    }
    return promise;
}

/** The entries one level below `parent` (the top level for null), in the official order; the UK offers only the codes Companies House accepts. */
export function childrenOf(scheme: ClassificationScheme, parent: string | null): ClassificationItem[] {
    return scheme.items.filter(item => item.parent === parent && (scheme.country !== "GB" || !item.final || item.ch === true));
}

/** The entry with this code, if the scheme has it. */
export function itemOf(scheme: ClassificationScheme, code: string): ClassificationItem | undefined {
    return scheme.items.find(item => item.code === code);
}

/** The entries from the top level down to this code (the code's own entry last); empty when the scheme has no such code. */
export function pathOf(scheme: ClassificationScheme, code: string): ClassificationItem[] {
    const path: ClassificationItem[] = [];
    let current = itemOf(scheme, code);
    while (current) {
        path.unshift(current);
        current = current.parent === null ? undefined : itemOf(scheme, current.parent);
    }
    return path;
}

/** A title as the dropdown shows it: the official words, with an all-capitals title (the sections of NACE and SIC) in sentence case. */
export function shownTitle(title: string): string {
    const letters = title.replace(/[^A-Za-z]/g, "");
    if (letters.length > 3 && letters === letters.toUpperCase()) {
        const lower = title.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
    return title;
}

/** The activities of an organization said in a line: "SIC 62012, SIC 62020" (the code with its scheme's initials, the primary first); nothing where there are none. */
export function activitiesLine(country: string, activities: readonly { code: string; name?: string }[]): string {
    const label = SCHEME_CODE_LABEL[schemeKeyOf(country)];
    // (A typed activity, of a country with no classification of the app's, is said as the user wrote it: "Web design (62.01)".)
    return activities.map(activity => activity.name ? activity.name + (activity.code ? " (" + activity.code + ")" : "") : label + " " + activity.code).join(", ");
}

export const BUSINESS_STAGE_WORDS: Record<string, string> = { plan: "Planning", launch: "Launching", manage: "Managing", grow: "Growing" };
export const CUSTOMER_TYPE_WORDS: Record<string, string> = { b2c: "B2C (Business-to-Consumer)", b2b: "B2B (Business-to-Business)", b2g: "B2G (Business-to-Government)", g2b: "G2B Context (Regulatory/Compliance)", both: "Both" };
export const MARKET_TYPE_WORDS: Record<string, string> = { single: "Single-sided Market", multi: "Multi-sided Market / Platform" };
export const AUDIENCE_WORDS: Record<string, string> = { solo: "Solopreneurs & Freelancers", smb: "Startups & SMBs", mid: "Mid-Market", enterprise: "Enterprise / Public Sector", young: "Students / Young Adults", adult: "Workers / Professionals / Adults", senior: "Seniors", local: "Local Government", regional: "Regional Administration", central: "Central Government & Ministries", institutional: "Institutional / Public Organizations", lowreg: "General Commerce / Mass Market", specialized: "Specialized Sectors", heavy: "Heavily Regulated Markets", crossborder: "Cross-border Trade" };
/** The buyer's category of Early Positioning, by id ("b2c:proxy"): the relationship, then the category. */
export const BUYER_CATEGORY_WORDS: Record<string, string> = {
    "b2c:direct": "B2C: Direct Buyers", "b2c:proxy": "B2C: Proxy Buyers", "b2c:dual": "B2C: Dual-Intent Buyers",
    "b2b:direct": "B2B: Direct Buyers", "b2b:proxy": "B2B: Proxy Buyers", "b2b:dual": "B2B: Dual-Intent Buyers"
};
/** The End User answers of Early Positioning (asked of a Proxy or Dual-Intent Buyer), by id: the buyer and user relationship, and the user's life stage. */
export const END_USER_WORDS: Record<string, string> = {
    "rel:parent": "Buyer is the parent or legal guardian", "rel:caregiver": "Buyer is the caregiver or person responsible for their care", "rel:family": "Buyer is a family member or relative",
    "rel:partner": "Buyer is the spouse or romantic partner", "rel:friend": "Buyer is a friend or acquaintance", "rel:commercial": "Buyer is in a commercial or professional relationship with the user", "rel:otherpersonal": "Buyer has another personal relationship with the user",
    "rel:employer": "Buyer is the employer providing for employees", "rel:copartner": "Buyer is a business partner or co-owner", "rel:serving": "Buyer is a business serving its clients or customers",
    "rel:intermediary": "Buyer is a professional intermediary acting for a client", "rel:sponsor": "Buyer is a sponsor or funder", "rel:otherbusiness": "Buyer has another business relationship with the user",
    "age:minor": "User: minors", "age:young": "User: young adults", "age:adult": "User: adults", "age:senior": "User: seniors"
};
/** The purposes of the offering, by id. */
export const PURPOSE_WORDS: Record<string, string> = {
    learning: "Learning and Development", health: "Health, Care and Wellbeing", gifting: "Gifting and Appreciation", entertainment: "Entertainment and Enjoyment", social: "Social Connection and Relationships",
    productivity: "Productivity and Efficiency", growth: "Business Growth and Performance", creation: "Creation and Expression", everyday: "Everyday Needs and Convenience", protection: "Protection and Risk Reduction",
    compliance: "Compliance and Obligations", access: "Access and Social Support"
};
/** The differentiation: what the offering does differently from the competitors. */
export const DIFFERENTIATION_WORDS: Record<string, string> = { cost: "Cost-driven", convenience: "Convenience-driven", compliance: "Compliance, Risk & Security", premium: "Status & Premium" };
/** The outcome for the buyer: the measurable result. */
export const OUTCOME_WORDS: Record<string, string> = { savings: "Lower costs", time: "Time saved", assurance: "Legal and data-protection cover", prestige: "Higher quality and prestige" };
/** The outcome for the user (a Proxy or Dual-Intent Buyer's): what matters most to the user. */
export const OUTCOME_USER_WORDS: Record<string, string> = { enjoy: "Enjoyment and fun", comfort: "Comfort and ease", safety: "Safety and care", learning: "Learning and growth", belong: "Looks and belonging", practical: "Practical use" };

/**
 * THE NAME OF THE POSITIONING FOLLOWS THE BUSINESS STAGE (the owner's text, 2026-10-24): while planning and launching it is a temporary, highly targeted statement for the first market, the Early Positioning;
 * once the business has found its market it is the firm Core Market Positioning; as it grows into several products and markets it is the umbrella, the Corporate & Portfolio Positioning.
 */
export function positioningName(stage: string): string {
    return stage === "manage" ? "Core Market Positioning" : stage === "grow" ? "Corporate & Portfolio Positioning" : "Early Positioning";
}

/** The title of the positioning in an exported document: the tile's name, the early one as a statement. */
export function positioningDocumentTitle(stage: string): string {
    return stage === "manage" || stage === "grow" ? positioningName(stage) : "Early Positioning Statement";
}
