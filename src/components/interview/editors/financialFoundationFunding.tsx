/**
 * Split out of FinancialFoundationEditor.tsx (2026-11-11, the folder report's item 6): parts of FinancialFoundationEditor drawn from the values it hands them
 * (each part's context); FinancialFoundationEditor keeps a function of the same name that hands them over, so nothing else changed.
 */
import { type GlobalSettingsValue } from "../../../framework/engine/GlobalSettings.ts";
import { type LegalEntityValue, type StrategyMonthValue } from "../../../framework/engine/AnswerUtils.ts";
import { COST_GROUPS, COST_NATURES, COST_NATURE_LABELS, FUNDING_CATEGORIES, FUNDING_STATUSES, FUNDING_TYPES, createFundingSource, founderCapitalSources, fundingStanding, fundingType, type CostLine, type FinancialFoundationValue, type FundingSourceValue } from "../../../framework/engine/FinancialModel.ts";
import { BusinessAddButton, BusinessCard, BusinessEmpty, BusinessField, OptionalNote, BusinessRemove, BusinessTicks } from "../cards/BusinessCardFields.tsx";
import { FigureTiles } from "./FinancialParts.tsx";
import { summaryText } from "../cards/cardSummary.ts";
import FoldAllToggle from "../fields/FoldAllToggle.tsx";
import InfoNote, { type InfoPoint, InfoText } from "../fields/InfoNote.tsx";
import { NUMBER_LIMITS, type NumberLimit } from "../fields/numberInput.ts";
import OptionPicker from "../fields/OptionPicker.tsx";
import { CATEGORY_INFO, explain } from "./financialFoundationTexts.ts";

/** A cost line as the Costs section lists it (FinancialFoundationEditor builds them in costRows). */
export interface CostRow { key: string; line: CostLine; bucket: "launch" | "running" | "sale" | "later"; amount: number; text: string; when: string; nature: string }

export type CostsSectionContext = {
    costRows: () => { rows: CostRow[]; uncounted: CostLine[]; };
    offerings: { id: string; label: string; }[];
    costFilter: { group: string; offering: string; nature: string; sort: string; };
    format: (amount: number) => string;
    setCostFilter: import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").Dispatch<import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").SetStateAction<{ group: string; offering: string; nature: string; sort: string; }>>;
    funds: import("C:/Projects/NorthStardustStudio/src/framework/engine/ContingencyFunds").ContingencyFunds;
    openingDate: string;
    lines: CostLine[];
    COST_BUCKETS: { id: "launch" | "running" | "sale" | "later"; title: string; note: string; }[];
    currency: string;
    settings: GlobalSettingsValue;
};

export function costsSectionPart(ctx: CostsSectionContext) {
const { costRows, offerings, costFilter, format, setCostFilter, funds, openingDate, lines, COST_BUCKETS, currency, settings } = ctx;

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

export type FundingSectionContext = {
    stored: FinancialFoundationValue;
    legalEntity: LegalEntityValue;
    folds: import("C:/Projects/NorthStardustStudio/src/components/interview/fields/useItemFolds").ItemFolds;
    founderCapitalList: (capital: FundingSourceValue[]) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    fundingCard: (source: FundingSourceValue, index: number) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    disabled: boolean;
    update: (patch: Partial<FinancialFoundationValue>) => void;
};

export function fundingSectionPart(ctx: FundingSectionContext) {
const { stored, legalEntity, folds, founderCapitalList, fundingCard, disabled, update } = ctx;

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

export type FundingCardContext = {
    format: (amount: number) => string;
    start: StrategyMonthValue;
    changeSource: (id: string, patch: Partial<FundingSourceValue>) => void;
    folds: import("C:/Projects/NorthStardustStudio/src/components/interview/fields/useItemFolds").ItemFolds;
    disabled: boolean;
    update: (patch: Partial<FinancialFoundationValue>) => void;
    stored: FinancialFoundationValue;
    picker: (label: string, ariaLabel: string, options: readonly { id: string; label: string; }[], current: string, onNext: (next: string) => void, placeholder: string, info?: InfoPoint[]) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    textInput: (label: string, ariaLabel: string, current: string, onNext: (next: string) => void, placeholder?: string, info?: InfoPoint[], limits?: NumberLimit) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    amountPlaceholder: string;
    standingLine: (source: FundingSourceValue) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element | null;
    loanTermFields: (source: FundingSourceValue, what: string) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    scheduleFields: (source: FundingSourceValue, what: string) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    loanSummary: (source: FundingSourceValue) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    calculatedNeeds: import("C:/Projects/NorthStardustStudio/src/framework/engine/FinancialModel").CalculatedNeed[];
};

export function fundingCardPart(ctx: FundingCardContext, source: FundingSourceValue, index: number) {
const { format, start, changeSource, folds, disabled, update, stored, picker, textInput, amountPlaceholder, standingLine, loanTermFields, scheduleFields, loanSummary, calculatedNeeds } = ctx;

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
