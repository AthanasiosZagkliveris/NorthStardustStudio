# 41. The Competitor card: every question and option, as proposed

Status: **proposal**, written 2026-11-03, updated 2026-11-04. Every question of the Competitor card (Business System, page 1, tile "Competitors"), in the order it is asked. For each: its control, when it is asked, its options, what its "i" says and what it connects to. The Type and the text boxes are built; the questions are not.

Related: doc 35 (the Segment, whose answers give K2, K3, K11 and K12 their options), doc 36 (the Profile, whose priorities K9 and K10 share), doc 38 (Positioning, whose Differentiation starts K10), doc 42 (the Value Proposition, which reads K10), doc 43 (the Offering, whose Type list K1 shares; a Review check against the Offerings waits until one exists), doc 34 (the list L1 and the value crosswalk, 5.2a), doc 28 (6.6, the design this refines), doc 02 (FUN-47, FUN-50 to FUN-58, the sources of the 2026-11-04 research), `src/framework/engine/AnswerBusinessFoundation.ts` and `src/components/interview/editors/foundation/shared.tsx` (the card today).

**What the card is.** A Competitor belongs to its Segment, as a Profile does. The tile "Competitors" in the Segment's frame lists that Segment's competitors as small tiles, and each opens as a floating card.
- **The small tile:** the number and the name and, under them, the Type ("Direct competitor"). A tile with no Type chosen shows only the number and the name.

The card has these parts, in order:
- **The head:** the number, the name cell and the one x (built).
- **The Type** (built): Direct competitor, Indirect competitor, Substitute, Internal solution, Status quo. Each type has its explanation in the "i".
- **Description** (built): the boxes Offerings, Market, Customer Acquisition and Customer Experience. K1 to K8 are asked inside them (proposed).
- **Competitors SWOT Analysis** (built): the bands Strengths, Weaknesses, Opportunities and Threats. K9 to K12 are asked inside them (proposed).
- **Insights & Differentiation** (built): a section of its own after the SWOT. K13 is asked above its text (proposed); the text stays the App User's own conclusion.

Each question is asked inside the band of its box, above the box's text, and the text box stays as the note for what the question cannot say. The type renames the boxes as built (`COMPETITOR_TYPE_QUESTIONS`).

**The purpose.** The App User may be a start-up with no Offering, price or staff yet. So the card judges each competitor on its own facts and against what the Segment's customers want (the Profiles' "What matters most", doc 36, B1), never against the App User's own Offerings, prices or size. What the App User will do differently is the card's result, written in Insights & Differentiation.

**Decided (owner).**
- **The Competitor's SWOT is not the Strategy SWOT** (2026-11-04). The Competitor's SWOT describes that competitor: what it does well and badly, and the market changes that could help it (Opportunities) or hurt it (Threats). The Strategy SWOT describes the App User's own organisation. So the competitor's Opportunities and Threats stay on the card as built. (The 2026-11-03 version moved them and wrongly called it the owner's decision; that is withdrawn.)
- **No price question** (2026-11-04): price is not part of the competitor analysis.
- **No job question** (2026-11-04): what job an offering does is an Offering question (L17, doc 43, O13).
- **No "how sure" question** (owner, 2026-11-04): it asks about the App User's evidence, not the competitor.
- **The questions run in the card's order** (2026-11-04), numbered K1 to K13 with no gaps. Withdrawn questions keep no number. The old numbers are in the table at the end.
- **No "Not sure" option** (2026-11-02): a question the App User cannot answer yet is left unanswered.
- **No "Other" option** unless an answer outside the list can really exist (2026-11-04).
- **The card judges the competitor against the customers, not against the App User** (owner, 2026-11-04). The App User may be a start-up with no Offering, price or staff yet, so no question compares a competitor with the App User's own Offerings, prices, size or channels (The purpose, above). A Review check that reads the Offerings waits until an Offering exists.
- **The Profiles' needs are not asked here** (2026-11-04): functional needs are answered by the Offerings (doc 43), emotional and social needs by the Value Proposition (doc 42).

**The rules of the card** are the Segment's (doc 35):
- A radio is one choice; ticks are several, with the limit beside the label ("3 max").
- An option says its few words; the example goes in the "i".
- An answer to a question no longer asked, or to an option no longer offered, is removed on the next choice.
- A slash joins similar things and "or" joins different things. Spelling is UK English.

**What the type asks.** The questions are written for a rival business, and three of the five types are not one. The wording follows the type as `COMPETITOR_TYPE_QUESTIONS` does for the text boxes; the stored answer and the options stay the same.

| Question | Direct / Indirect competitor | Substitute | Internal solution | Status quo |
|---|---|---|---|---|
| K1 offer | "What do they offer?" | "What form does this alternative take?" | not asked (nothing is sold) | not asked (no offering) |
| K2 where | "Where do they sell?" | "Where can customers get this alternative?" | not asked | not asked |
| K3 size | "How big is their organisation?" | not asked (not one organisation) | not asked | not asked |
| K4 growing | "Is their business growing?" | "Is this alternative growing?" | not asked | not asked |
| K5 reach | "How do they reach customers?" | not asked (no marketing to study) | not asked | not asked |
| K6 come back | "Do their customers keep coming back?" | not asked | not asked | not asked |
| K7 rating | "How do customers rate them online?" | "How do customers rate this alternative online?" | not asked | not asked |
| K8 struggle | "Where do customers struggle with them?" | "Where do customers struggle with this alternative?" | not asked | not asked |
| K9 chosen for | "What do customers choose them for?" | "What do customers choose this alternative for?" | "What do customers get from doing it themselves?" | not asked (nothing is chosen) |
| K10 falls short | "Where do they fall short?" | "Where does this alternative fall short?" | "Where does doing it themselves fall short?" | "What does doing nothing cost customers?" |
| K11 changes that help | "Which changes could help them?" | "Which changes could help this alternative?" | "Which changes could make doing it themselves easier?" | "Which changes could keep customers where they are?" |
| K12 changes that hurt | "Which changes could hurt them?" | "Which changes could hurt this alternative?" | "Which changes could make doing it themselves harder?" | "Which changes could push customers to act?" |
| K13 do differently | "What could you do differently?" | "What could you do differently?" (options say "this alternative") | "What could you do differently?" | "What could you do differently?" |

This follows the type rules already built for the text boxes: a substitute has no customer acquisition, and the status quo has no offering.

## Box. Offerings

### K1. What do they offer?

- **Control:** one choice (a radio), inside the Offerings band, above the Offerings text box, which is kept as the note.
- **Asked when:** the type is Direct competitor, Indirect competitor or Substitute.
- **Wording by type:** Direct competitor, Indirect competitor: "What do they offer?" Substitute: "What form does this alternative take?"
- **Options:** the Offering's Type list (`BUSINESS_OFFERING_CATEGORIES`, doc 43), without Other:
  - Product
  - Service
  - Hybrid
- **The "i" says:**
  - The kinds the app uses for Offerings. A product and a service sold together is a Hybrid.
- **Connections:**
  - *Comes from:* nothing.
  - *Read by (later, once an Offering exists):* the Review, beside the Offerings' Type.

## Box. Market

### K2. Where do they sell?

- **Control:** one choice (a radio), inside the Market band, above the Market text box, which is kept as the note.
- **Asked when:** the type is Direct competitor, Indirect competitor or Substitute.
- **Wording by type:** Direct competitor, Indirect competitor: "Where do they sell?" Substitute: "Where can customers get this alternative?"
- **Options:** the Segment's "Where are your customers?" (doc 35, Box 2, question 1; `reach`):
  - In my city / town
  - In my state / region
  - Across my country
  - In several countries
  - Anywhere online
- **The "i" says:**
  - The widest area they sell in. Write the industries they serve in the note.
- **Connections:**
  - *Comes from:* the Segment's answer, shown first.
  - *Read by (not built yet):* the Review (a competitor selling wider than your Segment reaches).

### K3. How big is their organisation?

- **Control:** one choice (a radio), inside the Market band, after K2.
- **Asked when:** the type is Direct competitor or Indirect competitor.
- **Wording by type:** the same for both types.
- **Options:** the Segment's "How big are your customers' organisations?" (doc 35, Box 3, question 2; `size`):
  - Micro, 1–9 employees
  - Small, 10–49 employees
  - Medium-sized, 50–249 employees
  - Large, 250+ employees
- **The "i" says:**
  - The EU's sizes, as on your Segment. A sole trader is Micro.
- **Connections:**
  - *Comes from:* nothing.
  - *Read by (not built yet):* the Review.

### K4. Is their business growing?

- **Control:** one choice (a radio), inside the Market band, after K3.
- **Asked when:** the type is Direct competitor, Indirect competitor or Substitute.
- **Wording by type:** Direct competitor, Indirect competitor: "Is their business growing?" Substitute: "Is this alternative growing?"
- **Options:**
  - Growing
  - Steady
  - Declining
- **The "i" says:**
  - From what you can see: more branches, staff, products or reviews, or fewer.
- **Connections:**
  - *Comes from:* nothing. The U.S. Small Business Administration's competitive analysis asks whether a competitor's business is "growing, steady, or declining" [FUN-50].
  - *Read by (not built yet):* the Review.

## Box. Customer Acquisition

### K5. How do they reach customers?

- **Control:** ticks, as many as apply, inside the Customer Acquisition band, above the Customer Acquisition text box, which is kept as the note.
- **Asked when:** the type is Direct competitor or Indirect competitor.
- **Wording by type:** the same for both types.
- **Options:** the channel categories of page 2 that reach customers, in their order:
  - Social media
  - Community
  - Website
  - Marketplace
  - In person
  - Email
  - Online / live
  - Shops or wholesalers
  - Referrals or affiliates
- **The "i" says:**
  - Where they find their customers. Write the names of their accounts, shops and partners in the note.
  - Payment and delivery channels are not listed: they do not reach new customers.
  - Select all that apply.
- **Connections:**
  - *Comes from:* nothing. Each option is a channel category of page 2 by id (`social-media`, `community`, `website`, `marketplace`, `in-person`, `email`, `online-live`, `retail-wholesale`, `referral-affiliates`, in `BUSINESS_CHANNEL_CATEGORIES`), so the words here may differ from the page 2 tile names.
  - *Read by (later, once page 2's channels are set):* the Review (doc 28, 11.5, rule 21): a channel your customers use (the Segment's Box 4 question 2 and the Profiles' C2 to C4) that competitors use and you do not; the order of the Discover channels on page 2.

## Box. Customer Experience

- **The box's "i" adds (proposed):** how to find out: "Read their reviews, buy from them or ask for a quote yourself, and ask people who use them." Business Tasmania suggests becoming a customer yourself to see the experience [FUN-58].

### K6. Do their customers keep coming back?

- **Control:** one choice (a radio), inside the Customer Experience band, above the Customer Experience text box, which is kept as the note for what customers say.
- **Asked when:** the type is Direct competitor or Indirect competitor.
- **Wording by type:** the same for both types.
- **Options:**
  - Most come back
  - Some come back
  - Few come back
- **The "i" says:**
  - Repeat customers show loyalty that is hard to win over.
- **Connections:**
  - *Comes from:* nothing. Invest Northern Ireland's business guide lists what to know about a competitor, its loyalty schemes and its customers among them [FUN-51].
  - *Read by (not built yet):* the Review.

### K7. How do customers rate them online?

- **Control:** one choice (a radio), inside the Customer Experience band, after K6.
- **Asked when:** the type is Direct competitor, Indirect competitor or Substitute.
- **Wording by type:** Direct competitor, Indirect competitor: "How do customers rate them online?" Substitute: "How do customers rate this alternative online?"
- **Options:**
  - 4.5 stars or more
  - 4 to 4.4 stars
  - 3 to 3.9 stars
  - Below 3 stars
  - No reviews yet
- **The "i" says:**
  - Their average on Google, Trustpilot or the marketplace they sell on. Read the lowest reviews: they show where customers are let down.
- **Connections:**
  - *Comes from:* nothing. Invest Northern Ireland's guide asks what customers see as a competitor's strengths and weaknesses [FUN-51]; the SBA's, what customers and prospects say about competitors [FUN-50].
  - *Read by (not built yet):* K13 ("Win over their unhappy customers"); the Review.

### K8. Where do customers struggle with them?

- **Control:** ticks, up to 3, inside the Customer Experience band, after K7.
- **Asked when:** the type is Direct competitor, Indirect competitor or Substitute.
- **Wording by type:** Direct competitor, Indirect competitor: "Where do customers struggle with them?" Substitute: "Where do customers struggle with this alternative?"
- **Options:** the app's Journey Stages (`BUSINESS_JOURNEY_STAGES`, page 2, Customer Engagement), in their order:
  - Discover
  - Evaluation
  - Purchase
  - Delivery
  - Support & Follow Up
- **The "i" says:**
  - The stage of the journey where their customers are let down. K10 says what falls short; this says where.
- **Connections:**
  - *Comes from:* nothing. Lemon and Verhoef describe the customer's journey in three stages, before, during and after the purchase, each with its touch points [FUN-59]; page 2's five Journey Stages divide the same journey.
  - *Read by (not built yet):* K13 ("Make [stage] easier"); page 2's Journey Stages, where the App User plans each stage.

For Internal solution and Status quo the box stays text only: it asks about the effort or the current behaviour, which K10 already asks as a choice.

## Band. Strengths

### K9. What do customers choose them for?

- **Control:** ticks, up to 3, inside the Strengths band, above the Strengths text box, which is kept as the note.
- **Asked when:** the type is not Status quo.
- **Wording by type:**
  - Direct competitor, Indirect competitor: "What do customers choose them for?"
  - Substitute: "What do customers choose this alternative for?"
  - Internal solution: "What do customers get from doing it themselves?"
- **Options:** the list L1, the Profile's "What matters most" (doc 36, B1):
  - Lower price
  - Speed
  - Ease and convenience
  - Quality and results
  - Trust and reputation
  - Expert knowledge
  - A tailored service
  - Good support
  - Safety and low risk
  - Shared values / identity
- **The "i" says:**
  - What their customers value in them. Choose up to three.
  - The same list as "What matters most" on your Profiles, so the two can be compared.
  - Judge them as their customers do: what customers and prospects say about them [FUN-50].
- **Connections:**
  - *Comes from:* the Segment's Profiles: the options ticked in their B1 come first.
  - *Read by (not built yet):* the Review: a value your Profiles care about that this competitor delivers (later, once an Offering exists: and none of your Offerings does, doc 43, O4).

## Band. Weaknesses

### K10. Where do they fall short?

- **Control:** ticks, up to 3, inside the Weaknesses band, above the Weaknesses text box, which is kept as the note.
- **Asked when:** always.
- **Wording by type:**
  - Direct competitor, Indirect competitor: "Where do they fall short?"
  - Substitute: "Where does this alternative fall short?"
  - Internal solution: "Where does doing it themselves fall short?"
  - Status quo: "What does doing nothing cost customers?"
- **Options:** L1, as K9.
- **The "i" says:**
  - Where they leave their customers wanting more. An opening is where they fall short on what your customers want. Choose up to three.
  - For the status quo: what doing nothing costs the customer.
  - Judge them as their customers do: what customers and prospects say about them [FUN-50].
  - Your Positioning's Differentiation starts the ticks; change them freely.
- **Connections:**
  - *Comes from:* Positioning's Differentiation, through the value crosswalk (doc 34, 5.2a): for example Cost-driven ticks Lower price, and Convenience-driven ticks Speed and Ease and convenience. These are starting ticks.
  - *Read by (not built yet):* the Insights & Differentiation draft ("Customers want [a B1 value]; [name] falls short on it"); the Value Proposition draft (doc 42); later, once an Offering exists, the Review (a K10 that none of your Offerings delivers).

## Band. Opportunities

### K11. Which changes could help them?

- **Control:** ticks, up to 2, inside the Opportunities band, above the Opportunities text box, which is kept as the note.
- **Asked when:** always.
- **Wording by type:**
  - Direct competitor, Indirect competitor: "Which changes could help them?"
  - Substitute: "Which changes could help this alternative?"
  - Internal solution: "Which changes could make doing it themselves easier?"
  - Status quo: "Which changes could keep customers where they are?"
- **Options:** the Segment's "What is changing most for your customers?" (doc 35, Box 5, question 3; `trends`):
  - Technology
  - Rules and law
  - The economy
  - Society and lifestyle
  - Supply and delivery
- **The "i" says:**
  - Choose up to two. The examples of each change, as on your Segment.
- **Connections:**
  - *Comes from:* the Segment's ticks, which come first.
  - *Read by (not built yet):* the Review.

## Band. Threats

### K12. Which changes could hurt them?

- **Control:** ticks, up to 2, inside the Threats band, above the Threats text box, which is kept as the note.
- **Asked when:** always.
- **Wording by type:**
  - Direct competitor, Indirect competitor: "Which changes could hurt them?"
  - Substitute: "Which changes could hurt this alternative?"
  - Internal solution: "Which changes could make doing it themselves harder?"
  - Status quo: "Which changes could push customers to act?"
- **Options:** as K11. A change may be ticked in both K11 and K12.
- **The "i" says:**
  - Choose up to two. The examples of each change, as on your Segment.
- **Connections:**
  - *Comes from:* the Segment's ticks, which come first.
  - *Read by (not built yet):* the Review.

## Section. Insights & Differentiation

A section of its own after the SWOT, as built: a title band, an "i" and one text, which stays the App User's own conclusion. K13 is asked above the text, answered from this card's earlier choices (proposed).
- **The question (built):** it follows the type (`COMPETITOR_TYPE_QUESTIONS` in `shared.tsx`). Direct and Indirect competitors use `SUBSECTIONS.competitors.insights`: "What can you learn from competitors to make your offering more distinctive?" Substitute: "What could make customers switch from this alternative to your offering?" Internal solution: "What have you learned from customers solving this themselves, and how could your organisation make it easier, better, faster, or more valuable?" Status quo: "What could trigger customers to change?"
- **The draft (proposed):** "Customers want [a B1 value]; [name] falls short on it." One line for each value the Segment's Profiles ticked in B1 that this competitor falls short on (K10, or the grid's "Poorly" rows), listing every competitor of the Segment that falls short on the same value. Each opening ticked in K13 adds "You could [opening]." It is added at the end of the text and never overwrites it. The App User then writes what they will do differently.
- **Connections:** *Comes from:* K10 (or the grid), K13 and the Profiles' B1 (doc 36), not the Offerings.

### K13. What could you do differently?

- **Control:** ticks, up to 3, in the Insights & Differentiation band, above its text box, which is kept as the note.
- **Asked when:** at least one of its options exists. With no options, only the text shows.
- **Wording by type:** the same for every type; the options follow the type (below).
- **Options:** built by the app from this card's answers, each by its rule, and shown only once its source question is answered:
  - For each value the competitor falls short on (K10, or "Poorly" in the proposed grid) that the Segment's Profiles ticked in "What matters most" (doc 36, B1): "Offer better: [value]", for example "Offer better: Good support". Values that several competitors of the Segment fall short on come first.
  - For each stage ticked in K8: "Make [stage] easier", with the stage in plain words: Discover "finding out", Evaluation "choosing", Purchase "buying", Delivery "getting it", Support & Follow Up "getting help afterwards".
  - If K7 is "Below 3 stars" or "3 to 3.9 stars", or K6 is "Few come back": "Win over their unhappy customers".
  - If K4 is "Declining": "Win customers they are losing".
  - For each change ticked in K11: "Use [change] too". For each change ticked in K12: "Be ready where [change] hurts them".
  - By type: a Substitute's options say "this alternative" ("Win over this alternative's unhappy customers"). Internal solution: "Make it easier than doing it themselves". Status quo: from K10, "Show what doing nothing costs: [value]"; from K11 and K12, "Use [change] as a reason to act".
- **The "i" says:**
  - Openings drawn from what you answered above. Tick the ones you will act on, then write how in the text.
- **Connections:**
  - *Comes from:* K4, K6, K7, K8, K10, K11 and K12, and the Profiles' B1 (doc 36).
  - *Read by (not built yet):* the draft at the end of the text ("You could [opening]"); Positioning's Differentiation (doc 38); the Value Proposition (doc 42).

## Other ways to answer (proposed, 2026-11-04)

Each row keeps the current question and proposes another way to answer it, with its source; the owner chooses. A way that compares the competitor with the App User's own Offerings, prices, size or channels is withdrawn (The purpose, above).

| Question | Now | Another way | Source | Recommended |
|---|---|---|---|---|
| K1 What do they offer? | Product / Service / Hybrid | Withdrawn: "Which of your Offerings do they compete with?", ticks of the App User's own Offerings (doc 43) | Nwes business plan guidance: a grid of your products and services against each competitor, showing which each offers [FUN-56] | Keep Now: the App User may have no Offerings yet |
| K2 Where do they sell? | The Segment's area list | Withdrawn: "Compared with you, where do they sell?" Smaller area / The same area / Larger area | Cornell: the more one firm's strategy resembles another's, the more the two compete [FUN-53] | Keep Now: the App User may have no Offerings yet |
| K3 How big is their organisation? | Micro to Large | a. Withdrawn: "Compared with you, how big are they?" Smaller / About the same / Larger. b. "What role do they play in your market?" Market leader / Challenger / Follower / Specialist, with the meaning of each in the "i" | Kotler's market roles: leader, challenger, follower, nicher (Kotler, 1997, as cited in Cuellar-Healey and Gomez, 2013) [FUN-53, FUN-54] | Keep Now, plus b as an extra question; a withdrawn: the App User may have no Offerings or staff yet |
| K4 Is their business growing? | Growing / Steady / Declining | "What signs have you seen?" Ticks: More locations / New products / Hiring / More reviews / Price cuts / Closures; the app draws growing, steady or declining from them | SBA: growing, steady or declining [FUN-50]; Kotler: sales, capacity and new investment as signs of performance (as cited in Cuellar-Healey and Gomez, 2013) [FUN-53] | Keep Now: it is quicker |
| K5 How do they reach customers? | Ticks of channels | Withdrawn: the App User's own page 2 channels listed, each marked "They use it too" / "Only you", then their other channels | Cornell: compare products, prices, channels and promotion with close competitors [FUN-53] | Keep Now: the App User may have no Offerings or channels yet |
| K6 Do their customers keep coming back? | Most / Some / Few come back | Kotler's share of mind and share of heart, as two radios: "Do customers name them first?" Often / Sometimes / Rarely; "Do customers prefer them?" Often / Sometimes / Rarely | Kotler, as cited in Cuellar-Healey and Gomez, 2013 [FUN-53]; Bangladesh Open University, MBA 3313, Unit 4 [FUN-55]. K6 as it stands: Invest Northern Ireland [FUN-51]; Business Tasmania, "Do they have a loyal following?" [FUN-58] | Add "Do customers name them first?" beside K6 |
| K9 and K10 (chosen for / fall short) | Two tick lists of L1 | One grid: each value that the Segment's Profiles ticked in B1 (L1) is one row, "How well do they deliver it?" Well / Partly / Poorly. The "Well" rows are the competitor's strengths; the "Poorly" rows are its weaknesses and the App User's openings | Kotler's customer value analysis: competing offers rated on the attributes customers rank as most important [FUN-55]; the Competitive Profile Matrix: major strength to major weakness, rated 4 to 1 [FUN-57] | Yes: it ends the overlap of K9 and K10, judges the competitor against the customers, and feeds the Insights draft directly |
| K11 and K12 (changes that help / hurt) | Two tick lists | One list of the Segment's changes, each marked Helps them / Hurts them / Both / Neither | SWOT: external factors, favourable or unfavourable [FUN-53] | Yes: one question instead of two |
| New, optional, in Insights | Not asked | "How would they react to a new rival?" Ignore it / React to some moves / Fight back on everything / Unpredictable | Kotler's reaction patterns: laid-back, selective, tiger, stochastic [FUN-55]; Porter's four corners [FUN-52] | Yes, as optional |

## What changes when an answer above changes

- A change of the type removes, on the next choice, the answers of the questions the new type does not ask. The text boxes keep their words: the type renames them and never empties them, as built.
- A change of Positioning's Differentiation does not change K10's ticks once the user has changed them; it changes only the starting ticks of an unanswered K10.
- A change of a Profile's B1 changes only K9's order.
- A change of K4, K6, K7, K8, K10, K11 or K12 changes K13's options; a ticked option no longer offered is removed on the next choice.
- A change of the Segment's `reach` or `trends` changes only the order of K2's, or K11's and K12's, options.

## Decided, and still to decide

**Decided (owner, 2026-11-03):**
- The Competitor's SWOT stays whole and is not the Strategy SWOT (2026-11-04).
- No price question (2026-11-04).
- No job question: an Offering question (2026-11-04).
- No "how sure" question (2026-11-04).
- The questions numbered K1 to K13 in the card's order (2026-11-04).
- The Type shown on each competitor's small tile (2026-11-04).
- No "Not sure" options (2026-11-02); no "Other" unless another answer can exist (2026-11-04).
- Competitors belong to their Segment.

**Still to decide:**
- Whether K5's words follow the plain words above ("Shops or wholesalers", "Referrals or affiliates") or the page 2 tile names ("Retail & Wholesale", "Referral & Affiliates"). The plain words follow the "or" rule, so the page 2 names would change with them.
- K1 to K4, K6 to K8, K11, K12 and K13, the built boxes as choices, including the questions from the research of 2026-11-04 (K4 [FUN-50], K6 [FUN-51], K7 [FUN-50, FUN-51], K8 [FUN-59]) and K13 from the card's own answers.
- Considered, not added: "How much effort does buying from them take?" (customer effort [FUN-60]). It repeats L1's "Ease and convenience" in K9 and K10.
- Porter's four corners (goals, assumptions, strategy, capabilities [FUN-52]) also ask how a competitor would react to you: proposed as an optional question in Insights, with Kotler's reaction patterns as its options (Other ways to answer, last row).
- Other ways to answer: one choice per row of the table above (owner).
- **Not asked:**
  - Doc 28's K5, what customers say (it stays the Customer Experience box, under K6).
  - A competitor's website (doc 28, 6.10), written in the notes.
  - The price (withdrawn, 2026-11-04).

## Numbers changed on 2026-11-04

| 2026-11-03 | Earlier on 2026-11-04 | Now |
|---|---|---|
| K1 (price) | withdrawn | withdrawn |
| K2 | K7 | K9 |
| K3 | K8 | K10 |
| K4 | K5 | K5 |
| K5 (how sure) | withdrawn | withdrawn |
| K6 (job) | withdrawn | withdrawn |
| (new) | K1 to K3 | K1 to K3 |
| (new) | K4, K6 | K4, K6 |
| (new) | K9, K10 | K11, K12 |
| (new) | (none) | K7, K8, K13 |
