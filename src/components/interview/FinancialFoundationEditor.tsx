import { countedCapability } from "../../framework/engine/CardCompleteness.ts";
import { calculatedLines } from "../../framework/engine/CalculatedLines.ts";
import { contingencyFunds, launchNeedOf } from "../../framework/engine/ContingencyFunds.ts";
import { ownersTakeDrawings } from "../../framework/engine/FinancialForecast.ts";
import { capitalisationLimitOf, createGlobalSettings, type GlobalSettingsValue } from "../../framework/engine/GlobalSettings.ts";
import { ReactNode, useEffect, useState } from "react";

import {
    LegalEntityValue,
    StrategyMonthValue,
    asBusinessCapabilityValue,
    asBusinessEngagementValue,
    asLegalEntityValue,
    businessFoundationSegments,
    withLegalEntityFounders
} from "../../framework/engine/AnswerUtils.ts";

import {
    assetUnitCostsOf,
    incomeTaxRate,
    COST_GROUPS,
    COST_FREQUENCIES,
    COST_NATURES,
    COST_NATURE_LABELS,
    natureSplitOf,
    FINANCIAL_FOUNDATION_SECTIONS,
    FUNDING_CATEGORIES,
    FUNDING_NEED_CATEGORIES,
    FUNDING_SCHEDULES,
    FUNDING_STATUSES,
    FUNDING_TYPES,
    LOAN_METHODS,
    PERIOD_FREQUENCIES,
    planLength,
    asFinancialFoundationValue,
    consolidateCosts,
    createFundingSource,
    createMilestone,
    financialPosition,
    founderCapitalSources,
    fundingNeeds,
    fundingStanding,
    fundingType,
    isNonCash,
    loanRepaymentNotes,
    loanSchedule,
    moneyFormatter,
    allFunding,
    monthlyEquivalent,
    planMonthLabel,
    withPlanStart,
    derivedPlanStart,
    costStartDates,
    type CostLine,
    type FinancialFoundationValue,
    type FundingCategory,
    asFinancialSustainabilityValue,
    withDemand,
    type FundingSourceValue,
} from "../../framework/engine/FinancialModel.ts";
import { costSourcesFor } from "../../framework/engine/ExportRenderers.ts";
import { paletteHueNamed } from "../../framework/engine/Palette.ts";

import {
    BusinessAddButton,
    BusinessCard,
    BusinessEmpty,
    BusinessField,
    OptionalNote,
    BusinessRemove,
    BusinessTicks,
    uniqueChoices
} from "./BusinessCardFields.tsx";
import {
    CashTimelineChart,
    FigureTable,
    FigureTiles,
    FinancialBlock,
    FinancialPageHead,
    FinancialSectionCard,
    PlanMonthField,
    SignalList,
    type FinancialSection
} from "./FinancialParts.tsx";
import { summaryText } from "./cardSummary.ts";
import FoldAllToggle from "./FoldAllToggle.tsx";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import MonthYearPicker from "./MonthYearPicker.tsx";
import { NUMBER_LIMITS, NumberLimit, limitedNumberText, numberInputMode } from "./numberInput.ts";
import OptionPicker from "./OptionPicker.tsx";
import { SOURCES } from "../../framework/engine/Sources.ts";
import type { OpenPage } from "./jumpTo.ts";
import { railId } from "./rails/railItems.ts";
import { useItemFolds } from "./useItemFolds.ts";
import { toggledIn } from "./toggledIn.ts";
import TextLink from "./TextLink.tsx";

/* ==========================================================
   What the page says
========================================================== */

const explain = (list: readonly { label: string; explanation: string }[]): InfoPoint[] =>
    list.map(entry => ({ title: entry.label, text: entry.explanation }));

/** The distinctions the specification asks the "i" controls to make. */
const DEFINITIONS = {
    cost: { title: "Cost", text: "Money the organization needs to spend." },
    need: { title: "Funding Need", text: "Money the organization needs to obtain to support its financial requirements." },
    capital: { title: "Capital", text: "Money contributed to the organization, particularly by founders or investors." },
    funding: { title: "Funding", text: "Financial resources provided by another source to support the organization." },
    loan: { title: "Loan", text: "Borrowed money that creates a repayment obligation." },
    revenue: { title: "Revenue", text: "Money generated through the organization's Offerings. Capital and funding are not revenue." },
    gap: { title: "Funding Gap", text: "The amount of identified financial requirement not covered by available or confirmed financing." },
    runway: { title: "Financial Runway", text: "The estimated period for which available financial resources can support the organization under current assumptions." }
};

/** The loan payment formula, the "i" beside the repayment figure. */
const LOAN_PAYMENT_HELP: InfoPoint[] = [
    {
        title: "Formula",
        text: "Payment = P × r ÷ (1 − (1 + r)^−n) (annuity); equal-principal: P ÷ n plus interest"
    },
    "A fixed payment that covers interest and repays the loan over n periods; r is the interest rate for one period (for monthly payments, the monthly rate).",
    { title: "Source", source: SOURCES.loanRepayment }
];

/** The interest-only months before the first repayment, its "i". */
const LOAN_PRE_INTEREST_HELP: InfoPoint[] = [
    { title: "Formula", text: "Interest = Principal × Rate × Time" },
    "Interest on the amount borrowed only, without compounding.",
    { title: "Source", source: SOURCES.simpleInterest }
];

/** The funding gap formula, added to that figure's own info. */
const FUNDING_GAP_FORMULA: InfoPoint = {
    title: "Formula",
    text: "Funding gap = Funding needed − Funding available and confirmed"
};

/** The runway formula, added to that figure's own info. */
const RUNWAY_FORMULA: InfoPoint = {
    title: "Formula",
    text: "Runway = Cash ÷ Monthly net burn (here: the first month the projected balance goes below zero)"
};
const RUNWAY_SOURCE: InfoPoint = { title: "Based on", source: SOURCES.cashRunway };

const SECTIONS = {
    costs: {
        title: "Costs",
        instructions: [
            "Review the costs gathered from the Legal Entity and Infrastructure & Capability.",
            "Each cost is grouped by what it supports, how it behaves, and when it is paid; to change one, change it where it was recorded."
        ],
        info: [
            DEFINITIONS.cost,
            "Cost Group says what a cost supports; Behaviour says how it changes with activity; Frequency says when it is paid. They are three different things."
        ] as InfoPoint[]
    },
    need: {
        title: "Funding Need",
        instructions: [
            "Check what has to be financed, calculated from the costs: how much, for what purpose, and when."
        ],
        info: [
            DEFINITIONS.need,
            "A need can be one amount by one date, or several amounts over time."
        ] as InfoPoint[]
    },
    funding: {
        title: "Capital & Funding",
        instructions: [
            "Identify where the money will come from, how certain it is, and when it arrives.",
            "Record what each source obliges: repayments, equity or conditions."
        ],
        info: [
            DEFINITIONS.capital,
            DEFINITIONS.funding,
            DEFINITIONS.loan,
            DEFINITIONS.revenue,
            "Expected, confirmed and available money are different: only money that has arrived counts as money the organization has."
        ] as InfoPoint[]
    },
    position: {
        title: "Financial Position",
        instructions: [
            "Read the financial picture calculated from Costs, Funding Need and Capital & Funding: is your organization covered, and for how long?"
        ],
        info: [
            DEFINITIONS.gap,
            DEFINITIONS.runway,
            "Every figure here is an estimate based on the information entered, not financial advice."
        ] as InfoPoint[]
    }
};

/**
 * Each section's own palette colour, as every card on the earlier
 * Business pages has one: rose, periwinkle, sage, sky -- no two
 * neighbours close on the wheel, so none read alike. Fixed rather than
 * hashed from the id, because these four never change and a hash
 * can land two of them side by side.
 */
const SECTION_HUES: Record<string, number> = {
    "financial-costs": paletteHueNamed("rose"),
    "financial-need": paletteHueNamed("periwinkle"),
    "financial-funding": paletteHueNamed("sage"),
    "financial-position": paletteHueNamed("sky")
};

const CATEGORY_INFO: Record<FundingCategory, InfoPoint[]> = {
    internal: ["Money from inside your organization: its founders' capital, reinvested revenue or funds it already holds."],
    external: [
        { title: "Non-repayable", text: "Grants, subsidies and awards: nothing to repay, though often with conditions." },
        { title: "Equity", text: "Investment in exchange for a share of ownership." },
        { title: "Debt", text: "Loans and credit that must be repaid, with interest." }
    ],
    other: ["Reward crowdfunding, friends & family, in-kind contributions and other arrangements."]
};

/* ==========================================================
   The editor
========================================================== */

interface FinancialFoundationEditorProps {
    value: unknown;
    onChange: (value: FinancialFoundationValue) => void;
    disabled?: boolean;
    showInstructions?: boolean;
    columnsDivider?: ReactNode;
    /** Page 1's answer, for its Offerings. */
    foundation?: unknown;
    /** Page 3's answer, for the costs recorded there. */
    capability?: unknown;
    /** 1. Identity System → 3. Legal Entity. */
    legalEntity?: LegalEntityValue;
    /** Sustainability's answer: the revenue the operating need is net of. */
    sustainability?: unknown;
    /** Customer Engagement's answer: expected sales from its Demand & Conversion. */
    engagement?: unknown;
    /** The organisation's currency, from the Legal Entity's country. */
    currency?: string;
    /** The Opening Date (an ISO date), kept in the Global Settings; "" until it is given. */
    openingDate?: string;
    onChangeOpeningDate?: (iso: string) => void;
    /** The Global Settings: the contingency rates, the target reserve, the capitalisation limit. */
    globalSettings?: GlobalSettingsValue;
    onOpenFoundation?: OpenPage;
    onOpenCapability?: OpenPage;
    /** 1. Identity System → 3. Legal Entity, where its expenses are. */
    onOpenLegalEntity?: OpenPage;
}

/**
 * The Business System's Financial Foundation page (see
 * AnswerType.FinancialFoundation, and FinancialModel.ts for every
 * calculation it shows).
 *
 * Four sections, top to bottom, in the order the specification's
 * logic runs: Costs → Funding Need → Capital & Funding → Financial
 * Position. The first three are answered; the last is worked out.
 */
export default function FinancialFoundationEditor({

    value,

    onChange,

    disabled = false,

    showInstructions = true,

    columnsDivider,

    foundation,

    capability: capabilityValue,

    legalEntity: legalEntityValue,

    sustainability: sustainabilityValue,

    engagement: engagementValue,

    currency = "",

    openingDate = "",

    globalSettings,

    onOpenFoundation

}: FinancialFoundationEditorProps) {

    const stored = asFinancialFoundationValue(value);

    const legalEntity = legalEntityValue ?? asLegalEntityValue(undefined);

    const capability = withLegalEntityFounders(
        asBusinessCapabilityValue(capabilityValue),
        legalEntity.founders
    );

    /* The plan's first month is worked out, never typed: the earlier of the Opening Date's month and the earliest card's cost. */
    const derivedStart = derivedPlanStart(openingDate, costStartDates(capability), withPlanStart(stored).planStart);
    const page = withPlanStart(stored, undefined, derivedStart);
    const start = page.planStart;
    const months = planLength(page);
    const revenuePage = withDemand(
        asFinancialSustainabilityValue(sustainabilityValue),
        asBusinessEngagementValue(engagementValue).demand
    );

    // (Kept in the answer too, so that the documents and the Sustainability page read the same month.)
    useEffect(() => {
        if (!disabled && (stored.planStart.year !== derivedStart.year || stored.planStart.month !== derivedStart.month)) {
            onChange({ ...stored, planStart: derivedStart });
        }
    });

    const lines = consolidateCosts(page, costSourcesFor(legalEntity, countedCapability(capability), currency));

    // Whole units everywhere on this read-only page: an amount
    // someone can edit shows the string they typed, never this
    // formatter, so nobody's own pence are ever hidden by it.
    const format = moneyFormatter(currency, { wholeOnly: true });

    /* The funds (rules F1 to F6): the budget before the opening, the Startup Contingency, the cash to raise; and the Operational Contingency. */
    const settings = globalSettings ?? createGlobalSettings();
    const countedCards = countedCapability(capability);
    const natureContext = { openingDate, capitalisationLimit: capitalisationLimitOf(settings), assetUnitCosts: assetUnitCostsOf(countedCards) };
    const chosenNatures = Object.fromEntries(Object.entries(page.classified).map(([id, entry]) => [id, entry.nature || undefined]));
    const calculated = calculatedLines(
        { foundation: page, revenuePage, lines, capability: countedCards, settings, openingDate, drawings: ownersTakeDrawings(legalEntity.organisation.legalForm) },
        incomeTaxRate(page)
    );
    const funds = contingencyFunds(lines, natureContext, settings, chosenNatures, calculated);
    // With an Opening Date, the Establishment need is the cash to raise before it.
    const launched = launchNeedOf(lines, natureContext, settings, chosenNatures, calculated);

    /* The Funding Need, calculated once: its section and every
       funding card's "Linked Funding Need" read the same list. */
    const calculatedNeeds = fundingNeeds(page, lines, legalEntity, revenuePage, format, launched?.launch);

    const offerings = uniqueChoices(
        businessFoundationSegments(foundation).flatMap(segment => segment.offerings),
        "Unnamed offering"
    );

    const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

    /**
     * Which Funding Source cards are open. Funding sources start
     * CLOSED -- see useItemFolds -- unlike the structural sections
     * and categories around them, which are on `expanded` and start
     * closed too (every fold arrow starts closed).
     */
    const folds = useItemFolds(true);

    /* The Costs table's filters (by group, by Offering, by nature) and its order. */
    const [costFilter, setCostFilter] = useState({ group: "", offering: "", nature: "", sort: "amount" });

    const [schedulesOpen, setSchedulesOpen] = useState<ReadonlySet<string>>(new Set());
    function toggle(key: string) {
        setExpanded(current => toggledIn(current, key));
    }

    /* Writes go to what is STORED, so an unchosen plan start stays unchosen. */
    function update(patch: Partial<FinancialFoundationValue>) {
        onChange({ ...stored, ...patch });
    }

    /* ---------- Small controls ---------- */

    function picker(
        label: string,
        ariaLabel: string,
        options: readonly { id: string; label: string }[],
        current: string,
        onNext: (next: string) => void,
        placeholder: string,
        info?: InfoPoint[]
    ) {
        return (
            <BusinessField label={label} info={info}>
                <OptionPicker
                    label={ariaLabel}
                    placeholder={placeholder}
                    options={options.map(option => option.label)}
                    disabled={disabled}
                    value={options.find(option => option.id === current)?.label ?? ""}
                    onChange={(next) => onNext(options.find(option => option.label === next)?.id ?? "")}
                />
            </BusinessField>
        );
    }

    function textInput(
        label: string,
        ariaLabel: string,
        current: string,
        onNext: (next: string) => void,
        placeholder?: string,
        info?: InfoPoint[],
        /** A number box: what it accepts. */
        limits?: NumberLimit
    ) {
        return (
            <BusinessField label={label} info={info}>
                <input
                    type="text"
                    inputMode={limits ? numberInputMode(limits) : undefined}
                    className="interview-input"
                    aria-label={ariaLabel}
                    placeholder={placeholder}
                    disabled={disabled}
                    value={current}
                    onChange={(event) => onNext(limits
                        ? limitedNumberText(event.target.value, current, limits)
                        : event.target.value)}
                />
            </BusinessField>
        );
    }

    function monthField(
        label: string,
        current: StrategyMonthValue,
        onNext: (next: StrategyMonthValue) => void,
        info?: InfoPoint[]
    ) {
        return (
            <PlanMonthField
                label={label}
                value={current}
                planStart={start}
                disabled={disabled}
                onChange={onNext}
                info={info}
            />
        );
    }

    const amountPlaceholder = currency || "Amount";

    /* ---------- The four sections ---------- */

    function sectionCard(
        id: string,
        section: FinancialSection,
        body: () => ReactNode,
        sectionIndex: number
    ) {
        return (
            <FinancialSectionCard
                key={id}
                anchor={id}
                rail={railId(FINANCIAL_FOUNDATION_SECTIONS[sectionIndex])}
                number={sectionIndex + 1}
                section={section}
                hue={SECTION_HUES[id] ?? 0}
                open={expanded.has(id)}
                onToggle={() => toggle(id)}
                body={body}
            />
        );
    }

    /* ---------- 1. Costs ---------- */

    /** One part of a cost: where it stands in the Costs table, what it comes to, and what kind of cost it is. */
    interface CostRow { key: string; line: CostLine; bucket: "launch" | "running" | "sale" | "later"; amount: number; text: string; when: string; nature: string }

    const COST_BUCKETS: { id: CostRow["bucket"]; title: string; note: string }[] = [
        { id: "launch", title: "Launch: before the opening", note: "Costs dated before the Opening Date: capital expenditure (assets), startup expenses and pre-operating expenses. They make the Total Pre-operational Budget." },
        { id: "running", title: "Running costs: every month", note: "Fixed costs that recur after the opening, as a monthly equivalent. They set the cash buffer: one-time costs plus months of running costs." },
        { id: "sale", title: "Cost of each sale", note: "Variable costs that move with sales (cost of goods sold): a price per unit or a percent of revenue. They decide the break-even." },
        { id: "later", title: "One-time costs after the opening", note: "One-time costs paid from the opening on. They are in the Funding Need of their group." }
    ];

    function costRows(): { rows: CostRow[]; uncounted: CostLine[] } {
        const rows: CostRow[] = [];
        const uncounted: CostLine[] = [];
        const frequencyLabel = (line: CostLine) => COST_FREQUENCIES.find(entry => entry.id === line.frequency)?.label ?? line.frequency;
        for (const line of lines) {
            if (!line.counted || line.amount === null) {
                uncounted.push(line);
                continue;
            }
            const split = natureSplitOf(line, natureContext, chosenNatures[line.id] ?? "");
            if (split.before) {
                rows.push({ key: line.id + ":launch", line, bucket: "launch", amount: split.before.amount, text: format(split.before.amount), when: line.startDate ? line.startDate : "Before the opening", nature: split.before.nature });
            }
            if (split.after) {
                const nature = split.after;
                if (nature === "cogs" || line.behaviour === "variable") {
                    const percent = line.frequency === "usage-based";
                    rows.push({ key: line.id + ":sale", line, bucket: "sale", amount: line.amount, text: percent ? line.amountText + " % of Rev" : format(line.variablePerUnit ?? line.amount) + " " + frequencyLabel(line).toLowerCase(), when: percent ? "With revenue" : frequencyLabel(line), nature });
                } else if (line.frequency === "one-time" || line.frequency === "per-project" || nature === "capex" || nature === "startup" || nature === "pre-operating" || nature === "inventory") {
                    rows.push({ key: line.id + ":later", line, bucket: "later", amount: line.amount, text: format(line.amount), when: line.startDate ? line.startDate : frequencyLabel(line), nature });
                } else {
                    const monthly = monthlyEquivalent(line.amount, line.frequency);
                    rows.push({ key: line.id + ":running", line, bucket: "running", amount: monthly, text: format(monthly) + " / month", when: frequencyLabel(line), nature });
                }
            }
        }
        return { rows, uncounted };
    }

    function costsSection() {

        const setting = (text: string, empty = "not set") => text.trim() !== "" ? text.trim() : empty;
        const { rows, uncounted } = costRows();

        const offeringNameOf = (line: CostLine) => line.offeringIds.length === 0
            ? "No Offering"
            : line.offeringIds.map(id => offerings.find(entry => entry.id === id)?.label ?? "").filter(name => name !== "").join(", ") || "No Offering";

        const keeps = (line: CostLine, nature?: string) =>
            (costFilter.group === "" || line.group === costFilter.group) &&
            (costFilter.offering === "" || (costFilter.offering === "org" ? line.offeringIds.length === 0 : line.offeringIds.includes(costFilter.offering))) &&
            (nature === undefined || costFilter.nature === "" || costFilter.nature === nature);
        const shown = rows.filter(row => keeps(row.line, row.nature));
        const shownUncounted = uncounted.filter(line => keeps(line));
        const order = (left: CostRow, right: CostRow) => costFilter.sort === "date"
            ? (left.line.startDate ?? "~").localeCompare(right.line.startDate ?? "~")
            : costFilter.sort === "name" ? left.line.name.localeCompare(right.line.name) : right.amount - left.amount;

        /* The cost of each sale: the prices per unit added up, and how many costs are a percent of revenue instead. */
        const sales = rows.filter(row => row.bucket === "sale");
        const perSale = sales.filter(row => row.line.frequency !== "usage-based").reduce((sum, row) => sum + (row.line.variablePerUnit ?? row.amount), 0);
        const percentCosts = sales.filter(row => row.line.frequency === "usage-based").length;
        const saleText = sales.length === 0 ? format(0) : format(perSale) + (percentCosts > 0 ? " + " + percentCosts + " % of Rev" : "");

        const filterOptions = (list: readonly { id: string; label: string }[], all: string) => [{ id: "", label: all }, ...list];
        const groupInfo = COST_GROUPS.map(group => ({ title: group.label, text: group.explanation }));
        const filter = (label: string, current: string, options: readonly { id: string; label: string }[], key: keyof typeof costFilter, all: string) => (
            <BusinessField label={label} info={label === "Group" ? groupInfo : undefined}>
                <OptionPicker
                    label={"Costs: " + label}
                    placeholder={all}
                    hug
                    options={options.map(option => option.label)}
                    disabled={false}
                    value={options.find(option => option.id === current)?.label ?? all}
                    onChange={(next) => setCostFilter(previous => ({ ...previous, [key]: options.find(option => option.label === next)?.id ?? "" }))}
                />
            </BusinessField>
        );

        return (
            <div className="financial-section-body">

                <p className="financial-lead">
                    A summary of the costs recorded on the Legal Entity, the Founders and Infrastructure & Capability. Nothing is typed here: a cost is
                    changed where it was recorded.
                </p>

                {/* THE THREE TOTALS: what launching takes, what a month costs, what each sale costs. */}
                <FigureTiles tiles={[
                    {
                        label: "Launch budget",
                        value: format(funds.schedule.total),
                        info: ["What is spent before the opening: capital expenditure (assets) + startup expenses + pre-operating expenses. Opening stock is apart.", "Capital expenditure is an asset, depreciated; startup and pre-operating expenses are expensed."]
                    },
                    {
                        label: "Running costs a month",
                        value: format(funds.monthlyOpEx),
                        info: ["The fixed costs of a month of operation, from the opening (OpEx). They set the cash buffer: the launch budget plus months of running costs."]
                    },
                    {
                        label: "Cost of each sale",
                        value: saleText,
                        info: ["The variable costs that move with sales (COGS): prices per unit, and costs that are a percent of revenue. They decide the break-even."]
                    }
                ]} />

                {/* The pre-operational budget: what is dated before the Opening Date (rule F1); opening stock is apart, after the contingency. */}
                {openingDate !== "" && funds.schedule.total + funds.schedule.openingInventory > 0 && (
                    <p className="financial-total" data-anchor="financial-pre-operational-budget">
                        <strong>Total Pre-operational Budget:</strong> {format(funds.schedule.total)}
                        {" (Capital expenditure (assets) " + format(funds.schedule.capex) + " + Startup expenses " + format(funds.schedule.startup) + " + Pre-operating expenses " + format(funds.schedule.preOperating) + ")"}
                        {funds.schedule.openingInventory > 0 ? " \u00b7 Opening inventory " + format(funds.schedule.openingInventory) + " is apart" : ""}
                        {funds.cashToRaise > 0 ? " \u00b7 Cash to raise before the opening: " + format(funds.cashToRaise) : ""}
                    </p>
                )}

                {/* THE FILTERS and the order of the table. */}
                <div className="financial-cost-filters">
                    {filter("Group", costFilter.group, filterOptions(COST_GROUPS.filter(group => lines.some(line => line.group === group.id)).map(group => ({ id: group.id, label: group.label })), "All groups"), "group", "All groups")}
                    {filter("Offering", costFilter.offering, filterOptions([...(lines.some(line => line.offeringIds.length === 0) ? [{ id: "org", label: "Not tied to an Offering" }] : []), ...offerings.map(entry => ({ id: entry.id, label: entry.label }))], "All costs"), "offering", "All costs")}
                    {filter("Nature", costFilter.nature, filterOptions(COST_NATURES.filter(nature => rows.some(row => row.nature === nature)).map(nature => ({ id: nature, label: COST_NATURE_LABELS[nature] })), "All natures"), "nature", "All natures")}
                    {filter("Order", costFilter.sort, [{ id: "amount", label: "Largest first" }, { id: "date", label: "Earliest first" }, { id: "name", label: "Name" }], "sort", "Largest first")}
                </div>

                {/* ONE TABLE, a line for each cost, under the three headings; a cost with a part before the opening and a part after has a line in each. */}
                <table className="financial-costs-ledger">
                    <thead>
                        <tr>
                            <th scope="col">Cost</th>
                            <th scope="col">
                                <InfoText text="Group">
                                    <InfoNote label="Group" points={groupInfo} fullList />
                                </InfoText>
                            </th>
                            <th scope="col">When</th>
                            <th scope="col" className="financial-ledger-amount">Amount</th>
                            <th scope="col">Nature</th>
                            <th scope="col">Offering</th>
                        </tr>
                    </thead>
                    {COST_BUCKETS.map(bucket => {
                        const inBucket = shown.filter(row => row.bucket === bucket.id).sort(order);
                        if (inBucket.length === 0) {
                            return null;
                        }
                        return (
                            <tbody key={bucket.id} data-anchor={"cost-bucket-" + bucket.id}>
                                <tr className="financial-cost-bucket">
                                    <th scope="rowgroup" colSpan={6}>
                                        <InfoText text={bucket.title + " (" + inBucket.length + ")"}>
                                            <InfoNote label={bucket.title} points={[bucket.note]} />
                                        </InfoText>
                                    </th>
                                </tr>
                                {inBucket.map(row => (
                                    <tr key={row.key}>
                                        <th scope="row">
                                            <span>{row.line.name || "Unnamed cost"}</span>
                                            <span className="financial-muted financial-ledger-source">{row.line.sourceLabel}</span>
                                        </th>
                                        <td>{COST_GROUPS.find(group => group.id === row.line.group)?.label ?? row.line.group}</td>
                                        <td>{row.when}</td>
                                        <td className="financial-ledger-amount">{row.text}</td>
                                        <td>{COST_NATURE_LABELS[row.nature as keyof typeof COST_NATURE_LABELS] ?? row.nature}</td>
                                        <td>{offeringNameOf(row.line)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        );
                    })}
                    {shownUncounted.length > 0 && (
                        <tbody data-anchor="cost-bucket-uncounted">
                            <tr className="financial-cost-bucket">
                                <th scope="rowgroup" colSpan={6}>
                                    <InfoText text={"Not counted yet (" + shownUncounted.length + ")"}>
                                        <InfoNote label="Not counted yet" points={["A cost with no price, or in another currency than the organisation's, or on a card that lacks a detail, is listed here and left out of every total until it is complete."]} />
                                    </InfoText>
                                </th>
                            </tr>
                            {shownUncounted.map(line => (
                                <tr key={line.id}>
                                    <th scope="row">
                                        <span>{line.name || "Unnamed cost"}</span>
                                        <span className="financial-muted financial-ledger-source">{line.sourceLabel}</span>
                                    </th>
                                    <td>{COST_GROUPS.find(group => group.id === line.group)?.label ?? line.group}</td>
                                    <td>{line.startDate ? line.startDate : "\u2014"}</td>
                                    <td className="financial-ledger-amount">{line.amountText !== "" ? line.amountText + (line.currency !== "" && line.currency !== currency ? " " + line.currency : "") : "no price"}</td>
                                    <td>{"\u2014"}</td>
                                    <td>{offeringNameOf(line)}</td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                    {shown.length === 0 && shownUncounted.length === 0 && (
                        <tbody>
                            <tr><td colSpan={6} className="financial-muted">{lines.length === 0 ? "No cost recorded yet." : "No cost matches the filters."}</td></tr>
                        </tbody>
                    )}
                </table>

                {/* What the Global Settings say that shapes these figures. */}
                <p className="financial-muted financial-cost-note">
                    {"From the Global Settings: Opening Date " + setting(openingDate) +
                        " \u00b7 capitalisation limit " + setting(settings.capitalisationLimit) +
                        " \u00b7 Startup Contingency " + setting(settings.startupContingencyRate) + (settings.startupContingencyRate.trim() ? "%" : "") +
                        " \u00b7 Operational Contingency " + setting(settings.operationalContingencyRate) + (settings.operationalContingencyRate.trim() ? "%" : "") +
                        " \u00b7 target reserve " + setting(settings.targetReserveMonths) + (settings.targetReserveMonths.trim() ? " months" : "")}
                </p>

            </div>
        );

    }

    /* ---------- 2. Funding Need ---------- */

    /*
        CALCULATED, NOT ASKED. Each category adds up what is already
        recorded: the one-time costs above, by their group, and the
        running costs until revenue covers them (FinancialModel.ts,
        fundingNeeds). To change a need, change the cost it comes from.
    */
    function needSection() {

        const needs = calculatedNeeds;
        const total = needs.reduce((sum, need) => sum + need.amount, 0);

        /* Each loan and whether its repayments are counted: the "i" on
           the Loan Repayments column. No loan, no column. */
        const loanNotes = loanRepaymentNotes(allFunding(page, legalEntity), start, format);
        const showLoans = loanNotes.length > 0;

        return (
            <div className="financial-section-body">

                <p className="financial-lead">
                    Calculated from the costs above. To change a need, change the costs it is made of.
                    Until revenue is estimated on Sustainability, every running cost is counted
                    in the operating need; it then falls to the months before revenue covers them.
                </p>

                <div className="financial-need-cards">
                    {needs.map(need => {

                        const category = FUNDING_NEED_CATEGORIES.find(entry => entry.id === need.id);

                        return (
                            <div
                                className={"financial-need-card" + (need.months ? " financial-need-card-wide" : "")}
                                key={need.id}
                            >

                                <span className="business-foundation-label-info">
                                    <strong className="financial-need-name">
                                        <InfoText text={need.label}>
                                            {category && (
                                                <InfoNote
                                                    label={need.label}
                                                    points={"alsoCalled" in category ? [category.explanation, category.alsoCalled] : [category.explanation]}
                                                    fullList
                                                />
                                            )}
                                        </InfoText>
                                    </strong>
                                </span>

                                <span className="financial-need-amount">{format(need.amount)}</span>
                                {/* Always a line, empty or not, so every card's list
                                    starts level with its neighbours'. */}
                                <span className="financial-muted financial-need-when">{need.when || "\u00a0"}</span>

                                {need.months
                                    ? (
                                        /* The first year, month by month. */
                                        <div className="financial-table-scroll">
                                            <FigureTable className="financial-need-months">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Month</th>
                                                        <th scope="col">Running Costs</th>
                                                        <th scope="col">Costs of Sales</th>
                                                        {showLoans && (
                                                            // "Repayments" on the page, so the head keeps to one
                                                            // line in its share of the table; its "i" and its
                                                            // name say they are the loans'.
                                                            <th scope="col" aria-label="Loan repayments">
                                                                <InfoText text="Repayments">
                                                                    <InfoNote label="Loan Repayments" points={loanNotes} fullList />
                                                                </InfoText>
                                                            </th>
                                                        )}
                                                        <th scope="col">Revenue</th>
                                                        <th scope="col">Net</th>
                                                        <th scope="col">Running Total</th>
                                                        <th scope="col">Needed</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {need.months.map(month => (
                                                        <tr key={month.label}>
                                                            <th scope="row">{month.label}</th>
                                                            <td>{format(month.costs)}</td>
                                                            <td>{format(month.variable)}</td>
                                                            {showLoans && <td>{format(month.loans)}</td>}
                                                            <td>{format(month.revenue)}</td>
                                                            <td>{format(month.net)}</td>
                                                            <td>{format(month.cumulative)}</td>
                                                            <td><strong>{month.needed > 0.005 ? format(month.needed) : ""}</strong></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <th scope="row">First year</th>
                                                        <td colSpan={showLoans ? 6 : 5} />
                                                        <td><strong>{format(need.amount)}</strong></td>
                                                    </tr>
                                                </tfoot>
                                            </FigureTable>
                                        </div>
                                    )
                                    : need.parts.length === 0
                                    ? <span className="financial-muted">{need.id === "offering-launch"
                                        ? (() => {
                                            const offered = lines.filter(line => line.group === "offering" && line.counted && line.amount !== null);
                                            const oneTime = offered.filter(line => line.frequency === "one-time" && launched?.launch.budgetLineIds.has(line.id));
                                            return offered.length === 0
                                                ? "No Offering costs are recorded."
                                                : offered.length + (offered.length === 1 ? " Offering cost is" : " Offering costs are") + " recorded: "
                                                    + (oneTime.length > 0 ? oneTime.length + " one-time, bought before the opening, in Establishment's cash to raise (" + format(oneTime.reduce((sum, line) => sum + (line.amount ?? 0), 0)) + "); " : "")
                                                    + "the running ones are in Operating. Only one-time Offering costs after the opening appear here.";
                                        })()
                                        : "Nothing recorded."}</span>
                                    : (
                                        <ul className="financial-cost-inputs">
                                            {need.parts.map(part => (
                                                <li key={part.name + part.when}>
                                                    <span>{part.name}</span>
                                                    <span>{format(part.amount)}</span>
                                                </li>
                                            ))}
                                            {/* The total of the parts, under a rule. */}
                                            <li className="financial-cost-total">
                                                <strong>Total</strong>
                                                <strong>{format(need.amount)}</strong>
                                            </li>
                                        </ul>
                                    )}

                                {need.note && <p className="financial-muted financial-need-note">{need.note}</p>}

                            </div>
                        );

                    })}
                </div>

                {/* BEFORE THE OPENING: what has to be raised, and the reserve that is set aside to run on. */}
                {openingDate === ""
                    ? <p className="financial-muted">Give the Opening Date, next to Plan Start, to see the cash to raise before the opening and the contingency funds.</p>
                    : (
                        <div className="financial-need-cards" data-anchor="financial-funds">

                            <div className="financial-need-card">
                                <span className="business-foundation-label-info">
                                    <strong className="financial-need-name">
                                        <InfoText text="Cash to raise before the opening">
                                            <InfoNote
                                                label="Cash to raise before the opening"
                                                points={[
                                                    "The Total Pre-operational Budget (CapEx, Startup Expenses and Pre-Operating Expenses dated before the Opening Date) plus the Startup Contingency Fund, plus the cash for opening inventory, which is added after the contingency and is not part of its base."
                                                ]}
                                                fullList
                                            />
                                        </InfoText>
                                    </strong>
                                </span>
                                <span className="financial-need-amount">{format(funds.cashToRaise)}</span>
                                <span className="financial-muted financial-need-when">{" "}</span>
                                <ul className="financial-cost-inputs">
                                    <li><span>Capital Expenditure</span><span>{format(funds.schedule.capex)}</span></li>
                                    <li><span>Startup Expenses</span><span>{format(funds.schedule.startup)}</span></li>
                                    <li><span>Pre-Operating Expenses</span><span>{format(funds.schedule.preOperating)}</span></li>
                                    <li><span>Total Pre-operational Budget</span><span>{format(funds.schedule.total)}</span></li>
                                    <li><span>{"Startup Contingency Fund (" + funds.startupRate + "%)"}</span><span>{format(funds.startupFund)}</span></li>
                                    <li><span>Opening inventory</span><span>{format(funds.schedule.openingInventory)}</span></li>
                                    <li className="financial-cost-total"><strong>Total</strong><strong>{format(funds.cashToRaise)}</strong></li>
                                </ul>
                            </div>

                            <div className="financial-need-card">
                                <span className="business-foundation-label-info">
                                    <strong className="financial-need-name">
                                        <InfoText text="Operational Contingency Fund">
                                            <InfoNote
                                                label="Operational Contingency Fund"
                                                points={[
                                                    "After the launch, each month a share of OpEx is set aside on top of the startup fund, until the fund equals the target reserve months of OpEx. The contribution is a cash set-aside, not an expense. The rates and the target are in the Global Settings."
                                                ]}
                                                fullList
                                            />
                                        </InfoText>
                                    </strong>
                                </span>
                                <span className="financial-need-amount">{format(funds.target)}</span>
                                <span className="financial-muted financial-need-when">{funds.targetMonths + (funds.targetMonths === 1 ? " month" : " months") + " of OpEx"}</span>
                                <ul className="financial-cost-inputs">
                                    <li><span>OpEx a month</span><span>{format(funds.monthlyOpEx)}</span></li>
                                    <li><span>{"Set aside each month (" + funds.operationalRate + "%)"}</span><span>{format(funds.monthlyOpEx * funds.operationalRate / 100)}</span></li>
                                    <li><span>Held at the opening (the startup fund)</span><span>{format(funds.startupFund)}</span></li>
                                    <li>
                                        <span>Months to reach the target</span>
                                        <span>{funds.monthsToTarget === null ? "Not reached" : String(funds.monthsToTarget)}</span>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    )}

                <p className="financial-total"><strong>Total Funding Need:</strong> {format(total)}</p>

            </div>
        );

    }

    /* ---------- 3. Capital & Funding ---------- */

    function changeSource(id: string, patch: Partial<FundingSourceValue>) {
        update({ funding: stored.funding.map(source => source.id === id ? { ...source, ...patch } : source) });
    }

    function standingLine(source: FundingSourceValue) {
        const standing = fundingStanding(source, start);
        if (standing.total <= 0) {
            return null;
        }
        if (isNonCash(source)) {
            return (
                <p className="financial-standing">
                    In-kind, worth {format(standing.total)}: recorded, but not counted as cash.
                </p>
            );
        }
        const parts = [
            "Received " + format(standing.received),
            standing.confirmedFuture > 0 ? "Confirmed future " + format(standing.confirmedFuture) : "",
            standing.pending > 0 ? "Pending " + format(standing.pending) : ""
        ].filter(Boolean);
        return <p className="financial-standing">{parts.join(" · ")}</p>;
    }

    function scheduleFields(source: FundingSourceValue, what: string) {

        const schedule = source.schedule;
        const setSchedule = (patch: Partial<FundingSourceValue["schedule"]>) =>
            changeSource(source.id, { schedule: { ...schedule, ...patch } });

        // Every field here is a cell of the card's own two-column grid
        // (.financial-funding-grid): the schedule, then what it asks,
        // paired left then right; a list of milestones takes the row.
        return (
            <>
                {picker(
                    "Funding Schedule", what + " funding schedule",
                    FUNDING_SCHEDULES, schedule.kind,
                    (next) => setSchedule({ kind: (next || "one-time") as FundingSourceValue["schedule"]["kind"] }),
                    "Select", explain(FUNDING_SCHEDULES)
                )}

                {schedule.kind === "one-time" && monthField(
                    "Expected", schedule.month, (next) => setSchedule({ month: next }))}

                {schedule.kind === "periodic" && (
                    <div className="business-capability-row">
                        {textInput("Amount per Period", what + " amount per period", schedule.periodAmount,
                            (next) => setSchedule({ periodAmount: next }), amountPlaceholder, undefined, NUMBER_LIMITS.money)}
                        {picker("Frequency", what + " frequency", PERIOD_FREQUENCIES, schedule.frequency,
                            (next) => setSchedule({ frequency: (next || "monthly") as FundingSourceValue["schedule"]["frequency"] }),
                            "Select")}
                        {monthField("Starts", schedule.start, (next) => setSchedule({ start: next }))}
                        {textInput("Number of Periods", what + " number of periods", schedule.periods,
                            (next) => setSchedule({ periods: next }), "e.g. 12", undefined, NUMBER_LIMITS.payments)}
                    </div>
                )}

                {schedule.kind === "milestone" && (
                    <div className="financial-funding-wide">
                        <BusinessField label="Milestones">
                            <div className="financial-schedule">
                                {schedule.milestones.map((milestone, position) => (
                                    <div className="financial-milestone" key={milestone.id}>
                                        <input
                                            type="text"
                                            className="interview-input"
                                            aria-label={what + " milestone " + (position + 1) + " condition"}
                                            placeholder="Milestone / condition"
                                            disabled={disabled}
                                            value={milestone.condition}
                                            onChange={(event) => setSchedule({
                                                milestones: schedule.milestones.map(entry => entry.id === milestone.id
                                                    ? { ...entry, condition: event.target.value } : entry)
                                            })}
                                        />
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            className="interview-input"
                                            aria-label={what + " milestone " + (position + 1) + " amount"}
                                            placeholder={amountPlaceholder}
                                            disabled={disabled}
                                            value={milestone.amount}
                                            onChange={(event) => setSchedule({
                                                milestones: schedule.milestones.map(entry => entry.id === milestone.id
                                                    ? { ...entry, amount: limitedNumberText(event.target.value, milestone.amount, NUMBER_LIMITS.money) } : entry)
                                            })}
                                        />
                                        <MonthYearPicker
                                            hideLabel
                                            label={what + " milestone " + (position + 1) + " expected"}
                                            value={milestone.month}
                                            disabled={disabled}
                                            firstYear={Number(start.year)}
                                            isAllowed={() => true}
                                            onChange={(next) => setSchedule({
                                                milestones: schedule.milestones.map(entry => entry.id === milestone.id
                                                    ? { ...entry, month: next } : entry)
                                            })}
                                        />
                                        <BusinessRemove
                                            cell
                                            what={what + " milestone " + (position + 1)}
                                            disabled={disabled}
                                            onRemove={() => setSchedule({
                                                milestones: schedule.milestones.filter(entry => entry.id !== milestone.id)
                                            })}
                                        />
                                    </div>
                                ))}
                                <BusinessAddButton
                                    label="Milestone"
                                    disabled={disabled}
                                    onAdd={() => setSchedule({ milestones: [...schedule.milestones, createMilestone()] })}
                                />
                            </div>
                        </BusinessField>
                    </div>
                )}

                {schedule.kind === "other" && (
                    <div className="business-capability-row">
                        {textInput("How It Is Received", what + " how received", schedule.note,
                            (next) => setSchedule({ note: next }))}
                        {monthField("Expected", schedule.month, (next) => setSchedule({ month: next }))}
                    </div>
                )}
            </>
        );

    }

    /** A loan's terms: cells of the card's own grid, paired left then right. */
    function loanTermFields(source: FundingSourceValue, what: string) {

        const loan = source.loan;
        const setLoan = (patch: Partial<FundingSourceValue["loan"]>) =>
            changeSource(source.id, { loan: { ...loan, ...patch } });

        return (
            <>
                <div className="business-capability-row">
                    {textInput("Interest Rate (% a year)", what + " interest rate", loan.rate,
                        (next) => setLoan({ rate: next }), "e.g. 6", undefined, NUMBER_LIMITS.percent)}
                    {picker("Interest Type", what + " interest type",
                        [{ id: "fixed", label: "Fixed" }, { id: "variable", label: "Variable" }],
                        loan.interestType,
                        (next) => setLoan({ interestType: next as FundingSourceValue["loan"]["interestType"] }),
                        "Select")}
                </div>
                <div className="business-capability-row">
                    {monthField("Loan Start", loan.start, (next) => setLoan({ start: next }),
                        ["When the loan is paid out."])}
                    {monthField("Repayment Start", loan.repaymentStart, (next) => setLoan({ repaymentStart: next }))}
                </div>
                <div className="business-capability-row">
                    {picker("Repayment Frequency", what + " repayment frequency", PERIOD_FREQUENCIES,
                        loan.frequency,
                        (next) => setLoan({ frequency: (next || "monthly") as FundingSourceValue["loan"]["frequency"] }),
                        "Select")}
                    {textInput("Number of Payments", what + " number of payments", loan.payments,
                        (next) => setLoan({ payments: next }), "e.g. 24", undefined, NUMBER_LIMITS.payments)}
                    {picker("Repayment Method", what + " repayment method", LOAN_METHODS, loan.method,
                        (next) => setLoan({ method: (next || "annuity") as FundingSourceValue["loan"]["method"] }),
                        "Select", explain(LOAN_METHODS))}
                </div>
            </>
        );

    }

    /** A loan's repayment summary, and its schedule on request, under the card's grid. */
    function loanSummary(source: FundingSourceValue) {

        const loan = source.loan;
        const schedule = loanSchedule(source, start);
        const showing = schedulesOpen.has(source.id);
        const frequency = PERIOD_FREQUENCIES.find(entry => entry.id === loan.frequency)?.label.toLowerCase() ?? "";

        return (
            <>
                {schedule
                    ? (
                        <div className="financial-loan-summary">
                            <p>
                                <strong>{format(schedule.firstPayment)}</strong>{" "}
                                <InfoText text={frequency}>
                                    <InfoNote label="Loan repayment" points={LOAN_PAYMENT_HELP} />
                                </InfoText>
                                {" · "}Principal {format((schedule.firstRepayment ?? schedule.payments[0]).principal)} + interest {format((schedule.firstRepayment ?? schedule.payments[0]).interest)}
                                {" · "}Total interest {format(schedule.totalInterest)}
                                {" · "}Last payment {planMonthLabel(start, schedule.payments[schedule.payments.length - 1].month)}
                            </p>
                            <p className="financial-muted">
                                Principal repayments are a financing outflow, not an operating cost; the interest is the cost of borrowing.
                            </p>
                            {schedule.payments.some(payment => payment.principal === 0) && (
                                <p className="financial-muted">
                                    <InfoText text="Interest accrues on the whole principal from the month it is drawn until repayments begin.">
                                        <InfoNote label="Interest before repayment starts" points={LOAN_PRE_INTEREST_HELP} />
                                    </InfoText>
                                </p>
                            )}
                            <TextLink
                                type="button"
                                className="business-engagement-link"
                                aria-expanded={showing}
                                onClick={() => setSchedulesOpen(current => toggledIn(current, source.id))}
                            >
                                {showing ? "Hide repayment schedule" : "Show repayment schedule"}
                            </TextLink>
                            {showing && (
                                <div className="financial-table-scroll">
                                    <FigureTable>
                                        <thead>
                                            <tr>
                                                <th scope="col">Date</th>
                                                <th scope="col">Payment</th>
                                                <th scope="col">Principal</th>
                                                <th scope="col">Interest</th>
                                                <th scope="col">Remaining</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {schedule.payments.map(payment => (
                                                <tr key={payment.month}>
                                                    <th scope="row">{planMonthLabel(start, payment.month)}</th>
                                                    <td>{format(payment.payment)}</td>
                                                    <td>{format(payment.principal)}</td>
                                                    <td>{format(payment.interest)}</td>
                                                    <td>{format(payment.remaining)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </FigureTable>
                                </div>
                            )}
                        </div>
                    )
                    : (
                        <BusinessEmpty>
                            Enter the principal, the number of payments and when repayments start to
                            calculate the repayment schedule.
                        </BusinessEmpty>
                    )}
            </>
        );

    }

    function fundingCard(source: FundingSourceValue, index: number) {

        const type = fundingType(source.type);
        const nature = type?.nature;
        const what = source.name.trim() || type?.label || "Funding Source " + (index + 1);
        const confirmedStatus = source.status === "approved" || source.status === "received" || source.status === "closed";

        const types = FUNDING_TYPES
            .filter(entry => entry.category === source.category)
            .map(entry => ({
                id: entry.id,
                label: entry.family ? entry.label + " (" + entry.family + ")" : entry.label
            }));

        const formattedAmount = source.amount.trim() ? format(fundingStanding(source, start).total) : "";

        return (
            <BusinessCard
                key={source.id}
                className="financial-funding-card"
                kind="Source"
                anchor={source.id}
                number={index + 1}
                name={source.name}
                onName={(next) => changeSource(source.id, { name: next })}
                open={folds.isOpen(source.id)}
                onToggle={() => folds.toggle(source.id)}
                disabled={disabled}
                summary={summaryText(
                    FUNDING_TYPES.find(t => t.id === source.type)?.label,
                    formattedAmount,
                    FUNDING_STATUSES.find(s => s.id === source.status)?.label
                )}
                actions={
                    <BusinessRemove
                        what={what}
                        disabled={disabled}
                        onRemove={() => update({ funding: stored.funding.filter(entry => entry.id !== source.id) })}
                    />
                }
            >

                <div className="financial-funding-grid">
                <div className="business-capability-row">
                    {picker("Funding Type", what + " type", types, source.type,
                        (next) => changeSource(source.id, { type: next }), "Select a type")}
                    {textInput(
                        nature === "debt" ? "Lender" : nature === "equity" ? "Investor" : "Provider / Source",
                        what + " provider", source.provider,
                        (next) => changeSource(source.id, { provider: next }))}
                </div>

                <div className="business-capability-row">
                    {textInput(nature === "debt" ? "Principal Amount" : "Total Amount", what + " amount",
                        source.amount, (next) => changeSource(source.id, { amount: next }), amountPlaceholder,
                        undefined, NUMBER_LIMITS.money)}
                    {picker("Status", what + " status", FUNDING_STATUSES, source.status,
                        (next) => changeSource(source.id, { status: next as FundingSourceValue["status"] }),
                        "Select a status", explain(FUNDING_STATUSES))}
                    {confirmedStatus && textInput(
                        "Received So Far", what + " received so far", source.received,
                        (next) => changeSource(source.id, { received: next }),
                        source.status === "approved" ? amountPlaceholder : "All of it, unless less",
                        ["How much has actually arrived. The rest counts as confirmed future money."],
                        NUMBER_LIMITS.money
                    )}
                </div>

                {/* ONE GRID FOR THE CARD'S SHORT FIELDS: what it is, how
                    much and when, the schedule or the loan's terms, the
                    equity -- all in the same columns, never on rows of
                    their own under the grid. The standing line takes a
                    row of its own, under the amount. */}
                {standingLine(source)}

                {nature === "debt" ? loanTermFields(source, what) : scheduleFields(source, what)}

                {nature === "equity" && textInput(
                    "Ownership / Equity (%)", what + " equity", source.equity,
                    (next) => changeSource(source.id, { equity: next }), "e.g. 10",
                    ["The share given in exchange. The Legal Entity remains where legal ownership is recorded."],
                    NUMBER_LIMITS.percent
                )}
                </div>

                {nature === "debt" && loanSummary(source)}

                <OptionalNote
                    label="Purpose"
                    ariaLabel={what + " purpose"}
                    placeholder="What it supports"
                    disabled={disabled}
                    value={source.purpose}
                    onChange={(next) => changeSource(source.id, { purpose: next })}
                />

                <OptionalNote
                    label="Conditions"
                    ariaLabel={what + " conditions"}
                    disabled={disabled}
                    value={source.conditions}
                    onChange={(next) => changeSource(source.id, { conditions: next })}
                />

                <BusinessField label="Linked Funding Need">
                    {calculatedNeeds.every(need => need.amount <= 0.005)
                        ? <BusinessEmpty>No Funding Need yet: it is calculated from the costs.</BusinessEmpty>
                        : (
                            <BusinessTicks
                                name={what + " funding needs"}
                                options={calculatedNeeds
                                    .filter(need => need.amount > 0.005 || source.needIds.includes(need.id))
                                    .map(need => ({ id: need.id, label: need.label, meaning: format(need.amount) }))}
                                chosen={source.needIds}
                                disabled={disabled}
                                onChange={(next) => changeSource(source.id, { needIds: next })}
                            />
                        )}
                </BusinessField>

            </BusinessCard>
        );

    }

    /**
     * The founders' capital, answered on the Legal Entity: who, and how
     * much, and the total. Counted as in hand from the plan's start.
     */
    function founderCapitalList(capital: FundingSourceValue[]) {

        const total = capital.reduce((sum, source) => sum + fundingStanding(source, start).total, 0);

        return (
            <div className="financial-need-card financial-capital-card">
                <strong className="financial-need-name">Founders' Capital</strong>
                <ul className="financial-cost-inputs">
                    {capital.map(source => (
                        <li key={source.id}>
                            <span>{source.provider.trim() || "Unnamed founder"}</span>
                            <span>{format(fundingStanding(source, start).total)}</span>
                        </li>
                    ))}
                    <li className="financial-cost-inputs-total">
                        <span>Total</span><span>{format(total)}</span>
                    </li>
                </ul>
            </div>
        );

    }

    function fundingSection() {

        const capital = founderCapitalSources(stored, legalEntity);

        return (
            <div className="financial-section-body">
                {/* INTERNAL, EXTERNAL AND OTHER, each across the section:
                    a loan's terms are long and a founder's capital is
                    short, so side by side they left gaps. Within each,
                    its sources sit side by side. */}
                <div className="financial-funding-categories">
                    {FUNDING_CATEGORIES.map(category => {

                        const of = stored.funding.filter(source => source.category === category.id);

                        return (
                            <div className="financial-funding-category" key={category.id}>

                                <div className="fold-group-head">
                                    <span className="business-foundation-label-info">
                                        <span className="business-capability-subhead">
                                            <InfoText text={category.label}>
                                                <InfoNote label={category.label} points={CATEGORY_INFO[category.id]} fullList />
                                            </InfoText>
                                        </span>
                                    </span>

                                    <FoldAllToggle
                                        ids={of.map(source => source.id)}
                                        folds={folds}
                                        label="funding sources"
                                    />
                                </div>

                                {((category.id === "internal" && capital.length > 0) || of.length > 0) && (
                                    <div className="financial-funding-cards">
                                        {category.id === "internal" && capital.length > 0 && founderCapitalList(capital)}
                                        {of.map((source, index) => fundingCard(source, index))}
                                    </div>
                                )}

                                <BusinessAddButton
                                    label="Funding Source"
                                    disabled={disabled}
                                    onAdd={() => {
                                        const source = createFundingSource(category.id);
                                        update({ funding: [...stored.funding, source] });
                                        folds.expand(source.id);
                                    }}
                                />

                            </div>
                        );

                    })}
                </div>
            </div>
        );

    }

    /* ---------- 4. Financial Position ---------- */

    function positionSection() {

        const position = financialPosition(page, lines, legalEntity, currency, format, revenuePage, launched?.launch);

        const runway = !position.hasOutflows
            ? "n/a"
            : position.runwayMonths === null
                ? months + "+ months"
                : position.runwayMonths + " month" + (position.runwayMonths === 1 ? "" : "s");

        const covered = position.need > 0 && position.gap <= 0.005;

        const mixTotal = position.mix.reduce((sum, entry) => sum + entry.confirmed + entry.pending, 0);

        return (
            <div className="financial-section-body">

                <div className={"financial-headline financial-headline-" +
                    (position.gap > 0.005 ? "risk" : covered ? "good" : "neutral")}>
                    {position.gap > 0.005
                        ? <strong>Additional financing required: {format(position.gap)}</strong>
                        : covered
                            ? <strong>Funding Requirement Covered</strong>
                            : <strong>No Funding Need recorded yet</strong>}
                    {position.gap <= 0.005 && (
                        <span>
                            {!position.hasOutflows
                                ? "Record costs and funding above to estimate the Financial Runway."
                                : "Estimated Financial Runway: " + (position.runwayMonths === null
                                    ? "beyond the " + months + "-month plan"
                                    : runway)}
                        </span>
                    )}
                </div>

                <FigureTiles tiles={[
                    { label: "Funding Need", value: format(position.need), info: [DEFINITIONS.need] },
                    { label: "Available Now", value: format(position.availableNow), info: ["Financial resources that have arrived and can be used."] },
                    { label: "Confirmed Future", value: format(position.confirmedFuture), info: ["Confirmed, but not yet available."] },
                    { label: "Pending", value: format(position.pending), info: ["Expected, not yet confirmed. Not counted in the gap or the runway."] },
                    {
                        label: "Funding Gap",
                        value: format(position.gap),
                        tone: position.gap > 0.005 ? "risk" : covered ? "good" : "neutral",
                        info: [DEFINITIONS.gap, FUNDING_GAP_FORMULA]
                    },
                    {
                        label: "Financial Runway",
                        value: runway,
                        tone: position.runwayMonths !== null && position.runwayMonths < 6 ? "risk" : "neutral",
                        info: [
                            DEFINITIONS.runway,
                            "Counts money available now and confirmed money as it is scheduled to arrive, against every scheduled cost and loan repayment, with the revenue expected on Sustainability as it is received.",
                            RUNWAY_FORMULA,
                            RUNWAY_SOURCE
                        ]
                    }
                ]} />

                {position.coverage.length > 0 && (
                    <FinancialBlock title="Funding Need Coverage" info={["Confirmed and available funding linked to each need under Capital & Funding."]}>
                        <ul className="financial-coverage">
                            {position.coverage.map(entry => {
                                const share = entry.need > 0 ? Math.min(1, entry.linked / entry.need) : 0;
                                return (
                                    <li key={entry.id}>
                                        <span>{entry.name}</span>
                                        <span className="financial-meter" aria-hidden="true">
                                            <span style={{ width: (share * 100) + "%" }} />
                                        </span>
                                        <span>{format(entry.linked)} of {format(entry.need)}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </FinancialBlock>
                )}

                {mixTotal > 0 && (
                    <FinancialBlock title="Funding Mix" info={["Where the financial resources originate, confirmed and pending."]}>
                        <div className="financial-mix-bar" aria-hidden="true">
                            {position.mix.map((entry, index) => (
                                <span
                                    key={entry.nature}
                                    className={"financial-mix-segment financial-series-" + (index + 1)}
                                    style={{ flexGrow: entry.confirmed + entry.pending }}
                                />
                            ))}
                        </div>
                        <ul className="financial-mix-legend">
                            {position.mix.map((entry, index) => (
                                <li key={entry.nature}>
                                    <span className={"financial-swatch financial-series-" + (index + 1)} />
                                    <span>{entry.label}</span>
                                    <span>
                                        {Math.round((entry.confirmed + entry.pending) / mixTotal * 100)}%
                                        {" · "}{format(entry.confirmed)} confirmed
                                        {entry.pending > 0 ? " · " + format(entry.pending) + " pending" : ""}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </FinancialBlock>
                )}

                <FinancialBlock
                    title="Funding Timeline"
                    info={["Money in and out of your organization month by month, and the balance it leaves. A dip below zero is a cash-pressure period, even when the totals are sufficient."]}
                >
                    {position.timeline.some(month => month.inflow > 0 || month.outflow > 0 || month.balance !== 0)
                        ? (
                            <CashTimelineChart
                                timeline={position.timeline}
                                format={format}
                                markers={position.runwayMonths !== null
                                    ? [{ month: position.runwayMonths + 1, label: "Funds run out", tone: "risk" }]
                                    : []}
                            />
                        )
                        : <BusinessEmpty>Nothing is scheduled to come in or go out yet.</BusinessEmpty>}
                </FinancialBlock>

                <FinancialBlock title="Upcoming Obligations" info={["Significant money in or out over the next six months."]}>
                    {position.obligations.length === 0
                        ? <BusinessEmpty>Nothing significant scheduled in the next six months.</BusinessEmpty>
                        : (
                            <ul className="financial-obligations">
                                {position.obligations.map((entry, index) => (
                                    <li key={entry.what + index}>
                                        <span className="financial-obligation-month">{entry.label}</span>
                                        <span>{entry.what}</span>
                                        <span className={"financial-obligation-" + entry.direction}>
                                            {entry.direction === "in" ? "+" : "−"}{format(entry.amount)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                </FinancialBlock>

                <FinancialBlock title="Decision Signals">
                    <SignalList signals={position.signals} />
                    {position.uncounted.unscheduled.length > 0 && (
                        <p className="financial-muted">
                            {position.uncounted.unscheduled.length} cost{position.uncounted.unscheduled.length === 1 ? "" : "s"} paid
                            per unit, per order, per project or by usage depend on activity and are not in the timeline.
                            Sustainability counts those paid per unit, per order or per project against revenue;
                            one paid by usage needs a per-unit, per-project or periodic basis to be counted.
                        </p>
                    )}
                    <p className="financial-muted">
                        These are observations calculated from the information entered, not financial advice.
                    </p>
                </FinancialBlock>

            </div>
        );

    }

    /* ---------- The page ---------- */

    const sections = [
        { id: "financial-costs", section: SECTIONS.costs, body: costsSection },
        { id: "financial-need", section: SECTIONS.need, body: needSection },
        { id: "financial-funding", section: SECTIONS.funding, body: fundingSection },
        { id: "financial-position", section: SECTIONS.position, body: positionSection }
    ];

    return (
        <div className="financial-page business-foundation business-engagement business-capability">

            <FinancialPageHead
                sections={[SECTIONS.costs, SECTIONS.need, SECTIONS.funding, SECTIONS.position]}
                showInstructions={showInstructions}
                columnsDivider={columnsDivider}
            />

            {/* (The plan's own settings -- Plan Start, Opening Date, Plan Length, Amounts, Income Tax -- are on the Global Settings screen.) */}
            <div className="financial-plan-bar">
                {/* The plan's months and its currency are in the
                    page title ("… · Jan 2027 – Dec 2029 · USD"). */}
                {!currency && (
                    <span className="financial-plan-meta">
                        Choose a country on 1. Identity System → 3. Legal Entity to set the currency.
                    </span>
                )}
                {offerings.length === 0 && onOpenFoundation && (
                    <span className="financial-plan-meta">
                        No Offerings yet:{" "}
                        <TextLink type="button" className="business-engagement-link" onClick={() => onOpenFoundation()}>
                            define them on Foundation
                        </TextLink>
                    </span>
                )}
            </div>

            {sections.map((entry, index) => (
                <div className="financial-flow-step" key={entry.id}>
                    {index > 0 && <span className="financial-flow-arrow" aria-hidden="true">↓</span>}
                    {sectionCard(entry.id, entry.section, entry.body, index)}
                </div>
            ))}

        </div>
    );

}
