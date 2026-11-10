/* Part of AnswerBusinessFoundation.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; AnswerBusinessFoundation.ts re-exports every part). */

import { asObject, asText, randomId } from "../Readers.ts";
import { type DemandValue, asDemandMap } from "../DemandCapacity.ts";
import { asBusinessFoundationValue, businessNeedList, functionalNeedIds, type BusinessCustomerProfileValue, type BusinessCustomerSegmentValue, type BusinessOfferingValue } from "./foundationPage.ts";

/* ==================================================================
   Business System -- Customer Engagement (Page 2)

   See AnswerType.BusinessEngagement, and the specifications at
   docs/specifications/business-system/page-2-section-1-channels.md
   and page-2-section-2-customer-relationships.md (with its worked
   example beside it).

   Two sections, and the Segment owns both -- for the same reason it
   owns all four of Page 1's. A Channel's reference header shows
   "the selected Customer Segment", its Profiles and its Offerings;
   a Relationship is held with a Profile, whose Offerings and
   Channels are its Segment's. So this page is answered one Segment
   at a time, against the Segments Page 1 defines.

   NOTHING HERE IS DEFINED, ONLY REFERENCED. Segments, Profiles and
   Offerings all come from Page 1 and are held by id: this page
   never stores a name, so renaming a Profile on Page 1 renames it
   here, and neither page can drift from the other. "Do not
   duplicate information that already exists in those sections. Use
   references/selections instead."

   The one thing this page defines is the Channel, which Section 2
   then refers to by id in the same way.
================================================================== */

/**
 * The channel categories, as the specification lists them.
 *
 * "Provide a conservative predefined list... Do not allow unlimited
 * custom categories". Seven, closed: a category is a container for
 * the channels under it, and a list a founder can extend is a list
 * that stops grouping anything.
 */
/**
 * Where in the customer journey a kind of channel is plausibly
 * used, so the Journey Stage list offers what fits rather than all
 * five every time.
 *
 * Taken from the specification's own worked examples, and kept
 * generous: this narrows a list to stop a founder hesitating over
 * an answer that cannot be right, not to argue with one that is.
 * A stage already recorded is always still offered, whatever the
 * category later becomes -- see the editor -- so nothing a founder
 * has said can be hidden by a rule here.
 *
 * A category not listed, and any the founder names themselves,
 * offers all five: nothing is known about it to narrow by.
 */
export const ALL_STAGES = [
    "discovery", "evaluation", "purchase", "delivery", "support"
] as const;

/*
 * THE CHANNEL CATEGORIES, in the order they are offered (the Customer
 * Channels specification's final taxonomy): each with what it is, the
 * Journey Stages a channel of that kind is usually used at, and its
 * channels -- the well-known places or means of that kind, each with
 * what it is, offered by name so nobody types "Instagram" twice and
 * spells it two ways. The picker adds "Other" after them, which lets
 * the name be typed; `otherDescription` says what it stands for.
 * One table: the pickers, their "i" help, the tests and the documents
 * all read it.
 *
 * "Other" is the fallback category, for a channel that fits none of
 * them: its name is the category the founder types, and it offers
 * every stage.
 */
export const BUSINESS_CHANNEL_CATEGORIES = [
    {
        id: "social-media",
        label: "Social Media",
        description: "Social platforms where people can discover your organisation, engage with your content and stay connected.",
        stages: ["discovery", "evaluation", "support"],
        channels: [
            { label: "Instagram", description: "A visual social platform for showcasing offerings, awareness and engagement." },
            { label: "Facebook", description: "A social platform for audience engagement, communities, events and promotion." },
            { label: "LinkedIn", description: "A professional platform for networking, expertise, services and B2B engagement." },
            { label: "YouTube", description: "A video platform for content, education, demonstrations and engagement." },
            { label: "TikTok", description: "A short-form video platform for discovery and engagement." },
            { label: "Pinterest", description: "A visual discovery platform for inspiration and product discovery." },
            { label: "X (Twitter)", description: "Public communication, discussion and audience engagement." }
        ],
        otherDescription: "Another social media platform."
    },
    {
        id: "community",
        label: "Community",
        description: "Spaces where people gather to discuss, participate, share knowledge and interact with your organisation or community.",
        stages: ["discovery", "evaluation", "support"],
        channels: [
            { label: "Facebook Group", description: "A community space for discussion and ongoing engagement." },
            { label: "Discord", description: "A community platform for ongoing discussion and interaction." },
            { label: "Reddit", description: "Topic-based communities for discussion and shared interests." },
            { label: "Slack", description: "A group communication and discussion environment." },
            { label: "Meetup", description: "A platform for communities and gatherings." }
        ],
        otherDescription: "Another community platform."
    },
    {
        id: "website",
        label: "Website",
        description: "Your organisation's own website and pages, used to present information, offerings, transactions, delivery or support.",
        stages: ALL_STAGES,
        channels: [
            { label: "Main Website", description: "Your organisation's primary website and online presence." },
            { label: "Online Store", description: "A website area for browsing and purchasing offerings." },
            { label: "Landing Page", description: "A focused page for an offering, campaign or action." },
            { label: "Booking / Registration Page", description: "A page for bookings, registrations or appointments." },
            { label: "Contact Page", description: "A page for contacting your organisation." }
        ],
        otherDescription: "Another website page or web presence.",
        namePlaceholder: "Website or page"
    },
    {
        id: "marketplace",
        label: "Marketplace",
        description: "Third-party platforms where customers can discover, evaluate, purchase or receive your offerings.",
        stages: ["discovery", "evaluation", "purchase", "delivery"],
        channels: [
            { label: "Etsy", description: "A marketplace for creative, handmade, personalised and physical products." },
            { label: "Amazon", description: "A large marketplace for physical and digital products." },
            { label: "Gumroad", description: "A platform for digital products, memberships and creator offerings." },
            { label: "Fiverr", description: "A marketplace for freelance and creative services." },
            { label: "Upwork", description: "A freelance marketplace for professional services." }
        ],
        otherDescription: "Another marketplace."
    },
    {
        id: "in-person",
        label: "In Person",
        description: "Physical locations, meetings, events or activities where you interact directly with customers.",
        stages: ["discovery", "evaluation", "delivery", "support"],
        channels: [
            { label: "Studio / Shop", description: "A physical location for visiting, browsing or receiving offerings." },
            { label: "Market / Pop-up", description: "A temporary physical selling or promotional presence." },
            { label: "Trade Fair / Exhibition", description: "An event for presenting offerings and meeting audiences." },
            { label: "Workshop / Class", description: "In-person teaching, training or an experience." },
            { label: "Event / Talk", description: "A presentation, talk or public gathering." },
            { label: "Sales Visit", description: "A face-to-face sales or relationship meeting." },
            { label: "Customer Location", description: "A service or interaction at the customer's location." },
            { label: "Pickup / Collection", description: "The customer collects a purchased product in person." }
        ],
        otherDescription: "Another in-person interaction."
    },
    {
        id: "email",
        label: "Email",
        description: "Communication with customers through email, including direct messages, newsletters and follow-ups.",
        stages: ["evaluation", "delivery", "support"],
        channels: [
            { label: "Direct Email", description: "Individual or small-group customer communication." },
            { label: "Newsletter", description: "Regular email communication to subscribers." },
            { label: "Email Campaign", description: "Planned email communication for a specific purpose." },
            { label: "Automated Email", description: "An email triggered by an action or a customer's status." }
        ],
        otherDescription: "Another form of email communication.",
        namePlaceholder: "Email address"
    },
    {
        id: "online-live",
        label: "Online / Live",
        description: "Live digital interactions or experiences delivered through online meeting, streaming or communication platforms.",
        stages: ["evaluation", "delivery", "support"],
        channels: [
            { label: "Zoom", description: "Live online meetings and video communication." },
            { label: "Google Meet", description: "Live online meetings and video communication." },
            { label: "Microsoft Teams", description: "Online meetings, communication and collaboration." },
            { label: "Live Stream", description: "A real-time broadcast to an online audience." }
        ],
        otherDescription: "Another live online platform or method."
    },
    {
        id: "direct-payment",
        label: "Direct Payment",
        description: "Methods customers use to pay your organisation directly, such as cash, card or bank transfer.",
        stages: ["purchase"],
        channels: [
            { label: "Card", description: "Payment with a debit, credit or other payment card." },
            { label: "Cash", description: "Payment in physical cash." },
            { label: "Bank Transfer", description: "Payment transferred directly from the customer's bank account." },
            { label: "Payment Link", description: "Payment completed through a dedicated payment link." },
            { label: "Invoice", description: "Payment requested through an issued invoice." }
        ],
        otherDescription: "Another direct payment method.",
        namePlaceholder: "Payment method"
    },
    {
        id: "file-delivery",
        label: "File Delivery",
        description: "Services or methods used to deliver digital files or downloadable products to customers.",
        stages: ["delivery"],
        channels: [
            { label: "WeTransfer", description: "A file-transfer service for sending digital files." },
            { label: "Google Drive", description: "Cloud storage used to give access to digital files." },
            { label: "Dropbox", description: "Cloud storage and file sharing for digital files." },
            { label: "OneDrive", description: "Cloud storage and file sharing for digital files." },
            { label: "Email Attachment", description: "A digital file delivered as an email attachment." },
            { label: "Client Portal", description: "A dedicated customer area for accessing files and resources." }
        ],
        otherDescription: "Another digital file delivery method."
    },
    {
        id: "physical-delivery",
        label: "Physical Delivery",
        description: "Methods used to physically deliver products to customers, such as courier, postal service or local delivery.",
        stages: ["delivery"],
        channels: [
            { label: "Courier", description: "A product delivered through a courier or parcel service." },
            { label: "Postal Service", description: "A product sent through a national or international postal service." },
            { label: "Local Delivery", description: "A product delivered within a local area." },
            { label: "Third-party Fulfilment", description: "An outside provider stores, prepares and ships your products." }
        ],
        otherDescription: "Another physical delivery method."
    },
    {
        id: "retail-wholesale",
        label: "Retail & Wholesale",
        description: "Shops, stockists and trade buyers who sell your offerings to their own customers, or buy them in bulk to resell.",
        stages: ["discovery", "evaluation", "purchase", "delivery"],
        channels: [
            { label: "Retail Stockist", description: "A shop or boutique that stocks and sells your products." },
            { label: "Distributor", description: "A trade firm that buys in volume and supplies shops or other buyers." },
            { label: "Wholesale Account", description: "A business customer that buys in bulk at trade prices." },
            { label: "Reseller", description: "A business that sells your offerings on under its own name or alongside its own." },
            { label: "Concession / Shop-in-shop", description: "A space inside another shop where your products are sold." }
        ],
        otherDescription: "Another retail or wholesale route."
    },
    {
        id: "referral-affiliates",
        label: "Referral & Affiliates",
        description: "People and partners who send customers to you and are rewarded for the sales or leads they bring.",
        stages: ["discovery", "evaluation", "purchase"],
        channels: [
            { label: "Referral Partner", description: "A business or person that recommends you to their own contacts." },
            { label: "Affiliate", description: "A website or creator paid for the sales that come through their link." },
            { label: "Influencer / Ambassador", description: "A public voice who promotes your offerings to an audience." },
            { label: "Customer Referral", description: "Existing customers who bring new ones, often for a reward." }
        ],
        otherDescription: "Another referral or affiliate route."
    },
    {
        id: "other",
        label: "Other",
        description: "A channel that does not fit any of the categories above.",
        stages: ALL_STAGES,
        channels: [],
        otherDescription: "A channel of your own."
    }
] as const;

/**
 * The channels that serve a physical item only (doc 28, 11.7): Physical Delivery and Retail & Wholesale. While no Offering on Page 1 has a physical item
 * (noPhysicalOffering, EffectiveAnswers.ts), Page 2 hides each of them that holds no subchannel, as Page 3 hides its physical categories: hidden, never deleted,
 * and shown again when an Offering's Type or form (O1) changes.
 */
export const PHYSICAL_CHANNEL_CATEGORY_IDS: readonly string[] = ["physical-delivery", "retail-wholesale"];

/** Whether Page 2 hides a channel category: it serves a physical item only, no Offering has one, and the Segment has no channel under it. */
export function channelCategoryHidden(label: string, noPhysical: boolean, usedLabels: readonly string[]): boolean {
    const category = BUSINESS_CHANNEL_CATEGORIES.find(entry => entry.label === label);
    return noPhysical && category !== undefined && PHYSICAL_CHANNEL_CATEGORY_IDS.includes(category.id) && !usedLabels.includes(label);
}

/** A point of help: a name and what it means. */
export interface ChannelHelpPoint {
    title: string;
    text: string;
}

/** The chosen one first, then the rest in their order. */
export function chosenFirst(points: ChannelHelpPoint[], chosen: string): ChannelHelpPoint[] {
    const at = points.findIndex(point => point.title === chosen.trim());
    return at <= 0 ? points : [points[at], ...points.slice(0, at), ...points.slice(at + 1)];
}

/**
 * The "i" beside the Channel Category picker: every category and what
 * it is, the one chosen first (from the one table).
 */
export function channelCategoryHelp(chosen: string): ChannelHelpPoint[] {
    return chosenFirst(
        BUSINESS_CHANNEL_CATEGORIES.map(category => ({ title: category.label, text: category.description })),
        chosen
    );
}

/**
 * The "i" beside a channel's picker: its category's channels and what
 * each is, "Other" last, the one chosen first. None for a category of
 * the founder's own, which has no list.
 */
export function channelOptionHelp(category: string, chosen: string): ChannelHelpPoint[] {
    const known = BUSINESS_CHANNEL_CATEGORIES.find(entry => entry.label === category);
    if (!known || known.channels.length === 0) {
        return [];
    }
    return chosenFirst([
        ...known.channels.map(channel => ({ title: channel.label, text: channel.description })),
        { title: BUSINESS_CHANNEL_OTHER, text: known.otherDescription }
    ], chosen);
}

/** What to write in a channel's name box, for a category that says. */
export function businessChannelNamePlaceholder(category: string): string {

    const known = BUSINESS_CHANNEL_CATEGORIES.find(
        entry => entry.label === category
    );

    return (known && "namePlaceholder" in known)
        ? known.namePlaceholder
        : "Channel name";

}

/** A category's label, whether it is one of the seven or a name
 *  the founder gave it themselves. */
export function businessChannelCategoryLabel(category: string): string {
    return BUSINESS_CHANNEL_CATEGORIES.find(
        entry => entry.id === category
    )?.label ?? category;
}

/**
 * The last entry of a channel list.
 *
 * Choosing it does not switch the field into another mode -- it
 * empties the box so the name can be typed straight into it. The
 * name is the name wherever it came from.
 */
export const BUSINESS_CHANNEL_OTHER = "Other";

/**
 * The five customer journey stages, shared by both of this page's
 * sections -- a Channel is used at some of them, and a Relationship
 * is conducted at some of them.
 *
 * One list, declared once, because the two sections have to agree:
 * Section 2 picks a Channel for a stage and shows the Action that
 * Channel records for that same stage, which only resolves while
 * both are naming the stage the same way.
 *
 * Purchase and Delivery stay apart -- "Payment and delivery may
 * happen through completely different channels."
 */
export const BUSINESS_JOURNEY_STAGES = [
    // "Discover", the specification's word; the id stays "discovery",
    // so every stored answer still names it.
    { id: "discovery", label: "Discover" },
    { id: "evaluation", label: "Evaluation" },
    { id: "purchase", label: "Purchase" },
    { id: "delivery", label: "Delivery" },
    { id: "support", label: "Support & Follow Up" }
] as const;

/**
 * The five relationship types, each with the explanation the
 * specification gives it.
 *
 * Shown behind the "i" rather than beside every tick, the way the
 * competitor types are on Page 1 -- choosing is then reading five
 * words rather than five sentences.
 */
export const BUSINESS_RELATIONSHIP_TYPES = [
    {
        id: "self-service",
        label: "Self-Service",
        explanation: "The customer can find information, make decisions and use the offering independently, with little direct assistance."
    },
    {
        id: "personal-assistance",
        label: "Personal Assistance",
        explanation: "A person communicates directly with the customer and provides guidance or help when needed."
    },
    {
        id: "dedicated-support",
        label: "Dedicated Support",
        explanation: "The customer receives structured, ongoing support from a designated person or team."
    },
    {
        id: "community",
        label: "Community",
        explanation: "The relationship is supported through interaction with a community of customers or users."
    },
    {
        id: "automated-service",
        label: "Automated Service",
        explanation: "Technology provides information, guidance or assistance without direct involvement from a person."
    }
] as const;

/**
 * Get, Keep and Grow, each with what it MEANS.
 *
 * The meaning is shown beside the name rather than behind the "i":
 * "The dropdown should not just say Get / Keep / Grow. Give the
 * user the meaning directly... This makes the terminology usable
 * even for someone who has never encountered the Get / Keep / Grow
 * model."
 */
export const BUSINESS_RELATIONSHIP_GOALS = [
    {
        id: "get",
        label: "Get",
        explanation: "Attract and convert suitable customers."
    },
    {
        id: "keep",
        label: "Keep",
        explanation: "Maintain satisfaction and encourage continued engagement."
    },
    {
        id: "grow",
        label: "Grow",
        explanation: "Develop the relationship through additional or deeper value."
    }
] as const;

/**
 * One channel: a specific thing with a destination, nested under
 * one of the seven categories.
 *
 * `actions` is keyed by journey stage and holds a list per stage:
 * "For every selected Journey Stage, create a corresponding Action
 * slot", and "Allow more than one Action under a Journey Stage".
 *
 * It is a MAP rather than a list parallel to `stages` so that
 * unticking a stage hides its actions without throwing them away.
 * Unticking is how a founder tries a stage on; it is not a request
 * to delete what they wrote under it, and re-ticking brings the
 * work straight back. The same reason Page 1 keeps what is written
 * under a competitor question its type later hides.
 */
export interface BusinessChannelValue {
    id: string;
    /**
     * The category's LABEL -- one of BUSINESS_CHANNEL_CATEGORIES'
     * seven, a name the founder gave it themselves, or "".
     */
    category: string;
    /**
     * What the channel is called.
     *
     * One field, whether it was typed or taken from the category's
     * list -- a name chosen from a list is the same answer as a
     * name written by hand, and storing "Other" plus the real name
     * beside it was two fields for one fact.
     */
    name: string;
    /** One destination per entry -- a channel may have several. */
    links: string[];
    /** Offering ids, from this Segment's Page 1 Offerings. */
    offerings: string[];
    /** Journey stage ids this channel is used at. */
    stages: string[];
    /**
     * THE ACTIONS OF EACH ROW (channel x stage), by id, in order: each
     * a reference to one of the Segment's actions (its `actions`), so
     * the same action can stand in any number of rows. Kept when a
     * stage is unticked.
     */
    actionIds: Record<string, string[]>;
    /**
     * The same actions' texts, row by row, as read (never written):
     * worked out from `actionIds` every time the answer is read, for
     * everything that only reads them -- documents, exports, search.
     */
    actions: Record<string, string[]>;
}

/**
 * One action of a Segment's channels: written once, placed in any
 * number of rows (BusinessChannelValue.actionIds). Editing it edits
 * it in every row; it is gone once no row holds it.
 */
export interface BusinessChannelActionValue {
    id: string;
    text: string;
}

/**
 * One interaction: a journey stage within an Offering within a
 * Relationship Type.
 *
 * The Goal lives HERE rather than on the relationship as a whole.
 * "The Goal belongs to the Journey Stage/interaction, not
 * necessarily to the whole Profile" -- one relationship can be
 * getting a customer at Evaluation and keeping them at Support, and
 * saying the relationship is "Get + Keep" loses which is which. It
 * is optional per stage, since not every interaction needs a
 * strategic goal of its own.
 */
/**
 * One interaction: what is done at one journey stage, through one
 * channel, for one Offering.
 *
 * It holds ONLY THE ANSWERS. Which interactions exist is not
 * recorded here -- it is read off the Channels table, which
 * already says which Offerings each channel carries and at which
 * stages it is used. See businessRelationshipInteractions.
 */
export interface BusinessRelationshipInteractionValue {
    approach: string;
    /** BUSINESS_RELATIONSHIP_GOALS ids; more than one allowed. */
    goals: string[];
}

/**
 * One Relationship Type slot: why it is maintained, and how each
 * interaction under it is conducted.
 *
 * "Do not treat a combination such as Self-Service + Personal
 * Assistance as one Relationship Type" -- each is its own slot,
 * with its own Purpose, Approaches and Goals.
 *
 * The Offerings and the stages it covers are NOT stored. They are
 * derived from the Channels table, so the two sections cannot
 * disagree about which interactions the organisation actually has:
 * adding a journey stage to a channel adds the row here, and
 * taking it away takes the row away. What is stored is what only a
 * person can say -- the Purpose, and each interaction's Approach
 * and Goals, kept under the key that identifies it.
 */
export interface BusinessRelationshipTypeValue {
    purpose: string;
    /**
     * By `businessInteractionKey` -- Offering, stage and channel
     * together, because one Offering can be engaged at the same
     * stage through two different channels and each of those is
     * its own interaction with its own Approach.
     */
    interactions: Record<string, BusinessRelationshipInteractionValue>;
}

/**
 * The relationship kept with one Profile ABOUT ONE OFFERING.
 *
 * The kind of relationship is per Offering, not per Profile: the
 * same person may want to buy a product on their own and be walked
 * through a service, and those are two relationships with two
 * reasons behind them. "Do not treat a combination such as
 * Self-Service + Personal Assistance as one Relationship Type" --
 * each is still its own slot, now within the Offering it concerns.
 */
export interface BusinessOfferingRelationshipsValue {
    /** BUSINESS_RELATIONSHIP_TYPES ids, each its own slot. */
    types: string[];
    /** Kept by type id, so unticking a type loses nothing. */
    typeDetail: Record<string, BusinessRelationshipTypeValue>;
}

/**
 * Stored in a channel's Offerings in place of listing them: this
 * channel carries EVERY Offering the Segment has.
 *
 * A mark rather than the ids written out, so it keeps meaning
 * "all" as Page 1 gains Offerings -- a channel that carries
 * everything today carries whatever is added tomorrow -- and so a
 * channel that does carry everything stays one line rather than
 * five. Chosen not to collide with an id, which randomId always
 * gives a "kind-" prefix.
 */
export const BUSINESS_CHANNEL_ALL_OFFERINGS = "*";

/** Which Offerings a channel actually carries, with the "all"
 *  mark resolved against the Segment's own list. */
export function businessChannelOfferings(
    channel: BusinessChannelValue,
    offerings: readonly { id: string }[]
): string[] {

    return channel.offerings.includes(BUSINESS_CHANNEL_ALL_OFFERINGS)
        ? offerings.map(offering => offering.id)
        : channel.offerings;

}

/**
 * The Offerings that answer a Profile's FUNCTIONAL NEEDS.
 *
 * Page 1 has both halves of this already: a Profile lists what it
 * needs to get done, and an Offering lists which of those needs it
 * addresses. An Offering that answers none of a Profile's needs is
 * not sold to that Profile, whatever else is true of it -- so the
 * relationships kept with that Profile are not about it.
 *
 * Matched on the need's ID since 2026-11-07 (owner: an Offering ticks a Profile's numbered item by its id, so editing its words keeps the
 * tick); a tick still saved as words, which matched no item when read, is matched on the words, without regard to case or space.
 */
export function businessProfileOfferings(
    profile: BusinessCustomerProfileValue,
    offerings: readonly BusinessOfferingValue[]
): BusinessOfferingValue[] {

    const ids = functionalNeedIds(profile.needs).filter((_, at) => profile.needs.functional[at].trim().length > 0);
    const needs = new Set(
        profile.needs.functional
            .map(need => need.trim().toLocaleLowerCase())
            .filter(need => need.length > 0)
    );

    if (needs.size === 0) {
        return [];
    }

    return offerings.filter(offering =>
        offering.needsAddressed.some(need =>
            ids.includes(need) || needs.has(need.trim().toLocaleLowerCase())
        )
    );

}

/**
 * ONE KIND OF CHANNEL used at one journey stage, and the channels
 * of that kind it happens through -- "Social Media", then TikTok
 * and Instagram.
 *
 * A row of the Interaction Context column. Not an answer of its
 * own: the Approach and the Goal are written once for the stage
 * these all belong to.
 */
export interface BusinessInteractionChannelsValue {
    /** A channel category's label, or "" for channels with none. */
    category: string;
    channelIds: string[];
}

/**
 * One interaction: one Offering, at one journey stage, through
 * every kind of channel used at it.
 *
 * ONE ANSWER PER STAGE. An organisation does not approach a
 * customer differently at Discovery depending on whether they
 * arrived through social media or the website -- it has an
 * approach to being discovered. The kinds of channel are where
 * that happens, listed under the stage, not separate answers.
 */
export interface BusinessInteractionValue {
    key: string;
    offeringId: string;
    stageId: string;
    /** The kinds of channel used at this stage, in the order
     *  BUSINESS_CHANNEL_CATEGORIES gives them. */
    groups: BusinessInteractionChannelsValue[];
    /** See businessRelationshipInteractions. */
    legacyKeys: string[];
}

/**
 * The key one interaction's answers are filed under: the Offering
 * and the journey stage.
 */
export function businessInteractionKey(
    offeringId: string,
    stageId: string
): string {
    return offeringId + "|" + stageId;
}

/**
 * Every interaction the Channels table says exists FOR THESE
 * OFFERINGS, in the order the table reads: by Offering, then by
 * journey stage.
 *
 * This is the whole of what Customer Relationships is answered
 * against. A channel that carries two Offerings at three stages is
 * six interactions; a channel with no Offering chosen, or no stage,
 * is none.
 *
 * `offerings` is what the caller has already narrowed to -- for a
 * Profile's relationships, the Offerings that answer that Profile's
 * functional needs (see businessProfileOfferings). It also gives
 * the order, so the rows run in the same order as the Offerings
 * column of the reference header above them.
 *
 * `segmentOfferings` is the Segment's whole list, needed only to
 * resolve a channel marked as carrying all of them.
 */
export function businessRelationshipInteractions(
    channels: readonly BusinessChannelValue[],
    offerings: readonly { id: string }[],
    segmentOfferings: readonly { id: string }[] = offerings
): BusinessInteractionValue[] {

    const found: BusinessInteractionValue[] = [];

    /* WHERE A CATEGORY SORTS. The seven the page offers come in
       their own order, wherever a founder happened to add them to
       the Channels table; anything they named themselves follows,
       in the order it was met there. */
    const categoryOrder = (category: string) => {

        const known = BUSINESS_CHANNEL_CATEGORIES.findIndex(
            entry => entry.label === category
        );

        return known === -1 ? BUSINESS_CHANNEL_CATEGORIES.length : known;

    };

    for (const offering of offerings) {
        for (const stage of BUSINESS_JOURNEY_STAGES) {

            /* ONE ENTRY PER STAGE, holding the KINDS of channel used
               at it. Three social channels and the website at
               Discovery are one interaction reached four ways, not
               four interactions: the Approach and the Goal are
               written once, for being discovered. */
            for (const channel of channels) {

                if (
                    !businessChannelOfferings(channel, segmentOfferings)
                        .includes(offering.id) ||
                    !channel.stages.includes(stage.id)
                ) {
                    continue;
                }

                let entry = found.find(candidate =>
                    candidate.offeringId === offering.id &&
                    candidate.stageId === stage.id
                );

                if (!entry) {
                    entry = {
                        key: businessInteractionKey(offering.id, stage.id),
                        offeringId: offering.id,
                        stageId: stage.id,
                        groups: [],
                        legacyKeys: []
                    };
                    found.push(entry);
                }

                const group = entry.groups.find(
                    candidate => candidate.category === channel.category
                );

                if (group) {
                    group.channelIds.push(channel.id);
                } else {
                    entry.groups.push({
                        category: channel.category,
                        channelIds: [channel.id]
                    });
                }

                /* WHAT THIS STAGE'S ANSWER WAS FILED UNDER BEFORE.
                   Two rounds of it: one row per channel to begin
                   with, then one row per kind of channel. Both are
                   read as fallbacks so nothing written then is
                   stranded, and neither is ever written to. */
                for (const legacy of [
                    offering.id + "|" + stage.id + "|" + channel.id,
                    offering.id + "|" + stage.id + "|" + channel.category
                ]) {
                    if (!entry.legacyKeys.includes(legacy)) {
                        entry.legacyKeys.push(legacy);
                    }
                }

            }

        }
    }

    /* The kinds of channel in the page's own order, so Social Media
       reads before Website however the Channels table was filled
       in. The stages keep the journey's order they were built in. */
    for (const entry of found) {
        entry.groups.sort(
            (left, right) =>
                categoryOrder(left.category) - categoryOrder(right.category)
        );
    }

    return found;

}

/**
 * What one Page 1 Profile's relationships were, when they were
 * kept per Profile.
 *
 * Read only to be migrated: the relationship is kept ABOUT AN
 * OFFERING now, once, and the Profiles an Offering serves are read
 * off Page 1 and listed under it. Three Profiles buying the same
 * Offering are not three relationships with it -- see
 * BusinessOfferingRelationshipEntryValue.
 */
export interface BusinessProfileRelationshipsValue {
    /** The Page 1 Profile this belonged to. */
    profileId: string;
    /** By Offering id. */
    offerings: Record<string, BusinessOfferingRelationshipsValue>;
}

/** What is kept about ONE Offering, whoever it is sold to. */
export interface BusinessOfferingRelationshipEntryValue
    extends BusinessOfferingRelationshipsValue {
    /** The Page 1 Offering this belongs to. */
    offeringId: string;
}

/** One Page 1 Segment's answers to this page. */
export interface BusinessSegmentEngagementValue {
    /** The Page 1 Segment this belongs to. */
    segmentId: string;
    channels: BusinessChannelValue[];
    /** The Segment's channel actions, each held once (see BusinessChannelActionValue). */
    actions: BusinessChannelActionValue[];
    /**
     * By Offering, which is the order the table reads: Offering,
     * the Profiles it is sold to, then the relationship kept about
     * it.
     */
    offerings: BusinessOfferingRelationshipEntryValue[];
    /**
     * The same answers as they were kept before, by Profile. Never
     * written to; read once so nothing recorded then is lost (see
     * asBusinessSegmentEngagement).
     */
    profiles: BusinessProfileRelationshipsValue[];
}

/**
 * The whole page. Segments are held by id and never created here:
 * an entry exists only once something has been answered against
 * that Segment, and a Segment deleted on Page 1 simply stops being
 * drawn.
 */
/**
 * A CHANNEL'S RESOURCE (ChannelResources.ts): something a Customer
 * Channel needs, kept as a Resource card on 3. Infrastructure &
 * Capability (made in Offering's Capability › Resources, or earlier in
 * Infrastructure) -- where its Quantity, Price, Frequency and Description
 * are entered -- and linked here by that card's id. Its name is the
 * card's (one name). The channel's actions it serves are linked by id.
 * The card is made blank (no Offerings, no Status): the user fills it in
 * on page 3. Only a link: its cost is counted once, where it is recorded.
 */
export interface BusinessChannelResourceValue {
    id: string;
    /** The Page 1 Segment the channel is under. */
    segmentId: string;
    /** The channel's id. */
    channelId: string;
    /** The card on 3. Infrastructure & Capability (a resource, or a partner or the Workspace linked before). */
    resourceId: string;
    /** The Segment's channel actions it serves (BusinessChannelActionValue ids). */
    actionIds: string[];
    /** The card was already the company's and was linked ("Link existing"): taking it off the channel keeps it. */
    existing?: boolean;
}

export interface BusinessEngagementValue {
    segments: BusinessSegmentEngagementValue[];
    /** The channels' resources (see BusinessChannelResourceValue). */
    channelResources: BusinessChannelResourceValue[];
    /**
     * Demand & Conversion, by Offering id: how each Offering's
     * customers come, and so its expected sales (see DemandCapacity.ts).
     * Optional: an Offering without one has its sales entered on
     * Sustainability.
     */
    demand: Record<string, DemandValue>;
}

export function createBusinessChannel(): BusinessChannelValue {
    return {
        id: randomId("channel"),
        category: "",
        name: "",
        links: [""],
        // A channel always carries Offerings; a new one carries them all.
        offerings: [BUSINESS_CHANNEL_ALL_OFFERINGS],
        stages: [],
        actionIds: {},
        actions: {}
    };
}

export function createBusinessRelationshipInteraction(): BusinessRelationshipInteractionValue {
    return { approach: "", goals: [] };
}

export function createBusinessRelationshipType(): BusinessRelationshipTypeValue {
    return { purpose: "", interactions: {} };
}

/**
 * A Segment's empty answer to this page.
 *
 * Its first channel's id is DERIVED FROM THE SEGMENT rather than
 * drawn at random, because this is called during rendering: a
 * Segment that has not been answered yet has no stored entry, so
 * the editor builds one to draw. A random id there would be a new
 * id on every keystroke -- a card React treats as a different card
 * each time, losing the caret out of whatever was being typed into.
 *
 * One channel from the start, for the reason Page 1 starts with one
 * of everything: a section showing nothing but an Add button reads
 * as missing rather than as empty.
 */
export function createBusinessSegmentEngagement(
    segmentId: string
): BusinessSegmentEngagementValue {
    return {
        segmentId,
        channels: [{ ...createBusinessChannel(), id: segmentId + "-channel" }],
        actions: [],
        offerings: [],
        profiles: []
    };
}

export function createBusinessOfferingRelationships(): BusinessOfferingRelationshipsValue {
    return { types: [], typeDetail: {} };
}

/**
 * Page 1's Segments AS RECORDED, for the pages that refer to them.
 *
 * asBusinessFoundationValue invents a Segment when it finds none,
 * because its editor must always have one card to draw. A page
 * referring to Page 1 must not: an invented Segment carries a
 * freshly drawn id, so it would be a DIFFERENT Segment on every
 * render -- and Page 2 keys its cards, its stored answers and its
 * channels off that id. Every keystroke would rebuild the card
 * being typed into.
 *
 * Nothing recorded on Page 1 is an empty list here, which is what
 * Page 2 draws its own "define a Segment first" note from.
 */
export function businessFoundationSegments(
    value: unknown
): BusinessCustomerSegmentValue[] {

    const source = asObject(value);

    const recorded = Array.isArray(source.segments) && source.segments.length > 0;

    return recorded ? asBusinessFoundationValue(value).segments : [];

}

/** A list of ids, keeping only the ones the page still offers. */
export function businessIdList(value: unknown, allowed?: ReadonlySet<string>): string[] {

    const list = (Array.isArray(value) ? value : [])
        .filter((entry): entry is string => typeof entry === "string");

    return allowed ? list.filter(entry => allowed.has(entry)) : list;

}

export const BUSINESS_JOURNEY_STAGE_IDS: ReadonlySet<string> =
    new Set(BUSINESS_JOURNEY_STAGES.map(stage => stage.id));

export const BUSINESS_RELATIONSHIP_TYPE_IDS: ReadonlySet<string> =
    new Set(BUSINESS_RELATIONSHIP_TYPES.map(type => type.id));

export const BUSINESS_RELATIONSHIP_GOAL_IDS: ReadonlySet<string> =
    new Set(BUSINESS_RELATIONSHIP_GOALS.map(goal => goal.id));

export function asBusinessChannel(entry: unknown): BusinessChannelValue {

    const channel = asObject(entry);

    // The texts as saved before actions were shared (read by
    // withSharedActions below, which turns them into actions).
    const actions: Record<string, string[]> = {};

    for (const [stage, list] of Object.entries(asObject(channel.actions))) {
        if (BUSINESS_JOURNEY_STAGE_IDS.has(stage)) {
            actions[stage] = businessNeedList(list);
        }
    }

    const actionIds: Record<string, string[]> = {};

    for (const [stage, list] of Object.entries(asObject(channel.actionIds))) {
        if (BUSINESS_JOURNEY_STAGE_IDS.has(stage) && Array.isArray(list)) {
            actionIds[stage] = list.map(asText).filter(id => id.length > 0);
        }
    }

    return {
        id: asText(channel.id) || randomId("channel"),
        /* Held as the LABEL, because a category can now be one the
           founder named themselves and there is no id for that.
           Anything saved as one of the seven ids becomes its label
           here, so an answer written before that and one written
           after group together instead of reading as two
           categories with the same name. */
        category: businessChannelCategoryLabel(
            asText(channel.category)
        ),
        name: asText(channel.name),
        links: businessNeedList(channel.links, 1),
        // A channel is never without Offerings: none saved (older data) reads as every Offering.
        offerings: businessIdList(channel.offerings).length > 0
            ? businessIdList(channel.offerings)
            : [BUSINESS_CHANNEL_ALL_OFFERINGS],
        stages: businessIdList(channel.stages, BUSINESS_JOURNEY_STAGE_IDS),
        // Marks a channel saved with shared actions (see withSharedActions).
        // (An empty one beside texts is a channel made new and given texts: read as saved before.)
        actionIds: channel.actionIds !== undefined && (Object.keys(actionIds).length > 0 || Object.keys(actions).length === 0)
            ? actionIds
            : (null as unknown as Record<string, string[]>),
        actions
    };

}

/**
 * A Segment's channels with their actions SHARED: each row's actions
 * as references to the Segment's own list, and the texts worked out
 * from them.
 *
 * A channel saved before actions were shared holds its texts: each
 * becomes an action of its own, one reference each -- never merged
 * with another of the same words, which may mean something else in
 * its row -- under an id made from where it was (channel, stage,
 * place), so reading the same answer twice gives the same ids. An
 * action no row holds any more is gone.
 */
export function withSharedActions(
    channels: BusinessChannelValue[],
    stored: unknown
): { channels: BusinessChannelValue[]; actions: BusinessChannelActionValue[] } {

    const texts = new Map<string, string>();

    for (const entry of Array.isArray(stored) ? stored : []) {
        const action = asObject(entry);
        const id = asText(action.id);
        if (id) {
            texts.set(id, asText(action.text));
        }
    }

    const shared = channels.map(channel => {
        let actionIds: Record<string, string[]>;
        if (channel.actionIds) {
            actionIds = Object.fromEntries(Object.entries(channel.actionIds)
                .map(([stage, ids]) => [stage, ids.filter(id => texts.has(id))]));
        } else {
            actionIds = {};
            for (const [stage, list] of Object.entries(channel.actions)) {
                actionIds[stage] = list.flatMap((text, index) => {
                    if (!text.trim()) {
                        return [];
                    }
                    const id = "action-" + channel.id + "-" + stage + "-" + (index + 1);
                    texts.set(id, text);
                    return [id];
                });
            }
        }
        const actions = Object.fromEntries(Object.entries(actionIds)
            .map(([stage, ids]) => [stage, ids.map(id => texts.get(id) ?? "")]));
        return { ...channel, actionIds, actions };
    });

    const held = new Set(shared.flatMap(channel => Object.values(channel.actionIds).flat()));

    return {
        channels: shared,
        actions: [...texts.entries()].filter(([id]) => held.has(id)).map(([id, text]) => ({ id, text }))
    };

}

export function asBusinessRelationshipInteraction(
    entry: unknown
): BusinessRelationshipInteractionValue {

    const interaction = asObject(entry);

    return {
        approach: asText(interaction.approach),
        goals: businessIdList(interaction.goals, BUSINESS_RELATIONSHIP_GOAL_IDS)
    };

}

export function asBusinessRelationshipType(entry: unknown): BusinessRelationshipTypeValue {

    const type = asObject(entry);

    const interactions: Record<string, BusinessRelationshipInteractionValue> = {};

    for (const [key, detail] of Object.entries(asObject(type.interactions))) {
        interactions[key] = asBusinessRelationshipInteraction(detail);
    }

    /*
        The shape this replaced: Offerings and stages were chosen by
        hand and stored, with each stage's answers under
        offeringDetail -> stageDetail. Which interactions exist is
        read off the Channels table now, but WHAT WAS WRITTEN UNDER
        THEM IS NOT THROWN AWAY -- each old answer is re-filed under
        the key its Offering, stage and channel make, which is where
        the same interaction now looks for it.
    */
    for (const [offeringId, offering] of Object.entries(
        asObject(type.offeringDetail)
    )) {
        for (const [stageId, stage] of Object.entries(
            asObject(asObject(offering).stageDetail)
        )) {

            const detail = asObject(stage);

            /* Filed under the Offering and the stage, which is
               where the interaction looks. The channel it named is
               dropped rather than kept in the key: a stage has one
               Approach now, however many ways it happens. */
            const key = businessInteractionKey(offeringId, stageId);

            if (!(key in interactions)) {
                interactions[key] = asBusinessRelationshipInteraction(detail);
            }

        }
    }

    return {
        purpose: asText(type.purpose),
        interactions
    };

}

/**
 * The stored answer in the shape the editor expects, whatever was
 * actually saved.
 *
 * Unlike Page 1 this creates nothing when it finds nothing: the
 * page has no Segments of its own to invent, and which Segments
 * exist is Page 1's answer rather than this one's. An empty page is
 * an empty list here, and the editor draws it from the Foundation.
 */
export function asBusinessEngagementValue(value: unknown): BusinessEngagementValue {

    const source = asObject(value);

    const segments = (Array.isArray(source.segments) ? source.segments : [])
        .map(entry => {

            const segment = asObject(entry);

            const profiles = (Array.isArray(segment.profiles) ? segment.profiles : [])
                .map(candidate => {

                    const profile = asObject(candidate);

                    const offerings: Record<
                        string, BusinessOfferingRelationshipsValue
                    > = {};

                    for (const [offeringId, detail] of Object.entries(
                        asObject(profile.offerings)
                    )) {

                        const entryValue = asObject(detail);

                        const typeDetail: Record<
                            string, BusinessRelationshipTypeValue
                        > = {};

                        for (const [type, typeValue] of Object.entries(
                            asObject(entryValue.typeDetail)
                        )) {
                            if (BUSINESS_RELATIONSHIP_TYPE_IDS.has(type)) {
                                typeDetail[type] = asBusinessRelationshipType(typeValue);
                            }
                        }

                        offerings[offeringId] = {
                            types: businessIdList(
                                entryValue.types, BUSINESS_RELATIONSHIP_TYPE_IDS
                            ),
                            typeDetail
                        };

                    }

                    /*
                        The shape this replaced: the relationship
                        types were chosen once per PROFILE, with every
                        Offering's interactions filed under them. They
                        are chosen per Offering now -- the same person
                        may buy a product on their own and be walked
                        through a service.

                        NOTHING WRITTEN IS THROWN AWAY. Every stored
                        interaction already names its Offering in its
                        own key, so each one is re-filed under that
                        Offering, carrying the type it was under and
                        that type's Purpose with it. A type chosen
                        with nothing ever written under it names no
                        Offering and has nothing to carry, so it does
                        not survive -- there is nothing in it to lose.
                    */
                    for (const [type, typeValue] of Object.entries(
                        asObject(profile.typeDetail)
                    )) {

                        if (!BUSINESS_RELATIONSHIP_TYPE_IDS.has(type)) {
                            continue;
                        }

                        const old = asBusinessRelationshipType(typeValue);

                        for (const [key, interaction] of Object.entries(old.interactions)) {

                            const offeringId = key.split("|")[0];

                            if (offeringId.length === 0) {
                                continue;
                            }

                            const target = offerings[offeringId] ??
                                createBusinessOfferingRelationships();

                            if (!target.types.includes(type)) {
                                target.types = [...target.types, type];
                            }

                            const existing = target.typeDetail[type] ??
                                createBusinessRelationshipType();

                            target.typeDetail[type] = {
                                purpose: existing.purpose || old.purpose,
                                interactions: {
                                    ...existing.interactions,
                                    [key]: existing.interactions[key] ?? interaction
                                }
                            };

                            offerings[offeringId] = target;

                        }

                    }

                    return {
                        profileId: asText(profile.profileId),
                        offerings
                    };

                })
                .filter(profile => profile.profileId.length > 0);

            /*
                THE RELATIONSHIP IS KEPT ABOUT AN OFFERING, ONCE.

                It used to be kept per Profile, about an Offering --
                so three Profiles buying the same Offering each held
                their own Relationship Types, Purposes and Approaches
                for it. The page reads Offering first now, with the
                Profiles it is sold to listed under it, and one
                answer stands for all of them.

                MERGED RATHER THAN PICKED. Every Profile's entry for
                an Offering is folded into that Offering's own, field
                by field, and the FIRST thing written wins each
                field: the union of the types, the first Purpose
                given for each, and the first Approach and Goals
                given for each interaction. Nothing is thrown away
                except where two Profiles answered the SAME field
                about the same Offering differently, where one of the
                two has to go.
            */
            const merged: BusinessOfferingRelationshipEntryValue[] = [];

            const storedOfferings = Array.isArray(segment.offerings)
                ? segment.offerings
                : [];

            for (const candidate of storedOfferings) {

                const entry = asObject(candidate);
                const offeringId = asText(entry.offeringId);

                if (offeringId.length === 0) {
                    continue;
                }

                const typeDetail: Record<string, BusinessRelationshipTypeValue> = {};

                for (const [type, typeValue] of Object.entries(
                    asObject(entry.typeDetail)
                )) {
                    if (BUSINESS_RELATIONSHIP_TYPE_IDS.has(type)) {
                        typeDetail[type] = asBusinessRelationshipType(typeValue);
                    }
                }

                merged.push({
                    offeringId,
                    types: businessIdList(entry.types, BUSINESS_RELATIONSHIP_TYPE_IDS),
                    typeDetail
                });

            }

            for (const profile of profiles) {
                for (const [offeringId, kept] of Object.entries(profile.offerings)) {

                    let target = merged.find(
                        entry => entry.offeringId === offeringId
                    );

                    if (!target) {
                        target = {
                            offeringId,
                            ...createBusinessOfferingRelationships()
                        };
                        merged.push(target);
                    }

                    for (const type of kept.types) {
                        if (!target.types.includes(type)) {
                            target.types.push(type);
                        }
                    }

                    for (const [type, detail] of Object.entries(kept.typeDetail)) {

                        const existing = target.typeDetail[type] ??
                            createBusinessRelationshipType();

                        const interactions = { ...existing.interactions };

                        for (const [key, written] of Object.entries(detail.interactions)) {

                            const already = interactions[key];

                            interactions[key] = {
                                approach: already?.approach || written.approach,
                                goals: already?.goals.length
                                    ? already.goals
                                    : written.goals
                            };

                        }

                        target.typeDetail[type] = {
                            purpose: existing.purpose || detail.purpose,
                            interactions
                        };

                    }

                }
            }

            const { channels, actions } = withSharedActions(
                (Array.isArray(segment.channels) ? segment.channels : []).map(asBusinessChannel),
                segment.actions
            );

            return {
                segmentId: asText(segment.segmentId),
                channels,
                actions,
                offerings: merged,
                profiles
            };

        })
        .filter(segment => segment.segmentId.length > 0);

    const channelResources: BusinessChannelResourceValue[] = (Array.isArray(source.channelResources) ? source.channelResources : [])
        .map(entry => {
            const link = asObject(entry);
            return {
                id: asText(link.id) || randomId("channel-resource"),
                segmentId: asText(link.segmentId),
                channelId: asText(link.channelId),
                resourceId: asText(link.resourceId),
                actionIds: (Array.isArray(link.actionIds) ? link.actionIds : []).map(asText).filter(Boolean),
                ...(link.existing === true ? { existing: true } : {})
            };
        })
        .filter(link => link.segmentId && link.channelId && link.resourceId);

    /* COST LINKS SAVED BEFORE (a channel, or its category's row, linked
       to a cost card): each is a resource of its channel now, pointing
       at the SAME card -- nothing is made. A category's link goes to
       its first channel; one whose category has no channel is dropped.
       A resource is made on one channel: a card linked to several is
       the first one's, and serves the others through shared actions.
       Its id is kept, so reading it twice gives the same resource. */
    for (const entry of Array.isArray(source.channelCosts) ? source.channelCosts : []) {
        const link = asObject(entry);
        const segmentId = asText(link.segmentId);
        const key = asText(link.channelKey);
        const costId = asText(link.costId);
        const segment = segments.find(candidate => candidate.segmentId === segmentId);
        if (!segment || !key || !costId) {
            continue;
        }
        const channelId = key.startsWith("category:")
            ? segment.channels.find(channel => channel.category === key.slice("category:".length))?.id
            : segment.channels.find(channel => channel.id === key)?.id;
        if (!channelId || channelResources.some(existing => existing.resourceId === costId)) {
            continue;
        }
        channelResources.push({ id: asText(link.id) || "channel-resource-" + channelId + "-" + costId, segmentId, channelId, resourceId: costId, actionIds: [], existing: true });
    }

    return { segments, demand: asDemandMap(source.demand), channelResources };

}

/**
 * Which of this page's two sections are still empty, in page order,
 * so the completeness dialog can name the section.
 *
 * What counts as answered:
 *
 * 1. A named channel, under any Segment. The category alone is a
 *    container; the specific channel is the answer.
 * 2. A Relationship Type chosen for some Offering, with the Purpose
 *    that says why it is maintained. The type on its own is a
 *    selection; the Purpose is what the section asks for.
 */
export function businessEngagementSectionsEmpty(value: unknown): boolean[] {

    const engagement = asBusinessEngagementValue(value);

    const channelsEmpty = !engagement.segments.some(
        segment => segment.channels.some(
            channel => channel.name.trim().length > 0
        )
    );

    const relationshipsEmpty = !engagement.segments.some(
        segment => segment.offerings.some(
            offering => offering.types.some(
                type => (offering.typeDetail[type]?.purpose ?? "").trim().length > 0
            )
        )
    );

    return [channelsEmpty, relationshipsEmpty];

}

/**
 * The two section titles, in page order, for the same dialog.
 *
 * Singular, as Page 1's four are and as this page's own headings
 * read them: each names the kind of thing being answered.
 */
export const BUSINESS_ENGAGEMENT_SECTIONS = [
    "Customer Channel",
    "Customer Relationship"
] as const;
