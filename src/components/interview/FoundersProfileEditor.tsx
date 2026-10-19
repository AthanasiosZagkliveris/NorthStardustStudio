import { CSSProperties, ReactNode, useEffect } from "react";

import CardShell from "./CardShell.tsx";
import CardHead from "./CardHead.tsx";
import NameCell from "./NameCell.tsx";
import FieldLabel from "../FieldLabel.tsx";
import {
    FOUNDER_CREDENTIAL_TYPES,
    FOUNDERS_PROFILE_SECTIONS,
    FounderProfileValue,
    FounderSkillValue,
    FoundersProfileValue,
    LegalEntityFounderValue,
    asFoundersProfileValue,
    founderProfiles,
    withFounderProfiles
} from "../../framework/engine/AnswerUtils.ts";

import { railId } from "./rails/railItems.ts";
import SectionTiles, { DialogHeading, TILE_DIVIDER, type SectionTile } from "./SectionTiles.tsx";
import { workHue } from "../../framework/engine/WorkColours.ts";
import { summaryText } from "./cardSummary.ts";
import FoldAllToggle from "./FoldAllToggle.tsx";
import OptionPicker from "./OptionPicker.tsx";

import InfoNote, { InfoText } from "./InfoNote.tsx";
import { FieldMark, FieldStatus } from "./fieldMarks.tsx";
import type { OpenPage } from "./jumpTo.ts";
import NumberedListInput from "./NumberedListInput.tsx";
import StrategyTextArea from "./StrategyTextArea.tsx";
import { useItemFolds } from "./useItemFolds.ts";
import TextLink from "./TextLink.tsx";


/**
 * What each question is for, the "i" beside it (see InfoNote): what
 * to write, and why a lender or investor reads it -- which is always
 * the one question, can this team carry out the plan? Three points
 * at most, as everywhere else in the app.
 */
const INFO = {

    roles: [
        "What does this founder do in the organization?",
        "One role a line: a founder is often several things at once.",
        "Lenders and investors look for every key job to have someone who owns it."
    ],

    industryExperience: [
        "Which relevant companies, sectors, positions, projects or markets have they worked in?",
        "Say how long, where it helps.",
        "Lenders and investors look for a team that already knows the market it is entering."
    ],

    managementExperience: [
        "Experience leading people, projects, budgets, businesses, or operations.",
        "Say how big: how many people, how much money.",
        "It shows they can run the organization as it grows."
    ],

    achievements: [
        "What was achieved, what was your contribution, and what was the measurable result?",
        "Any business they started before, and how it turned out.",
        "Results are what make a track record believable."
    ],

    skills: [
        "Add one entry for each, and choose its type: a skill, professional or technical expertise, a degree or qualification, a certification, a licence, or a professional membership or other credential.",
        "Name what the plan relies on them for: sales, finance, operations, technical.",
        "Lenders and investors check that every capability the plan needs is covered by someone."
    ],

    teamGaps: [
        "What important capabilities does the team currently lack, and how will they be covered?",
        "For example: planned hires, advisors, mentors, partners, contractors or external specialists, training.",
        "A gap that is named and covered reads as a strength; one left unnamed reads as a risk."
    ]

};

/**
 * What a Skills, Expertise & Qualifications entry's box asks for,
 * by its type -- and, before a type is chosen, every kind it can be.
 */
const SKILL_PLACEHOLDERS: Record<string, string> = {
    skill: "e.g. Negotiation",
    expertise: "Area of professional or technical expertise",
    qualification: "Degree or qualification, and where",
    certification: "Name and issuing body",
    licence: "Licence and where it applies",
    membership: "Body or credential",
    "": "Skill, expertise, qualification, certification, licence or membership"
};

/** An entry with nothing in it: the row the list always shows. */
const EMPTY_SKILL: FounderSkillValue = { type: "", text: "" };

interface FoundersProfileEditorProps {

    value: unknown;

    onChange: (value: FoundersProfileValue) => void;

    disabled?: boolean;

    /** See BrandStyleEditor.columnsDivider. */
    columnsDivider?: ReactNode;

    /** See AnswerRendererProps.showInstructions. */
    showInstructions?: boolean;

    /** The page drawn as tiles (the page's tile system): one for each founder and one for the capability gaps; the editor's own tests draw the whole page. */
    asTiles?: boolean;

    /** The frame's heading, on top of its tiles (a page of several sections). */
    frameTitle?: string;

    /**
     * The founders answered under 3. Legal Entity, 2. Founders &
     * Ownership: who this page's cards are for, and in what order.
     */
    legalEntityFounders?: readonly LegalEntityFounderValue[];

    /** 3. Legal Entity, for the note shown while it names nobody. */
    onOpenLegalEntity?: OpenPage;

}

/**
 * The Identity System's Founders Profile page (see
 * AnswerType.FoundersProfile).
 *
 * One card per founder the Legal Entity names, in its order, under
 * the name given there -- this page describes the founders, it never
 * adds, removes or renames one. Then one box for the capabilities the
 * team as a whole lacks, and how they are covered.
 *
 * Every question is optional: the page strengthens a Business Plan's
 * Management section, and is never what keeps a System unfinished.
 */
export default function FoundersProfileEditor({

    value,

    onChange,

    disabled = false,

    columnsDivider,

    showInstructions = true,

    frameTitle,

    asTiles = false,

    legalEntityFounders = [],

    onOpenLegalEntity

}: FoundersProfileEditorProps) {

    /* Every named founder has an entry, seeded from the Legal Entity
       row where this page has none yet (see founderProfileOf) -- and
       written back (below), so what is saved says the same as what
       is shown, and the seeded answers become this page's own. */
    const profile = withFounderProfiles(value, legalEntityFounders);

    const storedJson = JSON.stringify(asFoundersProfileValue(value));
    const syncedJson = JSON.stringify(profile);

    useEffect(() => {
        if (!disabled && syncedJson !== storedJson) {
            onChange(JSON.parse(syncedJson) as FoundersProfileValue);
        }
        // onChange is a fresh function each render; the two
        // serialised values are what decide whether to write.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disabled, storedJson, syncedJson]);

    const founders = founderProfiles(legalEntityFounders, profile);

    /** Which founder cards are open -- see useItemFolds. */
    const folds = useItemFolds();

    function update(patch: Partial<FoundersProfileValue>) {
        onChange({ ...profile, ...patch });
    }

    function updateFounder(id: string, patch: Partial<FounderProfileValue>) {
        update({
            founders: profile.founders.map(
                entry => entry.id === id ? { ...entry, ...patch } : entry
            )
        });
    }

    /* ---------- Building blocks ---------- */

    /**
     * The Legal Entity page's subsection box, numbered 1 and 2.
     * `info` puts an "i" on the title, for a subsection that is one
     * question and so has no field label of its own to carry it.
     */
    function subsection(index: number, children: ReactNode, titleExtra?: ReactNode, info?: string[]) {

        const title = FOUNDERS_PROFILE_SECTIONS[index];

        const heading = (
            <h3 className="legal-entity-section-head">
                <span className="legal-entity-section-number">
                    {(index + 1) + "."}
                </span>
                <span className="legal-entity-section-title">
                    {info
                        ? (
                            <InfoText text={title}>
                                <InfoNote label={title} points={info} />
                            </InfoText>
                        )
                        : title}
                    {/* A subsection that is one question (an "i" on
                        its title) is flagged by its title. */}
                    {info && <FieldMark label={title} section={railId(title)} />}
                </span>
            </h3>
        );

        return (
            <section
                className="legal-entity-section"
                data-anchor={"founders-profile-section-" + index}
                data-rail={railId(FOUNDERS_PROFILE_SECTIONS[index])}
            >

                {titleExtra
                    ? (
                        <div className="fold-group-head">
                            {heading}
                            {titleExtra}
                        </div>
                    )
                    : heading}

                {info && <FieldStatus label={title} section={railId(title)} />}

                {children}

            </section>
        );

    }

    /** A label with its "i", as the Legal Entity page draws one. */
    function label(text: string, info: string[]) {
        return (
            <span className="legal-entity-label-info">
                <FieldLabel className="legal-entity-label">
                    <InfoText text={text}>
                        <InfoNote label={text} points={info} />
                    </InfoText>
                    <FieldMark label={text} />
                </FieldLabel>
                <FieldStatus label={text} />
            </span>
        );
    }

    function field(text: string, info: string[], control: ReactNode, wide = false) {
        return (
            <div className={wide ? "legal-entity-field-wide" : "legal-entity-field"}>
                {label(text, info)}
                {control}
            </div>
        );
    }

    /**
     * A founder's Skills, Expertise & Qualifications: the same
     * numbered list as Roles and Key Achievements -- Enter opens the
     * next line, Backspace on an empty one takes it away, a line is
     * dragged by its number -- with each line's type chosen at its
     * end. A line's type moves with it (see NumberedListInput's
     * `origins`), and its placeholder asks for that type.
     */
    function skillList(founder: FounderProfileValue, who: string) {

        const entries = founder.skills.length > 0 ? founder.skills : [EMPTY_SKILL];

        const save = (next: FounderSkillValue[]) =>
            updateFounder(founder.id, { skills: next.length > 0 ? next : [EMPTY_SKILL] });

        return (
            <NumberedListInput
                label={who + " skills entry"}
                items={entries.map(entry => entry.text)}
                disabled={disabled}
                placeholderFor={(index) => SKILL_PLACEHOLDERS[entries[index]?.type ?? ""] ?? SKILL_PLACEHOLDERS[""]}
                onChange={(items, origins) => save(items.map((text, index) => ({
                    type: origins[index] >= 0 ? entries[origins[index]]?.type ?? "" : "",
                    text
                })))}
                // The kind of each line, in the app's own drop-down: one line, a long kind cut with an ellipsis (its full text is the tooltip and stands in the open list).
                lineEnd={(index) => (
                    <OptionPicker
                        label={who + " skills entry " + (index + 1) + " type"}
                        placeholder="Type"
                        options={FOUNDER_CREDENTIAL_TYPES.map(kind => kind.label)}
                        disabled={disabled}
                        fill
                        value={FOUNDER_CREDENTIAL_TYPES.find(kind => kind.id === (entries[index]?.type ?? ""))?.label ?? ""}
                        onChange={(next) => save(entries.map((entry, at) => at === index
                            ? { ...entry, type: FOUNDER_CREDENTIAL_TYPES.find(kind => kind.label === next)?.id ?? "" }
                            : entry))}
                    />
                )}
            />
        );

    }

    /* ---------- A founder ---------- */

    function founderCard(founder: FounderProfileValue & { name: string }, index: number, always = false) {

        const open = always || folds.isOpen(founder.id);

        /** What names this founder's fields for assistive technology. */
        const who = "Founder " + (index + 1);

        /* Folded, the roles are read under the name. */
        const summary = summaryText(founder.roles.filter(Boolean).join(", "));

        return (

            <div
                className="legal-entity-card"
                key={founder.id}
                data-anchor={"founder-profile-" + founder.id}
            >

                {/* Named on the Legal Entity page, so the name is
                    shown rather than asked, and there is no ×. */}
                <CardHead
                    className="legal-entity-card-head fold-card-head fold-card-fixed"
                    legal
                    onToggle={always ? undefined : () => folds.toggle(founder.id)}
                    open={open}
                    foldLabel={who}
                    number={index + 1}
                    name={<NameCell editing={false} ariaLabel={who + " name"} placeholder="" value={founder.name} empty="" />}
                >
                    {!open && summary && (
                        <span className="business-card-summary" title={typeof summary === "string" ? summary : undefined}>{summary}</span>
                    )}
                </CardHead>

                {open && (
                    <div className="legal-entity-grid">

                        {/* ROW 0: the Roles, one column of the card's two
                            (as wide as each box below it), the second
                            column left empty. */}
                        <div className="legal-entity-field-wide founders-profile-row founders-profile-row-two">
                        {field("Roles", INFO.roles, (
                            <NumberedListInput
                                label={who + " roles"}
                                placeholder="Role"
                                items={founder.roles}
                                disabled={disabled}
                                onChange={(items) => updateFounder(founder.id, { roles: items })}
                            />
                        ))}
                        </div>

                        {/* ROW 1, TWO EQUAL COLUMNS: Relevant Industry
                            Experience | Management Experience, tops level,
                            each growing with its text. One column in a
                            narrow card. */}
                        <div className="legal-entity-field-wide founders-profile-row founders-profile-row-two">

                        {field("Relevant Industry Experience", INFO.industryExperience, (
                            <StrategyTextArea
                                className="interview-input business-foundation-note"
                                ariaLabel={who + " relevant industry experience"}
                                placeholder="Relevant companies, sectors, positions, projects, markets or professional experience"
                                disabled={disabled}
                                value={founder.industryExperience}
                                onChange={(next) => updateFounder(founder.id, { industryExperience: next })}
                            />
                        ))}

                        {field("Management Experience", INFO.managementExperience, (
                            <StrategyTextArea
                                className="interview-input business-foundation-note"
                                ariaLabel={who + " management experience"}
                                placeholder="Leading people, projects, budgets, businesses or operations"
                                disabled={disabled}
                                value={founder.managementExperience}
                                onChange={(next) => updateFounder(founder.id, { managementExperience: next })}
                            />
                        ))}

                        </div>

                        {/* ROW 2, TWO EQUAL COLUMNS: Key Achievements | Skills,
                            Expertise & Qualifications. */}
                        <div className="legal-entity-field-wide founders-profile-row founders-profile-row-two">

                        {field("Key Achievements", INFO.achievements, (
                            <NumberedListInput
                                label={who + " key achievements"}
                                placeholder="What was achieved, your contribution, the measurable result"
                                items={founder.achievements}
                                disabled={disabled}
                                onChange={(items) => updateFounder(founder.id, { achievements: items })}
                            />
                        ))}

                        {field("Skills, Expertise & Qualifications", INFO.skills, skillList(founder, who))}

                        </div>

                    </div>
                )}

            </div>

        );

    }

    /* THE PAGE AS TILES: each founder is a tile (the name, the roles), and the capability gaps another. A tile opens its card in its dialog. */
    if (asTiles) {
        const lines = (list: readonly string[], count = 4) => list.map(text => text.trim()).filter(text => text.length > 0).slice(0, count);
        const tiles: SectionTile[] = [
            ...founders.map((founder, index): SectionTile => {
                // The roles, a line, then the skills and degrees: two lists, each line with its bullet.
                // (The skills as the section lists them, each as written: no kind before it.)
                const skills = lines(founder.skills.map(entry => entry.text), 6);
                const listed = [...lines(founder.roles, 5), ...(skills.length > 0 ? [TILE_DIVIDER, ...skills] : [])];
                return {
                id: "founder-profile-" + founder.id,
                large: true,
                title: founder.name.trim() || "Founder " + (index + 1),
                rail: railId(FOUNDERS_PROFILE_SECTIONS[0]),
                items: listed,
                itemMarks: listed.map(item => item === TILE_DIVIDER ? undefined : { bullet: true }),
                content: () => <div className="column-tile-content legal-entity legal-entity-unframed founders-profile" data-rail={railId(FOUNDERS_PROFILE_SECTIONS[0])}><div className="legal-entity-body">{founderCard(founder, index, true)}</div></div>
                };
            }),
            {
                id: "founders-gaps",
                large: true,
                // (Named for what it holds, with no order number: a gaps text and a cover text.)
                title: "Capability",
                rail: railId(FOUNDERS_PROFILE_SECTIONS[1]),
                items: lines([...profile.teamGaps.split("\n"), ...profile.teamCover.split("\n")], 8),
                content: () => (
                    <div className="column-tile-content legal-entity legal-entity-unframed founders-profile" data-rail={railId(FOUNDERS_PROFILE_SECTIONS[1])}>
                        <div className="business-engagement-section-head"><DialogHeading title="Capability" info={INFO.teamGaps} /></div>
                        <div className="legal-entity-body">
                            {field("Gaps", [INFO.teamGaps[0]], (
                                <StrategyTextArea
                                    className="interview-input business-foundation-note"
                                    ariaLabel="Capability gaps"
                                    placeholder="The capabilities the team lacks"
                                    disabled={disabled}
                                    value={profile.teamGaps}
                                    onChange={(next) => update({ teamGaps: next })}
                                />
                            ), true)}
                            {field("Cover", [INFO.teamGaps[1], INFO.teamGaps[2]], (
                                <StrategyTextArea
                                    className="interview-input business-foundation-note"
                                    ariaLabel="Capability cover"
                                    placeholder="How each will be covered: planned hires, advisors, mentors, partners, contractors, training"
                                    disabled={disabled}
                                    value={profile.teamCover}
                                    onChange={(next) => update({ teamCover: next })}
                                />
                            ), true)}
                        </div>
                    </div>
                )
            }
        ];
        return (
            <div className="answer-columns business-foundation business-engagement business-capability column-tiles-page" style={{ "--answer-column-count": 1 } as CSSProperties}>
                <CardShell
                    
                    data-anchor="column-tiles"
                    style={{ "--strategy-theme-hue": workHue("define") } as CSSProperties}
                >
                    <div className="card-scroll">
                        <div className="business-capability-section business-capability-tiles-section">
                            {frameTitle ? <div className="business-engagement-section-head tiles-frame-head"><span className="field-group-title business-foundation-subhead">{frameTitle}</span></div> : <div className="business-capability-heading-spacer" aria-hidden="true" />}
                            {founders.length === 0 && (
                                <p className="legal-entity-empty-note">Add founders under 1. Identity System → 3. Legal Entity → 2. Founders & Ownership and they appear here.</p>
                            )}
                            <SectionTiles label="Founders Profile" hue={workHue("define")} tiles={tiles} />
                        </div>
                    </div>
                </CardShell>
            </div>
        );
    }

    return (

        <div
            className="brand-style legal-entity founders-profile"
            style={{ "--answer-column-count": 1 } as CSSProperties}
        >

            <div className="brand-style-head">

                {showInstructions && (
                    <div className="answer-column-questions">
                        <span className="answer-question-line answer-question-line-bullet">
                            • Describe each founder as a lender or investor will read them:
                            can this team carry out the plan?
                        </span>
                        <span className="answer-question-line answer-question-line-bullet">
                            • The founders are the ones named in 3. Legal Entity → 2. Founders
                            & Ownership. Add or rename them there.
                        </span>
                        <span className="answer-question-line answer-question-line-bullet">
                            • Every question is optional. Answer what applies, and name the
                            capabilities the team still lacks.
                        </span>
                    </div>
                )}

            </div>

            {columnsDivider && (
                <div className="answer-columns-divider">{columnsDivider}</div>
            )}

            <div className="legal-entity-body">

                {/* ---------- 1. Founders ---------- */}

                {subsection(0, (
                    founders.length > 0
                        ? founders.map((founder, index) => founderCard(founder, index))
                        : (
                            <p className="legal-entity-empty-note">
                                Add founders under{" "}
                                {onOpenLegalEntity
                                    ? (
                                        <TextLink
                                            type="button"
                                            className="business-engagement-link"
                                            onClick={() => onOpenLegalEntity(["legal-section-1"])}
                                        >
                                            1. Identity System → 3. Legal Entity → 2. Founders & Ownership
                                        </TextLink>
                                    )
                                    : "1. Identity System → 3. Legal Entity → 2. Founders & Ownership"}
                                {" "}and they appear here.
                            </p>
                        )
                ), (
                    <FoldAllToggle
                        ids={founders.map(founder => founder.id)}
                        folds={folds}
                        label="founders"
                    />
                ))}

                {/* ---------- 2. Capability Gaps & Cover ---------- */}

                {subsection(1, (
                    <StrategyTextArea
                        className="interview-input business-foundation-note"
                        ariaLabel="Capability Gaps & Cover"
                        placeholder="The capabilities the team lacks, and how each will be covered: planned hires, advisors, mentors, partners, contractors, training"
                        disabled={disabled}
                        value={profile.teamGaps}
                        onChange={(next) => update({ teamGaps: next })}
                    />
                ), undefined, INFO.teamGaps)}

            </div>

        </div>

    );

}
