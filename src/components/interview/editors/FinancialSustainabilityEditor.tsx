import { FINANCIALS_FRAMES } from "../../../framework/engine/PageGroups.ts";
import { competitorsPriceRange } from "../../../framework/engine/CompetitorQuestions.ts";
import { offeringShareWeights } from "../../../framework/engine/DemandCapacity.ts";
import { numberStep } from "./BusinessEngagementModel.ts";
import { countedCapability } from "../../../framework/engine/CardCompleteness.ts";
import TextBox from "../../controls/TextBox.tsx";
import NumberCell from "../../controls/NumberCell.tsx";
import { type CSSProperties, type ReactNode, useState, useSyncExternalStore } from "react";
import FoldList from "../fields/FoldList.tsx";
import { toggledIn } from "../fields/toggledIn.ts";
import { JOINED_CHAPTER_KEY, useJoinedChapter } from "../tiles/joinedChapter.ts";
import CardShell from "../cards/CardShell.tsx";
import SectionTiles, { DialogHeading, stackedFace, type FaceRow, type SectionTile } from "../tiles/SectionTiles.tsx";
import { type LegalEntityValue, asBusinessCapabilityValue, asBusinessEngagementValue, asLegalEntityValue, businessFoundationSegments, withLegalEntityFounders } from "../../../framework/engine/AnswerUtils.ts";
import { offeringStartsById } from "../../../framework/engine/EffectiveAnswers.ts";
import { calculatedLines } from "../../../framework/engine/CalculatedLines.ts";
import { ownersTakeDrawings } from "../../../framework/engine/FinancialForecast.ts";
import { type GlobalSettingsValue } from "../../../framework/engine/GlobalSettings.ts";
import { costStartDates, derivedPlanStart, incomeTaxRate, legalExpenseDates, PAYMENT_TIMINGS, planLength, REVENUE_DEVELOPMENTS, REVENUE_CHARGES, REVENUE_UNITS, asFinancialFoundationValue, asFinancialSustainabilityValue, consolidateCosts, createDetailedVolume, createRevenueStream, formatUnits, isRecurringRevenue, moneyFormatter, parseAmount, sustainability, withPlanStart, withDemand, type FinancialSustainabilityValue, type RevenueStreamValue } from "../../../framework/engine/FinancialModel.ts";
import { costSourcesFor } from "../../../framework/engine/ExportRenderers.ts";
import { deliveryAllocation, demandResult } from "../../../framework/engine/DemandCapacity.ts";
import { BusinessAddButton, BusinessCard, BusinessEmpty, BusinessField, OptionalNote, BusinessRemove, uniqueChoices } from "../cards/BusinessCardFields.tsx";
import { type FinancialSection, PlanMonthField } from "./FinancialParts.tsx";
import { summaryText } from "../cards/cardSummary.ts";
import CardBoxes, { type CardBox } from "../cards/CardBoxes.tsx";
import { SingleColumn } from "./foundation/shared.tsx";
import { EngagementBox, EngagementBoxes } from "./engagement/EngagementCard.tsx";
import InfoNote, { type InfoPoint, InfoText } from "../fields/InfoNote.tsx";
import MonthYearPicker from "../fields/MonthYearPicker.tsx";
import { NUMBER_LIMITS, type NumberLimit, limitedNumberText, numberInputMode } from "../fields/numberInput.ts";
import OptionPicker from "../fields/OptionPicker.tsx";
import { type OpenPage } from "../tiles/jumpTo.ts";
import { railId } from "../rails/railItems.ts";
import { useItemFolds } from "../fields/useItemFolds.ts";
import { labelWithCurrency, nameWithCurrency } from "../../../framework/engine/Currencies.ts";
import TextLink from "../fields/TextLink.tsx";
import { ORDERS_HELP, SECTIONS, SECTION_HUES, STREAM_HELP } from "./financialSustainabilityTexts.ts";

/* The "i" of the blocks that are a Break Even or Revenue tile's whole subject: the tile's dialog heading carries it (doc 48, section 2). */

interface FinancialSustainabilityEditorProps {
    value: unknown;
    onChange: (value: FinancialSustainabilityValue) => void;
    disabled?: boolean;
    showInstructions?: boolean;
    columnsDivider?: ReactNode;
    /** The frame's heading the page hands in ("1. Revenue & Break Even": PageGroups.ts, layout rules section 13, "A page's name in the pages rail"). */
    frameTitle?: string;
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
    /** The Global Settings and the Opening Date: the calculated lines (fees, on-costs, tax) the break-even counts, as Page 4 and the forecast do. */
    globalSettings?: GlobalSettingsValue;
    openingDate?: string;
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

    frameTitle = FINANCIALS_FRAMES[0],

    foundation,

    capability: capabilityValue,

    financialFoundation,

    legalEntity: legalEntityValue,

    currency = "",

    onOpenFoundation,


    engagement,

    onOpenEngagement,


    globalSettings,

    openingDate = ""

}: FinancialSustainabilityEditorProps) {

    // (The streams whose Volume from Each Month the founder folded or unfolded: kept while the page is open, never saved.)
    const [volumeFolds, setVolumeFolds] = useState<ReadonlySet<string>>(() => new Set());

    // (On Financials, one chapter: the tiles Costs, Funding & Position hands it, drawn again when they change; joinedChapter.ts.)
    const joined = useJoinedChapter();
    useSyncExternalStore(joined?.subscribe ?? noJoined, joined?.version ?? noVersion);

    const page = asFinancialSustainabilityValue(value);

    const legalEntity = legalEntityValue ?? asLegalEntityValue(undefined);

    const capability = withLegalEntityFounders(asBusinessCapabilityValue(capabilityValue), legalEntity.founders);

    /* Page 4, exactly as Page 4 calculates it: its first month worked out the same way, the earlier of the Opening Date's month and the earliest cost. */
    const stored = asFinancialFoundationValue(financialFoundation);
    const financial = withPlanStart(stored, undefined, derivedPlanStart(openingDate, [...costStartDates(capability), ...legalExpenseDates(legalEntity)], withPlanStart(stored).planStart));
    const start = financial.planStart;
    const months = planLength(financial);

    // (A shared cost split by hours or by revenue: what each Offering uses a month.)
    const lines = consolidateCosts(financial, costSourcesFor(legalEntity, countedCapability(capability), currency, offeringShareWeights(capability.delivery, asBusinessEngagementValue(engagement).demand, page.streams)));

    // Whole units everywhere on this read-only page: an amount
    // someone can edit shows the string they typed, never this
    // formatter, so nobody's own pence are ever hidden by it.
    const format = moneyFormatter(currency, { wholeOnly: true });

    /* Where an Offering's Demand & Conversion gives expected sales,
       every figure uses them (withDemand); the page shows them, and
       keeps asking only where there is none. */
    const demand = asBusinessEngagementValue(engagement).demand;
    const effective = withDemand(page, demand, foundation);

    // (THE SAME COSTS AS PAGE 4: the calculated lines, where the Global Settings are given.)
    const calculated = globalSettings
        ? calculatedLines({ foundation: financial, revenuePage: effective, lines, capability: countedCapability(capability), settings: globalSettings, openingDate, drawings: ownersTakeDrawings(legalEntity.organisation.legalForm), country: legalEntity.organisation.country, engagement: asBusinessEngagementValue(engagement) }, incomeTaxRate(financial))
        : undefined;
    const result = sustainability(effective, financial, lines, legalEntity, format, calculated);


    const offerings = uniqueChoices(
        businessFoundationSegments(foundation).flatMap(segment => segment.offerings),
        "Unnamed offering"
    );

    /** Which Revenue Stream cards are open (see useItemFolds). */
    const folds = useItemFolds(true);

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
        // (Its Per too, from the Offering's terms and form: OfferingStarts.unit; owner, 2026-11-19 21:44 UTC+2.)
        return { ...(starts.charged ? { frequency: starts.charged } : {}), ...(starts.paymentTiming ? { paymentTiming: starts.paymentTiming } : {}), ...(starts.unit ? { unit: starts.unit } : {}) };
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
                        data-size={numberStep(NUMBER_LIMITS.money)}
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

    function streamCard(entry: { stream: RevenueStreamValue; orphan: boolean }, index: number, floating = false) {

        const { stream, orphan } = entry;
        const fromDemand = demandResult(demand[stream.offeringId]);
        const allocation = deliveryAllocation(capability.delivery[stream.offeringId]);
        const founderIds = new Set(capability.founders.map(founder => founder.id));
        const founderEffort = Object.entries(allocation)
            .filter(([personId]) => personId === "" || founderIds.has(personId))
            .reduce((sum, [, hours]) => sum + hours, 0);
        const externalEffort = Object.entries(allocation)
            .filter(([personId]) => personId !== "" && !founderIds.has(personId))
            .reduce((sum, [, hours]) => sum + hours, 0);
        const analysis = result.streams.find(item => item.stream.id === stream.id);
        const what = "Revenue Stream " + (index + 1);
        const unit = unitName(stream);
        const perOrder = result.inputs.perOrderByOffering[stream.offeringId] ?? 0;
        const recurring = isRecurringRevenue(stream.frequency);
        // (The timing the figures use: the Offering's O3t where it is answered, else the stream's own.)
        const starts = offeringStartsById(businessFoundationSegments(foundation), stream.offeringId);
        const timingAnswered = !!starts.paymentTimingAnswered;
        const timing = timingAnswered ? (starts.paymentTiming ?? "") : stream.paymentTiming;
        const splitPayment = timing === "split" || timing === "milestone";
        const delayedPayment = splitPayment || timing === "completion";

        // (THE COMPETITORS' RANGE BESIDE THE PRICE (P7, owner, 2026-11-18 03:01 and 03:08; on the card since 2026-11-20, owner 12:49 UTC+2, "proceed"): what the
        // Segment's competitors charge for a similar offer, from their K15 ranges, a line under the price; nothing is written into the price, and it is never
        // compared with it (doc 48, section 12.2).)
        const competitorsSegment = businessFoundationSegments(foundation).find(entry => entry.offerings.some(offering => offering.id === stream.offeringId));
        const competitorsRange = competitorsSegment ? competitorsPriceRange(competitorsSegment.competitors) : null;
        const groups: { key: string; title: string; info?: InfoPoint[]; body: ReactNode }[] = [
            {
                key: "price", title: "Price", info: STREAM_HELP.price,
                body: (
                    <>
                <div className="financial-inline-grid financial-stream-grid">

                    {listPicker("Charged", what + " charged", REVENUE_CHARGES.map(item => item.label),
                        REVENUE_CHARGES.find(item => item.id === stream.frequency)?.label ?? "",
                        (next) => changeStream(stream.id, {
                            frequency: REVENUE_CHARGES.find(item => item.label === next)?.id ?? ""
                        }),
                        "Select",
                        [
                            "Per sale: paid once for each unit sold (a product, a session, an hour).",
                            "Per project: paid once for each project or contract.",
                            "Monthly, quarterly or annually: paid every period by each client subscribed or on a retainer.",
                            "Use Monthly, Quarterly or Annually when customers buy every month under Demand & Conversion on Foundation & Engagement."
                        ],
                        true)}

                    {moneyInput("Price", what + " price", stream.price,
                        (next) => changeStream(stream.id, { price: next }), "0")}
                    {listPicker("Per", what + " unit", REVENUE_UNITS, stream.unit,
                        (next) => changeStream(stream.id, { unit: next }), "Unit", undefined, true)}

                    {stream.unit === "Other" && textInput("Unit Name", what + " unit, named", stream.unitOther,
                        (next) => changeStream(stream.id, { unitOther: next }), undefined, undefined, true)}

                </div>

                {competitorsRange && (
                    <p className="financial-muted financial-inline-note">
                        Your competitors charge about {format(competitorsRange.low)}{competitorsRange.high > competitorsRange.low ? " to " + format(competitorsRange.high) : ""} for a similar offer.
                    </p>
                )}

                {/* How customers buy is said once, on Customer
                    Engagement; a charge that disagrees counts the
                    expected sales as the wrong thing. */}
                {(demand[stream.offeringId]?.sources.length ?? 0) > 0 && stream.frequency !== "" &&
                    demand[stream.offeringId].recurring !== recurring && (
                    // (ONE CLICK TO MATCH (owner, 2026-11-20 12:49 UTC+2, "proceed"): the note says how customers buy, and its link charges the stream to match.)
                    <p className="financial-muted financial-mismatch" role="note">
                        {recurring
                            ? "On Customer Engagement, customers buy this Offering one sale at a time. Charged per sale, its expected sales count as sales. "
                            : "On Customer Engagement, customers buy this Offering every month. Charged monthly, its active clients count as clients each month. "}
                        <TextLink
                            type="button"
                            className="business-engagement-link"
                            disabled={disabled}
                            onClick={() => changeStream(stream.id, { frequency: recurring ? "per-sale" : "monthly" })}
                        >
                            {recurring ? "Charge it per sale" : "Charge it monthly"}
                        </TextLink>
                    </p>
                )}
                    </>
                )
            },
            {
                key: "volume", title: "Sales Volume", info: STREAM_HELP.volume,
                body: (
                    <>
                <div className="financial-inline-grid financial-stream-grid">

                    {fromDemand.expected !== null
                        ? (
                            /* Taken from Demand & Conversion: shown, and
                               changed there, never entered twice. */
                            <BusinessField
                                label={recurring ? "Active " + capitalized(plural(unit, 2)) : "Expected Sales"}
                                info={["From this Offering's Demand & Conversion on Foundation & Engagement: " + fromDemand.working]}
                                inline
                            >
                                <span className="financial-derived">
                                    <strong className="business-demand-pill">{formatUnits(fromDemand.expected)}</strong>
                                    {recurring ? "" : " a month"}
                                    {onOpenEngagement && (
                                        <TextLink
                                            type="button"
                                            className="business-engagement-link financial-cost-link"
                                            onClick={() => onOpenEngagement(demandPath(stream.offeringId))}
                                        >
                                            from Demand & Conversion
                                        </TextLink>
                                    )}
                                </span>
                            </BusinessField>
                        )
                        : textInput(
                            recurring ? "Active " + capitalized(plural(unit, 2)) : "Expected Sales",
                            what + " expected volume", stream.volume,
                            (next) => changeStream(stream.id, { volume: next }),
                            "a month",
                            [
                                recurring
                                    ? "How many " + plural(unit, 2) + " are paying at the normal operating level. The price is spread evenly over the months it covers."
                                    : "How many " + plural(unit, 2) + " are sold in a month at the normal operating level.",
                                "To work it out from where customers come from (referrals, a sales funnel, repeat customers and more), fill in Demand & Conversion for this Offering on Foundation & Engagement: it then fills this in."
                            ],
                            true,
                            NUMBER_LIMITS.volume
                        )}
                    {listPicker("Build-up", what + " revenue development",
                        REVENUE_DEVELOPMENTS.map(item => item.label),
                        REVENUE_DEVELOPMENTS.find(item => item.id === stream.development)?.label ?? "",
                        (next) => changeStream(stream.id, {
                            development: REVENUE_DEVELOPMENTS.find(item => item.label === next)?.id ?? "steady"
                        }),
                        "Select",
                        REVENUE_DEVELOPMENTS.map(item => ({ title: item.label, text: item.explanation })),
                        true)}

                    {stream.development === "gradual" && (
                        <>
                            {textInput("First Month", what + " first month volume", stream.initialVolume,
                                (next) => changeStream(stream.id, { initialVolume: next }), "e.g. 1",
                                ["How many " + plural(unit, 2) + " in the month revenue begins."], true, NUMBER_LIMITS.volume)}
                            {textInput("Months to Normal", what + " months to reach normal", stream.rampMonths,
                                (next) => changeStream(stream.id, { rampMonths: next }), "e.g. 6",
                                ["How many months it takes to grow evenly to the normal level."], true, NUMBER_LIMITS.months)}
                        </>
                    )}

                    {fromDemand.monthsToNormal !== null && (
                        <p className="financial-muted financial-inline-note">
                            Demand & Conversion suggests about {fromDemand.monthsToNormal} months to reach nine tenths of it.
                        </p>
                    )}

                </div>
                {/* (VOLUME FROM EACH MONTH FOLDS (owner, 2026-11-20 12:49 UTC+2, "proceed"): under Sales Volume, the one fold of a card's lists (FoldList), its count
                    beside it; open while it holds no month yet, so its "+ Month" shows.) */}
                {stream.development === "detailed" && (
                    <FoldList
                        label="Volume from Each Month"
                        name={"Volume from Each Month of " + what}
                        count={stream.detailed.length}
                        open={(stream.detailed.length === 0) !== volumeFolds.has(stream.id)}
                        onToggle={() => setVolumeFolds(current => toggledIn(current, stream.id))}
                    >
                        <div className="financial-schedule">
                            {stream.detailed.map((item, position) => (
                                <div className="financial-schedule-row" key={item.id}>
                                    <MonthYearPicker
                                        hideLabel
                                        label={what + " volume change " + (position + 1) + " month"}
                                        value={item.month}
                                        disabled={disabled}
                                        firstYear={Number(start.year)}
                                        isAllowed={() => true}
                                        onChange={(next) => changeStream(stream.id, {
                                            detailed: stream.detailed.map(other => other.id === item.id ? { ...other, month: next } : other)
                                        })}
                                    />
                                    <NumberCell
                                        aria-label={what + " volume change " + (position + 1) + " volume"}
                                        placeholder={plural(unit, 2) + " per month"}
                                        disabled={disabled}
                                        value={item.volume}
                                        onChange={(event) => changeStream(stream.id, {
                                            detailed: stream.detailed.map(other => other.id === item.id
                                                ? { ...other, volume: limitedNumberText(event.target.value, item.volume, NUMBER_LIMITS.volume) } : other)
                                        })}
                                    />
                                    <BusinessRemove
                                        cell
                                        what={what + " volume change " + (position + 1)}
                                        disabled={disabled}
                                        onRemove={() => changeStream(stream.id, {
                                            detailed: stream.detailed.filter(other => other.id !== item.id)
                                        })}
                                    />
                                </div>
                            ))}
                            <BusinessAddButton
                                label="Month"
                                disabled={disabled}
                                onAdd={() => changeStream(stream.id, { detailed: [...stream.detailed, createDetailedVolume()] })}
                            />
                            <span className="financial-muted">Each volume holds until the next month listed.</span>
                        </div>
                    </FoldList>
                )}

                    </>
                )
            },
            {
                key: "payment", title: "Begins & Payment", info: STREAM_HELP.timing,
                body: (
                    <>
                <div className="financial-inline-grid financial-stream-grid">

                    <PlanMonthField
                        label="Begins"
                        value={stream.start}
                        planStart={start}
                        planMonths={months}
                        disabled={disabled || stream.development === "detailed"}
                        onChange={(next) => changeStream(stream.id, { start: next })}
                        inline
                    />

                    {/* (WHEN THEY PAY HAS ONE OWNER, the Offering's O3t: where it is answered this is its record, one option, read only; owner, 2026-11-16.) */}
                    {listPicker("Customer Pays", what + " payment timing",
                        timingAnswered
                            ? [PAYMENT_TIMINGS.find(item => item.id === timing)?.label ?? "When earned"]
                            : PAYMENT_TIMINGS.map(item => item.label),
                        PAYMENT_TIMINGS.find(item => item.id === timing)?.label ?? (timingAnswered ? "When earned" : ""),
                        (next) => changeStream(stream.id, {
                            paymentTiming: PAYMENT_TIMINGS.find(item => item.label === next)?.id ?? ""
                        }),
                        "When earned",
                        [
                            "When the money is actually received, if not when the sale is made.",
                            ...(timingAnswered ? ["It follows the Offering's When do they pay? on Foundation & Engagement."] : []),
                            { title: "Upfront", text: "Paid in full when the sale is made." },
                            { title: "On completion", text: "Paid in full the months given after the sale." },
                            { title: "Split", text: "A share when the sale is made, the rest the months given after." },
                            { title: "Milestones", text: "As Split: a share at the start, the rest the months given after, at the milestone." },
                            { title: "Other", text: "Counted when the sale is made; say how under Assumptions." }
                        ],
                        true)}

                    {splitPayment && textInput("Upfront (%)", what + " percent paid at start", stream.firstPercent,
                        (next) => changeStream(stream.id, { firstPercent: next }), "e.g. 50",
                        ["The share of the price paid when the sale is made; the rest arrives the months after given beside it."],
                        true, NUMBER_LIMITS.percent)}
                    {delayedPayment && textInput(
                        timing === "completion" ? "Paid After" : "Rest After",
                        what + " payment delay", stream.paymentDelay,
                        (next) => changeStream(stream.id, { paymentDelay: next }), "months",
                        ["Months after the sale."], true, NUMBER_LIMITS.months)}

                </div>
                    </>
                )
            },
            // (Asked only when this Offering has a cost per order, such as delivery.)
            ...(perOrder > 0 ? [{
                key: "orders", title: "Orders & Delivery", info: ORDERS_HELP,
                body: (
                    <>
                    <div className="financial-inline-grid financial-stream-grid">
                            {textInput(
                                "Items per Order",
                                what + " items per order",
                                stream.itemsPerOrder,
                                (next) => changeStream(stream.id, { itemsPerOrder: next }),
                                "1",
                                ["How many " + plural(unit, 2) + " an average order holds. A cost per order, " + format(perOrder) +
                                    " here, is shared by them."],
                                true,
                                NUMBER_LIMITS.itemsPerOrder
                            )}
                            {moneyInput(
                                "Delivery Charge",
                                what + " delivery charged per order",
                                stream.deliveryCharge,
                                (next) => changeStream(stream.id, { deliveryCharge: next }),
                                "0 if free",
                                ["What the customer pays towards delivery, per order. It is counted as revenue, shared by the " + plural(unit, 2) + " in the order."]
                            )}
                    </div>
                    </>
                )
            }] : [])
        ];
        const outcome = analysis && analysis.price !== null && (
                    <p className="financial-stream-result">
                        <span>At the normal level: <strong>{format(analysis.revenue)} a month</strong></span>
                        <span>Left from each {unit} after its costs: <strong>{format(analysis.contribution ?? 0)}</strong></span>
                        {founderEffort + externalEffort > 0 && (
                            <span>
                                Delivery: <strong>about {formatUnits(Math.round(analysis.volume * founderEffort))} founders' hours a month</strong>
                                {externalEffort > 0 && <> and about {formatUnits(Math.round(analysis.volume * externalEffort))} external</>}
                            </span>
                        )}
                    </p>
        );
        const notes = (
            <OptionalNote
                label="Assumptions"
                ariaLabel={what + " assumptions"}
                disabled={disabled}
                value={stream.description}
                onChange={(next) => changeStream(stream.id, { description: next })}
            />
        );

        return (
            <BusinessCard
                key={stream.id}
                kind="Revenue Stream"
                number={index + 1}
                name={orphan ? "Offering removed from the Foundation page" : offeringName(stream)}
                open={floating || folds.isOpen(stream.id)}
                onToggle={floating ? undefined : () => folds.toggle(stream.id)}
                disabled={disabled}
                anchor={"stream-" + stream.offeringId}
                summary={summaryText(
                    summaryPrice(stream),
                    REVENUE_CHARGES.find(item => item.id === stream.frequency)?.label ?? stream.frequency
                )}
                actions={orphan && (
                    <BusinessRemove
                        what={what}
                        disabled={disabled}
                        onRemove={() => onChange({ ...page, streams: page.streams.filter(item => item.id !== stream.id) })}
                    />
                )}
            >

                {/* FOUR SHORT GROUPS, each under its own heading: what it costs the customer, how much sells, when the money arrives, and (only where it
                    applies) orders. On the page every group shares four columns, labels above, so they line up. FLOATING, from its tile in the Revenue Streams
                    dialog, as a Customer Engagement card (owner, 2026-11-18 10:38: "fix the style of the dialogue and the floated cards to fit the other"): each
                    group a box of the shared bands -- its title band, its questions --, then the results and the Assumptions. Shared components only. */}
                {floating
                    ? (
                        <SingleColumn>
                            <EngagementBoxes>{[
                                ...groups.map((group, at) => (
                                    <EngagementBox key={group.key} title={group.title} info={group.info}
                                        bands={[group.body, ...(!outcome && at === groups.length - 1 ? [notes] : [])]} />
                                )),
                                outcome && <EngagementBox key="results" title="Results" bands={[outcome, notes]} />
                            ]}</EngagementBoxes>
                        </SingleColumn>
                    )
                    : (
                        <>
                            {groups.slice(0, 2).map(group => (
                                <section className="financial-stream-group" key={group.key}>
                                    {groupHead(group.title, group.info)}
                                    {group.body}
                                </section>
                            ))}
                            {/* When the money arrives, and its orders: side by side on one band while payment takes two fields and orders apply, each group in
                                two of the four columns, so every field stays on the grid above; otherwise, or where the grid is narrower, one under the other. */}
                            <div className={"financial-stream-band" + (perOrder > 0 && !delayedPayment ? " financial-stream-band-paired" : "")}>
                                {groups.slice(2).map(group => (
                                    <section className="financial-stream-group" key={group.key}>
                                        {groupHead(group.title, group.info)}
                                        {group.body}
                                    </section>
                                ))}
                            </div>
                            {outcome}
                            {notes}
                        </>
                    )}

            </BusinessCard>
        );

    }


    /** REVENUE IN THREE PARTS (doc 48, section 2): the Revenue chapter's tiles on Revenue & Pricing -- Revenue Streams, Delivery Check, Revenue Summary. */
    function revenueParts() {


        const streams = (
            <>
                {offerings.length === 0
                    ? (
                        <BusinessEmpty>
                            Each Offering on Foundation & Engagement gets its revenue stream here. Define an Offering first
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
                            {shownStreams.map((entry, at) => streamCard(entry, at))}
                        </div>
                    </>)}
            </>
        );

        const pair = (name: string, figure: string): FaceRow => ({ name, under: figure });
        return {
            // (NOT PRICED YET (doc 48, section 13, step 1; owner, 2026-11-20 12:49 UTC+2, "proceed to changes"): an Offering with no price says so on the face; the founder sets the price.)
            streams: { body: streams, face: shownStreams.map(entry => pair(offeringName(entry.stream), summaryPrice(entry.stream) || "Not priced yet")) }
        };

    }

    /* ---------- The chapters (doc 48, sections 2 and 11; owner, 2026-11-17 07:36) ---------- */

    /** A chapter's tiles, each opening its blocks in a dialog with the chapter's heading and "i", as Financial Foundation's are. */
    function chapterTiles(prefix: string, section: FinancialSection, entries: readonly { id: string; title: string; body: ReactNode; face: readonly FaceRow[]; extra?: ReactNode; info?: InfoPoint[] }[]): SectionTile[] {
        return entries.map(entry => ({
            id: prefix + "-" + entry.id,
            title: entry.title,
            // (MASTER TILES KEEP THEIR SIZE AND THE 2 x 2 (owner's rule): a chapter of one or two tiles has them at the size of four, in its top row.)
            large: true,
            anchor: prefix + "-" + entry.id,
            rail: railId(entry.title),
            items: stackedFace(entry.face),
            content: () => (
                <div className="column-tile-content" data-anchor={prefix + "-" + entry.id} data-rail={railId(entry.title)} role="group" aria-label={entry.title}>
                    <div className="business-engagement-section-head">
                        <DialogHeading title={entry.title} info={entry.info ?? [...section.instructions, ...section.info]} />
                        {entry.extra}
                    </div>
                    {/* (The page's chart colours, which the Financial pages define, hold in the dialog too.) */}
                    <div className="financial-page"><div className="financial-section-body">{entry.body}</div></div>
                </div>
            )
        }));
    }

    /** One chapter: its title band and its tiles, in the page's chapter frame. */
    function chapter(title: string, hue: number, tiles: SectionTile[]) {
        return (
            <CardShell data-anchor={"column-tiles-" + title.toLowerCase().replace(/[^a-z]+/g, "-")} style={{ "--strategy-theme-hue": hue } as CSSProperties}>
                <div className="card-scroll">
                    <div className="business-capability-section business-capability-tiles-section">
                        <div className="business-engagement-section-head tiles-frame-head"><span className="field-group-title business-foundation-subhead">{title}</span></div>
                        <SectionTiles label={tiles.map(tile => tile.title).join(", ")} hue={hue} tiles={tiles} />
                    </div>
                </div>
            </CardShell>
        );
    }

    // (BREAK-EVEN & SUSTAINABILITY AND CASH FLOW ARE RECORDS: they ask nothing, and the Workbook says them -- the Business Plan's "2. Break Even" with its Stress
    // Test, the Financial Forecast's Cash-Flow Forecast with its two charts (doc 48, section 14; owner, 2026-11-20 18:35 UTC+2). The page keeps what asks.)

    // (REVENUE, the chapter of Revenue & Pricing. ONE CARD (owner, 2026-11-18 10:38: "Revenue streams should be tiles. Place the Revenue Summary and Delivery Check
    // in the same card as the Revenue Stream Tiles"): its tile opens a dialog of a tile for each stream (the dialog's card list, three in a row, each opening its
    // stream's card floating), then the Delivery Check and the Revenue Summary under their own bands. No settings box: the plan's months are in the page title,
    // and the currency beside every amount asked for.)
    const revenue = revenueParts();
    const streamCardId = (stream: RevenueStreamValue) => "revenue-stream:" + stream.id;
    const revenueTile: SectionTile = {
        ...chapterTiles("sustainability-revenue", SECTIONS.revenue, [{
            id: "streams", title: "Revenue Streams", face: revenue.streams.face,
            body: (
                <>
                    {offerings.length === 0
                        ? revenue.streams.body
                        : (
                            <CardBoxes
                                label="Revenue Streams"
                                what="Revenue Stream"
                                autoStart={false}
                                items={shownStreams.map((entry, at): CardBox => ({
                                    id: streamCardId(entry.stream),
                                    number: at + 1,
                                    name: entry.orphan ? "Offering removed from the Foundation page" : offeringName(entry.stream),
                                    unnamed: "Revenue Stream " + (at + 1),
                                    own: true,
                                    lines: [summaryPrice(entry.stream), REVENUE_CHARGES.find(item => item.id === entry.stream.frequency)?.label ?? ""].filter(Boolean),
                                    content: () => null
                                }))}
                            />
                        )}
                </>
            )
        }])[0],
        // (A dialog of its own, whatever the number of streams; the Delivery Check and the Revenue Summary are the Business Plan's, doc 48, section 14.)
        view: true,
        holds: shownStreams.map(entry => streamCardId(entry.stream)),
        cardFor: (id: string) => {
            const at = shownStreams.findIndex(entry => streamCardId(entry.stream) === id);
            return at < 0 ? null : <div className="column-tile-content financial-page financial-stream-floating">{streamCard(shownStreams[at], at, true)}</div>;
        }
    };
    // (THE FIRST FRAME OF FINANCIALS (PageGroups.ts; owner, 2026-11-18, the approved plan, step 1): one chapter, Revenue & Break Even -- Revenue Streams,
    // Break-Even, Sustainability --, beside Financial Foundation, as a frame of every page of several sections is drawn. Three Master Tiles keep their size:
    // the 2 x 2 with its fourth place empty (layout rules section 23).)
    // (THE ONE CHAPTER OF FINANCIALS (PageGroups.ts, `oneChapter`; owner, 2026-11-20 02:11 UTC+2: "Maybe they should all be under only one chapter."): the six Master
    // Tiles in the order each reads only what stands before it (doc 48, section 11) -- Revenue Streams, Costs, Capital & Funding, Financial Position, then
    // Break-Even and Sustainability --, two groups side by side in one frame, the line between them, as Foundation & Engagement's chapter: so every Master Tile
    // keeps its size and layout (layout rules section 23) and every dialog and floating card behaves as before.)
    // (THE ONE CHAPTER OF FINANCIALS, THREE MASTER TILES THAT ASK (doc 48, section 14): Revenue Streams, Costs, Funding, in the 2 x 2, its fourth place empty
    // (layout rules section 23).)
    const chapterTilesShown = joined ? [revenueTile, ...joined.get(JOINED_CHAPTER_KEY)] : [revenueTile];
    return (
        <div className="answer-columns business-foundation business-engagement business-capability column-tiles-page" style={{ "--answer-column-count": 1 } as CSSProperties}>
            {chapter(frameTitle, SECTION_HUES["sustainability-revenue"] ?? 0, chapterTilesShown)}
        </div>
    );

}

const noJoined = () => () => {};
const noVersion = () => 0;
