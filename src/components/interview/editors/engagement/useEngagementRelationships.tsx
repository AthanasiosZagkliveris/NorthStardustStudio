/**
 * THE CHANNEL TILES and the relationships of each Offering.
 * One part of BusinessEngagementEditor (see BusinessEngagementEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import { draftAdds, withDraft } from "../../../../framework/engine/CompetitorQuestions.ts";
import { CSSProperties, useContext, useEffect, useState } from "react";
import { InitialBoxContext } from "../../tiles/DialogLevels.tsx";

/** A link on the Channels & Journey master tile that names a stage's tile: the dialog it opens shows the tiles by Journey Stages, so that tile is there to open. */
function StageViewFromLink({ prefix, onStages }: { prefix: string; onStages: () => void }) {
    const box = useContext(InitialBoxContext);
    useEffect(() => {
        if (box?.startsWith(prefix)) {
            onStages();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [box]);
    return null;
}
import CardShell from "../../cards/CardShell.tsx";
import RadioChoice from "../../../controls/RadioChoice.tsx";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import TextLink from "../../fields/TextLink.tsx";
import { Values } from "../ChannelResourceTable.tsx";
import { MarkIcon } from "../ActionMarkers.tsx";
import { actionPlacements, orderIn } from "../../../../framework/engine/ActionOrder.ts";
import { actionResourceLinks, costCardAmountText, costCardName } from "../../../../framework/engine/ChannelResources.ts";
import { TABLE_SIZES } from "../../tiles/CapabilityOverview.tsx";
import { BUSINESS_CHANNEL_ALL_OFFERINGS, BUSINESS_CHANNEL_CATEGORIES, BUSINESS_CHANNEL_OTHER, BUSINESS_RELATIONSHIP_TYPES, relationshipTypeLabel, BusinessChannelValue, BusinessCustomerSegmentValue, channelCategoryHelp, channelCategoryHidden, businessProfileOfferings, businessRelationshipInteractions, createBusinessChannel, segmentHue } from "../../../../framework/engine/AnswerUtils.ts";
import { BusinessEmpty, BusinessNote, BusinessRemove, BusinessStep, BusinessTicks } from "../../cards/BusinessCardFields.tsx";
import FieldRow from "../../fields/FieldRow.tsx";
import { SingleColumn } from "../foundation/shared.tsx";
import { EngagementBox, EngagementBoxes, EngagementCard } from "./EngagementCard.tsx";
import { autoRelationshipTypes, channelKey, journeySuggestions, startGoals, suggestionCovered, type ChannelSuggestion } from "../../../../framework/engine/JourneySuggestions.ts";
import { BUSINESS_JOURNEY_STAGES } from "../../../../framework/engine/AnswerUtils.ts";
import { summaryText } from "../../cards/cardSummary.ts";
import InfoNote, { InfoText } from "../../fields/InfoNote.tsx";
import StrategyTextArea from "../../fields/StrategyTextArea.tsx";
import SectionTiles, { DialogHeading, OPEN_EVENT, type OpenRequest, type SectionTile } from "../../tiles/SectionTiles.tsx";
import CardBoxes, { type CardBox } from "../../cards/CardBoxes.tsx";
import FoldArrow from "../../fields/FoldArrow.tsx";
import FoldList, { FoldListGroup, FoldListLine } from "../../fields/FoldList.tsx";
import { SECTIONS, GOAL_OPTIONS, STAGE_LABELS, relativeInformationFor, channelChoices } from "../BusinessEngagementModel.ts";

import type { useEngagementState } from "./useEngagementState.tsx";
import type { useEngagementChannelBoxes } from "./useEngagementChannelBoxes.tsx";
import { offeringAnswersById } from "../../../../framework/engine/EffectiveAnswers.ts";
import { supportPromise } from "../../../../framework/engine/OfferingQuestions.ts";
import { relationshipApproachDraft, relationshipPurposeDraft } from "../../../../framework/engine/RelationshipDrafts.ts";

type Earlier = ReturnType<typeof useEngagementState> & ReturnType<typeof useEngagementChannelBoxes>;

/** The line over the stages a channel is suggested for: they are stages, with no bullet, never drawn as if they were subchannels. */
const SUGGESTED_FOR = "Suggested for";

export function useEngagementRelationships(earlier: Earlier) {

    // (How each Segment's Channels & Journey dialog places its tiles: by channel, or by journey stage; by channel until changed, kept while the page is open.)
    const [channelViews, setChannelViews] = useState<Readonly<Record<string, "channels" | "stages">>>({});
    // (A stage's dialog in the Journey Stages view: its subchannels as a table, until Tiles is chosen; owner, 2026-11-12 19:54: "The default should be a table".)
    const [stageViews, setStageViews] = useState<Readonly<Record<string, "tiles" | "table">>>({});
    const { cards, currency, engagement, channelCategoryFoldKey, channelTileId, channelsFor, disabled, folds, noPhysical, foundationLink, identity, storedOfferingRelationshipsOf, interactionOf, offeringRelationshipsOf, segmentOf, typeOf, updateInteraction, updateOfferingRelationships, updateSegment, updateType } = earlier;

    /**
     * 1. CUSTOMER CHANNEL AS TILES: a tile for each channel (the group of subchannels under one category), listing its subchannels; pressing it opens that channel's
     * table in a dialog. A new channel is added under the tiles.
     */
    function channelTiles(segment: BusinessCustomerSegmentValue) {
        // (A stage named by the master tile's link: the stages' view; owner, 2026-11-14 11:15, the items of the master tiles are links.)
        const fromLink = <StageViewFromLink key="stage-link" prefix={channelTileId(segment.id, "stage-")} onStages={() => setChannelViews(current => ({ ...current, [segment.id]: "stages" }))} />;
        if (channelViews[segment.id] === "stages") {
            return <>{fromLink}{stageTiles(segment)}</>;
        }
        const answers = segmentOf(segment.id);
        const groups: { key: string; label: string; channels: BusinessChannelValue[] }[] = [];
        for (const channel of answers.channels) {
            const group = groups.find(entry => entry.label === channel.category);
            if (group) {
                group.channels.push(channel);
            } else {
                groups.push({ key: channel.id, label: channel.category, channels: [channel] });
            }
        }
        /* WHAT THE FOUNDATION SUGGESTS (JourneySuggestions.ts), shown in this one grid: on a channel's tile, its suggested subchannels as faded lines; on a
           channel not used yet, the faded tile lists them; in a channel's dialog, a suggested subchannel's faded tile says its stage and where it comes from.
           Each is added only when pressed, at its stage. */
        // (A subchannel the answers made is the Segment's own; one the founder removed is offered again with All only.)
        const dismissed = answers.dismissedChannels ?? [];
        /*
            THE WAY BACK (owner, 2026-11-16 16:36): with no "All", a channel the answers made and the founder removed comes back here -- at the foot of the dialog, the
            shared FoldList (folded at first) "Removed", each removed channel or subchannel with Restore, which takes it off the removed list so the answer makes it
            again. Only what the answers still make is listed; nothing shows while nothing is removed.
        */
        const removedOf = (category?: string) => journeySuggestions(segment, identity)
            .filter(suggestion => dismissed.includes(channelKey(suggestion.category, suggestion.name)) && (category === undefined || suggestion.category === category))
            .filter((suggestion, at, list) => list.findIndex(other => channelKey(other.category, other.name) === channelKey(suggestion.category, suggestion.name)) === at);
        const removedList = (category?: string) => {
            const removed = removedOf(category);
            if (removed.length === 0) {
                return null;
            }
            const foldKey = "removed:" + segment.id + ":" + (category ?? "all");
            return (
                <FoldList label="Removed" name={"Removed channels" + (category ? " of " + category : "")} count={removed.length} open={!folds.isOpen(foldKey)} onToggle={() => folds.toggle(foldKey)}>
                    {removed.map(suggestion => (
                        <FoldListLine key={channelKey(suggestion.category, suggestion.name)} wrap>
                            {(category ? "" : suggestion.category + (suggestion.name ? " › " : "")) + suggestion.name}{" "}
                            <TextLink type="button" disabled={disabled} onClick={() => updateSegment(segment.id, { dismissedChannels: dismissed.filter(key => key !== channelKey(suggestion.category, suggestion.name)) })}>Restore</TextLink>
                        </FoldListLine>
                    ))}
                </FoldList>
            );
        };
        const open = journeySuggestions(segment, identity).filter(suggestion => !suggestionCovered(suggestion, answers.channels)
            && !dismissed.includes(channelKey(suggestion.category, suggestion.name)));
        const suggestedIn = (category: string) => open.filter(suggestion => suggestion.category === category);
        const stageLabel = (stage: string) => BUSINESS_JOURNEY_STAGES.find(entry => entry.id === stage)?.label ?? stage;
        const said = (suggestion: ChannelSuggestion) => (suggestion.name || suggestion.category) + ": " + stageLabel(suggestion.stage) + ", from " + suggestion.source + ".";
        const suggestionNote = (category: string) => suggestedIn(category).length > 0 ? ["Suggested from your Foundation:", ...suggestedIn(category).map(said)] : [];
        // A subchannel of a channel (named, when it is one the category offers), at a stage where a suggestion gives one.
        const addSub = (category: string, name = "", stage = "") => {
            const channel = { ...createBusinessChannel(), category, name, ...(stage ? { stages: [stage] } : {}) };
            updateSegment(segment.id, { channels: [...answers.channels, channel] });
            return channel;
        };
        // (A channel the Foundation suggests starts as its first suggestion: its subchannel, at its stage.)
        const addChannel = (category: string) => {
            const first = suggestedIn(category)[0];
            const channel = { ...createBusinessChannel(), category, ...(first ? { name: first.name, stages: [first.stage] } : {}) };
            updateSegment(segment.id, { channels: [...answers.channels, channel] });
            folds.expand(channelCategoryFoldKey(segment.id, channel.id));
            return channel;
        };
        // (A channel not used yet lists its suggested subchannels, bulleted; then, where it is suggested alone, "Suggested for" and its stages, with no bullet.)
        const inactiveNames = (category: string) => [...new Set(suggestedIn(category).filter(suggestion => suggestion.name).map(suggestion => suggestion.name))];
        const inactiveStages = (category: string) => [...new Set(suggestedIn(category).filter(suggestion => !suggestion.name).map(suggestion => stageLabel(suggestion.stage)))];
        const inactiveLines = (category: string) => [...inactiveNames(category), ...(inactiveStages(category).length > 0 ? [SUGGESTED_FOR, ...inactiveStages(category)] : [])];
        const tiles: SectionTile[] = groups.map(group => {
            const names = group.channels.map(channel => channel.name.trim()).filter(name => name.length > 0);
            // (Its suggested subchannels follow its own, faded.)
            const extra = suggestedIn(group.label).filter(suggestion => suggestion.name !== "").map(suggestion => suggestion.name);
            // (The subchannels the category offers that this channel does not use yet: the faded tiles of its dialog.)
            const spareOf = (BUSINESS_CHANNEL_CATEGORIES.find(entry => entry.label === group.label)?.channels ?? []).filter(entry => !names.includes(entry.label));
            const spareId = (at: number) => "subchannel-inactive-" + group.key + "-" + at;
            return {
                id: channelTileId(segment.id, group.key),
                title: group.label.trim() || "New channel",
                view: true,
                // (ITS SUBCHANNEL'S CARD CARRIES THE CHANNEL AS ITS BOX NAME, as every floating card does -- "Social Media" over "Pinterest" --: the card stands on the other
                // half, away from the dialog's heading, and its own head may be a name box still to fill; owner, 2026-11-15 16:42.)
                bareCards: false,
                items: [...names, ...extra],
                itemMarks: [...names.map(() => ({ bullet: true })), ...extra.map(() => ({ bullet: true, empty: true }))],
                // EVERY LISTED SUBCHANNEL IS A LINK (layout rules 9, "A tile's content may be linkable"; owner, 2026-11-12 18:41: "the listed items are not linked"): a
                // subchannel opens its card; a suggested one opens the channel's dialog at its faded tile, where pressing it adds it.
                links: [
                    ...group.channels.filter(channel => channel.name.trim().length > 0).map(channel => ({ card: channel.id })),
                    ...extra.map(name => {
                        const at = spareOf.findIndex(entry => entry.label === name);
                        return at >= 0 ? { box: spareId(at) } : undefined;
                    })
                ],
                // (The "+" adds a subchannel to this channel and opens its card: with All, where the adds are.)
                // (No "+": a channel comes from an answer; owner, 2026-11-16 16:31.)
                holds: group.channels.map(channel => channel.id),
                // (Its dialog shows its subchannels alone where nothing is suggested and All is not chosen: one subchannel then opens at once.)
                lone: extra.length === 0,
                note: [...channelCategoryHelp(group.label), ...suggestionNote(group.label)],
                cardFor: (id: string) => answers.channels.some(channel => channel.id === id)
                    ? <div className="column-tile-content" style={{ "--strategy-theme-hue": segmentHue(segment) } as CSSProperties}><CardShell engagement={false} className="business-subchannel-card">{channelsFor(segment, group.key, id)}</CardShell></div>
                    : null,
                // The channel's dialog: a tile for each subchannel, and, faded, the ones its category offers that are not used yet.
                content: () => {
                    // A SUBCHANNEL'S TILE lists ALL the Offerings, each a LINK: the ones a card of this subchannel serves open that card (numbered 1., 2. ... where the subchannel has several cards, the Offerings of one card sharing its number); the others are half transparent, and pressing one makes a card of this subchannel for it.
                    const openCardOf = (cardId: string) => window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segment.id, group.key), card: cardId } })), 80);
                    const every = segment.offerings.map(offering => offering.id);
                    const offeringLabel = (position: number) => segment.offerings[position].name.trim() || "Offering " + (position + 1) + ", not named yet";
                    const served = (channel: BusinessChannelValue) => channel.offerings.includes(BUSINESS_CHANNEL_ALL_OFFERINGS) ? every : channel.offerings;
                    const seen = new Set<string>();
                    const tileOf = (channel: BusinessChannelValue, at: number): CardBox | null => {
                        const key = channel.name.trim().toLocaleLowerCase();
                        if (key !== "") {
                            if (seen.has(key)) {
                                return null;
                            }
                            seen.add(key);
                        }
                        const cards = key === "" ? [channel] : group.channels.filter(candidate => candidate.name.trim().toLocaleLowerCase() === key);
                        const cardFor = (offeringId: string) => cards.findIndex(card => served(card).includes(offeringId));
                        const servedHere = every.map((id, position) => ({ id, position })).filter(entry => cardFor(entry.id) >= 0).map(entry => entry.position);
                        return {
                            id: channel.id,
                            number: at + 1,
                            plain: true,
                            name: channel.name,
                            unnamed: "Unnamed subchannel",
                            // ONLY THE OFFERINGS IT SERVES (owner, 2026-11-15 16:42, the rule "only information related to the answers"); an
                            // Offering it does not serve is not listed (it is ticked on the card's Offerings).
                            lines: key === "" ? undefined : servedHere.map(position => {
                                const owner = cardFor(every[position]);
                                return (cards.length > 1 ? (owner + 1) + ". " : "") + offeringLabel(position);
                            }),
                            // (LINKS ONLY WHERE THE OFFERINGS HAVE CARDS OF THEIR OWN -- a different approach for each --; one card serving them all lists them as plain
                            // words, the tile itself opening that card; owner, 2026-11-16 14:24.)
                            linkedLines: key === "" || cards.length < 2 ? undefined : servedHere.map(() => true),
                            // (Each line named by the card it opens, so stepping through the cards lands on its line: SectionTiles' opener.)
                            lineCards: key === "" || cards.length < 2 ? undefined : servedHere.map(position => cards[cardFor(every[position])]?.id),
                            onLine: (index: number) => {
                                const owner = cardFor(every[servedHere[index]]);
                                if (owner >= 0) {
                                    openCardOf(cards[owner].id);
                                }
                            },
                            own: true,
                            content: () => null
                        };
                    };
                    const spare: CardBox[] = spareOf
                        .map((entry, at) => {
                            const suggestion = suggestedIn(group.label).find(candidate => candidate.name === entry.label);
                            return {
                            id: spareId(at),
                            number: group.channels.length + at + 1,
                            plain: true,
                            name: entry.label,
                            unnamed: entry.label,
                            // (A suggested one says its stage and the Foundation answer it comes from.)
                            lines: suggestion ? [stageLabel(suggestion.stage), suggestion.source] : undefined,
                            own: true,
                            faded: true,
                            press: () => {
                                const made = addSub(group.label, entry.label, suggestion?.stage ?? "");
                                window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segment.id, group.key), card: made.id } })), 80);
                            },
                            content: () => null
                            };
                        })
                        // (From your answers: only the subchannels the Foundation suggests; All: every one the category offers.)
                        // (Only the subchannels the Foundation suggests: every subchannel comes from an answer; owner, 2026-11-16 16:31.)
                        .filter(entry => entry.lines !== undefined);
                    return (
                        <div className="column-tile-content">
                            <div className="business-engagement-section-head"><DialogHeading title={group.label.trim() || "New channel"} info={channelCategoryHelp(group.label)} /></div>
                            <CardBoxes
                                label={"Subchannels of " + (group.label.trim() || "this channel")}
                                className="subchannel-tiles"
                                what="Subchannel"
                                autoStart={false}
                                items={[...group.channels.map(tileOf).filter((entry): entry is CardBox => entry !== null), ...spare]}
                            />
                            {removedList(group.label)}
                        </div>
                    );
                }
            };
        });
        // The channels the page offers that this Segment does not use yet: tiles, faded; pressing one makes it (and opens it).
        const unused: SectionTile[] = BUSINESS_CHANNEL_CATEGORIES
            .filter(category => category.label !== BUSINESS_CHANNEL_OTHER && !groups.some(group => group.label === category.label))
            // (Physical Delivery and Retail & Wholesale are not offered while no Offering has a physical item: doc 28, 11.7.)
            .filter(category => !channelCategoryHidden(category.label, noPhysical, groups.map(group => group.label)))
            // (From your answers: only the channels the Foundation suggests; All: every channel the page offers.)
            .filter(category => suggestedIn(category.label).length > 0)
            .map(category => ({
                id: channelTileId(segment.id, "inactive-" + category.id),
                title: category.label,
                inactive: true,
                // (A channel the Foundation suggests lists what it suggests: its subchannels, bulleted; where it suggests the channel alone, the stage, said as a
                // suggestion with no bullet, never as if it were a subchannel: owner, 2026-11-12 18:41.)
                items: inactiveLines(category.label),
                itemMarks: inactiveLines(category.label).map((_line, at) => at < inactiveNames(category.label).length ? { bullet: true } : { plain: true }),
                note: suggestionNote(category.label),
                press: () => {
                    const channel = addChannel(category.label);
                    window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segment.id, channel.id), card: channel.id, fresh: true } })), 80);
                },
                // (The "+" of a channel the Segment does not use yet does what pressing the tile does: makes it, and opens its card -- as the "+" of every other tile; with All.)
                // (No "+": a channel comes from an answer; owner, 2026-11-16 16:31.)
                content: () => null
            }));
        return (
            <>
                {fromLink}
                <SectionTiles
                    label={"Channels of " + (segment.name.trim() || "this Segment")}
                    hue={segmentHue(segment)}
                    tiles={[...tiles, ...unused]}
                    // (A subchannel made a moment ago and left with no name, no link and no stage is taken away when its card is closed.)
                    blank={{
                        isBlank: (id: string) => {
                            const found = segmentOf(segment.id).channels.find(entry => entry.id === id);
                            return !found || (found.name.trim() === "" && found.links.every(link => link.trim() === "") && found.stages.length === 0);
                        },
                        onRemove: (ids: string[]) => updateSegment(segment.id, { channels: segmentOf(segment.id).channels.filter(entry => !ids.includes(entry.id)) })
                    }}
                />
                {removedList()}
            </>
        );
    }
    /**
     * THE CHANNELS AND JOURNEY DIALOG BY JOURNEY STAGE (owner, 2026-11-12 18:41: "an option to place the tiles according the channels or the Journey Stages"): a tile
     * for each of the five stages, listing the subchannels used at it, each a link to its card; pressing a tile opens the stage's dialog, a tile for each of them.
     */
    function stageTiles(segment: BusinessCustomerSegmentValue) {
        const answers = segmentOf(segment.id);
        // (A subchannel's card is drawn by its channel: the group its category forms, keyed by the category's first subchannel, as on the tiles by channel.)
        const groupKey = (channel: BusinessChannelValue) => answers.channels.find(entry => entry.category === channel.category)?.id ?? channel.id;
        const nameOf = (channel: BusinessChannelValue) => channel.name.trim() || "Unnamed subchannel";
        const hue = { "--strategy-theme-hue": segmentHue(segment) } as CSSProperties;
        const tiles: SectionTile[] = BUSINESS_JOURNEY_STAGES.map(stage => {
            // ONE ORDER (owner, 2026-11-14 23:25, "TikTok" circled): the stage's subchannels grouped by channel, in the page's order of channels -- as the table
            // draws them -- for the tile's list, its rail and its Tiles view alike, so the rail's dot stands where the card stands in the table.
            const stageUsed = answers.channels.filter(channel => channel.stages.includes(stage.id));
            const used = [...new Set(stageUsed.map(channel => channel.category))].flatMap(category => stageUsed.filter(channel => channel.category === category));
            return {
                id: channelTileId(segment.id, "stage-" + stage.id),
                title: stage.label,
                view: true,
                // (Its subchannel's card, opened from this stage's dialog, carries no box name: the dialog's heading says it.)
                bareCards: true,
                items: used.map(nameOf),
                itemMarks: used.map(() => ({ bullet: true })),
                links: used.map(channel => ({ card: channel.id })),
                holds: used.map(channel => channel.id),
                cardFor: (id: string) => {
                    const channel = answers.channels.find(entry => entry.id === id);
                    return channel
                        ? <div className="column-tile-content" style={hue}><CardShell engagement={false} className="business-subchannel-card">{channelsFor(segment, groupKey(channel), id)}</CardShell></div>
                        : null;
                },
                content: () => {
                    const tileId = channelTileId(segment.id, "stage-" + stage.id);
                    const openCard = (channelId: string) => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: tileId, card: channelId } }));
                    const offeringsOf = (channel: BusinessChannelValue) => channel.offerings.includes(BUSINESS_CHANNEL_ALL_OFFERINGS)
                        ? ["All Offerings"]
                        : channel.offerings.map(id => segment.offerings.find(offering => offering.id === id)?.name.trim() || "Unnamed Offering");
                    // (Each action of the stage on a subchannel, as a record: its number in the page's order, its words, the places it is shared in, the expenses
                    // linked to it with their costs.)
                    const placements = actionPlacements(answers);
                    const recordsOf = (channel: BusinessChannelValue) => (channel.actionIds[stage.id] ?? [])
                        .map(id => ({ id, text: answers.actions.find(action => action.id === id)?.text.trim() ?? "" }))
                        .filter(entry => entry.text !== "")
                        .map(entry => {
                            const places = placements.filter(place => place.actionId === entry.id).length;
                            return {
                                ...entry,
                                order: orderIn(placements, entry.id, channel.id),
                                shared: places > 1 ? places : 0,
                                expenses: actionResourceLinks(engagement, segment.id, entry.id, cards).map(({ card }) => ({ id: card.id, name: costCardName(card), cost: costCardAmountText(card, currency) }))
                            };
                        });
                    // (The stage's subchannels as a table -- the Inventory's table, its look -- or as tiles: Table first; owner, 2026-11-12 19:54.)
                    const view = stageViews[segment.id] ?? "table";
                    return (
                        <div className="column-tile-content">
                            {/* (The view's choice on the title's row; owner, 2026-11-13 11:44: "Place the buttons to the top row".) */}
                            <div className="business-engagement-section-head">
                                <DialogHeading title={stage.label} />
                                <RadioChoice
                                    className="capability-overview-views"
                                    label="View"
                                    group={"stage-view-" + segment.id}
                                    options={[{ id: "table", label: "Table" }, { id: "tiles", label: "Tiles" }]}
                                    value={view}
                                    onChange={(next) => setStageViews(current => ({ ...current, [segment.id]: next as "tiles" | "table" }))}
                                />
                            </div>
                            {used.length === 0
                                ? <BusinessEmpty>Tick this stage on a subchannel's card to list it here.</BusinessEmpty>
                                : view === "tiles"
                                    ? (
                                        <CardBoxes
                                            label={"Subchannels at " + stage.label}
                                            what="Subchannel"
                                            autoStart={false}
                                            items={used.map((channel, at) => ({ id: channel.id, number: at + 1, plain: true, name: channel.name, unnamed: "Unnamed subchannel", lines: [channel.category.trim() || "New channel"], own: true, content: () => null }))}
                                        />
                                    )
                                    : (
                                        <table className="capability-overview-table" data-grouped="" data-wrap="" data-bare="" data-record="" aria-label={"Subchannels at " + stage.label} data-size={TABLE_SIZES[0].id} style={{ "--table-font": TABLE_SIZES[0].font, "--table-pad": TABLE_SIZES[0].pad } as CSSProperties}>
                                            <thead>
                                                <tr>
                                                    {/* (Channel, Subchannel, Offerings, Actions, owner, 2026-11-13 00:27; the stage named once, by the dialog's title, 11:44.
                                                        Each column as wide as its words, the Actions the rest; every text wraps.) */}
                                                    <th scope="col" data-col="channel">Channel</th>
                                                    <th scope="col" data-col="subchannel">Subchannel</th>
                                                    <th scope="col" data-col="offerings">Offerings</th>
                                                    {/* (AS A RECORD: a row for each subchannel, its expenses under its name with their costs; its actions numbered twice -- 1., 2. in
                                                        the subchannel and #14 in the page -- with their symbols; owner, 2026-11-14 17:44 and 18:06.) */}
                                                    <th scope="col" data-col="actions">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* ONE CELL A CHANNEL (owner, 2026-11-13 05:23: "Channels with more than 1 subchannel would be in a merged Cell"): the rows grouped
                                                    by channel, in the page's order; a channel of several subchannels one cell over them; each group one band of the striping
                                                    (data-band). */}
                                                {[...new Set(used.map(channel => channel.category))].flatMap((category, group) => {
                                                    const subchannels = used.filter(channel => channel.category === category);
                                                    return subchannels.map((channel, at) => {
                                                        const records = recordsOf(channel);
                                                        // (The subchannel's expenses the stage's actions use, each once.)
                                                        const expenses = [...new Map(records.flatMap(record => record.expenses).map(entry => [entry.id, entry])).values()];
                                                        return (
                                                            <tr key={channel.id} data-card-row={channel.id} data-band={group % 2 === 1 ? "even" : "odd"} data-follows={at > 0 ? "" : undefined}>
                                                                {at === 0 && <td data-col="channel" rowSpan={subchannels.length}><span>{category.trim() || "New channel"}</span></td>}
                                                                <th scope="row" data-col="subchannel">
                                                                    <TextLink className="capability-overview-name" onClick={() => openCard(channel.id)}>{nameOf(channel)}</TextLink>
                                                                    {expenses.length > 0 && (
                                                                        <div className="stage-record-expenses" aria-label={"Expenses of " + nameOf(channel)}>
                                                                            <Values lined items={expenses.map(entry => ({ key: entry.id, node: <><span className="stage-record-expense-name">{entry.name}</span>{entry.cost && <span className="stage-record-expense-cost">{entry.cost}</span>}</> }))} />
                                                                        </div>
                                                                    )}
                                                                </th>
                                                                <td data-col="offerings"><Values lined items={offeringsOf(channel).map(name => ({ key: name, node: name }))} /></td>
                                                                <td data-col="actions">
                                                                    <Values numbered items={records.map(record => ({
                                                                        key: record.id,
                                                                        node: (
                                                                            // (As the subchannel card's action cell: its order at the top left (the list's 1.), its number in the page at the bottom left,
                                                                            // its words beside them, its symbols in a column at the right, the link above the tag; owner, 2026-11-14 18:12 and 18:14.)
                                                                            <span className="stage-record-action">
                                                                                <span className="stage-record-words">{record.text}</span>
                                                                                {(record.shared > 0 || record.expenses.length > 0) && (
                                                                                    <span className="stage-record-marks">
                                                                                        {record.shared > 0 && <span className="stage-record-mark" title={"In " + record.shared + " places"} aria-label={"In " + record.shared + " places"}><MarkIcon kind="link" /></span>}
                                                                                        {record.expenses.length > 0 && <span className="stage-record-mark" title={"Linked to " + record.expenses.map(entry => entry.name).join(", ")} aria-label={"Linked to " + record.expenses.map(entry => entry.name).join(", ")}><MarkIcon kind="tag" /></span>}
                                                                                    </span>
                                                                                )}
                                                                                {record.order !== undefined && <span className="notepad-chip-number stage-record-order">{"#" + record.order}</span>}
                                                                            </span>
                                                                        )
                                                                    }))} />
                                                                </td>
                                                            </tr>
                                                        );
                                                    });
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                        </div>
                    );
                }
            };
        });
        return <SectionTiles label={"Journey stages of " + (segment.name.trim() || "this Segment")} hue={segmentHue(segment)} tiles={tiles} />;
    }
    /** The choice at the head of the Channels & Journey dialog: its tiles by channel or by journey stage (the radio of the reports' Tiles or Table). */
    function channelViewChoice(segment: BusinessCustomerSegmentValue) {
        return (
            <RadioChoice
                className="capability-overview-views"
                label="Place the tiles by"
                group={"channel-view-" + segment.id}
                options={[{ id: "channels", label: "Channels" }, { id: "stages", label: "Journey Stages" }]}
                value={channelViews[segment.id] ?? "channels"}
                onChange={(next) => setChannelViews(current => ({ ...current, [segment.id]: next as "channels" | "stages" }))}
            />
        );
    }
    /** The Profiles an Offering serves (those that tick it among their needs on Page 1): its tile names them, under the Offering. */
    function profilesOf(segment: BusinessCustomerSegmentValue, offeringId: string) {
        return segment.profiles.filter(profile => businessProfileOfferings(profile, segment.offerings).some(offering => offering.id === offeringId));
    }
    /** The "+" on an Offering's tile in Customer's Relationship (with All): the next relationship type it has not, added; false when it has them all. */
    /** Adds the next type an Offering has not (the "+" of its dialog, with All): the type added, or "" where it has them all. */
    function addRelationshipType(segment: BusinessCustomerSegmentValue, offeringId: string): string {
        const shown = offeringRelationshipsOf(segment.id, offeringId);
        const stored = storedOfferingRelationshipsOf(segment.id, offeringId);
        const free = BUSINESS_RELATIONSHIP_TYPES.find(type => !shown.types.includes(type.id));
        if (free) {
            // (Added by the founder: saved among the added types, and no longer among the removed; every type shown that the answers do not create -- Personal
            // Assistance standing in for none -- is saved with it, so it stays beside it.)
            const created = autoRelationshipTypes(segment, offeringId, identity).map(entry => entry.type);
            const keep = [...new Set([...stored.types.filter(type => type !== ""), ...shown.types.filter(type => !created.includes(type)), free.id])];
            updateOfferingRelationships(segment.id, offeringId, { types: keep, dismissed: (stored.dismissed ?? []).filter(type => type !== free.id) });
        }
        return free?.id ?? "";
    }
    /**
     * A type removed from an Offering's card (its x, shown while it has two or more: owner, 2026-11-13 00:29): taken from the added types and recorded as removed,
     * so a type the answers create stays removed; the tile's "+" (with All) adds it back.
     */
    function removeRelationshipType(segment: BusinessCustomerSegmentValue, offeringId: string, typeId: string) {
        const stored = storedOfferingRelationshipsOf(segment.id, offeringId);
        updateOfferingRelationships(segment.id, offeringId, { types: stored.types.filter(type => type !== typeId), dismissed: [...new Set([...(stored.dismissed ?? []), typeId])] });
    }
    /* ---------- 2. Customer Relationship ---------- */

    /**
     * The Offerings this Segment's Channels table records ANY
     * interaction for -- see relationshipsFor's own `offeringIds`,
     * which this is factored out of. Read independently of whether
     * "2. Customer Relationship" is open, so the section head's
     * "Expand all" can be given the right ids whether or not its
     * body is currently drawn.
     */
    function engagedOfferingIds(segment: BusinessCustomerSegmentValue): string[] {

        const interactions = businessRelationshipInteractions(
            segmentOf(segment.id).channels, segment.offerings, segment.offerings
        );

        const ids: string[] = [];

        for (const interaction of interactions) {
            if (!ids.includes(interaction.offeringId)) {
                ids.push(interaction.offeringId);
            }
        }

        return ids;

    }
    /**
     * The Customer Relationships table.
     *
     * FIVE COLUMNS, the shape the worked example draws:
     *
     *   Profile | Relationship Type / Purpose | Offering
     *           | Journey Stage / Channel | Approach
     *
     * ITS ROWS ARE NOT CHOSEN -- THEY ARE READ OFF 1. CUSTOMER
     * CHANNEL. That table already says which Offerings each channel
     * carries and at which stages it is used, and every one of
     * those is an interaction the organisation has. Choosing them
     * again here was asking the same question twice and inviting
     * the two answers to disagree.
     *
     * So the Offering and the Journey Stage / Channel columns are
     * read-only: add a stage to a channel above and the row appears
     * here; take it away and the row goes. What is asked here is
     * only what the Channels table cannot know -- the Relationship
     * Type, why it is maintained, and how each interaction is
     * conducted.
     *
     * Three things span what hangs off them: a Profile over all its
     * relationship types, a Type over all its interactions, an
     * Offering over the interactions that concern it. ONE ROW IS
     * ONE INTERACTION.
     *
     * The GOAL rides in the Approach cell rather than taking a
     * sixth column. It belongs to the same interaction, and it is
     * optional.
     */
    /** `only`: that one Offering alone; with `asCard`, as its floating card (opened from its tile in the Customer's Relationship dialog). */
    /** `typeOnly`: with `asCard`, that one relationship type's card (opened from its tile in the Offering's dialog; owner, 2026-11-13 04:58). */
    function relationshipsFor(segment: BusinessCustomerSegmentValue, only?: string, asCard = false, typeOnly?: string) {

        const answers = segmentOf(segment.id);

        const offeringName = (offeringId: string) => {

            const index = segment.offerings.findIndex(
                offering => offering.id === offeringId
            );

            const offering = segment.offerings[index];

            return offering?.name.trim().length
                ? offering.name.trim()
                : "Offering " + (index + 1) + ", not named yet";

        };

        const channelName = (channelId: string) =>
            channelChoices(answers.channels)
                .find(choice => choice.id === channelId)?.label ?? "";

        /**
         * Which Profiles an Offering is sold to, read off Page 1:
         * an Offering answers a Profile's Functional needs, or it
         * does not.
         *
         * Listed under the Offering rather than asked about. The
         * relationship is kept ABOUT THE OFFERING now -- three
         * Profiles buying the same thing are not three
         * relationships with it -- so who buys it is reference, the
         * way the channels that carry it are.
         */
        const profilesFor = (offeringId: string) => profilesOf(segment, offeringId);

        /**
         * Every interaction the Channels table records for this
         * Segment: which channels carry which Offering, and at
         * which journey stages.
         */
        const interactions = businessRelationshipInteractions(
            answers.channels, segment.offerings, segment.offerings
        );

        /* The Offerings with any interaction at all, in the order
           the interaction list gives -- which is Page 1's own
           Offering order. */
        const offeringIds = engagedOfferingIds(segment).filter(offeringId => !only || offeringId === only);

        if (segment.offerings.length === 0) {
            return (
                <BusinessEmpty>
                    Add an Offering to this Segment on Foundation & Engagement,
                    then describe the relationship you keep about it here.
                </BusinessEmpty>
            );
        }

        if (offeringIds.length === 0) {
            return (
                <BusinessEmpty>
                    Give a Channel in 1. Customer Channel one of this Segment&rsquo;s
                    Offerings and a Journey Stage, and the interactions appear here.
                </BusinessEmpty>
            );
        }

        const rowsOf = (offeringId: string) =>
            interactions.filter(entry => entry.offeringId === offeringId);

        const typesOf = (offeringId: string) => {

            const kept = offeringRelationshipsOf(segment.id, offeringId).types;

            return kept.length > 0 ? kept : [""];

        };

        /* THREE LEVELS FOLD on this table -- Offering, relationship
           type, journey stage -- and each key carries everything
           above it, so the same stage under two types closes
           separately. */
        const offeringFoldKey = (offeringId: string) =>
            "relationship-offering-" + offeringId;

        const offeringOpen = (offeringId: string) =>
            folds.isOpen(offeringFoldKey(offeringId));

        /*
            ONE OFFERING'S RELATIONSHIP AS A FLOATING CARD, IN THE DEFAULT LAYOUT (owner, 2026-11-12 17:53: "Offering relationship should be a floated card"; 18:41: "does not
            follow the default floated card's lay out ... Place the Goals (get, keep, grow) in a row"; 19:54: "the Offering and the Profile do not need to be in the Relationship
            floated Card"): no head -- its tile names the Offering and its Profiles --; a section for each relationship type, its x at the end of its title band: a box for
            its Purpose, then a box for each stage with its Goals in one row and its Approach; then the type the Foundation suggests. A type is added by the "+" on the
            Offering's tile (with All). The same fields and saved answers as the table.
        */
        if (asCard && only) {
            const offeringId = only;
            const offeringRows = rowsOf(offeringId);
            const kept = offeringRelationshipsOf(segment.id, offeringId);
            const number = segment.offerings.findIndex(offering => offering.id === offeringId) + 1;
            // A TYPE'S OWN CARD (opened from its tile in the Offering's dialog) has the default card head: the type's number in the dialog, its name (the type is the
            // card's title; owner, 2026-11-13 00:27), and its x in the card's x column while the Offering has another type (owner, 2026-11-13 12:32: the cards
            // "follow the rules (colour bands, x buttons)").
            const typeLabelOf = (typeId: string) => relationshipTypeLabel(typeId) ?? "Relationship Type";
            const removeType = (typeId: string) => kept.types.length > 1
                ? <BusinessRemove what={typeLabelOf(typeId) + " Relationship Type for " + offeringName(offeringId)} disabled={disabled} onRemove={() => removeRelationshipType(segment, offeringId, typeId)} />
                : undefined;
            const ownCard = typeOnly !== undefined && kept.types.includes(typeOnly);
            return (
                <EngagementCard
                    kind={ownCard ? "Relationship Type" : "Offering"}
                    number={ownCard ? kept.types.indexOf(typeOnly) + 1 : number}
                    name={ownCard ? typeLabelOf(typeOnly) : offeringName(offeringId)}
                    emptyName={ownCard ? "Relationship Type" : undefined}
                    anchor={"relationship-offering-" + offeringId + (ownCard ? "-" + typeOnly : "")}
                    actions={ownCard ? removeType(typeOnly) : undefined}
                    headless={!ownCard}
                >
                    {/* EACH RELATIONSHIP TYPE A BOX (owner, 2026-11-12 23:16: "Rearrange the colour tints ... to see the x button is not possible"): its name, its "i" and its
                        x on the box's title band, as a Customer Source's on the Demand card; then a band for its Purpose and a band for each stage, its Goals in one row
                        and its Approach under them, the tints alternating. The double rule stands between one type and the next. */}
                    <SingleColumn>
                        <EngagementBoxes>{kept.types.filter(typeId => !typeOnly || typeId === typeOnly).map(typeId => {
                            const type = typeOf(segment.id, offeringId, typeId);
                            const label = relationshipTypeLabel(typeId) ?? "Relationship Type";
                            return (
                                <EngagementBox
                                    key={typeId}
                                    title={ownCard ? undefined : label}
                                    info={SECTIONS.relationships.types}
                                    // (Its x while the Offering has another type: an Offering keeps at least one; owner, 2026-11-13 00:29. On its own card, the head's.)
                                    extra={ownCard ? undefined : removeType(typeId)}
                                    bands={[
                                        <FieldRow key="purpose" pair label="Purpose" info={SECTIONS.relationships.purpose}>
                                            {/* (ADD A DRAFT (2.14, the second batch of the review; owner, 2026-11-18 00:46), as the Value Proposition's: the Purpose from the type
                                                and the Offering's answers, added after what is written, and each empty Approach from its stage's channels, in one write.) */}
                                            {(() => {
                                                const purposeDraft = relationshipPurposeDraft(typeId, offeringName(offeringId), offeringAnswersById([segment], offeringId, identity));
                                                const approachesOpen = offeringRows.some(interaction => !interactionOf(segment.id, offeringId, typeId, interaction.key, interaction.legacyKeys, startGoals(interaction.stageId, segment, offeringId, identity)).approach.trim()
                                                    && relationshipApproachDraft(typeId, interaction.groups.flatMap(group => group.channelIds.map(channelName))) !== "");
                                                return draftAdds(type.purpose, purposeDraft) || approachesOpen;
                                            })() && <TextLink
                                                className="business-competitor-draft"
                                                disabled={disabled}
                                                onClick={() => {
                                                    const draft = relationshipPurposeDraft(typeId, offeringName(offeringId), offeringAnswersById([segment], offeringId, identity));
                                                    const interactions = { ...type.interactions };
                                                    for (const interaction of offeringRows) {
                                                        const current = interactionOf(segment.id, offeringId, typeId, interaction.key, interaction.legacyKeys, startGoals(interaction.stageId, segment, offeringId, identity));
                                                        const approach = relationshipApproachDraft(typeId, interaction.groups.flatMap(group => group.channelIds.map(channelName)));
                                                        if (!current.approach.trim() && approach) {
                                                            interactions[interaction.key] = { ...current, approach };
                                                        }
                                                    }
                                                    updateType(segment.id, offeringId, typeId, { purpose: withDraft(type.purpose, draft), interactions });
                                                }}
                                            >
                                                Add a draft
                                            </TextLink>}
                                            <StrategyTextArea
                                                className="interview-input business-foundation-note"
                                                ariaLabel={"Purpose of " + label + " for " + offeringName(offeringId)}
                                                disabled={disabled}
                                                value={type.purpose}
                                                onChange={(next) => updateType(segment.id, offeringId, typeId, { purpose: next })}
                                            />
                                        </FieldRow>,
                                        // THE STAGES IN THREE COLUMNS (owner, 2026-11-13 00:27): a heading row -- Journey Stage, Goals, Approach, each with its "i" --, then a row
                                        // per stage: its name (its channels in its "i"), its Goals one under another, its Approach.
                                        <div key="heads" className="business-relationship-stage-row" data-head="" role="row">
                                            <span className="business-foundation-label-info" role="columnheader"><FieldLabel className="business-foundation-label"><InfoText text="Journey Stage"><InfoNote label="Journey Stage" points={SECTIONS.relationships.stages} fullList /></InfoText></FieldLabel></span>
                                            <span className="business-foundation-label-info" role="columnheader"><FieldLabel className="business-foundation-label"><InfoText text="Goals"><InfoNote label="Goals" points={SECTIONS.relationships.goals} fullList /></InfoText></FieldLabel></span>
                                            <span className="business-foundation-label-info" role="columnheader"><FieldLabel className="business-foundation-label"><InfoText text="Approach"><InfoNote label="Approach" points={SECTIONS.relationships.approach} fullList /></InfoText></FieldLabel></span>
                                        </div>,
                                        ...offeringRows.map(interaction => {
                                            // (A row not answered yet starts with its stage's Goals: startGoals.)
                                            const start = startGoals(interaction.stageId, segment, offeringId, identity);
                                            const answersFor = interactionOf(segment.id, offeringId, typeId, interaction.key, interaction.legacyKeys, start);
                                            const stage = STAGE_LABELS[interaction.stageId] ?? "";
                                            const about = stage + ", " + offeringName(offeringId) + ", " + label;
                                            // (ITS CHANNELS UNDER A FOLD ARROW, folded at first: the channels as a list, each with its subchannels as a list under it; owner,
                                            // 2026-11-14 13:54: "change the i to a folded arrow, placing it as a list (channels) and nested lists (subchannels)". The page's folds
                                            // start open, so this one's key is held the other way round.)
                                            const stageFold = "relstage:" + segment.id + ":" + offeringId + ":" + typeId + ":" + interaction.key;
                                            const stageOpen = !folds.isOpen(stageFold);
                                            return (
                                                <div key={interaction.key} className="business-relationship-stage-row" role="row">
                                                    <span className="business-relationship-stage-head" role="rowheader">
                                                        {interaction.groups.length > 0
                                                            ? (
                                                                // (The shared fold of a card's Links and Responsibilities: the arrow, the stage, its channels under it, each subchannel set
                                                                // in under its channel; owner, 2026-11-14 18:10.)
                                                                <FoldList label={stage} name={stage + " channels"} open={stageOpen} onToggle={() => folds.toggle(stageFold)}>
                                                                    {/* (A line between one channel and the next, a bullet before each subchannel; owner, 2026-11-14 19:04.) */}
                                                                    {interaction.groups.map(group => (
                                                                        <FoldListGroup key={group.category}>
                                                                            <FoldListLine wrap>{group.category.trim() || "No channel"}</FoldListLine>
                                                                            {group.channelIds.map(id => <FoldListLine key={id} bullet wrap>{channelName(id)}</FoldListLine>)}
                                                                        </FoldListGroup>
                                                                    ))}
                                                                </FoldList>
                                                            )
                                                            : <span className="business-foundation-label-info"><FieldLabel className="business-foundation-label">{stage}</FieldLabel></span>}
                                                    </span>
                                                    <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={"Goals for " + about}>
                                                        <BusinessTicks
                                                            name={"Goals for " + about}
                                                            options={GOAL_OPTIONS}
                                                            chosen={answersFor.goals}
                                                            disabled={disabled}
                                                            onChange={(next) => updateInteraction(segment.id, offeringId, typeId, interaction.key, interaction.legacyKeys, { goals: next }, start)}
                                                        />
                                                    </div>
                                                    <StrategyTextArea
                                                        className="interview-input business-foundation-note"
                                                        ariaLabel={"Approach for " + about}
                                                        disabled={disabled}
                                                        value={answersFor.approach}
                                                        onChange={(next) => updateInteraction(segment.id, offeringId, typeId, interaction.key, interaction.legacyKeys, { approach: next }, start)}
                                                    />
                                                </div>
                                            );
                                        })
                                    ]}
                                />
                            );
                        })}</EngagementBoxes>
                    </SingleColumn>
                </EngagementCard>
            );
        }

        return (
            <div className="business-channel-table-wrap">

                <table className="business-channel-table business-relationship-table">

                    {/* Widths declared on the columns rather than on
                        the headings, because the Offering and the
                        journey stage are both bands spanning several
                        of them and a cell that spans cannot set a
                        width. */}
                    <colgroup>
                        <col className="business-relationship-col-type" />
                        <col className="business-relationship-col-channels" />
                        <col className="business-relationship-col-approach" />
                    </colgroup>

                    {/* NO HEAD ROW. The two headings belong UNDER the
                        Offering they describe, not once at the top of
                        a table that may run to a dozen Offerings --
                        what is answered here is answered about an
                        Offering, and the headings say so where the
                        answering starts. */}

                    {offeringIds.map((offeringId, offeringIndex) => {

                                    const offeringRows = rowsOf(offeringId);
                                    const typeRows = typesOf(offeringId);

                                    const kept = offeringRelationshipsOf(
                                        segment.id, offeringId
                                    );

                                    const offeringShown = offeringOpen(offeringId);

                                    /* WHICH CELLS SIT IN THE TABLE'S
                                       BOTTOM CORNERS, so they can be
                                       rounded. CSS cannot say it in a
                                       table of rowspans: the cell in
                                       the bottom-left may have started
                                       several rows higher up. Only the
                                       last Offering has any. */
                                    const lastOffering =
                                        offeringIndex === offeringIds.length - 1;

                                    const cornerLeft = lastOffering
                                        ? " business-relationship-corner-bl"
                                        : "";

                                    const cornerRight = lastOffering
                                        ? " business-relationship-corner-br"
                                        : "";

                                    /* WHAT PAGE 1 RECORDS ABOUT THIS
                                       OFFERING, behind the "i" beside
                                       its name -- the same note the
                                       Profile carries, for the same
                                       reason: the Approach is written
                                       about this thing, and what it is
                                       should be a click away rather
                                       than a scroll. */
                                    const offeringFacts = relativeInformationFor(
                                        SECTIONS.channels.offeringInformation,
                                        segment.offerings.find(
                                            entry => entry.id === offeringId
                                        )?.description ?? {}
                                    );

                                    /* THE OFFERING, read from the
                                       channel that carries it. Not
                                       chosen here -- and the thing the
                                       relationship is kept ABOUT, which
                                       is why it carries an arrow: one
                                       Offering can run to a dozen rows
                                       of its own. */
                                    const offeringHead = (
                                        <span className="business-engagement-reference-name-row">
                                            <FoldArrow
                                                open={offeringShown}
                                                label={offeringName(offeringId)}
                                                onToggle={() => folds.toggle(offeringFoldKey(offeringId))}
                                            />
                                            <span className="business-engagement-band-kind">
                                                {(offeringIndex + 1) + ". Offering -"}
                                            </span>
                                            {/* The name is the link to the Offering
                                                on Foundation & Engagement, as a
                                                Profile's name is; its "i" stays
                                                with it as one run. */}
                                            <span>
                                                {foundationLink(
                                                    offeringName(offeringId), "Offering", offeringId
                                                )}
                                                {offeringFacts.length > 0 && (
                                                    <InfoNote
                                                        label={offeringName(offeringId)}
                                                        points={offeringFacts.map(section => ({
                                                            title: section.label,
                                                            text: section.text
                                                        }))}
                                                        fullList
                                                        asReference
                                                    />
                                                )}
                                            </span>
                                            {!offeringShown && (
                                                <span className="business-card-summary">
                                                    {summaryText(
                                                        kept.types.length
                                                            ? kept.types.length +
                                                                (kept.types.length === 1
                                                                    ? " relationship type"
                                                                    : " relationship types")
                                                            : ""
                                                    )}
                                                </span>
                                            )}
                                        </span>
                                    );

                                    /* WHO THIS OFFERING IS SOLD TO,
                                       read off Page 1 and listed under
                                       it: an Offering answers a
                                       Profile's Functional needs, or it
                                       does not.

                                       A DATA LIST, not an answer. The
                                       relationship is kept about the
                                       Offering, once, and three
                                       Profiles buying the same thing
                                       are not three relationships with
                                       it -- so the names are reference
                                       here, each with the "i" that
                                       opens what Page 1 records about
                                       them. */
                                    const served = profilesFor(offeringId);

                                    const profilesRow = (
                                        <span className="business-relationship-profiles business-relationship-band-profiles">

                                                {/* ON ONE LINE WITH ITS LABEL.
                                                    Three names are a line, not a
                                                    list under a heading -- and
                                                    the row is reference, so it
                                                    should take one row. */}
                                                <span className="business-engagement-reference-label">
                                                    Profiles:
                                                </span>

                                                {served.length === 0
                                                    ? (
                                                        <BusinessEmpty>
                                                            No Customer Profile&rsquo;s Functional
                                                            Needs are answered by this Offering
                                                            yet. Tick them under it on the
                                                            Foundation page.
                                                        </BusinessEmpty>
                                                    )
                                                    : (
                                                        <ul className="business-relationship-profile-list">
                                                            {served.map((profile, index) => {

                                                                const facts = relativeInformationFor(
                                                                    SECTIONS.channels.profileInformation,
                                                                    profile.description
                                                                );

                                                                const shown = profile.name.trim() ||
                                                                    "Profile " + (index + 1);

                                                                return (
                                                                    <li key={profile.id}>
                                                                        {/* The link and its "i" as one run, so the
                                                                            row's own gap stays out of the "i"'s
                                                                            8px (see .info-note). */}
                                                                        <span className="business-engagement-reference-name-row">
                                                                            <span>
                                                                                {foundationLink(
                                                                                    profile.name, "Profile", profile.id
                                                                                )}
                                                                                {facts.length > 0 && (
                                                                                    <InfoNote
                                                                                        label={shown}
                                                                                        points={facts.map(section => ({
                                                                                            title: section.label,
                                                                                            text: section.text
                                                                                        }))}
                                                                                        fullList
                                                                                        asReference
                                                                                    />
                                                                                )}
                                                                            </span>
                                                                        </span>
                                                                    </li>
                                                                );

                                                            })}
                                                        </ul>
                                                    )}

                                        </span>
                                    );

                                    
                                    /* A BAND TOO, under the Profile's
                                       and one step in from it.

                                       The Relationship Types kept
                                       about it are what the first
                                       column now holds, each spanning
                                       its own rows -- which is what
                                       keeps a type beside the
                                       interactions written under it.
                                       An Offering written in the same
                                       column would have to share it
                                       with them, and one column cannot
                                       hold two cells over the same
                                       rows. */
                                    const offeringBand = (
                                        <tr>
                                            <th
                                                scope="rowgroup"
                                                colSpan={3}
                                                className="business-channel-cell business-engagement-band business-engagement-band-offering"
                                            >
                                                {/* The Offering and, next to it, the Profiles it is sold to. */}
                                                <span className="business-relationship-band">
                                                    {offeringHead}
                                                    {offeringShown && profilesRow}
                                                </span>
                                            </th>
                                        </tr>
                                    );

                                    if (!offeringShown) {
                                        return (
                                            <tbody key={offeringId} data-anchor={"relationship-offering-" + offeringId}>
                                                {offeringBand}

                                                {/* WHO IT IS SOLD TO, AND WHAT
                                                    IS KEPT ABOUT IT. Those two
                                                    are what a closed Offering is
                                                    worth showing: the stages and
                                                    what is written at them belong
                                                    to a relationship type, and a
                                                    type opens on its own arrow. */}
                                                <tr>

                                                    <td className={"business-channel-cell business-channel-cell-derived business-relationship-type-cell" + cornerLeft}>
                                                        {served.length === 0
                                                            ? (
                                                                <BusinessEmpty>
                                                                    No Customer Profile yet.
                                                                </BusinessEmpty>
                                                            )
                                                            : (
                                                                <ul className="business-engagement-channel-list">
                                                                    {served.map(profile => (
                                                                        <li key={profile.id}>
                                                                            {profile.name.trim() ||
                                                                                "Not named yet"}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                    </td>

                                                    <td
                                                        colSpan={2}
                                                        className={"business-channel-cell business-channel-cell-derived business-relationship-channels-cell" + cornerRight}
                                                    >
                                                        {kept.types.length === 0
                                                            ? (
                                                                <BusinessEmpty>
                                                                    No relationship type chosen yet.
                                                                </BusinessEmpty>
                                                            )
                                                            : (
                                                                <ul className="business-engagement-channel-list">
                                                                    {kept.types.map(typeId => (
                                                                        <li key={typeId}>
                                                                            {relationshipTypeLabel(typeId) ?? typeId}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                    </td>

                                                </tr>

                                            </tbody>
                                        );
                                    }

                                    return (
                                        <tbody key={offeringId} data-anchor={"relationship-offering-" + offeringId}>

                                            {offeringBand}

                                            {/* HOW THE RELATIONSHIP IS KEPT, one block for each type: the type (its dropdown beside its label), its Purpose, then the
                                                Engagement Strategy -- the journey stages side by side, each with its Goal (the ticks under the label) and its Approach --
                                                and, after the last, the one "+ Add Relationship Type". Nothing folds. */}
                                            <tr>
                                                <td colSpan={3} className="business-channel-cell business-relationship-blocks-cell">

                                                    {/* (THE SUPPORT PROMISE, from How fast do you reply? (O16) on the Offering: supportPromise; owner, 2026-11-17.) */}
                                                    {(() => {
                                                        const promise = supportPromise(offeringAnswersById([segment], offeringId, identity));
                                                        return promise ? <p className="business-foundation-tick-note business-segment-settled" role="note">{promise}</p> : null;
                                                    })()}

                                                    {typeRows.map(typeId => {

                                                        const type = typeOf(segment.id, offeringId, typeId);

                                                        return (
                                                            <div className="business-relationship-block" key={offeringId + "-" + (typeId || "unchosen")}>

                                                                {/* The type's x, in the block's top right corner. */}
                                                                {kept.types.length > 0 && (
                                                                    <span className="business-relationship-block-remove">
                                                                        <BusinessStep
                                                                            kind="remove"
                                                                            what={(typeId.length > 0 ? relationshipTypeLabel(typeId) + " " : "") + "Relationship Type for " + offeringName(offeringId)}
                                                                            disabled={disabled}
                                                                            onClick={() => updateOfferingRelationships(segment.id, offeringId, {
                                                                                types: kept.types.filter(candidate => candidate !== typeId)
                                                                            })}
                                                                        />
                                                                    </span>
                                                                )}

                                                                {/* THE TYPE (its dropdown under its label) and, next to it, its Purpose. */}
                                                                <div className="business-relationship-type-row">

                                                                    <div className="business-relationship-type-field">
                                                                        <span className="business-foundation-label-info business-relationship-type-label">
                                                                            <InfoText text="Relationship Type">
                                                                                <InfoNote label="Relationship Type" points={SECTIONS.relationships.types} fullList />
                                                                            </InfoText>
                                                                        </span>
                                                                        <div className="business-relationship-type-pick">
                                                                            {/* (Its name: every type comes from the answers, no picker; owner, 2026-11-16 19:18.) */}
                                                                            <span>{relationshipTypeLabel(typeId)}</span>
                                                                        </div>
                                                                    </div>

                                                                    {typeId.length > 0 && (
                                                                        <div className="business-relationship-purpose">
                                                                            <BusinessNote
                                                                                label="Purpose"
                                                                                ariaLabel={"Purpose of " + relationshipTypeLabel(typeId) + " for " + offeringName(offeringId)}
                                                                                info={SECTIONS.relationships.purpose}
                                                                                disabled={disabled}
                                                                                value={type.purpose}
                                                                                onChange={(next) => updateType(segment.id, offeringId, typeId, { purpose: next })}
                                                                            />
                                                                        </div>
                                                                    )}

                                                                </div>

                                                                {typeId.length > 0 && (
                                                                    <>
                                                                        <span className="field-group-title business-foundation-subhead business-relationship-strategy-title">
                                                                            <InfoText text="Goal">
                                                                                <InfoNote label="Goal" points={SECTIONS.relationships.goals} fullList />
                                                                            </InfoText>
                                                                            {" & "}
                                                                            <InfoText text="Approach">
                                                                                <InfoNote label="Approach" points={SECTIONS.relationships.approach} fullList />
                                                                            </InfoText>
                                                                        </span>

                                                                        {/* THE ENGAGEMENT STRATEGY AS A TABLE: a column for each journey stage, a row for the Goal and one for the Approach (each label said once). */}
                                                                        <table className="business-relationship-strategy-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    {offeringRows.map(interaction => (
                                                                                        <th scope="col" key={interaction.key + "-" + typeId} style={{ width: (100 / Math.max(offeringRows.length, 1)) + "%" }}>
                                                                                            <span className="business-relationship-stage-title">
                                                                                                {STAGE_LABELS[interaction.stageId]}
                                                                                                {/* What happens at this stage, and through which channels: in the stage's "i". */}
                                                                                                {interaction.groups.length > 0 && (
                                                                                                    <InfoNote
                                                                                                        label={STAGE_LABELS[interaction.stageId] + ": the channels"}
                                                                                                        points={interaction.groups.map(group => ({
                                                                                                            title: group.category.trim().length ? group.category : "No category",
                                                                                                            text: group.channelIds.map(id => channelName(id)).join(", ")
                                                                                                        }))}
                                                                                                        fullList
                                                                                                    />
                                                                                                )}
                                                                                            </span>
                                                                                        </th>
                                                                                    ))}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                {offeringRows.map(interaction => {
                                                                                        const answersFor = interactionOf(segment.id, offeringId, typeId, interaction.key, interaction.legacyKeys);
                                                                                        const about = (STAGE_LABELS[interaction.stageId] ?? "") + ", " + offeringName(offeringId) + ", " + relationshipTypeLabel(typeId);
                                                                                        return (
                                                                                            <td key={interaction.key + "-" + typeId}>
                                                                                                <div className="business-engagement-goal-ticks">
                                                                                                    <BusinessTicks
                                                                                                        name={"Goals for " + about}
                                                                                                        options={GOAL_OPTIONS}
                                                                                                        chosen={answersFor.goals}
                                                                                                        disabled={disabled}
                                                                                                        onChange={(next) => updateInteraction(
                                                                                                            segment.id, offeringId, typeId,
                                                                                                            interaction.key, interaction.legacyKeys,
                                                                                                            { goals: next }
                                                                                                        )}
                                                                                                    />
                                                                                                </div>
                                                                                            </td>
                                                                                        );
                                                                                    })}
                                                                                </tr>
                                                                                <tr>
                                                                                {offeringRows.map(interaction => {
                                                                                        const answersFor = interactionOf(segment.id, offeringId, typeId, interaction.key, interaction.legacyKeys);
                                                                                        const about = (STAGE_LABELS[interaction.stageId] ?? "") + ", " + offeringName(offeringId) + ", " + relationshipTypeLabel(typeId);
                                                                                        return (
                                                                                            <td key={interaction.key + "-" + typeId}>
                                                                                                <StrategyTextArea
                                                                                                    className="interview-input business-foundation-note"
                                                                                                    ariaLabel={"Approach for " + about}
                                                                                                    disabled={disabled}
                                                                                                    value={answersFor.approach}
                                                                                                    onChange={(next) => updateInteraction(
                                                                                                        segment.id, offeringId, typeId,
                                                                                                        interaction.key, interaction.legacyKeys,
                                                                                                        { approach: next }
                                                                                                    )}
                                                                                                />
                                                                                            </td>
                                                                                        );
                                                                                    })}
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </>
                                                                )}

                                                            </div>
                                                        );

                                                    })}


                                                </td>
                                            </tr>

                                        </tbody>
                                    );

                                })}

                </table>

            </div>
        );

    }

    return { addRelationshipType, channelTiles, channelViewChoice, engagedOfferingIds, relationshipsFor, profilesOf };

}
