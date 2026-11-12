# 49. Strategy: SWOT, Compass, Themes and Metrics, as proposed

Status: **proposal**, written 2026-11-12, updated 2026-11-12. The owner approved it on 2026-11-12 (D7 to D10, D16 to D22). Built in phases 2 (Strategy reads the Business), 3 (Direction) and 6 (Initiatives and Activities). Nothing here is built yet.

Related: doc 40 (the form), doc 45 (PB7 and PB8, which this page reads), doc 46 (BA1), doc 47 and doc 48 (the figures read), doc 28 (9.3 and 9.4, the skill areas), doc 5 (5.5.7), `src/framework/engine/AnswerStrategy.ts`, doc 2 (the sources).

## 1. The wording rules

Every question follows the wording rules of doc 28, section 4, and these, decided for this page (owner, 2026-11-12):
- an "i" never repeats its label or what the screen already shows (such as the "2 max" chip); references always last;
- each Rating Scale has its row name at 5, and the meaning of 1 and 5 first in its "i";
- every generated sentence uses one phrase per option, in the business's "we" and "our" voice; a phrase that can be joined holds no "and" of its own; lists join as "A, B and C" with `joinNames` (`src/framework/engine/businessDocuments/plan.ts`).

## 2. The page, question by question

### 2.1 What the page holds today

One page, one chapter "Situation & Direction", four Master Tiles: **Current Situation Analysis** (a draft from the Business System, followed until edited); **SWOT Analysis** (four lists); **Strategic Compass** (one text, the Vision in its "i"); **Strategic Period** (Start and End beside the Financial Plan's dates, the Roadmap Diagram tile, a tile per **Theme**; a Theme's card holds **Goals**, each Goal **Objectives** with a period, an owner, **Initiatives** and **Metrics**: name, unit, currency, baseline, target, frequency).

### 2.2 How the page maps onto the research

| Rumelt's kernel | The page | Balanced Scorecard |
|---|---|---|
| Diagnosis | Current Situation, SWOT | the perspectives' starting point |
| Guiding policy | Strategic Compass | the strategy behind the map |
| Coherent actions | Themes → Goals → Objectives → Initiatives, with Metrics; the Roadmap | objectives with measures, targets and initiatives, each with an owner and a schedule |

### 2.3 The SWOT

The SWOT is the founder's own, distinct from the Competitor SWOT (Thanos, 2026-11-04). The four lists stay; the dialog gains one question, sourced suggestions, a priority order and a reminder.

#### SW1 (SWOT dialog, the Opportunities and Threats band, above the two lists)

- **Label:** How could these changes affect you?
- **Control:** a Rating Group with ticks. Each row has a tick; its 1 to 5 rounds show when the row is ticked.
- **Rows** (the Segment's change list, as built): Technology; Rules and law; The economy; Society and lifestyle; Supply and delivery; Environment and climate.
- **Starts from:** the changes ticked on any Segment start ticked and come first, the most ticked first.
- **"i":**
  - 1 = Threat, 5 = Opportunity; 3 = little effect either way.
  - How each change could help or hurt your business. The changes your Segments named start ticked.
  - Based on: Aguilar (1967), *Scanning the business environment* (the external scan behind PESTLE).
- **Saved as:** `strategyFoundation.changeEffects: Record<changeId, 1..5>`.
- **Read by:**
  - The Opportunity suggestion "Changes in [change, lower case] could help you" (4 or 5).
  - The Threat suggestion "Changes in [change, lower case] could hurt you" (1 or 2).
  - SC1's start.

#### The suggestions

Shown in each quadrant's band under its list: a line, an **Add** button, a muted source line that links to where it came from. Adding writes the line into the list, where it is the founder's. A line already in the list is not offered again. All wording affirmative.

| Quadrant | Suggestion | Source | Rule |
|---|---|---|---|
| **Strengths** | "Your chosen point of difference: [option]" | K14 | each Segment's Differentiation |
| | "Founders' skills: [skill]" | Founders Profile | each typed skill (until the skill areas exist, 2.9) |
| | "Funded to [month], with the funding need covered" | Page 4 | gap 0 and the runway reaches the period's end |
| | "Breaks even in [month]" | Page 5 | break even inside the plan |
| | "Room to deliver more: [n] hours a month spare" | Pages 3, 5 | delivery hours above the hours needed |
| **Weaknesses** | "Gap you named: [line]" | Capability, Gaps | each line of the Gaps text (until the skill areas exist) |
| | "Funding gap of [amount]" | Page 4 | gap above 0 |
| | "Break even falls beyond the plan" | Page 5 | none found within it |
| | "The plan holds up to [case] only" | Page 5 Stress Test | the first case that fails |
| | "More sales than hours to deliver them: [Offering]" | Page 5 Delivery Check | a shortfall |
| | "Customers want [value]; your Offerings are yet to lead on it" | Value Proposition, Unmet value | each item |
| | "[Offering] is still being built" | O2 | Still being built or Just an idea, from Launching on |
| | "[Offering] is priced below its cost of each sale" | Page 5, Offering Economics | price below the variable cost per unit |
| **Opportunities** | "Customers rate [value] highly, and competitors fall short on it" | K8 with B1 | K8 1 or 2 on a value a Profile rates 4 or 5 (the clear opening as built) |
| | "Your market is growing: [Segment]" | Box 5, Q2 | 4 or 5 |
| | "Room in an open market: [Segment]" | Box 5, Q4 | 1 or 2 |
| | "Changes in [change, lower case] could help you" | SW1 | 4 or 5 |
| | "[K10 opening], for [Segment]" | K10 | each ticked opening, once per Segment |
| | "Customers beyond your reach today: [PB8 label]" | PB8, Segments | PB8's rank above every Segment's (rank map, doc 45) |
| **Threats** | "Your market is shrinking: [Segment]" | Box 5, Q2 | 1 or 2 |
| | "A crowded market: [Segment]" | Box 5, Q4 | 4 or 5 |
| | "Changes in [change, lower case] could hurt you" | SW1 | 1 or 2 |
| | "[Competitor] is hard to beat on [value]" | K8 with B1 | K8 5 on a value a Profile rates 4 or 5 |
| | "[Competitor] is growing" | K4 | 4 or 5 |

#### The "waiting" line (under each SWOT band, and in the Theme menu)

- **Text:** "More suggestions appear once you add: [field], [field]."
- Each field is a link that scrolls to its target.
- **Shown:** only while a rule of that band needs a figure that is still empty. The fields named are the Expected sales (Customer Engagement), the price (Sustainability), the Financial Plan dates, and the Funding Need.

**The priority order:** the quadrant's "i" gains "Put the most important first." (the lists already reorder); SC1, the Themes and the Compass draft read the first lines first.

**The reminder:** the Review gains "Your SWOT was last changed [n] months ago" after six months (SCORE: at least twice a year).

**The Current Situation draft** gains, one line each where answered: the market (size, growth, crowding per Segment), the competition (count and Differentiation), readiness (O2 per Offering), the capacity check, the stress test. It keeps its follow-until-edited rule.

### 2.4 The Strategic Compass: three choices and a draft

The Compass is the guiding policy: the choice that rules options out. Three choices make it explicit; the text stays the founder's.

#### SC1 (Strategic Compass dialog)

- **Label:** What will this period's strategy mainly do?
- **Control:** one choice.
- **Options** (id – label – draft phrase):
  - `so` – Use your strengths to seize opportunities – using our strengths to seize opportunities
  - `wo` – Close your gaps by seizing opportunities – closing our gaps by seizing opportunities
  - `st` – Use your strengths to guard against threats – using our strengths to guard against threats
  - `wt` – Close your gaps and steer clear of threats – closing our gaps and steering clear of threats
- **Starts from the SWOT:** the pair of quadrants with the most lines, where the first two lines of each list count double. At Planning and Launching the start chooses between `so` and `wo` only.
- **"i":**
  - Match what is inside your business with what is outside it, then choose where the effort goes.
  - Your gaps are your SWOT's Weaknesses. Your SWOT suggests a start; change it freely.
  - Based on: Weihrich (1982), *The TOWS matrix: a tool for situational analysis*.
- **Saved as:** `strategyFoundation.stance`.

#### SC2 (Strategic Compass)

- **Label:** Where will growth come from in this period?
- **Control:** ticks, "2 max".
- **Options** (id – label – draft phrase):
  - `launch` – Your first customers, won at launch – win our first customers at launch. Shown at Planning and Launching only.
  - `penetration` – More sales to the customers you serve – sell more to the customers we serve
  - `market` – New customers or places for what you offer – take what we offer to new customers or places
  - `product` – New Offerings for the customers you serve – bring new Offerings to the customers we serve
  - `diversification` – New Offerings for new customers – bring new Offerings to new customers
- **Starts from:** the stage (Planning or Launching ticks `launch`). PB8's rank above every Segment's ticks `market`.
- **"i":**
  - The direction your sales grow in during this period: Ansoff's four directions, plus a first launch for a business yet to sell.
  - Based on: Ansoff (1957), *Strategies for diversification*.
- **Saved as:** `strategyFoundation.growth`.

#### SC3 (Strategic Compass)

- **Label:** Which Segment comes first?
- **Control:** one choice.
- **Asked when:** two or more Segments exist. With one Segment, that Segment is the answer and the drafts read it.
- **Options:** the Segments by name.
- **"i":**
  - The customers you focus on first in this period. Your other Segments stay in the plan, with less of your time.
- **Saved as:** `strategyFoundation.firstSegmentId`.

#### The Compass draft

"Over [the period], our focus is [SC3]. We will [SC2 phrases, joined with 'and'], [SC1 phrase], and stand out for [SC3's K14 phrases]. This takes us towards our Vision."

- Example: "Over Jan 2027 – Dec 2029, our focus is Gift buyers. We will win our first customers at launch and sell more to the customers we serve, using our strengths to seize opportunities, and stand out for high quality. This takes us towards our Vision."
- A part with no answer is left out of the sentence.

### 2.5 Themes: suggested in the order the answers argue for

The seven Themes stay. The Add Card menu orders them by score, each with a muted line naming why ("from your Vision, your funding gap and your SWOT").

| Theme | Perspective | Raised by |
|---|---|---|
| Growth & Market | Customer | PB7 Serving a large, growing customer base; SC2 More sales or New customers; a growing market |
| Customers & Experience | Customer | PB7 Loved and recommended; Value Proposition open items; K10 stage openings; a high Cancel / Month |
| Products & Innovation | Internal Process | PB7 A strong, growing range; SC2 New Offerings; an Offering still being built; an Unanswered need |
| Revenue & Financial Sustainability | Financial | PB7 Profitable; a funding gap; break even beyond the plan; a failed stress case |
| Brand & Positioning | Customer | PB7 Known and trusted; K14 chosen; BA1 chosen |
| Operations & Capability | Organisational Capacity | PB7 Running smoothly; a named gap; a delivery shortfall |
| Partnerships & Expansion | Internal Process | PB7 Working closely with strong partners; PB8 wider than today; SC2 New customers or places |

- **Score:** each source 1, PB7 2.
- **A balance check** (Balanced Scorecard): the Review notes "Your Themes cover [n] of the four perspectives" when the Themes chosen leave Financial or Customer empty. A note only.
- **Nothing is created by itself.**

### 2.6 Goals, Objectives and Initiatives: suggested inside each Theme's card

The nested cards stay as built. A new Goal card offers suggestions for its Theme above its name, each with Add and its source. Goals are the aim; Objectives are dated and measured; Initiatives are the work, each with an owner (the BSC Institute: an initiative has an owner and a schedule).

| Theme | Goal suggestions | Objective suggestions (with a linked Metric) | Initiative suggestions |
|---|---|---|---|
| Growth & Market | "Win our first customers in [SC3]"; "Grow [SC3]" | "Reach [expected sales] customers a month by [month]" | each channel J1 Planned or Testing: "Launch [channel]"; each K10 reach opening |
| Customers & Experience | "Answer every worry our customers raise" | "Keep cancellations under [n]% a month" | each open item: "Answer [worry] in [Offering]" |
| Products & Innovation | "Bring [Offering] to market" | "[Offering] ready to sell by [month]" | each Offering before "Yes, now" |
| Revenue & Financial Sustainability | "Pay our own way" | "Break even by [month]"; "Close the funding gap by [month]" | each source Planned or Preparing: "Apply for [source]", in FN1's order |
| Brand & Positioning | "Be known as [BA1 phrase], for [K14 phrase]" | a Number Metric the founder names | each empty Style tile |
| Operations & Capability | "Deliver every sale on time" | "Delivery hours used below [n]% of capacity" | each named gap: "Cover [gap]"; each incomplete Page 3 card |
| Partnerships & Expansion | "Reach [PB8]" | "Sign [n] partners by [month]" | each Partner card Planned |

- **The Review:** "[Theme] has Goals and no Initiative yet" (Rumelt: goals are not a strategy).
- **Later (phase 6):** an Initiative can link to a Page 3 Activity by id, so its dates, owner and cost are the Activity's and flow into the Financial Foundation.

### 2.7 Metrics linked to the plan's own figures

A Metric gains one optional field. When a figure is chosen:
- its unit and currency follow the figure;
- the **Baseline** starts from the plan at the Objective's start month and follows the plan until it is edited or the start month has passed, then stays fixed (D19);
- the **Target** stays the founder's, with a muted line "Plan: [value at the end month]" beside it;
- the Review compares the Target with the plan in the direction that counts as better for that figure.

#### The field: Linked figure (Metric card)

- **Label:** Linked figure
- **Control:** a dropdown, optional. The first entry is "None".
- **Options**, with each one's owner, unit and the direction that counts as better:

  | Option | Owner | Unit | Better |
  |---|---|---|---|
  | Expected sales a month: [Offering] | Demand & Conversion | Number | higher |
  | Cancel / Month: [Offering] | Demand & Conversion | Percentage | lower |
  | Revenue a month | Sustainability | Currency | higher |
  | Margin per unit: [Offering] | Offering Economics | Currency | higher |
  | Break-even month | Sustainability | Month | earlier |
  | Funding gap | Financial Foundation | Currency | lower |
  | Runway | Financial Foundation | Number (months) | higher |
  | Delivery hours used | Pages 3 and 5 | Percentage | none |
  | Offerings ready to sell | Offerings (O2) | Number | higher |
  | Value Proposition open items | Value Proposition | Number | lower |

- **"i":**
  - Link this Metric to a figure in your plan.
  - Its unit follows the figure, and its Baseline starts from the plan at the Objective's start.
  - The Baseline stays fixed once the Objective has started.
- **The Review prompt** follows the "Better" column (`better: "higher" | "lower" | "earlier" | "later" | "none"` on each figure):
  - "Target above the plan" for a figure where higher is better.
  - "Target below the plan" for a figure where lower is better.
  - "Target later than the plan" for a month where earlier is better.
  - No prompt for "none".
- **The Month unit** stores `{ month, year }` (`StrategyMonthValue`).

### 2.8 The Roadmap and the Strategic Period

- **Markers** under the Objectives' bars (thin lines with labels, read from the plan): the Opening Date; each Offering's launch month; the break-even month; each funding source's month; the first loan repayment.
- **Review prompts only:** "The Strategic Period ends after the Financial Plan: its last [n] months have no figures"; "[Objective] is dated before the Opening Date". Neither period moves the other.

### 2.9 A prerequisite for the capability suggestions: the skill areas

Doc 28, 9.3 and 9.4 propose skill areas (C1 on each founder, W1 to W3 on the Delivery card, C4 on the Capability card) so that a gap is derived ("an area an Offering needs and no founder covers") and its cover can act. Until they are built, the SWOT reads the typed skills and each line of the Gaps text. Once built, the suggestions become "Skill gap: [area], covered by [C4]" and "Founders' strength: [area]". Proposed for phase 3 (D17).

## 3. What the documents print

The Business Plan's Strategy and Milestones section gains the Compass's three choices above its text; the SWOT table as today, now in priority order; the KPIs table with each linked figure's source.

## 4. Codes

New prefixes **SW** (SWOT) and **SC** (Strategic Compass): SW1, SC1, SC2, SC3. They enter the register when built.

## 5. Decided

| # | Decision | Approved (owner, 2026-11-12 14:10) |
|---|---|---|
| D7 | A Metric linked to a month | A fourth unit, "Month", stored as `StrategyMonthValue` |
| D8 | A "one Offering brings n% of revenue" Weakness | Left out until a source gives the threshold |
| D9 | Initiatives linked to Activities | Phase 6 (numbered 7 until the financials moved last, 2026-11-12 15:18) |
| D10 | Order of work | As section 8 |
| D16 | The SWOT's six-month reminder | Yes |
| D17 | Build the skill areas (doc 28, 9.3) with phase 3 | Yes |
| D18 | The Themes' balance check across the four perspectives | Yes, a Review note |
| D19 | A linked Baseline fixed once its Objective starts | Yes |
| D20 | The "waiting" line under the SWOT bands and in the Theme menu | Yes |
| D21 | PB8 shares the Segment's reach ids and rank | Yes |
| D22 | SW1 rows start ticked from the Segments' changes | Yes |

## 6. Phrases for the Compass draft

| Answer | Option → phrase |
|---|---|
| K14 (BA9, Compass draft, Brand Goal) | cost → good value; convenience → making things easy; compliance → keeping customers safe; premium → high quality; performance → high performance; ecosystem → fitting the tools customers already use; personal → personal service |
| SC1 (Compass draft) | so → using our strengths to seize opportunities; wo → closing our gaps by seizing opportunities; st → using our strengths to guard against threats; wt → closing our gaps and steering clear of threats |
| SC2 (Compass draft) | launch → win our first customers at launch; penetration → sell more to the customers we serve; market → take what we offer to new customers or places; product → bring new Offerings to the customers we serve; diversification → bring new Offerings to new customers |

## 7. Sources

Opened on 2026-11-12: business.gov.au, *Do a SWOT analysis*; Start Up Loans, *SWOT analysis*; SCORE, *Important questions to ask in your SWOT analysis* (the checklist is a download, not read); Mind Tools, *The TOWS matrix*; Sebastien, D., *Kernel of good strategy*; Balanced Scorecard Institute, *Balanced scorecard basics*. Full references in the Harvard style of doc 2 are added there when an "i" cites one.

Cited from knowledge, to be opened before the "i" copy is locked: Weihrich, H. (1982) 'The TOWS matrix: a tool for situational analysis', *Long Range Planning*, 15(2), pp. 54–66; Ansoff, H.I. (1957) 'Strategies for diversification', *Harvard Business Review*, 35(5), pp. 113–124; Aguilar, F.J. (1967) *Scanning the business environment*. New York: Macmillan; Rumelt, R.P. (2011) *Good strategy, bad strategy*. New York: Crown Business; Kaplan, R.S. and Norton, D.P. (2004) *Strategy maps*. Boston: Harvard Business School Press.

## 8. The order of work (docs 45 to 49)

Each phase is one branch and one pull request from a fresh `main`, in the owner's folder first. A phase brief opens by reading the sources its "i" texts cite and closes with its tests, the layout check where shared styles change, the documents updated and the log row. Documentation-only steps push and merge once the checks are green; every code step waits for the owner's yes (owner, 2026-11-12 14:18). Sizes: S a day or less, M a few days, L a week or more.

| Phase | Content | New questions | Size | Depends on |
|---|---|---|---|---|
| **1. Customer Engagement as tiles** | one chapter per Segment, four tiles opening today's sections; layout only (doc 47, section 3, step one); the folded-funnel documentation fix (done 2026-11-12, PR #32) | none | L | nothing |
| **2. Strategy reads the Business** | SW1; the SWOT suggestions, priority, reminder; the Current Situation's new lines; Theme order and the balance check; Metric "Linked figure"; Roadmap markers. It reads today's financial calculations as they stand | SW1 | L | phase 1 (one folder, one branch at a time) |
| **3. Direction** | PB7, PB8; SC1 to SC3 and the Compass draft; Goal, Objective, Initiative suggestions; the skill areas (doc 28, 9.3) | PB7, PB8, SC1 to SC3 (+ C1, W1 to W3, C4) | L | phase 2 |
| **4. Ambassador** | the Values migration to `{ id, text }` first (with its test); BA1 to BA4, BA6 to BA9 with the drafts; Style suggestions | BA1 to BA4, BA6 to BA9 | M | D4 |
| **5. Journey rebuild** | the stage-first Journey, suggested channels, J1, J2, relationship type suggestion, Demand rows from channels, cost per customer | J1, J2 | L | the stage card prototype; phase 1 |
| **6. Initiatives and Activities** | an Initiative linked to a Page 3 Activity; IN5 | none | L | phase 3 |
| **7. Financials** | Financial Foundation as tiles (the parked branch `feat/financial-foundation-tiles`, commit 49851b38, to be rebased); the review in the Library proposal "2026-11-12-financial-pages-one-owner-per-fact" (decisions D1 to D6 open); Sustainability as tiles (two chapters); the Inventory's IN1 to IN4 and IN6 (IN6 in that proposal); Offering Economics and price: the card and its signals, RV1, FN1 | RV1, FN1 | L | phase 1 |

The financials come last (owner, Thanos, 2026-11-12 15:18: "I think it is better to rearrange the working sequence, and place the financials for later").
