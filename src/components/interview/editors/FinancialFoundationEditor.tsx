import { FINANCIALS_FRAMES } from "../../../framework/engine/PageGroups.ts";
import { offeringShareWeights } from "../../../framework/engine/DemandCapacity.ts";
import { countedCapability } from "../../../framework/engine/CardCompleteness.ts";
import { numberStep } from "./BusinessEngagementModel.ts";
import TextBox from "../../controls/TextBox.tsx";
import NumberCell from "../../controls/NumberCell.tsx";
import { calculatedLines } from "../../../framework/engine/CalculatedLines.ts";
import { contingencyFunds, launchNeedOf } from "../../../framework/engine/ContingencyFunds.ts";
import { ownersTakeDrawings } from "../../../framework/engine/FinancialForecast.ts";
import { capitalisationLimitOf, createGlobalSettings, type GlobalSettingsValue } from "../../../framework/engine/GlobalSettings.ts";
import { type CSSProperties, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { JOINED_CHAPTER_KEY, useJoinedChapter } from "../tiles/joinedChapter.ts";
import { type LegalEntityValue, type StrategyMonthValue, asBusinessCapabilityValue, asBusinessEngagementValue, asLegalEntityValue, businessFoundationSegments, withLegalEntityFounders } from "../../../framework/engine/AnswerUtils.ts";
import { assetUnitCostsOf, incomeTaxRate, COST_GROUPS, COST_FREQUENCIES, COST_NATURES, COST_NATURE_LABELS, natureSplitOf, FINANCIAL_FOUNDATION_SECTIONS, FUNDING_CATEGORIES, FUNDING_SCHEDULES, FUNDING_STATUSES, FUNDING_TYPES, LOAN_METHODS, PERIOD_FREQUENCIES, planLength, asFinancialFoundationValue, consolidateCosts, createFundingSource, createMilestone, financialPosition, founderCapitalSources, fundingNeeds, fundingStanding, fundingType, isNonCash, loanSchedule, moneyFormatter, monthlyEquivalent, planMonthLabel, withPlanStart, derivedPlanStart, legalExpenseDates, costStartDates, type CostLine, type FinancialFoundationValue, asFinancialSustainabilityValue, withDemand, type FundingSourceValue } from "../../../framework/engine/FinancialModel.ts";
import { costSourcesFor } from "../../../framework/engine/ExportRenderers.ts";
import { BusinessAddButton, BusinessCard, BusinessEmpty, BusinessField, OptionalNote, BusinessRemove, BusinessTicks, uniqueChoices } from "../cards/BusinessCardFields.tsx";
import { FigureTable, FigureTiles, PlanMonthField } from "./FinancialParts.tsx";
import CardShell from "../cards/CardShell.tsx";
import CardBoxes, { type CardBox } from "../cards/CardBoxes.tsx";
import DialogSectionBand from "../tiles/DialogSectionBand.tsx";
import { SingleColumn } from "./foundation/shared.tsx";
import { EngagementBox, EngagementBoxes } from "./engagement/EngagementCard.tsx";
import SectionTiles, { DialogHeading, stackedFace, type FaceRow, type SectionTile } from "../tiles/SectionTiles.tsx";
import { workHue } from "../../../framework/engine/WorkColours.ts";
import { summaryText } from "../cards/cardSummary.ts";
import InfoNote, { type InfoPoint, InfoText } from "../fields/InfoNote.tsx";
import MonthYearPicker from "../fields/MonthYearPicker.tsx";
import { NUMBER_LIMITS, type NumberLimit, limitedNumberText, numberInputMode } from "../fields/numberInput.ts";
import OptionPicker from "../fields/OptionPicker.tsx";
import { type OpenPage } from "../tiles/jumpTo.ts";
import { railId } from "../rails/railItems.ts";
import { toggledIn } from "../fields/toggledIn.ts";
import TextLink from "../fields/TextLink.tsx";
import { CATEGORY_INFO, LOAN_PAYMENT_HELP, LOAN_PRE_INTEREST_HELP, SECTIONS, explain } from "./financialFoundationTexts.ts";

/* ==========================================================
   The editor
========================================================== */

interface FinancialFoundationEditorProps {
    value: unknown;
    onChange: (value: FinancialFoundationValue) => void;
    disabled?: boolean;
    showInstructions?: boolean;
    columnsDivider?: ReactNode;
    /** The frame's heading the page hands in ("2. Financial Foundation": PageGroups.ts, layout rules section 13, "A page's name in the pages rail"). */
    frameTitle?: string;
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

    frameTitle = FINANCIALS_FRAMES[1],

    foundation,

    capability: capabilityValue,

    legalEntity: legalEntityValue,

    sustainability: sustainabilityValue,

    engagement: engagementValue,

    currency = "",

    openingDate = "",

    globalSettings,

    onOpenFoundation,

    onOpenLegalEntity

}: FinancialFoundationEditorProps) {

    // (On Financials, one chapter: this section's tiles are handed to it, and the chapter is told once this editor has drawn; joinedChapter.ts.)
    const joined = useJoinedChapter();
    useLayoutEffect(() => {
        joined?.changed();
    });

    const stored = asFinancialFoundationValue(value);

    const legalEntity = legalEntityValue ?? asLegalEntityValue(undefined);

    const capability = withLegalEntityFounders(
        asBusinessCapabilityValue(capabilityValue),
        legalEntity.founders
    );

    /* The plan's first month is worked out, never typed: the earlier of the Opening Date's month and the earliest card's cost. */
    const derivedStart = derivedPlanStart(openingDate, [...costStartDates(capability), ...legalExpenseDates(legalEntity)], withPlanStart(stored).planStart);
    const page = withPlanStart(stored, undefined, derivedStart);
    const start = page.planStart;
    const months = planLength(page);
    const revenuePage = withDemand(
        asFinancialSustainabilityValue(sustainabilityValue),
        asBusinessEngagementValue(engagementValue).demand,
        foundation
    );

    // (Kept in the answer too, so that the documents and the Sustainability page read the same month.)
    useEffect(() => {
        if (!disabled && (stored.planStart.year !== derivedStart.year || stored.planStart.month !== derivedStart.month)) {
            onChange({ ...stored, planStart: derivedStart });
        }
    });

    // (A shared cost split by hours or by revenue: what each Offering uses a month.)
    const lines = consolidateCosts(page, costSourcesFor(legalEntity, countedCapability(capability), currency, offeringShareWeights(capability.delivery, asBusinessEngagementValue(engagementValue).demand, asFinancialSustainabilityValue(sustainabilityValue).streams)));

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
        { foundation: page, revenuePage, lines, capability: countedCards, settings, openingDate, drawings: ownersTakeDrawings(legalEntity.organisation.legalForm), country: legalEntity.organisation.country, engagement: asBusinessEngagementValue(engagementValue) },
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


    /* The Costs table's filters (by group, by Offering, by nature) and its order. */
    const [costFilter, setCostFilter] = useState({ group: "", offering: "", nature: "", sort: "amount" });

    const [schedulesOpen, setSchedulesOpen] = useState<ReadonlySet<string>>(new Set());

    /* Writes go to what is STORED, so an unchosen plan start stays unchosen. */
    function update(patch: Partial<FinancialFoundationValue>) {
        onChange({ ...stored, ...patch });
    }
    /* (What is stored as this render sees it, for the funding tiles' add and clean-up.) */
    const live = useRef(stored);
    live.current = stored;
    /** A funding source still as it was made: nothing written in it (its tile's Add leaves none behind). */
    const fundingBlank = (source: FundingSourceValue | undefined) => !!source && JSON.stringify({ ...source, id: "" }) === JSON.stringify({ ...createFundingSource(source.category), id: "" });

    /* ---------- Small controls ---------- */

    /* (True while a funding source's card is drawn: its dropdowns hug their longest option.) */
    let pickersAlone = false;
    function picker(
        label: string,
        ariaLabel: string,
        options: readonly { id: string; label: string }[],
        current: string,
        onNext: (next: string) => void,
        placeholder: string,
        info?: InfoPoint[],
        /** The list in groups: a heading before the option it is keyed by (a funding type's family, never in brackets; owner, 2026-11-20 18:35 UTC+2). */
        headings?: Readonly<Record<string, string>>
    ) {
        return (
            <BusinessField label={label} info={info}>
                <OptionPicker
                    label={ariaLabel}
                    placeholder={placeholder}
                    hug={pickersAlone}
                    headings={headings}
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
                {limits
                    ? (
                        <NumberCell
                            inputMode={numberInputMode(limits)}
                            data-size={numberStep(limits)}
                            aria-label={ariaLabel}
                            placeholder={placeholder}
                            disabled={disabled}
                            value={current}
                            onChange={(event) => onNext(limits
                                ? limitedNumberText(event.target.value, current, limits)
                                : event.target.value)}
                        />
                    )
                    : (
                        <TextBox
                            className="interview-input"
                            aria-label={ariaLabel}
                            placeholder={placeholder}
                            disabled={disabled}
                            value={current}
                            onChange={(event) => onNext(limits
                                ? limitedNumberText(event.target.value, current, limits)
                                : event.target.value)}
                        />
                    )}
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
                    rows.push({ key: line.id + ":sale", line, bucket: "sale", amount: line.amount, text: percent ? line.amountText + "% of revenue" : format(line.variablePerUnit ?? line.amount) + " " + frequencyLabel(line).toLowerCase(), when: percent ? "With revenue" : frequencyLabel(line), nature });
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

    /**
     * THE COSTS COUNTED WITH REVENUE, each named with its share (owner, 2026-11-18 16:55: "Do all 8", proposal 7), as each is paid on the part of the revenue it serves
     * (a card fee online, another in person): [{ name: "Shopify Payments", share: "2%" }].
     */
    function revenueShareLines(rows: CostRow[]): { name: string; share: string }[] {
        return rows.filter(row => row.bucket === "sale" && row.line.frequency === "usage-based" && (row.line.amountText ?? "").trim() !== "")
            .map(row => ({ name: row.line.name.trim() || "A cost", share: row.line.amountText.trim() + "%" }));
    }
    /** The same in words: "2% of revenue" where there is one; several each named: "2% (Shopify Payments) · 1.69% (SumUp card fees)". Empty where there are none. */
    function revenueSharesOf(rows: CostRow[]): string {
        const lines = revenueShareLines(rows);
        return lines.length === 0 ? "" : lines.length === 1 ? lines[0].share + " of revenue" : lines.map(line => line.share + " (" + line.name + ")").join(" · ");
    }
    /** The cost of each sale: the prices per unit added up, and the costs that are a share of revenue instead (the Costs section's third total, and its tile's). */
    function saleTextOf(rows: CostRow[]): string {
        const sales = rows.filter(row => row.bucket === "sale");
        const perSale = sales.filter(row => row.line.frequency !== "usage-based").reduce((sum, row) => sum + (row.line.variablePerUnit ?? row.amount), 0);
        const shares = revenueSharesOf(rows);
        return sales.length === 0 ? format(0) : format(perSale) + (shares ? " + " + shares : "");
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

        const saleText = saleTextOf(rows);

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

                {planNotesOf()}

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

                {/* While there is no Opening Date, where it is given (the funds it opens are in the Workbook's Funding Request: doc 48, section 14). */}
                {openingDate === "" && (
                    <p className="financial-muted">Give the Opening Date, on the Organization tile (Identity System), to see the cash to raise before the opening and the contingency funds in the Workbook's Funding Request.</p>
                )}

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
                                        <TextBox
                                            className="interview-input"
                                            aria-label={what + " milestone " + (position + 1) + " condition"}
                                            placeholder="A milestone or condition, e.g. Product launch"
                                            disabled={disabled}
                                            value={milestone.condition}
                                            onChange={(event) => setSchedule({
                                                milestones: schedule.milestones.map(entry => entry.id === milestone.id
                                                    ? { ...entry, condition: event.target.value } : entry)
                                            })}
                                        />
                                        <NumberCell
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

    /** The section a source stands in: one saved under Internal is read under Other (doc 48, section 14). */
    function shownCategory(category: string): string {
        return category === "internal" ? "other" : category;
    }

    function fundingCard(source: FundingSourceValue, index: number) {

        const type = fundingType(source.type);
        const nature = type?.nature;
        const what = source.name.trim() || type?.label || "Funding Source " + (index + 1);
        const confirmedStatus = source.status === "approved" || source.status === "received" || source.status === "closed";

        // (THE FOUNDERS' CAPITAL IS READ, NEVER ADDED (doc 48, section 13, step 3; one owner per fact): it comes from Founders & Ownership, so a new source does not
        // offer it; a source saved with it keeps it.)
        const typeEntries = FUNDING_TYPES
            .filter(entry => entry.category === source.category && (entry.id !== "founder-capital" || source.type === "founder-capital"));
        const types = typeEntries.map(entry => ({ id: entry.id, label: entry.label }));
        // (Each family -- Non-repayable, Equity, Debt -- a heading of the list, never a bracket after every type: owner, 2026-11-20 18:35 UTC+2.)
        const typeHeadings: Record<string, string> = {};
        typeEntries.forEach((entry, at) => {
            if (entry.family && entry.family !== typeEntries[at - 1]?.family) {
                typeHeadings[entry.label] = entry.family;
            }
        });

        const formattedAmount = source.amount.trim() ? format(fundingStanding(source, start).total) : "";

        // (Each dropdown of a source's card as wide as its longest option, never stretched across the card: OptionPicker `hug`.)
        pickersAlone = true;
        try {
        return (
            <BusinessCard
                key={source.id}
                className="financial-funding-card"
                kind="Source"
                anchor={source.id}
                number={index + 1}
                name={source.name}
                onName={(next) => changeSource(source.id, { name: next })}
                open
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

                {/* (A FUNDING SOURCE'S CARD, floating from its tile (owner, 2026-11-18 12:41: "make the Funding Sources into tiles"): three boxes of the shared bands,
                    as a Customer Engagement card -- the source and its amount, when it arrives (or a loan's terms), and what it is for.) */}
                <SingleColumn>
                    <EngagementBoxes>{[
                        <EngagementBox key="source" title="Source & Amount" bands={[
                                        <div className="business-capability-row">
                                            {picker("Funding Type", what + " type", types, source.type,
                                                (next) => changeSource(source.id, { type: next }), "Select a type", undefined, typeHeadings)}
                                            {textInput(
                                                nature === "debt" ? "Lender" : nature === "equity" ? "Investor" : "Provider / Source",
                                                what + " provider", source.provider,
                                                (next) => changeSource(source.id, { provider: next }))}
                                        </div>
                        ,
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
                        ,
                            standingLine(source)
                        ]} />,
                        <EngagementBox key="when" title={nature === "debt" ? "Loan Terms" : "When It Arrives"} bands={[
                            nature === "debt" ? loanTermFields(source, what) : scheduleFields(source, what),
                            nature === "equity" && textInput(
                    "Ownership / Equity (%)", what + " equity", source.equity,
                    (next) => changeSource(source.id, { equity: next }), "e.g. 10",
                    ["The share given in exchange. The Legal Entity remains where legal ownership is recorded."],
                    NUMBER_LIMITS.percent
                ),
                            nature === "debt" && loanSummary(source)
                        ]} />,
                        <EngagementBox key="for" title="What It Is For" bands={[
                                        <OptionalNote
                                            label="Purpose"
                                            ariaLabel={what + " purpose"}
                                            placeholder="What it supports"
                                            disabled={disabled}
                                            value={source.purpose}
                                            onChange={(next) => changeSource(source.id, { purpose: next })}
                                        />
                        ,
                                        <OptionalNote
                                            label="Conditions"
                                            ariaLabel={what + " conditions"}
                                            disabled={disabled}
                                            value={source.conditions}
                                            onChange={(next) => changeSource(source.id, { conditions: next })}
                                        />
                        ,
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
                        
                        ]} />
                    ]}</EngagementBoxes>
                </SingleColumn>

            </BusinessCard>
        );
        } finally {
            pickersAlone = false;
        }

    }

    /**
     * FOUNDERS' CAPITAL AS A CARD (owner, 2026-11-18 16:55: "Do all 8", proposal 8): read only -- answered on the Legal Entity's Founders & Ownership --, each founder's
     * capital and the total under one band, as a source's card, and the way to where it is answered.
     */
    function founderCapitalCard() {
        return (
            <BusinessCard key="founders-capital" kind="Source" anchor="founders-capital" number={1} name="Founders' Capital" open disabled={disabled}>
                <SingleColumn>
                    <EngagementBoxes>{[
                        <EngagementBox key="capital" title="Each Founder" bands={founderCapitalBands()} />
                    ]}</EngagementBoxes>
                </SingleColumn>
            </BusinessCard>
        );
    }

    /** Each founder's capital and the total, and the way to where it is answered: the founders' capital section's content (and its card's). */
    function founderCapitalBands() {
        const capital = founderCapitalSources(stored, legalEntity);
        const total = capital.reduce((sum, source) => sum + fundingStanding(source, start).total, 0);
        return [
                            <ul className="financial-cost-inputs" key="list">
                                {capital.map(source => (
                                    <li key={source.id}>
                                        <span>{source.provider.trim() || "Unnamed founder"}</span>
                                        <span>{format(fundingStanding(source, start).total)}</span>
                                    </li>
                                ))}
                                <li className="financial-cost-inputs-total">
                                    <span>Total</span><span>{format(total)}</span>
                                </li>
                            </ul>,
                            onOpenLegalEntity && (
                                <p className="financial-muted" key="where">
                                    Answered on{" "}
                                    <TextLink type="button" className="business-engagement-link" onClick={() => onOpenLegalEntity(["legal-section-1"])}>
                                        1. Identity System → Definition & Purpose → Founders & Ownership
                                    </TextLink>
                                </p>
                            )
        ];
    }

    /**
     * CAPITAL & FUNDING, ONE DIALOG CARD (owner, 2026-11-19 21:44 UTC+2: "Create it as a dialogue card with the founders' capital as a section, and the other cards as tiles"):
     * the founders' capital first, a section of its own -- each founder's capital and the total, read only, answered on Founders & Ownership --, then each category's
     * sources, Internal, External and Other, a titled section of tiles each (DialogSectionBand, the Registrations' and the Themes' pattern), each tile opening its
     * card floating. The ids stay: a jump to "founders-capital" lands on its section.
     */
    function fundingSection() {

        const capital = founderCapitalSources(stored, legalEntity);

        return (
            <div className="financial-section-body">
                {capital.length > 0 && (
                    <div data-anchor="founders-capital">
                        <DialogSectionBand title="Founders' Capital" info={["Each founder's capital, as written on Founders & Ownership: the business's first internal funding."]}>
                            {founderCapitalBands()}
                        </DialogSectionBand>
                    </div>
                )}
                {/* (NO INTERNAL SECTION (doc 48, section 14; owner, 2026-11-20 18:35 UTC+2): the founders' money is their capital, above; a source saved under Internal
                    is read under Other, its type and figures kept.) */}
                {FUNDING_CATEGORIES.filter(category => category.id !== "internal").map(category => {

                    const of = stored.funding.filter(source => source.category === category.id || (category.id === "other" && source.category === "internal"));

                    return (
                        <DialogSectionBand key={category.id} title={category.label} tiles info={[...CATEGORY_INFO[category.id]]}>
                            {/* (THE SOURCES AS TILES (owner, 2026-11-18 12:41: "make the Funding Sources into tiles"): each its type, amount and status, opening its card
                                floating; the Add tile after them makes a blank one and opens it.) */}
                            <CardBoxes
                                label={category.label + " funding sources"}
                                what="Funding Source"
                                autoStart={false}
                                items={of.map((source, index): CardBox => ({
                                    id: source.id,
                                    number: index + 1,
                                    name: source.name,
                                    unnamed: "Funding Source " + (index + 1),
                                    own: true,
                                    lines: [
                                        FUNDING_TYPES.find(entry => entry.id === source.type)?.label ?? "",
                                        source.amount.trim() ? format(fundingStanding(source, start).total) : "",
                                        FUNDING_STATUSES.find(entry => entry.id === source.status)?.label ?? ""
                                    ].filter(Boolean),
                                    content: () => null
                                }))}
                                add={{
                                    label: "Funding Source",
                                    disabled,
                                    onAdd: () => {
                                        const source = createFundingSource(category.id);
                                        update({ funding: [...live.current.funding, source] });
                                        return source.id;
                                    },
                                    isBlank: (id) => fundingBlank(live.current.funding.find(entry => entry.id === id)),
                                    onRemove: (ids) => update({ funding: live.current.funding.filter(entry => !ids.includes(entry.id)) })
                                }}
                            />
                        </DialogSectionBand>
                    );

                })}
            </div>
        );

    }

    /* ---------- 4. Financial Position ---------- */

    /* Worked out once: its section and its tile's headline read the same figures. */
    const position = financialPosition(page, lines, legalEntity, currency, format, revenuePage, launched?.launch);

    const runway = !position.hasOutflows
        ? "n/a"
        : position.runwayMonths === null
            ? months + "+ months"
            : position.runwayMonths + " month" + (position.runwayMonths === 1 ? "" : "s");

    const covered = position.need > 0 && position.gap <= 0.005;


    /* ---------- The page: one chapter of four Master Tiles (doc 48, section 1), each opening its section in a dialog ---------- */

    /* What each tile says of its section (doc 48, section 1): each name, its figure in bold under it -- the tile list's one face (stackedFace; owner, 2026-11-18
       23:08 UTC+2: "Financial tiles' lists should follow the shared tile list"). */
    const pair = (name: string, figure: string): FaceRow => ({ name, under: figure });
    const costFace = [
        // (A LINE ONLY WHERE IT SAYS SOMETHING (owner, 2026-11-19 22:48 UTC+2; doc 48 section 13): the Launch budget where there is one.)
        ...(funds.schedule.total > 0.005 ? [pair("Launch budget", format(funds.schedule.total))] : []),
        pair("Running costs a month", format(funds.monthlyOpEx)),
        // (A share of revenue on its own line, so the face never cuts it: owner, 2026-11-18 10:38.)
        ...(() => {
            const sales = costRows().rows.filter(row => row.bucket === "sale");
            const perSale = sales.filter(row => row.line.frequency !== "usage-based").reduce((sum, row) => sum + (row.line.variablePerUnit ?? row.amount), 0);
            // (Each share named on the face: one is "% of revenue", several each with its cost's name; coordinator, 2026-11-18.)
            const shares = revenueShareLines(costRows().rows);
            return [pair("Cost of each sale", format(perSale)), ...(shares.length === 1 ? [pair("Share of revenue", shares[0].share)] : shares.map(line => pair(line.name, line.share)))];
        })()
    ];
    const positionFace: FaceRow[] = position.gap > 0.005
        ? [pair("Funding Gap", format(position.gap))]
        : covered
            ? [pair("Funding", "Covered"), pair("Financial Runway", runway)]
            : [];

    const sections = [
        { id: "financial-costs", section: SECTIONS.costs, title: undefined as string | undefined, body: costsSection, items: stackedFace(costFace), anchor: "financial-costs financial-pre-operational-budget" },
        // (STEP 3, FUNDING: CAPITAL & FUNDING AND FINANCIAL POSITION, ONE TILE (doc 48, section 13; owner, 2026-11-20 12:49 UTC+2, "proceed to changes"): the money in --
        // the founders' capital, then each source -- and, under it, the position it gives: the headline and figures, then the Funding Need, what the money is for.
        // The tile keeps Capital & Funding's id and sources; the position's anchors answer every jump, note and link made to it, and to the need.)
        {
            id: "financial-funding", section: SECTIONS.funding, title: "Funding",
            body: () => (
                <>
                    {/* (THE SOURCES, WHAT THE FUNDING TILE ASKS (doc 48, section 14; owner, 2026-11-20 18:35 UTC+2): the founders' capital, then External and Other, a titled section
                        each. The Uses and the Financial Position are records: the Business Plan's Funding Request says them.) */}
                    {fundingSection()}
                </>
            ),
            items: stackedFace([...positionFace, ...(position.need > 0.005 ? [pair("Total Funding Need", format(position.need))] : [])]),
            anchor: "financial-funding financial-position financial-need"
        }
    ];

    const hue = workHue("build");

    const tiles: SectionTile[] = sections.map((entry, index) => ({
        id: entry.id,
        title: entry.title ?? entry.section.title,
        // (MASTER TILES KEEP THEIR SIZE AND THE 2 x 2 (owner's rule): three tiles fill three places of the four.)
        large: true,
        anchor: entry.anchor,
        rail: railId(FINANCIAL_FOUNDATION_SECTIONS[index]),
        items: entry.items,
        // (Capital & Funding's sources float from their tiles: owner, 2026-11-18 12:41.)
        ...(entry.id === "financial-funding" ? {
            // (Its dialog opens however many sources it holds: the founders' capital and each category's tiles are in it.)
            view: true,
            holds: stored.funding.map(source => source.id),
            cardFor: (id: string) => {
                if (id === "founders-capital") {
                    return <div className="column-tile-content financial-page financial-funding-floating">{founderCapitalCard()}</div>;
                }
                const of = stored.funding.find(source => source.id === id);
                const index = of ? stored.funding.filter(source => shownCategory(source.category) === shownCategory(of.category)).indexOf(of) : -1;
                return of ? <div className="column-tile-content financial-page financial-funding-floating">{fundingCard(of, index)}</div> : null;
            }
        } : {}),
        content: () => (
            <div className="column-tile-content" data-anchor={entry.id} data-rail={railId(FINANCIAL_FOUNDATION_SECTIONS[index])} role="group" aria-label={entry.title ?? entry.section.title}>
                <div className="business-engagement-section-head">
                    <DialogHeading title={entry.title ?? entry.section.title} info={[...entry.section.instructions, ...entry.section.info]} />
                </div>
                {/* (The page's chart colours, which the Financial pages define, hold in the dialog too.) */}
                <div className="financial-page">{entry.body()}</div>
            </div>
        )
    }));

    /** The plan's own notes, at the head of the Costs dialog. (The plan's settings -- Plan Start, Opening Date, Plan Length, Amounts, Income Tax, the VAT basis -- are on the Global Settings screen; its months and currency are in the page title.) */
    function planNotesOf(): ReactNode {
        return (!currency || (offerings.length === 0 && onOpenFoundation)) ? (
            <div className="financial-plan-bar">
                {!currency && (
                    <span className="financial-plan-meta">
                        Choose a country on 1. Identity System → Definition & Purpose → Organisation to set the currency.
                    </span>
                )}
                {offerings.length === 0 && onOpenFoundation && (
                    <span className="financial-plan-meta">
                        No Offerings yet:{" "}
                        <TextLink type="button" className="business-engagement-link" onClick={() => onOpenFoundation()}>
                            define them on Foundation & Engagement
                        </TextLink>
                    </span>
                )}
            </div>
        ) : null;
    }

    // (ONE CHAPTER (PageGroups.ts, `oneChapter`; owner, 2026-11-20 02:11 UTC+2): this section draws no frame; it hands its three tiles to the page's one chapter,
    // which Revenue & Pricing draws, and stays drawn, so what it does when it opens is done as before. Else its own frame, beside Revenue & Break Even.)
    if (joined) {
        joined.set(JOINED_CHAPTER_KEY, tiles);
        return null;
    }
    return (
        <div className="answer-columns business-foundation business-engagement business-capability column-tiles-page" style={{ "--answer-column-count": 1 } as CSSProperties}>
            <CardShell
                data-anchor="column-tiles"
                style={{ "--strategy-theme-hue": hue } as CSSProperties}
            >
                <div className="card-scroll">
                    <div className="business-capability-section business-capability-tiles-section">
                        <div className="business-engagement-section-head tiles-frame-head"><span className="field-group-title business-foundation-subhead">{frameTitle}</span></div>
                        <SectionTiles label={FINANCIAL_FOUNDATION_SECTIONS.join(", ")} hue={hue} tiles={tiles} />
                    </div>
                </div>
            </CardShell>
        </div>
    );

}

