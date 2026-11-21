/* Part of FinancialModel.ts (FinancialModel.ts re-exports every part). */

import { type CostLine } from "./costs.ts";
import { offeringCosts } from "./offeringCosts.ts";
import { type StreamAnalysis } from "./breakEven.ts";
import { deliveryAllocation, deliveryHours, type DeliveryValue } from "../DemandCapacity.ts";

/* ==========================================================
   The cost of each Offering (Questions 20, 15.2)
========================================================== */

/** One Offering's sale: what it is sold for, what it costs, and what is left. */
export interface OfferingEconomicsRow {
    streamId: string;
    offeringId: string;
    /** The price of one, as break even counts it (a recurring charge: a month of one client). */
    price: number | null;
    /** Sales a month at the normal level (a recurring Offering: its active clients). */
    sales: number;
    /** Its own costs of each sale: materials, per-order and per-project costs, the fees of the channels it sells through. */
    direct: number;
    /** The founders' delivery hours one sale takes (Capacity & Delivery); null where none is given. */
    hours: number | null;
    /** The running costs a month that serve this Offering alone (its own tools and equipment). */
    ownMonthly: number;
    /** Its share of the running costs, for one sale. */
    runningOfOne: number;
    /** How the shared running costs reached it: by the hours one sale takes, or (no hours given) by its share of the revenue. */
    sharedBy: "hours" | "revenue";
    full: number;
    /** Price less the direct cost: what one sale gives towards the running costs. */
    contribution: number | null;
    /** (Price less the full cost) as a share of the price. */
    margin: number | null;
}

export interface OfferingEconomics {
    /** The running costs a month, all of them. */
    running: number;
    /** Those that serve one Offering alone, together. */
    own: number;
    /** The rest, shared among the Offerings. */
    shared: number;
    /** The founders' delivery hours available a month (the hours they can give, not the hours sold). */
    hoursAvailable: number | null;
    /** The shared running costs for each delivery hour available. */
    rate: number | null;
    rows: OfferingEconomicsRow[];
}

/**
 * THE COST OF EACH OFFERING (Questions 20, 15.2; owner, 2026-11-21 00:56 UTC+2: "It would have been better to define the costs of each offering"), time-driven
 * activity-based costing with the founders' delivery hours as the one driver (Kaplan and Anderson, 2004): the running costs that serve one Offering alone are
 * its own; the rest are shared at a rate for each delivery hour AVAILABLE, so each Offering carries only the time it takes and hours left over stay free;
 * an Offering with no hours per sale takes its share by its revenue. The direct cost is break even's (`StreamAnalysis.variable`). How the running costs are
 * shared changes each Offering's cost, never the total profit.
 */
export function offeringEconomics(
    outlook: { inputs: { fixed: number }; streams: readonly StreamAnalysis[] },
    lines: CostLine[],
    hoursAvailable: number | null,
    hoursPerSale: Record<string, number | null>
): OfferingEconomics {

    const running = Math.max(0, outlook.inputs.fixed);
    const offeringIds = [...new Set(outlook.streams.map(entry => entry.stream.offeringId).filter(Boolean))];
    const ownOf = Object.fromEntries(offeringIds.map(id => [id, offeringCosts(lines, id).fixedMonthly]));
    const own = Math.min(running, offeringIds.reduce((sum, id) => sum + ownOf[id], 0));
    const shared = Math.max(0, running - own);
    const rate = hoursAvailable !== null && hoursAvailable > 0 ? shared / hoursAvailable : null;
    const totalRevenue = outlook.streams.reduce((sum, entry) => sum + entry.revenue, 0);
    // (An Offering with more than one stream: its own costs are shared by its streams' revenue.)
    const offeringRevenue = (id: string) => outlook.streams.filter(entry => entry.stream.offeringId === id).reduce((sum, entry) => sum + entry.revenue, 0);

    const rows = outlook.streams.map(entry => {
        const id = entry.stream.offeringId;
        const hours = hoursPerSale[id] ?? null;
        const streamShare = offeringRevenue(id) > 0 ? entry.revenue / offeringRevenue(id) : 1;
        const ownMonthly = (ownOf[id] ?? 0) * streamShare;
        const ownOfOne = entry.volume > 0 ? ownMonthly / entry.volume : 0;
        const byHours = hours !== null && hours > 0 && rate !== null;
        const sharedOfOne = byHours
            ? hours * rate
            : entry.volume > 0 && totalRevenue > 0 ? shared * (entry.revenue / totalRevenue) / entry.volume : 0;
        const runningOfOne = sharedOfOne + ownOfOne;
        const full = entry.variable + runningOfOne;
        return {
            streamId: entry.stream.id,
            offeringId: id,
            price: entry.price,
            sales: entry.volume,
            direct: entry.variable,
            hours,
            ownMonthly,
            runningOfOne,
            sharedBy: byHours ? "hours" as const : "revenue" as const,
            full,
            contribution: entry.contribution,
            margin: entry.price !== null && entry.price > 0 ? (entry.price - full) / entry.price : null
        };
    });

    return { running, own, shared, hoursAvailable, rate, rows };

}

/**
 * The same, from Infrastructure & Capability's answer as the pages hold it: the founders' delivery hours available, and the founders' hours one sale of each
 * Offering takes (Capacity & Delivery; an outside person's hours are a cost of their own, on their card). Cost of each Offering and each Revenue Stream read this.
 */
export function offeringEconomicsOf(
    outlook: { inputs: { fixed: number }; streams: readonly StreamAnalysis[] },
    lines: CostLine[],
    capability: { founders: readonly (Parameters<typeof deliveryHours>[0][number] & { id: string })[]; delivery: Record<string, DeliveryValue | undefined> }
): OfferingEconomics {
    const founderIds = new Set(capability.founders.map(founder => founder.id));
    const hoursPerSale = Object.fromEntries(outlook.streams.map(entry => {
        const founders = Object.entries(deliveryAllocation(capability.delivery[entry.stream.offeringId]))
            .filter(([personId]) => personId === "" || founderIds.has(personId))
            .reduce((sum, [, hours]) => sum + hours, 0);
        return [entry.stream.offeringId, founders > 0 ? founders : null];
    }));
    return offeringEconomics(outlook, lines, deliveryHours(capability.founders), hoursPerSale);
}
