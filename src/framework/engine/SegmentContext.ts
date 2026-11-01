/**
 * WHAT THE SEGMENT CARD READS OF THE IDENTITY ANSWERS (design document 28, 6.3 and 8.2, "What the Segment will read"): the Seller and Buyer Relationship (I3), the Market Structure (I11) and the audience (I7b).
 * Pure functions, so the card, the documents and the tests read the same rules (in the engine, since the documents settle a Segment's answers against Identity too).
 */
import { AUDIENCE_WORDS } from "./ActivityClassification.ts";
import { type SegmentAnswers, type SegmentContext, segmentSettle } from "./SegmentQuestions.ts";

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
    const endUser = identity?.endUser ?? [];
    const relationships = identity?.relationships ?? [];

    // The user is described where a consumer or a business buyer is a Proxy or Dual-Intent buyer of a relationship chosen.
    const endsUser = relationships.some(model => categories.includes(model + ":proxy") || categories.includes(model + ":dual"));

    return {
        frame: segmentFrame(identity),
        stage: identity?.stage ?? "",
        lifeStages: (identity?.audience ?? []).filter(id => PEOPLE_AUDIENCE.includes(id)),
        endsUser,
        userStages: endUser.filter(id => id.startsWith("age:")),
        relations: endUser.filter(id => id.startsWith("rel:"))
    };

}

/**
 * The questions of ONE Segment: where Identity chose both relationships (or none), a Segment that has not ticked Business Data is a Segment of people, and one that has is asked both
 * (the people's questions and the business's). Otherwise the Segment follows Identity.
 */
export function segmentContextFor(identity: SegmentIdentity | undefined, businessTicked: boolean): SegmentContext {

    const context = segmentContext(identity);

    return context.frame === "open" && !businessTicked ? { ...context, frame: "people" } : context;

}

/** The audience ids of a buyer who is a person, and of a business or public buyer. */
export const PEOPLE_AUDIENCE = ["young", "adult", "senior"];
export const BUSINESS_AUDIENCE = ["solo", "smb", "mid", "enterprise", "local", "regional", "central", "institutional", "lowreg", "specialized", "heavy", "crossborder"];


/**
 * A Segment's answers as they stand once settled against Identity as it is NOW: an answer to a question Identity no longer asks (a child's school stage after the buyer became a business) or to
 * an option it no longer offers is left out. What the documents and the exports read, so a change in Positioning never leaves old answers in them; the card removes them on the next choice.
 * The stage is taken as Growing: the kind of area is a check that the stage only holds back, never an answer to drop.
 */
export function settledSegmentAnswers(
    segment: { questions: SegmentAnswers; description: Record<string, string> },
    organisation: { customerType: readonly string[]; marketType: string; audience: readonly string[]; buyerCategory?: readonly string[]; endUser?: readonly string[] }
): SegmentAnswers {

    const context = segmentContextFor({
        relationships: organisation.customerType,
        marketType: organisation.marketType,
        audience: organisation.audience,
        buyerCategory: organisation.buyerCategory,
        endUser: organisation.endUser,
        stage: "grow"
    }, segment.description["business-data"] !== undefined);

    return segmentSettle(segment.questions, context);

}
