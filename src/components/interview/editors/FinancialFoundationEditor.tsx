import { countedCapability } from "../../../framework/engine/CardCompleteness.ts";
import TextBox from "../../controls/TextBox.tsx";
import NumberCell from "../../controls/NumberCell.tsx";
import { calculatedLines } from "../../../framework/engine/CalculatedLines.ts";
import { contingencyFunds, launchNeedOf } from "../../../framework/engine/ContingencyFunds.ts";
import { ownersTakeDrawings } from "../../../framework/engine/FinancialForecast.ts";
import { capitalisationLimitOf, createGlobalSettings, type GlobalSettingsValue } from "../../../framework/engine/GlobalSettings.ts";
import { type ReactNode, useEffect, useState } from "react";
import { type LegalEntityValue, type StrategyMonthValue, asBusinessCapabilityValue, asBusinessEngagementValue, asLegalEntityValue, businessFoundationSegments, withLegalEntityFounders } from "../../../framework/engine/AnswerUtils.ts";
import { assetUnitCostsOf, incomeTaxRate, COST_FREQUENCIES, natureSplitOf, FINANCIAL_FOUNDATION_SECTIONS, FUNDING_SCHEDULES, LOAN_METHODS, PERIOD_FREQUENCIES, planLength, asFinancialFoundationValue, consolidateCosts, createMilestone, fundingNeeds, fundingStanding, isNonCash, loanSchedule, moneyFormatter, monthlyEquivalent, planMonthLabel, withPlanStart, derivedPlanStart, legalExpenseDates, costStartDates, type CostLine, type FinancialFoundationValue, asFinancialSustainabilityValue, withDemand, type FundingSourceValue } from "../../../framework/engine/FinancialModel.ts";
import { costSourcesFor } from "../../../framework/engine/ExportRenderers.ts";
import { BusinessAddButton, BusinessEmpty, BusinessField, BusinessRemove, uniqueChoices } from "../cards/BusinessCardFields.tsx";
import { FigureTable, FinancialPageHead, FinancialSectionCard, PlanMonthField, type FinancialSection } from "./FinancialParts.tsx";


import InfoNote, { type InfoPoint, InfoText } from "../fields/InfoNote.tsx";
import MonthYearPicker from "../fields/MonthYearPicker.tsx";
import { NUMBER_LIMITS, type NumberLimit, limitedNumberText, numberInputMode } from "../fields/numberInput.ts";
import OptionPicker from "../fields/OptionPicker.tsx";
import { type OpenPage } from "../tiles/jumpTo.ts";
import { railId } from "../rails/railItems.ts";
import { useItemFolds } from "../fields/useItemFolds.ts";
import { toggledIn } from "../fields/toggledIn.ts";
import TextLink from "../fields/TextLink.tsx";
import { LOAN_PAYMENT_HELP, LOAN_PRE_INTEREST_HELP, SECTIONS, SECTION_HUES, explain } from "./financialFoundationTexts.ts";
import { needSectionPart, positionSectionPart } from "./financialFoundationParts.tsx";
import { costsSectionPart, fundingSectionPart, fundingCardPart, type CostRow } from "./financialFoundationFunding.tsx";

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
    const derivedStart = derivedPlanStart(openingDate, [...costStartDates(capability), ...legalExpenseDates(legalEntity)], withPlanStart(stored).planStart);
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

    const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

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
                {limits
                    ? (
                        <NumberCell
                            inputMode={numberInputMode(limits)}
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

    /** One part of a cost: where it stands in the Costs table, what it comes to, and what kind of cost it is. */

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

    const costsSection = (...args: Parameters<typeof costsSectionPart> extends [unknown, ...infer Rest] ? Rest : never) => costsSectionPart({ costRows, offerings, costFilter, format, setCostFilter, funds, openingDate, lines, COST_BUCKETS, currency, settings }, ...args);

    /* ---------- 2. Funding Need ---------- */

    /*
        CALCULATED, NOT ASKED. Each category adds up what is already
        recorded: the one-time costs above, by their group, and the
        running costs until revenue covers them (FinancialModel.ts,
        fundingNeeds). To change a need, change the cost it comes from.
    */
    const needSection = (...args: Parameters<typeof needSectionPart> extends [unknown, ...infer Rest] ? Rest : never) => needSectionPart({ calculatedNeeds, page, legalEntity, start, format, lines, launched, openingDate, funds }, ...args);

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
                                            placeholder="Milestone / condition"
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

    const fundingCard = (...args: Parameters<typeof fundingCardPart> extends [unknown, ...infer Rest] ? Rest : never) => fundingCardPart({ format, start, changeSource, folds, disabled, update, stored, picker, textInput, amountPlaceholder, standingLine, loanTermFields, scheduleFields, loanSummary, calculatedNeeds }, ...args);

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

    const fundingSection = (...args: Parameters<typeof fundingSectionPart> extends [unknown, ...infer Rest] ? Rest : never) => fundingSectionPart({ stored, legalEntity, folds, founderCapitalList, fundingCard, disabled, update }, ...args);

    /* ---------- 4. Financial Position ---------- */

    const positionSection = (...args: Parameters<typeof positionSectionPart> extends [unknown, ...infer Rest] ? Rest : never) => positionSectionPart({ page, lines, legalEntity, currency, format, revenuePage, launched, months }, ...args);

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
