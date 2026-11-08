# 41. The Competitor card: every question and option, as built

Status: **specification**, written 2026-11-03, updated 2026-11-08; built. Every question of the Competitor card (Business System, page 1, tile "Competitors"), in the order it is asked. For each: its control, when it is asked, its options, what its "i" says and what it connects to. **Built (2026-11-04):** the Type, the text boxes kept as notes, and K1 to K10 (`CompetitorQuestions.ts`, the card in `useFoundationSubsections.tsx`). **Built (2026-11-08):** K14, the Differentiation, moved from Positioning (owner, "Move all three"), asked once per Segment after its Competitors and saved on the Segment. **Not built yet:** what reads the answers outside the card (the documents' strengths, weaknesses, opportunities and threats, the Review, Positioning and the Value Proposition).

Related: doc 35 (the Segment, whose answers give K2, K3 and K9 their options and rows), doc 36 (the Profile, whose priorities order K8's rows), doc 38 (Positioning, whose Differentiation moved here as K14 on 2026-11-08), doc 42 (the Value Proposition, which reads K8 and will read K10, not built yet), doc 43 (the Offering, whose Type list K1 shares; a Review check against the Offerings waits until one exists), doc 34 (the list L1 and the value crosswalk, 5.2a), doc 28 (6.6, the design this refines), doc 02 (FUN-47, FUN-50 to FUN-58, the sources of the 2026-11-04 research), `src/framework/engine/AnswerBusinessFoundation.ts` and `src/components/interview/editors/foundation/shared.tsx` (the card today).

**What the card is.** A Competitor belongs to its Segment, as a Profile does. The tile "Competitors" in the Segment's frame lists that Segment's competitors as small tiles, and each opens as a floating card.
- **The small tile:** the number and the name and, under them, the Type ("Direct competitor"). A tile with no Type chosen shows only the number and the name.

The card has these parts, in order:
- **The head:** the number, the name cell and the one x (built).
- **The Type** (built): Direct competitor, Indirect competitor, Substitute, Internal solution, Status quo. Each type has its explanation in the "i".
- **Description** (built): the boxes Offerings, Market, Customer Acquisition and Customer Experience. K1 to K7 are asked inside them (built).
- **Competitors SWOT Analysis** (built): the bands Strengths, Weaknesses, Opportunities and Threats. K8 and K9 are asked inside them (built): K8 is one band across Strengths and Weaknesses, K9 one across Opportunities and Threats.
- **Insights & Differentiation** (built): a section of its own after the SWOT. K10 is asked above its text (built); the text stays the App User's own conclusion.
- **Once per Segment, after the Competitors** (built 2026-11-08): K14, the Differentiation, in the Competitors tile's dialog under the Competitors' small tiles (below).

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

**Controls.** K4 and K6 to K9 use the Rating Scale (K6 with a tick per row, ending in Other), a shared control (`RatingScale` and `RatingScaleGroup` in `src/components/controls/`, doc 21): five radio rounds in a row from 1 to 5, the numbers said once over the rounds and what 1 and 5 mean first in the question's "i", the chosen round pressed again to clear it. K5 is a tick per channel; once a channel that has sub-channels is ticked, a dropdown (`OptionPicker`) of them, one per row, with a "+" to add a row and an × to remove one.

**What the type asks.** The questions are written for a rival business, and three of the five types are not one. The wording follows the type as `COMPETITOR_TYPE_QUESTIONS` does for the text boxes; the stored answer and the options stay the same.

| Question | Direct / Indirect competitor | Substitute | Internal solution | Status quo |
|---|---|---|---|---|
| K1 offer | "What do they offer?" | "What form does this alternative take?" | not asked (nothing is sold) | not asked (no offering) |
| K2 where | "Where do they sell?" | "Where can customers get this alternative?" | not asked | not asked |
| K3 size | "How big is their organisation?" | not asked (not one organisation) | not asked | not asked |
| K4 growing | "Is their business growing?" | "Is this alternative growing?" | not asked | not asked |
| K5 reach | "How do they reach customers?" | not asked (no marketing to study) | not asked | not asked |
| K6 reviews | "Where are they reviewed, and how are they rated?" | "Where is this alternative reviewed, and how is it rated?" | not asked | not asked |
| K7 journey | "How easy do they make each stage for customers?" | "How easy does this alternative make each stage for customers?" | not asked | not asked |
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
  - *Comes from:* the Segment's list of options, in its fixed order.
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

- **Control:** a rating, 1 to 5 (`RatingScale`), inside the Market band, after K3: 1 = Declining, 5 = Growing, said first in its "i" (the degree rule, owner 2026-11-04).
- **Asked when:** the type is Direct competitor, Indirect competitor or Substitute.
- **Wording by type:** Direct competitor, Indirect competitor: "Is their business growing?" Substitute: "Is this alternative growing?"
- **The "i" says:**
  - 1 = Declining, 5 = Growing.
  - From what you can see: more branches, staff, products or reviews, or fewer.
- **Connections:**
  - *Comes from:* nothing. The U.S. Small Business Administration's competitive analysis asks whether a competitor's business is "growing, steady, or declining" [FUN-50].
  - *Read by (not built yet):* the Review.

## Box. Customer Acquisition

### K5. How do they reach customers?

- **Control:** a tick per channel, as many as apply, inside the Customer Acquisition band; once a channel that has sub-channels is ticked, a dropdown (`OptionPicker`) of them beside it, one sub-channel per row, a "+" adding a row under it and an × removing an added row; a sub-channel chosen in one row is not offered in another (owner, 2026-11-04: "defining the specific subchannels of the competitors, and compare them with the customers"). No rating (owner, 2026-11-04: the channels do not need the five rounds). The Customer Acquisition text box is kept as the note.
- **Asked when:** the type is Direct competitor or Indirect competitor.
- **Wording by type:** the same for both types.
- **Options:** the channel categories of page 2 that reach customers, in their order, and the sub-channels of four of them:
  - Social media: the Profile's own list (doc 36, C2): Instagram, Facebook, LinkedIn, YouTube, TikTok, Pinterest, X (Twitter)
  - Community: the Profile's own list (C3): Facebook Group, Discord, Reddit, Slack, Meetup
  - Website
  - Marketplace: Etsy, Amazon, eBay, Not On The High Street, Upwork, Fiverr (no Profile question to compare with; recorded only)
  - In person: the Profile's own list (C4): Market / pop-up, Trade fair / exhibition, Workshop / class, Talk / conference
  - Email
  - Online / live
  - Shops or wholesalers
  - Referrals or affiliates
- **The "i" says:**
  - Tick each channel they use to find customers, then which ones: the same lists as your Profiles, so the app can see where your customers are and they are not.
  - Write their account and shop names in the note. Payment and delivery channels are not listed: they do not reach new customers.
- **Kept as:** the channels under `k5`; the sub-channels under `k5-sub`, each "channel:sub" (`social-media:instagram`), kept while their channel is ticked. A channel's rating saved before 2026-11-04 (`k5-rating`) is dropped on the next answer and read by nothing.
- **Not yet:** the sub-channels in the order of the App User's industry and country, as K6's platforms are: no source by industry was found for social media, communities or events; they stay in the Profile's order.
- **Connections:**
  - *Comes from:* the channel categories of page 2 by id (`BUSINESS_CHANNEL_CATEGORIES`); the sub-channel lists from the Profile's C2, C3 and C4 (doc 36).
  - *Read by (built, 2026-11-04):* K10: once K5 is answered, each social medium, community or kind of event a Profile of the Segment ticks (C2 to C4) that this competitor's sub-channels do not hold is an opening: "Reach customers on TikTok", "Reach customers in Facebook groups", "Meet customers at workshops and classes". It compares with the customers, never with the App User's own channels (The purpose).
  - *Read by (later, once page 2's channels are set):* the Review (doc 28, 11.5, rule 21); the order of the Discover channels on page 2.

## Box. Customer Experience

- **The box's "i" adds (built):** how to find out: "Read their reviews, buy from them or ask for a quote yourself, and ask people who use them." Business Tasmania suggests becoming a customer yourself to see the experience [FUN-58].

### K6. Where are they reviewed, and how are they rated?

- **Control:** a rating group with a tick per row (`RatingScaleGroup`, `selectable`), inside the Customer Experience band, above the Customer Experience text box, which is kept as the note for what customers say. Each platform is a tick; once ticked, it gets a rating from 1 (poor) to 5 (excellent), its stars, rounded to the nearest whole star. Unticking a platform clears its rating. No platform ticked means no reviews yet.
- **Asked when:** the type is Direct competitor, Indirect competitor or Substitute.
- **Wording by type:** Direct competitor, Indirect competitor: "Where are they reviewed, and how are they rated?" Substitute: "Where is this alternative reviewed, and how is it rated?"
- **Rows:** the review platforms, list L18 (doc 34, 5.2b), in this order: Google and Facebook first; then the platforms of the App User's industry (the first activity's industry, `organisation.activities[0]`, through the crosswalk L7, doc 34, 5.3); then those of the App User's country (`organisation.country`); the list ends in Other (below). A platform ticked earlier stays shown.
- **The "i" says:**
  - 1 = Poor, 5 = Excellent.
  - Tick each place they are reviewed and give their average there, to the nearest star. Most people only use a business with 4 stars or more.
  - Not listed? Tick Other and write it. Google is where most people read reviews of local businesses (71% in 2026).
  - Then the examples behind the catch-all platforms (`REVIEW_PLATFORM_EXAMPLES`): "Marketplace: where they sell, such as Etsy, Amazon or eBay." "App store: Apple's App Store or Google Play." "Trade directory: Checkatrade or TrustATrader in the UK, Angi or HomeAdvisor in the US, HomeStars in Canada." "Food delivery app: Just Eat or Deliveroo in the UK, Grubhub in the US, SkipTheDishes in Canada, Menulog in Australia."
- **Connections:**
  - *Comes from:* the Organisation's country and first activity (Legal Entity, `AnswerLegal.ts`), which order the rows. The order by industry and country rests on directory and vendor lists [FUN-64, FUN-65], not on a survey of how many people use each site; the use of Google and Apple Maps and the 4-star threshold rest on BrightLocal's survey of US consumers [FUN-62], Trustpilot in the UK on Littlechild [FUN-63]. The SBA asks what customers and prospects say about competitors [FUN-50].
  - *Read by (built):* K10 ("Win over their unhappy customers", for a platform rated below 4).
  - *Read by (not built yet):* the Review.

### K7. How easy do they make each stage for customers?

- **Control:** a rating group (`RatingScaleGroup`): one row for each of the app's Journey Stages, rated 1 (hard) to 5 (easy). A row left unrated is unanswered. No loyalty ticks (owner, 2026-11-04: they repeat K5's channels, Email and Community among them).
- **Asked when:** the type is Direct competitor, Indirect competitor or Substitute.
- **Wording by type:** Direct competitor, Indirect competitor: "How easy do they make each stage for customers?" Substitute: "How easy does this alternative make each stage for customers?"
- **Rows:** the app's Journey Stages (`BUSINESS_JOURNEY_STAGES`, page 2, Customer Engagement), in their order:
  - Discover
  - Evaluation
  - Purchase
  - Delivery
  - Support & Follow Up
- **The "i" says:**
  - 1 = Hard, 5 = Easy.
  - Where their customers are let down along the way, and where it goes smoothly. The values below say what falls short; this says where.
  - To find out, look at their website and social media, sign up to their newsletter or buy from them once.
- **Connections:**
  - *Comes from:* the owner's decisions (2026-11-04): the loyalty question overlapped the journey's last stage, then its ticks repeated K5's channels, so they went. Lemon and Verhoef describe the customer's journey in three stages, before, during and after the purchase, the "loyalty loop" after it [FUN-59]; page 2's five Journey Stages divide the same journey. Invest Northern Ireland lists a competitor's "customer loyalty devices" [FUN-51]; how many customers come back cannot be seen from outside, what a competitor does to bring them back can.
  - *Read by (built):* K10 ("Make buying easier" and the like, for a stage rated 1 or 2).
  - *Read by (not built yet):* page 2's Journey Stages, where the App User plans each stage.

For Internal solution and Status quo the box stays text only: it asks about the effort or the current behaviour, which K8 already rates.

**Other (K6; owner 2026-11-04, in place of "Show all").** The platforms end with an Other tick; K8's values are the fixed list L1, as the Profiles use, with no Other (owner, 2026-11-04: no input was asked for there; a value written there before is dropped when the answers are read). Ticked, it adds a row whose words are a text cell, rated as the listed rows are; "Add another" adds one more. A name that means a listed item (its words in any case, or a known other name: Etsy or Amazon for Marketplace, Checkatrade for Trade directory) becomes that item when the cell is left, its rating kept. Unticking Other takes its rows and their ratings away. The names are kept as "<id>-other", each rated as "other-<n>".

## Band. Strengths and Weaknesses

### K8. How do they do on what customers value?

- **Control:** a rating group (`RatingScaleGroup`): one row per value, rated 1 (weak) to 5 (strong); one band across Strengths and Weaknesses, with one Notes under it (owner, 2026-11-05), what no rating says, kept under `strengths`. A row left unrated is unanswered (no "Not sure").
- **Asked when:** always.
- **Wording by type:**
  - Direct competitor, Indirect competitor: "How do they do on what customers value?"
  - Substitute: "How does this alternative do on what customers value?"
  - Internal solution: "How does doing it themselves do on what customers value?"
  - Status quo: "How does doing nothing do on what customers value?" For example, Affordability can be a 5, because doing nothing is free. (doc only)
- **Rows:** every value of L1 (owner, 2026-11-04: "place all the options, but in a hierarchy order depending on the profiles what matters most. Also, highlight the options according to the profile"): ordered by the highest B1 rating among the Segment's Profiles (Essential first), then by how many Profiles tick it, then L1's order (`competitorValueRows`). Each row a Profile ticks carries a band of one colour whose step is only the number of Profiles that chose it, not their ratings (owner, 2026-11-04): 1 Profile the lightest, then 2, 3, and 4 or more the darkest (`bandTone`, `valueProfiles`; the tokens `--tint-importance-1` to `-4`, doc 21). With one Profile in the Segment every chosen row has the same light band; an unchosen row has none. No Other. The list L1:
  - Affordability
  - Speed
  - Convenience
  - Quality
  - Reputation
  - Expertise
  - Personalisation
  - Support
  - Safety / security
  - Values
- **The "i" says:**
  - 1 = Weak, 5 = Strong.
  - Rate each from what their customers say and what you have seen: 1 is a clear weakness, 5 a clear strength.
  - Once a row has a band: "The darker the band, the more of your Profiles chose it."
- **Connections:**
  - *Comes from:* the Profiles' B1 (doc 36), its ticks (the rows) and its ratings (their order; K10's weights). The owner's decision (2026-11-04): Strengths and Weaknesses used the same options, so one rating replaces the two tick lists and a value rated 2 to 4 also counts in the App User's decisions. The Competitive Profile Matrix rates each success factor from major weakness to major strength [FUN-57]; Kotler's customer value analysis rates competing offers on the attributes customers rank as most important [FUN-55]; a five-point rating as Likert's [FUN-61]. The Profiles' B1 sets the order of the rows; no row starts rated.
  - *Read by (built):* K10's options; the Insights & Differentiation draft.
  - *Read by (not built yet):* ratings of 4 and 5 are listed as the competitor's strengths, and 1 and 2 as its weaknesses (the SWOT, the documents and the exports); 3 is neither. The Value Proposition draft (doc 42); later, once an Offering exists, the Review (a value customers want that this competitor is rated 1 or 2 on and none of your Offerings delivers).

## Band. Opportunities and Threats

### K9. How could each change affect them?

- **Control:** a rating group (`RatingScaleGroup`): one row per change, rated 1 (threat) to 5 (opportunity); one band across Opportunities and Threats, with one Notes under it (owner, 2026-11-05), what no change says, kept under `opportunities`. A row left unrated is unanswered.
- **Asked when:** always.
- **Wording by type:**
  - Direct competitor, Indirect competitor: "How could each change affect them?"
  - Substitute: "How could each change affect this alternative?"
  - Internal solution: "How could each change affect customers doing it themselves?"
  - Status quo: "How could each change affect customers who do nothing?"
- **Rows:** the Segment's "What is changing most for your customers?" (doc 35, Box 5, question 3; `trends`). The changes the Segment ticked come first. No band (owner, 2026-11-04: no Segment or Profile answer chooses a change directly; the links tried that evening were withdrawn):
  - Technology
  - Rules and law
  - The economy
  - Society and lifestyle
  - Supply and delivery
  - Environment and climate (added 2026-11-08 with the Segment's option)
- **The "i" says:**
  - 1 = Threat, 5 = Opportunity.
  - How each change could help or hurt them. The examples of each change, as on your Segment.
- **Connections:**
  - *Comes from:* the owner's decision (2026-11-04): one rating replaces the two tick lists of changes that help and changes that hurt. The Segment's ticks set the order of the rows; no row starts rated. SWOT's external factors, favourable or unfavourable [FUN-53].
  - *Read by (built):* K10's options.
  - *Read by (not built yet):* ratings of 1 and 2 are listed as the competitor's threats, and 4 and 5 as its opportunities (the SWOT, the documents and the exports); 3 is neither. The Review.

## Section. Insights & Differentiation

A section of its own after the SWOT, as built: a title band that folds, as the Description and the SWOT do (owner, 2026-11-04), an "i" and one text, which stays the App User's own conclusion. K10 is asked above the text, answered from this card's earlier choices (built).
- **The question (built):** it follows the type (`COMPETITOR_TYPE_QUESTIONS` in `shared.tsx`). Direct and Indirect competitors use `SUBSECTIONS.competitors.insights`: "What can you learn from competitors to make your offering more distinctive?" Substitute: "What could make customers switch from this alternative to your offering?" Internal solution: "What have you learned from customers solving this themselves, and how could your organisation make it easier, better, faster, or more valuable?" Status quo: "What could trigger customers to change?"
- **The draft (built):** "Customers want [a B1 value], and [name] falls short there." One line for each value the Segment's Profiles ticked in B1 that K8 rates 1 or 2, listing every competitor of the Segment that falls short on the same value. Each opening ticked in K10 adds "You could [opening]." It is added at the end of the text, by the link "Add to text" under K10, and never overwrites it; only the lines not already in the text are added, and the link is not shown when none is left (owner, 2026-11-04). The App User then writes what they will do differently.
- **Connections:** *Comes from:* K8, K10 and the Profiles' B1 (doc 36), not the Offerings.

### K10. What could you do differently?

- **Control:** ticks, up to 3, in the Insights & Differentiation band, above its text box, which is kept as the note.
- **Asked when:** at least one of its options exists. With no options, only the text shows.
- **Wording by type:** the same for every type; the options follow the type (below).
- **Options:** built by the app from this card's answers, each by its rule, and shown only once its source question is answered:
  - From K8's ratings, the whole scale. Each rated value has an opening score, (5 − rating) × weight, where the weight is the Profiles' highest rating of the value in "What matters most" (doc 36, B1; B1 is rated, doc 36, section 11, built 2026-11-04), 1 to 5; 2 where a Profile of the Segment ticks the value but has not rated it, and 1 where no Profile ticks it. The options come in score order; ties are broken by how many of the Segment's competitors rated the value low.
    - Rating 1 or 2: what to offer, in the value's own words: "Offer lower prices", "Be faster", "Make it more convenient", "Offer better quality", "Earn a better reputation", "Offer more expertise", "Offer a tailored service", "Offer better support", "Make it safer", "Show shared values" (with the values' one-word names, owner 2026-11-06).
    - Rating 3: "Be known for [value]" (they are average, so there is room), for example "Be known for quality".
    - Rating 4: "Match them on [value]", shown only for a B1 value (customers expect it).
    - Rating 5: no option.
  - Once K5 is answered, for each social medium, community or kind of event a Profile of the Segment ticks (C2 to C4) that K5's sub-channels do not hold: "Reach customers on TikTok", "Reach customers in Facebook groups", "Meet customers at workshops and classes".
  - For each stage K7 rates 1 or 2: Discover "Make it easier to find you", Evaluation "Make it easier to compare and choose", Purchase "Make buying easier", Delivery "Make delivery smoother", Support & Follow Up "Give better help after the sale".
  - If a platform is rated below 4 stars in K6: "Win over their unhappy customers".
  - If K4 is rated 1 or 2: "Win the customers they are losing".
  - For each change K9 rates 4 or 5: "Make the most of changes in [change]". For each change K9 rates 1 or 2: "Prepare for changes in [change]".
  - By type: a Substitute's options say "this alternative" ("Win over this alternative's unhappy customers"). Internal solution: "Make it easier than doing it themselves". Status quo: from the values K8 rates 1 or 2, "Show what doing nothing costs them in [value]"; from the changes K9 rates 1 or 2, "Use changes in [change] as a reason to act now".
- **The "i" says:**
  - Openings drawn from what you answered above. Tick the ones you will act on, then write how in the text.
  - For each value rated 5: "[name] is hard to beat on [value], so compete elsewhere."
- **Connections:**
  - *Comes from:* K4, K5, K6, K7, K8 and K9, and the Profiles' B1 (doc 36).
  - *Read by (built):* the draft at the end of the text: "Customers want [value], and [name] falls short there." for a B1 value rated 1 or 2, then "You could [opening]." for each tick ("You could offer better quality."); "Add to text" adds only the lines not already in the text, and is not shown when none is left.
  - *Read by (not built yet):* the Segment's Differentiation (K14, below: K10's openings could suggest its starting ticks); the Value Proposition (doc 42). Nothing outside the card reads K10 yet.

### K14. Differentiation (once per Segment, after its Competitors; moved from Positioning, owner, 2026-11-08)

The owner decided (2026-11-08, "Move all three") that Positioning's Differentiation (doc 38, 8) is answered here, after the competitors: a differentiation is set against the alternatives the customer would otherwise choose (Dunford, *Obviously Awesome*, 2019: the competitive alternatives first, then the unique attributes and the value they enable). A Competitor card is one competitor, so the question is asked **once per Segment**, not on each card: the code K14 is the next free code of this card (K11 to K13 are retired), and the answer is saved on the Segment.

- **Where:** the Competitors tile's dialog of the Segment, under the Competitors' small tiles: a section split by the shared double rule, its title band "Insights & Differentiation", the question in a band under it, as the Segment Description's Profiles section is built. (In the page's column view, the Segment's group "Insights & Differentiation" after the Competitor cards.) Saved as `questions.differentiation` on the Segment (`SegmentQuestions.ts`, box `competitors`).
- **Control:** a radio while the stage allows one choice, else ticks that lock at the limit with "2 max" beside the label (`FieldRow`, `RadioChoice` or `BusinessTicks`, as on Positioning): Planning 1, Launching 2, Managing 2, Growing free (`choiceLimit`, the outcome's limit). A saved answer over the stage's limit goes back to empty, as on Positioning.
- **Asked when:** always, once per Segment.
- **Options:** as built on Positioning: Cost-driven; Convenience-driven; Compliance, Risk & Security; Status & Premium; Performance & Innovation; Ecosystem & Integration; Personal Service & Relationship. Ordered by Positioning's answers as before (doc 31, the owner's tables; `differentiationOptionsFor`): a blank of the business scale's table is not offered, one chosen stays.
- **Starts:** Positioning's Differentiation saved before 2026-11-08 (`organisation.differentiation`) is the starting value of every Segment's K14, within the stage's limit, until the Segment saves its own; a value saved here wins, even cleared (saved as an empty list). (K10's openings could suggest starting ticks later: not built.)
- **The "i" says:** as on Positioning (doc 38, 8), its first line now "It is about the offering; the result the buyer gets from it is asked on each Offering (what it does best for the customer).", then the stage's line before the sources.
- **Connections:**
  - *Comes from:* Positioning's relationship, audience, buyer's category, end user and purposes (the order); the stage (the limit).
  - *Read by (built):* the Offering's O4, whose starting ticks follow it through the value crosswalk (doc 34, 5.2a; doc 43); the Business Plan's "What we know of them" and the export's Segment block, which print it under the Segment.
  - *Read by (not built yet):* the Value Proposition draft's "Unlike its competitors" (doc 42).

## As built: the readings chosen (2026-11-04)

Where the text above left a choice, the build took the simplest reading:
- A card with no Type yet is asked as a Direct competitor.
- K6's industry is the Organisation's first activity read through the crosswalk L7 by its division (`industryOfActivity`); with no activity or country, Google and Facebook come first; any other platform is written under Other.
- K8's rows: all of L1, ordered by the Profiles' highest rating, then how many chose it; banded by how many chose it (`valueProfiles`, `bandTone`). K9's rows: the Segment's ticked changes first, no band.
- K10: an option shows once its source is answered; "Make it easier than doing it themselves" for an Internal solution once a value of K8 is rated; the Status quo has only its own two kinds of opening. Values and changes inside a sentence start with a small letter ("Prepare for changes in the economy").
- A Type change keeps the answers until the next answer, which settles them against the new Type (`competitorSettle`); the text boxes keep their words.
- The answers are kept in the Competitor's `questions` (question id to the ids chosen; a rating as "option:point" under "<id>-rating", K4 as its point).

## Other ways to answer (proposed, 2026-11-04)

Each row keeps the current question and proposes another way to answer it, with its source; the owner chooses. A way that compares the competitor with the App User's own Offerings, prices, size or channels is withdrawn (The purpose, above). Only the open rows stay here; the rows decided or gone (K1, K2, K5, K7's loyalty ticks, K8, K9) are under Decided, below.

| Question | Now | Another way | Source | Recommended |
|---|---|---|---|---|
| K3 How big is their organisation? | Micro to Large | a. Withdrawn: "Compared with you, how big are they?" Smaller / About the same / Larger. b. "What role do they play in your market?" Market leader / Challenger / Follower / Specialist, with the meaning of each in the "i" | Kotler's market roles: leader, challenger, follower, nicher (Kotler, 1997, as cited in Cuellar-Healey and Gomez, 2013) [FUN-53, FUN-54] | Keep Now, plus b as an extra question; a withdrawn: the App User may have no Offerings or staff yet |
| K4 Is their business growing? | A rating, Declining to Growing | "What signs have you seen?" Ticks: More locations / New products / Hiring / More reviews / Price cuts / Closures; the app draws growing, steady or declining from them | SBA: growing, steady or declining [FUN-50]; Kotler: sales, capacity and new investment as signs of performance (as cited in Cuellar-Healey and Gomez, 2013) [FUN-53] | Keep Now: it is quicker |
| New, optional, in Insights | Not asked | "How would they react to a new rival?" Ignore it / React to some moves / Fight back on everything / Unpredictable | Kotler's reaction patterns: laid-back, selective, tiger, stochastic [FUN-55]; Porter's four corners [FUN-52] | Yes, as optional |

## What changes when an answer above changes

- A change of the type removes, on the next choice, the answers of the questions the new type does not ask. The text boxes keep their words: the type renames them and never empties them, as built.
- A change of a Profile's B1 changes only the order of K8's rows and the weights of K10's options, never a rating.
- Unticking a platform in K6 clears its rating; a change of the Organisation's country or first activity changes only the order of K6's rows.
- A change of K4, K6, K7, K8 or K9 changes K10's options; a ticked option no longer offered is removed on the next choice.
- A change of the Segment's `trends` changes only the order of K9's rows.

## Decided, and still to decide

**Decided (owner):**
- The Competitor's SWOT stays whole and is not the Strategy SWOT (2026-11-04).
- No price question (2026-11-04).
- No job question: an Offering question (2026-11-04).
- No "how sure" question (2026-11-04).
- The questions numbered K1 to K10 in the card's order (2026-11-04).
- Positioning's Differentiation answered here, after the competitors, once per Segment: K14 (owner, 2026-11-08, "Move all three"; Dunford, *Obviously Awesome*: differentiation is set against the alternatives). Codes are permanent: K14 is the next free code (doc 44).
- Strengths and Weaknesses as one rating, K8: each value customers want rated from 1 (Weak) to 5 (Strong), so that values rated 2 to 4 also count in the App User's decisions (2026-11-04).
- Opportunities and Threats as one rating, K9: each of the Segment's changes rated from 1 (Threat) to 5 (Opportunity) (2026-11-04).
- The review platforms ticked and rated in one question, K6, the platforms in the order of the App User's industry and country (2026-11-04).
- The loyalty question within the journey, under K7's Support & Follow Up (2026-11-04); then its ticks removed: they repeated K5's channels (owner, 2026-11-04).
- K5 not rated (owner, 2026-11-04: the channels do not need the five rounds): each channel ticked, then its sub-channels chosen in a dropdown, one per row, from the Profile's own lists, so where the customers are and the competitor is not becomes an opening in K10.
- K8 shows every value, the Profiles' highest rated first, each chosen value with a band of one colour, darker the more Profiles chose it (owner, 2026-11-04, replacing the same evening's rows of the Profiles' values only, then bold, then a colour per Profile, then a band by rating). K9 has no band: no answer chooses a change directly.
- The Market and Customer Experience Notes say, before anything is written, only what no question asks (owner, 2026-11-07: "Approve Decisions 2, 3, and 4 as proposed, and for Decision 1, approve Q1–Q6 with two targeted adjustments"): Market "What no answer above says about their market"; Customer Experience "What no rating above says, in their customers' words".
- The SWOT has two Notes (`OptionalNote`, titled "Notes", as on the Profile card; owner, 2026-11-05): one under K8 for strengths and weaknesses, one under K9 for opportunities and threats, with no "i", as every card's Notes (its "i" fell off the line, 2026-11-05); the placeholder says what belongs there ("Strengths and weaknesses no rating above says"; "Opportunities and threats no change above says"). Text saved in the four boxes before is read into them: the second box's text joined in as its own line, "Weaknesses: ..." (and "Strengths: ..." before it where there is any), likewise "Threats: ..." (`AnswerBusinessFoundation.ts`, tested). The Market document's table has one column, Strengths and weaknesses; the export's two, Strengths and weaknesses, Opportunities and threats.
- No attract question (owner, 2026-11-04): it repeated the channels ("Content / social posts" is Social media, "Events / fairs" In person, "Referral rewards" Referrals or affiliates, and paid ads run on those channels). Customer Acquisition asks only K5; answers saved to it are dropped when read.
- "Show all" removed; the platforms end in Other, written and rated; the values are the fixed list L1 with no Other (owner, 2026-11-04).
- **A clear opening** (owner, 2026-11-06; built): a value a Profile of the Segment rates 5 (Essential) in B1 and every Competitor of the Segment (at least one, each having rated it) rates 1 or 2 in K8. Its option comes first in K10 on each of those Competitors, and the Review says, under Worth a second look, with Go there to the Competitors tile: "every Competitor in [Segment] is weak on [value], which your Profiles rate Essential. It could be your clearest way to stand out." (`clearOpenings`, `ReviewItems.ts`, tested). Read live as the ratings change.
- Not built, rejected (owner, 2026-11-06): a Review check of a marketplace seller with a slow delivery (K5 against K7): how a competitor delivers cannot be checked from outside, and the check would be a guess.
- K10 shows its first six options (the values by their score first) and any already ticked (`shownOpenings`; owner, 2026-11-05: thirteen options under "3 max" were too many).
- K10's options and the draft in a natural voice, the value, stage or change in small letters inside a sentence (owner, 2026-11-04; doc 28, section 4; doc 39).
- A rating shows the numbers 1 to 5 over its rounds; what 1 and 5 mean is the first line of the question's "i" (owner, 2026-11-04: an end word could stand over two rounds).
- The ratings use one shared control, the Rating Scale (`RatingScale`, `RatingScaleGroup`: five radio rounds from low to high, doc 21) (2026-11-04).
- The Type shown on each competitor's small tile (2026-11-04).
- Degree and comfort questions use the 1 to 5 rating unless named ranges exist: K4 (2026-11-04).
- No "Not sure" options (2026-11-02); no "Other" unless another answer can exist (2026-11-04).
- Competitors belong to their Segment (2026-11-03).
- Other ways to answer, K1, K2 and K5 (2026-11-04): each keeps its question. The ways that compare with the App User's own Offerings, area or channels are withdrawn ("Which of your Offerings do they compete with?" [FUN-56]; "Compared with you, where do they sell?" [FUN-53]; the App User's page 2 channels marked "They use it too" / "Only you" [FUN-53]): the App User may have no Offerings or channels yet (The purpose).
- Other ways to answer, K7 (2026-11-04): the loyalty ticks went; Kotler's share of mind and share of heart ("Do customers name them first?", "Do customers prefer them?" [FUN-53, FUN-55]) are not added.
- Other ways to answer, K8 and K9 (2026-11-04): the grid of Well / Partly / Poorly [FUN-55, FUN-57] and the marks Helps them / Hurts them / Both / Neither [FUN-53] are replaced by K8's and K9's 1 to 5 ratings.

**Still to decide:**
- Whether K5's words follow the plain words above ("Shops or wholesalers", "Referrals or affiliates") or the page 2 tile names ("Retail & Wholesale", "Referral & Affiliates"). The plain words follow the "or" rule, so the page 2 names would change with them.
- The order of K6's platforms by industry and country rests on directory and vendor lists, not on a survey of use; a survey of UK consumers' use of review sites would improve it.
- Considered, not added: "How much effort does buying from them take?" (customer effort [FUN-60]). It repeats L1's "Convenience", a row of K8, and K7's rating of each stage.
- Porter's four corners (goals, assumptions, strategy, capabilities [FUN-52]) also ask how a competitor would react to you: proposed as an optional question in Insights, with Kotler's reaction patterns as its options (Other ways to answer, last row).
- Other ways to answer: one choice per row of the table above (owner).
- **Not asked:**
  - Doc 28's K5, what customers say (it stays the Customer Experience box, under K6 and K7).
  - How many of their customers come back (it cannot be seen from outside).
  - A competitor's website (doc 28, 6.10), written in the notes.
  - The price (withdrawn, 2026-11-04).

## Numbers changed on 2026-11-04

| 2026-11-03 | Earlier on 2026-11-04 | Evening of 2026-11-04 | Later that evening | Now |
|---|---|---|---|---|
| K1 (price) | withdrawn | withdrawn | withdrawn | withdrawn |
| K2 (chosen for), K3 (falls short) | K7 and K8, then K9 and K10, then K10 | K8 (one rating) | K9 | K8 |
| K4 (reach) | K5 | K5 | K5 (ticked and rated) | K5 |
| K5 (how sure) | withdrawn | withdrawn | withdrawn | withdrawn |
| K6 (job) | withdrawn | withdrawn | withdrawn | withdrawn |
| (new) | K1 to K4 | K1 to K4 | K1 to K4 | K1 to K4 |
| (new) | (none) | (none) | K6 (how they attract) | withdrawn |
| (new) | K7 and K8 (reviews), K6 (loyalty) | K6 (reviews), K7 (journey with loyalty) | K7 (reviews), K8 (journey with loyalty) | K6 (reviews), K7 (journey with loyalty) |
| (new) | the changes that help and hurt | K9 (one rating) | K10 | K9 |
| (new) | K13, then K12 | K10 | K11 | K10 |

The saved answers moved with the numbers on 2026-11-04 (only the examples held them). Since K6 (attract) went, answers saved under the earlier numbers are read under the new ones: K6 dropped, K7 to K11 read as K6 to K10 (`AnswerBusinessFoundation.ts`).
