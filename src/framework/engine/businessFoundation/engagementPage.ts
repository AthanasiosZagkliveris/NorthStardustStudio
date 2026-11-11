/* Part of AnswerBusinessFoundation.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; AnswerBusinessFoundation.ts re-exports every part). */

import { asObject, randomId } from "../Readers.ts";
import { asBusinessFoundationValue, functionalNeedIds, type BusinessCustomerProfileValue, type BusinessCustomerSegmentValue, type BusinessOfferingValue } from "./foundationPage.ts";
import { BUSINESS_CHANNEL_CATEGORIES } from "./channelCategories.ts";
import { BUSINESS_CHANNEL_ALL_OFFERINGS, BUSINESS_JOURNEY_STAGES, type BusinessChannelValue, type BusinessRelationshipInteractionValue, businessInteractionKey, type BusinessSegmentEngagementValue } from "./engagementReaders.ts";
export { businessEngagementSectionsEmpty, asBusinessEngagementValue, type BusinessChannelResourceValue, asBusinessChannel, BUSINESS_CHANNEL_ALL_OFFERINGS, businessIdList, BUSINESS_JOURNEY_STAGE_IDS, BUSINESS_JOURNEY_STAGES, type BusinessChannelValue, withSharedActions, type BusinessChannelActionValue, type BusinessOfferingRelationshipEntryValue, type BusinessOfferingRelationshipsValue, type BusinessRelationshipTypeValue, type BusinessRelationshipInteractionValue, createBusinessRelationshipType, createBusinessOfferingRelationships, asBusinessRelationshipType, businessInteractionKey, asBusinessRelationshipInteraction, BUSINESS_RELATIONSHIP_GOAL_IDS, BUSINESS_RELATIONSHIP_GOALS, BUSINESS_RELATIONSHIP_TYPE_IDS, BUSINESS_RELATIONSHIP_TYPES, type BusinessEngagementValue, type BusinessSegmentEngagementValue, type BusinessProfileRelationshipsValue } from "./engagementReaders.ts";
export { BUSINESS_CHANNEL_OTHER, businessChannelCategoryLabel, BUSINESS_CHANNEL_CATEGORIES, ALL_STAGES, businessChannelNamePlaceholder, channelOptionHelp, chosenFirst, type ChannelHelpPoint, channelCategoryHelp, channelCategoryHidden, PHYSICAL_CHANNEL_CATEGORY_IDS } from "./channelCategories.ts";

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
