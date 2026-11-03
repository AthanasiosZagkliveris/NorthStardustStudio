# 43. The Offering card: every question and option, as proposed

Status: **proposal**, written 2026-11-03, updated 2026-11-03. Every question of the Offering card (Business System, page 1, tile "Offerings"), in the order it is asked. For each: its control, when it is asked, its options, what its "i" says and what it connects to. The Type, the needs addressed and the text boxes are built; the questions are not.

Related: doc 35 (the Segment: age, how they pay, the kind of area), doc 36 (the Profile: the needs, B1, D2, E3), doc 38 (Positioning: Differentiation), doc 41 (the Competitor: K3), doc 42 (the Value Proposition, which reads O1, O4 and O8), doc 34 (the lists L1 and L11, the value crosswalk 5.2a), doc 28 (6.8, 7.4, 10.1 to 10.3 and 11.7, the design this refines), `src/framework/engine/AnswerBusinessFoundation.ts` (the card today).

**What the card is.** An Offering belongs to its Segment, as a Profile does. Pages 2 to 5 read it by id and never copy it (the page specifications' README, point 1). The card has these parts, in order:
- **The head:** the number, the name cell and the one x (built).
- **The Type** (built): Product, Service, Hybrid, or Other with its name.
- **Functional Needs Addressed** (built): ticks of the Segment's Profiles' functional needs.
- **One box of questions** (proposed): O1 to O13 below, one band each, with the Segment card's layout.
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
- **The "i" says:**
  - Where it stands today. Sales planned before it is ready are noted on the Review.
- **Connections:**
  - *Read by (not built yet):* the Review (a Demand estimate for an Offering that is not ready); the Business Plan's product section.

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
  - The benefits your customers get. The first you tick is the main one. Choose up to three.
  - The same list as "What matters most" on your Profiles and on your Competitors, so the three can be compared.
  - Your Positioning's Differentiation starts the ticks; change them freely.
- **Connections:**
  - *Comes from:* Positioning's Differentiation, through the value crosswalk (doc 34, 5.2a), as starting ticks.
  - *Read by (not built yet):* the Value Proposition draft and its open items (doc 42); the Review (doc 28, 11.5, rules 21 and 22: against the Profiles' B1 and the Competitors' K3).

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

### Emotional and social needs addressed

- **Control:** ticks, as many as apply.
- **Asked when:** at least one emotional or social need is ticked on the Segment's Profiles (ticks decided by the owner, 2026-11-03, doc 36 section 10).
- **Options:** the emotional and social needs ticked in the Segment's Profiles.
- **The "i" says:**
  - How it makes your customers feel, and how it helps them be seen. The Value Proposition shows any of their needs that nothing addresses.
- **Connections:**
  - *Comes from:* the Profiles' emotional and social needs.
  - *Read by (not built yet):* the Value Proposition's open items (doc 42).

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
  - The kind of job it does, beyond what it does best (O4). The same list as on your Competitors, so you can see who does the same job.
  - Appeals to the senses: how it tastes, looks, sounds or feels.
  - Based on: Bain's Elements of Value (HBR).
- **Connections:**
  - *Comes from:* nothing. The Profiles' functional needs stay their own words (doc 36, section 10); this list compares the Offering with the Competitors, as the owner proposed (2026-11-03).
  - *Read by (not built yet):* the Value Proposition's open item "Job left to a competitor" (doc 42); the Review: a Competitor that does the same job (K6) and is chosen for the same thing (K2 against O4) is a close rival, to be answered in its Insights & Differentiation.

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

### O12. Is a minimum age to buy it set by law?

- **Control:** ticks, as many as apply.
- **Asked when:** the Segment's age group (doc 35, Box 1, question 1) is Minors or Young adults, or its end user's age includes Baby, Child or Teenager.
- **Options:**
  - Alcohol
  - Tobacco, vapes or nicotine
  - Gambling, betting or lotteries
  - Knives or blades
  - Fireworks
  - Films or games with age ratings
  - Credit, loans or Buy Now, Pay Later
  - Tattoos, sunbeds or cosmetic treatments
  - Adult content
  - Pets
  - Medicines
  - None of these
- **Exclusion:** choosing "None of these" clears every other choice, and choosing any other clears it.
- **The "i" says:**
  - Some things cannot be sold below a legal age. The age in your country shows beside each one ticked. Check the law where you sell.
- **Connections:**
  - *Comes from:* the Segment's age; the Organisation's country (the ages shown, doc 28, 10.3, with their status).
  - *Read by (not built yet):* the Review (a Segment whose age group starts below the age).

## What changes when an answer above changes

- A change of the Type changes O1's options. An O1 answer no longer offered is removed on the next choice, and O10 is no longer asked of a Product.
- A change of O1 changes only O6's starting value, never an O6 already chosen.
- A change of a Profile's E3 changes O8's options. A worry no longer ticked on any Profile is removed from O8 on the next choice.
- A change of the Segment's age removes O12's question when it no longer applies; its answer is removed on the next choice.

## Decided, and still to decide

**Decided (owner, 2026-11-03):** Offerings belong to their Segment; no "Not sure" options.

**Still to decide:**
- The option words written new here are proposals until you approve them (doc 28, rule 3.6): O1, O2, O3 ("Pay as they go"), O6 and O7.
- O13 and L17 (owner's idea, 2026-11-03): the list words, and whether up to 3 is right.
- O11, what they spend on (doc 28, 6.8): it is not asked here, because nothing would read it yet. Keep it as a thought, or drop it.
- **Not asked:**
  - O5 (merged into O4, 2026-10-26).
  - O9: what else is included is written in Content & Scope.
