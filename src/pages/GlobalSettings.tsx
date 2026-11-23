import { Fragment, useEffect, useMemo, useState } from "react";
import TextLink from "../components/interview/fields/TextLink.tsx";
import { land } from "../components/interview/tiles/jumpTo.ts";
import AddButton from "../components/controls/AddButton.tsx";
import NumberCell from "../components/controls/NumberCell.tsx";
import TextBox from "../components/controls/TextBox.tsx";
import { useLocation, useNavigate } from "react-router-dom";

import AppFooter from "../components/shell/AppFooter";
import AppHeader from "../components/shell/AppHeader";
import { limitedNumberText, NUMBER_LIMITS, numberInputMode, type NumberLimit } from "../components/interview/fields/numberInput";
import {
    asGlobalSettings,
    capitalisationLimitOf,
    createChannelFeeRow,
    createGlobalSettings,
    defaultStageDurationTexts,
    stageDurationsOf,
    AMORTISATION_GROUPS,
    DEFAULT_AMORTISATION,
    DEFAULT_USEFUL_LIFE,
    USEFUL_LIFE_CATEGORIES,
    USEFUL_LIFE_GROUPS,
    type GlobalSettingsValue
} from "../framework/engine/GlobalSettings";
import { countryCurrency } from "../framework/engine/legal/LegalEntityJurisdictions";
import { costText } from "../framework/engine/export/ExportRenderers";
import { assetUnitCost, isCostingStatus, isPurchaseGroup, type BusinessCapabilityValue, type BusinessResourceSlotValue } from "../framework/engine/answers/AnswerUtils";
import { channelFeeRowFor, ownFeeChannelNames, resetChannelFees, shownChannelFees } from "../framework/engine/financial/CalculatedLines";
import { capabilityCards, costCardName } from "../framework/engine/channels/ChannelResources";
import { asBusinessEngagementValue } from "../framework/engine/businessFoundation/engagementReaders";
import { businessFoundationSegments } from "../framework/engine/answers/AnswerUtils";
import { segmentPaymentServices } from "../framework/engine/choices/SegmentQuestions";
import { segmentIdentityOf } from "../framework/engine/SegmentContext";
import { effectiveSegmentAnswers } from "../framework/engine/answers/EffectiveAnswers";
import { OrganizationService } from "../services/OrganizationService";
import { systems } from "../data/systems";
import { StorageService } from "../services/StorageService";
import { AnswerType } from "../framework/enums/AnswerType";
import { asBusinessCapabilityValue, asLegalEntityValue } from "../framework/engine/answers/AnswerUtils";
import { asFinancialFoundationValue, costStartDates, derivedPlanStart, legalExpenseDates, withPlanStart, type FinancialFoundationValue } from "../framework/engine/financial/FinancialModel";
import FinancialPlanSettings from "../components/interview/editors/FinancialPlanSettings";
import { STAGES, addMonthsIso, dayWords, stageEnds, stageOf, stageMessages, type StageKey } from "../framework/engine/BusinessStage";
import { INFO as LEGAL_INFO } from "../components/interview/editors/legal/shared";
import InfoNote from "../components/interview/fields/InfoNote";
import FieldLabel from "../components/controls/FieldLabel";
import { USEFUL_LIFE_MEANING, USEFUL_LIFE_SOURCES, usefulLifePoints } from "../framework/engine/UsefulLifeReferences";
import { SOURCES } from "../framework/engine/Sources";

/**
 * The business stages' durations, in the order the screen lists them: what each is and the unit it is counted in (months, the Growing stage's in years). The Opening Date is where Planning ends and
 * Launching starts; Managing and Growing start where the stage before ends.
 */
const STAGE_ROWS: readonly { field: "planning" | "launching" | "managing" | "growing"; stage: StageKey; label: string; unit: "months" | "years"; max: number; meaning: string }[] = [
    { field: "planning", stage: "plan", label: "Planning", unit: "months", max: 120, meaning: "How long the planning is meant to take, counted back from the Opening Date (the Review says when it has run longer). A business with no Opening Date yet is planning." },
    { field: "launching", stage: "launch", label: "Launching", unit: "months", max: 120, meaning: "From the Opening Date: the first customers, the MVP, the proof that the market accepts it. The Early Positioning Statement is proved or changed within it." },
    { field: "managing", stage: "manage", label: "Managing", unit: "months", max: 120, meaning: "After Launching: stabilising, keeping customers, product-market fit. The Core Market Positioning stands for it." },
    { field: "growing", stage: "grow", label: "Growing", unit: "years", max: 50, meaning: "After Managing: scaling and expanding into new markets. The Corporate & Portfolio Positioning looks as far ahead." }
];

/** What the amortisation of an intangible asset is, and the standards its years come from (Global Settings > Assets > Intangible assets). */
const AMORTISATION_POINTS = [
    { title: "What it is", text: "Amortisation is depreciation for an asset you cannot touch: a licence, a permit, a franchise right, software, a website, a trademark. Its cost is spread over the years it serves the business, in a straight line." },
    { title: "UK & Ireland (FRS 102)", text: "Every intangible has a finite life, estimated from evidence; where it cannot be estimated reliably, no more than 10 years." },
    { title: "International (IAS 38)", text: "A finite life is amortised; an asset with no foreseeable limit (a well-established brand) is not, and is tested for impairment each year." },
    { title: "US tax", text: "Intangibles bought with a business (goodwill, customer lists) are amortised over 15 years; purchased software outside such a deal over 36 months." },
    { title: "Common practice", text: "Small companies write off websites and software over about 3 years, domain names and trademarks over 10." }
];
const AMORTISATION_SOURCES = [SOURCES.frs102Intangibles, SOURCES.ias38Examples, SOURCES.section197Amortisation, SOURCES.smallCompanyIntangibleLives];

import "../styles/global.css";
import "../styles/conversation.css";
import "../styles/option-picker.css";
import "../styles/workspace.css";
import "../styles/review.css";
import "../styles/global-settings.css";
import "../styles/system-confirmation.css";

/**
 * GLOBAL SETTINGS: the rates and limits the calculated lines read (GlobalSettings.ts), on a screen of their own, reached from the header. Every figure is
 * kept as it is typed, and saved at once. Back, and Escape, return to where it was opened from.
 */
export default function GlobalSettings() {

    const navigate = useNavigate();
    const location = useLocation();
    const [organizationId] = useState(() => OrganizationService.getSelected());
    const [settings, setSettings] = useState<GlobalSettingsValue>(() =>
        asGlobalSettings(organizationId ? OrganizationService.getGlobalSettings(organizationId) : undefined)
    );

    // THE FINANCIAL PLAN'S OWN SETTINGS live in the answer of 4. Financial Foundation (Business System); this screen edits that answer.
    const [business] = useState(() => organizationId ? StorageService.loadInterview(organizationId, 3) : null);
    const [identity] = useState(() => organizationId ? StorageService.loadInterview(organizationId, 1) : null);
    const planSection = business?.getFramework().sections.find(section => section.answer?.type === AnswerType.FinancialFoundation);
    const capabilitySection = business?.getFramework().sections.find(section => section.answer?.type === AnswerType.BusinessCapability);
    const legalSection = identity?.getFramework().sections.find(section => section.title === "Legal Entity");
    const [plan, setPlan] = useState<FinancialFoundationValue | null>(() =>
        business && planSection ? withPlanStart(asFinancialFoundationValue(business.getResponse(planSection.number))) : null
    );
    const legalEntity = asLegalEntityValue(identity && legalSection ? identity.getResponse(legalSection.number) : undefined);
    // The Infrastructure & Capability cards: each asset's own useful life is set under its group (Useful Life).
    const [capabilityValue, setCapabilityValue] = useState<BusinessCapabilityValue>(() =>
        asBusinessCapabilityValue(business && capabilitySection ? business.getResponse(capabilitySection.number) : undefined)
    );

    const from = (location.state as { from?: { pathname: string; state?: unknown } } | null)?.from;
    // (A LINK THAT NAMES A PART of the screen -- a subchannel's Fees, a row of the Channel Fee Table -- lands on it: scrolled to and framed, as every link's target is.)
    const landOn = (location.state as { land?: string } | null)?.land;
    useEffect(() => {
        if (!landOn) {
            return;
        }
        const timer = window.setTimeout(() => {
            const target = document.querySelector<HTMLElement>('[data-anchor="' + CSS.escape(landOn) + '"]');
            if (target) {
                land(target);
            }
        }, 120);
        return () => window.clearTimeout(timer);
    }, [landOn]);
    const back = useMemo(() => () => {
        if (from && from.pathname !== "/settings") {
            navigate(from.pathname, { state: from.state });
        } else {
            navigate("/assistant", { state: { capability: "foundation" } });
        }
    }, [from, navigate]);

    useEffect(() => {
        if (!organizationId) {
            navigate("/");
        }
    }, [organizationId, navigate]);

    useEffect(() => {
        function onKey(event: KeyboardEvent) {
            if (event.key === "Escape" && !event.defaultPrevented) {
                back();
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [back]);

    if (!organizationId) {
        return null;
    }

    function change(patch: Partial<GlobalSettingsValue>) {
        const next = { ...settings, ...patch };
        setSettings(next);
        OrganizationService.saveGlobalSettings(organizationId as string, next);
    }

    /** The plan's first month for an Opening Date: the earlier of its month and the earliest card's cost. */
    function planStartFor(openingDate: string) {
        const capability = asBusinessCapabilityValue(business && capabilitySection ? business.getResponse(capabilitySection.number) : undefined);
        return derivedPlanStart(openingDate, [...costStartDates(capability), ...legalExpenseDates(legalEntity)], plan?.planStart ?? withPlanStart(asFinancialFoundationValue(undefined)).planStart);
    }

    function changePlan(next: FinancialFoundationValue) {
        setPlan(next);
        if (business && planSection && organizationId) {
            business.saveResponse(planSection.number, next);
            StorageService.saveInterview(organizationId, business);
        }
    }

    /** One asset card's own years: written into the card, kept with the Infrastructure & Capability page. */
    function changeSlotLife(slotId: string, years: string, field: "usefulLife" | "amortisationYears" = "usefulLife") {
        const patch = (slot: BusinessResourceSlotValue) => slot.id === slotId ? { ...slot, [field]: years } : slot;
        const next: BusinessCapabilityValue = {
            ...capabilityValue,
            resources: Object.fromEntries(Object.entries(capabilityValue.resources).map(([group, subsections]) => [group, subsections.map(subsection => ({ ...subsection, slots: subsection.slots.map(patch) }))])),
            offering: { ...capabilityValue.offering, resources: capabilityValue.offering.resources.map(patch) }
        };
        setCapabilityValue(next);
        if (business && capabilitySection && organizationId) {
            business.saveResponse(capabilitySection.number, next);
            StorageService.saveInterview(organizationId, business);
        }
    }

    /** The asset cards of a group that carry a useful life: bought, and at or above the capitalisation limit. */
    function assetsOf(groupId: string): BusinessResourceSlotValue[] {
        const limit = capitalisationLimitOf(settings);
        const own = Object.values(capabilityValue.resources).flat().filter(subsection => subsection.id === groupId).flatMap(subsection => subsection.slots);
        const offered = capabilityValue.offering.resources.filter(slot => slot.group === groupId);
        return [...own, ...offered].filter(slot =>
            isCostingStatus(slot.status) && isPurchaseGroup(groupId) && (limit === null || (assetUnitCost(capabilityValue, slot) ?? 0) >= limit)
        );
    }

    /** The cards that buy an intangible group's right (a permit, a franchise fee): costed, with the group's cost option. */
    function intangiblesOf(costOption: string): BusinessResourceSlotValue[] {
        const all = [...Object.values(capabilityValue.resources).flat().flatMap(subsection => subsection.slots), ...capabilityValue.offering.resources];
        return costOption === "" ? [] : all.filter(slot => isCostingStatus(slot.status) && slot.costOption === costOption);
    }

    function openCardsPage() {
        const target = capabilitySection?.number;
        if (target !== undefined) {
            navigate("/conversation", { state: { system: business ? systems.find(system => system.id === "business") : undefined, targetSectionNumber: target, resume: {} } });
        }
    }

    /** A section's title with its details in an "i" (nothing is written under it). */
    const sectionTitle = (title: string, details?: string) => (
        <h2 className="review-group-title">
            {title}
            {details && <InfoNote label={title} points={[details]} />}
        </h2>
    );

    /** One labelled number box; what it means is in the "i" beside its label. */
    function figureField(label: string, hint: string, value: string, onNext: (next: string) => void, limits: NumberLimit, unit = "", note?: React.ReactNode) {
        return (
            <div className="settings-field">
                <span className="field-label settings-label">
                    {label}
                    {hint && <InfoNote label={label} points={[hint]} />}
                    {note}
                </span>
                <span className="settings-control">
                    <NumberCell
                        inputMode={numberInputMode(limits)}
                        className={"settings-number" + (unit === "%" || unit === "months" ? " settings-percent" : "")}
                        aria-label={label}
                        value={value}
                        onChange={(event) => onNext(limitedNumberText(event.target.value, value, limits))}
                    />
                    {unit && <span className="settings-unit">{unit}</span>}
                </span>
            </div>
        );
    }

    const orgCurrency = countryCurrency(legalEntity.organisation.country);

    /*
        THE CHANNEL FEE TABLE SHOWS WHAT THE ANSWERS USE (owner, 2026-11-15 15:10: "only information that is related to the answers should be presented. That
        covers the fees"): the rows of the Legal Entity's country (the UK's while none is chosen), and of those from the app's fee data only the ones a
        subchannel's or an expense card's name takes; a row the user made always shows. The other rows stay in the table, kept for when an answer names them.
    */
    const feeCountry = legalEntity.organisation.country.trim() || "GB";
    const engagementSection = business?.getFramework().sections.find(section => section.answer?.type === AnswerType.BusinessEngagement);
    const engagementValue = useMemo(() => asBusinessEngagementValue(business && engagementSection ? business.getResponse(engagementSection.number) : undefined), [business, engagementSection]);
    // (The payment services the Segments name, Which payment services do you take payments with?: their rows show, and one written in has its own.)
    const foundationSection = business?.getFramework().sections.find(section => section.answer?.type === AnswerType.BusinessFoundation);
    // (The SETTLED answers, as Customer Engagement reads them: a payment service left behind by a changed answer makes no row.)
    const segmentIdentity = segmentIdentityOf(legalEntity.organisation, stageOf(settings.openingDate, new Date(), stageDurationsOf(settings)));
    const paymentServices = useMemo(() => businessFoundationSegments(business && foundationSection ? business.getResponse(foundationSection.number) : undefined)
        .flatMap(segment => segmentPaymentServices(effectiveSegmentAnswers(segment, segmentIdentity), segmentIdentity.country)),
    // (The identity is rebuilt each render from the same answers: its parts are the dependencies.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [business, foundationSection, JSON.stringify(segmentIdentity)]);
    const usedNames = useMemo(() => [
        ...engagementValue.segments.flatMap(segment => segment.channels.map(channel => channel.name)),
        ...capabilityCards(capabilityValue).map(card => costCardName(card)),
        ...paymentServices
    ].filter(name => name.trim() !== ""), [engagementValue, capabilityValue, paymentServices]);
    // (A SUBCHANNEL THE USER NAMED where a fee is taken (ownFeeChannelNames) and no row of the country takes: a row of its own, ready to fill, "Entered by you";
    // it is kept once anything in it is typed. Owner, 2026-11-15 15:54.)
    const ownRows = [...new Set([...ownFeeChannelNames(engagementValue), ...paymentServices])]
        .filter(name => !settings.channelFees.some(row => (row.country || "GB") === feeCountry && channelFeeRowFor(name, [{ ...row, status: "checked", commission: row.commission || "0" }], feeCountry) !== undefined))
        .map(name => ({ ...createChannelFeeRow(feeCountry), id: "fee-own-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + feeCountry.toLowerCase(), channel: name, note: "Entered by you" }));
    const shownFees = [...shownChannelFees(settings.channelFees, feeCountry, usedNames), ...ownRows];
    /** A change to a shown row: a row of the table changed in place; a subchannel's own row made a row of the table by the first thing typed in it. */
    const changeFee = (rowId: string, patch: Partial<GlobalSettingsValue["channelFees"][number]>) => change({
        channelFees: settings.channelFees.some(row => row.id === rowId)
            ? settings.channelFees.map(row => row.id === rowId ? { ...row, ...patch } : row)
            : [...settings.channelFees, ...ownRows.filter(row => row.id === rowId).map(row => ({ ...row, ...patch }))]
    });
    // (THE RESET of the Channel Fee Table asks first, in the app's confirmation dialog.)
    const [confirmFeeReset, setConfirmFeeReset] = useState(false);

    // The business stage today, and what each stage lasts (the Opening Date is where they start).
    const stageDurations = stageDurationsOf(settings);
    const todayStage: StageKey = stageOf(settings.openingDate, new Date(), stageDurations);

    const feeCell = (rowId: string, field: "commission" | "fixedFee" | "chargeback", label: string, limits: NumberLimit, value: string) => (
        <NumberCell
            inputMode={numberInputMode(limits)}
            className={"settings-number" + (limits === NUMBER_LIMITS.percent ? " settings-percent" : "")}
            aria-label={label}
            value={value}
            onChange={(event) => changeFee(rowId, { [field]: limitedNumberText(event.target.value, value, limits) })}
        />
    );

    return (

        <div className="workspace review">

            <AppHeader organizationName={OrganizationService.getSummary(organizationId)?.name ?? ""} />

            <main className="review-page settings-page business-foundation business-capability">

                <h1 className="workspace-title review-title">
                    {/* (Its name "Settings", as the Menu says it: owner, 2026-11-23 17:28 UTC+2, "Change the Global Settings title to Settings".) */}
                    Settings
                    <InfoNote label="Settings" points={["The rates and limits the calculated lines use. Change one here and every line that uses it follows."]} />
                </h1>

                {plan && (
                    <section className="settings-section" aria-label="Financial plan">
                        {sectionTitle("Financial plan")}
                        <FinancialPlanSettings
                            value={plan}
                            legalEntity={legalEntity}
                            planStart={planStartFor(settings.openingDate)}
                            onChange={changePlan}
                        />
                    </section>
                )}

                {/* THE BUSINESS STAGES (owner, 2026-10-24): the stage is the Opening Date's; how long each lasts is set here, as the Assets' useful lives are. What else there is to say stands in the "i" beside the title. */}
                <section className="settings-section" aria-label="Business stages">
                    <h2 className="review-group-title">
                        Business stages
                        <InfoNote
                            label="Business stages"
                            fullList
                            points={[
                                "Today: " + (STAGES.find(entry => entry.id === todayStage)?.label ?? "") + ". " + (settings.openingDate === "" ? "No Opening Date yet: set it on the Organisation tile." : stageMessages(settings.openingDate, "", new Date(), stageDurations)[0]),
                                ...LEGAL_INFO.businessStage,
                                ...STAGE_ROWS.map(row => row.label + ": " + row.meaning)
                            ]}
                        />
                    </h2>
                    <div className="settings-field">
                        <FieldLabel className="settings-label">
                            Opening Date
                            <InfoNote label="Opening Date" points={LEGAL_INFO.openingDate} />
                        </FieldLabel>
                        <span className="settings-control"><span>{settings.openingDate === "" ? "Not set" : dayWords(settings.openingDate)}</span></span>
                        <span className="settings-hint">{settings.openingDate === "" ? "Set on the Organisation tile." : ""}</span>
                    </div>
                    <div className="settings-table-wrap">
                        <table className="settings-table settings-assets-table settings-stages-table" aria-label="Business stages">
                            <colgroup>
                                <col className="settings-col-asset" />
                                <col className="settings-col-date" />
                                <col className="settings-col-date" />
                                <col className="settings-col-life" />
                                <col className="settings-col-time" />
                                <col className="settings-col-reset" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col">Stage</th>
                                    <th scope="col">Start</th>
                                    <th scope="col">End</th>
                                    <th scope="col" className="settings-number-column">Duration</th>
                                    <th scope="col">Time in:</th>
                                    <th scope="col">
                                        <AddButton title="Reset every stage to its default duration"
                                            disabled={STAGE_ROWS.every(row => settings.stageDurations[row.field] === defaultStageDurationTexts()[row.field])}
                                            onClick={() => change({ stageDurations: defaultStageDurationTexts() })}>
                                            Reset
                                        </AddButton>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {STAGE_ROWS.map(row => {
                                    const typed = settings.stageDurations[row.field];
                                    const fallback = defaultStageDurationTexts()[row.field];
                                    // (Each stage starts where the one before ends: Planning ends at the Opening Date, counted back from it; the others follow it.)
                                    const opening = settings.openingDate;
                                    const ends = stageEnds(stageDurations);
                                    const window = opening === "" ? ["", ""]
                                        : row.stage === "plan" ? [addMonthsIso(opening, -stageDurations.planning), opening]
                                        : row.stage === "launch" ? [opening, addMonthsIso(opening, ends.launching)]
                                        : row.stage === "manage" ? [addMonthsIso(opening, ends.launching), addMonthsIso(opening, ends.managing)]
                                        : [addMonthsIso(opening, ends.managing), addMonthsIso(opening, ends.growing)];
                                    return (
                                        <tr className={"settings-assets-group" + (row.stage === todayStage ? " settings-stage-current" : "")} key={row.field} aria-current={row.stage === todayStage ? "true" : undefined}>
                                            <th scope="row">
                                                {row.label}
                                                <InfoNote label={row.label + " duration"} points={[row.meaning]} />
                                            </th>
                                            <td>{window[0] === "" ? "" : dayWords(window[0])}</td>
                                            <td>{window[1] === "" ? "" : dayWords(window[1])}</td>
                                            <td className="settings-number-column">
                                                <NumberCell
                                                    inputMode="numeric"
                                                    className="settings-number settings-percent"
                                                    aria-label={row.label + " duration (" + row.unit + ")"}
                                                    value={typed}
                                                    onChange={(event) => change({ stageDurations: { ...settings.stageDurations, [row.field]: limitedNumberText(event.target.value, typed, { max: row.max, decimals: 0 }) } })}
                                                />
                                            </td>
                                            <td>{row.unit}</td>
                                            <td>
                                                {typed !== fallback && (
                                                    <AddButton title={"Reset " + row.label + " to " + fallback + " " + row.unit}
                                                        onClick={() => change({ stageDurations: { ...settings.stageDurations, [row.field]: fallback } })}>
                                                        Reset
                                                    </AddButton>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="settings-section" aria-label="Pay & tax">
                    {sectionTitle("Pay & tax")}
                    {figureField("Employer on-cost coefficient", "Added to the gross salaries, for the country. It differs by country." + (legalEntity.organisation.country === "US" ? " In the United States it includes your state's unemployment insurance rate, which your state's agency gives you. Source: U.S. Department of Labor, Contacts for State UI Tax Information and Assistance, https://oui.doleta.gov/unemploy/agencies.asp" : ""), settings.onCostRate, (next) => change({ onCostRate: next }), NUMBER_LIMITS.percent, "%")}
                    {figureField("Insurance per employee", "An amount a month, for key-person and health cover.", settings.insurancePerEmployee, (next) => change({ insurancePerEmployee: next }), NUMBER_LIMITS.money)}
                </section>

                <section className="settings-section" aria-label="Assets">
                    {sectionTitle("Assets")}
                    {figureField("Capitalisation limit", "A purchase of one unit at or above it is CapEx; below it, OpEx.", settings.capitalisationLimit, (next) => change({ capitalisationLimit: limitedNumberText(next, settings.capitalisationLimit, NUMBER_LIMITS.money) }), NUMBER_LIMITS.money, orgCurrency)}
                    <div className="settings-table-wrap">
                        <table className="settings-table settings-assets-table" aria-label="Assets">
                            <colgroup>
                                <col className="settings-col-asset" />
                                <col className="settings-col-cost" />
                                <col className="settings-col-frequency" />
                                <col className="settings-col-life" />
                                <col className="settings-col-reset" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col">
                                        Asset
                                        <InfoNote
                                            label="Useful Life"
                                            fullList
                                            points={[...USEFUL_LIFE_MEANING, "A group has one useful life in years; an asset of the group can have its own under it, and an empty one takes the group's.", ...USEFUL_LIFE_SOURCES.map(source => ({ title: "Source", source }))]}
                                        />
                                    </th>
                                    <th scope="col" className="settings-number-column">{"Cost (" + orgCurrency + ")"}</th>
                                    <th scope="col">Frequency</th>
                                    <th scope="col" className="settings-number-column">Useful life (years)</th>
                                    <th scope="col">
                                        <AddButton title="Reset every group to its default years"
                                            disabled={USEFUL_LIFE_GROUPS.every(group => (settings.usefulLife[group.id] ?? "") === (DEFAULT_USEFUL_LIFE[group.id] ?? ""))}
                                            onClick={() => change({ usefulLife: { ...DEFAULT_USEFUL_LIFE } })}>
                                            Reset
                                        </AddButton>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {USEFUL_LIFE_CATEGORIES.filter(category => category.groups.some(groupId => assetsOf(groupId).length > 0)).map(category => (
                                    <Fragment key={category.id}>
                                        <tr className="settings-assets-category">
                                            <th scope="rowgroup" colSpan={5}>
                                                {category.label}
                                            </th>
                                        </tr>
                                        {category.groups.filter(groupId => assetsOf(groupId).length > 0).map(groupId => {
                                            const group = USEFUL_LIFE_GROUPS.find(entry => entry.id === groupId)!;
                                            const groupYears = settings.usefulLife[group.id] ?? "";
                                            return (
                                                <Fragment key={group.id}>
                                                    <tr className="settings-assets-group">
                                                        <th scope="row">
                                                            {group.label}
                                                            <InfoNote
                                                                label={group.label + " useful life"}
                                                                fullList
                                                                size="wide"
                                                                points={[...usefulLifePoints(group.id), ...USEFUL_LIFE_SOURCES.map(source => ({ title: "Source", source }))]}
                                                            />
                                                        </th>
                                                        <td />
                                                        <td />
                                                        <td className="settings-number-column">
                                                            <NumberCell
                                                                inputMode="decimal"
                                                                className="settings-number settings-percent"
                                                                aria-label={group.label}
                                                                value={groupYears}
                                                                onChange={(event) => change({ usefulLife: { ...settings.usefulLife, [group.id]: limitedNumberText(event.target.value, groupYears, { max: 100, decimals: 1 }) } })}
                                                            />
                                                        </td>
                                                        <td>
                                                            {groupYears !== (DEFAULT_USEFUL_LIFE[group.id] ?? "") && (
                                                                <AddButton title={"Reset " + group.label + " to " + (DEFAULT_USEFUL_LIFE[group.id] ?? "") + " years"}
                                                                    onClick={() => change({ usefulLife: { ...settings.usefulLife, [group.id]: DEFAULT_USEFUL_LIFE[group.id] ?? "" } })}>
                                                                    Reset
                                                                </AddButton>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    {assetsOf(group.id).map((slot, at) => (
                                                        <tr className="settings-assets-card" key={slot.id}>
                                                            <th scope="row">
                                                                <TextLink className="settings-asset-name" title="Open the Infrastructure & Capability page" onClick={openCardsPage}>
                                <span className="settings-asset-order">{(at + 1) + "."}</span>{slot.name.trim() || "Unnamed resource"}
                            </TextLink>
                                                            </th>
                                                            {(() => {
                                                                const [amount = "", ...rest] = costText(slot.cost, orgCurrency).split(" ");
                                                                const code = slot.cost.currency && slot.cost.currency !== orgCurrency ? " " + slot.cost.currency : "";
                                                                return (
                                                                    <>
                                                                        <td className="settings-number-column">{amount.replace(/^[^0-9-]+/, "") + (amount ? code : "")}</td>
                                                                        <td>{rest.join(" ")}</td>
                                                                    </>
                                                                );
                                                            })()}
                                                            <td className="settings-number-column">
                                                                <NumberCell
                                                                    inputMode="numeric"
                                                                    className="settings-number settings-percent"
                                                                    aria-label={(slot.name.trim() || "Resource") + " useful life in years"}
                                                                    placeholder={groupYears !== "" ? groupYears : "Years"}
                                                                    value={slot.usefulLife}
                                                                    onChange={(event) => changeSlotLife(slot.id, event.target.value.replace(/\D/g, "").slice(0, 3))}
                                                                />
                                                            </td>
                                                            <td />
                                                        </tr>
                                                    ))}
                                                </Fragment>
                                            );
                                        })}
                                    </Fragment>
                                ))}
                                {/* THE INTANGIBLE ASSETS, as the physical ones: only the groups that hold a card, each card numbered under its group with its own years. */}
                                {AMORTISATION_GROUPS.some(group => intangiblesOf(group.usedBy).length > 0) && (
                                    <tr className="settings-assets-category">
                                        <th scope="rowgroup" colSpan={5}>
                                            Intangible assets
                                            <InfoNote label="Amortisation" fullList points={[...AMORTISATION_POINTS, ...AMORTISATION_SOURCES.map(source => ({ title: "Source", source }))]} />
                                        </th>
                                    </tr>
                                )}
                                {AMORTISATION_GROUPS.filter(group => intangiblesOf(group.usedBy).length > 0).map(group => {
                                    const years = settings.amortisation[group.id] ?? "";
                                    return (
                                        <Fragment key={group.id}>
                                            <tr className="settings-assets-group">
                                                <th scope="row">
                                                    {group.label}
                                                    <InfoNote label={group.label + " amortisation"} points={[group.note]} />
                                                </th>
                                                <td />
                                                <td />
                                                <td className="settings-number-column">
                                                    <NumberCell
                                                        inputMode="decimal"
                                                        className="settings-number settings-percent"
                                                        aria-label={group.label + " amortisation in years"}
                                                        value={years}
                                                        onChange={(event) => change({ amortisation: { ...settings.amortisation, [group.id]: limitedNumberText(event.target.value, years, { max: 100, decimals: 1 }) } })}
                                                    />
                                                </td>
                                                <td>
                                                    {years !== (DEFAULT_AMORTISATION[group.id] ?? "") && (
                                                        <AddButton title={"Reset " + group.label + " to " + (DEFAULT_AMORTISATION[group.id] ?? "") + " years"}
                                                            onClick={() => change({ amortisation: { ...settings.amortisation, [group.id]: DEFAULT_AMORTISATION[group.id] ?? "" } })}>
                                                            Reset
                                                        </AddButton>
                                                    )}
                                                </td>
                                            </tr>
                                            {intangiblesOf(group.usedBy).map((slot, at) => {
                                                const [amount = "", ...rest] = costText(slot.cost, orgCurrency).split(" ");
                                                return (
                                                    <tr className="settings-assets-card" key={slot.id}>
                                                        <th scope="row">
                                                            <TextLink className="settings-asset-name" title="Open the Infrastructure & Capability page" onClick={openCardsPage}>
                                <span className="settings-asset-order">{(at + 1) + "."}</span>{slot.name.trim() || "Unnamed resource"}
                            </TextLink>
                                                        </th>
                                                        <td className="settings-number-column">{amount.replace(/^[^0-9-]+/, "")}</td>
                                                        <td>{rest.join(" ")}</td>
                                                        <td className="settings-number-column">
                                                            <NumberCell
                                                                inputMode="decimal"
                                                                className="settings-number settings-percent"
                                                                aria-label={(slot.name.trim() || "Resource") + " amortisation in years"}
                                                                placeholder={years !== "" ? years : "Years"}
                                                                value={slot.amortisationYears}
                                                                onChange={(event) => changeSlotLife(slot.id, event.target.value.replace(/\D/g, "").slice(0, 3), "amortisationYears")}
                                                            />
                                                        </td>
                                                        <td />
                                                    </tr>
                                                );
                                            })}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="settings-section" aria-label="Rates">
                    {sectionTitle("Royalties & commissions")}
                    {figureField("Royalty on sales", "The default rate; a card may set its own for its contract.", settings.royaltyRate, (next) => change({ royaltyRate: next }), NUMBER_LIMITS.percent, "%")}
                    {figureField("Affiliate network or influencer commission", "The default rate.", settings.affiliateRate, (next) => change({ affiliateRate: next }), NUMBER_LIMITS.percent, "%")}
                    {figureField("Sales agent or B2B broker commission", "The default rate.", settings.agentRate, (next) => change({ agentRate: next }), NUMBER_LIMITS.percent, "%")}
                </section>

                <section className="settings-section" aria-label="Reserve">
                    {sectionTitle("Reserve")}
                    {figureField("Startup Contingency Fund", "A share of the Total Pre-operational Budget, usually 10 to 20%. It is held when operations start. Source: NYU Entrepreneurship, The Runway Equation (2025).", settings.startupContingencyRate, (next) => change({ startupContingencyRate: next }), NUMBER_LIMITS.percent, "%")}
                    {figureField("Operational Contingency Fund", "A share of a month's OpEx, 3 to 5%, set aside each month after the launch until the target is reached. A cash set-aside, held as savings.", settings.operationalContingencyRate, (next) => change({ operationalContingencyRate: next }), NUMBER_LIMITS.percent, "%")}
                    {figureField("Target operating reserve", "Months of OpEx the Operational Contingency Fund builds up to. 3 by default; an investor may ask for 6.", settings.targetReserveMonths, (next) => change({ targetReserveMonths: next }), NUMBER_LIMITS.months, "months")}
                </section>

                <section className="settings-section" aria-label="Channel Fee Table" data-anchor="channel-fees">
                    {sectionTitle("Channel Fee Table", "What each channel takes of its sales: revenue x (commission + chargeback allowance) + the fixed fee x orders. The rows shown are your Legal Entity country's, for the providers and marketplaces your subchannels and expense cards name, and the rows you add. Edit a rate once here.")}
                    <div className="settings-table-wrap">
                        <table className="settings-table settings-fee-table" aria-label="Channel Fee Table">
                            <colgroup>
                                <col className="settings-col-channel" />
                                <col className="settings-col-figure" />
                                <col className="settings-col-figure" />
                                <col className="settings-col-figure" />
                                <col className="settings-col-note" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col">Channel</th>
                                    <th scope="col" className="settings-number-column">Commission (%)</th>
                                    <th scope="col" className="settings-number-column">Fixed fee (per order)</th>
                                    <th scope="col" className="settings-number-column">Chargeback or risk allowance (%)</th>
                                    <th scope="col">Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shownFees.map((row, index) => (
                                    <tr key={row.id} data-anchor={"channel-fee-" + row.id}>
                                        <td>
                                            <TextBox
                                                className="interview-input"
                                                aria-label={"Channel " + (index + 1)}
                                                value={row.channel}
                                                onChange={(event) => changeFee(row.id, { channel: event.target.value })}
                                            />
                                        </td>
                                        <td className="settings-number-column">{feeCell(row.id, "commission", "Channel " + (index + 1) + " commission", NUMBER_LIMITS.percent, row.commission)}</td>
                                        <td className="settings-number-column">{feeCell(row.id, "fixedFee", "Channel " + (index + 1) + " fixed fee", NUMBER_LIMITS.money, row.fixedFee)}</td>
                                        <td className="settings-number-column">{feeCell(row.id, "chargeback", "Channel " + (index + 1) + " risk allowance", NUMBER_LIMITS.percent, row.chargeback)}</td>
                                        <td>
                                            <TextBox
                                                className="interview-input"
                                                aria-label={"Channel " + (index + 1) + " note"}
                                                value={row.note}
                                                onChange={(event) => changeFee(row.id, { note: event.target.value })}
                                            />
                                        </td>
                                        {/* (No x: a row goes with its channel; owner, 2026-11-15 16:37.) */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <AddButton title="Reset the Channel Fee Table to the app's rates for your country"
                        onClick={() => setConfirmFeeReset(true)}>
                        Reset
                    </AddButton>
                    {confirmFeeReset && (
                        <div className="confirmation-overlay" onClick={() => setConfirmFeeReset(false)}>
                            <div className="confirmation-dialog" role="dialog" aria-modal="true" aria-label="Reset the Channel Fee Table" onClick={(event) => event.stopPropagation()}>
                                <h2 className="confirmation-title">Reset the Channel Fee Table?</h2>
                                <p className="confirmation-message">Your country's rows return to the app's rates. The rows you added stay as they are.</p>
                                <div className="confirmation-actions">
                                    <AddButton look="confirmation-button secondary" onClick={() => setConfirmFeeReset(false)}>
                                        Cancel
                                    </AddButton>
                                    <AddButton look="confirmation-button primary" className="confirmation-button-danger"
                                        onClick={() => {
                                            change({ channelFees: resetChannelFees(settings.channelFees, feeCountry, createGlobalSettings().channelFees) });
                                            setConfirmFeeReset(false);
                                        }}>
                                        Reset
                                    </AddButton>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

            </main>

            <AppFooter onBack={back} />

        </div>

    );

}
