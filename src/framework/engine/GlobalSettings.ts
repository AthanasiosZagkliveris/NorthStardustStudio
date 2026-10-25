import { parseAmount } from "./Amounts.ts";
import { randomId } from "./Readers.ts";
import { DEFAULT_STAGE_DURATIONS, type StageDurations } from "./BusinessStage.ts";

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
}

export interface GlobalSettingsValue {
    /** The Opening Date (an ISO date): the day the business opens and issues its first receipt. It is entered on the Organization tile (Identity System) and shown in the Global Settings' Business stages. */
    openingDate: string;
    /** How long each business stage lasts (BusinessStage.ts), whole numbers as typed: Planning, Launching and Managing in months, Growing in years. The Opening Date is where they start. */
    stageDurations: { planning: string; launching: string; managing: string; growing: string };
    /** Employer on-costs: one percentage of the gross salaries, for the country. */
    onCostRate: string;
    channelFees: ChannelFeeRow[];
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
    /** The Startup Contingency Fund, a percentage (10 to 15) of the Total Pre-operational Budget. */
    startupContingencyRate: string;
    /** The Operational Contingency Fund: the percentage (3 to 5) of a month's OpEx set aside each month, until the target is reached. */
    operationalContingencyRate: string;
    /** An amount a month, for key-person and health cover. */
    insurancePerEmployee: string;
    /** The corporate income tax rate, a percentage of net profit. */
    incomeTaxRate: string;
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

/** The Channel Fee Table of the cost model (examples: the user edits them once here). */
function exampleChannelFees(): ChannelFeeRow[] {
    return [
        { id: randomId("fee"), channel: "Stripe", commission: "2", fixedFee: "0.25", chargeback: "0.5", note: "The default rate for bad debts" },
        { id: randomId("fee"), channel: "PayPal", commission: "3.5", fixedFee: "0.35", chargeback: "1", note: "Higher risk" },
        { id: randomId("fee"), channel: "Wolt, Amazon", commission: "25", fixedFee: "0", chargeback: "0", note: "The platform carries the risk" }
    ];
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
        royaltyRate: "10",
        affiliateRate: "15",
        agentRate: "10",
        capitalisationLimit: "",
        usefulLife: { ...DEFAULT_USEFUL_LIFE },
        amortisation: { ...DEFAULT_AMORTISATION },
        targetReserveMonths: "3",
        startupContingencyRate: "10",
        operationalContingencyRate: "4",
        insurancePerEmployee: "",
        incomeTaxRate: ""
    };
}

export function createChannelFeeRow(): ChannelFeeRow {
    return { id: randomId("fee"), channel: "", commission: "", fixedFee: "", chargeback: "", note: "" };
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
        channelFees: Array.isArray(source.channelFees)
            ? source.channelFees.map(entry => {
                const row = asObject(entry);
                return {
                    id: asText(row.id) || randomId("fee"),
                    channel: asText(row.channel),
                    commission: figure(row.commission),
                    fixedFee: figure(row.fixedFee),
                    chargeback: figure(row.chargeback),
                    note: asText(row.note)
                };
            })
            : exampleChannelFees(),
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
        insurancePerEmployee: figure(source.insurancePerEmployee),
        incomeTaxRate: figure(source.incomeTaxRate)
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

/** Employer on-costs on gross salaries (X3): 6,000 at 25% is 1,500. Zero while the coefficient is not set. */
export function employerOnCosts(settings: GlobalSettingsValue, grossSalaries: number): number {
    return Math.round(grossSalaries * (settingNumber(settings.onCostRate) ?? 0)) / 100;
}
