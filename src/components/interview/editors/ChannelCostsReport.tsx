import { useState } from "react";
import type { ChannelResourceTable as Table } from "../../../framework/engine/ChannelResourceTable.ts";
import ChannelResourceTable, { type ChannelResourceTableProps } from "./ChannelResourceTable.tsx";
import ReportFrame from "../tiles/ReportFrame.tsx";
import MenuHead from "../tiles/MenuHead.tsx";
import CardBoxes, { type CardBox } from "../cards/CardBoxes.tsx";
import { BusinessTicks } from "../cards/BusinessCardFields.tsx";

/**
 * CHANNEL COSTS AS A REPORT (owner, 2026-11-12 17:33 and 17:53: "Channel Costs are reports, so it should follow a layout similar to the inventory"; "the same size as
 * the inventory, and similar User interface"): the Inventory's frame (ReportFrame) -- the count, Tiles or Table, the table's three text sizes, the funnel -- over a
 * Segment's channel expenses. The table is the channel resources table as it was, every column kept; the tiles name each expense with its cost, its channel and how
 * it behaves. The funnel's blocks start folded, as the Inventory's: Channel, Behaviour, Journey stage.
 */
export default function ChannelCostsReport({ table, segmentName, onOpenCard, onOpenAction, onLit }: Omit<ChannelResourceTableProps, "table"> & { table: Table }) {
    const [folded, setFolded] = useState<ReadonlySet<string>>(new Set(["channel", "behaviour", "stage"]));
    const [channels, setChannels] = useState<string[]>([]);
    const [behaviours, setBehaviours] = useState<string[]>([]);
    const [stages, setStages] = useState<string[]>([]);
    const toggleFold = (block: string) => setFolded(current => {
        const next = new Set(current);
        if (!next.delete(block)) {
            next.add(block);
        }
        return next;
    });

    // (Each block lists only what the rows hold; nothing ticked shows every row.)
    const channelOf = (row: Table["rows"][number]) => row.placesOf.map(place => place.channel);
    const allChannels = [...new Set(table.rows.flatMap(channelOf))];
    const allBehaviours = [...new Set(table.rows.map(row => row.behaviour).filter(Boolean))];
    const allStages = [...new Set(table.rows.flatMap(row => row.stages))];
    const shown = table.rows.filter(row =>
        (channels.length === 0 || channelOf(row).some(channel => channels.includes(channel))) &&
        (behaviours.length === 0 || behaviours.includes(row.behaviour)) &&
        (stages.length === 0 || row.stages.some(stage => stages.includes(stage))));
    const filtered = shown.length !== table.rows.length;

    const block = (id: string, title: string, options: string[], chosen: string[], onChange: (next: string[]) => void) => options.length > 0 && (
        <div className="capability-overview-menu-group">
            <MenuHead title={title} open={!folded.has(id)} onToggle={() => toggleFold(id)} controls={"channel-costs-" + id} />
            {!folded.has(id) && (
                <div className="capability-overview-menu-body" id={"channel-costs-" + id}>
                    <BusinessTicks name={title} options={options.map(option => ({ id: option, label: option }))} chosen={chosen} onChange={onChange} />
                </div>
            )}
        </div>
    );
    const menu = (
        <div className="capability-overview-menu" role="group" aria-label="Filters">
            {block("channel", "Channel", allChannels, channels, setChannels)}
            {block("behaviour", "Behaviour", allBehaviours, behaviours, setBehaviours)}
            {block("stage", "Journey stage", allStages, stages, setStages)}
        </div>
    );

    const boxes: CardBox[] = shown.map((row, at) => ({
        id: row.resourceId,
        number: at + 1,
        name: row.name,
        unnamed: "Unnamed expense",
        lines: [row.costText, row.home, row.behaviour].filter(Boolean),
        own: true,
        press: onOpenCard ? () => onOpenCard(row) : undefined,
        content: () => null
    }));

    return (
        <ReportFrame count={shown.length + " of " + table.rows.length} label="channel expenses" group="channel-costs" menu={menu}>
            {(view, style) => view === "tiles"
                ? (shown.length === 0 ? <p className="capability-overview-empty">Nothing matches.</p> : <CardBoxes items={boxes} label={"Channel expenses of " + segmentName} what="Channel expense" autoStart={false} />)
                // (The table as it was, its text the size chosen; filtered, its summary is left out: it adds up every row.)
                : <div {...style}><ChannelResourceTable table={filtered ? { ...table, rows: shown } : table} summary={!filtered} segmentName={segmentName} onOpenCard={onOpenCard} onOpenAction={onOpenAction} onLit={onLit} /></div>}
        </ReportFrame>
    );
}
