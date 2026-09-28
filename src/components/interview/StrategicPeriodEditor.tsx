import { CSSProperties, ReactNode, useState } from "react";

import {
    STRATEGY_METRIC_CURRENCY_UNIT,
    STRATEGY_METRIC_CUSTOM_UNIT,
    STRATEGY_METRIC_FREQUENCIES,
    STRATEGY_METRIC_UNITS,
    StrategicPeriodValue,
    StrategyFoundationValue,
    StrategyGoalValue,
    StrategyMetricValue,
    StrategyObjectiveValue,
    asStrategicPeriodValue,
    createStrategyGoal,
    createStrategyMetric,
    createStrategyObjective,
    formatMonthShort,
    isRangeSet,
    monthIndex,
    strategyGoalsForTheme,
    strategyThemeHues,
    strategyThemeName
} from "../../framework/engine/AnswerUtils.ts";

import BoxActions, { reorder, useMovableBox } from "./ReorderControls.tsx";
import MonthYearPicker from "./MonthYearPicker.tsx";
import OptionPicker from "./OptionPicker.tsx";
import { CURRENCY_CODES, CURRENCY_SEARCH_ALIASES } from "../../framework/engine/Currencies.ts";
import StrategyTextArea from "./StrategyTextArea.tsx";
import NumberedListInput from "./NumberedListInput.tsx";
import FoldArrow from "./FoldArrow.tsx";

interface StrategicPeriodEditorProps {

    value: unknown;

    onChange: (value: StrategicPeriodValue) => void;

    disabled?: boolean;

    /**
     * The Foundation page's stored answer. The Themes developed here
     * and the Strategic Period the Objectives must sit inside both
     * live there, and are read rather than copied -- renaming a Theme
     * on page 1 renames it here, because it is the same string.
     */
    foundation: StrategyFoundationValue;

    /** See BrandStyleEditor.columnsDivider. */
    columnsDivider?: ReactNode;

    /**
     * Whether the bullet guidance above the progress line shows.
     * Toggled by the Help button the page renders just above that
     * line -- see AnswerRendererProps.showInstructions.
     */
    showInstructions?: boolean;

    /**
     * Who can own an Objective: the founders named on 1. Identity
     * System → 3. Legal Entity. An empty list hides the Owner.
     */
    founders?: readonly { id: string; name: string }[];

    /** The organization's currency, from the Legal Entity country: a Currency Metric's default. */
    organisationCurrency?: string;

}

/**
 * Marks a level as deliberately closed, as opposed to "nothing
 * chosen yet" (""), which opens the first box at that level. An id
 * is never this string, so the two states cannot collide.
 */
const CLOSED = "__closed__";

/** Which box is open at each level. Nothing below a closed box shows. */
interface FocusPath {
    themeId: string;
    goalId: string;
    objectiveId: string;
}


/**
 * The Strategy System's Strategic Period page (see
 * AnswerType.StrategicPeriod).
 *
 * Four instructional sections above the progress line, then one box
 * per Strategic Theme below it, nested Theme -> Goal -> Objective
 * with the Objective's Initiatives and Metrics side by side inside
 * it.
 *
 * Each box carries its OWN number -- Theme 1, its Goals 1, 2, 3,
 * each Goal's Objectives 1, 2, 3 -- rather than a full path, and
 * every one of them is derived from position at render time. That is
 * what makes reordering renumber everything for free, and stops a
 * stored number ever disagreeing with where its box actually sits.
 */
export default function StrategicPeriodEditor({

    value,

    onChange,

    disabled = false,

    foundation,

    columnsDivider,

    showInstructions = true,

    founders = [],

    organisationCurrency = ""

}: StrategicPeriodEditorProps) {

    const period = asStrategicPeriodValue(value);

    const themes = foundation.themes;

    // Only one box is open at each level: opening a Goal closes the
    // other Goals in its Theme and the other Themes, which is what
    // keeps a page of nested boxes readable. Starts on the first of
    // everything, so a fresh page is open rather than shut.
    const [focus, setFocus] = useState<FocusPath>({
        themeId: "",
        goalId: "",
        objectiveId: ""
    });

    // One pass over the whole list, so no two Themes can land on
    // the same hue. The hue itself is what goes down the tree: the
    // nested levels inside a Theme are the same hue at different
    // lightnesses, so a Goal or a Metric reads as part of its
    // Theme rather than as an unrelated grey.
    const themeHues = strategyThemeHues(themes.map(theme => theme.id));

    const periodSet = isRangeSet(foundation.period);

    const firstMonth = monthIndex(foundation.period.start);
    const lastMonth = monthIndex(foundation.period.end);

    /** An Objective may only be placed inside the Strategic Period. */
    function withinPeriod(month: number, year: number): boolean {
        const index = year * 12 + (month - 1);
        return index >= firstMonth && index <= lastMonth;
    }

    function goalsFor(themeId: string) {
        return strategyGoalsForTheme(period, themeId);
    }

    function setGoals(themeId: string, goals: StrategyGoalValue[]) {
        onChange({ goalsByTheme: { ...period.goalsByTheme, [themeId]: goals } });
    }

    function heading(title: string, text: string) {
        return (
            <div className="brand-style-head">
                <h3 className="answer-column-label brand-section-heading strategy-unnumbered-heading">
                    <span className="answer-column-label-text">{title}</span>
                </h3>
                {/* Hidden by the page's Help button -- the heading
                    stays, only the guidance goes. */}
                {showInstructions && (
                    <div className="answer-column-questions">
                        <span className="answer-question-line answer-question-line-bullet">
                            {`• ${text}`}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    /**
     * Whether a box at this level is open.
     *
     * "" means nothing has been chosen at this level yet, which opens
     * the FIRST box rather than none -- a page that opened entirely
     * shut would hide the one Goal and Objective every Theme starts
     * with. CLOSED is the deliberate "shut it" state, which is what
     * the toggle sets and what "" must not be confused with.
     */
    function isOpen(chosen: string, id: string, index: number): boolean {
        return chosen === id || (chosen === "" && index === 0);
    }

    return (

        <div
            className="brand-style strategic-period"
            style={{ "--answer-column-count": 4 } as CSSProperties}
        >

            {heading("Goals", "What do you want to accomplish within each Strategic Theme, and why does it matter?")}
            {heading("Objectives", "Specific, measurable, and time-bound milestones that support a Goal.")}
            {heading("Initiatives", "Actions focused on major areas of work to achieve the Objectives.")}
            {heading("Metrics", "Measures that provide evidence of progress toward the Objective.")}

            {columnsDivider && (
                <div className="answer-columns-divider">{columnsDivider}</div>
            )}

            <div className="strategy-themes">


                {themes.length === 0 && (
                    <p className="strategy-empty-note">
                        Define your Strategic Themes on the Foundation page first.
                        Each one opens a box here.
                    </p>
                )}

                {themes.map((theme, themeIndex) => (

                    <ThemeBox
                        key={theme.id}
                        theme={theme}
                        number={themeIndex + 1}
                        open={isOpen(focus.themeId, theme.id, themeIndex)}
                        onToggle={(next) => setFocus({
                            themeId: next ? theme.id : CLOSED,
                            goalId: "",
                            objectiveId: ""
                        })}
                        hue={themeHues[theme.id]}
                    >

                        <GoalList
                            goals={goalsFor(theme.id)}
                            disabled={disabled}
                            periodSet={periodSet}
                            withinPeriod={withinPeriod}
                            founders={founders}
                            organisationCurrency={organisationCurrency}
                            periodStartYear={
                                periodSet ? Number(foundation.period.start.year) : new Date().getFullYear()
                            }
                            openGoalId={focus.goalId}
                            openObjectiveId={focus.objectiveId}
                            isOpen={isOpen}
                            onFocusGoal={(goalId) => setFocus({
                                themeId: theme.id, goalId, objectiveId: ""
                            })}
                            onFocusObjective={(goalId, objectiveId) => setFocus({
                                themeId: theme.id, goalId, objectiveId
                            })}
                            onChangeGoals={(goals) => setGoals(theme.id, goals)}
                        />

                    </ThemeBox>

                ))}

            </div>

        </div>

    );

}

/**
 * One Strategic Theme. Its name and description belong to the
 * Foundation page and are shown here as text, not fields -- editing
 * stays where the information is defined.
 */
function ThemeBox({

    theme,

    number,

    open,

    onToggle,

    hue,

    children

}: {

    theme: { id: string; name: string; description: string };

    /**
     * This Theme's own hue. Every ground inside the panel is that
     * hue at a different lightness -- see strategyThemeHues.
     */
    hue: number;

    number: number;

    open: boolean;

    onToggle: (open: boolean) => void;

    children: ReactNode;

}) {

    return (

        <section
            className="strategy-theme-panel"
            data-rail={theme.id}
            style={{ "--strategy-theme-hue": hue } as CSSProperties}
        >

            <div className="strategy-box-head">

                <FoldArrow open={open} label={"Theme " + number} onToggle={() => onToggle(!open)} />

                {/*
                    Number, then what kind of box this is, then its
                    own name -- "1. Theme" reads as a label for the
                    title beside it, which a bare "1." did not.
                */}
                <span className="strategy-box-number">{number}. Theme</span>

                <h4 className="strategy-theme-name">
                    {strategyThemeName(theme)}
                </h4>

            </div>

            {open && (
                <div className="strategy-box-body">

                    {theme.description.trim().length > 0 && (
                        <p className="strategy-inherited-text">{theme.description}</p>
                    )}

                    {children}

                </div>
            )}

        </section>

    );

}

/** A Theme's Goals, movable as a group. */
function GoalList({

    goals,

    disabled,

    periodSet,

    withinPeriod,

    founders,

    organisationCurrency,

    periodStartYear,

    openGoalId,

    openObjectiveId,

    isOpen,

    onFocusGoal,

    onFocusObjective,

    onChangeGoals

}: {

    goals: StrategyGoalValue[];

    disabled: boolean;

    periodSet: boolean;

    withinPeriod: (month: number, year: number) => boolean;
    founders: readonly { id: string; name: string }[];

    organisationCurrency: string;

    periodStartYear: number;

    openGoalId: string;

    openObjectiveId: string;

    isOpen: (chosen: string, id: string, index: number) => boolean;

    onFocusGoal: (goalId: string) => void;

    onFocusObjective: (goalId: string, objectiveId: string) => void;

    onChangeGoals: (goals: StrategyGoalValue[]) => void;

}) {

    const box = useMovableBox(
        (from, to) => onChangeGoals(reorder(goals, from, to)),
        (index) => onChangeGoals(
            goals.length > 1
                ? goals.filter((_goal, position) => position !== index)
                : [createStrategyGoal()]
        )
    );

    function updateGoal(index: number, patch: Partial<StrategyGoalValue>) {
        onChangeGoals(goals.map(
            (goal, position) => position === index ? { ...goal, ...patch } : goal
        ));
    }

    return (

        <>

            {goals.map((goal, goalIndex) => {

                const props = box.boxProps(goalIndex, goals.length, `Goal ${goalIndex + 1}`);

                const open = isOpen(openGoalId, goal.id, goalIndex);

                return (

                    <div
                        key={goal.id}
                        {...props}
                        className={`strategy-goal-box ${props.className}`}
                    >

                        <div className="strategy-box-head">

                            <span className="strategy-drag-handle" {...box.handleProps}>⠿</span>

                            <FoldArrow
                                open={open}
                                label={"Goal " + (goalIndex + 1)}
                                onToggle={() => onFocusGoal(open ? CLOSED : goal.id)}
                            />

                            <span className="strategy-box-number">{goalIndex + 1}. Goal</span>

                            <input
                                type="text"
                                className="interview-input strategy-name-input"
                                aria-label={`Goal ${goalIndex + 1} name`}
                                placeholder="Goal name"
                                disabled={disabled}
                                value={goal.name}
                                onChange={(event) => updateGoal(goalIndex, { name: event.target.value })}
                            />

                            <BoxActions
                                label={`Goal ${goalIndex + 1}`}
                                disabled={disabled}
                                onRemove={() => onChangeGoals(
                                    goals.length > 1
                                        ? goals.filter((_goal, position) => position !== goalIndex)
                                        : [createStrategyGoal()]
                                )}
                            />

                        </div>

                        {open && (

                            <div className="strategy-box-body">

                                <StrategyTextArea
                                    className="interview-input strategy-note"
                                    ariaLabel={`Goal ${goalIndex + 1} description`}
                                    placeholder="Description"
                                    disabled={disabled}
                                    value={goal.description}
                                    onChange={(next) => updateGoal(goalIndex, { description: next })}
                                />

                                <ObjectiveList
                                    objectives={goal.objectives}
                                    disabled={disabled}
                                    periodSet={periodSet}
                                    withinPeriod={withinPeriod}
                                    founders={founders}
                                    organisationCurrency={organisationCurrency}
                                    periodStartYear={periodStartYear}
                                    openObjectiveId={openObjectiveId}
                                    isOpen={isOpen}
                                    onFocusObjective={(objectiveId) => onFocusObjective(goal.id, objectiveId)}
                                    onChangeObjectives={(objectives) => updateGoal(goalIndex, { objectives })}
                                />

                                <button
                                    type="button"
                                    className="strategy-add-button"
                                    disabled={disabled}
                                    onClick={() => {
                                        // Opened as it is added: it is the one
                                        // about to be filled in.
                                        const added = createStrategyObjective();
                                        updateGoal(goalIndex, { objectives: [...goal.objectives, added] });
                                        onFocusObjective(goal.id, added.id);
                                    }}
                                >
                                    + Add Objective
                                </button>

                            </div>

                        )}

                    </div>

                );

            })}

            <button
                type="button"
                className="strategy-add-button"
                disabled={disabled}
                onClick={() => {
                    const added = createStrategyGoal();
                    onChangeGoals([...goals, added]);
                    onFocusGoal(added.id);
                }}
            >
                + Add Goal
            </button>

        </>

    );

}

/** A Goal's Objectives, movable as a group. */
function ObjectiveList({

    objectives,

    disabled,

    periodSet,

    withinPeriod,

    founders,

    organisationCurrency,

    periodStartYear,

    openObjectiveId,

    isOpen,

    onFocusObjective,

    onChangeObjectives

}: {

    objectives: StrategyObjectiveValue[];

    disabled: boolean;

    periodSet: boolean;

    withinPeriod: (month: number, year: number) => boolean;
    founders: readonly { id: string; name: string }[];

    organisationCurrency: string;

    periodStartYear: number;

    openObjectiveId: string;

    isOpen: (chosen: string, id: string, index: number) => boolean;

    onFocusObjective: (objectiveId: string) => void;

    onChangeObjectives: (objectives: StrategyObjectiveValue[]) => void;

}) {

    const box = useMovableBox(
        (from, to) => onChangeObjectives(reorder(objectives, from, to)),
        (index) => onChangeObjectives(
            objectives.length > 1
                ? objectives.filter((_objective, position) => position !== index)
                : [createStrategyObjective()]
        )
    );


    function updateObjective(index: number, patch: Partial<StrategyObjectiveValue>) {
        onChangeObjectives(objectives.map(
            (objective, position) => position === index ? { ...objective, ...patch } : objective
        ));
    }

    /**
     * Sorts by date, soonest first: the start leads, and two
     * Objectives starting in the same month are settled by which
     * ends first.
     *
     * One tap, not a mode. The page also offers dragging and the
     * arrow keys, and a standing "always sort by date" would
     * silently undo every manual move.
     */
    function sortByDate(direction: string) {

        onChangeObjectives([...objectives].sort((left, right) => direction === "sooner"
            // Soonest first sorts on the start and settles ties on
            // the end; latest first reverses both, which is why the
            // end leads the comparison there.
            ? (monthIndex(left.period.start) - monthIndex(right.period.start)) ||
              (monthIndex(left.period.end) - monthIndex(right.period.end))
            : (monthIndex(right.period.end) - monthIndex(left.period.end)) ||
              (monthIndex(right.period.start) - monthIndex(left.period.start))
        ));

    }

    return (

        <>

            {objectives.map((objective, objectiveIndex) => {

                const props = box.boxProps(
                    objectiveIndex,
                    objectives.length,
                    `Objective ${objectiveIndex + 1}`
                );

                const open = isOpen(openObjectiveId, objective.id, objectiveIndex);

                return (

                    <div
                        key={objective.id}
                        {...props}
                        className={`strategy-objective-box ${props.className}`}
                    >

                        <div className="strategy-box-head">

                            <span className="strategy-drag-handle" {...box.handleProps}>⠿</span>

                            <FoldArrow
                                open={open}
                                label={"Objective " + (objectiveIndex + 1)}
                                onToggle={() => onFocusObjective(open ? CLOSED : objective.id)}
                            />

                            <span className="strategy-box-number">
                                {objectiveIndex + 1}. Objective
                            </span>

                            <input
                                type="text"
                                className="interview-input strategy-name-input"
                                aria-label={`Objective ${objectiveIndex + 1} name`}
                                placeholder="Objective name"
                                disabled={disabled}
                                value={objective.name}
                                onChange={(event) => updateObjective(objectiveIndex, {
                                    name: event.target.value
                                })}
                            />

                            <BoxActions
                                label={`Objective ${objectiveIndex + 1}`}
                                disabled={disabled}
                                // Always offered, not only once there
                                // are two to sort: a control that
                                // comes and goes is one the user has
                                // to look for.
                                onSort={sortByDate}
                                sortOptions={[
                                    { id: "sooner", label: "Soonest first" },
                                    { id: "later", label: "Latest first" }
                                ]}
                                onRemove={() => onChangeObjectives(
                                    objectives.length > 1
                                        ? objectives.filter((_entry, index) => index !== objectiveIndex)
                                        : [createStrategyObjective()]
                                )}
                            />

                        </div>

                        {open && (

                            <div className="strategy-box-body">

                                {!periodSet && (
                                    <p className="strategy-empty-note">
                                        Set the Strategic Period on the Foundation page first.
                                        An Objective can only be placed inside it.
                                    </p>
                                )}

                                <StrategyTextArea
                                    className="interview-input strategy-note"
                                    ariaLabel={`Objective ${objectiveIndex + 1} description`}
                                    placeholder="Description"
                                    disabled={disabled}
                                    value={objective.description}
                                    onChange={(next) => updateObjective(objectiveIndex, {
                                        description: next
                                    })}
                                />

                                {/*
                                    When it happens, after what it is:
                                    the two dates read as one line --
                                    "From ... To ..." -- rather than
                                    as two separate fields.
                                */}
                                <div className="strategy-objective-period">

                                    <MonthYearPicker
                                        label="From"
                                        value={objective.period.start}
                                        disabled={disabled || !periodSet}
                                        firstYear={periodStartYear}
                                        isAllowed={withinPeriod}
                                        onChange={(next) => updateObjective(objectiveIndex, {
                                            period: { ...objective.period, start: next }
                                        })}
                                    />

                                    <MonthYearPicker
                                        label="To"
                                        value={objective.period.end}
                                        disabled={disabled || !periodSet}
                                        firstYear={periodStartYear}
                                        isAllowed={(month, year) =>
                                            withinPeriod(month, year) &&
                                            year * 12 + (month - 1) >= monthIndex(objective.period.start)}
                                        onChange={(next) => updateObjective(objectiveIndex, {
                                            period: { ...objective.period, end: next }
                                        })}
                                    />

                                </div>

                                {/* Who sees it through: one founder, the
                                    way every Activity names one. */}
                                {founders.length > 0 && (
                                    <div className="strategy-objective-owner">
                                        <span className="strategy-field-label">Owner</span>
                                        <OptionPicker
                                            label={"Objective " + (objectiveIndex + 1) + " owner"}
                                            placeholder="Select a founder"
                                            options={founders.map(founder => founder.name)}
                                            disabled={disabled}
                                            value={founders.find(founder => founder.id === objective.ownerId)?.name ?? ""}
                                            onChange={(next) => updateObjective(objectiveIndex, {
                                                ownerId: founders.find(founder => founder.name === next)?.id ?? ""
                                            })}
                                        />
                                    </div>
                                )}

                                {/*
                                    Side by side: Initiatives are the
                                    work and Metrics are the evidence
                                    for the same Objective, and they
                                    are written together rather than
                                    one after the other.
                                */}
                                <div className="strategy-objective-columns">

                                    {/*
                                        Borrows the Metric box's
                                        frame so the two columns
                                        match, but not its
                                        behaviour: a Metric box is
                                        selectable and reorderable,
                                        and this is a plain
                                        container around one list.
                                        The second class is what
                                        turns the interactive
                                        states back off -- see
                                        "The Initiatives box" in
                                        conversation.css.
                                    */}
                                    <div className="strategy-metric-box strategy-initiatives-box">

                                        <div className="strategy-box-head">
                                            <span className="strategy-box-number">Initiatives</span>
                                        </div>

                                        <NumberedListInput
                                            label={`Objective ${objectiveIndex + 1} initiative`}
                                            items={objective.initiatives}
                                            disabled={disabled}
                                            placeholder="Initiative"
                                            onChange={(initiatives) => updateObjective(
                                                objectiveIndex, { initiatives }
                                            )}
                                        />

                                    </div>

                                    <MetricList
                                        objective={objective}
                                        organisationCurrency={organisationCurrency}
                                        objectiveNumber={objectiveIndex + 1}
                                        disabled={disabled}
                                        onChangeMetrics={(metrics) => updateObjective(
                                            objectiveIndex, { metrics }
                                        )}
                                    />

                                </div>

                            </div>

                        )}

                    </div>

                );

            })}

        </>

    );

}

/** An Objective's Metrics, movable as a group. */
function MetricList({

    objective,

    organisationCurrency,

    objectiveNumber,

    disabled,

    onChangeMetrics

}: {

    objective: StrategyObjectiveValue;

    organisationCurrency: string;

    objectiveNumber: number;

    disabled: boolean;

    onChangeMetrics: (metrics: StrategyMetricValue[]) => void;

}) {

    const metrics = objective.metrics;

    const box = useMovableBox(
        (from, to) => onChangeMetrics(reorder(metrics, from, to)),
        (index) => onChangeMetrics(
            metrics.length > 1
                ? metrics.filter((_metric, position) => position !== index)
                : [createStrategyMetric()]
        )
    );

    function updateMetric(index: number, patch: Partial<StrategyMetricValue>) {
        onChangeMetrics(metrics.map(
            (metric, position) => position === index ? { ...metric, ...patch } : metric
        ));
    }

    return (

        <div className="strategy-subsection">

            {metrics.map((metric, metricIndex) => {

                const props = box.boxProps(metricIndex, metrics.length, `Metric ${metricIndex + 1}`);

                return (

                    <div
                        key={metric.id}
                        {...props}
                        className={`strategy-metric-box ${props.className}`}
                    >

                        <div className="strategy-box-head">

                            <span className="strategy-drag-handle" {...box.handleProps}>⠿</span>

                            <span className="strategy-box-number">{metricIndex + 1}. Metric</span>

                            <input
                                type="text"
                                className="interview-input strategy-name-input"
                                aria-label={`Objective ${objectiveNumber} metric ${metricIndex + 1} name`}
                                placeholder="Metric name"
                                disabled={disabled}
                                value={metric.name}
                                onChange={(event) => updateMetric(metricIndex, { name: event.target.value })}
                            />

                            <BoxActions
                                label={`Metric ${metricIndex + 1}`}
                                disabled={disabled}
                                onRemove={() => onChangeMetrics(
                                    metrics.length > 1
                                        ? metrics.filter((_entry, index) => index !== metricIndex)
                                        : [createStrategyMetric()]
                                )}
                            />

                        </div>

                        <StrategyTextArea
                            className="interview-input strategy-note"
                            ariaLabel={`Metric ${metricIndex + 1} description`}
                            placeholder="Description"
                            disabled={disabled}
                            value={metric.description}
                            onChange={(next) => updateMetric(metricIndex, { description: next })}
                        />

                        {/*
                            Label beside its field rather than above
                            it, in two rows: Baseline and Target
                            first -- the two figures the Objective is
                            judged between -- with how they are
                            measured underneath.
                        */}
                        <div className="strategy-metric-fields">

                            <div className="strategy-metric-field">
                                <span className="strategy-field-label">
                                    {`Baseline (${formatMonthShort(objective.period.start)})`}
                                </span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className="interview-input"
                                    aria-label={`Metric ${metricIndex + 1} baseline`}
                                    disabled={disabled}
                                    value={metric.baseline}
                                    onChange={(event) => updateMetric(metricIndex, {
                                        baseline: event.target.value
                                    })}
                                />
                            </div>

                            <div className="strategy-metric-field">
                                <span className="strategy-field-label">
                                    {`Target (${formatMonthShort(objective.period.end)})`}
                                </span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className="interview-input"
                                    aria-label={`Metric ${metricIndex + 1} target`}
                                    disabled={disabled}
                                    value={metric.target}
                                    onChange={(event) => updateMetric(metricIndex, {
                                        target: event.target.value
                                    })}
                                />
                            </div>

                            <div className="strategy-metric-field">
                                <span className="strategy-field-label strategy-field-label-wrap">
                                    Measurement Frequency
                                </span>
                                <OptionPicker
                                    label={`Metric ${metricIndex + 1} measurement frequency`}
                                    options={STRATEGY_METRIC_FREQUENCIES}
                                    disabled={disabled}
                                    value={metric.frequency}
                                    onChange={(frequency) => updateMetric(metricIndex, {
                                        frequency
                                    })}
                                />
                            </div>

                            <div className="strategy-metric-field">
                                <span className="strategy-field-label">Unit</span>
                                <OptionPicker
                                    label={`Metric ${metricIndex + 1} unit`}
                                    options={STRATEGY_METRIC_UNITS}
                                    disabled={disabled}
                                    value={metric.unit}
                                    onChange={(unit) => updateMetric(metricIndex, { unit })}
                                />
                            </div>

                            {/*
                                A money Metric names its currency, as a
                                Business price does: the organization's
                                own by default, changeable for this
                                Metric alone. Choosing the default back
                                stores "", so it follows the Legal
                                Entity country again.
                            */}
                            {metric.unit === STRATEGY_METRIC_CURRENCY_UNIT && (
                                <div className="strategy-metric-field">
                                    <span className="strategy-field-label">Currency</span>
                                    <OptionPicker
                                        label={`Metric ${metricIndex + 1} currency`}
                                        placeholder="Code"
                                        options={CURRENCY_CODES}
                                        searchable
                                        searchAliases={CURRENCY_SEARCH_ALIASES}
                                        disabled={disabled}
                                        value={metric.currency || organisationCurrency}
                                        onChange={(next) => updateMetric(metricIndex, {
                                            currency: next === organisationCurrency ? "" : next
                                        })}
                                    />
                                </div>
                            )}

                            {/*
                                "Custom" is only a useful choice if
                                the unit can then be named --
                                otherwise two metrics measured in
                                different things would both read
                                "Custom".
                            */}
                            {metric.unit === STRATEGY_METRIC_CUSTOM_UNIT && (
                                <div className="strategy-metric-field">
                                    <span className="strategy-field-label">Custom Unit</span>
                                    <input
                                        type="text"
                                        className="interview-input"
                                        aria-label={`Metric ${metricIndex + 1} custom unit`}
                                        disabled={disabled}
                                        value={metric.customUnit}
                                        onChange={(event) => updateMetric(metricIndex, {
                                            customUnit: event.target.value
                                        })}
                                    />
                                </div>
                            )}

                        </div>

                    </div>

                );

            })}

            <button
                type="button"
                className="strategy-add-button"
                disabled={disabled}
                onClick={() => onChangeMetrics([...metrics, createStrategyMetric()])}
            >
                + Add Metric
            </button>

        </div>

    );

}
