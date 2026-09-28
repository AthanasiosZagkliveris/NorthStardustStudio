import { CSSProperties, ReactNode, useEffect } from "react";

import {
    FOUNDER_ACHIEVEMENTS_MAX,
    FOUNDERS_PROFILE_SECTIONS,
    FounderProfileValue,
    FoundersProfileValue,
    LegalEntityFounderValue,
    asFoundersProfileValue,
    founderProfiles,
    withFounderProfiles
} from "../../framework/engine/AnswerUtils.ts";

import { railId } from "./rails/railItems.ts";
import { summaryText } from "./cardSummary.ts";
import FoldAllToggle from "./FoldAllToggle.tsx";
import FoldArrow from "./FoldArrow.tsx";
import InfoNote, { InfoText } from "./InfoNote.tsx";
import type { OpenPage } from "./jumpTo.ts";
import NumberedListInput from "./NumberedListInput.tsx";
import { NUMBER_LIMITS, limitedNumberText, numberInputMode } from "./numberInput.ts";
import StrategyTextArea from "./StrategyTextArea.tsx";
import { useItemFolds } from "./useItemFolds.ts";

import "../../styles/founders-profile.css";

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
        "How many years have they worked in this industry?",
        "Where, and in what: the companies, the sectors and the positions they held.",
        "Lenders and investors look for a team that already knows the market it is entering."
    ],

    managementExperience: [
        "Have they led a team, owned a budget or a P&L, or run a business?",
        "Say how big: how many people, how much money.",
        "It shows they can run the organization as it grows."
    ],

    achievements: [
        "What have they achieved that can be measured: what, how much, by when?",
        "Any business they started before, and how it turned out.",
        "Results are what make a track record believable. Up to three."
    ],

    skills: [
        "Which degrees, certifications or licences do they hold?",
        "Which key skills does the plan rely on them for: sales, finance, operations, technical?",
        "Lenders and investors check that every skill the plan needs is covered by someone."
    ],

    teamGaps: [
        "Which skills does the team lack?",
        "How are they covered: advisors, mentors, planned hires, outsourced partners, a board?",
        "A gap that is named and covered reads as a strength; one left unnamed reads as a risk."
    ]

};

interface FoundersProfileEditorProps {

    value: unknown;

    onChange: (value: FoundersProfileValue) => void;

    disabled?: boolean;

    /** See BrandStyleEditor.columnsDivider. */
    columnsDivider?: ReactNode;

    /** See AnswerRendererProps.showInstructions. */
    showInstructions?: boolean;

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
 * adds, removes or renames one. Then one box for the skills the team
 * as a whole lacks, and how they are covered.
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

                {children}

            </section>
        );

    }

    /** A label with its "i", as the Legal Entity page draws one. */
    function label(text: string, info: string[]) {
        return (
            <span className="legal-entity-label-info">
                <span className="legal-entity-label">
                    <InfoText text={text}>
                        <InfoNote label={text} points={info} />
                    </InfoText>
                </span>
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

    /* ---------- A founder ---------- */

    function founderCard(founder: FounderProfileValue & { name: string }, index: number) {

        const open = folds.isOpen(founder.id);

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
                <div className="legal-entity-card-head fold-card-head">

                    <FoldArrow
                        open={open}
                        label={who}
                        onToggle={() => folds.toggle(founder.id)}
                    />

                    <span className="legal-entity-card-number">
                        {(index + 1) + "."}
                    </span>

                    <span className="strategy-name-static">
                        {founder.name}
                    </span>

                    {!open && summary && (
                        <span className="business-card-summary">{summary}</span>
                    )}

                </div>

                {open && (
                    <div className="legal-entity-grid">

                        {/* Moved here from the Legal Entity page,
                            which asked it beside the founder's name. */}
                        {field("Roles", INFO.roles, (
                            <NumberedListInput
                                label={who + " roles"}
                                placeholder="Role"
                                items={founder.roles}
                                disabled={disabled}
                                onChange={(items) => updateFounder(founder.id, { roles: items })}
                            />
                        ))}

                        {field("Industry Experience", INFO.industryExperience, (
                            <>
                                <span className="founders-profile-years">
                                    <input
                                        type="text"
                                        inputMode={numberInputMode(NUMBER_LIMITS.years)}
                                        className="interview-input"
                                        aria-label={who + " years in the industry"}
                                        placeholder="0"
                                        disabled={disabled}
                                        value={founder.years}
                                        onChange={(event) => updateFounder(founder.id, {
                                            years: limitedNumberText(event.target.value, founder.years, NUMBER_LIMITS.years)
                                        })}
                                    />
                                    <span className="legal-entity-label">years in the industry</span>
                                </span>
                                <StrategyTextArea
                                    className="interview-input legal-entity-note"
                                    ariaLabel={who + " industry experience"}
                                    placeholder="Where, and in what: companies, sectors, positions"
                                    disabled={disabled}
                                    value={founder.industryExperience}
                                    onChange={(next) => updateFounder(founder.id, { industryExperience: next })}
                                />
                            </>
                        ))}

                        {field("Management Experience", INFO.managementExperience, (
                            <StrategyTextArea
                                className="interview-input legal-entity-note"
                                ariaLabel={who + " management experience"}
                                placeholder="Teams led (size), budgets or P&L owned, businesses run"
                                disabled={disabled}
                                value={founder.managementExperience}
                                onChange={(next) => updateFounder(founder.id, { managementExperience: next })}
                            />
                        ))}

                        {field("Key Achievements", INFO.achievements, (
                            <NumberedListInput
                                label={who + " key achievements"}
                                placeholder="What, how much, by when"
                                items={founder.achievements}
                                maxItems={FOUNDER_ACHIEVEMENTS_MAX}
                                disabled={disabled}
                                onChange={(items) => updateFounder(founder.id, {
                                    achievements: items.slice(0, FOUNDER_ACHIEVEMENTS_MAX)
                                })}
                            />
                        ))}

                        {field("Skills & Qualifications", INFO.skills, (
                            <NumberedListInput
                                label={who + " skills & qualifications"}
                                placeholder="A degree, certification, licence or key skill"
                                items={founder.skills}
                                disabled={disabled}
                                onChange={(items) => updateFounder(founder.id, { skills: items })}
                            />
                        ), true)}

                    </div>
                )}

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
                            skills the team still lacks.
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
                        ? founders.map(founderCard)
                        : (
                            <p className="legal-entity-empty-note">
                                Add founders under{" "}
                                {onOpenLegalEntity
                                    ? (
                                        <button
                                            type="button"
                                            className="business-engagement-link"
                                            onClick={() => onOpenLegalEntity(["legal-section-1"])}
                                        >
                                            1. Identity System → 3. Legal Entity → 2. Founders & Ownership
                                        </button>
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

                {/* ---------- 2. Team Gaps & Cover ---------- */}

                {subsection(1, (
                    <StrategyTextArea
                        className="interview-input legal-entity-note"
                        ariaLabel="Team Gaps & Cover"
                        placeholder="Skills the team lacks, and who covers them: advisors, mentors, planned hires, partners, a board"
                        disabled={disabled}
                        value={profile.teamGaps}
                        onChange={(next) => update({ teamGaps: next })}
                    />
                ), undefined, INFO.teamGaps)}

            </div>

        </div>

    );

}
