/**
 * HOW RELEVANT EACH PURPOSE IS to the buyer (the owner's tables of 2026-10-30, design document 31, 10.4): used to ORDER the purpose list, the most relevant first, and to leave out the purposes the table calls generally less directly
 * relevant (fewer options help the user; the editor keeps one that is already chosen). It never chooses for the user. The most specific table that applies is used: the buyer's relationship with the user (a consumer buyer), else the buyer's category, else the
 * relationship model (B2B or B2C). Two levels: 2 primary relevance, 1 possible relevance; none is generally less directly relevant.
 */
import { PURPOSE_IDS } from "./PositioningIds.ts";

/** The twelve purposes in the order of PURPOSE_IDS; each string is one cell per column: "P" primary, "S" possible, "." none. */
const TABLES = {
    /** B2B relevance, B2C relevance. */
    model: { columns: ["b2b", "b2c"], rows: ["PP", "SP", "PP", ".P", "SP", "PP", "P.", "SP", ".P", "PP", "PS", "SP"] },
    /** Direct (for themselves), Proxy (on behalf of someone), Dual-Intent (for themselves and their dependents). */
    category: { columns: ["direct", "proxy", "dual"], rows: ["PSP", "PPS", ".PS", "PSP", "P.P", "PSP", "PPP", "P.S", "PPP", "PPP", "PPS", "PPS"] },
    /** The seven buyer and user relationships of a consumer buyer. */
    relationship: {
        columns: ["rel:parent", "rel:caregiver", "rel:family", "rel:partner", "rel:friend", "rel:commercial", "rel:otherpersonal"],
        rows: ["PSSS.PS", "PPPPSPS", "PSPPPPP", "PSPPP.P", "S.PPP.P", "PPSP.PS", "...S.P.", "P.SSS.S", "PPPP.PP", "PPPP.PS", "PPSS.P.", "PPPSSPS"]
    }
} as const satisfies Record<string, { columns: readonly string[]; rows: readonly string[] }>;

/** What a table says of one purpose for one column: 2 primary, 1 possible, 0 none (or no such column). */
function levelIn(table: { columns: readonly string[]; rows: readonly string[] }, purpose: number, column: string): number {
    const at = table.columns.indexOf(column);
    const cell = at < 0 ? "." : table.rows[purpose][at];
    return cell === "P" ? 2 : cell === "S" ? 1 : 0;
}

export interface PurposeContext {
    /** The relationship models chosen: b2c, b2b. */
    models: readonly string[];
    /** The buyer's categories chosen, as saved: "b2c:proxy". */
    categories: readonly string[];
    /** The buyer and user relationships chosen (the End User ids that start rel:). */
    relationships: readonly string[];
}

/** The table and the columns that apply to the answers so far; none where nothing is answered. */
function applicable(context: PurposeContext): { table: { columns: readonly string[]; rows: readonly string[] }; columns: string[]; about: string } | null {
    const consumer = context.relationships.filter(id => (TABLES.relationship.columns as readonly string[]).includes(id));
    if (consumer.length > 0) {
        return { table: TABLES.relationship, columns: consumer, about: "the buyer and user relationship" };
    }
    const categories = context.categories.map(id => id.split(":")[1]).filter(key => (TABLES.category.columns as readonly string[]).includes(key));
    if (categories.length > 0) {
        return { table: TABLES.category, columns: categories, about: "the buyer's category" };
    }
    const models = context.models.filter(id => (TABLES.model.columns as readonly string[]).includes(id));
    return models.length > 0 ? { table: TABLES.model, columns: [...models], about: "the seller and buyer relationship" } : null;
}

/** The relevance of each purpose (2 primary, 1 possible, 0 none) for the answers so far, by purpose id; null where nothing is answered (the list keeps its order). */
export function purposeRelevance(context: PurposeContext): Record<string, number> | null {
    const use = applicable(context);
    if (!use) {
        return null;
    }
    const out: Record<string, number> = {};
    PURPOSE_IDS.forEach((id, at) => { out[id] = Math.max(...use.columns.map(column => levelIn(use.table, at, column))); });
    return out;
}

/** What the order follows, in words (for the "i"), or "" where the list keeps its order. */
export function purposeOrderAbout(context: PurposeContext): string {
    return applicable(context)?.about ?? "";
}

/** The options in the order of their relevance, the most relevant first; the order they came in within each level. All of them stay. */
export function orderedByRelevance<T extends { id: string }>(options: readonly T[], relevance: Record<string, number> | null): T[] {
    if (!relevance) {
        return [...options];
    }
    return options.map((option, at) => ({ option, at })).sort((a, b) => (relevance[b.option.id] ?? 0) - (relevance[a.option.id] ?? 0) || a.at - b.at).map(entry => entry.option);
}

/** How a buyer and user relationship usually reads (the owner's table): a proxy buyer (buys for the other), a dual-intent buyer (the purchase is for both) or either. */
export const RELATIONSHIP_INTENT: Record<string, "proxy" | "dual" | "either"> = {
    "rel:parent": "proxy", "rel:caregiver": "proxy", "rel:family": "either", "rel:partner": "dual", "rel:friend": "proxy", "rel:commercial": "proxy", "rel:otherpersonal": "either"
};
