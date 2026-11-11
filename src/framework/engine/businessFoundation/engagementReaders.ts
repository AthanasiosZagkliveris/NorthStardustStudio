/**
 * Split out of engagementPage.ts (2026-11-11, the folder report's item 6); that file re-exports what is exported here.
 */
import { asObject, asText, randomId } from "../Readers.ts";
import { type DemandValue, asDemandMap } from "../DemandCapacity.ts";
import { businessNeedList } from "./foundationPage.ts";
import { businessChannelCategoryLabel } from "./channelCategories.ts";

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

export function createBusinessRelationshipType(): BusinessRelationshipTypeValue {
    return { purpose: "", interactions: {} };
}

export function createBusinessOfferingRelationships(): BusinessOfferingRelationshipsValue {
    return { types: [], typeDetail: {} };
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
