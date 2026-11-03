# 41. The Competitor card: every question and option, as proposed

Status: **proposal**, written 2026-11-03, updated 2026-11-03. Every question of the Competitor card (Business System, page 1, tile "Competitors"), in the order it is asked. For each: its control, when it is asked, its options, what its "i" says and what it connects to. The Type and the text boxes are built; the questions are not.

Related: doc 35 (the Segment, whose market answers set the order here), doc 36 (the Profile, whose priorities K2 and K3 share), doc 38 (Positioning, whose Differentiation starts K3), doc 42 (the Value Proposition, which reads K3), doc 43 (the Offering, compared with K2 and K3), doc 34 (the list L1 and the value crosswalk, 5.2a), doc 28 (6.6, the design this refines), `src/framework/engine/AnswerBusinessFoundation.ts` and `src/components/interview/editors/foundation/shared.tsx` (the card today).

**What the card is.** A Competitor belongs to its Segment, as a Profile does. The tile "Competitors" in the Segment's frame lists that Segment's competitors as small tiles, and each opens as a floating card. The card has these parts, in order:
- **The head:** the number, the name cell and the one x (built).
- **The Type** (built): Direct competitor, Indirect competitor, Substitute, Internal solution, Status quo. Each type has its explanation in the "i".
- **One box of questions** (proposed): K1 to K6 below, one band each, with the Segment card's layout.
- **The text boxes** (built), each kept as the note for what the questions cannot say. Their titles follow the type (`COMPETITOR_TYPE_QUESTIONS`): Offerings, Market, Customer Acquisition, Customer Experience, Strengths, Weaknesses, Insights & Differentiation.

**Decided (owner, 2026-11-03).**
- **Opportunities and Threats leave the card.** A competitor is assessed by its strengths and weaknesses [FUN-47]. Opportunities and threats are the App User's own, so they belong to the Strategy System's SWOT ("outside, in your market"). Text already saved stays and is shown read-only until it is moved.
- **No "Not sure" option** (owner, 2026-11-02): a question the App User cannot answer yet is left unanswered.

**The rules of the card** are the Segment's (doc 35):
- A radio is one choice; ticks are several, with the limit beside the label ("3 max").
- An option says its few words; the example goes in the "i".
- An answer to a question no longer asked, or to an option no longer offered, is removed on the next choice.
- A slash joins similar things and "or" joins different things. Spelling is UK English.

**What the type asks.** The questions are written for a rival business, and three of the five types are not one:

| Type | K1 price | K2 chosen for | K3 falls short | K4 reach | K6 job | K5 how sure |
|---|---|---|---|---|---|---|
| Direct competitor | asked | asked | asked | asked | asked | asked |
| Indirect competitor | asked | asked | asked | asked | asked | asked |
| Substitute | asked | asked | asked | not asked (no marketing to study) | asked | asked |
| Internal solution | not asked (nothing is bought) | asked | asked | not asked | asked | asked |
| Status quo | not asked | not asked (nothing is chosen) | asked (what doing nothing costs) | not asked | not asked (no job is done) | asked |

This follows the type rules already built for the text boxes: a substitute has no customer acquisition, and the status quo has no offering.

## Box. How they compare

### K1. Is their price lower, about the same or higher than yours?

- **Control:** one choice (a radio).
- **Asked when:** the type is Direct competitor, Indirect competitor or Substitute. It is the first band where Positioning's Differentiation (doc 38, question 8) includes Cost-driven, or the Segment's market is Crowded (doc 35, Box 5, question 4); otherwise it is the last.
- **Options:**
  - Lower
  - About the same
  - Higher
- **The "i" says:**
  - Compare the price a typical customer of this Segment pays for the closest thing they sell. Write the figures in the note.
- **Connections:**
  - *Comes from:* the type; Positioning's Differentiation and the Segment's market (the order only).
  - *Read by (not built yet):* the Review (a lower competitor price while Positioning chose Cost-driven); the Revenue stream's "What is your price based on?" (Competitors' prices offered first, doc 28, 10.2).

### K2. What do customers choose them for?

- **Control:** ticks, up to 3.
- **Asked when:** the type is not Status quo.
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
- **Connections:**
  - *Comes from:* the Segment's Profiles: the options ticked in their B1 come first.
  - *Read by (not built yet):* the Insights & Differentiation draft; the Review (a value your Profiles care about that this competitor delivers and none of your Offerings does, doc 43, O4).

### K3. Where do they fall short?

- **Control:** ticks, up to 3.
- **Asked when:** always.
- **Options:** L1, as K2.
- **The "i" says:**
  - Where they leave their customers wanting more. An opening is where they are weak and you are strong. Choose up to three.
  - For the status quo: what doing nothing costs the customer.
  - Your Positioning's Differentiation starts the ticks; change them freely.
- **Connections:**
  - *Comes from:* Positioning's Differentiation, through the value crosswalk (doc 34, 5.2a): for example Cost-driven ticks Lower price, and Convenience-driven ticks Speed and Ease and convenience. These are starting ticks.
  - *Read by (not built yet):* the Insights & Differentiation draft ("Unlike [name], you offer [an O4 that is a K3]"); the Value Proposition draft (doc 42); the Review (a K3 that none of your Offerings delivers).

### K4. How do they reach customers?

- **Control:** ticks, as many as apply.
- **Asked when:** the type is Direct competitor or Indirect competitor.
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
  - *Read by (not built yet):* the Review (doc 28, 11.5, rule 21): a channel your customers use (the Segment's Box 4 question 2 and the Profiles' C2 to C4) that competitors use and you do not; the order of the Discover channels on page 2.

### K6. What job do they do for their customers?

- **Control:** ticks, up to 3.
- **Asked when:** the type is not Status quo.
- **Options:** the list L17 (doc 34, 5.2), as the Offering's O13:
  - Helps them earn money
  - Keeps things organised
  - Works with what they already use
  - Connects them with people
  - Teaches / informs them
  - Gives more choice
  - Appeals to the senses
- **The "i" says:**
  - The kind of job they do. The same list as on your Offerings, so you can see where you do the same job and where only they do it.
- **Connections:**
  - *Comes from:* nothing (proposed by the owner, 2026-11-03).
  - *Read by (not built yet):* the Value Proposition's open item "Job left to a competitor" (doc 42); the Review, with O13 and K2 (doc 43).

### K5. How sure are you about this?

- **Control:** one choice (a radio).
- **Asked when:** always, once any other question of the card is answered.
- **Options:**
  - I checked it at the source
  - Customers told me
  - It is what I have noticed
  - It is a guess
- **The "i" says:**
  - How you know what this card says. "It is a guess" is an answer: the Review reminds you to check it.
- **Connections:**
  - *Comes from:* nothing.
  - *Read by (not built yet):* the Review ("a guess" adds a reminder to check the competitor).

## What changes when an answer above changes

- A change of the type removes, on the next choice, the answers of the questions the new type does not ask. The text boxes keep their words: the type renames them and never empties them, as built.
- A change of Positioning's Differentiation does not change K3's ticks once the user has changed them; it changes only the starting ticks of an unanswered K3.
- A change of a Profile's B1 changes only K2's order.

## Decided, and still to decide

**Decided (owner, 2026-11-03):**
- Opportunities and Threats leave the card for the Strategy SWOT.
- No "Not sure" options.
- Competitors belong to their Segment.

**Still to decide:**
- Whether K4's words follow the plain words above ("Shops or wholesalers", "Referrals or affiliates") or the page 2 tile names ("Retail & Wholesale", "Referral & Affiliates"). The plain words follow the "or" rule, so the page 2 names would change with them.
- K6 (owner's idea, 2026-11-03): its place before K5, and the L17 words (doc 43, O13).
- **Not asked:**
  - Doc 28's K5, what customers say (it stays the Customer Experience box).
  - A competitor's website or a numeric price (doc 28, 6.10). Both are written in the notes.
