import { CSSProperties, ReactNode, useState } from "react";

import {
    StrategicPeriodValue,
    StrategyFoundationValue,
    formatMonthLong,
    isRangeSet,
    monthFromIndex,
    monthIndex,
    strategyGoalsForTheme,
    strategyThemeBarLightness,
    strategyThemeHues,
    strategyThemeName
} from "../../framework/engine/AnswerUtils.ts";

interface StrategicRoadmapEditorProps {

    /** The Strategic Period and the Themes (see page 1). */
    foundation: StrategyFoundationValue;

    /** The Goals, Objectives and Initiatives (see page 2). */
    period: StrategicPeriodValue;

    /** See BrandStyleEditor.columnsDivider. */
    columnsDivider?: ReactNode;

    /**
     * Whether the bullet guidance above the progress line shows.
     * Toggled by the Help button the page renders just above that
     * line -- see AnswerRendererProps.showInstructions.
     */
    showInstructions?: boolean;

}

/**
 * One column of the timeline. A quarter rather than a month: a
 * Strategic Period runs for years, and one column per month stops
 * being readable long before it ends.
 */
interface Quarter {
    key: string;
    /** "Q1" .. "Q4". */
    label: string;
    year: string;
    /** Calendar month index of the quarter's first month. */
    start: number;
}

/**
 * Every quarter the Strategic Period touches, whole -- a period
 * running February to May covers Q1 and Q2 in full, because a
 * timeline drawn in quarters has to start and end on one.
 */
function quartersFor(first: number, last: number): Quarter[] {

    if (first < 0 || last < first) {
        return [];
    }

    const quarters: Quarter[] = [];

    const firstMonth = monthFromIndex(first);
    const alignedFirst =
        Number(firstMonth.year) * 12 + Math.floor((Number(firstMonth.month) - 1) / 3) * 3;

    for (let index = alignedFirst; index <= last; index += 3) {

        const month = monthFromIndex(index);

        quarters.push({
            key: `${month.year}-${month.month}`,
            label: `Q${Math.floor((Number(month.month) - 1) / 3) + 1}`,
            year: month.year,
            start: index
        });

    }

    return quarters;

}

/**
 * The Strategy System's Roadmap page (see
 * AnswerType.StrategicRoadmap).
 *
 * ONE timeline for the whole strategy: the years and their quarters
 * drawn once across the top, then a box per Strategic Theme -- its
 * number and name on the left, its Objectives as bars across that
 * same timeline. Clicking a bar opens a second row beneath it
 * holding that Objective's Initiatives, laid across the same span.
 *
 * Nothing here is editable and nothing is stored -- the page takes
 * no value and writes none. Every name, date and Initiative is read
 * live from the other two pages, so a change made there shows up
 * here without anything having to be kept in step.
 */
export default function StrategicRoadmapEditor({

    foundation,

    period,

    columnsDivider,

    showInstructions = true

}: StrategicRoadmapEditorProps) {

    // Which Objectives have their Initiatives showing. Any number
    // at once: comparing what two Objectives are actually made of
    // is the reason to open them at all, and only one at a time
    // meant opening the second always closed the first.
    const [openObjectiveIds, setOpenObjectiveIds] = useState<Set<string>>(new Set());

    function toggleObjective(objectiveId: string) {

        setOpenObjectiveIds(current => {

            const next = new Set(current);

            if (!next.delete(objectiveId)) {
                next.add(objectiveId);
            }

            return next;

        });

    }

    // One pass over the whole list, so no two Themes can land on
    // the same hue. The hue goes down to the box, and its bars and
    // initiatives are drawn from it at deeper tones -- so a bar
    // reads as belonging to its Theme, and still stands out
    // against the Theme's own pale ground.
    const themeHues = strategyThemeHues(foundation.themes.map(theme => theme.id));

    const periodSet = isRangeSet(foundation.period);

    const first = monthIndex(foundation.period.start);
    const last = monthIndex(foundation.period.end);

    const quarters = periodSet ? quartersFor(first, last) : [];

    // Measured in quarters rather than months, so a bar's edges land
    // on the same grid the headings are drawn on.
    const spanStart = quarters[0]?.start ?? 0;
    const spanEnd = (quarters[quarters.length - 1]?.start ?? 0) + 3;
    const spanMonths = spanEnd - spanStart;

    /** Years across the top, each spanning its own quarters. */
    const years: { year: string; count: number }[] = [];

    for (const quarter of quarters) {

        const previous = years[years.length - 1];

        if (previous && previous.year === quarter.year) {
            previous.count += 1;
        } else {
            years.push({ year: quarter.year, count: 1 });
        }

    }

    /*
        Where each new year begins, as a percentage across the
        track. The heading row already draws these as its own
        column borders; this is what carries them on down through
        every Theme, so a bar can be read against the year it
        falls in rather than counted back to the top of the chart.
    */
    const yearBoundaries = quarters
        .map((quarter, index) => ({ quarter, index }))
        .filter(entry => entry.index > 0 && entry.quarter.year !== quarters[entry.index - 1].year)
        .map(entry => (entry.index / quarters.length) * 100);

    /** A bar as a percentage offset and width of the whole span. */
    function barStyle(start: number, end: number): CSSProperties {
        return {
            left: `${((start - spanStart) / spanMonths) * 100}%`,
            width: `${((end - start + 1) / spanMonths) * 100}%`
        };
    }

    const themes = foundation.themes.map((theme, themeIndex) => {

        // Only a complete period that runs forwards is dated: a start
        // with no end, or an end before the start, has no bar to draw.
        const dated = strategyGoalsForTheme(period, theme.id).flatMap(goal =>

            goal.objectives.map(objective => ({

                id: objective.id,

                name: objective.name.trim().length > 0
                    ? objective.name
                    : "Untitled Objective",

                start: monthIndex(objective.period.start),

                end: monthIndex(objective.period.end),

                range: `${formatMonthLong(objective.period.start)} – ${formatMonthLong(objective.period.end)}`,

                complete: isRangeSet(objective.period),

                initiatives: objective.initiatives.filter(entry => entry.trim().length > 0)

            }))

        ).filter(objective => objective.complete && objective.end >= objective.start);

        return {

            id: theme.id,

            number: themeIndex + 1,

            name: strategyThemeName(theme),

            datedCount: dated.length,

            // Numbered by their own order in this Theme's row -- not
            // the Theme.Goal.Objective path -- since the row's order,
            // colour and name already say where an Objective belongs.
            objectives: dated
                .filter(objective => objective.start >= spanStart && objective.end < spanEnd)
                .map((objective, objectiveIndex) => ({
                    ...objective,
                    number: objectiveIndex + 1
                }))

        };

    });

    const placedCount = themes.reduce((total, theme) => total + theme.objectives.length, 0);

    const datedCount = themes.reduce((total, theme) => total + theme.datedCount, 0);

    return (

        <div className="strategic-roadmap">

            <div className="brand-style-head strategy-roadmap-head">

                {showInstructions && (
                    <div className="answer-column-questions">
                        <span className="answer-question-line answer-question-line-bullet">
                            • See how your Objectives and Initiatives unfold over time,
                            providing a clear view of how your strategy progresses throughout
                            the Strategic Period.
                        </span>
                        <span className="answer-question-line answer-question-line-bullet">
                            • Select an Objective's bar to see the Initiatives planned inside it.
                        </span>
                    </div>
                )}

            </div>

            {columnsDivider && (
                <div className="answer-columns-divider">{columnsDivider}</div>
            )}

            {!periodSet && (
                <p className="strategy-empty-note">
                    Set the Strategic Period on the Foundation page. The roadmap is drawn
                    across it.
                </p>
            )}

            {/* Dated Objectives that all fall outside the period are
                not "without a period", so they are told apart. */}
            {periodSet && themes.length > 0 && placedCount === 0 && (
                <p className="strategy-empty-note">
                    {datedCount > 0
                        ? "The Objectives' periods fall outside the Strategic Period. " +
                          "Move them inside it on the Strategic Period page and they will appear here."
                        : "No Objective has a period yet. Set one on the Strategic " +
                          "Period page and it will appear here."}
                </p>
            )}

            {periodSet && (

            <section className="roadmap">

                {/*
                    ONE timeline for the whole strategy. The years and
                    their quarters are drawn once, at the top, and
                    every Theme's rows hang beneath them -- so two
                    Objectives in different Themes can be compared by
                    eye, which is the point of a roadmap and is
                    exactly what a chart per Theme took away.
                */}
                <div className="roadmap-head">

                    <div className="roadmap-theme roadmap-head-spacer" aria-hidden="true" />

                    <div className="roadmap-track" style={{ "--roadmap-columns": quarters.length } as CSSProperties}>

                        {/*
                            Years across the top, their quarters
                            beneath -- each year sized by how many of
                            its quarters the period actually covers,
                            so a period starting mid-year still lines
                            up with the columns below.
                        */}
                        <div className="roadmap-years">
                            {years.map(entry => (
                                <div
                                    className="roadmap-year"
                                    key={entry.year}
                                    style={{ "--roadmap-year-span": entry.count } as CSSProperties}
                                >
                                    {entry.year}
                                </div>
                            ))}
                        </div>

                        <div className="roadmap-quarters">
                            {quarters.map((quarter, index) => (
                                <div
                                    className={
                                        "roadmap-quarter" +
                                        // The heavier divider goes where a YEAR
                                        // starts, which is not every fourth
                                        // column: a period beginning in Q4 puts
                                        // the first boundary after one quarter,
                                        // not four. Marked from the data rather
                                        // than counted in CSS.
                                        (index > 0 && quarter.year !== quarters[index - 1].year
                                            ? " roadmap-quarter-year-start"
                                            : "")
                                    }
                                    key={quarter.key}
                                >
                                    {quarter.label}
                                </div>
                            ))}
                        </div>

                    </div>

                </div>

                {themes.map(theme => (

                <div
                    className="roadmap-theme-box"
                    key={theme.id}
                    data-rail={theme.id}
                    style={{
                        "--strategy-theme-hue": themeHues[theme.id],
                        // Solved per hue rather than pinned: see
                        // strategyThemeBarLightness.
                        "--strategy-bar-lightness": strategyThemeBarLightness(themeHues[theme.id])
                    } as CSSProperties}
                >

                    {/*
                        Each Theme is its own box, on its own ground,
                        with its name to the left of its rows -- but
                        every box shares the one timeline drawn above
                        them all, so bars in different Themes can
                        still be compared by eye.
                    */}
                    <div className="roadmap-theme">
                        <span className="roadmap-theme-number">{`Theme ${theme.number}`}</span>
                        <span className="roadmap-theme-name">{theme.name}</span>
                    </div>

                    {/*
                        The year dividers, carried down from the
                        timeline. Drawn as one layer over the whole
                        Theme box -- not inside its track -- so the
                        line runs the box's full height and on
                        through the gap above it, making one
                        unbroken rule from the timeline to the
                        bottom of the last Theme. A Theme with
                        nothing dated still gets it, since this
                        does not depend on any row being rendered.
                    */}
                    <div className="roadmap-year-lines" aria-hidden="true">
                        {yearBoundaries.map(offset => (
                            <span
                                className="roadmap-year-line"
                                key={offset}
                                style={{ left: `${offset}%` }}
                            />
                        ))}
                    </div>

                    <div className="roadmap-track" style={{ "--roadmap-columns": quarters.length } as CSSProperties}>

                        <div className="roadmap-rows">

                            {/*
                                A Theme with nothing dated still gets
                                its band -- every Theme has one -- so
                                the row says why it is empty rather
                                than the Theme silently vanishing.
                            */}
                            {theme.objectives.length === 0 && (
                                <p className="roadmap-empty-row">
                                    {theme.datedCount > 0
                                        ? "This Theme's Objectives fall outside the Strategic Period."
                                        : "No Objective in this Theme has a period yet."}
                                </p>
                            )}

                            {theme.objectives.map(objective => {

                                const open = openObjectiveIds.has(objective.id);

                                return (

                                    <div className="roadmap-row-group" key={objective.id}>

                                        <div className="roadmap-row">

                                            {quarters.map(quarter => (
                                                <div
                                                    className="roadmap-cell"
                                                    key={quarter.key}
                                                    aria-hidden="true"
                                                />
                                            ))}

                                            <button
                                                type="button"
                                                className={
                                                    "roadmap-bar" +
                                                    (open ? " roadmap-bar-open" : "")
                                                }
                                                style={barStyle(objective.start, objective.end)}
                                                aria-expanded={open}
                                                aria-label={
                                                    `${objective.number}. ${objective.name}, ` +
                                                    `${objective.range}. ` +
                                                    (objective.initiatives.length > 0
                                                        ? `${open ? "Hide" : "Show"} ` +
                                                          `${objective.initiatives.length} initiative${objective.initiatives.length === 1 ? "" : "s"}.`
                                                        : "No initiatives.")
                                                }
                                                title={`${objective.name} (${objective.range})`}
                                                onClick={() => toggleObjective(objective.id)}
                                            >
                                                <span className="roadmap-bar-label">
                                                    {`${objective.number}. ${objective.name}`}
                                                </span>
                                            </button>

                                        </div>

                                        {/*
                                            The Initiatives, side by
                                            side across the Objective's
                                            own span -- they share its
                                            period, so they share its
                                            width and divide it evenly.
                                        */}
                                        {open && objective.initiatives.length > 0 && (

                                            <div className="roadmap-row roadmap-row-initiatives">

                                                {quarters.map(quarter => (
                                                    <div
                                                        className="roadmap-cell"
                                                        key={quarter.key}
                                                        aria-hidden="true"
                                                    />
                                                ))}

                                                <div
                                                    className="roadmap-initiatives"
                                                    style={barStyle(objective.start, objective.end)}
                                                >
                                                    {objective.initiatives.map((initiative, index) => (
                                                        <span
                                                            className="roadmap-initiative"
                                                            key={index}
                                                            title={initiative}
                                                        >
                                                            <span className="roadmap-bar-label">
                                                                {`${index + 1}. ${initiative}`}
                                                            </span>
                                                        </span>
                                                    ))}
                                                </div>

                                            </div>

                                        )}

                                    </div>

                                );

                            })}

                        </div>

                    </div>

                </div>

                ))}

            </section>

            )}

        </div>

    );

}
