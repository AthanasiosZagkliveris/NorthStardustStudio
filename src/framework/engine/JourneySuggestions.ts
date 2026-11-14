import type { BusinessCustomerSegmentValue } from "./AnswerBusinessFoundation.ts";
import { BUSINESS_CHANNEL_ALL_OFFERINGS, type BusinessChannelValue, type BusinessOfferingRelationshipEntryValue, type BusinessRelationshipTypeValue } from "./businessFoundation/engagementReaders.ts";
import { effectiveOfferingAnswers, effectiveProfileAnswers, effectiveSegmentAnswers, offeringIsPhysical } from "./EffectiveAnswers.ts";
import { demandChannelIds } from "./DemandCapacity.ts";
import { businessProfileOfferings } from "./businessFoundation/engagementPage.ts";
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
    /** A platform or event the Profiles name (their social media, communities, events): that very subchannel, never another of its channel. */
    named?: boolean;
}

type Pick = readonly [category: string, name: string];

/** Where customers discover new products (the Segment's `discover`) → a Discover channel. Media, reviews and comparison sites lead to the website, as the
 *  Profiles' online reviews do (COMPARE). */
const DISCOVER: Readonly<Record<string, Pick>> = {
    peers: ["Referral & Affiliates", "Customer Referral"],
    media: ["Website", "Main Website"],
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
    multi: [["Website", "Online Store"], ["In Person", "Studio / Shop"]],
    // (A marketplace the founder names: Etsy, Amazon and the rest are the Marketplace channel's subchannels.)
    marketplace: [["Marketplace", ""]]
};

/** How the Segment pays (`pay`) → Direct Payment and its way. Buy Now, Pay Later is offered at the checkout a payment link opens (Klarna, Afterpay). */
const PAY: Readonly<Record<string, string>> = {
    card: "Card", wallet: "Payment Link", cash: "Cash", invoice: "Invoice", bnpl: "Payment Link"
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


/** The channels one Segment's Foundation suggests, stage by stage, each once (the first source that gives it names it). A local Segment's In Person and Community come first. */
export function journeySuggestions(segment: BusinessCustomerSegmentValue, identity?: SegmentIdentity): ChannelSuggestion[] {
    const answers = effectiveSegmentAnswers(segment, identity);
    const profiles = segment.profiles.map(profile => effectiveProfileAnswers(profile, segment, identity));
    const offerings = segment.offerings.map(offering => effectiveOfferingAnswers(offering, segment, identity));
    const physical = segment.offerings.some(offering => offeringIsPhysical(offering, segment, identity));
    const ids = (list: readonly (Record<string, string[] | undefined>)[], key: string) => [...new Set(list.flatMap(entry => entry[key] ?? []))];

    const out: ChannelSuggestion[] = [];
    const add = (stage: string, [category, name]: Pick, source: string, named = false) => {
        if (!out.some(entry => entry.stage === stage && entry.category === category && entry.name === name)) {
            out.push({ stage, category, name, source, ...(named ? { named: true } : {}) });
        }
    };

    // DISCOVER: how they discover you, then the social media, communities and events of the Profiles.
    const discover: ChannelSuggestion[] = [];
    const before = out.length;
    (answers.discover ?? []).forEach(id => DISCOVER[id] && add("discovery", DISCOVER[id], "how they discover you"));
    ids(profiles, "c2").forEach(id => SOCIAL[id] && add("discovery", ["Social Media", SOCIAL[id]], "your Profiles' social media", true));
    ids(profiles, "c3").forEach(id => COMMUNITIES[id] && add("discovery", ["Community", COMMUNITIES[id]], "your Profiles' communities", true));
    ids(profiles, "c4").forEach(id => EVENTS[id] && add("discovery", ["In Person", EVENTS[id]], "your Profiles' events", true));
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

    // SUPPORT & FOLLOW UP: the help after they buy. (The help they want before buying, D2, makes the relationship types: autoRelationshipTypes.)
    ids(offerings, "o7").forEach(id => (HELP_AFTER[id] ?? []).forEach(pick => add("support", pick, "your help after they buy")));

    return out;
}

/** A suggestion is met once the Segment has the channel: the same category and subchannel, or, for a category alone, any channel of it. */
export function suggestionMet(suggestion: ChannelSuggestion, channels: readonly BusinessChannelValue[]): boolean {
    const name = suggestion.name.trim().toLocaleLowerCase();
    return channels.some(channel => channel.category === suggestion.category && (name === "" || channel.name.trim().toLocaleLowerCase() === name));
}

/** A subchannel's key, the same however it is written: its category and name. */
export const channelKey = (category: string, name: string) => category.trim().toLocaleLowerCase() + "|" + name.trim().toLocaleLowerCase();

/**
 * THE SUBCHANNELS THE ANSWERS MAKE (owner, 2026-11-13 13:56: "on the profile there are selected social media, but on the channels/subchannels are empty!"; 00:31:
 * the answers create things themselves): each named subchannel the Foundation suggests (journeySuggestions) is a real channel of the Segment, at every stage
 * its answers give it, serving every Offering -- unless the Segment has it already or the founder removed it (dismissed). A channel the answers made that is
 * still untouched (no action, no link) goes when its answer does. A suggestion of a category alone ("Online / Live") waits for the founder to name it.
 * Returns the same list when nothing changes.
 */
export function withAnswerChannels(channels: readonly BusinessChannelValue[], dismissed: readonly string[], segment: BusinessCustomerSegmentValue, identity?: SegmentIdentity): BusinessChannelValue[] {
    const wanted = new Map<string, { category: string; name: string; stages: string[] }>();
    // (A platform the Profiles name is made as named; any other suggestion only where the Segment has no channel of its category at its stage yet -- a website
    // the founder named "Online Store" is the website the search answer means.)
    const covered = (suggestion: ChannelSuggestion) => suggestionCovered(suggestion, channels.filter(channel => !channel.fromAnswers));
    journeySuggestions(segment, identity).filter(suggestion => suggestion.name !== "" && !covered(suggestion)).forEach(suggestion => {
        const key = channelKey(suggestion.category, suggestion.name);
        const entry = wanted.get(key) ?? { category: suggestion.category, name: suggestion.name, stages: [] };
        if (!entry.stages.includes(suggestion.stage)) {
            entry.stages.push(suggestion.stage);
        }
        wanted.set(key, entry);
    });
    const untouched = (channel: BusinessChannelValue) => Object.values(channel.actionIds ?? {}).every(ids => ids.length === 0) && channel.links.every(link => link.trim() === "");
    const kept = channels.filter(channel => !(channel.fromAnswers && untouched(channel) && !wanted.has(channelKey(channel.category, channel.name))));
    const have = new Set(kept.map(channel => channelKey(channel.category, channel.name)));
    const made: BusinessChannelValue[] = [...wanted.entries()]
        .filter(([key]) => !have.has(key) && !dismissed.includes(key))
        .map(([key, entry]) => ({
            id: "channel-" + segment.id + "-" + key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
            category: entry.category,
            name: entry.name,
            links: [""],
            offerings: [BUSINESS_CHANNEL_ALL_OFFERINGS],
            stages: entry.stages,
            actionIds: {},
            actions: {},
            fromAnswers: true
        }));
    return made.length === 0 && kept.length === channels.length ? channels as BusinessChannelValue[] : [...kept, ...made];
}

/**
 * The dismissed subchannels after a change of the Segment's channels: a subchannel removed, or renamed away from its name, is dismissed; one added (again)
 * is no longer.
 */
export function dismissedAfter(before: readonly BusinessChannelValue[], after: readonly BusinessChannelValue[], dismissed: readonly string[]): string[] {
    const keyOf = (channel: BusinessChannelValue) => channel.name.trim() ? channelKey(channel.category, channel.name) : "";
    const now = new Set(after.map(keyOf).filter(Boolean));
    const gone = before.map(keyOf).filter(key => key && !now.has(key));
    return [...new Set([...dismissed.filter(key => !now.has(key)), ...gone])];
}

/** A suggestion answered by the Segment's channels: the very subchannel, or -- for one not named by the Profiles -- any channel of its category at its stage. */
export function suggestionCovered(suggestion: ChannelSuggestion, channels: readonly BusinessChannelValue[]): boolean {
    return suggestionMet(suggestion, channels) || (!suggestion.named && channels.some(channel => channel.category === suggestion.category && channel.stages.includes(suggestion.stage)));
}


/**
 * THE GOALS A STAGE STARTS WITH (owner, 2026-11-14 11:15: "could the options in the Goals column be automatically selected based on previous options?"), read by
 * the Get, Keep and Grow of Osterwalder and Pigneur's Customer Relationships (Business Model Generation, 2010) and the customer lifecycle: the stages before
 * the sale get the customer (Discover, Evaluation, Purchase), Delivery keeps them, and Support & Follow Up keeps them and -- where the Offering has more to
 * sell after the sale (O17: updates, training, replacements or refills, repairs or maintenance) or its customers buy out of habit -- grows them too. A start
 * only: shown ticked until the founder changes the row, whose answer is then the founder's.
 */
export function startGoals(stageId: string, segment: BusinessCustomerSegmentValue, offeringId: string, identity?: SegmentIdentity): string[] {
    if (stageId === "discovery" || stageId === "evaluation" || stageId === "purchase") {
        return ["get"];
    }
    if (stageId === "delivery") {
        return ["keep"];
    }
    if (stageId !== "support") {
        return [];
    }
    const offering = segment.offerings.find(entry => entry.id === offeringId);
    const after = offering ? effectiveOfferingAnswers(offering, segment, identity).o17 ?? [] : [];
    const habit = (effectiveSegmentAnswers(segment, identity).path ?? []).includes("habit");
    return habit || after.some(id => id === "updates" || id === "training" || id === "replacements" || id === "repairs") ? ["keep", "grow"] : ["keep"];
}

/** The relationship type an Offering has when its answers point to none: a person helping the customer, the type an early-stage founder starts with. */
export const DEFAULT_RELATIONSHIP_TYPE = "personal-assistance";

/** A relationship type the answers create for an Offering, and the answer it comes from. */
export interface AutoRelationship {
    type: string;
    source: string;
}

/**
 * THE RELATIONSHIP TYPES THE ANSWERS CREATE FOR AN OFFERING (owner, 2026-11-13 00:31: "The relationships, ideally, should be auto generated from the foundation or
 * identity answers"), each once, with its source -- read by the types of Osterwalder and Pigneur, Business Model Generation (2010), "Customer Relationships":
 * - its help after buying (O7): dedicated -> Dedicated Support, personal -> Personal Assistance, automatic -> Automated Service, the rest -> Self-Service;
 * - the help the Profiles it serves want before buying (D2): formal -> Dedicated Support, a person or a little -> Personal Assistance, the rest -> Self-Service;
 * - communities the Profiles belong to (C3) -> Community: customers who help one another;
 * - a buyer who decides by formal tender (the Segment's authorise) or a government buyer (Identity, B2G) -> Dedicated Support: one named contact for a formal
 *   account.
 */
export function autoRelationshipTypes(segment: BusinessCustomerSegmentValue, offeringId: string, identity?: SegmentIdentity): AutoRelationship[] {
    const out: AutoRelationship[] = [];
    const add = (type: string, source: string) => {
        if (!out.some(entry => entry.type === type)) {
            out.push({ type, source });
        }
    };
    const offering = segment.offerings.find(entry => entry.id === offeringId);
    // (None gives no help, so it makes no type: the Offering's other answers, or Personal Assistance, stand.)
    (offering ? effectiveOfferingAnswers(offering, segment, identity).o7 ?? [] : []).filter(id => id !== "none").forEach(id =>
        add(id === "dedicated" ? "dedicated-support" : id === "personal" ? "personal-assistance" : id === "auto" ? "automated-service" : "self-service", "your help after they buy"));
    // (The Profiles this Offering serves -- those that tick it among their needs --, else the Segment's every Profile.)
    const serving = segment.profiles.filter(profile => businessProfileOfferings(profile, segment.offerings).some(entry => entry.id === offeringId));
    const profiles = (serving.length > 0 ? serving : segment.profiles).map(profile => effectiveProfileAnswers(profile, segment, identity));
    [...new Set(profiles.flatMap(profile => profile.d2 ?? []))].forEach(id =>
        add(id === "formal" ? "dedicated-support" : id === "person" || id === "little" ? "personal-assistance" : "self-service", "the help they want before buying"));
    if (profiles.some(profile => (profile.c3 ?? []).some(id => COMMUNITIES[id]))) {
        add("community", "the communities your Profiles belong to");
    }
    if ((effectiveSegmentAnswers(segment, identity).authorise ?? []).includes("procurement")) {
        add("dedicated-support", "a buyer who decides by formal tender");
    }
    if ((identity?.relationships ?? []).includes("b2g")) {
        add("dedicated-support", "your government buyers");
    }
    return out;
}

/**
 * AN OFFERING'S RELATIONSHIP TYPES (owner, 2026-11-13 00:29 and 00:31: "Every Offering should have at least 1 relationship!"): the ones its answers create
 * (autoRelationshipTypes) less those the founder removed, then those the founder added; never none -- with nothing else, Personal Assistance (which a type added
 * beside it then saves: addRelationshipType).
 */
export function relationshipTypesOf(kept: readonly string[], dismissed: readonly string[], segment: BusinessCustomerSegmentValue | undefined, offeringId: string, identity?: SegmentIdentity): string[] {
    const auto = segment ? autoRelationshipTypes(segment, offeringId, identity).map(entry => entry.type).filter(type => !dismissed.includes(type)) : [];
    const types = [...new Set([...auto, ...kept.filter(type => type !== "")])];
    return types.length > 0 ? types : [DEFAULT_RELATIONSHIP_TYPE];
}

/** One Offering's relationships as the page and every document show them: its types (relationshipTypesOf) and what is recorded for each. */
export interface OfferingRelationships {
    offeringId: string;
    types: string[];
    typeDetail: Record<string, BusinessRelationshipTypeValue>;
}

/**
 * EVERY OFFERING'S RELATIONSHIPS, THE ONE LIST (owner, 2026-11-13): for each of a Page 1 Segment's Offerings, in its order, the types the page shows -- those the
 * answers create less those removed, then those added, never none (relationshipTypesOf) -- with the Purpose, Goals and Approach saved for them. Customer
 * Engagement, the Business Plan, the Canvas and the export all read this.
 */
export function offeringRelationshipsFor(saved: { offerings: readonly BusinessOfferingRelationshipEntryValue[] } | undefined, segment: BusinessCustomerSegmentValue, identity?: SegmentIdentity): OfferingRelationships[] {
    return segment.offerings.map(offering => {
        const stored = saved?.offerings.find(entry => entry.offeringId === offering.id);
        return {
            offeringId: offering.id,
            types: relationshipTypesOf(stored?.types ?? [], stored?.dismissed ?? [], segment, offering.id, identity),
            typeDetail: stored?.typeDetail ?? {}
        };
    });
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

/** The Customer Source a channel's customers come by, from its category (as the Demand suggestions read it): "other" where the category says none. */
export const demandSourceOf = (category: string) => SOURCE_OF[category] ?? "other";

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
    // REPEAT CUSTOMERS, where the answers say they come back (doc 28, 7.5): customers who buy out of habit (the Segment's `path`), or an Offering kept up after the
    // sale -- repairs and maintenance, replacements and refills (O17). A subscription keeps its clients and is never offered it (DEMAND_SOURCES, oneOffOnly).
    const offering = segment.offerings.find(entry => entry.id === offeringId);
    const after = offering ? effectiveOfferingAnswers(offering, segment, identity).o17 ?? [] : [];
    const habit = (effectiveSegmentAnswers(segment, identity).path ?? []).includes("habit");
    if ((habit || after.includes("repairs") || after.includes("replacements")) && !(demand as { recurring?: boolean }).recurring && !demand.sources.some(source => source.type === "repeat")) {
        out.push({ type: "repeat", channelId: "", label: "Repeat customers", source: habit ? "they buy out of habit" : "what comes after the sale" });
    }
    return out;
}


/**
 * THE FUNNEL'S MIDDLE STEP IS A TRIAL (doc 50, section 2.5; owner, 2026-11-14 12:00): where a Profile of the Segment compares options by "A demo, trial or
 * sample" (D1), the Sales funnel's Qualified step is the people who tried it -- its label "Tried it (%)". No new kind of source.
 */
export function funnelIsTrial(segment: BusinessCustomerSegmentValue, identity?: SegmentIdentity): boolean {
    return segment.profiles.some(profile => (effectiveProfileAnswers(profile, segment, identity).d1 ?? []).includes("a-demo-trial-or-sample"));
}

/**
 * THE TIME TO BUY, from the answers (doc 50, section 2.5): how long a sale takes from first contact, by who decides ("Who decides to buy?") and how they
 * decide ("How do your customers usually decide to buy?"). On impulse or out of habit: none. Formal procurement: three to six months; a manager signing off
 * or several departments checking: two to three; one person deciding or the team agreeing: about one. The longest the answers name. Read only: it is shown on
 * the Sales funnel and Contracts sources, and the forecast does not shift the sales by it (the ramp of Sustainability already starts them slowly).
 */
export function monthsToClose(segment: BusinessCustomerSegmentValue, identity?: SegmentIdentity): { low: number; high: number } | null {
    const answers = effectiveSegmentAnswers(segment, identity);
    const path = (answers.path ?? [])[0] ?? "";
    if (path === "impulse" || path === "habit") {
        return null;
    }
    const decides = answers.authorise ?? [];
    if (decides.includes("procurement")) {
        return { low: 3, high: 6 };
    }
    if (decides.includes("executive") || decides.includes("multi")) {
        return { low: 2, high: 3 };
    }
    if (decides.includes("solo") || decides.includes("champions")) {
        return { low: 1, high: 1 };
    }
    return null;
}
