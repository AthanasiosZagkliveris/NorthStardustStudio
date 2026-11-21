import { relationshipTypeLabel } from "./businessFoundation/engagementReaders.ts";
import type { OfferingAnswers } from "./choices/OfferingQuestions.ts";

/*
    A RELATIONSHIP TYPE'S DRAFTS (2.14, the second batch of the review; owner, 2026-11-18 00:46): the draft written in by itself on a relationship type's card (useAutoDraft) is a starting
    Purpose from the type and the Offering's answers -- the help it gives after the sale (O7), how fast you reply (O16) -- and a starting Approach for each journey
    stage still empty, from the channels of that stage. As the Value Proposition's draft: the founder's words replace it.
*/

/** How fast you reply (O16), as a clause of the Purpose. */
const REPLYING: Readonly<Record<string, string>> = { sameday: ", replying the same day", oneday: ", replying within one working day", fewdays: ", replying within a few days" };

/** A list in words: "A", "A and B", "A, B and C". */
function inWords(names: readonly string[]): string {
    return names.length <= 1 ? names[0] ?? "" : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}

/** The Purpose a type starts from, for an Offering. */
export function relationshipPurposeDraft(typeId: string, offeringName: string, answers: OfferingAnswers): string {
    const name = offeringName.trim() || "this Offering";
    const reply = REPLYING[(answers.o16 ?? [])[0] ?? ""] ?? "";
    switch (typeId) {
        case "self-service":
            return "Customers of " + name + " find what they need and use it on their own" + ((answers.o7 ?? []).includes("guides") ? ", with guides and how-tos." : ".");
        case "personal-assistance":
            return "A person helps each customer of " + name + " whenever they need it" + reply + ".";
        case "dedicated-support":
            return "A dedicated person or team looks after each customer of " + name + " from start to finish" + reply + ".";
        case "community":
            return "Customers of " + name + " meet, share what they make and help one another.";
        case "automated-service":
            return "Automatic help, such as chat or emails, answers customers of " + name + " at any hour.";
        default:
            return (relationshipTypeLabel(typeId) || "Help") + " for each customer of " + name + reply + ".";
    }
}

/** What each type does at a stage, opening the Approach. */
const DOING: Readonly<Record<string, string>> = {
    "self-service": "Clear information they act on alone",
    "personal-assistance": "A personal reply",
    "dedicated-support": "Their own contact",
    "community": "Conversations with other customers",
    "automated-service": "Automatic messages"
};

/** The Approach a stage starts from: what the type does there, through that stage's channels; "" where the stage has none. */
export function relationshipApproachDraft(typeId: string, channelNames: readonly string[]): string {
    const names = [...new Set(channelNames.map(name => name.trim()).filter(Boolean))];
    if (names.length === 0) {
        return "";
    }
    return (DOING[typeId] ?? "Help") + " through " + inWords(names) + ".";
}
