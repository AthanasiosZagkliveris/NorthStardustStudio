# 37. The Profile's questions: every question and option, as proposed

Status: **proposal**, written 2026-11-01, updated 2026-11-01. The questions of the Profile card in the order they would be asked, with their control, when they are asked, their options, what their "i" would say and what they connect to; nothing here is built.

Related: doc 36 (the Segment's questions, built, in the same form), doc 28 (6.4 and 6.5, the Profile design this refines, and the shared lists), doc 35 (the lists L1 to L16), doc 34 (thoughts, section 6), doc 31 (the age terms), `src/components/interview/editors/foundation/` (the Profile card today).

> **What the Profile does not ask again (owner, 2026-11-01).** The Segment (doc 36) asks the group: the age group, education, work status, household income, gender mix, where they are, how comfortable they are online, how they discover ideas, how they buy and pay, how the decision is authorized, the market. The Profile asks a **typical person** of that group, and only what the Segment cannot: an exact age, a job level, which devices and which social media, communities and events, how they compare options, what they want, what frustrates them and what stops them. It never repeats a Segment question, and it can only choose within what the Segment allowed (section 2).

## 1. Today and the rules

**Today** a Profile is a Name, four boxes of free text (*Specific Personal Information*, *Psychographics*, *Social & Interest Hubs*, *Information & Shopping Habits*), three of *Motivations* (*Goals & Desires*, *Challenges & Problems*, *Objections*) and three lists of *Needs* (Functional, Emotional, Social). Nothing reads them but the Offering (the needs) and the documents.

**The rules are the Segment's** (doc 36): a radio is one choice, ticks are several, with a limit where stated, built from the existing controls (`RadioChoice`, `BusinessTicks`, `NumberCell`, `OptionPicker`, `FieldRow`); an option says its few words and what is added in brackets or after a colon stands in the question's "i"; a question with one option left is not shown; an answer to a question no longer asked is removed on the next choice; no "Not sure" option; each box keeps its title, its prompt (the "i") and **its note**, which stays for what the questions cannot say (a Profile is a person, and a person is described in words too); the layout is the Positioning card's (bands, divider lines, a double rule between boxes). The needs stay text lists: a need is a precise statement ("send an invoice in under a minute"), not a category.

**How the boxes map.**

| Box today | Questions below |
|---|---|
| Specific Personal Information | A1 to A5 |
| Psychographics | B1 |
| Social & Interest Hubs | C1 to C4 |
| Information & Shopping Habits | D1, D2 |
| Goals & Desires | E1 |
| Challenges & Problems | E2 |
| Objections | E3 |
| Needs | stay text lists |

## 2. What the Segment sets and the Profile chooses within

| Segment answer (doc 36) | Profile question | What the Profile gets |
|---|---|---|
| Age group | A1 an exact age | a number within the group (when the group changes and the number is outside the new one, it is cleared: 2.2); a group that includes Minors also asks A5 |
| Work status (Working) | A3 job level | the job levels, for someone who is working |
| Gender mix (not Balanced) | A2 gender | shown when the mix is not Balanced mix; a Profile's gender should fit the mix (Review) |
| Industry | A4 kind of business | the finer list (doc 35, 5.4) of the Segment's industry, each with its example |
| How they discover ideas (ticks) | C2, C3, C4 | the platforms, communities and events related to the ticked ways come first |
| Where they spend time (social environment) | C4 events | asked when the environment is not Mostly digital or Low-frequency |

The app also **proposes Profiles** (up to three): one for each age term of the group; for a business Segment, the kinds of business of its industry; for a Proxy or Dual-Intent buyer, a second Profile for the user (doc 36, the user part). The user presses Add on the ones they want.

### 2.1 How the Profile follows the Segment's kind (proposed)

| The Segment is | The Profiles | Asked | Not asked |
|---|---|---|---|
| **B2C, Direct Buyers** | one typical person, who pays and uses | A1 to A3, A6; B1; C; D; E | A5 (the person plays every part) |
| **B2C, Proxy or Dual-Intent** | the payer's Profile, and a second Profile for the user (proposed beside it, doc 28, 6.5) | the payer: all but A5's "will use it"; the user: A1, A2, A5 (who uses it, who influences), A6, B1, C, E | the user's Box D: the user does not run the purchase (the payer's Profile holds how they compare and what help they want) |
| **B2B** | the person who decides (or the one asked to use it) | A1, A3, A4, A5, B1, C, D, E | A2 and A6 (they are asked only where the owner turns them on) |

**A5 (owner, 2026-11-01).** A pure B2C Direct Segment: A5 is not asked and leaves no gap (the one person plays every part). A B2C Proxy or Dual-Intent Segment: A5 is asked on both Profiles, starting with "They place the order" and "They make the final decision" ticked on the payer's and "They will use it" ticked on the user's, as starting values the user can change; nothing is locked. A B2B Segment: A5 is always asked.

### 2.2 When an answer above changes

The Segment's rule holds here: **a question that is no longer asked, or an option no longer offered, has its answer removed on the next choice**, and the documents read the answers settled against what is asked now.

**The exact age (A1), decided by the owner (2026-11-01).** When the Segment's age group changes, A1 is **cleared if its number falls outside the new group, and kept if it is still inside it**. A Profile of 21 stays when the Segment goes from Young adults (~18–25) to a group that still holds 21 (or to none chosen), and is cleared when it goes to Peak (~40–55). The cleared cell says why, in its placeholder: *"Age reset to match the Segment's age group. Enter a typical age from 40 to 54."* (the range of the new group: from its first age up to, but not including, its second; for the last group, "75 or older"). Nothing else on the Profile is touched. **A user's Profile (owner, 2026-11-01).** When the Segment stops being Proxy or Dual-Intent (a change of the buyer's category in Positioning, or of the relationship), the user's Profile is **deleted completely at once**, not hidden: what it holds (its name, notes, needs and answers) is removed from the Segment's saved answer, so nothing of it reaches the documents, the exports or the wire, and a later change back to Proxy starts a new, empty user's Profile. The payer's Profile is untouched.

### 2.3 The card's layout (proposed)

The Profile is a card inside the Segment's Profiles list, opened as a floating card. It is built from the existing parts only, laid out as the Segment card and the Positioning card are (doc 36, 39): questions are bands (every other one tinted), each box has a title band on the primary fill with light letters and its "i", a divider line under each title and each question's label, a double rule between one box and the next, and a 1px divider down the middle of two columns. A card has no inner light and shade, only its drop shadow. Its colour is its tile's.

**How it is built.**

| Part | Existing component or rule |
|---|---|
| Head | the card's head: the number, the name cell (`CardNameInput`), the remove button (the one x) |
| Groups (Description, Motivations, Needs) | the card's fold group (`BusinessGroup`), open or folded, remembered while the page is open |
| Box title band | the Segment card's band (`business-segment-box` first section: the primary fill, light letters, the "i") |
| Questions | `FieldRow` with `RadioChoice` (one choice), `BusinessTicks` (several, with `max`), the number cell (A1); long lists in the picker |
| Columns of the Description | the two columns with the divider, the boxes shared between them by their length so the columns stand at nearly one height (as the Segment's); one column below 900px |
| Motivations and Needs | three columns (one below 900px); the Needs are the existing numbered text lists |
| A box's note | the box's own text note, under its questions, as the Description has today |
| What is not asked | a question that is not asked leaves no gap: its band is not drawn |

**What changes with the Segment's kind (2.1).** A B2C Direct Profile shows boxes A (without A4 and A5), B, C, D, E; a Proxy Segment adds the user's Profile card beside it, with box D left out; a B2B Profile shows A1, A3, A4, A5, hides A2 and the specialized needs, and C asks the professional hubs only.

**At narrow widths** (below 900px, never below 768px) the two columns become one, in the order A, B, C, D; the three columns of Motivations and Needs stack in the order Goals, Challenges, Objections; Functional, Emotional, Social.

## 3. Box A. Specific Personal Information

A typical person of the Segment, asked specifically.

### A1. How old is this typical customer?

- **Control:** a number (years), in the existing number cell.
- **Asked when:** the Segment's buyer is people; for a business Segment, the age of the person who decides.
- **The "i" would say:** An exact age within the Segment's age group, for a typical person of the group, not the average. The ages of the terms are approximate. If the Segment's age group changes and this age is no longer inside it, the age is cleared and the box says so.
- **Connections:**
  - *Comes from:* the Segment's age group (the number is held to it).
  - *Read by (not built yet):* the online-consent ages for under-18s (the Review); the proposed Profiles (one for each age term of the group); the number is cleared when it leaves the group (2.2).

### A2. What is their gender?

- **Control:** one choice (a radio).
- **Asked when:** the Segment's gender mix is not Balanced mix.
- **Options:**
  - Woman
  - Man
  - Non-binary
  - I would describe it differently
  - Prefer not to say
- **The "i" would say:** Asked only when the Segment's mix leans one way. The categories follow the Australian standard for sex and gender [SEX-01]. Optional: nothing reads it but the note and the equality notice.
- **Connections:**
  - *Comes from:* the Segment's gender mix.
  - *Read by (not built yet):* the Review (the gender should fit the mix); the equality notice.

### A3. What kind of work do they do?

- **Control:** one choice (a radio).
- **Asked when:** the Segment's primary work status is Working / Employed (for a business Segment, the decision-maker's job level).
- **Options:**
  - Owner or senior executive
  - Manager
  - Professional or specialist
  - Technician or skilled trade
  - Administrative, sales or service
  - Operator or labourer
- **The "i" would say:** The ISCO-08 major groups in plain words: choose the group that fits the role; armed forces: choose the group that fits the role; clergy count as professionals. The Segment's education orders the list, most likely first, as a tendency and never as a filter.
- **Connections:**
  - *Comes from:* the Segment's work status and education.
  - *Read by (not built yet):* the Profile's note; the Review.

### A4. Which kind of business is it?

- **Control:** one choice (a radio, or the existing picker where the list is long).
- **Asked when:** the Segment's buyer is a business and its industry is answered.
- **Options:** the level-2 list (doc 35, 5.4) of the Segment's industry, each with its example.
- **The "i" would say:** The finer kind of business within the Segment's industry. If the customer fits another kind, that is another Profile.
- **Connections:**
  - *Comes from:* the Segment's sector and industry; the country's crosswalk (doc 35, 5.3).
  - *Read by (not built yet):* the industry pack's examples for this customer; competitor industry overlap.

### A5. What part do they play in the purchase?

- **Control:** ticks, as many as apply.
- **Asked when:** the Segment's buyer is a business, or it has a user part (a Proxy or Dual-Intent buyer), or its age group includes Minors.
- **Options:**
  - They will use it
  - They influence the decision
  - They place the order
  - They make the final decision
  - They control who gets to the decision-maker
- **The "i" would say:** The five buying-centre roles credited to Webster and Wind (1972) [CHN-02]. "They will use it" is the person who uses the offering day to day, who may be neither the one who pays nor the one who decides. The Segment's question on how the decision is authorized says how the whole buying group decides; this one says which part this person plays.
- **Connections:**
  - *Comes from:* the Segment's decision authorization and user part.
  - *Read by (not built yet):* the Review (nobody makes the final decision); context on the Customer Engagement page.

### A6. Specialized needs

*Moved from the Segment card (owner, 2026-11-01); the words are the owner's.* Behind one optional tick, **Add specialized accessibility or caregiving profiles**, a block of four questions.

**A6a. Do they have specific accessibility or user needs?** One choice: Standard needs; Temporary needs; Permanent needs. *"i":* Temporary: short-term limitations, for example healing from surgery or acute medical recovery. Permanent: long-term or progressive conditions that affect the tools they use every day. Choosing temporary or permanent opens the functional categories.

**A6b. What is their primary functional limitation category?** Ticks. Asked when the needs are temporary or permanent. Options: Physical and mobility needs; Sensory needs; Cognitive and neurodivergent needs. *"i":* Motor coordination and fine motor limitations; visual impairments, hearing loss and sensory sensitivities; ADHD, autism and age-related slowing. Select all that apply, so that the later parts can adapt the accessibility of what you offer, digital and physical.

**A6c. Do they balance high-intensity caregiving or family life roles?** One choice: No primary caregiving responsibilities; Yes, primary childcare provider; Yes, primary eldercare provider; Yes, specialized care provider; Yes, "Sandwich Generation" provider. *"i":* A parent or legal guardian of minors; aging parents or senior relatives; a spouse, sibling or child with permanent needs; balancing children and elders at once. The person mainly responsible for daily care and lifestyle choices; "Sandwich Generation" flags extreme time poverty across several generations of one household.

**A6d. What is their household or caregiving structure?** Ticks, up to 2. Asked when A6c is any "Yes". Options: Single-parent / Solo-caregiver household; Multigenerational household; Co-caregiver / Shared support. *"i":* Choose up to two. A multigenerational household shares care with the extended family; co-caregivers share the load with a partner or professional aides.

- **Connections (A6):**
  - *Comes from:* the tick; each question the answer above it.
  - *Read by (not built yet):* flags the owner's text asks for, kept as a thought (doc 34, section 6, row 6): a solo or single-parent household raises a time-poverty and churn-risk note in a customer journey; sensory or physical needs raise a "compliance validation required" badge on an Offering. They would only highlight, never decide.

## 4. Box B. Psychographics

### B1. What do they care about most?

- **Control:** ticks, up to 3.
- **Asked when:** always.
- **Options:** the list L1 (doc 35, 5.2): Lower price; Speed; Ease and convenience; Quality and results; Trust and reputation; Expert knowledge; A service made for them; Good support; Safety and low risk; Shared values or identity.
- **The "i" would say:** What matters most to a typical person of the Segment when choosing. Interests, lifestyle and aspirations stay in the note.
- **Connections:**
  - *Comes from:* nothing.
  - *Read by (not built yet):* the Value Proposition draft; the Review (against the Offering's benefit and the positioning).

## 5. Box C. Social & Interest Hubs

What the Segment cannot say: which devices, which social media, which communities, which events. The Segment asked how they discover ideas in general; these name them.

### C1. Which devices do they use?

- **Control:** ticks, as many as apply.
- **Asked when:** always.
- **Options:** the list L15 (doc 35, 5.2): Smartphone; Laptop or desktop; Tablet; A shared or public device; None of these (excludes the others).
- **The "i" would say:** The devices they use to find and buy, not those they own.
- **Connections:**
  - *Comes from:* the Segment's online comfort and where they buy: the setting starts it (Mobile app: Smartphone; Desktop / Laptop computer: Laptop or desktop; Physical storefront: none; Multi-channel: Smartphone and Laptop or desktop), as a starting value the user can change.
  - *Read by (not built yet):* the Review (make the order and the forms work on a phone; a note where the devices ticked leave out the one the Segment buys on).

### C2. Which social media do they use?

- **Control:** ticks, as many as apply.
- **Asked when:** the Segment's online comfort is not Tech-averse / Traditional.
- **Options:** the social media channels the app already lists: Instagram; Facebook; LinkedIn; YouTube; TikTok; Pinterest; X (Twitter); None of these (excludes the others). The ones related to the Segment's ways of discovering ideas (creators, communities, algorithmic discovery) come first.
- **The "i" would say:** The platforms they actually use, if any. "They may not have social media at all": choose None of these.
- **Connections:**
  - *Comes from:* the Segment's discovery ways and online comfort.
  - *Read by (not built yet):* the order of the Discover channels (page 2); the Profile's hubs.

### C3. Which communities do they belong to?

- **Control:** ticks, as many as apply.
- **Asked when:** the Segment's ways of discovering ideas include niche online communities or forums.
- **Options:** the community channels the app already lists: Facebook Group; Discord; Reddit; Slack; Meetup; None of these (excludes the others).
- **The "i" would say:** Where they ask, read and recommend. The names of the groups stay in the note.
- **Connections:**
  - *Comes from:* the Segment's discovery ways.
  - *Read by (not built yet):* the Discover channels; the Profile's hubs.

### C4. Which events do they go to?

- **Control:** ticks, as many as apply.
- **Asked when:** the Segment's social environment is a mix of online and in person, or mostly in person.
- **Options:** the in-person channels the app already lists as events: Market / Pop-up; Trade Fair / Exhibition; Workshop / Class; Event / Talk; None of these (excludes the others).
- **The "i" would say:** The kinds of events a typical person of the Segment attends. The names of the events stay in the note.
- **Connections:**
  - *Comes from:* the Segment's social environment.
  - *Read by (not built yet):* the In Person channels on page 2; the Profile's hubs.

## 6. Box D. Information & Shopping Habits

### D1. How do they compare their options?

- **Control:** ticks, as many as apply.
- **Asked when:** always.
- **Options:**
  - Your website
  - Reviews and recommendations online
  - A demo, trial or sample
  - A quote or proposal
  - What other people recommend
  - Comparison sites
  - A meeting or call
- **The "i" would say:** How they weigh options before choosing. How they pay and where they buy are the Segment's questions.
- **Connections:**
  - *Comes from:* the Segment's path to purchase.
  - *Read by (not built yet):* the Evaluate channels (page 2).

### D2. How much help do they want before they buy?

- **Control:** one choice (a radio).
- **Asked when:** always.
- **Options:**
  - They work it out themselves
  - They like a little guidance
  - They want to talk to a person
  - They need a formal demonstration or proposal
- **The "i" would say:** The help a typical person wants before buying; it can differ from how comfortable the Segment is online.
- **Connections:**
  - *Comes from:* the Segment's online comfort.
  - *Read by (not built yet):* the relationship type suggested on page 2; the Review (against the help the Offering gives).

## 7. Box E. Motivations

### E1. What are they trying to achieve?

- **Control:** ticks, up to 3.
- **Options:** the list L4 (doc 35, 5.2): Save time; Save money; Lower their risk; Get better results; Get easier access; Learn something new; Express who they are; Meet a requirement; Win customers or earn more; Stay within the rules.
- **Asked when:** always. *Read by (not built yet):* the Value Proposition draft. *Comes from:* nothing.

### E2. What frustrates them today?

- **Control:** ticks, up to 3.
- **Options:** the list L3 (doc 35, 5.2): ten frustrations, from "It costs too much" to "They have no time" (the list holds the exact words).
- **Asked when:** always. *Read by (not built yet):* the Value Proposition draft; the Review. *Comes from:* nothing.

### E3. What might stop them buying?

- **Control:** ticks, up to 3.
- **Options:** the list L2 (doc 35, 5.2): eight worries, from "The price or their budget" to "The effort of switching" (the list holds the exact words).
- **Asked when:** always. *Read by (not built yet):* the Offering ticks the worries it answers; the Evaluate actions suggested on page 2. *Comes from:* nothing.

## 8. Dropped, merged or left to the note

| Earlier question (doc 28, 6.4) | Now |
|---|---|
| P11 where do they look (channel categories) | split into C2, C3 and C4, which name what the Segment's discovery ways only point to |
| P13 how do they usually buy, P14 how do they like to pay | the Segment asks them (where they buy, how they pay); not asked again |
| P16 how comfortable are they online | the Segment asks it; not asked again |
| P15 devices | C1 |
| P22 how is the decision made | the Segment asks how the decision is authorized; A5 says what part this person plays |
| Education, household income, language, household and relationship status, job title | the Segment asks education and income; the rest stay in the note |

## 9. Decided, and still to decide

**Decided (owner, 2026-11-01).**

1. **C2 to C4** keep the lists the app already has (the social media, the communities, the events); no longer list is added. A specific name is written in the box's own note, as it is today.
2. **Their conditions** (online comfort, the ways of discovering ideas, the social environment) hold: a tendency of the Segment is enough to leave a Profile question out, so a short Segment gives a shorter Profile.
3. **The needs** stay open text lists.
4. **The user's Profile skips Box D** (2.1); the payer's Profile holds how they compare and what help they want.

**Answered for the user and not shown (owner, 2026-11-01).** The same rule as the Segment's (doc 36): where the answers above leave one answer, it is set and the question is not drawn.

| Question | Set when | To |
|---|---|---|
| A3 job level | the Segment's customers are self-employed | Owner or senior executive |
| A5 part in the purchase | the Segment's decision is "Sole practitioner decision" | all five roles ticked |

**Starting values the user can change (owner, 2026-11-01).** D1 and D2 start from the Segment's path to purchase and online comfort (a Researcher: reviews; a Social validator: what other people recommend; Tech-savvy: they work it out themselves; Tech-averse: they want to talk to a person); D2 starts at a formal proposal where the Segment's decision includes a formal procurement loop; A2 starts from the Segment's gender mix when it is 80% or more one way; C1 as in 5. Impulse buyers skip D1.

**One list for the job levels.** A3 and the Segment's user question ("What job level do they have?") take the same six levels, written once (`JOB_LEVELS`, `SegmentQuestions.ts`), so the words never differ between the two cards or the exports.

**The devices (C1) stay a starting value and a Review note, not a rule.** The Segment's "where they buy" starts C1 (a store: no device; the phone: Smartphone), and the Review notes a contradiction, but C1 is never unticked for the user: a shopper who buys in a store still finds the shop on a phone. A tendency never removes an option.

**Also decided (owner, 2026-11-01).** A5 is asked only for a business buyer, a Segment with a user part, or a group that includes Minors (2.1); a user's Profile is deleted completely when its Segment loses its user (2.2).

**Still to decide.** Nothing but that none of it is built: the reads are the design's, to be built when the Segment's are.
