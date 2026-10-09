import type { ReactNode } from "react";
import type { ChannelResourceRow, ChannelResourceTable as Table } from "../../framework/engine/ChannelResourceTable.ts";
import { markTint } from "../../framework/engine/ActionOrder.ts";
import type { ActionLit } from "./ActionMarkers.tsx";

import "../../styles/channel-resource-table.css";

/*
    THE CHANNEL RESOURCES TABLE (ChannelResourceTable.ts): a Segment's
    resources in one read-only table under its Customer Channel table.
    Derived live, never stored, never counted. Each resource's name opens
    its Resource card on 3. Infrastructure & Capability; each "#12" goes
    to that action's line in the table above. The Channel cell lists the
    channel the resource was made on first and each other channel it shows
    in through an action after it.

    A cell holding two or more values (channels, offerings, journey stages)
    lists them one under the other as bullets, all styled alike; a single value
    is plain text indented to where the bullets' text starts, so the text of a
    column begins at one x. The Actions cell has no bullets: its "#12" buttons
    sit side by side, wrap between buttons and never inside one.

    Drawn on the Customer Channel table's ground and edges (head, hairlines,
    rounded corners), with a column of its own per fact. The table sizes its
    own cells; text wraps, and only a window too narrow for the columns
    scrolls the table inside its own box.
*/

const DASH = "—";

export interface ChannelResourceTableProps {
    table: Table;
    /** "Lumen & Loom": the Segment, for the caption and the controls' names. */
    segmentName: string;
    onOpenCard?: (row: ChannelResourceRow) => void;
    onOpenAction?: (actionId: string) => void;
    /** Pointing at a row lights its actions in the Customer Channel table. */
    onLit?: (lit: ActionLit) => void;
}

/** Two or more values as a bullet list, one under the other, all alike; one value
 *  as plain text indented to where the bullets' text starts, so the text of a
 *  column begins at one x. */
function Values({ items }: { items: { key: string; node: ReactNode }[] }) {
    if (items.length === 0) {
        return <>{DASH}</>;
    }
    if (items.length === 1) {
        return <span className="channel-resource-single">{items[0].node}</span>;
    }
    return (
        <ul className="channel-resource-list channel-resource-bullets">
            {items.map(item => <li key={item.key}>{item.node}</li>)}
        </ul>
    );
}

/** The action buttons: no bullets, side by side and wrapping, each one line. */
function Chips({ items }: { items: { key: string; node: ReactNode }[] }) {
    if (items.length === 0) {
        return <>{DASH}</>;
    }
    return (
        <ul className="channel-resource-list channel-resource-chips">
            {items.map(item => <li key={item.key}>{item.node}</li>)}
        </ul>
    );
}

export default function ChannelResourceTable({ table, segmentName, onOpenCard, onOpenAction, onLit }: ChannelResourceTableProps) {

    const { rows, summaryText, summary } = table;

    return (
        <div className="channel-resource-block">

            <div className="channel-resource-table-wrap">

                <table className="channel-resource-table">

                    <caption>
                        {"Channel resources of " + segmentName + ": each resource, what it costs and the actions it serves. Generated from the channels above."}
                    </caption>

                    <thead>
                        <tr>
                            <th scope="col" className="channel-resource-col-resource">Resource</th>
                            <th scope="col" className="channel-resource-col-cost">Cost</th>
                            <th scope="col" className="channel-resource-col-behaviour">Behaviour</th>
                            <th scope="col" className="channel-resource-col-channel">Channel</th>
                            <th scope="col" className="channel-resource-col-offerings">Offerings</th>
                            <th scope="col" className="channel-resource-col-stages">Journey stages</th>
                            <th scope="col" className="channel-resource-col-actions">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map(row => (
                            <tr
                                key={row.resourceId}
                                className={"channel-resource-row " + markTint("resource", row.colour)}
                                onMouseEnter={() => onLit?.({ kind: "resources", ids: row.linkIds })}
                                onMouseLeave={() => onLit?.(null)}
                            >

                                <th scope="row" className="channel-resource-name">
                                    <button
                                        type="button"
                                        className="channel-resource-open"
                                        disabled={!onOpenCard}
                                        title={"Open " + row.name + " on 3. Infrastructure & Capability"}
                                        onClick={() => onOpenCard?.(row)}
                                    >
                                        <span className="channel-resource-dot" aria-hidden="true" />
                                        <span>{row.name}</span>
                                    </button>
                                </th>

                                <td className="channel-resource-cost">
                                    <span>{row.costText}</span>
                                    {row.costDetail && <span className="channel-resource-detail">{" (" + row.costDetail + ")"}</span>}
                                </td>

                                <td className="channel-resource-behaviour">{row.behaviour || DASH}</td>

                                {/* Where it was made first, then each other channel it shows in. */}
                                <td>
                                    <Values items={[row.home, ...row.reaches].map(name => ({ key: name, node: name }))} />
                                </td>

                                <td>
                                    <Values items={row.offerings.map(name => ({ key: name, node: name }))} />
                                </td>

                                <td>
                                    <Values items={row.stages.map(name => ({ key: name, node: name }))} />
                                </td>

                                <td>
                                    <Chips items={row.actions.map(action => ({
                                        key: action.id,
                                        node: (
                                            <button
                                                type="button"
                                                className="channel-resource-action"
                                                title={"#" + action.order + (action.text ? " " + action.text : "")}
                                                aria-label={"Go to action #" + action.order + (action.text ? ": " + action.text : "")}
                                                onClick={() => onOpenAction?.(action.id)}
                                            >
                                                {"#" + action.order}
                                            </button>
                                        )
                                    }))} />
                                </td>

                            </tr>
                        ))}
                    </tbody>

                </table>

            </div>

            <p className="channel-resource-summary">
                <span className="channel-resource-summary-label">{"Summary of the rows above (not a forecast): "}</span>
                {summaryText || "no cost counted yet"}
                {summary.notSummed > 0 && " · " + summary.notSummed + (summary.notSummed === 1 ? " resource" : " resources") + " not added up (another currency or frequency)"}
            </p>

        </div>
    );

}
