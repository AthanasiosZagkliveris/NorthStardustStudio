/*
    The Business System's two Financial pages -- Page 4, Financial
    Foundation, and Page 5, Sustainability -- as data and
    as arithmetic.

    Kept apart from AnswerUtils because most of it is CALCULATION,
    not answer handling: a month-by-month cash model, a loan
    repayment schedule and a break-even analysis. Pure functions of
    plain values, so the whole of it can be tested without drawing a
    page.

    Everything else it reads -- the Legal Entity, Page 1's Offerings,
    Page 3's costs -- arrives already normalised, so this file only
    imports TYPES from AnswerUtils and the two never depend on each
    other at load time.

    Specifications:
    docs/specifications/business-system/page-4-financial-foundation.md
    docs/specifications/business-system/page-5-financial-sustainability.md

    Two decisions the specifications leave open, settled with the
    product owner:

    1. TIME. Page 4 asks once for the month the plan starts; that is
       Month 1, and the model runs MODEL_MONTHS months from it, shown over the plan's chosen length (planLength). Every
       date on both pages is a month picked within it.
    2. CURRENCY. Every total is in the organisation's currency (the
       one its Legal Entity country uses). A cost priced in another
       currency is listed, flagged, and left OUT of every total --
       there are no exchange rates here to convert it with.
*/

/* (Split by its sections into financial/, one file each -- the same code: every name it exported is exported here as before, so every import of
   FinancialModel.ts stands unchanged.) */

export * from "./financial/period.ts";
export * from "./financial/lists.ts";
export * from "./financial/stored.ts";
export * from "./financial/costs.ts";
export * from "./financial/natures.ts";
export * from "./financial/funding.ts";
export * from "./financial/position.ts";
export * from "./financial/revenueStored.ts";
export * from "./financial/revenue.ts";
export * from "./financial/breakEven.ts";
export * from "./financial/presenting.ts";
export * from "./financial/offeringCosts.ts";
export * from "./financial/expectedSales.ts";
export * from "./financial/stressTest.ts";
export * from "./financial/whatItWouldTake.ts";
