/**
 * THE CHANNEL TILES and the relationships of each Offering.
 * One part of BusinessEngagementEditor (see BusinessEngagementEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import { CSSProperties } from "react";
import CardShell from "../../cards/CardShell.tsx";
import { BUSINESS_CHANNEL_ALL_OFFERINGS, BUSINESS_CHANNEL_CATEGORIES, BUSINESS_CHANNEL_OTHER, BUSINESS_RELATIONSHIP_TYPES, BusinessChannelValue, BusinessCustomerSegmentValue, channelCategoryHelp, businessProfileOfferings, businessRelationshipInteractions, createBusinessChannel, segmentHue } from "../../../../framework/engine/AnswerUtils.ts";
import { BusinessAddButton, BusinessEmpty, BusinessNote, BusinessStep, BusinessTicks } from "../../cards/BusinessCardFields.tsx";
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

export function useEngagementRelationships(earlier: Earlier) {

    const { channelCategoryFoldKey, channelTileId, channelsFor, disabled, folds, foundationLink, interactionOf, offeringRelationshipsOf, segmentOf, typeOf, updateInteraction, updateOfferingRelationships, updateSegment, updateType } = earlier;

    /**
     * 1. CUSTOMER CHANNEL AS TILES: a tile for each channel (the group of subchannels under one category), listing its subchannels; pressing it opens that channel's
     * table in a dialog. A new channel is added under the tiles.
     */
    function channelTiles(segment: BusinessCustomerSegmentValue) {
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
        // A subchannel of a channel (named, when it is one the category offers).
        const addSub = (category: string, name = "") => {
            const channel = { ...createBusinessChannel(), category, name };
            updateSegment(segment.id, { channels: [...answers.channels, channel] });
            return channel;
        };
        const addChannel = (category: string) => {
            const channel = { ...createBusinessChannel(), category };
            updateSegment(segment.id, { channels: [...answers.channels, channel] });
            folds.expand(channelCategoryFoldKey(segment.id, channel.id));
            return channel;
        };
        const tiles: SectionTile[] = groups.map(group => {
            const names = group.channels.map(channel => channel.name.trim()).filter(name => name.length > 0);
            return {
                id: channelTileId(segment.id, group.key),
                title: group.label.trim() || "New channel",
                view: true,
                items: names,
                itemMarks: names.map(() => ({ bullet: true })),
                // (The "+" adds a subchannel to this channel and opens its card.)
                plus: () => {
                    const made = addSub(group.label);
                    window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segment.id, group.key), card: made.id, fresh: true } })), 80);
                },
                holds: group.channels.map(channel => channel.id),
                note: channelCategoryHelp(group.label),
                cardFor: (id: string) => answers.channels.some(channel => channel.id === id)
                    ? <div className="column-tile-content" style={{ "--strategy-theme-hue": segmentHue(segment) } as CSSProperties}><CardShell engagement={false} className="business-subchannel-card">{channelsFor(segment, group.key, id)}</CardShell></div>
                    : null,
                // The channel's dialog: a tile for each subchannel, and, faded, the ones its category offers that are not used yet.
                content: () => {
                    const category = BUSINESS_CHANNEL_CATEGORIES.find(entry => entry.label === group.label);
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
                    const spare: CardBox[] = (category?.channels ?? [])
                        .filter(entry => !names.includes(entry.label))
                        .map((entry, at) => ({
                            id: "subchannel-inactive-" + group.key + "-" + at,
                            number: group.channels.length + at + 1,
                            plain: true,
                            name: entry.label,
                            unnamed: entry.label,
                            own: true,
                            faded: true,
                            press: () => {
                                const made = addSub(group.label, entry.label);
                                window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segment.id, group.key), card: made.id } })), 80);
                            },
                            content: () => null
                        }));
                    return (
                        <div className="column-tile-content">
                            <div className="business-engagement-section-head"><DialogHeading title={group.label.trim() || "New channel"} info={channelCategoryHelp(group.label)} /></div>
                            <CardBoxes
                                label={"Subchannels of " + (group.label.trim() || "this channel")}
                                what="Subchannel"
                                autoStart={false}
                                items={[...group.channels.map(tileOf).filter((entry): entry is CardBox => entry !== null), ...spare]}
                                add={{
                                    label: "subchannel",
                                    disabled,
                                    onAdd: () => addSub(group.label).id,
                                    isBlank: (id: string) => {
                                        const found = segmentOf(segment.id).channels.find(entry => entry.id === id);
                                        return !found || found.name.trim() === "";
                                    },
                                    onRemove: (ids: string[]) => updateSegment(segment.id, { channels: segmentOf(segment.id).channels.filter(entry => !ids.includes(entry.id)) })
                                }}
                            />
                        </div>
                    );
                }
            };
        });
        // The channels the page offers that this Segment does not use yet: tiles, faded; pressing one makes it (and opens it).
        const unused: SectionTile[] = BUSINESS_CHANNEL_CATEGORIES
            .filter(category => category.label !== BUSINESS_CHANNEL_OTHER && !groups.some(group => group.label === category.label))
            .map(category => ({
                id: channelTileId(segment.id, "inactive-" + category.id),
                title: category.label,
                inactive: true,
                items: [],
                press: () => {
                    const channel = addChannel(category.label);
                    window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segment.id, channel.id), card: channel.id, fresh: true } })), 80);
                },
                plus: () => { addChannel(category.label); },
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
                <BusinessAddButton
                    label="Channel"
                    disabled={disabled}
                    onAdd={() => {
                        const channel = createBusinessChannel();
                        updateSegment(segment.id, { channels: [...answers.channels, channel] });
                        folds.expand(channelCategoryFoldKey(segment.id, channel.id));
                    }}
                />
            </>
        );
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
    function relationshipsFor(segment: BusinessCustomerSegmentValue) {

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
        const profilesFor = (offeringId: string) =>
            segment.profiles.filter(profile =>
                businessProfileOfferings(profile, segment.offerings)
                    .some(offering => offering.id === offeringId)
            );

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
        const offeringIds = engagedOfferingIds(segment);

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

    return { channelTiles, engagedOfferingIds, relationshipsFor };

}
