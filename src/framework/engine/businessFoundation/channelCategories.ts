/**
 * Split out of engagementPage.ts (2026-11-11, the folder report's item 6); that file re-exports what is exported here.
 */


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
