import {
    asLegalEntityValue,
    type BusinessCapabilityValue,
    type LegalEntityExpenseValue,
    type LegalEntityFounderValue
} from "./AnswerUtils.ts";
import { costSourcesFor } from "./ExportRenderers.ts";
import {
    COST_BEHAVIOURS,
    COST_NATURE_LABELS,
    assetUnitCostsOf,
    consolidateCosts,
    natureSplitOf,
    withPlanStart,
    derivedPlanStart,
    legalExpenseDates,
    costStartDates,
    type CostNature,
    type FinancialFoundationValue
} from "./FinancialModel.ts";
import { capitalisationLimitOf, createGlobalSettings, type GlobalSettingsValue } from "./GlobalSettings.ts";
import { countedCapability } from "./CardCompleteness.ts";

/** What the Inventory's Cost Nature and Behaviour columns say of one card. */
export interface InventoryClassification {
    nature: string;
    behaviour: string;
}

/**
 * THE COST NATURE AND BEHAVIOUR OF EACH CARD, as the Financial Foundation works them out (rules C1 to C16): by the id of the card. A card that is not
 * counted (it lacks an answer, or is in another currency) or has no cost has none. A cost that starts before the opening and runs past it says both
 * ("Startup Expense, then OpEx").
 */
export function inventoryClassification(
    capability: BusinessCapabilityValue,
    founders: readonly LegalEntityFounderValue[],
    expenses: readonly LegalEntityExpenseValue[],
    financial: FinancialFoundationValue,
    currency: string,
    openingDate: string,
    settings: GlobalSettingsValue = createGlobalSettings()
): Map<string, InventoryClassification> {
    const result = new Map<string, InventoryClassification>();
    const counted = countedCapability(capability);
    const legalEntity = { ...asLegalEntityValue(undefined), founders: [...founders], expenses: [...expenses] };
    const page = withPlanStart(financial, undefined, derivedPlanStart(openingDate, [...costStartDates(counted), ...legalExpenseDates(legalEntity)], withPlanStart(financial).planStart));
    const lines = consolidateCosts(page, costSourcesFor(legalEntity, counted, currency));
    const context = { openingDate, capitalisationLimit: capitalisationLimitOf(settings), assetUnitCosts: assetUnitCostsOf(counted) };
    lines.forEach(line => {
        if (result.has(line.id) || !line.counted) {
            return;
        }
        const split = natureSplitOf(line, context, (page.classified[line.id]?.nature || "") as CostNature | "");
        const label = (nature: CostNature) => COST_NATURE_LABELS[nature];
        const nature = split.before && split.after
            ? label(split.before.nature) + ", then " + label(split.after)
            : split.after ? label(split.after) : split.before ? label(split.before.nature) : "";
        result.set(line.id, { nature, behaviour: COST_BEHAVIOURS.find(entry => entry.id === line.behaviour)?.label ?? "" });
    });
    return result;
}
