/*
    DEMAND, CAPACITY, AND WHAT THEY SAY ABOUT EXPECTED SALES.

    Three questions the Business System keeps apart, each answered on
    its own page:
    - Demand & Conversion (Customer Engagement): can enough customers
      be won, and from which sources? It gives each Offering's
      EXPECTED SALES.
    - Delivery (Infrastructure & Capability): can what is sold be
      delivered? It gives the effort each unit takes, and the founders'
      hours give the DELIVERABLE CAPACITY.
    - Financial Sustainability turns expected sales into revenue, and
      compares the workload they bring with the capacity there is.

    A shortfall of capacity is reported, never "corrected": the sales
    forecast stays what the founder expects to sell, and the report
    says more capacity may be needed.

    Nothing here is required. An organization that enters no demand
    keeps entering its expected sales on Financial Sustainability, and
    one that enters no hours simply sees no capacity check.
*/

import { parseDecimal } from "./Amounts.ts";
import { asObject, asText, randomId } from "./Readers.ts";

/* ==========================================================
   Small readers
========================================================== */

/** A number as typed: "40", "12.5", "12,5"; null when there is none. */
function readNumber(text: string | undefined): number | null {
    if (/[-−]/.test(text ?? "")) {
        return null;
    }
    return parseDecimal(text ?? "");
}

/* ==========================================================
   Demand & Conversion
========================================================== */

/*
    THREE THINGS KEPT APART:
    - a CUSTOMER SOURCE is where sales come from: referrals, a sales
      funnel, repeat customers, contracts, a marketplace, or other;
    - its CALCULATION is how the sales from that source are estimated:
      a figure entered directly, or worked out from a few inputs;
    - the EXPECTED SALES are the sources added together: the one
      figure Financial Sustainability uses for the Offering.

    An Offering bought every month until the customer cancels (a
    subscription, a retainer) is not another source: its sources give
    the new clients joining each month, and the share cancelling turns
    them into the active clients served at the normal level.
*/

interface DemandField {
    key: string;
    label: string;
    /** "number" as typed; "percent" of 100. */
    kind: "number" | "percent";
    placeholder: string;
    help: string;
}

interface DemandSourceType {
    id: string;
    label: string;
    /** When to choose it. */
    explanation: string;
    /** Its calculation's inputs; none for "Other", which is always entered directly. */
    fields: DemandField[];
    /** Only for an Offering sold one at a time: repeat purchases. */
    oneOffOnly?: boolean;
}

/** Where customers come from, each with the calculation that suits it. */
export const DEMAND_SOURCES: DemandSourceType[] = [
    {
        id: "referrals",
        label: "Referrals",
        explanation: "Customers introduced by clients, partners or a network.",
        fields: [
            { key: "referrals", label: "Referrals / Month", kind: "number", placeholder: "e.g. 3", help: "Introductions expected each month." },
            { key: "buy", label: "Buy (%)", kind: "percent", placeholder: "e.g. 40", help: "The share of introductions that become a sale." }
        ]
    },
    {
        id: "funnel",
        label: "Sales funnel",
        explanation: "Customers found through outreach: prospects, some of them qualified, some of those buying.",
        fields: [
            { key: "prospects", label: "Prospects / Month", kind: "number", placeholder: "e.g. 40", help: "People or organizations reached each month who could buy: messages, enquiries, meetings." },
            { key: "qualified", label: "Qualified (%)", kind: "percent", placeholder: "e.g. 15", help: "The share that become a real opportunity: a call, a meeting, a request for a proposal." },
            { key: "buy", label: "Buy (%)", kind: "percent", placeholder: "e.g. 25", help: "The share of those opportunities that become a sale." }
        ]
    },
    {
        id: "repeat",
        label: "Repeat customers",
        explanation: "Customers already won who buy again. Count the repeat purchases only, never the customers a second time. An established business can enter its repeat sales a month directly.",
        oneOffOnly: true,
        fields: [
            { key: "again", label: "Buy Again (%)", kind: "percent", placeholder: "e.g. 30", help: "The share of the customers won through the other sources who buy again." },
            { key: "times", label: "Times Each", kind: "number", placeholder: "1", help: "How many more times each of them buys: 1 if once more." }
        ]
    },
    {
        id: "contracts",
        label: "Contracts or tenders",
        explanation: "Work won by bidding or proposing: tenders, pitches, framework contracts.",
        fields: [
            { key: "bids", label: "Bids / Year", kind: "number", placeholder: "e.g. 12", help: "Proposals or tenders submitted in a year." },
            { key: "win", label: "Won (%)", kind: "percent", placeholder: "e.g. 25", help: "The share of bids won." },
            { key: "units", label: "Units per Contract", kind: "number", placeholder: "1", help: "How many units of the Offering one contract is worth (1 if a contract is one project)." }
        ]
    },
    {
        id: "marketplace",
        label: "Marketplace or walk-in",
        explanation: "Customers who find you: a shop, a stall, a marketplace listing, a website.",
        fields: [
            { key: "visitors", label: "Visitors / Month", kind: "number", placeholder: "e.g. 800", help: "People who visit the shop, stall, listing or site in a month." },
            { key: "buy", label: "Buy (%)", kind: "percent", placeholder: "e.g. 2", help: "The share of visitors who buy." }
        ]
    },
    {
        id: "other",
        label: "Other",
        explanation: "Any other source, such as customers moving on from another Offering: enter the figure and say what it rests on.",
        fields: []
    }
];

/** One source of an Offering's customers, and how its sales are estimated. */
export interface DemandSource {
    id: string;
    /** One of DEMAND_SOURCES' ids; "" until chosen. */
    type: string;
    /** Worked out from the source's inputs, rather than entered directly. */
    calculate: boolean;
    /** Entered directly: sales (or new clients) a month. */
    estimate: string;
    /** The calculation's inputs, as typed, by key. */
    inputs: Record<string, string>;
    /** What the figure rests on: a test, an enquiry, past sales. */
    basis: string;
}

export interface DemandValue {
    sources: DemandSource[];
    /** Bought every month until the customer cancels: a subscription or retainer. */
    recurring: boolean;
    /** For a recurring Offering: the share of active clients cancelling a month, as typed. */
    cancel: string;
    /** Page 2 channels that bring these customers. */
    channelIds: string[];
    /** What the figures rest on, overall. */
    assumptions: string;
}

export function createDemand(): DemandValue {
    return { sources: [], recurring: false, cancel: "", channelIds: [], assumptions: "" };
}

export function createDemandSource(type = ""): DemandSource {
    return {
        id: randomId("source"),
        type,
        calculate: false,
        estimate: "",
        inputs: {},
        basis: ""
    };
}

function asInputs(value: unknown): Record<string, string> {
    const inputs: Record<string, string> = {};
    for (const [key, entry] of Object.entries(asObject(value))) {
        const text = asText(entry);
        if (text.length > 0) {
            inputs[key] = text;
        }
    }
    return inputs;
}

function asDemandSource(value: unknown, position: number): DemandSource {
    const source = asObject(value);
    return {
        id: asText(source.id) || "source-" + (position + 1),
        type: DEMAND_SOURCES.some(type => type.id === source.type) ? asText(source.type) : "",
        calculate: source.calculate === true,
        estimate: asText(source.estimate),
        inputs: asInputs(source.inputs),
        basis: asText(source.basis)
    };
}

/**
 * Saved before an Offering could have several sources: one "model" and
 * its inputs. Each becomes the source it was, so nothing typed is lost:
 * a direct estimate becomes an "Other" figure, a subscription a
 * recurring Offering with its new clients as that figure, and a
 * customer base buying through the year its repeat sales a month.
 */
function legacySources(model: string, inputs: Record<string, string>): Pick<DemandValue, "sources" | "recurring" | "cancel"> {
    const one = (patch: Partial<DemandSource>): DemandSource[] => [{ ...createDemandSource(), id: "source-1", ...patch }];
    switch (model) {
        case "direct":
            return { sources: one({ type: "other", estimate: inputs.sales ?? "" }), recurring: false, cancel: "" };
        case "subscription":
            return { sources: one({ type: "other", estimate: inputs.joining ?? "" }), recurring: true, cancel: inputs.cancel ?? "" };
        case "repeat": {
            const [customers, perYear] = [readNumber(inputs.customers), readNumber(inputs.perYear)];
            const sales = customers !== null && perYear !== null ? String(round(customers * perYear / 12)) : "";
            return {
                sources: one({
                    type: "repeat",
                    estimate: sales,
                    basis: customers !== null && perYear !== null ? customers + " customers buying " + perYear + " times a year." : ""
                }),
                recurring: false,
                cancel: ""
            };
        }
        case "funnel":
        case "referrals":
        case "contracts":
        case "marketplace":
            return { sources: one({ type: model, calculate: true, inputs }), recurring: false, cancel: "" };
        default:
            return { sources: [], recurring: false, cancel: "" };
    }
}

export function asDemandValue(value: unknown): DemandValue {
    const source = asObject(value);
    const shape = Array.isArray(source.sources)
        ? {
            sources: source.sources.map(asDemandSource),
            recurring: source.recurring === true,
            cancel: asText(source.cancel)
        }
        : legacySources(asText(source.model), asInputs(source.inputs));
    return {
        ...shape,
        channelIds: Array.isArray(source.channelIds)
            ? [...new Set(source.channelIds.map(asText).filter(Boolean))]
            : [],
        assumptions: asText(source.assumptions)
    };
}

/** Demand by Offering id, as stored with Customer Engagement. */
export function asDemandMap(value: unknown): Record<string, DemandValue> {
    const result: Record<string, DemandValue> = {};
    for (const [offeringId, entry] of Object.entries(asObject(value))) {
        if (offeringId.length > 0) {
            result[offeringId] = asDemandValue(entry);
        }
    }
    return result;
}

/** Whether anything has been recorded about how an Offering's customers come. */
export function hasDemand(demand: DemandValue | undefined): boolean {
    return (demand?.sources.length ?? 0) > 0;
}

interface DemandSourceResult {
    id: string;
    label: string;
    /** Sales (or new clients) a month from this source; null until complete. */
    expected: number | null;
    /** In words: how the figure was reached. */
    working: string;
    basis: string;
}

export interface DemandResult {
    /** Expected sales a month, or active customers for a recurring Offering. */
    expected: number | null;
    recurring: boolean;
    /** For a recurring Offering: new clients joining a month, all sources together. */
    joining: number | null;
    /** For a recurring Offering: months to reach nine tenths of the level. */
    monthsToNormal: number | null;
    /** Each source's part, in order. */
    sources: DemandSourceResult[];
    /** In words, for Assumptions and the documents. */
    working: string;
}

/** The most each of Demand's counts can be, as the page limits them. */
const COUNT_LIMITS: Record<string, number> = {
    prospects: 1_000_000,
    referrals: 1_000_000,
    visitors: 1_000_000,
    bids: 10_000,
    times: 10_000,
    units: 10_000
};

/* Two decimals: a quarter of a project a month is a real figure. */
const round = (value: number) => Math.round(value * 100) / 100;

/**
 * One source's sales a month. Repeat customers are worked out from
 * the customers the other sources bring ("base"), so they are never
 * counted twice.
 */
function sourceResult(source: DemandSource, recurring: boolean, base: number | null): DemandSourceResult {

    const type = DEMAND_SOURCES.find(entry => entry.id === source.type);
    const label = type?.label ?? "Unnamed source";
    const per = recurring ? " new a month" : " a month";
    const done = (expected: number | null, working: string): DemandSourceResult =>
        ({ id: source.id, label, expected, working: expected === null ? "" : working, basis: source.basis.trim() });

    if (!type) {
        return done(null, "");
    }

    if (!source.calculate || type.fields.length === 0) {
        const estimate = readNumber(source.estimate);
        return done(estimate, "estimated at " + estimate + per);
    }

    // Within the limits the page types them in, for answers saved
    // before it had any: a count stops at its maximum, a percentage
    // at 0 and 100.
    const n = (key: string) => {
        const value = readNumber(source.inputs[key]);
        return value === null ? null : Math.min(value, COUNT_LIMITS[key] ?? value);
    };
    const pct = (key: string) => {
        const value = readNumber(source.inputs[key]);
        return value === null ? null : Math.min(100, Math.max(0, value)) / 100;
    };
    // Times Each and Units per Contract count from 1: less is not entered.
    const atLeastOne = (key: string) => {
        const value = n(key);
        return value !== null && value >= 1 ? value : 1;
    };
    const all = (...values: (number | null)[]) => values.every(value => value !== null);

    switch (type.id) {
        case "funnel": {
            const [p, q, b] = [n("prospects"), pct("qualified"), pct("buy")];
            if (!all(p, q, b)) return done(null, "");
            const expected = round(p! * q! * b!);
            return done(expected, p + " prospects a month, " + round(q! * 100) + "% qualified, " + round(b! * 100) + "% of those buy: about " + expected + per);
        }
        case "referrals": {
            const [r, b] = [n("referrals"), pct("buy")];
            if (!all(r, b)) return done(null, "");
            const expected = round(r! * b!);
            return done(expected, r + " referrals a month, " + round(b! * 100) + "% buy: about " + expected + per);
        }
        case "repeat": {
            const again = pct("again");
            const times = atLeastOne("times");
            if (again === null || base === null || base <= 0) return done(null, "");
            const expected = round(base * again * times);
            return done(expected, "of the " + round(base) + " a month won through the other sources, " + round(again * 100) + "% buy again" +
                (times === 1 ? "" : ", " + times + " times each") + ": about " + expected + " a month");
        }
        case "contracts": {
            const [bids, win] = [n("bids"), pct("win")];
            const units = atLeastOne("units");
            if (!all(bids, win)) return done(null, "");
            const expected = round(bids! * win! * units / 12);
            return done(expected, bids + " bids a year, " + round(win! * 100) + "% won, " + units + " per contract: about " + expected + per);
        }
        case "marketplace": {
            const [v, b] = [n("visitors"), pct("buy")];
            if (!all(v, b)) return done(null, "");
            const expected = round(v! * b!);
            return done(expected, v + " visitors a month, " + round(b! * 100) + "% buy: about " + expected + per);
        }
        default:
            return done(null, "");
    }

}

/** What a demand entry gives: expected sales, and how they were worked out. */
export function demandResult(demand: DemandValue | undefined): DemandResult {

    const recurring = demand?.recurring === true;
    const empty: DemandResult = { expected: null, recurring, joining: null, monthsToNormal: null, sources: [], working: "" };
    if (!demand || demand.sources.length === 0) {
        return empty;
    }

    // Repeat purchases are not offered for a recurring Offering: its
    // clients stay, rather than buy again.
    const counted = demand.sources.filter(source =>
        !(recurring && DEMAND_SOURCES.find(type => type.id === source.type)?.oneOffOnly)
    );

    // Every source but repeat customers first: they are the base repeat purchases come from.
    const isRepeat = (source: DemandSource) => source.type === "repeat";
    const firstResults = counted.filter(source => !isRepeat(source)).map(source => sourceResult(source, recurring, null));
    const complete = firstResults.filter(result => result.expected !== null);
    const base = complete.length > 0 ? round(complete.reduce((sum, result) => sum + result.expected!, 0)) : null;
    const byId = new Map(firstResults.map(result => [result.id, result]));
    const sources = counted.map(source => byId.get(source.id) ?? sourceResult(source, recurring, base));

    const counts = sources.filter(result => result.expected !== null);
    if (counts.length === 0) {
        return { ...empty, sources };
    }
    const total = round(counts.reduce((sum, result) => sum + result.expected!, 0));
    const parts = counts.map(result => result.label + ": " + result.working + ".");
    const sum = counts.length > 1 ? " Together about " + total + (recurring ? " new a month." : " a month.") : "";

    if (!recurring) {
        return { ...empty, expected: total, sources, working: parts.join(" ") + sum };
    }

    // Joining and leaving balance where active = joining / cancel;
    // nine tenths of the way there after ln(10) / -ln(1 - cancel)
    // months, rounded up so the level is reached.
    const cancelPercent = readNumber(demand.cancel);
    const cancel = cancelPercent === null ? null : cancelPercent / 100;
    if (cancel === null || cancel <= 0 || cancel >= 1) {
        return { ...empty, joining: total, sources, working: parts.join(" ") + sum };
    }
    const expected = round(total / cancel);
    const months = Math.ceil(Math.log(10) / -Math.log(1 - cancel) - 1e-9);
    return {
        expected, recurring, joining: total, monthsToNormal: months, sources,
        working: parts.join(" ") + sum + " With " + round(cancel * 100) + "% cancelling a month, they level off at about " +
            expected + " active clients, reached in about " + months + " months."
    };

}

/* ==========================================================
   Delivery and capacity
========================================================== */

/**
 * Weeks in an average month: 52 weeks over 12 months. Hours given a
 * week become hours a month at this rate (40 h a week is about 173 h
 * a month), as payroll and forecasts convert them; four weeks would
 * lose a month's worth every year.
 */
export const WEEKS_PER_MONTH = 52 / 12;

/** "week" or "month": the period a figure of hours was given for. "" is a month. */
export type HoursPeriod = "week" | "month" | "";

export function asHoursPeriod(value: unknown): HoursPeriod {
    return value === "week" || value === "month" ? value : "";
}

/** Hours given for a period, as hours a month. */
function monthlyHours(hours: number, period: HoursPeriod): number {
    return period === "week" ? hours * WEEKS_PER_MONTH : hours;
}

/*
    CAPACITY IS THE FOUNDERS' HOURS. What the organization controls is
    the time its founders give to delivery; that is its capacity, and
    nothing is added to it. An external professional who delivers part
    of an Offering is an external requirement (and a cost of the
    Offering, recorded on Offering's Capability), shown beside the
    capacity, never inside it.

    Effort is recorded by person: each founder's and each linked
    professional's hours for one unit of the Offering. A founder's
    capacity is used first by recurring work (subscriptions and
    retainers), which must be served every month; what remains is the
    flexible capacity the other Offerings draw on.

    Duration is elapsed time, for scheduling: it is never multiplied
    into hours.
*/

/** How one Offering is delivered: who does how many hours of each unit. */
export interface DeliveryValue {
    /**
     * Hours one unit takes, by person (a founder's or a linked
     * professional's id). For a subscription or retainer: each active
     * customer, each month.
     */
    hours: Record<string, string>;
    /** How long one unit takes from start to finish, in weeks: elapsed time. */
    duration: string;
    constraints: string;
    /** Before effort was split by person: one total, and who delivered it. */
    effort: string;
    deliverers: string[];
    /**
     * How it is delivered, as the founder chooses on its card: "unit",
     * once per unit sold, over a duration in weeks; or "monthly",
     * ongoing work for each active client every month (a retainer, a
     * subscription). "" is per unit.
     */
    mode: "unit" | "monthly" | "";
    /** For monthly work: whether each client's hours are a week's or a month's. */
    period: HoursPeriod;
}

export function createDelivery(): DeliveryValue {
    return { hours: {}, duration: "", constraints: "", effort: "", deliverers: [], mode: "", period: "" };
}

export function asDeliveryMap(value: unknown): Record<string, DeliveryValue> {
    const result: Record<string, DeliveryValue> = {};
    for (const [offeringId, entry] of Object.entries(asObject(value))) {
        const source = asObject(entry);
        if (offeringId.length === 0) {
            continue;
        }
        const hours: Record<string, string> = {};
        for (const [personId, text] of Object.entries(asObject(source.hours))) {
            const typed = asText(text);
            if (personId.length > 0 && typed.length > 0) {
                hours[personId] = typed;
            }
        }
        result[offeringId] = {
            hours,
            duration: asText(source.duration),
            constraints: asText(source.constraints),
            effort: asText(source.effort),
            deliverers: Array.isArray(source.deliverers)
                ? [...new Set(source.deliverers.map(asText).filter(Boolean))]
                : [],
            mode: source.mode === "unit" || source.mode === "monthly" ? source.mode : "",
            period: asHoursPeriod(source.period)
        };
    }
    return result;
}

/**
 * One unit's hours by person, as numbers. An entry saved before effort
 * was split keeps its total on the first person who delivered it, or
 * unassigned ("") if nobody was named.
 */
export function deliveryAllocation(delivery: DeliveryValue | undefined): Record<string, number> {
    const result: Record<string, number> = {};
    if (!delivery) {
        return result;
    }
    for (const [personId, text] of Object.entries(delivery.hours)) {
        const hours = readNumber(text);
        if (hours !== null && hours > 0) {
            // Monthly work given a week is converted; a unit's hours stand as they are.
            result[personId] = monthlyHours(hours, delivery.mode === "monthly" ? delivery.period : "");
        }
    }
    if (Object.keys(result).length === 0) {
        const total = readNumber(delivery.effort);
        if (total !== null && total > 0) {
            result[delivery.deliverers[0] ?? ""] = total;
        }
    }
    return result;
}

/** Hours one unit takes in all, whoever does them; null if not said. */
export function deliveryEffort(delivery: DeliveryValue | undefined): number | null {
    const total = Object.values(deliveryAllocation(delivery)).reduce((sum, hours) => sum + hours, 0);
    return total > 0 ? total : null;
}

/** What a founder gives to delivery. */
interface FounderHours {
    id?: string;
    name: string;
    /** Working hours, a month or a week (hoursPeriod). */
    hours: string;
    /** Hours available for delivery, in the same period: the preferred answer. */
    deliveryHours?: string;
    /** Or the percent of working hours spent delivering. */
    deliveryShare: string;
    /** The period both figures are given for; "" is a month. */
    hoursPeriod?: HoursPeriod;
}

/**
 * A founder's delivery hours a month: as given, or working hours times
 * the percent spent delivering. Null when neither is known.
 */
export function founderDeliveryHours(founder: FounderHours): number | null {
    const period = founder.hoursPeriod ?? "";
    const direct = readNumber(founder.deliveryHours);
    const hours = readNumber(founder.hours);
    if (direct !== null) {
        // Never more than the working hours, if they were lowered after.
        return monthlyHours(hours !== null ? Math.min(direct, hours) : direct, period);
    }
    const share = readNumber(founder.deliveryShare);
    return hours !== null && share !== null ? monthlyHours(hours * Math.min(100, share) / 100, period) : null;
}

/** A founder's working hours a month, converted from a week if given so. */
export function founderWorkingHours(founder: FounderHours): number | null {
    const hours = readNumber(founder.hours);
    return hours === null ? null : monthlyHours(hours, founder.hoursPeriod ?? "");
}

/** The organization's controlled capacity: every founder's delivery hours. Null when none is known. */
export function deliveryHours(founders: readonly FounderHours[]): number | null {
    const known = founders.map(founderDeliveryHours).filter((hours): hours is number => hours !== null);
    return known.length > 0 ? known.reduce((sum, hours) => sum + hours, 0) : null;
}

interface FounderLoad {
    id: string;
    name: string;
    /** Delivery hours a month. */
    available: number;
    /** Month by month: hours for recurring work, then for the other Offerings. */
    recurring: number[];
    other: number[];
    /** The first month the founder's work exceeds the hours; null if never. */
    firstShortfall: number | null;
    peak: number;
    peakIndex: number;
}

interface ExternalLoad {
    id: string;
    name: string;
    /** Hours a month the expected sales need from this professional. */
    hours: number[];
    peak: number;
}

export interface CapacityCheck {
    /** All founders' delivery hours a month: the controlled capacity. */
    available: number;
    /** Founders' hours the expected sales need, month by month. */
    needed: number[];
    /** Of which recurring work, served first. */
    committed: number[];
    peak: number;
    peakIndex: number;
    /** The first month any founder, or the founders together, run short; null if never. */
    firstShortfall: number | null;
    founders: FounderLoad[];
    /** Effort recorded without naming who does it: counted against the founders together. */
    unassigned: number[];
    /** Hours needed from external professionals: beside the capacity, not in it. */
    external: ExternalLoad[];
    /** Offerings with sales but no effort recorded: left out. */
    unmeasured: string[];
}

/**
 * Expected sales against the founders' capacity. Each month, every
 * Offering's volume times each person's hours per unit: founders' hours
 * against their own delivery hours (recurring work first), external
 * professionals' hours reported apart. Null when there is nothing to
 * compare: no founder delivery hours, or no effort recorded anywhere.
 */
export function capacityCheck(
    founders: readonly FounderHours[],
    volumesByOffering: Record<string, number[]>,
    delivery: Record<string, DeliveryValue>,
    length: number,
    recurringOfferings: ReadonlySet<string> = new Set(),
    names: Record<string, string> = {}
): CapacityCheck | null {

    const withHours = founders
        .map((founder, index) => ({
            id: founder.id ?? "founder-" + index,
            name: founder.name.trim() || "Founder " + (index + 1),
            available: founderDeliveryHours(founder)
        }))
        .filter((founder): founder is { id: string; name: string; available: number } => founder.available !== null);

    if (withHours.length === 0) {
        return null;
    }

    const zeros = () => new Array<number>(length).fill(0);
    const loads = new Map(withHours.map(founder => [founder.id, { recurring: zeros(), other: zeros() }]));
    const external = new Map<string, number[]>();
    const unassigned = zeros();
    const unmeasured: string[] = [];
    let measured = false;

    for (const [offeringId, volumes] of Object.entries(volumesByOffering)) {
        const allocation = deliveryAllocation(delivery[offeringId]);
        if (Object.keys(allocation).length === 0) {
            if (volumes.some(volume => volume > 0)) {
                unmeasured.push(offeringId);
            }
            continue;
        }
        measured = true;
        const recurring = recurringOfferings.has(offeringId);
        for (const [personId, perUnit] of Object.entries(allocation)) {
            const founder = loads.get(personId);
            const target = founder
                ? (recurring ? founder.recurring : founder.other)
                : personId === "" || founders.some(entry => entry.id === personId)
                    ? unassigned
                    : external.get(personId) ?? (external.set(personId, zeros()), external.get(personId)!);
            volumes.slice(0, length).forEach((volume, index) => { target[index] += volume * perUnit; });
        }
    }

    if (!measured) {
        return null;
    }

    const shortfallOf = (need: number[], available: number) => {
        const index = need.findIndex(hours => hours > available + 0.05);
        return index < 0 ? null : index;
    };
    const peakOf = (values: number[]) => {
        const peak = Math.max(0, ...values);
        return { peak, peakIndex: values.indexOf(peak) };
    };

    const founderLoads: FounderLoad[] = withHours.map(founder => {
        const load = loads.get(founder.id)!;
        const total = load.recurring.map((hours, index) => hours + load.other[index]);
        return {
            ...founder,
            recurring: load.recurring,
            other: load.other,
            firstShortfall: shortfallOf(total, founder.available),
            ...peakOf(total)
        };
    });

    const available = withHours.reduce((sum, founder) => sum + founder.available, 0);
    const committed = founderLoads.reduce((sum, founder) => sum.map((hours, index) => hours + founder.recurring[index]), zeros());
    const needed = founderLoads.reduce(
        (sum, founder) => sum.map((hours, index) => hours + founder.recurring[index] + founder.other[index]),
        unassigned.slice()
    );
    const shortfalls = [shortfallOf(needed, available), ...founderLoads.map(founder => founder.firstShortfall)]
        .filter((index): index is number => index !== null);

    return {
        available,
        needed,
        committed,
        ...peakOf(needed),
        firstShortfall: shortfalls.length > 0 ? Math.min(...shortfalls) : null,
        founders: founderLoads,
        unassigned,
        external: [...external.entries()].map(([id, hours]) => ({
            id, name: names[id] ?? "External professional", hours, peak: Math.max(0, ...hours)
        })),
        unmeasured
    };

}
