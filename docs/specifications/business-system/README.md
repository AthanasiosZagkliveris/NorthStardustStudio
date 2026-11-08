# 3. Business System — the pages and their specifications

Status: **index**, written 2026-09-27, updated 2026-11-09. The five pages of the Business System (System 3 of the Foundation), the file that specifies each, the editor and the data module that build it, and what crosses between the pages.

The pages are numbered 1 to 5 as the app numbers them. Page 1's questions (the Segment's, the Profile's, the Competitor's, the Value Proposition's and the Offering's) are kept in docs 35, 36, 41, 42 and 43 (`design/questionnaire/`), not here. Each file holds the requirement as the owner wrote it and, where the app does it differently, an **As built** section that wins. The layout of the pages (tiles, cards, measures) is not specified here: it is the rulebook's (`ai/layout-rules.md`), and the page of Customer Engagement has its own (`ai/customer-engagement-layout.md`). The open requirements for the pages are in document 5, section 5.5; this folder says what the pages do, that one what they could do.

## The pages

| Page | Title | Specification | Editor | Data and calculations (`src/framework/engine/`) |
|---|---|---|---|---|
| 1 | Foundation | `page-1-foundation.md` | `BusinessFoundationEditor` | `AnswerBusinessFoundation.ts` |
| 2 | Customer Engagement | `page-2-section-1-channels.md` (section 1), `page-2-section-2-customer-relationships.md` (section 2, with a worked example in section 18) | `BusinessEngagementEditor` | `AnswerBusinessFoundation.ts`, `DemandCapacity.ts` |
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
5. **The Legal Entity feeds Page 4's costs** (its expenses and its founders), and **its country sets the currency** of Page 3's prices and of every total: the two cross-System reads. The currency is resolved in `src/pages/Conversation.tsx` (`organisationCurrency`) and handed down.
6. **The Opening Date** (Identity, Organisation tile) and the **Global Settings** (`/settings`) feed Pages 3 to 5; the plan's start month is worked out, never typed (Page 4, "As built").

### What each later page reads from Page 1 (owner, 2026-11-08)

The one owner of this map: each row is one input a later page needs, where Page 1 asks it, and its status. **Read**: the later page reads the Page 1 answer. **Starts from**: the later page starts its own field from the Page 1 answer (the starts, below). **Asked, not read**: Page 1 asks it but the later page does not read it (it may ask again). **Missing**: no question asks it. The questions' own "Comes from / Read by" lines in docs 35, 36, 41 and 43 link here for what concerns Pages 2 to 5; this table is by later page. No question is added here.

| Later page | Input it needs | Page 1 question | Status |
|---|---|---|---|
| 2. Channels | The Segments and Offerings (ids, names) | Segment, Offering cards (names) | Read |
| 2. Channels | Segment, Profile, Offering reference columns | The boxes' Notes | Read (Notes only); the choice answers (doc 35 `reach`, `setting`, `pay`, `discover`; doc 36 A to D; doc 43 O6, O7, O14 to O17): asked, not read |
| 2. Channels | Journey-stage proposals (doc 28, 7.4) | doc 35 `discover`, `setting`, `pay`; doc 36 D1; doc 43 O6, O7 | Asked, not read |
| 2. Channels | Channel order (comfort, reach, industry) | doc 35 Box 4 Q1, Box 2 Q1, Box 3 Q4 | Asked, not read |
| 2. Channels | Physical Delivery and Retail & Wholesale hidden without a physical item (doc 28, 11.7) | Offering Type; doc 43 O1 | Asked, not read |
| 2. Relationships | Which Profiles each Offering serves | doc 43 Functional Needs Addressed (by need id) | Read |
| 2. Relationships | Relationship type suggestion | doc 36 D2; doc 43 O7 | Asked, not read |
| 2. Demand & Conversion | Customers Buy, one sale at a time or every month (doc 28, 7.5) | doc 43 O3 | Starts from |
| 2. Demand & Conversion | The tender row | doc 35 Box 4 Q9 (`authorise`), Box 3 Q1 | Asked, not read |
| 2. Demand & Conversion | Expected customers against the market size | doc 35 Box 5 Q1 | Asked, not read |
| 3. Delivery | The Offerings | Offering card | Read |
| 3. Delivery | Delivered, per unit or every month (doc 28, 10.1) | doc 43 O3 | Starts from |
| 3. Delivery | Calendar Time (weeks) | doc 43 O15 | Starts from |
| 3. Delivery | Constraints (what the customer provides) | doc 43 O10 | Starts from (the text; W3's ticks, doc 28, 10.1, are not built) |
| 3. Capacity and resources | Every card linked to an Offering | Offering card (ids) | Read |
| 3. Capacity and resources | Delivery vehicles, stock and logistics hidden without a physical item (doc 28, 11.7) | Offering Type; doc 43 O1 | Read (below) |
| 4. Financial Foundation | Each Offering's costs | Offering card (ids) | Read |
| 4. Financial Foundation | Stock, cost of goods and shipping lines | none of its own | Page 4 has no such line of its own: they are the costs of Page 3's cards, so they follow what Page 3 shows |
| 5. Revenue streams | One stream per Offering | Offering card (ids) | Read |
| 5. Pricing | Charged (the revenue model is read from it, doc 28, 10.2) | doc 43 O3 | Starts from |
| 5. Pricing | Payment Timing | doc 43 O3, second row (O3b) | Starts from |
| 5. Pricing | Packages or tiers | doc 43 O14 | Asked, not read |
| 5. Pricing | The price; the pricing basis; whether the price includes tax | none | Missing on Page 1 by design (doc 28, 10.2): Page 5 asks the price; the basis and tax are asked nowhere |

**The starts** (`offeringStarts`, `src/framework/engine/EffectiveAnswers.ts`, which reads the Offering's answers as its card shows them). A later page shows them on an Offering's card it has not saved yet, and saves them with the first thing written on that card; from then on the later page's own answer wins and a change on Page 1 no longer moves it. A card not saved holds no figures, so a start never changes a calculation by itself. The starts narrow nothing: every option of the later field stays.

| Page 1 answer (O3) | Customers Buy (Page 2) | Delivered (Page 3) | Charged (Page 5) |
|---|---|---|---|
| One purchase; Per session / per hour; Rent / hire; Commission on each sale | One sale at a time | Per unit | Per sale |
| A project or contract | One sale at a time | Per unit | Per project |
| A subscription / membership; A monthly retainer; Pay as they go | Every month, until they cancel | Every month | Monthly |
| A licence | Every month, until they cancel | Every month | Annually |
| Free to them, or no answer | no start | no start | no start |

- **Calendar Time** (Page 3, weeks, for an Offering delivered per unit) from O15, the band's upper end: Within a week → 1; One to four weeks → 4; One to three months → 13; Straight away and Longer start nothing.
- **Constraints** (Page 3) from O10: the options ticked, in their words, joined by semicolons ("Access to their systems or information; A clear brief.").
- **Payment Timing** (Page 5) from O3b: Before they get it → Upfront; A deposit, then the rest → Split; When it is done / delivered → On completion; On invoice terms → On completion (the months after are the user's); In instalments / monthly → Milestones where the charge is paid once, and When earned (the default, so no start) where it is monthly or annual.
- Doc 28, 10.2 proposed Per sale for Pay as they go; it is Monthly here, as Page 2's start makes it a monthly purchase, so the two pages agree.

**Without a physical item** (doc 28, 11.7; `noPhysicalOffering`): when Page 1 has Offerings and none has a physical item (each one's Type is Service, or its form, O1, is A digital file, An app / online tool, Online access, A live online session, Project work or An ongoing service), Page 3 hides, in the Offering's Capability, the Vehicles category (Delivery Vehicles, Delivery Running Costs) and the Materials & Inventory category (Materials & Stock) from the Resources and from a card's Category list, and Logistics & Fulfilment from the Partners & Suppliers' groups and their "i". Each is hidden only while it holds no card, so no cost is ever hidden; nothing is deleted, and each shows again when an Offering's Type or form changes. An Offering with no Type or form yet counts as possibly physical.

**Required today** (`OpenItems.ts`): one named Segment with a named Profile, one named Competitor and one named Offering (in any Segment), and the Value Proposition text of each named Segment. Once those are there, each named Segment with no named Offering and no named competitor of its own is an open item, and so is each Offering with no Type ("Type: not chosen yet") or no O3 answer ("the terms they pay on: not chosen yet"), as the later pages read them. No question on a Page 1 card is otherwise required, and no card marks a field as required. The required answers of doc 28, 6.9 are undecided. Gap left for the owner: the Functional Needs Addressed are read later but not required.

## Section numbers past 5 are retired

The System is exactly Sections 1 to 5. Answers keyed to Sections 6 to 14 (the nine pages of an earlier version: Business Plan, Business Model, Revenue Model, Revenue Matrix, Product Register, Customer Profiles, Competitor Analysis, Pricing Strategy, Revenue Roadmap) are not shown by any page. `StorageService.retireLegacyBusinessPages` runs once per Organisation (flag `legacyBusinessPagesRetired`): it moves whatever was answered on those Sections out of the Business System into the Organisation's `retiredBusinessResponses`, set aside rather than deleted, so no page later given one of those numbers can open showing them, and it puts a reader last seen on one of them on Page 5. Anything that looks for one of these pages must find it **by title or Answer Structure, never by number**; the shared Product Register binding in `src/pages/Conversation.tsx` binds only the Product Development System's Register.

**Open dependency.** The Finance System's `Dynamic Field (Business System / Revenue Model: Revenue Stream)` points at the retired Revenue Model page, so its Revenue Stream dropdown offers nothing (a missing source resolves to no options, not an error). Page 5's revenue streams are its natural successor, but `dynamicSource` reads only Card List cards and Table columns, so pointing it there means extending `dynamicSource` to read a bespoke editor's value.
