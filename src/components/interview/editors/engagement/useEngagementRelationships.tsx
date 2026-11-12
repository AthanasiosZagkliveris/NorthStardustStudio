/**
 * THE CHANNEL TILES and the relationships of each Offering.
 * One part of BusinessEngagementEditor (see BusinessEngagementEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import { CSSProperties, useState } from "react";
import CardShell from "../../cards/CardShell.tsx";
import RadioChoice from "../../../controls/RadioChoice.tsx";
import TextLink from "../../fields/TextLink.tsx";
import { Values } from "../ChannelResourceTable.tsx";
import { TABLE_SIZES } from "../../tiles/CapabilityOverview.tsx";
import { BUSINESS_CHANNEL_ALL_OFFERINGS, BUSINESS_CHANNEL_CATEGORIES, BUSINESS_CHANNEL_OTHER, BUSINESS_RELATIONSHIP_TYPES, BusinessChannelValue, BusinessCustomerSegmentValue, channelCategoryHelp, channelCategoryHidden, businessProfileOfferings, businessRelationshipInteractions, createBusinessChannel, segmentHue } from "../../../../framework/engine/AnswerUtils.ts";
import { BusinessAddButton, BusinessEmpty, BusinessNote, BusinessRemove, BusinessStep, BusinessTicks } from "../../cards/BusinessCardFields.tsx";
import FieldRow from "../../fields/FieldRow.tsx";
import { SingleColumn } from "../foundation/shared.tsx";
import { EngagementBox, EngagementBoxes, EngagementCard, ScopeChoice, TickRow, type OptionScope } from "./EngagementCard.tsx";
import { journeySuggestions, suggestedRelationshipType, suggestionMet, type ChannelSuggestion } from "../../../../framework/engine/JourneySuggestions.ts";
import { BUSINESS_JOURNEY_STAGES } from "../../../../framework/engine/AnswerUtils.ts";
import { summaryText } from "../../cards/cardSummary.ts";
import InfoNote, { InfoText } from "../../fields/InfoNote.tsx";
import OptionPicker from "../../fields/OptionPicker.tsx";
import StrategyTextArea from "../../fields/StrategyTextArea.tsx";
import SectionTiles, { DialogHeading, OPEN_EVENT, type OpenRequest, type SectionTile } from "../../tiles/SectionTiles.tsx";
import CardBoxes, { type CardBox } from "../../cards/CardBoxes.tsx";
import FoldArrow from "../../fields/FoldArrow.tsx";
import { SECTIONS, GOAL_OPTIONS, STAGE_LABELS, TYPE_LABELS, relativeInformationFor, channelChoices } from "../BusinessEngagementModel.ts";

import type { useEngagementState } from "./useEngagementState.tsx";
import type { useEngagementChannelBoxes } from "./useEngagementChannelBoxes.tsx";

type Earlier = ReturnType<typeof useEngagementState> & ReturnType<typeof useEngagementChannelBoxes>;

/** The line over the stages a channel is suggested for: they are stages, with no bullet, never drawn as if they were subchannels. */
const SUGGESTED_FOR = "Suggested for";

export function useEngagementRelationships(earlier: Earlier) {

    // (How each Segment's Channels and Journey dialog places its tiles: by channel, or by journey stage; by channel until changed, kept while the page is open.)
    const [channelViews, setChannelViews] = useState<Readonly<Record<string, "channels" | "stages">>>({});
    // (A stage's dialog in the Journey Stages view: its subchannels as a table, until Tiles is chosen; owner, 2026-11-12 19:54: "The default should be a table".)
    const [stageViews, setStageViews] = useState<Readonly<Record<string, "tiles" | "table">>>({});
    // (What each Segment's dialogs offer, From your answers until All is chosen: ScopeChoice.)
    const [scopes, setScopes] = useState<Readonly<Record<string, OptionScope>>>({});
    const showsAll = (segmentId: string) => scopes[segmentId] === "all";
    /** The From your answers / All choice at the head of a Segment's three dialogs: one choice, shared by the three. */
    const scopeChoice = (segmentId: string) => <ScopeChoice group={"option-scope-" + segmentId} value={scopes[segmentId] ?? "answers"} onChange={(next) => setScopes(current => ({ ...current, [segmentId]: next }))} />;
    const { channelCategoryFoldKey, channelTileId, channelsFor, disabled, folds, noPhysical, foundationLink, interactionOf, offeringRelationshipsOf, segmentOf, typeOf, updateInteraction, updateOfferingRelationships, updateSegment, updateType } = earlier;

    /**
     * 1. CUSTOMER CHANNEL AS TILES: a tile for each channel (the group of subchannels under one category), listing its subchannels; pressing it opens that channel's
     * table in a dialog. A new channel is added under the tiles.
     */
    function channelTiles(segment: BusinessCustomerSegmentValue) {
        if (channelViews[segment.id] === "stages") {
            return stageTiles(segment);
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
        const open = journeySuggestions(segment).filter(suggestion => !suggestionMet(suggestion, answers.channels));
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
                // (Its subchannel's card, opened from this channel's dialog, carries no box name: the dialog's heading says it.)
                bareCards: true,
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
                plus: showsAll(segment.id) ? () => {
                    const made = addSub(group.label);
                    window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segment.id, group.key), card: made.id, fresh: true } })), 80);
                } : undefined,
                holds: group.channels.map(channel => channel.id),
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
                        return {
                            id: channel.id,
                            number: at + 1,
                            plain: true,
                            name: channel.name,
                            unnamed: "Unnamed subchannel",
                            lines: key === "" ? undefined : every.map((id, position) => {
                                const owner = cardFor(id);
                                return (cards.length > 1 && owner >= 0 ? (owner + 1) + ". " : "") + offeringLabel(position);
                            }),
                            marks: key === "" ? undefined : every.map(id => cardFor(id) >= 0 ? undefined : { empty: true }),
                            linkedLines: key === "" ? undefined : every.map(() => true),
                            onLine: (index: number) => {
                                const owner = cardFor(every[index]);
                                if (owner >= 0) {
                                    openCardOf(cards[owner].id);
                                } else {
                                    const made = { ...createBusinessChannel(), category: group.label, name: channel.name, offerings: [every[index]] };
                                    updateSegment(segment.id, { channels: [...answers.channels, made] });
                                    openCardOf(made.id);
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
                        .filter(entry => showsAll(segment.id) || entry.lines !== undefined);
                    return (
                        <div className="column-tile-content">
                            <div className="business-engagement-section-head"><DialogHeading title={group.label.trim() || "New channel"} info={channelCategoryHelp(group.label)} /></div>
                            <CardBoxes
                                label={"Subchannels of " + (group.label.trim() || "this channel")}
                                what="Subchannel"
                                autoStart={false}
                                items={[...group.channels.map(tileOf).filter((entry): entry is CardBox => entry !== null), ...spare]}
                                add={showsAll(segment.id) ? {
                                    label: "subchannel",
                                    disabled,
                                    onAdd: () => addSub(group.label).id,
                                    isBlank: (id: string) => {
                                        const found = segmentOf(segment.id).channels.find(entry => entry.id === id);
                                        return !found || found.name.trim() === "";
                                    },
                                    onRemove: (ids: string[]) => updateSegment(segment.id, { channels: segmentOf(segment.id).channels.filter(entry => !ids.includes(entry.id)) })
                                } : undefined}
                            />
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
            .filter(category => showsAll(segment.id) || suggestedIn(category.label).length > 0)
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
                plus: showsAll(segment.id) ? () => {
                    const channel = addChannel(category.label);
                    window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segment.id, channel.id), card: channel.id, fresh: true } })), 80);
                } : undefined,
                content: () => null
            }));
        return (
            <>
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
                {showsAll(segment.id) && (
                    <BusinessAddButton
                        label="Channel"
                        disabled={disabled}
                        onAdd={() => {
                            const channel = createBusinessChannel();
                            updateSegment(segment.id, { channels: [...answers.channels, channel] });
                            folds.expand(channelCategoryFoldKey(segment.id, channel.id));
                        }}
                    />
                )}
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
            const used = answers.channels.filter(channel => channel.stages.includes(stage.id));
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
                    const actionsOf = (channel: BusinessChannelValue) => (channel.actionIds[stage.id] ?? [])
                        .map(id => answers.actions.find(action => action.id === id)?.text.trim() ?? "").filter(text => text !== "");
                    // (The stage's subchannels as a table -- the Inventory's table, its look -- or as tiles: Table first; owner, 2026-11-12 19:54.)
                    const view = stageViews[segment.id] ?? "table";
                    return (
                        <div className="column-tile-content">
                            <div className="business-engagement-section-head">
                                <DialogHeading title={stage.label} />
                            </div>
                            <div className="capability-overview-bar">
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
                                        <table className="capability-overview-table" aria-label={"Subchannels at " + stage.label} data-size={TABLE_SIZES[0].id} style={{ "--table-font": TABLE_SIZES[0].font, "--table-pad": TABLE_SIZES[0].pad } as CSSProperties}>
                                            <thead>
                                                <tr>
                                                    <th scope="col" data-col="name">Subchannel</th>
                                                    <th scope="col" data-col="group">Channel</th>
                                                    <th scope="col" data-col="offering">Offerings</th>
                                                    <th scope="col" data-col="category">{"Actions at " + stage.label}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {used.map(channel => (
                                                    <tr key={channel.id}>
                                                        <th scope="row" data-col="name"><TextLink className="capability-overview-name" onClick={() => openCard(channel.id)}>{nameOf(channel)}</TextLink></th>
                                                        <td data-col="group">{channel.category.trim() || "New channel"}</td>
                                                        <td data-col="offering"><Values items={offeringsOf(channel).map(name => ({ key: name, node: name }))} /></td>
                                                        <td data-col="category"><Values items={actionsOf(channel).map((text, at) => ({ key: String(at), node: text }))} /></td>
                                                    </tr>
                                                ))}
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
    /** The choice at the head of the Channels and Journey dialog: its tiles by channel or by journey stage (the radio of the reports' Tiles or Table). */
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
    function addRelationshipType(segment: BusinessCustomerSegmentValue, offeringId: string): boolean {
        const kept = offeringRelationshipsOf(segment.id, offeringId);
        const free = BUSINESS_RELATIONSHIP_TYPES.find(type => !kept.types.includes(type.id));
        if (free) {
            updateOfferingRelationships(segment.id, offeringId, { types: [...kept.types.filter(type => type !== ""), free.id] });
        }
        return !!free;
    }
    /** The type the Foundation suggests, added from its faded line on the Offering's tile. */
    function addSuggestedRelationshipType(segment: BusinessCustomerSegmentValue, offeringId: string, typeId: string) {
        const kept = offeringRelationshipsOf(segment.id, offeringId);
        if (!kept.types.includes(typeId)) {
            updateOfferingRelationships(segment.id, offeringId, { types: [...kept.types.filter(type => type !== ""), typeId] });
        }
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
    function relationshipsFor(segment: BusinessCustomerSegmentValue, only?: string, asCard = false) {

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
                    Add an Offering to this Segment on the Foundation page,
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
            return (
                <EngagementCard
                    kind="Offering"
                    number={number}
                    name={offeringName(offeringId)}
                    anchor={"relationship-offering-" + offeringId}
                    headless
                >
                    {/* EACH RELATIONSHIP TYPE A BOX (owner, 2026-11-12 23:16: "Rearrange the colour tints ... to see the x button is not possible"): its name, its "i" and its
                        x on the box's title band, as a Customer Source's on the Demand card; then a band for its Purpose and a band for each stage, its Goals in one row
                        and its Approach under them, the tints alternating. The double rule stands between one type and the next. */}
                    <SingleColumn>
                        <EngagementBoxes>{kept.types.map(typeId => {
                            const type = typeOf(segment.id, offeringId, typeId);
                            const label = TYPE_LABELS[typeId] ?? "Relationship Type";
                            return (
                                <EngagementBox
                                    key={typeId}
                                    title={label}
                                    info={SECTIONS.relationships.types}
                                    extra={<BusinessRemove what={label + " Relationship Type for " + offeringName(offeringId)} disabled={disabled} onRemove={() => updateOfferingRelationships(segment.id, offeringId, { types: kept.types.filter(candidate => candidate !== typeId) })} />}
                                    bands={[
                                        <FieldRow key="purpose" pair label="Purpose" info={SECTIONS.relationships.purpose}>
                                            <StrategyTextArea
                                                className="interview-input business-foundation-note"
                                                ariaLabel={"Purpose of " + label + " for " + offeringName(offeringId)}
                                                disabled={disabled}
                                                value={type.purpose}
                                                onChange={(next) => updateType(segment.id, offeringId, typeId, { purpose: next })}
                                            />
                                        </FieldRow>,
                                        ...offeringRows.map(interaction => {
                                            const answersFor = interactionOf(segment.id, offeringId, typeId, interaction.key, interaction.legacyKeys);
                                            const stage = STAGE_LABELS[interaction.stageId] ?? "";
                                            const about = stage + ", " + offeringName(offeringId) + ", " + label;
                                            return (
                                                <FieldRow
                                                    key={interaction.key}
                                                    pair
                                                    fullList
                                                    label={stage}
                                                    info={interaction.groups.length > 0 ? interaction.groups.map(group => ({ title: group.category.trim().length ? group.category : "No category", text: group.channelIds.map(id => channelName(id)).join(", ") })) : undefined}
                                                >
                                                    <TickRow label={"Goals for " + about}>
                                                        <BusinessTicks
                                                            name={"Goals for " + about}
                                                            options={GOAL_OPTIONS}
                                                            chosen={answersFor.goals}
                                                            disabled={disabled}
                                                            onChange={(next) => updateInteraction(segment.id, offeringId, typeId, interaction.key, interaction.legacyKeys, { goals: next })}
                                                        />
                                                    </TickRow>
                                                    <StrategyTextArea
                                                        className="interview-input business-foundation-note"
                                                        ariaLabel={"Approach for " + about}
                                                        placeholder="Approach"
                                                        disabled={disabled}
                                                        value={answersFor.approach}
                                                        onChange={(next) => updateInteraction(segment.id, offeringId, typeId, interaction.key, interaction.legacyKeys, { approach: next })}
                                                    />
                                                </FieldRow>
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
                                                on the Foundation page, as a
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
                                                                            {TYPE_LABELS[typeId] ?? typeId}
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

                                                    {typeRows.map(typeId => {

                                                        const type = typeOf(segment.id, offeringId, typeId);

                                                        return (
                                                            <div className="business-relationship-block" key={offeringId + "-" + (typeId || "unchosen")}>

                                                                {/* The type's x, in the block's top right corner. */}
                                                                {kept.types.length > 0 && (
                                                                    <span className="business-relationship-block-remove">
                                                                        <BusinessStep
                                                                            kind="remove"
                                                                            what={(typeId.length > 0 ? TYPE_LABELS[typeId] + " " : "") + "Relationship Type for " + offeringName(offeringId)}
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
                                                                            <OptionPicker
                                                                                label={"Relationship Type for " + offeringName(offeringId)}
                                                                                placeholder="Select a type"
                                                                                hug
                                                                                options={BUSINESS_RELATIONSHIP_TYPES
                                                                                    .filter(entryType => entryType.id === typeId || !kept.types.includes(entryType.id))
                                                                                    .map(entryType => entryType.label)}
                                                                                disabled={disabled}
                                                                                value={TYPE_LABELS[typeId] ?? ""}
                                                                                onChange={(next) => {
                                                                                    const picked = BUSINESS_RELATIONSHIP_TYPES.find(entryType => entryType.label === next)?.id ?? "";
                                                                                    updateOfferingRelationships(segment.id, offeringId, {
                                                                                        types: kept.types.length === 0
                                                                                            ? [picked]
                                                                                            : kept.types.map(candidate => candidate === typeId ? picked : candidate)
                                                                                    });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {typeId.length > 0 && (
                                                                        <div className="business-relationship-purpose">
                                                                            <BusinessNote
                                                                                label="Purpose"
                                                                                ariaLabel={"Purpose of " + TYPE_LABELS[typeId] + " for " + offeringName(offeringId)}
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
                                                                                        const about = (STAGE_LABELS[interaction.stageId] ?? "") + ", " + offeringName(offeringId) + ", " + TYPE_LABELS[typeId];
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
                                                                                        const about = (STAGE_LABELS[interaction.stageId] ?? "") + ", " + offeringName(offeringId) + ", " + TYPE_LABELS[typeId];
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

                                                    {/* THE TYPE THE FOUNDATION SUGGESTS (doc 28, 7.4): from the help after buying (O7) and the help wanted before (D2); the founder adds it, or leaves it. */}
                                                    {(() => {
                                                        const suggested = suggestedRelationshipType(segment, offeringId);
                                                        return suggested && !kept.types.includes(suggested) && (
                                                            <div className="business-relationship-add">
                                                                <BusinessEmpty>Suggested from your Foundation: {TYPE_LABELS[suggested]}, from the help your customers want before and after they buy.</BusinessEmpty>
                                                                <BusinessStep
                                                                    kind="add"
                                                                    what={TYPE_LABELS[suggested] + " for " + offeringName(offeringId)}
                                                                    label={TYPE_LABELS[suggested]}
                                                                    disabled={disabled}
                                                                    onClick={() => updateOfferingRelationships(segment.id, offeringId, {
                                                                        types: [...kept.types.filter(candidate => candidate !== ""), suggested]
                                                                    })}
                                                                />
                                                            </div>
                                                        );
                                                    })()}

                                                    {kept.types.length < BUSINESS_RELATIONSHIP_TYPES.length && (
                                                        <div className="business-relationship-add">
                                                            <BusinessStep
                                                                kind="add"
                                                                what={"Relationship Type for " + offeringName(offeringId)}
                                                                label="Relationship Type"
                                                                disabled={disabled}
                                                                onClick={() => {
                                                                    const free = BUSINESS_RELATIONSHIP_TYPES.find(entryType => !kept.types.includes(entryType.id));
                                                                    if (free) {
                                                                        updateOfferingRelationships(segment.id, offeringId, { types: [...kept.types, free.id] });
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                </td>
                                            </tr>

                                        </tbody>
                                    );

                                })}

                </table>

            </div>
        );

    }

    return { addRelationshipType, addSuggestedRelationshipType, channelTiles, channelViewChoice, engagedOfferingIds, relationshipsFor, profilesOf, scopeChoice, showsAll };

}
