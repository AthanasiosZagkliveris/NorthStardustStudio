import { AnswerType } from "../enums/AnswerType.ts";
import {
    BRAND_INVENTORY_SECTIONS,
    BRAND_STYLE_SECTIONS,
    BUSINESS_CAPABILITY_SECTIONS,
    BUSINESS_ENGAGEMENT_SECTIONS,
    BUSINESS_FOUNDATION_SUBSECTIONS,
    brandInventorySectionsEmpty,
    brandStyleSectionsEmpty,
    businessCapabilitySectionsEmpty,
    businessEngagementSectionsEmpty,
    businessFoundationSubsectionsEmpty,
    LEGAL_ENTITY_SECTIONS,
    legalEntitySectionsEmpty,
    STRATEGY_FOUNDATION_SECTIONS,
    strategyFoundationSectionsEmpty
} from "./AnswerUtils.ts";
import {
    FINANCIAL_FOUNDATION_SECTIONS,
    FINANCIAL_SUSTAINABILITY_SECTIONS,
    financialFoundationSectionsEmpty,
    financialSustainabilitySectionsEmpty
} from "./FinancialModel.ts";

/**
 * The bespoke pages' own sections, in page order: their titles (whose
 * segments are their rail ids and keys, see FieldKeys.sectionSegment)
 * and which of them still miss a required answer -- the rule the
 * validator reports them by. Read wherever a page is judged section
 * by section: the validator (a section marked "Doesn't apply" counts
 * as answered) and the section statuses.
 */
export const BESPOKE_SECTIONS: Partial<Record<AnswerType, {
    titles: readonly string[];
    empty: (value: unknown) => boolean[];
}>> = {
    [AnswerType.LegalEntity]: { titles: LEGAL_ENTITY_SECTIONS, empty: legalEntitySectionsEmpty },
    [AnswerType.BrandStyle]: { titles: BRAND_STYLE_SECTIONS, empty: brandStyleSectionsEmpty },
    [AnswerType.BrandInventory]: { titles: BRAND_INVENTORY_SECTIONS, empty: brandInventorySectionsEmpty },
    [AnswerType.BusinessFoundation]: { titles: BUSINESS_FOUNDATION_SUBSECTIONS, empty: businessFoundationSubsectionsEmpty },
    [AnswerType.BusinessEngagement]: { titles: BUSINESS_ENGAGEMENT_SECTIONS, empty: businessEngagementSectionsEmpty },
    [AnswerType.BusinessCapability]: { titles: BUSINESS_CAPABILITY_SECTIONS, empty: businessCapabilitySectionsEmpty },
    [AnswerType.FinancialFoundation]: { titles: FINANCIAL_FOUNDATION_SECTIONS, empty: financialFoundationSectionsEmpty },
    [AnswerType.FinancialSustainability]: { titles: FINANCIAL_SUSTAINABILITY_SECTIONS, empty: financialSustainabilitySectionsEmpty },
    [AnswerType.StrategyFoundation]: { titles: STRATEGY_FOUNDATION_SECTIONS, empty: strategyFoundationSectionsEmpty }
};
