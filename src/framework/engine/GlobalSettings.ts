import { parseAmount } from "./Amounts.ts";
import { randomId } from "./Readers.ts";
import { DEFAULT_STAGE_DURATIONS, type StageDurations } from "./BusinessStage.ts";
import { CHANNEL_FEE_DATA, FEE_COUNTRIES, type ChannelFeeStatus } from "./ChannelFeeData.ts";

/*
    GLOBAL SETTINGS (the cost model, section 6): the rates and limits the calculated lines read, held in ONE place so that when a rate changes
    every calculated line follows and nobody calculates an on-cost or a fee by hand. They belong to the Organization (its country sets most of them),
    are edited on their own screen, and are not part of the Legal Entity.

    Holds: the employer on-cost coefficient, the Channel Fee Table, the default rates of royalties and commissions, the capitalisation limit, the default
    useful life of each asset group, the target operating reserve months, the insurance per employee and the corporate income tax rate.
    (The Opening Date and the business stages' durations are kept here too: the Opening Date is set on the Organization tile.)

    A figure is kept as the text typed ("" is not set); the readers below turn it into a number where one is needed.
*/

/** One line of the Channel Fee Table: what a channel takes of each sale. */
export interface ChannelFeeRow {
    id: string;
    /** The channel or platform: "Stripe", "Wolt, Amazon". */
    channel: string;
    /** Commission, a percentage of the channel's revenue. */
    commission: string;
    /** A fixed fee for each order. */
    fixedFee: string;
    /** The chargeback or risk allowance, a percentage of the channel's revenue. */
    chargeback: string;
    note: string;
    /** The country it applies in (ISO code): the Organization's Legal Entity country reads its own rows (owner, 2026-11-15 15:10). */
    country: string;
    /** The currency of its fixed fee. */
    currency: string;
    /** From the app's fee data: checked, not checked, or not available there; "" for a row the user made. */
    status: ChannelFeeStatus | "";
}

export interface GlobalSettingsValue {
    /** The Opening Date (an ISO date): the day the business opens and issues its first receipt. It is entered on the Organization tile (Identity System) and shown in the Global Settings' Business stages. */
    openingDate: string;
    /** How long each business stage lasts (BusinessStage.ts), whole numbers as typed: Planning, Launching and Managing in months, Growing in years. The Opening Date is where they start. */
    stageDurations: { planning: string; launching: string; managing: string; growing: string };
    /** Employer on-costs: one percentage of the gross salaries, for the country. */
    onCostRate: string;
    channelFees: ChannelFeeRow[];
    /** The version of the app's fee data the table holds (CHANNEL_FEE_DATA_VERSION); an older table is given the rows it lacks once. */
    channelFeeDataVersion: number;
    /** The default rate (%) of a royalty on sales. */
    royaltyRate: string;
    /** The default rate (%) of an affiliate network or influencer commission. */
    affiliateRate: string;
    /** The default rate (%) of a sales agent or B2B broker. */
    agentRate: string;
    /** A one-time purchase is CapEx at or above it, OpEx below. */
    capitalisationLimit: string;
    /** Years, by asset group id: the useful life of a card that sets none of its own. */
    usefulLife: Record<string, string>;
    /** Years, by intangible group id (AMORTISATION_GROUPS): the amortisation of a card that sets none of its own. */
    amortisation: Record<string, string>;
    /** Months of OpEx the Operational Contingency Fund builds up to. */
    targetReserveMonths: string;
    /** The Startup Contingency Fund, a percentage (usually 10 to 20: NYU Entrepreneurship, The Runway Equation, 2025) of the Total Pre-operational Budget. */
    startupContingencyRate: string;
    /** The Operational Contingency Fund: the percentage (3 to 5) of a month's OpEx set aside each month, until the target is reached. */
    operationalContingencyRate: string;
    /** An amount a month, for key-person and health cover. */
    insurancePerEmployee: string;
    // (No income tax rate: Page 4's Plan Settings own it, doc 5, section 5.5.6. A rate saved here before is moved there once: moveGlobalIncomeTax.)
}

/** The asset groups whose cards have a useful life, in the order the screen lists them. */
export const USEFUL_LIFE_GROUPS = [
    { id: "furniture-fittings", label: "Furniture & Fittings" },
    { id: "devices-tools", label: "Devices & Tools" },
    { id: "company-vehicles", label: "Company Vehicles" },
    { id: "fixtures-displays", label: "Fixtures & Displays" },
    { id: "production-machinery", label: "Production Machinery" },
    { id: "delivery-vehicles", label: "Delivery Vehicles" }
] as const;

/** The asset groups by category, in the order the screen lists them (Workstation, Equipment, Vehicles). */
export const USEFUL_LIFE_CATEGORIES: readonly { id: string; label: string; groups: readonly string[] }[] = [
    { id: "workstation", label: "Workstation", groups: ["furniture-fittings", "fixtures-displays"] },
    { id: "equipment", label: "Equipment", groups: ["devices-tools", "production-machinery"] },
    { id: "vehicles", label: "Vehicles", groups: ["company-vehicles", "delivery-vehicles"] }
];

/**
 * THE INTANGIBLE ASSETS (amortisation): the groups of one-time payments that buy a right, not a thing, and the years their cost is spread over. A card of a lump-sum
 * cost option (an initial permit or licence, an upfront franchise fee) takes its group's years where it sets none of its own (`usedBy`); the others are the usual
 * categories, kept to be edited and shown beside them. Straight line, nothing left at the end.
 */
export const AMORTISATION_GROUPS: readonly { id: string; label: string; years: string; usedBy: string; note: string }[] = [
    { id: "software-licences", label: "Software & digital licences", years: "3", usedBy: "", note: "Bought software and licences: 3 to 5 years (3 where it changes fast); purchased software outside an acquisition is 36 months for US tax." },
    { id: "website-domain", label: "Website & domain name", years: "3", usedBy: "", note: "A website is usually written off over 3 years; a domain name over the 10 it is registered for." },
    { id: "trademarks-brand", label: "Trademarks, patents & brand", years: "10", usedBy: "", note: "A registered trademark lasts 10 years and is renewed; many companies use 10 to 15. A brand that can be renewed without limit may have no amortisation at all (IAS 38)." },
    { id: "franchise-licences", label: "Franchise & master licence rights", years: "10", usedBy: "franchise-fee", note: "Spread over the term of the agreement, renewals not counted; 10 years where no term is given." },
    { id: "permits-licences", label: "Permits & operating licences", years: "5", usedBy: "initial-permit", note: "Spread over the period the permit or licence grants; 5 years where it is open ended. Ask an adviser for the term." }
];

/** The default years of each intangible group, edited in the Global Settings. */
export const DEFAULT_AMORTISATION: Record<string, string> = Object.fromEntries(AMORTISATION_GROUPS.map(group => [group.id, group.years]));

/** The default useful life of each group, in years, from the Texas state asset schedule in UsefulLifeReferences.ts (the figure its main items share); the user edits them. */
export const DEFAULT_USEFUL_LIFE: Record<string, string> = {
    "furniture-fittings": "10",
    "devices-tools": "6",
    "company-vehicles": "5",
    "fixtures-displays": "10",
    "production-machinery": "15",
    "delivery-vehicles": "7"
};

/** The version of the app's fee data (ChannelFeeData.ts): raised when rows are added, so a saved table is given them once. */
export const CHANNEL_FEE_DATA_VERSION = 3;

/** The providers version 3 of the fee data adds (owner, 2026-11-17 07:16): their rows are given to a table saved at version 2. */
const NEW_IN_VERSION_3: readonly string[] = ["PayPal Point of Sale", "eBay (private seller)"];

/**
 * A row of the app's fee data as version 2 left it and nobody changed since (owner, 2026-11-17 07:16): not checked, with the figures version 2 gave it (none, or
 * Fiverr's 20% from a secondary source). Such a row takes version 3's values; a row the founder checked, filled in or changed keeps what it holds.
 */
function untouchedVersion2(row: ChannelFeeRow): boolean {
    const fiverr = row.channel.trim() === "Fiverr" && row.commission === "20" && row.fixedFee === "0";
    return row.status === "not-checked" && (fiverr || (row.commission === "" && row.fixedFee === "" && row.chargeback === ""));
}

/** A row's id from the app's fee data: the provider and the country, so the same row keeps its id. */
const dataRowId = (provider: string, country: string): string => "fee-" + provider.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + country.toLowerCase();

/**
 * THE CHANNEL FEE TABLE TO START FROM: every row of the app's fee data (ChannelFeeData.ts), each provider in each of the six countries -- checked, not checked
 * (no rate) or not available (owner, 2026-11-15 15:11). A card or subchannel named after one takes its country's row (channelFeeRowFor: the more particular
 * name first, Stripe Terminal before Stripe).
 */
function exampleChannelFees(): ChannelFeeRow[] {
    return CHANNEL_FEE_DATA.map(datum => ({
        id: dataRowId(datum.provider, datum.country),
        channel: datum.provider,
        commission: datum.commission,
        fixedFee: datum.fixedFee,
        chargeback: datum.chargeback,
        note: datum.note,
        country: datum.country,
        currency: datum.currency,
        status: datum.status
    }));
}

/** The stages' default durations as text, as the settings hold them. */
export function defaultStageDurationTexts(): GlobalSettingsValue["stageDurations"] {
    return {
        planning: String(DEFAULT_STAGE_DURATIONS.planning),
        launching: String(DEFAULT_STAGE_DURATIONS.launching),
        managing: String(DEFAULT_STAGE_DURATIONS.managing),
        growing: String(DEFAULT_STAGE_DURATIONS.growing)
    };
}

/** What a new Organization starts with: the cost model's examples where it gives them, and nothing where a figure is the country's or the user's own. */
export function createGlobalSettings(): GlobalSettingsValue {
    return {
        openingDate: "",
        stageDurations: defaultStageDurationTexts(),
        onCostRate: "",
        channelFees: exampleChannelFees(),
        channelFeeDataVersion: CHANNEL_FEE_DATA_VERSION,
        royaltyRate: "10",
        affiliateRate: "15",
        agentRate: "10",
        capitalisationLimit: "",
        usefulLife: { ...DEFAULT_USEFUL_LIFE },
        amortisation: { ...DEFAULT_AMORTISATION },
        targetReserveMonths: "3",
        startupContingencyRate: "10",
        operationalContingencyRate: "4",
        insurancePerEmployee: ""
    };
}

/** A row the user adds, for the Organization's country. */
export function createChannelFeeRow(country = ""): ChannelFeeRow {
    return { id: randomId("fee"), channel: "", commission: "", fixedFee: "", chargeback: "", note: "", country, currency: FEE_COUNTRIES.find(entry => entry.code === country)?.currency ?? "", status: "" };
}

const FEE_STATUSES: readonly string[] = ["checked", "not-checked", "not-available"];

/**
 * THE SAVED CHANNEL FEE TABLE: each row as saved, a row from before the countries the UK's (owner, 2026-11-15 15:10: "existing rows become GB"); a table from
 * before this version of the app's fee data is given, once, every row of it that it does not hold (the same provider in the same country).
 */
function savedChannelFees(entries: readonly unknown[], version: unknown): ChannelFeeRow[] {
    // (THE OLD COMBINED ROW "Wolt, Amazon" (the first table's) is gone: each provider has its own row in each country now; owner, 2026-11-15 16:37.)
    const rows: ChannelFeeRow[] = entries.filter(entry => asText(asObject(entry).channel).trim().toLowerCase() !== "wolt, amazon").map(entry => {
        const row = asObject(entry);
        const country = asText(row.country) || "GB";
        return {
            id: asText(row.id) || randomId("fee"),
            channel: asText(row.channel),
            commission: figure(row.commission),
            fixedFee: figure(row.fixedFee),
            chargeback: figure(row.chargeback),
            note: asText(row.note),
            country,
            currency: asText(row.currency) || (FEE_COUNTRIES.find(item => item.code === country)?.currency ?? ""),
            // (A row from before the statuses that the app's fee data holds for its country takes that row's status: it came from it.)
            status: FEE_STATUSES.includes(asText(row.status))
                ? asText(row.status) as ChannelFeeStatus
                : CHANNEL_FEE_DATA.find(datum => datum.country === country && datum.provider.toLowerCase() === asText(row.channel).trim().toLowerCase())?.status ?? ""
        };
    });
    if (typeof version === "number" && version >= CHANNEL_FEE_DATA_VERSION) {
        return rows;
    }
    // (FROM VERSION 2 (owner, 2026-11-17 07:16): the app's rows in the data's order -- each the founder left untouched takes version 3's values, each new provider's
    // added, a row the founder removed stays removed --, then the founder's own rows.)
    if (version === 2) {
        const data = exampleChannelFees();
        const appRows = data.flatMap(datum => {
            const saved = rows.find(row => row.id === datum.id);
            if (saved) {
                return [untouchedVersion2(saved) ? datum : saved];
            }
            return NEW_IN_VERSION_3.includes(datum.channel) ? [datum] : [];
        });
        return [...appRows, ...rows.filter(row => !data.some(datum => datum.id === row.id))];
    }
    const held = new Set(rows.map(row => row.channel.trim().toLowerCase() + "|" + row.country));
    return [...rows, ...exampleChannelFees().filter(row => !held.has(row.channel.trim().toLowerCase() + "|" + row.country))];
}

/** A figure as typed: digits and at most one point; anything else is dropped. */
function figure(value: unknown): string {
    const text = typeof value === "string" ? value : typeof value === "number" && Number.isFinite(value) ? String(value) : "";
    const cleaned = text.replace(/[^0-9.]/g, "");
    const at = cleaned.indexOf(".");
    return at === -1 ? cleaned : cleaned.slice(0, at + 1) + cleaned.slice(at + 1).replace(/\./g, "");
}

const asObject = (value: unknown): Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

const asText = (value: unknown): string => typeof value === "string" ? value : "";

/** The settings as saved: absent, they are a new Organization's; present, exactly what was saved (a cleared figure stays cleared). */
export function asGlobalSettings(value: unknown): GlobalSettingsValue {
    if (value === undefined || value === null) {
        return createGlobalSettings();
    }
    const source = asObject(value);
    const life = asObject(source.usefulLife);
    const amortised = asObject(source.amortisation);
    return {
        openingDate: typeof source.openingDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(source.openingDate) ? source.openingDate : "",
        // (Absent in an older save: the defaults; present, as it was saved, whole numbers only.)
        stageDurations: (() => {
            const saved = asObject(source.stageDurations);
            const defaults = defaultStageDurationTexts();
            const whole = (value: unknown, fallback: string) => value === undefined ? fallback : figure(value).replace(/\..*$/, "");
            return {
                planning: whole(saved.planning, defaults.planning),
                launching: whole(saved.launching, defaults.launching),
                managing: whole(saved.managing, defaults.managing),
                growing: whole(saved.growing, defaults.growing)
            };
        })(),
        onCostRate: figure(source.onCostRate),
        channelFees: Array.isArray(source.channelFees) ? savedChannelFees(source.channelFees, source.channelFeeDataVersion) : exampleChannelFees(),
        channelFeeDataVersion: CHANNEL_FEE_DATA_VERSION,
        royaltyRate: figure(source.royaltyRate),
        affiliateRate: figure(source.affiliateRate),
        agentRate: figure(source.agentRate),
        capitalisationLimit: figure(source.capitalisationLimit),
        usefulLife: Object.fromEntries(USEFUL_LIFE_GROUPS.map(group => [group.id, figure(life[group.id])]).filter(([, years]) => years !== "")),
        // (Absent in an older save: the defaults; present, as it was saved.)
        amortisation: source.amortisation === undefined
            ? { ...DEFAULT_AMORTISATION }
            : Object.fromEntries(AMORTISATION_GROUPS.map(group => [group.id, figure(amortised[group.id])]).filter(([, years]) => years !== "")),
        targetReserveMonths: figure(source.targetReserveMonths),
        startupContingencyRate: figure(source.startupContingencyRate),
        operationalContingencyRate: figure(source.operationalContingencyRate),
        insurancePerEmployee: figure(source.insurancePerEmployee)
    };
}

/** The stages' durations as numbers; a duration left empty or at 0 takes its default (a stage cannot last no time). */
export function stageDurationsOf(settings: GlobalSettingsValue): StageDurations {
    const pick = (text: string, fallback: number) => {
        const number = Number(text);
        return Number.isInteger(number) && number >= 1 ? number : fallback;
    };
    return {
        planning: pick(settings.stageDurations.planning, DEFAULT_STAGE_DURATIONS.planning),
        launching: pick(settings.stageDurations.launching, DEFAULT_STAGE_DURATIONS.launching),
        managing: pick(settings.stageDurations.managing, DEFAULT_STAGE_DURATIONS.managing),
        growing: pick(settings.stageDurations.growing, DEFAULT_STAGE_DURATIONS.growing)
    };
}

/** A figure as a number; null where it is not set. */
export const settingNumber = (text: string): number | null => text.trim() === "" ? null : parseAmount(text);

/** The capitalisation limit; null while the user has not set one (then no purchase is tested against it). */
export const capitalisationLimitOf = (settings: GlobalSettingsValue): number | null => settingNumber(settings.capitalisationLimit);

/** The default useful life of an asset group, in years; null where none is set. */
export const usefulLifeOf = (settings: GlobalSettingsValue, groupId: string): number | null => settingNumber(settings.usefulLife[groupId] ?? "");

/** The default amortisation of the intangible group a cost option belongs to, in years; null where it has none or none is set. */
export function amortisationOfCostOption(settings: GlobalSettingsValue, costOption: string): number | null {
    const group = AMORTISATION_GROUPS.find(entry => entry.usedBy !== "" && entry.usedBy === costOption);
    return group ? settingNumber(settings.amortisation[group.id] ?? "") : null;
}

/** The target operating reserve, in months of OpEx (3 unless the user changed it). */
export const targetReserveMonthsOf = (settings: GlobalSettingsValue): number => settingNumber(settings.targetReserveMonths) ?? 3;

/**
 * What a channel takes of its sales (X4): revenue x (commission % + chargeback %) + fixed fee x orders. Stripe, 100,000 of revenue and 4,000 orders:
 * 2,000 + 500 + 1,000 = 3,500.
 */
export function channelFeeOf(row: ChannelFeeRow, revenue: number, orders: number): number {
    const percent = (settingNumber(row.commission) ?? 0) + (settingNumber(row.chargeback) ?? 0);
    return Math.round((revenue * percent / 100 + (settingNumber(row.fixedFee) ?? 0) * orders) * 100) / 100;
}

/**
 * A FIXED FEE IN ANOTHER CURRENCY (owner, 2026-11-16, as FinancialModel.ts's rule for every cost in another currency): a fee row's fixed amount in a currency other than
 * the organisation's is left out of every total -- there are no exchange rates to convert it with --, and said so where the fee is shown (foreignFeeNote).
 */
export function foreignFixedFee(row: ChannelFeeRow, organisationCurrency: string): boolean {
    const code = row.currency.trim().toUpperCase();
    return (settingNumber(row.fixedFee) ?? 0) > 0 && code !== "" && organisationCurrency.trim() !== "" && code !== organisationCurrency.trim().toUpperCase();
}

/** What a channel takes of its sales as the totals count it: channelFeeOf, with a fixed fee in another currency left out (foreignFixedFee). */
export function chargedFeeOf(row: ChannelFeeRow, revenue: number, orders: number, organisationCurrency: string): number {
    return channelFeeOf(foreignFixedFee(row, organisationCurrency) ? { ...row, fixedFee: "" } : row, revenue, orders);
}

/** A currency's name in the plural, for a sentence: "US dollars", "euros". */
function currencyWords(code: string): string {
    let name = code;
    try {
        name = new Intl.DisplayNames(["en-GB"], { type: "currency" }).of(code) ?? code;
    } catch {
        return code;
    }
    const words = name.split(" ");
    const last = words.pop() ?? "";
    const lower = last.toLowerCase();
    const plural = /s$/.test(lower) || ["yen", "won", "yuan", "baht", "renminbi"].includes(lower) ? lower : lower + "s";
    return [...words, plural].join(" ");
}

/** The note beside a fee whose fixed amount is in another currency: "The $0.50 per order is in US dollars, so the totals leave it out." Null for any other fee. */
export function foreignFeeNote(row: ChannelFeeRow, organisationCurrency: string): string | null {
    if (!foreignFixedFee(row, organisationCurrency)) {
        return null;
    }
    const code = row.currency.trim().toUpperCase();
    const amount = settingNumber(row.fixedFee) ?? 0;
    let shown = code + " " + amount.toFixed(2);
    try {
        shown = new Intl.NumberFormat("en-GB", { style: "currency", currency: code }).format(amount);
    } catch {
        // (An unknown code: the code and the figure.)
    }
    return "The " + shown + " per order is in " + currencyWords(code) + ", so the totals leave it out.";
}

/** Employer on-costs on gross salaries (X3): 6,000 at 25% is 1,500. Zero while the coefficient is not set. */
export function employerOnCosts(settings: GlobalSettingsValue, grossSalaries: number): number {
    return Math.round(grossSalaries * (settingNumber(settings.onCostRate) ?? 0)) / 100;
}
