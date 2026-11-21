import { parseAmount, parseDecimal } from "./Amounts.ts";
import {
    type BusinessCapabilityValue,
    BUSINESS_PEOPLE_GROUP_IDS,
    type StrategyMonthValue
} from "../answers/AnswerUtils.ts";
import {
    assetUnitCostsOf,
    costSchedule,
    MODEL_MONTHS,
    natureSplitOf,
    streamRevenue,
    streamVolumes,
    type CostLine,
    type FinancialFoundationValue,
    type FinancialSustainabilityValue,
    type NatureContext
} from "./FinancialModel.ts";
import {
    capitalisationLimitOf,
    settingNumber,
    type ChannelFeeRow,
    type GlobalSettingsValue,
    usefulLifeOf,
    amortisationOfCostOption
} from "../GlobalSettings.ts";
import { offeringChannelRevenue, referralOnly, offeringMonthlyRevenue, offeringPayingRevenue } from "../DemandCapacity.ts";
import type { BusinessEngagementValue } from "../businessFoundation/engagementReaders.ts";
import { BUSINESS_CHANNEL_CATEGORIES, BUSINESS_CHANNEL_OTHER } from "../businessFoundation/channelCategories.ts";
import { FEE_CHANNEL_CATEGORIES } from "../channels/ChannelFeeData.ts";
import { foreignFeeNote, foreignFixedFee } from "../GlobalSettings.ts";
import { countryCurrency } from "../legal/LegalEntityJurisdictions.ts";

/*
    THE CALCULATED LINES of the Financial Foundation (cost model, section 7; automatic rules X1 to X5, X11, X12): lines nobody types, worked out from the
    cards, the sales and the Global Settings -- employer on-costs, insurance per employee, channel fees, royalties and partner commissions, depreciation and
    amortisation, the opening inventory released to COGS as it is sold, the accumulated start-up row, and the rate of income tax.

    Everything here is a month-by-month series over the model's months (index 0 is the plan's first month), and a series is zero where its rule does not apply.
    The forecast (FinancialForecast.ts) draws them into the statements; the Page 4 screens will list them.
*/

/** A calculated line: a series with the label it is shown under. */
export interface CalculatedLine {
    id: string;
    label: string;
    values: number[];
}

/** An asset the rules capitalise: what it costs altogether (with its linked services), when it is paid and when it starts to wear. */
export interface CapitalisedAsset {
    /** The id of the card. */
    id: string;
    name: string;
    kind: "physical" | "intangible";
    /** The cost of the asset and the services bundled into it. */
    cost: number;
    /** The plan month (0-based) it is paid in; the first month when it has no date. */
    paidIndex: number;
    /** Years it lasts (useful life) or is amortised over; null while unknown. */
    years: number | null;
    /** Whether it helps to make or deliver the offering (COGS) or does not (OpEx). */
    toCogs: boolean;
}

export interface CalculatedResult {
    /** The plan month the business opens in (0-based; negative when it opens before the plan, null with no Opening Date). */
    openingIndex: number | null;
    /** Employer on-costs on the gross salaries (OpEx). */
    onCosts: CalculatedLine;
    /** Key-person or health insurance for each employee (OpEx). */
    employeeInsurance: CalculatedLine;
    /** Channel fees, royalties and partner commissions: Percentage costs, each a calculated COGS line. */
    percentageLines: (CalculatedLine & { kind: "channel-fee" | "royalty" | "commission" })[];
    /** The assets capitalised, each paid once. */
    assets: CapitalisedAsset[];
    /** Depreciation of the physical assets (non-cash), to OpEx and to COGS. */
    depreciation: { opex: number[]; cogs: number[] };
    /** Amortisation of the intangible assets (non-cash), to OpEx and to COGS. */
    amortisation: { opex: number[]; cogs: number[] };
    /** The cash paid for opening stock, by month, and what of it reaches COGS as it is sold. */
    inventory: { purchased: number[]; released: number[] };
    /** The ids of the lines whose cost before the opening is a Startup or Pre-Operating Expense: written off in the first operating month. */
    startupLineIds: string[];
    /** The ids of the lines that are opening stock: their cash is inventory, not an expense. */
    inventoryLineIds: string[];
    /** The ids of the lines the calculated lines replace (a key-person insurance card, whose price is worked out per employee). */
    replaced: string[];
    /** The income tax rate (0 to 1), from the Global Settings, else the Financial Foundation's; null while none is given. */
    incomeTaxRate: number | null;
    /** What could not be worked out (no useful life, no coefficient). */
    notes: string[];
}

const zeros = () => new Array<number>(MODEL_MONTHS).fill(0);
const round = (value: number) => Math.round(value * 100) / 100;

/** The plan month (0-based) an ISO date falls in; null for no date. */
export function monthIndexOf(iso: string, start: StrategyMonthValue): number | null {
    const date = /^(\d{4})-(\d{2})/.exec(iso);
    const first = /^\d+$/.test(start.year) && /^\d+$/.test(start.month) ? Number(start.year) * 12 + Number(start.month) : null;
    return date && first !== null ? Number(date[1]) * 12 + Number(date[2]) - first : null;
}

/** The months a card is active in (from its Start date to its End date; whole plan where it gives none). */
function activeMonths(line: CostLine, start: StrategyMonthValue): boolean[] {
    const from = monthIndexOf(line.startDate ?? "", start);
    const to = monthIndexOf(line.endDate ?? "", start);
    return Array.from({ length: MODEL_MONTHS }, (_, index) => (from === null || index >= from) && (to === null || index <= to));
}

/** What a card's Percentage price means: its own rate, else the default of its option in the Global Settings. */
function rateOf(line: CostLine, settings: GlobalSettingsValue): number | null {
    const override = settingNumber(line.rateOverride ?? "");
    if (override !== null) {
        return override;
    }
    const typed = parseAmount(line.amountText);
    if (typed !== null && typed > 0) {
        return typed;
    }
    switch (line.costOption) {
        case "royalty-on-sales": return settingNumber(settings.royaltyRate);
        case "affiliate-commission": return settingNumber(settings.affiliateRate);
        case "sales-agents": return settingNumber(settings.agentRate);
        default: return null;
    }
}

/**
 * The row of the Channel Fee Table a card is for: the one whose channel the card's name contains (or is contained by), in the Legal Entity's country (owner,
 * 2026-11-15 15:10; while no country is chosen, the UK's, the table's first). A row with no rate -- not checked yet, or not available there -- is never charged.
 */
/**
 * A SHARE OF REVENUE AS THE FORECAST CHARGES IT, for the places that show it (the Inventory, the Channel Costs): the fee row a card's name takes -- commission and
 * chargebacks, and the fixed fee per order (left out where it is in another currency, with its note) --; null where no row takes the name.
 */
export function chargedFeeFor(name: string, settings: GlobalSettingsValue, country: string, organisationCurrency: string): { percent: number; perOrder: number; text: string; note: string | null } | null {
    const row = channelFeeRowFor(name, settings.channelFees, country);
    if (!row) {
        return null;
    }
    const percent = (settingNumber(row.commission) ?? 0) + (settingNumber(row.chargeback) ?? 0);
    const fixed = settingNumber(row.fixedFee) ?? 0;
    const foreign = foreignFixedFee(row, organisationCurrency);
    const figure = (amount: number) => amount.toLocaleString(undefined, Number.isInteger(amount) ? { maximumFractionDigits: 2 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const text = percent.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "%" + (fixed > 0 ? " + " + (foreign ? row.currency.trim().toUpperCase() + " " : "") + figure(fixed) + " an order" : "");
    return { percent, perOrder: foreign ? 0 : fixed, text, note: foreignFeeNote(row, organisationCurrency) };
}

export function channelFeeRowFor(name: string, table: readonly ChannelFeeRow[], country = ""): ChannelFeeRow | undefined {
    const wanted = name.trim().toLowerCase();
    const where = country.trim() || "GB";
    return wanted === "" ? undefined : table.find(row => {
        if ((row.country || "GB") !== where || row.status === "not-available" || (row.commission.trim() === "" && row.fixedFee.trim() === "")) {
            return false;
        }
        const channel = row.channel.trim().toLowerCase();
        return channel !== "" && (wanted.includes(channel) || channel.split(/[,/]\s*/).some(part => part !== "" && wanted.includes(part)));
    });
}

/**
 * THE SUBCHANNELS THE USER NAMED WHERE A FEE IS TAKEN (owner, 2026-11-15 15:54: "According to the channel/question, it should create also an input for fees, in the
 * global settings"): a subchannel of a paying category (FEE_CHANNEL_CATEGORIES) whose name is none its category lists -- one chosen as "Other" and typed --, each
 * name once. The Global Settings give each a row of its own to fill, where none of the country's rows takes its name.
 */
export function ownFeeChannelNames(engagement: BusinessEngagementValue): string[] {
    const names = engagement.segments.flatMap(segment => segment.channels)
        .filter(channel => FEE_CHANNEL_CATEGORIES.includes(channel.category.trim()))
        .filter(channel => {
            const name = channel.name.trim();
            const listed = BUSINESS_CHANNEL_CATEGORIES.find(category => category.label === channel.category.trim())?.channels.map(entry => entry.label.toLocaleLowerCase()) ?? [];
            return name !== "" && name !== BUSINESS_CHANNEL_OTHER && !listed.includes(name.toLocaleLowerCase());
        })
        .map(channel => channel.name.trim());
    return names.filter((name, at) => names.findIndex(other => other.toLocaleLowerCase() === name.toLocaleLowerCase()) === at);
}

/**
 * THE CHANNEL FEE TABLE RESET (owner, 2026-11-15 15:54: "Create a reset button on the channel fees"): the country's rows from the app's fee data back as the data
 * gives them (a rate changed is restored, a row removed is back); every row the user made, and every other country's row, kept as it is.
 */
export function resetChannelFees(table: readonly ChannelFeeRow[], country: string, data: readonly ChannelFeeRow[]): ChannelFeeRow[] {
    const where = country.trim() || "GB";
    return [...table.filter(row => (row.country || "GB") !== where || row.status === ""), ...data.filter(row => row.country === where)];
}

/**
 * THE ROWS THE GLOBAL SETTINGS SHOW (owner, 2026-11-15 15:10: "only information that is related to the answers should be presented"): the country's rows
 * (the UK's while none is chosen); of those from the app's fee data, the ones a used name takes -- whatever their status, so a provider not checked yet or not
 * available there says so --; and every row the user made.
 */
export function shownChannelFees(table: readonly ChannelFeeRow[], country: string, usedNames: readonly string[]): ChannelFeeRow[] {
    const where = country.trim() || "GB";
    // (Owner, 2026-11-15 16:37: the rows appear by themselves, from the user's own channels; a row whose channel goes, leaves -- a row made by hand too.)
    return table.filter(row => (row.country || "GB") === where &&
        usedNames.some(name => channelFeeRowFor(name, [{ ...row, status: "checked", commission: row.commission || "0" }], where) !== undefined));
}

/**
 * THE ROW OF THE CHANNEL FEE TABLE A SUBCHANNEL PAYS (doc 50, section 1.4: "Match by the name, as the cost lines already do"): the row its own name takes
 * ("Etsy"), else the row the first of its expense cards takes ("SumUp card reader", "Shopify Payments"); with the name it was matched by.
 */
export function channelFeeFor(names: readonly string[], table: readonly ChannelFeeRow[], country = ""): { row: ChannelFeeRow; by: string } | undefined {
    for (const name of names) {
        const row = channelFeeRowFor(name, table, country);
        if (row) {
            return { row, by: name.trim() };
        }
    }
    return undefined;
}

export interface CalculationInput {
    foundation: FinancialFoundationValue;
    revenuePage: FinancialSustainabilityValue;
    lines: readonly CostLine[];
    capability: BusinessCapabilityValue;
    settings: GlobalSettingsValue;
    /** The Opening Date (an ISO date); "" while none is given. */
    openingDate: string;
    /** Whether the owners take drawings rather than a salary (no on-costs then). */
    drawings: boolean;
    /** The Legal Entity's country (ISO code): the Channel Fee Table's rows are read for it. */
    country?: string;
    /** Customer Engagement: which subchannels hold an expense, and each Offering's Customer Sources through them (a channel's share of revenue). */
    engagement?: BusinessEngagementValue;
}

/**
 * THE PART OF EACH OFFERING'S REVENUE A SHARE OF REVENUE IS CHARGED ON (owner, 2026-11-14 23:30: "A SHARE OF REVENUE IS A RATE, NOT A SPLIT"; 20:25: a
 * channel's by what each Offering sells through the expense's own subchannels; 2026-11-15 15:32, the forecast as the Inventory): 1 -- the whole of its own
 * revenue, at the full rate, whatever shares the card holds --, or, for an expense a subchannel holds, the part of the Offering's expected sales that its
 * Customer Sources make through those subchannels (0 where it sells nothing there). Where no Customer Source names them, the whole revenue.
 * A FEE FOLLOWS WHERE THEY PAY (owner, 2026-11-17 09:09, option (a)): given the subchannels a fee of their own covers (`paying`), the part is what the Offering's
 * customers pay at those subchannels (offeringPayingRevenue) -- a commission keeps the part its Customer Sources make there.
 */
export function revenueFractions(lineId: string, offeringIds: readonly string[], engagement: BusinessEngagementValue | undefined, revenuePage: FinancialSustainabilityValue, paying?: ReadonlySet<string>): Record<string, number> {
    const whole = Object.fromEntries(offeringIds.map(id => [id, 1]));
    if (!engagement) {
        return whole;
    }
    const channels = engagement.segments.flatMap(segment => segment.channels);
    const keys = [...new Set(engagement.channelResources
        .filter(link => link.resourceId === lineId)
        .map(link => channels.find(channel => channel.id === link.channelId))
        .filter((channel): channel is NonNullable<typeof channel> => channel !== undefined)
        .map(channel => channel.category.trim() + "\u0001" + channel.name.trim()))];
    if (keys.length === 0) {
        return whole;
    }
    const byChannel = paying ? offeringPayingRevenue(engagement.demand, revenuePage.streams, engagement.segments, paying) : offeringChannelRevenue(engagement.demand, revenuePage.streams, channels);
    const total = offeringMonthlyRevenue(engagement.demand, revenuePage.streams);
    const through = Object.fromEntries(offeringIds.map(id => [id, keys.reduce((sum, key) => sum + (byChannel[id]?.[key] ?? 0), 0)]));
    if (!offeringIds.some(id => through[id] > 0)) {
        return whole;
    }
    return Object.fromEntries(offeringIds.map(id => [id, (total[id] ?? 0) > 0 ? Math.min(1, through[id] / total[id]) : 0]));
}

/** An offering's revenue, units and orders, month by month, from its revenue streams. */
function offeringFlows(page: FinancialSustainabilityValue, start: StrategyMonthValue) {
    const flows = new Map<string, { revenue: number[]; units: number[]; orders: number[] }>();
    page.streams.forEach(stream => {
        const flow = flows.get(stream.offeringId) ?? { revenue: zeros(), units: zeros(), orders: zeros() };
        const earned = streamRevenue(stream, start).earned;
        const volumes = streamVolumes(stream, start);
        const perOrder = Math.max(1, parseDecimal(stream.itemsPerOrder) ?? 1);
        for (let index = 0; index < MODEL_MONTHS; index++) {
            flow.revenue[index] += earned[index];
            flow.units[index] += volumes[index];
            flow.orders[index] += volumes[index] / perOrder;
        }
        flows.set(stream.offeringId, flow);
    });
    return flows;
}

export function calculatedLines(input: CalculationInput, fromFoundationRate: number | null = null): CalculatedResult {

    const { foundation, lines, capability, settings, openingDate } = input;
    const start = foundation.planStart;
    const notes: string[] = [];
    const flows = offeringFlows(input.revenuePage, start);
    const context: NatureContext = {
        openingDate,
        capitalisationLimit: capitalisationLimitOf(settings),
        assetUnitCosts: assetUnitCostsOf(capability)
    };
    const natureOf = (line: CostLine) => natureSplitOf(line, context, foundation.classified[line.id]?.nature ?? "");
    const openingIndex = monthIndexOf(openingDate, start);
    const counted = lines.filter(line => line.counted && line.amount !== null);

    /* Employer on-costs (X3): the gross salaries x the coefficient; and the headcount that key-person or health cover is for. */
    const isPay = (line: CostLine) =>
        (line.id.startsWith("salary-") && !input.drawings) ||
        (line.place !== undefined && (BUSINESS_PEOPLE_GROUP_IDS as readonly string[]).includes(line.groupId ?? "") && line.frequency === "monthly");
    const salaries = zeros();
    const headcount = zeros();
    counted.filter(isPay).forEach(line => {
        const paid = costSchedule(line, start);
        const people = line.id.startsWith("salary-") ? 1 : Math.max(1, line.quantity ?? 1);
        paid.forEach((amount, index) => {
            salaries[index] += amount;
            headcount[index] += amount > 0 ? people : 0;
        });
    });
    const coefficient = settingNumber(settings.onCostRate);
    if (coefficient === null && salaries.some(amount => amount > 0)) {
        notes.push("No employer on-cost coefficient is set in the Global Settings: no on-costs are calculated.");
    }
    const onCosts: CalculatedLine = { id: "on-costs", label: "Employer on-costs", values: salaries.map(amount => round(amount * (coefficient ?? 0) / 100)) };

    const keyPersonCards = counted.filter(line => line.costOption === "key-person-health");
    const perEmployee = settingNumber(settings.insurancePerEmployee);
    const employeeInsurance: CalculatedLine = {
        id: "employee-insurance",
        label: "Key-person & health insurance",
        values: keyPersonCards.length > 0 ? headcount.map(people => round(people * (perEmployee ?? parseAmount(keyPersonCards[0].amountText) ?? 0))) : zeros()
    };

    /* Channel fees, royalties and partner commissions (X4, X5): a Percentage cost is a rate of the revenue it follows, a calculated COGS line. */
    const organisationCurrency = countryCurrency(input.country ?? "");
    const percentageLines: CalculatedResult["percentageLines"] = [];
    const kindOf = (line: CostLine) => line.costOption === "royalty-on-sales" ? "royalty"
        : line.costOption === "affiliate-commission" || line.costOption === "sales-agents" ? "commission"
            : "channel-fee";
    // (A FEE FOLLOWS WHERE THEY PAY, A COMMISSION ITS SOURCE (owner, 2026-11-17 09:09, option (a)): a fee -- a marketplace's, a payment service's -- is charged on
    // what is paid at its subchannels; a commission, a royalty, or a cost held by referral and affiliate subchannels only, on what the Customer Sources naming them make.)
    const links = input.engagement?.channelResources ?? [];
    const allChannels = (input.engagement?.segments ?? []).flatMap(segment => segment.channels);
    const heldByReferrals = (id: string) => referralOnly(links.filter(link => link.resourceId === id).map(link => allChannels.find(channel => channel.id === link.channelId)?.category ?? "").filter(Boolean));
    const percentCounted = counted.filter(line => line.billing === "percentage" || line.frequency === "usage-based");
    const noPriceFees = [...capability.offering.providers, ...capability.providers, ...capability.offering.professionals, ...capability.professionals]
        .filter(card => card.cost.frequency === "percent-revenue" && parseAmount(card.cost.price) === null && !counted.some(line => line.id === card.id))
        .filter(card => channelFeeRowFor(card.name, settings.channelFees, input.country ?? "") !== undefined);
    const feeIds = new Set([...percentCounted.filter(line => kindOf(line) === "channel-fee").map(line => line.id), ...noPriceFees.map(card => card.id)].filter(id => !heldByReferrals(id)));
    const paying = new Set(links.filter(link => feeIds.has(link.resourceId)).map(link => link.channelId));
    percentCounted.forEach(line => {
        const ids = line.offeringIds.length > 0 && !line.offeringIds.includes("*") ? line.offeringIds : [...flows.keys()];
        // (A rate of each Offering's own revenue: never shared out between them, owner, 2026-11-15 15:32.)
        const shares = revenueFractions(line.id, ids, input.engagement, input.revenuePage, feeIds.has(line.id) ? paying : undefined);
        const active = activeMonths(line, start);
        const table = channelFeeRowFor(line.name, settings.channelFees, input.country ?? "");
        const percent = table ? (settingNumber(table.commission) ?? 0) + (settingNumber(table.chargeback) ?? 0) : rateOf(line, settings);
        // (A fixed fee in another currency is left out of the totals, and said so: foreignFixedFee.)
        const fixed = table && !foreignFixedFee(table, organisationCurrency) ? settingNumber(table.fixedFee) ?? 0 : 0;
        const foreign = table ? foreignFeeNote(table, organisationCurrency) : null;
        if (foreign && !notes.includes(line.name + ": " + foreign)) {
            notes.push(line.name + ": " + foreign);
        }
        if (percent === null) {
            notes.push(line.name + ": no rate is given, and the Global Settings have none for its option.");
            return;
        }
        const values = zeros();
        ids.forEach(id => {
            const flow = flows.get(id);
            const share = shares[id] ?? 0;
            if (flow) {
                for (let index = 0; index < MODEL_MONTHS; index++) {
                    if (active[index]) {
                        values[index] += (flow.revenue[index] * percent / 100 + flow.orders[index] * fixed) * share;
                    }
                }
            }
        });
        percentageLines.push({ id: line.id, label: line.name, kind: kindOf(line), values: values.map(round) });
    });

    /* A PAYMENT SERVICE'S OR A MARKETPLACE'S CARD WITH NO PRICE (owner, 2026-11-15 16:37: "a payment service's fee should reach the forecast through its fee row"): a
       "% of revenue" partner or supplier card whose name takes the country's row of the Channel Fee Table is charged from that row -- the cards the answers make
       carry no price --, on its Offerings' revenue through its subchannels, from its Start to its End. A card with a price is a line of its own above, so it is never
       charged twice. */
    noPriceFees
        .forEach(card => {
            const row = channelFeeRowFor(card.name, settings.channelFees, input.country ?? "")!;
            const ids = card.offeringIds.length > 0 && !card.offeringIds.includes("*") ? card.offeringIds : [...flows.keys()];
            const shares = revenueFractions(card.id, ids, input.engagement, input.revenuePage, feeIds.has(card.id) ? paying : undefined);
            const active = activeMonths({ startDate: card.startDate, endDate: card.endDate } as CostLine, start);
            const percent = (settingNumber(row.commission) ?? 0) + (settingNumber(row.chargeback) ?? 0);
            const fixed = foreignFixedFee(row, organisationCurrency) ? 0 : settingNumber(row.fixedFee) ?? 0;
            const foreign = foreignFeeNote(row, organisationCurrency);
            if (foreign && !notes.includes(card.name + ": " + foreign)) {
                notes.push(card.name + ": " + foreign);
            }
            const values = zeros();
            ids.forEach(id => {
                const flow = flows.get(id);
                if (flow) {
                    for (let index = 0; index < MODEL_MONTHS; index++) {
                        if (active[index]) {
                            values[index] += (flow.revenue[index] * percent / 100 + flow.orders[index] * fixed) * (shares[id] ?? 0);
                        }
                    }
                }
            });
            percentageLines.push({ id: card.id, label: card.name, kind: "channel-fee", values: values.map(round) });
        });

    /* Assets (X1, X2): what the rules capitalise, with the services bundled into it. */
    const assets: CapitalisedAsset[] = [];
    counted.filter(line => !line.capitalisedInto).forEach(line => {
        const split = natureOf(line);
        const capitalised = split.before?.nature === "capex" || split.after === "capex";
        if (!capitalised || line.amount === null) {
            return;
        }
        const services = counted.filter(entry => entry.capitalisedInto === line.id).reduce((sum, entry) => sum + (entry.amount ?? 0), 0);
        const intangible = line.billing === "lump-sum";
        const years = intangible
            ? settingNumber(line.amortisationYears ?? "") ?? amortisationOfCostOption(settings, line.costOption ?? "")
            : settingNumber(line.usefulLife ?? "") ?? usefulLifeOf(settings, line.groupId ?? "");
        if (years === null || years <= 0) {
            notes.push((line.name || "An asset") + ": no " + (intangible ? "amortisation period" : "useful life") + " is given, and the Global Settings have none for its group: no " + (intangible ? "amortisation" : "depreciation") + ".");
        }
        assets.push({
            id: line.id,
            name: line.name,
            kind: intangible ? "intangible" : "physical",
            cost: round(line.amount + services),
            paidIndex: Math.max(0, monthIndexOf(line.startDate ?? "", start) ?? 0),
            years: years !== null && years > 0 ? years : null,
            toCogs: line.place === "offering"
        });
    });

    /* Depreciation and amortisation: cost / life, from the Opening Date for an asset bought before it and from the month it is ready for one bought after it. */
    const depreciation = { opex: zeros(), cogs: zeros() };
    const amortisation = { opex: zeros(), cogs: zeros() };
    const assetLine = (asset: CapitalisedAsset) => lines.find(line => line.id === asset.id) as CostLine;
    assets.forEach(asset => {
        if (asset.years === null) {
            return;
        }
        const line = assetLine(asset);
        const opening = openingIndex ?? 0;
        const first = Math.max(asset.paidIndex, opening);
        const ends = monthIndexOf(line.endDate ?? "", start);
        const into = asset.kind === "intangible" ? amortisation : depreciation;
        const target = asset.toCogs ? into.cogs : into.opex;
        const monthly = asset.cost / (asset.years * 12);
        for (let index = Math.max(0, first); index < MODEL_MONTHS && index < first + Math.round(asset.years * 12) && (ends === null || index <= ends); index++) {
            target[index] += monthly;
        }
    });

    /* Opening stock (C14, X11): cash before the opening, which becomes Inventory and reaches COGS as the units are sold. */
    const purchased = zeros();
    const released = zeros();
    let held = 0;
    const stockLines = counted.filter(line => natureOf(line).before?.nature === "inventory");
    stockLines.forEach(line => {
        const at = Math.max(0, monthIndexOf(line.startDate ?? "", start) ?? 0);
        purchased[at] += natureOf(line).before?.amount ?? 0;
    });
    const stockUnitCost = stockLines.length > 0 ? stockLines.reduce((sum, line) => sum + (line.unitAmount ?? line.amount ?? 0), 0) / stockLines.length : 0;
    const firstSale = Math.max(0, openingIndex ?? 0);
    for (let index = 0; index < MODEL_MONTHS; index++) {
        held += purchased[index];
        if (index >= firstSale && held > 0) {
            const sold = [...flows.values()].reduce((sum, flow) => sum + flow.units[index], 0) * stockUnitCost;
            const reaching = Math.min(held, sold);
            released[index] = round(reaching);
            held -= reaching;
        }
    }

    /* The Startup and Pre-Operating Expenses written off in the first operating month (X12). */
    const startupLineIds = counted.filter(line => {
        const before = natureOf(line).before;
        return before !== null && (before.nature === "startup" || before.nature === "pre-operating");
    }).map(line => line.id);

    const replaced = keyPersonCards.map(line => line.id);
    // (Wholly before the opening: a stock line that runs on after it is a cost like any other from then.)
    const inventoryLineIds = stockLines.filter(line => natureOf(line).after === null).map(line => line.id);

    return {
        openingIndex,
        onCosts,
        employeeInsurance,
        percentageLines,
        assets,
        depreciation: { opex: depreciation.opex.map(round), cogs: depreciation.cogs.map(round) },
        amortisation: { opex: amortisation.opex.map(round), cogs: amortisation.cogs.map(round) },
        inventory: { purchased, released },
        startupLineIds,
        inventoryLineIds,
        replaced,
        // (Page 4's Plan Settings own the rate: doc 5, section 5.5.6.)
        incomeTaxRate: fromFoundationRate,
        notes
    };

}
