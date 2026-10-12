import { parseDecimal } from "./Amounts.ts";
import {
    BUSINESS_JOURNEY_STAGES,
    type BusinessEngagementValue,
    type BusinessSegmentEngagementValue
} from "./AnswerUtils.ts";
import { actionPlacements, orderIn, resourceColours } from "./ActionOrder.ts";
import {
    type CostCard,
    channelResourceLinks,
    costCardAmount,
    costCardName,
    costPeriodWords,
    resourceReach
} from "./ChannelResources.ts";
import { type CostFrequency, isPerUnitFrequency, moneyFormatter, monthlyEquivalent } from "./FinancialModel.ts";

/*
    THE CHANNEL RESOURCES TABLE: a Segment's resources, as one read-only
    table under its Customer Channel table.

    Auto-generated, every time, from the channels' resource links
    (engagement.channelResources) and the Resource cards on 3.
    Infrastructure & Capability they point at. Nothing is stored and
    nothing is counted: a resource's cost is still counted once, from its
    card, by the Financial Foundation and the Forecast. The footer only
    adds up the rows as they are shown -- a summary of them, not a forecast.

    One row per distinct card (a card linked from two channels is one row;
    the other channels its actions reach are listed under its home channel),
    in the order of the channel table: its categories, the channels in
    them, each channel's resources. A resource is Fixed or Variable by its
    frequency, as the Financial Foundation reads it: a cost per unit, order
    or project varies with activity, one-time / monthly / annual does not;
    a resource with no cost counted (not on Costs, no price, or another
    frequency) has none.
*/

export interface ChannelResourceAction {
    id: string;
    /** "#12": its total action order number in the Customer Channel table. */
    order: number;
    text: string;
}

export interface ChannelResourceRow {
    /** The card's id (a row's key). */
    resourceId: string;
    /** The ids of the links that make it a resource of this Segment's channels (for lighting its actions). */
    linkIds: string[];
    name: string;
    /** Its place in the warm resource palette (ActionOrder.ts: hue, then pattern). */
    colour: number;
    /** The card, for opening it on 3. Infrastructure & Capability. */
    anchors: string[];
    /** "Offering's Capability → Resources". */
    place: string;
    /** "£25 a month", "£1.40 per order"; "No cost yet" (or "Free" for a resource that already exists). */
    costText: string;
    /** The cost as a plain figure ("25", "1.40"), its currency being the table's heading; "Free" / "No cost yet" where there is no price. */
    amountText: string;
    /** How often it is paid: "a month", "per order", "one-time"; "" where there is no price. */
    frequencyText: string;
    /** "2 × £25" when a Quantity multiplies the price, else "". */
    costDetail: string;
    behaviour: "Fixed" | "Variable" | "";
    /** "Social Media · Instagram": the channel it was made on. */
    home: string;
    /** The other channels its actions reach (their names with category), in table order: listed under the home channel, in its cell. */
    reaches: string[];
    /** The home channel and the others it reaches, each as its channel (the category) and its subchannel (the name), for the Channel column. */
    placesOf: { channel: string; sub: string }[];
    /** The journey stages of its actions, in the journey's order. */
    stages: string[];
    actions: ChannelResourceAction[];
    /** The Offerings the card holds: their names, as linked on the card -- never "All Offerings"; none for a card without the field (Infrastructure, Workspace) or with none linked. */
    offerings: string[];
}

export interface ChannelResourceSummary {
    /** Fixed costs of the rows per month (annual / 12); null with none. */
    fixedPerMonth: number | null;
    oneTime: number | null;
    /** Variable costs, by what they vary with ("per order"). */
    variable: { words: string; amount: number }[];
    /** Rows with a cost in another currency or another frequency, left out of the sums. */
    notSummed: number;
}

export interface ChannelResourceTable {
    rows: ChannelResourceRow[];
    summary: ChannelResourceSummary;
    /** "Fixed per month: £25 · Variable: £1.40 per order · One-time: £400"; "" with nothing priced. */
    summaryText: string;
    /** The currency of the Cost column's heading ("GBP"); "" while the organisation has none. */
    currency?: string;
}

const STAGE_LABELS = new Map<string, string>(BUSINESS_JOURNEY_STAGES.map(stage => [stage.id, stage.label]));
const STAGE_ORDER = BUSINESS_JOURNEY_STAGES.map(stage => stage.id as string);

/** "Social Media · Instagram", or just the name before a category is chosen. */
function channelLabel(category: string, name: string): string {
    return [category.trim(), name.trim() || "Unnamed channel"].filter(Boolean).join(" · ");
}

/** The cost a card counts here, with its currency matching the organisation's (or unset). */
function countedAmount(card: CostCard, currency: string): number | null {
    const amount = costCardAmount(card);
    return amount !== null && (!card.cost.currency || !currency || card.cost.currency === currency) ? amount : null;
}

/**
 * Every distinct channel resource of the Segment, as the table shows it,
 * and the summary of those rows.
 *
 * `offerings` are all the Offerings Page 1 has (to name the ones a card links).
 */
export function buildChannelResourceTable(
    engagement: BusinessEngagementValue,
    segment: BusinessSegmentEngagementValue,
    cards: readonly CostCard[],
    currency: string,
    offerings: readonly { id: string; name: string }[] = []
): ChannelResourceTable {

    const placements = actionPlacements(segment);
    const colours = resourceColours(engagement, segment.segmentId);

    // The channels in the table's order: its categories as they first appear, each with its channels
    // (a channel with no category yet is not drawn there, so its resources come last).
    const named: typeof segment.channels = [];
    const unnamed: typeof segment.channels = [];
    for (const channel of segment.channels) {
        (channel.category.trim().length > 0 ? named : unnamed).push(channel);
    }
    const categories = [...new Set(named.map(channel => channel.category))];
    const channels = [...categories.flatMap(category => named.filter(channel => channel.category === category)), ...unnamed];

    const channelNameById = new Map(segment.channels.map(channel => [channel.id, channelLabel(channel.category, channel.name)]));
    const textOf = (id: string) => segment.actions.find(action => action.id === id)?.text.trim() ?? "";
    const format = moneyFormatter(currency);

    const rows: ChannelResourceRow[] = [];
    const seen = new Set<string>();

    for (const channel of channels) {

        for (const { card } of channelResourceLinks(engagement, segment.segmentId, channel.id, cards)) {

            if (seen.has(card.id)) {
                continue;
            }
            seen.add(card.id);

            // Every link of the card within the Segment (a card made on one channel can be linked from another).
            const links = engagement.channelResources.filter(entry => entry.segmentId === segment.segmentId && entry.resourceId === card.id);
            const actionIds = [...new Set(links.flatMap(entry => entry.actionIds))];
            const placed = actionIds.flatMap(id => placements.filter(placement => placement.actionId === id));

            const reachedIds = [...new Set(links.flatMap(entry => resourceReach(engagement, entry)))].filter(id => id !== channel.id);
            const reaches = channels.filter(other => reachedIds.includes(other.id)).map(other => channelNameById.get(other.id) ?? "");
            const placesOf = [channel, ...channels.filter(other => reachedIds.includes(other.id))].map(entry => ({ channel: entry.category.trim(), sub: entry.name.trim() || "Unnamed subchannel" }));

            const stages = [...new Set(placed.map(placement => placement.stage))]
                .sort((one, other) => STAGE_ORDER.indexOf(one) - STAGE_ORDER.indexOf(other))
                .map(stage => STAGE_LABELS.get(stage) ?? stage);

            const actions = actionIds
                .flatMap(id => {
                    const order = orderIn(placements, id, channel.id);
                    return order === undefined ? [] : [{ id, order, text: textOf(id) }];
                })
                .sort((one, other) => one.order - other.order);

            const amount = countedAmount(card, currency);
            const count = parseDecimal(card.quantity);
            const costDetail = amount !== null && card.cost.price.trim() && count !== null && count > 1 && !isPerUnitFrequency(card.cost.frequency as CostFrequency)
                ? count + " × " + format(Math.round(amount / count * 100) / 100)
                : "";
            const period = costPeriodWords(card.cost);
            const isPercent = card.cost.frequency === "percent-revenue" || card.cost.frequency === "percent-cost";

            // Only what the card holds: the names of its linked Offerings (an Infrastructure or Workspace card has no Offerings field).
            const offeringNames = card.scope === "infrastructure"
                ? []
                : card.offeringIds.flatMap(id => offerings.filter(offering => offering.id === id).map(offering => offering.name.trim() || "Unnamed Offering"));

            rows.push({
                resourceId: card.id,
                linkIds: links.map(entry => entry.id),
                name: costCardName(card),
                colour: colours.get(card.id) ?? 0,
                anchors: card.anchors,
                place: card.place,
                costText: amount !== null
                    ? [format(amount), period].filter(Boolean).join(" ")
                    : card.status === "exists" ? "Free" : "No cost yet",
                amountText: amount !== null ? format(amount).replace(/^[^0-9-]+/, "").replace(/[^0-9.,-]+$/, "") : card.status === "exists" ? "Free" : "No cost yet",
                // (A percentage says its symbol here: "% of revenue".)
                frequencyText: amount !== null ? (isPercent ? "% " : "") + period : "",
                costDetail,
                behaviour: amount === null
                    ? ""
                    : isPercent || isPerUnitFrequency(card.cost.frequency as CostFrequency)
                        ? "Variable"
                        : ["one-time", "monthly", "annually"].includes(card.cost.frequency) ? "Fixed" : "",
                home: channelLabel(channel.category, channel.name),
                reaches,
                placesOf,
                stages,
                actions,
                offerings: offeringNames
            });

        }

    }

    // The summary adds up the rows as drawn, each card once.
    let fixed = 0;
    let hasFixed = false;
    let oneTime = 0;
    let hasOneTime = false;
    const variable = new Map<string, number>();
    let notSummed = 0;

    for (const row of rows) {
        const card = cards.find(entry => entry.id === row.resourceId);
        const amount = card ? countedAmount(card, currency) : null;
        if (!card || amount === null) {
            if (card && costCardAmount(card) !== null) {
                notSummed++;
            }
            continue;
        }
        const frequency = card.cost.frequency as CostFrequency;
        if (row.behaviour === "Variable") {
            variable.set(costPeriodWords(card.cost), (variable.get(costPeriodWords(card.cost)) ?? 0) + amount);
        } else if (frequency === "one-time") {
            oneTime += amount;
            hasOneTime = true;
        } else if (frequency === "monthly" || frequency === "annually") {
            fixed += monthlyEquivalent(amount, frequency);
            hasFixed = true;
        } else {
            notSummed++;
        }
    }

    const round = (value: number) => Math.round(value * 100) / 100;
    const order = ["per unit", "per order", "per project"];
    const summary: ChannelResourceSummary = {
        fixedPerMonth: hasFixed ? round(fixed) : null,
        oneTime: hasOneTime ? round(oneTime) : null,
        variable: [...variable.entries()]
            .sort(([one], [other]) => order.indexOf(one) - order.indexOf(other))
            .map(([words, amount]) => ({ words, amount: round(amount) })),
        notSummed
    };

    const parts: string[] = [];
    if (summary.fixedPerMonth !== null) {
        parts.push("Fixed per month: " + format(summary.fixedPerMonth));
    }
    if (summary.variable.length > 0) {
        parts.push("Variable: " + summary.variable.map(entry => format(entry.amount) + " " + entry.words).join(", "));
    }
    if (summary.oneTime !== null) {
        parts.push("One-time: " + format(summary.oneTime));
    }

    return { rows, summary, summaryText: parts.join(" · "), currency };

}
