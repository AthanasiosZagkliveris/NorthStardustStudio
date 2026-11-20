import { CSSProperties, Fragment, ReactNode, useEffect, useRef } from "react";
import DialogSectionBand from "../tiles/DialogSectionBand.tsx";

import AddButton from "../../controls/AddButton.tsx";
import CardShell from "../cards/CardShell.tsx";
import FieldLabel from "../../controls/FieldLabel.tsx";
import {
    STRATEGY_FOUNDATION_SECTIONS,
    STRATEGY_SWOT_QUADRANTS,
    strategySwotShown,
    StrategyFoundationValue,
    StrategyRangeValue,
    StrategyThemeValue,
    asStrategyFoundationValue,
    createStrategyTheme,
    formatRangeAbbrev,
    isRangeSet,
    STRATEGY_THEME_SUGGESTIONS,
    monthIndex
} from "../../../framework/engine/AnswerUtils.ts";
import { railId } from "../rails/railItems.ts";
import { workHue } from "../../../framework/engine/WorkColours.ts";
import { FieldMark, FieldStatus } from "../fields/fieldMarks.tsx";

import InfoNote, { InfoPoint } from "../fields/InfoNote.tsx";
import SectionTiles, { DialogHeading, OPEN_EVENT, type OpenRequest, type SectionTile, type TileAdd } from "../tiles/SectionTiles.tsx";
import AddThemeMenu from "./AddThemeMenu.tsx";
import { AnswerType } from "../../../framework/enums/AnswerType.ts";
import MonthYearPicker from "../fields/MonthYearPicker.tsx";
import StrategyTextArea from "../fields/StrategyTextArea.tsx";
import NumberedListInput from "../fields/NumberedListInput.tsx";
import FieldRow from "../fields/FieldRow.tsx";
import { AutoDraft } from "../fields/useAutoDraft.ts";
import RadioChoice from "../../controls/RadioChoice.tsx";
import RatingScaleGroup from "../../controls/RatingScaleGroup.tsx";
import type { Rating } from "../../controls/RatingScale.tsx";
import { BusinessTicks } from "../cards/BusinessCardFields.tsx";
import { SingleColumn } from "./foundation/shared.tsx";
import { namesInSentence } from "../../../framework/engine/CompetitorQuestions.ts";
import { DIFFERENTIATION_PHRASES } from "../../../framework/engine/AmbassadorChoices.ts";
import {
    SC1_STANCES, SC2_MAX, SC_INFO, SC_LABELS, SW1_INFO, SW1_LABEL, type StrategyChoiceContext,
    changeEffectLines, changeEffectsShown, changeRows, compassChoicesShown, compassDraft, growthOptions
} from "../../../framework/engine/StrategyChoices.ts";

interface StrategyFoundationEditorProps {

    value: unknown;

    onChange: (value: StrategyFoundationValue) => void;

    disabled?: boolean;

    /** The Identity System's Vision, shown beside the Strategic Compass. */
    vision?: string;

    /** The Current Situation drafted from the Business System ("" when it records nothing). */
    situationDraft?: string;

    /** The SWOT's starts from the Business System's market answers (swotStartsOf), shown in a quadrant never edited (strategySwotShown). */
    swotStarts?: { opportunities: string[]; threats: string[] };

    /** What SW1 and SC1 to SC3 read from the other Systems (strategyChoiceContext; doc 49, 2.3 and 2.4). */
    choices?: StrategyChoiceContext;

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

    /**
     * The tiles of 2. Goals & Objectives and of 3. Roadmap, drawn in the Strategic Period's dialog beside the dates: the page's own tiles, each opening
     * what it opens there. It is given this page's Themes and where to write one of them.
     */
    periodTiles?: (args: { only?: "roadmap" | "themes"; foundation: StrategyFoundationValue; onEditTheme: (themeId: string, patch: { name?: string; description?: string }) => void; onRemoveTheme: (themeId: string) => void; onAddTheme: () => void; trailing?: ReactNode }) => ReactNode;

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

    startNumber: _startNumber = 1,

    guardThemeRemoval,


    vision = "",

    situationDraft = "",

    swotStarts,

    choices,

    guardSituationRefresh,

    openBusinessPage,

    financialPlan = null,

    periodTiles

}: StrategyFoundationEditorProps) {

    const foundation = asStrategyFoundationValue(value);

    function update(patch: Partial<StrategyFoundationValue>) {
        onChange({ ...foundation, ...patch });
    }

    /*
        SW1 AND SC1 TO SC3 (doc 49, 2.3 and 2.4; the owner's approved plan of 2026-11-18, §3, B2). The SWOT shown adds SW1's lines to the starts as they are rated;
        the Compass's three choices follow their starts until chosen, and its "Add a draft" writes the Compass sentence once.
    */
    const changeLines = changeEffectLines(foundation.changeEffects);
    const starts = { opportunities: [...(swotStarts?.opportunities ?? []), ...changeLines.opportunities], threats: [...(swotStarts?.threats ?? []), ...changeLines.threats] };
    const swotShown = strategySwotShown(foundation, starts);
    const effects = changeEffectsShown(foundation.changeEffects, choices?.changeStarts ?? []);
    /** SW1 saved whole once touched: each ticked change with its rating (0 while unrated). */
    const saveEffects = (ticked: readonly string[], ratings: Readonly<Record<string, number>>) => update({ changeEffects: Object.fromEntries(ticked.map(id => [id, ratings[id] ?? 0])) });
    const compassShown = choices ? compassChoicesShown(foundation, swotShown, choices) : undefined;
    const draft = choices && compassShown ? compassDraft(isRangeSet(foundation.period) ? formatRangeAbbrev(foundation.period) : "", compassShown, choices) : "";
    const band = (content: ReactNode, at: number) => <div key={at} className={"legal-entity-org-section" + (at % 2 === 1 ? " legal-entity-org-band" : "")}>{content}</div>;

    /* The answer as it is now, for a Theme left blank and taken away later. */
    const latest = useRef({ foundation, onChange });
    latest.current = { foundation, onChange };

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

    /** Back to the draft: asked first when it would replace the founder's words. */
    function refreshSituation() {
        const apply = () => update({ situation: situationDraft, situationSource: "auto" });
        if (foundation.situationSource === "edited" && foundation.situation.trim() && guardSituationRefresh) {
            guardSituationRefresh(apply);
        } else {
            apply();
        }
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

        // Applied at once: the Strategic Period and the financial plan turn at their own speeds, so no question is asked of a change.
        update({ period });

    }

    /* ---------- Strategic Themes ---------- */

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

    const currentYear = new Date().getFullYear();
    const thisMonth = currentMonthIndex();

    /* ---------- The four columns, each in a tile's dialog ---------- */

    /** Each column's guidance as the "i" beside its title. */
    const pageLink = (type: AnswerType) => openBusinessPage ? () => openBusinessPage(type) : undefined;
    const columnInfo: InfoPoint[][] = [
        [
            { title: "What do you sell, and who uses it?", text: "(3. Business System → Foundation & Engagement: Offerings and Customer Segments)", onOpen: pageLink(AnswerType.BusinessFoundation) },
            { title: "How do people discover and reach you?", text: "(3. Business System → Foundation & Engagement: Customer Channels)", onOpen: pageLink(AnswerType.BusinessEngagement) },
            { title: "How are you supported financially today?", text: "(3. Business System → Financials: Revenue and prices; costs, funding and break even)", onOpen: pageLink(AnswerType.FinancialFoundation) }
        ],
        [
            "Strengths and Weaknesses: inside your organisation.",
            "Opportunities and Threats: outside, in your market.",
            "Think of resources, skills, customers, competition and technology."
        ],
        [
            "Where do you want your organisation to be heading, and what do you want it to build, become, or achieve over the long term?",
            "Choose a time horizon far enough ahead to give your strategy direction, yet close enough for your organisation to make meaningful decisions about.",
            { title: "The Vision is the goal; the Compass is the route.", text: vision.trim() ? vision.trim() : "Your Vision is not written yet. Write it under 1. Identity System → Definition & Purpose → Mission & Vision." }
        ],
        [
            "Choose a start and an end: three to five years.",
            "Name 3 to 5 Strategic Themes: broad areas the organisation intends to develop during the strategic period.",
            "Say briefly why each Theme matters."
        ]
    ];
    const themeInfo: InfoPoint[] = [...THEME_SUGGESTIONS];

    /** A blank Theme added from a Theme's own "+" (the Theme's card): a new card of the same kind. */
    const onAddTheme = () => update({ themes: [...foundation.themes, createStrategyTheme()] });

    /** A Theme made from the dialog's Add Card: made blank, and its card shown at once. */
    const addThemeAndShow = () => {
        const made = createStrategyTheme();
        update({ themes: [...foundation.themes, made] });
        window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: made.id, box: "open" } })), 120);
    };

    const removeThemeById = (themeId: string) => removeTheme(foundation.themes.findIndex(theme => theme.id === themeId));

    /** A Theme's name or description, typed in its tile's dialog. */
    const editTheme = (themeId: string, patch: { name?: string; description?: string }) => update({ themes: foundation.themes.map(theme => theme.id === themeId ? { ...theme, ...patch } : theme) });

    /** The financial plan's dates, so the Business Plan does not show two unrelated time frames: beside the Strategic Period's title. */
    const planNote: ReactNode = financialPlan ? (
        <div className="strategy-plan-dates" role="note">
            <span className="strategy-plan-dates-text">
                <FieldLabel>Financial Plan:</FieldLabel>
                <strong>{formatRangeAbbrev(financialPlan)}</strong>
            </span>
        </div>
    ) : null;

    const columnBodies: ReactNode[] = [
        (
            <>

                <StrategyTextArea
                    className="interview-input strategy-prose"
                    ariaLabel="Current situation analysis"
                    placeholder="Describe your organisation as it is today"
                    disabled={disabled}
                    value={foundation.situation}
                    onChange={(next) => update({ situation: next, situationSource: "edited" })}
                />

                {/* Where the text came from, and the way back to the draft. */}
                <div className="strategy-situation-source">
                    <AddButton className="strategy-situation-refresh"
                        disabled={disabled || !situationDraft}
                        onClick={refreshSituation}>
                        Refresh
                    </AddButton>
                    <InfoNote
                        label="Refresh"
                        points={[!situationDraft
                            ? "Filled in from the Business System once it records your Offerings, Channels and finances."
                            : foundation.situationSource === "auto"
                                ? "Filled in from the Business System. Edit it freely."
                                : "Your own text. Refresh brings back the draft from the Business System."]}
                    />
                </div>

            </>
        ),
        (
            <>

                {/* (THE VISION AT THE TOP OF THE SWOT, AS ITS AIM (doc 49, section 9, P6; owner, 2026-11-20 12:49 UTC+2, "proceed to changes"): read from the
                    Identity System's Definition, shown, never edited here.) */}
                <SingleColumn>
                    {band(
                        <FieldRow pair fullList label="Your Vision" info={["The aim the SWOT is read against: what helps you reach it, and what stands in the way."]}>
                            <p className="legal-entity-empty-note">{vision.trim() ? vision.trim() : "Write your Vision on Definition & Purpose, Mission & Vision."}</p>
                        </FieldRow>,
                        0
                    )}
                </SingleColumn>

                {STRATEGY_SWOT_QUADRANTS.map(quadrant => (

                    <Fragment key={quadrant.id}>

                    {/* (SW1, in its band above the Opportunities and Threats: doc 49, 2.3.) */}
                    {quadrant.id === "opportunities" && choices && (
                        <SingleColumn>
                            {band(
                                <FieldRow pair fullList infoLead label={SW1_LABEL} info={[...SW1_INFO]}>
                                    <RatingScaleGroup
                                        label={SW1_LABEL}
                                        name="strategy-change-effects"
                                        rows={changeRows(choices.changeStarts)}
                                        values={effects.ratings as Readonly<Partial<Record<string, Rating>>>}
                                        selectable
                                        selected={effects.ticked}
                                        onSelect={(id, on) => saveEffects(on ? [...effects.ticked, id] : effects.ticked.filter(entry => entry !== id), effects.ratings)}
                                        onChange={(id, next) => saveEffects(effects.ticked, { ...effects.ratings, [id]: next ?? 0 })}
                                        lowLabel="Threat"
                                        highLabel="Opportunity"
                                        disabled={disabled}
                                    />
                                </FieldRow>,
                                0
                            )}
                        </SingleColumn>
                    )}

                    <div className="strategy-swot-quadrant" data-field-holder="">

                        <FieldLabel className="strategy-field-label">
                            {quadrant.label}
                            <FieldMark label={quadrant.label} />
                        </FieldLabel>
                        <FieldStatus label={quadrant.label} />

                        <NumberedListInput
                            label={quadrant.label}
                            items={swotShown[quadrant.id]}
                            disabled={disabled}
                            onChange={(items) => update({
                                swot: { ...foundation.swot, [quadrant.id]: items },
                                // (Edited: the founder's own lines from now on, even emptied.)
                                swotEdited: [...new Set([...foundation.swotEdited, quadrant.id])]
                            })}
                        />

                    </div>

                    </Fragment>

                ))}

            </>
        ),
        (
            <>

                {/* (SC1 to SC3, one question per band above the Compass's text, then "Add a draft": doc 49, 2.4.) */}
                {choices && compassShown && (
                    <SingleColumn>
                        {[
                        // (THE COMPASS IN THE ORDER IT IS DECIDED (doc 49, section 9, P7; owner, 2026-11-20 12:49 UTC+2): which Segment first, where growth comes from, then
                        // what the strategy mainly does.)
                            // (SC3 is asked with two Segments or more; with one, that Segment is the answer.)
                            ...(choices.segments.length >= 2 ? [
                                <FieldRow key="sc3" pair fullList label={SC_LABELS.sc3} info={[...SC_INFO.sc3]}>
                                    <RadioChoice label={SC_LABELS.sc3} group="strategy-first-segment" className="legal-entity-radio-stack" disabled={disabled} value={compassShown.firstSegmentId}
                                        onChange={(next) => update({ firstSegmentId: next })}
                                        options={choices.segments.map((segment, at) => ({ id: segment.id, label: segment.name || "Segment " + (at + 1) }))} />
                                </FieldRow>
                            ] : []),
                            <FieldRow key="sc2" pair fullList label={SC_LABELS.sc2} info={[...SC_INFO.sc2]} labelNote={<span className="business-foundation-tick-note">{SC2_MAX + " max"}</span>}>
                                <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={SC_LABELS.sc2}>
                                    <BusinessTicks name={SC_LABELS.sc2} disabled={disabled} options={growthOptions(choices.stage)} chosen={compassShown.growth} max={SC2_MAX} onChange={(next) => update({ growth: next })} />
                                </div>
                            </FieldRow>,
                            <FieldRow key="sc1" pair fullList label={SC_LABELS.sc1} info={[...SC_INFO.sc1]}>
                                <RadioChoice label={SC_LABELS.sc1} group="strategy-stance" className="legal-entity-radio-stack" disabled={disabled} value={compassShown.stance}
                                    onChange={(next) => update({ stance: next })}
                                    options={SC1_STANCES.filter(stance => !(choices.stage === "plan" || choices.stage === "launch") || stance.id === "so" || stance.id === "wo" || stance.id === compassShown.stance).map(stance => ({ id: stance.id, label: stance.label }))} />
                                {/* (EACH SEGMENT'S POINT OF DIFFERENCE, K14, AS A RECORD UNDER SC1 (doc 49, section 9, P8; owner, 2026-11-20 12:49 UTC+2, "proceed to changes"): read from
                                    the Competitors' Differentiation, in the Compass draft's words; nothing is asked here.) */}
                                {choices.segments.filter(segment => segment.differentiation.length > 0).map((segment, at) => (
                                    <p key={segment.id} className="legal-entity-empty-note">
                                        {(segment.name || "Segment " + (at + 1)) + " stands out for " + namesInSentence(segment.differentiation.map(id => DIFFERENTIATION_PHRASES[id] ?? "").filter(Boolean)) + "."}
                                    </p>
                                ))}
                            </FieldRow>
                        ].map((content, at) => band(content, at))}
                    </SingleColumn>
                )}
                {/* (THE DRAFT, WRITTEN IN BY ITSELF while the Compass is empty or still the app's: owner, 2026-11-20 18:35 UTC+2; the details go in its Notes, under it.) */}
                <AutoDraft text={foundation.compass} draft={draft} write={(next) => update({ compass: next })} disabled={disabled} />

                <StrategyTextArea
                    className="interview-input strategy-prose"
                    ariaLabel="Strategic compass"
                    placeholder="Describe the direction for this period"
                    disabled={disabled}
                    value={foundation.compass}
                    onChange={(next) => update({ compass: next })}
                />

            </>
        ),
        (
            <>

                {/*
                    No title above these two: the column heading
                    already says Strategic Period, and repeating it
                    inside the box said the same thing twice.
                */}
                {/* The dates side by side, the plan's dates in one line under them, then the tiles (the Roadmap's, the Themes', and the "Add Card"). */}
                <div className="strategy-period-column">

                {/* The Start and the End at the left, the Roadmap's tile beside them (its top and bottom the cells', its sides the second and the third tile's below). */}
                <div className="strategy-period-top">

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

                {periodTiles && (
                    <div className="strategy-period-roadmap">
                        {periodTiles({ only: "roadmap", foundation, onEditTheme: editTheme, onRemoveTheme: removeThemeById, onAddTheme })}
                    </div>
                )}

                </div>

                </div>

                {periodTiles
                    ? (
                        <div className="strategy-period-themes">
                            {/* THE THEMES, a titled section of the dialog above their tiles (owner, 2026-11-10: "Add a section above the tiles with the name Themes"; DialogSectionBand). */}
                            {/* (The Themes' "i" beside the title, the Add card plain: owner, 2026-11-10, "move the i from the Add Card, next to the THEMES".) */}
                            <DialogSectionBand title="Themes" tiles info={themeInfo} infoSize="double">
                                {periodTiles({
                                    only: "themes",
                                    foundation,
                                    onEditTheme: editTheme,
                                    onRemoveTheme: removeThemeById,
                                    onAddTheme,
                                    trailing: <AddThemeMenu
                                        disabled={disabled}
                                        onAdd={addThemeAndShow}
                                    />
                                })}
                            </DialogSectionBand>
                        </div>
                    )
                    : (
                        <AddThemeMenu
                            disabled={disabled}
                            info={themeInfo}
                            onAdd={addThemeAndShow}
                        />
                    )}

            </>
        )
    ];

    /** What a tile says of its column: a line or two of what is written there. */
    const firstLines = (text: string, count: number) => text.split("\n").map(line => line.trim()).filter(line => line.length > 0).slice(0, count);
    const tileItems: string[][] = [
        firstLines(foundation.situation, 3),
        STRATEGY_SWOT_QUADRANTS.map(quadrant => (foundation.swot[quadrant.id] ?? []).find(item => item.trim().length > 0) ?? "").filter(item => item.length > 0).slice(0, 4),
        firstLines(foundation.compass, 3),
        [...(isRangeSet(foundation.period) ? [formatRangeAbbrev(foundation.period)] : []), ...foundation.themes.map(theme => theme.name.trim()).filter(name => name.length > 0)].slice(0, 6)
    ];

    /** A Theme added from the Strategic Period's tile: a blank one, opened as a card; left blank, it is taken away again. */
    const themeAdd: TileAdd = {
        label: "Theme",
        disabled,
        onAdd: () => {
            const made = createStrategyTheme();
            latest.current.onChange({ ...latest.current.foundation, themes: [...latest.current.foundation.themes, made] });
            return made.id;
        },
        isBlank: (id: string) => {
            const theme = latest.current.foundation.themes.find(candidate => candidate.id === id);
            return !theme || (theme.name.trim() === "" && theme.description.trim() === "");
        },
        onRemove: (ids: string[]) => latest.current.onChange({ ...latest.current.foundation, themes: latest.current.foundation.themes.filter(theme => !ids.includes(theme.id)) })
    };

    const tiles: SectionTile[] = STRATEGY_FOUNDATION_SECTIONS.map((title, column) => ({
        id: "strategy-foundation-" + column,
        // (Named for what it holds, as the dialog says it, with no order number.)
        title: column === 0 ? "Current Situation" : title,
        rail: railId(title),
        items: tileItems[column].length > 0 ? tileItems[column] : [],
        // The Strategic Period: its dates in the centre, its Themes as a list (a Theme is written in the Strategic Period's dialog).
        ...(column === 3 ? {
            view: true,
            itemMarks: tileItems[3].map((_item, position) => position === 0 && isRangeSet(foundation.period) ? { centre: true, rule: tileItems[3].length > 1 } : { bullet: true }),
            // (The period first, then a line for each Theme named: a link that opens the dialog on that Theme's card.)
            links: (() => {
                const named = foundation.themes.filter(theme => theme.name.trim().length > 0);
                return tileItems[3].map((_item, position) => {
                    const at = position - (isRangeSet(foundation.period) ? 1 : 0);
                    return at >= 0 && named[at] ? { box: named[at].id } : undefined;
                });
            })(),
            // A Theme made from the tile's "+": the dialog opens on its card, which holds all the sections (its name, description, Goals, Objectives, Initiatives and Metrics).
            add: themeAdd,
            addOpensDialog: true
        } : {}),
        content: () => (
            <div className="column-tile-content strategy-foundation" data-rail={railId(title)} role="group" aria-label={title}>
                <div className="business-engagement-section-head">
                    <DialogHeading
                        title={column === 0 ? "Current Situation" : title}
                        info={columnInfo[column]}
                    />
                    {column === 3 && planNote}
                </div>
                {/* (Each column's guidance is the "i" beside its title.) */}
                <div className="brand-style-body">{columnBodies[column]}</div>
            </div>
        )
    }));

    return (

        <div className="answer-columns business-foundation business-engagement business-capability column-tiles-page strategy-single-frame" style={{ "--answer-column-count": 1 } as CSSProperties}>
            <CardShell
                
                data-anchor="column-tiles"
                style={{ "--strategy-theme-hue": workHue("discover") } as CSSProperties}
            >
                <div className="card-scroll">
                    <div className="business-capability-section business-capability-tiles-section">
                        {/* (The page's one frame is named at its head, centred, as the other pages' frames are.) */}
                        <div className="business-engagement-section-head tiles-frame-head"><span className="field-group-title business-foundation-subhead">Situation &amp; Direction</span></div>
                        <SectionTiles label={STRATEGY_FOUNDATION_SECTIONS.join(", ")} hue={workHue("discover")} tiles={tiles} />
                    </div>
                </div>
            </CardShell>
        </div>

    );

}
