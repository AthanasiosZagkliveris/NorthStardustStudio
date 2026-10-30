/**
 * THE IDS OF EARLY POSITIONING in the first published version (design document 33, sections 4 and 5): what a saved answer may hold. The words and the order the user sees are in
 * `components/interview/editors/legal/shared.tsx`, which a test holds to these ids. What the first version leaves out (a multi-sided market, B2G, G2B, "who chooses", "what
 * matters most") is a future feature (document 34): an older answer that holds it is read without it.
 */

/** The seller and buyer relationships of the first version. */
export const MODEL_IDS = ["b2c", "b2b"] as const;

/** The buyer's category (a question of its own, apart from the life stage), saved for a model as "b2c:proxy". */
export const BUYER_CATEGORY_KEYS = ["direct", "proxy", "dual"] as const;

/** The audience: the scales of a business buyer and the life stages of a consumer buyer (the Proxy Buyers option is now the buyer's category). */
export const AUDIENCE_IDS = ["solo", "smb", "mid", "enterprise", "young", "adult", "senior"] as const;

/** The differentiation: what the OFFERING does differently from the competitors (it was the first half of "Differentiation & Outcome"; an older answer's outcome is the differentiation). */
export const DIFFERENTIATION_IDS = ["cost", "convenience", "compliance", "premium"] as const;

/** The outcome for the buyer: the measurable result the buyer gets. */
export const OUTCOME_IDS = ["savings", "time", "assurance", "prestige"] as const;

/** The outcome for the user, asked when the buyer is a Proxy or Dual-Intent Buyer (the buyer and the user want different things): what matters most to the user. */
export const USER_OUTCOME_IDS = ["enjoy", "comfort", "safety", "learning", "belong", "practical"] as const;

/** The twelve purposes of an offering (document 31, section 7). */
export const PURPOSE_IDS = ["learning", "health", "gifting", "entertainment", "social", "productivity", "growth", "creation", "everyday", "protection", "compliance", "access"] as const;

/** The buyer and user relationships (document 31, 6.1 and 6.2), saved in the End User answers. */
export const RELATION_IDS_B2C = ["rel:parent", "rel:caregiver", "rel:family", "rel:partner", "rel:friend", "rel:commercial", "rel:otherpersonal"] as const;
export const RELATION_IDS_B2B = ["rel:employer", "rel:copartner", "rel:serving", "rel:intermediary", "rel:sponsor", "rel:otherbusiness"] as const;

/** The user's life stage (a consumer buyer's Proxy and Dual-Intent buyers), saved in the End User answers. */
export const USER_AGE_IDS = ["age:minor", "age:young", "age:adult", "age:senior"] as const;

/** What an older answer's "what matters most to the End User" (wants:safety) becomes: the outcome for the user (safety). */
export function userOutcomeFrom(ids: readonly string[]): string[] {
    return [...new Set(ids.filter(id => id.startsWith("wants:")).map(id => id.slice("wants:".length)).filter(id => (USER_OUTCOME_IDS as readonly string[]).includes(id)))];
}

/**
 * What an older answer's End User ids become: the three relationships it had stay (the Parent, Family member and Friend rows), its five ages fold into the four life stages (the
 * three under 18 are Minors, the older adults are Seniors), and the two questions the first version no longer asks (who chooses, what matters most) go.
 */
export function endUserFrom(ids: readonly string[]): string[] {
    const known = new Set<string>([...RELATION_IDS_B2C, ...RELATION_IDS_B2B, ...USER_AGE_IDS]);
    const renamed: Record<string, string> = { "age:early": "age:minor", "age:child": "age:minor", "age:teen": "age:minor", "age:older": "age:senior" };
    const out: string[] = [];
    for (const id of ids) {
        const next = renamed[id] ?? id;
        if (known.has(next) && !out.includes(next)) {
            out.push(next);
        }
    }
    return out;
}
