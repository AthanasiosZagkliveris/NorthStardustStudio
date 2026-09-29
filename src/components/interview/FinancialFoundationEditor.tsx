import { ReactNode, useState } from "react";

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
    COST_BEHAVIOURS,
    COST_FREQUENCIES,
    COST_GROUPS,
    FINANCIAL_FOUNDATION_SECTIONS,
    FUNDING_CATEGORIES,
    FUNDING_NEED_CATEGORIES,
    FUNDING_SCHEDULES,
    FUNDING_STATUSES,
    FUNDING_TYPES,
    LOAN_METHODS,
    PERIOD_FREQUENCIES,
    PLAN_YEAR_CHOICES,
    planLength,
    planYears,
    asFinancialFoundationValue,
    consolidateCosts,
    createFundingSource,
    createMilestone,
    createOwnCost,
    financialPosition,
    founderCapitalSources,
    fundingNeeds,
    fundingStanding,
    fundingType,
    effectiveVatBasis,
    isNonCash,
    formatUnits,
    paidBeforePlan,
    scheduledAmount,
    possibleDuplicates,
    INCOME_TAX_BASES,
    vatBases,
    isScheduled,
    loanSchedule,
    moneyFormatter,
    monthlyEquivalent,
    planMonthLabel,
    withPlanStart,
    type CostBehaviour,
    COST_ASSETS,
    type CostClassification,
    type CostFrequency,
    type CostGroup,
    type CostLine,
    type FinancialFoundationValue,
    type FundingCategory,
    asFinancialSustainabilityValue,
    withDemand,
    type FundingSourceValue,
    type OwnCostValue
} from "../../framework/engine/FinancialModel.ts";
import { costSourcesFor } from "../../framework/engine/ExportRenderers.ts";
import { paletteHueNamed } from "../../framework/engine/Palette.ts";

import {
    BusinessAddButton,
    BusinessCard,
    BusinessEmpty,
    BusinessField,
    BusinessNote,
    BusinessRemove,
    BusinessTicks,
    uniqueChoices
} from "./BusinessCardFields.tsx";
import {
    CashTimelineChart,
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
import { jurisdictionProfile } from "../../framework/engine/LegalEntityJurisdictions.ts";
import type { OpenPage } from "./jumpTo.ts";
import { railId } from "./rails/railItems.ts";
import { useItemFolds } from "./useItemFolds.ts";
import FoldArrow from "./FoldArrow.tsx";
import CardNameInput from "./CardNameInput.tsx";
import { toggledIn } from "./toggledIn.ts";

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
    "A fixed payment that covers interest and repays the loan over n periods; r is the rate per period (annual ÷ 12 for monthly).",
    {
        title: "Source",
        text: "Wikipedia, “Amortization calculator”",
        href: "https://en.wikipedia.org/wiki/Amortization_calculator"
    }
];

/** The interest-only months before the first repayment, its "i". */
const LOAN_PRE_INTEREST_HELP: InfoPoint[] = [
    { title: "Formula", text: "Interest = Principal × Rate × Time" },
    "Interest on the amount borrowed only, without compounding.",
    {
        title: "Source",
        text: "CFI, “Simple Interest”",
        href: "https://corporatefinanceinstitute.com/resources/commercial-lending/simple-interest/"
    }
];

/** The funding gap formula, added to that figure's own info. */
const FUNDING_GAP_FORMULA: InfoPoint = {
    title: "Formula",
    text: "Funding gap = Funding needed − Funding available and confirmed"
};
const FUNDING_GAP_SOURCE: InfoPoint = {
    title: "Source",
    text: "WallStreetMojo, “Funding Gap”",
    href: "https://www.wallstreetmojo.com/funding-gap/"
};

/** The runway formula, added to that figure's own info. */
const RUNWAY_FORMULA: InfoPoint = {
    title: "Formula",
    text: "Runway = Cash ÷ Monthly net burn (here: the first month the projected balance goes below zero)"
};
const RUNWAY_SOURCE: InfoPoint = {
    title: "Source",
    text: "CFI, “Cash Runway Explained”",
    href: "https://corporatefinanceinstitute.com/resources/valuation/cash-runway-explained/"
};

const SECTIONS = {
    costs: {
        title: "Costs",
        instructions: [
            "Review the costs gathered from the Legal Entity and Infrastructure & Capability, and add any recorded nowhere else.",
            "Classify each cost by what it supports, how it behaves, and when it is paid."
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
 * Business pages has one: rose, sand, sage, sky -- a quarter of the
 * wheel apart, so no two neighbours read alike. Fixed rather than
 * hashed from the id, because these four never change and a hash
 * can land two of them side by side.
 */
const SECTION_HUES: Record<string, number> = {
    "financial-costs": paletteHueNamed("rose"),
    "financial-need": paletteHueNamed("sand"),
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
    /** Financial Sustainability's answer: the revenue the operating need is net of. */
    sustainability?: unknown;
    /** Customer Engagement's answer: expected sales from its Demand & Conversion. */
    engagement?: unknown;
    /** The organisation's currency, from the Legal Entity's country. */
    currency?: string;
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

    onOpenFoundation,

    onOpenCapability,

    onOpenLegalEntity

}: FinancialFoundationEditorProps) {

    const stored = asFinancialFoundationValue(value);

    /* Calculated against this month until a plan start is chosen. */
    const page = withPlanStart(stored);
    const start = page.planStart;
    const months = planLength(page);
    const revenuePage = withDemand(
        asFinancialSustainabilityValue(sustainabilityValue),
        asBusinessEngagementValue(engagementValue).demand
    );

    const legalEntity = legalEntityValue ?? asLegalEntityValue(undefined);


    const capability = withLegalEntityFounders(
        asBusinessCapabilityValue(capabilityValue),
        legalEntity.founders
    );

    const lines = consolidateCosts(page, costSourcesFor(legalEntity, capability, currency));

    // Whole units everywhere on this read-only page: an amount
    // someone can edit shows the string they typed, never this
    // formatter, so nobody's own pence are ever hidden by it.
    const format = moneyFormatter(currency, { wholeOnly: true });

    /* The Funding Need, calculated once: its section and every
       funding card's "Linked Funding Need" read the same list. */
    const calculatedNeeds = fundingNeeds(page, lines, legalEntity, revenuePage, format);

    /** The other half of a likely duplicate, if this cost is one. */
    const duplicates = possibleDuplicates(lines);
    const duplicateOf = (line: CostLine) => {
        const pair = duplicates.find(([one, other]) => one.id === line.id || other.id === line.id);
        return pair ? (pair[0].id === line.id ? pair[1] : pair[0]) : null;
    };

    const offerings = uniqueChoices(
        businessFoundationSegments(foundation).flatMap(segment => segment.offerings),
        "Unnamed offering"
    );

    const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

    /**
     * Which Funding Source cards are open. Funding sources start
     * CLOSED -- see useItemFolds -- unlike the structural sections
     * and categories around them, which stay on `collapsed` and so
     * start open.
     */
    const folds = useItemFolds();

    const [schedulesOpen, setSchedulesOpen] = useState<ReadonlySet<string>>(new Set());
    /* Read costs whose classification is open for changing. Closed,
       a row reads as plain text: most costs need no decision here. */
    const [editingCosts, setEditingCosts] = useState<ReadonlySet<string>>(new Set());

    function toggle(key: string) {
        setCollapsed(current => toggledIn(current, key));
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
                open={!collapsed.has(id)}
                onToggle={() => toggle(id)}
                body={body}
            />
        );
    }

    /* ---------- 1. Costs ---------- */

    function classify(line: CostLine, patch: Partial<CostClassification>) {
        if (line.own) {
            changeOwnCost(line.own.id, patch);
            return;
        }
        update({
            classified: {
                ...stored.classified,
                [line.id]: { ...stored.classified[line.id], ...patch }
            }
        });
    }

    function changeOwnCost(id: string, patch: Partial<OwnCostValue>) {
        update({
            costs: stored.costs.map(cost => cost.id === id ? { ...cost, ...patch } : cost)
        });
    }

    function frequencyLabel(line: CostLine): string {
        const label = COST_FREQUENCIES.find(entry => entry.id === line.frequency)?.label ?? "";
        return line.frequency === "other" && line.frequencyOther.trim()
            ? line.frequencyOther.trim()
            : label;
    }

    function toggleEditing(id: string) {
        setEditingCosts(current => toggledIn(current, id));
    }

    function whenText(line: CostLine): string {
        const { month, year } = line.month;
        if (paidBeforePlan(line, start)) {
            return "Paid before the plan";
        }
        if (month && year) {
            return new Date(Number(year), Number(month) - 1, 1)
                .toLocaleString("en-GB", { month: "short", year: "numeric" });
        }
        return line.frequency === "one-time" ? "At the start" : "From the start";
    }

    const MOVABLE_GROUPS = COST_GROUPS.filter(group => group.id !== "offering");

    function costRow(line: CostLine, oneTimeGroup = false) {

        const own = line.own;
        const what = line.name;
        /* Its name, amount and frequency are always open on an added
           cost; how it is counted opens on "Change", as a read one's. */
        const editing = editingCosts.has(line.id);
        /* Only the Offering group says how a cost moves with sales,
           and which Offering it is for. */
        const forOffering = line.group === "offering";
        const offeringName = line.offeringIds
            .map(id => offerings.find(offering => offering.id === id)?.label ?? "")
            .filter(Boolean)
            .join(", ");

        return (
            <div className="financial-cost-row" key={line.id} role="row" data-anchor={"cost-" + line.id}>

                <div className="financial-cost-name" role="cell">
                    {own
                        ? (
                            <CardNameInput
                                ariaLabel={"Added cost " + (stored.costs.indexOf(own) + 1) + " name"}
                                placeholder="Cost name"
                                disabled={disabled}
                                value={own.name}
                                onChange={(name) => changeOwnCost(own.id, { name })}
                            />
                        )
                        : <span className="financial-cost-title">{line.name}</span>}
                    <span className="financial-cost-source">
                        {line.origin === "own"
                            ? "Added here"
                            : (line.origin === "legal-entity" ? onOpenLegalEntity : onOpenCapability)
                                ? (
                                    /* To the card it was recorded on. */
                                    <button
                                        type="button"
                                        className="business-engagement-link financial-cost-link"
                                        onClick={() => (line.origin === "legal-entity" ? onOpenLegalEntity : onOpenCapability)?.(line.sourcePath)}
                                    >
                                        {(line.origin === "legal-entity" ? "1. Identity System → " : "") + line.sourceLabel}
                                    </button>
                                )
                                : (line.origin === "legal-entity" ? "1. Identity System → " : "") + line.sourceLabel}
                    </span>
                </div>

                <div role="cell">
                    {own
                        ? (
                            <input
                                type="text"
                                inputMode="decimal"
                                className="interview-input"
                                aria-label={what + " amount"}
                                placeholder={amountPlaceholder}
                                disabled={disabled}
                                value={own.amount}
                                onChange={(event) => changeOwnCost(own.id, { amount: limitedNumberText(event.target.value, own.amount, NUMBER_LIMITS.money) })}
                            />
                        )
                        : (
                            <span className="financial-cost-amount">
                                {line.amount === null
                                    ? line.amountText
                                    : line.counted
                                        ? format(scheduledAmount(line))
                                        : line.amountText + " " + line.currency}
                            </span>
                        )}
                    {/* Separated: what is paid anyway, and what each sale adds. */}
                    {line.behaviour === "semi-variable" && line.counted && line.amount !== null &&
                        (line.fixedPart !== null || line.variablePerUnit !== null) && (
                        <span className="financial-cost-source">
                            + {format(line.variablePerUnit ?? 0)} per unit sold (recorded as {format(line.amount)})
                        </span>
                    )}
                    {line.quantity !== null && line.unitAmount !== null && (
                        <span className="financial-cost-source">
                            {formatUnits(line.quantity)} × {line.counted ? format(line.unitAmount) : line.unitAmount + " " + line.currency}
                        </span>
                    )}
                    {!line.counted && (
                        <span className="financial-flag" title="Not in any total: no exchange rate to convert it with.">
                            Other currency: not counted
                        </span>
                    )}
                    {duplicateOf(line) && (
                        <span className="financial-flag">
                            Also recorded as “{duplicateOf(line)!.name}” ({duplicateOf(line)!.sourceLabel}). Counted twice?
                        </span>
                    )}
                </div>

                {!oneTimeGroup && (
                <div role="cell">
                    {own
                        ? (
                            <OptionPicker
                                label={what + " frequency"}
                                placeholder="Frequency"
                                options={COST_FREQUENCIES.map(entry => entry.label)}
                                disabled={disabled}
                                value={COST_FREQUENCIES.find(entry => entry.id === own.frequency)?.label ?? ""}
                                onChange={(next) => changeOwnCost(own.id, {
                                    frequency: (COST_FREQUENCIES.find(entry => entry.label === next)?.id ?? "") as CostFrequency | ""
                                })}
                            />
                        )
                        : line.sourceFrequency === "other"
                            ? (
                                /* Recorded as "Other" where it came from: say
                                   what it is here, so it can be counted. */
                                <>
                                    <OptionPicker
                                        label={what + " frequency"}
                                        placeholder="What is it?"
                                        options={COST_FREQUENCIES.map(entry => entry.label)}
                                        disabled={disabled}
                                        value={COST_FREQUENCIES.find(entry => entry.id === line.frequency)?.label ?? ""}
                                        onChange={(next) => classify(line, {
                                            frequency: (COST_FREQUENCIES.find(entry => entry.label === next)?.id ?? "") as CostFrequency | ""
                                        })}
                                    />
                                    {line.frequencyOther.trim() && (
                                        <span className="financial-cost-source">Recorded as “{line.frequencyOther.trim()}”</span>
                                    )}
                                </>
                            )
                            : <span>{frequencyLabel(line)}</span>}
                    {own && own.frequency === "other" && (
                        <input
                            type="text"
                            className="interview-input financial-inline-input"
                            aria-label={what + " frequency, named"}
                            placeholder="Name the frequency"
                            disabled={disabled}
                            value={own.frequencyOther}
                            onChange={(event) => changeOwnCost(own.id, { frequencyOther: event.target.value })}
                        />
                    )}
                </div>
                )}

                <div role="cell">
                    {!isScheduled(line)
                        ? <span className="financial-muted">Depends on activity</span>
                        : editing
                            ? (
                                <MonthYearPicker
                                    hideLabel
                                    label={what + (line.frequency === "one-time" ? " paid in" : " first paid in")}
                                    value={line.month}
                                    disabled={disabled}
                                    firstYear={Number(start.year)}
                                    isAllowed={() => true}
                                    onChange={(next) => classify(line, { month: next })}
                                />
                            )
                            : <span>
                                {/* In a group of one-time costs, only one that
                                    is not says how often it falls. */}
                                {oneTimeGroup && line.frequency !== "one-time" ? frequencyLabel(line) + ", " + whenText(line).toLowerCase() : whenText(line)}
                                {line.asset ? " · " + (COST_ASSETS.find(entry => entry.id === line.asset)?.label ?? "") : ""}
                            </span>}
                </div>

                {forOffering && (
                    <div role="cell">
                        {editing
                            ? (
                                <OptionPicker
                                    label={what + " behaviour"}
                                    placeholder="Behaviour"
                                    options={COST_BEHAVIOURS.map(entry => entry.label)}
                                    disabled={disabled}
                                    value={COST_BEHAVIOURS.find(entry => entry.id === line.behaviour)?.label ?? ""}
                                    onChange={(next) => classify(line, {
                                        behaviour: (COST_BEHAVIOURS.find(entry => entry.label === next)?.id ?? "fixed") as CostBehaviour
                                    })}
                                />
                            )
                            : <span>{COST_BEHAVIOURS.find(entry => entry.id === line.behaviour)?.label ?? ""}</span>}
                    </div>
                )}

                {forOffering && (
                    <div role="cell">
                        {own && editing && offerings.length > 0
                            ? (
                                /* Only an added cost says its Offering here:
                                   a read one is linked on Page 3. */
                                <OptionPicker
                                    label={what + " offering"}
                                    placeholder="Select an Offering"
                                    options={offerings.map(offering => offering.label)}
                                    disabled={disabled}
                                    value={offeringName}
                                    onChange={(next) => classify(line, {
                                        offeringId: offerings.find(offering => offering.label === next)?.id ?? ""
                                    })}
                                />
                            )
                            : offeringName
                                ? <span>{offeringName}</span>
                                : onOpenCapability && !own
                                    ? (
                                        <button type="button" className="business-engagement-link financial-cost-link" onClick={() => onOpenCapability(line.sourcePath)}>
                                            Link it on Infrastructure & Capability
                                        </button>
                                    )
                                    : <span className="financial-muted">Not linked</span>}
                    </div>
                )}

                <div role="cell" className="financial-cost-remove">
                    {!disabled && (
                        <button
                            type="button"
                            className="business-engagement-link financial-cost-change"
                            aria-expanded={editing}
                            aria-label={(editing ? "Done changing " : "Change how this is counted: ") + (line.name || "this cost")}
                            onClick={() => toggleEditing(line.id)}
                        >
                            {editing ? "Done" : "Change"}
                        </button>
                    )}
                    {own && (
                        <BusinessRemove
                            what={own.name.trim() || "this cost"}
                            disabled={disabled}
                            onRemove={() => update({
                                costs: stored.costs.filter(cost => cost.id !== own.id)
                            })}
                        />
                    )}
                </div>

                {/* What some costs need on a line of their own. */}
                {((forOffering && line.behaviour === "semi-variable") || (editing && (!forOffering || own || line.frequency === "one-time"))) && (
                    <div className="financial-cost-detail" role="cell">

                        {/* Something bought once can be kept: equipment the
                            business owns, or a deposit it gets back. */}
                        {editing && line.frequency === "one-time" && (
                            <BusinessField
                                label="Treat As"
                                info={COST_ASSETS.map(entry => ({ title: entry.label, text: entry.explanation }))}
                            >
                                <OptionPicker
                                    label={what + " treated as"}
                                    placeholder="Expense"
                                    options={COST_ASSETS.map(entry => entry.label)}
                                    disabled={disabled}
                                    value={COST_ASSETS.find(entry => entry.id === line.asset)?.label ?? "Expense"}
                                    onChange={(next) => classify(line, {
                                        asset: COST_ASSETS.find(entry => entry.label === next)?.id ?? ""
                                    })}
                                />
                            </BusinessField>
                        )}

                        {editing && !forOffering && (
                            <BusinessField label="Group">
                                <OptionPicker
                                    label={what + " group"}
                                    placeholder="Group"
                                    options={MOVABLE_GROUPS.map(entry => entry.label)}
                                    disabled={disabled}
                                    value={COST_GROUPS.find(entry => entry.id === line.group)?.label ?? ""}
                                    onChange={(next) => classify(line, {
                                        group: (COST_GROUPS.find(entry => entry.label === next)?.id ?? "other") as CostGroup
                                    })}
                                />
                            </BusinessField>
                        )}

                        {forOffering && line.behaviour === "semi-variable" && (
                            <>
                                {textInput(
                                    "Fixed Part",
                                    what + " fixed part",
                                    stored.classified[line.id]?.fixedPart ?? own?.fixedPart ?? "",
                                    (next) => classify(line, { fixedPart: next }),
                                    amountPlaceholder + " per " + (frequencyLabel(line).toLowerCase() || "period"),
                                    undefined,
                                    NUMBER_LIMITS.money
                                )}
                                {textInput(
                                    "Variable Part per Unit",
                                    what + " variable part per unit",
                                    stored.classified[line.id]?.variablePerUnit ?? own?.variablePerUnit ?? "",
                                    (next) => classify(line, { variablePerUnit: next }),
                                    amountPlaceholder + " per unit of the Offering",
                                    undefined,
                                    NUMBER_LIMITS.money
                                )}
                            </>
                        )}

                        {own && textInput(
                            "Description",
                            what + " description",
                            own.description,
                            (next) => changeOwnCost(own.id, { description: next }),
                            "Optional"
                        )}

                    </div>
                )}

            </div>
        );

    }

    function costTotals(of: CostLine[]) {
        const counted = of.filter(line => line.counted && line.amount !== null && !paidBeforePlan(line, start));
        const oneTime = counted
            .filter(line => line.frequency === "one-time")
            .reduce((sum, line) => sum + (line.amount ?? 0), 0);
        const recurring = counted
            .reduce((sum, line) => sum + monthlyEquivalent(scheduledAmount(line), line.frequency), 0);
        const parts: string[] = [];
        if (oneTime > 0) {
            parts.push(format(oneTime) + " one-time");
        }
        if (recurring > 0) {
            parts.push(format(recurring) + " / month");
        }
        return parts.join(" · ");
    }

    function costsSection() {

        return (
            <div className="financial-section-body">

                <p className="financial-lead">
                    Costs recorded on the Legal Entity and on Infrastructure & Capability are gathered here
                    automatically. Change an amount where it was recorded, and add here only what is recorded nowhere else.
                </p>

                {COST_GROUPS.map(group => {

                    const of = lines.filter(line => line.group === group.id);
                    const totals = costTotals(of);
                    const foldId = "costs-" + group.id;
                    const open = !collapsed.has(foldId);
                    const forOffering = group.id === "offering";
                    /* Establishment costs are one-time by what they are:
                       a Frequency column would say "One-time" on every row. */
                    const oneTimeGroup = group.id === "establishment";

                    return (
                        <div className="financial-cost-group" key={group.id} data-anchor={"cost-group-" + group.id}>

                            <div className="financial-cost-group-head">
                                <span className="business-foundation-label-info">
                                    <FoldArrow
                                        open={open}
                                        label={group.label + " costs"}
                                        onToggle={() => toggle(foldId)}
                                    />
                                    <span className="business-capability-subhead">
                                        <InfoText text={group.label}>
                                            <InfoNote label={group.label} points={[group.explanation]} fullList />
                                        </InfoText>
                                    </span>
                                </span>
                                {totals && <span className="financial-subtotal">{totals}</span>}
                            </div>

                            {open && (of.length === 0
                                ? <BusinessEmpty>No {group.label.toLowerCase()} costs yet.</BusinessEmpty>
                                : (
                                    <div
                                        className={"financial-cost-table" +
                                            (forOffering ? " financial-cost-table-offering" : "") +
                                            (oneTimeGroup ? " financial-cost-table-one-time" : "")}
                                        role="table"
                                        aria-label={group.label + " costs"}
                                    >
                                        <div className="financial-cost-row financial-cost-header" role="row">
                                            <span role="columnheader">Cost / Source</span>
                                            <span role="columnheader">Amount</span>
                                            {!oneTimeGroup && <span role="columnheader">Frequency</span>}
                                            <span role="columnheader">When</span>
                                            {forOffering && (
                                                <span role="columnheader" className="business-foundation-label-info">
                                                    <InfoText text="Behaviour">
                                                        <InfoNote label="Behaviour" points={explain(COST_BEHAVIOURS)} fullList />
                                                    </InfoText>
                                                </span>
                                            )}
                                            {forOffering && <span role="columnheader">Offering</span>}
                                            <span role="columnheader" />
                                        </div>
                                        {of.map(line => costRow(line, oneTimeGroup))}
                                    </div>
                                ))}

                            {open && (forOffering
                                ? (
                                    /* An Offering's costs are recorded with the
                                       Offering, on Page 3: one place for them. */
                                    <p className="financial-muted financial-cost-note">
                                        An Offering's costs are recorded on 3. Infrastructure & Capability → Offering's Capability
                                        {onOpenCapability && (
                                            <>
                                                {": "}
                                                <button
                                                    type="button"
                                                    className="business-engagement-link financial-cost-link"
                                                    onClick={() => onOpenCapability(["section-offering-resources", "capability-offering-capability"])}
                                                >
                                                    add one there
                                                </button>
                                            </>
                                        )}
                                        .
                                    </p>
                                )
                                : (
                                    <BusinessAddButton
                                        label="Cost"
                                        disabled={disabled}
                                        onAdd={() => {
                                            const cost = createOwnCost(group.id);
                                            update({ costs: [...stored.costs, cost] });
                                            toggleEditing(cost.id);
                                        }}
                                    />
                                ))}

                        </div>
                    );

                })}

                {lines.length > 0 && (
                    <p className="financial-total">
                        <strong>All costs:</strong> {costTotals(lines) || format(0)}
                    </p>
                )}

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

        return (
            <div className="financial-section-body">

                <p className="financial-lead">
                    Calculated from the costs above. To change a need, change the costs it is made of.
                    Until revenue is estimated on Financial Sustainability, every running cost is counted
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
                                            {category && <InfoNote label={need.label} points={[category.explanation]} fullList />}
                                        </InfoText>
                                    </strong>
                                </span>

                                <span className="financial-need-amount">{format(need.amount)}</span>
                                {need.when && <span className="financial-muted">{need.when}</span>}

                                {need.months
                                    ? (
                                        /* The first year, month by month. */
                                        <div className="financial-table-scroll">
                                            <table className="financial-table financial-need-months">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Month</th>
                                                        <th scope="col">Running Costs</th>
                                                        <th scope="col">Costs of Sales</th>
                                                        <th scope="col">Loan Repayments</th>
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
                                                            <td>{format(month.loans)}</td>
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
                                                        <td colSpan={6} />
                                                        <td><strong>{format(need.amount)}</strong></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    )
                                    : need.parts.length === 0
                                    ? <span className="financial-muted">Nothing recorded.</span>
                                    : (
                                        <ul className="financial-cost-inputs">
                                            {need.parts.map(part => (
                                                <li key={part.name + part.when}>
                                                    <span>{part.name}</span>
                                                    <span>{format(part.amount)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                {need.note && <p className="financial-muted financial-need-note">{need.note}</p>}

                            </div>
                        );

                    })}
                </div>

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

    function loanFields(source: FundingSourceValue, what: string) {

        const loan = source.loan;
        const setLoan = (patch: Partial<FundingSourceValue["loan"]>) =>
            changeSource(source.id, { loan: { ...loan, ...patch } });

        const schedule = loanSchedule(source, start);
        const showing = schedulesOpen.has(source.id);
        const frequency = PERIOD_FREQUENCIES.find(entry => entry.id === loan.frequency)?.label.toLowerCase() ?? "";

        return (
            <>
                {/* The terms flow as one grid: four across a wide card,
                    two across a narrow one. */}
                <div className="financial-funding-grid">
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
                </div>

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
                            <button
                                type="button"
                                className="business-engagement-link"
                                aria-expanded={showing}
                                onClick={() => setSchedulesOpen(current => toggledIn(current, source.id))}
                            >
                                {showing ? "Hide repayment schedule" : "Show repayment schedule"}
                            </button>
                            {showing && (
                                <div className="financial-table-scroll">
                                    <table className="financial-table">
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
                                    </table>
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
                </div>

                {standingLine(source)}

                {nature === "debt" ? loanFields(source, what) : scheduleFields(source, what)}

                {nature === "equity" && textInput(
                    "Ownership / Equity (%)", what + " equity", source.equity,
                    (next) => changeSource(source.id, { equity: next }), "e.g. 10",
                    ["The share given in exchange. The Legal Entity remains where legal ownership is recorded."],
                    NUMBER_LIMITS.percent
                )}

                {textInput("Purpose", what + " purpose", source.purpose,
                    (next) => changeSource(source.id, { purpose: next }), "What it supports")}

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

                <BusinessNote
                    label="Conditions"
                    ariaLabel={what + " conditions"}
                    disabled={disabled}
                    value={source.conditions}
                    onChange={(next) => changeSource(source.id, { conditions: next })}
                />

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

        const position = financialPosition(page, lines, legalEntity, currency, format, revenuePage);

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
                        info: [DEFINITIONS.gap, FUNDING_GAP_FORMULA, FUNDING_GAP_SOURCE]
                    },
                    {
                        label: "Financial Runway",
                        value: runway,
                        tone: position.runwayMonths !== null && position.runwayMonths < 6 ? "risk" : "neutral",
                        info: [
                            DEFINITIONS.runway,
                            "Counts money available now and confirmed money as it is scheduled to arrive, against every scheduled cost and loan repayment, with the revenue expected on Financial Sustainability as it is received.",
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
                            Financial Sustainability counts those paid per unit, per order or per project against revenue;
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

    /* The country's own consumption tax: VAT, GST, Sales Tax. */
    const taxName = jurisdictionProfile(legalEntity.organisation.country).consumptionTax.split(" (")[0];
    const taxBases = vatBases(taxName);

    return (
        <div className="financial-page business-foundation business-engagement business-capability">

            <FinancialPageHead
                sections={[SECTIONS.costs, SECTIONS.need, SECTIONS.funding, SECTIONS.position]}
                showInstructions={showInstructions}
                columnsDivider={columnsDivider}
            />

            <div className="financial-plan-bar">
                <PlanMonthField
                    label="Plan Start"
                    value={page.planStart}
                    planStart={{ month: "01", year: String(new Date().getFullYear() - 1) }}
                    disabled={disabled}
                    onChange={(next) => update({ planStart: next })}
                    info={["Month 1 of the financial plan. Every timeline on this page and on Financial Sustainability runs from it."]}
                />
                <BusinessField
                    label="Plan Length"
                    info={["How far ahead the plan looks. Lenders usually ask for the first year month by month and a profit and loss forecast for three years."]}
                >
                    <OptionPicker
                        label="Plan length"
                        placeholder="Select"
                        options={PLAN_YEAR_CHOICES.map(years => years + (years === 1 ? " year" : " years"))}
                        disabled={disabled}
                        value={planYears(page) + (planYears(page) === 1 ? " year" : " years")}
                        onChange={(next) => update({ planYears: String(parseInt(next, 10) || "") })}
                    />
                </BusinessField>
                <BusinessField
                    label="Amounts"
                    info={[
                        ...taxBases.map(entry => ({ title: entry.label, text: entry.explanation })),
                        "Use the same basis for every amount on this page and on Financial Sustainability."
                    ]}
                >
                    <OptionPicker
                        label={"Amounts include or exclude " + taxName}
                        placeholder="Select"
                        options={taxBases.map(entry => entry.label)}
                        disabled={disabled}
                        value={taxBases.find(entry => entry.id === effectiveVatBasis(stored, legalEntity))?.label ?? ""}
                        onChange={(next) => update({
                            vatBasis: taxBases.find(entry => entry.label === next)?.id ?? ""
                        })}
                    />
                </BusinessField>
                {/* How the forecast treats tax on profit. Not
                    estimated until chosen, as before it was asked. */}
                <BusinessField
                    label="Income Tax"
                    info={["Income tax on profit. Pass-through businesses (e.g. most sole traders and single-member LLCs) pay it personally, not at business level. For a company, enter the corporate rate; ask your accountant."]}
                >
                    <OptionPicker
                        label="Income tax"
                        placeholder="Select"
                        options={INCOME_TAX_BASES.map(entry => entry.label)}
                        disabled={disabled}
                        value={INCOME_TAX_BASES.find(entry => entry.id === stored.incomeTax)?.label ?? ""}
                        onChange={(next) => update({
                            incomeTax: INCOME_TAX_BASES.find(entry => entry.label === next)?.id ?? ""
                        })}
                    />
                </BusinessField>
                {stored.incomeTax === "rate" && textInput(
                    "Tax Rate (%)",
                    "Tax Rate (%)",
                    stored.incomeTaxRate,
                    (next) => update({ incomeTaxRate: next }),
                    "e.g. 25",
                    undefined,
                    NUMBER_LIMITS.percent
                )}
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
                        <button type="button" className="business-engagement-link" onClick={() => onOpenFoundation()}>
                            define them on Foundation
                        </button>
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
