/**
 * Split out of FinancialFoundationEditor.tsx (2026-11-11, the folder report's item 6): parts of FinancialFoundationEditor drawn from the values it hands them
 * (each part's context); FinancialFoundationEditor keeps a function of the same name that hands them over, so nothing else changed.
 */
import type { CalculatedNeed } from "../../../framework/engine/financial/position.ts";
import { type LegalEntityValue, type StrategyMonthValue } from "../../../framework/engine/AnswerUtils.ts";
import { FUNDING_NEED_CATEGORIES, financialPosition, loanRepaymentNotes, allFunding, type CostLine, type FinancialFoundationValue } from "../../../framework/engine/FinancialModel.ts";
import { BusinessEmpty } from "../cards/BusinessCardFields.tsx";
import { CashTimelineChart, FigureTable, FigureTiles, FinancialBlock, SignalList } from "./FinancialParts.tsx";
import InfoNote, { InfoText } from "../fields/InfoNote.tsx";
import { DEFINITIONS, FUNDING_GAP_FORMULA, RUNWAY_FORMULA, RUNWAY_SOURCE } from "./financialFoundationTexts.ts";

export type NeedSectionContext = {
    calculatedNeeds: CalculatedNeed[];
    page: FinancialFoundationValue;
    legalEntity: LegalEntityValue;
    start: StrategyMonthValue;
    format: (amount: number) => string;
    lines: CostLine[];
    launched: { launch: import("../../../framework/engine/FinancialModel").LaunchNeed; funds: import("../../../framework/engine/ContingencyFunds").ContingencyFunds; } | undefined;
    openingDate: string;
    funds: import("../../../framework/engine/ContingencyFunds").ContingencyFunds;
};

/* ---------- 2. Funding Need ---------- */

/*
    CALCULATED, NOT ASKED. Each category adds up what is already
    recorded: the one-time costs above, by their group, and the
    running costs until revenue covers them (FinancialModel.ts,
    fundingNeeds). To change a need, change the cost it comes from.
*/
export function needSectionPart(ctx: NeedSectionContext) {
const { calculatedNeeds, page, legalEntity, start, format, lines, launched, openingDate, funds } = ctx;

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
                ? <p className="financial-muted">Give the Opening Date, on the Organization tile (Identity System), to see the cash to raise before the opening and the contingency funds.</p>
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
                                                "After the launch, each month a share of OpEx is set aside on top of the startup fund, until the fund equals the target reserve months of OpEx. The contribution is a cash set-aside, held as savings. The rates and the target are in the Global Settings."
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

export type PositionSectionContext = {
    page: FinancialFoundationValue;
    lines: CostLine[];
    legalEntity: LegalEntityValue;
    currency: string;
    format: (amount: number) => string;
    revenuePage: import("../../../framework/engine/FinancialModel").FinancialSustainabilityValue;
    launched: { launch: import("../../../framework/engine/FinancialModel").LaunchNeed; funds: import("../../../framework/engine/ContingencyFunds").ContingencyFunds; } | undefined;
    months: number;
};

/* ---------- 4. Financial Position ---------- */

export function positionSectionPart(ctx: PositionSectionContext) {
const { page, lines, legalEntity, currency, format, revenuePage, launched, months } = ctx;

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
                { label: "Pending", value: format(position.pending), info: ["Expected and awaiting confirmation; the gap and the runway count it once it is confirmed."] },
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
                info={["Money in and out of your organisation month by month, and the balance it leaves. A dip below zero is a cash-pressure period, even when the totals are sufficient."]}
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
