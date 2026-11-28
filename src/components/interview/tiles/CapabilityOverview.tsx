import { NUMBER_LIMITS, limitedNumberText } from "../fields/numberInput.ts";
import { BUSINESS_JOURNEY_STAGES } from "../../../framework/engine/businessFoundation/engagementPage.ts";
import { labelWithCurrency } from "../../../framework/engine/financial/Currencies.ts";
import { referralOnly } from "../../../framework/engine/DemandCapacity.ts";
import { CSSProperties, Fragment, ReactNode, useContext, useMemo, useState } from "react";
import TextLink from "../fields/TextLink.tsx";
import InfoNote, { InfoText } from "../fields/InfoNote.tsx";
import RemoveButton from "../../controls/RemoveButton.tsx";
import NumberCell from "../../controls/NumberCell.tsx";
import MenuOption from "../../controls/MenuOption.tsx";
import FoldArrow from "../fields/FoldArrow.tsx";
import MenuHead from "./MenuHead.tsx";
import TileGrid from "./TileGrid.tsx";
import ReportFrame from "./ReportFrame.tsx";
import { BUSINESS_COST_FREQUENCIES, BUSINESS_RESOURCE_STATUSES } from "../../../framework/engine/answers/AnswerUtils.ts";
import { OpenCardContext, plainTitle, tileName } from "./SectionTiles.tsx";
import CardTile, { Dots, SYMBOLS, inwardOrigin, toneHue } from "./CardTile.tsx";
import "../../../styles/title-arrow.css";
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
    isPercentRow,
    amountText,
    floorPlaceKinds,
    floorCategories,
    floorSubgroups,
    sortFloor,
    subgroupOf,
    tileLines,
    tileMarks,
    placeOf, floorColumnHasData } from "./capabilityFloor.ts";
import "../../../styles/capability-overview.css";
import { Chips, Values } from "../editors/ChannelResourceTable.tsx";
import { markTint } from "../../../framework/engine/ActionOrder.ts";

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
            keepWidth
            tight
            options={labels}
            sizeFor={labels}
            value={options.find(option => option.id === value)?.label ?? any}
            onChange={(next) => onChange(options.find(option => option.label === next)?.id ?? "")}
        />
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
 * A SHARE OF REVENUE AS THE FORECAST CHARGES IT (owner, 2026-11-16): the Channel Fee Table's row a card's name takes -- commission and chargebacks, and the fixed fee per
 * order -- or, with none, the card's own rate. A fixed fee in another currency is shown in its own currency and left out of the totals (note).
 */
interface ChargedFee {
    /** The percentage of the revenue (commission + chargeback, or the card's own rate). */
    percent: number;
    /** The fixed fee per order, in the organisation's currency; 0 where there is none, or it is in another currency. */
    perOrder: number;
    /** The fee as the Cost column says it: "2.9% + 0.20 an order". */
    text: string;
    /** "The $0.50 per order is in US dollars, so the totals leave it out."; null for a fee in the organisation's currency. */
    note: string | null;
}

/**
 * The lines of the table for one tile: its cost (the amount and its frequency), and -- for a tile with a second cost, a Workspace's deposit -- a second line
 * for that one, its cost followed by "Deposit" (one-time), the name repeated beside it. A Legal Entity expense is only a Section ("Legal Entity"), a Type
 * ("Expense"), its name, cost and frequency.
 */
export function tableRows(row: FloorRow, format: (amount: number) => string = String, organisationCurrency = "", fee?: ChargedFee | null) {
    const legal = row.kind === "legal";
    const base = {
        type: legal ? "Legal expense" : kindName(row),
        // (The funnel's names: Legal, Infrastructure, Offering -- placeOf, as Belongs to files the row.)
        section: FLOOR_PLACES.find(place => place.id === placeOf(row))?.label ?? "",
        // (An activity's category is the third line of its path; a Customer Channel's card has the group "Channel".)
        category: legal ? "" : row.kind === "activity" ? row.path[2] ?? "" : row.path[1] ?? "",
        // (A card a channel holds has the group "Channel": the channel's own name follows it, in the Group column.)
        group: legal ? "" : [subgroupOf(row), ...(row.channels ?? [])].filter(Boolean).join(" · "),
        status: legal ? "" : row.statusLabel
    };
    // (The currency is written once, in the column's header; a cost in another currency than the organisation's says its own code.)
    const own = row.currency && row.currency !== organisationCurrency ? row.currency + " " : "";
    // (A channel expense's Offerings, journey stages and actions: the columns of the Channel Costs set-up.)
    const channel = {
        offering: (row.channel?.offerings ?? []).join(", "),
        journey: (row.channel?.stages ?? []).join(", "),
        actions: (row.channel?.actions ?? []).map(action => "#" + action.order).join(", "),
        // (Each Offering's share, in the Offering column's order: shareLines; drawn by its cell.)
        share: ""
    };
    // (A share of revenue is a percentage: "2%", never in the currency's column as money.)
    // (With the Channel Fee Table's row, the whole fee as the forecast charges it: "2.9% + 0.20 an order".)
    const lines = [{ ...base, ...channel, cost: isPercentRow(row) && fee ? fee.text : row.amount !== null ? (isPercentRow(row) ? amountText(row.amount) + "%" : own + format(row.amount)) : "", frequency: row.frequencyLabel, nature: row.nature ?? "", behaviour: row.behaviour ?? "" }];
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
    // (A channel expense's Offerings, journey stages and actions: off until ticked, or set by the Channel Costs set-up; owner, 2026-11-12 18:41.)
    { id: "offering", label: "Offering" },
    // (Each Offering's share of the cost, beside the Offering column and shown only with it: owner, 2026-11-14 09:31; with the cost it comes to, "Cost per
    // Offering": 13:54.)
    { id: "share", label: "Cost per Offering" },
    { id: "journey", label: "Journey" },
    { id: "actions", label: "Actions" },
    { id: "linked", label: "Linked" }
] as const;

/** The columns off at first: the channel expenses' own. */
const HIDDEN_AT_FIRST = ["offering", "share", "journey", "actions"];

/** The share of a row's cost each Offering carries, in the Offering column's order: the card's own shares, or -- a channel expense's -- equal shares of its Offerings. */
export function shareLines(row: FloorRow, offerings: readonly { id: string; name: string }[], wholeRevenue: Readonly<Record<string, number>> = {}, sourceRevenue: Readonly<Record<string, Readonly<Record<string, number>>>> = {}, fee: ChargedFee | null = null, orderValue: Readonly<Record<string, number>> = {}, payingRevenue?: Readonly<Record<string, Readonly<Record<string, number>>>>): { name: string; percent: string; fraction: number; cost: number | null }[] {
    // (A FEE FOLLOWS WHERE THEY PAY, A COMMISSION ITS SOURCE (owner, 2026-11-17 09:09, option (a)): a share of revenue on referral and affiliate subchannels only
    // by what their Customer Sources make; any other by what is paid at its subchannels (offeringPayingRevenue), as the forecast charges it.)
    const channelRevenue = payingRevenue && !referralOnly((row.channel?.places ?? []).map(place => place.channel)) ? payingRevenue : sourceRevenue;
    // (A CHANNEL'S share of revenue -- a payment provider's, a marketplace's -- is split by what each Offering sells THROUGH the subchannels the expense belongs
    // to (owner, 2026-11-14 20:25); an Offering that sells nothing through them has no share. Where no Customer Source names them, by its whole revenue.)
    const places = (row.channel?.places ?? []).map(place => place.channel.trim() + "\u0001" + place.sub.trim());
    const through = Object.fromEntries(Object.entries(channelRevenue).map(([id, byPlace]) => [id, places.reduce((sum, key) => sum + (byPlace[key] ?? 0), 0)]).filter(([, amount]) => (amount as number) > 0)) as Record<string, number>;
    const byChannel = places.length > 0 && Object.keys(through).length > 0;
    const revenue = byChannel ? through : wholeRevenue;
    const named = (id: string) => offerings.find(offering => offering.id === id)?.name.trim() || "";
    const percent = (fraction: number) => (Math.round(fraction * 1000) / 10).toLocaleString(undefined, { maximumFractionDigits: 1 }) + "%";
    const own = !(row.offeringIds && row.offeringIds.length > 0);
    // (A channel expense names its Offerings: their ids, where the names are the Organisation's.)
    const ids = own
        ? (row.channel?.offerings ?? []).map(name => offerings.find(offering => offering.name.trim() === name)?.id ?? name)
        : [...row.offeringIds!];
    const nameOf = (id: string) => named(id) || (own ? id : "");
    // A SHARE OF REVENUE IS A RATE, NOT A SPLIT (owner, 2026-11-14 23:30: "70% of 2%, what % gives?"): every Offering it serves has a line of the rate and the
    // pounds it comes to -- "2% · 26.88", the rate x what that Offering sells a month through the expense's own subchannels; one that sells nothing there
    // "2% · 0". Where no Customer Source names those subchannels, the rate x its whole revenue a month; while that is still to come, "when sales are set".
    // THE WHOLE FEE (owner, 2026-11-16): the fee row's commission and chargebacks on the revenue and its fixed fee on each order (revenue / one order's value), as the
    // forecast charges it; an Offering that sells nothing through the expense's subchannels has no line.
    if (isPercentRow(row) && (row.amount !== null || fee)) {
        const percentOf = fee ? fee.percent : row.amount!;
        const rate = fee ? fee.text : percentOf.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "%";
        const charged = (id: string, amount: number) => amount * percentOf / 100 + (fee && (orderValue[id] ?? 0) > 0 ? amount / orderValue[id] * fee.perOrder : 0);
        const total = ids.reduce((sum, id) => sum + (revenue[id] ?? 0), 0);
        return ids.filter(id => !byChannel || (revenue[id] ?? 0) > 0).map(id => {
            const amount = revenue[id] ?? 0;
            const cost = amount > 0 ? charged(id, amount) : null;
            return { name: nameOf(id), percent: rate, fraction: total > 0 ? amount / total : 0, cost };
        }).filter(line => line.name !== "");
    }
    return ids.map(id => {
        // (A cost paid per unit is each Offering's in full, as the forecast charges it: its fraction 1; owner, 2026-11-16.)
        const fraction = own ? 1 / ids.length : row.offeringShares?.[id] ?? 1 / ids.length;
        return { name: nameOf(id), percent: percent(fraction), fraction, cost: row.amount === null ? null : row.amount * fraction };
    }).filter(line => line.name !== "");
}

/**
 * COST PER OFFERING (owner, 2026-11-14 13:54 and 14:17): an Offering's share and the cost it comes to -- "50% · 12.50", with the Cost column's decimals; a
 * share of revenue the same, from that Offering's revenue a month, or its share and "when sales are set" while its sales or price are still to come.
 */
export function costPerOfferingText(row: FloorRow, line: { percent: string; cost: number | null }): string {
    if (line.cost !== null) {
        return line.percent + " · " + amountText(Math.round(line.cost * 100) / 100);
    }
    return isPercentRow(row) ? line.percent + " · when sales are set" : line.percent;
}

/**
 * THE CHANNEL COSTS SET-UP (owner, 2026-11-12 18:41: "an option for Channel expenses, that would set the table automatically with the proper set up"; 23:54: named Channel Costs, under the Costs): only
 * the cards a Customer Channel holds, the highest cost first, and the columns a channel expense is read by -- its Type (Channel under its own), its Group (the
 * channel over the subchannel), its cost, frequency and behaviour, its Offerings, journey stages and actions.
 */
const CHANNEL_SETUP = {
    filter: { channelsOnly: true, sort: "cost-desc" },
    hidden: ["section", "category", "nature", "status", "linked"]
} as const;

/** The text sizes of the table: three steps of the type scale (14, 18 and 24px), with the row padding that goes with each. */
export const TABLE_SIZES = [
    { id: "small", font: "var(--font-small)", pad: "4px" },
    { id: "body", font: "var(--font-body)", pad: "7px" },
    { id: "large", font: "var(--font-h3)", pad: "10px" }
] as const;

/** A number for the table's Cost column: no currency sign (the header says it), two decimals where it has any (amountText). */
const plainAmount = amountText;

/** The Offerings list's first tick: every Offering (no Offering chosen). */
const ALL_OFFERINGS = "*";

export default function CapabilityOverview({ rows, format = String, currency = "", onOpenLegal, onOpenAction, offerings = [], offeringRevenue = {}, offeringChannelRevenue = {}, offeringPayingRevenue, feeOf, orderValue = {} }: {
    rows: readonly FloorRow[];
    format?: (amount: number) => string;
    currency?: string;
    /** Opens a legal expense's card (it floats here, over this page): without it a legal tile is shown, not opened. */
    onOpenLegal?: (id: string) => void;
    /** An action's number pressed: that action, on the Customer Engagement page. */
    onOpenAction?: (actionId: string, segmentId: string) => void;
    /** The Organisation's Offerings (Page 1), for the Offerings list under Offering in Belongs to. */
    offerings?: readonly { id: string; name: string }[];
    /** Each Offering's revenue a month (offeringMonthlyRevenue): a share of revenue's split and cost per Offering. */
    offeringRevenue?: Readonly<Record<string, number>>;
    /** Each Offering's revenue a month through each subchannel (offeringChannelRevenue): a channel's share of revenue's split. */
    offeringChannelRevenue?: Readonly<Record<string, Readonly<Record<string, number>>>>;
    /** Each Offering's revenue a month paid at each subchannel (offeringPayingRevenue): a fee's split, where the customers pay. */
    offeringPayingRevenue?: Readonly<Record<string, Readonly<Record<string, number>>>>;
    /** A share of revenue's fee as the forecast charges it, from the Channel Fee Table (ChargedFee); null where no row takes the card's name. */
    feeOf?: (row: FloorRow) => ChargedFee | null;
    /** One order's value for each Offering (its price x items per order): the orders a fixed fee per order is charged on. */
    orderValue?: Readonly<Record<string, number>>;
}) {

    const openCard = useContext(OpenCardContext);
    const [filter, setFilter] = useState<FloorFilter>(DEFAULT_FLOOR_FILTER);
    // Which blocks of the funnel are folded (Include, Sort, Belongs to): all folded at first, and as the user left them while the overview stays.
    const [folded, setFolded] = useState<ReadonlySet<string>>(new Set(["include", "sort", "belongs", "columns"]));
    // The table: the columns hidden and the text size (the middle step, the body size), kept while the overview stays open.
    const [hiddenColumns, setHiddenColumns] = useState<ReadonlySet<string>>(new Set(HIDDEN_AT_FIRST));
    // (A column no row fills is neither offered under Columns nor drawn: floorColumnHasData.)
    const emptyColumns = useMemo(() => new Set(TABLE_COLUMNS.filter(column => !floorColumnHasData(column.id, rows)).map(column => column.id as string)), [rows]);
    const offColumn = (id: string) => hiddenColumns.has(id) || emptyColumns.has(id);
    /** The Channel Costs set-up switched on or off: on, its filter, order and columns; off, the Inventory as it opens. */
    // (Switched on, the set-up's filter, order and columns join the founder's own choices; off, those come back as they were: owner, 2026-11-13 16:50.)
    const [costsHid, setCostsHid] = useState<readonly string[]>([]);
    const [beforeSetup, setBeforeSetup] = useState<{ sort: string; hidden: ReadonlySet<string> } | null>(null);
    const setChannelSetup = (on: boolean) => {
        if (on) {
            setBeforeSetup({ sort: filter.sort, hidden: hiddenColumns });
            setFilter(current => ({ ...current, ...CHANNEL_SETUP.filter }));
            setHiddenColumns(new Set([...hiddenColumns, ...CHANNEL_SETUP.hidden].filter(column => !HIDDEN_AT_FIRST.includes(column) || CHANNEL_SETUP.hidden.includes(column as never))));
        } else {
            setFilter(current => ({ ...current, channelsOnly: false, sort: beforeSetup?.sort ?? DEFAULT_FLOOR_FILTER.sort }));
            setHiddenColumns(new Set(beforeSetup?.hidden ?? HIDDEN_AT_FIRST));
        }
        setConnection("");
        setFocus(null);
    };
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
    // (The Offerings a card of the Offering place serves, in Page 1's order.)
    const servedOfferings = offerings.filter(offering => rows.some(row => placeOf(row) === "offering" && (row.offeringIds ?? []).includes(offering.id)));
    // (The journey stages a channel uses a card of the Offering place at, in the journey's order.)
    const usedStages = BUSINESS_JOURNEY_STAGES.map(stage => stage.label as string).filter(label => rows.some(row => placeOf(row) === "offering" && (row.channel?.stages ?? []).includes(label)));
    // SMART OPTIONS (owner, 2026-11-14 20:08: "make the options smart ... The Delivery option should have been hidden"): an option stands only where choosing it,
    // with every other choice as it is, still lists a card -- the faceted search's way; a ticked one stays (shown, so it can be unticked) even where it lists none.
    const reaches = (next: Partial<FloorFilter>) => filterFloor(rows, { ...filter, ...next }).length > 0;

    const open = (row: FloorRow, pointer: boolean) => {
        if (row.kind === "legal") {
            onOpenLegal?.(row.id);
        } else {
            // (The box name above the card is the card's own section -- Founders, Resources, Activities, Partners & Suppliers -- not "Inventory".)
            openCard?.(row.partOf ?? row.id, SECTION_OF_KIND[kindClass(row)], undefined, pointer, false);
        }
    };

    const menuFor = (view: "tiles" | "table") => (
        <div className="capability-overview-menu" role="group" aria-label="Filters">
            {/* SHOW (owner, 2026-11-14 18:17: the side panel in three groups -- Show, Order, Table). */}
            <div className="capability-overview-menu-section" role="group" aria-label="Show">
                <p className="capability-overview-menu-section-title">Show</p>
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
                        ].filter(option => rows.some(row => option.id === UNITED ? row.kind === "partner" || row.kind === "provider" : row.kind === option.id))}
                        chosen={toOptionIds(filter.kinds)}
                        onChange={(next) => patch({ kinds: new Set(fromOptionIds(next) as FloorKind[]) })}
                    /></div>}
                </div>
                <div className="capability-overview-menu-group">
                    <MenuHead title="Belongs to" open={!folded.has("belongs")} onToggle={() => toggleFold("belongs")} controls="funnel-belongs" />
                    {!folded.has("belongs") && <div className="capability-overview-menu-body" id="funnel-belongs">
                    {/* Step 1: ONE place (the ticked one; ticking another moves the tick, ticking it again clears: all). Changing it clears step 2. */}
                    <BusinessTicks
                        name="Belongs to"
                        options={FLOOR_PLACES.filter(place => rows.some(row => placeOf(row) === place.id && filter.kinds.has(kindClass(row)))).map(place => ({ id: place.id, label: place.label }))}
                        chosen={filter.place === "" ? [] : [filter.place]}
                        onChange={(next) => {
                            const now = next.filter(id => id !== filter.place)[0] ?? "";
                            patch({ place: now as FloorFilter["place"], groups: [], categories: [], subgroups: [], placeKinds: [], offerings: [], stages: [] });
                        }}
                    />
                    {/* Step 2: the kinds that place has (several can be ticked) -- right after the place, as it applies to every place; the Offering's own lists follow it
                        (owner, 2026-11-14 17:44: "optimise the user interface side panel structure"). */}
                    {filter.place !== "" && placeKinds.length > 0 && (
                        <div className="capability-overview-menu-sub">
                            <strong>Type</strong>
                            <BusinessTicks
                                name="Type"
                                options={placeKindOptions(placeKinds.filter(kind => filter.placeKinds.includes(kind) || reaches({ placeKinds: [kind], categories: [], subgroups: [] })))}
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
                                options={categories.filter(category => filter.categories.includes(category) || reaches({ categories: [category], subgroups: [] })).map(category => ({ id: category, label: category }))}
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
                                options={subgroups.filter(entry => filter.subgroups.includes(entry.key) || reaches({ subgroups: [entry.key] })).map(entry => ({ id: entry.key, label: entry.label }))}
                                chosen={filter.subgroups}
                                onChange={(next) => patch({ subgroups: next })}
                            />
                        </div>
                    )}
                    {/* UNDER OFFERING, ITS OFFERINGS (owner, 2026-11-12 19:54: "Add Offerings list with the offering"): the Organisation's Offerings that a card here
                        serves, by name; ticked, only the cards that serve one of them. */}
                    {filter.place === "offering" && servedOfferings.length > 0 && (
                        <div className="capability-overview-menu-sub capability-overview-menu-titles">
                            <strong>Offerings</strong>
                            {/* ALL FIRST, TICKED UNTIL AN OFFERING IS (owner, 2026-11-13 16:12: "add an ALL option as default. So when clicking an offering the all
                                deactivates"): ticking an Offering leaves All, ticking All -- or unticking every Offering -- comes back to it. */}
                            <BusinessTicks
                                name="Offerings"
                                options={[{ id: ALL_OFFERINGS, label: "All" }, ...servedOfferings.filter(offering => filter.offerings.includes(offering.id) || reaches({ offerings: [offering.id] })).map(offering => ({ id: offering.id, label: offering.name.trim() || "Unnamed Offering" }))]}
                                chosen={filter.offerings.length > 0 ? filter.offerings : [ALL_OFFERINGS]}
                                onChange={(next) => patch({ offerings: next.includes(ALL_OFFERINGS) && !filter.offerings.includes(ALL_OFFERINGS) && filter.offerings.length > 0 ? [] : next.filter(id => id !== ALL_OFFERINGS) })}
                            />
                        </div>
                    )}
                    {/* UNDER OFFERING, ITS JOURNEY STAGES, as its Offerings (owner, 2026-11-14 11:51: "add Journey Stages (and the ALL as the default), make it to work
                        like the Offering"): the stages a channel uses a card here at; ticked, only those cards, and the Journey column names only the ticked stages. */}
                    {filter.place === "offering" && usedStages.length > 0 && (filter.placeKinds.length === 0 || filter.placeKinds.includes("channel")) && (
                        <div className="capability-overview-menu-sub capability-overview-menu-titles">
                            <strong>Journey Stages</strong>
                            <BusinessTicks
                                name="Journey Stages"
                                options={[{ id: ALL_OFFERINGS, label: "All" }, ...usedStages.filter(stage => filter.stages.includes(stage) || reaches({ stages: [stage] })).map(stage => ({ id: stage, label: stage }))]}
                                chosen={filter.stages.length > 0 ? filter.stages : [ALL_OFFERINGS]}
                                onChange={(next) => patch({ stages: next.includes(ALL_OFFERINGS) && !filter.stages.includes(ALL_OFFERINGS) && filter.stages.length > 0 ? [] : next.filter(id => id !== ALL_OFFERINGS) })}
                            />
                        </div>
                    )}
                    {/* A place's other groups (a legal expense's), whatever is ticked. */}
                    {filter.place !== "" && groups.length > 1 && (
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
                <div className="capability-overview-menu-group capability-overview-menu-fields">
                    <label>
                        Status
                        <FunnelPicker
                            label="Status"
                            options={[...BUSINESS_RESOURCE_STATUSES.map(status => ({ id: status.id as string, label: status.label as string })), { id: "completed", label: "Completed" }].filter(option => option.id === filter.status || reaches({ status: option.id }))}
                            value={filter.status}
                            onChange={(status) => patch({ status })}
                        />
                    </label>
                    <label>
                        Frequency
                        <FunnelPicker
                            label="Frequency"
                            options={[...BUSINESS_COST_FREQUENCIES.map(entry => ({ id: entry.id as string, label: entry.label as string })), { id: "other", label: "Other" }].filter(option => option.id === filter.frequency || reaches({ frequency: option.id }))}
                            value={filter.frequency}
                            onChange={(frequency) => patch({ frequency })}
                        />
                    </label>
                    {emptyColumns.has("linked") ? null : <BusinessTicks
                        name="Connected"
                        options={[{ id: "connected", label: "Linked" }]}
                        chosen={filter.connectedOnly ? ["connected"] : []}
                        onChange={(next) => patch({ connectedOnly: next.length > 0 })}
                    />}
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
                                // (Isolating the costs hides Status and Linked from the table, the user can tick them back; turning it off shows again only what it hid.)
                                setHiddenColumns(current => {
                                    const kept = new Set(current);
                                    if (next.length > 0) {
                                        const hid = ["status", "linked"].filter(column => !kept.has(column));
                                        hid.forEach(column => kept.add(column));
                                        setCostsHid(hid);
                                    } else {
                                        costsHid.forEach(column => kept.delete(column));
                                        setCostsHid([]);
                                    }
                                    return kept;
                                });
                            }}
                        />
                    </div>
                    {/* CHANNEL COSTS, directly under the Costs tick, above its range (owner, 2026-11-12 23:54; 2026-11-13 00:27: "I said under the costs!"): the Channel Costs set-up -- only the channel expenses, the highest cost first, the Offering,
                        Journey and Actions columns on; shown where there are channel expenses. */}
                    {rows.some(row => row.channel) && (
                        <BusinessTicks
                            name="Channel Costs"
                            options={[{ id: "channels", label: "Channel Costs" }]}
                            chosen={filter.channelsOnly ? ["channels"] : []}
                            onChange={(next) => setChannelSetup(next.length > 0)}
                        />
                    )}
                    {/* (From and To only while the costs are isolated: they compare the costs; owner, 2026-11-14 18:17, option c.) */}
                    {filter.costsOnly && (
                        <div className="capability-overview-costs-range">
                            <label>
                                From
                                <NumberCell value={filter.min} onChange={(event) => patch({ min: limitedNumberText(event.target.value, filter.min, NUMBER_LIMITS.money) })} />
                            </label>
                            <label>
                                To
                                <NumberCell value={filter.max} onChange={(event) => patch({ max: limitedNumberText(event.target.value, filter.max, NUMBER_LIMITS.money) })} />
                            </label>
                        </div>
                    )}
                </div>
            </div>
            {/* ORDER (owner, 2026-11-14 18:17: the side panel in three groups -- Show, Order, Table). */}
            <div className="capability-overview-menu-section" role="group" aria-label="Order">
                <p className="capability-overview-menu-section-title">Order</p>
                {/* SORT, the second block: the orders (the cost orders are the arrows beside Costs). */}
                <div className="capability-overview-menu-group">
                    <MenuHead title="Sort" open={!folded.has("sort")} onToggle={() => toggleFold("sort")} controls="funnel-sort" />
                    {!folded.has("sort") && (
                        <div className="capability-overview-menu-body capability-overview-menu-orders" id="funnel-sort" role="group" aria-label="Sort">
                            {FLOOR_SORTS.filter(sort => !sort.id.startsWith("cost") && (sort.id !== "status" || !emptyColumns.has("status")) && (sort.id !== "kind" || new Set(rows.map(kindClass)).size > 1) && (!sort.id.startsWith("date") || rows.some(row => row.start))).map(sort => (
                                <MenuOption key={sort.id} marked chosen={filter.sort === sort.id} onClick={() => patch({ sort: sort.id })}>
                                    {sort.label}
                                </MenuOption>
                            ))}
                        </div>
                    )}
                    {/* (The cost order, with the other orders: owner, 2026-11-14 18:17, option a.) */}
                    {!folded.has("sort") && !emptyColumns.has("cost") && (
                        <div className="capability-overview-costs-head capability-overview-sort-cost">
                            <span>Cost</span>
                                {/* The cost order: two small arrow buttons beside the label -- up is low to high, down is high to low (the active one is pressed). */}
                                <div className="capability-overview-costs-order" role="group" aria-label="Cost order">
                                    {([["cost-asc", "up", "Low to high"], ["cost-desc", "down", "High to low"]] as const).map(([id, direction, name]) => (
                                        <FoldArrow
                                            key={id}
                                            variant="label"
                                            open={false}
                                            direction={direction}
                                            pressed={filter.sort === id}
                                            name={name}
                                            onToggle={() => patch({ sort: filter.sort === id ? "page" : id })}
                                        />
                                    ))}
                                </div>
                                <InfoNote label="Cost order" points={["The costs are ordered by how often they are paid -- one-time, yearly, quarterly, monthly, per unit, per project, a share of revenue --, then by their amount.", "From and To compare the amounts as entered."]} />
                                </div>
                    )}
                </div>
                </div>
            {/* (Columns only in the Table view: owner, 2026-11-14 18:17, option b.) */}
            {view === "table" && (
                <div className="capability-overview-menu-section" role="group" aria-label="Table">
                    <p className="capability-overview-menu-section-title">Table</p>
                    {/* COLUMNS: which columns of the table are shown (Name always is). */}
                    <div className="capability-overview-menu-group">
                        <MenuHead title="Columns" open={!folded.has("columns")} onToggle={() => toggleFold("columns")} controls="funnel-columns" />
                        {!folded.has("columns") && (
                            <div className="capability-overview-menu-body" id="funnel-columns">
                                {/* (The % column is a choice under Offering, shown while Offering is: owner, 2026-11-14 09:31.) */}
                                {[TABLE_COLUMNS.slice(0, TABLE_COLUMNS.findIndex(column => column.id === "share")), TABLE_COLUMNS.slice(TABLE_COLUMNS.findIndex(column => column.id === "share") + 1)].map((part, at) => (
                                    <Fragment key={at}>
                                        <BusinessTicks
                                            name="Column"
                                            options={part.filter(column => !emptyColumns.has(column.id)).map(column => ({ id: column.id, label: column.label }))}
                                            chosen={part.filter(column => !offColumn(column.id)).map(column => column.id)}
                                            onChange={(next) => setHiddenColumns(current => {
                                                const hidden = new Set([...current].filter(id => !part.some(column => column.id === id)));
                                                part.filter(column => !next.includes(column.id)).forEach(column => hidden.add(column.id));
                                                // (Offering off takes its % off with it.)
                                                if (hidden.has("offering")) {
                                                    hidden.add("share");
                                                }
                                                return hidden;
                                            })}
                                        />
                                        {at === 0 && !offColumn("offering") && (
                                            <div className="capability-overview-menu-sub">
                                                <BusinessTicks
                                                    name="Column"
                                                    options={[{ id: "share", label: "Cost per Offering" }]}
                                                    chosen={hiddenColumns.has("share") ? [] : ["share"]}
                                                    onChange={(next) => setHiddenColumns(current => {
                                                        const hidden = new Set(current);
                                                        if (next.includes("share")) {
                                                            hidden.delete("share");
                                                        } else {
                                                            hidden.add("share");
                                                        }
                                                        return hidden;
                                                    })}
                                                />
                                            </div>
                                        )}
                                    </Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                    </div>
                )}
        </div>
    );

    /**
     * A CHANNEL EXPENSE'S OWN CELLS: its Type with "Channel" under it (a card of another type that is a channel's too); its Group, the channel over its
     * subchannel (as the channels' table draws them); its Offerings and journey stages one under another; its actions, each a number that opens it.
     */
    // (THE OFFERINGS AN OFFERING'S CAPABILITY CARD SERVES, as its card links them -- the Offering column of every row, not a channel expense's alone; owner,
    // 2026-11-13 13:56: "in the offering column some cells are empty".)
    // (THE OFFERINGS CHOSEN under Belongs to: a row lists only those, with their shares; with All, every one -- owner, 2026-11-14 11:15.)
    const chosenNames = filter.offerings.map(id => offerings.find(offering => offering.id === id)?.name.trim() || "").filter(Boolean);
    const chosen = (name: string) => chosenNames.length === 0 || chosenNames.includes(name);
    const servedCell = (row: FloorRow, column: string): ReactNode | undefined => {
        if (column === "share") {
            const fee = isPercentRow(row) ? feeOf?.(row) ?? null : null;
            const lines = shareLines(row, offerings, offeringRevenue, offeringChannelRevenue, fee, orderValue, offeringPayingRevenue).filter(line => chosen(line.name));
            // (A fixed fee in another currency: its note under the lines, as the Fees line says it.)
            const items = [...lines.map(line => ({ key: line.name, node: costPerOfferingText(row, line) as ReactNode })), ...(fee?.note ? [{ key: "note", node: fee.note as ReactNode }] : [])];
            return items.length > 0 ? <Values items={items} /> : undefined;
        }
        const names = (row.offeringIds ?? []).map(id => offerings.find(offering => offering.id === id)?.name.trim() || "").filter(Boolean).filter(chosen);
        return column === "offering" && names.length > 0 ? <Values items={names.map(name => ({ key: name, node: name }))} /> : undefined;
    };
    // (TWO COST NATURES ON TWO ROWS (owner, 2026-11-26 12:35 UTC+2: "some other cards have 2 Cost Natures. To save some space better to place them in 2 rows (per
    // nature cost)"): "Pre-Operating Expense, then OpEx" as the first nature over the second, divided as a card's two channels are.)
    const natureLines = (column: string, value: ReactNode): ReactNode => {
        if (column !== "nature" || typeof value !== "string" || !value.includes(", then ")) {
            return value;
        }
        const [first, second] = value.split(", then ");
        return (
            <div className="channel-resource-place">
                <span className="channel-resource-place-channel">{first}</span>
                <span className="channel-resource-place-rule" aria-hidden="true" />
                <span className="channel-resource-place-sub">{"then " + second}</span>
            </div>
        );
    };
    const channelCell = (row: FloorRow, column: string): ReactNode | undefined => {
        const facts = row.channel;
        if (!facts) {
            return undefined;
        }
        const under = (top: ReactNode, below: readonly ReactNode[], key: string) => (
            <div className="channel-resource-place" key={key}>
                <span className="channel-resource-place-channel">{top}</span>
                <span className="channel-resource-place-rule" aria-hidden="true" />
                {below.length > 1
                    ? <ul className="channel-resource-list channel-resource-lined channel-resource-subs">{below.map((sub, at) => <li key={at}>{sub}</li>)}</ul>
                    : <span className="channel-resource-place-sub">{below[0]}</span>}
            </div>
        );
        if (column === "type") {
            return kindName(row) === "Channel" ? kindName(row) : under(kindName(row), ["Channel"], "type");
        }
        if (column === "group" && facts.places.length > 0) {
            return [...new Set(facts.places.map(place => place.channel))].map(channel => under(channel, facts.places.filter(place => place.channel === channel).map(place => place.sub), channel));
        }
        if (column === "offering") {
            return <Values items={facts.offerings.filter(chosen).map(name => ({ key: name, node: name }))} />;
        }
        if (column === "journey") {
            return <Values items={facts.stages.filter(name => filter.stages.length === 0 || filter.stages.includes(name)).map(name => ({ key: name, node: name }))} />;
        }
        if (column === "actions") {
            return <Chips items={facts.actions.map(action => ({
                key: action.id,
                node: (
                    <button
                        type="button"
                        className="channel-resource-action"
                        title={"#" + action.order + (action.text ? " " + action.text : "")}
                        aria-label={"Go to action #" + action.order + (action.text ? ": " + action.text : "")}
                        disabled={!onOpenAction}
                        onClick={() => onOpenAction?.(action.id, action.segmentId)}
                    >
                        {"#" + action.order}
                    </button>
                )
            }))} />;
        }
        return undefined;
    };

    return (
        <ReportFrame
            count={shown.length + " of " + rows.length}
            label="all tiles"
            menu={menuFor}
            extra={<>
                {rows.some(row => row.missing) && (
                    <span className="capability-overview-incomplete">
                        {rows.filter(row => row.missing).length} incomplete
                        <InfoNote label="Incomplete" points={["A card that lacks a required answer is shown here, red, but counted nowhere else until it is fixed."]} />
                    </span>
                )}
                <div className="capability-overview-legend" role="group" aria-label="Show only tiles with a connection">
                    {(["resource", "activity", "partner", "provider"] as const).map(type => (
                        <TextLink
                            key={type}
                            aria-pressed={connection === type}
                            aria-label={"Show only tiles connected to a " + SYMBOLS[type]}
                            onClick={() => {
                                setFocus(null);
                                setConnection(connection === type ? "" : type);
                            }}
                        >
                            <i className={"card-tile-symbol card-tile-symbol-" + type} aria-hidden="true" />{SYMBOLS[type]}
                        </TextLink>
                    ))}
                </div>
                {focus && (
                    <span className="capability-overview-chip">
                        {"Connected to " + focus.name}
                        <RemoveButton aria-label="Show all tiles again" onClick={() => setFocus(null)} />
                    </span>
                )}
            </>}
        >
            {(view, table) => (<>

            {shown.length === 0 && <p className="capability-overview-empty">Nothing matches.</p>}

            {view === "tiles" && shown.length > 0 && (
                <TileGrid label="Inventory" bare fill>
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
                                lines={tileLines(row, format, currency)}
                                marks={tileMarks(row, tileLines(row, format, currency))}
                                links={row.links}
                                tone={row.tone}
                                missing={row.missing}
                                inactive={row.status === "completed"}
                                label={kindName(row) + ": " + tileName(plainTitle(row.name), tileLines(row, format, currency))}
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

            {/* (A PHONE HELD UPRIGHT: TURN IT FOR THE WHOLE TABLE (owner, 2026-11-24 10:12 UTC+2: "For table, that on portrait position, does not work. create a message to
                rotate the screen"): a note over the table, its symbol a phone turning, shown in a phone's portrait alone (capability-overview.css). It never blocks the
                table, which still scrolls sideways -- a message that locks a view to one orientation fails WCAG 2.1 SC 1.3.4 (W3C failure F100).) */}
            {view === "table" && shown.length > 0 && (
                <p className="capability-overview-rotate" role="note">
                    <svg className="capability-overview-rotate-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M11 18h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M19.5 9.5a8 8 0 0 1 0 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M18.2 14l1.3 1.2 1.2-1.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span>Turn your phone sideways to see every column. The table also scrolls left and right.</span>
                </p>
            )}

            {view === "table" && shown.length > 0 && (
                <table
                    className="capability-overview-table"
                    {...table}
                >
                    <thead>
                        <tr>
                            <th scope="col" data-col="name">Name</th>
                            {TABLE_COLUMNS.filter(column => !offColumn(column.id)).map(column => (
                                <th scope="col" key={column.id} data-col={column.id} className={column.id === "cost" ? "capability-overview-number" : undefined}>
                                    {column.id === "cost" ? labelWithCurrency(column.label, currency) : column.id === "share"
                                        ? <InfoText text={labelWithCurrency(column.label, currency)}><InfoNote label="Cost per Offering" points={["Each Offering's share of the cost, and the cost it comes to: the shares typed on the card, as the Financial Foundation splits it; with none typed, or shares that do not total 100%, equal shares.", "A channel expense is shared equally between the Offerings its channel serves.", "A cost that is a share of revenue shows its rate and what it comes to for each Offering. A fee is charged where the customers pay: each Offering's revenue a month (Sales Forecast's expected sales x the price on Revenue & Pricing x the items per order) is shared equally among the Purchase subchannels that serve it, and the Discover subchannels take none. A marketplace takes its own fee; the rest of what is paid on the founder's own subchannels goes through the Segment's payment services, equally, unless a fee of its own is held there.", "A commission held by referral and affiliate subchannels is charged on what their Customer Sources bring. Where no subchannel holds the cost, the rate of the Offering's whole revenue a month; until its sales and price are set, it waits for them."]} /></InfoText>
                                        : column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {shown.flatMap(row => tableRows(row, plainAmount, currency, isPercentRow(row) ? feeOf?.(row) ?? null : null).map((line, at) => (
                            <tr
                                key={row.kind + row.id + ":" + at}
                                // (Its colour, the bar down its left edge: a channel expense's of the channels' palette, as its actions' marks; any other card's, its place's hue, as its tile.)
                                className={[at > 0 ? "capability-overview-table-extra" : "", row.channel ? markTint("resource", row.channel.colour) : ""].filter(Boolean).join(" ") || undefined}
                                style={row.channel ? undefined : { "--strategy-theme-hue": toneHue(row.tone) } as CSSProperties}
                            >
                                <th scope="row" data-col="name">
                                    {at > 0 || (row.kind === "legal" && !onOpenLegal)
                                        ? row.name
                                        : <TextLink className="capability-overview-name" onClick={(event) => open(row, event.detail > 0)}>{row.name}</TextLink>}
                                </th>
                                {TABLE_COLUMNS.filter(column => !offColumn(column.id)).map(column => column.id === "linked"
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
                                    : <td key={column.id} data-col={column.id} className={column.id === "cost" ? "capability-overview-number" : undefined}>{channelCell(row, column.id) ?? servedCell(row, column.id) ?? natureLines(column.id, line[column.id])}</td>)}
                            </tr>
                        )))}
                    </tbody>
                </table>
            )}

            </>)}
        </ReportFrame>
    );

}
