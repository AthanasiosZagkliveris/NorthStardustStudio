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
    docs/specifications/03-business-system/06-costs-funding-and-position.md
    docs/specifications/03-business-system/05-revenue-and-pricing.md

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

export * from "./period.ts";
export * from "./lists.ts";
export * from "./stored.ts";
export * from "./costs.ts";
export * from "./natures.ts";
export * from "./funding.ts";
export * from "./position.ts";
export * from "./revenueStored.ts";
export * from "./revenue.ts";
export * from "./breakEven.ts";
export * from "./presenting.ts";
export * from "./offeringCosts.ts";
export * from "./offeringEconomics.ts";
export * from "./expectedSales.ts";
export * from "./stressTest.ts";
export * from "./whatItWouldTake.ts";
