import { CSSProperties, ReactNode, useState } from "react";

import {
    STRATEGY_METRIC_CURRENCY_UNIT,
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
    strategyThemeName
} from "../../framework/engine/AnswerUtils.ts";

import BoxActions, { reorder, useMovableBox } from "./ReorderControls.tsx";
import MonthYearPicker from "./MonthYearPicker.tsx";
import OptionPicker from "./OptionPicker.tsx";
import { CURRENCY_CODES, CURRENCY_SEARCH_ALIASES } from "../../framework/engine/Currencies.ts";
import { BusinessField, OptionalNote } from "./BusinessCardFields.tsx";
import { FieldMark, FieldStatus } from "./fieldMarks.tsx";
import NumberedListInput from "./NumberedListInput.tsx";
import CardNumber from "./CardNumber.tsx";
import InfoNote from "./InfoNote.tsx";
import CardNameInput from "./CardNameInput.tsx";
import SectionTiles, { DialogHeading, type SectionTile } from "./SectionTiles.tsx";
import CardBoxes, { type CardBox } from "./CardBoxes.tsx";
import { workHue } from "../../framework/engine/WorkColours.ts";

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

    /** Drawn inside another page's dialog (the Foundation's Strategic Period): only the tiles, no page around them. */
    embedded?: boolean;

    /** Embedded: only the Roadmap's tile, or only the Themes' (the Roadmap stands beside the dates, the Themes under them). */
    only?: "roadmap" | "themes";

    /** The Roadmap, as a tile before the Themes' (it opens the Roadmap in its dialog). */
    roadmap?: () => ReactNode;

    /** Where the Themes are written (the Foundation page): with it, a Theme's dialog has its name and its description to type in. */
    onEditTheme?: (themeId: string, patch: { name?: string; description?: string }) => void;

    /** Where a Theme is taken away (its x in the Theme's card): the Foundation page's own removal, with its guard. */
    onRemoveTheme?: (themeId: string) => void;

}

const GOALS_HELP = "What do you want to accomplish within each Strategic Theme, and why does it matter?";
const OBJECTIVES_HELP = "Specific, measurable, and time-bound milestones that support a Goal.";
const INITIATIVES_HELP = "Actions focused on major areas of work to achieve the Objectives.";
const METRICS_HELP = "Measures that provide evidence of progress toward the Objective.";

/**
 * Marks a level as deliberately closed, as opposed to "nothing
 * chosen yet" (""), which opens the first box at that level. An id
 * is never this string, so the two states cannot collide.
 */

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

    founders = [],

    organisationCurrency = "",

    embedded = false,

    only,

    roadmap,

    onEditTheme,

    onRemoveTheme

}: StrategicPeriodEditorProps) {

    // (Inside the Foundation's dialog the tiles and cards keep that dialog's hue; on its own page, the Strategy's.)
    const pageHue = workHue(embedded ? "discover" : "decide");

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

    // (The guidance of each section is its "i", beside the section's own title in the table: Goal, Objective, Initiatives, Metric.)
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

    const goalProps = {
        disabled,
        periodSet,
        withinPeriod,
        founders,
        organisationCurrency,
        periodStartYear: periodSet ? Number(foundation.period.start.year) : new Date().getFullYear(),
        isOpen
    };

    /** What adds an Objective to a Goal, as a tile's "+" does. */
    function objectiveAdd(themeId: string, goalId: string) {
        const edit = (change: (objectives: StrategyObjectiveValue[]) => StrategyObjectiveValue[]) => setGoals(themeId, goalsFor(themeId).map(goal => goal.id === goalId ? { ...goal, objectives: change(goal.objectives) } : goal));
        return {
            label: "objective",
            disabled,
            onAdd: () => {
                const added = createStrategyObjective();
                edit(objectives => [...objectives, added]);
                return added.id;
            },
            isBlank: (id: string) => {
                const objective = goalsFor(themeId).find(goal => goal.id === goalId)?.objectives.find(entry => entry.id === id);
                return !objective || (objective.name.trim() === "" && objective.description.trim() === "");
            },
            onRemove: (ids: string[]) => edit(objectives => objectives.filter(entry => !ids.includes(entry.id)))
        };
    }

    /** One Objective alone, floating: its Goal's list holds just it. */
    function objectiveCard(themeId: string, objectiveId: string): ReactNode {
        const goals = goalsFor(themeId);
        const goal = goals.find(entry => entry.objectives.some(objective => objective.id === objectiveId));
        const objective = goal?.objectives.find(entry => entry.id === objectiveId);
        if (!goal || !objective) {
            return null;
        }
        return (
            <div className="column-tile-content strategy-goal-card" style={{ "--strategy-theme-hue": pageHue } as CSSProperties}>
                <ObjectiveList
                    firstNumber={goal.objectives.indexOf(objective) + 1}
                    objectives={[objective]}
                    disabled={disabled}
                    periodSet={periodSet}
                    withinPeriod={withinPeriod}
                    founders={founders}
                    organisationCurrency={organisationCurrency}
                    periodStartYear={goalProps.periodStartYear}
                    openObjectiveId={objective.id}
                    isOpen={isOpen}
                    onFocusObjective={() => undefined}
                    onChangeObjectives={(next) => setGoals(themeId, goals.map(entry => entry.id === goal.id ? { ...entry, objectives: entry.objectives.flatMap(candidate => candidate.id === objective.id ? next : [candidate]) } : entry))}
                    onRemoveObjective={(id) => setGoals(themeId, goals.map(entry => entry.id === goal.id ? { ...entry, objectives: entry.objectives.filter(candidate => candidate.id !== id) } : entry))}
                />
            </div>
        );
    }

    /** A Goal's own card: it alone, in the box a floating card or a Theme with one Goal draws. */
    function goalCard(themeId: string, goalId: string): ReactNode {
        const goals = goalsFor(themeId);
        const goal = goals.find(entry => entry.id === goalId);
        if (!goal) {
            return null;
        }
        return (
            <div className="column-tile-content strategy-goal-card" style={{ "--strategy-theme-hue": pageHue } as CSSProperties}>
                <GoalList
                    {...goalProps}
                    firstNumber={goals.indexOf(goal) + 1}
                    goals={[goal]}
                    objectiveTiles={(entry) => (
                        <>
                        <span className="field-group-title business-foundation-subhead strategy-tiles-label">Objectives</span>
                        <CardBoxes
                            items={entry.objectives.map((objective, at): CardBox => ({ id: objective.id, number: at + 1, name: objective.name, unnamed: "Unnamed objective", own: true, lines: objective.initiatives.filter(item => item.trim() !== "").slice(0, 4), marks: objective.initiatives.filter(item => item.trim() !== "").slice(0, 4).map(() => ({ bullet: true })), content: () => null }))}
                            label="Objectives"
                            what="Objective"
                            add={objectiveAdd(themeId, entry.id)}
                            autoStart={false}
                            addNext
                        />
                        </>
                    )}
                    single
                    openGoalId={goal.id}
                    openObjectiveId={focus.objectiveId}
                    onFocusGoal={() => undefined}
                    onFocusObjective={(_goalId, objectiveId) => setFocus({ themeId, goalId: goal.id, objectiveId })}
                    onChangeGoals={(next) => setGoals(themeId, goals.flatMap(entry => entry.id === goal.id ? next : [entry]))}
                    onRemoveGoal={() => setGoals(themeId, goals.length > 1 ? goals.filter(entry => entry.id !== goal.id) : [createStrategyGoal()])}
                />
            </div>
        );
    }

    /** THE PAGE AS TILES: each Strategic Theme is a tile (its Goals listed on it) opening its dialog; a Theme with several Goals shows a tile for each, and each Goal opens as a floating card. */
    const tiles: SectionTile[] = themes.map((theme, themeIndex): SectionTile => {
        const goals = goalsFor(theme.id);
        const named = goals.map(goal => goal.name.trim()).filter(name => name.length > 0).slice(0, 6);
        const add = {
            label: "goal",
            disabled,
            onAdd: () => {
                const added = createStrategyGoal();
                setGoals(theme.id, [...goalsFor(theme.id), added]);
                return added.id;
            },
            isBlank: (id: string) => {
                const goal = goalsFor(theme.id).find(entry => entry.id === id);
                return !goal || (goal.name.trim() === "" && goal.description.trim() === "" && goal.objectives.every(objective => objective.name.trim() === ""));
            },
            onRemove: (ids: string[]) => setGoals(theme.id, goalsFor(theme.id).filter(entry => !ids.includes(entry.id)))
        };
        return {
            id: theme.id,
            title: strategyThemeName(theme),
            view: true,
            rail: theme.id,
            items: named,
            itemMarks: named.map(() => ({ bullet: true })),
            links: goals.filter(goal => goal.name.trim()).slice(0, 6).map(goal => ({ card: goal.id })),
            holds: [...goals.map(goal => goal.id), ...goals.flatMap(goal => goal.objectives.map(objective => objective.id))],
            add,
            cardFor: (id: string) => goals.some(goal => goal.id === id) ? goalCard(theme.id, id) : objectiveCard(theme.id, id),
            content: () => (
                <div className="column-tile-content strategy-theme-dialog" data-rail={theme.id} style={{ "--strategy-theme-hue": pageHue } as CSSProperties}>
                    {/* Where the Theme is written (the Foundation page): the card's head -- its number, its name cell and its x -- then its description, optional (a tick). */}
                    {onEditTheme
                        ? (
                            <div className="strategy-theme-fields">
                                <div className="strategy-box-head strategy-theme-head">
                                    <span className="strategy-box-number"><span className="list-number">{(themeIndex + 1) + "."}</span></span>
                                    <input
                                        type="text"
                                        className="interview-input strategy-theme-name"
                                        aria-label={"Strategic Theme " + (themeIndex + 1) + " name"}
                                        placeholder="Theme name"
                                        disabled={disabled}
                                        value={theme.name}
                                        onChange={(event) => onEditTheme(theme.id, { name: event.target.value })}
                                    />
                                    {onRemoveTheme && <BoxActions label={"Strategic Theme " + (themeIndex + 1)} disabled={disabled} onRemove={() => onRemoveTheme(theme.id)} />}
                                </div>
                                <OptionalNote
                                    label="Description"
                                    ariaLabel={"Strategic Theme " + (themeIndex + 1) + " description"}
                                    placeholder="What it represents and why it matters"
                                    disabled={disabled}
                                    value={theme.description}
                                    onChange={(next) => onEditTheme(theme.id, { description: next })}
                                />
                            </div>
                        )
                        : (
                            <div className="business-engagement-section-head">
                                <DialogHeading title={(themeIndex + 1) + ". " + strategyThemeName(theme)} info={theme.description.trim() ? [theme.description.trim()] : undefined} />
                            </div>
                        )}
                    {goals.length > 1
                        ? (
                            <>
                            <span className="field-group-title business-foundation-subhead strategy-tiles-label">Goals</span>
                            <CardBoxes
                                items={goals.map((goal, at): CardBox => ({ id: goal.id, number: at + 1, name: goal.name, unnamed: "Unnamed goal", own: true, content: () => null }))}
                                label="Goals"
                                what="Goal"
                                add={add}
                                autoStart={false}
                                addNext
                            />
                            </>
                        )
                        : (
                            <>
                                {goalCard(theme.id, goals[0]?.id ?? "")}
                                <button type="button" className="strategy-add-button" disabled={disabled} onClick={() => { add.onAdd(); }}>+ Add Goal</button>
                            </>
                        )}
                </div>
            )
        };
    });

    // The Roadmap's tile, first among them when the page draws it.
    const roadmapTile: SectionTile[] = roadmap ? [{
        id: "strategy-roadmap",
        title: "Roadmap",
        wide: true,
        view: true,
        items: themes.map(theme => strategyThemeName(theme)).filter(name => name.trim().length > 0).slice(0, 6),
        itemMarks: themes.map(() => ({ bullet: true })),
        content: () => <div className="column-tile-content">{roadmap()}</div>
    }] : [];

    if (embedded) {
        return (
            <div className="strategy-embedded-tiles">
                {/* (The tiles keep the hue of the dialog they stand in: the Foundation's.) */}
                <SectionTiles small label="Roadmap and Strategic Themes" hue={workHue("discover")} tiles={only === "roadmap" ? roadmapTile : only === "themes" ? tiles : [...roadmapTile, ...tiles]} />
            </div>
        );
    }

    if (themes.length === 0) {
        return (
            <div className="brand-style strategic-period" style={{ "--answer-column-count": 4 } as CSSProperties}>
                <div className="strategy-themes">
                    <p className="strategy-empty-note">
                        Define your Strategic Themes on the Foundation page first.
                        Each one opens a box here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="answer-columns business-foundation business-engagement business-capability column-tiles-page" style={{ "--answer-column-count": 1 } as CSSProperties}>
            <div
                className="business-foundation-input business-foundation-card business-engagement-input"
                data-anchor="column-tiles"
                style={{ "--strategy-theme-hue": pageHue } as CSSProperties}
            >
                <div className="card-scroll">
                    <div className="business-capability-section business-capability-tiles-section">
                        <div className="business-capability-heading-spacer" aria-hidden="true" />
                        <SectionTiles small label="Strategic Themes" hue={pageHue} tiles={tiles} />
                    </div>
                </div>
            </div>
        </div>
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


    openObjectiveId,

    isOpen,

    onFocusGoal,

    onFocusObjective,

    onChangeGoals,

    single = false,

    onRemoveGoal,

    objectiveTiles,

    firstNumber = 1

}: {

    /** The number of the first Goal drawn (a Goal alone in its card keeps its place in its Theme). */
    firstNumber?: number;


    /** With several Objectives a Goal shows them as tiles (each a floating card): this replaces the list and its add button. */
    objectiveTiles?: (goal: StrategyGoalValue) => ReactNode;


    /** One Goal alone, in its own card: no "+ Add Goal", and its x removes it through onRemoveGoal. */
    single?: boolean;

    onRemoveGoal?: () => void;

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

                // (A card is always open: no fold arrow, no grip.)
                const open = true;

                return (

                    <div
                        key={goal.id}
                        {...props}
                        data-anchor={goal.id}
                        className={`strategy-goal-box ${props.className}`}
                    >

                        <div className="strategy-box-head strategy-card-head-flat">

                            <span className="strategy-card-head-label">
                                <CardNumber number={firstNumber + goalIndex} kind="Goal" />
                                <InfoNote label="Goal" points={[GOALS_HELP]} />
                            </span>

                            <CardNameInput
                                ariaLabel={`Goal ${goalIndex + 1} name`}
                                placeholder="Goal name"
                                disabled={disabled}
                                value={goal.name}
                                onChange={(name) => updateGoal(goalIndex, { name })}
                            />

                            <BoxActions
                                label={`Goal ${goalIndex + 1}`}
                                disabled={disabled}
                                onRemove={() => onRemoveGoal ? onRemoveGoal() : onChangeGoals(
                                    goals.length > 1
                                        ? goals.filter((_goal, position) => position !== goalIndex)
                                        : [createStrategyGoal()]
                                )}
                            />

                        </div>

                        {open && (

                            <div className="strategy-box-body">

                                <OptionalNote
                                    label="Description"
                                    className="interview-input strategy-note"
                                    ariaLabel={`Goal ${goalIndex + 1} description`}
                                    disabled={disabled}
                                    value={goal.description}
                                    onChange={(next) => updateGoal(goalIndex, { description: next })}
                                />

                                {objectiveTiles && goal.objectives.length > 1 ? objectiveTiles(goal) : (<>
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
                                </>)}

                            </div>

                        )}

                    </div>

                );

            })}

            {!single && (
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
            )}

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




    onChangeObjectives,

    onRemoveObjective,

    firstNumber = 1

}: {

    /** The number of the first Objective drawn (an Objective alone in its card keeps its place in its Goal). */
    firstNumber?: number;


    /** One Objective alone, in its own card: its x takes it away (a list of one would put a blank in its place). */
    onRemoveObjective?: (objectiveId: string) => void;

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
        (index) => onRemoveObjective
            ? onRemoveObjective(objectives[index].id)
            : onChangeObjectives(
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

                const open = true;

                return (

                    <div
                        key={objective.id}
                        {...props}
                        data-anchor={objective.id}
                        className={`strategy-objective-box ${props.className}`}
                    >

                        <div className="strategy-box-head strategy-card-head-flat">

                            <span className="strategy-card-head-label">
                                <CardNumber number={firstNumber + objectiveIndex} kind="Objective" />
                                <InfoNote label="Objective" points={[OBJECTIVES_HELP]} />
                            </span>

                            <CardNameInput
                                ariaLabel={`Objective ${objectiveIndex + 1} name`}
                                placeholder="Objective name"
                                disabled={disabled}
                                value={objective.name}
                                onChange={(name) => updateObjective(objectiveIndex, { name })}
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
                                onRemove={() => onRemoveObjective ? onRemoveObjective(objective.id) : onChangeObjectives(
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

                                {/* ON THE COLUMNS OF THE INITIATIVES | METRICS ROW
                                    BELOW: the Description in the first (as wide as
                                    the Initiatives box), the period and owner in
                                    the second as side-label rows, "From" and
                                    "Owner" in one label column so their boxes
                                    start at one x. One column when narrow. */}
                                <div className="strategy-objective-columns strategy-objective-top">

                                <OptionalNote
                                    label="Description"
                                    className="interview-input strategy-note"
                                    ariaLabel={`Objective ${objectiveIndex + 1} description`}
                                    disabled={disabled}
                                    value={objective.description}
                                    onChange={(next) => updateObjective(objectiveIndex, {
                                        description: next
                                    })}
                                />

                                {/* THE PERIOD AND WHO SEES IT THROUGH, beside the
                                    Description: "Start [month]" over "End [month]"
                                    (the Strategic Period's own pair), and under them
                                    "Responsible" -- the Capability cards' side-label
                                    row (BusinessField side). A one-founder
                                    organisation has no Responsible row: he is
                                    responsible (strategyObjectiveOwnerId). */}
                                <div className="strategy-objective-when">

                                <MonthYearPicker
                                    label="Start"
                                    value={objective.period.start}
                                    disabled={disabled || !periodSet}
                                    firstYear={periodStartYear}
                                    isAllowed={withinPeriod}
                                    onChange={(next) => updateObjective(objectiveIndex, {
                                        // Moving Start past End clears End, as the
                                        // Strategic Period's start does on the
                                        // Foundation page.
                                        period: {
                                            start: next,
                                            end: monthIndex(objective.period.end) >= 0 &&
                                                monthIndex(objective.period.end) < monthIndex(next)
                                                ? { month: "", year: "" }
                                                : objective.period.end
                                        }
                                    })}
                                />

                                <MonthYearPicker
                                    label="End"
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

                                {founders.length > 1 && (
                                    <BusinessField
                                        label="Responsible"
                                        side
                                        tick={{
                                            on: objective.responsibleOff !== true,
                                            disabled,
                                            ariaLabel: "Objective " + (objectiveIndex + 1) + " has a responsible",
                                            // Unticked: no responsible by choice, the choice cleared.
                                            onChange: (on) => updateObjective(objectiveIndex, on
                                                ? { responsibleOff: undefined }
                                                : { responsibleOff: true, ownerId: "" })
                                        }}
                                    >
                                        {objective.responsibleOff === true ? null : (
                                        <OptionPicker
                                            label={"Objective " + (objectiveIndex + 1) + " responsible"}
                                            hug
                                            options={founders.map(founder => founder.name)}
                                            disabled={disabled}
                                            value={founders.find(founder => founder.id === objective.ownerId)?.name ?? ""}
                                            onChange={(next) => updateObjective(objectiveIndex, {
                                                ownerId: founders.find(founder => founder.name === next)?.id ?? ""
                                            })}
                                        />
                                        )}
                                    </BusinessField>
                                )}

                                </div>

                                </div>

                                {/*
                                    Side by side: Initiatives are the
                                    work and Metrics are the evidence
                                    for the same Objective, and they
                                    are written together rather than
                                    one after the other.
                                */}
                                <div className="strategy-objective-columns strategy-objective-stacked">

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
                                            <InfoNote label="Initiatives" points={[INITIATIVES_HELP]} />
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
                        data-anchor={metric.id}
                        className={`strategy-metric-box ${props.className}`}
                    >

                        <div className="strategy-box-head">

                            <CardNumber number={metricIndex + 1} kind="Metric" />
                            <InfoNote label="Metric" points={[METRICS_HELP]} />

                            <CardNameInput
                                ariaLabel={`Objective ${objectiveNumber} metric ${metricIndex + 1} name`}
                                placeholder="Metric name"
                                disabled={disabled}
                                value={metric.name}
                                onChange={(name) => updateMetric(metricIndex, { name })}
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

                        <OptionalNote
                            label="Description"
                            className="interview-input strategy-note"
                            ariaLabel={`Metric ${metricIndex + 1} description`}
                            disabled={disabled}
                            value={metric.description}
                            onChange={(next) => updateMetric(metricIndex, { description: next })}
                        />

                        {/*
                            Two rows in the same two columns, tops
                            level: how the Metric is measured first
                            (Measurement Frequency | Unit, with the
                            currency beside a Currency Unit), then the
                            two figures the Objective is judged
                            between (Baseline | Target). A Custom
                            Unit's name comes last, so the pairs keep
                            their columns.
                        */}
                        <div className="strategy-metric-fields">

                            <div className="strategy-metric-field">
                                <span className="field-label strategy-field-label strategy-field-label-wrap">
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

                            {/*
                                A money Metric names its currency, as a
                                Business price does: the compact
                                currency picker beside the Unit, the
                                pair as wide as the Target above it.
                                The organization's own currency by
                                default, changeable for this Metric
                                alone; choosing the default back stores
                                "", so it follows the Legal Entity
                                country again.
                            */}
                            <div className="strategy-metric-field">
                                <span className="field-label strategy-field-label">Unit</span>
                                {metric.unit === STRATEGY_METRIC_CURRENCY_UNIT
                                    ? (
                                        <div className="business-capability-price strategy-metric-unit-currency">
                                            <OptionPicker
                                                label={`Metric ${metricIndex + 1} unit`}
                                                options={STRATEGY_METRIC_UNITS}
                                                disabled={disabled}
                                                value={metric.unit}
                                                onChange={(unit) => updateMetric(metricIndex, { unit })}
                                            />
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
                                    )
                                    : (
                                        <OptionPicker
                                            label={`Metric ${metricIndex + 1} unit`}
                                            options={STRATEGY_METRIC_UNITS}
                                            disabled={disabled}
                                            value={metric.unit}
                                            onChange={(unit) => updateMetric(metricIndex, { unit })}
                                        />
                                    )}
                            </div>

                            <div className="strategy-metric-field" data-field-holder="">
                                <span className="field-label strategy-field-label">
                                    {`Baseline (${formatMonthShort(objective.period.start)})`}
                                    <FieldMark label={`Metric ${metricIndex + 1} baseline`} keyLabel="baseline" />
                                </span>
                                <FieldStatus label={`Metric ${metricIndex + 1} baseline`} keyLabel="baseline" />
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
                                <span className="field-label strategy-field-label">
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
