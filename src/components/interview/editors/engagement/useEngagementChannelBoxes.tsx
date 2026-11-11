/**
 * THE CHANNEL BOXES: the reference column, the folding section, the resource table and the channel cards.
 * One part of BusinessEngagementEditor (see BusinessEngagementEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import { ReactNode } from "react";

import { BUSINESS_ENGAGEMENT_SECTIONS } from "../../../../framework/engine/AnswerUtils.ts";

import InfoNote, { InfoText } from "../../fields/InfoNote.tsx";


import { railId } from "../../rails/railItems.ts";




import FoldArrow from "../../fields/FoldArrow.tsx";
import TextLink from "../../fields/TextLink.tsx";
import { SECTIONS } from "../BusinessEngagementModel.ts";

import type { useEngagementState } from "./useEngagementState.tsx";
import { channelsForPart, referenceColumnPart, channelResourceTablePart } from "./engagementChannelParts.tsx";

type Earlier = ReturnType<typeof useEngagementState>;

export function useEngagementChannelBoxes(earlier: Earlier) {

    const { cards, channelActions, channelCategoryFoldKey, channelResources, collapsed, currency, disabled, engagement, folds, isolatingSegment, noPhysical, offeringsOfMadeCards, onOpenCapability, onOpenFoundation, openAction, relatedStages, segmentOf, segments, setLit, toggle, updateChannel, updateSegment } = earlier;

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
    const referenceColumn = (...args: Parameters<typeof referenceColumnPart> extends [unknown, ...infer Rest] ? Rest : never) => referenceColumnPart({ foundationLink }, ...args);
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
    const channelResourceTable = (...args: Parameters<typeof channelResourceTablePart> extends [unknown, ...infer Rest] ? Rest : never) => channelResourceTablePart({ segmentOf, engagement, cards, currency, segments, collapsed, toggle, onOpenCapability, openAction, setLit }, ...args);
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
    const channelsFor = (...args: Parameters<typeof channelsForPart> extends [unknown, ...infer Rest] ? Rest : never) => channelsForPart({ segmentOf, disabled, updateChannel, updateSegment, isolatingSegment, relatedStages, folds, channelCategoryFoldKey, noPhysical, channelResources, offeringsOfMadeCards, channelActions }, ...args);

    return { channelResourceTable, channelsFor, foldingSection, foundationLink, referenceColumn };

}
