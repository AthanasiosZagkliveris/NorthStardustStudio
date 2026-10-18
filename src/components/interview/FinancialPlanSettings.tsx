import {
    INCOME_TAX_BASES,
    PLAN_YEAR_CHOICES,
    effectiveVatBasis,
    planMonthLabel,
    planYears,
    vatBases,
    type FinancialFoundationValue
} from "../../framework/engine/FinancialModel.ts";
import FieldLabel from "../FieldLabel.tsx";
import type { LegalEntityValue, StrategyMonthValue } from "../../framework/engine/AnswerUtils.ts";
import { jurisdictionProfile } from "../../framework/engine/LegalEntityJurisdictions.ts";

import DateCellInput, { isoToDisplay } from "./DateCellInput.tsx";
import { PreferencesService } from "../../services/PreferencesService.ts";
import InfoNote from "./InfoNote.tsx";
import { NUMBER_LIMITS, limitedNumberText, numberInputMode } from "./numberInput.ts";
import OptionPicker from "./OptionPicker.tsx";

/**
 * THE FINANCIAL PLAN'S OWN SETTINGS (they were the box above the Costs on 4. Financial Foundation, and are kept in the same answer): where the plan starts
 * and how long it runs, the day the business opens, whether amounts include the country's consumption tax, and how income tax is treated. Shown on the
 * Global Settings screen in its own rows (settings-field: the label, the control, what it means).
 */
export default function FinancialPlanSettings({
    value,
    legalEntity,
    openingDate,
    planStart,
    onChange,
    onChangeOpeningDate
}: {
    value: FinancialFoundationValue;
    legalEntity: LegalEntityValue;
    openingDate: string;
    /** The plan's first month, worked out from the Opening Date and the costs (derivedPlanStart): shown, never typed. */
    planStart: StrategyMonthValue;
    onChange: (next: FinancialFoundationValue) => void;
    onChangeOpeningDate: (iso: string) => void;
}) {

    const update = (patch: Partial<FinancialFoundationValue>) => onChange({ ...value, ...patch });

    // The country's own consumption tax: VAT, GST, Sales Tax.
    const taxName = jurisdictionProfile(legalEntity.organisation.country).consumptionTax.split(" (")[0];
    const taxBases = vatBases(taxName);
    const years = planYears(value);
    const registered = legalEntity.tax.consumptionTaxStatus === "yes";

    const row = (label: string, hint: string[], control: React.ReactNode, alarm = "") => (
        <div className="settings-field">
            <FieldLabel className="settings-label">
                {label}
                <InfoNote label={label} points={hint} />
            </FieldLabel>
            <span className="settings-control">{control}</span>
            <span className={"settings-hint" + (alarm ? " settings-alarm" : "")} role={alarm ? "alert" : undefined}>{alarm}</span>
        </div>
    );

    return (
        <>

            {row(
                "Plan Start",
                [
                    "Month 1 of the financial plan. Every timeline on the Financial Foundation and on Sustainability runs from it.",
                    "Worked out: the earlier of the Opening Date's month and the month of your earliest costed card. A cost dated before it counts as already paid."
                ],
                <span>{planMonthLabel(planStart, 1)}</span>
            )}

            {row(
                "Opening Date",
                [
                    "The day the business opens and issues its first receipt. The days from Plan Start to the day before it are the pre-operational period.",
                    "Every cost is split around it by its own dates: what is dated before it counts in the Total Pre-operational Budget."
                ],
                <DateCellInput ariaLabel="Opening Date" value={openingDate} onChange={onChangeOpeningDate} />,
                // (A business cannot open before the company exists.)
                openingDate !== "" && legalEntity.formation.date !== "" && legalEntity.formation.status !== "planned" && openingDate < legalEntity.formation.date ? "The Opening Date is before the company was formed (" + isoToDisplay(legalEntity.formation.date, PreferencesService.getDateFormat()) + ")." : ""
            )}

            {row(
                "Plan Length",
                ["How far ahead the plan looks. Lenders usually ask for the first year month by month and a profit and loss forecast for three years."],
                <OptionPicker
                    label="Plan length"
                    placeholder="Select"
                    options={PLAN_YEAR_CHOICES.map(count => count + (count === 1 ? " year" : " years"))}
                    value={years + (years === 1 ? " year" : " years")}
                    onChange={(next) => update({ planYears: String(parseInt(next, 10) || "") })}
                />
            )}

            {row(
                "Amounts",
                [...taxBases.map(entry => entry.label + ": " + entry.explanation), "Use the same basis for every amount on the Financial Foundation and on Sustainability.", "Whether the company is registered is answered once, on the Legal Entity (Tax & business registration)."],
                registered
                    ? (
                        <OptionPicker
                            label={"Amounts include or exclude " + taxName}
                            placeholder="Select"
                            options={taxBases.filter(entry => entry.id !== "not-registered").map(entry => entry.label)}
                            value={taxBases.find(entry => entry.id === effectiveVatBasis(value, legalEntity))?.label ?? ""}
                            onChange={(next) => update({ vatBasis: taxBases.find(entry => entry.label === next)?.id ?? "" })}
                        />
                    )
                    : <span>Not registered: there is no {taxName} to add or reclaim.</span>,
                registered ? "" : "Set under Tax & business registration on the Legal Entity."
            )}

            {row(
                "Income Tax",
                ["Income tax on profit. Pass-through businesses (e.g. most sole traders and single-member LLCs) pay it personally, not at business level. For a company, enter the corporate rate; ask your accountant."],
                <>
                    <OptionPicker
                        label="Income tax"
                        placeholder="Select"
                        options={INCOME_TAX_BASES.map(entry => entry.label)}
                        value={INCOME_TAX_BASES.find(entry => entry.id === value.incomeTax)?.label ?? ""}
                        onChange={(next) => update({ incomeTax: INCOME_TAX_BASES.find(entry => entry.label === next)?.id ?? "" })}
                    />
                    {value.incomeTax === "rate" && (
                        <>
                            <input
                                type="text"
                                inputMode={numberInputMode(NUMBER_LIMITS.percent)}
                                className="interview-input settings-number settings-percent"
                                aria-label="Tax rate (%)"
                                placeholder="25"
                                value={value.incomeTaxRate}
                                onChange={(event) => update({ incomeTaxRate: limitedNumberText(event.target.value, value.incomeTaxRate, NUMBER_LIMITS.percent) })}
                            />
                            <span className="settings-unit">%</span>
                        </>
                    )}
                </>
            )}

        </>
    );

}
