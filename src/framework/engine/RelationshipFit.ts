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

/** The user's life stages (minor, young adult, adult, senior) of each buyer's life stage and each buyer and user relationship of a consumer buyer (the owner's matrix of 2026-10-30): P primary, S possible, . generally less directly relevant, so not offered. */
const USER_STAGES = ["age:minor", "age:young", "age:adult", "age:senior"];
const MATRIX: Record<string, Record<string, string>> = {
    young: { "rel:parent": "S...", "rel:caregiver": "SS..", "rel:family": "PPPP", "rel:partner": ".PP.", "rel:friend": "SPP.", "rel:commercial": "....", "rel:otherpersonal": "SPP." },
    adult: { "rel:parent": "PP..", "rel:caregiver": "PSSP", "rel:family": "PPPP", "rel:partner": ".PPS", "rel:friend": "SPPS", "rel:commercial": "PPPP", "rel:otherpersonal": "SPPS" },
    senior: { "rel:parent": "S.S.", "rel:caregiver": "..SP", "rel:family": "PPPP", "rel:partner": "..SP", "rel:friend": ".SPP", "rel:commercial": "S.SP", "rel:otherpersonal": "SSPP" }
};

/** Whether the user's life stage can be the user of the buyer and user relationships chosen, for the buyer's life stages chosen (the matrix above: a stage is offered when some chosen combination does not leave it blank). Before a buyer's life stage is chosen only the parent rule applies: a parent or legal guardian has a minor or a young adult as the user. True for every stage where no relationship is chosen. */
export function userStageFits(relationships: readonly string[], stageId: string, buyerStages: readonly string[] = []): boolean {
    const chosen = relationships.filter(id => id.startsWith("rel:") && MATRIX.adult[id] !== undefined);
    const stages = buyerStages.filter(id => MATRIX[id] !== undefined);
    const column = USER_STAGES.indexOf(stageId);
    if (chosen.length === 0 || column < 0) return true;
    if (stages.length === 0) return !(chosen.includes("rel:parent") && column >= 2);
    return stages.some(stage => chosen.some(id => MATRIX[stage][id][column] !== "."));
}

/** Whether a relationship can be the buyer's, given the buyer's life stage: a Student or Young Adult is not a Commercial & Professional buyer (the owner's rule, 2026-10-30). */
export function relationshipFitsBuyerStage(id: string, audience: readonly string[]): boolean {
    return !(id === "rel:commercial" && audience.includes("young"));
}

/** Whether the Parent or legal guardian relationship can be offered, given the user's life stages already chosen: a buyer who cares for an adult or a senior is the caring person, not a parent (the owner's rule, 2026-10-30; the parent cell of the matrix above is blank for every chosen user stage). True for any other relationship, and while a buyer's or a user's life stage is not chosen. */
export function relationshipFitsUserStages(id: string, buyerStages: readonly string[], userStages: readonly string[]): boolean {
    const stages = buyerStages.filter(stage => MATRIX[stage] !== undefined);
    const users = userStages.map(stage => USER_STAGES.indexOf(stage)).filter(column => column >= 0);
    if (id !== "rel:parent" || stages.length === 0 || users.length === 0) return true;
    return stages.some(stage => users.some(column => MATRIX[stage][id][column] !== "."));
}
