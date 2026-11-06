# 43. The Offering card: every question and option, as proposed

Status: **proposal**, written 2026-11-03, updated 2026-11-04. Every question of the Offering card (Business System, page 1, tile "Offerings"), in the order it is asked. For each: its control, when it is asked, its options, what its "i" says and what it connects to. The Type, the needs addressed and the text boxes are built; the questions are not.

Related: doc 35 (the Segment: age, how they pay, the kind of area), doc 36 (the Profile: the needs, B1, D2, E3), doc 38 (Positioning: Differentiation), doc 41 (the Competitor: K8), doc 42 (the Value Proposition, which reads O1, O4 and O8), doc 34 (the lists L1 and L11, the value crosswalk 5.2a), doc 28 (6.8, 7.4, 10.1 to 10.3 and 11.7, the design this refines), `src/framework/engine/AnswerBusinessFoundation.ts` (the card today).

**What the card is.** An Offering belongs to its Segment, as a Profile does. Pages 2 to 5 read it by id and never copy it (the page specifications' README, point 1). The card has these parts, in order:
- **The head:** the number, the name cell and the one x (built).
- **The Type** (built): Product, Service, Hybrid, or Other with its name.
- **Functional Needs Addressed** (built): ticks of the Segment's Profiles' functional needs (proposed 2026-11-06: their L17 ticks, O13 merged in; below, after O13).
- **One box of questions** (proposed): O1 to O13 below, one band each, with the Segment card's layout; O12 is derived, not asked (2026-11-06).
- **The text boxes** (built), each kept as the note for what the questions cannot say: Function; Customer Benefit (O4); Content & Scope; Purchase & Delivery (O3, O6); Support & Communication (O7); Requirements & Conditions (O10).

**The rules of the card** are the Segment's (doc 35):
- A radio is one choice; ticks are several, with the limit shown.
- An example goes in the "i".
- An answer to an option no longer offered is removed on the next choice.
- There is no "Not sure" option (owner, 2026-11-02).
- A slash joins similar things and "or" joins different things. Spelling is UK English.

**What the Offering shapes later.** O3 is the one place that says how customers pay over time; O6 and O7 propose page 2's channels; O1 and the Type decide the goods options of pages 2 and 3 (doc 28, 11.7). So the box asks these first, after what the Offering is.

## Box. What it is and how it reaches them

### O1. What form does it take?

- **Control:** one choice (a radio).
- **Asked when:** the Type is chosen. The options follow the Type. For a Hybrid, the card says: make one Offering for each form, or choose the main one.
- **Options:**
  - Product: A physical item; A digital file; An app / online tool; Online access
  - Service: A live online session; An in-person service; Project work; An ongoing service
  - Hybrid: the eight above
  - Other: not asked
- **The "i" says:**
  - It refines the Type. A product and a service sold together is the Type Hybrid.
  - Online access: a membership area, a course platform or a subscription library.
- **Connections:**
  - *Comes from:* the Type.
  - *Read by (not built yet):* O6's starting value; the goods and service options of pages 2 and 3 (doc 28, 11.7: without a physical item, Physical Delivery and the delivery costs are hidden, not deleted); the Value Proposition draft (doc 42).

### O2. Can customers buy it today?

- **Control:** one choice (a radio).
- **Asked when:** always.
- **Options:**
  - Yes, now
  - Almost ready
  - In a trial / beta
  - Still being built
  - Just an idea
- **Starts from the business stage** (proposed, owner 2026-11-06; `BusinessStage.ts`, from the Opening Date): Planning → "Still being built"; Launching → "Almost ready"; Managing or Growing → "Yes, now". Only a starting value: an answer chosen is never overwritten, and every option stays (a growing business can still plan a new Offering, "Just an idea").
- **The "i" says:**
  - Where it stands today. Sales planned before it is ready are noted on the Review.
  - It starts from your business stage; change it for this Offering.
- **Connections:**
  - *Comes from (proposed):* the business stage (Organisation: the Opening Date and the Global Settings' durations).
  - *Read by (not built yet):* the Review (a Demand estimate for an Offering that is not ready; a mismatch with the stage: Planning with an Offering "Yes, now", sales before the opening, or Managing with every Offering "Just an idea"); the Business Plan's product section.

### O3. How do customers pay for it?

- **Control:** one choice (a radio).
- **Asked when:** always.
- **Options:**
  - One purchase
  - A subscription
  - A membership
  - A licence
  - Pay as they go
  - A project or contract
  - A monthly retainer
- **The "i" says:**
  - How often they pay, and on what terms. It sets how Demand counts their purchases, how Delivery counts the work and how the Revenue stream charges.
  - Subscription: regular payments until they cancel. Pay as they go: they pay for what they use.
- **Connections:**
  - *Comes from:* the Segment's "How do your customers pay?" (doc 35, Box 4, question 8). Invoice, bank transfer or purchase order puts A project or contract first, as an order only.
  - *Read by (not built yet):* Demand's "Customers buy", Delivery's "Delivered" and the Revenue stream's "Charged" (doc 28, 11.7 and 10.2); the Review (doc 28, 11.5, rule 14).

### O4. What does it do best for the customer?

- **Control:** ticks, up to 3. The first ticked is the main benefit.
- **Asked when:** always.
- **Options:** the list L1, the Profile's "What matters most" (doc 36, B1):
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
  - The benefits your customers get. The first you tick is the main one. Choose up to three.
  - The same list as "What matters most" on your Profiles and on your Competitors, so the three can be compared.
  - Your Positioning's Differentiation starts the ticks; change them freely.
- **Connections:**
  - *Comes from:* Positioning's Differentiation, through the value crosswalk (doc 34, 5.2a), as starting ticks.
  - *Read by (not built yet):* the Value Proposition draft and its open items (doc 42); the Review (doc 28, 11.5, rules 21 and 22: against the Profiles' B1 and the Competitors' K8).

### O6. How does the customer receive it?

- **Control:** one choice (a radio).
- **Asked when:** always.
- **Options:**
  - Sent automatically online
  - Sent by you online
  - In a live online session
  - In person
  - Posted / shipped to them
  - They collect it
  - Ongoing online access
- **The "i" says:**
  - How it reaches them once bought. It proposes the delivery channels on the Customer Engagement page.
  - Sent automatically online: a download or an email sent by the shop. Sent by you online: a file you send when it is ready.
- **Connections:**
  - *Comes from:* O1, the starting value: a physical item → Posted / shipped to them; a digital file → Sent automatically online; a live online session → In a live online session; online access → Ongoing online access.
  - *Read by (not built yet):* the Delivery stage's proposed channels (doc 28, 7.4); the Review (the Segment's "Rural / remote", doc 35 Box 2 question 2, with In person or Posted / shipped: a delivery-cost check, rule 17).

### O7. What help do you give after they buy?

- **Control:** one choice (a radio).
- **Asked when:** always.
- **Options:**
  - None
  - Guides and how-tos
  - Automatic help, such as chat or emails
  - Personal help when needed
  - A dedicated person or team
  - It depends on the plan
- **The "i" says:**
  - The help that comes with it after the sale. It proposes the support channels and the kind of relationship on the Customer Engagement page.
- **Connections:**
  - *Read by (not built yet):* the relationship type's starting value and the Support & Follow Up channels on page 2 (doc 28, 7.4); the Review against the Profiles' D2 (doc 36): "wants to talk to a person" while the help is None or Guides and how-tos (rule 10).

## Box. What it answers

### O8. Which of their worries does it answer?

- **Control:** ticks, as many as apply.
- **Asked when:** a Profile of the Segment has answered E3 (doc 36).
- **Options:** the worries ticked in the Segment's Profiles' E3 (the list L2), in the order of the list.
- **The "i" says:**
  - The doubts that stop your customers buying from you, as your Profiles say. A worry that nothing answers is shown on the Value Proposition tile.
  - Select all that apply.
- **Connections:**
  - *Comes from:* the Profiles' E3.
  - *Read by (not built yet):* the Value Proposition's open items (doc 42); the actions proposed at the Evaluation stage on page 2 (doc 28, 11.5, rule 8: price → a quote; trust → proof; fit → a demo).

**The emotional and social needs are not asked here** (owner, 2026-11-06): the Value Proposition answers them (doc 42, its one owner). An "Emotional and social needs addressed" question proposed here on 2026-11-03 is withdrawn.

### O13. What job does it do for them?

- **Control:** ticks, up to 3.
- **Asked when:** always.
- **Options:** the list L17 (doc 34, 5.2):
  - Helps them earn money
  - Keeps things organised
  - Works with what they already use
  - Connects them with people
  - Teaches / informs them
  - Gives more choice
  - Appeals to the senses
- **The "i" says:**
  - The kind of job it does, beyond what it does best (O4).
  - Appeals to the senses: how it tastes, looks, sounds or feels.
  - Based on: Bain's Elements of Value (HBR).
- **Connections:**
  - *Comes from:* nothing. The Profiles' functional needs stay their own words (doc 36, section 10); the owner proposed this list (2026-11-03) to compare the Offering with the Competitors; the Competitor's job question was withdrawn on 2026-11-04, so the comparison is gone and whether O13 stays is open.
  - *Read by (not built yet):* the Review. Doc 41's job question was withdrawn on 2026-11-04 as an Offering question, and with it the Value Proposition's open item "Job left to a competitor" (doc 42); a Competitor chosen for the same thing (rated 4 or 5 in K8, doc 41, against O4) is still a close rival, to be answered in its Insights & Differentiation. No Competitor question uses L17 now.

**Proposed (owner, 2026-11-06): the functional needs as choices, and O13 merged into them.** L17 is the rest of Bain's functional elements of value [FUN-48], those the Profile's "What matters most" (B1, L1) does not already hold: saves time is Speed, simplifies and avoids hassles are Ease and convenience, reduces cost is Lower price, reduces risk is Safety and low risk, quality is Quality and results. So:
- The Profile's Functional needs (doc 36, section 10) become ticks from L17, up to 3, each rated, as the Emotional and Social needs are, with the Notes under them for what no tick says (the specifics in the App User's words).
- The Offering's "Functional Needs Addressed" ticks those ticked needs, the ones the Segment's Profiles chose; O13 is merged into it and goes: one question, no overlap.
- Saved answers: the Profiles' typed functional needs stay as their Notes; an Offering's "needs addressed" that matched a typed line is kept until the App User ticks again.
- Not built: it changes the Profile's and the Offering's code.

### O10. What does the customer need to give you?

- **Control:** ticks, as many as apply.
- **Asked when:** the Type is Service or Hybrid.
- **Options:** the list L11 (doc 34, 5.2):
  - Access to their systems or information
  - A clear brief
  - Approval within an agreed time
  - A place to work
  - Their own equipment or software
  - A minimum commitment / term
  - Payment upfront
  - To meet certain conditions
- **The "i" says:**
  - What you need from them before or during the work. Write the details in the note.
- **Connections:**
  - *Read by (not built yet):* the Delivery card's "What could slow the work down?" (doc 28, 9.3, W3), as starting ticks: approval and access.

### O12. Is a minimum age to buy it set by law? (no longer a question; proposed, owner 2026-11-06)

The answer is already in the app: the Organisation's business activities (doc 28, 6.1, I1; their codes, doc 34, 5.4), the Segment's age group and end user's age (doc 35, Box 1, question 1; the end user's 1), the Profiles' ages (doc 36, A1) and the Organisation's country (the ages, doc 28, 10.3). So nothing is asked: the app derives it.

- **The check:** an activity of an age-restricted kind (the table) and a Segment, end user or Profile younger than the country's age for that kind → a Review item, "Alcohol: the legal age is 18 in the United Kingdom; your Segment includes Young adults (18 to 24)", and a read-only line on each of the Segment's Offerings.
- **Where the activity tells** (NACE Rev. 2 codes, to be checked against the country schemes and NACE Rev. 2.1 through the crosswalk, doc 34, 5.4):

  | Kind | Activities that tell |
  |---|---|
  | Alcohol | 11.01 to 11.05 (making drinks), 46.34 (wholesale of drinks), 47.25 (shops for drinks), 56.30 (bars) |
  | Tobacco, vapes or nicotine | 12.00, 46.35, 47.26 |
  | Gambling, betting or lotteries | 92.00 |
  | Fireworks | 20.51 (explosives) |
  | Knives or blades | 25.71 (cutlery) |
  | Films or games with age ratings | 59.11 to 59.13 (films), 58.21 (computer games), 47.63 (shops for films and games) |
  | Credit, loans or Buy Now, Pay Later | 64.92 (other credit) |
  | Tattoos, sunbeds or cosmetic treatments | 96.02 (beauty), 96.04 (sunbeds and well-being) |
  | Pets | 47.76 (pet shops) |
  | Medicines | 21.20 (making medicines), 46.46, 47.73 (pharmacies) |

- **Where the activity cannot tell:** general shops and online sellers (47.11, 47.19, 47.78, 47.91, 47.99), markets, wholesale of mixed goods (46.90), and adult content (no code of its own). Proposed, still without a question: the app looks for the kind's words (beer, wine, vape, knife, firework, …) in the Offering's name and its Function and Content & Scope notes; a match makes the same Review item, worded as a check ("Does Craft Beer Tasting include alcohol? The legal age is 18 …"). A false match is cleared on the Review, not by a question.
- **Withdrawn:** the ticks, their "None of these" and the condition on the Segment's age (the question of 2026-11-03).
- **Connections:**
  - *Comes from:* the activities, the ages and the country above.
  - *Read by (not built yet):* the Review.

## What changes when an answer above changes

- A change of the Type changes O1's options. An O1 answer no longer offered is removed on the next choice, and O10 is no longer asked of a Product.
- A change of O1 changes only O6's starting value, never an O6 already chosen.
- A change of a Profile's E3 changes O8's options. A worry no longer ticked on any Profile is removed from O8 on the next choice.
- A change of an activity, an age or the country changes O12's derived Review item at once (proposed).
- A change of the business stage changes O2's starting value only, never an answer chosen (proposed).

## Decided, and still to decide

**Decided (owner, 2026-11-03):** Offerings belong to their Segment; no "Not sure" options. **(owner, 2026-11-06):** the emotional and social needs are the Value Proposition's, not an Offering question.

**Still to decide:**
- The option words written new here are proposals until you approve them (doc 28, rule 3.6): O1, O2, O3 ("Pay as they go"), O6 and O7.
- O13 and L17 (owner's idea, 2026-11-03): proposed on 2026-11-06 to merge into the functional needs (after O13); the list words still to approve.
- O11, what they spend on (doc 28, 6.8): it is not asked here, because nothing would read it yet. Keep it as a thought, or drop it.
- **Not asked:**
  - O5 (merged into O4, 2026-10-26).
  - O9: what else is included is written in Content & Scope.
