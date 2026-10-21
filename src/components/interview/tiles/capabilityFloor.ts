import { workspacesOf, WORKSPACE_GROUP_ID } from "../../../framework/engine/AnswerUtils.ts";
import {
    BUSINESS_COST_FREQUENCIES,
    BUSINESS_OFFERING_RESOURCE_GROUPS,
    BUSINESS_PARTNER_GROUPS,
    offeringGroupsOf,
    BUSINESS_RESOURCE_GROUPS,
    BUSINESS_RESOURCE_STATUSES,
    BusinessActivityValue,
    BusinessCapabilityValue,
    BusinessCostValue,
    BusinessPartnerValue,
    BusinessResourceSlotValue,
    resourceUnitCount,
    isPurchaseGroup,
    usesSupplier,
    isCostingStatus,
    partnerCategoryLabel,
    activityCategoryLabel,
    partnerNoun,
    workspaceCardName,
    LegalEntityExpenseValue
} from "../../../framework/engine/AnswerUtils.ts";
import { parseAmount } from "../../../framework/engine/Amounts.ts";
import { PreferencesService } from "../../../services/PreferencesService.ts";
import { isoToDisplay } from "../fields/DateCellInput.tsx";
import { incompleteCards } from "../../../framework/engine/CardCompleteness.ts";
import { freshCards } from "../cards/freshCards.ts";
import { founderMonthlySalary } from "../../../framework/engine/DemandCapacity.ts";

/*
    THE FLOOR: every tile kind of Page 3 -- Resources, Activities, Partners & Suppliers, and (to include or leave out) the Workspace and
    the Founders -- as plain rows, so that the connections between them (a resource that created an activity, a resource a partner or
    provider supplies) can be seen at once and filtered. Pure: the editor draws it (CapabilityFloor.tsx).
*/

export type FloorKind = "resource" | "activity" | "partner" | "provider" | "founder" | "legal";

export const FLOOR_KINDS: readonly { id: FloorKind; label: string; one: string }[] = [
    { id: "resource", label: "Resources", one: "Resource" },
    { id: "activity", label: "Activities", one: "Activity" },
    { id: "partner", label: "Partners", one: "Partner" },
    { id: "provider", label: "Suppliers", one: "Supplier" },
    { id: "founder", label: "Founders", one: "Founder" },
    { id: "legal", label: "Legal expenses", one: "Legal expense" }
];

/** What connects a row to another: the other card's id, name and what the connection is. */
export interface FloorLink {
    id: string;
    name: string;
    /** "activity", "partner" or "provider"; the Legal Entity's "expense" and "registration" (what an expense is for). */
    type: "activity" | "partner" | "provider" | "resource" | "expense" | "registration";
}

/** The colour a tile keeps from the section it stands in on the page. */
export type FloorTone = "infrastructure" | "offering" | "channel" | "legal";

export interface FloorRow {
    id: string;
    tone: FloorTone;
    kind: FloorKind;
    name: string;
    /** Where it belongs, outermost first (Infrastructure, Utilities, Electricity). */
    path: string[];
    status: string;
    statusLabel: string;
    frequency: string;
    frequencyLabel: string;
    /** The amount typed, when there is a number; null for no cost. */
    amount: number | null;
    /** The Workspace's deposit (a one-time cost kept apart from its price). */
    deposit?: number | null;
    /** The code of the currency the amount is in; "" is the organisation's own. */
    currency?: string;
    /** Its cost nature and behaviour as the Financial Foundation works them out (the Inventory's table); "" for none. */
    nature?: string;
    behaviour?: string;
    /** What the card lacks, when it is incomplete (CardCompleteness.ts); it is then counted nowhere. */
    missing?: readonly string[];
    links: FloorLink[];
    /** Its dates, the first line of its tile ("01/10/2026 - 05/11/2026"), and its warranty ("Warranty until 05/11/2028"). */
    dates?: string;
    warranty?: string;
    /** The Customer Channels it is under ("Social Media › Instagram"), when a channel made it or it is connected to a card one made. */
    channels?: string[];
}

/** An ISO day in the form the date boxes show (the reader's own). */
const dayText = (iso: string) => isoToDisplay(iso, PreferencesService.getDateFormat()) || iso;
/** A card's dates: both days, or -- with no End date -- the Start date, saying "From" only where the cost runs on a schedule (monthly, quarterly, annually). */
const periodLine = (start: string, end: string, scheduled = false) => start && end ? dayText(start) + " - " + dayText(end) : start ? (scheduled ? "From " : "") + dayText(start) : end ? "Until " + dayText(end) : "";
const SCHEDULED = new Set(["monthly", "quarterly", "annually"]);

const INFRASTRUCTURE = "Infrastructure";
const OFFERING = "Offering's Capability";

/**
 * A cost as the Financial Foundation counts it: the price, times the quantity where the resource has one (three looms at 2,400 are 7,200),
 * so that a tile and the Costs section always show the same amount.
 */
function cost(value: BusinessCostValue, quantity = "", purchase = false): { frequency: string; frequencyLabel: string; amount: number | null; currency: string } {
    const unit = value.price.trim() ? parseAmount(value.price) : null;
    const count = resourceUnitCount(quantity, value.frequency, purchase);
    const amount = unit !== null && count !== null ? Math.round(unit * count * 100) / 100 : unit;
    const known = BUSINESS_COST_FREQUENCIES.find(entry => entry.id === value.frequency)?.label ?? "";
    return {
        frequency: value.frequency,
        frequencyLabel: value.frequency === "other" && value.frequencyOther.trim() ? value.frequencyOther.trim() : known,
        amount: amount !== null && Number.isFinite(amount) ? amount : null,
        currency: value.currency
    };
}

const statusLabel = (id: string) => BUSINESS_RESOURCE_STATUSES.find(entry => entry.id === id)?.label ?? "";

export function floorRows(
    capability: BusinessCapabilityValue,
    legalExpenses: readonly LegalEntityExpenseValue[] = [],
    channelIds: ReadonlySet<string> = new Set(),
    channelNames: ReadonlyMap<string, readonly string[]> = new Map()
): FloorRow[] {

    const rows: Omit<FloorRow, "tone">[] = [];
    const partners = new Map<string, { kind: "partner" | "provider"; partner: BusinessPartnerValue }>();
    const listed: [BusinessPartnerValue[], "partner" | "provider"][] = [
        [capability.professionals, "partner"], [capability.providers, "provider"],
        [capability.offering.professionals, "partner"], [capability.offering.providers, "provider"]
    ];
    // (A card is a Provider by its CATEGORY -- Providers --, a Partner in every other: the list it is stored in is only where it happens to be.)
    listed.forEach(([list]) => list.forEach(partner => partners.set(partner.id, { kind: partnerNoun(partner.category) === "Supplier" ? "provider" : "partner", partner })));

    const activities: { activity: BusinessActivityValue; path: string[] }[] = [
        // (Where an activity belongs: its CATEGORY -- Operational, Production ... or one the user made -- in Infrastructure's or Offering's.)
        ...capability.activities.flatMap(category => category.activities.map(activity => ({
            activity,
            path: [INFRASTRUCTURE, "Activities", activityCategoryLabel(capability.activityCategories, activity.category) || category.name.trim() || "Category"]
        }))),
        ...capability.offering.activities.map(activity => ({
            activity,
            path: [OFFERING, "Activities", activityCategoryLabel(capability.activityCategories, activity.category) || "Category"]
        }))
    ];
    const activityById = new Map<string, BusinessActivityValue>(activities.map(({ activity }) => [activity.id, activity]));
    /** The activities a card chooses (its Activity status, and any further status row of it). */
    const chosenBy = (slot: BusinessResourceSlotValue): BusinessActivityValue[] => [
        slot.activityId,
        ...(slot.extraStatuses ?? []).filter(row => row.status === "activity").map(row => row.activityId)
    ].filter(id => id.length > 0).flatMap(id => activityById.get(id) ?? []);

    const resources: { slot: BusinessResourceSlotValue; path: string[]; groupId: string }[] = [
        ...Object.entries(capability.resources).filter(([groupId]) => groupId !== WORKSPACE_GROUP_ID).flatMap(([groupId, subsections]) => {
            const group = BUSINESS_RESOURCE_GROUPS.find(entry => entry.id === groupId);
            return subsections.flatMap(subsection => subsection.slots.map(slot => ({
                slot,
                groupId: subsection.id,
                path: [
                    INFRASTRUCTURE,
                    group?.label ?? (groupId === "unassigned" ? "No category" : groupId),
                    group?.kinds.find(kind => kind.id === subsection.id)?.label ?? (subsection.id === "unassigned" ? "No group" : subsection.name.trim() || "Other")
                ]
            })));
        }),
        // (The Offering's resources are filed like Infrastructure's: a category and a group, "No category" / "No group" while they have none.)
        ...capability.offering.resources.map(slot => ({
            slot,
            groupId: slot.group,
            path: [
                OFFERING,
                BUSINESS_OFFERING_RESOURCE_GROUPS.find(entry => entry.id === slot.category)?.label ?? "No category",
                offeringGroupsOf(slot.category).find(entry => entry.id === slot.group)?.label ?? "No group"
            ]
        }))
    ];

    const slotNames = new Map<string, string>(resources.map(({ slot }) => [slot.id, slot.name.trim() || "Unnamed Resource"]));
    workspacesOf(capability).forEach((workspace, index) => slotNames.set(workspace.id, workspace.name.trim() || workspaceCardName(index)));

    // THE CIRCLES (one per link, the colour of what is at the other end): purple an Activity, green a Partner, blue a Provider, grey a Resource (what a
    // card uses an activity for, what a partner or provider supplies).
    const usedBy = new Map<string, FloorLink[]>();
    const addTo = (list: FloorLink[], link: FloorLink) => {
        if (!list.some(entry => entry.id === link.id)) {
            list.push(link);
        }
    };
    const noteUse = (slot: BusinessResourceSlotValue, name: string) => chosenBy(slot).forEach(activity => {
        const list = usedBy.get(activity.id) ?? [];
        addTo(list, { id: slot.id, name, type: "resource" });
        usedBy.set(activity.id, list);
    });
    resources.forEach(({ slot }) => noteUse(slot, slot.name.trim() || "Unnamed Resource"));
    const spaces = (capability.resources[WORKSPACE_GROUP_ID] ?? []).flatMap(subsection => subsection.slots);
    spaces.forEach(slot => noteUse(slot, slot.name.trim() || "Unnamed Resource"));
    // ... and the resources an activity lists in its own Resources rows: the same connection, from the activity's side.
    const listedBy = new Map<string, FloorLink[]>();
    activities.forEach(({ activity }) => activity.resources.forEach(entry => {
        const name = slotNames.get(entry.id);
        if (name === undefined) {
            return;
        }
        const list = usedBy.get(activity.id) ?? [];
        addTo(list, { id: entry.id, name, type: "resource" });
        usedBy.set(activity.id, list);
        const back = listedBy.get(entry.id) ?? [];
        addTo(back, { id: activity.id, name: activity.name.trim() || "Unnamed Activity", type: "activity" });
        listedBy.set(entry.id, back);
    }));

    /** The partners and suppliers a card names: by its status, and by each further status row. */
    const suppliersOf = (slot: BusinessResourceSlotValue): string[] => [...new Set([
        usesSupplier(slot.status) ? slot.providerId : "",
        ...(slot.extraStatuses ?? []).filter(row => row.status === "partners-suppliers").map(row => row.providerId)
    ].filter(id => id.length > 0 && partners.has(id)))];

    resources.forEach(({ slot, path, groupId }) => {
        const links: FloorLink[] = [];
        chosenBy(slot).forEach(made => addTo(links, { id: made.id, name: made.name.trim() || "Unnamed Activity", type: "activity" }));
        (listedBy.get(slot.id) ?? []).forEach(link => addTo(links, link));
        // (The partner or supplier of its status, and of every further status row that names one.)
        suppliersOf(slot).forEach(id => {
            const partner = partners.get(id)!;
            links.push({ id: partner.partner.id, name: partner.partner.name.trim() || "Unnamed", type: partner.kind });
        });
        rows.push({
            dates: periodLine(slot.startDate, slot.endDate, SCHEDULED.has(slot.cost.frequency) && isCostingStatus(slot.status)),
            warranty: slot.warranty ? (slot.warrantyUntil ? "Warranty until " + dayText(slot.warrantyUntil) : "Warranty") : "",
            id: slot.id, kind: "resource", name: slot.name.trim() || "Unnamed Resource", path,
            status: slot.status, statusLabel: statusLabel(slot.status),
            ...(isCostingStatus(slot.status) ? cost(slot.cost, slot.quantity, isPurchaseGroup(groupId)) : { frequency: "", frequencyLabel: "", amount: null }),
            links
        });
    });

    activities.forEach(({ activity, path }) => {
        const links: FloorLink[] = [];
        links.push(...(usedBy.get(activity.id) ?? []));
        activity.performerIds.forEach(id => {
            const partner = partners.get(id);
            if (partner) {
                links.push({ id, name: partner.partner.name.trim() || "Unnamed", type: partner.kind });
            }
        });
        rows.push({
            id: activity.id, kind: "activity", name: activity.name.trim() || "Unnamed Activity", path,
            dates: periodLine(activity.startDate, activity.endDate),
            status: activity.completed ? "completed" : "", statusLabel: activity.completed ? "Completed" : "",
            frequency: "", frequencyLabel: "", amount: null, links
        });
    });

    const supplied = new Map<string, FloorLink[]>();
    resources.forEach(({ slot }) => {
        suppliersOf(slot).forEach(id => {
            supplied.set(id, [...(supplied.get(id) ?? []), { id: slot.id, name: slot.name.trim() || "Unnamed Resource", type: "resource" }]);
        });
    });
    // ... and the activities a partner or provider performs: the other end of the activity's own link to it.
    activities.forEach(({ activity }) => activity.performerIds.forEach(id => {
        if (partners.has(id)) {
            supplied.set(id, [...(supplied.get(id) ?? []), { id: activity.id, name: activity.name.trim() || "Unnamed Activity", type: "activity" }]);
        }
    }));
    const partnerLists: [BusinessPartnerValue[], string][] = [
        [capability.professionals, INFRASTRUCTURE], [capability.providers, INFRASTRUCTURE],
        [capability.offering.professionals, OFFERING], [capability.offering.providers, OFFERING]
    ];
    // The Workspace provided by a Partner or Provider supplies it too.
    workspacesOf(capability).forEach((workspace, index) => {
        if (workspace.providerId && partners.has(workspace.providerId) && workspace.status === "rent") {
            supplied.set(workspace.providerId, [...(supplied.get(workspace.providerId) ?? []), { id: workspace.id, name: workspace.name.trim() || workspaceCardName(index), type: "resource" }]);
        }
    });
    partnerLists.forEach(([list, section]) => list.forEach(partner => {
        const kind = partnerNoun(partner.category) === "Supplier" ? "provider" as const : "partner" as const;
        rows.push({
            id: partner.id, kind, name: partner.name.trim() || "Unnamed " + partnerNoun(partner.category),
            // (Its dates first, as a resource's and an activity's tile has them.)
            dates: periodLine(partner.startDate, partner.endDate, SCHEDULED.has(partner.cost.frequency)),
            // (Where it belongs: its CATEGORY -- Partners, Providers or one the user made.)
            path: [
                section,
                partnerCategoryLabel(capability.partnerCategories, partner.category) || (kind === "provider" ? "Suppliers" : "Partners"),
                // (Its group within the type, "No group" while it has none.)
                ...(partner.category === "partners" || partner.category === "suppliers"
                    ? [BUSINESS_PARTNER_GROUPS[section === OFFERING ? "offering" : "infrastructure"][partner.category].find(entry => entry.id === partner.group)?.label ?? "No group"]
                    : [])
            ],
            status: "", statusLabel: "", ...cost(partner.cost, partner.cost.frequency === "per-unit" ? partner.quantity : "", partner.cost.frequency === "per-unit"), links: supplied.get(partner.id) ?? []
        });
    }));

    workspacesOf(capability).forEach(workspace => rows.push({
        // (A Workspace is a resource card of the Workspace category: a resource tile like the others.)
        id: workspace.id, kind: "resource",
        name: workspace.name.trim() || "Unnamed Resource",
        path: [INFRASTRUCTURE, "Workspace", "Premises"],
        status: workspace.status, statusLabel: statusLabel(workspace.status),
        ...(isCostingStatus(workspace.status) ? cost(workspace.cost) : { frequency: "", frequencyLabel: "", amount: null }),
        // (Its deposit is a one-time cost of the Financial Foundation, kept apart from the price.)
        deposit: workspace.deposit.trim() && parseAmount(workspace.deposit) !== null ? parseAmount(workspace.deposit) : null,
        links: [
            ...spaces.filter(slot => slot.id === workspace.id).flatMap(chosenBy).map(made => ({ id: made.id, name: made.name.trim() || "Unnamed Activity", type: "activity" as const })),
            ...(workspace.status === "rent" && workspace.providerId && partners.has(workspace.providerId)
                ? [{ id: workspace.providerId, name: partners.get(workspace.providerId)!.partner.name.trim() || "Unnamed", type: partners.get(workspace.providerId)!.kind }]
                : [])
        ]
    }));

    capability.founders.forEach(founder => rows.push({
        id: founder.id, kind: "founder", name: founder.name.trim() || "Unnamed Founder", path: [INFRASTRUCTURE, "Founders"],
        // A founder's pay is a cost of the Financial Foundation (a monthly salary): the tile says so too.
        status: "", statusLabel: "", frequency: founderMonthlySalary(founder) === null ? "" : "monthly",
        frequencyLabel: founderMonthlySalary(founder) === null ? "" : "Monthly",
        amount: founderMonthlySalary(founder), links: []
    }));

    // The Legal Entity's expenses (Identity System): shown here, opened there.
    const legalFrequency: Record<string, string> = { "One time": "one-time", "Monthly": "monthly", "Annually": "annually" };
    legalExpenses.forEach(expense => rows.push({
        id: expense.id, kind: "legal", name: expense.name.trim() || "Unnamed expense",
        path: ["Identity System", "Legal Entity", "Expenses"],
        status: "", statusLabel: "",
        frequency: legalFrequency[expense.frequency] ?? "",
        frequencyLabel: BUSINESS_COST_FREQUENCIES.find(entry => entry.id === legalFrequency[expense.frequency])?.label ?? "",
        amount: expense.cost.trim() ? parseAmount(expense.cost) : null,
        links: []
    }));

    const lacking = incompleteCards(capability);
    return rows.map(row => ({
        ...row,
        ...(lacking.has(row.id) && !freshCards.has(row.id) ? { missing: lacking.get(row.id) } : {}),
        ...(channelNames.has(row.id) ? { channels: [...channelNames.get(row.id)!] } : {}),
        tone: row.kind === "legal"
            ? "legal" as const
            : channelIds.has(row.id) ? "channel" as const : row.path[0] === OFFERING ? "offering" as const : "infrastructure" as const
    }));
}

/**
 * WHERE A ROW BELONGS, as plain lines (never a chain of arrows, and no labels on a tile): the section, the group in it and, where there is
 * one, the subgroup -- "Infrastructure", "Utilities", "Electricity".
 */
export function belongsLines(row: FloorRow): string[] {
    // A card of the Customer Channel (made by one, connected to one, generated by one) has the group "Channel": after its category (an activity's is its third line).
    return row.tone === "channel" ? [...row.path.slice(0, row.kind === "activity" ? 3 : 2), "Channel"] : row.path.slice(0, 3);
}

/** The lines a tile of the overlay lists under its name: where it belongs, then its status and its cost, the information alone. */
export function tileLines(row: FloorRow, format: (amount: number) => string = String): string[] {
    // (The price in bold; where there is one, "Costs" is said by it and not written.)
    const cost = row.amount === null ? "" : ["**" + format(row.amount) + "**", row.frequencyLabel.toLowerCase()].filter(Boolean).join(" ");
    return [
        ...(row.dates ? [row.dates] : []),
        ...belongsLines(row),
        ...(row.statusLabel && !(cost && /^costs?$/i.test(row.statusLabel.trim())) ? [row.statusLabel] : []),
        ...(row.warranty ? [row.warranty] : []),
        ...(cost ? [cost] : []),
        ...(row.deposit ? [format(row.deposit) + " deposit"] : [])
    ];
}

/** The marks of a tile's lines: where it belongs is plain information (no bullets); what follows it (status, dates, warranty, cost) keeps its bullet. */
export function tileMarks(row: FloorRow, lines: readonly string[]): ({ plain: true } | { bullet: true })[] {
    // (The dates come first, then where it belongs: plain lines; the rest keeps its bullets.)
    const plain = (row.dates ? 1 : 0) + belongsLines(row).length;
    return lines.map((_line, at) => at < plain ? { plain: true } : { bullet: true });
}

export const FLOOR_SORTS: readonly { id: string; label: string }[] = [
    { id: "page", label: "Page order" },
    { id: "name-asc", label: "Name, A to Z" },
    { id: "name-desc", label: "Name, Z to A" },
    { id: "cost-desc", label: "Cost, high to low" },
    { id: "cost-asc", label: "Cost, low to high" },
    { id: "status", label: "Status" },
    { id: "kind", label: "Type" }
];

export function sortFloor(rows: readonly FloorRow[], sort: string): FloorRow[] {
    const list = [...rows];
    const byName = (a: FloorRow, b: FloorRow) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    // (Rows without a cost go last either way.)
    const byCost = (direction: 1 | -1) => (a: FloorRow, b: FloorRow) =>
        a.amount === null && b.amount === null ? 0 : a.amount === null ? 1 : b.amount === null ? -1 : direction * (a.amount - b.amount);
    switch (sort) {
        case "name-asc": return list.sort(byName);
        case "name-desc": return list.sort((a, b) => byName(b, a));
        case "cost-desc": return list.sort(byCost(-1));
        case "cost-asc": return list.sort(byCost(1));
        case "status": return list.sort((a, b) => (a.statusLabel || "~").localeCompare(b.statusLabel || "~") || byName(a, b));
        case "kind": return list.sort((a, b) => FLOOR_KINDS.findIndex(k => k.id === kindClass(a)) - FLOOR_KINDS.findIndex(k => k.id === kindClass(b)));
        default: return list;
    }
}

export interface FloorFilter {
    /** The kinds shown; the Workspace and the Founders start out left off. */
    kinds: ReadonlySet<FloorKind>;
    /** "" = anywhere; else the ONE top-level place chosen first (step 1 of Belongs to). */
    place: "" | "legal" | "infrastructure" | "offering";
    /** Within that place, the groups ticked to narrow it (step 2); none ticked = the whole place. */
    groups: readonly string[];
    /** Step 3 (Resources ticked): the categories of resources ticked (Utilities, Workstation ...). */
    categories: readonly string[];
    /** Step 4: the groups ticked, the subsections of the ticked categories (Software, Digital Services ...), as subgroupKey. */
    subgroups: readonly string[];
    /** Within that place, the kinds ticked (Resources, Activities, Partners, Providers); none ticked = all. Together with the groups: both must hold. */
    placeKinds: readonly FloorType[];
    sort: string;
    status: string;
    frequency: string;
    min: string;
    max: string;
    /** Only the rows that are connected to another. */
    connectedOnly: boolean;
    /** ISOLATES THE COSTS: only the tiles that have an expense (a price, or a Workspace's deposit); the cost order and range then apply to them. */
    costsOnly: boolean;
}

export const DEFAULT_FLOOR_FILTER: FloorFilter = {
    kinds: new Set<FloorKind>(["resource", "activity", "partner", "provider", "founder", "legal"]),
    place: "", groups: [], categories: [], subgroups: [], placeKinds: [], sort: "page", status: "", frequency: "", min: "", max: "", connectedOnly: false, costsOnly: false
};

/** The top-level places, in the order Belongs to offers them. */
export const FLOOR_PLACES: readonly { id: FloorTone; label: string }[] = [
    { id: "legal", label: "Legal" },
    { id: "infrastructure", label: "Infrastructure" },
    { id: "offering", label: "Offering" }
];

/** The place a row belongs to in the funnel: the Channel belongs to the Offering (its cards are a TYPE of the Offering's), a legal expense to Legal. */
export const placeOf = (row: FloorRow): "legal" | "infrastructure" | "offering" => row.tone === "channel" ? "offering" : row.tone;

/** The ONE group of its place a row belongs to (the group the page names: Utilities, Resources, Partners ...; a legal expense's is "Expenses"). */
export const groupOf = (row: FloorRow) => row.tone === "legal" ? (row.path[2] ?? row.path[1] ?? "") : (row.path[1] ?? "");

/** The TYPES a place can be filtered by, directly under the places: the Founders, then Resources, Activities, Partners & Suppliers, and the Channel's cards. */
export type FloorType = FloorKind | "channel";
export const PLACE_KINDS: readonly FloorType[] = ["founder", "resource", "activity", "partner", "provider", "channel"];

/** The kind of a row (the Workspace cards are resource cards: the Resources kind; the Founders are a kind of their own). */
export const kindClass = (row: FloorRow): FloorKind => row.kind;

/** The type of a row: the kind it is, or "channel" for a card in the Customer Channel's colour (made by a channel, or generated by one). */
export const typeClass = (row: FloorRow): FloorType => row.tone === "channel" ? "channel" : kindClass(row);

/** The types the tiles of one place actually have, in that order (step 2 of Belongs to). */
export function floorPlaceKinds(rows: readonly FloorRow[], place: "" | "legal" | "infrastructure" | "offering"): FloorType[] {
    return place === "" ? [] : PLACE_KINDS.filter(kind => rows.some(row => placeOf(row) === place && typeClass(row) === kind));
}

/**
 * The CATEGORY a row stands in: a resource's (Utilities, Workstation ...), an activity's (Operational, Production ... or one the user made), a
 * partner's or provider's (Partners, Providers ... or one the user made). A row of the Offering's own resources has none but the kind itself.
 */
export const categoryOf = (row: FloorRow) => row.kind === "activity" ? (row.path[2] ?? "") : groupOf(row);

/**
 * The categories of the kinds ticked in one place (step 3 of Belongs to: Category), whichever kind: the resources' (Utilities, Workstation,
 * Equipment, Digital Infrastructure, Workspace, Founders), the activities' and the partners'/providers'. With no kind ticked, those of all four.
 * (An Offering's own "Resources" and "Activities" groups are the kind itself, not a category.)
 */
export function floorCategories(rows: readonly FloorRow[], place: "" | "legal" | "infrastructure" | "offering", kinds: readonly FloorType[] = []): string[] {
    if (place === "") {
        return [];
    }
    const asked = kinds.length > 0 ? kinds : PLACE_KINDS;
    const found = [...new Set(rows
        .filter(row => placeOf(row) === place && row.kind !== "legal" && row.kind !== "founder" && asked.includes(typeClass(row)) && categoryOf(row) !== ""
            // (An Offering's own "Resources" and "Activities" are the kind itself; the Channel's cards have no other, so theirs are kept.)
            && (typeClass(row) === "channel" || (categoryOf(row) !== "Resources" && categoryOf(row) !== "Activities")))
        .map(categoryOf))];
    // The Workspace is always the first category of the resources; the others keep the order the page gives them.
    return [...found.filter(category => category === "Workspace"), ...found.filter(category => category !== "Workspace")];
}

/** The key of a group (a subsection) of a category: the same name can stand in two categories. */
export const subgroupKey = (category: string, group: string) => category + "\u0001" + group;

/** The subsection a row stands in, inside its category ("" where the category has none: the Workspace, the Founders). */
export const subgroupOf = (row: FloorRow) => row.tone === "channel" ? "Channel" : row.kind === "activity" ? "" : row.path[2] ?? "";

/** The category a group is a group OF, in the funnel's keys: the group the page names, but for a Channel card its category (Channel is a group of that category). */
export const groupKeyOf = (row: FloorRow) => row.tone === "channel" ? categoryOf(row) : groupOf(row);

/** Step 4: the groups (subsections) of the ticked categories only, each once, as { key, label }. */
export function floorSubgroups(rows: readonly FloorRow[], place: "" | "legal" | "infrastructure" | "offering", categories: readonly string[]): { key: string; label: string }[] {
    if (place === "" || categories.length === 0) {
        return [];
    }
    const found = new Map<string, string>();
    rows.forEach(row => {
        const own = typeClass(row) === "resource" || typeClass(row) === "channel";
        if (placeOf(row) === place && own && categories.includes(groupKeyOf(row)) && subgroupOf(row) !== "") {
            found.set(subgroupKey(groupKeyOf(row), subgroupOf(row)), subgroupOf(row));
        }
    });
    return [...found].map(([key, label]) => ({ key, label }));
}

/** The groups that are not resources' (a legal expense's "Expenses"): shown under their place whatever is ticked. */
export function floorGroups(rows: readonly FloorRow[], place: "" | "legal" | "infrastructure" | "offering"): string[] {
    if (place === "") {
        return [];
    }
    return [...new Set(rows.filter(row => placeOf(row) === place && row.kind === "legal").map(groupOf))];
}

export function filterFloor(rows: readonly FloorRow[], filter: FloorFilter): FloorRow[] {
    const min = filter.min.trim() ? parseAmount(filter.min) : null;
    const max = filter.max.trim() ? parseAmount(filter.max) : null;
    return rows.filter(row => {
        // (The Workspace is included with the Resources.)
        if (!filter.kinds.has(kindClass(row))) {
            return false;
        }
        if (filter.place !== "" && placeOf(row) !== filter.place) {
            return false;
        }
        if (filter.placeKinds.length > 0 && !filter.placeKinds.includes(typeClass(row))) {
            return false;
        }
        if (filter.categories.length > 0 && !filter.categories.includes(categoryOf(row))) {
            return false;
        }
        // (A category with groups ticked is narrowed to them; one with none ticked is shown whole.)
        if (filter.subgroups.some(key => key.startsWith(groupKeyOf(row) + "\u0001")) && !filter.subgroups.includes(subgroupKey(groupKeyOf(row), subgroupOf(row)))) {
            return false;
        }
        if (filter.groups.length > 0 && !filter.groups.includes(groupOf(row))) {
            return false;
        }
        // (A finished activity is hidden unless the Completed status is asked for.)
        if (row.status === "completed" && filter.status !== "completed") {
            return false;
        }
        if (filter.status && row.status !== filter.status) {
            return false;
        }
        if (filter.frequency && row.frequency !== filter.frequency) {
            return false;
        }
        if (filter.costsOnly && row.amount === null && !row.deposit) {
            return false;
        }
        if (min !== null || max !== null) {
            if (row.amount === null || (min !== null && row.amount < min) || (max !== null && row.amount > max)) {
                return false;
            }
        }
        return !filter.connectedOnly || row.links.length > 0;
    });
}
