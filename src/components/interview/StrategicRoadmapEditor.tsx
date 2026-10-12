import {
    CSSProperties,
    KeyboardEvent as ReactKeyboardEvent,
    ReactNode,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState
} from "react";
import { createPortal } from "react-dom";

import { consumeKey } from "./consumeKey.ts";

import {
    StrategicPeriodValue,
    StrategyFoundationValue,
    formatMonthLong,
    formatRangeAbbrev,
    isRangeSet,
    monthFromIndex,
    monthIndex,
    strategyGoalsForTheme,
    strategyThemeBarLightness,
    strategyThemeHues,
    strategyThemeName
} from "../../framework/engine/AnswerUtils.ts";

import {
    ROADMAP_MONTH_LABELS,
    ROADMAP_WHEEL_GESTURE_GAP,
    ROADMAP_WHEEL_STEP,
    RoadmapZoom,
    anchoredScrollLeft,
    pinnedLabelShift,
    trackFraction,
    wheelPixels,
    wheelZoomTarget
} from "./roadmapZoom.ts";

import { placeTooltip } from "./roadmapTooltip.ts";

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
 * One column of the timeline. A quarter by default: a Strategic
 * Period runs for years, and one column per month stops fitting the
 * card long before it ends. Zoomed in, a month (see monthsFor).
 */
interface Quarter {
    key: string;
    /** "Q1" .. "Q4", or "Jan" .. "Dec" once zoomed. */
    label: string;
    year: string;
    /** Calendar month index of the column's first month. */
    start: number;
    /** Zoomed only: a quarter's first month, drawn a shade stronger. */
    quarterStart?: boolean;
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
 * The same span one month to a column -- each quarter split into its
 * three months, so the zoomed timeline starts and ends exactly where
 * the quarter one does and every bar keeps its place in time.
 */
function monthsFor(quarters: Quarter[]): Quarter[] {

    return quarters.flatMap(quarter => [0, 1, 2].map(offset => {

        const month = monthFromIndex(quarter.start + offset);

        return {
            key: `${month.year}-${month.month}`,
            label: ROADMAP_MONTH_LABELS[Number(month.month) - 1],
            year: month.year,
            start: quarter.start + offset,
            quarterStart: offset === 0
        };

    }));

}

/** A bar's own padding either side of its name (see `.roadmap-bar`). */
const BAR_PADDING = 10;

/**
 * Keeps each bar's name in view while the months are scrolled: a bar
 * whose start has gone under the pinned Theme names moves its name
 * right by as much (see pinnedLabelShift), through the custom
 * property `--roadmap-bar-pin` that only the month view reads. Set
 * on the elements directly rather than through React, since it
 * follows every scroll event.
 */
function pinBarNames(roadmap: HTMLElement) {

    roadmap.querySelectorAll<HTMLElement>(".roadmap-bar").forEach(bar => {

        const track = bar.closest(".roadmap-track");

        if (!track) {
            return;
        }

        // Where the visible timeline begins: the track's left edge as
        // it sits with nothing scrolled.
        const pinX = track.getBoundingClientRect().left + roadmap.scrollLeft;
        const box = bar.getBoundingClientRect();

        bar.style.setProperty(
            "--roadmap-bar-pin",
            `${pinnedLabelShift(box.left, box.width, pinX, BAR_PADDING)}px`
        );

    });

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
 * The mouse wheel over the timeline zooms it from quarters to months
 * and back. Zoomed in, the whole timeline widens and scrolls
 * sideways inside the roadmap, with the Theme names held in place.
 *
 * Nothing here is editable and nothing is stored -- the page takes
 * no value and writes none. Every name, date and Initiative is read
 * live from the other two pages, so a change made there shows up
 * here without anything having to be kept in step.
 */
export default function StrategicRoadmapEditor({

    foundation,

    period

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

    // Quarters or months. Held here only -- never written to the
    // answers -- so leaving the page returns it to quarters.
    const [zoom, setZoom] = useState<RoadmapZoom>("quarters");

    // Read by the wheel listener, which is bound once rather than on
    // every change of level.
    const zoomRef = useRef<RoadmapZoom>(zoom);
    zoomRef.current = zoom;

    const roadmapRef = useRef<HTMLElement>(null);

    // The moment under the pointer when zooming in, as a share of the
    // track it was over (by its place among the roadmap's tracks), and
    // the pointer's distance from the roadmap's left edge -- put back
    // under the pointer once the months are laid out.
    const anchorRef = useRef<{ track: number; fraction: number; pointerOffset: number } | null>(null);

    // One wheel gesture: how far it has travelled towards a step, and
    // whether it has already made one.
    const gestureRef = useRef({ last: 0, travel: 0, stepped: false });

    const periodSet = isRangeSet(foundation.period);

    /*
        The plain wheel over the timeline zooms: up to months, down
        back to quarters. It is taken from the page only when it can
        change the level -- at quarters, down scrolls the page as
        always, and at months so does up -- so the reader is never
        stuck on the chart. A pinch arrives as ctrl+wheel and is
        treated the same. A sideways movement (Shift+wheel, a
        trackpad swipe) is left alone to scroll the months.

        Bound by hand because React's own wheel listener is passive
        and cannot preventDefault.
    */
    useEffect(() => {

        const roadmap = roadmapRef.current;

        if (!roadmap) {
            return;
        }

        function onWheel(event: WheelEvent) {

            const target = event.target instanceof Element ? event.target : null;
            const track = target?.closest(".roadmap-track");

            if (!roadmap || !track || !roadmap.contains(track)) {
                return;
            }

            if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
                return;
            }

            const gesture = gestureRef.current;
            const now = Date.now();

            if (now - gesture.last > ROADMAP_WHEEL_GESTURE_GAP) {
                gesture.travel = 0;
                gesture.stepped = false;
            }

            gesture.last = now;

            // The rest of a gesture that has already stepped -- a
            // trackpad's inertia, a second event from one notch --
            // makes no second step and does not scroll the page
            // out from under the pointer either.
            if (gesture.stepped) {
                event.preventDefault();
                return;
            }

            const next = wheelZoomTarget(zoomRef.current, event.deltaY);

            if (next === null) {
                gesture.travel = 0;
                return;
            }

            event.preventDefault();

            const travel = wheelPixels(event.deltaY, event.deltaMode);

            // A change of direction starts the count again.
            gesture.travel = Math.sign(travel) === Math.sign(gesture.travel)
                ? gesture.travel + travel
                : travel;

            if (Math.abs(gesture.travel) < ROADMAP_WHEEL_STEP) {
                return;
            }

            gesture.travel = 0;
            gesture.stepped = true;

            if (next === "months") {

                const trackBox = track.getBoundingClientRect();

                anchorRef.current = {
                    track: [...roadmap.querySelectorAll(".roadmap-track")].indexOf(track),
                    fraction: trackFraction(event.clientX, trackBox.left, trackBox.width),
                    pointerOffset: event.clientX - roadmap.getBoundingClientRect().left
                };

            }

            setZoom(next);

        }

        // Bar names follow the sideways scroll (see pinBarNames).
        function onScroll() {
            if (roadmap) {
                pinBarNames(roadmap);
            }
        }

        roadmap.addEventListener("wheel", onWheel, { passive: false });
        roadmap.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        return () => {
            roadmap.removeEventListener("wheel", onWheel);
            roadmap.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };

    }, [periodSet]);

    /*
        Once the months are laid out, scroll them so the moment that
        was under the pointer is under it again. Before paint, so the
        reader never sees the timeline land anywhere else first.
        Zooming out needs nothing: the quarters fit, and the roadmap
        stops scrolling at all.
    */
    useLayoutEffect(() => {

        const roadmap = roadmapRef.current;
        const anchor = anchorRef.current;

        anchorRef.current = null;

        if (!roadmap) {
            return;
        }

        if (zoom !== "months" || !anchor) {
            roadmap.scrollLeft = 0;
            return;
        }

        // The same track the pointer was over: the heading row's and
        // a Theme's can sit a fraction of a pixel apart.
        const track = roadmap.querySelectorAll(".roadmap-track")[anchor.track];

        if (!track) {
            return;
        }

        const trackBox = track.getBoundingClientRect();
        const trackOffset = trackBox.left - roadmap.getBoundingClientRect().left + roadmap.scrollLeft;

        roadmap.scrollLeft = anchoredScrollLeft(
            trackOffset,
            trackBox.width,
            anchor.fraction,
            anchor.pointerOffset
        );

    }, [zoom]);

    /*
        The hover tooltip: a bar's or chip's full name and dates, for
        whenever the element is too narrow to show them. It appears at
        once on hover or keyboard focus -- no delay, so nothing
        flickers moving from one bar to the next -- and goes on leave,
        blur or Escape. It takes no pointer events, so the wheel and
        clicks go straight through to the timeline beneath.

        One tooltip for the whole roadmap, drawn on document.body
        rather than inside the roadmap, so the month view's scrolling
        box cannot clip it.
    */
    const [tip, setTip] = useState<{ key: string; text: string; anchor: HTMLElement } | null>(null);
    const [tipPosition, setTipPosition] = useState<{ left: number; top: number } | null>(null);
    const tipRef = useRef<HTMLDivElement>(null);
    const tipId = useId();

    function tipProps(key: string, text: string) {

        const show = (event: { currentTarget: HTMLElement }) =>
            setTip({ key, text, anchor: event.currentTarget });

        const hide = () => setTip(current => (current?.key === key ? null : current));

        return {
            onMouseEnter: show,
            onFocus: show,
            onMouseLeave: hide,
            onBlur: hide,
            onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
                // Consumed, or it also takes the page Back (see
                // consumeKey). Only while a tooltip is showing.
                if (event.key === "Escape" && tip?.key === key) {
                    consumeKey(event);
                    setTip(null);
                }
            },
            "aria-describedby": tip?.key === key ? tipId : undefined
        };

    }

    // Placed once it has been drawn and can be measured, before
    // paint -- and again whenever what it points at moves: a zoom,
    // a sideways scroll, the page scrolling, the window resizing.
    useLayoutEffect(() => {

        if (!tip) {
            setTipPosition(null);
            return;
        }

        function place() {

            const element = tipRef.current;

            if (!tip || !element || !tip.anchor.isConnected) {
                return;
            }

            const track = tip.anchor.closest(".roadmap-track");
            const scroller = roadmapRef.current;

            // Where the visible timeline begins, right of the Theme
            // names (see pinBarNames).
            const visibleLeft = track && scroller
                ? track.getBoundingClientRect().left + scroller.scrollLeft
                : 0;

            setTipPosition(placeTooltip(
                tip.anchor.getBoundingClientRect(),
                { width: element.offsetWidth, height: element.offsetHeight },
                { width: window.innerWidth, height: window.innerHeight },
                visibleLeft
            ));

        }

        place();

        window.addEventListener("scroll", place, true);
        window.addEventListener("resize", place);

        return () => {
            window.removeEventListener("scroll", place, true);
            window.removeEventListener("resize", place);
        };

    }, [tip, zoom]);

    // After every render -- a zoom, a scroll set above, a bar opened
    // or added -- so no bar's name is left where an earlier layout
    // put it. Read only by the month view's CSS.
    useLayoutEffect(() => {
        if (roadmapRef.current) {
            pinBarNames(roadmapRef.current);
        }
    });

    // One pass over the whole list, so no two Themes can land on
    // the same hue. The hue goes down to the box, and its bars and
    // initiatives are drawn from it at deeper tones -- so a bar
    // reads as belonging to its Theme, and still stands out
    // against the Theme's own pale ground.
    const themeHues = strategyThemeHues(foundation.themes.map(theme => theme.id));

    const first = monthIndex(foundation.period.start);
    const last = monthIndex(foundation.period.end);

    const quarters = periodSet ? quartersFor(first, last) : [];

    // Measured in quarters rather than months, so a bar's edges land
    // on the same grid the headings are drawn on.
    const spanStart = quarters[0]?.start ?? 0;
    const spanEnd = (quarters[quarters.length - 1]?.start ?? 0) + 3;
    const spanMonths = spanEnd - spanStart;

    // The columns actually drawn: the quarters, or once zoomed in the
    // same span's months. The span itself does not change, so every
    // bar keeps the same proportion of the track at both levels.
    const columns = zoom === "months" ? monthsFor(quarters) : quarters;

    /** Years across the top, each spanning its own columns. */
    const years: { year: string; count: number }[] = [];

    for (const quarter of columns) {

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
    const yearBoundaries = columns
        .map((quarter, index) => ({ quarter, index }))
        .filter(entry => entry.index > 0 && entry.quarter.year !== columns[entry.index - 1].year)
        .map(entry => (entry.index / columns.length) * 100);

    /**
     * The column grid drawn behind a row's bars. Zoomed in, a
     * quarter's first month carries the quarter's divider, so the
     * quarters still read among the months.
     */
    function gridCells() {
        return columns.map(column => (
            <div
                className={"roadmap-cell" + (column.quarterStart ? " roadmap-quarter-start" : "")}
                key={column.key}
                aria-hidden="true"
            />
        ));
    }

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

                // "Jan 2027 – Jun 2027", for the hover tooltip.
                shortRange: formatRangeAbbrev(objective.period),

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

            <section
                className={"roadmap" + (zoom === "months" ? " roadmap-zoomed" : "")}
                ref={roadmapRef}
            >

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

                    <div className="roadmap-track" style={{ "--roadmap-columns": columns.length } as CSSProperties}>

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
                                    {/* Its own box, so the month view can
                                        pin it while its year is part
                                        scrolled away. */}
                                    <span className="roadmap-year-label">{entry.year}</span>
                                </div>
                            ))}
                        </div>

                        <div className="roadmap-quarters">
                            {columns.map((quarter, index) => (
                                <div
                                    className={
                                        "roadmap-quarter" +
                                        // The heavier divider goes where a YEAR
                                        // starts, which is not every fourth
                                        // column: a period beginning in Q4 puts
                                        // the first boundary after one quarter,
                                        // not four. Marked from the data rather
                                        // than counted in CSS.
                                        (index > 0 && quarter.year !== columns[index - 1].year
                                            ? " roadmap-quarter-year-start"
                                            : quarter.quarterStart && index > 0
                                                ? " roadmap-quarter-start"
                                                : "") +
                                        (zoom === "months" ? " roadmap-month" : "")
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

                    <div className="roadmap-track" style={{ "--roadmap-columns": columns.length } as CSSProperties}>

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

                                            {gridCells()}

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
                                                {...tipProps(
                                                    objective.id,
                                                    `${objective.number}. ${objective.name} · ${objective.shortRange}`
                                                )}
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

                                                {gridCells()}

                                                <div
                                                    className="roadmap-initiatives"
                                                    style={barStyle(objective.start, objective.end)}
                                                >
                                                    {objective.initiatives.map((initiative, index) => (
                                                        <span
                                                            className="roadmap-initiative"
                                                            key={index}
                                                            // Focusable, so the full name
                                                            // a narrow chip cuts off can
                                                            // be reached from the keyboard
                                                            // as well as the pointer.
                                                            tabIndex={0}
                                                            // An Initiative has no dates
                                                            // of its own: it runs over its
                                                            // Objective's period.
                                                            {...tipProps(
                                                                `${objective.id}/${index}`,
                                                                `${index + 1}. ${initiative} · ${objective.shortRange}`
                                                            )}
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

            {tip && createPortal(
                <div
                    className="app-tooltip"
                    id={tipId}
                    role="tooltip"
                    ref={tipRef}
                    // Hidden until measured and placed, so it never
                    // shows for a frame in the wrong spot.
                    style={tipPosition
                        ? { left: tipPosition.left, top: tipPosition.top }
                        : { visibility: "hidden" }}
                >
                    {tip.text}
                </div>,
                document.body
            )}

        </div>

    );

}
