import TextBox from "../../controls/TextBox.tsx";
import { CSSProperties, ReactNode } from "react";
import CardShell from "../cards/CardShell.tsx";
import CardHead from "../cards/CardHead.tsx";
import NameCell from "../cards/NameCell.tsx";
import { cardNameMissing } from "../../../framework/engine/SystemCardCompleteness.ts";
import { workHue } from "../../../framework/engine/WorkColours.ts";
import CardBoxes, { type CardBox } from "../cards/CardBoxes.tsx";
import SectionTiles, { DialogHeading, type SectionTile, type TileAdd } from "../tiles/SectionTiles.tsx";
import { BUSINESS_FOUNDATION_SUBSECTIONS, BusinessCustomerSegmentValue, createBusinessCompetitor, createBusinessCustomerProfile, createBusinessCustomerSegment, createBusinessOffering, segmentHue } from "../../../framework/engine/AnswerUtils.ts";
import FoldAllToggle from "../fields/FoldAllToggle.tsx";
import InfoNote, { InfoPoint, InfoText } from "../fields/InfoNote.tsx";
import { railId } from "../rails/railItems.ts";
import { FieldMark } from "../fields/fieldMarks.tsx";
import { toggledIn } from "../fields/toggledIn.ts";

import { BusinessFoundationEditorProps } from "./foundation/shared.tsx";

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

    const part1 = useFoundationState(props);
    const part2 = { ...part1, ...useFoundationSubsections({ ...part1 }) };
    const { addButton, asTiles, built, collapsed, columnsDivider, disabled, folds, forceOpen, foundation, heads, latest, onChange, remove, setCollapsed, showInstructions, subsectionsFor, update, updateSegment } = part2;

    /* THE PAGE AS TILES (the page's tile system): four tiles, two by two -- Customers (the Segments and their Profiles) and Value Proposition above, Competitors and
       Offerings under them. Everything this page asks is asked about a Segment, so each tile's dialog lists the Segments, each with its part: the Segment and its
       Profiles; what is promised to it; the competitors facing it; the Offerings sold to it. Only the first edits the Segment itself (its name, its x). */
    if (asTiles) {
        const rail = (section: number) => railId(BUSINESS_FOUNDATION_SUBSECTIONS[section]);
        const segmentAdd = (
            <div className="business-foundation-input-actions">
                {addButton("Segment", () => update({
                    segments: [...foundation.segments, createBusinessCustomerSegment(foundation.segments.map(segmentHue))]
                }))}
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
                <CardShell engagement={false} data-anchor={segment.id + ":" + (which === "description" ? 0 : 2)}>
                    {which === "description"
                        ? <div className="business-foundation-description" data-rail={rail(0)}>{subsectionsFor(segment, index).segmentDescription}</div>
                        : <div className="business-foundation-proposition" data-rail={rail(2)}>{subsectionsFor(segment, index).valueProposition}</div>}
                </CardShell>
            </div>
        );
        const DESCRIPTION = ":description";
        const PROPOSITION = ":proposition";
        const info = (section: number): InfoPoint[] => [...heads[section].instructions];
        const written = (names: readonly string[], count = 6) => names.map(name => name.trim()).filter(name => name.length > 0).slice(0, count);
        const boxesOf = (segment: BusinessCustomerSegmentValue, kind: Kind): CardBox[] => listOf(segment, kind).map((entry, at) => ({
            id: entry.id,
            missing: missingFoundation.get(entry.id),
            number: at + 1,
            name: entry.name,
            unnamed: "Unnamed " + NOUN[kind].toLowerCase(),
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
         * A SEGMENT'S FOUR TILES, two by two, in its frame: Customers (its Description and its Profiles), Value Proposition, Competitors and Offerings. Customers, Competitors
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
                    group: title,
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
                    content: () => dialog(section, title, <CardBoxes items={boxesOf(segment, kind)} label={title} what={NOUN[kind]} add={add} autoStart={false} />)
                };
            };
            const profileAdd = addOf(segment.id, "profiles");
            const profileNames = written(segment.profiles.map(profile => profile.name));
            return [
                {
                    id: segment.id + ":customers",
                    title: "Segment Description",
                    group: "Profiles",
                    large: true,
                    view: true,
                    rail: rail(0),
                    // Under the title's rule: PROFILES, centred in capitals with no bullet; the Profiles follow, bulleted.
                    items: ["PROFILES", ...profileNames],
                    itemMarks: [{ centre: true }, ...profileNames.map(() => ({ bullet: true }))],
                    links: [undefined, ...segment.profiles.filter(profile => profile.name.trim()).slice(0, 5).map(profile => ({ card: profile.id }))],
                    note: info(0),
                    holds: segment.profiles.map(profile => profile.id),
                    add: profileAdd,
                    cardFor,
                    // (The Description is the Segment's own, one each: a section of the dialog, not a card; the Profiles under it are the small tiles of their cards.)
                    content: () => dialog(0, "Segment Description", (
                        <>
                            <div className="business-foundation-description" data-rail={rail(0)}>{subsectionsFor(segment, index).segmentDescription}</div>
                            <span className="field-group-title business-foundation-subhead strategy-tiles-label">Profiles</span>
                            <CardBoxes
                                items={boxesOf(segment, "profiles")}
                                label="Profiles"
                                what="Profile"
                                add={profileAdd}
                                autoStart={false}
                            />
                        </>
                    ))
                },
                {
                    id: segment.id + ":value-proposition",
                    title: "Value Proposition",
                    group: "Value Proposition",
                    large: true,
                    rail: rail(2),
                    items: segment.valueProposition.trim() ? [segment.valueProposition.trim()] : [],
                    // (The Value Proposition is a section of the Segment, one each: it opens in the dialog, a tile the arrows go through.)
                    content: () => dialog(2, "Value Proposition", (
                        <div className="column-tile-content" style={{ "--strategy-theme-hue": workHue("discover") } as CSSProperties}>
                            <div className="business-foundation-proposition" data-rail={rail(2)}>{subsectionsFor(segment, index).valueProposition}</div>
                        </div>
                    ))
                },
                listTile("competitors", 1, "Competitors"),
                listTile("offerings", 3, "Offerings")
            ];
        };
        /** A Segment's frame title: "Segment" until it has a name, then the name; with several Segments each is numbered. */
        const frameName = (segment: BusinessCustomerSegmentValue, index: number) => (foundation.segments.length > 1 ? (index + 1) + ". " : "") + (segment.name.trim() || "Segment");
        return (
            <div className="answer-columns business-foundation business-engagement business-capability column-tiles-page" style={{ "--answer-column-count": 1 } as CSSProperties}>
                <div className="business-foundation-segment-frames">
                    {foundation.segments.map((segment, index) => (
                        <CardShell
                            
                            key={segment.id}
                            data-anchor={segment.id}
                            style={{ "--strategy-theme-hue": workHue("discover") } as CSSProperties}
                        >
                            <div className="card-scroll">
                                <div className="business-capability-section business-capability-tiles-section">
                                    {/* The Segment's frame holds all its tiles: its title is the frame's, as Identity's and Brand's are -- centred, in capitals -- and is the Segment's name, edited right there. */}
                                    <div className="business-engagement-section-head tiles-frame-head business-foundation-frame-head">
                                        <span className="field-group-title business-foundation-subhead business-foundation-frame-title">
                                            {foundation.segments.length > 1 && <span className="business-foundation-frame-number">{(index + 1) + "."}</span>}
                                            <TextBox
                                                className="business-foundation-frame-name"
                                                aria-label={"Segment " + (index + 1) + " name"}
                                                placeholder="Segment name"
                                                disabled={disabled}
                                                value={segment.name}
                                                onChange={(event) => updateSegment(index, { name: event.target.value })}
                                            />
                                        </span>
                                        {foundation.segments.length > 1 && remove(
                                            "Segment " + (index + 1),
                                            () => update({ segments: foundation.segments.filter((_candidate, position) => position !== index) })
                                        )}
                                    </div>
                                    <SectionTiles label={frameName(segment, index) + ": Customers, Value Proposition, Competitors, Offerings"} hue={workHue("discover")} tiles={tilesOf(segment, index)} incomplete={missingFoundation} />
                                </div>
                            </div>
                        </CardShell>
                    ))}
                </div>
                {segmentAdd}
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
                                        cards. */}
                                    <div
                                        className="business-foundation-proposition"
                                        data-rail={railId(BUSINESS_FOUNDATION_SUBSECTIONS[2])}
                                    >
                                        {parts.valueProposition}
                                    </div>

                                    <div
                                        className="business-foundation-offerings"
                                        data-rail={railId(BUSINESS_FOUNDATION_SUBSECTIONS[3])}
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
