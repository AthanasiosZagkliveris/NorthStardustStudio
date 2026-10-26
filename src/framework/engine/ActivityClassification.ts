/**
 * THE ACTIVITY CLASSIFICATIONS: the official industry classification of the organization's country, as the cascade of the Organization tile's Activities
 * (design document 28, sections 5.7 to 5.10). The files are in src/data/classifications (code, level, title, parent, in the order of the official document);
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

/** The name of the code in each scheme's own words (document 28, 5.8). */
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
export function activitiesLine(country: string, activities: readonly { code: string }[]): string {
    const label = SCHEME_CODE_LABEL[schemeKeyOf(country)];
    return activities.map(activity => label + " " + activity.code).join(", ");
}

export const BUSINESS_STAGE_WORDS: Record<string, string> = { plan: "Planning", launch: "Launching", manage: "Managing", grow: "Growing" };
export const CUSTOMER_TYPE_WORDS: Record<string, string> = { b2c: "B2C (Business-to-Consumer)", b2b: "B2B (Business-to-Business)", b2g: "B2G (Business-to-Government)", g2b: "G2B Context (Regulatory/Compliance)", both: "Both" };
export const MARKET_TYPE_WORDS: Record<string, string> = { single: "Single-sided Market", multi: "Multi-sided Market / Platform" };
export const AUDIENCE_WORDS: Record<string, string> = { solo: "Solopreneurs & Freelancers", smb: "Startups & SMBs", mid: "Mid-Market", enterprise: "Enterprise / Public Sector", proxy: "Proxy Buyers / Gifters", young: "Students / Young Adults", adult: "Workers / Professionals / Adults", senior: "Seniors", local: "Local Government", regional: "Regional Administration", central: "Central Government & Ministries", institutional: "Institutional / Public Organizations", lowreg: "General Commerce / Mass Market", specialized: "Specialized Sectors", heavy: "Heavily Regulated Markets", crossborder: "Cross-border Trade" };
/** The End User answers of Early Positioning (asked when the audience is Proxy Buyers / Gifters), by id: the question's prefix, then the answer. */
export const END_USER_WORDS: Record<string, string> = {
    "age:early": "End User: babies and young children (0 to 5)", "age:child": "End User: children (6 to 12)", "age:teen": "End User: teenagers (13 to 17)", "age:adult": "End User: adults (18 to 64)", "age:older": "End User: older adults (65 or older)",
    "rel:parent": "Buyer is the parent or carer", "rel:family": "Buyer is another family member", "rel:friend": "Buyer is a partner, friend or colleague (a gift)",
    "decides:buyer": "The Buyer chooses alone", "decides:asks": "The End User asks, the Buyer approves", "decides:user": "The End User chooses, the Buyer pays",
    "wants:enjoy": "End User wants enjoyment and fun", "wants:comfort": "End User wants comfort and ease", "wants:safety": "End User wants safety and care", "wants:learning": "End User wants learning and growth", "wants:belong": "End User wants looks and belonging", "wants:practical": "End User wants practical use"
};
export const OUTCOME_WORDS: Record<string, string> = { cost: "Cost-driven", convenience: "Convenience-driven", compliance: "Compliance, Risk & Security", premium: "Status & Premium" };

/** The words of a saved outcome: "cost", or "b2c:cost" for the outcome of one side of a platform. */
export function outcomeWord(id: string): string {
    const [side, key] = id.includes(":") ? id.split(":") : ["", id];
    const word = OUTCOME_WORDS[key] ?? "";
    return word && side ? side.toUpperCase() + ": " + word : word;
}

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
