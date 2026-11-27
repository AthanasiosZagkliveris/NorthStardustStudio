import { CSSProperties, ReactNode, useRef, useState } from "react";
import CardShell from "../cards/CardShell.tsx";
import CardHead from "../cards/CardHead.tsx";
import NameCell from "../cards/NameCell.tsx";
import { cardNameMissing } from "../../../framework/engine/cards/SystemCardCompleteness.ts";
import { workHue } from "../../../framework/engine/WorkColours.ts";
import CardBoxes, { type CardBox } from "../cards/CardBoxes.tsx";
import DialogSectionBand from "../tiles/DialogSectionBand.tsx";
import { titledLines } from "../tiles/SectionTileGeometry.tsx";
import SectionTiles, { DialogHeading, useTitleSlide, type SectionTile, type TileAdd } from "../tiles/SectionTiles.tsx";
import { AddTile } from "../tiles/SectionView.tsx";
import FoldArrow from "../fields/FoldArrow.tsx";
import PopupPanel from "../../controls/PopupPanel.tsx";
import MenuOption from "../../controls/MenuOption.tsx";
import { BUSINESS_FOUNDATION_SUBSECTIONS, BusinessCustomerSegmentValue, createBusinessCompetitor, createBusinessCustomerProfile, createBusinessCustomerSegment, createBusinessOffering, segmentHue } from "../../../framework/engine/answers/AnswerUtils.ts";
import FoldAllToggle from "../fields/FoldAllToggle.tsx";
import InfoNote, { InfoPoint, InfoText } from "../fields/InfoNote.tsx";
import { railId } from "../rails/railItems.ts";
import { FieldMark } from "../fields/fieldMarks.tsx";
import { toggledIn } from "../fields/toggledIn.ts";
import { segmentFrameAttributes, useCompanionTiles, useSegmentPage } from "../tiles/segmentPage.ts";
import { segmentMadeByIdentity } from "../../../framework/engine/businessFoundation/foundationPage.ts";
import { competitorFaceLines, offeringFaceLines, profileFaceLines } from "../../../framework/engine/cards/CardFaces.ts";

import { BusinessFoundationEditorProps, SUBSECTIONS } from "./foundation/shared.tsx";

import { useFoundationState } from "./foundation/useFoundationState.tsx";
import { useFoundationSubsections } from "./foundation/useFoundationSubsections.tsx";

/**
 * The Business System's Foundation section (see
 * AnswerType.BusinessFoundation).
 *
 * Four subsections, in the order the specification sets: who the
 * organization serves, who else serves them, what it promises each
 * of those segments, and what it actually sells.
 *
 * The CUSTOMER SEGMENT owns all four. Everything the section asks is
 * asked about a Segment, so every subsection is organised by one: a
 * Segment holds its Profiles, the competitors facing it, the one
 * promise made to it, and the Offerings sold to it -- whose Needs it
 * chooses from its own Profiles. Nothing is asked twice, and nothing
 * floats free of the Segment it concerns.
 */
export default function BusinessFoundationEditor(props: BusinessFoundationEditorProps) {

    // (On Foundation & Engagement, one Segment at a time, each ONE chapter of its seven tiles -- this section's four and Engagement's three, handed over by
    // the Segment's id --; the others drawn and hidden: segmentPage.ts.)
    const segmentPage = useSegmentPage();
    useCompanionTiles(segmentPage);
    const part1 = useFoundationState(props);
    const part2 = { ...part1, ...useFoundationSubsections({ ...part1 }) };
    const { addButton, asTiles, built, collapsed, columnsDivider, disabled, folds, forceOpen, foundation, heads, identity, latest, onChange, remove, setCollapsed, showInstructions, subsectionsFor, update, updateSegment } = part2;

    /* THE PAGE AS TILES (the page's tile system): four tiles, two by two -- Customers (the Segments and their Profiles) and Value Proposition above, Competitors and
       Offerings under them. Everything this page asks is asked about a Segment, so each tile's dialog lists the Segments, each with its part: the Segment and its
       Profiles; what is promised to it; the competitors facing it; the Offerings sold to it. Only the first edits the Segment itself (its name, its x). */
    if (asTiles) {
        const rail = (section: number) => railId(BUSINESS_FOUNDATION_SUBSECTIONS[section]);
        const addSegment = () => update({
            segments: [...foundation.segments, createBusinessCustomerSegment(foundation.segments.map(segmentHue))]
        });
        const segmentAdd = (
            <div className="business-foundation-input-actions">
                {addButton("Segment", addSegment)}
            </div>
        );
        /** One of a Segment's cards (a Profile, a Competitor, an Offering) as it floats over its tile: open, with no fold arrow. */
        const floatingOf = (segment: BusinessCustomerSegmentValue, index: number, id: string): ReactNode => {
            forceOpen.current = true;
            try {
                subsectionsFor(segment, index);
            } finally {
                forceOpen.current = false;
            }
            const node = built.get(id);
            return node ? <div className="column-tile-content" style={{ "--strategy-theme-hue": workHue("discover") } as CSSProperties}>{node}</div> : null;
        };
        type Kind = "profiles" | "competitors" | "offerings";
        const listOf = (segment: BusinessCustomerSegmentValue, kind: Kind): { id: string; name: string }[] => segment[kind];
        const NOUN: Record<Kind, string> = { profiles: "Profile", competitors: "Competitor", offerings: "Offering" };
        // WHAT A CARD STILL LACKS (SystemCardCompleteness.ts): a card with something written but no name lights its tile, flashing red.
        const missingFoundation = new Map<string, readonly string[]>();
        foundation.segments.forEach(segment => (["profiles", "competitors", "offerings"] as const).forEach(kind => (segment[kind] as unknown as ({ id: string; name: string } & Record<string, unknown>)[]).forEach(entry => {
            const lacks = cardNameMissing(entry);
            if (lacks.length > 0) {
                missingFoundation.set(entry.id, lacks);
            }
        })));
        const addOf = (segmentId: string, kind: Kind): TileAdd => ({
            label: NOUN[kind],
            disabled,
            onAdd: () => {
                const made = kind === "profiles" ? createBusinessCustomerProfile() : kind === "competitors" ? createBusinessCompetitor() : createBusinessOffering();
                onChange({
                    ...latest.current,
                    segments: latest.current.segments.map(segment => segment.id === segmentId ? { ...segment, [kind]: [...segment[kind], made] } : segment)
                });
                return made.id;
            },
            isBlank: (id: string) => {
                const entry = latest.current.segments.flatMap(segment => listOf(segment, kind)).find(candidate => candidate.id === id);
                return !entry || entry.name.trim().length === 0;
            },
            onRemove: (ids: string[]) => onChange({
                ...latest.current,
                segments: latest.current.segments.map(segment => segment.id === segmentId ? { ...segment, [kind]: listOf(segment, kind).filter(entry => !ids.includes(entry.id)) } : segment)
            })
        });
        /** The floating card of a Segment's Description or of its Value Proposition (the cards of a Profile, a Competitor, an Offering come from floatingOf). */
        const ownCard = (segment: BusinessCustomerSegmentValue, index: number, which: "description" | "proposition"): ReactNode => (
            // (Only the section itself: the Segment's number, name and x are the frame's, outside the tiles.)
            <div className="column-tile-content" style={{ "--strategy-theme-hue": workHue("discover") } as CSSProperties}>
                <CardShell engagement={false} data-anchor={segment.id + ":" + (which === "description" ? 0 : 3)}>
                    {which === "description"
                        ? <div className="business-foundation-description" data-rail={rail(0)}>{subsectionsFor(segment, index).segmentDescription}</div>
                        : <div className="business-foundation-proposition" data-rail={rail(3)}>{subsectionsFor(segment, index).valueProposition}</div>}
                </CardShell>
            </div>
        );
        const DESCRIPTION = ":description";
        const PROPOSITION = ":proposition";
        // (The Segment, the Competitors and the Offerings each hold questions that wait while Planning, owner 2026-11-08: their "i" says so; the Value Proposition's none.)
        const info = (section: number): InfoPoint[] => [...heads[section].instructions, ...(section === 0 ? [SUBSECTIONS.segments.questionsNote] : []), ...(section < 3 ? [SUBSECTIONS.segments.questionsHeldNote] : [])];
        const written = (names: readonly string[], count = 6) => names.map(name => name.trim()).filter(name => name.length > 0).slice(0, count);
        const boxesOf = (segment: BusinessCustomerSegmentValue, kind: Kind): CardBox[] => listOf(segment, kind).map((entry, at) => ({
            id: entry.id,
            missing: missingFoundation.get(entry.id),
            number: at + 1,
            name: entry.name,
            unnamed: "Unnamed " + NOUN[kind].toLowerCase(),
            // (WHAT ITS TILE SAYS, a line each (owner, 2026-11-19 16:52 UTC+2, 1.2; CardFaces.ts): a Profile's age, kind of work and first goal; a Competitor's Type,
            // in the Type select's own words (Questions 14), its reach and its size; an Offering's Type, form, whether it can be bought today and how it is paid for.)
            lines: kind === "profiles" ? profileFaceLines(segment.profiles[at], segment, identity)
                : kind === "competitors" ? competitorFaceLines(segment.competitors[at])
                    : offeringFaceLines(segment.offerings[at], segment, identity),
            own: true,
            content: () => null
        }));
        const dialog = (section: number, title: string, body: ReactNode) => (
            <div className="column-tile-content" data-rail={rail(section)}>
                <div className="business-engagement-section-head"><DialogHeading title={title} info={info(section)} /></div>
                {body}
            </div>
        );
        /**
         * A SEGMENT'S FOUR TILES, two by two, in its frame: Customers (its Description and its Profiles), Competitors, Offerings and Value Proposition (owner, 2026-11-08: the Offerings before the Value Proposition). Customers, Competitors
         * and Offerings open the small tiles of their cards; every card -- the Description, a Profile, the Value Proposition, a Competitor, an Offering -- floats over its tile.
         */
        const tilesOf = (segment: BusinessCustomerSegmentValue, index: number): SectionTile[] => {
            const cardFor = (id: string): ReactNode => id === segment.id + DESCRIPTION
                ? ownCard(segment, index, "description")
                : id === segment.id + PROPOSITION ? ownCard(segment, index, "proposition") : floatingOf(segment, index, id);
            const listTile = (kind: Kind, section: number, title: string): SectionTile => {
                const add = addOf(segment.id, kind);
                return {
                    id: segment.id + ":" + kind,
                    title,
                    // (A floating card is ONE Competitor or Offering: its name above it is singular.)
                    group: NOUN[kind],
                    large: true,
                    view: true,
                    rail: rail(section),
                    note: info(section),
                    holds: listOf(segment, kind).map(entry => entry.id),
                    items: written(listOf(segment, kind).map(entry => entry.name)),
                    itemMarks: listOf(segment, kind).map(() => ({ bullet: true })),
                    links: listOf(segment, kind).filter(entry => entry.name.trim()).slice(0, 6).map(entry => ({ card: entry.id })),
                    add,
                    cardFor,
                    content: () => dialog(section, title, kind === "competitors" ? (
                        <>
                            <CardBoxes items={boxesOf(segment, kind)} label={title} what={NOUN[kind]} add={add} autoStart={false} />
                            {/* THE DIFFERENTIATION (Questions 14, K14; owner, 2026-11-08): once for the Segment, under its Competitors' tiles, a section of the dialog as the Segment
                                Description's Profiles are: split by the shared double rule, its title a band on the primary fill, its question in a band under it. */}
                            <DialogSectionBand title="Differentiation">
                                {subsectionsFor(segment, index).differentiation}
                            </DialogSectionBand>
                        </>
                    ) : <CardBoxes items={boxesOf(segment, kind)} label={title} what={NOUN[kind]} add={add} autoStart={false} />)
                };
            };
            const profileAdd = addOf(segment.id, "profiles");
            const profileNames = written(segment.profiles.map(profile => profile.name));
            return [
                {
                    id: segment.id + ":customers",
                    title: "Segment Description",
                    // (A floating card is ONE Profile: its name above it is singular.)
                    group: "Profile",
                    large: true,
                    view: true,
                    rail: rail(0),
                    // Under the title's rule: PROFILES, centred in capitals with no bullet, only over Profiles that have names; the Profiles follow, bulleted.
                    ...titledLines("Profiles", profileNames),
                    links: profileNames.length > 0 ? [undefined, ...segment.profiles.filter(profile => profile.name.trim()).slice(0, 5).map(profile => ({ card: profile.id }))] : [],
                    note: info(0),
                    holds: segment.profiles.map(profile => profile.id),
                    add: profileAdd,
                    cardFor,
                    // (The Description is the Segment's own, one each: a section of the dialog, not a card; the Profiles under it are the small tiles of their cards.)
                    content: () => dialog(0, "Segment Description", (
                        <>
                            {/* THE SEGMENT'S NAME (owner, 2026-11-27): under the dialog's title, in the floating cards' name cell, the card's width less its side
                                margins; the chapter's title shows it. */}
                            <div className="segment-name-cell">
                                <NameCell
                                    editing
                                    ariaLabel={"Segment " + (index + 1) + " name"}
                                    placeholder="Segment name"
                                    disabled={disabled}
                                    value={segment.name}
                                    onChange={(name) => updateSegment(index, { name })}
                                    empty="Segment"
                                />
                            </div>
                            <div className="business-foundation-description" data-rail={rail(0)}>{subsectionsFor(segment, index).segmentDescription}</div>
                            {/* PROFILES is a section of the Segment card as its boxes are (DialogSectionBand). */}
                            <DialogSectionBand title="Profiles" tiles>
                                <CardBoxes
                                    items={boxesOf(segment, "profiles")}
                                    label="Profiles"
                                    what="Profile"
                                    add={profileAdd}
                                    autoStart={false}
                                />
                            </DialogSectionBand>
                        </>
                    ))
                },
                listTile("competitors", 1, "Competitors"),
                // The Offerings before the Value Proposition (owner, 2026-11-08): it is drafted from them, so it is the last tile.
                listTile("offerings", 2, "Offerings"),
                {
                    id: segment.id + ":value-proposition",
                    title: "Value Proposition",
                    group: "Value Proposition",
                    large: true,
                    rail: rail(3),
                    items: segment.valueProposition.trim() ? [segment.valueProposition.trim()] : [],
                    // (The Value Proposition is a section of the Segment, one each: it opens in the dialog, a tile the arrows go through.)
                    content: () => dialog(3, "Value Proposition", (
                        <div className="column-tile-content" style={{ "--strategy-theme-hue": workHue("discover") } as CSSProperties}>
                            <div className="business-foundation-proposition" data-rail={rail(3)}>{subsectionsFor(segment, index).valueProposition}</div>
                        </div>
                    ))
                }
            ];
        };
        /** A Segment's frame title: "Segment" until it has a name, then the name; with several Segments each is numbered. */
        const frameName = (segment: BusinessCustomerSegmentValue, index: number) => (foundation.segments.length > 1 ? (index + 1) + ". " : "") + (segment.name.trim() || "Segment");
        return (
            <div className="answer-columns business-foundation business-engagement business-capability column-tiles-page" style={{ "--answer-column-count": 1 } as CSSProperties}>
                <div className="business-foundation-segment-frames">
                    {foundation.segments.map((segment, index) => {
                        /* The Segment's head: its number and its name, written right there, centred, in capitals, as a chapter's heading; the x of a Segment the user
                           added in the top-right corner -- one the app made from the Identity System's answers has none, read from madeBy by its id (owner, 2026-11-19). */
                        const head = (
                            <div className="business-engagement-section-head tiles-frame-head business-foundation-frame-head">
                                <span className="field-group-title business-foundation-subhead business-foundation-frame-title">
                                    {foundation.segments.length > 1 && <span className="business-foundation-frame-number">{(index + 1) + "."}</span>}
                                    {/* (SHOWN, NOT TYPED (owner, 2026-11-27): the name is written in the Segment Description's name cell; with two Segments or more the label
                                        arrow after it drops the Segments' list. Layout rules, sections 6 and 13.) */}
                                    <SegmentTitle
                                        name={segment.name}
                                        segments={segmentPage && foundation.segments.length > 1 ? foundation.segments.map((entry, at) => ({ id: entry.id, label: (at + 1) + ". " + (entry.name.trim() || "Segment") })) : []}
                                        shown={segment.id}
                                        onSelect={(id) => segmentPage?.select(id)}
                                    />
                                </span>
                                {!segmentMadeByIdentity(segment) && remove(
                                    "Segment " + (index + 1),
                                    () => update({ segments: foundation.segments.filter((_candidate, position) => position !== index) })
                                )}
                            </div>
                        );
                        /* FOUNDATION & ENGAGEMENT (owner, 2026-11-19 13:40 and 13:46: "The chapter should be 2 rows of 4 columns, with a dividing vertical line in the middle, that
                           would separate the foundation and the engagement", "Use the divide line as a border for the chapters. So to avoid changing the layout of the dialogue and
                           floated cards"): the Segment's TWO CHAPTERS side by side, as on every page of two -- this section's 2 x 2 and Engagement's three, handed over by the
                           Segment's id -- so every dialog and floating card behaves as there; one frame edge round both, in the Segment's own hue, its head over both, and the
                           line between them. Layout rules section 13. */
                        if (segmentPage) {
                            const hue = { "--strategy-theme-hue": segmentHue(segment) } as CSSProperties;
                            const chapter = (anchor: string, label: string, tiles: SectionTile[], incomplete?: typeof missingFoundation, trailing?: ReactNode) => (
                                <CardShell className="segment-chapter-part" data-anchor={anchor} style={hue}>
                                    <SectionTiles label={frameName(segment, index) + ": " + label} hue={segmentHue(segment)} tiles={tiles} incomplete={incomplete} trailing={trailing} />
                                </CardShell>
                            );
                            return (
                                // (The frame round both: drawn as a chapter's frame is, but no card -- the two inside are the chapters, each with a card's margins.)
                                <div key={segment.id} className="segment-chapter" style={hue} {...segmentFrameAttributes(segmentPage, segment.id)}>
                                    <div className="card-scroll">
                                        <div className="business-capability-section business-capability-tiles-section">
                                            {head}
                                            <div className="segment-chapter-groups">
                                                {chapter(segment.id, "Customers, Competitors, Offerings, Value Proposition", tilesOf(segment, index), missingFoundation)}
                                                {/* (A SEGMENT IS ADDED IN THE EIGHTH PLACE (owner, 2026-11-27: "make it a square like + Add card"): the shared Add Card ends the Engagement grid, beside
                                                    Sales Forecast. Layout rules, section 9, "Add Card".) */}
                                                {chapter("engagement-segment-" + segment.id, "Channels & Journey, Customer's Relationship, Sales Forecast", segmentPage.companionTiles.get(segment.id), undefined, (
                                                    <AddTile label="Segment" disabled={disabled} across={2} onAdd={addSegment} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <CardShell
                                key={segment.id}
                                data-anchor={segment.id}
                                style={{ "--strategy-theme-hue": workHue("discover") } as CSSProperties}
                            >
                                <div className="card-scroll">
                                    <div className="business-capability-section business-capability-tiles-section">
                                        {/* The Segment's frame holds all its tiles: its title is the frame's, as Identity's and Brand's are -- centred, in capitals -- and is the Segment's name, edited right there. */}
                                        {head}
                                        <SectionTiles label={frameName(segment, index) + ": Customers, Competitors, Offerings, Value Proposition"} hue={workHue("discover")} tiles={tilesOf(segment, index)} incomplete={missingFoundation} />
                                    </div>
                                </div>
                            </CardShell>
                        );
                    })}
                </div>
                {!segmentPage && segmentAdd}
            </div>
        );
    }
    return (

        <div
            className="answer-columns business-foundation"
            style={{ "--answer-column-count": 4 } as CSSProperties}
        >

            {/* Row 1: the four subsection titles, which a grid row
                sizes together so they share a baseline however long
                one of them runs. */}
            {/* Numbered 1 to 4, which is the order they are meant
                to be worked in: who you serve, who else serves
                them, what you promise them, what you sell them.
                Plain numbers counted on this page, not decimals
                under the page's own number: every level of the
                Foundation pages counts on its own. */}
            {heads.map(head => (
                <h3 className="answer-column-label" key={"title-" + head.number}>
                    <span className="answer-column-label-number">
                        {head.number + "."}
                    </span>
                    <span className="answer-column-label-text">{head.title}</span>
                </h3>
            ))}

            {/* Row 2: the instructions, above the line. */}
            {showInstructions && heads.map(head => (
                <div className="answer-column-questions" key={"questions-" + head.number}>
                    {head.instructions.map((line, index) => (
                        <span
                            className="answer-question-line answer-question-line-bullet"
                            key={line}
                        >
                            {/* The note sits at the end of the
                                instruction it belongs to, inline,
                                so it reads as part of the sentence
                                rather than as a control beside
                                it. */}
                            <InfoText text={"• " + line}>
                                {head.note && index === 0 && (
                                    <InfoNote
                                        label={head.note.label}
                                        points={head.note.points}
                                        fullList
                                    />
                                )}
                            </InfoText>
                        </span>
                    ))}
                </div>
            ))}

            {/* Row 3: the process line, spanning all four
                subsections -- the boundary between what the section
                tells the reader and what it asks them. */}
            {columnsDivider && (
                <div className="answer-columns-divider">
                    {columnsDivider}
                </div>
            )}

            {/* Row 4: ONE INPUT CARD PER SEGMENT.

                Everything this section asks is asked about a
                Segment, so a Segment is what an input card holds --
                all four of its subsections, side by side under
                their own headings. Two Segments are two cards, not
                one card asking everything twice.

                That is the hierarchy the page reads as:

                  Foundation -> Segment 1 -> subsection -> Profile 1

                and it is why folding a card away folds away that
                Segment entire. */}
            {foundation.segments.map((segment, segmentIndex) => {

                const open = !collapsed.has(segment.id);

                return (
                    <CardShell
                        engagement={false}
                        key={segment.id}
                        data-anchor={segment.id}
                        /* The colour belongs to THIS Segment: chosen
                           when it was created, against the colours
                           its siblings already had, and carried on it
                           ever since (see pickHue). So deleting the
                           Segment above it does not hand this one
                           that Segment's colour, and adding one
                           never repeats a colour already on the page.

                           A Segment recorded before the colour was
                           stored falls back to the hue its id hashes
                           to. Either hue is drawn as its nearest
                           palette colour (see segmentHue). */
                        style={{
                            "--strategy-theme-hue": segmentHue(segment)
                        } as CSSProperties}
                    >

                        <CardHead
                            className="strategy-box-head business-foundation-input-head fold-card-head"
                            onToggle={() => setCollapsed(current => toggledIn(current, segment.id))}
                            open={open}
                            foldLabel={"Segment " + (segmentIndex + 1)}
                            number={segmentIndex + 1}
                            /* A Segment holds cards of other kinds, so it says what it is (see CardNumber). */
                            kind="Segment"
                            mark={(
                                <FieldMark
                                    label={"Segment " + (segmentIndex + 1) + (segment.name.trim() ? ": " + segment.name.trim() : "")}
                                    card
                                    rail={railId(BUSINESS_FOUNDATION_SUBSECTIONS[0])}
                                />
                            )}
                            /* The Segment's name, asked in its own head like every other card's. */
                            name={(
                                <NameCell
                                    editing
                                    ariaLabel={"Segment " + (segmentIndex + 1) + " name"}
                                    placeholder="Segment name"
                                    disabled={disabled}
                                    value={segment.name}
                                    onChange={(name) => updateSegment(segmentIndex, { name })}
                                    empty="Unnamed segment"
                                />
                            )}
                            /* One Segment card must always exist. */
                            actions={foundation.segments.length > 1 && remove(
                                "Segment " + (segmentIndex + 1),
                                () => update({
                                    segments: foundation.segments.filter(
                                        (_candidate, position) =>
                                            position !== segmentIndex
                                    )
                                })
                            )}
                        />

                        {open && (() => {

                            const parts = subsectionsFor(segment, segmentIndex);

                            return (
                                <>

                                    {/* The Segment's own Description,
                                        across the whole card and
                                        directly under its name. It
                                        describes the Segment, so it
                                        comes before everything that
                                        is described in terms of it,
                                        and it has the width for its
                                        parameters to sit two abreast. */}
                                    <div
                                        className="business-foundation-description"
                                        data-rail={railId(BUSINESS_FOUNDATION_SUBSECTIONS[0])}
                                    >
                                        {parts.segmentDescription}
                                    </div>

                                    {/* The Profiles and the
                                        competitors, side by side
                                        under the Description -- all
                                        three describing the Segment,
                                        so all three in its two
                                        thirds. */}
                                    {/* Each list titled, as the
                                        Description and the Value
                                        Proposition are. */}
                                    <div
                                        className="business-foundation-profiles"
                                        data-rail={railId(BUSINESS_FOUNDATION_SUBSECTIONS[0])}
                                    >
                                        <span className="field-group-title business-foundation-subhead business-foundation-column-title fold-group-head">
                                            Profiles
                                            <FoldAllToggle
                                                ids={segment.profiles.map(p => p.id)}
                                                folds={folds}
                                                label="profiles"
                                            />
                                        </span>
                                        {parts.profiles}
                                    </div>

                                    <div
                                        className="business-foundation-competitors"
                                        data-rail={railId(BUSINESS_FOUNDATION_SUBSECTIONS[1])}
                                    >
                                        <span className="field-group-title business-foundation-subhead business-foundation-column-title fold-group-head">
                                            Competitors
                                            <FoldAllToggle
                                                ids={segment.competitors.map(c => c.id)}
                                                folds={folds}
                                                label="competitors"
                                            />
                                        </span>
                                        {parts.competitors}
                                    </div>

                                    {/* The remaining third, in two
                                        rows of its own: what is
                                        promised to the Segment,
                                        level with the Description,
                                        and what is sold to it to
                                        keep that promise, level with
                                        the Profile and Competitor
                                        cards. Where the card stacks
                                        (1500px and less), the
                                        Offerings come before the
                                        Value Proposition (owner,
                                        2026-11-08). */}
                                    <div
                                        className="business-foundation-offerings"
                                        data-rail={railId(BUSINESS_FOUNDATION_SUBSECTIONS[2])}
                                    >
                                        <span className="field-group-title business-foundation-subhead business-foundation-column-title fold-group-head">
                                            Offerings
                                            <FoldAllToggle
                                                ids={segment.offerings.map(o => o.id)}
                                                folds={folds}
                                                label="offerings"
                                            />
                                        </span>
                                        {parts.offerings}
                                    </div>

                                    <div
                                        className="business-foundation-proposition"
                                        data-rail={railId(BUSINESS_FOUNDATION_SUBSECTIONS[3])}
                                    >
                                        {parts.valueProposition}
                                    </div>

                                </>
                            );

                        })()}

                    </CardShell>
                );

            })}

            {/* Row 5: adding a Segment.

                Below the input cards and outside them, because it
                makes the NEXT card. Every other Add button on this
                page sits inside the card it adds to; this one has
                no card to sit in.

                Always offered, for the same reason the Profile's is:
                "1 primary segment (maximum 2)" is advice, and the
                guidance above the line is where it is given. */}
            <div className="business-foundation-input-actions">
                {addButton("Segment", () => update({
                    segments: [
                        ...foundation.segments,
                        /* Given the colours already on the page, so
                           the new card cannot arrive in one of
                           them. */
                        createBusinessCustomerSegment(
                            foundation.segments.map(segmentHue)
                        )
                    ]
                }))}
            </div>

        </div>

    );

}

/**
 * A SEGMENT'S CHAPTER TITLE: its name, shown (it is written in the Segment Description's name cell), as every tile title is (layout rules, section 9, "Tile title"):
 * one line, cut by an ellipsis before the x, sliding to its end under the pointer (`useTitleSlide`), the full name its tooltip. With two Segments or more, the label
 * arrow after it drops the one dropdown card listing them; a press shows that Segment (layout rules, section 6, "The label arrow").
 */
function SegmentTitle({ name, segments, shown, onSelect }: { name: string; segments: readonly { id: string; label: string }[]; shown: string; onSelect: (id: string) => void }) {
    const title = useRef<HTMLSpanElement | null>(null);
    const arrow = useRef<HTMLSpanElement | null>(null);
    const [open, setOpen] = useState(false);
    useTitleSlide(title);
    const menuId = "segment-menu-" + shown;
    return (
        <>
            <span ref={title} className="business-foundation-frame-name" title={name.trim() || undefined}>{name.trim() || "Segment"}</span>
            {segments.length > 1 && (
                <span ref={arrow} className="segment-chapter-arrow">
                    <FoldArrow variant="label" open={open} controls={menuId} name={(open ? "Hide" : "Show") + " the Segments"} onToggle={() => setOpen(current => !current)} />
                </span>
            )}
            <PopupPanel open={open && segments.length > 1} onClose={() => setOpen(false)} anchorRef={arrow} below role="menu" className="strategy-sort-menu segment-chapter-menu" ariaLabel="Segments">
                <div id={menuId}>
                    {segments.map(segment => (
                        <MenuOption key={segment.id} marked chosen={segment.id === shown} onClick={() => { setOpen(false); onSelect(segment.id); }}>
                            {segment.label}
                        </MenuOption>
                    ))}
                </div>
            </PopupPanel>
        </>
    );
}
