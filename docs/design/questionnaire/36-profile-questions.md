# 36. The Profile's questions: every question and option, as built in part

Status: **specification**, written 2026-11-01, updated 2026-11-04; built in part. The questions of the Profile card in the order they are asked, with their control, when they are asked, their options, what their "i" says and what they connect to. **Built:** A1 (the exact age, held to the Segment's group), A2, A7, A3 (B2C) and A3b (B2B), A5, B1, C1 to C4, D1, D2 and E1 to E3, with their conditions, starting values and settling (`ProfileQuestions.ts`, answers kept as `questions` on the Profile), in one column at the width every floating card has (492px), the boxes in their order, each with the Segment card's title band. The proposed B2B Profiles by buying role (2). **Not built yet:** A4 (the kind of business), A6 (the specialised needs), the other proposed Profiles (by age term; the end user's beside a Proxy or Dual-Intent payer), the end user's own Profile (and so its Box D rule), the reads marked "not built yet" below.

Related: doc 35 (the Segment's questions, built, in the same form), doc 28 (6.4 and 6.5, the Profile design this refines, and the shared lists), doc 34 (the lists L1 to L16), doc 33 (its section 15 holds the thoughts), doc 31 (the age terms), `src/components/interview/editors/foundation/` (the Profile card today).

> **What the Profile does not ask again (owner, 2026-11-01).** The Segment (doc 35) asks the group: the age group, education, work status, household income, gender mix, where they are, how comfortable they are online, how they discover ideas, how they buy and pay, how the decision is authorised, the market. The Profile asks a **typical person** of that group, and only what the Segment cannot: an exact age, who they live with, the kind of work or the job level, which devices and which social media, communities and events, how they compare options, what they want, what frustrates them and what stops them. It never repeats a Segment question, and it can only choose within what the Segment allowed (section 2).

## 1. What a Profile holds, and the rules

**What a Profile holds.** A Name; seven boxes of two parts each (the questions below, then the box's note): *Specific Personal Information*, *Psychographics*, *Social & Interest Hubs* and *Information & Shopping Habits* (the section Description), *Goals & Desires*, *Challenges & Problems* and *Objections* (Motivations); and three numbered text lists of *Needs* (Functional, Emotional, Social). The answers are kept as `questions` on the Profile and are listed in the documents and the exports (`profileAnswerLines`, `ExportRenderers.ts`). The Offering reads the needs. The words of each question's "i" are in `info` in `ProfileQuestions.ts`; the "i would say" texts below are the fuller design, and the shorter texts in the code are the ones shown.

**The rules are the Segment's** (doc 35): a radio is one choice, ticks are several, with a limit where stated, built from the existing controls (`RadioChoice`, `BusinessTicks`, `NumberCell`, `OptionPicker`, `FieldRow`); an option says its few words and what is added in brackets or after a colon stands in the question's "i"; a question with one option left is not shown (none of the Profile's has yet); an answer to a question no longer asked is removed on the next choice; no "Not sure" option; each box keeps its title, its prompt (the "i") and **its note**, which stays for what the questions cannot say (a Profile is a person, and a person is described in words too); the layout is the Positioning card's (bands, divider lines, a double rule between boxes). The Functional needs stay a text list (Emotional and Social become ticks, section 10): a functional need is a precise statement ("send an invoice in under a minute"), not a category.

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

**What the notes are for (built).** The note under each box holds what the choice questions do not: a name and household in Personal, the values in Psychographics, the names of groups and places in Hubs, where and when they buy in Habits, the details that are theirs in Goals, Challenges and Objections. The "i" of each box says so (`PROFILE_NOTE_HINTS`). The box prompts are the owner's words. The Personal one says what the box asks (owner, 2026-11-03): "What are their age, gender, household and work?", and for a B2B Profile "What are their age, job level and role in buying?".

**The Profile card's layout (built).** The card floats at the standard card width (492px, the width limit of every floating card); it has three levels. **The sections** are Description, Motivations and Needs: each a band on the primary fill with light capitals in the Segment card's title style (18px, regular), with its fold; the double rule splits one section from the next. **The questions** are the labels over their options, the Segment card's design (18px, regular, sentence case), with a line under each label that stands over options; a label over a text holder (the Needs lists) or beside its cell (the age) has none. **Between them, the subsections** (the boxes: Specific Personal Information, Psychographics, Social & Interest Hubs, Information & Shopping Habits under Description; Goals & Desires, Challenges & Problems, Objections under Motivations) are lighter: a band on a 14% tint of the primary fill with a 4px primary bar at its left, the title a size under the section's (14px), bold capitals spaced wide, in the title ink; one line, the width of the card, between subsections (only the sections are split by a double rule). The sections are headings of level 3 and the subsections headings of level 4 (the questions are labels), so a screen reader reads the card as an outline. The double rule that splits the sections is the same component as the Segment card's (two 1px lines, 2px between; measured identical), and only the sections have it. The Notes of a box is a band of its own, the next in the run of tints and with a field gap above its tick row. Every band, line and rule runs from side to side of the card, and a section's band is followed by its first band without a gap. Needs has no subsections: its labels (Functional, Emotional, Social) stand straight under its band. Every box ends with the shared Note component (the tick and the word "Notes", ticked where it holds words), not a bare text cell. The card's edge is in the Segment's hue, as every floating card's is. Content (the name cell, the options, the notes, the lists, the age cell) stops at one line, the right edge of the name cell, before the column of the x, as in every floating card; the bands, their tints, the lines under the labels and the double rules run on to the card's sides.

## 2. What the Segment sets and the Profile chooses within

**A Profile belongs to its Segment (owner, 2026-11-03).** It sits inside its Segment's card, and its answers stay within the Segment's answers: a Profile is one typical person of the Segment, never another kind of customer. A person who differs in what the Segment fixes (another age group, buyer's category, kind of work or way of buying) belongs in another Segment.

| Segment answer (doc 35) | Profile question | What the Profile gets |
|---|---|---|
| Age group | A1 an exact age | a number within the group (when the group changes and the number is outside the new one, it is cleared: 2.2); a group that includes Minors also asks A5 |
| Work status (Working) | A3 kind of work | the nine kinds of work, for someone who is working |
| Gender mix (not Balanced) | A2 gender | shown when the mix is not Balanced mix; a Profile's gender should fit the mix (Review) |
| Industry | A4 kind of business | the finer list (doc 34, 5.4) of the Segment's industry, each with its example |
| How they discover ideas (ticks) | C2, C3, C4 | the platforms, communities and events related to the ticked ways come first |
| Where they spend time (social environment) | C4 events | asked when the environment is not Mostly digital or Low-frequency |

The app also **proposes Profiles** (up to three): one for each age term of the group; for a Proxy or Dual-Intent buyer, a second Profile for the end user (doc 35, the end-user part). The App User presses Add on the ones they want.

**For a business Segment, by buying role (built, owner 2026-11-03: "go on with your proposed changes", review section 6.1).** Read from the Segment's "Who decides to buy?" (doc 35, 9), after the buying-centre roles of Webster and Wind (1972). Each proposal is an add button above "+ Add Profile" ("+ Add User Profile"); it adds a Profile with that name and its A5 roles ticked, which the App User can change, and it is not offered again while a Profile of the Segment has its name (`proposedBusinessProfiles`, `ProfileQuestions.ts`):

| Who decides to buy? | Proposed Profiles (A5 ticked) |
|---|---|
| One person decides (alone) | Decider (all five roles) |
| The team agrees, or A manager signs off | User (Uses it, Influences the decision); Decider (Makes the final decision) |
| Several departments check | adds Checker (Influences the decision) |
| Formal procurement | adds Buyer (Places the order, Controls who reaches the decision-maker) |
| Both of the last two | adds one Checker and buyer (Influences the decision, Places the order, Controls who reaches the decision-maker), so never more than three |

Nothing is proposed before the question is answered, or for people. The kinds of business of the industry are not proposed: a different kind of business is a different Segment, not a different person.

### 2.1 How the Profile follows the Segment's kind (proposed)

| The Segment is | The Profiles | Asked | Not asked |
|---|---|---|---|
| **B2C, Direct Buyers** | one typical person, who pays and uses | A1, A2, A7, A3, A6; B1; C; D; E (and A5 where the age group includes Minors) | A5 (the person plays every part), unless the age group includes Minors |
| **B2C, Proxy or Dual-Intent** | the payer's Profile, and a second Profile for the end user (proposed beside it, doc 28, 6.5) | the payer: all but A5's "Uses it"; the end user: A1, A2, A5 (who uses it, who influences), A6, B1, C, E | the end user's Box D: the end user does not run the purchase (the payer's Profile holds how they compare and what help they want) |
| **B2B** | the person who decides (or the one asked to use it) | A1, A3b, A4, A5, B1, C, D, E | A2 and A6 (they are asked only where the owner turns them on) |

**A5 (owner, 2026-11-01).** A pure B2C Direct Segment whose age group does not include Minors: A5 is not asked and leaves no gap (the one person plays every part). A B2C Proxy or Dual-Intent Segment: A5 is asked on both Profiles, starting with "Places the order" and "Makes the final decision" ticked on the payer's and "Uses it" ticked on the end user's, as starting values the App User can change; nothing is locked. A B2B Segment: A5 is always asked.

### 2.2 When an answer above changes

The Segment's rule holds here: **a question that is no longer asked, or an option no longer offered, has its answer removed on the next choice**, and the documents read the answers settled against what is asked now.

**The exact age (A1), decided by the owner (2026-11-01).** When the Segment's age group changes, A1 is **cleared if its number falls outside the new group, and kept if it is still inside it**. A Profile of 21 stays when the Segment goes from Young adults (18–24) to a group that still holds 21 (or to none chosen), and is cleared when it goes to Peak (40–54). The cleared cell says why, in its placeholder: *"Age reset to match the Segment's age group. Enter a typical age from 40 to 54."* (the range of the new group: from its first age up to, but not including, its second; for the last group, "75 or older"). Nothing else on the Profile is touched. **An end user's Profile (owner, 2026-11-01).** When the Segment stops being Proxy or Dual-Intent (a change of the buyer's category in Positioning, or of the relationship), the end user's Profile is **deleted completely at once**, not hidden: what it holds (its name, notes, needs and answers) is removed from the Segment's saved answer, so nothing of it reaches the documents, the exports or the wire, and a later change back to Proxy starts a new, empty end user's Profile. The payer's Profile is untouched.

### 2.3 The card's layout

The card is built and its layout is in section 1 ("The Profile card's layout"): one column, three sections, the subsections and questions between them, the Notes of each box. It is made from the existing parts only:

| Part | Existing component or rule |
|---|---|
| Head | the card's head: the number, the name cell (`CardNameInput`), the remove button (the one x) |
| Sections (Description, Motivations, Needs) | the card's fold group (`BusinessGroup`), open or folded, remembered while the page is open |
| Questions | `FieldRow` with `FittingRadioChoice` or `RadioChoice` (one choice), `BusinessTicks` (several, with `max`), the number cell (A1) |
| A box's note | the shared Note component (`OptionalNote`), under the questions |
| What is not asked | a question that is not asked leaves no gap: its band is not drawn |

**What changes with the Segment's kind (2.1, proposed):** a B2C Direct Profile shows boxes A (without A4 and A5), B, C, D, E; a Proxy Segment adds the end user's Profile card beside it, with box D left out; a B2B Profile shows A1, A3, A4, A5, hides A2 and the specialised needs, and C asks the professional hubs only. Built so far: the questions follow the Segment's answers as the tables in 2.1 and 9 say, where the card exists.

## 3. Box A. Specific Personal Information

A typical person of the Segment, asked specifically.

### A2. What is this person's gender?

*(The question is asked first in the Profile, before the age; it keeps its id A2. **A Profile is one person:** once the gender is answered, the questions after it are written of a woman or a man ("How old is she?", "What is her job role?", "Which devices does he use?", "What matters most to him?"; `profileWho`); until then, and for any other answer, they say "this person". The questions below are listed with "this person".)*

- **Control:** one choice (a radio).
- **Asked when:** the Segment is of people and its gender mix is answered and is not Balanced mix.
- **Options:**
  - Woman
  - Man
  - Non-binary
  - Another gender
- **The "i" would say:** Asked only when the Segment's mix leans one way. The categories follow the Australian standard for sex and gender [SEX-01]. Nothing reads it today but the note (the equality notice and the Review check are not built).
- **Connections:**
  - *Comes from:* the Segment's gender mix. The mix is a rating since 2026-11-04 (doc 35): rated 1 or 2 (mostly or leaning men), A2 **starts** as Man; 4 or 5, as Woman; 3 (balanced) is not asked; a starting value the App User can change; the question stays visible, because a Segment holds up to three Profiles and one of them can be the minority. When the mix is Balanced the question is not asked: gender does not matter for what is sold.
  - *Read by (not built yet):* the Review (a gender that does not fit the mix is noted, never cleared); the equality notice.
  - *When the Segment's mix changes (owner, 2026-11-01):* a gender chosen on a Profile is **never cleared** because the mix flips (a man in a Segment that leans women is a real case); the Review notes it. Only when the mix becomes Balanced is the question no longer asked, and its answer is then removed on the next choice, as for any question no longer asked.

### A1. How old is this person?

- **Control:** a number (years), in the existing number cell.
- **Asked when:** the Segment's buyer is people; for a business Segment, the age of the person who decides.
- **The "i" would say:** An exact age within the Segment's age group, for a typical person of the group, not the average. The ages of the terms are approximate. If the Segment's age group changes and this age is no longer inside it, the age is cleared and the box says so.
- **Connections:**
  - *Comes from:* the Segment's age group (the number is held to it).
  - *Read by (not built yet):* the online-consent ages for under-18s (the Review); the proposed Profiles (one for each age term of the group); the number is cleared when it leaves the group (2.2).

### A7. Who does this person live with?

*Added (owner, 2026-11-03), built.* Asked before the work, after the age.

- **Control:** one choice (a radio).
- **Asked when:** the Segment's buyer is people (B2C), not for the end user's own Profile, and not where the Segment's age group is only Minors.
- **Options** (the ONS household types, Census 2021, household composition 8a, in plain words) [DEM-14]:
  - Alone
  - With a partner
  - With a partner and children
  - Single parent with children
  - With parents / relatives
  - With friends / housemates
- **The "i" says:** Based on: household types (ONS, Census 2021). Children: children living at home. With parents / relatives includes several generations under one roof.
- **Why not marital status:** the household (who shares the home, and whether there are children) shapes time, budget and who influences a purchase; a legal status rarely changes what a seller does. The GSS harmonised marital status question (nine legal options) and the web-survey "relationship status" were considered (project review, 2026-11-03, section 6.3).
- **Connections:**
  - *Read by (built):* the documents and the exports (`profileAnswerLines`).
  - *Read by (not built yet):* C3's order (parenting communities first for the two "children" answers); A6 loses its household-structure part (A6d) when A6 is built.

### A3. What kind of work does this person do? (B2C)

- **Control:** one choice (a radio).
- **Asked when:** the Segment's buyer is people and its answer to "Are your customers working?" is Yes.
- **Options** (the nine ISCO-08 major groups, in their order, in plain words; owner, 2026-11-03) [DEM-13]:
  - Manager / director
  - Professional
  - Technician / associate professional
  - Office / administrative work
  - Service, care or sales work
  - Farming, forestry or fishing
  - Skilled trade
  - Machine operator / driver
  - Routine / manual work
- **The "i" says:** Based on: the ISCO-08 major groups (ILO). Professional: for example a teacher, nurse, engineer or lawyer. Skilled trade: for example an electrician, plumber or chef. Someone who owns and runs a business: Manager / director. Armed forces: choose the group that fits the role.
- **Saved answers:** the ids of the six groups before are kept where the meaning is closest (manager, professional, technician, service, operator); "owner", an employment status rather than an occupation, reads as Manager / director (`JOB_RENAMED`).
- **Connections:**
  - *Comes from:* the Segment's work status.
  - *Read by (built):* the documents and the exports. *Not built yet:* C2's order (LinkedIn first for Manager / director and Professional); the Review.

### A3b. What is this person's job level? (B2B)

*Added (owner, 2026-11-03), built.* A B2B Profile's job question, in A3's place.

- **Control:** one choice (a radio).
- **Asked when:** the Segment's buyer is a business, except where its customers are self-employed: then it is set to Owner / partner and not shown (section 9).
- **Options** (LinkedIn's ten seniority values merged into five) [MSP-05]:
  - Owner / partner (Owner, Partner)
  - Senior executive (CXO, VP)
  - Director / head of department (Director)
  - Manager / team lead (Manager)
  - Specialist / team member (Senior, Entry, Training, Unpaid)
- **The "i" says:** Based on: the seniority levels B2B platforms use (LinkedIn), merged into five. Senior executive: the chief executive, a C-level or a vice president. Trainees and interns: Specialist / team member. It starts the role in buying: an owner or senior executive makes the final decision; a specialist uses it.
- **Saved answers:** a B2B Profile's kind of work saved before reads as a level: Owner to Owner / partner, Manager to Manager / team lead, the others to Specialist / team member.
- **Connections:**
  - *Read by (built):* A5's starting value (Owner / partner or Senior executive: Makes the final decision; Specialist / team member: Uses it); the documents and the exports.
  - *Read by (not built yet):* the Review ("nobody makes the final decision"). The proposed B2B Profiles (2) tick A5 directly and do not set the level.

### A4. Which kind of business is it?

- **Control:** one choice (a radio, or the existing picker where the list is long).
- **Asked when:** the Segment's buyer is a business and its industry is answered.
- **Options:** the level-2 list (doc 34, 5.4) of the Segment's industry, each with its example.
- **The "i" would say:** The finer kind of business within the Segment's industry. If the customer fits another kind, that is another Profile.
- **Connections:**
  - *Comes from:* the Segment's sector and industry; the country's crosswalk (doc 34, 5.3).
  - *Read by (not built yet):* the industry pack's examples for this customer; competitor industry overlap.

### A5. What is this person's role in buying?

- **Control:** ticks, as many as apply.
- **Asked when:** the Segment's buyer is a business, or it has an end-user part (a Proxy or Dual-Intent buyer), or its age group includes Minors.
- **Options:**
  - Uses it
  - Influences the decision
  - Places the order
  - Makes the final decision
  - Controls who reaches the decision-maker
- **The "i" would say:** The five buying-centre roles credited to Webster and Wind (1972) [CHN-02]. "Uses it" is the person who uses the offering day to day, who may be neither the one who pays nor the one who decides. The Segment's question on how the decision is authorised says how the whole buying group decides; this one says which part this person plays.
- **Connections:**
  - *Comes from:* the Segment's decision authorisation and end-user part.
  - *Read by (not built yet):* the Review (nobody makes the final decision); context on the Customer Engagement page.

### A6. Specialised needs

*Moved from the Segment card (owner, 2026-11-01); the words are the owner's.* Behind one optional tick, **Add specialised accessibility or caregiving profiles**, a block of four questions.

**A6a. Do they have specific accessibility or user needs?** One choice: Standard needs; Temporary needs; Permanent needs. *"i":* Temporary: short-term limitations, for example healing from surgery or acute medical recovery. Permanent: long-term or progressive conditions that affect the tools they use every day. Choosing temporary or permanent opens the functional categories.

**A6b. What is their primary functional limitation category?** Ticks. Asked when the needs are temporary or permanent. Options: Physical and mobility needs; Sensory needs; Cognitive and neurodivergent needs. *"i":* Motor coordination and fine motor limitations; visual impairments, hearing loss and sensory sensitivities; ADHD, autism and age-related slowing. Select all that apply, so that the later parts can adapt the accessibility of what you offer, digital and physical.

**A6c. Do they balance high-intensity caregiving or family life roles?** One choice: No primary caregiving responsibilities; Yes, primary childcare provider; Yes, primary eldercare provider; Yes, specialised care provider; Yes, "Sandwich Generation" provider. *"i":* A parent or legal guardian of minors; aging parents or senior relatives; a spouse, sibling or child with permanent needs; balancing children and elders at once. The person mainly responsible for daily care and lifestyle choices; "Sandwich Generation" flags extreme time poverty across several generations of one household.

**A6d. What is their household or caregiving structure?** Ticks, up to 2. Asked when A6c is any "Yes". Options: Single-parent / Solo-caregiver household; Multigenerational household; Co-caregiver / Shared support. *"i":* Choose up to two. A multigenerational household shares care with the extended family; co-caregivers share the load with a partner or professional aides.

- **Connections (A6):**
  - *Comes from:* the tick; each question the answer above it.
  - *Read by (not built yet):* flags the owner's text asks for, kept as a thought (doc 33, section 15, row 6): a solo or single-parent household raises a time-poverty and churn-risk note in a customer journey; sensory or physical needs raise a "compliance validation required" badge on an Offering. They would only highlight, never decide.

## 4. Box B. Psychographics

### B1. What matters most to this person?

- **Control:** ticks, up to 5, then a rating of each ticked value from "Optional" to "Essential" (`RatingScaleGroup`, `selectable`; section 11, built 2026-11-04).
- **Asked when:** always.
- **Options:** the list L1 (doc 34, 5.2):
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
- **The "i" would say:** What matters most to a typical person of the Segment when choosing. Interests, lifestyle and aspirations stay in the note.
- **Connections:**
  - *Read by (built, 2026-11-05):* the Competitor's K8 shows every value of L1, those ticked here first, the highest rated first, each banded by how many Profiles ticked it, and its K10 weighs each value by its rating here (doc 41).
  - *Comes from:* nothing.
  - *Read by (not built yet):* the Value Proposition draft; the Review (against the Offering's benefit and the positioning).

## 5. Box C. Social & Interest Hubs

What the Segment cannot say: which devices, which social media, which communities, which events. The Segment asked how they discover ideas in general; these name them.

### C1. Which devices does this person use?

- **Control:** ticks, as many as apply.
- **Asked when:** always.
- **Options:** the list L15 (doc 34, 5.2); Other opens a text box under the options, where the App User writes their own, and its words are kept as the answer:
  - Smartphone
  - Laptop / desktop
  - Tablet
  - A shared / public device
  - Other
- **The "i" would say:** The devices they use to find and buy, not those they own.
- **Connections:**
  - *Comes from:* the Segment's online comfort and where they buy: the setting starts it (Online, on a phone: Smartphone; Online, on a computer: Laptop / desktop; In a shop: none; Both online and in shops: Smartphone and Laptop / desktop), as a starting value the App User can change.
  - *Read by (not built yet):* the Review (make the order and the forms work on a phone; a note where the devices ticked leave out the one the Segment buys on).

### C2. Which social media does this person use?

- **Control:** ticks, as many as apply.
- **Asked when:** unless the Segment's online comfort is rated 1, Not comfortable (doc 35; built 2026-11-04).
- **Options:** the social media channels the app already lists; Other opens a text box under the options, where the App User writes their own, and its words are kept as the answer. (Not built: the ones related to the Segment's ways of discovering ideas, creators, communities and algorithmic discovery, would come first.)
  - Instagram
  - Facebook
  - LinkedIn
  - YouTube
  - TikTok
  - Pinterest
  - X (Twitter)
  - Other
- **The "i" would say:** The platforms they actually use, if any. "They may not have social media at all": leave every one unticked.
- **Connections:**
  - *Comes from:* the Segment's discovery ways and online comfort.
  - *Read by (not built yet):* the order of the Discover channels (page 2); the Profile's hubs.

### C3. Which communities does this person belong to?

- **Control:** ticks, as many as apply.
- **Asked when:** the Segment's ways of discovering ideas include niche online communities or forums.
- **Options:** the community channels the app already lists; Other opens a text box under the options, where the App User writes their own, and its words are kept as the answer:
  - Facebook Group
  - Discord
  - Reddit
  - Slack
  - Meetup
  - Other
- **The "i" would say:** Where they ask, read and recommend. The names of the groups stay in the note.
- **Connections:**
  - *Comes from:* the Segment's discovery ways.
  - *Read by (not built yet):* the Discover channels; the Profile's hubs.

### C4. Which events does this person attend?

- **Control:** ticks, as many as apply.
- **Asked when:** the Segment's social environment is a mix of online and in person, or mostly in person.
- **Options:** the in-person channels the app already lists as events; Other opens a text box under the options, where the App User writes their own, and its words are kept as the answer:
  - Market / pop-up
  - Trade fair / exhibition
  - Workshop / class
  - Talk / conference
  - Other
- **The "i" would say:** The kinds of events a typical person of the Segment attends. The names of the events stay in the note.
- **Connections:**
  - *Comes from:* the Segment's social environment.
  - *Read by (not built yet):* the In Person channels on page 2; the Profile's hubs.

## 6. Box D. Information & Shopping Habits

### D1. How does this person compare options?

- **Control:** ticks, as many as apply.
- **Asked when:** always.
- **Options:**
  - Your website
  - Online reviews / ratings
  - A demo / trial / sample
  - A quote / proposal
  - Word of mouth / referrals
  - Comparison sites
  - A meeting / call
- **The "i" would say:** How they weigh options before choosing. How they pay and where they buy are the Segment's questions.
- **Connections:**
  - *Comes from:* the Segment's path to purchase.
  - *Read by (not built yet):* the Evaluate channels (page 2).

### D2. How much help does this person want before buying?

- **Control:** one choice (a radio).
- **Asked when:** always.
- **Options:**
  - Works it out alone
  - Likes a little guidance
  - Wants to talk to a person
  - Needs a formal demonstration or proposal
- **The "i" would say:** The help a typical person wants before buying; it can differ from how comfortable the Segment is online.
- **Connections:**
  - *Comes from:* the Segment's online comfort.
  - *Read by (not built yet):* the relationship type suggested on page 2; the Review (against the help the Offering gives).

## 7. Box E. Motivations

### E1. What does this person want to achieve?

- **Control:** ticks, up to 3, then a rating of each ticked goal from "Minor" to "Main" (section 11, built 2026-11-04).
- **Options:** the list L4 (doc 34, 5.2), without the four goals that repeat B1 (Save time, Save money, Lower risk, Get better results: B1's Speed, Lower price, Safety and low risk, Quality and results; owner, 2026-11-03):
  - Get easier access
  - Learn something new
  - Self-expression
  - Meet a requirement
  - Win customers or earn more
  - Stay within the rules
- **The "i" says:** Choose up to three. What they want to achieve. What matters to them when choosing is asked under Psychographics. Based on: gains (Value Proposition Canvas) [FUN-46].
- **Asked when:** always. *Read by (not built yet):* the Value Proposition draft (the gains). *Comes from:* nothing.

### E2. What frustrates this person today?

- **Control:** ticks, up to 3, then a rating of each ticked frustration from "Mild" to "Severe" (section 11, built 2026-11-04).
- **Options:** the list L3 (doc 34, 5.2), ten frustrations:
  - Cost too high
  - Takes too long
  - Too complicated
  - Inconsistent quality
  - Hard to find someone trustworthy
  - Lack of know-how
  - Poor support
  - Fear of mistakes or breaking rules
  - No time / capacity
  - Unclear prices
- **The "i" says:** Choose up to three. What goes wrong for them today, before they buy from you. Based on: pains (Value Proposition Canvas) [FUN-46].
- **Asked when:** always. *Read by (not built yet):* the Value Proposition draft (the pains); the Review. *Comes from:* nothing.

### E3. What might hold this person back?

- **Control:** ticks, up to 3, then a rating of each ticked worry from "Minor" to "Blocking" (section 11, built 2026-11-04).
- **Options:** the list L2 (doc 34, 5.2), eight worries:
  - The price / budget
  - Whether you can be trusted
  - How long it takes to start
  - How hard it is to use
  - Risk / security
  - Whether it fits the need
  - Support after the sale
  - The effort of switching from the current option
- **The "i" says:** Choose up to three. Their doubts about buying from you; what frustrates them today is asked above (E2). Starts with the price where the Segment's household income is rated 1; change it freely.
- **Asked when:** always. *Read by (not built yet):* the Offering ticks the worries it answers (O8); the Evaluation actions suggested on page 2. *Comes from:* the Segment's household income (the starting value).


**Wording made simpler (owner, 2026-11-05: "Improve the wording to something more simple and concise. Add extra explanations, information and details in their i").** Built in `ProfileQuestions.ts`, the ids unchanged:
- E1 "What does she want to achieve?" (was "What are her main goals?"); E2 "What frustrates her today?" (was "... about how it is done now?"); E3 "What might hold her back?" (was "What might stop her buying from you?"); the Social needs "How does she want to be seen?" (was "How does she want others to see her?").
- Kept: B1 "What matters most to her?" (five words, and the name the Competitor card's values and K10 refer to) and "How does she want to feel?" (already short).
- Each "i" now says what belongs there, how it differs from its neighbour (E1 from B1, E3 from E2), and one example, each point within 160 characters (doc 39).
- The Emotional and Social needs' notes are the shared Notes (`OptionalNote`, titled "Notes") under their ticks, one line a need, kept as the list the Value Proposition reads; what a tick already says is not repeated there (the examples trimmed). Functional stays the numbered list the Offerings pick from.

**Wording reviewed (owner, 2026-11-04: "Improve the wording on the profile card"; doc 28, section 4; doc 39).** Built in `ProfileQuestions.ts`, the ids unchanged:
- A2's "i": "Asked only when the Segment's gender mix is not 3 (balanced); it starts from the mix. Change it freely." (was two points, the second "Nothing reads it but the note", an internal fact).
- A1's "i": "One age within the Segment's age group: a typical person, not the average." and "If the Segment's age group changes and this age falls outside it, the age is cleared."
- B1's "i": "Tick up to five things they weigh when choosing, then rate how much each matters." and "Write their interests, lifestyle and hopes in the note." (was "... stay in the note").
- C3's and C4's "i": "Write the names of the groups / events in the note." (was "... stay in the note"); C4 "goes to" for "attends".
- C4's options in sentence case after the slash: Market / pop-up, Trade fair / exhibition, Workshop / class, Talk / conference.
- E3's "i": its start "where the Segment's household income is rated 1".
- Every rated question's "i" now starts with what 1 and 5 mean ("1 = Optional, 5 = Essential."), the numbers standing over the rounds (doc 21, Rating Scale).

## 8. Dropped, merged or left to the note

| Earlier question (doc 28, 6.4) | Now |
|---|---|
| P11 where do they look (channel categories) | split into C2, C3 and C4, which name what the Segment's discovery ways only point to |
| P13 how do they usually buy, P14 how do they like to pay | the Segment asks them (where they buy, how they pay); not asked again |
| P16 how comfortable are they online | the Segment asks it; not asked again |
| P15 devices | C1 |
| P22 how is the decision made | the Segment asks how the decision is authorised; A5 says what part this person plays |
| Education, household income, language, household and relationship status, job title | the Segment asks education and income; the household is A7 (owner, 2026-11-03); language and the job title stay in the note |

## 9. Decided, and still to decide

**Decided (owner, 2026-11-01).**

1. **C2 to C4** keep the lists the app already has (the social media, the communities, the events); no longer list is added. A specific name is written in the box's own note, as it is today.
2. **Their conditions** (online comfort, the ways of discovering ideas, the social environment) hold: a tendency of the Segment is enough to leave a Profile question out, so a short Segment gives a shorter Profile.
3. **The needs** stay open text lists. *Replaced for Emotional and Social (owner, 2026-11-03): they become ticks, section 10; Functional stays text.* *Proposed for Functional (owner, 2026-11-06): ticks from L17 with its Notes, and the Offering ticks those (doc 43, after O13).*
4. **The end user's Profile skips Box D** (2.1); the payer's Profile holds how they compare and what help they want.

**Answered for the App User and not shown (owner, 2026-11-01).** The same rule as the Segment's (doc 35): where the answers above leave one answer, it is set and the question is not drawn.

| Question | Set when | To |
|---|---|---|
| A3b job level | the Segment's customers are self-employed | Owner / partner (built: not asked; set, so the documents show it) |

**Starting values the App User can change (owner, 2026-11-01).** D1 and D2 start from the Segment's path to purchase and online comfort (a Researcher: reviews; a Social validator: what other people recommend; Tech-savvy: they work it out themselves; Tech-averse: they want to talk to a person); D2 starts at a formal proposal where the Segment's decision includes a formal procurement loop; A2 starts from the Segment's gender mix when it leans (60 to 80%) or is mostly (80%+) one way, and stays visible; C1 as in 5. Impulse buyers skip D1. A5 starts with all five roles ticked where the Segment's "Who decides to buy?" includes "One person decides" (which is all it offers for a self-employed customer). **E3** starts with "The price / budget" ticked where the Segment's household income is Low, a starting value the App User can change without any validation in the way (owner, 2026-11-01).

**One list for the kinds of work.** A3 and the Segment's end-user question ("What kind of work do your end users do?") take the same nine groups, written once (`JOB_LEVELS`, `SegmentQuestions.ts`), so the words never differ between the two cards or the exports.

**The devices (C1) stay a starting value and a Review note, not a rule.** The Segment's "where they buy" starts C1 (a store: no device; the phone: Smartphone), and the Review notes a contradiction, but C1 is never unticked for the App User: a shopper who buys in a store still finds the shop on a phone. A tendency never removes an option.

**Also decided (owner, 2026-11-01).** A5 is asked only for a business buyer, a Segment with an end-user part, or a group that includes Minors (2.1); an end user's Profile is deleted completely when its Segment loses its end user (2.2).

**Not built.** A4, A6, the proposed Profiles other than the B2B ones by buying role (2), the end user's own Profile and the reads marked "not built yet", which are built when the Segment's are.

## 10. The Needs as choices (decided, 2026-11-03)

The owner asked (2026-11-03) whether the three Needs lists could be choices instead of texts. **Decided (owner, 2026-11-03): Functional stays text; Emotional and Social become ticks**, each with the list's own text kept as the note. This replaces 9.3 for Emotional and Social and is the one place the Needs are decided. **Built (2026-11-04):** each kind's list is a question (`emotional` and `social` for people, `emotional-b2b` and `social-b2b` for a business buyer, `ProfileQuestions.ts`), ticked up to 3 and each tick rated from "Mild" to "Strong" (as the Motivations are, section 11: up to 3 keeps the Value Proposition's first needs few); the numbered lists stay as the notes, so the Offering and the Value Proposition read what they read before.

**Why Functional stays text.** A functional need is the task itself ("send an invoice in under a minute"), different for every business, so no list fits it. A general list (saves time, simplifies, reduces cost, reduces risk) would ask again what B1 and E1 already ask: L1 is those functional values in the app's words (doc 34). The Offering keeps ticking the functional needs it addresses, by entry, as built. The owner's idea (2026-11-03): a list of functional jobs serves instead to compare an Offering with a Competitor, so it is asked there, not here: L17 (doc 34), doc 43 O13, proposed. (Doc 41's job question was withdrawn on 2026-11-04 as an Offering question.)

**Why Emotional and Social can be ticks.** How people want to feel, and how they want to be seen, falls into a short set that holds across businesses. Bain's *Elements of Value* names it from surveys of 10,000 consumers [FUN-48] and of business buyers [FUN-49]. The lists below are those elements in plain UK words, cut to what a small business can deliver.

**Emotional: "How do they want to feel?"** Ticks, up to 3. The options follow the Segment's kind (doc 35, the buyer type).
- People (B2C): Calm and worry-free; Rewarded / treated; Relaxed / looked after; Entertained; Attractive; Healthy and well; Delighted by how it looks; Reminded of good times; Motivated; Hopeful; Fulfilled, as they grow.
- Business (B2B): Sure they made the right choice; Glad to work with you; Growing in their work; Hopeful about their business; Inspired about what comes next.

**Social: "How do they want to be seen?"** Ticks, up to 3.
- People (B2C): As having good taste / style; As part of a group they value; As one of the few with access; As caring for others or the planet; As leaving something for their family.
- Business (B2B): As someone others trust; As well connected; As more valued in their field; As a responsible business.

**The "i" says:** Choose up to three: the feelings that make them buy, not every feeling they have. Write the details in the note. Based on: Bain's Elements of Value (HBR, 2016 and 2018).

**Asked when:** always. **Connections:** *Comes from:* the Segment's kind (the list). *Read by (not built yet):* the Offering's "Emotional and social needs addressed" (doc 43); the Value Proposition's open items (doc 42, "Unanswered need" and "Emotional and social needs").

**What changes for saved work.** Nothing is lost: a Profile's emotional and social texts become the notes of the two questions, and the ticks start empty. The Offering's ticks of functional needs are untouched.

**Still to decide:** the option words above.

## 11. Psychographics and Motivations ticked and rated (owner 2026-11-04; built 2026-11-04)

The owner asked that B1 (Psychographics) and E1 to E3 (Motivations) use both ticks and the five rounds: the App User ticks what applies, then rates each ticked item (`RatingScaleGroup` with `selectable`, doc 21). The ids, the lists and the saved ticks stay; an existing tick starts unrated. **As built:** the ratings are kept as `<id>-rating`, one "option:point" each (`ProfileQuestions.ts`); an untick takes its rating with it; the documents and the exports print each tick with its rating, the highest first ("Speed (5/5); Lower price (3/5); Good support").

| Question | Ticks | Rating of each ticked item | Why these words |
|---|---|---|---|
| B1. What matters most to this person? | up to 5 (was 3) | "Optional" to "Essential" | What matters when choosing is a requirement more or less firm: optional at one end, essential at the other |
| E1. Main goals | up to 3 | "Minor" to "Main" | A goal is pursued more or less; the top end names the goal that drives the purchase |
| E2. Frustrations | up to 3 | "Mild" to "Severe" | A frustration is felt more or less strongly: the plain words of how much it hurts |
| E3. Worries that stop a purchase | up to 3 | "Minor" to "Blocking" | A worry either slows a purchase or stops it: the top end is the worry that blocks it |

D2 ("How much help does this person want before buying?") stays one choice: its options name kinds of help, each read by page 2's relationship types, not a degree.

**How many ticks: by scenario.**

| Scenario | What it means for the number of ticks | Limit |
|---|---|---|
| B2C everyday purchase (a café, a grocery) | Little search; two or three things decide (price, speed, ease) | 3 |
| B2C considered purchase (furniture, a holiday) | Long search and comparison; four or five things are weighed | 5 |
| B2C identity or lifestyle (fashion, handmade crafts) | Shared values, quality and a tailored service lead; three or four | 4 |
| B2B small-business buyer (the owner buys) | One person weighs price, ease, support and trust | 4 |
| B2B corporate buying group | Each Profile is one role (A5): its concerns are narrow | 3 |
| Public sector or charity | Rules, safety, value for money and trust: several are required at once | 5 |
| Niche hobby market | Expert knowledge, quality and shared identity: few and strong | 3 |
| Mass market | Price, ease and trust: few | 3 |

**The rule.** With a rating, no limit is needed to rank: the rating does the ranking. A cap still keeps a Profile focused and readable, and a long list of ticks says less, not more. The scenarios need three to five for what matters (B1) and never more than three for goals, frustrations and worries, whose first items are what the Value Proposition and the Offering read. So: **B1 up to 5; E1, E2 and E3 up to 3**, the same in B2B and B2C (a corporate group's narrower Profiles simply tick fewer). **Decided (owner, 2026-11-04): "The limits are fine."** Five stays within the span a person can hold and compare at once, "somewhere in the neighborhood of seven" (Miller, 1956) [FUN-66]; a more involved buyer searches more (Zaichkowsky, 1985) [FUN-67], which is why a considered purchase needs more than the everyday three.

**What the ratings feed.** Built: B1's ratings weigh the Competitor's K10 (doc 41). Not built yet:
- B1 → the Competitor's K8: built (its rows ordered by the Profiles' highest rating, banded by how many tick each); in K10 the weight of each value is that rating (built).
- B1 → the Value Proposition draft (doc 42): the value rated highest comes first.
- E1 → the Value Proposition draft's gains, the goal rated highest first.
- E2 → the Value Proposition draft's pains, the frustration rated highest first; the Review.
- E3 → the Offering's O8 (doc 43): the worries rated highest first; a "Blocking" worry no Offering answers is a Review item.
