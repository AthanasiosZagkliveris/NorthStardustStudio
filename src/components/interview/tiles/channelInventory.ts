import { usesSupplier, type BusinessCapabilityValue, type BusinessEngagementValue } from "../../../framework/engine/AnswerUtils.ts";
import { buildChannelResourceTable } from "../../../framework/engine/ChannelResourceTable.ts";
import type { CostCard } from "../../../framework/engine/ChannelResources.ts";
import type { FloorChannel } from "./capabilityFloor.ts";

/**
 * THE CARDS OF THE CUSTOMER CHANNELS, as the Inventory and Infrastructure & Capability draw them:
 * - `cardIds`: the cards a Customer Channel made ("+ Add expenses" on a channel, ChannelResources.ts), their own tile and colour;
 * - `toneIds`: the cards in the channel's colour -- those, and the Partner or Supplier a held card is connected to (it keeps its own Category);
 * - `names`: the channels each card is under, by name ("Social Media › Instagram"), the connected Partner or Supplier's too.
 */
export function channelCards(engagement: BusinessEngagementValue, capability: BusinessCapabilityValue) {
    const cardIds: ReadonlySet<string> = new Set(engagement.channelResources.map(link => link.resourceId));
    const slots = [...Object.values(capability.resources).flat().flatMap(entry => entry.slots), ...capability.offering.resources];
    const toneIds = new Set<string>(cardIds);
    slots.filter(slot => cardIds.has(slot.id) && usesSupplier(slot.status) && slot.providerId).forEach(slot => toneIds.add(slot.providerId));
    const names = new Map<string, string[]>();
    const add = (id: string, name: string) => names.set(id, [...new Set([...(names.get(id) ?? []), name])]);
    engagement.channelResources.forEach(link => {
        const channel = engagement.segments.find(entry => entry.segmentId === link.segmentId)?.channels.find(entry => entry.id === link.channelId);
        if (channel) {
            add(link.resourceId, [channel.category, channel.name.trim() || "Unnamed channel"].filter(Boolean).join(" › "));
        }
    });
    slots.forEach(slot => {
        if (usesSupplier(slot.status) && slot.providerId) {
            (names.get(slot.id) ?? []).forEach(name => add(slot.providerId, name));
        }
    });
    return { cardIds, toneIds: toneIds as ReadonlySet<string>, names: names as ReadonlyMap<string, readonly string[]> };
}

/**
 * THE CHANNEL EXPENSES' FACTS FOR THE INVENTORY (owner, 2026-11-12 18:41: "the Channel costs could fit well in the inventory"): for each card a Customer Channel
 * holds, what the channels' table records of it (ChannelResourceTable.ts, the one owner): the channels and subchannels it is in, the Offerings it holds, the
 * journey stages and actions that use it, its colour. A card several Segments use gathers them all. `segmentIds` narrows it to those Segments (Customer
 * Engagement's Channel Costs tile: its own Segment).
 */
export function channelFacts(
    engagement: BusinessEngagementValue,
    cards: readonly CostCard[],
    currency: string,
    offerings: readonly { id: string; name: string }[],
    segmentIds?: readonly string[]
): Map<string, FloorChannel> {
    const facts = new Map<string, FloorChannel>();
    const unique = <T,>(list: readonly T[], key: (entry: T) => string) => list.filter((entry, at) => list.findIndex(other => key(other) === key(entry)) === at);
    engagement.segments
        .filter(segment => !segmentIds || segmentIds.includes(segment.segmentId))
        .forEach(segment => buildChannelResourceTable(engagement, segment, cards, currency, offerings).rows.forEach(row => {
            const had = facts.get(row.resourceId);
            facts.set(row.resourceId, {
                places: unique([...(had?.places ?? []), ...row.placesOf], place => place.channel + "\u0001" + place.sub),
                offerings: [...new Set([...(had?.offerings ?? []), ...row.offerings])],
                stages: [...new Set([...(had?.stages ?? []), ...row.stages])],
                actions: unique([...(had?.actions ?? []), ...row.actions.map(action => ({ ...action, segmentId: segment.segmentId }))], action => action.id),
                colour: had?.colour ?? row.colour,
                linkIds: [...new Set([...(had?.linkIds ?? []), ...row.linkIds])],
                behaviour: had?.behaviour || row.behaviour
            });
        }));
    return facts;
}
