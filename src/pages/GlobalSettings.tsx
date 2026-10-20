import { Fragment, useEffect, useMemo, useState } from "react";
import TextLink from "../components/interview/fields/TextLink.tsx";
import AddButton from "../components/controls/AddButton.tsx";
import RemoveButton from "../components/controls/RemoveButton.tsx";
import NumberCell from "../components/controls/NumberCell.tsx";
import TextBox from "../components/controls/TextBox.tsx";
import { useLocation, useNavigate } from "react-router-dom";

import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import { limitedNumberText, NUMBER_LIMITS, numberInputMode, type NumberLimit } from "../components/interview/fields/numberInput";
import {
    asGlobalSettings,
    capitalisationLimitOf,
    createChannelFeeRow,
    AMORTISATION_GROUPS,
    DEFAULT_AMORTISATION,
    DEFAULT_USEFUL_LIFE,
    USEFUL_LIFE_CATEGORIES,
    USEFUL_LIFE_GROUPS,
    type GlobalSettingsValue
} from "../framework/engine/GlobalSettings";
import { countryCurrency } from "../framework/engine/LegalEntityJurisdictions";
import { costText } from "../framework/engine/ExportRenderers";
import { assetUnitCost, isCostingStatus, isPurchaseGroup, type BusinessCapabilityValue, type BusinessResourceSlotValue } from "../framework/engine/AnswerUtils";
import { OrganizationService } from "../services/OrganizationService";
import { systems } from "../data/systems";
import { StorageService } from "../services/StorageService";
import { AnswerType } from "../framework/enums/AnswerType";
import { asBusinessCapabilityValue, asLegalEntityValue } from "../framework/engine/AnswerUtils";
import { asFinancialFoundationValue, costStartDates, derivedPlanStart, withPlanStart, type FinancialFoundationValue } from "../framework/engine/FinancialModel";
import FinancialPlanSettings from "../components/interview/editors/FinancialPlanSettings";
import InfoNote from "../components/interview/fields/InfoNote";
import { USEFUL_LIFE_MEANING, USEFUL_LIFE_SOURCES, usefulLifePoints } from "../framework/engine/UsefulLifeReferences";
import { SOURCES } from "../framework/engine/Sources";

/** What the amortisation of an intangible asset is, and the standards its years come from (Global Settings > Assets > Intangible assets). */
const AMORTISATION_POINTS = [
    { title: "What it is", text: "Amortisation is depreciation for an asset you cannot touch: a licence, a permit, a franchise right, software, a website, a trademark. Its cost is spread over the years it serves the business, in a straight line." },
    { title: "UK and Ireland (FRS 102)", text: "Every intangible has a finite life, estimated from evidence; where it cannot be estimated reliably, no more than 10 years." },
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
        return derivedPlanStart(openingDate, costStartDates(capability), plan?.planStart ?? withPlanStart(asFinancialFoundationValue(undefined)).planStart);
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

    const feeCell = (rowId: string, field: "commission" | "fixedFee" | "chargeback", label: string, limits: NumberLimit, value: string) => (
        <NumberCell
            inputMode={numberInputMode(limits)}
            className={"settings-number" + (limits === NUMBER_LIMITS.percent ? " settings-percent" : "")}
            aria-label={label}
            value={value}
            onChange={(event) => change({
                channelFees: settings.channelFees.map(row => row.id === rowId ? { ...row, [field]: limitedNumberText(event.target.value, value, limits) } : row)
            })}
        />
    );

    return (

        <div className="workspace review">

            <AppHeader organizationName={OrganizationService.getSummary(organizationId)?.name ?? ""} />

            <main className="review-page settings-page business-foundation business-capability">

                <h1 className="workspace-title review-title">
                    Global Settings
                    <InfoNote label="Global Settings" points={["The rates and limits the calculated lines use. Change one here and every line that uses it follows."]} />
                </h1>

                {plan && (
                    <section className="settings-section" aria-label="Financial plan">
                        {sectionTitle("Financial plan")}
                        <FinancialPlanSettings
                            value={plan}
                            legalEntity={legalEntity}
                            openingDate={settings.openingDate}
                            planStart={planStartFor(settings.openingDate)}
                            onChange={changePlan}
                            onChangeOpeningDate={(iso) => {
                                change({ openingDate: iso });
                                // (The plan's first month follows the Opening Date.)
                                changePlan({ ...plan, planStart: planStartFor(iso) });
                            }}
                        />
                    </section>
                )}

                <section className="settings-section" aria-label="Pay and tax">
                    {sectionTitle("Pay and tax")}
                    {figureField("Employer on-cost coefficient", "Added to the gross salaries, for the country. It differs by country.", settings.onCostRate, (next) => change({ onCostRate: next }), NUMBER_LIMITS.percent, "%")}
                    {figureField("Insurance per employee", "An amount a month, for key-person and health cover.", settings.insurancePerEmployee, (next) => change({ insurancePerEmployee: next }), NUMBER_LIMITS.money)}
                    {figureField("Corporate income tax rate", "A rate on net profit.", settings.incomeTaxRate, (next) => change({ incomeTaxRate: next }), NUMBER_LIMITS.percent, "%")}
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
                                        <AddButton className="settings-reset" title="Reset every group to its default years"
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
                                                                <AddButton className="settings-reset" title={"Reset " + group.label + " to " + (DEFAULT_USEFUL_LIFE[group.id] ?? "") + " years"}
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
                                                        <AddButton className="settings-reset" title={"Reset " + group.label + " to " + (DEFAULT_AMORTISATION[group.id] ?? "") + " years"}
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
                    {sectionTitle("Royalties and commissions")}
                    {figureField("Royalty on sales", "The default rate; a card may set its own for its contract.", settings.royaltyRate, (next) => change({ royaltyRate: next }), NUMBER_LIMITS.percent, "%")}
                    {figureField("Affiliate network or influencer commission", "The default rate.", settings.affiliateRate, (next) => change({ affiliateRate: next }), NUMBER_LIMITS.percent, "%")}
                    {figureField("Sales agent or B2B broker commission", "The default rate.", settings.agentRate, (next) => change({ agentRate: next }), NUMBER_LIMITS.percent, "%")}
                </section>

                <section className="settings-section" aria-label="Reserve">
                    {sectionTitle("Reserve")}
                    {figureField("Startup Contingency Fund", "A share of the Total Pre-operational Budget, 10 to 15%. It is held when operations start.", settings.startupContingencyRate, (next) => change({ startupContingencyRate: next }), NUMBER_LIMITS.percent, "%")}
                    {figureField("Operational Contingency Fund", "A share of a month's OpEx, 3 to 5%, set aside each month after the launch until the target is reached. A cash set-aside, not an expense.", settings.operationalContingencyRate, (next) => change({ operationalContingencyRate: next }), NUMBER_LIMITS.percent, "%")}
                    {figureField("Target operating reserve", "Months of OpEx the Operational Contingency Fund builds up to. 3 by default; an investor may ask for 6.", settings.targetReserveMonths, (next) => change({ targetReserveMonths: next }), NUMBER_LIMITS.months, "months")}
                </section>

                <section className="settings-section" aria-label="Channel Fee Table">
                    {sectionTitle("Channel Fee Table", "What each channel takes of its sales: revenue x (commission + chargeback allowance) + the fixed fee x orders. The rates are examples; edit them once here.")}
                    <div className="settings-table-wrap">
                        <table className="settings-table settings-fee-table" aria-label="Channel Fee Table">
                            <colgroup>
                                <col className="settings-col-channel" />
                                <col className="settings-col-figure" />
                                <col className="settings-col-figure" />
                                <col className="settings-col-figure" />
                                <col className="settings-col-note" />
                                <col className="settings-col-remove" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col">Channel</th>
                                    <th scope="col" className="settings-number-column">Commission (%)</th>
                                    <th scope="col" className="settings-number-column">Fixed fee (per order)</th>
                                    <th scope="col" className="settings-number-column">Chargeback or risk allowance (%)</th>
                                    <th scope="col">Note</th>
                                    <th scope="col"><span className="settings-visually-hidden">Remove</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {settings.channelFees.map((row, index) => (
                                    <tr key={row.id}>
                                        <td>
                                            <TextBox
                                                className="interview-input"
                                                aria-label={"Channel " + (index + 1)}
                                                value={row.channel}
                                                onChange={(event) => change({ channelFees: settings.channelFees.map(entry => entry.id === row.id ? { ...entry, channel: event.target.value } : entry) })}
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
                                                onChange={(event) => change({ channelFees: settings.channelFees.map(entry => entry.id === row.id ? { ...entry, note: event.target.value } : entry) })}
                                            />
                                        </td>
                                        <td>
                                            <RemoveButton
                                                aria-label={"Remove channel " + (index + 1)}
                                                onClick={() => change({ channelFees: settings.channelFees.filter(entry => entry.id !== row.id) })} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <AddButton
                        onClick={() => change({ channelFees: [...settings.channelFees, createChannelFeeRow()] })}>
                        + Add channel
                    </AddButton>
                </section>

            </main>

            <AppFooter onBack={back} />

        </div>

    );

}
