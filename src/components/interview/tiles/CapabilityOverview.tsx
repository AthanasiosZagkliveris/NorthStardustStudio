import { CSSProperties, useContext, useMemo, useState } from "react";
import TextLink from "../fields/TextLink.tsx";
import InfoNote from "../fields/InfoNote.tsx";
import RemoveButton from "../../controls/RemoveButton.tsx";
import NumberCell from "../../controls/NumberCell.tsx";
import SegmentedToggle from "../../controls/SegmentedToggle.tsx";
import FoldArrow from "../fields/FoldArrow.tsx";
import TileGrid from "./TileGrid.tsx";
import { BUSINESS_COST_FREQUENCIES, BUSINESS_RESOURCE_STATUSES } from "../../../framework/engine/AnswerUtils.ts";
import { OpenCardContext, plainTitle, tileName } from "./SectionTiles.tsx";
import CardTile, { Dots, SYMBOLS, inwardOrigin } from "./CardTile.tsx";
import "../../../styles/title-arrow.css";
import BoxActions from "../fields/ReorderControls.tsx";
import { BusinessTicks } from "../cards/BusinessCardFields.tsx";
import OptionPicker from "../fields/OptionPicker.tsx";
import {
    DEFAULT_FLOOR_FILTER,
    FLOOR_KINDS,
    FLOOR_SORTS,
    FloorFilter,
    FloorKind,
    FloorType,
    FloorLink,
    FloorRow,
    filterFloor,
    kindClass,
    FLOOR_PLACES,
    floorGroups,
    floorPlaceKinds,
    floorCategories,
    floorSubgroups,
    sortFloor,
    subgroupOf,
    tileLines,
    tileMarks
} from "./capabilityFloor.ts";
import "../../../styles/capability-overview.css";

/*
    ALL THE TILES IN ONE GRID (Page 3, the "Inventory" tile beside Completed). Its dialog lists every Resource, Activity, Partner, Provider, the
    Workspace, the Founders and the Legal Entity's expenses as tiles of the page's own make (the same tile, the same size, the same text sizes, TileFace),
    each in the colour of the section it stands in on the page (Infrastructure, Offering's Capability, a Customer Channel's teal; a legal expense in the
    Legal Entity's neutral card ground). A tile says, as labelled lines, where it belongs (Section, Group, Subgroup), then its status and its cost, and
    carries a small coloured dot for each link (an activity it made, a Partner, a Provider). The funnel at the top right holds every
    filter (what to include, where it belongs -- several places at once, each row in exactly one --, status, payment frequency, cost range, connected
    only) and the orders. Pressing a tile opens its card floating (OpenCardContext); a legal expense belongs to the Identity System, so its tile is only shown.
*/

// (The Workspace and the Founders ARE resources: their kind reads "Resource"; Include still lets the user toggle each of them.)
/** "Partners & Suppliers" is ONE option of the funnel: it stands for the two kinds. */
const UNITED = "partners-providers";
const toOptionIds = (kinds: Iterable<string>): string[] => {
    const set = new Set(kinds);
    return [...set].filter(kind => kind !== "partner" && kind !== "provider").concat(set.has("partner") && set.has("provider") ? [UNITED] : []);
};
const fromOptionIds = (ids: readonly string[]): string[] => ids.flatMap(id => id === UNITED ? ["partner", "provider"] : [id]);

/** A Status or Frequency cell of the funnel: the app's own dropdown, as wide as its longest option (the list the same width), not stretched. */
function FunnelPicker({ label, options, value, onChange }: { label: string; options: readonly { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
    const any = "Any";
    const labels = [any, ...options.map(option => option.label)];
    return (
        <OptionPicker
            label={label}
            placeholder={any}
            hug
            tight
            options={labels}
            sizeFor={labels}
            value={options.find(option => option.id === value)?.label ?? any}
            onChange={(next) => onChange(options.find(option => option.label === next)?.id ?? "")}
        />
    );
}

/** A block's label in the funnel and its fold arrow (the title arrow of the section cards): the block is shown while the arrow points down. */
function MenuHead({ title, open, onToggle, controls }: { title: string; open: boolean; onToggle: () => void; controls?: string }) {
    return (
        <div className="capability-overview-menu-head">
            <strong>{title}</strong>
            <FoldArrow variant="label" open={open} controls={controls} name={(open ? "Fold " : "Unfold ") + title} onToggle={onToggle} />
        </div>
    );
}

/** The Types a place offers in the funnel: Partners and Suppliers are ONE option (whichever of the two the place has), the Channel's cards are "Channel". */
function placeKindOptions(kinds: readonly FloorType[]): { id: string; label: string }[] {
    const options: { id: string; label: string }[] = [];
    for (const kind of kinds) {
        const option = kind === "partner" || kind === "provider" ? { id: UNITED, label: "Partners & Suppliers" } : kind === "channel" ? { id: kind, label: "Channel" } : { id: kind, label: FLOOR_KINDS.find(entry => entry.id === kind)?.label ?? kind };
        if (!options.some(entry => entry.id === option.id)) {
            options.push(option);
        }
    }
    return options;
}

const SECTION_OF_KIND: Record<FloorKind, string> = {
    founder: "Founders", resource: "Resources", activity: "Activities", partner: "Partners & Suppliers", provider: "Partners & Suppliers", legal: ""
};

const kindName = (row: FloorRow) => FLOOR_KINDS.find(kind => kind.id === kindClass(row))?.one ?? "";

/**
 * The lines of the table for one tile: its cost (the amount and its frequency), and -- for a tile with a second cost, a Workspace's deposit -- a second line
 * for that one, its cost followed by "Deposit" (one-time), the name repeated beside it. A Legal Entity expense is only a Section ("Legal Entity"), a Type
 * ("Expense"), its name, cost and frequency.
 */
export function tableRows(row: FloorRow, format: (amount: number) => string = String, organisationCurrency = "") {
    const legal = row.kind === "legal";
    const base = {
        type: legal ? "Expense" : kindName(row),
        section: legal ? "Legal Entity" : row.path[0] === "Infrastructure" ? "Infrastructure" : "Offering",
        // (An activity's category is the third line of its path; a Customer Channel's card has the group "Channel".)
        category: legal ? "" : row.kind === "activity" ? row.path[2] ?? "" : row.path[1] ?? "",
        group: legal ? "" : subgroupOf(row),
        status: legal ? "" : row.statusLabel
    };
    // (The currency is written once, in the column's header; a cost in another currency than the organisation's says its own code.)
    const own = row.currency && row.currency !== organisationCurrency ? row.currency + " " : "";
    const lines = [{ ...base, cost: row.amount !== null ? own + format(row.amount) : "", frequency: row.frequencyLabel, nature: row.nature ?? "", behaviour: row.behaviour ?? "" }];
    if (row.deposit) {
        const deposit = { ...base, cost: own + format(row.deposit) + " Deposit", frequency: "One-time", nature: row.nature ?? "", behaviour: row.behaviour ?? "" };
        if (row.amount === null) {
            lines[0] = deposit;
        } else {
            lines.push(deposit);
        }
    }
    return lines;
}

/** The table's columns after Name (Name is always shown): id, heading, and the cell's text from a line. */
export const TABLE_COLUMNS = [
    { id: "type", label: "Type" },
    { id: "section", label: "Section" },
    { id: "category", label: "Category" },
    { id: "group", label: "Group" },
    { id: "cost", label: "Cost" },
    { id: "frequency", label: "Frequency" },
    { id: "nature", label: "Cost Nature" },
    { id: "behaviour", label: "Behaviour" },
    { id: "status", label: "Status" },
    { id: "linked", label: "Linked" }
] as const;

/** The text sizes of the table: three steps of the type scale (14, 18 and 24px), with the row padding that goes with each. */
export const TABLE_SIZES = [
    { id: "small", font: "var(--font-small)", pad: "4px" },
    { id: "body", font: "var(--font-body)", pad: "7px" },
    { id: "large", font: "var(--font-h3)", pad: "10px" }
] as const;

/** A number for the table's Cost column: no currency sign (the header says it), at most two decimals. */
const plainAmount = (amount: number) => amount.toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function CapabilityOverview({ rows, format = String, currency = "", onOpenLegal }: { rows: readonly FloorRow[]; format?: (amount: number) => string; currency?: string; /** Opens a legal expense's card (it floats here, over this page): without it a legal tile is shown, not opened. */ onOpenLegal?: (id: string) => void }) {

    const openCard = useContext(OpenCardContext);
    const [view, setView] = useState<"tiles" | "table">("tiles");
    const [filter, setFilter] = useState<FloorFilter>(DEFAULT_FLOOR_FILTER);
    // Which blocks of the funnel are folded (Include, Sort, Belongs to): all folded at first, and as the user left them while the overview stays.
    const [folded, setFolded] = useState<ReadonlySet<string>>(new Set(["include", "sort", "belongs", "columns"]));
    // The table: the columns hidden and the text size (the middle step, the body size), kept while the overview stays open.
    const [hiddenColumns, setHiddenColumns] = useState<ReadonlySet<string>>(new Set());
    const [tableSize, setTableSize] = useState(() => typeof window !== "undefined" && window.innerWidth < 1900 ? 0 : 1);
    const toggleFold = (block: string) => setFolded(current => {
        const next = new Set(current);
        if (!next.delete(block)) {
            next.add(block);
        }
        return next;
    });
    // The legend's circle pressed: only the tiles with that connection. A tile's circle pressed: only that tile and what it is connected to.
    const [connection, setConnection] = useState<"" | FloorLink["type"]>("");
    const [focus, setFocus] = useState<{ id: string; name: string } | null>(null);

    const placeKinds = useMemo(() => floorPlaceKinds(rows, filter.place), [rows, filter.place]);
    const groups = useMemo(() => floorGroups(rows, filter.place), [rows, filter.place]);
    // Step 3: the categories of the kinds ticked (all four while none is ticked).
    const categories = useMemo(() => floorCategories(rows, filter.place, filter.placeKinds), [rows, filter.place, filter.placeKinds]);
    // Step 4: the groups (subsections) of the categories ticked, and only of those.
    const subgroups = useMemo(() => floorSubgroups(rows, filter.place, filter.categories), [rows, filter.place, filter.categories]);
    const shown = useMemo(() => {
        let list = sortFloor(filterFloor(rows, filter), filter.sort);
        if (connection !== "") {
            list = list.filter(row => row.links.some(link => link.type === connection));
        }
        if (focus) {
            const keep = new Set<string>([focus.id]);
            rows.forEach(row => {
                if (row.id === focus.id) {
                    row.links.forEach(link => keep.add(link.id));
                } else if (row.links.some(link => link.id === focus.id)) {
                    keep.add(row.id);
                }
            });
            list = list.filter(row => keep.has(row.id));
        }
        return list;
    }, [rows, filter, connection, focus]);

    const patch = (next: Partial<FloorFilter>) => setFilter(current => ({ ...current, ...next }));

    const open = (row: FloorRow, pointer: boolean) => {
        if (row.kind === "legal") {
            onOpenLegal?.(row.id);
        } else {
            // (The box name above the card is the card's own section -- Founders, Resources, Activities, Partners & Suppliers -- not "Inventory".)
            openCard?.(row.id, SECTION_OF_KIND[kindClass(row)], undefined, pointer, false);
        }
    };

    const menu = (
        <div className="capability-overview-menu" role="group" aria-label="Filters">
            <div className="capability-overview-menu-group">
                <MenuHead title="Include" open={!folded.has("include")} onToggle={() => toggleFold("include")} controls="funnel-include" />
                {/* Founders above Resources (the Workspace is within Resources), Partners & Suppliers one option. */}
                {!folded.has("include") && <div className="capability-overview-menu-body" id="funnel-include"><BusinessTicks
                    name="Include"
                    options={[
                        { id: "founder", label: "Founders" },
                        { id: "resource", label: "Resources" },
                        { id: "activity", label: "Activities" },
                        { id: UNITED, label: "Partners & Suppliers" },
                        { id: "legal", label: "Legal expenses" }
                    ]}
                    chosen={toOptionIds(filter.kinds)}
                    onChange={(next) => patch({ kinds: new Set(fromOptionIds(next) as FloorKind[]) })}
                /></div>}
            </div>
            {/* SORT, the second block: the orders (the cost orders are the arrows beside Costs). */}
            <div className="capability-overview-menu-group">
                <MenuHead title="Sort" open={!folded.has("sort")} onToggle={() => toggleFold("sort")} controls="funnel-sort" />
                {!folded.has("sort") && (
                    <div className="capability-overview-menu-body capability-overview-menu-orders" id="funnel-sort" role="group" aria-label="Sort">
                        {FLOOR_SORTS.filter(sort => !sort.id.startsWith("cost")).map(sort => (
                            <button
                                key={sort.id}
                                type="button"
                                className="strategy-sort-option"
                                role="menuitem"
                                onClick={() => patch({ sort: sort.id })}
                            >
                                <span className="strategy-sort-bullet" aria-hidden="true">{filter.sort === sort.id ? "•" : ""}</span>
                                {sort.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="capability-overview-menu-group">
                <MenuHead title="Belongs to" open={!folded.has("belongs")} onToggle={() => toggleFold("belongs")} controls="funnel-belongs" />
                {!folded.has("belongs") && <div className="capability-overview-menu-body" id="funnel-belongs">
                {/* Step 1: ONE place (the ticked one; ticking another moves the tick, ticking it again clears: all). Changing it clears step 2. */}
                <BusinessTicks
                    name="Belongs to"
                    options={FLOOR_PLACES.map(place => ({ id: place.id, label: place.label }))}
                    chosen={filter.place === "" ? [] : [filter.place]}
                    onChange={(next) => {
                        const now = next.filter(id => id !== filter.place)[0] ?? "";
                        patch({ place: now as FloorFilter["place"], groups: [], categories: [], subgroups: [], placeKinds: [] });
                    }}
                />
                {/* Step 2: the kinds that place has (several can be ticked). */}
                {filter.place !== "" && placeKinds.length > 0 && (
                    <div className="capability-overview-menu-sub">
                        <strong>Type</strong>
                        <BusinessTicks
                            name="Type"
                            options={placeKindOptions(placeKinds)}
                            chosen={toOptionIds(filter.placeKinds)}
                            onChange={(ids) => {
                                const next = fromOptionIds(ids) as FloorType[];
                                patch({
                                    placeKinds: next,
                                    // A category of a type no longer ticked goes, and its groups with it.
                                    categories: filter.categories.filter(category => floorCategories(rows, filter.place, next).includes(category)),
                                    subgroups: next.length === 0 || next.includes("resource") ? filter.subgroups : []
                                });
                            }}
                        />
                    </div>
                )}
                {/* Step 3: the categories of the kinds ticked in that place. */}
                {/* (The Category list appears once a Type is ticked.) */}
                {filter.place !== "" && filter.placeKinds.length > 0 && categories.length > 0 && (
                    <div className="capability-overview-menu-sub capability-overview-menu-titles">
                        <strong>Category</strong>
                        <BusinessTicks
                            name="Category"
                            options={categories.map(category => ({ id: category, label: category }))}
                            chosen={filter.categories}
                            onChange={(next) => patch({
                                categories: next,
                                // Unticking a category clears its groups.
                                subgroups: filter.subgroups.filter(key => next.some(category => key.startsWith(category + "\u0001")))
                            })}
                        />
                    </div>
                )}
                {/* Step 4: only while a ticked category has groups, those of the ticked categories. */}
                {filter.place !== "" && subgroups.length > 0 && (
                    <div className="capability-overview-menu-sub capability-overview-menu-titles">
                        <strong>Group</strong>
                        <BusinessTicks
                            name="Group"
                            options={subgroups.map(entry => ({ id: entry.key, label: entry.label }))}
                            chosen={filter.subgroups}
                            onChange={(next) => patch({ subgroups: next })}
                        />
                    </div>
                )}
                {/* A place's other groups (a legal expense's), whatever is ticked. */}
                {filter.place !== "" && groups.length > 0 && (
                    <div className="capability-overview-menu-sub">
                        <strong>Group</strong>
                        <BusinessTicks
                            name="Group"
                            options={groups.map(group => ({ id: group, label: group }))}
                            chosen={filter.groups}
                            onChange={(next) => patch({ groups: next })}
                        />
                    </div>
                )}
                </div>}
            </div>
            {/* COLUMNS: which columns of the table are shown (Name always is). */}
            <div className="capability-overview-menu-group">
                <MenuHead title="Columns" open={!folded.has("columns")} onToggle={() => toggleFold("columns")} controls="funnel-columns" />
                {!folded.has("columns") && (
                    <div className="capability-overview-menu-body" id="funnel-columns">
                        <BusinessTicks
                            name="Column"
                            options={TABLE_COLUMNS.map(column => ({ id: column.id, label: column.label }))}
                            chosen={TABLE_COLUMNS.filter(column => !hiddenColumns.has(column.id)).map(column => column.id)}
                            onChange={(next) => setHiddenColumns(new Set(TABLE_COLUMNS.map(column => column.id).filter(id => !next.includes(id))))}
                        />
                    </div>
                )}
            </div>
            <div className="capability-overview-menu-group capability-overview-menu-fields">
                <label>
                    Status
                    <FunnelPicker
                        label="Status"
                        options={[...BUSINESS_RESOURCE_STATUSES.map(status => ({ id: status.id as string, label: status.label as string })), { id: "completed", label: "Completed" }]}
                        value={filter.status}
                        onChange={(status) => patch({ status })}
                    />
                </label>
                <label>
                    Frequency
                    <FunnelPicker
                        label="Frequency"
                        options={BUSINESS_COST_FREQUENCIES.map(entry => ({ id: entry.id as string, label: entry.label as string }))}
                        value={filter.frequency}
                        onChange={(frequency) => patch({ frequency })}
                    />
                </label>
                <BusinessTicks
                    name="Connected"
                    options={[{ id: "connected", label: "Linked" }]}
                    chosen={filter.connectedOnly ? ["connected"] : []}
                    onChange={(next) => patch({ connectedOnly: next.length > 0 })}
                />
            </div>
            {/* THE COSTS ISOLATED: switched on, only the tiles that have an expense are shown; under it the cost order and the cost range apply to them. */}
            <div className="capability-overview-menu-group capability-overview-costs" role="group" aria-label="Costs">
                <div className="capability-overview-costs-head">
                    <BusinessTicks
                        name="Costs"
                        options={[{ id: "costs", label: "Costs" }]}
                        chosen={filter.costsOnly ? ["costs"] : []}
                        onChange={(next) => {
                            patch({ costsOnly: next.length > 0 });
                            // (Isolating the costs hides Status and Linked from the table, the user can tick them back; turning it off shows them again.)
                            setHiddenColumns(current => {
                                const kept = new Set(current);
                                ["status", "linked"].forEach(column => next.length > 0 ? kept.add(column) : kept.delete(column));
                                return kept;
                            });
                        }}
                    />
                    {/* The cost order: two small arrow buttons beside the label -- up is low to high, down is high to low (the active one is pressed). */}
                    <SegmentedToggle
                        className="capability-overview-costs-order"
                        label="Cost order"
                        allowClear
                        options={[{ id: "cost-asc", label: "\u2191", name: "Low to high" }, { id: "cost-desc", label: "\u2193", name: "High to low" }]}
                        value={filter.sort === "cost-asc" || filter.sort === "cost-desc" ? filter.sort : ""}
                        onChange={(next) => patch({ sort: next === "" ? "page" : next })}
                    />
                </div>
                <div className="capability-overview-costs-range">
                    <label>
                        From
                        <NumberCell value={filter.min} onChange={(event) => patch({ min: event.target.value })} />
                    </label>
                    <label>
                        To
                        <NumberCell value={filter.max} onChange={(event) => patch({ max: event.target.value })} />
                    </label>
                </div>
            </div>
        </div>
    );

    return (
        <div className={"capability-overview" + (view === "table" ? " capability-overview-table-mode" : "")}>

            <div className="capability-overview-bar">
                <span className="capability-overview-count">{shown.length} of {rows.length}</span>
                {rows.some(row => row.missing) && (
                    <span className="capability-overview-incomplete">
                        {rows.filter(row => row.missing).length} incomplete
                        <InfoNote label="Incomplete" points={["A card that lacks a required answer is shown here, red, but counted nowhere else until it is fixed."]} />
                    </span>
                )}
                <SegmentedToggle
                    className="capability-overview-legend"
                    label="Show only tiles with a connection"
                    allowClear
                    options={(["activity", "partner", "provider", "resource"] as const).map(type => ({
                        id: type,
                        name: "Show only tiles connected to a " + SYMBOLS[type],
                        label: <><i className={"card-tile-symbol card-tile-symbol-" + type} aria-hidden="true" />{SYMBOLS[type]}</>
                    }))}
                    value={connection}
                    onChange={(next) => {
                        setFocus(null);
                        setConnection(next);
                    }}
                />
                {focus && (
                    <span className="capability-overview-chip">
                        {"Connected to " + focus.name}
                        <RemoveButton aria-label="Clear: show all tiles again" onClick={() => setFocus(null)} />
                    </span>
                )}
                <SegmentedToggle
                    className="capability-overview-views"
                    label="View"
                    options={[{ id: "tiles", label: "Tiles" }, { id: "table", label: "Table" }]}
                    value={view}
                    onChange={(next) => next && setView(next)}
                />
                {view === "table" && (
                    <SegmentedToggle
                        className="capability-overview-sizes"
                        label="Table text size"
                        options={TABLE_SIZES.map((size, at) => ({ id: size.id, label: ["S", "M", "L"][at], name: ["Smaller text", "Standard text", "Larger text"][at] }))}
                        value={TABLE_SIZES[tableSize].id}
                        onChange={(next) => { const at = TABLE_SIZES.findIndex(size => size.id === next); if (at >= 0) { setTableSize(at); } }}
                    />
                )}
                <BoxActions
                    label="all tiles (filter and sort)"
                    menuContent={menu}
                    keepOpen
                />
            </div>

            <div className="capability-overview-scroll">

            {shown.length === 0 && <p className="capability-overview-empty">Nothing matches.</p>}

            {view === "tiles" && shown.length > 0 && (
                <TileGrid label="Inventory" bare>
                    {({ across }) => shown.map((row, index) => {
                        // (A tile's circle isolates that tile and what it is connected to; any isolation by the legend's circles goes, so the two never add up.)
                        const onFocus = () => {
                            setConnection("");
                            setFocus(current => current?.id === row.id ? null : { id: row.id, name: row.name });
                        };
                        return (
                            <CardTile
                                key={row.kind + row.id}
                                id={row.id}
                                name={row.name}
                                lines={tileLines(row, format)}
                                marks={tileMarks(row, tileLines(row, format))}
                                links={row.links}
                                tone={row.tone}
                                missing={row.missing}
                                inactive={row.status === "completed"}
                                label={kindName(row) + ": " + tileName(plainTitle(row.name), tileLines(row, format))}
                                title={row.kind === "legal" && !onOpenLegal ? "Recorded under 1. Identity System, Legal Entity" : undefined}
                                origin={inwardOrigin(index, shown.length, across)}
                                onOpen={row.kind === "legal" && !onOpenLegal ? undefined : (pointer) => open(row, pointer)}
                                focusId={focus?.id ?? null}
                                onFocus={row.links.length > 0 ? onFocus : undefined}
                            />
                        );
                    })}
                </TileGrid>
            )}

            {view === "table" && shown.length > 0 && (
                <table
                    className="capability-overview-table"
                    data-size={TABLE_SIZES[tableSize].id}
                    style={{ "--table-font": TABLE_SIZES[tableSize].font, "--table-pad": TABLE_SIZES[tableSize].pad } as CSSProperties}
                >
                    <thead>
                        <tr>
                            <th scope="col" data-col="name">Name</th>
                            {TABLE_COLUMNS.filter(column => !hiddenColumns.has(column.id)).map(column => (
                                <th scope="col" key={column.id} data-col={column.id} className={column.id === "cost" ? "capability-overview-number" : undefined}>
                                    {column.id === "cost" && currency ? column.label + " (" + currency + ")" : column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {shown.flatMap(row => tableRows(row, plainAmount, currency).map((line, at) => (
                            <tr key={row.kind + row.id + ":" + at} className={at > 0 ? "capability-overview-table-extra" : undefined}>
                                <th scope="row" data-col="name">
                                    {at > 0 || row.kind === "legal"
                                        ? row.name
                                        : <TextLink className="capability-overview-name" onClick={(event) => open(row, event.detail > 0)}>{row.name}</TextLink>}
                                </th>
                                {TABLE_COLUMNS.filter(column => !hiddenColumns.has(column.id)).map(column => column.id === "linked"
                                    ? (
                                        <td key={column.id} data-col="linked">
                                            {at === 0 && (
                                                <Dots
                                                    id={row.id}
                                                    name={row.name}
                                                    links={row.links}
                                                    focusId={focus?.id ?? null}
                                                    onFocus={row.links.length > 0 ? () => {
                                                        setConnection("");
                                                        setFocus(current => current?.id === row.id ? null : { id: row.id, name: row.name });
                                                    } : undefined}
                                                />
                                            )}
                                        </td>
                                    )
                                    : <td key={column.id} data-col={column.id} className={column.id === "cost" ? "capability-overview-number" : undefined}>{line[column.id]}</td>)}
                            </tr>
                        )))}
                    </tbody>
                </table>
            )}

            </div>

        </div>
    );

}
