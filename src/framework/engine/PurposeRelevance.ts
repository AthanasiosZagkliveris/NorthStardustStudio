/**
 * HOW RELEVANT EACH PURPOSE IS to the buyer (the owner's tables of 2026-10-30, design document 31, 10.4): used to ORDER the purpose list, the most relevant first, and to leave out the purposes the table calls generally less directly
 * relevant (fewer options help the user; the editor keeps one that is already chosen). It never chooses for the user. The most specific table that covers a purpose is used: the buyer's and the user's life stage, else the buyer's relationship with the user (a consumer buyer), else the buyer's category, else the
 * relationship model (B2B or B2C). Two levels: 2 primary relevance, 1 possible relevance; none is generally less directly relevant.
 */
import { PURPOSE_IDS } from "./PositioningIds.ts";

type Table = { columns: readonly string[]; rows: readonly (string | null)[] };

/** The twelve purposes in the order of PURPOSE_IDS; each string is one cell per column: "P" primary, "S" possible, "." none; null where the table does not cover the purpose (the next table is used). */
const TABLES = {
    /** The buyer's life stage and the user's life stage (a consumer Proxy or Dual-Intent buyer; the owner's table of 2026-10-30): Student (young), Worker (adult), Senior, each with the user a Minor, a Young Adult, an Adult, a Senior. The table does not cover Entertainment, Social Connection and Creation. */
    lifeStages: {
        columns: ["young|age:minor", "young|age:young", "young|age:adult", "young|age:senior", "adult|age:minor", "adult|age:young", "adult|age:adult", "adult|age:senior", "senior|age:minor", "senior|age:young", "senior|age:adult", "senior|age:senior"],
        rows: ["PPS.PPPSPPSS", "SSSSPSPPPSSP", "PPPPPPPPPPPP", null, null, "SPP.SPPS.SS.", ".SS..SP.....", null, "PPPSPPPPPPPP", "SSSSPSPPPSPP", "....PSPPP.SP", "PPSSPPSPPPSP"]
    },
    /** The audience scale and the buyer's category of a business buyer (the owner's table of 2026-10-30): a solopreneur is direct or other (proxy or dual-intent); the larger scales are direct or dual-intent, or proxy. */
    scale: {
        columns: ["solo|direct", "solo|other", "smb|direct", "smb|proxy", "mid|direct", "mid|proxy", "enterprise|direct", "enterprise|proxy"],
        rows: ["P.PSPSPP", "S.SPSPSP", ".PSPSPSP", null, "S.S.S.S.", "P.PSPSPS", "P.P.P.P.", "P.S.S.S.", null, "S.SPSPSP", "S.SPSPSP", "...S.P.P"]
    },
    /** The seven buyer and user relationships of a consumer buyer. */
    relationship: {
        columns: ["rel:parent", "rel:caregiver", "rel:family", "rel:partner", "rel:friend", "rel:commercial", "rel:otherpersonal"],
        rows: ["PSSS.PS", "PPPPSPS", "PSPPPPP", "PSPPP.P", "S.PPP.P", "PPSP.PS", "...S.P.", "P.SSS.S", "PPPP.PP", "PPPP.PS", "PPSS.P.", "PPPSSPS"]
    },
    /** Direct (for themselves), Proxy (on behalf of someone), Dual-Intent (for themselves and their dependents). */
    category: { columns: ["direct", "proxy", "dual"], rows: ["PSP", "PPS", ".PS", "PSP", "P.P", "PSP", "PPP", "P.S", "PPP", "PPP", "PPS", "PPS"] },
    /** B2B relevance, B2C relevance. */
    model: { columns: ["b2b", "b2c"], rows: ["PP", "SP", "PP", ".P", "SP", "PP", "P.", "SP", ".P", "PP", "PS", "SP"] }
} as const satisfies Record<string, Table>;

/** What a table says of one purpose for one column: 2 primary, 1 possible, 0 none (or no such column), null where the table does not cover the purpose. */
function levelIn(table: Table, purpose: number, column: string): number | null {
    const row = table.rows[purpose];
    if (row === null) {
        return null;
    }
    const at = table.columns.indexOf(column);
    const cell = at < 0 ? "." : row[at];
    return cell === "P" ? 2 : cell === "S" ? 1 : 0;
}

export interface PurposeContext {
    /** The relationship models chosen: b2c, b2b. */
    models: readonly string[];
    /** The buyer's categories chosen, as saved: "b2c:proxy". */
    categories: readonly string[];
    /** The buyer and user relationships chosen (the End User ids that start rel:). */
    relationships: readonly string[];
    /** The consumer buyer's life stages chosen (young, adult, senior). */
    buyerStages?: readonly string[];
    /** The user's life stages chosen (age:minor, age:young, age:adult, age:senior). */
    userStages?: readonly string[];
    /** The business buyer's audience scales chosen (solo, smb, mid, enterprise). */
    businessScales?: readonly string[];
}

interface Use { table: Table; columns: string[]; about: string }

/** The tables that apply to the answers so far, the most specific first; none where nothing is answered. */
function applicable(context: PurposeContext): Use[] {
    const uses: Use[] = [];
    const pairs = (context.buyerStages ?? []).flatMap(buyer => (context.userStages ?? []).map(user => buyer + "|" + user)).filter(column => (TABLES.lifeStages.columns as readonly string[]).includes(column));
    if (pairs.length > 0) {
        uses.push({ table: TABLES.lifeStages, columns: pairs, about: "the buyer's and the user's life stage" });
    }
    const business = context.categories.filter(id => id.startsWith("b2b:")).map(id => id.split(":")[1]);
    const scales = (context.businessScales ?? []).flatMap(scale => business.map(key => scale + "|" + (scale === "solo" ? (key === "direct" ? "direct" : "other") : (key === "proxy" ? "proxy" : "direct")))).filter(column => (TABLES.scale.columns as readonly string[]).includes(column));
    if (scales.length > 0) {
        uses.push({ table: TABLES.scale, columns: scales, about: "the audience scale and the buyer's category" });
    }
    const consumer = context.relationships.filter(id => (TABLES.relationship.columns as readonly string[]).includes(id));
    if (consumer.length > 0) {
        uses.push({ table: TABLES.relationship, columns: consumer, about: "the buyer and user relationship" });
    }
    const categories = context.categories.map(id => id.split(":")[1]).filter(key => (TABLES.category.columns as readonly string[]).includes(key));
    if (categories.length > 0) {
        uses.push({ table: TABLES.category, columns: categories, about: "the buyer's category" });
    }
    const models = context.models.filter(id => (TABLES.model.columns as readonly string[]).includes(id));
    if (models.length > 0) {
        uses.push({ table: TABLES.model, columns: [...models], about: "the seller and buyer relationship" });
    }
    return uses;
}

/** The relevance of each purpose (2 primary, 1 possible, 0 none) for the answers so far, by purpose id: from the most specific table that covers it; null where nothing is answered (the list keeps its order). */
export function purposeRelevance(context: PurposeContext): Record<string, number> | null {
    const uses = applicable(context);
    if (uses.length === 0) {
        return null;
    }
    const out: Record<string, number> = {};
    PURPOSE_IDS.forEach((id, at) => {
        for (const use of uses) {
            const levels = use.columns.map(column => levelIn(use.table, at, column));
            if (levels.every(level => level !== null)) {
                out[id] = Math.max(...(levels as number[]));
                return;
            }
        }
        out[id] = 0;
    });
    return out;
}

/** What the order follows, in words (for the "i"), or "" where the list keeps its order. */
export function purposeOrderAbout(context: PurposeContext): string {
    return applicable(context)[0]?.about ?? "";
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
