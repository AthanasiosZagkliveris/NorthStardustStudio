import { describe, expect, test } from "vitest";
import { asBusinessEngagementValue, asBusinessFoundationValue, createBusinessChannel } from "./AnswerUtils.ts";
import { DEFAULT_RELATIONSHIP_TYPE, autoRelationshipTypes, offeringRelationshipsFor, demandSuggestions, journeySuggestions, relationshipTypesOf, suggestionMet, withAnswerChannels, dismissedAfter, channelKey, startGoals, funnelIsTrial, demandSourceOf, demandSourceKey, withAnswerSources } from "./JourneySuggestions.ts";
import { createDemand, createDemandSource } from "./DemandCapacity.ts";
import { relationshipTypeLabel } from "./businessFoundation/engagementReaders.ts";
import { effectiveProfileAnswers, segmentTrials } from "./EffectiveAnswers.ts";
import { PROFILE_QUESTIONS, TRIAL_OPTIONS, profileOptionsShown } from "./ProfileQuestions.ts";
import { subchannelHidden } from "./businessFoundation/channelCategories.ts";
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
        expect(named(list, "discovery")).toEqual(["Referral & Affiliates › Customer Referral", "Community", "Referral & Affiliates › Referral Partner", "Social Media › LinkedIn", "Social Media › X (Twitter)", "Community › Slack", "Community › Agency founder communities"]);
        // Evaluation: a demo (D1; project work can be shown, 2026-11-16), their website, a meeting or call, a quote or proposal.
        expect(named(list, "evaluation")).toEqual(["Samples & Trials › Demo", "Website › Main Website", "Online / Live", "Email › Direct Email", "Website › Contact Page"]);
        // Purchase: they shop online on a computer; they pay by invoice.
        expect(named(list, "purchase")).toEqual(["Website › Online Store", "Direct Payment › Invoice", "Direct Payment › Bank Transfer"]);
        // Delivery: sent by you online, ongoing online access (O6).
        expect(named(list, "delivery")).toEqual(["File Delivery", "Website", "File Delivery › Email Attachment", "File Delivery › Client Portal"]);
        // Support: personal and dedicated help after they buy (O7); the help wanted before buying (D2) makes relationship types only (owner, 2026-11-13 16:50).
        // (And how they keep in touch after the sale, O23: personal messages, the Retainer's newsletter.)
        expect(named(list, "support")).toEqual(["Email › Direct Email", "Email › Newsletter", "Online / Live"]);
        list.forEach(entry => expect(entry.source.length).toBeGreaterThan(0));
    });

    test("Lumen & Loom's London Homemakers: social media, communities and events from the Profiles; card and wallet from how they pay", () => {
        const list = journeySuggestions(lumen.foundation.segments[0]);
        expect(named(list, "discovery")).toEqual(expect.arrayContaining(["Social Media › Instagram", "Social Media › Pinterest", "Community › Facebook Group", "In Person › Market / Pop-up", "In Person › Workshop / Class"]));
        expect(named(list, "purchase")).toEqual(["Website › Online Store", "Direct Payment › Card", "Direct Payment › Payment Link", "Website › Booking / Registration Page"]);
        // A physical item: shipped (Physical Delivery); its free sample, and the workshops' taster (D1, 2026-11-16).
        expect(named(list, "delivery")).toContain("Physical Delivery");
        expect(named(list, "evaluation")).toEqual(expect.arrayContaining(["Samples & Trials › Free Sample", "Samples & Trials › Taster Session / Free Class"]));
    });

    test("a Segment in one city meets its customers in person first", () => {
        const segment = quill.foundation.segments[0];
        const local = { ...segment, questions: { ...segment.questions, reach: ["city"], discover: ["peers", "events"] } };
        expect(named(journeySuggestions(local), "discovery")[0]).toBe("In Person › Event / Talk");
    });

    test("Buy Now, Pay Later at the payment link, media and reviews at the website, a marketplace shopper at the Marketplace (owner, 2026-11-13 16:50)", () => {
        const segment = quill.foundation.segments[0];
        const bare = { ...segment, profiles: [], offerings: [], questions: { ...segment.questions, pay: ["bnpl"], discover: ["media"], setting: ["marketplace"], authorise: [] } };
        expect(journeySuggestions(bare).map(entry => entry.stage + " " + entry.category + " › " + entry.name)).toEqual(["discovery Website › Main Website", "purchase Marketplace › ", "purchase Direct Payment › Payment Link", "evaluation Website › Contact Page"]);
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
        // (Its sources before the answers made the grouped ones -- the example holds those now, as the page leaves it.)
        const demand = quill.engagement.demand[build.id];
        const rows = demandSuggestions(segment, build.id, channels, { ...demand, sources: demand.sources.filter(source => !source.group) });
        // (One row per kind, all its channels listed, so a customer is counted once; an Other channel its own row; Referral partners is the built-in Referral Partner since 2026-11-16 20:24: owner, 2026-11-16 20:22.)
        expect(rows.map(row => row.type + " " + row.label)).toEqual(["funnel Sales funnel", "referrals Referrals"]);
        const named = (id: string) => channels.find(channel => channel.id === id)?.name;
        expect(rows[0].channelIds?.map(named)).toEqual(["LinkedIn", "Main Website", "X (Twitter)", "Agency founder communities"]);
        expect(rows[1].channelIds?.map(named)).toEqual(["Referral Partner", "Customer Referral"]);
        // (The Audit's sources name LinkedIn and Referral partners, so those already bring its customers: only its other Discover channels are proposed.)
        const audit = segment.offerings[0];
        const auditDemand = quill.engagement.demand[audit.id];
        expect(demandSuggestions(segment, audit.id, channels, { ...auditDemand, sources: auditDemand.sources.filter(source => !source.group) }).map(row => row.label)).toEqual(["Sales funnel", "Referrals", "Visitors"]);
        // (In the order of the first open channel of each kind, as the example replayed on 2026-11-17 holds its channels.)
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

    test("a buyer who decides by formal tender, or a government buyer of a business Segment, creates Dedicated Support", () => {
        const base = quill.foundation.segments[0];
        const tender = { ...base, questions: { ...base.questions, authorise: ["procurement"] } };
        expect(autoRelationshipTypes(tender, "missing").map(entry => entry.type)).toContain("dedicated-support");
        const government = { relationships: ["b2g"], marketType: "", audience: [] };
        // (Government buyers want a named contact where the Segment's buyer is a business or the public sector; a Segment of people is left as it is: owner, 2026-11-16.)
        const people = { ...base, profiles: [], description: Object.fromEntries(Object.entries(base.description).filter(([key]) => key !== "business-data")) } as typeof base;
        expect(autoRelationshipTypes(people, "missing", government).map(entry => entry.type)).toEqual([]);
        const business = { ...people, description: { ...people.description, "business-data": {} } } as unknown as typeof base;
        expect(autoRelationshipTypes(business, "missing", government).map(entry => entry.type)).toEqual(["dedicated-support"]);
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
        expect(made.filter(channel => channel.fromAnswers).map(channel => channel.category + " › " + channel.name + " " + channel.stages.join(","))).toEqual(["Social Media › YouTube discovery", "Social Media › TikTok discovery", "Website › Contact Page evaluation"]);
        expect(made.find(channel => channel.name === "YouTube")?.offerings).toEqual(["*"]);
        // (The search answer means a website at Discover: the founder's Online Store is it.)
        expect(made.some(channel => channel.name === "Main Website")).toBe(false);
        // (Nothing more to make: the same list.)
        expect(withAnswerChannels(made, [], segment)).toBe(made);
    });

    test("a platform, community or event written in under Other is made too, by its name (owner, 2026-11-15 16:08)", () => {
        const base = asBusinessFoundationValue(undefined).segments[0];
        // (C3 is asked where the Segment discovers through communities; C4, where it meets in person, takes the same path.)
        const written = { ...base, id: "s2", questions: { discover: ["communities"] }, profiles: [
            { ...base.profiles[0], questions: { c2: ["instagram", "other"], "c2-other": ["Bluesky, Threads"], c3: ["other"], "c3-other": ["Nextdoor"], c4: ["other"], "c4-other": ["Open studios"] } },
            { ...base.profiles[0], id: "p2", questions: { c2: ["other"], "c2-other": ["bluesky"] } },
            // (Written in but Other not ticked: not read.)
            { ...base.profiles[0], id: "p3", questions: { c3: ["discord"], "c3-other": ["Old group"] } }
        ] } as never;
        const made = withAnswerChannels([], [], written).filter(channel => channel.fromAnswers).map(channel => channel.category + " › " + channel.name);
        expect(made).toEqual(["Social Media › Instagram", "Social Media › Bluesky", "Social Media › Threads", "Community › Discord", "Community › Nextdoor"]);
    });

    test("a removed one stays removed; added again it is back; an untouched one goes with its answer", () => {
        const made = withAnswerChannels([website], [], segment);
        const without = made.filter(channel => channel.name !== "TikTok");
        const dismissed = dismissedAfter(made, without, []);
        expect(dismissed).toEqual([channelKey("Social Media", "TikTok")]);
        expect(withAnswerChannels(without, dismissed, segment)).toBe(without);
        expect(dismissedAfter(without, made, dismissed)).toEqual([]);
        const noAnswers = { ...segment as object, profiles: [] } as never;
        // (Where they discover still names the website: its Contact Page stays.)
        expect(withAnswerChannels(made, [], noAnswers).map(channel => channel.name)).toEqual(["Online Store", "Contact Page"]);
    });
});

describe("the Goals a stage starts with (owner, 2026-11-14 11:15)", () => {
    test("Get before the sale, Keep at Delivery, Keep and Grow at Support where the Offering sells more after the sale", () => {
        const segment = { ...asBusinessFoundationValue(undefined).segments[0], id: "s1", offerings: [{ ...asBusinessFoundationValue(undefined).segments[0].offerings[0], id: "o1", questions: { o17: ["training"] } }] } as never;
        expect(["discovery", "evaluation", "purchase", "delivery"].map(stage => startGoals(stage, segment, "o1").join("+"))).toEqual(["get", "get", "get", "keep"]);
        expect(startGoals("support", segment, "o1")).toEqual(["keep", "grow"]);
        const plain = { ...(segment as object), offerings: [{ ...asBusinessFoundationValue(undefined).segments[0].offerings[0], id: "o1", questions: {} }] } as never;
        expect(startGoals("support", plain, "o1")).toEqual(["keep"]);
    });
});

describe("the marketplaces and shops a Segment names (owner, 2026-11-15 16:26)", () => {
    test("each becomes its subchannel at Purchase: a marketplace by name, Other by the name written, a shop as its own or Retail & Wholesale", () => {
        const base = asBusinessFoundationValue(undefined).segments[0];
        const market = { ...base, id: "m", profiles: [], offerings: [], questions: { setting: ["marketplace"], marketplaces: ["etsy", "noths", "other"], "marketplaces-other": ["Vinted"] } } as never;
        expect(named(journeySuggestions(market), "purchase")).toEqual(["Marketplace", "Marketplace › Etsy", "Marketplace › Not On The High Street", "Marketplace › Vinted"]);
        const shops = { ...base, id: "s", profiles: [], offerings: [], questions: { setting: ["multi"], shops: ["own", "stockists", "concession", "distributors"] } } as never;
        expect(named(journeySuggestions(shops), "purchase")).toEqual(["Website › Online Store", "In Person › Studio / Shop", "Retail & Wholesale › Retail Stockist", "Retail & Wholesale › Concession / Shop-in-shop", "Retail & Wholesale › Distributor"]);
    });
});

describe("the delivery channels the Offering names (O20 to O22; owner, 2026-11-15 16:26)", () => {
    test("each tick its delivery subchannel, Other by the name written; a session suggests the booking page", () => {
        const base = asBusinessFoundationValue(undefined).segments[0];
        const offering = (questions: Record<string, string[]>) => ({ ...base.offerings[0], id: "o-" + Object.keys(questions).join(""), category: "Product", questions });
        const segment = { ...base, id: "d", profiles: [], questions: {}, offerings: [
            offering({ o1: ["physical"], o20: ["courier", "fulfilment", "other"], "o20-other": ["Cargo bike"] }),
            offering({ o1: ["digital"], o6: ["byyou"], o21: ["link", "portal"] })
        ] } as never;
        expect(named(journeySuggestions(segment), "delivery")).toEqual(["Physical Delivery", "File Delivery", "Physical Delivery › Courier", "Physical Delivery › Third-party Fulfilment", "Physical Delivery › Cargo bike", "File Delivery › Client Portal"]);
    });
});

describe("Other as a list (owner, 2026-11-15 16:43: \"Other could be more than 1 channel!\")", () => {
    test("two names give two channels; a row removed takes its untouched channel away; an old text is read once by its commas", () => {
        const base = asBusinessFoundationValue(undefined).segments[0];
        const segment = (rows: string[]) => ({ ...base, id: "w", questions: {}, offerings: [], profiles: [{ ...base.profiles[0], questions: { c2: ["other"], "c2-other": rows } }] }) as never;
        const two = withAnswerChannels([], [], segment(["Bluesky", "Threads"]));
        expect(two.filter(channel => channel.fromAnswers).map(channel => channel.name)).toEqual(["Bluesky", "Threads"]);
        const one = withAnswerChannels(two, [], segment(["Bluesky"]));
        expect(one.filter(channel => channel.fromAnswers).map(channel => channel.name)).toEqual(["Bluesky"]);
        expect(named(journeySuggestions(segment(["Bluesky; Threads, bluesky"])), "discovery")).toEqual(["Social Media › Bluesky", "Social Media › Threads"]);
    });
});

/* Owner, 2026-11-16 17:38: the traditional ways of being found, and letting them try it first (Box 4, 3 and 3a; D1). */
describe("discovery and trial options", () => {
    const base = lumen.foundation.segments[0];
    const withForms = (forms: readonly (readonly [string, string])[]) => ({ ...base, offerings: forms.map(([category, form], at) => ({ ...base.offerings[0], id: "o-" + at, category, questions: (form ? { o1: [form] } : {}) as Record<string, string[]> })) });
    const discovering = (segment: typeof base, discover: string[], extra: Record<string, string[]> = {}) => ({ ...segment, questions: { ...segment.questions, discover, ...extra } });

    test("adverts by where they are seen, flyers and post: each named at Discover", () => {
        const list = journeySuggestions(discovering(base, ["adverts", "flyers", "post"], { advertising: ["radio", "outdoor"] }));
        expect(named(list, "discovery")).toEqual(expect.arrayContaining(["Advertising › Radio", "Advertising › Billboard / Outdoor", "Print & Mail › Flyers / Posters", "Print & Mail › Direct Mail"]));
        expect(list.filter(entry => ["Advertising", "Print & Mail"].includes(entry.category)).every(entry => entry.named)).toBe(true);
        // (Adverts no longer ticked: where they are seen makes nothing.)
        expect(named(journeySuggestions(discovering(base, ["flyers"], { advertising: ["radio"] })), "discovery")).not.toContain("Advertising › Radio");
    });

    test("free samples, tasters or trials: one way per Offering's form, a Demo with none", () => {
        const pick = (segment: typeof base) => named(journeySuggestions(discovering(segment, ["samples"])), "discovery").filter(name => name.startsWith("Samples & Trials"));
        expect(pick(withForms([["Product", "physical"], ["Product", "app"], ["Service", "live"], ["Service", "project"]]))).toEqual(["Samples & Trials › Free Sample", "Samples & Trials › Free Trial", "Samples & Trials › Taster Session / Free Class", "Samples & Trials › Demo"]);
        expect(pick({ ...base, offerings: [] })).toEqual(["Samples & Trials › Demo"]);
    });

    test("D1 offers the ways the Segment's Offerings fit, each its channel at Evaluation; the old demo migrates to them", () => {
        const segment = withForms([["Product", "app"]]);
        const profile = (d1: string[]) => ({ ...segment, profiles: [{ ...segment.profiles[0], questions: { ...(segment.profiles[0].questions ?? {}), d1 } }] });
        expect(segmentTrials(segment)).toEqual(["trial", "demo"]);
        expect(effectiveProfileAnswers(profile(["a-demo-trial-or-sample"]).profiles[0], profile([]), undefined).d1).toEqual(["a-free-trial", "a-demo"]);
        expect(named(journeySuggestions(profile(["a-free-trial", "a-demo"])), "evaluation")).toEqual(expect.arrayContaining(["Samples & Trials › Free Trial", "Samples & Trials › Demo"]));
        expect(funnelIsTrial(profile(["a-free-trial"]))).toBe(true);
        expect(funnelIsTrial(profile(["a-catalogue-or-brochure"]))).toBe(false);
        // (No way fits: the old demo is A demo.)
        const none = withForms([["Service", "ongoing"]]);
        expect(segmentTrials(none)).toEqual([]);
        expect(effectiveProfileAnswers({ ...none.profiles[0], questions: { d1: ["a-demo-trial-or-sample", "your-website"] } }, none, undefined).d1).toEqual(["a-demo", "your-website"]);
        // A physical item: a sample and a catalogue, and a demo for a business Segment.
        expect(segmentTrials(withForms([["Product", "physical"]]))).toEqual(["sample", "catalogue"]);
        const d1 = PROFILE_QUESTIONS.find(entry => entry.id === "d1")!;
        const shown = (trials: string[], chosen: string[] = []) => profileOptionsShown(d1, {}, { frame: "people", stage: "manage", lifeStages: [], endsUser: false, userStages: [], relations: [], scales: [], trials }, { d1: chosen }).map(option => option.id).filter(id => id in TRIAL_OPTIONS);
        expect(shown(["sample", "catalogue"])).toEqual(["a-free-sample", "a-catalogue-or-brochure"]);
        // (A saved way no longer fitting stays shown.)
        expect(shown(["sample"], ["a-free-trial"])).toEqual(["a-free-sample", "a-free-trial"]);
    });

    test("a Free Sample is hidden from its picker while no Offering is physical", () => {
        expect(subchannelHidden("Samples & Trials", "Free Sample", true)).toBe(true);
        expect(subchannelHidden("Samples & Trials", "Free Sample", false)).toBe(false);
        expect(subchannelHidden("Samples & Trials", "Demo", true)).toBe(false);
    });
});

/* Owner, 2026-11-16 19:18: relationship types and Customer Sources come from the answers, as the channels do, with Other written in. */
describe("relationship types and Customer Sources from the answers", () => {
    const base = lumen.foundation.segments[0];
    const offering = base.offerings[0];

    test("an Other written under O7 is a named relationship type; its label is its name", () => {
        const segment = { ...base, offerings: [{ ...offering, questions: { ...(offering.questions ?? {}), o7: ["personal", "other"], "o7-other": ["Monthly clinic", "Repair café"] } }, ...base.offerings.slice(1)] };
        const types = autoRelationshipTypes(segment, offering.id).map(entry => entry.type);
        expect(types).toEqual(expect.arrayContaining(["personal-assistance", "other:Monthly clinic", "other:Repair café"]));
        expect(relationshipTypeLabel("other:Monthly clinic")).toBe("Monthly clinic");
        expect(relationshipTypeLabel("community")).toBe("Community");
        // (Kept with the answer, its details too.)
        const saved = asBusinessEngagementValue({ segments: [{ segmentId: segment.id, offerings: [{ offeringId: offering.id, types: ["other:Monthly clinic", "bogus"], typeDetail: { "other:Monthly clinic": { purpose: "Drop-in help" } }, dismissed: ["other:Repair café"] }] }] });
        const entry = saved.segments[0].offerings[0];
        expect(entry?.types).toEqual(["other:Monthly clinic"]);
        expect(entry?.dismissed).toEqual(["other:Repair café"]);
        expect(entry?.typeDetail["other:Monthly clinic"]?.purpose).toBe("Drop-in help");
    });

    test("the new categories bring prospects; an Other channel's source carries its name; a removed source stays removed; a saved one takes its kind's channels", () => {
        expect(["Advertising", "Print & Mail", "Samples & Trials"].map(category => demandSourceOf(category))).toEqual(["funnel", "funnel", "funnel"]);
        const site = { ...createBusinessChannel(), id: "site", category: "Website", name: "Main Website", stages: ["discovery"] };
        const board = { ...createBusinessChannel(), id: "board", category: "Other", name: "Church noticeboard", stages: ["discovery"] };
        const segment = { ...base, questions: { ...base.questions, path: ["researcher"], authorise: [] }, offerings: [{ ...offering, questions: { ...(offering.questions ?? {}), o17: [] } }] };
        const made = withAnswerSources(undefined, segment, offering.id, [site, board], false)!;
        expect(made.sources.map(source => [source.type, source.group ?? source.channelId, source.name ?? "", source.fromAnswers])).toEqual([["funnel", "Sales funnel", "", true], ["other", "board", "Church noticeboard", true]]);
        // (A new channel of a group joins its source; a group removed stays removed.)
        const landing = { ...createBusinessChannel(), id: "landing", category: "Website", name: "Landing Page", stages: ["discovery"] };
        const grown = withAnswerSources(made, segment, offering.id, [site, board, landing], false)!;
        expect(grown.sources.length).toBe(2);
        expect(grown.sources[0].channelIds).toEqual(["site", "landing"]);
        expect(demandSourceKey(grown.sources[0])).toBe("funnel|group:Sales funnel");
        // (Nothing new: the same value.)
        expect(withAnswerSources(made, segment, offering.id, [site, board], false)).toBe(made);
        // (Removed: not made again until restored.)
        const removed = { ...made, sources: made.sources.slice(1), dismissed: [demandSourceKey(made.sources[0])] };
        expect(withAnswerSources(removed, segment, offering.id, [site, board], false)).toBe(removed);
        // (A source saved by hand keeps its figures and takes its kind's channels: a kind never twice; owner, 2026-11-16 20:29.)
        const hand = { ...createDemand(), sources: [{ ...createDemandSource("funnel", "site"), id: "mine", estimate: "4" }] };
        const kept = withAnswerSources(hand, segment, offering.id, [site, board, landing], false)!;
        expect(kept.sources[0]).toMatchObject({ id: "mine", estimate: "4", group: "Sales funnel", channelIds: ["site", "landing"] });
        expect(kept.sources.map(source => source.group ?? source.channelId)).toEqual(["Sales funnel", "board"]);
        // (A source through a Samples & Trials channel: "Tried it".)
        expect(funnelIsTrial({ ...segment, profiles: [] }, undefined, { category: "Samples & Trials" })).toBe(true);
    });
});

/* Owner, 2026-11-16 20:29: a kind never twice. */
describe("one source of a kind", () => {
    test("a saved source of a kind takes the kind's channels, its figures kept; two saved of a kind stay apart and none is made", () => {
        const base = lumen.foundation.segments[0];
        const offering = base.offerings[0];
        const segment = { ...base, questions: { ...base.questions, path: ["researcher"], authorise: [] }, offerings: [{ ...offering, questions: { ...(offering.questions ?? {}), o17: [] } }] };
        const insta = { ...createBusinessChannel(), id: "insta", category: "Social Media", name: "Instagram", stages: ["discovery"] };
        const site = { ...createBusinessChannel(), id: "site", category: "Website", name: "Main Website", stages: ["discovery"] };
        const saved = { ...createDemandSource("funnel", "insta"), id: "mine", calculate: true, inputs: { prospects: "40", qualified: "15", buy: "25" } };
        const one = withAnswerSources({ ...createDemand(), sources: [saved] }, segment, offering.id, [insta, site], false)!;
        expect(one.sources).toHaveLength(1);
        expect(one.sources[0]).toMatchObject({ id: "mine", type: "funnel", channelId: "", group: "Sales funnel", channelIds: ["insta", "site"], inputs: { prospects: "40", qualified: "15", buy: "25" } });
        expect(withAnswerSources(one, segment, offering.id, [insta, site], false)).toBe(one);
        const two = { ...createDemand(), sources: [saved, { ...createDemandSource("funnel", ""), id: "also" }] };
        expect(withAnswerSources(two, segment, offering.id, [insta, site], false)).toBe(two);
    });
});
