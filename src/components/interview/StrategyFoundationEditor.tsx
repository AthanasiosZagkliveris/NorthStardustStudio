import { CSSProperties, ReactNode, useEffect } from "react";

import {
    STRATEGY_FOUNDATION_SECTIONS,
    STRATEGY_SWOT_QUADRANTS,
    StrategyFoundationValue,
    StrategyRangeValue,
    StrategyThemeValue,
    asStrategyFoundationValue,
    createStrategyTheme,
    formatRangeAbbrev,
    isRangeSet,
    STRATEGY_THEME_SUGGESTIONS,
    strategyThemeHues,
    monthIndex
} from "../../framework/engine/AnswerUtils.ts";
import { railId } from "./rails/railItems.ts";

import BoxActions, { reorder, useMovableBox } from "./ReorderControls.tsx";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import { ColumnHeading, GuidanceBullets } from "./ColumnHeads.tsx";
import AddThemeMenu from "./AddThemeMenu.tsx";
import { AnswerType } from "../../framework/enums/AnswerType.ts";
import MonthYearPicker from "./MonthYearPicker.tsx";
import StrategyTextArea from "./StrategyTextArea.tsx";
import NumberedListInput from "./NumberedListInput.tsx";

interface StrategyFoundationEditorProps {

    value: unknown;

    onChange: (value: StrategyFoundationValue) => void;

    disabled?: boolean;

    /** The Identity System's Vision, shown beside the Strategic Compass. */
    vision?: string;

    /** The Current Situation drafted from the Business System ("" when it records nothing). */
    situationDraft?: string;

    /** Asks before a Refresh replaces the founder's own words. */
    guardSituationRefresh?: (apply: () => void) => void;

    /** Opens a Business System page: the "i" on 1. Current Situation Analysis links to where each answer comes from. */
    openBusinessPage?: (type: AnswerType) => void;

    /** The financial plan's first and last month (Business System), to compare the Period with. */
    financialPlan?: StrategyRangeValue | null;

    /** See BrandStyleEditor.startNumber. */
    startNumber?: number;

    /** See BrandStyleEditor.columnsDivider. */
    columnsDivider?: ReactNode;

    /**
     * Whether the bullet guidance above the progress line shows.
     * Toggled by the Help button the page renders just above that
     * line -- see AnswerRendererProps.showInstructions.
     */
    showInstructions?: boolean;

    /**
     * Guards a change that could take work with it: removing a Theme
     * that already has Goals on the Strategic Period page, or
     * narrowing the Strategic Period past an Objective planned
     * inside the part being cut away.
     *
     * The guard either calls `apply` straight away (nothing at risk)
     * or holds it until the user has confirmed. It lives on the page
     * rather than here because only the page can see the OTHER
     * Section's stored answers -- this editor deliberately knows
     * nothing about them -- and because the app's confirmations are
     * its own dialogs, which are asynchronous.
     *
     * Omitted, every change applies immediately.
     */
    guardThemeRemoval?: (theme: StrategyThemeValue, apply: () => void) => void;

    guardPeriodChange?: (period: StrategyRangeValue, apply: () => void) => void;

}

/** The first month a Strategic Period may start in: this one. */
function currentMonthIndex(): number {
    const now = new Date();
    return now.getFullYear() * 12 + now.getMonth();
}

/** The common Strategic Themes: the "i" at the end of 4. Strategic Period's Themes line. */
const THEME_SUGGESTIONS: InfoPoint[] = STRATEGY_THEME_SUGGESTIONS.map(suggestion => ({
    title: suggestion.name,
    text: suggestion.description
}));

/**
 * The Strategy System's Foundation page (see
 * AnswerType.StrategyFoundation).
 *
 * Laid out the way the Identity System's column pages and the Brand
 * System's Style page are: every column's heading and bullet
 * guidance above the progress line, every input below it. Four equal
 * columns following the page's own progression -- understand the
 * present, analyse the situation, define the direction, establish
 * the priorities.
 *
 * This page is the only place the Strategic Period and the Strategic
 * Themes are stored. The other two Strategy pages read them here.
 */
export default function StrategyFoundationEditor({

    value,

    onChange,

    disabled = false,

    startNumber = 1,

    columnsDivider,

    showInstructions = true,

    guardThemeRemoval,

    guardPeriodChange,

    vision = "",

    situationDraft = "",

    guardSituationRefresh,

    openBusinessPage,

    financialPlan = null

}: StrategyFoundationEditorProps) {

    const foundation = asStrategyFoundationValue(value);

    function update(patch: Partial<StrategyFoundationValue>) {
        onChange({ ...foundation, ...patch });
    }

    /*
        THE CURRENT SITUATION, FILLED IN FROM THE BUSINESS SYSTEM by
        default. While the text is the draft ("auto"), it follows the
        Business System as it changes; once the founder edits it, it is
        theirs and stays. An empty answer saved before the draft
        existed is filled in too; a written one is left alone.
    */
    const followsDraft = foundation.situationSource === "auto" ||
        (foundation.situationSource === "" && foundation.situation.trim().length === 0);

    useEffect(() => {
        if (!disabled && situationDraft && followsDraft && foundation.situation !== situationDraft) {
            onChange({ ...foundation, situation: situationDraft, situationSource: "auto" });
        }
    }, [disabled, situationDraft, followsDraft, foundation, onChange]);

    /* ---------- 4. Strategic Period and the financial plan ---------- */

    const periodDiffers = financialPlan !== null && (
        monthIndex(foundation.period.start) !== monthIndex(financialPlan.start) ||
        monthIndex(foundation.period.end) !== monthIndex(financialPlan.end));


    /** The Strategic Period set to the financial plan's, through the same guard as the pickers. */
    function applyPlanPeriod() {
        if (!financialPlan) {
            return;
        }
        commitPeriod({ start: { ...financialPlan.start }, end: { ...financialPlan.end } });
    }

    /** An "i" naming where a question is answered, each a link to that page. */
    function answeredIn(label: string, pages: [string, string, AnswerType][]) {
        return (
            <InfoNote
                label={label}
                fullList
                points={pages.map(([title, where, type]) => ({
                    title,
                    text: "(" + where + ")",
                    onOpen: openBusinessPage ? () => openBusinessPage(type) : undefined
                }))}
            />
        );
    }

    /** Back to the draft: asked first when it would replace the founder's words. */
    function refreshSituation() {
        const apply = () => update({ situation: situationDraft, situationSource: "auto" });
        if (foundation.situationSource === "edited" && foundation.situation.trim() && guardSituationRefresh) {
            guardSituationRefresh(apply);
        } else {
            apply();
        }
    }

    function heading(offset: number) {
        return (
            <ColumnHeading
                offset={offset}
                title={STRATEGY_FOUNDATION_SECTIONS[offset]}
                startNumber={startNumber}
            />
        );
    }

    function bullets(lines: ReactNode[]) {
        return <GuidanceBullets lines={lines} show={showInstructions} />;
    }

    /* ---------- Strategic Period ---------- */

    function setPeriodEdge(edge: "start" | "end", next: { month: string; year: string }) {

        const period: StrategyRangeValue = { ...foundation.period, [edge]: next };

        // Moving the start past the end clears the end rather than
        // leaving a period that runs backwards.
        if (edge === "start" &&
            monthIndex(period.end) >= 0 &&
            monthIndex(period.end) < monthIndex(period.start)) {
            period.end = { month: "", year: "" };
        }

        commitPeriod(period);

    }

    function commitPeriod(period: StrategyRangeValue) {

        const apply = () => update({ period });

        // Narrowing the period can strand an Objective planned inside
        // the part being cut away, so the page gets to ask first.
        if (guardPeriodChange) {
            guardPeriodChange(period, apply);
            return;
        }

        apply();

    }

    /* ---------- Strategic Themes ---------- */

    function setTheme(index: number, patch: Partial<StrategyThemeValue>) {
        update({
            themes: foundation.themes.map(
                (theme, position) => position === index ? { ...theme, ...patch } : theme
            )
        });
    }

    function removeTheme(index: number) {

        const theme = foundation.themes[index];

        if (!theme) {
            return;
        }

        const apply = () => update({
            themes: foundation.themes.filter((_theme, position) => position !== index)
        });

        // Removing a Theme takes every Goal, Objective, Initiative
        // and Metric written under it on the Strategic Period page
        // with it, so the page asks first when there is any.
        if (guardThemeRemoval) {
            guardThemeRemoval(theme, apply);
            return;
        }

        apply();

    }

    // Only the ORDER changes on a move. A Theme keeps its id, so the
    // Goals hung off it on the Strategic Period page follow it rather
    // than staying behind with the position.
    const themeBox = useMovableBox(
        (from, to) => update({ themes: reorder(foundation.themes, from, to) }),
        removeTheme
    );

    // One pass over the whole list, so no two Themes can land on
    // the same hue. The hue itself goes down to each box rather
    // than a finished tint: the box's ground is drawn from it, and
    // so is everything that glows inside it (see --glow-color in
    // global.css).
    const themeHues = strategyThemeHues(foundation.themes.map(theme => theme.id));

    const currentYear = new Date().getFullYear();
    const thisMonth = currentMonthIndex();

    return (

        <div
            className="brand-style strategy-foundation"
            style={{ "--answer-column-count": 4 } as CSSProperties}
        >

            {/* Row 1 -- headings and guidance, above the line */}
            <div className="brand-style-head">
                {heading(0)}
                {bullets([
                    <><InfoText text="What do you sell, and who uses it?">{answeredIn("What you sell", [
                        ["Offerings and Customer Segments", "3. Business System → 1. Foundation", AnswerType.BusinessFoundation]
                    ])}</InfoText></>,
                    <><InfoText text="How do people discover and reach you?">{answeredIn("How customers reach you", [
                        ["Customer Channels", "3. Business System → 2. Customer Engagement", AnswerType.BusinessEngagement]
                    ])}</InfoText></>,
                    <><InfoText text="How are you supported financially today?">{answeredIn("How you are funded", [
                        ["Costs and funding", "3. Business System → 4. Financial Foundation", AnswerType.FinancialFoundation],
                        ["Revenue and break even", "3. Business System → 5. Financial Sustainability", AnswerType.FinancialSustainability]
                    ])}</InfoText></>
                ])}
            </div>

            <div className="brand-style-head">
                {heading(1)}
                {bullets([
                    "Strengths and Weaknesses: inside your organization.",
                    "Opportunities and Threats: outside, in your market.",
                    "Think of resources, skills, customers, competition and technology."
                ])}
            </div>

            <div className="brand-style-head">
                {heading(2)}
                {bullets([
                    "Where do you want your organization to be heading, and what do you want it to build, become, or achieve over the long term?",
                    "Choose a time horizon far enough ahead to give your strategy direction, yet close enough for your organization to make meaningful decisions about.",
                    <>
                        {/* The Vision the line names, one click away. */}
                        <InfoText text="The Vision is the goal; the Compass is the route.">
                            <InfoNote
                                label="Your Vision"
                                points={[vision.trim()
                                    ? vision.trim()
                                    : "Not written yet. Write it under 1. Identity System → 1. Definition → 4. Vision."]}
                            />
                        </InfoText>
                    </>
                ])}
            </div>

            <div className="brand-style-head">
                {heading(3)}
                {bullets([
                    "Choose a start and an end: three to five years.",
                    <>
                        <InfoText text="Name 3 to 5 Strategic Themes: broad areas the organisation intends to develop during the strategic period.">
                            <InfoNote label="Common Strategic Themes" fullList points={THEME_SUGGESTIONS} />
                        </InfoText>
                    </>,
                    "Say briefly why each Theme matters."
                ])}
            </div>

            {/* Row 2 -- the progress line, spanning every column */}
            {columnsDivider && (
                <div className="answer-columns-divider">{columnsDivider}</div>
            )}

            {/* Row 3 -- the inputs, below the line */}
            <div className="brand-style-body" data-rail={railId(STRATEGY_FOUNDATION_SECTIONS[0])}>

                <StrategyTextArea
                    className="interview-input strategy-prose"
                    ariaLabel="Current situation analysis"
                    placeholder="Describe your organization as it is today"
                    disabled={disabled}
                    value={foundation.situation}
                    onChange={(next) => update({ situation: next, situationSource: "edited" })}
                />

                {/* Where the text came from, and the way back to the draft. */}
                <div className="strategy-situation-source">
                    <span className="strategy-situation-note">
                        {!situationDraft
                            ? "Filled in from the Business System once it records your Offerings, Channels and finances."
                            : foundation.situationSource === "auto"
                                ? "Filled in from the Business System. Edit it freely."
                                : "Your own text. Refresh brings back the draft from the Business System."}
                    </span>
                    <button
                        type="button"
                        className="business-engagement-link"
                        disabled={disabled || !situationDraft}
                        onClick={refreshSituation}
                    >
                        Refresh
                    </button>
                </div>

            </div>

            <div className="brand-style-body" data-rail={railId(STRATEGY_FOUNDATION_SECTIONS[1])}>

                {STRATEGY_SWOT_QUADRANTS.map(quadrant => (

                    <div className="strategy-swot-quadrant" key={quadrant.id}>

                        <span className="strategy-field-label">{quadrant.label}</span>

                        <NumberedListInput
                            label={quadrant.label}
                            items={foundation.swot[quadrant.id] ?? [""]}
                            disabled={disabled}
                            onChange={(items) => update({
                                swot: { ...foundation.swot, [quadrant.id]: items }
                            })}
                        />

                    </div>

                ))}

            </div>

            <div className="brand-style-body" data-rail={railId(STRATEGY_FOUNDATION_SECTIONS[2])}>

                <StrategyTextArea
                    className="interview-input strategy-prose"
                    ariaLabel="Strategic compass"
                    placeholder="Describe the direction for this period"
                    disabled={disabled}
                    value={foundation.compass}
                    onChange={(next) => update({ compass: next })}
                />

            </div>

            <div className="brand-style-body" data-rail={railId(STRATEGY_FOUNDATION_SECTIONS[3])}>

                {/*
                    No title above these two: the column heading
                    already says Strategic Period, and repeating it
                    inside the box said the same thing twice.
                */}
                <div className="strategy-period-box">

                    <MonthYearPicker
                        label="Start"
                        value={foundation.period.start}
                        disabled={disabled}
                        firstYear={currentYear - 2}
                        // A strategy already underway can be recorded:
                        // it may have started up to two years ago. It
                        // cannot end before this month (see End).
                        isAllowed={(month, year) =>
                            year * 12 + (month - 1) >= thisMonth - 24}
                        onChange={(next) => setPeriodEdge("start", next)}
                    />

                    <MonthYearPicker
                        label="End"
                        value={foundation.period.end}
                        disabled={disabled}
                        firstYear={
                            monthIndex(foundation.period.start) >= 0
                                ? Number(foundation.period.start.year)
                                : currentYear
                        }
                        // And never earlier than the start.
                        isAllowed={(month, year) =>
                            year * 12 + (month - 1) >= Math.max(
                                thisMonth,
                                monthIndex(foundation.period.start)
                            )}
                        onChange={(next) => setPeriodEdge("end", next)}
                    />

                </div>

                {/* The financial plan's dates, so the Business Plan does
                    not show two unrelated time frames. */}
                {financialPlan && (
                    <div className={"strategy-plan-dates" + (periodDiffers ? " strategy-plan-dates-differ" : "")} role="note">
                        <span>
                            Your financial plan runs {formatRangeAbbrev(financialPlan)}.
                            {periodDiffers && isRangeSet(foundation.period)
                                ? " The Strategic Period differs, so the Business Plan will show two time frames."
                                : ""}
                        </span>
                        {periodDiffers && (
                            <button
                                type="button"
                                className="business-engagement-link"
                                disabled={disabled}
                                onClick={applyPlanPeriod}
                            >
                                Use the same period
                            </button>
                        )}
                    </div>
                )}

                {foundation.themes.map((theme, index) => {

                    const box = themeBox.boxProps(
                        index,
                        foundation.themes.length,
                        `Strategic Theme ${index + 1}`
                    );

                    return (

                        <div
                            key={theme.id}
                            {...box}
                            className={`strategy-theme-box ${box.className}`}
                            style={{ "--strategy-theme-hue": themeHues[theme.id] } as CSSProperties}
                        >

                            {/*
                                Which Theme this is, on its own line
                                across the top, with removal in the
                                corner -- then the name and the
                                description beneath it. The label
                                names the box; it is not a prefix to
                                the name field.
                            */}
                            <div className="strategy-box-head">

                                <span
                                    className="strategy-drag-handle"
                                    {...themeBox.handleProps}
                                >
                                    ⠿
                                </span>

                                <span className="strategy-box-number">
                                    {`Theme ${index + 1}`}
                                </span>

                                <BoxActions
                                    label={`Strategic Theme ${index + 1}`}
                                    disabled={disabled}
                                    onRemove={() => removeTheme(index)}
                                />

                            </div>

                            <div className="strategy-box-body">

                                <input
                                    type="text"
                                    className="interview-input"
                                    aria-label={`Strategic Theme ${index + 1} name`}
                                    placeholder="Theme name"
                                    disabled={disabled}
                                    value={theme.name}
                                    onChange={(event) => setTheme(index, { name: event.target.value })}
                                />

                                <StrategyTextArea
                                    className="interview-input strategy-note"
                                    ariaLabel={`Strategic Theme ${index + 1} description`}
                                    placeholder="What it represents and why it matters"
                                    disabled={disabled}
                                    value={theme.description}
                                    onChange={(next) => setTheme(index, { description: next })}
                                />

                            </div>

                        </div>

                    );

                })}

                {foundation.themes.length > 5 && (
                    <p className="strategy-theme-count" role="note">
                        More than 5 Themes can spread your focus thin: 3 to 5 is usual.
                    </p>
                )}

                <AddThemeMenu
                    suggestions={STRATEGY_THEME_SUGGESTIONS}
                    usedNames={foundation.themes.map(theme => theme.name)}
                    disabled={disabled}
                    onAdd={(name, description) => update({ themes: [...foundation.themes, createStrategyTheme(name, description)] })}
                />

            </div>

        </div>

    );

}
