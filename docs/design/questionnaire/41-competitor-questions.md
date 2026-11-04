# 41. The Competitor card: every question and option, as proposed

Status: **proposal**, written 2026-11-03, updated 2026-11-04. Every question of the Competitor card (Business System, page 1, tile "Competitors"), in the order it is asked. For each: its control, when it is asked, its options, what its "i" says and what it connects to. The Type and the text boxes are built; the questions are not.

Related: doc 35 (the Segment, whose answers give K2, K3 and K9 their options and rows), doc 36 (the Profile, whose priorities order K8's rows), doc 38 (Positioning, which reads K10), doc 42 (the Value Proposition, which reads K8 and K10), doc 43 (the Offering, whose Type list K1 shares; a Review check against the Offerings waits until one exists), doc 34 (the list L1 and the value crosswalk, 5.2a), doc 28 (6.6, the design this refines), doc 02 (FUN-47, FUN-50 to FUN-58, the sources of the 2026-11-04 research), `src/framework/engine/AnswerBusinessFoundation.ts` and `src/components/interview/editors/foundation/shared.tsx` (the card today).

**What the card is.** A Competitor belongs to its Segment, as a Profile does. The tile "Competitors" in the Segment's frame lists that Segment's competitors as small tiles, and each opens as a floating card.
- **The small tile:** the number and the name and, under them, the Type ("Direct competitor"). A tile with no Type chosen shows only the number and the name.

The card has these parts, in order:
- **The head:** the number, the name cell and the one x (built).
- **The Type** (built): Direct competitor, Indirect competitor, Substitute, Internal solution, Status quo. Each type has its explanation in the "i".
- **Description** (built): the boxes Offerings, Market, Customer Acquisition and Customer Experience. K1 to K7 are asked inside them (proposed).
- **Competitors SWOT Analysis** (built): the bands Strengths, Weaknesses, Opportunities and Threats. K8 and K9 are asked inside them (proposed): K8 is one band across Strengths and Weaknesses, K9 one across Opportunities and Threats.
- **Insights & Differentiation** (built): a section of its own after the SWOT. K10 is asked above its text (proposed); the text stays the App User's own conclusion.

Each question is asked inside the band of its box, above the box's text, and the text box stays as the note for what the question cannot say. The type renames the boxes as built (`COMPETITOR_TYPE_QUESTIONS`).

**The purpose.** The App User may be a start-up with no Offering, price or staff yet. So the card judges each competitor on its own facts and against what the Segment's customers want (the Profiles' "What matters most", doc 36, B1), never against the App User's own Offerings, prices or size. What the App User will do differently is the card's result, written in Insights & Differentiation.

**Decided (owner).**
- **The Competitor's SWOT is not the Strategy SWOT** (2026-11-04). The Competitor's SWOT describes that competitor: what it does well and badly, and the market changes that could help it (Opportunities) or hurt it (Threats). The Strategy SWOT describes the App User's own organisation. So the competitor's Opportunities and Threats stay on the card as built. (The 2026-11-03 version moved them and wrongly called it the owner's decision; that is withdrawn.)
- **No price question** (2026-11-04): price is not part of the competitor analysis.
- **No job question** (2026-11-04): what job an offering does is an Offering question (L17, doc 43, O13).
- **No "how sure" question** (owner, 2026-11-04): it asks about the App User's evidence, not the competitor.
- **The questions run in the card's order** (2026-11-04), numbered K1 to K10 with no gaps. Withdrawn questions keep no number. The old numbers are in the table at the end.
- **No "Not sure" option** (2026-11-02): a question the App User cannot answer yet is left unanswered.
- **No "Other" option** unless an answer outside the list can really exist (2026-11-04).
- **The card judges the competitor against the customers, not against the App User** (owner, 2026-11-04). The App User may be a start-up with no Offering, price or staff yet, so no question compares a competitor with the App User's own Offerings, prices, size or channels (The purpose, above). A Review check that reads the Offerings waits until an Offering exists.
- **The Profiles' needs are not asked here** (2026-11-04): functional needs are answered by the Offerings (doc 43), emotional and social needs by the Value Proposition (doc 42).

**The rules of the card** are the Segment's (doc 35):
- A radio is one choice; ticks are several, with the limit beside the label ("3 max").
- An option says its few words; the example goes in the "i".
- An answer to a question no longer asked, or to an option no longer offered, is removed on the next choice.
- A slash joins similar things and "or" joins different things. Spelling is UK English.

**Controls.** K6 to K9 use the rating field (K6 with a tick per row), a shared control (`RatingField` and `RatingGroup` in `src/components/controls/`, doc 21): five radio rounds in a row from low to high, the end words said once over the rounds, the chosen round pressed again to clear it.

**What the type asks.** The questions are written for a rival business, and three of the five types are not one. The wording follows the type as `COMPETITOR_TYPE_QUESTIONS` does for the text boxes; the stored answer and the options stay the same.

| Question | Direct / Indirect competitor | Substitute | Internal solution | Status quo |
|---|---|---|---|---|
| K1 offer | "What do they offer?" | "What form does this alternative take?" | not asked (nothing is sold) | not asked (no offering) |
| K2 where | "Where do they sell?" | "Where can customers get this alternative?" | not asked | not asked |
| K3 size | "How big is their organisation?" | not asked (not one organisation) | not asked | not asked |
| K4 growing | "Is their business growing?" | "Is this alternative growing?" | not asked | not asked |
| K5 reach | "How do they reach customers?" | not asked (no marketing to study) | not asked | not asked |
| K6 reviews | "Where are they reviewed, and how are they rated?" | "Where is this alternative reviewed, and how is it rated?" | not asked | not asked |
| K7 journey | "How easy do they make each stage for customers?" (with the loyalty ticks) | "How easy does this alternative make each stage for customers?" (no loyalty ticks) | not asked | not asked |
| K8 strengths / weaknesses | "How do they do on what customers value?" | "How does this alternative do on what customers value?" | "How does doing it themselves do on what customers value?" | "How does doing nothing do on what customers value?" |
| K9 opportunities / threats | "How could each change affect them?" | "How could each change affect this alternative?" | "How could each change affect customers doing it themselves?" | "How could each change affect customers who do nothing?" |
| K10 do differently | "What could you do differently?" | "What could you do differently?" (options say "this alternative") | "What could you do differently?" | "What could you do differently?" |

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

### K6. Where are they reviewed, and how are they rated?

- **Control:** a rating group with a tick per row (`RatingGroup`, `selectable`), inside the Customer Experience band, above the Customer Experience text box, which is kept as the note for what customers say. Each platform is a tick; once ticked, it gets a rating from "1 star" to "5 stars", rounded to the nearest whole star. Unticking a platform clears its rating. No platform ticked means no reviews yet.
- **Asked when:** the type is Direct competitor, Indirect competitor or Substitute.
- **Wording by type:** Direct competitor, Indirect competitor: "Where are they reviewed, and how are they rated?" Substitute: "Where is this alternative reviewed, and how is it rated?"
- **Rows:** the review platforms, list L18 (doc 34, 5.2b), in this order: Google and Facebook first; then the platforms of the App User's industry (the first activity's industry, `organisation.activities[0]`, through the crosswalk L7, doc 34, 5.3); then those of the App User's country (`organisation.country`); "Show all" shows the rest. The order is a suggestion only: any platform can be ticked.
- **The "i" says:**
  - Google is where most people read reviews of local businesses (71% in 2026). Most people only use a business with 4 stars or more.
  - Tick each place they are reviewed, then give their average there, rounded to the nearest star. Read the lowest reviews: they show where customers are let down.
- **Connections:**
  - *Comes from:* the Organisation's country and first activity (Legal Entity, `AnswerLegal.ts`), which order the rows. The order by industry and country rests on directory and vendor lists [FUN-64, FUN-65], not on a survey of how many people use each site; the use of Google and Apple Maps and the 4-star threshold rest on BrightLocal's survey of US consumers [FUN-62], Trustpilot in the UK on Littlechild [FUN-63]. The SBA asks what customers and prospects say about competitors [FUN-50].
  - *Read by (not built yet):* §K8 ("Win over their unhappy customers", for a platform rated below 4); the Review.

### K7. How easy do they make each stage for customers?

- **Control:** a rating group (`RatingGroup`): one row for each of the app's Journey Stages, rated from "Customers struggle" to "Smooth". The last row, Support & Follow Up, carries the loyalty ticks under it (the group's `below`). A row left unrated is unanswered.
- **Asked when:** the type is Direct competitor, Indirect competitor or Substitute; the loyalty ticks only for Direct competitor and Indirect competitor.
- **Wording by type:** Direct competitor, Indirect competitor: "How easy do they make each stage for customers?" Substitute: "How easy does this alternative make each stage for customers?"
- **Rows:** the app's Journey Stages (`BUSINESS_JOURNEY_STAGES`, page 2, Customer Engagement), in their order:
  - Discover
  - Evaluation
  - Purchase
  - Delivery
  - Support & Follow Up, and under it, ticks, as many as apply, of how they keep customers coming back:
    - Loyalty scheme / rewards
    - Subscription / membership
    - Regular emails or offers
    - Aftercare / follow-up
    - Community or events
- **The "i" says:**
  - Where their customers are let down along the way, and where it goes smoothly. K8 says what falls short; this says where.
  - Under Support & Follow Up, what they do to bring customers back. Look at their website and social media, sign up to their newsletter, or buy from them once. Reviews that mention coming back again also show it.
- **Connections:**
  - *Comes from:* the owner's decision (2026-11-04): the loyalty question overlapped the journey's last stage, so it stands under that stage. Lemon and Verhoef describe the customer's journey in three stages, before, during and after the purchase, the "loyalty loop" after it [FUN-59]; page 2's five Journey Stages divide the same journey. Invest Northern Ireland lists a competitor's "customer loyalty devices" [FUN-51]; how many customers come back cannot be seen from outside, what a competitor does to bring them back can.
  - *Read by (not built yet):* §K8 ("Make [stage] easier", for a stage rated 1 or 2; "Give customers a reason to come back", when no loyalty tick is ticked); page 2's Journey Stages, where the App User plans each stage.

For Internal solution and Status quo the box stays text only: it asks about the effort or the current behaviour, which K8 already rates.

## Band. Strengths and Weaknesses

### K8. How do they do on what customers value?

- **Control:** a rating group (`RatingGroup`): one row per value, rated from "Clear weakness" to "Clear strength", the middle "Average"; one band across Strengths and Weaknesses, above both text boxes, which stay as the notes. A row left unrated is unanswered (no "Not sure").
- **Asked when:** always.
- **Wording by type:**
  - Direct competitor, Indirect competitor: "How do they do on what customers value?"
  - Substitute: "How does this alternative do on what customers value?"
  - Internal solution: "How does doing it themselves do on what customers value?"
  - Status quo: "How does doing nothing do on what customers value?" For example, Lower price can be a 5, because doing nothing is free.
- **Rows:** the list L1, the Profile's "What matters most" (doc 36, B1). The values the Segment's Profiles ticked in B1 come first, marked as such; a "Show all" link shows the rest of L1:
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
  - Rate each from what their customers say and what you have seen. 1 is a clear weakness and 5 a clear strength.
- **Connections:**
  - *Comes from:* the owner's decision (2026-11-04): Strengths and Weaknesses used the same options, so one rating replaces the two tick lists and a value rated 2 to 4 also counts in the App User's decisions. The Competitive Profile Matrix rates each success factor from major weakness to major strength [FUN-57]; Kotler's customer value analysis rates competing offers on the attributes customers rank as most important [FUN-55]; a five-point rating as Likert's [FUN-61]. The Profiles' B1 sets the order of the rows; no row starts rated.
  - *Read by (not built yet):* ratings of 4 and 5 are listed as the competitor's strengths, and 1 and 2 as its weaknesses (the SWOT, the documents and the exports); 3 is neither. K10's options; the Insights & Differentiation draft; the Value Proposition draft (doc 42); later, once an Offering exists, the Review (a value customers want that this competitor is rated 1 or 2 on and none of your Offerings delivers).

## Band. Opportunities and Threats

### K9. How could each change affect them?

- **Control:** a rating group (`RatingGroup`): one row per change, rated from "Clear threat" to "Clear opportunity", the middle "No effect"; one band across Opportunities and Threats, above both text boxes, which stay as the notes. A row left unrated is unanswered.
- **Asked when:** always.
- **Wording by type:**
  - Direct competitor, Indirect competitor: "How could each change affect them?"
  - Substitute: "How could each change affect this alternative?"
  - Internal solution: "How could each change affect customers doing it themselves?"
  - Status quo: "How could each change affect customers who do nothing?"
- **Rows:** the Segment's "What is changing most for your customers?" (doc 35, Box 5, question 3; `trends`). The changes the Segment ticked come first:
  - Technology
  - Rules and law
  - The economy
  - Society and lifestyle
  - Supply and delivery
- **The "i" says:**
  - How each change could help or hurt them. The examples of each change, as on your Segment.
- **Connections:**
  - *Comes from:* the owner's decision (2026-11-04): one rating replaces the two tick lists of changes that help and changes that hurt. SWOT's external factors, favourable or unfavourable [FUN-53]. The Segment's ticks set the order of the rows; no row starts rated.
  - *Read by (not built yet):* ratings of 1 and 2 are listed as the competitor's threats, and 4 and 5 as its opportunities (the SWOT, the documents and the exports); 3 is neither. K10's options; the Review.

## Section. Insights & Differentiation

A section of its own after the SWOT, as built: a title band, an "i" and one text, which stays the App User's own conclusion. K10 is asked above the text, answered from this card's earlier choices (proposed).
- **The question (built):** it follows the type (`COMPETITOR_TYPE_QUESTIONS` in `shared.tsx`). Direct and Indirect competitors use `SUBSECTIONS.competitors.insights`: "What can you learn from competitors to make your offering more distinctive?" Substitute: "What could make customers switch from this alternative to your offering?" Internal solution: "What have you learned from customers solving this themselves, and how could your organisation make it easier, better, faster, or more valuable?" Status quo: "What could trigger customers to change?"
- **The draft (proposed):** "Customers want [a B1 value]; [name] falls short on it." One line for each value the Segment's Profiles ticked in B1 that K8 rates 1 or 2, listing every competitor of the Segment that falls short on the same value. Each opening ticked in K10 adds "You could [opening]." It is added at the end of the text and never overwrites it. The App User then writes what they will do differently.
- **Connections:** *Comes from:* K8, K10 and the Profiles' B1 (doc 36), not the Offerings.

### K10. What could you do differently?

- **Control:** ticks, up to 3, in the Insights & Differentiation band, above its text box, which is kept as the note.
- **Asked when:** at least one of its options exists. With no options, only the text shows.
- **Wording by type:** the same for every type; the options follow the type (below).
- **Options:** built by the app from this card's answers, each by its rule, and shown only once its source question is answered:
  - From K8's ratings, the whole scale. Each rated value has an opening score, (5 − rating) × weight, where the weight is 2 if a Profile of the Segment ticked the value in "What matters most" (doc 36, B1) and 1 otherwise. The options come in score order; ties are broken by how many of the Segment's competitors rated the value low.
    - Rating 1 or 2: "Offer better: [value]", for example "Offer better: Good support".
    - Rating 3: "Stand out on: [value]" (they are average, so there is room).
    - Rating 4: "Match them on: [value]", shown only for a B1 value (customers expect it).
    - Rating 5: no option.
  - For each stage K7 rates 1 or 2: "Make [stage] easier", with the stage in plain words: Discover "finding out", Evaluation "choosing", Purchase "buying", Delivery "getting it", Support & Follow Up "getting help afterwards".
  - If a platform is rated below 4 stars in K6: "Win over their unhappy customers".
  - If none of K7's loyalty ticks is ticked: "Give customers a reason to come back".
  - If K4 is "Declining": "Win customers they are losing".
  - For each change K9 rates 4 or 5: "Use [change] too". For each change K9 rates 1 or 2: "Be ready where [change] hurts them".
  - By type: a Substitute's options say "this alternative" ("Win over this alternative's unhappy customers"). Internal solution: "Make it easier than doing it themselves". Status quo: from the values K8 rates 1 or 2, "Show what doing nothing costs: [value]"; from the changes K9 rates 1 or 2, "Use [change] as a reason to act".
- **The "i" says:**
  - Openings drawn from what you answered above. Tick the ones you will act on, then write how in the text.
  - For each value rated 5: "[name] is hard to beat on [value]; compete elsewhere."
- **Connections:**
  - *Comes from:* K4, K6, K7, K8 and K9, and the Profiles' B1 (doc 36).
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
| K7 (the loyalty ticks under Support & Follow Up) | Ticks of loyalty devices (they replace "Do their customers keep coming back?", which cannot be seen from outside) | Kotler's share of mind and share of heart, as two radios: "Do customers name them first?" Often / Sometimes / Rarely; "Do customers prefer them?" Often / Sometimes / Rarely | Kotler, as cited in Cuellar-Healey and Gomez, 2013 [FUN-53]; Bangladesh Open University, MBA 3313, Unit 4 [FUN-55]. The loyalty ticks as they stand: Invest Northern Ireland [FUN-51]; Business Tasmania, "Do they have a loyal following?" [FUN-58] | Add "Do customers name them first?" beside K7's loyalty ticks |
| K8 (strengths and weaknesses) | Was two tick lists of L1, "chosen for" and "falls short" | One grid: each value the Segment's Profiles ticked in B1 rated Well / Partly / Poorly | Kotler's customer value analysis [FUN-55]; the Competitive Profile Matrix [FUN-57] | Decided: replaced by K8's 1 to 5 rating (owner, 2026-11-04) |
| K9 (opportunities and threats) | Was two tick lists, changes that help and changes that hurt | One list of the Segment's changes, each marked Helps them / Hurts them / Both / Neither | SWOT: external factors, favourable or unfavourable [FUN-53] | Decided: replaced by K9's rating, Clear threat to Clear opportunity (owner, 2026-11-04) |
| New, optional, in Insights | Not asked | "How would they react to a new rival?" Ignore it / React to some moves / Fight back on everything / Unpredictable | Kotler's reaction patterns: laid-back, selective, tiger, stochastic [FUN-55]; Porter's four corners [FUN-52] | Yes, as optional |

## What changes when an answer above changes

- A change of the type removes, on the next choice, the answers of the questions the new type does not ask. The text boxes keep their words: the type renames them and never empties them, as built.
- A change of a Profile's B1 changes only the order of K8's rows and the weights of K10's options, never a rating.
- Unticking a platform in K6 clears its rating; a change of the Organisation's country or first activity changes only the order of K6's rows.
- A change of K4, K6, K7, K8 or K9 changes §K8's options; a ticked option no longer offered is removed on the next choice.
- A change of the Segment's `reach` or `trends` changes only the order of K2's options or K9's rows.

## Decided, and still to decide

**Decided (owner, 2026-11-03):**
- The Competitor's SWOT stays whole and is not the Strategy SWOT (2026-11-04).
- No price question (2026-11-04).
- No job question: an Offering question (2026-11-04).
- No "how sure" question (2026-11-04).
- The questions numbered K1 to K10 in the card's order (2026-11-04).
- Strengths and Weaknesses as one rating, K8: each value customers want rated from 1 (Clear weakness) to 5 (Clear strength), so that values rated 2 to 4 also count in the App User's decisions (2026-11-04).
- Opportunities and Threats as one rating, K9: each of the Segment's changes rated from 1 (Clear threat) to 5 (Clear opportunity), 3 No effect (2026-11-04).
- The review platforms ticked and rated in one question, K6, the platforms in the order of the App User's industry and country (2026-11-04).
- The loyalty question within the journey: the loyalty ticks under K7's Support & Follow Up (2026-11-04).
- The ratings use one shared control, the rating field (`RatingField`, `RatingGroup`: five radio rounds from low to high, doc 21) (2026-11-04).
- The Type shown on each competitor's small tile (2026-11-04).
- No "Not sure" options (2026-11-02); no "Other" unless another answer can exist (2026-11-04).
- Competitors belong to their Segment.

**Still to decide:**
- Whether K5's words follow the plain words above ("Shops or wholesalers", "Referrals or affiliates") or the page 2 tile names ("Retail & Wholesale", "Referral & Affiliates"). The plain words follow the "or" rule, so the page 2 names would change with them.
- K1 to K4, K6, K7 and §K8, the built boxes as choices, including the questions from the research of 2026-11-04 (K4 [FUN-50], K6 [FUN-62 to FUN-65], K7 [FUN-51, FUN-59]) and §K8 from the card's own answers.
- The order of K6's platforms by industry and country rests on directory and vendor lists, not on a survey of use; a survey of UK consumers' use of review sites would improve it.
- Considered, not added: "How much effort does buying from them take?" (customer effort [FUN-60]). It repeats L1's "Ease and convenience", a row of K8, and K7's rating of each stage.
- Porter's four corners (goals, assumptions, strategy, capabilities [FUN-52]) also ask how a competitor would react to you: proposed as an optional question in Insights, with Kotler's reaction patterns as its options (Other ways to answer, last row).
- Other ways to answer: one choice per row of the table above (owner).
- **Not asked:**
  - Doc 28's K5, what customers say (it stays the Customer Experience box, under K6 and K7).
  - How many of their customers come back (it cannot be seen from outside; K7's loyalty ticks ask what they do to bring them back).
  - A competitor's website (doc 28, 6.10), written in the notes.
  - The price (withdrawn, 2026-11-04).

## Numbers changed on 2026-11-04

| 2026-11-03 | Earlier on 2026-11-04 | Now |
|---|---|---|
| K1 (price) | withdrawn | withdrawn |
| K2 (chosen for) | K7, then K9, then K10 | K8 (one rating with the old K3) |
| K3 (falls short) | K8, then K10 | K8 (one rating with the old K2) |
| K4 | K5 | K5 |
| K5 (how sure) | withdrawn | withdrawn |
| K6 (job) | withdrawn | withdrawn |
| (new) | K1 to K4 | K1 to K4 |
| (new) | K6 "Do their customers keep coming back?", then "How do they keep customers coming back?" | K7 (the loyalty ticks under Support & Follow Up) |
| (new) | K7 "How do customers rate them online?", then K7 and K8 (where, then the rating) | K6 (ticked and rated in one) |
| (new) | K8 "Where do customers struggle with them?", then K9 (a rating of each stage) | K7 |
| (new) | the changes that help and hurt, then K11 (one rating) | K9 |
| (new) | K13, then K12 | K10 |
