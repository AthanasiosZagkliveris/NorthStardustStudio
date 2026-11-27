import { randomId } from "../framework/engine/answers/Readers.ts";
import { EMPTY_MONTH, type CostGroup, type OwnCostValue } from "../framework/engine/financial/FinancialModel.ts";

/**
 * A blank own cost of a group, every field empty: the start of a cost in the financial tests (moved here from stored.ts on 2026-11-27, owner's yes: the
 * app makes its costs elsewhere, so only the tests used it).
 */
export function createOwnCost(group: CostGroup | "" = ""): OwnCostValue {
    return {
        id: randomId("cost"),
        name: "",
        amount: "",
        frequency: "",
        frequencyOther: "",
        description: "",
        group,
        behaviour: "",
        offeringId: "",
        month: { ...EMPTY_MONTH },
        fixedPart: "",
        variablePerUnit: "",
        asset: ""
    };
}
