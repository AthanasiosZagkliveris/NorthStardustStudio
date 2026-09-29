import { CSSProperties, ReactNode, useState } from "react";

import type { StrategyMonthValue } from "../../framework/engine/AnswerUtils.ts";
import {
    type CashMonth,
    type Signal,
    withinPlan
} from "../../framework/engine/FinancialModel.ts";

import { BusinessField } from "./BusinessCardFields.tsx";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import MonthYearPicker from "./MonthYearPicker.tsx";
import FoldArrow from "./FoldArrow.tsx";
import CardNumber from "./CardNumber.tsx";

/*
    The pieces the two Financial pages share: a month within the
    plan, a row of headline figures, the cash timeline, and the list
    of decision signals.
*/

/**
 * A month inside the plan -- when a cost falls, a grant arrives, a
 * loan starts. Months outside the plan are shown but not offered.
 */
export function PlanMonthField({

    label,

    value,

    planStart,

    planMonths,

    onChange,

    disabled = false,

    info,

    inline = false

}: {

    label: string;
    value: StrategyMonthValue;
    planStart: StrategyMonthValue;
    /** The plan's length: a month after it cannot be picked. */
    planMonths?: number;
    onChange: (next: StrategyMonthValue) => void;
    disabled?: boolean;
    info?: InfoPoint[];
    /** The label beside the picker rather than above it. */
    inline?: boolean;

}) {

    return (
        <BusinessField label={label} info={info} inline={inline}>
            <MonthYearPicker
                hideLabel
                label={label}
                value={value}
                disabled={disabled}
                firstYear={Number(planStart.year) || new Date().getFullYear()}
                isAllowed={(month, year) => withinPlan(planStart, month, year, planMonths)}
                onChange={onChange}
            />
        </BusinessField>
    );

}

/**
 * Utilisation -- demand hours against capacity -- its "i" beside the
 * percent on Sustainability and (the same content) on
 * Infrastructure & Capability's own budget lines.
 */
export const CAPACITY_UTILISATION_HELP: InfoPoint[] = [
    { title: "Formula", text: "Utilisation = Demand hours ÷ Available hours" },
    "How much of the available time the planned work needs. Above 100% means more work than capacity.",
    {
        title: "Source",
        text: "CFI, “Capacity Utilization”",
        href: "https://corporatefinanceinstitute.com/resources/economics/capacity-utilization/"
    }
];

/** One headline figure, with what it means. */
interface FigureTile {
    label: string;
    value: string;
    /** A second line under the value. */
    detail?: string;
    info?: InfoPoint[];
    tone?: "risk" | "good" | "neutral";
}

export function FigureTiles({ tiles }: { tiles: FigureTile[] }) {
    return (
        <div className="financial-tiles">
            {tiles.map(tile => (
                <div
                    className={"financial-tile" + (tile.tone ? " financial-tile-" + tile.tone : "")}
                    key={tile.label}
                >
                    <span className="financial-tile-label">
                        <InfoText text={tile.label}>
                            {tile.info && <InfoNote label={tile.label} points={tile.info} fullList />}
                        </InfoText>
                    </span>
                    <span className="financial-tile-value">{tile.value}</span>
                    {tile.detail && <span className="financial-tile-detail">{tile.detail}</span>}
                </div>
            ))}
        </div>
    );
}

const SIGNAL_ICONS: Record<Signal["tone"], string> = {
    risk: "!",
    caution: "▲",
    good: "✓",
    info: "i"
};

/**
 * Decision signals: observations calculated from what was entered,
 * each with an icon and a title so the colour never carries the
 * meaning alone.
 */
export function SignalList({ signals }: { signals: Signal[] }) {

    if (signals.length === 0) {
        return null;
    }

    return (
        <ul className="financial-signals">
            {signals.map((signal, index) => (
                <li className={"financial-signal financial-signal-" + signal.tone} key={signal.title + index}>
                    <span className="financial-signal-icon" aria-hidden="true">
                        {SIGNAL_ICONS[signal.tone]}
                    </span>
                    <span>
                        <strong>{signal.title}.</strong> {signal.text}
                    </span>
                </li>
            ))}
        </ul>
    );

}

/** A titled block inside a calculated section. */
export function FinancialBlock({

    title,

    info,

    children

}: {

    title: string;
    info?: InfoPoint[];
    children: ReactNode;

}) {
    return (
        <div className="financial-block">
            <span className="business-foundation-label-info">
                <span className="business-capability-subhead">
                    <InfoText text={title}>
                        {info && <InfoNote label={title} points={info} fullList />}
                    </InfoText>
                </span>
            </span>
            {children}
        </div>
    );
}

/* ==========================================================
   The cash timeline
========================================================== */

/** A month to call out on the chart: break even, money running out. */
export interface TimelineMarker {
    month: number;
    label: string;
    tone: "good" | "risk";
}

const CHART = {
    width: 960,
    height: 280,
    right: 16,
    top: 16,
    bottom: 36
};

/* The font .financial-axis-text draws the tick labels in (see
   conversation.css): 400 weight, --font-small (14px), Inter. Kept
   as one literal string, the same way DynamicTable.tsx measures
   its own cell text, rather than reading the class's computed
   style -- the SVG has not been laid out yet the first time this
   runs. */
const AXIS_TICK_FONT = "400 14px Inter, sans-serif";

let axisMeasureCanvas: HTMLCanvasElement | null = null;

/** The pixel width of the widest formatted tick label, so the
    chart can reserve exactly enough left margin for it -- a
    currency with six-figure amounts ("$100,000") needs more room
    than one with three, and a fixed margin sized for the smaller
    case clipped the larger one against the SVG's own left edge. */
function widestLabel(labels: string[]): number {

    if (!axisMeasureCanvas) {
        axisMeasureCanvas = document.createElement("canvas");
    }

    const context = axisMeasureCanvas.getContext("2d");

    if (!context) {
        return 0;
    }

    context.font = AXIS_TICK_FONT;

    return labels.reduce((max, label) => Math.max(max, context.measureText(label).width), 0);

}

/**
 * Money in and money out, month by month, and the balance they leave.
 *
 * In rises above the zero line and out falls below it, on ONE scale
 * -- all three are amounts of the same currency. The balance is a
 * line over both, so the months where it dips below zero (cash
 * pressure, even when the totals add up) are visible at a glance.
 *
 * Every month has a hover target the full height of the plot, and a
 * table view carries the same figures for anyone who cannot use the
 * chart.
 */
export function CashTimelineChart({

    timeline,

    format,

    markers = [],

    inLabel = "Money in",

    outLabel = "Money out"

}: {

    timeline: CashMonth[];
    format: (amount: number) => string;
    markers?: TimelineMarker[];
    inLabel?: string;
    outLabel?: string;

}) {

    const [hovered, setHovered] = useState<number | null>(null);
    const [asTable, setAsTable] = useState(false);

    const plotHeight = CHART.height - CHART.top - CHART.bottom;

    const high = Math.max(1, ...timeline.map(month => Math.max(month.inflow, month.balance)));
    const low = Math.min(0, ...timeline.map(month => Math.min(-month.outflow, month.balance)));

    // Gridlines at round amounts.
    const range = high - low;
    const rough = range / 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
    // Never finer than one whole unit: amounts are shown rounded.
    const step = Math.max(1, [1, 2, 2.5, 5, 10].map(m => m * magnitude).find(s => s >= rough) ?? rough);
    const ticks: number[] = [];
    for (let tick = Math.ceil(low / step) * step; tick <= high + 1e-9; tick += step) {
        ticks.push(Math.abs(tick) < 1e-9 ? 0 : tick);
    }

    // The left margin reserves exactly what the widest tick label
    // needs (8px from the axis line, the gap the text already sat
    // at, plus a few px of breathing room), rather than a fixed
    // guess that clipped a six-figure amount ("$100,000") against
    // the SVG's own left edge.
    const chartLeft = Math.max(40, Math.ceil(widestLabel(ticks.map(format))) + 16);

    const plotWidth = CHART.width - chartLeft - CHART.right;

    const y = (amount: number) => CHART.top + (high - amount) / (high - low) * plotHeight;
    const count = Math.max(1, timeline.length);
    const slot = plotWidth / count;
    // A label every quarter, or every half year on a long plan; the
    // last month always, and the regular one before it only when
    // there is room for both.
    const labelStep = count > 36 ? 6 : 3;
    const x = (index: number) => chartLeft + index * slot;
    const barWidth = Math.max(4, Math.min(14, slot / 2 - 3));

    const balancePath = timeline
        .map((month, index) =>
            (index === 0 ? "M" : "L") + (x(index) + slot / 2).toFixed(1) + " " + y(month.balance).toFixed(1))
        .join(" ");

    const hoveredMonth = hovered === null ? null : timeline[hovered];

    return (
        <div className="financial-chart">

            <div className="financial-chart-bar">
                <ul className="financial-chart-legend">
                    <li><span className="financial-swatch financial-swatch-in" />{inLabel}</li>
                    <li><span className="financial-swatch financial-swatch-out" />{outLabel}</li>
                    <li><span className="financial-swatch financial-swatch-balance" />Balance</li>
                </ul>
                <button
                    type="button"
                    className="business-engagement-link"
                    onClick={() => setAsTable(current => !current)}
                >
                    {asTable ? "Show as chart" : "Show as table"}
                </button>
            </div>

            {asTable
                ? (
                    <div className="financial-table-scroll">
                        <table className="financial-table">
                            <thead>
                                <tr>
                                    <th scope="col">Month</th>
                                    <th scope="col">{inLabel}</th>
                                    <th scope="col">{outLabel}</th>
                                    <th scope="col">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timeline.map(month => (
                                    <tr key={month.month} className={month.balance < 0 ? "financial-row-negative" : undefined}>
                                        <th scope="row">{month.label}</th>
                                        <td>{format(month.inflow)}</td>
                                        <td>{format(-month.outflow)}</td>
                                        <td>{format(month.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
                : (
                    <div className="financial-chart-plot" onMouseLeave={() => setHovered(null)}>

                        <svg
                            viewBox={"0 0 " + CHART.width + " " + CHART.height}
                            role="img"
                            aria-label={"Cash timeline over " + count + " months: " + inLabel.toLowerCase() +
                                ", " + outLabel.toLowerCase() + " and the balance. Use “Show as table” for the figures."}
                        >

                            {ticks.map(tick => (
                                <g key={tick}>
                                    <line
                                        className={tick === 0 ? "financial-axis-zero" : "financial-grid"}
                                        x1={chartLeft} x2={CHART.width - CHART.right}
                                        y1={y(tick)} y2={y(tick)}
                                    />
                                    <text className="financial-axis-text" x={chartLeft - 8} y={y(tick) + 4} textAnchor="end">
                                        {format(tick)}
                                    </text>
                                </g>
                            ))}

                            {timeline.map((month, index) => {
                                const centre = x(index) + slot / 2;
                                return (
                                    <g key={month.month}>
                                        {month.inflow > 0 && (
                                            <rect
                                                className="financial-bar-in"
                                                x={centre - barWidth - 1} width={barWidth}
                                                y={y(month.inflow)} height={Math.max(1, y(0) - y(month.inflow))}
                                                rx={2}
                                            />
                                        )}
                                        {month.outflow > 0 && (
                                            <rect
                                                className="financial-bar-out"
                                                x={centre + 1} width={barWidth}
                                                y={y(0)} height={Math.max(1, y(-month.outflow) - y(0))}
                                                rx={2}
                                            />
                                        )}
                                        {(index === count - 1 || (index % labelStep === 0 && count - 1 - index >= labelStep)) && (
                                            <text
                                                className="financial-axis-text"
                                                x={centre} y={CHART.height - 12} textAnchor="middle"
                                            >
                                                {month.label}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}

                            <path className="financial-balance" d={balancePath} />

                            {timeline.map((month, index) => month.balance < 0 && (
                                <circle
                                    key={"low-" + month.month}
                                    className="financial-balance-negative"
                                    cx={x(index) + slot / 2} cy={y(month.balance)} r={4}
                                />
                            ))}

                            {markers.map(marker => {
                                const at = x(marker.month - 1) + slot / 2;
                                return (
                                    <g key={marker.label} className={"financial-marker financial-marker-" + marker.tone}>
                                        <line x1={at} x2={at} y1={CHART.top} y2={CHART.height - CHART.bottom} />
                                        <text x={at + 4} y={CHART.top + 10}>{marker.label}</text>
                                    </g>
                                );
                            })}

                            {hovered !== null && (
                                <rect
                                    className="financial-hover"
                                    x={x(hovered)} width={slot}
                                    y={CHART.top} height={plotHeight}
                                />
                            )}

                            {timeline.map((month, index) => (
                                <rect
                                    key={"hit-" + month.month}
                                    className="financial-hit"
                                    x={x(index)} width={slot}
                                    y={CHART.top} height={plotHeight}
                                    onMouseEnter={() => setHovered(index)}
                                />
                            ))}

                        </svg>

                        {hoveredMonth && hovered !== null && (
                            <div
                                className="financial-tooltip"
                                style={{
                                    left: ((x(hovered) + slot / 2) / CHART.width * 100) + "%",
                                    transform: hovered > count / 2
                                        ? "translateX(calc(-100% - 12px))"
                                        : "translateX(12px)"
                                }}
                            >
                                <strong>{hoveredMonth.label}</strong>
                                <span><i className="financial-swatch financial-swatch-in" />{inLabel}: {format(hoveredMonth.inflow)}</span>
                                <span><i className="financial-swatch financial-swatch-out" />{outLabel}: {format(-hoveredMonth.outflow)}</span>
                                {hoveredMonth.loanRepayment > 0 && (
                                    <span className="financial-tooltip-note">
                                        incl. loan repayments {format(hoveredMonth.loanRepayment)}
                                    </span>
                                )}
                                <span><i className="financial-swatch financial-swatch-balance" />Balance: {format(hoveredMonth.balance)}</span>
                            </div>
                        )}

                    </div>
                )}

        </div>
    );

}

/** What each Financial page says about one of its sections. */
export interface FinancialSection {
    title: string;
    instructions: string[];
    info: InfoPoint[];
}

/**
 * THE PAGE'S HEAD, as on Pages 1 to 3: a numbered title for each
 * section, its instructions beneath (hidden with the help), then the
 * progress line.
 */
export function FinancialPageHead({

    sections,

    showInstructions,

    columnsDivider

}: {

    sections: FinancialSection[];
    showInstructions?: boolean;
    columnsDivider?: ReactNode;

}) {

    return (
        <div
            className="answer-columns financial-page-head"
            style={{ "--answer-column-count": sections.length } as CSSProperties}
        >
            {sections.map((section, position) => (
                <h3 className="answer-column-label" key={"title-" + section.title}>
                    <span className="answer-column-label-number">
                        {(position + 1) + "."}
                    </span>
                    <span className="answer-column-label-text">{section.title}</span>
                </h3>
            ))}
            {showInstructions && sections.map(section => (
                <div className="answer-column-questions" key={"questions-" + section.title}>
                    {section.instructions.map(line => (
                        <span className="answer-question-line answer-question-line-bullet" key={line}>
                            {"• " + line}
                        </span>
                    ))}
                </div>
            ))}
            {columnsDivider && <div className="answer-columns-divider">{columnsDivider}</div>}
        </div>
    );

}

/**
 * One section of a Financial page: a folding card whose head is the
 * section's number and title (its "i" beside it), tinted by `hue`.
 */
export function FinancialSectionCard({

    rail,

    number,

    section,

    hue,

    open,

    onToggle,

    body,

    anchor,

    headClass,

    titleExtra

}: {

    /** The section's name for the rail (see railId). */
    rail: string;
    number: number;
    section: FinancialSection;
    hue: number;
    open: boolean;
    onToggle: () => void;
    /** Drawn only while the card is open. */
    body: () => ReactNode;
    /** Its name for a link that opens it (see jumpTo.ts). */
    anchor?: string;
    /** A class added to the head, e.g. fold-group-head for a head with an "Expand all". */
    headClass?: string;
    /** Anything at the far end of the title row. */
    titleExtra?: ReactNode;

}) {

    return (
        <div
            className="business-foundation-input business-foundation-card business-engagement-input financial-section"
            data-anchor={anchor}
            data-rail={rail}
            style={{ "--strategy-theme-hue": hue } as CSSProperties}
        >

            <div
                className={
                    "strategy-box-head business-foundation-input-head business-capability-card-head fold-card-head" +
                    (headClass ? " " + headClass : "")
                }
            >
                <FoldArrow open={open} label={section.title} onToggle={onToggle} />
                <CardNumber number={number} />
                <span className="strategy-name-static">
                    <InfoText text={section.title}>
                        <InfoNote label={section.title} points={section.info} fullList />
                    </InfoText>
                </span>
                {titleExtra}
            </div>

            {open && body()}

        </div>
    );

}
