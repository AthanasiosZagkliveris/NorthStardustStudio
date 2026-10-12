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
    formatRangeAbbrev,
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
import InfoNote from "./InfoNote.tsx";
import CardNameInput from "./CardNameInput.tsx";
import CardNav from "./CardNav.tsx";
import FoldArrow from "./FoldArrow.tsx";
import { useGroupView } from "./groupView.ts";
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

    /** Where a Theme is added (its "+" beside the x): a new Theme card. */
    onAddTheme?: () => void;

    /** What stands in the tiles' grid after the last tile (the page's "Add Card" for a Theme). */
    trailing?: ReactNode;

}

/**
 * A card's name cell with its order number INSIDE it (the Theme, Goal,
 * Objective and Metric heads): the number stands at the cell's left, the
 * name after it, so the cell starts at the card's own 12px margin.
 */
function NumberedName({ number, children }: { number: number; children: ReactNode }) {
    return (
        <span className="strategy-numbered-name">
            <span className="strategy-name-number list-number">{number + "."}</span>
            {children}
        </span>
    );
}

/** A head's kind label with its "i" (Goal, Objective, Metric): between the name cell and the x. */
function HeadKind({ kind, help }: { kind: string; help: string }) {
    return (
        <span className="strategy-head-kind">
            <span className="strategy-head-kind-name">{kind}</span>
            <InfoNote label={kind} points={[help]} />
        </span>
    );
}

/** The Objective's date-sort funnel button: hidden for now. */
const SHOW_OBJECTIVE_SORT = false;
const GOALS_HELP ="What do you want to accomplish within each Strategic Theme, and why does it matter?";
const OBJECTIVES_HELP = "Specific, measurable, and time-bound milestones that support a Goal.";
const INITIATIVES_HELP = "Actions focused on major areas of work to achieve the Objectives.";
const METRICS_HELP = "Measures that provide evidence of progress toward the Objective.";

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

    onRemoveTheme,
    onAddTheme,
    trailing

}: StrategicPeriodEditorProps) {

    // (Inside the Foundation's dialog the tiles and cards keep that dialog's hue; on its own page, the Strategy's.)
    const pageHue = workHue(embedded ? "discover" : "decide");

    const period = asStrategicPeriodValue(value);

    const themes = foundation.themes;

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

    const goalProps = {
        disabled,
        periodSet,
        withinPeriod,
        founders,
        organisationCurrency,
        periodStartYear: periodSet ? Number(foundation.period.start.year) : new Date().getFullYear()
    };

    /** A Theme's Goals, in the Theme's dialog: one Goal at a time (groupView.ts), or all of them as tiles. There is no card of one Goal, one Objective or one Metric apart from this one. */
    function goalsView(themeId: string): ReactNode {
        return (
            <div className="column-tile-content strategy-goal-card" style={{ "--strategy-theme-hue": pageHue } as CSSProperties}>
                <GoalList
                    {...goalProps}
                    groupId={themeId}
                    goals={goalsFor(themeId)}
                    onChangeGoals={(next) => setGoals(themeId, next)}
                />
            </div>
        );
    }

    /** THE PAGE AS TILES: each Strategic Theme is a tile (its Goals listed on it) opening its dialog; a Theme with several Goals shows a tile for each, and each Goal opens as a floating card. */
    const tiles: SectionTile[] = themes.map((theme, themeIndex): SectionTile => {
        const goals = goalsFor(theme.id);
        const named = goals.map(goal => goal.name.trim()).filter(name => name.length > 0).slice(0, 6);
        return {
            id: theme.id,
            title: strategyThemeName(theme),
            view: true,
            rail: theme.id,
            items: named,
            itemMarks: named.map(() => ({ bullet: true })),
            content: () => (
                <div className="column-tile-content strategy-theme-dialog" data-rail={theme.id} style={{ "--strategy-theme-hue": pageHue } as CSSProperties}>
                    {/* Where the Theme is written (the Foundation page): the card's head -- its number, its name cell and its x -- then its description, optional (a tick). */}
                    {onEditTheme
                        ? (
                            <div className="strategy-theme-fields">
                                <div className="strategy-box-head strategy-theme-head">
                                    <NumberedName number={themeIndex + 1}>
                                        <input
                                            type="text"
                                            className="interview-input strategy-theme-name"
                                            aria-label={"Strategic Theme " + (themeIndex + 1) + " name"}
                                            placeholder="Theme name"
                                            disabled={disabled}
                                            value={theme.name}
                                            onChange={(event) => onEditTheme(theme.id, { name: event.target.value })}
                                        />
                                    </NumberedName>
                                    <BoxActions label={"Strategic Theme " + (themeIndex + 1)} disabled={disabled} onAdd={onAddTheme} addLabel="Theme" onRemove={onRemoveTheme ? () => onRemoveTheme(theme.id) : undefined} />
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
                    {goalsView(theme.id)}
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
        // (Its name alone: the Roadmap is drawn in its dialog, and its tile has no list.)
        items: [],
        content: () => <div className="column-tile-content">{roadmap()}</div>
    }] : [];

    if (embedded) {
        return (
            <div className="strategy-embedded-tiles">
                {/* (The tiles keep the hue of the dialog they stand in: the Foundation's.) */}
                <SectionTiles small label="Roadmap and Strategic Themes" hue={workHue("discover")} tiles={only === "roadmap" ? roadmapTile : only === "themes" ? tiles : [...roadmapTile, ...tiles]} trailing={trailing} />
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

/** A Theme's Goals: one at a time, brought forward by its arrows, its rail bullets or its tile (groupView.ts), movable as a group. */
function GoalList({

    groupId,

    goals,

    disabled,

    periodSet,

    withinPeriod,

    founders,

    organisationCurrency,

    periodStartYear,

    onChangeGoals

}: {

    /** The Theme's id: what the group of Goals is held under. */
    groupId: string;

    goals: StrategyGoalValue[];

    disabled: boolean;

    periodSet: boolean;

    withinPeriod: (month: number, year: number) => boolean;
    founders: readonly { id: string; name: string }[];

    organisationCurrency: string;

    periodStartYear: number;

    onChangeGoals: (goals: StrategyGoalValue[]) => void;

}) {

    const ids = goals.map(entry => entry.id);

    const view = useGroupView(groupId, ids);

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

    // The Goals as tiles: pressing one brings it forward, in its place under the Theme.
    if (view.tiles) {
        const items = goals.map((goal, at): CardBox => {
            const lines = goal.objectives.map(objective => objective.name.trim()).filter(name => name !== "").slice(0, 4);
            return { id: goal.id, number: at + 1, name: goal.name, unnamed: "Unnamed goal", own: true, lines, marks: lines.map(() => ({ bullet: true })), press: () => view.select(goal.id), content: () => null };
        });
        const add = {
            label: "goal",
            disabled,
            onAdd: () => {
                const added = createStrategyGoal();
                onChangeGoals([...goals, added]);
                return added.id;
            },
            onOpen: (id: string) => view.select(id),
            isBlank: () => false,
            onRemove: () => undefined
        };
        return (
            <>
                <span className="field-group-title business-foundation-subhead strategy-tiles-label">Goals</span>
                <CardBoxes items={items} label="Goals" what="Goal" add={add} autoStart={false} addNext threeAcross />
            </>
        );
    }

    return (

        <>

            {goals.map((goal, goalIndex) => {

                if (goalIndex !== view.index) {
                    return null;
                }

                const props = box.boxProps(goalIndex, goals.length, `Goal ${goalIndex + 1}`);

                return (

                    <div
                        key={goal.id}
                        {...props}
                        data-anchor={goal.id}
                        data-slide={view.direction}
                        className={`strategy-goal-box ${props.className}`}
                    >

                        <div className="strategy-box-head strategy-card-head-flat">

                            <NumberedName number={goalIndex + 1}>
                                <CardNameInput
                                    ariaLabel={`Goal ${goalIndex + 1} name`}
                                    placeholder="Goal name"
                                    disabled={disabled}
                                    value={goal.name}
                                    onChange={(name) => updateGoal(goalIndex, { name })}
                                />
                            </NumberedName>

                            <HeadKind kind="Goal" help={GOALS_HELP} />

                            <BoxActions
                                label={`Goal ${goalIndex + 1}`}
                                disabled={disabled}
                                addLabel="Goal"
                                onAdd={() => {
                                    // A new Goal beside this one, brought forward as it is added.
                                    const added = createStrategyGoal();
                                    onChangeGoals([...goals, added]);
                                    view.select(added.id);
                                }}
                                onRemove={() => onChangeGoals(
                                    goals.length > 1
                                        ? goals.filter((_goal, position) => position !== goalIndex)
                                        : [createStrategyGoal()]
                                )}
                            />

                        </div>

                        <CardNav kind="Goal" ids={ids} names={goals.map(entry => entry.name)} index={view.index} onGo={view.select} onTiles={() => view.setTiles(true)} />

                        <div className="strategy-box-body">

                            <OptionalNote
                                label="Description"
                                className="interview-input strategy-note"
                                ariaLabel={`Goal ${goalIndex + 1} description`}
                                disabled={disabled}
                                value={goal.description}
                                onChange={(next) => updateGoal(goalIndex, { description: next })}
                            />

                            <ObjectiveList
                                groupId={goal.id}
                                objectives={goal.objectives}
                                disabled={disabled}
                                periodSet={periodSet}
                                withinPeriod={withinPeriod}
                                founders={founders}
                                organisationCurrency={organisationCurrency}
                                periodStartYear={periodStartYear}
                                onChangeObjectives={(objectives) => updateGoal(goalIndex, { objectives })}
                            />

                        </div>

                    </div>

                );

            })}

        </>

    );

}

/** A Goal's Objectives, movable as a group. */
function ObjectiveList({

    groupId,

    objectives,

    disabled,

    periodSet,

    withinPeriod,

    founders,

    organisationCurrency,

    periodStartYear,

    onChangeObjectives

}: {

    /** The Goal's id: what the group of Objectives is held under. */
    groupId: string;

    objectives: StrategyObjectiveValue[];

    disabled: boolean;

    periodSet: boolean;

    withinPeriod: (month: number, year: number) => boolean;
    founders: readonly { id: string; name: string }[];

    organisationCurrency: string;

    periodStartYear: number;

    onChangeObjectives: (objectives: StrategyObjectiveValue[]) => void;

}) {

    // The Objectives whose Initiatives are folded shut (the fold arrow before the title).
    const [foldedInitiatives, setFoldedInitiatives] = useState<readonly string[]>([]);

    const ids = objectives.map(entry => entry.id);

    const view = useGroupView(groupId, ids);

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

    // The Objectives as tiles: pressing one brings it forward, in its place under the Goal.
    if (view.tiles) {
        const items = objectives.map((objective, at): CardBox => {
            const lines = objective.initiatives.filter(item => item.trim() !== "").slice(0, 4);
            return { id: objective.id, number: at + 1, name: objective.name, unnamed: "Unnamed objective", own: true, lines, marks: lines.map(() => ({ bullet: true })), press: () => view.select(objective.id), content: () => null };
        });
        const add = {
            label: "objective",
            disabled,
            onAdd: () => {
                const added = createStrategyObjective();
                onChangeObjectives([...objectives, added]);
                return added.id;
            },
            onOpen: (id: string) => view.select(id),
            isBlank: () => false,
            onRemove: () => undefined
        };
        return (
            <>
                <span className="field-group-title business-foundation-subhead strategy-tiles-label">Objectives</span>
                <CardBoxes items={items} label="Objectives" what="Objective" add={add} autoStart={false} addNext threeAcross />
            </>
        );
    }

    return (

        <>

            {objectives.map((objective, objectiveIndex) => {

                if (objectiveIndex !== view.index) {
                    return null;
                }

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
                        data-slide={view.direction}
                        className={`strategy-objective-box ${props.className}`}
                    >

                        <div className="strategy-box-head strategy-card-head-flat">

                            <NumberedName number={objectiveIndex + 1}>
                                <CardNameInput
                                    ariaLabel={`Objective ${objectiveIndex + 1} name`}
                                    placeholder="Objective name"
                                    disabled={disabled}
                                    value={objective.name}
                                    onChange={(name) => updateObjective(objectiveIndex, { name })}
                                />
                            </NumberedName>

                            <HeadKind kind="Objective" help={OBJECTIVES_HELP} />

                            <BoxActions
                                label={`Objective ${objectiveIndex + 1}`}
                                disabled={disabled}
                                addLabel="Objective"
                                onAdd={() => {
                                    // A new Objective beside this one, brought forward as it is added.
                                    const added = createStrategyObjective();
                                    onChangeObjectives([...objectives, added]);
                                    view.select(added.id);
                                }}
                                // The date-sort funnel is hidden for now:
                                // set SHOW_OBJECTIVE_SORT to bring it back.
                                onSort={SHOW_OBJECTIVE_SORT ? sortByDate : undefined}
                                sortOptions={SHOW_OBJECTIVE_SORT ? [
                                    { id: "sooner", label: "Soonest first" },
                                    { id: "later", label: "Latest first" }
                                ] : undefined}
                                onRemove={() => onChangeObjectives(
                                    objectives.length > 1
                                        ? objectives.filter((_entry, index) => index !== objectiveIndex)
                                        : [createStrategyObjective()]
                                )}
                            />

                        </div>

                        <CardNav kind="Objective" ids={ids} names={objectives.map(entry => entry.name)} index={view.index} onGo={view.select} onTiles={() => view.setTiles(true)} />

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
                                            <FoldArrow
                                                open={!foldedInitiatives.includes(objective.id)}
                                                label={`Objective ${objectiveIndex + 1} initiatives`}
                                                onToggle={() => setFoldedInitiatives(current => current.includes(objective.id) ? current.filter(id => id !== objective.id) : [...current, objective.id])}
                                            />
                                            <span className="strategy-box-number">Initiatives</span>
                                            <InfoNote label="Initiatives" points={[INITIATIVES_HELP]} />
                                        </div>

                                        {!foldedInitiatives.includes(objective.id) && (
                                        <NumberedListInput
                                            label={`Objective ${objectiveIndex + 1} initiative`}
                                            items={objective.initiatives}
                                            disabled={disabled}
                                            placeholder="Initiative"
                                            onChange={(initiatives) => updateObjective(
                                                objectiveIndex, { initiatives }
                                            )}
                                        />
                                        )}

                                    </div>

                                    <MetricList
                                        groupId={objective.id}
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

    onChangeMetrics,

    groupId

}: {

    /** The Objective's id: what the group of Metrics is held under. */
    groupId: string;

    objective: StrategyObjectiveValue;

    organisationCurrency: string;

    objectiveNumber: number;

    disabled: boolean;

    onChangeMetrics: (metrics: StrategyMetricValue[]) => void;

}) {

    const metrics = objective.metrics;

    const ids = metrics.map(entry => entry.id);

    const view = useGroupView(groupId, ids);

    // The last Metric of an Objective is made blank again, not taken away.
    const removeAt = (index: number) => onChangeMetrics(
        metrics.length > 1
            ? metrics.filter((_metric, position) => position !== index)
            : [createStrategyMetric()]
    );

    const box = useMovableBox(
        (from, to) => onChangeMetrics(reorder(metrics, from, to)),
        removeAt
    );

    function updateMetric(index: number, patch: Partial<StrategyMetricValue>) {
        onChangeMetrics(metrics.map(
            (metric, position) => position === index ? { ...metric, ...patch } : metric
        ));
    }

    // The Metrics as tiles: pressing one brings it forward, in its place under the Objective.
    if (view.tiles) {
        const items = metrics.map((metric, at): CardBox => {
            // The Objective's time period first, the Baseline and the Target under it.
            const period = isRangeSet(objective.period) ? formatRangeAbbrev(objective.period) : "";
            const lines = [
                period,
                metric.baseline.trim() !== "" ? "Baseline: " + metric.baseline.trim() : "",
                metric.target.trim() !== "" ? "Target: " + metric.target.trim() : ""
            ].filter(line => line !== "");
            return { id: metric.id, number: at + 1, name: metric.name, unnamed: "Unnamed metric", own: true, lines, marks: lines.map(() => ({ bullet: true })), press: () => view.select(metric.id), content: () => null };
        });
        const add = {
            label: "metric",
            disabled,
            onAdd: () => {
                const added = createStrategyMetric();
                onChangeMetrics([...metrics, added]);
                return added.id;
            },
            onOpen: (id: string) => view.select(id),
            isBlank: () => false,
            onRemove: () => undefined
        };
        return (
            <div className="strategy-subsection">
                <span className="field-group-title business-foundation-subhead strategy-tiles-label">Metrics</span>
                <CardBoxes items={items} label="Metrics" what="Metric" add={add} autoStart={false} addNext threeAcross />
            </div>
        );
    }

    return (

        <div className="strategy-subsection">

            {metrics.map((metric, metricIndex) => {

                if (metricIndex !== view.index) {
                    return null;
                }

                const props = box.boxProps(metricIndex, metrics.length, `Metric ${metricIndex + 1}`);

                return (

                    <div
                        key={metric.id}
                        {...props}
                        data-anchor={metric.id}
                        data-slide={view.direction}
                        className={`strategy-metric-box ${props.className}`}
                    >

                        <div className="strategy-box-head">

                            <NumberedName number={metricIndex + 1}>
                                <CardNameInput
                                    ariaLabel={`Objective ${objectiveNumber} metric ${metricIndex + 1} name`}
                                    placeholder="Metric name"
                                    disabled={disabled}
                                    value={metric.name}
                                    onChange={(name) => updateMetric(metricIndex, { name })}
                                />
                            </NumberedName>

                            <HeadKind kind="Metric" help={METRICS_HELP} />

                            <BoxActions
                                label={`Metric ${metricIndex + 1}`}
                                disabled={disabled}
                                addLabel="Metric"
                                onAdd={() => {
                                    // A new Metric beside this one, brought forward as it is added.
                                    const added = createStrategyMetric();
                                    onChangeMetrics([...metrics, added]);
                                    view.select(added.id);
                                }}
                                onRemove={() => removeAt(metricIndex)}
                            />

                        </div>

                        <CardNav kind="Metric" ids={ids} names={metrics.map(entry => entry.name)} index={view.index} onGo={view.select} onTiles={() => view.setTiles(true)} />

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
                                    Frequency
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

        </div>

    );

}
