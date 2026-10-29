# 3. Business System — the pages and their specifications

Status: **index**, rewritten 2026-10-29. The five pages of the Business System (System 3 of the Foundation), the file that specifies each, the editor and the data module that build it, and what crosses between the pages.

The pages are numbered 1 to 5 as the app numbers them. Each file holds the requirement as the owner wrote it and, where the app does it differently, an **As built** section that wins. The layout of the pages (tiles, cards, measures) is not specified here: it is the rulebook's (`ai/layout-rules.md`), and the page of Customer Engagement has its own (`ai/customer-engagement-layout.md`). The open requirements for the pages are in document 5, section 5.5; this folder says what the pages do, that one what they could do.

## The pages

| Page | Title | Specification | Editor | Data and calculations (`src/framework/engine/`) |
|---|---|---|---|---|
| 1 | Foundation | `page-1-foundation.md` | `BusinessFoundationEditor` | `AnswerBusinessFoundation.ts` |
| 2 | Customer Engagement | `page-2-section-1-channels.md` (section 1), `page-2-section-2-customer-relationships.md` (section 2), `page-2-section-2-customer-relationships-worked-example.md` (an example and column rules of section 2) | `BusinessEngagementEditor` | `AnswerBusinessFoundation.ts`, `DemandCapacity.ts` |
| 3 | Infrastructure & Capability | `page-3-infrastructure-and-capability.md` | `BusinessCapabilityEditor` | `AnswerBusinessCapability.ts`, `CardCompleteness.ts` |
| 4 | Financial Foundation | `page-4-financial-foundation.md` | `FinancialFoundationEditor` | `FinancialModel.ts` |
| 5 | Financial Sustainability | `page-5-financial-sustainability.md` | `FinancialSustainabilityEditor` | `FinancialModel.ts` |

The editors are in `src/components/interview/editors/`. Each page is one Structure of the System's content (`src/assets/SystemAnswers/03_BusinessSystemAnswer.md`: Foundation, Customer Engagement, Infrastructure & Capability, Financial Foundation, Sustainability), so each is one editor, not a `MultiPart` of columns. The System is answered before the Strategy System: a founder describes the business before choosing a strategy for it.

Page 2 has three parts in the app, and only two are specified here: **1. Customer Channel** and **2. Customer Relationship**. The third, **Demand & Conversion** (for each Offering, how its customers come, and so the expected sales), is described in document 28, 7.5 and laid out in `ai/customer-engagement-layout.md`; Page 5 reads its figures.

## What crosses between the pages

1. **Offerings** are defined on Page 1 and referenced, by id and never copied, by Page 2 (channels and relationships), Page 3 (every card of Offering's Capability is linked to Offerings), Page 4 (Offering costs) and Page 5 (revenue streams). The pages read Page 1's value directly; `dynamicSource` is not used for this, as it reads only Card List cards and Table columns.
2. **Journey Stages** are the same five on both sections of Page 2: Discover (stored as `discovery`), Evaluation, Purchase, Delivery, Support & Follow Up.
3. **Page 3's cards link to one another by id** (a resource to the activity it needs and to its partner or supplier; an activity to its performers and resources). **Page 3's costs are read by Page 4**, and the channel expenses of Page 2 create cards on Page 3.
4. **Page 5 reads Page 4** for the cost behaviour and the financial position, Page 1 for the Offerings and Page 3 for the capacity.
5. **The Legal Entity feeds Page 4's costs** (its expenses and its founders), and **its country sets the currency** of Page 3's prices and of every total: the two cross-System reads. The currency is resolved in `Conversation.tsx` (`organisationCurrency`) and handed down.
6. **The Opening Date** (Identity, Organization tile) and the **Global Settings** (`/settings`) feed Pages 3 to 5; the plan's start month is worked out, never typed (Page 4, "As built").

## The original nine pages, retired

The Business System's content used to hold nine further pages (Business Plan, Business Model, Revenue Model, Revenue Matrix, Product Register, Customer Profiles, Competitor Analysis, Pricing Strategy, Revenue Roadmap). They were removed when the five pages were built, and the System is exactly Sections 1 to 5. `StorageService.retireLegacyBusinessPages` runs once per Organization (flag `legacyBusinessPagesRetired`): it moves whatever was answered on Sections 6 to 14 out of the Business System into the Organization's `retiredBusinessResponses`, set aside rather than deleted, so no page later given one of those numbers can open showing them, and it puts a reader last seen on one of them on Page 5. Anything that finds one of these pages must find it **by title or Answer Structure, never by number**; the shared Product Register binding in `Conversation.tsx` binds only the Product Development System's Register.

**Open dependency.** The Finance System's `Dynamic Field (Business System / Revenue Model: Revenue Stream)` points at the retired Revenue Model page, so its Revenue Stream dropdown offers nothing (a missing source resolves to no options, not an error). Page 5's revenue streams are its natural successor, but `dynamicSource` reads only Card List cards and Table columns, so pointing it there means extending `dynamicSource` to read a bespoke editor's value.
