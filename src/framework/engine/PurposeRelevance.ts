/**
 * HOW RELEVANT EACH PURPOSE IS to the buyer (the owner's tables of 2026-10-30, design document 31, 10.7): used to ORDER the purpose list, the most relevant first, and to leave out the purposes the table calls generally less directly
 * relevant (fewer options help the user; the editor keeps one that is already chosen). It never chooses for the user. For each purpose the first table that covers it is used: the buyer's and the user's life stage (a consumer buyer), else the business buyer and user relationship, else the audience scale and the business buyer's category, else the consumer buyer and user relationship, else the buyer's category, else the relationship model (B2B or B2C).
 * Two levels: 2 primary relevance, 1 possible relevance; none is generally less directly relevant.
 */
import { DIFFERENTIATION_IDS, PURPOSE_IDS } from "./PositioningIds.ts";

type Table = { columns: readonly string[]; rows: readonly (string | null)[] };

/** The twelve purposes in the order of PURPOSE_IDS; each string is one cell per column: "P" primary, "S" possible, "." none; null where the table does not cover the purpose (the next table is used). */
const TABLES = {
    /** The buyer's life stage and the user's life stage (a consumer Proxy or Dual-Intent buyer; the owner's table of 2026-10-30): Student (young), Worker (adult), Senior, each with the user a Minor, a Young Adult, an Adult, a Senior. The table does not cover Entertainment, Social Connection and Creation. */
    lifeStages: {
        columns: ["young|age:minor", "young|age:young", "young|age:adult", "young|age:senior", "adult|age:minor", "adult|age:young", "adult|age:adult", "adult|age:senior", "senior|age:minor", "senior|age:young", "senior|age:adult", "senior|age:senior"],
        rows: ["PPS.PPPSPPSS", "SSSSPSPPPSSP", "PPPPPPPPPPPP", null, null, "SPP.SPPS.SS.", ".SS..SP.....", null, "PPPSPPPPPPPP", "SSSSPSPPPSPP", "....PSPPP.SP", "PPSSPPSPPPSP"]
    },
    /** The two relationships of a Dual-Intent business buyer: a business partner or co-owner, a business serving its clients (the owner's table of 2026-10-30; Access is not in it). */
    businessDual: {
        columns: ["rel:copartner", "rel:serving"],
        rows: ["SP", "..", "..", "SP", "SS", "PP", "PP", "SS", "PP", "SS", "SS", null]
    },
    /** The four relationships of a Proxy business buyer: an employer, a professional intermediary, a sponsor or funder, another business relationship (Social Connection, Business Growth and Creation are not in it). */
    businessProxy: {
        columns: ["rel:employer", "rel:intermediary", "rel:sponsor", "rel:otherbusiness"],
        rows: ["PSSS", "PS..", "PS.S", "S...", null, "SS.S", null, null, "PPPP", "PPPS", "PPPS", "SPPS"]
    },
    /** The audience scale and the buyer's category of a business buyer (the owner's table of 2026-10-30): a solopreneur is direct or other (proxy or dual-intent); the larger scales are direct or dual-intent, or proxy. */
    scale: {
        columns: ["solo|direct", "solo|other", "smb|direct", "smb|proxy", "mid|direct", "mid|proxy"],
        rows: ["P.PSPS", "S.SPSP", ".PSPSP", "S.PSPS", "S.S.S.", "P.PSPS", "P.P.P.", "P.S.S.", "P.PPPP", "S.SPSP", "S.SPSP", "...S.P"]
    },
    /** The same columns for the six differentiations (cost, convenience, compliance, premium, performance, ecosystem): the owner's table of 2026-10-30. */
    differentiationScale: {
        columns: ["solo|direct", "solo|other", "smb|direct", "smb|proxy", "mid|direct", "mid|proxy"],
        rows: ["PSPSSS", "PPPPPS", "..SPSP", "S.S.P.", "P.PSPS", "S.SPPP"]
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
    if (row === null || row === undefined) {
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
    /** The business buyer's audience scales chosen (solo, smb, mid). */
    businessScales?: readonly string[];
}

interface Use { table: Table; columns: string[]; about: string }

/** The columns of the business tables: each audience scale chosen with each business buyer's category chosen. */
function scaleColumns(context: PurposeContext): string[] {
    const business = context.categories.filter(id => id.startsWith("b2b:")).map(id => id.split(":")[1]);
    return (context.businessScales ?? []).flatMap(scale => business.map(key => scale + "|" + (scale === "solo" ? (key === "direct" ? "direct" : "other") : (key === "proxy" ? "proxy" : "direct")))).filter(column => (TABLES.scale.columns as readonly string[]).includes(column));
}

/** The relevance of each differentiation (2 primary, 1 possible, 0 none) for a business buyer's audience scale and category, by differentiation id; null until both are answered. */
export function differentiationRelevance(context: PurposeContext): Record<string, number> | null {
    const columns = scaleColumns(context);
    if (columns.length === 0) {
        return null;
    }
    const out: Record<string, number> = {};
    DIFFERENTIATION_IDS.forEach((id, at) => {
        out[id] = Math.max(...columns.map(column => levelIn(TABLES.differentiationScale, at, column) ?? 1));
    });
    return out;
}

/** How strongly each purpose drives each differentiation (cost, convenience, compliance, premium, performance, ecosystem; the owner's matrix of 2026-10-30), one row per purpose in the order of the purpose ids. */
const PURPOSE_DRIVES = ["SP.SPS", ".PS...", ".S.P..", ".S.P..", ".P...S", "SP..SP", ".P.PPS", ".P.SPS", "PP...S", "..P.SP", "..P..P", "PPS..."];

/** The relevance of each differentiation (2 primary driver, 1 secondary, 0 none) for the purposes chosen, by differentiation id: the strongest of the purposes chosen; null where no purpose is chosen. */
export function differentiationByPurpose(purposes: readonly string[]): Record<string, number> | null {
    const rows = purposes.map(id => PURPOSE_IDS.indexOf(id as typeof PURPOSE_IDS[number])).filter(at => at >= 0).map(at => PURPOSE_DRIVES[at]);
    if (rows.length === 0) {
        return null;
    }
    const out: Record<string, number> = {};
    DIFFERENTIATION_IDS.forEach((id, at) => {
        out[id] = Math.max(...rows.map(row => (row[at] === "P" ? 2 : row[at] === "S" ? 1 : 0)));
    });
    return out;
}

/** How strongly each business buyer and user relationship drives each differentiation (cost, convenience, compliance, premium, performance, ecosystem; the owner's table of 2026-10-30): columns in the order of BUSINESS_RELATIONSHIPS. */
const BUSINESS_RELATIONSHIPS = ["rel:copartner", "rel:serving", "rel:employer", "rel:intermediary", "rel:sponsor", "rel:otherbusiness"];
const RELATIONSHIP_DRIVES = [".SS.PP", "SPPS.P", "S.PPPS", "PP....", "PS.P..", "PPPSSS"];

/** The relevance of each differentiation (2 primary, 1 secondary, 0 none) for the business relationships chosen, by differentiation id: the strongest of those chosen; null where none is chosen. */
export function differentiationByRelationship(relationships: readonly string[]): Record<string, number> | null {
    const columns = relationships.map(id => BUSINESS_RELATIONSHIPS.indexOf(id)).filter(at => at >= 0);
    if (columns.length === 0) {
        return null;
    }
    const out: Record<string, number> = {};
    DIFFERENTIATION_IDS.forEach((id, at) => {
        out[id] = Math.max(...columns.map(column => (RELATIONSHIP_DRIVES[at][column] === "P" ? 2 : RELATIONSHIP_DRIVES[at][column] === "S" ? 1 : 0)));
    });
    return out;
}

/** The tables that apply to the answers so far, the most specific first; none where nothing is answered. */
function applicable(context: PurposeContext): Use[] {
    const uses: Use[] = [];
    const pairs = (context.buyerStages ?? []).flatMap(buyer => (context.userStages ?? []).map(user => buyer + "|" + user)).filter(column => (TABLES.lifeStages.columns as readonly string[]).includes(column));
    if (pairs.length > 0) {
        uses.push({ table: TABLES.lifeStages, columns: pairs, about: "the buyer's and the user's life stage" });
    }
    for (const table of [TABLES.businessDual, TABLES.businessProxy]) {
        const business = context.relationships.filter(id => (table.columns as readonly string[]).includes(id));
        if (business.length > 0) {
            uses.push({ table, columns: business, about: "the buyer and user relationship" });
        }
    }
    const scales = scaleColumns(context);
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
