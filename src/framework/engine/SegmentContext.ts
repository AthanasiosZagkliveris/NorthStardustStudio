/**
 * WHAT THE SEGMENT CARD READS OF THE IDENTITY ANSWERS (design document 28, 6.3 and 8.2, "What the Segment will read"): the Seller and Buyer Relationship (I3), the Market Structure (I11) and the audience (I7b).
 * Pure functions, so the card, the documents and the tests read the same rules (in the engine, since the documents settle a Segment's answers against Identity too).
 */
import { AUDIENCE_WORDS } from "./ActivityClassification.ts";
import { type SegmentAnswers, type SegmentContext, SEGMENT_QUESTIONS, segmentQuestionAsked, segmentSettle } from "./SegmentQuestions.ts";
import { choiceLimit } from "./PositioningIds.ts";
import { withOnlyUserStage } from "./RelationshipFit.ts";
import { differentiationFromOpenings } from "./CompetitorQuestions.ts";

/** The Identity answers the Segment card reads. Absent: nothing is known, and the card is as it was. */
export interface SegmentIdentity {
    /** The ids of the Seller and Buyer Relationship (b2c, b2b, b2g, g2b). */
    relationships: readonly string[];
    /** "single" or "multi" (empty: not answered). */
    marketType: string;
    /** The ids of the audience answers. */
    audience: readonly string[];
    /** The buyer's category of each relationship ("b2c:proxy"). */
    buyerCategory?: readonly string[];
    /** The End User answers: the buyer and user relationships and the user's life stage. */
    endUser?: readonly string[];
    /** The business stage (plan, launch, manage, grow). */
    stage?: string;
    /** The Organisation's country (ISO code) and its first activity's code: the order of the Competitor's review platforms (doc 41, K6). */
    country?: string;
    activityCode?: string;
    /**
     * The Positioning answers saved before they left Positioning (owner, 2026-11-08): the differentiation starts each Segment's own (K14, doc 41), the end user's outcome each Segment's
     * End user, 9 (doc 35), the buyer's outcome the Offering's O4 (doc 43, through the crosswalk of doc 34, 5.2a). Never asked again; read only as starts.
     */
    differentiation?: readonly string[];
    outcome?: readonly string[];
    outcomeUser?: readonly string[];
    /** Positioning's purposes: the order of the Differentiation and of the end user's outcome. */
    purpose?: readonly string[];
}

/** The Organisation's answers the Segment, Profile and Offering cards read (the Organisation tile and Positioning). */
export interface IdentityOrganisation {
    customerType: readonly string[];
    marketType: string;
    audience: readonly string[];
    buyerCategory?: readonly string[];
    endUser?: readonly string[];
    country?: string;
    activities?: readonly { code: string }[];
    differentiation?: readonly string[];
    outcome?: readonly string[];
    outcomeUser?: readonly string[];
    purpose?: readonly string[];
}

/** The Identity answers as the cards read them, from the Organisation and the business stage: one mapping for the page, the documents and the exports. */
export function segmentIdentityOf(organisation: IdentityOrganisation, stage?: string): SegmentIdentity {
    return {
        relationships: organisation.customerType,
        marketType: organisation.marketType,
        audience: organisation.audience,
        buyerCategory: organisation.buyerCategory,
        endUser: organisation.endUser,
        stage,
        country: organisation.country,
        activityCode: organisation.activities?.[0]?.code ?? "",
        differentiation: organisation.differentiation,
        outcome: organisation.outcome,
        outcomeUser: organisation.outcomeUser,
        purpose: organisation.purpose
    };
}

/** The Segment's questions that came from Positioning, and the Positioning answer (saved before 2026-11-08) each starts from. */
const POSITIONING_STARTS: readonly { id: string; from: "differentiation" | "outcomeUser" }[] = [
    { id: "differentiation", from: "differentiation" },
    { id: "u-outcome", from: "outcomeUser" }
];

/**
 * A SEGMENT'S ANSWERS WITH THE POSITIONING STARTS (owner, 2026-11-08: the Differentiation and the end user's outcome left Positioning for each Segment): where the Segment never answered
 * one (no key saved), the Positioning answer saved before is its starting value, within the stage's limit; a value saved on the Segment wins, even an empty one (cleared). The end user's
 * outcome is started only where the Segment has an end user. What the card shows, and what the documents, the exports and the Offering's O4 read.
 * Where Positioning saved no Differentiation, the K10 ticks across the Segment's `competitors` start it, through the crosswalk (doc 41, K14; 2026-11-09), within the same limit.
 */
export function segmentPositioningShown(answers: SegmentAnswers, identity: Pick<SegmentIdentity, "differentiation" | "outcomeUser"> | undefined, context: SegmentContext, competitors: readonly { questions?: Readonly<Record<string, readonly string[]>> }[] = []): SegmentAnswers {
    const shown: SegmentAnswers = { ...answers };
    const limit = choiceLimit(context.stage, "outcome");
    for (const { id, from } of POSITIONING_STARTS) {
        const question = SEGMENT_QUESTIONS.find(entry => entry.id === id);
        if (!question || id in answers || !segmentQuestionAsked(question, answers, context)) {
            continue;
        }
        const saved = (identity?.[from] ?? []).filter(option => question.options.some(entry => entry.id === option));
        const start = saved.length === 0 && id === "differentiation" ? differentiationFromOpenings(competitors).filter(option => question.options.some(entry => entry.id === option)) : saved;
        if (start.length > 0) {
            shown[id] = limit === null ? start : start.slice(0, limit);
        }
    }
    return shown;
}

/** Whether a Segment is of businesses: the presence of its Business Data key. */
export function segmentIsBusiness(segment: { description: Record<string, string> }): boolean {
    return segment.description["business-data"] !== undefined;
}

/** Who the Segment's questions are written for: people (Box 1), businesses and public bodies (Box 3), or not yet known / both (both boxes). */
export type SegmentFrame = "people" | "business" | "open";

export function segmentFrame(identity: SegmentIdentity | undefined): SegmentFrame {

    // The relationships chosen; where none is, what the buyer's category or the audience says (a business scale is a business buyer, a life stage a person).
    const named = identity?.relationships ?? [];
    const chosen = named.length > 0 ? named : [
        ...(identity?.buyerCategory ?? []).map(id => id.split(":")[0]),
        ...(identity?.audience ?? []).map(id => PEOPLE_AUDIENCE.includes(id) ? "b2c" : BUSINESS_AUDIENCE.includes(id) ? "b2b" : "")
    ];
    const people = chosen.includes("b2c");
    const business = chosen.some(id => id === "b2b" || id === "b2g" || id === "g2b");

    if (people && !business) {
        return "people";
    }

    if (business && !people) {
        return "business";
    }

    return "open";

}

/** The audience answers that belong to the Segment's frame, in words (the people's life stage; the business's scale or level), for the "i" of Demographics and Business Data. */
export function audienceLine(identity: SegmentIdentity | undefined, ids: readonly string[]): string[] {

    const words = (identity?.audience ?? []).filter(id => ids.includes(id)).map(id => AUDIENCE_WORDS[id]).filter(Boolean);

    return words.length > 0
        ? ["Your Positioning (Identity) chose: " + words.join(", ") + "."]
        : [];

}

/** What the Segment's questions follow (see SegmentQuestions.ts): who the buyer is, the stage, and the user of a Proxy or Dual-Intent buyer. */
export function segmentContext(identity: SegmentIdentity | undefined): SegmentContext {

    const categories = identity?.buyerCategory ?? [];
    const relationships = identity?.relationships ?? [];
    // The user's life stage is the one that fits where only one does, even if an older answer never saved it (RelationshipFit.ts).
    const endUser = withOnlyUserStage({ customerType: [...relationships], audience: [...(identity?.audience ?? [])], endUser: [...(identity?.endUser ?? [])], buyerCategory: [...categories] }).endUser;

    // The user is described where a consumer or a business buyer is a Proxy or Dual-Intent buyer of a relationship chosen.
    const endsUser = relationships.some(model => categories.includes(model + ":proxy") || categories.includes(model + ":dual"));

    return {
        frame: segmentFrame(identity),
        stage: identity?.stage ?? "",
        lifeStages: (identity?.audience ?? []).filter(id => PEOPLE_AUDIENCE.includes(id)),
        endsUser,
        userStages: endUser.filter(id => id.startsWith("age:")),
        relations: endUser.filter(id => id.startsWith("rel:")),
        scales: (identity?.audience ?? []).filter(id => ["solo", "smb", "mid", "enterprise"].includes(id))
    };

}

/**
 * The questions of ONE Segment: where Identity chose both relationships (or none), a Segment is of one kind, people or businesses (a Segment is one group: the people's questions and the
 * business's are never asked of the same one); the kind is the presence of its Business Data key. Otherwise the Segment follows Identity.
 */
export function segmentContextFor(identity: SegmentIdentity | undefined, business: boolean): SegmentContext {

    const context = segmentContext(identity);
    const frame = context.frame === "open" ? (business ? "business" : "people") : context.frame;

    // The end user is that of the Segment's own relationship (owner, 2026-11-08): a people Segment reads the consumer buyer's category and relationships, a business Segment the business
    // buyer's, so a B2C Direct Segment of a business that also sells B2B Proxy has no end user.
    const models = frame === "people" ? ["b2c"] : ["b2b", "b2g", "g2b"];
    const categories = identity?.buyerCategory ?? [];
    const endsUser = (identity?.relationships ?? []).some(model => models.includes(model) && (categories.includes(model + ":proxy") || categories.includes(model + ":dual")));
    // (Dual-Intent: the buyer also uses it, so the end user's part is the others who use it; 2026-11-09.)
    const dual = (identity?.relationships ?? []).some(model => models.includes(model) && categories.includes(model + ":dual"));

    return {
        ...context,
        frame,
        endsUser,
        ...(dual ? { dual } : {}),
        relations: context.relations.filter(id => BUSINESS_RELATIONS.includes(id) === (frame === "business")),
        // (The user's life stage is asked of a consumer buyer only.)
        userStages: frame === "people" ? context.userStages : []
    };

}

/** The buyer and user relationships of a business buyer (Positioning's End User); the others are a consumer buyer's. */
const BUSINESS_RELATIONS = ["rel:employer", "rel:copartner", "rel:serving", "rel:intermediary", "rel:sponsor", "rel:otherbusiness"];

/** The audience ids of a buyer who is a person, and of a business or public buyer. */
export const PEOPLE_AUDIENCE = ["young", "adult", "senior"];
export const BUSINESS_AUDIENCE = ["solo", "smb", "mid", "enterprise", "local", "regional", "central", "institutional", "lowreg", "specialized", "heavy", "crossborder"];


/**
 * A Segment's answers as they stand once settled against Identity as it is NOW: an answer to a question Identity no longer asks (a child's school stage after the buyer became a business) or to
 * an option it no longer offers is left out. What the documents and the exports read, so a change in Positioning never leaves old answers in them; the card removes them on the next choice.
 * The stage is taken as Growing: the kind of area is a check that the stage only holds back, never an answer to drop.
 */
export function settledSegmentAnswers(
    segment: { questions: SegmentAnswers; description: Record<string, string>; competitors?: readonly { questions?: Readonly<Record<string, readonly string[]>> }[] },
    organisation: { customerType: readonly string[]; marketType: string; audience: readonly string[]; buyerCategory?: readonly string[]; endUser?: readonly string[]; differentiation?: readonly string[]; outcomeUser?: readonly string[] }
): SegmentAnswers {

    const context = segmentContextFor({
        relationships: organisation.customerType,
        marketType: organisation.marketType,
        audience: organisation.audience,
        buyerCategory: organisation.buyerCategory,
        endUser: organisation.endUser,
        stage: "grow"
    }, segment.description["business-data"] !== undefined);

    // (With the Positioning answers saved before 2026-11-08 as the starts of the Differentiation and the end user's outcome: segmentPositioningShown.)
    return segmentPositioningShown(segmentSettle(segment.questions, context), organisation, context, segment.competitors);

}
