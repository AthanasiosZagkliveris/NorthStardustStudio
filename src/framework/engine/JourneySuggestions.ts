import type { BusinessCustomerSegmentValue } from "./AnswerBusinessFoundation.ts";
import { BUSINESS_CHANNEL_ALL_OFFERINGS, type BusinessChannelValue } from "./businessFoundation/engagementReaders.ts";
import { effectiveOfferingAnswers, effectiveProfileAnswers, effectiveSegmentAnswers, offeringIsPhysical } from "./EffectiveAnswers.ts";
import { demandChannelIds } from "./DemandCapacity.ts";
import type { SegmentIdentity } from "./SegmentContext.ts";

/*
    CUSTOMER ENGAGEMENT FOLLOWS THE FOUNDATION (doc 47, section 3; doc 28, section 7.4): what Page 1 already says about a Segment proposes its channels, stage by
    stage, a relationship type for each Offering, and the rows of each Offering's Demand. Everything here is a SUGGESTION the founder adds or leaves: nothing is
    written by itself. Every rule maps a Page 1 option id to a channel category and subchannel by their labels (channelCategories.ts); an option with no channel
    is left out (listed in doc 47).
*/

/** One channel the Foundation suggests for a stage: its category, its subchannel ("" for the category alone) and where it comes from. */
export interface ChannelSuggestion {
    /** A journey stage id (BUSINESS_JOURNEY_STAGES). */
    stage: string;
    category: string;
    name: string;
    /** The Page 1 answer it comes from, in a few words: "how they discover you". */
    source: string;
}

type Pick = readonly [category: string, name: string];

/** Where customers discover new products (the Segment's `discover`) → a Discover channel. Media and reviews have no channel of their own. */
const DISCOVER: Readonly<Record<string, Pick>> = {
    peers: ["Referral & Affiliates", "Customer Referral"],
    communities: ["Community", ""],
    creators: ["Referral & Affiliates", "Influencer / Ambassador"],
    algorithmic: ["Social Media", ""],
    search: ["Website", "Main Website"],
    passing: ["In Person", "Studio / Shop"],
    events: ["In Person", "Event / Talk"],
    sales: ["In Person", "Sales Visit"]
};

/** The Profiles' social media (C2) → Social Media and its platform. */
const SOCIAL: Readonly<Record<string, string>> = {
    instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", youtube: "YouTube", tiktok: "TikTok", pinterest: "Pinterest", "x-twitter": "X (Twitter)"
};

/** The Profiles' communities (C3) → Community and its platform. */
const COMMUNITIES: Readonly<Record<string, string>> = {
    "facebook-group": "Facebook Group", discord: "Discord", reddit: "Reddit", slack: "Slack", meetup: "Meetup"
};

/** The Profiles' events (C4) → In Person and the kind of event. */
const EVENTS: Readonly<Record<string, string>> = {
    market: "Market / Pop-up", fair: "Trade Fair / Exhibition", workshop: "Workshop / Class", talk: "Event / Talk"
};

/** How the Profiles compare options (D1) → an Evaluation channel. A demo, trial or sample is In Person for a physical item, else Online / Live. */
const COMPARE: Readonly<Record<string, Pick | "demo">> = {
    "your-website": ["Website", "Main Website"],
    "reviews-and-recommendations-online": ["Website", "Main Website"],
    "comparison-sites": ["Website", "Main Website"],
    "a-demo-trial-or-sample": "demo",
    "a-quote-or-proposal": ["Email", "Direct Email"],
    "what-other-people-recommend": ["Referral & Affiliates", "Customer Referral"],
    "a-meeting-or-call": ["Online / Live", ""]
};

/** Where the Segment shops (`setting`) → a Purchase channel. */
const SETTING: Readonly<Record<string, readonly Pick[]>> = {
    mobile: [["Website", "Online Store"]],
    desktop: [["Website", "Online Store"]],
    store: [["In Person", "Studio / Shop"]],
    multi: [["Website", "Online Store"], ["In Person", "Studio / Shop"]]
};

/** How the Segment pays (`pay`) → Direct Payment and its way. Buy Now, Pay Later has no subchannel of its own. */
const PAY: Readonly<Record<string, string>> = {
    card: "Card", wallet: "Payment Link", cash: "Cash", invoice: "Invoice"
};

/** How customers receive an Offering (O6) → a Delivery channel. */
const RECEIVE: Readonly<Record<string, Pick>> = {
    auto: ["File Delivery", ""],
    byyou: ["File Delivery", ""],
    live: ["Online / Live", ""],
    inperson: ["In Person", "Customer Location"],
    shipped: ["Physical Delivery", ""],
    collect: ["In Person", "Pickup / Collection"],
    access: ["Website", ""]
};

/** The help after buying (O7) → a Support & Follow Up channel. "None" has none. */
const HELP_AFTER: Readonly<Record<string, readonly Pick[]>> = {
    guides: [["Website", ""]],
    auto: [["Email", "Automated Email"]],
    personal: [["Email", "Direct Email"], ["Online / Live", ""]],
    dedicated: [["Online / Live", ""]]
};

/** The help wanted before buying (D2) → a Support & Follow Up channel. */
const HELP_BEFORE: Readonly<Record<string, Pick>> = {
    alone: ["Website", ""],
    little: ["Email", "Direct Email"],
    person: ["Online / Live", ""],
    formal: ["Online / Live", ""]
};

/** The channels one Segment's Foundation suggests, stage by stage, each once (the first source that gives it names it). A local Segment's In Person and Community come first. */
export function journeySuggestions(segment: BusinessCustomerSegmentValue, identity?: SegmentIdentity): ChannelSuggestion[] {
    const answers = effectiveSegmentAnswers(segment, identity);
    const profiles = segment.profiles.map(profile => effectiveProfileAnswers(profile, segment, identity));
    const offerings = segment.offerings.map(offering => effectiveOfferingAnswers(offering, segment, identity));
    const physical = segment.offerings.some(offering => offeringIsPhysical(offering, segment, identity));
    const ids = (list: readonly (Record<string, string[] | undefined>)[], key: string) => [...new Set(list.flatMap(entry => entry[key] ?? []))];

    const out: ChannelSuggestion[] = [];
    const add = (stage: string, [category, name]: Pick, source: string) => {
        if (!out.some(entry => entry.stage === stage && entry.category === category && entry.name === name)) {
            out.push({ stage, category, name, source });
        }
    };

    // DISCOVER: how they discover you, then the social media, communities and events of the Profiles.
    const discover: ChannelSuggestion[] = [];
    const before = out.length;
    (answers.discover ?? []).forEach(id => DISCOVER[id] && add("discovery", DISCOVER[id], "how they discover you"));
    ids(profiles, "c2").forEach(id => SOCIAL[id] && add("discovery", ["Social Media", SOCIAL[id]], "your Profiles' social media"));
    ids(profiles, "c3").forEach(id => COMMUNITIES[id] && add("discovery", ["Community", COMMUNITIES[id]], "your Profiles' communities"));
    ids(profiles, "c4").forEach(id => EVENTS[id] && add("discovery", ["In Person", EVENTS[id]], "your Profiles' events"));
    discover.push(...out.splice(before));
    // A Segment in one city or town meets its customers in person first (doc 28, 7.4).
    const local = (answers.reach ?? []).includes("city");
    const first = (entry: ChannelSuggestion) => local && (entry.category === "In Person" || entry.category === "Community") ? 0 : 1;
    out.push(...discover.map((entry, at) => ({ entry, at })).sort((a, b) => first(a.entry) - first(b.entry) || a.at - b.at).map(item => item.entry));

    // EVALUATION: how the Profiles compare options.
    ids(profiles, "d1").forEach(id => {
        const rule = COMPARE[id];
        if (rule) {
            add("evaluation", rule === "demo" ? (physical ? ["In Person", "Studio / Shop"] : ["Online / Live", ""]) : rule, "how they compare options");
        }
    });

    // PURCHASE: where they shop and how they pay.
    (answers.setting ?? []).forEach(id => (SETTING[id] ?? []).forEach(pick => add("purchase", pick, "where they shop")));
    (answers.pay ?? []).forEach(id => PAY[id] && add("purchase", ["Direct Payment", PAY[id]], "how they pay"));
    if ((answers.authorise ?? []).includes("procurement")) {
        add("purchase", ["Direct Payment", "Invoice"], "how they decide to buy");
    }

    // DELIVERY: how they receive each Offering.
    ids(offerings, "o6").forEach(id => RECEIVE[id] && add("delivery", RECEIVE[id], "how they receive it"));

    // SUPPORT & FOLLOW UP: the help after they buy, then the help they want before buying.
    ids(offerings, "o7").forEach(id => (HELP_AFTER[id] ?? []).forEach(pick => add("support", pick, "your help after they buy")));
    ids(profiles, "d2").forEach(id => HELP_BEFORE[id] && add("support", HELP_BEFORE[id], "the help they want"));

    return out;
}

/** A suggestion is met once the Segment has the channel: the same category and subchannel, or, for a category alone, any channel of it. */
export function suggestionMet(suggestion: ChannelSuggestion, channels: readonly BusinessChannelValue[]): boolean {
    const name = suggestion.name.trim().toLocaleLowerCase();
    return channels.some(channel => channel.category === suggestion.category && (name === "" || channel.name.trim().toLocaleLowerCase() === name));
}

/** The relationship types, from the least to the most personal. */
const PERSONAL_ORDER = ["self-service", "automated-service", "personal-assistance", "dedicated-support"] as const;

/**
 * The relationship type the Foundation suggests for one Offering (doc 28, 7.4): from the help after buying (its O7) and the help the Segment's Profiles want
 * before buying (D2), the most personal of them. None where neither is answered.
 */
export function suggestedRelationshipType(segment: BusinessCustomerSegmentValue, offeringId: string, identity?: SegmentIdentity): string | null {
    const offering = segment.offerings.find(entry => entry.id === offeringId);
    const after = offering ? effectiveOfferingAnswers(offering, segment, identity).o7 ?? [] : [];
    const before = [...new Set(segment.profiles.flatMap(profile => effectiveProfileAnswers(profile, segment, identity).d2 ?? []))];
    const types: string[] = [];
    after.forEach(id => types.push(id === "dedicated" ? "dedicated-support" : id === "personal" ? "personal-assistance" : id === "auto" ? "automated-service" : "self-service"));
    before.forEach(id => types.push(id === "formal" ? "dedicated-support" : id === "person" || id === "little" ? "personal-assistance" : "self-service"));
    if (types.length === 0) {
        return null;
    }
    return types.reduce((best, type) => PERSONAL_ORDER.indexOf(type as typeof PERSONAL_ORDER[number]) > PERSONAL_ORDER.indexOf(best as typeof PERSONAL_ORDER[number]) ? type : best);
}

/** One Demand row the Foundation proposes for an Offering: a Customer Source and, for a channel's row, the channel that brings its customers. */
export interface DemandSuggestion {
    /** A DEMAND_SOURCES id. */
    type: string;
    /** The Discover channel the row is for ("" for a row of no channel). */
    channelId: string;
    /** What the row is called: the channel's name, or the source's. */
    label: string;
    source: string;
}

/** A Discover channel's category → the Customer Source its customers come by (doc 28, 7.5). */
const SOURCE_OF: Readonly<Record<string, string>> = {
    "Referral & Affiliates": "referrals",
    Marketplace: "marketplace", "In Person": "marketplace", "Retail & Wholesale": "marketplace",
    Website: "funnel", "Social Media": "funnel", Email: "funnel", Community: "funnel", "Online / Live": "funnel"
};

/**
 * The Demand rows the Foundation proposes for one Offering (doc 28, 7.5): one for each Discover channel that serves it and is not yet among the channels that
 * bring its customers (the channels its sources name), and Contracts or tenders where the Segment's buyer decides by a formal tender and no such row exists yet.
 */
export function demandSuggestions(segment: BusinessCustomerSegmentValue, offeringId: string, channels: readonly BusinessChannelValue[], demand: { sources: readonly { type: string; channelId: string }[] }, identity?: SegmentIdentity): DemandSuggestion[] {
    const out: DemandSuggestion[] = [];
    // (The channels that already bring its customers: those its sources name, demandChannelIds.)
    const used = demandChannelIds(demand);
    channels
        .filter(channel => channel.stages.includes("discovery") && (channel.offerings.includes(BUSINESS_CHANNEL_ALL_OFFERINGS) || channel.offerings.includes(offeringId)))
        .filter(channel => !used.includes(channel.id))
        .forEach(channel => out.push({
            type: SOURCE_OF[channel.category] ?? "other",
            channelId: channel.id,
            label: channel.name.trim() || channel.category,
            source: "a Discover channel that serves it"
        }));
    if ((effectiveSegmentAnswers(segment, identity).authorise ?? []).includes("procurement") && !demand.sources.some(source => source.type === "contracts")) {
        out.push({ type: "contracts", channelId: "", label: "Contracts or tenders", source: "how they decide to buy" });
    }
    return out;
}
