# 3. Research

Status: **current record**, 2026-10-14. This document keeps the research behind the design decisions. Parts R1 to R9 are the research notes written 2026-10-04 to 2026-10-08 (converted from the HTML drafts, content unchanged except for formatting); Part R10 is the analysis of 2026-10-14. The notes say "Recommend" where they propose; the decided design is in document 1. Where a note and document 1 differ, document 1 prevails.

How much each note can be trusted is in document 2, sections 2.3b and 2.4. In short: the notes of October rest mostly on vendor and blog pages and on general knowledge, so they explain *why* a decision was made but do not *prove* it.

## Index

| Part | Note | Written | Subject | Related decision in document 1 (matched by subject) |
|---|---|---|---|---|
| R1 | Resources, activities, partners and costs | 2026-10-05 | Page 3 frame (Business Model Canvas, Porter's value chain), resource types and groups, partners, channels, cost behaviour | The 9 categories and 47 groups (document 1, part D) |
| R2 | Part 2: groups, frequency, key definition, cost behaviour | 2026-10-05 | Groups by place, the frequency options, what a "key" cost is, default behaviours | The 7 drivers |
| R3 | Part 3: allocation, simplification, payments, channels, suppliers | 2026-10-05 | A card serving several offerings, payment structures, supplier terms | The linked-offering shares and the payment plan |
| R4 | Part 4: channel review, groups, Equipment and Digital, payment plan | 2026-10-05 | What the channel table generates, groups for Equipment and Digital, the payment plan | The channel templates |
| R5 | Industry costs compared with the app, and graded insurances | 2026-10-07 | 98 industry costs checked against the groups; insurance grades | 83 of 98 had a home, 11 none, 4 are not costs |
| R6 | Event card: three examples | 2026-10-06 | How an event or project card links to others | A recommendation; the activity model (R7) is the rule |
| R7 | Activity model | 2026-10-06 | How an event or project connects the cards; total cost is calculated, the card holds the price | Recommendation |
| R8 | Cards priced per project | 2026-10-06 | The 10 groups whose main driver includes Per project | The payment plan |
| R9 | Extra costs table | 2026-10-06 | The extras (service charge, rates, fit-out, insurance...) by group | Early data; the decided extras are in document 1, part D, section 8 |
| R10 | Business System analysis | 2026-10-14 | How the pages connect today; relationship types; goals; channel expenses; Delivery; Global Settings; screens; accessibility | Input to the requirements in document 5 |

## R1. Resources, activities, partners and costs

Research and recommendations for page 3 (Infrastructure & Capability). Facts come from the sources listed at the end. Recommendations are marked **Recommend**; they are proposals, nothing is changed in the app.

### 1. The frame used

- **Business Model Canvas:** key resources are physical, intellectual, human and financial. Key activities are production, problem solving and platform/network. Key partners come in four relationship types (strategic alliance, coopetition, joint venture, buyer-supplier) and are formed to optimise and economise, reduce risk, or acquire resources and activities.
- **Porter's value chain:** primary activities (inbound logistics, operations, outbound logistics, marketing and sales, service) create and deliver the product. Support activities (procurement, human resource management, technology development, firm infrastructure = finance, management, legal) serve the whole firm.
- **Mapping to the app (Recommend):** **Infrastructure** = Porter's support activities and "firm infrastructure": what the organization needs to exist and operate whatever it sells. **Offering's Capability** = Porter's primary activities: what is needed to make, sell and deliver the offerings. **Both** = used by the whole organization and by offerings; it lives in Infrastructure and is shared to offerings by linking, or is split by an allocation.
- **Financial resources** (cash, loans, investors) belong to your Funding and Capital section, not to Resources.

### 2. Resources: types, categories, groups, and where they belong

| Type | Category (existing = ✓) | Groups | Place |
|---|---|---|---|
| Physical | Workspace ✓ | kinds: Home, Coworking, Incubator, Dedicated, Other; groups for fit-out and deposit | Infrastructure (Offering when a workspace is only for one offering/project, e.g. a pop-up) |
| Physical | Utilities ✓ | Electricity, Internet, Heating & Gas, Cooling & Air Conditioning, Water ✓. **Add:** Phone/Mobile, Waste & Cleaning | Infrastructure |
| Physical | Workstation ✓ | Furniture, Electrical, Supporting ✓ | Infrastructure |
| Physical | Equipment ✓ | Computing, Peripherals, Specialized ✓. **Add:** Production Machinery & Tools (instead of overloading "Specialized"), Testing & Safety | Both: office equipment = Infrastructure; production machinery = Offering |
| Physical | **Add: Vehicles & Transport** | Vehicles, Fuel & Charging, Maintenance | Both |
| Physical | **Add: Materials & Inventory** | Raw Materials, Components, Packaging, Consumables, Stock (finished goods) | Offering (mostly) |
| Digital | Digital Infrastructure ✓ | Software, Digital Services, Online Presence & Communication ✓. **Add:** Data & Security (backup, cyber security, identity), Platforms & APIs (usage-based tools, e.g. AI APIs) | Both: company tools = Infrastructure; tools bought for one offering or channel = Offering |
| Intellectual | **Add: Intellectual Property & Licences** | Brand & Trade marks, Patents & Designs, Content & Templates, Licences & Permits, Certifications & Standards, Know-how/Training material | Both: brand, trade mark = Infrastructure; a product certification or licence for one offering = Offering |
| Human | **Change: Founders → Human Resources** (see section 5) | Founders & Owners, Employees, Interns & Volunteers; compensation per person | Both: admin and management people = Infrastructure; delivery people = Offering (allocated by delivery hours) |

Misfits seen in the example data:

"Public liability & contents insurance" sits under Workstation → Supporting, and "Studio fit-out and signage" under Workstation → Supporting.

Recommend:

insurance belongs with Legal/Compliance expenses (or a Risk & Insurance group), and a fit-out belongs to Workspace (premises improvement).

### 3. Activities: categories, and where they belong

Existing categories: Operational, Production, Marketing, Sales & Customer, Other. Compared with Porter and the Canvas the gaps are delivery, after-sales service, product development, procurement, people and administration.

| Category | Typical groups (examples) | Place |
|---|---|---|
| Operational (existing) → **keep as umbrella** | Administration & Finance, Legal & Compliance, People & Hiring, IT & Systems, Procurement & Sourcing, Premises & Facilities | Infrastructure |
| Production (existing) | Make / Build, Quality Control, Develop & Test, Operate the service, Platform & Network upkeep | Offering |
| **Add: Delivery & Logistics** | Packing, Shipping, Installation, On-site delivery, Returns | Offering (channel delivery) |
| Marketing (existing) | Brand & Content, Campaigns, Events, SEO & Social, Public relations | Both: brand work = Infrastructure; an offering launch = Offering |
| Sales & Customer (existing) | Prospecting, Proposals & Contracts, Onboarding, Account management | Both |
| **Add: Service & Support** (after-sales) | Helpdesk, Warranty & Repairs, Customer success, Feedback & Reviews | Offering |
| **Add: Product Development** (Porter: technology development) | Research, Design, Prototype, Improvement | Offering (or Infrastructure for internal tools) |
| Other (existing) | user-made | Either |

**Cost on activities:** I agree with your choice. An activity records time, owner and result, and its cost lives in Resources, Partners and Human Resources. **Recommend:** show an *implied labour cost* per activity as a calculated view only (performer hours × their compensation), never as an entered figure, so labour is not counted twice.

### 4. Partners and Providers: categories, and where they belong

The Canvas distinguishes partner *relationships* (alliance, coopetition, joint venture, buyer-supplier). The app's Partners vs Providers split is close to that: a **Partner** shares risk or goals (alliance, joint venture, coopetition, referral partner); a **Provider** sells you something (buyer-supplier). **Recommend:** keep Partners/Providers as the first level, and add functional categories:

| Category | Groups (examples) | Place |
|---|---|---|
| Professional Services | Legal, Accounting & Tax, Insurance broker, Consulting, Payroll | Infrastructure |
| Facilities & Property | Landlord, Coworking operator, Cleaning, Maintenance | Infrastructure |
| Technology & Platform | Hosting, SaaS vendors, App/Marketplace platforms | Both |
| Suppliers | Raw materials, Components, Packaging, Wholesale stock | Offering |
| Subcontractors & Freelancers | Production, Design, Development, Delivery staff | Offering |
| Logistics & Delivery | Couriers, Postal, Freight, Fulfilment | Offering (channel) |
| Payment & Finance | Payment processors, Bank, Invoice financing | Both (investors and lenders go to Funding and Capital) |
| Marketing & Sales Partners | Agencies, Affiliates, Resellers, Referral partners, Influencers | Both |
| Strategic Alliances | Alliance, Joint venture, Coopetition | Both |

### 5. Legal expenses, Human Resources, compensation

#### Legal expenses: Infrastructure or Offering?

**Recommend: Infrastructure** (Porter: legal and finance are "firm infrastructure"; accounting and legal fees are classified as administrative overhead, indirect to production). Company formation costs are one-time establishment costs; filings, insurance and accountants are recurring overheads. Exceptions that belong to an Offering: a trade mark, certification or regulatory approval for one product or service, product-liability cover for one line.

**Keep them recorded once, in Legal Entity** (as now), shown in All Tiles as "Legal", and counted in Infrastructure totals. Do not duplicate them as Resources or Partners cards. The accountant duplication found earlier is the example of why.

#### Founders → Human Resources

**Recommend: yes.** Category Human Resources with groups Founders & Owners, Employees, Interns & Volunteers. Freelancers paid per job stay in Partners & Providers (Subcontractors & Freelancers).

| Compensation | Examples | Cost behaviour | Note |
|---|---|---|---|
| Fixed pay | Base salary, wage, fixed allowances, benefits | Fixed | per month/year |
| Employer on-costs | Payroll taxes, pension, insurance | Semi-variable (a % of pay) | derive from pay with a rate |
| Variable pay | Commission, bonus, piece rate, revenue-linked payment, profit sharing | Variable (follows sales, output or profit) | needs a driver: % of revenue, per unit, target |
| Equity | Stock options, shares | Non-cash; may carry an accounting charge | tracked, not a cash cost |
| Dividends | Owner distributions | **Not an expense** | A distribution of profit after costs and tax, so it belongs with Funding and Capital / equity, not in Costs. Show it on the person's card for planning only. |

**Allocation:** give each person a role weight (admin/management vs delivery). The delivery-hours share allocates their cost to Offering; the rest stays in Infrastructure.

### 6. Channels (Customer Engagement) and channel resources

The Canvas describes channels through five phases: awareness, evaluation, purchase, delivery, after sales (the first, second and last are promotion; purchase and delivery are place). The app's channel kinds: Social Media, Website, Marketplace, Events/Talks, Email, Direct Payment, Physical Delivery (courier, postal), plus file delivery.

| Channel | Existing or potential channel resources | Likely behaviour |
|---|---|---|
| Social Media (awareness) | Ad spend, scheduling tool, content tools, influencer fees | Ads and influencers variable; tools fixed |
| Website (evaluation, purchase) | Domain, hosting, shop platform, plugins, SEO tools | Fixed (domain annual, platform monthly) |
| Marketplace (purchase) | Seller account, listing fees, commission %, fulfilment fees | Variable (% and per order) |
| Events / Talks (awareness) | Stall fee, display kit, travel, event insurance | Step: per event; kit one-time |
| Email (awareness, after sales) | Email platform, list tools, automation | Semi-variable (tier by list size) |
| Direct Payment (purchase) | Card reader, processing fees, invoicing tool | Semi-variable (fixed fee + %); reader one-time |
| Physical Delivery (delivery) | Packaging, courier or postal fees, returns, transit insurance | Variable (per order or parcel); account fee fixed |
| After sales | Helpdesk tool, warranty/repair, review platform | Fixed tool, variable repairs |

**Where they fit (Recommend):** a channel resource lives where it is used. They stay **created by the channel** (not by a button) and shown under Offering with the teal Channel marker. Use the five phases as the Channel **groups**: Awareness & Promotion, Sales & Payment, Delivery & Fulfilment, After-sales. A tool that serves the whole organization (the main website, the email platform) can be linked up to Infrastructure → Digital Infrastructure instead of duplicated. Costs must be counted once.

### 7. Fixed, variable and hybrid costs

| Behaviour | Definition | Typical categories |
|---|---|---|
| Fixed | Does not change with volume in the relevant range | Rent, salaries, insurance premiums, flat software subscriptions, depreciation, professional retainers |
| Variable | Changes in proportion to volume (zero at zero activity) | Raw materials, packaging, shipping per order, sales commissions, piece-rate labour, marketplace commission |
| Semi-variable (mixed) | Fixed base plus a usage part | Utilities, phone and internet, vehicles, maintenance, base pay plus commission, usage-tier SaaS and API fees, payment processors (fixed fee + %) |
| Step (semi-fixed) | Fixed until a threshold, then jumps | Extra workspace, another hire, a new machine |

#### How to identify them

- **Two questions:** if you sell nothing next month, does the cost still arrive? (yes = fixed or the fixed part). If you doubled your orders, would the bill double? (yes = variable; partly = semi-variable).
- **Shape of the bill:** a flat line = fixed; starts at zero and rises with volume = variable; a floor plus a rising line = semi-variable; a staircase = step.
- **Data methods:** high-low method or regression on past bills against volume (units, orders, projects) separates a mixed cost into its fixed part and a rate per unit.
- **Context:** it depends on the volume measure (the driver) and the time horizon; over the long run almost everything varies.

#### How the app treats them today

The Financial model already has Fixed, Variable and Semi-variable (a fixed part per period plus a variable amount per unit of the offering). The behaviour is derived from the payment frequency: one-time, monthly and annual are fixed; per unit, per order and per project are variable.

**Recommend:** **frequency answers "when it is paid", but cost behaviour needs "what it follows".** Add a **driver** to the cost: none, per unit, per order, per project, per participant, per hour, % of revenue. Then Fixed = no driver, Variable = driver only, Semi-variable = fixed part plus driver. Categories give the default (Utilities semi-variable, Materials variable, Rent fixed) that the user can override.

### 8. Positioning across all costs

| Cost source | Typical place | Typical behaviour |
|---|---|---|
| Workspace rent, deposit | Infrastructure | Rent fixed; deposit one-time, refundable |
| Utilities, phone | Infrastructure | Semi-variable |
| Furniture, equipment | Infrastructure (production machinery: Offering) | One-time; depreciated, fixed |
| Software, digital services | Both | Fixed; usage-based plans semi-variable or variable |
| Materials, packaging, stock | Offering | Variable |
| Human Resources: base pay, on-costs | Infrastructure (admin) or Offering (delivery) | Fixed, on-costs semi-variable |
| Human Resources: commission, bonus | Offering or Both | Variable |
| Professional services (legal, accountant) | Infrastructure | Fixed if retainer; variable if per job |
| Legal Entity expenses | Infrastructure (recorded in Legal Entity) | Fixed overhead; formation one-time |
| Suppliers, subcontractors, logistics | Offering | Variable |
| Payment processors, marketplaces | Offering (channel) | Semi-variable or variable |
| Activities | Both | No own cost; implied labour is a calculated view |

**Reading the result:** the place answers *what the cost is for* (overhead for the whole organization vs direct cost of an offering). The behaviour answers *how it moves with volume*. Together they give break-even (Infrastructure and other fixed costs) and the unit margin (Offering's variable costs per unit). The usual pattern is Infrastructure mostly fixed, Offering mostly variable, with exceptions on both sides.

### 9. Decisions for you

- Approve the new categories (Human Resources, Vehicles & Transport, Materials & Inventory, Intellectual Property & Licences) and the new activity categories (Delivery & Logistics, Service & Support, Product Development).
- Offering resources: allow the same categories as Infrastructure, with Offering-specific groups?
- Partners & Providers: add the functional categories on top of Partners/Providers?
- Add a cost **driver** field so Fixed/Variable/Semi-variable follows the data?
- Channel groups = the five phases?
- Dividends outside Costs (Funding and Capital)?

### Sources

- Business Model Canvas (Kent State): kent.edu/launchnet/business-model-canvas
- Strategyzer, Key Partnerships building block: support.strategyzer.com
- Four Week MBA, Key Partners: fourweekmba.com/key-partners-business-model-canvas
- Porter's value chain: wrike.com/blog/porters-value-chain, digitalleadership.com/unite-articles/porters-value-chain
- Fixed, variable and semi-variable costs: bdc.ca (semi-variable costs glossary), superfastcpa.com (fixed, variable and mixed costs), patriotsoftware.com (fixed vs variable)
- Compensation types: aihr.com/blog/types-of-compensation, quotapath.com/glossary/compensation-structure
- Channels and their five phases: Stanford GSB, The Impact of the BMC (Channels); uhack-guide-2017 Business Model Canvas A3
- Legal and professional fees as administrative overhead, and formation vs operating costs: superfastcpa.com (administrative overhead), freeagent.com (overheads), zenind.com (startup costs)

## R2. Part 2: groups by place, frequency options, key definition, cost behaviour

Colours: pink = Infrastructure, brown = Offering, green = Both. Behaviours are **defaults the user can override**: F = fixed, V = variable, S = semi-variable, St = step. Recommendations only; nothing is changed in the app.

### 1. Groups per category: Infrastructure, Offering or Both, with the default cost behaviour

**Both** means the same group is used in both sections, and the card sits in the section it serves: company-wide use in Infrastructure, use for one offering in Offering.

#### Resources

| Category | Group | Place | Behaviour | Driver / note |
|---|---|---|---|---|
| Workspace | Home / Coworking / Incubator / Dedicated | Infrastructure | F | Monthly rent or membership; a day pass is V (per day) |
| Workspace | Pop-up / Exhibition / Project site | Both (Offering when for one offering) | St | Per event or project; deposit is refundable, not an expense |
| Workspace | Fit-out & deposit | Infrastructure | F (one-time, depreciated) | Premises improvement, not furniture |
| Utilities | Electricity, Heating & Gas, Cooling & Air Conditioning, Water | Infrastructure | S | Standing charge + usage; seasonal |
| Utilities | Internet, Phone/Mobile (add) | Infrastructure | S (mostly F) | Plan + usage or overage |
| Utilities | Waste & Cleaning (add) | Infrastructure | F or V | Contract = F; per collection = V |
| Workstation | Furniture, Electrical, Supporting | Infrastructure | F (one-time, depreciated) | Capital purchases |
| Equipment | Computing, Peripherals | Both | F (one-time) | Office use = Infrastructure; a delivery kit for one offering = Offering |
| Equipment | Specialized | Both | F (one-time) | Cameras, scanners, printers |
| Equipment | Production Machinery & Tools (add) | Offering | S | Purchase F + running energy, parts V; units-of-production wear V |
| Equipment | Testing & Safety (add) | Both | St (periodic) | Calibration, inspection, annual |
| Vehicles & Transport (add) | Vehicles | Both | F (lease/purchase) | Insurance F |
| Vehicles & Transport | Fuel & Charging, Maintenance | Both | V / S | Per km or per delivery |
| Materials & Inventory (add) | Raw Materials, Components | Offering | V | Per unit; minimum order = step |
| Materials & Inventory | Packaging, Consumables | Offering | V (consumables S) | Per order or unit |
| Materials & Inventory | Stock (finished goods) | Offering | V | Purchase timing; counts in margin when sold |
| Digital Infrastructure | Software | Both | F (per seat = St) | Flat or per user monthly/annual |
| Digital Infrastructure | Digital Services | Both | S | Storage / cloud tiers |
| Digital Infrastructure | Online Presence & Communication | Both | F (domain annual, hosting S) | Website, email, social |
| Digital Infrastructure | Data & Security (add) | Infrastructure | F | Backup, cyber security, identity |
| Digital Infrastructure | Platforms & APIs (add) | Both (usually Offering) | V / S | Per call, token or transaction |
| Intellectual Property & Licences (add) | Brand & Trade marks | Infrastructure | F (one-time + renewals) | Trade mark for one product line = Offering |
| Intellectual Property & Licences | Patents & Designs | Both | F (filing, annual renewal) |  |
| Intellectual Property & Licences | Content & Templates, Know-how | Both | F (one-time) |  |
| Intellectual Property & Licences | Licences & Permits | Both | F annual, or V (royalty %) | Royalty per unit or % of revenue = V |
| Intellectual Property & Licences | Certifications & Standards | Both | F annual / St audits | Organization-wide = Infrastructure; product = Offering |
| Human Resources (changed from Founders) | Founders & Owners | Infrastructure (delivery share = Offering) | F (salary); dividends not an expense | Allocate by delivery hours |
| Human Resources | Employees | Both | F base; S on-costs; V commission, bonus, overtime | Admin staff = Infrastructure; delivery staff = Offering |
| Human Resources | Interns & Volunteers | Both | F stipend; V expenses |  |

#### Activities

An activity has no cost of its own. The column shows how its *implied labour* behaves, which is a calculated view.

| Category | Groups | Place | Implied labour |
|---|---|---|---|
| Operational | Administration & Finance; Legal & Compliance; People & Hiring; IT & Systems; Procurement & Sourcing; Premises & Facilities | Infrastructure | F (salaried time) |
| Production | Make / Build; Quality Control; Develop & Test; Operate the service; Platform upkeep | Offering | S (capacity, hours per unit) |
| Delivery & Logistics (add) | Packing; Shipping; Installation; On-site delivery; Returns | Offering | V (per order) |
| Marketing | Brand & Content; Campaigns; Events; SEO & Social; Public relations | Both | St (campaigns) / F |
| Sales & Customer | Prospecting; Proposals & Contracts; Onboarding; Account management | Both | S (commission V) |
| Service & Support (add) | Helpdesk; Warranty & Repairs; Customer success; Feedback & Reviews | Offering | S |
| Product Development (add) | Research; Design; Prototype; Improvement | Offering (internal tools: Infrastructure) | F per project |

#### Partners & Providers

| Category | Groups | Place | Behaviour | Driver / note |
|---|---|---|---|---|
| Professional Services | Legal; Accounting & Tax; Insurance broker; Consulting; Payroll provider | Infrastructure | F retainer; V per job; payroll S (per employee) | Per project, per month, per employee |
| Facilities & Property | Landlord; Coworking operator; Cleaning; Maintenance | Infrastructure | F (maintenance V) | Service charge F or S |
| Technology & Platform | Hosting; SaaS vendors; Marketplaces & app platforms | Both | F or S | Marketplace = fee F + commission V |
| Suppliers (goods) | Raw materials; Components; Packaging; Wholesale stock | Offering | V | Per unit; minimum order = step; volume discount |
| Subcontractors & Freelancers | Production; Design; Development; Delivery staff | Offering | V (retainer F) | Per project or hour |
| Logistics & Delivery | Couriers; Postal; Freight; Fulfilment | Offering (channel) | V (account fee F) | Per parcel or order |
| Payment & Finance | Payment processors; Bank; Invoice financing | Both | S | Fixed fee + % of order value |
| Marketing & Sales Partners | Agencies; Affiliates; Resellers; Referral partners; Influencers | Both | F agency retainer; V commission or per post | % of revenue, per lead, per post |
| Strategic Alliances | Alliance; Joint venture; Coopetition | Both | F fee / V revenue share | Capital in a joint venture goes to Funding and Capital |

#### Channel resources (groups = the five channel phases)

| Group | Examples | Place | Behaviour |
|---|---|---|---|
| Awareness & Promotion | Ad spend, influencer fees, scheduling tools | Offering (channel) | Ads and influencers V (a chosen budget); tools F |
| Evaluation | Demo, samples, website tools | Offering (channel) | Samples V; tools F |
| Sales & Payment | Shop platform, card reader, processing fees, marketplace commission | Offering (channel) | Platform F; processing S; commission V |
| Delivery & Fulfilment | Packaging, courier, postal, insurance in transit | Offering (channel) | V (per order) |
| After-sales | Helpdesk tool, warranty, repairs, returns | Offering (channel) | Tool F; returns V (% of sales) |

#### Legal Entity expenses (recorded in Legal Entity, counted in Infrastructure)

| Expense | Behaviour |
|---|---|
| Company formation / incorporation, trade mark registration | F, one-time (establishment) |
| Confirmation statement, data protection fee, licence renewals | F, annual |
| Accountant retainer, employers' liability and other insurance | F, monthly or annual |

### 2. The frequency list: what could be added

**Today.** Resource, partner and provider cards offer: One-time, Monthly, Annually, Per unit, Per order, Per project, Other. The Financial model also knows Quarterly, which the cards do not show. Salaries use their own period list.

**The issue.** One list mixes two different questions: *when it is paid* (a period) and *what it follows* (a driver). **Recommend:** keep one dropdown, but organize it into two groups, and add the missing options.

| Group | Existing | Add (recommended order of value) |
|---|---|---|
| Paid on a schedule (fixed by time) | One-time, Monthly, Annually | **Quarterly** (already in the model), **Weekly**, **Daily**, Fortnightly (salaries), Half-yearly, Every 2/3 years (renewals), On milestone/completion |
| Follows activity (variable) | Per unit, Per order, Per project | **Per hour**, **Per day**, **Per participant/client**, **Per use/transaction**, Per event/session, Per kilometre/mile, Per seat/user, Per kg/metre/litre |
| Follows a base figure (percentage) | none | **% of revenue** (commission, royalty), **% of order value** (marketplace, payment fee), % of profit (profit share), % of pay (employer on-costs, pension) |
| Other | Other | Other (user text) |

**Salaries and pay.** Period: hourly, daily, weekly, fortnightly, monthly, annual. Variable pay options: commission (% of sales or per sale), bonus (one-off or annual), profit share (% of profit), revenue-linked payment (% of revenue), piece rate (per unit), overtime (per hour). Dividends belong to Funding and Capital. A salary or commission is then two fields: a period or driver, plus a rate or amount.

**Link to cost behaviour.** Schedule options give fixed, activity options give variable, percentage options give variable (or semi-variable when a fixed fee is also set). A card with both a fixed part and a driver part is semi-variable.

### 3. Provider and supplier, and what "Key" means

#### The difference

- **Supplier:** provides materials, components or goods, usually upstream and often in bulk (yarn, packaging, parts).
- **Vendor:** sells finished products or services directly to the buyer; **service provider** is a kind of vendor that sells a service (IT, consulting, maintenance, delivery).
- **Partner (Canvas):** a relationship of shared goals or risk: strategic alliance, coopetition, joint venture. A buyer-supplier relationship is the fourth Canvas type.
- **Recommend, in the app:** **Provider** = anyone you pay for a service or access (landlord, accountant, courier, software, platform). **Supplier** = anyone you pay for goods that you consume or resell. Keep Supplier as a *category* of Providers, not a third type. **Partner** = a shared-risk relationship, not just a payment.

#### What is "Key"

In the Canvas, key partners, key resources and key activities are the ones the business model cannot work without. Procurement uses the Kraljic matrix to separate them: purchases are rated on **impact on results** (share of cost or revenue) and **supply risk** (few alternatives, single source, long lead time, hard to switch). By the standard Kraljic definition: **strategic** items (high impact, high risk) are key and need a long-term partnership; **leverage** items (high impact, low risk) are negotiated on price; **bottleneck** items (low impact, high risk) are key operationally and need a back-up; **non-critical** items are routine.

Recommend a simple rule.

A card is

Key

when losing it would stop or seriously damage delivering an offering. The app can suggest it from four answers on the card: (1) Can an offering be delivered without it? (2) Can it be replaced within a few weeks? (3) Is it the only source? (4) Is its cost a large share of the total (computed automatically)? Show Key as a flag on the tile and a filter in All Tiles. The same rule applies to Resources, Activities and Partners & Providers.

### 4. Cost behaviour: how to read it per group

- The tables in part 1 give the default per group. The summary by **category**:

| Category | Mostly | Because |
|---|---|---|
| Workspace | Fixed | Rent or membership is the same each month; pop-ups are steps |
| Utilities | Semi-variable | Standing charge plus usage |
| Workstation, Equipment (office) | Fixed (one-time capital, depreciated) | Bought once; no link to volume |
| Production machinery | Semi-variable | Purchase fixed, running costs and wear follow output |
| Vehicles | Semi-variable | Lease and insurance fixed, fuel and upkeep follow distance |
| Materials & Inventory | Variable | Consumed per unit sold |
| Digital | Fixed, with usage tiers semi-variable | Subscriptions flat; APIs follow use |
| Intellectual Property & Licences | Fixed, royalties variable | Registration and renewals; royalty follows sales |
| Human Resources | Fixed base, semi-variable on-costs, variable incentives | Pay is fixed; on-costs follow pay; commission follows sales |
| Professional services | Fixed or variable | Retainer vs per job |
| Suppliers, subcontractors, logistics | Variable | Per unit, order or job |
| Payment, marketplaces | Semi-variable | Fee plus percentage |
| Marketing partners | Fixed or variable | Retainer vs commission |
| Legal Entity | Fixed | Formation one-time, then annual or monthly |
| Activities | No cost; implied labour fixed (salaried) to variable (per job) | Cost sits on resources, partners and people |

**Using it.** Variable costs per unit give the unit margin of each Offering. Fixed costs (mostly Infrastructure) give break-even. A semi-variable cost is split into a fixed part (to break-even) and a rate per unit (to margin), which the Financial model already supports with a fixed part and a variable amount per unit. A step cost is entered as fixed until its threshold, then as a new fixed cost.

### Sources

- Vendor vs supplier: inboundlogistics.com (vendors vs suppliers), cleartax.in, fishbowlinventory.com, happay.com
- Kraljic matrix: zoho.com/procurement, fractory.com/kraljic-matrix, cips.org (Kraljic matrix), procurementandsupply.com
- Earlier sources (Business Model Canvas, Porter's value chain, cost behaviour, compensation, channels, overhead) are listed in part 1.

Note: one search summary described the leverage and bottleneck quadrants the wrong way round. The text above uses the standard Kraljic definition (leverage = high impact, low risk; bottleneck = low impact, high risk).

## R3. Part 3: allocation, simplification, payments, channels, suppliers

Pink = Infrastructure, brown = Offering, green = Both. F = fixed, V = variable, S = semi-variable, St = step. Recommendations only; nothing is changed in the app.

### 1. A card that serves more than one Offering

Two different things happen, and they should not be mixed:

- **The behaviour of the cost does not change.** Rent stays fixed, materials stay variable. A cost behaviour is a property of the cost, not of how many offerings use it.
- **What changes is attribution**: is the cost *direct* (belongs to one offering and would disappear if you dropped it) or *common* (shared, stays whatever you drop)? A card linked to two or more offerings makes the cost common.

| Cost type on the card | What to do with several offerings |
|---|---|
| Variable: per unit, per order, per project | **Do not split the money.** The rate applies to every linked offering's own volume: a per-unit cost times the units of each linked offering. The total follows from the volumes. |
| Fixed or one-time (rent, software, equipment) | The total is one number. **Split only to show each offering's margin**, using an allocation base. Break-even always uses the total, so the split never changes it. |
| Semi-variable | The fixed part is allocated like a fixed cost; the per-unit part follows each offering's volume. |
| Step | The step is triggered by the combined volume of the linked offerings, then allocated like a fixed cost. |

**Allocation bases** (from cost accounting: allocate on a measure that reflects cause and effect): **equal share** (default when nothing is known), **by revenue** (marketing and general costs), **by units** (offerings that use the resource the same way), **by hours** (delivery or labour hours, for people and workspaces), **manual %**. **Recommend** a card option "Shared cost: allocate by …" with these five choices, default "Do not allocate (show as shared overhead)", and a check that the shares add up to the card's total.

### 2. Simplifying the frequency list

You are right: most of the options I proposed collapse into the existing ones once a *unit name* is allowed.

| Proposed option | Covered by |
|---|---|
| Per order, per participant, per hour, per day, per use/transaction, per event/session, per km, per seat, per kg | **Per unit**, with an optional unit name (order, participant, hour, km, seat …). For planning they behave the same: rate × volume. |
| Per event, per job, on completion | **Per project** (one self-contained job) |
| Deposit, set-up, renewal every 2–3 years | **One-time** (renewals as a new date), or the payment plan in section 3 |
| Weekly, daily, fortnightly, half-yearly | Monthly, Quarterly or Annually equivalents (salary periods stay in the pay field) |
| % of order value, commission, royalty, revenue share | One option **% of revenue**: it follows price, which a per-unit amount does not |

**Recommended final list, 8 options:** One-time, Monthly, Quarterly, Annually, Per unit (+ unit name), Per project, % of revenue, Other. Quarterly is already in the Financial model but missing from the cards. "Per order" would migrate to Per unit with the unit name "order". **Salaries** keep their own period (hourly, weekly, monthly, annual) because it is a pay rate, not a cost frequency.

#### Groups that can be merged

| Category | Before | After | Place | Behaviour |
|---|---|---|---|---|
| Utilities | Electricity, Internet, Heating & Gas, Cooling & Air Conditioning, Water (+ Phone, Waste) | **Electricity; Heating & Cooling; Water & Waste; Connectivity** (internet, phone) | Infrastructure | S |
| Workstation | Furniture, Electrical, Supporting | **Furniture & Accessories; Electrical** | Infrastructure | F (one-time) |
| Equipment | Computing, Peripherals, Specialized (+ Production Machinery, Testing & Safety) | **Computing & Peripherals; Specialized; Production Machinery & Tools** (testing and safety go into Specialized) | Both; machinery = Offering | F; machinery S |
| Vehicles & Transport | Vehicles, Fuel & Charging, Maintenance | **Vehicles; Running Costs** | Both | F; running S |
| Materials & Inventory | Raw Materials, Components, Packaging, Consumables, Stock | **Materials & Components; Packaging & Consumables; Stock** | Offering | V |
| Digital Infrastructure | Software, Digital Services, Online Presence & Communication, Data & Security, Platforms & APIs | **Software; Cloud, Data & Security; Online Presence & Communication; Platforms & APIs** | Both | F / S / V (APIs) |
| Intellectual Property & Licences | Brand & Trade marks, Patents & Designs, Content & Templates, Know-how, Licences & Permits, Certifications | **Trade marks, Patents & Designs; Content & Know-how; Licences, Permits & Certifications** | Both | F; royalties V |
| Human Resources | Founders & Owners, Employees, Interns & Volunteers | **Founders & Owners; Team** (employees, interns, volunteers) | Both | F; on-costs S; incentives V |
| Workspace | Home, Coworking, Incubator, Dedicated, Pop-up, Fit-out | Kinds stay; fit-out and deposit are parts of the workspace card | Infrastructure; pop-up = Offering | F; pop-up St |

#### Activities: categories only

I agree: **no groups and no cost on activities**. The simplest set needs **no additions**; the existing five stay and their meaning is widened:

| Category | Covers | Place |
|---|---|---|
| Operational | Administration, finance, legal, people, IT, procurement, premises | Infrastructure |
| Production | Make, build, develop, test, deliver and ship | Offering |
| Marketing | Brand, content, campaigns, events, social, PR | Both |
| Sales & Customer | Prospecting, proposals, onboarding, support, after-sales | Both |
| Other | User-made categories | Either |

This replaces my earlier proposals for Delivery & Logistics, Service & Support and Product Development as separate categories: delivery and development fold into Production, service into Sales & Customer.

### 3. Payments: the Calendar, or payment methods?

**Both, in two layers.** Behaviour (fixed/variable) answers "how does it move with volume". Timing answers "when does the money leave or arrive". The Costs section already shows a "When" (for example "At the start", "Oct 2026 · Deposit"), so the Calendar link exists. What is missing is a way to split one amount into several payments.

#### What the research says about payment structures

| Structure | How it works | Where it is useful |
|---|---|---|
| Single payment | One amount on a date or on delivery | Small, well-defined jobs; goods; rush work |
| Deposit + balance | An upfront share (typically 10–33%), balance on delivery or by a date | Covers early material costs and confirms commitment; custom or made-to-order goods |
| Milestone / instalments | 2–4 payments, each triggered by a deliverable or event; common splits 50/50 and 33/33/33 | Longer or complex projects; a review point at each payment; protects both sides |
| Retainer | Recurring upfront payment, drawn down as work is done | Ongoing support, maintenance, continuous improvement |
| Payment terms (net 7, 14, 30) | Invoice now, payment due after N days | Business customers and suppliers; moves cash timing, creates credit risk |

The same structures apply to money **out** (a supplier's deposit, a contractor's milestones, equipment paid in instalments, a landlord's deposit) and money **in** (a customer paying a project in three parts). A deposit with milestone draws is described as the best fit for most larger jobs: the greater the uncertainty around payment, the more should come in ahead of time.

Recommend a "Payment plan" part on a card

(optional, like Description; default single payment): a short list of payments, each with a share (% or amount) and a

when

: a fixed date, or a trigger relative to the project (at signing, at start, at 50% progress, on delivery, N days after invoice). Rules: shares add up to 100%; it applies to One-time and Per project costs; Monthly, Quarterly and Annually keep their start date and optional end date. Cost behaviour is unchanged, only cash timing changes. The Calendar then feeds the cash-flow and funding need.

**Payment methods** (card, bank transfer, cash, payment link, invoice) already exist as the Direct Payment channel. They matter for cost (card and link carry a fee, usually a fixed amount plus a percentage, so they are semi-variable; cash and transfer carry little or none) and for timing (an invoice delays the money). I did not research processor fee levels in this round.

### 4. Channels: is it only Logistics & Delivery?

**No, that is not a rule.** In the Lumen example only the two courier channels hold a resource whose status is Partners & Providers, so only DPD and Royal Mail appear. Any channel resource set to that status creates its partner or supplier card: a payment processor, a marketplace, an agency, a fulfilment partner.

#### The current set-up

Eleven channel categories: Social Media, Community, Website, Marketplace, In Person, Email, Online / Live, Direct Payment, File Delivery, Physical Delivery, Other. Each channel has a Journey Stage (Discovery, Evaluation, Purchase, Delivery, Support), which matches the Canvas phases.

| Channel category | Typical channel resources | Partner/supplier candidates | Place | Behaviour |
|---|---|---|---|---|
| Social Media | Ad spend, scheduling tool, content tools, influencer fees | Influencers, agencies | Offering | Ads V (budget); tools F |
| Community | Platform plan, moderator time, event tools | Associations, community hosts | Offering | F; moderators V |
| Website | Domain, hosting, shop platform, plugins, SEO tools | Platform vendor, web agency | Both (company site = Infrastructure) | F; platform S |
| Marketplace | Seller fee, listing fee, commission, ads, fulfilment fee | The marketplace | Offering | Fee F + commission V (% of revenue) |
| In Person | Stall or venue fee, display kit, travel, event insurance | Venue, organiser, trade fair | Offering | St per event; kit one-time; travel V |
| Email | Email platform, list tools, automation | Platform vendor | Both | S (tiers by list size) |
| Online / Live | Meeting licence, streaming tool | Platform vendor | Both | F |
| Direct Payment | Card reader, processing fees, invoicing tool | Payment processor, bank | Offering | S (fixed fee + % of order); reader one-time |
| File Delivery | Storage, transfer service, client portal | Cloud vendor | Offering | F / S |
| Physical Delivery | Packaging, courier or postal fees, fulfilment, transit insurance | Courier, postal, fulfilment partner | Offering | V (per order); account fee F |

#### Gaps compared with the research

Sales and distribution channels are described as direct (own store, website, showroom) or indirect (wholesalers, distributors, retailers, agents, affiliates, resellers), and dual distribution combines both. The app covers direct channels and marketplaces well, but not the indirect trade channels. **Recommend adding:** **Retail & Wholesale** (stockist or retailer, wholesaler or distributor, reseller or agent), **Referral & Affiliates** (referral partner, affiliate programme), and, if wanted, **Messaging & Phone** (WhatsApp, phone) and **App Stores**. Their costs: wholesale and retail are a discount on price, so V as % of revenue; affiliates and referrals are a commission, V as % of revenue. Their parties are **Partners** (they share the customer relationship), not suppliers.

### 5. Providers → Suppliers, and the updated list

**Recommend: yes, rename Providers to Suppliers.** In procurement, "supplier" is the general word for any external party you buy from, goods or services, and the Canvas itself speaks of "suppliers and partners". It also avoids the problem you describe: "Provider" suggested a service on the same level as a Key Partner. Two rules keep the model clean:

- **Partner** = shared goals or risk (alliance, joint venture, coopetition, referral, reseller). **Supplier** = you pay for goods or a service.
- Whether either is **Key** is a flag (section 3 of part 2), not the type. A routine supplier is a Supplier that is not Key. Where a purchase is only a subscription or utility, the Resource card is enough and no supplier card is needed.

#### Updated list

| Type | Category | Examples | Place | Behaviour |
|---|---|---|---|---|
| **Partners** | Strategic Alliances & Joint Ventures | Alliance, joint venture, coopetition | Both | F fee / V revenue share |
| Resellers & Distributors | Stockists, wholesalers, retailers, agents | Offering (channel) | V (% of revenue) |  |
| Referral & Affiliates | Referral partners, affiliate programmes | Both | V (% of revenue) |  |
| Co-delivery & Collaborators | Co-teachers, joint producers, research partners | Offering | V / revenue share |  |
| Associations & Communities | Trade bodies, networks, accelerators | Infrastructure | F (membership) |  |
| **Suppliers** | Materials & Goods | Raw materials, components, packaging, wholesale stock | Offering | V |
| Subcontractors & Freelancers | Production, design, development, delivery staff | Offering | V; retainer F |  |
| Logistics & Fulfilment | Courier, postal, freight, fulfilment | Offering | V; account fee F |  |
| Professional Services | Legal, accounting, insurance, payroll, consulting | Infrastructure | F retainer / V per job |  |
| Facilities & Property | Landlord, coworking operator, cleaning, maintenance | Infrastructure | F |  |
| Technology & Platforms | Hosting, software vendors, marketplaces, APIs | Both | F / S |  |
| Payment & Finance Services | Payment processors, bank | Both | S (fee + %) |  |
| Marketing & Creative Services | Agencies, designers, printers, influencers (paid) | Both | F retainer / V per job |  |

#### What stayed out, and where it goes

| Left out | Where it belongs |
|---|---|
| Investors, lenders, grant bodies | Funding and Capital (not a partner or supplier card) |
| Tax and regulators (tax authority, company registry, data protection authority) | Legal Entity expenses: they are payees, not partners |
| Employees and volunteers | Human Resources (Team); a freelancer paid per job is a Subcontractor |
| Utility companies (electricity, water, broadband) | Resources → Utilities; add a supplier card only when the relationship matters (Key) |
| Software subscriptions | Resources → Digital Infrastructure; a supplier card only for a Key platform |
| Landlord with rent | The Workspace resource carries the rent; a Facilities supplier card carries only a separate charge (as in the Hackney Wick example) |
| Insurers | Legal Entity expenses for the cover; Professional Services supplier only if you want the relationship |
| Training and education providers | Human Resources (training cost) or Professional Services |
| Customers and users | Customer Engagement, never a partner or supplier |
| Marketplaces and delivery apps | Channel resources (Customer Engagement); the party is a Technology & Platforms supplier |

**Rule that prevents double counting:** one cost lives in one place. A resource card or a supplier card carries the price, and the other links to it.

### Decisions for you

- Rename Providers to Suppliers, with the Partners and Suppliers categories above?
- Frequency list down to the 8 options, with a unit name on Per unit?
- An optional Payment plan on cards (shares plus date or trigger)?
- Shared-cost allocation: five bases, default "do not allocate"?
- Merged groups as listed; activities stay with categories only and no additions?
- Add Retail & Wholesale and Referral & Affiliates channel categories?

### Sources

- Payment structures: joist.com (retainers, deposits vs draw schedules), ruul.io (freelance payment terms, milestone payments), finmap.online (prepay, postpay, milestones), osher.com.au (how pricing and payment work)
- Sales and distribution channels: alooba.com (sales channels), ssfllp.com and sensiba.com (direct vs indirect distribution), leadsquared.com and impartner.com (distribution channels)
- Cost allocation: superfastcpa.com (allocation base), csus.edu (accounting study guide), ocw.tau.edu.ng (management accounting lecture notes)
- Supplier terminology and Kraljic matrix: see part 2. The app's channel categories are read from the code (`BUSINESS_CHANNEL_CATEGORIES`).

## R4. Part 4: channel review, groups, Equipment and Digital, payment plan

Pink = Infrastructure, brown = Offering, green = Both, teal = Channel. F = fixed, V = variable, S = semi-variable, St = step. Recommendations only; nothing is changed in the app.

### 1. The Customer Channel table and the channel resources it generates

**What the table lists** (read from the specification): per Segment, a read-only, auto-generated table. Columns: Resource (a button to its card), Cost (price × quantity and frequency), Behaviour (Fixed for one-time, monthly and annual; Variable for per-unit, per-order and per-project), Channel, Offerings, Journey stages, Actions. A footer adds up Fixed per month, Variable by what it varies with, and One-time.

**What the Lumen example generates:** 12 channel-resource links, which produce 14 channel-made cards in Offering's Capability (some resources are shared by several actions or channels).

| Card status | Count in Lumen | What it generates |
|---|---|---|
| Costs | 12 (Shopify Basic, Workshop booking app, Klaviyo, Shopify Payments & Klarna fees, Market pitch fees, Stall display kit, SumUp reader, SumUp fees, Installation travel, Trade fair stand, …) | A resource card with its own price and frequency. No supplier card. |
| Partners & Providers (Partners & Suppliers) | 2 (Parcel delivery, Tracked postage) | A resource card **plus** a partner or supplier card (DPD Local, Royal Mail) that carries the price |
| Needs Activity / Needs Investigation | 0 in this example | A resource card plus an activity |

Correction to part 3.

Channels do

not

generate only Partners & Suppliers. A channel resource is first a

resource card

. It generates a partner/supplier card only when its status is Partners & Suppliers, and an activity when its status is Needs Activity or Needs Investigation. In the example, most channel resources are plain costs, so only the couriers appear as suppliers. My earlier sentence "any channel resource set to that status creates its partner or supplier card" is right, but it should not be read as "channels generate only suppliers".

**Behaviour check on the table.** Because Behaviour comes only from frequency, three Lumen rows are probably mis-read: *Shopify Payments & Klarna fees* and *SumUp card fees* are a fixed fee plus a percentage (semi-variable, shown Variable); *Market pitch fees* at £120 monthly and *Trade fair stand* at £3,000 annually are really per-event costs (step, shown Fixed). The cost **driver** proposed in part 2 would fix this.

### 2. Partners and Suppliers: categories only, no groups

Agreed. The category already gives the default **place**. The **cost behaviour** inside a category varies (a lawyer on retainer is fixed, per job is variable), so the group would not predict it either; it comes from the frequency and driver on the card.

| Type | Categories | Default place |
|---|---|---|
| Partners | Strategic Alliances & Joint Ventures; Resellers & Distributors; Referral & Affiliates; Co-delivery & Collaborators; Associations & Communities | Both; Resellers = Offering (channel); Associations = Infrastructure |
| Suppliers | Materials & Goods; Subcontractors & Freelancers; Logistics & Fulfilment | Offering |
| Suppliers | Professional Services; Facilities & Property | Infrastructure |
| Suppliers | Technology & Platforms; Payment & Finance Services; Marketing & Creative Services | Both: Offering when the card links to offerings or a channel, Infrastructure when it links to none |

### 3. Do groups help to see the place and the cost behaviour?

I compared the Resource categories and groups of parts 2 and 3. The test: *does knowing the group tell you the place or the behaviour better than the category alone?*

| Category | Groups | Place from category | Behaviour from category | Do the groups add anything? |
|---|---|---|---|---|
| Workspace | none (kinds are the Workspace type) | Infrastructure | F | No groups needed |
| Utilities | Electricity; Heating & Cooling; Water & Waste; Connectivity | Infrastructure | S for all four | **No** for place or behaviour; useful only as a prompt (a checklist of what to record) |
| Workstation | Furniture & Accessories; Electrical | Infrastructure | F for both | **No**; prompt only |
| Equipment | Computing & Peripherals; Specialized; Production Machinery & Tools; Vehicles & Transport | Mixed | Mixed | **Yes**: machinery is Offering and S; computers are Infrastructure and F |
| Digital Infrastructure | Software; Digital Services; Online Presence & Communication | Both | Mixed (F, S, V) | **Weak**: behaviour varies inside Digital Services; the driver decides it |
| Materials & Inventory | Materials & Components; Packaging & Consumables; Stock | Offering | V | **No**; prompt only |
| Intellectual Property & Licences | Trade marks, Patents & Designs; Content & Know-how; Licences, Permits & Certifications | Both | F; royalties V | **Partly**: licences and certifications can be product-specific (Offering) |
| Human Resources | Founders & Owners; Team | Both | F base, V incentives | **No** for behaviour (pay type decides); the allocation by delivery hours decides the place |

**Result.** The category alone tells the place and behaviour in most cases. The groups help to identify them in only **Equipment** (clearly), **Intellectual Property** (partly) and **Digital** (weakly). Elsewhere they are **prompts**: they help the founder to think of every item and document it, which you named as their purpose.

**Recommend a two-level default:** the category carries a default place and behaviour; a group may override it (machinery overrides Equipment's place and behaviour). The user can override on the card. Keep groups where they serve as prompts, but do not add groups whose only job is to hold a behaviour; the cost driver carries that.

### 4. Separate sets for Infrastructure, Offering and Channel

I agree with separate sets, because the questions differ: Infrastructure asks "what does the organization need to exist", Offering asks "what does each offering need", and channel resources are generated, not typed.

| Section | Categories | Groups |
|---|---|---|
| Infrastructure | Workspace; Utilities; Workstation; Equipment; Digital Infrastructure; Intellectual Property & Licences; Human Resources | As in section 3; Equipment: Computing & Peripherals, Specialized, Vehicles & Transport |
| Offering's Capability | Materials & Inventory; Equipment; Digital Services; Licences & Certifications; Workspace (pop-up, project site); Human Resources (delivery team) | Equipment: Production Machinery & Tools; Vehicles & Transport. Materials: Materials & Components; Packaging & Consumables; Stock |
| Channel (automatic) | No categories to type. The group is **filled automatically from the channel's category**: Social Media, Community, Website, Marketplace, In Person, Email, Online / Live, Direct Payment, File Delivery, Physical Delivery, Other | The Journey Stage (Discovery, Evaluation, Purchase, Delivery, Support) is shown as a tag, not a group |

**Why the channel category and not the journey stage as the group:** cost behaviour follows the type of channel (marketplace commission is variable, an in-person stall is a step, a courier is variable, a website platform is fixed), not the stage. The 11 channel categories already exist and are set by the Customer Engagement page, so the user types nothing, and a channel card can never be moved into the wrong group.

### 5. Digital Services, and Vehicles under Equipment

**Cloud, Data & Security and Platforms & APIs under Digital Services: yes.** Digital Infrastructure then keeps the three groups it has today: **Software; Digital Services** (storage, cloud, back-up, security, platforms and APIs); **Online Presence & Communication**. This removes two groups I proposed and changes nothing in the app. The cost behaviour inside Digital Services is mixed (a storage plan is fixed, an API is per call), so the card's driver decides it, not the group.

**Vehicles & Transport under Equipment: yes.** A vehicle is an asset you own or lease, like equipment. Equipment gets a group **Vehicles & Transport** (vehicles, vans, bikes). Running costs (fuel, charging, maintenance, insurance) are separate cards in the same group, semi-variable or variable by distance. This removes the Vehicles category. Place: Both (a company car is Infrastructure; a delivery van for one offering is Offering).

### 6. The Costs section, the "When", and a Payment plan

**Costs section.** Agreed: auto-generated, core information only. Suggested columns: cost and source (link), amount, behaviour, frequency or driver, and the group totals. The "When" moves out of it, to the payment plan and a payment timeline.

**Payment plan.** An optional part on a card: a short list of payments, each with an amount or share and either a date or a trigger relative to the project (signing, start, 50% progress, delivery, N days after invoice). Shares add up to 100%. Default: one payment.

#### Does it affect the break-even?

It depends on which break-even.

| Measure | Affected by payment dates? | Why |
|---|---|---|
| Break-even quantity (units to cover fixed costs) | No | It uses total fixed costs and the margin per unit. The dates move the money, not the amount. |
| Break-even point in profit terms (accounting) | No | Costs are recognised in the period they relate to, not when they are paid. |
| **Cash break-even month** (when cumulative cash turns positive) | **Yes** | A deposit or a large instalment early pushes it later; customer milestones paid early pull it forward |
| **Peak funding need** and runway | **Yes** | The lowest cumulative cash point is driven by the dates of the largest payments |

Recommend:

keep the existing break-even quantity unchanged, and add two outputs fed by the payment plan: the

cash break-even month

and the

peak funding need

(with the month it happens). They answer decisions such as: can I buy this equipment now or after the first sale, should I ask the supplier for milestones instead of a deposit, how large must the funding be, and when can I hire. A

payments timeline

(read-only, by month, money out and money in) replaces the "When" column and shows the cash path. Recurring costs (monthly, quarterly, annual) take a start date and an optional end date instead of a plan. Per unit, per order and per project costs follow the sales timeline of their offerings, not a card date.

### Decisions for you

- Channel resource groups filled automatically from the channel's category, with the journey stage as a tag?
- Partners and Suppliers with categories only?
- Groups kept as prompts, with a two-level default (group overrides category)?
- Digital Infrastructure back to three groups; Vehicles & Transport as a group of Equipment?
- Cash break-even month and peak funding need as new outputs from the payment plan?

### Sources

- Channel table and resource rules: read from the app's specification (page-2-section-1-channels.md) and from the Lumen example data.
- Payment structures and cost allocation: see part 3. Break-even and cash-flow distinction: standard accounting practice; no new source was searched in this round.

## R5. Industry costs compared with the app, and graded insurances

Written from general knowledge, not from a single source. Names and rules change by country, so check local rules. Nothing is changed in the app.

### 1. Costs particular to an industry, and where the app holds each

> **Result:** of 98 costs, **83** have a home in the app's groups, **11** have none (red), and **4** are not costs at all (grey): a price that moves, a cash timing or lost revenue.

| Industry | Cost | Where the app holds it |
|---|---|---|
| Food and drink | Food-hygiene registration | Legal Entity (registrations) |
|  | Hygiene inspections | Approvals & Testing |
|  | Cold-chain storage | Workshop & Storage (Chiller space) |
|  | Cold-chain transport | Delivery Vehicles (Refrigerated truck) |
|  | Waste fat and oil collection | Process Utilities (waste services) |
|  | Pest control | Property & Facilities (Infrastructure), Contractors & Advisers (Offering) |
|  | Alcohol or street-food licence | Legal Entity, or Approvals & Testing |
|  | Allergen labelling and testing | Approvals & Testing, Materials & Stock (labels) |
|  | Shelf-life waste | GAP |
| Retail and shops | Shop licence | Legal Entity |
|  | Till and card-reader fees | Platforms & Payments, Project Kit (card reader) |
|  | Security tags and cameras | Fixtures & Displays |
|  | Stock loss (shrinkage) | GAP |
|  | Window and display refresh | Fixtures & Displays |
|  | Seasonal staff | Delivery Team |
|  | Returns handling | Returns & Warranty |
| Online selling | Marketplace and platform fees | Platforms & Payments (channel T3) |
|  | Payment and chargeback fees | Platforms & Payments (T2) |
|  | Packaging and inserts | Materials & Stock |
|  | Fulfilment and returns | Logistics & Fulfilment, Returns & Warranty |
|  | Paid advertising | Agencies & Influencers (T4) |
|  | Customer-service tools | Sales & Delivery Tools, Office Software & Web |
| Software and digital services | Cloud hosting | Cloud & Security, Platforms & APIs |
|  | Per-use API and AI charges | Platforms & APIs |
|  | Security audits and certification | Approvals & Testing |
|  | App-store commissions | Platforms & Payments |
|  | Domain and certificate renewals | Office Software & Web |
|  | Support and monitoring tools | Sales & Delivery Tools, Office Software & Web |
| Making and crafts | Kiln or oven energy | Process Utilities |
|  | Calibration of scales and instruments | GAP (maintenance by Technical Support) |
|  | Waste and chemical disposal | Process Utilities |
|  | Product-safety tests | Approvals & Testing |
|  | Raw-material price swings | NOT A COST (a price that changes) |
|  | Sample making | Materials & Stock |
|  | Fair and market fees | Site Hire |
| Construction and trades | Site and parking permits | Site Hire |
|  | Skip and waste removal | GAP |
|  | Tool and plant hire | Project Kit |
|  | Protective equipment | GAP |
|  | Scaffolding | Project Kit, Contractors & Advisers |
|  | Subcontractors | Contractors & Advisers |
|  | Retention money held by clients | NOT A COST (cash timing) |
|  | Gas, electrical and building certificates | Approvals & Testing |
| Transport and delivery | Fuel cards | Delivery Running Costs |
|  | Tolls and congestion charges | Delivery Running Costs |
|  | Operator licence | Legal Entity, or Approvals & Testing |
|  | Vehicle tracking | GAP (an extra of Delivery Vehicles) |
|  | Driver licence checks | GAP (Delivery Team on-costs) |
|  | Vehicle tests | Delivery Vehicles (Annual inspection) |
|  | Goods-in-transit cover | Insurance, per vehicle or job |
| Health, beauty and wellbeing | Professional registration | GAP (an extra of the person's card) |
|  | Treatment-room hire | Site Hire, Workshop & Storage |
|  | Sterilisation and consumables | Materials & Stock |
|  | Product and treatment licences | Approvals & Testing |
|  | Client-record software | Office Software & Web, Sales & Delivery Tools |
|  | Continuing training | Admin Team and Delivery Team (Training extra) |
| Education and training | Accreditation and exam fees | Accreditation Bodies, Approvals & Testing |
|  | Venue hire | Site Hire |
|  | Course materials and platform | Designs & Content, Sales & Delivery Tools |
|  | Background checks | GAP (Delivery Team on-costs) |
|  | Certificates and printing | Materials & Stock |
|  | Learner insurance | Insurance |
| Events and hospitality | Venue hire | Site Hire |
|  | Temporary event licences | Site Hire, Approvals & Testing |
|  | Music licensing | Royalties |
|  | Security and stewarding | Contractors & Advisers, Delivery Team |
|  | Marquee, power and toilets | Site Hire, Contractors & Advisers |
|  | Agency staff | Contractors & Advisers |
|  | Cancellation risk | Insurance |
| Creative and media | Stock, font and music licences | Brand & Licences, Royalties |
|  | Software seats | Office Software & Web |
|  | Equipment insurance and replacement | Office Equipment (extra), Insurance |
|  | Location and model fees | Site Hire, Contractors & Advisers |
|  | Client revision time | NOT A COST (time already paid) |
|  | Royalties and usage fees | Royalties |
| Professional services | Professional registration and subscriptions | GAP (an extra of the person's card) |
|  | Indemnity insurance | Insurance |
|  | Continuing professional development | Admin Team (Training extra) |
|  | Research and data subscriptions | Office Software & Web |
|  | Travel to clients | Business Travel, Customer Travel |
| Farming and growing | Seed, feed and veterinary care | Materials & Stock, Contractors & Advisers |
|  | Land lease | Workshop & Storage, via a Landlords & Warehouses supplier |
|  | Machinery fuel and servicing | Production Machinery, Process Utilities |
|  | Organic or quality certification | Approvals & Testing |
|  | Weather and crop loss | Insurance, Contingency Fund |
|  | Subsidy compliance | GAP |
| Property letting | Mortgage interest | Financial foundation (financing) |
|  | Void periods | NOT A COST (lost revenue) |
|  | Management fees | Contractors & Advisers, Business Services |
|  | Gas, electrical and energy certificates | Approvals & Testing |
|  | Landlord insurance | Insurance |
|  | Repairs between tenants | Contingency Fund |
| Tourism and experiences | Guide and activity licences | Approvals & Testing |
|  | Booking-site commission | Platforms & Payments |
|  | Seasonal insurance | Insurance |
|  | Equipment hire and safety checks | Project Kit, Approvals & Testing |
|  | Transfers and permits | Customer Travel, Site Hire |
|  | Weather cancellations | Insurance, Contingency Fund |

### 2. The gaps

- **Stock loss and spoilage:** an example in Materials & Stock, or in Returns & Warranty.
- **Staff checks, registrations and memberships:** extras of the person's card (Recruitment and onboarding already exists on Admin Team).
- **Protective equipment:** an example in Project Kit.
- **Vehicle tracking:** an extra of the vehicle card.
- **Calibration:** maintenance by Technical Support.
- **Site waste removal:** an extra of Site Hire.
- **Subsidy compliance:** no home yet. It could sit in Business Services (Infrastructure) or as a pre-operational cost.

### 3. Insurances, graded

Mandatory means the law, a licence or a lease requires it. Recommended means most businesses of that kind carry it, and contracts often require it. Optional means a choice based on risk.

| Insurance | Grade | Linked to industry | Where to record it |
|---|---|---|---|
| Employers' liability | Mandatory when you employ staff (in many countries) | Every industry with employees | Legal Entity |
| Vehicle, third party | Mandatory for any vehicle on the road | Transport and delivery; any business with vehicles | Extra of the vehicle card |
| Professional indemnity | Mandatory in regulated professions, recommended for advisers | Professional services, health, software, creative, education | Legal Entity |
| Trade-specific (liquor, clinical negligence, contractors all-risks) | Mandatory where a licence or regulator requires it | Hospitality, health, construction | Legal Entity, or extra of the card that carries the risk |
| Buildings and contents | Mandatory when a lease or mortgage requires it, otherwise recommended | Any business with premises | Extra of the workspace card (supplier card when rented) |
| Public liability | Recommended; venues, clients and landlords often require it | Events, trades, retail, tourism, food and drink | Legal Entity |
| Product liability | Recommended; marketplaces and stockists often require it | Making, food and drink, retail, online selling | Legal Entity |
| Vehicle, comprehensive or fleet | Recommended | Transport and delivery | Extra of the vehicle card |
| Stock and goods in transit | Recommended | Making, online selling, transport and delivery | Extra of Workshop & Storage, or of the vehicle |
| Product recall | Recommended for consumer goods, optional elsewhere | Food and drink, making, retail | Legal Entity |
| Business interruption | Recommended for premises-dependent trades, optional elsewhere | Retail, food and drink, tourism | Legal Entity |
| Cyber | Recommended when you hold customer data | Software, online selling, health, professional services | Legal Entity, or extra of Cloud & Security |
| Key person and life | Recommended when one or two people carry the business; lenders may require it | Small businesses of every kind | Extra of the Founders & Owners card |
| Environmental and pollution | Required for some waste and chemical activities, otherwise optional | Farming, making, construction | Legal Entity |
| Equipment and machinery breakdown | Optional | Making, construction, creative | Extra of the equipment card |
| Event cancellation | Optional | Events, tourism | Extra of Site Hire, per event |
| Directors and officers | Optional; recommended with investors | Companies with outside investors | Legal Entity |
| Legal expenses | Optional | Any | Legal Entity |
| Crime and fidelity | Optional | Retail, professional services holding client money | Legal Entity |
| Trade credit | Optional | Businesses that sell on credit | Legal Entity (financial foundation) |
| Group health and income protection | Optional (mandatory schemes exist in some countries) | Any with staff | Extra of the Admin Team or Delivery Team card |

### 4. Public liability and an event

- An annual public liability policy usually covers events up to its limit. Record it once, in Legal Entity.
- The Site Hire card holds a field **Cover required**, the limit the organiser or venue asks for. The event card links to the policy and compares the two.
- An extra cost for the event exists only when the policy falls short: the required limit is higher, the policy excludes the activity (for example fireworks or inflatables), or the organiser asks for a one-off policy.

## R6. Event card: three examples

Recommendation only; nothing is changed in the app.

> **How the event card works.** It belongs to an activity and sits among its event cards. It **records** the dates and the links, and it **presents** the cost of each linked card and their total. It holds no price. Each linked card keeps its own price, and the event counts it by that card's driver: a per project price in full, a monthly or annual price for the days of the event, a per unit price by the units used, an hourly price by the hours worked, and a percentage by the revenue. The revenue belongs to the offering and is unknown when the event is planned, so a line that depends on revenue stays open and shows its rate.

### Example 1. Craft-fair weekend

**Activity: Sell at fairs and markets** | Offering: Woven scarves | 2 days, 12 to 13 June

| No. | Linked card (group) | Card | Counted by its driver | Cost |
|---|---|---|---|---|
| 1 | Site Hire | Market pitch fee | Per project: the full price | 120.00 |
| 2 | Site Hire | Cover for the event (public liability) | Per project: the full price | 25.00 |
| 3 | Project Kit | Stall display kit | Annually 300.00: 2 of 365 days | 1.64 |
| 4 | Delivery Vehicles | Transit van | Monthly 400.00: 2 of 30 days | 26.67 |
| 5 | Delivery Running Costs | Fuel | Per unit 18.00: 2 trips | 36.00 |
| 6 | Customer Travel | Overnight stay | Per unit 85.00: 1 night | 85.00 |
| 7 | Delivery Team | Stall assistant | Per hour 12.50: 16 hours | 200.00 |
| 8 | Platforms & Payments | Card processor | Open until revenue exists: 1.75% of revenue | open |
|  | Estimated cost of the event (open lines excluded) | 494.31 |  |  |

The pitch fee and the cover are per project, so they count in full. The van and the kit count for the two days of the fair. The card fee is a percentage, so it stays open until the offering has revenue.

### Example 2. Kitchen installation at a customer's home

**Activity: Install fitted kitchens** | Offering: Kitchen installation | 5 days, 3 to 7 March

| No. | Linked card (group) | Card | Counted by its driver | Cost |
|---|---|---|---|---|
| 1 | Site Hire | Parking-bay suspension permit | Per project: the full price | 60.00 |
| 2 | Delivery Vehicles | Transit van | Monthly 650.00: 5 of 30 days | 108.33 |
| 3 | Delivery Vehicles | Goods-in-transit cover for the cabinets | Per project: the full price | 40.00 |
| 4 | Delivery Running Costs | Diesel | Per unit 22.00: 5 daily trips | 110.00 |
| 5 | Project Kit | Power tools | Annually 1,200.00: 5 of 365 days | 16.44 |
| 6 | Delivery Team | Installer | Per hour 25.00: 40 hours | 1,000.00 |
| 7 | Contractors & Advisers | Electrician | Per project: the full price | 480.00 |
| 8 | Materials & Stock | Cabinets and worktop | Per unit 150.00: 12 units | 1,800.00 |
| 9 | Approvals | Gas safety certificate | Per project: the full price | 90.00 |
|  | Estimated cost of the event (open lines excluded) | 3,704.77 |  |  |

The permit lets the van stand at the customer's kerb for the week. The gas safety certificate is issued by the installer for the hob connection, once per job. The goods-in-transit cover insures the cabinets while the van carries them.

### Example 3. One-day pottery workshop in a hired studio

**Activity: Run workshops** | Offering: Pottery workshop (12 places) | 1 day, 6 hours, 18 October

| No. | Linked card (group) | Card | Counted by its driver | Cost |
|---|---|---|---|---|
| 1 | Site Hire | Studio room slot | Per project: the full price | 150.00 |
| 2 | Site Hire | Cover for the event (public liability) | Per project: the full price | 35.00 |
| 3 | Delivery Team | Instructor | Per hour 40.00: 6 hours | 240.00 |
| 4 | Materials & Stock | Clay and glaze | Per unit 8.00: 12 participants | 96.00 |
| 5 | Project Kit | Demo case | Annually 400.00: 1 of 365 days | 1.10 |
| 6 | Agencies & Influencers | Local advertising | Per project: the full price | 90.00 |
| 7 | Platforms & Payments | Payment fee, per transaction | Per unit 0.30: 12 payments | 3.60 |
| 8 | Platforms & Payments | Payment fee, percentage | Open until revenue exists: 2.9% of revenue | open |
|  | Estimated cost of the event (open lines excluded) | 615.70 |  |  |

An online course is an offering: its sessions repeat, and its booking app is the card of the booking channel, shared by every sale. Neither belongs to one event card.

### Rules the examples use

- One card can serve many events: the van appears in examples 1 and 2 and counts only for each event's days.
- A per project card can exist without an event. It is counted the day it is linked to one.
- The total is calculated and cannot be typed.

### Questions for you

- Should the insurance of an event sit in Site Hire (as here), or in a group of its own?
- Should a monthly card count by days (as here) or by the number of events that share it?

## R7. Activity model: how an event or project connects the cards

Recommendation only; nothing is changed in the app. Arrows show a link from a card to the activity.

*Diagram, labels in order:* ACTIVITY CARD  (an event or a project) · Name: Craft-fair weekend · Dates: 12 to 14 June · Channel: Market stall · Expected revenue: 4,000 · TOTAL COST: sum of the linked cards · Margin: revenue minus total cost · Status: complete only with a price · SITE (Offering Resource) · Event & Project Sites · e.g. Market pitch fee, Marquee frame · Per project: counted once · TRAVEL (Offering Resource) · Customer Travel, Delivery Running Costs · e.g. Coach ticket, Overnight stay, Fuel · Per trip or per project · KIT AND VEHICLES (Resources) · Project Kit, Delivery Vehicles · e.g. Stall display kit, Transit van · Shared: only the share used counts · PEOPLE (Human Resources) · Delivery Team · e.g. Stall assistant, Installer · Per project, or hours worked · PARTNERS AND SUPPLIERS · Venues & Organisers, Contractors, · Revenue Partners, Accreditation Bodies · e.g. Fair organiser, Electrician · CHANNEL EXPENSES (teal) · T5 Stall, pitch, stand or event fee · T7 Travel and van hire, T8 Packaging · T12 Event or transit insurance · Cards created from the channel · PERMITS, CERTIFICATES, LEGAL · Approvals and event permits, linked · Company insurance and registrations · stay in Legal Entity (not counted · per activity) · TOTAL COST (calculated) · = every linked card's price for this · activity, added up; never typed. · One card can be linked to many · activities; its price is split or counted once.

### Rules

- **The card holds the price, the activity only links.** A cost is entered once, on its card (site, ticket, van, supplier). The activity never has its own copy.
- **Total cost is calculated:** the sum of the linked cards' prices for this activity. Revenue minus total cost gives the margin.
- **Per project** cards (a pitch fee, a permit, event insurance) count in full for the one activity they are linked to.
- **Shared cards** (a van, kit, a salaried assistant) can be linked to many activities; the share counted per activity needs a rule (decision below).
- **An event with more expenses than its site** gets an Activity card; the site card stays the site paid for that project.
- **The channel** the activity sells through creates its teal expense cards (stall fee, travel, insurance) and links them automatically.
- **Legal Entity** expenses (company insurance, registrations) are not split per activity.

### Decisions for you

- How is a shared card's cost counted per activity: by the days or hours the activity uses it, an equal split, or a figure typed on the link?
- May a Per project card exist without an activity, or must it be linked to one?
- Does the Activity card hold the revenue, or does the channel?

## R8. Cards priced per project

Pink = Infrastructure, brown = Offering. Recommendations only; nothing is changed in the app.

### 1. Groups whose main driver includes Per project (10)

| Place | Category | Group | Main driver | Companion price | Extras? | Kinds |
|---|---|---|---|---|---|---|
| Infrastructure | Transport & Travel | Business Travel | Per unit (trip); Per project | Visa, travel insurance | No | — |
| Infrastructure | Suppliers | Creative & IT Services | Per project | Retainer | No | — |
| Offering | Workspace | Event & Pop-up Space | Per project (event) | Permit, insurance | No | — |
| Offering | Workspace | Project Sites | Per project | Access permit | No | — |
| Offering | Transport & Travel | Customer Travel | Per unit (trip); Per project | — | No | — |
| Offering | Intellectual Property | Approvals | Per project; Annually | Surveillance audit | No | — |
| Offering | Suppliers | Contractors & Advisers | Per project; Per unit (hour) | Discovery fee | No | — |
| Offering | Suppliers | Agencies & Influencers | Per project | Retainer, share of sales | Yes | 2, 5 |
| Offering | Suppliers | Venues & Organisers | Per project (event) | Set-up, cancellation | No | — |
| Offering | Partners | Revenue Partners | % of revenue; Per project | Onboarding fee, minimum guarantee | Yes | 1, 6 |

### 2. Extra costs and channel prices with a Per project driver (6)

| Place | Group | Item | What it is | Role | Kind | Driver | Beh. |
|---|---|---|---|---|---|---|---|
| Infrastructure | Admin Team | Training | A course or certification for the person. | Extra line | 1 One-time charge | One-time; Per project | St |
| Offering | Event & Pop-up Space | Stall, pitch, stand or event fee | The price of a place to sell for the length of one event. | Channel expense (main price) | P | Per project (event) | St |
| Offering | Customer Travel | Travel and van hire | Getting to a customer, a market or a fair, with the hire of a van. | Channel expense (main price) | P | Per project; Per unit (trip) | V |
| Offering | Accreditation Bodies | Assessment or exam | The charge to be assessed for the accreditation. | Own card | 3 Check or event charge | Per project | St |
| Offering | Contractors & Advisers | Event or transit insurance | Cover for a market stall, a fair or goods on the move. | Channel expense (main price) | P | Per project | St |
| Offering | Agencies & Influencers | Ads and influencers | The price of a campaign, a post or a print job. | Channel expense (main price) | P | Per project; Monthly budget | V |

Behaviour: V variable, St step. Source: the group table of version 8 and the extras data of versions 11 and 13.

## R9. Extra costs table

*Early data table, 2026-10-06 (converted from `extra-costs-table.csv`, since removed). The decided extras are in document 1, part D, section 8.*

| Place | Card type | Group or category | No. | Extra cost | What it is | Role | Kind | Driver family | Driver | Behaviour | Channel expense that creates it |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Infrastructure | Resource | Premises & Fit-out | 1 | Service charge | What the building charges for shared services, beside the rent. | Own card (a second card in the same group, explained by a message) | 2 Recurring charge | A paid on a schedule | Monthly | Fixed |  |
| Infrastructure | Resource | Premises & Fit-out | 2 | Business rates | A yearly tax on the premises. | Own card (a second card in the same group, explained by a message) | 2 Recurring charge | A paid on a schedule | Annually | Fixed |  |
| Infrastructure | Resource | Premises & Fit-out | 3 | Fit-out | The one-off works that make the space usable. | Own card (a second card in the same group, explained by a message) | 1 One-time charge | A paid on a schedule | One-time | Step |  |
| Infrastructure | Resource | Company Vehicles | 1 | Insurance | Cover for the vehicle. | Own card (a second card in the same group, explained by a message) | 2 Recurring charge | A paid on a schedule | Annually | Fixed |  |
| Infrastructure | Resource | Company Vehicles | 2 | Road tax | The yearly tax for using the vehicle on the road. | Own card (a second card in the same group, explained by a message) | 2 Recurring charge | A paid on a schedule | Annually | Fixed |  |
| Infrastructure | Resource | Company Vehicles | 3 | Annual inspection | The yearly check that the vehicle is fit for the road. | Own card (a second card in the same group, explained by a message) | 3 Check or event charge | A paid on a schedule | Annually | Step |  |
| Infrastructure | Resource | Founders & Owners | 1 | Employer on-costs | Taxes and pension the business pays on top of the salary. | Extra line (inside the card, under the Extra costs tick) | 5 Percentage charge | C follows a base figure | % of pay | Semi-variable |  |
| Infrastructure | Resource | Founders & Owners | 2 | Bonus | A reward on top of the pay, tied to results or paid once a year. | Extra line (inside the card, under the Extra costs tick) | 5 or 2 | C follows a base figure or A paid on a schedule | % of revenue; Annually | Variable or Fixed |  |
| Infrastructure | Resource | Founders & Owners | 3 | Training | A course or certification for the person. | Extra line (inside the card, under the Extra costs tick) | 1 One-time charge | A paid on a schedule | One-time | Step |  |
| Infrastructure | Resource | Admin Team | 1 | Employer on-costs | Taxes and pension paid on top of the salary. | Extra line (inside the card, under the Extra costs tick) | 5 Percentage charge | C follows a base figure | % of pay | Semi-variable |  |
| Infrastructure | Resource | Admin Team | 2 | Bonus | A reward on top of the pay. | Extra line (inside the card, under the Extra costs tick) | 5 or 2 | C follows a base figure or A paid on a schedule | % of revenue; Annually | Variable or Fixed |  |
| Infrastructure | Resource | Admin Team | 3 | Recruitment and onboarding | Finding and starting a new person: agency fee, advert, first equipment. | Extra line (inside the card, under the Extra costs tick) | 1 One-time charge | A paid on a schedule | One-time | Step |  |
| Infrastructure | Resource | Admin Team | 4 | Training | A course or certification for the person. | Extra line (inside the card, under the Extra costs tick) | 1 One-time charge | A paid on a schedule | One-time; Per project | Step |  |
| Infrastructure | Resource | Admin Team | 5 | A hire when the work grows | A new person needed once the workload passes a set point. | Extra line (inside the card, under the Extra costs tick) | 6 Minimum or threshold | A paid on a schedule | Other (threshold) | Step |  |
| Infrastructure | Supplier | Property & Facilities | 1 | Service charge | What the landlord charges for shared services, beside the rent. | Own card (a second card in the same group, explained by a message) | 2 Recurring charge | A paid on a schedule | Monthly | Fixed |  |
| Offering | Resource | Workshop & Storage | 1 | Service charge | What the unit charges for shared services. | Own card (a second card in the same group, explained by a message) | 2 Recurring charge | A paid on a schedule | Monthly | Fixed |  |
| Offering | Resource | Workshop & Storage | 2 | Insurance | Cover for the unit and its contents. | Own card (a second card in the same group, explained by a message) | 2 Recurring charge | A paid on a schedule | Annually | Fixed |  |
| Offering | Resource | Workshop & Storage | 3 | Handling per pallet | A charge for each pallet stored or moved. | Own card (a second card in the same group, explained by a message) | 4 Usage charge | B follows an activity | Per unit (pallet) | Variable |  |
| Offering | Resource | Production Machinery | 1 | Installation | Setting the machine up and bringing it into use. | Own card (a second card in the same group, explained by a message) | 1 One-time charge | A paid on a schedule | One-time | Step |  |
| Offering | Resource | Production Machinery | 2 | Yearly servicing | The planned service that keeps the machine working. | Own card (a second card in the same group, explained by a message) | 3 Check or event charge | A paid on a schedule | Annually | Step |  |
| Offering | Resource | Production Machinery | 3 | Repair | Fixing the machine when it breaks. | Own card (a second card in the same group, explained by a message) | 3 Check or event charge | A paid on a schedule | Other (per event) | Step |  |
| Offering | Resource | Delivery Vehicles | 1 | Insurance | Cover for the van. | Own card (a second card in the same group, explained by a message) | 2 Recurring charge | A paid on a schedule | Annually | Fixed |  |
| Offering | Resource | Delivery Vehicles | 2 | Road tax | The yearly tax for using the van on the road. | Own card (a second card in the same group, explained by a message) | 2 Recurring charge | A paid on a schedule | Annually | Fixed |  |
| Offering | Resource | Delivery Vehicles | 3 | Annual inspection | The yearly check that the van is fit for the road. | Own card (a second card in the same group, explained by a message) | 3 Check or event charge | A paid on a schedule | Annually | Step |  |
| Offering | Resource | Sales & Delivery Tools |  | T1 Platform or tool subscription | Channel expense: the price of the channel card in this group; extra costs are listed below it. | Channel expense (card price) |  |  |  |  | T1 |
| Offering | Resource | Sales & Delivery Tools | 1 | Add-on or higher plan | An extra module or a larger plan, billed apart. | Own card (a second card in the same group, explained by a message) | 2 Recurring charge | A paid on a schedule | Monthly | Fixed |  |
| Offering | Resource | Sales & Delivery Tools | 2 | Set-up fee | A one-off charge to start using the tool. | Own card (a second card in the same group, explained by a message) | 1 One-time charge | A paid on a schedule | One-time | Step |  |
| Offering | Resource | Platforms & APIs | 1 | Monthly minimum | The least you pay each month, even if you use less. | Extra line (inside the card, under the Extra costs tick) | 6 Minimum or threshold | A paid on a schedule | Monthly | Step |  |
| Offering | Resource | Platforms & APIs | 2 | Overage | The price for use above an included allowance. | Extra line (inside the card, under the Extra costs tick) | 4 Usage charge | B follows an activity | Per unit | Variable |  |
| Offering | Resource | Royalties | 1 | Minimum guarantee | The least in royalties you pay over a year. | Own card (a second card in the same group, explained by a message) | 6 Minimum or threshold | A paid on a schedule | Annually | Step |  |
| Offering | Resource | Royalties | 2 | Advance | An amount paid up front against future royalties. | Own card (a second card in the same group, explained by a message) | 6 Minimum or threshold | A paid on a schedule | One-time | Step |  |
| Offering | Resource | Delivery Team | 1 | Employer on-costs | Taxes and pension paid on top of the salary. | Extra line (inside the card, under the Extra costs tick) | 5 Percentage charge | C follows a base figure | % of pay | Semi-variable |  |
| Offering | Resource | Delivery Team | 2 | Overtime | Extra hours when the work needs them, paid by the hour. | Extra line (inside the card, under the Extra costs tick) | 4 Usage charge | B follows an activity | Per unit (hour) | Variable |  |
| Offering | Resource | Delivery Team | 3 | Commission | A share of the sales the person brings in. | Extra line (inside the card, under the Extra costs tick) | 5 Percentage charge | C follows a base figure | % of revenue | Variable |  |
| Offering | Resource | Delivery Team | 4 | Piece rate | A fixed amount for each item the person makes or delivers. | Extra line (inside the card, under the Extra costs tick) | 4 Usage charge | B follows an activity | Per unit | Variable |  |
| Offering | Resource | Delivery Team | 5 | Recruitment and onboarding | Finding and starting a new delivery person. | Extra line (inside the card, under the Extra costs tick) | 1 One-time charge | A paid on a schedule | One-time | Step |  |
| Offering | Resource | Delivery Team | 6 | A hire when volume grows | A new person needed once sales pass a set point. | Extra line (inside the card, under the Extra costs tick) | 6 Minimum or threshold | A paid on a schedule | Other (threshold) | Step |  |
| Offering | Partner | Revenue Partners |  | T10 Referral or reseller commission | Channel expense: the price of the channel card in this group; extra costs are listed below it. | Channel expense (card price) |  |  |  |  | T10 |
| Offering | Partner | Revenue Partners | 1 | Onboarding fee | A one-off fee to start working with the partner. | Own card (a second card in the same group, explained by a message) | 1 One-time charge | A paid on a schedule | One-time | Step |  |
| Offering | Partner | Revenue Partners | 2 | Minimum guarantee | The least you pay the partner over a year, whatever is sold. | Own card (a second card in the same group, explained by a message) | 6 Minimum or threshold | A paid on a schedule | Annually | Step |  |
| Offering | Partner | Accreditation Bodies | 1 | Assessment or exam | The charge to be assessed for the accreditation. | Own card (a second card in the same group, explained by a message) | 3 Check or event charge | A paid on a schedule | Per project | Step |  |
| Offering | Partner | Accreditation Bodies | 2 | Audit visit | The yearly visit that confirms you still qualify. | Own card (a second card in the same group, explained by a message) | 3 Check or event charge | A paid on a schedule | Annually | Step |  |
| Offering | Supplier | Materials & Goods | 1 | Minimum order | The least you must buy at one time. | Own card (a second card in the same group, explained by a message) | 6 Minimum or threshold | B follows an activity | Per unit (minimum) | Step |  |
| Offering | Supplier | Materials & Goods | 2 | Tooling | A one-off charge for the mould, plate or tool made for you. | Own card (a second card in the same group, explained by a message) | 1 One-time charge | A paid on a schedule | One-time | Step |  |
| Offering | Supplier | Materials & Goods | 3 | Import duties | Taxes and duties charged on goods brought from abroad. | Own card (a second card in the same group, explained by a message) | 4 Usage charge | C follows a base figure | % of cost | Variable |  |
| Offering | Supplier | Logistics & Fulfilment |  | T9 Courier, postal, fulfilment | Channel expense: the price of the channel card in this group; extra costs are listed below it. | Channel expense (card price) |  |  |  |  | T9 |
| Offering | Supplier | Logistics & Fulfilment | 1 | Monthly account fee | A fixed fee for having the account, whatever you ship. | Extra line (inside the card, under the Extra costs tick) | 2 Recurring charge | A paid on a schedule | Monthly | Fixed |  |
| Offering | Supplier | Logistics & Fulfilment | 2 | Fuel surcharge | A percentage the carrier adds to the price for fuel. | Extra line (inside the card, under the Extra costs tick) | 4 Usage charge | C follows a base figure | % of cost | Variable |  |
| Offering | Supplier | Logistics & Fulfilment | 3 | Minimum monthly volume | The least you must ship, or pay for, each month. | Extra line (inside the card, under the Extra costs tick) | 6 Minimum or threshold | A paid on a schedule | Monthly | Step |  |
| Offering | Supplier | Agencies & Influencers |  | T4 Ads and influencers | Channel expense: the price of the channel card in this group; extra costs are listed below it. | Channel expense (card price) |  |  |  |  | T4 |
| Offering | Supplier | Agencies & Influencers | 1 | Monthly retainer | A fixed monthly fee for the agency. | Own card (a second card in the same group, explained by a message) | 2 Recurring charge | A paid on a schedule | Monthly | Fixed |  |
| Offering | Supplier | Agencies & Influencers | 2 | Share of sales | A percentage of what the work brings in. | Own card (a second card in the same group, explained by a message) | 5 Percentage charge | C follows a base figure | % of revenue | Variable |  |
| Offering | Supplier | Landlords & Warehouses | 1 | Service charge | What the owner charges for shared services, beside the rent. | Own card (a second card in the same group, explained by a message) | 2 Recurring charge | A paid on a schedule | Monthly | Fixed |  |
| Offering | Supplier | Platforms & Payments |  | T2 Payment processing fees | Channel expense: the price of the channel card in this group; extra costs are listed below it. | Channel expense (card price) |  |  |  |  | T2 |
| Offering | Supplier | Platforms & Payments |  | T3 Marketplace fees and commission | Channel expense: the price of the channel card in this group; extra costs are listed below it. | Channel expense (card price) |  |  |  |  | T3 |
| Offering | Supplier | Platforms & Payments | 1 | Monthly fee | A fixed fee for the account, charged whatever you sell. | Extra line (inside the card, under the Extra costs tick) | 2 Recurring charge | A paid on a schedule | Monthly | Fixed | T3 |
| Offering | Supplier | Platforms & Payments | 2 | Percentage of each sale | The share of every sale the processor or marketplace keeps. | Extra line (inside the card, under the Extra costs tick) | 5 Percentage charge | C follows a base figure | % of revenue | Variable | T2, T3 |
| Offering | Supplier | Platforms & Payments | 3 | Charge per transaction | A flat amount for each payment or order. | Extra line (inside the card, under the Extra costs tick) | 4 Usage charge | B follows an activity | Per unit (order) | Variable | T2 |
| Offering | Supplier | Platforms & Payments | 4 | Listing fee | A charge for each product listed on a marketplace. | Extra line (inside the card, under the Extra costs tick) | 4 Usage charge | B follows an activity | Per unit (listing) | Variable | T3 |
| Offering | Supplier | Platforms & Payments | 5 | Set-up fee | A one-off charge to open the account. | Extra line (inside the card, under the Extra costs tick) | 1 One-time charge | A paid on a schedule | One-time | Step | T2 |
| Offering | Supplier | Platforms & Payments | 6 | Chargeback and currency fees | Fees when a payment is disputed or converted to another currency. | Extra line (inside the card, under the Extra costs tick) | 4 Usage charge | B follows an activity or C follows a base figure | Per unit; % of revenue | Variable |  |

## R10. Business System analysis (2026-10-14)

Method: read-only audits of the code and the specifications, plus web research graded as in document 2. Nothing was changed in the app. Findings are facts from the code; "suggestion" marks a proposal. The requirements that follow from them are in document 5.

### R10.1 How the business pages connect today

| Link | Today | Consequence |
|---|---|---|
| Needs to Offering | `needsAddressed` stores the need's **text**, not an id | Renaming a need breaks the link silently |
| Value Proposition | One text per segment, not derived from needs and offerings | Nothing checks it against the offering |
| Offering type | Product, Service, Hybrid or Other; any string accepted; read only by the Offering tile and the document export | The type decides nothing |
| Relationship type | Five types (Self-Service, Personal Assistance, Dedicated Support, Community, Automated Service), each defined only by id, label and one sentence | Types cannot be told apart by rules |
| Goals Get / Keep / Grow | Optional ticks per offering and journey stage; read only by the export | No target, no metric, no use in Financial or Sustainability |
| Approach and actions | Linked only by shared offering id and stage ids | The help text promises that actions appear with the approach; nothing displays them |
| Demand and channels | `demand.channelIds` is saved, nothing reads it | No cost per customer by channel |
| Channel expenses | Create real Resource, Partner or Supplier cards (templates T1–T12); Financial Foundation reads them as ordinary offering costs | The channel link itself is not read by finance; removing a channel leaves its cards |
| Delivery Team cards | Resource cards in Human Resources > Delivery Team with a required offering link | The Delivery card does not read them (decided 2026-10-14 to connect them) |
| Strategy | Only "Current Situation" is drafted from business data; themes come from a fixed list; initiatives are plain text | Business data does not feed the strategy cards |
| Global Settings | Hold values that belong to a business (tax, fees, contingencies, plan dates) | See R10.6 |

### R10.2 Relationship types and goals

- The types follow the Business Model Canvas relationship types (self-service, personal assistance, dedicated assistance, automated services, communities, co-creation; motives acquisition, retention, upselling). Source grade: practitioner (document 2, section 2.3).
- The spec chain is Profile, Relationship Type, Purpose, Offering, Journey Stage, Channel, Approach, Goal. The Profile's "Goals & Desires" is deliberately not the relationship Purpose.
- **Goals:** Get, Keep and Grow are optional ticks per interaction. The only completeness rule for the page is one named channel and one Relationship Type with a purpose. Missing: a target, a link to the figure each goal affects (Get to the funnel and expected sales; Keep to cancel per month; Grow to repeat purchases), any roll-up above the interaction, and any use in Strategy.
- **Demand** is optional by design ("nothing here is required") and feeds expected sales, which Sustainability and the capacity check use.

### R10.3 Expenses created through channels

1. Each channel cell offers "Add expenses": a blank expense, all typical costs, one typical cost, or "Link existing".
2. A blank or typical expense creates a real card in Offering's Capability (resource, supplier or partner) and a link record on Customer Engagement. Amount, frequency and unit live only on the card.
3. Template cards start with a **blank price**, so they stay incomplete until priced.
4. Ticking the channel's offerings overwrites the card's offering links and resets the shares to equal parts.
5. Financial Foundation reads these cards as ordinary offering costs (behaviour variable when per unit or per project); percent-of-revenue cards (T2, T3, T10) become cost of sales through the Global Settings fee table, matched by card **name**.
6. Not connected: cost per acquired customer; spend against demand per channel; shares weighted by demand.
7. Gaps found: removing a channel leaves its cards (probable, not run); renaming a template card breaks template and fee matching.

Channel cost templates: T1 platform or tool subscription; T2 payment processing fees; T3 marketplace fees and commission; T4 ads and influencers; T5 stall, pitch, stand or event fee; T6 display kit or hardware; T7 travel and van hire (filed under Tickets & Trip Costs although it says van hire); T8 packaging and samples; T9 courier, postal, fulfilment; T10 referral or reseller commission; T12 event or transit insurance. T11 was removed.

### R10.4 Delivery

- **Delivered**: per unit or every month. Per unit: hours per person per unit and *Calendar Time (weeks)*. Every month: *Hours Given* per week or per month and hours per client; no calendar time.
- The weeks are elapsed time only. They give the "While one runs: hours a week" line and "about N running at once"; they are never multiplied into hours and never turned into dates.
- Capacity is the founders' delivery hours. The capacity check compares expected sales times each person's hours with it, recurring work first. People listed on the Delivery card: every founder, and the partners linked to that offering. Suppliers (including Logistics & Fulfilment) and Delivery Team cards are not listed.
- "By weight or zone" on Logistics & Fulfilment is a label with per-parcel pricing; it has no weight or zone fields.

### R10.5 Identity Organization and Infrastructure: fields asked about

| Item | Exists | Where and what |
|---|---|---|
| Working hours | Yes, per founder | Founder card: Working Hours, Delivery Hours, frequency; fixed 52/12 week-to-month rule |
| Legal form | Yes (a legal form, not a business model) | Legal Entity, Organization tile; the drawings and registry rules read the label text with a pattern |
| Delivery model | Partly | Per offering on the Delivery card (per unit or monthly) |
| Team size | No (derived from founders; staff are cards with a quantity) | Delivery Team cards add cost but no hours to capacity |
| Languages | No | Decided 2026-10-14: the app is English only |
| Service area | No | Decided: Logistics & Fulfilment covers delivery pricing |
| Currency override | Per cost card only | Organization currency derives from the country; mixed currencies are never summed or converted |

### R10.6 Global Settings: what could move (suggestions)

| Setting | Proposed home |
|---|---|
| Income tax rate (global) | Remove: it silently overrides the Financial Foundation rate |
| Income tax basis and rate | Identity > Organization > Legal Entity > Tax |
| VAT/GST basis | Same card as "registered?" |
| Opening Date, Plan Start, Plan Length | Financial Foundation plan header; Strategic Period shows them read-only |
| Contingency rates, reserve months | Financial Foundation > Funding Need |
| Employer on-cost rate | Financial Foundation > Costs, people costs |
| Insurance per employee | The key-person health card (already overrides it) |
| Capitalisation limit | Financial Foundation > Costs, classification |
| Useful life per asset group | Infrastructure > Resources, group default |
| Royalty, affiliate, agent rates | Partner or Supplier card; Referral & Affiliates subchannel |
| Channel Fee Table | Channel or subchannel card, found by id |
| Date format, user name, reading mode, focus mode | Stay global (per user and device) |

### R10.7 Screens and accessibility

- Website profiles (`NorthStardustStudioWebsite/README.md`, mirrored in `main.js`): Desktop ≥1200 wide and ≥1250 high; Laptop ≥1200 wide and <1250 high; Tablet 768–1199; Mobile ≤767; reference cases 1440×1024 and 1440×864.
- Android window size classes (cross-check): width 600 / 840 / 1200 / 1600; height 480 / 900.
- Today: about 55 media and container rules with inconsistent values; the layout check runs at 1920 px, light mode only; sepia is not checked.
- WCAG 2.2 AA: new criteria 2.4.11, 2.5.7, 2.5.8, 3.3.8. The 768 px floor may conflict with 1.4.10 Reflow (320 CSS px); not verified.

### R10.8 Evidence from small-business research

Home-based work is lasting for small businesses (Malik et al. 2024; Kim and Parker 2021); the EU average working week is 36.0 hours and own-account workers work more hours than employees in most countries (Eurostat 2025), so a 40-hour default is not supported. For CRM and relationship types in small firms only a conceptual model was found (Chaudhry 2007). **Unsupported by a strong source and therefore assumptions:** the five-field relationship definition, the Get/Keep/Grow link to figures, the typical channel mix of a solo business.

