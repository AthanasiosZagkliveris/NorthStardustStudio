# 27. Questionnaire plan: from a few answers to a ready-made first draft

Status: **proposal**, written 2026-10-23. Nothing is built. This is the plan: the goal, the order, what the user gets at each stage, what was cut and why, and what the owner must decide. The detail (every list with examples, the industry list in two levels, every question and option, the connection map and its evidence, the sources) is in document 28, `28-questionnaire-specification.md`; the sources are in `02-references.md`, section 2.7.

## 1. The goal, and the one test

The app is for startups and small teams in the UK, USA, Canada, Australia, Ireland and New Zealand. A founder should not have to build the business model by hand: a few clear choices should give a **ready-made first draft** of the Segment, the Profile, the channels at every stage, the relationships, the demand rows, the value proposition, the skills needed and the brand starting points, which the founder then confirms and corrects.

So every question must pass **one test: does its answer save the founder work?**

- **Driver**: the answer produces a proposal (it pre-fills a field, proposes a card or a channel, drafts a text, or narrows a later list). These are built first.
- **Check**: the answer only raises a Review item or an evidence line. Built after the drivers.
- **Note**: nothing reads the answer. It is not asked; it stays as the optional note.

Specific information (an age, an education, an income, a device) is asked **to connect it with the next part** (the channels, the payments, the help the customer wants), not to place it in a category. Where the evidence does not support a connection, the app does not make it (document 28, 11.6).

## 2. The funnel

| Step | What the user answers | What the app proposes in return |
|---|---|---|
| **1. Identity** (Description, Positioning, Vision and Values tiles; free text stays) | What kind of work you do (two levels, with examples); where you are; what you compete on | The industry pack (example Segment, Offering, skill areas, resource groups, Discover channels); the country's activity code; a draft Description and Positioning sentence |
| **2. Segment** (a narrow group: a range or one value, never "tick all") | Who you sell to and where; the age range (finer below 18); the education range; the household income on a five-step scale; one work situation; the gender mix; for businesses their type, size range and one industry | The Profile's options **narrow to what the Segment allowed**; the national lists of the customers' country; the equality notice |
| **3. Profile** (a typical person, specifics and behaviour) | A specific age, education and income; what they care about; where they look, how they compare, how they buy and pay; how comfortable online; goals, frustrations, worries; the help they want | **The journey**: the channels at each of the five stages; the Direct Payment subchannels; the relationship type; the demand rows; the Value Proposition draft |
| **4. Offering** | Form; ready or not; how it is bought; benefit; how it is received; what help is included | The presets (a service business hides stock and vehicles); one source for three "how it is bought" fields; the delivery roles and the capability **gap**; Support channels |
| **5. Price and tax** | Whether the price includes the tax; what supports it | The tax arithmetic by country |
| **6. Review** | Nothing | The 21 checks and 28 rules as a short, ordered list of open items |

## 3. A worked example (the author's illustration)

A three-person web studio in the UK.

| The founder answers | The app proposes |
|---|---|
| Identity: Software, IT, media and telecoms › web design and development; compete on quality and ease; setting up, not earning yet | "We are a web design and development studio." The code 62.01 for the Organization tile. Example Offerings (a website build, a monthly care plan). Skill areas: delivering, marketing, sales and customer care, running the business. Workspace and software resources shown; stock and vehicles hidden |
| Segment 1: businesses, across the country, with 1 to 49 employees, in hospitality (retail would be a second Segment) | The Profile's size options are 1 to 9 and 10 to 49; its kind-of-business list is hospitality's, with examples (hotels, restaurants and cafés, bars, catering) |
| Profile: restaurants and cafés; cares about ease and trust; finds suppliers through search, Instagram and Facebook; compares by website, reviews and a quote; buys by invoice and email; pays by bank transfer and card; comfortable with the basics; wants a little guidance | Discover: Website, Instagram, Facebook. Evaluate: Website, Email (quote), reviews. Purchase: Invoice, Bank Transfer, Card. Support: Email, Website. Relationship type: personal help. Demand rows: Website and social leads, Referrals. A Value Proposition draft built from ease and trust |

The founder answered closed questions and typed names and notes; the first draft of four pages exists. Every proposal can be ignored or edited.

## 4. What was cut

Ninety-one candidate questions were tested (one, the Brand question, is parked). **On 2026-10-26, after the owner's review, 24 were withdrawn, merged or no longer numbered, leaving 67** (document 28, Appendix B; document 29, section 12): G24 and G25 (the user is a second Profile; Identity's I7b already asks it), G17 to G19, I10, C5, J4, P2, P7, P8, P10, P23, O5, and the notes G12, P3, P4, K5, K7, K8, O9, C2, C3, J5 and J6.

| | Drivers | Checks | Notes | Total |
|---|---|---|---|---|
| Identity | 5 | 2 | 0 (1 parked) | 8 |
| Segment | 10 | 3 | 3 | 16 |
| Profile | 12 | 5 | 0 | 17 |
| Competitor | 2 | 3 | 0 | 5 |
| Offering | 6 | 4 | 0 | 10 |
| Delivery, capability, founders | 3 | 1 | 1 | 5 |
| Price | 1 | 1 | 0 | 2 |
| Journey, demand | 2 | 2 | 0 | 4 |
| **Total** | **41** | **21** | **4** | **67** (1 parked) |

The first release builds the **41 drivers**; the 21 checks follow; the 4 notes are never asked. The question files of 2026-10-15 held 82 questions; about a dozen were already fields of the app, and the rest were cut, merged or turned into drivers (document 28, Appendix A and B).

## 5. The building blocks (five now, one parked)

1. **The industry in two levels, with an example under each option.** Level 1 is 18 plain industries (every section of the UK, USA, Canada, Australia, Ireland and New Zealand schemes is covered; households and extraterritorial bodies are left out; non-profit and creative industries are not industries in any scheme). Level 2 is about 100 kinds of business, each mapped to the national codes by **division**, because the UK and the EU have a new edition that moves the section letters. The target audience's business types are fully covered. (28, 5.3, 5.4)
2. **An example under every option** of every list ("Quality and results: fewer errors, a better finish"), so the user understands a choice without leaving the card. (28, 5.5)
3. **The industry pack**: what a kind of business gives the user as one-click suggestions: example customers, offerings, skill areas, resource groups, Discover channels, the activity code, a typeface fit. Examples are labelled "for example", never "typical", because no source gives typical customers or channels by industry. The packs of the Tier 1 and Tier 2 types come first (about twelve). (28, 5.6)
4. **The cascade**: the Segment is a narrow group (a range, or one value; more is another Segment); the Profile chooses within it and defines it further (a specific age within the age range, one sub-industry within the industry, one size within the range). (28, 6.3, 6.5)
5. **The journey proposals**: where the customer looks, compares, buys and pays, how the offering is received and what help is wanted, become the channels of each stage, the payment subchannels, the relationship type and the demand rows. Customer Engagement is rebuilt as five stage tiles with a card per channel. (28, 7)
6. **Brand starting points: parked.** The owner asked on 2026-10-23 to ignore the Brand system for now. The research and the mapping are kept for later (28, 8.3; `02-references.md`, BRD).

## 6. The stages

### Working one tile at a time

We settle one tile at a time: its questions and their option lists (written as lists), what each answer drives, then the documents are updated, and only then is it built. Brand is parked.

| Step | Tile | Status |
|---|---|---|
| 1 | Business 1, the Segment card (tile "Segment Description") | **Now**: written out in document 28, 6.3, and revised after the owner's review of 2026-10-23 |
| 2 | Business 1, the Profile cards (same tile) | Next |
| 3 | Business 1, Competitors | |
| 4 | Business 1, Offerings, with the Value Proposition draft | |
| 5 | Identity, Description, Positioning, Vision and Values | |
| 6 | Business 2, the journey | |
| 7 | Business 3, delivery and capability; the founders | |
| 8 | Business 5, price and tax | |

### The stages

Each stage is one branch from `main`, tried once by the owner, with a browser check in three reading modes, the layout and console checks, `npm run verify`, the examples and a row in the log.

| Stage | What the user gets | Questions | Depends on | Done when | Size |
|---|---|---|---|---|---|
| **A. Data foundations** | Nothing visible; stops later rework | none | none | Need ids (with a migration), "how it is bought" held once, the Offering Type drives presets, the industry keyed on divisions, both examples migrated | M |
| **B. Identity entry** | Choices beside the free text of Description, Positioning, Vision and Values; the industry pack; the activity code suggested; a draft Description and Positioning sentence | the 4 Identity drivers (and the 3 checks later) | A | The web-studio example above runs end to end | L |
| **C. Segment and Profile** | The cascade; the national lists; the Value Proposition draft; the equality notice | 11 Segment, 12 Profile and 2 Competitor drivers | B | A Profile only offers what its Segment allowed; the draft appears; both examples updated | L |
| **D. The journey** | Page 2 as stages and channel cards, proposed from page 1 | 2 Journey drivers and the proposals | C | The stage card passes the layout check first; the proposals fill every stage; demand rows appear | L |
| **E. Offering, delivery, capability, founders** | The presets; the capability gap derived; the founder's profile inside Founders & Ownership; Capability as a Business 3 card | 7 Offering, 1 Delivery and 2 Capability drivers | C | A skill area an offering needs and no founder covers is listed with its cover options | M |
| **F. Price and tax** | The price asked with the country's tax name and default | 1 driver | A | Revenue, contribution and break-even strip or add the tax | M |
| **G. Checks** | The Review page as an ordered list of open items | the 21 checks and the rules of document 28, 11.5 | A to F | Each check has a test and a message in the app's wording | M |
| **H. Optional** | A guided, step-by-step overlay | none | G | Built from existing parts; only if wanted | S |

## 7. Decisions for the owner

The full list (31 items) is in document 28, section 13. These ten unblock the work; the recommendation follows each.

| # | Decision | Recommendation |
|---|---|---|
| 1 | Rebuild page 2 as a journey (stage tiles, a card per channel) | Yes, stage-first; prototype the stage card first |
| 2 | Two-level industry list with examples, keyed on divisions | Approve; start with the Tier 1 and Tier 2 sectors; check the UK activity-code hint, which cites SIC 2007 while the UK has moved to SIC 2026 |
| 3 | Identity choices on the Description, Positioning, Vision and Values tiles, free text kept | Yes |
| 4 | Industry packs: Tier 1 and Tier 2 first (about twelve), the rest generic | Yes; the owner approves each pack's examples |
| 5 | Brand starting points | Parked by the owner; not now |
| 6 | The cascade: the Profile chooses only within the Segment's ticks | Yes |
| 7 | The first release builds the 41 drivers | Yes |
| 8 | Founders' profile into Founders & Ownership; Capability as a Business 3 card with the gap derived | Yes; the editor first, storage unchanged |
| 9 | No ethnicity or race list; country, language and need instead; the equality notice per country | Yes |
| 10 | The plain wording, the lists and their examples (author's, no source) | Review list by list; approve or amend |

## 8. Risks

- **Authoring effort.** The packs and the examples are written by hand and must be approved; the plan limits the first release to the target audience's business types.
- **The classifications change.** The UK and the EU moved to a new edition in 2025 and 2026, NAICS has a 2027 revision proposed; keying on divisions and storing the edition keeps the lists stable.
- **Too many suggestions.** A tile that offers ten suggestions is work, not help; each tile shows a short, ordered set with a "show more".
- **Thin evidence.** New Zealand and Canada have the least; the Ofcom, ACMA, StatCan and CSO tables were not opened. The app says "tends to" and shows the source; it does not fill in numbers.
- **Sensitive characteristics.** Gender is asked only when relevant; no ethnicity list; a visible notice that a segment must not be used to exclude or price differently by a protected characteristic.
- **The page 2 rebuild** is the one change to existing layout; it is isolated in stage D and tested first.
- **Nothing here is verified in a browser.** The plan is from reading the code and the sources, not from running the app.

## 9. Where the detail is

| Subject | Document 28 |
|---|---|
| The countries, the shared lists with examples, the crosswalks, the industry in two levels, the industry pack | 5 |
| The customer model, the Segment and Profile questions, the cascade, the Competitor and Offering questions | 6 |
| The journey, the stage card, the proposals, the demand card | 7 |
| Identity's questions and the Brand starting points | 8 |
| Founders, capability, delivery, price and tax | 9, 10 |
| The connection map, the evidence by age, education, income, area and business size, the rules, what is not built | 11 |
| Sensitive characteristics and equality law | 12 |
| Rebuilds, moves and decisions | 13 |
| Which question is a driver, a check or a note | Appendix B |
| The flow of the questions as trees, the key branches, both, mixed, not sure and other, the order, why each matters | Document 29, the question guide |
