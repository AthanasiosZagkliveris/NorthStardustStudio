import { CSSProperties, ReactNode, useState } from "react";
import RadioChoice from "../../controls/RadioChoice.tsx";
import BoxActions from "../fields/ReorderControls.tsx";
import { TABLE_SIZES } from "./CapabilityOverview.tsx";

/**
 * A REPORT'S FRAME, one for every report the app draws (the Inventory, its Channel Costs set-up among them): the bar -- how many lines are shown of how many,
 * what the report adds (a legend, a chip), Tiles or Table,
 * the table's three text sizes, and the funnel's window -- over the report's own body, which scrolls. The body is given the view and, for a table, the style of
 * its text size (`--table-font`, `--table-pad`, `data-size`).
 */
export default function ReportFrame({ count, extra, label, menu, children }: {
    /** "12 of 30". */
    count: string;
    /** What the report adds to its bar, after the count (the Inventory's incomplete line, legend and chip). */
    extra?: ReactNode;
    /** What the funnel's window is for, for assistive technology ("all tiles"). */
    label: string;
    /** The funnel's window: the report's own blocks. */
    menu: ReactNode;
    children: (view: "tiles" | "table", table: { "data-size": string; style: CSSProperties }) => ReactNode;
}) {
    const [view, setView] = useState<"tiles" | "table">("tiles");
    // (The table's text: the small size below 1900px of window, the body size above; kept while the report stays open.)
    const [tableSize, setTableSize] = useState(() => typeof window !== "undefined" && window.innerWidth < 1900 ? 0 : 1);
    return (
        <div className={"capability-overview" + (view === "table" ? " capability-overview-table-mode" : "")}>
            <div className="capability-overview-bar">
                <span className="capability-overview-count">{count}</span>
                {extra}
                <RadioChoice
                    className="capability-overview-views"
                    label="View"
                    group="capability-overview-view"
                    options={[{ id: "tiles", label: "Tiles" }, { id: "table", label: "Table" }]}
                    value={view}
                    onChange={setView}
                />
                {view === "table" && (
                    <RadioChoice
                        className="capability-overview-sizes"
                        label="Table text size"
                        group="capability-overview-size"
                        options={TABLE_SIZES.map((size, at) => ({ id: size.id, label: <span className="capability-overview-size-aa" data-size={size.id}>Aa</span>, name: ["Smaller text", "Standard text", "Larger text"][at] }))}
                        value={TABLE_SIZES[tableSize].id}
                        onChange={(next) => { const at = TABLE_SIZES.findIndex(size => size.id === next); if (at >= 0) { setTableSize(at); } }}
                    />
                )}
                <BoxActions label={label} menuContent={menu} keepOpen />
            </div>
            <div className="capability-overview-scroll">
                {children(view, { "data-size": TABLE_SIZES[tableSize].id, style: { "--table-font": TABLE_SIZES[tableSize].font, "--table-pad": TABLE_SIZES[tableSize].pad } as CSSProperties })}
            </div>
        </div>
    );
}
