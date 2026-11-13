import { describe, expect, test } from "vitest";
import { asBusinessEngagementValue, asBusinessFoundationValue, createBusinessChannel } from "./AnswerUtils.ts";
import { DEFAULT_RELATIONSHIP_TYPE, autoRelationshipTypes, offeringRelationshipsFor, demandSuggestions, journeySuggestions, relationshipTypesOf, suggestedRelationshipType, suggestionMet } from "./JourneySuggestions.ts";
import lumenText from "../../data/examples/lumen-and-loom-studio.json?raw";
import quillText from "../../data/examples/quillfield-automation-llc.json?raw";

/* Customer Engagement follows the Foundation (doc 47, section 3; doc 28, 7.4 and 7.5): each rule, then both examples. */

function example(text: string) {
    const json = JSON.parse(text) as { systems: Record<string, { responses: { sectionNumber: number; value: unknown }[] }> };
    const responses = json.systems["3"].responses;
    return {
        foundation: asBusinessFoundationValue(responses.find(response => response.sectionNumber === 1)!.value),
        engagement: asBusinessEngagementValue(responses.find(response => response.sectionNumber === 2)!.value)
    };
}

const lumen = example(lumenText);
const quill = example(quillText);
const named = (list: ReturnType<typeof journeySuggestions>, stage: string) => list.filter(entry => entry.stage === stage).map(entry => entry.category + (entry.name ? " › " + entry.name : ""));

describe("the channels the Foundation suggests, stage by stage", () => {

    test("Quillfield's NYC Service Firms: every stage from its Page 1 answers", () => {
        const list = journeySuggestions(quill.foundation.segments[0]);
        // Discover: peers and online communities (how they discover you), LinkedIn and X (C2), Slack (C3).
        expect(named(list, "discovery")).toEqual(["Referral & Affiliates › Customer Referral", "Community", "Social Media › LinkedIn", "Social Media › X (Twitter)", "Community › Slack"]);
        // Evaluation: a meeting or call, their website, a quote or proposal (D1).
        expect(named(list, "evaluation")).toEqual(["Online / Live", "Website › Main Website", "Email › Direct Email"]);
        // Purchase: they shop online on a computer; they pay by invoice.
        expect(named(list, "purchase")).toEqual(["Website › Online Store", "Direct Payment › Invoice"]);
        // Delivery: sent by you online, ongoing online access (O6).
        expect(named(list, "delivery")).toEqual(["File Delivery", "Website"]);
        // Support: personal and dedicated help after they buy (O7), working it out alone before (D2).
        expect(named(list, "support")).toEqual(["Email › Direct Email", "Online / Live", "Website"]);
        list.forEach(entry => expect(entry.source.length).toBeGreaterThan(0));
    });

    test("Lumen & Loom's London Homemakers: social media, communities and events from the Profiles; card and wallet from how they pay", () => {
        const list = journeySuggestions(lumen.foundation.segments[0]);
        expect(named(list, "discovery")).toEqual(expect.arrayContaining(["Social Media › Instagram", "Social Media › Pinterest", "Community › Facebook Group", "In Person › Market / Pop-up", "In Person › Workshop / Class"]));
        expect(named(list, "purchase")).toEqual(["Website › Online Store", "Direct Payment › Card", "Direct Payment › Payment Link"]);
        // A physical item: shipped (Physical Delivery); a demo or sample in person (Studio / Shop).
        expect(named(list, "delivery")).toContain("Physical Delivery");
        expect(named(list, "evaluation")).toContain("In Person › Studio / Shop");
    });

    test("a Segment in one city meets its customers in person first", () => {
        const segment = quill.foundation.segments[0];
        const local = { ...segment, questions: { ...segment.questions, reach: ["city"], discover: ["peers", "events"] } };
        expect(named(journeySuggestions(local), "discovery")[0]).toBe("In Person › Event / Talk");
    });

    test("Buy Now, Pay Later and media or reviews suggest nothing: no channel of their own", () => {
        const segment = quill.foundation.segments[0];
        const bare = { ...segment, profiles: [], offerings: [], questions: { ...segment.questions, pay: ["bnpl"], discover: ["media"], setting: [], authorise: [] } };
        expect(journeySuggestions(bare)).toEqual([]);
    });

    test("a suggestion is met once the channel exists: the same subchannel, or any channel of a category suggested alone", () => {
        const linkedIn = { ...createBusinessChannel(), category: "Social Media", name: "LinkedIn" };
        expect(suggestionMet({ stage: "discovery", category: "Social Media", name: "LinkedIn", source: "" }, [linkedIn])).toBe(true);
        expect(suggestionMet({ stage: "discovery", category: "Social Media", name: "Instagram", source: "" }, [linkedIn])).toBe(false);
        expect(suggestionMet({ stage: "support", category: "Social Media", name: "", source: "" }, [linkedIn])).toBe(true);
    });

});

describe("the relationship type the Foundation suggests", () => {

    test("the most personal of the help after buying (O7) and the help wanted before (D2)", () => {
        const [audit, build, retainer] = quill.foundation.segments[0].offerings;
        expect(suggestedRelationshipType(quill.foundation.segments[0], audit.id)).toBe("personal-assistance");
        expect(suggestedRelationshipType(quill.foundation.segments[0], build.id)).toBe("personal-assistance");
        expect(suggestedRelationshipType(quill.foundation.segments[0], retainer.id)).toBe("dedicated-support");
        expect(suggestedRelationshipType(lumen.foundation.segments[1], lumen.foundation.segments[1].offerings[0].id)).toBe("dedicated-support");
    });

    test("none where neither is answered", () => {
        const segment = { ...quill.foundation.segments[0], profiles: [], offerings: [] };
        expect(suggestedRelationshipType(segment, "missing")).toBeNull();
    });

});

describe("the Demand rows the Foundation proposes", () => {

    test("one row for each Discover channel serving the Offering that no source of it names yet, by the channel's category", () => {
        const segment = quill.foundation.segments[0];
        const channels = quill.engagement.segments[0].channels;
        const build = segment.offerings[1];
        const rows = demandSuggestions(segment, build.id, channels, quill.engagement.demand[build.id]);
        expect(rows.map(row => row.type + " " + row.label)).toEqual(["funnel LinkedIn", "funnel Main Website", "other Referral partners"]);
        // (The Audit's sources name LinkedIn and Referral partners, so those already bring its customers: only its other Discover channels are proposed.)
        const audit = segment.offerings[0];
        expect(demandSuggestions(segment, audit.id, channels, quill.engagement.demand[audit.id]).map(row => row.label)).toEqual(["Main Website", "Event / Talk", "Slack"]);
    });

    test("Contracts or tenders where the buyer decides by a formal tender, once", () => {
        const segment = { ...quill.foundation.segments[0], questions: { ...quill.foundation.segments[0].questions, authorise: ["procurement"] } };
        const empty = { sources: [] };
        expect(demandSuggestions(segment, "x", [], empty).map(row => row.type)).toEqual(["contracts"]);
        expect(demandSuggestions(segment, "x", [], { sources: [{ type: "contracts", channelId: "" }] })).toEqual([]);
    });

});

describe("the relationship types the answers create (owner, 2026-11-13 00:29 and 00:31)", () => {

    test("every type the answers point to, each once, with its source: the help after buying, the help wanted before, the Profiles' communities", () => {
        const segment = quill.foundation.segments[0];
        const retainer = segment.offerings[2];
        expect(autoRelationshipTypes(segment, retainer.id)).toEqual([
            { type: "dedicated-support", source: "your help after they buy" },
            { type: "personal-assistance", source: "the help they want before buying" },
            { type: "self-service", source: "the help they want before buying" },
            { type: "community", source: "the communities your Profiles belong to" }
        ]);
    });

    test("a buyer who decides by formal tender, or a government buyer, creates Dedicated Support", () => {
        const base = quill.foundation.segments[0];
        const tender = { ...base, questions: { ...base.questions, authorise: ["procurement"] } };
        expect(autoRelationshipTypes(tender, "missing").map(entry => entry.type)).toContain("dedicated-support");
        const plain = { ...base, profiles: [] };
        expect(autoRelationshipTypes(plain, "missing", { relationships: ["b2g"], marketType: "", audience: [] }).map(entry => entry.type)).toEqual(["dedicated-support"]);
    });

    test("an Offering's types: the answers' less those removed, then those added; never none", () => {
        const segment = quill.foundation.segments[0];
        const audit = segment.offerings[0];
        expect(relationshipTypesOf([], [], segment, audit.id)).toEqual(["personal-assistance", "self-service", "community"]);
        // (A removed type stays removed; an added one is kept.)
        expect(relationshipTypesOf(["automated-service"], ["self-service", "community"], segment, audit.id)).toEqual(["personal-assistance", "automated-service"]);
        // (With every type removed, or no answers at all, Personal Assistance.)
        expect(relationshipTypesOf([], ["personal-assistance", "self-service", "community"], segment, audit.id)).toEqual([DEFAULT_RELATIONSHIP_TYPE]);
        expect(relationshipTypesOf([], [], undefined, "x")).toEqual(["personal-assistance"]);
    });

});

describe("every Offering's relationships, the one list the page and the documents read (owner, 2026-11-13)", () => {

    test("each Offering of the Segment, in its order, with the types the page shows and their saved details; an Offering with nothing saved has its types too", () => {
        const segment = quill.foundation.segments[0];
        const saved = quill.engagement.segments.find(entry => entry.segmentId === segment.id)!;
        const list = offeringRelationshipsFor(saved, segment);
        expect(list.map(entry => entry.offeringId)).toEqual(segment.offerings.map(offering => offering.id));
        // (The examples keep the types they describe: the answers' others are recorded as removed.)
        expect(list.map(entry => entry.types)).toEqual([["personal-assistance"], ["dedicated-support"], ["dedicated-support"]]);
        expect(list[0].typeDetail["personal-assistance"]?.purpose).toBeTruthy();
        // (Nothing saved: the answers' types, the same the page shows.)
        expect(offeringRelationshipsFor(undefined, segment)[0].types).toEqual(autoRelationshipTypes(segment, segment.offerings[0].id).map(entry => entry.type));
    });

});
