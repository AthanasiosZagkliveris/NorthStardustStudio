/**
 * THE CHANNEL BOXES: the reference column, the folding section, the resource table and the channel cards.
 * One part of BusinessEngagementEditor (see BusinessEngagementEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import { Fragment, ReactNode } from "react";
import AddButton from "../../../controls/AddButton.tsx";
import { BUSINESS_CHANNEL_ALL_OFFERINGS, BUSINESS_CHANNEL_CATEGORIES, BUSINESS_CHANNEL_OTHER, BUSINESS_ENGAGEMENT_SECTIONS, BUSINESS_JOURNEY_STAGES, BusinessChannelValue, BusinessCustomerSegmentValue, businessChannelNamePlaceholder, channelCategoryHelp, channelOptionHelp, createBusinessChannel } from "../../../../framework/engine/AnswerUtils.ts";
import { BusinessAddButton, BusinessEmpty, OptionalField, BusinessRemove, BusinessStep, BusinessTicks, uniqueChoices } from "../../cards/BusinessCardFields.tsx";
import InfoNote, { InfoText } from "../../fields/InfoNote.tsx";
import NumberedListInput from "../../fields/NumberedListInput.tsx";
import OptionPicker from "../../fields/OptionPicker.tsx";
import { railId } from "../../rails/railItems.ts";
import SuggestedInput from "../../fields/SuggestedInput.tsx";
import { journeyStageLabels } from "../../../../framework/engine/ChannelTableColumns.ts";
import ChannelResourceTable from "../ChannelResourceTable.tsx";
import { buildChannelResourceTable } from "../../../../framework/engine/ChannelResourceTable.ts";
import FoldArrow from "../../fields/FoldArrow.tsx";
import TextLink from "../../fields/TextLink.tsx";
import { SECTIONS, ALL_OFFERINGS_LABEL, STAGE_LABELS, NOTHING_RECORDED, RelativeQuestion, relativeInformation, relativeInformationFor, channelNameOptions, stageOptionsFor, stageIsUsual } from "../BusinessEngagementModel.ts";

import type { useEngagementState } from "./useEngagementState.tsx";

type Earlier = ReturnType<typeof useEngagementState>;

export function useEngagementChannelBoxes(earlier: Earlier) {

    const { cards, channelActions, channelCategoryFoldKey, channelResources, collapsed, currency, disabled, engagement, folds, isolatingSegment, offeringsOfMadeCards, onOpenCapability, onOpenFoundation, openAction, relatedStages, segmentOf, segments, setLit, toggle, updateChannel, updateSegment } = earlier;

    /** The card on Page 1 with this id, and the Segment it is in. */
    function foundationPath(id: string): string[] {
        const segment = segments.find(entry => entry.id === id ||
            entry.profiles.some(profile => profile.id === id) ||
            entry.offerings.some(offering => offering.id === id) ||
            entry.competitors.some(competitor => competitor.id === id));
        return segment && segment.id !== id ? [id, segment.id] : [id];
    }
    /* ---------- Building blocks of this page ---------- */

    /**
     * A name answered on Page 1, drawn as the link that opens it.
     *
     * A button rather than an anchor: it moves the interview to
     * another Section rather than following a URL, and a control
     * that does not navigate the browser should not claim to.
     * Without somewhere to go it is plain text -- a link that leads
     * nowhere is worse than none.
     */
    function foundationLink(name: string, what: string, id?: string) {

        const shown = name.trim().length > 0 ? name.trim() : "Not named yet";

        if (!onOpenFoundation || name.trim().length === 0) {
            return (
                <span className="business-engagement-reference-name">
                    {shown}
                </span>
            );
        }

        return (
            <TextLink
                type="button"
                className="business-engagement-link"
                aria-label={"Open the Foundation page, where the " + what +
                    " " + shown + " is defined"}
                onClick={() => onOpenFoundation(id ? foundationPath(id) : undefined)}
            >
                {shown}
            </TextLink>
        );

    }
    /**
     * One column of the reference header: what Page 1 names, and
     * what it says about each of them.
     *
     * EACH NAME CARRIES ITS OWN INFORMATION, directly beneath it.
     * The two used to be separate lists -- every name, then every
     * fact prefixed with the name it belonged to -- which made the
     * reader match them up by eye and said each name twice.
     *
     * A "Relative Information" label sat between the title and the
     * entries, with the "i" on it. Both have gone: the label named
     * what the column's own title already names, and the column
     * carries the "i" itself.
     */
    function referenceColumn(
        title: string,
        what: string,
        /* A function rather than a list, because the Customer
           Segment's third question depends on the Segment -- see
           segmentQuestions. The other two columns ignore what they
           are handed. */
        questionsFor: (description: Record<string, string>) => RelativeQuestion[],
        sources: readonly {
            key: string;
            name: string;
            description: Record<string, string>;
        }[],
        /**
         * Whether each entry folds away.
         *
         * The Profiles and the Offerings do: a Segment can have
         * three of each, every one with three sections under it,
         * and a reader working on one channel does not need all
         * nine open. The Segment column's one entry folds too, and
         * starts folded like the others.
         */
        _foldable: boolean | "open" = false,
        /** The card's number, written before the column's label
         *  ("1. SEGMENT") on the Segment column only. */
        number?: number,
        /** The Segment card's fold arrow, hung in the card's arrow
         *  column before the number (the Segment column only). */
        cardArrow?: ReactNode
    ) {

        return (
            <div className="business-engagement-reference-column">

                <span className="business-foundation-label-info">
                    <span className="field-group-title business-foundation-subhead">
                        {cardArrow}
                        {number !== undefined && (
                            <span className="business-engagement-reference-number">
                                {number + "."}
                            </span>
                        )}
                        <InfoText text={title}>
                            <InfoNote
                                label={title}
                                points={relativeInformation(
                                    questionsFor(sources[0]?.description ?? {})
                                )}
                                fullList
                            />
                        </InfoText>
                    </span>
                </span>

                {sources.length === 0
                    ? (
                        <p className="business-engagement-reference-empty">
                            {NOTHING_RECORDED}
                        </p>
                    )
                    : sources.map(source => {

                        const sections = relativeInformationFor(
                            questionsFor(source.description), source.description
                        );

                        return (
                            <div
                                className="business-engagement-reference-entry"
                                key={source.key}
                            >

                                <div className="business-engagement-reference-name-row">

                                    {foundationLink(source.name, what, source.key)}

                                    {/* What Page 1 says about it opens in a pop-up window (the "i"), not folded down inside the column. */}
                                    {sections.length > 0 && (
                                        <InfoNote
                                            label={source.name.trim() || what}
                                            points={sections.map(section => ({ title: section.label, text: section.text }))}
                                            fullList
                                        />
                                    )}

                                </div>

                            </div>
                        );

                    })}

            </div>
        );
    }
    /**
     * One of the card's two sections, with the arrow that folds it.
     *
     * The same arrow every card on this page and Page 1 carries
     * (.strategy-box-toggle), in front of the same subhead -- so a
     * section folds the way a card does, and the control is the one
     * already learned.
     *
     * The body is a function, not markup, so a folded section costs
     * nothing to draw: a Segment's whole Channels table is not
     * built to be hidden.
     *
     * `titleExtra` is drawn at the far end of the title row -- the
     * section's own "Expand all", for the item cards its body
     * holds. Given here rather than inside `body` so it still shows
     * while the section itself is folded shut.
     */
    function foldingSection(
        key: string,
        title: string,
        body: () => ReactNode,
        sectionIndex: number,
        titleExtra?: ReactNode
    ) {

        const open = !collapsed.has(key);

        return (
            <div
                className="business-engagement-section"
                data-anchor={"engagement-section-" + key}
                data-rail={railId(BUSINESS_ENGAGEMENT_SECTIONS[sectionIndex])}
            >

                <div className="business-engagement-section-head fold-group-head">

                    <FoldArrow open={open} label={title} onToggle={() => toggle(key)} />

                    {/* The section's guidance is its "i", a pop-up window (there is no Hide Help button). */}
                    <span className="field-group-title business-foundation-subhead">
                        <InfoText text={title}>
                            <InfoNote label={title} points={sectionIndex === 0 ? SECTIONS.channels.instructions : SECTIONS.relationships.instructions} fullList />
                        </InfoText>
                    </span>

                    {titleExtra}

                </div>

                {open && body()}

            </div>
        );

    }
    /**
     * CHANNEL RESOURCES: the Segment's channel resources as one
     * read-only, auto-generated table under its Customer Channel table
     * (ChannelResourceTable.ts). A fold of its own, open until folded;
     * not drawn while the Segment has none. Pointing at it lights, and
     * what the Customer Channel table isolates leaves it as it is: it
     * lists every resource, whatever the rows above show.
     */
    function channelResourceTable(segment: BusinessCustomerSegmentValue) {

        const answers = segmentOf(segment.id);
        const table = buildChannelResourceTable(
            engagement,
            answers,
            cards,
            currency,
            segments.flatMap(entry => entry.offerings)
        );

        if (table.rows.length === 0) {
            return null;
        }

        const key = segment.id + "-channel-resources";
        const open = !collapsed.has(key);

        return (
            <div className="business-engagement-section business-channel-resources-section" data-anchor={"engagement-section-" + key}>

                <div className="business-engagement-section-head fold-group-head">

                    <FoldArrow open={open} label="channel expenses" onToggle={() => toggle(key)} />

                    <span className="field-group-title business-foundation-subhead">Channel expenses</span>

                </div>

                {open && (
                    <ChannelResourceTable
                        table={table}
                        segmentName={segment.name.trim() || "this Segment"}
                        onOpenCard={onOpenCapability ? (row) => onOpenCapability(row.anchors) : undefined}
                        onOpenAction={(actionId) => openAction(answers.segmentId, actionId)}
                        onLit={setLit}
                    />
                )}

            </div>
        );

    }
    /* ---------- 1. Customer Channel ---------- */
    /**
     * The Channels table.
     *
     * A TABLE, not a stack of cards, because that is the shape the
     * specification draws twice -- once as the field list ("Channel,
     * Links, Offerings, Journey Stage, Action") and once as the
     * final UI. Five columns, and the reading it supports is across
     * rather than down: which channels reach this Segment, what each
     * one carries, and when.
     *
     * Two things span, and both come straight from that drawing:
     *
     * - THE CATEGORY is a row of its own across all five columns,
     *   with its channels beneath it. "The category is a container
     *   and should not be repeated for every row."
     * - A CHANNEL'S first three cells span its journey stages, so
     *   LinkedIn's name, links and offerings are written once and
     *   Discovery and Evaluation each get their own row beside
     *   them. One row is one interaction; one channel is as many
     *   rows as it has stages.
     */
    function channelsFor(segment: BusinessCustomerSegmentValue, only?: string, sub?: string) {

        const answers = segmentOf(segment.id);

        // Unique labels, as every other picker has (see
        // uniqueChoices): two Offerings sharing a name are told apart,
        // and a label chosen maps back to exactly one id.
        const offeringOptions = uniqueChoices(
            segment.offerings.map((offering, index) => ({
                id: offering.id,
                name: offering.name.trim().length > 0
                    ? offering.name
                    : "Offering " + (index + 1) + ", not named yet"
            })),
            ""
        );

        /*
            Grouped by category, drawn in the fixed order the
            category list gives. A channel whose category has not
            been chosen yet is grouped at the end, under a heading
            that says so, and moves up into its category the moment
            one is picked -- which is the nesting rule making itself
            visible.
        */
        /*
            Grouped by category, IN THE ORDER THE CATEGORIES FIRST
            APPEAR rather than in the fixed list's order -- a
            category can now be one the founder named themselves,
            and a name has no place in a list it is not in.

            Each group is keyed by its FIRST CHANNEL, never by the
            category: the category is typed into, and a key that
            changed with every keystroke would rebuild the group and
            take the caret out of the box being typed into.
        */
        const groups: {
            key: string;
            label: string;
            channels: BusinessChannelValue[];
        }[] = [];

        for (const channel of answers.channels) {

            const group = groups.find(entry => entry.label === channel.category);

            if (group) {
                group.channels.push(channel);
            } else {
                groups.push({
                    key: channel.id,
                    label: channel.category,
                    channels: [channel]
                });
            }

        }

        /* THE HEAD OF A SUBCHANNEL'S CARD: its name (typed, with the category's own places offered), its "i" and its x -- said once, here. */
        const subchannelHead = () => {
            const channel = answers.channels.find(entry => entry.id === sub);
            if (!channel) {
                return "Subchannel";
            }
            return (
                <div className="strategy-box-head business-subchannel-head">
                    {/* (No order number: it is for the code, not for the user.) */}
                    {/* A CHANNEL (Social Media) HAS SUBCHANNELS (LinkedIn, Facebook ...). A new card's top cell is a DROP-DOWN of its channel's subchannels; "Other" turns it into a TEXT HOLDER for the user's own name. A name from the list is said, not asked again. */}
                    {(() => {
                        const known = channelNameOptions(channel.category, answers.channels.filter(candidate => candidate.id !== channel.id)).filter(option => option !== BUSINESS_CHANNEL_OTHER);
                        const typed = channel.name.trim() !== "" && channel.name !== BUSINESS_CHANNEL_OTHER && !known.some(option => option.toLocaleLowerCase() === channel.name.trim().toLocaleLowerCase());
                        if (channel.name.trim() !== "" && channel.name !== BUSINESS_CHANNEL_OTHER && !typed && channel.category !== BUSINESS_CHANNEL_OTHER) {
                            return <span className="business-subchannel-name">{channel.name}</span>;
                        }
                        if (typed || channel.name === BUSINESS_CHANNEL_OTHER || channel.category === BUSINESS_CHANNEL_OTHER) {
                            return (
                                <SuggestedInput
                                    label="Subchannel name"
                                    placeholder="Name this subchannel"
                                    options={[]}
                                    disabled={disabled}
                                    autoFocus={channel.name === BUSINESS_CHANNEL_OTHER}
                                    value={channel.name === BUSINESS_CHANNEL_OTHER ? "" : channel.name}
                                    onChange={(next) => updateChannel(segment.id, channel.id, { name: next })}
                                />
                            );
                        }
                        // (A DROP-DOWN ONLY: nothing is typed here; "Other" is the way to a name of the user's own.)
                        return (
                            <OptionPicker
                                label="Subchannel name"
                                placeholder="Select a subchannel"
                                // (A subchannel that is already used -- it has a card -- is not offered again: its Offerings are added on its own card.)
                                options={channelNameOptions(channel.category, answers.channels.filter(candidate => candidate.id !== channel.id))
                                    .filter(option => option === BUSINESS_CHANNEL_OTHER || !answers.channels.some(other => other.id !== channel.id && other.category === channel.category && other.name.trim().toLocaleLowerCase() === option.toLocaleLowerCase()))}
                                disabled={disabled}
                                value={channel.name}
                                onChange={(next) => updateChannel(segment.id, channel.id, { name: next })}
                            />
                        );
                    })()}
                    {/* The x, in the head, as every card's. */}
                    <BusinessRemove
                        what="Subchannel"
                        disabled={disabled}
                        onRemove={() => updateSegment(segment.id, { channels: answers.channels.filter(candidate => candidate.id !== channel.id) })}
                    />
                </div>
            );
        };

        // Numbered down the table as it is actually drawn, so a
        // channel's number is its own position.
        let position = 0;

        /* ISOLATING (a symbol's click): the categories and channels with
           no isolated action are not drawn, a channel's stage rows with
           none are not drawn, and no "+ Channel" row stands. A category
           folded shut stays folded (the fold states are not touched). */
        // (With `only`, the table of ONE channel -- a tile's dialog: its group is drawn open, no other, and no "add" under it.)
        const isolating = isolatingSegment(segment.id);
        const keeps = (channel: BusinessChannelValue) => relatedStages(answers, segment.id, channel).length > 0;
        const keptGroups = groups.filter(group => group.label.trim().length > 0 && group.channels.some(keeps));
        const lastKept = keptGroups[keptGroups.length - 1];
        const lastKeptChannel = lastKept && (isolating || folds.isOpen(channelCategoryFoldKey(segment.id, lastKept.key)))
            ? lastKept.channels.filter(keeps).pop()
            : undefined;

        return (
            <>

                {/* The table scrolls sideways inside its own box
                    rather than making the page do it: five columns
                    have a width below which they stop being five
                    columns, and the rest of the page has no reason
                    to move with them. */}
                {sub !== undefined && subchannelHead()}
                <div className="business-channel-table-wrap">

                    <table className={"business-channel-table" + (isolatingSegment(segment.id) ? " is-isolating" : "")}>

                        <thead>
                            <tr>
                                {/* The channel, and under it where it
                                    is: a Links column of its own held
                                    nothing on most rows and put a
                                    destination as far from its channel
                                    as an Action is. */}
                                <th scope="col" className="business-channel-th-name">
                                    {sub !== undefined ? null : "Channel"}
                                </th>
                                <th scope="col" className="business-channel-th-offerings">{sub === undefined && "Offerings"}</th>
                                <th scope="col" className="business-channel-th-stage">
                                    <span className="business-foundation-label-info">
                                        <span>
                                            <InfoText text="Journey Stage">
                                                <InfoNote
                                                    label="Journey Stage"
                                                    points={SECTIONS.channels.stages}
                                                    fullList
                                                />
                                            </InfoText>
                                        </span>
                                    </span>
                                </th>
                                <th scope="col" className="business-channel-th-action">
                                    {sub !== undefined && (
                                        <span className="business-foundation-label-info business-channel-th-actions-per-stage">
                                            <InfoText text="Actions">
                                                <InfoNote label="Action" points={SECTIONS.channels.actions} fullList />
                                            </InfoText>
                                            {" per "}
                                            <InfoText text="Journey Stage">
                                                <InfoNote label="Journey Stage" points={SECTIONS.channels.stages} fullList />
                                            </InfoText>
                                        </span>
                                    )}
                                    {sub === undefined && <span className="business-foundation-label-info">
                                        <span>
                                            <InfoText text="Action">
                                                <InfoNote
                                                    label="Action"
                                                    points={SECTIONS.channels.actions}
                                                    fullList
                                                />
                                            </InfoText>
                                        </span>
                                    </span>}
                                </th>
                            </tr>
                        </thead>

                        {/* A TABLE WITH NOTHING IN IT SAYS SO. Now
                            that a category can be removed, the last
                            one can be too -- and a head row with
                            nothing under it reads as broken rather
                            than as empty. It also gives the table a
                            last row to round its bottom corners
                            on. */}
                        {!isolating && groups.length === 0 && (
                            <tbody>
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="business-channel-cell"
                                    >
                                        <BusinessEmpty>
                                            No channel yet. Add a Channel Category
                                            below, then name the channels filed
                                            under it.
                                        </BusinessEmpty>
                                    </td>
                                </tr>
                            </tbody>
                        )}

                        {groups.map(group => {

                          /* Folded by default, like the relationship
                             blocks -- see channelCategoryFoldKey. */
                          const categoryFoldKey =
                              channelCategoryFoldKey(segment.id, group.key);

                          /* Isolating shows every category that holds a related row, open
                             whatever its fold (the folds themselves are untouched). */
                          const categoryOpen = isolating || only !== undefined || folds.isOpen(categoryFoldKey);

                          if (only !== undefined && group.key !== only) {
                              position += group.label.trim().length > 0 ? group.channels.length : 0;
                              return null;
                          }

                          if (isolating && !keptGroups.includes(group)) {
                              // Counted all the same: the numbers after it stay their own.
                              position += group.label.trim().length > 0 ? group.channels.length : 0;
                              return null;
                          }

                          return (

                            <tbody key={group.key}>

                                {/* THE CATEGORY, ONCE, ACROSS THE
                                    TABLE -- and it is chosen here,
                                    not inside the channels under
                                    it.

                                    The category is a container. It
                                    belongs at the head of the
                                    group it names, and a copy of it
                                    in every channel row was the
                                    same answer written twice.

                                    Changing it re-files everything
                                    in this group, which is what a
                                    container's own label does: the
                                    group becomes that category,
                                    channels and all. Picking one
                                    that already has a group merges
                                    the two. */}
                                <tr className="business-channel-category-row">
                                    {/* In the CHANNEL COLUMN'S OWN
                                        CELL, not spanning the table:
                                        the picker then lines up
                                        exactly with the channel
                                        names it heads, because it is
                                        in the same column they are.
                                        The other four columns are
                                        one empty cell carrying the
                                        row's ground. */}
                                    <th scope="rowgroup" data-anchor={"channel-category-" + group.key}>
                                        <div className="business-channel-category">

                                            {/* THE ARROW BESIDE THE
                                                CATEGORY, folding the
                                                channels filed under
                                                it. Only once it has a
                                                name: an unnamed
                                                category has no
                                                channels drawn to
                                                fold. */}
                                            {group.label.trim().length > 0 && (
                                                <FoldArrow
                                                    open={categoryOpen}
                                                    label={group.label}
                                                    onToggle={() => folds.toggle(categoryFoldKey)}
                                                />
                                            )}

                                            {/* The seven, and "Other" --
                                                which empties the box so a
                                                category of the founder's
                                                own can be typed straight
                                                into it, exactly as a
                                                channel's name is. */}
                                            {/* In a channel's tile the channel is named by its tile: no dropdown. */}
                                            {only !== undefined && group.label.trim() !== ""
                                                ? <span className="business-channel-category-static">{group.label}</span>
                                                : (
                                            <SuggestedInput
                                                label={
                                                    "Channel for " +
                                                    group.channels
                                                        .map(channel =>
                                                            channel.name.trim() ||
                                                            "an unnamed subchannel")
                                                        .join(", ")
                                                }
                                                placeholder="Channel"
                                                /* A CATEGORY ALREADY IN THE TABLE
                                                   IS NOT OFFERED AGAIN. Picking
                                                   one merges this group into that
                                                   one, which is never what the
                                                   reader means by choosing it from
                                                   a list of things to make. This
                                                   group's own category stays, so
                                                   the box can still show it. */
                                                options={[
                                                    ...BUSINESS_CHANNEL_CATEGORIES
                                                        // "Other" last, once: the entry that lets a category be typed.
                                                        .filter(category => category.label !== BUSINESS_CHANNEL_OTHER)
                                                        .filter(category =>
                                                            category.label === group.label ||
                                                            !groups.some(other =>
                                                                other.label === category.label
                                                            )
                                                        )
                                                        .map(category => category.label),
                                                    BUSINESS_CHANNEL_OTHER
                                                ]}
                                                disabled={disabled}
                                                value={group.label}
                                                onChange={(category) => {

                                                    const moving = new Set(
                                                        group.channels.map(
                                                            channel => channel.id
                                                        )
                                                    );

                                                    updateSegment(segment.id, {
                                                        channels: answers.channels.map(
                                                            channel => moving.has(channel.id)
                                                                ? { ...channel, category }
                                                                : channel
                                                        )
                                                    });

                                                }}
                                            />
                                                )}

                                            {/* THE WHOLE GROUP, CHANNELS AND
                                                ALL. A category is not a label
                                                on top of the channels under it
                                                -- it IS them, and the table
                                                had no way to take one back:
                                                Add Channel Category made a
                                                group that nothing could
                                                remove.

                                                It says what it takes with it.
                                                A channel removed by mistake
                                                costs its links, its Offerings
                                                and its Actions, and a control
                                                that removes five of them at
                                                once should name them before
                                                it is pressed. */}
                                            {/* What the categories are, the chosen one first. */}
                                            <InfoNote
                                                label="Channel"
                                                points={channelCategoryHelp(group.label)}
                                                fullList
                                                size="wide"
                                            />

                                            <BusinessRemove
                                                what={
                                                    "Channel " +
                                                    (group.label.trim() ||
                                                        "with no name yet") +
                                                    (group.channels.length > 0
                                                        ? " and its " +
                                                            group.channels.length +
                                                            " subchannel" +
                                                            (group.channels.length === 1
                                                                ? "" : "s")
                                                        : "")
                                                }
                                                disabled={disabled}
                                                onRemove={() => updateSegment(
                                                    segment.id,
                                                    {
                                                        channels: answers.channels
                                                            .filter(candidate =>
                                                                candidate.category !==
                                                                    group.label
                                                            )
                                                    }
                                                )}
                                            />

                                        </div>

                                        {/* Folded, the category still
                                            says how much it holds -- on
                                            its own line under the select,
                                            so the select keeps its width. */}
                                        {group.label.trim().length > 0 && !categoryOpen && (
                                            <div className="business-card-summary business-channel-category-summary">
                                                {group.channels.length +
                                                    (group.channels.length === 1
                                                        ? " subchannel"
                                                        : " subchannels")}
                                            </div>
                                        )}

                                    </th>
                                    <td colSpan={3} />
                                </tr>

                                {/* NOTHING UNTIL THE CATEGORY IS
                                    CHOSEN. A channel's name list, its
                                    journey stages and its own prompt
                                    all come from its category, so a
                                    row offered before one is picked is
                                    a row that cannot be answered
                                    properly. The category row stands
                                    alone until it has an answer. */}
                                {group.label.trim().length > 0 &&
                                    group.channels.map(channel => {

                                    position += 1;

                                    /* COUNTED WHETHER IT IS DRAWN OR
                                       NOT, so folding a category does
                                       not renumber the channels under
                                       every category after it -- a
                                       channel's number is its own. */
                                    const number = position;

                                    // (With `sub`, the one subchannel: its card.)
                                    if (sub !== undefined && channel.id !== sub) {
                                        return null;
                                    }

                                    if (!categoryOpen || (isolating && !keeps(channel))) {
                                        return null;
                                    }

                                    const change = (
                                        patch: Partial<BusinessChannelValue>
                                    ) => updateChannel(segment.id, channel.id, patch);

                                    /* The stages this channel is used at --
                                       and one empty row when it has none
                                       yet, so the Journey Stage column
                                       always shows the dropdown that
                                       chooses one rather than a bare
                                       button. */
                                    const stageRows = isolating
                                        ? relatedStages(answers, segment.id, channel)
                                        : channel.stages.length > 0
                                            ? channel.stages
                                            : [""];

                                    const span = stageRows.length;

                                    /* The same, for the Offerings cell: one
                                       row per Offering carried, or one empty
                                       row to choose the first.

                                       A channel marked as carrying ALL of them
                                       is ONE row saying so, not one row per
                                       Offering -- and it keeps meaning all of
                                       them as Page 1 gains more. */
                                    const carriesAll = channel.offerings.includes(
                                        BUSINESS_CHANNEL_ALL_OFFERINGS
                                    );

                                    /* A SUBCHANNEL IS USED ONCE BY AN OFFERING (but may have many cards, each with its own actions and costs): the Offerings another card of this subchannel already serves are blocked here. */
                                    const TAKEN_NOTE = "Already uses this subchannel";
                                    const takenByOthers = new Set<string>(
                                        channel.name.trim() === ""
                                            ? []
                                            : answers.channels
                                                .filter(other => other.id !== channel.id && other.category === channel.category && other.name.trim().toLocaleLowerCase() === channel.name.trim().toLocaleLowerCase())
                                                .flatMap(other => other.offerings.includes(BUSINESS_CHANNEL_ALL_OFFERINGS) ? offeringOptions.map(option => option.id) : other.offerings)
                                                .filter(id => !channel.offerings.includes(id) && !carriesAll)
                                    );

                                    const offeringRows = carriesAll
                                        ? [BUSINESS_CHANNEL_ALL_OFFERINGS]
                                        : channel.offerings.length > 0
                                            ? channel.offerings
                                            : [""];

                                    /* The channel itself: its name,
                                       the category it is filed
                                       under, and the control that
                                       removes it. Written once and
                                       spanning its stages. */
                                    const channelCells = (
                                        <>

                                            {/* A step in from the category
                                                row above it, the way every
                                                level on this page sits in
                                                from the arrow that folds
                                                the one above. */}
                                            <td
                                                rowSpan={span}
                                                className={"business-channel-cell business-channel-cell-nested business-channel-td-name" + (lastKeptChannel === channel ? " business-channel-corner-bl" : "")}
                                                data-anchor={"channel-" + channel.id}
                                            >

                                                <div className="business-channel-name">

                                                    {/* (A subchannel's own card names it in its table's head, once: the name is typed there.) */}
                                                    {sub === undefined && (
                                                        <>
                                                    <span
                                                        className="business-channel-nest"
                                                        aria-hidden="true"
                                                    >
                                                        ↳
                                                    </span>

                                                    {/* Typed straight in, with the
                                                        category's own places and
                                                        whatever is already recorded
                                                        under it offered beside it --
                                                        so the same place is named the
                                                        same way every time without
                                                        anything else having to be
                                                        chosen first. */}
                                                    <SuggestedInput
                                                        label={
                                                            "Subchannel " + number + " name"
                                                        }
                                                        /* What the category calls the
                                                           thing being named: a page, an
                                                           address, a way of being paid. */
                                                        placeholder={
                                                            businessChannelNamePlaceholder(
                                                                channel.category
                                                            )
                                                        }
                                                        options={channelNameOptions(
                                                            channel.category,
                                                            answers.channels.filter(
                                                                candidate =>
                                                                    candidate.id !== channel.id
                                                            )
                                                        )}
                                                        disabled={disabled}
                                                        value={channel.name}
                                                        onChange={(next) => change({
                                                            name: next
                                                        })}
                                                    />

                                                    {/* What its category's channels are, the chosen one first. */}
                                                    {channelOptionHelp(channel.category, channel.name).length > 0 && (
                                                        <InfoNote
                                                            label="Subchannel"
                                                            points={channelOptionHelp(channel.category, channel.name)}
                                                            fullList
                                                            size="wide"
                                                        />
                                                    )}

                                                    {(answers.channels.length > 1 || sub !== undefined) && (
                                                        <BusinessRemove
                                                            what={"Subchannel " + number}
                                                            disabled={disabled}
                                                            onRemove={() => updateSegment(
                                                                segment.id,
                                                                {
                                                                    channels: answers.channels
                                                                        .filter(candidate =>
                                                                            candidate.id !== channel.id
                                                                        )
                                                                }
                                                            )}
                                                        />
                                                    )}

                                                        </>
                                                    )}

                                                    {/* No second box for "Other": the
                                                        name is typed into the one box
                                                        there is.

                                                        No category picker here either: the
                                                        category is chosen once, on
                                                        the row that names the group
                                                        this channel sits in. */}

                                                    {/* WHERE THE CHANNEL IS, UNDER
                                                        WHAT IT IS CALLED. A column of
                                                        its own put a destination as far
                                                        from its channel as an Action is,
                                                        and left it holding nothing on
                                                        every row that had no link to
                                                        give -- which is most of them,
                                                        since a link is optional and the
                                                        box says so. */}
                                                    <div className="business-channel-links">
                                                        {/* While the table isolates nothing is created: no new Links box, no new line. */}
                                                        <OptionalField
                                                            label="Links"
                                                            inline={sub !== undefined}
                                                            filled={channel.links.some(link => link.trim() !== "")}
                                                            onClear={() => change({ links: [] })}
                                                            disabled={disabled || (isolating && !channel.links.some(link => link.trim() !== ""))}
                                                        >
                                                            <NumberedListInput
                                                                label={"Links for Subchannel " + number}
                                                                placeholder="Link"
                                                                items={channel.links}
                                                                maxItems={isolating ? channel.links.length : undefined}
                                                                disabled={disabled}
                                                                onChange={(items) => change({ links: items })}
                                                            />
                                                        </OptionalField>
                                                    </div>

                                                    {/* What it needs: its resources, made in
                                                        3. Offering's Capability. */}
                                                    {/* (In a channel's card the section has its own heading, "Expenses", with its "+", and a regular x beside each expense.) */}
                                                    {sub !== undefined
                                                        ? <div className="business-channel-expenses">{channelResources(answers, channel.id, "Subchannel " + number, "Expenses")}</div>
                                                        : channelResources(answers, channel.id, "Subchannel " + number)}

                                                </div>

                                            </td>

                                            {/* ONE DROPDOWN PER OFFERING, with
                                                the small + and × that add and
                                                take one away. A cell that holds
                                                several values grows a line at a
                                                time, and every line is the same
                                                control. */}
                                            <td rowSpan={span} className="business-channel-cell business-channel-td-offerings">
                                                {sub !== undefined && <span className="business-channel-field-label">Offerings</span>}
                                                {offeringOptions.length === 0
                                                    ? (
                                                        <BusinessEmpty>
                                                            Add an Offering to this Segment on
                                                            the Foundation page.
                                                        </BusinessEmpty>
                                                    )
                                                    : sub !== undefined
                                                        // A channel's CARD lists its Offerings as tick boxes (a set, not one value): "All Offerings" first -- one choice for the lot --, then each Offering; at least one stays ticked.
                                                        ? (
                                                            <BusinessTicks
                                                                name={"Offerings of Subchannel " + number}
                                                                disabled={disabled}
                                                                options={[
                                                                    { id: BUSINESS_CHANNEL_ALL_OFFERINGS, label: ALL_OFFERINGS_LABEL, blocked: takenByOthers.size > 0 ? TAKEN_NOTE : undefined },
                                                                    ...offeringOptions.map(option => ({ id: option.id, label: option.label, blocked: takenByOthers.has(option.id) ? TAKEN_NOTE : undefined }))
                                                                ]}
                                                                // ("All Offerings" is ticked whenever every Offering is: carried as all, or each one ticked.)
                                                                chosen={carriesAll || (offeringOptions.length > 0 && offeringOptions.every(option => channel.offerings.includes(option.id))) ? [BUSINESS_CHANNEL_ALL_OFFERINGS, ...offeringOptions.map(option => option.id)] : channel.offerings}
                                                                onChange={(next) => {
                                                                    // (Some Offerings already use this subchannel on another card: only the free ones can be chosen here.)
                                                                    if (takenByOthers.size > 0) {
                                                                        const free = next.filter(id => id !== BUSINESS_CHANNEL_ALL_OFFERINGS && !takenByOthers.has(id));
                                                                        if (free.length > 0) {
                                                                            change({ offerings: free });
                                                                            offeringsOfMadeCards(channel.id, free, offeringOptions.map(option => option.id));
                                                                        }
                                                                        return;
                                                                    }
                                                                    const every = offeringOptions.map(option => option.id);
                                                                    const put = (offerings: string[]) => {
                                                                        change({ offerings });
                                                                        offeringsOfMadeCards(channel.id, offerings, every);
                                                                    };
                                                                    const allShown = carriesAll || (every.length > 0 && every.every(id => channel.offerings.includes(id)));
                                                                    if (allShown) {
                                                                        if (!next.includes(BUSINESS_CHANNEL_ALL_OFFERINGS)) {
                                                                            // "All Offerings" unticked: the first Offering stays.
                                                                            put(every.slice(0, 1));
                                                                        } else {
                                                                            // One Offering unticked while all were carried: all the others.
                                                                            const left = every.filter(id => next.includes(id));
                                                                            if (left.length > 0) {
                                                                                put(left);
                                                                            }
                                                                        }
                                                                        return;
                                                                    }
                                                                    if (next.includes(BUSINESS_CHANNEL_ALL_OFFERINGS) || (every.length > 0 && every.every(id => next.includes(id)))) {
                                                                        // (Ticking the last one is ticking "All Offerings": one value, true as Offerings are added.)
                                                                        put([BUSINESS_CHANNEL_ALL_OFFERINGS]);
                                                                        return;
                                                                    }
                                                                    if (next.length > 0) {
                                                                        put(next);
                                                                    }
                                                                }}
                                                            />
                                                        )
                                                        : offeringRows.map((offeringId, index) => (

                                                        <div
                                                            className="business-channel-pick"
                                                            key={offeringId || "unchosen"}
                                                        >

                                                            <OptionPicker
                                                                label={
                                                                    "Offering " + (index + 1) +
                                                                    " for Subchannel " + number
                                                                }
                                                                placeholder="Select offerings"
                                                                /* Everything still free,
                                                                   plus this row's own: an
                                                                   Offering cannot be
                                                                   carried twice by one
                                                                   channel.

                                                                   ALL leads, for the
                                                                   channel that carries
                                                                   the lot -- one choice
                                                                   instead of five, and it
                                                                   stays true as Page 1
                                                                   gains more. */
                                                                options={[
                                                                    ALL_OFFERINGS_LABEL,
                                                                    ...offeringOptions
                                                                        .filter(option =>
                                                                            option.id === offeringId ||
                                                                            !channel.offerings.includes(option.id)
                                                                        )
                                                                        .map(option => option.label)
                                                                ]}
                                                                disabled={disabled}
                                                                value={
                                                                    offeringId === BUSINESS_CHANNEL_ALL_OFFERINGS
                                                                        ? ALL_OFFERINGS_LABEL
                                                                        : offeringOptions.find(
                                                                            option => option.id === offeringId
                                                                        )?.label ?? ""
                                                                }
                                                                onChange={(next) => {

                                                                    if (next === ALL_OFFERINGS_LABEL) {
                                                                        change({
                                                                            offerings: [
                                                                                BUSINESS_CHANNEL_ALL_OFFERINGS
                                                                            ]
                                                                        });
                                                                        return;
                                                                    }

                                                                    const picked = offeringOptions.find(
                                                                        option => option.label === next
                                                                    )?.id ?? "";

                                                                    change({
                                                                        offerings: carriesAll ||
                                                                            channel.offerings.length === 0
                                                                            ? [picked]
                                                                            : channel.offerings.map(
                                                                                (candidate, at) =>
                                                                                    at === index ? picked : candidate
                                                                            )
                                                                    });

                                                                }}
                                                            />

                                                            {/* Stacked, not side by side:
                                                                two buttons in a row cost
                                                                a column its width, and
                                                                width is what this table
                                                                has least of. */}
                                                            <div className="business-channel-steps">

                                                            {/* Never the last one: a channel
                                                                cannot be without Offerings,
                                                                so the only one left is
                                                                changed, not removed. */}
                                                            {!carriesAll && channel.offerings.length > 1 && (
                                                                <BusinessStep
                                                                    kind="remove"
                                                                    what="Offering"
                                                                    disabled={disabled}
                                                                    onClick={() => change({
                                                                        offerings: channel.offerings.filter(
                                                                            (_candidate, at) => at !== index
                                                                        )
                                                                    })}
                                                                />
                                                            )}

                                                            </div>

                                                            {/* HIDDEN, not disabled,
                                                                when there is nothing
                                                                left to add: a control
                                                                that cannot be used is
                                                                a control asking to be
                                                                tried.
                                                                The add goes on its own line under the last pick,
                                                                as the app's labelled add button (BusinessStep). */}
                                                            {index === offeringRows.length - 1 &&
                                                                !isolating &&
                                                                !carriesAll &&
                                                                channel.offerings.length > 0 &&
                                                                channel.offerings.length <
                                                                    offeringOptions.length && (
                                                                <BusinessStep
                                                                    kind="add"
                                                                    what="Offering"
                                                                    disabled={disabled}
                                                                    onClick={() => {

                                                                        const free = offeringOptions.find(
                                                                            option => !channel.offerings
                                                                                .includes(option.id)
                                                                        );

                                                                        if (free) {
                                                                            change({
                                                                                offerings: [
                                                                                    ...channel.offerings,
                                                                                    free.id
                                                                                ]
                                                                            });
                                                                        }

                                                                    }}
                                                                />
                                                            )}

                                                        </div>

                                                    ))}
                                            </td>

                                        </>
                                    );

                                    /* "+ Add Journey Stage": under the last stage -- in a subchannel's card, after the last action, outside the section of the stages. */
                                    const addStageOk = !isolating &&
                                        channel.stages.length > 0 &&
                                        channel.stages.length < stageOptionsFor(channel.category, channel).length;
                                    const addStage = () => {
                                        const free = stageOptionsFor(channel.category, channel)
                                            .find(stage => !channel.stages.includes(stage.id));
                                        if (free) {
                                            change({ stages: [...channel.stages, free.id] });
                                        }
                                    };
                                    const addStageButton = (
                                        <BusinessStep
                                            kind="add"
                                            what="Journey Stage"
                                            disabled={disabled}
                                            onClick={addStage}
                                        />
                                    );
                                    // (In a channel's card the "+" stands in the heading's row, above the stages' x column; it is not drawn once every stage is placed.)
                                    const addStagePlus = (
                                        <AddButton shape="box" small
                                            aria-label="Add Journey Stage"
                                            disabled={disabled}
                                            onClick={addStage} />
                                    );

                                    return (
                                        <Fragment key={channel.id}>

                                            {stageRows.map((stageId, shown) => ({
                                                stageId,
                                                shown,
                                                // The stage's own place in the channel (the rows drawn may be fewer).
                                                index: isolating ? channel.stages.indexOf(stageId) : shown
                                            })).map(({ stageId, shown, index }) => (

                                                <tr key={channel.id + "-" + (stageId || "unchosen")}>

                                                    {shown === 0 && channelCells}

                                                    <td className="business-channel-cell business-channel-td-stage">

                                                        <div className="business-channel-pick business-channel-pick-stage">

                                                            {/* Every stage still free,
                                                                plus this row's own: a
                                                                channel cannot be used
                                                                twice at the same stage,
                                                                and its actions are
                                                                filed by stage. */}
                                                            <OptionPicker
                                                                label={
                                                                    "Journey Stage " +
                                                                    (index + 1) +
                                                                    " for Subchannel " + number
                                                                }
                                                                placeholder="Select a stage"
                                                                hug
                                                                /* It fills the track from the cell's
                                                                   left padding to the x (the width of
                                                                   the Add Journey Stage button under
                                                                   it), never narrower than the longest
                                                                   stage ("Support & Follow Up"): its
                                                                   column is at least that wide
                                                                   (useChannelColumns). */
                                                                sizeFor={journeyStageLabels()}
                                                                /* Narrowed by what a
                                                                   channel of this kind
                                                                   is plausibly used
                                                                   for, then by what
                                                                   this channel already
                                                                   uses. */
                                                                options={stageOptionsFor(
                                                                    channel.category, channel
                                                                )
                                                                    .filter(stage =>
                                                                        stage.id === stageId ||
                                                                        !channel.stages.includes(stage.id)
                                                                    )
                                                                    .map(stage => stage.label)}
                                                                disabled={disabled}
                                                                value={STAGE_LABELS[stageId] ?? ""}
                                                                onChange={(next) => {

                                                                    const picked = BUSINESS_JOURNEY_STAGES
                                                                        .find(stage => stage.label === next)
                                                                        ?.id ?? "";

                                                                    change({
                                                                        stages: channel.stages.length === 0
                                                                            ? [picked]
                                                                            : channel.stages.map(
                                                                                (candidate, at) =>
                                                                                    at === index ? picked : candidate
                                                                            )
                                                                    });

                                                                }}
                                                            />

                                                            {/* A stage recorded that its category
                                                                does not usually take: kept, and said
                                                                so quietly (stageIsUsual). */}
                                                            {stageId && !stageIsUsual(channel.category, stageId) && (
                                                                <span className="business-channel-stage-note">
                                                                    Not usual for this category
                                                                </span>
                                                            )}

                                                            <div className="business-channel-steps">

                                                            {channel.stages.length > 0 && (
                                                                <BusinessStep
                                                                    kind="remove"
                                                                    what="Journey Stage"
                                                                    disabled={disabled}
                                                                    onClick={() => change({
                                                                        stages: channel.stages.filter(
                                                                            (_candidate, at) => at !== index
                                                                        )
                                                                    })}
                                                                />
                                                            )}

                                                            </div>

                                                            {/* The add goes on its own line under the
                                                                last pick, as the app's labelled add
                                                                button (BusinessStep). */}
                                                            {sub === undefined && shown === stageRows.length - 1 && addStageOk && addStageButton}

                                                        </div>

                                                    </td>

                                                    <td className="business-channel-cell business-channel-td-action">
                                                        {/* Nothing to record until the
                                                            stage beside it is chosen --
                                                            an Action belongs to a stage,
                                                            and the dropdown says so. More
                                                            than one is allowed once it
                                                            is: a stage can involve
                                                            several things done through
                                                            the same channel. */}
                                                        {stageId.length > 0 && channelActions(
                                                            segment.id,
                                                            answers,
                                                            channel.id,
                                                            stageId,
                                                            (STAGE_LABELS[stageId] ?? "Stage") + " actions for Subchannel " + number
                                                        )}
                                                    </td>

                                                </tr>

                                            ))}

                                            {sub !== undefined && addStageOk && (
                                                <tr>
                                                    <td className="business-channel-td-addstage">{addStagePlus}</td>
                                                </tr>
                                            )}

                                        </Fragment>
                                    );

                                })}

                                {/* ANOTHER CHANNEL UNDER THIS
                                    CATEGORY, without going back
                                    through choosing one. The button
                                    below the table starts a new
                                    category; this one adds to the
                                    category it sits in. */}
                                {group.label.trim().length > 0 && categoryOpen && !isolating && only === undefined && (
                                    <tr>
                                        <td className="business-channel-cell">
                                            <BusinessAddButton
                                                label="Subchannel"
                                                disabled={disabled}
                                                onAdd={() => updateSegment(segment.id, {
                                                    channels: [
                                                        ...answers.channels,
                                                        {
                                                            ...createBusinessChannel(),
                                                            category: group.label
                                                        }
                                                    ]
                                                })}
                                            />
                                        </td>
                                        <td colSpan={3} className="business-channel-cell" />
                                    </tr>
                                )}

                            </tbody>

                          );

                        })}

                    </table>

                    {/* A NEW CATEGORY, which is what this button now
                        makes: it adds a channel with no category yet, so
                        the table grows a category row for it to be filed
                        under. Adding another channel to a category that
                        already exists is done from inside that category,
                        where the button that does it sits. */}
                    {!isolating && only === undefined && (
                        <BusinessAddButton
                            label="Channel"
                            disabled={disabled}
                            onAdd={() => {

                                const channel = createBusinessChannel();

                                updateSegment(segment.id, {
                                    channels: [...answers.channels, channel]
                                });

                                // Opened, so it can be filled in straight away.
                                folds.expand(channelCategoryFoldKey(segment.id, channel.id));

                            }}
                        />
                    )}

                </div>

            </>
        );

    }

    return { channelResourceTable, channelsFor, foldingSection, foundationLink, referenceColumn };

}
