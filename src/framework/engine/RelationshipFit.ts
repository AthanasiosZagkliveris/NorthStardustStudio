/**
 * WHICH BUYER AND USER RELATIONSHIPS FIT THE BUYER'S CATEGORY (the owner's tables of 2026-10-30, design document 31, 10.7 and 10.6): fewer options help the user, so the End User question shows only
 * the relationships that can be a Proxy Buyer's (the buyer buys for the other) or a Dual-Intent Buyer's (one purchase for the buyer and the dependents). A relationship that cannot be the chosen
 * category is not offered, and an answer already given for one goes with a change of category. Both lists are the owner's judgement, one line each; the buyer's own answer still decides the category.
 */
export type CategoryKey = "proxy" | "dual";

/** The categories each relationship can have. Consumer buyer: the parent and the caregiver buy for a dependent (proxy) or one plan for the household (dual); a friend or a commercial and professional buyer buys for the other only; a partner shares the purchase. Business buyer: an employer, a professional intermediary, a sponsor or another business buys for the other; a partner or a business serving its clients shares the use. */
export const RELATIONSHIP_FITS: Record<string, readonly CategoryKey[]> = {
    "rel:parent": ["proxy", "dual"], "rel:caregiver": ["proxy", "dual"], "rel:family": ["proxy", "dual"], "rel:partner": ["dual"], "rel:friend": ["proxy"], "rel:commercial": ["proxy"], "rel:otherpersonal": ["proxy", "dual"],
    "rel:employer": ["proxy"], "rel:copartner": ["dual"], "rel:serving": ["dual"], "rel:intermediary": ["proxy"], "rel:sponsor": ["proxy"], "rel:otherbusiness": ["proxy"]
};

/** The buyer's category of a model ("b2c:proxy" in the saved list gives "proxy"), or "" where it is not Proxy or Dual-Intent. */
export function categoryOfModel(categories: readonly string[], model: string): CategoryKey | "" {
    const key = categories.find(id => id.startsWith(model + ":"))?.split(":")[1];
    return key === "proxy" || key === "dual" ? key : "";
}

/** Whether a relationship can be a buyer of the category's (true for an id the table does not know). */
export function relationshipFits(id: string, category: CategoryKey | ""): boolean {
    return category === "" || (RELATIONSHIP_FITS[id] ?? ["proxy", "dual"]).includes(category);
}

/** The user's life stages a parent or legal guardian cannot have as the user: a child of a parent is a minor or a young adult, never an adult or a senior (the owner's rule, 2026-10-30). */
const NOT_A_PARENT_S_USER = ["age:adult", "age:senior"];

/** Whether the user's life stage can be the user of the buyer and user relationships chosen (true for every stage unless a parent or legal guardian is chosen). */
export function userStageFits(relationships: readonly string[], stageId: string): boolean {
    return !(relationships.includes("rel:parent") && NOT_A_PARENT_S_USER.includes(stageId));
}

/** Whether a relationship can be the buyer's, given the buyer's life stage: a Student or Young Adult is not a Commercial & Professional buyer (the owner's rule, 2026-10-30). */
export function relationshipFitsBuyerStage(id: string, audience: readonly string[]): boolean {
    return !(id === "rel:commercial" && audience.includes("young"));
}
