/**
 * WHAT THE SEGMENT CARD READS OF THE IDENTITY ANSWERS (design document 28, 6.3 and 8.2, "What the Segment will read"): the Seller and Buyer Relationship (I3), the Market Structure (I11) and the audience (I7b).
 * Pure functions, so the card and its tests read the same rules.
 */
import { AUDIENCE_WORDS } from "../../../../framework/engine/ActivityClassification.ts";

/** The Identity answers the Segment card reads. Absent: nothing is known, and the card is as it was. */
export interface SegmentIdentity {
    /** The ids of the Seller and Buyer Relationship (b2c, b2b, b2g, g2b). */
    relationships: readonly string[];
    /** "single" or "multi" (empty: not answered). */
    marketType: string;
    /** The ids of the audience answers. */
    audience: readonly string[];
}

/** Who the Segment's questions are written for: people (Box 1), businesses and public bodies (Box 3), or not yet known / both (both boxes). */
export type SegmentFrame = "people" | "business" | "open";

export function segmentFrame(identity: SegmentIdentity | undefined): SegmentFrame {

    const chosen = identity?.relationships ?? [];
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

/** The answers of G24, "Who uses it?". */
export const SEGMENT_USERS = [
    { id: "same", label: "The same people who pay" },
    { id: "people", label: "Someone else: individual people" },
    { id: "business", label: "Someone else: businesses or organisations" }
] as const;

export type SegmentUser = typeof SEGMENT_USERS[number]["id"];

/** The start of G24 where Identity already says it: Proxy Buyers / Gifters buy for someone else, who is a person. */
export function defaultSegmentUser(identity: SegmentIdentity | undefined): SegmentUser {
    return identity?.audience.includes("proxy") ? "people" : "same";
}

/** The audience answers that belong to the Segment's frame, in words (the people's life stage; the business's scale or level), for the "i" of Demographics and Business Data. */
export function audienceLine(identity: SegmentIdentity | undefined, ids: readonly string[]): string[] {

    const words = (identity?.audience ?? []).filter(id => ids.includes(id)).map(id => AUDIENCE_WORDS[id]).filter(Boolean);

    return words.length > 0
        ? ["Your Positioning (Identity) chose: " + words.join(", ") + "."]
        : [];

}

/** The audience ids of a buyer who is a person, and of a business or public buyer. */
export const PEOPLE_AUDIENCE = ["proxy", "young", "adult", "senior"];
export const BUSINESS_AUDIENCE = ["solo", "smb", "mid", "enterprise", "local", "regional", "central", "institutional", "lowreg", "specialized", "heavy", "crossborder"];

/** G24's "i": the words, the one-Segment rule, and what Identity already says. */
export function segmentUserNote(identity: SegmentIdentity | undefined): string[] {

    const points = [
        "The customer is who pays; the user is who uses it. They can be different people: a baby uses the nappies and a parent pays; in a hospital the buyer is procurement and the user is a surgeon.",
        "If someone else uses it, this is still one Segment, with a Buyer part and a User part. It is not two Segments."
    ];

    if (identity?.audience.includes("proxy")) {
        points.push("Your Positioning (Identity) chose Proxy Buyers / Gifters: the buyer pays and decides, and the product is for someone else. This starts at \"Someone else: individual people\".");
    }

    if (identity?.marketType === "multi") {
        points.push("Your Market Structure (Identity) is multi-sided, a platform: each other side is a User part. Say here what type it is.");
    }

    return points;

}
