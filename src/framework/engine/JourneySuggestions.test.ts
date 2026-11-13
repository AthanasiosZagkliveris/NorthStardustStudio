import { describe, expect, test } from "vitest";
import { asBusinessEngagementValue, asBusinessFoundationValue, createBusinessChannel } from "./AnswerUtils.ts";
import { DEFAULT_RELATIONSHIP_TYPE, autoRelationshipTypes, offeringRelationshipsFor, demandSuggestions, journeySuggestions, relationshipTypesOf, suggestionMet, withAnswerChannels, dismissedAfter, channelKey } from "./JourneySuggestions.ts";
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
        // Support: personal and dedicated help after they buy (O7); the help wanted before buying (D2) makes relationship types only (owner, 2026-11-13 16:50).
        expect(named(list, "support")).toEqual(["Email › Direct Email", "Online / Live"]);
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

    test("Buy Now, Pay Later at the payment link, media and reviews at the website, a marketplace shopper at the Marketplace (owner, 2026-11-13 16:50)", () => {
        const segment = quill.foundation.segments[0];
        const bare = { ...segment, profiles: [], offerings: [], questions: { ...segment.questions, pay: ["bnpl"], discover: ["media"], setting: ["marketplace"], authorise: [] } };
        expect(journeySuggestions(bare).map(entry => entry.stage + " " + entry.category + " › " + entry.name)).toEqual(["discovery Website › Main Website", "purchase Marketplace › ", "purchase Direct Payment › Payment Link"]);
    });

    test("a suggestion is met once the channel exists: the same subchannel, or any channel of a category suggested alone", () => {
        const linkedIn = { ...createBusinessChannel(), category: "Social Media", name: "LinkedIn" };
        expect(suggestionMet({ stage: "discovery", category: "Social Media", name: "LinkedIn", source: "" }, [linkedIn])).toBe(true);
        expect(suggestionMet({ stage: "discovery", category: "Social Media", name: "Instagram", source: "" }, [linkedIn])).toBe(false);
        expect(suggestionMet({ stage: "support", category: "Social Media", name: "", source: "" }, [linkedIn])).toBe(true);
    });

});

describe("the Demand rows the Foundation proposes", () => {

    test("one row for each Discover channel serving the Offering that no source of it names yet, by the channel's category", () => {
        const segment = quill.foundation.segments[0];
        const channels = quill.engagement.segments[0].channels;
        const build = segment.offerings[1];
        const rows = demandSuggestions(segment, build.id, channels, quill.engagement.demand[build.id]);
        expect(rows.map(row => row.type + " " + row.label)).toEqual(["funnel LinkedIn", "funnel Main Website", "other Referral partners", "referrals Customer Referral", "funnel X (Twitter)"]);
        // (The Audit's sources name LinkedIn and Referral partners, so those already bring its customers: only its other Discover channels are proposed.)
        const audit = segment.offerings[0];
        expect(demandSuggestions(segment, audit.id, channels, quill.engagement.demand[audit.id]).map(row => row.label)).toEqual(["Main Website", "Event / Talk", "Slack", "Customer Referral", "X (Twitter)"]);
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

describe("the subchannels the answers make (owner, 2026-11-13 13:56)", () => {
    const segment = { ...asBusinessFoundationValue(undefined).segments[0], id: "s1", questions: { discover: ["search"] }, profiles: [{ ...asBusinessFoundationValue(undefined).segments[0].profiles[0], questions: { c2: ["youtube", "tiktok"] } }] } as never;
    const website = { ...createBusinessChannel(), category: "Website", name: "Online Store", stages: ["discovery"] };

    test("a platform the Profiles name is made, at its stage, serving every Offering; a generic suggestion only where the category has no channel at that stage", () => {
        const made = withAnswerChannels([website], [], segment);
        expect(made.filter(channel => channel.fromAnswers).map(channel => channel.category + " › " + channel.name + " " + channel.stages.join(","))).toEqual(["Social Media › YouTube discovery", "Social Media › TikTok discovery"]);
        expect(made.find(channel => channel.name === "YouTube")?.offerings).toEqual(["*"]);
        // (The search answer means a website at Discover: the founder's Online Store is it.)
        expect(made.some(channel => channel.name === "Main Website")).toBe(false);
        // (Nothing more to make: the same list.)
        expect(withAnswerChannels(made, [], segment)).toBe(made);
    });

    test("a removed one stays removed; added again it is back; an untouched one goes with its answer", () => {
        const made = withAnswerChannels([website], [], segment);
        const without = made.filter(channel => channel.name !== "TikTok");
        const dismissed = dismissedAfter(made, without, []);
        expect(dismissed).toEqual([channelKey("Social Media", "TikTok")]);
        expect(withAnswerChannels(without, dismissed, segment)).toBe(without);
        expect(dismissedAfter(without, made, dismissed)).toEqual([]);
        const noAnswers = { ...segment as object, profiles: [] } as never;
        expect(withAnswerChannels(made, [], noAnswers).map(channel => channel.name)).toEqual(["Online Store"]);
    });
});
