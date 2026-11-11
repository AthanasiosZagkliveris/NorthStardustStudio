import { countedCapability } from "../../../framework/engine/CardCompleteness.ts";
import TextBox from "../../controls/TextBox.tsx";
import NumberCell from "../../controls/NumberCell.tsx";
import { type ReactNode, useState } from "react";
import { type LegalEntityValue, asBusinessCapabilityValue, asBusinessEngagementValue, asLegalEntityValue, businessFoundationSegments, withLegalEntityFounders } from "../../../framework/engine/AnswerUtils.ts";
import { offeringStartsById } from "../../../framework/engine/EffectiveAnswers.ts";
import { FINANCIAL_SUSTAINABILITY_SECTIONS, planLength, REVENUE_FREQUENCIES, asFinancialFoundationValue, asFinancialSustainabilityValue, consolidateCosts, createRevenueStream, formatUnits, isRecurringRevenue, moneyFormatter, parseAmount, planMonthLabel, sustainability, withPlanStart, salesCapacity, withDemand, type FinancialSustainabilityValue, type RevenueStreamValue, type StreamAnalysis } from "../../../framework/engine/FinancialModel.ts";
import { costSourcesFor } from "../../../framework/engine/ExportRenderers.ts";

import { BusinessField, uniqueChoices } from "../cards/BusinessCardFields.tsx";
import { FinancialPageHead, FinancialSectionCard, type FinancialSection } from "./FinancialParts.tsx";

import FoldAllToggle from "../fields/FoldAllToggle.tsx";
import InfoNote, { type InfoPoint, InfoText } from "../fields/InfoNote.tsx";

import { NUMBER_LIMITS, type NumberLimit, limitedNumberText, numberInputMode } from "../fields/numberInput.ts";
import OptionPicker from "../fields/OptionPicker.tsx";
import { type OpenPage } from "../tiles/jumpTo.ts";
import { railId } from "../rails/railItems.ts";
import { useItemFolds } from "../fields/useItemFolds.ts";
import { toggledIn } from "../fields/toggledIn.ts";
import { labelWithCurrency, nameWithCurrency } from "../../../framework/engine/Currencies.ts";

import { SECTIONS, SECTION_HUES } from "./financialSustainabilityTexts.ts";
import { offeringCostsBlockPart, stressBlockPart, revenueSectionPart } from "./financialSustainabilityParts.tsx";
import { streamCardPart, capacityBlockPart, takeBlockPart, breakEvenSectionPart } from "./financialSustainabilityStreams.tsx";

interface FinancialSustainabilityEditorProps {
    value: unknown;
    onChange: (value: FinancialSustainabilityValue) => void;
    disabled?: boolean;
    showInstructions?: boolean;
    columnsDivider?: ReactNode;
    /** Page 1, for its Offerings. */
    foundation?: unknown;
    /** Page 3, for the costs Page 4 consolidates. */
    capability?: unknown;
    /** Page 4. */
    financialFoundation?: unknown;
    legalEntity?: LegalEntityValue;
    currency?: string;
    onOpenFoundation?: OpenPage;
    onOpenFinancialFoundation?: OpenPage;
    /** Customer Engagement: its Demand & Conversion gives expected sales. */
    engagement?: unknown;
    onOpenEngagement?: OpenPage;
    onOpenCapability?: OpenPage;
}

/**
 * The Business System's Sustainability page (see
 * AnswerType.FinancialSustainability, and FinancialModel.ts for every
 * calculation it shows).
 *
 * Two sections: Revenue, answered against Page 1's Offerings, and
 * Break Even, calculated against the costs and the financial
 * position Page 4 establishes.
 */
export default function FinancialSustainabilityEditor({

    value,

    onChange,

    disabled = false,

    showInstructions = true,

    columnsDivider,

    foundation,

    capability: capabilityValue,

    financialFoundation,

    legalEntity: legalEntityValue,

    currency = "",

    onOpenFoundation,

    onOpenFinancialFoundation,

    engagement,

    onOpenEngagement,

    onOpenCapability

}: FinancialSustainabilityEditorProps) {

    const page = asFinancialSustainabilityValue(value);

    /* Page 4, exactly as Page 4 calculates it. */
    const financial = withPlanStart(asFinancialFoundationValue(financialFoundation));
    const start = financial.planStart;
    const months = planLength(financial);

    const legalEntity = legalEntityValue ?? asLegalEntityValue(undefined);

    const capability = withLegalEntityFounders(asBusinessCapabilityValue(capabilityValue), legalEntity.founders);

    const lines = consolidateCosts(financial, costSourcesFor(legalEntity, countedCapability(capability), currency));

    // Whole units everywhere on this read-only page: an amount
    // someone can edit shows the string they typed, never this
    // formatter, so nobody's own pence are ever hidden by it.
    const format = moneyFormatter(currency, { wholeOnly: true });

    /* Where an Offering's Demand & Conversion gives expected sales,
       every figure uses them (withDemand); the page shows them, and
       keeps asking only where there is none. */
    const demand = asBusinessEngagementValue(engagement).demand;
    const effective = withDemand(page, demand);

    const result = sustainability(effective, financial, lines, legalEntity, format);

    /* Capacity: the founders' delivery hours, and each Offering's effort. */
    const capacity = salesCapacity(effective, financial, capability);

    const offerings = uniqueChoices(
        businessFoundationSegments(foundation).flatMap(segment => segment.offerings),
        "Unnamed offering"
    );

    const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

    /**
     * Which Revenue Stream cards are open. Revenue streams start
     * CLOSED -- see useItemFolds -- unlike the structural sections
     * around them, which stay on `collapsed` and start OPEN (the page's work is in them).
     */
    const folds = useItemFolds(true);

    function toggle(key: string) {
        setCollapsed(current => toggledIn(current, key));
    }

    /*
        ONE STREAM PER OFFERING, WITHOUT ASKING. Every Offering on the
        Foundation page has its card here; its stream is stored the
        first time something is written in it, under an id taken from
        the Offering's. A stream whose Offering is gone is shown after
        them, so its figures are not counted unseen. Not stored yet, its
        Charged starts from the Offering's O3 on Page 1 and its Payment
        Timing from O3's second row (offeringStarts), saved with the first
        thing written; what is stored wins.
    */
    function streamStarts(offeringId: string): Partial<RevenueStreamValue> {
        const starts = offeringStartsById(businessFoundationSegments(foundation), offeringId);
        return { ...(starts.charged ? { frequency: starts.charged } : {}), ...(starts.paymentTiming ? { paymentTiming: starts.paymentTiming } : {}) };
    }
    const shownStreams: { stream: RevenueStreamValue; orphan: boolean }[] = [
        ...offerings.flatMap(offering => {
            const saved = page.streams.filter(stream => stream.offeringId === offering.id);
            return saved.length > 0
                ? saved.map(stream => ({ stream, orphan: false }))
                : [{ stream: { ...createRevenueStream(), ...streamStarts(offering.id), id: "stream-" + offering.id, offeringId: offering.id }, orphan: false }];
        }),
        ...page.streams
            .filter(stream => !offerings.some(offering => offering.id === stream.offeringId))
            .map(stream => ({ stream, orphan: true }))
    ];

    function changeStream(id: string, patch: Partial<RevenueStreamValue>) {
        const known = page.streams.some(stream => stream.id === id);
        const shown = shownStreams.find(entry => entry.stream.id === id)?.stream;
        onChange({
            ...page,
            streams: known
                ? page.streams.map(stream => stream.id === id ? { ...stream, ...patch } : stream)
                : shown ? [...page.streams, { ...shown, ...patch }] : page.streams
        });
    }

    /* ---------- Small controls ---------- */

    function listPicker(
        label: string,
        ariaLabel: string,
        options: readonly string[],
        current: string,
        onNext: (next: string) => void,
        placeholder: string,
        info?: InfoPoint[],
        inline = false
    ) {
        return (
            <BusinessField label={label} info={info} inline={inline}>
                <OptionPicker
                    label={ariaLabel}
                    placeholder={placeholder}
                    options={options}
                    disabled={disabled}
                    value={current}
                    onChange={onNext}
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
        inline = false,
        /** A number box: what it accepts. */
        limits?: NumberLimit
    ) {
        return (
            <BusinessField label={label} info={info} inline={inline}>
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

    /** An amount, with its currency beside it: a number is not a price until it says of what. */
    function moneyInput(
        label: string,
        ariaLabel: string,
        current: string,
        onNext: (next: string) => void,
        placeholder?: string,
        info?: InfoPoint[]
    ) {
        return (
            <BusinessField label={labelWithCurrency(label, currency)} info={info} inline>
                <div className="business-capability-price">
                    <NumberCell
                        aria-label={nameWithCurrency(ariaLabel, currency)}
                        placeholder={placeholder}
                        disabled={disabled}
                        value={current}
                        onChange={(event) => onNext(limitedNumberText(event.target.value, current, NUMBER_LIMITS.money))}
                    />
                </div>
            </BusinessField>
        );
    }

    function unitName(stream: RevenueStreamValue): string {
        const unit = stream.unit === "Other" ? stream.unitOther.trim() : stream.unit;
        return (unit || "unit").toLowerCase();
    }

    function plural(word: string, count: number): string {
        return Math.abs(count - 1) < 0.05 ? word : word.endsWith("s") ? word : word + "s";
    }

    /** The price as entered: "€800 / project", "€30 / subscription, monthly". */
    function priceLabel(stream: RevenueStreamValue): string {
        const price = parseAmount(stream.price);
        if (price === null) {
            return "Not set";
        }
        const frequency = REVENUE_FREQUENCIES.find(entry => entry.id === stream.frequency);
        return format(price) + " / " + unitName(stream) +
            (frequency && isRecurringRevenue(frequency.id) ? ", " + frequency.label.toLowerCase() : "");
    }

    /**
     * The price on a folded card's summary line: "£1,200 / Client",
     * or just "£80" while no unit is chosen. A price that does not
     * parse is shown as typed.
     */
    function summaryPrice(stream: RevenueStreamValue): string {
        const price = parseAmount(stream.price);
        const unit = (stream.unit === "Other" ? stream.unitOther : stream.unit).trim();
        const amount = price === null ? stream.price.trim() : format(price);
        return amount && (unit ? amount + " / " + unit : amount);
    }

    /**
     * Each Offering's own costs beside its price: what one sale costs,
     * what is left of the price, and what the Offering costs every
     * month whatever it sells. Read from its lines on Financial
     * Foundation, which come from Page 3's Offering's Capability.
     */
    const offeringCostsBlock = (...args: Parameters<typeof offeringCostsBlockPart> extends [unknown, ...infer Rest] ? Rest : never) => offeringCostsBlockPart({ result, lines, unitName, offeringName, priceLabel, format, volumeText }, ...args);

    /** Where an Offering's Demand & Conversion is, as a jump path (see jumpTo.ts). */
    function demandPath(offeringId: string): string[] {
        const segment = businessFoundationSegments(foundation)
            .find(entry => entry.offerings.some(offering => offering.id === offeringId));
        return [
            "demand-" + offeringId,
            "relationship-offering-" + offeringId,
            ...(segment ? ["engagement-section-" + segment.id + "-relationships", "engagement-segment-" + segment.id] : [])
        ];
    }

    function capitalized(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    function offeringName(stream: RevenueStreamValue): string {
        return offerings.find(offering => offering.id === stream.offeringId)?.label ?? "Unlinked stream";
    }

    /* ---------- The two sections ---------- */

    function sectionCard(
        id: string,
        section: FinancialSection,
        body: () => ReactNode,
        sectionIndex: number,
        titleExtra?: ReactNode
    ) {
        return (
            <FinancialSectionCard
                key={id}
                rail={railId(FINANCIAL_SUSTAINABILITY_SECTIONS[sectionIndex])}
                number={sectionIndex + 1}
                section={section}
                hue={SECTION_HUES[id] ?? 0}
                open={!collapsed.has(id)}
                onToggle={() => toggle(id)}
                body={body}
                // The section's own "Expand all", at the far end of its title row.
                headClass="fold-group-head"
                titleExtra={titleExtra}
            />
        );
    }

    /* ---------- 1. Revenue ---------- */

    /** A group's title within a stream card, with how to estimate it behind the "i". */
    function groupHead(title: string, info?: InfoPoint[]) {
        return (
            <div className="financial-stream-subhead-row">
                <h4 className="field-group-title financial-stream-subhead">
                    <InfoText text={title}>
                        {info && <InfoNote label={title} points={info} fullList />}
                    </InfoText>
                </h4>
            </div>
        );
    }

    const streamCard = (...args: Parameters<typeof streamCardPart> extends [unknown, ...infer Rest] ? Rest : never) => streamCardPart({ demand, capability, result, unitName, offeringName, folds, disabled, summaryPrice, onChange, page, groupHead, listPicker, changeStream, moneyInput, textInput, capitalized, plural, onOpenEngagement, demandPath, start, months, format }, ...args);

    /**
     * Expected sales against the founders' capacity: the organization's
     * controlled delivery hours. Recurring work (subscriptions,
     * retainers) uses each founder's hours first; what remains is the
     * flexible capacity for the other Offerings. Hours from external
     * professionals are shown apart, as what is delivered outside it.
     * A shortfall is reported as a need for capacity, never as an
     * error, and the sales forecast is left as it is.
     */
    const capacityBlock = (...args: Parameters<typeof capacityBlockPart> extends [unknown, ...infer Rest] ? Rest : never) => capacityBlockPart({ onOpenCapability, capacity, start, offerings }, ...args);

    const revenueSection = (...args: Parameters<typeof revenueSectionPart> extends [unknown, ...infer Rest] ? Rest : never) => revenueSectionPart({ result, offerings, onOpenFoundation, shownStreams, streamCard, format, offeringName, priceLabel, capacityBlock }, ...args);

    /* ---------- 2. Break Even ---------- */

    /**
     * A volume in words: "2.2 projects a month" for what is sold, "4.7
     * active clients" for what is paid every period (a count, not a
     * rate).
     */
    function volumeText(stream: RevenueStreamValue, units: number, perMonth = " a month"): string {
        return isRecurringRevenue(stream.frequency)
            ? formatUnits(units) + " active " + plural(unitName(stream), units)
            : formatUnits(units) + " " + plural(unitName(stream), units) + perMonth;
    }

    /** One line per Offering: "≈ 3 projects a month (Bespoke Textile Commissions)". */
    function activityLines(streams: StreamAnalysis[], scale: number): string[] {
        return streams
            .filter(entry => entry.volume > 0)
            .map(entry => {
                const units = entry.volume * scale;
                return "≈ " + volumeText(entry.stream, units) +
                    (streams.length > 1 ? " (" + offeringName(entry.stream) + ")" : "");
            });
    }

    function activityList(streams: StreamAnalysis[], scale: number) {
        return (
            <ul className="financial-activity-list">
                {activityLines(streams, scale).map(line => <li key={line}>{line}</li>)}
            </ul>
        );
    }

    const whenLabel = (month: number | null) => month === null ? "Not reached" : planMonthLabel(start, month);

    /** Whether any revenue is expected in the plan: without it, nothing to test. */
    const hasRevenue = result.months.some(month => month.revenue > 0);

    /**
     * THE STRESS TEST: the plan as it stands and four worse cases, fixed
     * so the answer is the same for everyone, with the funding being
     * sought counted. One sentence says whether the plan holds; the
     * table says how far each case falls.
     */
    const stressBlock = (...args: Parameters<typeof stressBlockPart> extends [unknown, ...infer Rest] ? Rest : never) => stressBlockPart({ hasRevenue, effective, financial, lines, legalEntity, format, whenLabel }, ...args);

    /**
     * WHAT IT WOULD TAKE: the smallest single change that keeps the cash
     * above zero through the plan, each on its own; or, where the plan
     * already holds, how much room it has. Worked out, never asked.
     */
    const takeBlock = (...args: Parameters<typeof takeBlockPart> extends [unknown, ...infer Rest] ? Rest : never) => takeBlockPart({ hasRevenue, effective, financial, lines, legalEntity, format }, ...args);

    const breakEvenSection = (...args: Parameters<typeof breakEvenSectionPart> extends [unknown, ...infer Rest] ? Rest : never) => breakEvenSectionPart({ result, start, months, format, onOpenFinancialFoundation, offeringName, priceLabel, volumeText, activityList, offeringCostsBlock, financial, legalEntity, stressBlock, takeBlock }, ...args);

    return (
        <div className="financial-page business-foundation business-engagement business-capability">

            <FinancialPageHead
                sections={[SECTIONS.revenue, SECTIONS.breakEven]}
                showInstructions={showInstructions}
                columnsDivider={columnsDivider}
            />

            {/* No settings box: the plan's months are in the page
                title, and the currency beside every amount asked for. */}

            {sectionCard(
                "sustainability-revenue", SECTIONS.revenue, revenueSection, 0,
                offerings.length > 0 && (
                    <FoldAllToggle
                        ids={shownStreams.map(entry => entry.stream.id)}
                        folds={folds}
                        label="revenue streams"
                    />
                )
            )}

            <span className="financial-flow-arrow" aria-hidden="true">↓</span>

            {sectionCard("sustainability-break-even", SECTIONS.breakEven, breakEvenSection, 1)}

        </div>
    );

}
