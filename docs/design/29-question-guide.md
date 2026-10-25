# 29. Question guide: the flow, the branches and how a question earns its place

Status: **proposal**, written 2026-10-23, **updated 2026-10-25 for the Identity questions as built (Early Positioning, doc 28 section 8.2)**. The Segment does not yet read any of them; the flow below is the design. This is the guide to the questions as a **flow**: which answer leads to which question, which questions are the key branches, what happens when the answer is "both" or "other", in what order to ask so that the user answers as little as possible, and why each question matters to the user. It answers the owner's review of 2026-10-23. Document 27 is the plan, document 28 holds the lists, wording, connection map and evidence; this document holds the logic between them. (Before it there was no such guide: the nearest were 28, which is organised by card and list, and `ai/framework-dsl-grammar.md`, which defines how a System's content is written in Markdown, not how a founder's questions behave.)

> **Correction (owner, 2026-10-25): G24 "Who uses it?" and G25 are not existing questions.** They are the author's proposal, never approved, and are marked **(proposal)** wherever they appear below. What exists is in Identity: the audience question of a consumer buyer, "Buyer's Life-Stage and relationship with the User" (I7b), whose option Proxy Buyers / Gifters already says the buyer pays and the product is for someone else. Section 10 lists, for every question, whether it exists, where, and what should change in its wording or place.

## 1. How to read it

**The trees.** Each tree starts at a question and shows what each answer does.

| Mark | Meaning |
|---|---|
| ● | asked |
| ○ | skipped or hidden because the answer makes it unnecessary |
| ⇒ | the app proposes, fills in or warns (never decides for the user) |
| (candidate) | an option or question not yet in the lists; needs the owner's approval |

**A key question** is one whose answer changes which questions or options come next. The key questions are collected in section 3; the rest are plain lists (the answer is stored and used, nothing branches).

**The principles behind every branch** (from 28, section 3): one owner per answer; a Segment is a narrow group (a range or one value, more is another Segment); a default is not a second question; a suggestion is never a hidden option; "Not sure yet" never blocks.

## 2. The trees

### 2.1 Identity (the Organization, Positioning, Vision and Values tiles)

```
I1  What does your business do? (up to four activities, in order; the first is the primary)
 ├─ Level 1 Industry ........ ● Level 2 shows that industry's children (division, subdivision or subsector)
 │   └─ Level 2, 3, 4 ....... ● the next level shows the children of the choice; a shortlist of about four plus "Show all"
 │                              (Manufacturing, and retail in the USA and Canada, are grouped)
 ├─ the final code .......... ⇒ the industry pack (example Segment, Offering, skills, resources, channels)
 │                              ⇒ the code at the end of the activity is generated (editable) · ⇒ the Description sentence is drafted
 ├─ + Add another activity .. a second path (up to four); ⇒ the usual second activity is suggested ("tends to")
 └─ Not sure ................ ○ the lower levels · ⇒ the generic pack · ⇒ "describe your main one first"
I3  Seller and Buyer Relationship   (on Early Positioning; one choice or ticks with a limit, by the stage)
 ├─ B2C ..................... ⇒ one Segment frame, Box 1
 ├─ B2B, B2G, G2B Context ... ⇒ one Segment frame, Box 3 (B2G: the public body and its level; G2B: the industry and its regulation)
 └─ Several (Managing, Growing) ⇒ one Segment frame for each
I11 Market Structure
 ├─ Single-sided Market ....... one audience of buyers: one part, unless G24 says someone else uses it
 └─ Multi-sided Market / Platform ... a platform of two or more distinct groups: each other side is a User part (G24 names its type)
I7b Audience   (one question for each relationship: scale, life stage, administrative level, regulatory intensity)
 └─ the choice ⇒ the Segment's size or age range starts there · "Proxy Buyers / Gifters" ⇒ G24 starts at "someone else: individual people"
I7c Differentiation & Outcome ⇒ the Value Proposition prompt and the Competitor types
I8  Business stage (worked out from the Opening Date, not asked)
 ├─ Just an idea / Setting up ... ○ "sales I have made" and "website data" in the estimate basis (D1);
 │                              ⇒ figures labelled forecast
 └─ Earning / Established ....... ● every option of D1 · ⇒ figures can be labelled actual
I7  (withdrawn: merged into I7c)
I6, I9, I10 (price position, ambition, values)   checks, asked after the first draft  (no branch)
```

### 2.2 Segment (the Segment card)

```
I3  Seller and Buyer Relationship   (asked in Identity; the Segment card only reads it)
 ├─ B2C ..................... ● Box 1 (G6 ...) · ○ Box 3
 ├─ B2B, B2G, G2B Context ... ● Box 3 (G23 ...) · ○ Box 1
 └─ Several ................. a Segment is one group, so ⇒ one Segment for each (people first, then businesses);
                             the second starts with G2 and G3 copied
G24 Who uses it?   (PROPOSAL, not an existing question: Identity's I7b already asks the buyer's relationship with the user; if kept, one Segment, two parts: never two Segments)
 ├─ The same people who pay ..... one part (the default)
 ├─ Someone else: individual people ... ● G25 (their age range) · the User part is typed for people
 └─ Someone else: businesses or organisations ... the User part is typed for businesses
(A multi-sided Market Structure, a platform, makes each other side a User part; the Proxy Buyers / Gifters audience starts G24 at "someone else: individual people". A buyer who is not the user is NOT a multi-sided market.)
Buyer part asks: who they are, what makes them pay, how they compare, buy and pay, budget, who decides  (Discover, Evaluate, Purchase)
User part asks:  who they are (age or role), what makes them use it well, comfort with tools, help wanted  (Deliver, Support)
G25 What is the age range of the person who uses it? (From, To)  asked only when the end users are individual people
 ├─ includes a band below 18 ..... ⇒ a child Profile + a parent or carer Profile · the children's note
 └─ adults only .................. ⇒ one user Profile (for example an older relative)

AFTER THE FIRST DRAFT (checks, asked later): G4, G5, G16, G17, G18, G19
```

### 2.3 Profile (up to three per Segment)

```
A Profile starts from
 ├─ a proposal: one per age band of the range · the kinds of business of the pack · the child and the parent or carer
 ├─ "Copy a Profile": start from another Profile and change what differs
 └─ typed by the user

Behaviour first (these drive the journey)
P24 Which kind of business? (business Segment) ● first: it brings the pack's examples
P9  What do they care about? (up to 3)
P11 Where do they look?       ⇒ Discover channels
P12 How do they compare?      ⇒ Evaluate channels
P13 How do they usually buy?
 ├─ Online checkout .................. ⇒ Website (online store) or Marketplace
 ├─ An invoice / By phone or email ... ⇒ Email, Direct Payment (invoice)
 ├─ In person ........................ ⇒ In Person
 ├─ On a marketplace ................. ⇒ Marketplace
 ├─ By booking ....................... ⇒ Website (booking page)
 ├─ A contract or tender ............. ⇒ the tender row · ● P22
 └─ Something else (candidate) ....... a reseller, an event, an approved-supplier list
P14 How do they like to pay?
 ├─ card, cash, bank transfer, mobile wallet, invoice, buy now pay later ... ⇒ Direct Payment subchannels
 └─ Someone else pays (candidate) ... ● who (a parent, employer, insurer or funder) · ⇒ P21
P16 How comfortable are they with online tools?
 ├─ very comfortable / the basics ......... channels unchanged
 └─ need some help / mostly offline ....... ⇒ digital-only channels moved down, labelled · ⇒ personal help suggested
P17 P18 P19  goals · frustrations · worries      ⇒ the Value Proposition draft; P19 ⇒ Evaluate actions
P20 How much help do they want before buying?    ⇒ the relationship type
P22 How is the decision made? (business, or any under-18 Profile)
 ├─ they decide alone .................... ○ P21
 ├─ with family or colleagues / a manager approves ... ● P21
 └─ a formal tender or procurement ........ ● P21 · ⇒ the tender row

Specifics last (checks, asked after the draft, each limited to the Segment's range)
P1 age · P2 education · P6 job level (only when G13 is employed or self-employed) · P7 household income
P23 size (business) · P5 gender (only when G10 is not "not relevant") · P8 language · P3, P4 (notes)
```

### 2.4 Offering (the key branches)

```
O1 What form does it take?
 ├─ a physical item ................................ ⇒ stock, vehicles and shipping stay in the presets
 ├─ a digital file, a digital product or tool, online access ... ○ stock, vehicles, shipping
 ├─ a live online session, an in-person session, project work, an ongoing service ... ⇒ hours and roles (L2)
 ├─ A mix .......................................... one Offering is one thing: ⇒ make one Offering per form
 ├─ Something else (candidate: a rental or hire; a booking of seats, tickets or rooms)
 └─ Not sure yet ................................... the presets stay open
O3 How do customers buy it?
 ├─ One purchase ................................... Charged: per sale
 ├─ A subscription, a membership, a monthly retainer ... ⇒ Cancel / Month, Hours Given; Charged: monthly, quarterly, annually
 ├─ A licence ...................................... Charged: annually or per sale
 ├─ They pay for what they use ..................... Charged: per sale (per use)
 ├─ A project or contract .......................... Charged: per project · ⇒ Calendar Time in weeks
 ├─ Free to the customer (candidate) ............... ⇒ no price · ● who pays (advertising, a grant, a sponsor)
 ├─ A commission on sales (candidate) .............. ⇒ a percentage, not a price
 └─ Not sure yet ................................... treated as one purchase · ⇒ flagged
O12 Is a minimum age to buy it set by law?  (ticks; shown when G6 or G25 includes a band below 21)
 ├─ alcohol, tobacco or vapes, gambling, knives, fireworks, rated films and games, credit, tattoos and similar, adult content, pets, medicines
 │      ⇒ the main country's age with its status (28, 10.3) · ⇒ Review if a Segment's customers start below it
 │      ⇒ if someone else uses it (G24, a gift): the note on supplying to a child · online seller: the age-check note
 ├─ None of these ........... nothing
 └─ Not sure yet ............ ⇒ a Review item asks again
O6 How does the customer receive it?   (no single answer rules out another; "A mix" allows several Deliver channels)
```

### 2.5 The journey (page 2)

No question branches heavily here: the stage cards are **proposed** from P11, P12, P13, P14, O6 and O7 and the user confirms, edits or removes them. The only branches are J3 (the relationship type is suggested from P20 and O7) and the tender row (from P13 or P22 or G23).

## 3. The key questions

| Id | Question | What its answer decides | Branches | "Both" or "mixed" | "Other" |
|---|---|---|---|---|---|
| I1 | What does the business do? | the pack; the code at the end of each activity; the next level | up to 5 levels | four activities in order | none: placements with an "i"; "Not sure" |
| I3 | Seller and Buyer Relationship (Identity) | the Segment frames: one for each relationship; Box 1 or Box 3 | 4 | **Several = one Segment for each** (separate audiences); a buyer who is not the user is **one Segment, two parts** (G24) | none needed |
| G2 | Where? | G3 shown or not; channel order | 4 | "Anywhere online" ≈ several countries | none needed |
| G3 | Main country | national examples; notice | 2 | other countries = another Segment | "Another country" |
| G24 (proposal) | Who uses it | the User part; G25; which questions each part gets; P21 | 3 | a buyer and a user are two parts of one Segment, not a mix | none needed |
| G25 (proposal) | The user's age range | the user's Profile; the children's note | 2 | children and adults = two Segments | none needed |
| G6 | Age range of the customer | G7, G13, P21, the under-18 box, P14's list, Profiles proposed | 5 | children and adults = two Segments | none needed |
| G13 | Work situation | P6 asked or not | 2 | one only | none: the odd cases sit under the nine options with an "i" |
| G10 | Gender mix | P5 and the notice | 2 | the ramp itself is a mix | none needed |
| G23 | Type of organisation | G14 asked or not; tender row | 4 | one only | none: co-operatives, membership bodies and the like sit under the four types with an "i" |
| G15 | Industry | P24's list | 2 | "more than one" = another Segment | none |
| P13 | How they buy | the proposed Purchase channels; tender row; P22 | 7 | several allowed | "Something else" (candidate) |
| P14 | How they pay | Direct Payment subchannels; P21 | 7 | several allowed | "Someone else pays" (candidate) |
| P16 | Comfort with online tools | channel order; help level | 2 | one only | none needed |
| P22 | How the decision is made | P21; the tender row | 3 | one only | none needed |
| O1 | Form | presets; hours and roles | 5 | **A mix = one Offering per form** | "Something else" (candidate) |
| O12 | Minimum age by law | Review against G6; the age lookup | 3 | several kinds may be ticked | none needed |
| O3 | How it is bought | Demand, Delivery, Charged, Cancel / Month | 7 | one only | candidates: free to the customer; a commission |

## 4. When the answer is "both", "a mix" or "not sure"

| Question | The answer | What the app does | Why |
|---|---|---|---|
| I3 | Several relationships | One Segment for each, people first; G2 and G3 are copied to the next | A Segment is one group; its questions differ for people and businesses |
| G6 | children and adults in one range | Warns; offers to split into two Segments | Needs, who pays and the law differ |
| G24 (proposal) | Someone else uses it (a parent buys for a child, an employer for its staff) | A Buyer part and a User part in one Segment, each with its own questions and Profiles (P21 on each) | The buyer is reached by price, trust and convenience; the user by use and enjoyment. This is a single-sided market |
| I11 | Multi-sided market (a platform) where the user pays nothing (advertising, a funded service) | The payer is the Buyer part, the free group the User part; "Free to the customer" in O3 | The Segment stays one |
| I11 | Multi-sided market (a platform) where both sides pay (diners and restaurants) | One payer part; the other payment is noted and confirmed on the Review page (decision R40 in 28) | The model has one payer part per Segment |
| G15 | more than one industry | Asks for the main one; another Segment for the other | One industry per Segment keeps P24 meaningful |
| G2 | in several countries / anywhere online | Asks for the main country; others are another Segment | National lists and the law differ by country |
| O1 | A mix | One Offering per form | Delivery, hours and stock differ by form |
| O6 | A mix | Several Deliver channels | A stage may have several channels |
| P11 to P14 | several ticked | All are proposed as channels (several allowed) | A person uses several |
| Any list | Not sure yet | A safe default is used and flagged; it never blocks; a Review item asks again later | The user should not be stopped by a fact they do not have |

## 5. When the answer is "other"

**What the "Other" options hold, and what the app does with them.**

| Option | What it could hold that is not in the list | What the app does |
|---|---|---|
| I1, G15 "Something else" (**removed**) | Households employing staff; embassies and international bodies; a label across industries (creative industries, agri-tech) | Placed: households under *Other services*, embassies under *Government and public administration*, each with an "i"; a cross-industry label goes under *Not sure, or more than one* with an "i" saying to choose the closest industry. Non-profits are asked by G23 |
| I2 (merged into I1) | The finer kinds are the cascade's lower levels | the cascade has no "Something else"; "Show all" holds the rest |
| G3 "Another country" | Any country outside the six, including other English-speaking ones (for example India, Singapore, South Africa) | Asks for the name; uses the plain lists without national examples; the equality notice says to check that country's law |
| G13 "Other" (**removed**) | A volunteer; a gap year or travelling; parental leave; military service; casual or gig work; an apprentice or trainee | Placed under the existing options with an "i": military, paid apprentices and parental leave under *Employed*; casual work under *Employed part time*; gig work under *Self-employed*. One new option, *Not working and not looking for work* (gap year, travelling, a break). A volunteer chooses the situation of their main activity (author's placement) |
| G23 "Another type" (**withdrawn**) | A co-operative; a membership or professional body; a religious organisation; a social enterprise | Placed with an "i": co-operatives under *A private business*; membership bodies and religious organisations under *A non-profit or charity*; a social enterprise under whichever fits how it is owned |
| P6 job level | Armed forces; clergy | No "Other": an "i" on the question says to choose the group that fits the role, and that clergy count as professionals |
| G24 (proposal) "Someone else: individual people" | A pet (an animal is not modelled as a user) | The owner is the Buyer part; the animal's needs go into the owner's wants and worries |
| O12 "None of these" | A kind with a local licence or age rule not on the list (taxi, lottery tickets, solvents, spray paint, corrosives, energy drinks by a retailer's own policy) | A note "check the rule for your area"; 28, 10.3 lists some of them |

**Lists where something is missing and an option may need adding (candidates; the owner decides).** These come from reading the lists against the statistics offices' categories and the likely cases, not from a source; each is the author's.

| List | Candidate addition | Why |
|---|---|---|
| P12 how they compare | Industry reports or trade press; an AI assistant; asking the supplier's other customers | Common ways to compare that the list omits |
| P13 how they buy | Through a reseller, distributor or agent; at an event or trade show; through an approved-supplier list or framework | Resellers, events and framework lists are common routes, especially for businesses and public buyers |
| P14 how they pay | **Someone else pays** (a parent, an employer, an insurer or a funder); direct debit; cheque or voucher | For children and for many businesses and health services the payer is not the user |
| O1 form | A rental or hire (equipment, space); a booking of seats, tickets or rooms | Neither is a product, a service or a digital item in the list |
| O3 how bought | Free to the customer (paid for by advertising, a grant or a sponsor); a commission or a share of sales | Non-profits, platforms and marketplaces do not charge the customer a price |
| L5 skill areas | Research and product development | Named in the earlier review as a gap |

## 6. Where to place each question, and in what order

**Principles for speed.**

1. **Prune first.** Ask the question that removes the most others before the rest: I1, then I3 (in Identity), I11, G23, G6 (and G24 if the owner approves it).
2. **Ask each fact once, at its owner**: Identity asks about the organisation, the Segment about the group, the Profile about one person, the Offering about the thing. A default is not a second question.
3. **Skip what is implied.** A freelancer is "just one person", so G14 is not asked; a retired person has no job level, so P6 is not asked; an adults-only range has no children's questions.
4. **Fill in what is known.** The country comes from the Legal Entity; a second Segment starts from the first; a Profile can be copied; the activity code follows the industry.
5. **Drivers first, checks after the first draft.** The user sees a draft (proposed channels, Profiles, Value Proposition) before the optional and check questions are offered.
6. **Behaviour before specifics in the Profile.** Where they look, compare, buy and pay drive the journey; an exact age, education or income only checks it, so those come last.
7. **Clicks before typing.** Single choices and ramps first; numbers (income, price, age) last.
8. **"Not sure yet" never blocks**; the app uses a safe default, flags it, and asks again from the Review page.
9. **Show only the branch that applies**: at most about seven visible questions in a box; the rest appear when an answer reveals them.

**The order within each tile.**

| Tile | Order of the questions asked first | Moved or held back |
|---|---|---|
| Organization, Positioning (Identity) | I1, I11, I3, I7b, I7c | I9, I10 after the draft |
| Segment card, people | (G24, G25 if approved; I3 and I7b are already answered), G2 (G3), G6, G7, G8, G13, G10 | G10 last (it only reveals the notice); G4, G5, G16 to G19 after the draft |
| Segment card, businesses | (G24 if approved), G2 (G3), G23, G14, G15 | G14 skipped for a freelancer; checks after the draft |
| Profile | P24 (business), P9, P11, P12, P13, P14, P16, P17, P18, P19, P20, P22 | P1 to P8, P23 after the draft |
| Offering | O1, O3, O4, O6, O7, O5, O10 | O2, O8, O9, O11, O12 after the draft |

**How many questions the user sees on a path** (drivers only, first pass; an estimate from the trees above).

| Path | Identity | Segment | Profile (each) | Total for one Segment and one Profile |
|---|---|---|---|---|
| A business, not a freelancer | 5 (with I3) | 5 (G24, G2, G23, G14, G15) | 12 | 22 |
| A freelancer | 5 (with I3) | 4 (G24, G2, G23, G15; G14 skipped) | 12 | 21 |
| People, adults | 5 (with I3) | 7 (G24, G2, G6, G7, G8, G13, G10) | 10 | 22 |
| Bought for a child (user under 13, parent pays) | 5 (with I3) | 7 (G24, G25, G2, G6, G8, G13, G10; G7 skipped) | 11 (with P21) | 23 |
| A second Profile in the same Segment | 0 | 0 | only what differs, with "Copy a Profile" | far fewer |

(The Segment counts include G24 and G25, which are proposals the owner has not approved; without them each path has one question fewer, and the child path two.) A second Segment repeats only what differs (G2 and G3 are copied). The checks (31 in all, 6 on the Segment card) come after the draft and can be skipped.

## 7. Does a question matter, and how does it help the user?

The test for every question: *what does the user get for answering?* "Limited" means the answer only raises a check; the question is asked later or not at all in the first release.

| Id | Matters? | How it helps the user |
|---|---|---|
| I1, I3, I11, I7b, I7c | Yes | Narrows the next lists and gives example customers, offerings, skills, channels and the activity code to start from; arranges the Segment frames; a platform's other sides become User parts; the audience starts the ranges; the outcome frames the Value Proposition |
| I7 | Yes | Writes a first Positioning sentence |
| I8 | Yes | Stops the app asking for sales or website figures a new business cannot have |
| I6, I9, I10 | Limited | Later checks and suggestions |
| I3 | Yes | Shows only the questions that apply and sets the tax default |
| G2 | Yes | Puts the likeliest channels first (a local business starts with local ones) |
| G3 | Yes | Shows examples in the customers' country (qualifications, sizes, tax names) |
| G6 | Yes | Limits the Profile's age, proposes a Profile per band, and warns when selling to children |
| G7, G8 | Limited | Limits the Profile; warns if the price looks high for this income |
| G13 | Yes | Skips job-level questions for people who do not work |
| G10 | Limited | Shows the equality reminder and keeps the Profile consistent |
| G23 | Yes | A public body gets tender help; a freelancer skips the size question |
| G14, G15 | Yes | Narrow the Profile's size and kind of business; suggest channels by size and sector |
| G4, G5, G16 to G19 | Limited | Checks after the draft |
| P24 | Yes | Gives the pack's examples for this kind of customer |
| P9, P17, P18, P19 | Yes | Write the value proposition draft and highlight the Evaluate actions |
| P11, P12, P13, P14 | Yes | Fill in the channels of every stage and the payment subchannels |
| P16, P20 | Yes | Reorder channels for people who need help; suggest the relationship type |
| P22 | Yes | Reveals who decides and the tender row |
| P1 to P8, P23 | Limited | Check the Profile against the Segment |
| K2, K3 | Yes | Draft the differentiation |
| O1, O3 | Yes | Hide what does not apply; one answer for three fields |
| O4, O5, O6, O7, O10 | Yes | Value Proposition draft; Deliver and Support channels; the relationship type; the delivery constraints |
| L2, C1, C4 | Yes | Show the skills gap and propose a partner or a hire |
| R1 | Yes | Gets the tax arithmetic right |
| J2, J4 | Yes | Choose an action and a purpose instead of typing |
| Notes (G12, G20 to G22, P3, P4, K5, K7, K8, O9, L3, C2, C3, J5, J6) | No | Not asked |

## 8. Writing a new question

A question is added only when it passes this list.

1. **It has an owner**: the one card where it is asked (one owner per answer).
2. **It passes the value test** (section 7): the answer produces a proposal, or narrows a list, or is a cheap check worth asking after the draft. Otherwise it is a note.
3. **It is in the right place and order** (section 6): it prunes early or waits for the draft.
4. **Its tree is drawn**: each answer says what is shown, hidden or proposed; "both" and "not sure" are handled (section 4); an "other" option says what it could hold (section 5).
5. **Its wording follows 28, section 4.1**: one idea; plain words; options that do not overlap; "Not sure yet" and "Not relevant" where valid; no loaded words; the right control (a range for an ordered fact, one value for an unordered fact, several only for what people do).
6. **Its options have examples** and a one-line "i" (28, 5.5).
7. **Any connection that is not certain shows its evidence** and says "tends to" (28, 11.6).
8. **It has an id, a type** (driver, check or note) **and a row in 28, Appendix B.**

## 9. Decisions for the owner

| # | Decision | Recommendation |
|---|---|---|
| 1 | Several relationships in I3 create one Segment for each (people first) | Yes |
| 2 | ~~Add "Another type" to G23~~ Withdrawn: the cases sit under the four existing types with an "i" | Yes |
| 3 | Candidate additions: P12, P13, P14, O1, O3 (section 5) | Approve one by one; "Someone else pays" in P14 and "Free to the customer" in O3 first |
| 4 | Ask the Profile's behaviour first and its specifics after the draft | Yes |
| 5 | Ask the checks only after the first draft | Yes |
| 6 | "Copy a Profile" | Yes |
| 7 | G10 asked last in its box | Yes |
| 8 | A split offered when a range mixes children and adults | Yes |
| 9 | ~~Add "Other" to P6~~ Withdrawn: an "i" on P6 places armed forces and clergy | Yes |
| 10 | **Reopened (owner, 2026-10-25: "there is no such question").** The buyer (who pays) and the user (who uses) are two parts of **one Segment**; I11 "Market Structure" is a different question (corrected 2026-10-25); the word "consumer" is not used. **Does the Segment need its own question (G24, G25) at all?** (a) **No:** read I7b (Proxy Buyers / Gifters, a consumer buyer's relationship with the user) and I11 (multi-sided: each other side is a User part); a business buyer whose staff use it has no question and the parts are made by hand. (b) **Yes:** keep G24 and G25 for the cases I7b cannot say (an employer, a hospital), placed after the buyer's own questions | **(a)**, because Identity already asks it once; revisit when a business case needs it |
| 15 | When both parts pay (diners and restaurants), keep one payer part and note the other payment (28, R40) | Choose |
| 13 | Ask "Who do you sell to?" in Identity (I3, the Seller and Buyer Relationship) so Business 1 opens arranged; several relationships make several Segment frames | Yes |
| 14 | "Free to the customer" and "A commission on sales" in O3 are proposed, not only candidates (needed by platforms and funded services) | Yes |
| 11 | O12 and the minimum-age lookup; only official-source rows drive a check | Yes; have the Excerpt rows re-checked first |
| 12 | Allow customers under 18 who pay, with notes, Review lines and a filter on P14, and no stated rule on contracts | Yes |

## 10. Where each question stands, and what should change (as built, 2026-10-25)

**Exists** = a question the app asks now. **Text box** = the app has a free-text box on the card; the question is a proposal that would refine it. **Proposal** = in these documents only. The owner's own wording is never changed (rule 14). Checked against the code and against doc 28, sections 6, 8 and Appendix A.

| Id | Question | Status | Where it is | Change proposed to its wording or place |
|---|---|---|---|---|
| I1 | What does the business do? | **Exists** | Organization tile, the activity cascade (up to four) | Add "Show all" after a shortlist (not built); the industry pack is not built |
| I8 | Business stage | **Exists, not asked** | Worked out from the Opening Date; the Positioning tile's name and limits follow it | None |
| I11 | Market Structure | **Exists** | Early Positioning, left column, first, a radio (Single-sided; Multi-sided / Platform) | None: the owner's words. Its "i" says it is not the buyer-and-user split |
| I3 | Seller and Buyer Relationship (who pays) | **Exists** | Early Positioning, left column, under Market Structure; radio or ticks by stage | None: the owner's words. Read by the Segment since 2026-10-25: it decides whether Demographics or Business Data is asked |
| I7b | Audience: scale (B2B), **Buyer's Life-Stage and relationship with the User** (B2C), administrative level (B2G), regulatory intensity (G2B) | **Exists** | Early Positioning, right column, one question for each relationship chosen | None: the owner's words. **This is where the buyer's relationship with the user is already asked** (Proxy Buyers / Gifters). Read by the Segment since 2026-10-25 only to show the choice in the "i" of Demographics or Business Data |
| I7c | Differentiation & Outcome | **Exists** | Early Positioning, right column, under the audience | None. Not yet read by the Value Proposition |
| (Notes) | The Positioning free text | **Exists** | Early Positioning, under the questions | Shorten its prompt (28, 8.2, open decisions) |
| I5, I6, I7, I9, I10 | Brand personality; price position; (merged); ambition; values | I5 parked; I6, I7 withdrawn; I9, I10 **proposal** | Not on a tile | None until the owner decides |
| I2, I4, G1, G9, G11 | | Merged or withdrawn | | None |
| G2 to G5 | Where; main country; kind of area; languages | **Text box** (Geographics) | Segment card | G2 and G3 first, G4 and G5 after the draft; G3 starts from the Legal Entity's country |
| G6, G7, G8, G10, G13 | Age range; education; income step; gender mix; work situation | **Text box** (Demographics); asked only when the buyer is a person | Segment card | Order: G6, G7, G8, G13, G10 last. G6 reads "the customer, the person who pays" |
| G14, G15, G23 | Size; industry; type of organisation | **Text box** (Business Data); asked only when the buyer is a business or public body | Segment card | Order: G23, G14, G15; G14 skipped for a freelancer |
| G16 to G19 | Usual price; feeling about price; main spending; how often | **Text box** (Purchasing Power & Behaviour) | Segment card | Checks, asked after the draft |
| G12, G20 to G22 | | Notes | Market Size box | None |
| **G24, G25** | Who uses it; the user's age range | **Proposal; owner: no such question** | Not built (a picker was built and removed on 2026-10-25) | See decision 10: drop and read I7b and I11, or keep after the buyer's questions. If kept, the wording "Who uses it?" needs the owner's approval |
| P1 to P8 | Specific personal information | **Text box** (Specific Personal Information) | Profile card | Behaviour first, these after the draft |
| P9, P10 | Cares about; risk | **Text box** (Psychographics) | Profile card | None |
| P11 to P16 | Where they look, compare, buy, pay; devices; comfort | **Text box** (Social & Interest Hubs; Information & Shopping Habits) | Profile card | P11 to P14 first (they drive the journey) |
| P17, P18, P19 | Goals; frustrations; worries | **Text** (Goals & Desires, Challenges & Problems, Objections, under Motivations) | Profile card | None |
| P20 to P24 | Help wanted; part in the purchase; how the decision is made; size; kind of business | **Proposal** (no box today) | Profile card | P21 is asked only for businesses, any band below 18, or (if G24 is approved) when someone else uses it |
| Needs | Functional, Emotional, Social lists | **Exists** | Profile card | Each line gets an id |
| Competitor Name, Type | | **Exists** | Competitor card | None |
| K1 to K8 | Price against yours; what they are chosen for; shortfalls; reach; what customers say; confidence; changes; threats | **Text box** or **proposal** | Competitor card (What they sell, Which areas, How they reach, What customers say, SWOT, Insights) | K2 and K3 first |
| Offering Name, Type, Functional Needs Addressed | | **Exists** | Offering card | **O1 "What form does it take?" overlaps the existing Type (Product, Service, Hybrid, Other):** keep Type, and let O1 refine it only where the presets need it, or merge them (owner to decide) |
| O1 to O12 | Form; can customers buy it; how bought; benefit; also good at; how received; help after; worries answered; what comes with it; what the customer must give; what they spend on; minimum age | **Text box** (Customer Benefit, Content & Scope, Purchase & Delivery, Support & Communication, Requirements & Conditions) or **proposal** | Offering card | O3 and O6 first; O12 shown only when G6 (or G25, if approved) includes a band below 21 |
| L1 to L3, C1 to C5, R1, R2, J1 to J7, D1 | Delivery, Founders and Capability, Revenue, Journey, Estimate basis | The pages and cards **exist**; these questions are **proposals** | Business 2 to 5 | See doc 28, sections 7, 9 and 10 |

**What should move or be reworded (summary).**

1. **G24 and G25** are not owner questions; decide (decision 10). Until then the Segment shows only what Identity says.
2. **Counts** in doc 28 (6.3) and here: the Segment has 10 driver proposals (G2, G3, G6, G7, G8, G10, G13, G14, G15, G23), 6 checks and 4 notes; G24 and G25 are 2 proposals not yet approved.
3. **O1 and the existing Offering Type** overlap; one of them should go or be defined by the other.
4. **Order** in each box is given in section 6; nothing is reordered on the cards until the questions exist.
5. **No wording of Identity changes**: the Early Positioning questions are the owner's words (rule 14).
