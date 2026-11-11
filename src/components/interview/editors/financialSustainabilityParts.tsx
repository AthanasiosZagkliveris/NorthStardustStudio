/**
 * Split out of FinancialSustainabilityEditor.tsx (2026-11-11, the folder report's item 6): parts of FinancialSustainabilityEditor drawn from the values it hands them
 * (each part's context); FinancialSustainabilityEditor keeps a function of the same name that hands them over, so nothing else changed.
 */
import type { SustainabilityResult } from "../../../framework/engine/financial/breakEven.ts";
import { type LegalEntityValue } from "../../../framework/engine/AnswerUtils.ts";
import { formatUnits, isRecurringRevenue, offeringCosts, parseAmount, stressTest, type FinancialSustainabilityValue, type RevenueStreamValue } from "../../../framework/engine/FinancialModel.ts";
import { BusinessEmpty } from "../cards/BusinessCardFields.tsx";
import { FigureTable, FinancialBlock } from "./FinancialParts.tsx";
import InfoNote, { InfoText } from "../fields/InfoNote.tsx";
import { type OpenPage } from "../tiles/jumpTo.ts";
import TextLink from "../fields/TextLink.tsx";
import { CONTRIBUTION_HELP } from "./financialSustainabilityTexts.ts";

export type OfferingCostsBlockContext = {
    result: SustainabilityResult;
    lines: import("C:/Projects/NorthStardustStudio/src/framework/engine/FinancialModel").CostLine[];
    unitName: (stream: RevenueStreamValue) => string;
    offeringName: (stream: RevenueStreamValue) => string;
    priceLabel: (stream: RevenueStreamValue) => string;
    format: (amount: number) => string;
    volumeText: (stream: RevenueStreamValue, units: number, perMonth?: string) => string;
};

/**
 * Each Offering's own costs beside its price: what one sale costs,
 * what is left of the price, and what the Offering costs every
 * month whatever it sells. Read from its lines on Financial
 * Foundation, which come from Page 3's Offering's Capability.
 */
export function offeringCostsBlockPart(ctx: OfferingCostsBlockContext) {
const { result, lines, unitName, offeringName, priceLabel, format, volumeText } = ctx;

    return (
        <FinancialBlock
            title="Each Offering's Costs"
            info={[
                "An Offering's costs are those recorded for it on 3. Infrastructure & Capability → Offering's Capability.",
                "Per sale: paid for every unit or project sold. Contribution is what is left of the price after them.",
                "Whatever is sold: paid monthly or once, however much is sold. After them, what the Offering adds towards the organisation's shared costs."
            ]}
        >
            <div className="financial-offering-costs">
                {result.streams.map(entry => {

                    const costs = offeringCosts(lines, entry.stream.offeringId);
                    const unit = unitName(entry.stream);
                    const monthlyContribution = entry.contribution !== null ? entry.contribution * entry.volume : null;
                    const unitsForOwnCosts = entry.contribution !== null && entry.contribution > 0 && costs.fixedMonthly > 0
                        ? costs.fixedMonthly / entry.contribution
                        : null;

                    return (
                        <div className="financial-offering-cost-card" key={entry.stream.id}>

                            <strong className="financial-offering-cost-name">{offeringName(entry.stream)}</strong>

                            <ul className="financial-cost-inputs">
                                <li><span>Price</span><span>{priceLabel(entry.stream)}</span></li>
                                {(parseAmount(entry.stream.deliveryCharge) ?? 0) > 0 && (
                                    <li>
                                        <span>Delivery charged to the customer</span>
                                        <span>{format(parseAmount(entry.stream.deliveryCharge) ?? 0)} / order</span>
                                    </li>
                                )}
                            </ul>

                            <span className="field-group-title financial-offering-cost-subhead">Per {unit} sold</span>
                            <ul className="financial-cost-inputs">
                                {costs.perUnit.length === 0
                                    ? <li><span className="financial-muted">No costs per sale recorded</span></li>
                                    : costs.perUnit.map(item => (
                                        <li key={item.name + item.basis}>
                                            <span>{item.name}{item.basis === "variable part" ? " (variable part)" : ""}</span>
                                            <span>{format(item.amount)}{item.basis === "project" && unit !== "project" ? " / project" : ""}{item.basis === "order" ? " / order" : ""}</span>
                                        </li>
                                    ))}
                                <li className="financial-cost-inputs-total">
                                    <span>Cost of one {unit}</span><span>{format(entry.variable)}</span>
                                </li>
                                {entry.contribution !== null && entry.price !== null && entry.price > 0 && (
                                    <li className="financial-cost-inputs-total">
                                        <span>
                                            <InfoText text="Contribution">
                                                <InfoNote label="Contribution" points={CONTRIBUTION_HELP} />
                                            </InfoText>
                                        </span>
                                        <span>{format(entry.contribution)} ({Math.round(entry.contribution / entry.price * 100)}% of the price)</span>
                                    </li>
                                )}
                            </ul>
                            {entry.variableOverridden && (
                                <p className="financial-muted">
                                    The revenue stream's own figure, {format(entry.variable)}, applies here and replaces the {format(costs.variablePerUnit)} recorded above.
                                </p>
                            )}

                            {(costs.recurring.length > 0 || costs.oneTime.length > 0) && (
                                <>
                                    <span className="field-group-title financial-offering-cost-subhead">Whatever is sold</span>
                                    <ul className="financial-cost-inputs">
                                        {costs.recurring.map(item => (
                                            <li key={item.name}><span>{item.name}</span><span>{format(item.monthly)} / month</span></li>
                                        ))}
                                        {costs.oneTime.map(item => (
                                            <li key={item.name}><span>{item.name}</span><span>{format(item.amount)} once</span></li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            <ul className="financial-cost-inputs financial-offering-cost-result">
                                {unitsForOwnCosts !== null && (
                                    <li>
                                        <span>Covers its own monthly costs from</span>
                                        <span>≈ {volumeText(entry.stream, unitsForOwnCosts, " / month")}</span>
                                    </li>
                                )}
                                {monthlyContribution !== null && (
                                    <li className="financial-cost-inputs-total">
                                        <span>Adds to shared costs, at the normal level</span>
                                        <span>{format(monthlyContribution - costs.fixedMonthly)} / month</span>
                                    </li>
                                )}
                            </ul>

                        </div>
                    );

                })}
            </div>
        </FinancialBlock>
    );

}

export type StressBlockContext = {
    hasRevenue: boolean;
    effective: FinancialSustainabilityValue;
    financial: import("C:/Projects/NorthStardustStudio/src/framework/engine/FinancialModel").FinancialFoundationValue;
    lines: import("C:/Projects/NorthStardustStudio/src/framework/engine/FinancialModel").CostLine[];
    legalEntity: LegalEntityValue;
    format: (amount: number) => string;
    whenLabel: (month: number | null) => string;
};

/**
 * THE STRESS TEST: the plan as it stands and four worse cases, fixed
 * so the answer is the same for everyone, with the funding being
 * sought counted. One sentence says whether the plan holds; the
 * table says how far each case falls.
 */
export function stressBlockPart(ctx: StressBlockContext) {
const { hasRevenue, effective, financial, lines, legalEntity, format, whenLabel } = ctx;

    // With no revenue, there is no plan to put under stress.
    if (!hasRevenue) {
        return (
            <FinancialBlock title="Stress Test">
                <BusinessEmpty>
                    Add the price and expected sales of each revenue stream above: the Stress Test runs on them.
                </BusinessEmpty>
            </FinancialBlock>
        );
    }

    const test = stressTest(effective, financial, lines, legalEntity, format);
    const [planned, ...worse] = test.scenarios;
    const failing = worse.filter(scenario => scenario.shortfall > 0.5);
    const hardest = test.scenarios.reduce((max, scenario) => scenario.shortfall > max.shortfall ? scenario : max, planned);
    const lowestOfAll = test.scenarios.reduce((min, scenario) => scenario.lowest < min.lowest ? scenario : min, planned);

    const verdict = planned.shortfall > 0.5
        ? {
            tone: "risk",
            text: "The plan does not hold even as planned: cash falls " + format(planned.shortfall) + " short in " +
                planned.lowestLabel + ". The hardest case, " + hardest.label.toLowerCase() + ", falls " +
                format(hardest.shortfall) + " short."
        }
        : failing.length === 0
            ? {
                tone: "good",
                text: "The plan holds in every case: at worst, cash falls to " + format(lowestOfAll.lowest) +
                    " in " + lowestOfAll.lowestLabel + " (" + lowestOfAll.label.toLowerCase() + ")."
            }
            : {
                tone: "caution",
                text: "The plan holds as planned, but not with " +
                    failing.map(scenario => scenario.label.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " or $1") +
                    ": the hardest case needs " + format(hardest.shortfall) + " more."
            };

    return (
        <FinancialBlock
            title="Stress Test"
            info={[
                "The plan as it stands, and the same plan when things go worse than hoped: sales 20% lower, revenue 3 months later, costs 10% higher (founders' pay aside), customers paying a month later than planned, and all four together.",
                "The funding being sought is counted as if it arrives as planned, its repayments included: the question a lender asks is whether the plan holds with the money requested.",
                "Holds: cash stays at zero or above throughout the plan. Short: how much more money would keep it there."
            ]}
        >
            <p className={"financial-stress-verdict financial-stress-" + verdict.tone}>{verdict.text}</p>
            <p className="financial-muted">
                {test.sought > 0.5
                    ? "Counting the " + format(test.sought) + " being sought as if it arrives as planned, its repayments included."
                    : "Counting the funding received and confirmed on Financial Foundation."}
            </p>
            <div className="financial-table-scroll">
                <FigureTable className="financial-fixed-table">
                    <colgroup><col className="financial-col-label" /><col /><col /><col /></colgroup>
                    <thead>
                        <tr>
                            <th scope="col">Case</th>
                            <th scope="col">Break Even</th>
                            <th scope="col">Lowest Cash</th>
                            <th scope="col">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {test.scenarios.map(scenario => (
                            <tr key={scenario.id}>
                                <th scope="row">{scenario.label}</th>
                                <td>{whenLabel(scenario.breakEvenMonth)}</td>
                                <td>{format(scenario.lowest)}{scenario.lowestLabel ? ", " + scenario.lowestLabel : ""}</td>
                                <td className={scenario.shortfall > 0.5 ? "financial-stress-short" : "financial-stress-holds"}>
                                    {scenario.shortfall > 0.5 ? format(scenario.shortfall) + " short" : "Holds"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </FigureTable>
            </div>
        </FinancialBlock>
    );

}

export type RevenueSectionContext = {
    result: SustainabilityResult;
    offerings: { id: string; label: string; }[];
    onOpenFoundation: OpenPage | undefined;
    shownStreams: { stream: RevenueStreamValue; orphan: boolean; }[];
    streamCard: (entry: { stream: RevenueStreamValue; orphan: boolean; }, index: number) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    format: (amount: number) => string;
    offeringName: (stream: RevenueStreamValue) => string;
    priceLabel: (stream: RevenueStreamValue) => string;
    capacityBlock: () => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
};

export function revenueSectionPart(ctx: RevenueSectionContext) {
const { result, offerings, onOpenFoundation, shownStreams, streamCard, format, offeringName, priceLabel, capacityBlock } = ctx;

    const total = result.expectedRevenue;

    return (
        <div className="financial-section-body">

            {offerings.length === 0
                ? (
                    <BusinessEmpty>
                        Each Offering on the Foundation page gets its revenue stream here. Define an Offering first
                        {onOpenFoundation && (
                            <>
                                {": "}
                                <TextLink type="button" className="business-engagement-link" onClick={() => onOpenFoundation()}>
                                    open it
                                </TextLink>
                            </>
                        )}
                        .
                    </BusinessEmpty>
                )
                : (<>
                    {/* One stream a row, its answers three to a line.
                        Their "Expand all" sits in the section's title
                        row (see sectionCard). */}
                    <div className="financial-stream-list">
                        {shownStreams.map(streamCard)}
                    </div>
                </>)}

            <FinancialBlock title="Revenue Summary" info={["Expected revenue at the normal operating level, a month."]}>
                {result.streams.length === 0
                    ? <BusinessEmpty>No revenue streams yet. Expected revenue is {format(0)}, which is a valid starting point.</BusinessEmpty>
                    : (
                        <div className="financial-table-scroll">
                            <FigureTable>
                                <thead>
                                    <tr>
                                        <th scope="col">Revenue Stream</th>
                                        <th scope="col">Price</th>
                                        <th scope="col">Expected Volume</th>
                                        <th scope="col">Expected Revenue</th>
                                        <th scope="col">Share</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.streams.map(entry => (
                                        <tr key={entry.stream.id}>
                                            <th scope="row">{offeringName(entry.stream)}</th>
                                            <td>{priceLabel(entry.stream)}</td>
                                            <td>{isRecurringRevenue(entry.stream.frequency)
                                                ? formatUnits(entry.volume) + " active"
                                                : formatUnits(entry.volume) + " / month"}</td>
                                            <td>{format(entry.revenue)}</td>
                                            <td>{total > 0 ? Math.round(entry.revenue / total * 100) + "%" : "n/a"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th scope="row">Total</th>
                                        <td />
                                        <td />
                                        <td><strong>{format(total)} / month</strong></td>
                                        <td />
                                    </tr>
                                </tfoot>
                            </FigureTable>
                        </div>
                    )}
            </FinancialBlock>

            {capacityBlock()}

        </div>
    );

}
