# 36. The Profile's questions: every question and option, as built in part

Status: **specification**, written 2026-11-01, updated 2026-11-08; built in part. The questions of the Profile card in the order they are asked, with their control, when they are asked, their options, what their "i" says and what they connect to. **Built:** A1 (the exact age, held to the Segment's group), A2, A7, A3 (B2C) and A3b (B2B), A5, B1, C1 to C4, D1 to D3, E1 to E3 and the Needs (Functional, Emotional, Social; section 10), with their conditions, starting values and settling (`ProfileQuestions.ts`, answers kept as `questions` on the Profile), in one column at the width every floating card has (492px), the boxes in their order, each with the Segment card's title band. The proposed B2B Profiles by buying role (2). **The buyer and the end user in one Profile (2.4; owner, 2026-11-08):** on a Proxy or Dual-Intent Segment each Profile holds the buyer's part and the end user's, with A1 (end user), A7 (end user), A8 and E4 (saved under `user.questions`). **Not built yet:** A4 (the kind of business), A6 (the specialised needs), the other proposed Profiles (by age term), the reads marked "not built yet" below.

Related: doc 35 (the Segment's questions, built, in the same form), doc 28 (6.4 and 6.5, the Profile design this refines, and the shared lists), doc 34 (the lists L1 to L16), doc 33 (its section 15 holds the thoughts), doc 31 (the age terms), `src/components/interview/editors/foundation/` (the Profile card today).

> **What the Profile does not ask again (owner, 2026-11-01).** The Segment (doc 35) asks the group: the age group, education, work status, household income, gender mix, where they are, how comfortable they are online, how they discover ideas, how they buy and pay, how the decision is authorised, the market. The Profile asks a **typical person** of that group, and only what the Segment cannot: an exact age, who they live with, the kind of work or the job level, which devices and which social media, communities and events, how they compare options, what they want, what frustrates them and what stops them. It never repeats a Segment question, and it can only choose within what the Segment allowed (section 2).

## 1. What a Profile holds, and the rules

**What a Profile holds.** A Name; seven boxes of two parts each (the questions below, then the box's note): *Specific Personal Information*, *Psychographics*, *Social & Interest Hubs* and *Information & Shopping Habits* (the section Description), *Goals & Desires*, *Challenges & Problems* and *Objections* (Motivations); and the three *Needs* (Functional, Emotional, Social): Emotional and Social are rated ticks with their Notes, and Functional is rated ticks above the numbered list of their own tasks (2026-11-07, section 10). The answers are kept as `questions` on the Profile and are listed in the documents and the exports (`profileAnswerLines`, `ExportRenderers.ts`). On a Proxy or Dual-Intent Segment the card holds two parts, the buyer and the end user (2.4), the end user's own answers kept as `user.questions` and its Personal note as `user.note`. The Offering reads the needs. The words of each question's "i" are in `info` in `ProfileQuestions.ts`; the "i would say" texts below are the fuller design, and the shorter texts in the code are the ones shown.

**The rules are the Segment's** (doc 35): a radio is one choice, ticks are several, with a limit where stated, built from the existing controls (`RadioChoice`, `BusinessTicks`, `NumberCell`, `OptionPicker`, `FieldRow`); an option says its few words and what is added in brackets or after a colon stands in the question's "i"; a question with one option left is not shown (none of the Profile's has yet); an answer to a question no longer asked is removed on the next choice; no "Not sure" option; each box keeps its title, its prompt (the "i") and **its note**, which stays for what the questions cannot say (a Profile is a person, and a person is described in words too); the layout is the Positioning card's (bands, divider lines, a double rule between boxes). The Emotional and Social needs are rated ticks with their Notes; the Functional needs are rated ticks above the numbered list (section 10, 2026-11-07): the list keeps the precise statement ("send an invoice in under a minute"), which no category holds.

**How the boxes map.**

| Box today | Questions below |
|---|---|
| Specific Personal Information | A1 to A5; the end user's A1 (end user), A7 (end user) and A8 (2.4) |
| Psychographics | B1 |
| Social & Interest Hubs | C2 to C4 |
| Information & Shopping Habits | C1, then D1 to D3 (C1 moved here, owner, 2026-11-08) |
| Goals & Desires | E1; the end user's E4 before it (2.4) |
| Challenges & Problems | E2 |
| Objections | E3 |
| Needs | Emotional and Social: rated ticks with Notes; Functional: rated ticks above the numbered list (section 10) |

**What the notes are for (built).** (Every Notes box is empty until the user writes, with no placeholder: owner, 2026-11-12, "The notes should work more as each user wants. Do not place any message in the text cells".) The note under each box holds what the choice questions do not: a name, the job title and where they live in Personal (their age, household and work are asked above it; A7 asks the household since 2026-11-03), the values in Psychographics, the names of groups and places in Hubs, how they buy, in their words, in Habits, the details that are theirs in Goals, Challenges and Objections. The "i" of each box says so (`PROFILE_NOTE_HINTS`). The box prompts are the owner's words. The Personal one says what the box asks (owner, 2026-11-03): "What are their age, gender, household and work?", and for a B2B Profile "What are their age, job level and role in buying?".

**The Profile card's layout (built).** The card floats at the standard card width (492px, the width limit of every floating card); it has three levels. **The sections** are Description, Motivations and Needs: each a band on the primary fill with light capitals in the Segment card's title style (18px, regular), with its fold; the double rule splits one section from the next. **The questions** are the labels over their options, the Segment card's design (18px, regular, sentence case), with a line under each label that stands over options; a label over a text holder (the Needs lists) or beside its cell (the age) has none. **Between them, the subsections** (the boxes: Specific Personal Information, Psychographics, Social & Interest Hubs, Information & Shopping Habits under Description; Goals & Desires, Challenges & Problems, Objections under Motivations) are lighter: a band on a 14% tint of the primary fill with a 4px primary bar at its left, the title a size under the section's (14px), bold capitals spaced wide, in the title ink; one line, the width of the card, between subsections (only the sections are split by a double rule). The sections are headings of level 3 and the subsections headings of level 4 (the questions are labels), so a screen reader reads the card as an outline. The double rule that splits the sections is the same component as the Segment card's (two 1px lines, 2px between; measured identical), and only the sections have it. The Notes of a box is a band of its own, the next in the run of tints and with a field gap above its tick row. Every band, line and rule runs from side to side of the card, and a section's band is followed by its first band without a gap. Needs has no subsections: its labels (Functional, Emotional, Social) stand straight under its band. Every box ends with the shared Note component (the tick and the word "Notes", ticked where it holds words), not a bare text cell. The card's edge is in the Segment's hue, as every floating card's is. Content (the name cell, the options, the notes, the lists, the age cell) stops at one line, the right edge of the name cell, before the column of the x, as in every floating card; the bands, their tints, the lines under the labels and the double rules run on to the card's sides.

## 2. What the Segment sets and the Profile chooses within

**A Profile belongs to its Segment (owner, 2026-11-03).** It sits inside its Segment's card, and its answers stay within the Segment's answers: a Profile is one typical person of the Segment, never another kind of customer. A person who differs in what the Segment fixes (another age group, buyer's category, kind of work or way of buying) belongs in another Segment.

| Segment answer (doc 35) | Profile question | What the Profile gets |
|---|---|---|
| Age group | A1 an exact age | a number within the group (when the group changes and the number is outside the new one, it is cleared: 2.2); a group that includes Minors also asks A5 |
| Work status (Working) | A3 kind of work | the nine kinds of work, for someone who is working |
| Gender mix (not Balanced) | A2 gender | shown when the mix is not Balanced mix; a Profile's gender should fit the mix (Review) |
| Industry | A4 kind of business | the finer list (doc 34, 5.4) of the Segment's industry, each with its example |
| Where they discover new products (ticks) | C2, C3, C4 | the platforms, communities and events related to the ticked ways come first (not built yet); built: C3 is asked only when "Online communities / forums" is ticked |
| Where they spend time (social environment) | C4 events | asked when the Segment socialises "Online and in person" or "Mostly in person" (doc 35, Box 4, 2); a business Segment's Profile is always asked (owner, 2026-11-08) |

The app also **proposes Profiles** (up to three): one for each age term of the group (not built yet). The App User presses Add on the ones they want. *(For a Proxy or Dual-Intent buyer a second Profile for the end user was proposed here; since 2026-11-08 every Profile of such a Segment holds the end user in its own part instead: 2.4.)*

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
| **B2C, Proxy or Dual-Intent** | each Profile in two parts, the buyer and the end user (2.4, built 2026-11-08; it replaces the second Profile proposed beside the payer's, doc 28, 6.5) | the buyer: A2, A1, A7, A3, A5, B1, C, D, E3; the end user: A1 (end user), A7 (end user, an adult only), A8, E4, E1, E2, the Needs | the end user's Box D (the buyer runs the purchase), A2, A3, A5, B1, C and E3 |
| **B2B** | the person who decides (or the one asked to use it) | A1, A3b, A4, A5, B1, C, D, E; for a Proxy or Dual-Intent business buyer (staff, clients) in two parts as above (2.4): the end user's A1 (end user), A8, E4, E1, E2 and the Needs | A2 and A6 (they are asked only where the owner turns them on) |

**A5 (owner, 2026-11-01).** A pure B2C Direct Segment whose age group does not include Minors: A5 is not asked and leaves no gap (the one person plays every part). A B2C Proxy or Dual-Intent Segment: A5 is asked in the buyer's part, starting with "Places the order" and "Makes the final decision" ticked, as starting values the App User can change; nothing is locked (the end user's part asks no role in buying: 2.4). A B2B Segment: A5 is always asked.

### 2.2 When an answer above changes

The Segment's rule holds here: **a question that is no longer asked, or an option no longer offered, has its answer removed on the next choice**, and the documents read the answers settled against what is asked now.

**The exact age (A1), decided by the owner (2026-11-01).** When the Segment's age group changes, A1 is **cleared if its number falls outside the new group, and kept if it is still inside it**. A Profile of 21 stays when the Segment goes from Young adults (18–24) to a group that still holds 21 (or to none chosen), and is cleared when it goes to Peak (40–54). The cleared cell says why, in its placeholder: *"Age reset to match the Segment's age group. Enter a typical age from 40 to 54."* (not built yet; the range of the new group, both ages included (doc 35, Box 1, 1); for the last group, "75 or older"). Nothing else on the Profile is touched. **An end user's Profile (owner, 2026-11-01).** When the Segment stops being Proxy or Dual-Intent (a change of the buyer's category in Positioning, or of the relationship), the end user's Profile is **deleted completely**, not hidden: what it holds is removed from the Segment's saved answer, so nothing of it reaches the documents, the exports or the wire, and a later change back to Proxy starts a new, empty end user's Profile. The payer's Profile is untouched. **As built (2026-11-08), with the end user a part of each Profile (2.4):** the end user's own answers and Notes (`user`) are no longer read at once (the card, the documents, the exports and the drafts leave them out), and are removed from the saved answer with the Profile's next answer, the rule every question no longer asked follows; E1, E2 and the Needs stay, as the one person's.

### 2.3 The card's layout

The card is built and its layout is in section 1 ("The Profile card's layout"): one column, three sections, the subsections and questions between them, the Notes of each box. It is made from the existing parts only:

| Part | Existing component or rule |
|---|---|
| Head | the card's head: the number, the name cell (`CardNameInput`), the remove button (the one x) |
| Sections (Description, Motivations, Needs) | the card's fold group (`BusinessGroup`), open or folded, remembered while the page is open |
| Questions | `FieldRow` with `FittingRadioChoice` or `RadioChoice` (one choice), `BusinessTicks` (several, with `max`), the number cell (A1) |
| A box's note | the shared Note component (`OptionalNote`), under the questions |
| What is not asked | a question that is not asked leaves no gap: its band is not drawn |

**What changes with the Segment's kind (2.1):** a B2C Direct Profile shows boxes A (without A4 and A5), B, C, D, E; a Proxy or Dual-Intent Segment's Profile holds the buyer's part and the end user's in the same card, box D in the buyer's only (2.4, built); a B2B Profile shows A1, A3, A4, A5, hides A2 and the specialised needs, and C asks the professional hubs only. Built so far: the questions follow the Segment's answers as the tables in 2.1 and 9 say, where the card exists.

### 2.4 The buyer and the end user in one Profile (owner, 2026-11-08; built)

> **The owner's rule (2026-11-08, 18:11):** "If the buyer is proxy, the profile should contain questions for both buyer and end user."

**What it means.** On a Segment whose own buyer is **Proxy** (a parent who buys for a child, an employer who pays for its staff) each Profile holds **two parts in the same card**: **The buyer**, the person who chooses and pays, and **The end user**, the person it is for. The same holds for a **Dual-Intent** buyer: the buyer uses it too, and the end user's part describes the people they buy for besides themselves (the dependents; its "i" says so). A Direct Segment's Profile is one person, who pays and uses, and is unchanged: its three sections (Description, Motivations, Needs) and every question in them.

**One rule splits the questions:** who they are, how they use it and what they want from it belong to the **end user**; choosing, paying and deciding belong to the **buyer**. A question asked of both is shown once in each part only where the two answers can really differ (the age, the household); otherwise it is asked once, in the part it belongs to.

| Question | Part | Why |
|---|---|---|
| A2 gender | buyer | the buyer's own identity; the Segment's gender mix (which starts it) is the buyers'; the end user is written of as "the end user" |
| A1 age | both | the buyer's held to the Segment's age group; the end user's, **A1 (end user)**, held to the Segment's end-user stage (doc 35, End user, 1: a Child 3 to 10), not the buyer's age group; on a business Segment (staff) held to working age, 18 to 64, where no working stage is chosen (2026-11-08) |
| A7 household | both | the buyer's household as before; **A7 (end user)** only of an adult end user of a people Segment (18 or more): a baby, child or teenager lives with the buyer, and a business Segment's end users are its staff or clients |
| A3 / A3b work, job level | buyer | the job of the person who decides |
| A5 role in buying | buyer | deciding and ordering; it starts at Places the order and Makes the final decision as before |
| B1 what matters most | buyer | what they weigh when **choosing**; so the Competitor's K8 and K10, the open items and the Review's clear opening read the buyer's |
| C1 to C4 devices, social media, communities, events | buyer | where they find and buy (C1's "i": the devices they use to find and buy): who the channels must reach |
| D1 to D3 comparing, help, when they buy | buyer | the purchase, run by the buyer (as doc 36 decided in 2026-11-01: the end user's Box D is not asked) |
| E3 worries | buyer | the doubts about **buying** (the price among them), so the Offering's O8 reads the buyer's |
| **A8** online comfort | end user | new, the end user's own: how easily the end user uses websites and apps; starts from the Segment's End user, 8; not asked of a Baby |
| E1 goals | end user | what they want from it |
| **E4** outcome for the end user | end user | moved here from the Segment's End user, 9 (and Positioning's 10 before it); stands first in the end user's Goals & Desires |
| E2 frustrations | end user | what goes wrong for the person who uses it |
| N1 to N5 the Needs | end user | the jobs, the feelings and the way they want to be seen of the person it is for |

Payment-related items (how they pay, the household income, who authorises the purchase) are the Segment's questions, of the buyers; the Profile asks none. Minors keep their rules: an end user of under 18 is asked no household and no work or income (none is asked of the end user at all), a Baby no online comfort.

**How the card shows it.** Two sections, each the existing section band with its fold and its "i" (the level 3 headings "The buyer" and "The end user", split by the shared double rule), and under each the existing boxes (level 4 bands) with their questions and their Notes: the buyer's Specific Personal Information, Psychographics, Social & Interest Hubs, Information & Shopping Habits and Objections; the end user's Specific Personal Information (its own Notes), Goals & Desires (E4 then E1), Challenges & Problems (E2) and Needs (the Functional jobs and the numbered list of their own tasks, the Emotional and Social ticks with their Notes). The end user's questions are written of the end user ("How old is the end user?", "What does the end user want to achieve?"). No new look: the same `BusinessGroup`, box, `FieldRow`, `OptionalNote` and controls (A8 the `RatingScale` the Segment's comfort uses; E4 a radio while the stage allows one, else ticks that lock at the limit, as it was on the Segment).

**Saved data (no key changed for the buyer).** The Profile's answers stay where they were (`questions`, `description`, `goals`, `challenges`, `objections`, `needs`), and on a Proxy or Dual-Intent Segment they are the buyer's, except E1, E2, the Needs and the Goals & Desires and Challenges & Problems Notes, which keep their keys and are the end user's there (a Direct Segment asks them of its one person, and the Offerings tick the functional tasks by id, so the ids stay stable and Functional Needs Addressed, the open items and the Customer Engagement relationships read them as before). The end user's own answers are saved under **`user.questions`** on the Profile (`a1`, `a7`, `comfort`, `outcome`), and its Personal Notes under **`user.note`**. They start empty, except A8 (from the Segment's End user, 8) and E4 (from the Segment's End user, 9 saved before, else Positioning's `organisation.outcomeUser`, within the stage's limit); the saved value in the new place wins, even cleared (an empty list). Old data stays readable and nothing is lost: the Segment's `u-outcome` is kept and settled as E4's start.

**When the Segment loses its end user** (2.2): the end user's part is no longer shown or read (not in the documents, the exports, the drafts), and `user` is removed with the Profile's next answer; a later change back to Proxy starts it empty. E1, E2 and the Needs stay, as the one person's.

**The readers (built).** The export prints the Profile in its two parts ("The buyer", then "The end user", each with its answers and its Notes); the Business Plan's Customer Profiles table heads its columns "End user's goals", "End user's challenges" and "End user's needs" for such a Segment; the Value Proposition's draft reads "For [Segment] whose end users [frustration] and want to [goal], …" (doc 42, 1); its open items read the buyer's B1 and E3 and the end user's tasks, as before; the Competitor's K8, K10 and the Review's clear opening read B1, the buyer's; the Offering's O8 reads E3, the buyer's (`effectiveProfileAnswers`, `effectiveProfileUserAnswers`, `profilePartOf` in `ProfileQuestions.ts`).

**Naming, Dual-Intent and a minor end user (2026-11-09; built).**
- *The end user named.* The end user's part names the end user from the Segment's relationship (Positioning's End User) where one name fits every relationship chosen: Parent or guardian, "the child"; Spouse or partner, "the partner"; Caregiver, "the person cared for"; Employer, "the employee"; Business serving clients, "the client"; Institution or membership body, "the person it serves" (offered since 2026-11-09; its end user's age follows the end-user stage, of any age, not the working ages of a business Segment's staff); otherwise "the end user" ("How old is the child?"). The section title stays "The end user" for a Proxy buyer. The documents keep "the end user" (`profileUserName`, `profileUserWho`).
- *Dual-Intent.* The buyer uses it too, so the sections are titled **"The buyer (who also uses it)"** and **"The others who use it"**. E1, E2 and the Needs stay asked once, in the second part, of **"a typical user"** (the buyer or the others: "What does a typical user want to achieve?"); its "i" says so. The end user's own questions (A1, A7, A8, E4) are of the others, named by the relationship. No question is asked twice. A5 starts with Uses it, Places the order and Makes the final decision.
- *A minor end user of a Proxy buyer* (End user, 1: Baby, Child or Teenager; or only Minors chosen in Positioning while that is not answered): E1 and E2 stay asked, their lists tailored: E1 without Revenue, Compliance and Efficiency (an adult's goals), E2 without Cost (the buyer's, asked as E3's Price). The social need (N4) stays asked: a Baby or Child is offered Stylish and Included only (Exclusive, Altruistic and Impactful are an older person's); a Teenager all but Impactful (a legacy). A tick saved before stays shown until unticked (`profileOptionsShown`).

**Decided for the owner (2026-11-08), to confirm.** A2 is the buyer's only (no end-user gender: the Segment holds no end users' gender mix). C1 to C4 are the buyer's. E2 is the end user's although Cost may be felt by the buyer (the rule: what goes wrong with the way they do it now, for the person who uses it). A business Segment's end user keeps the business Needs lists (N3, N5) and is not offered E1's Enjoyment, as every Profile of a business Segment; whether staff should be offered the people's lists is left open. The Segment's Box 4 (online comfort) stays the buyers'.

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
- **The "i" says:**
  - Asked when the Segment's gender mix leans one way (any point but 3); it starts from the mix. Change it freely.
- **Connections:**
  - *Comes from:* the Segment's gender mix. The mix is a rating since 2026-11-04 (doc 35): rated 1 or 2 (mostly or leaning men), A2 **starts** as Man; 4 or 5, as Woman; 3 (balanced) is not asked; a starting value the App User can change; the question stays visible, because a Segment holds up to three Profiles and one of them can be the minority. When the mix is Balanced the question is not asked: gender does not matter for what is sold. The categories follow the Australian standard for sex and gender [SEX-01].
  - *Read by (not built yet):* the Review (a gender that does not fit the mix is noted, never cleared); the equality notice.
  - *When the Segment's mix changes (owner, 2026-11-01):* a gender chosen on a Profile is **never cleared** because the mix flips (a man in a Segment that leans women is a real case); the Review notes it. Only when the mix becomes Balanced is the question no longer asked, and its answer is then removed on the next choice, as for any question no longer asked.

### A1. How old is this person?

- **Control:** a number (years), in the existing number cell.
- **Asked when:** the Segment's buyer is people; for a business Segment, the age of the person who decides.
- **The "i" says:**
  - One age within the Segment's age group: a typical person, as you picture them.
  - If the Segment's age group changes and this age falls outside it, the age is cleared.
- **Connections:**
  - *Comes from:* the Segment's age group (the number is held to it).
  - *Read by (built):* the number is cleared when it leaves the group (2.2; `profileSettle`).
  - *The end user's age, A1 (end user) (2.4, built 2026-11-08):* asked in the end user's part where the Segment has an end user, held to the Segment's end-user stage (doc 35, End user, 1: Baby 0 to 2, Child 3 to 10, Teenager 11 to 17, then the adult terms), not to the buyer's age group; cleared when it leaves the stage; saved as `user.questions.a1`.
  - *Read by (not built yet):* the online-consent ages for under-18s (the Review); the proposed Profiles (one for each age term of the group).

### A7. Who does this person live with?

*Added (owner, 2026-11-03), built.* Asked before the work, after the age.

- **Control:** one choice (a radio).
- **Asked when:** the Segment's buyer is people (B2C), and not where the Segment's age group is only Minors; on a Proxy or Dual-Intent Segment, of the buyer (the buyer's household), and again of an adult end user in the end user's part, A7 (end user) (2.4).
- **Order (2026-11-09; an order, never a lock):** the buyer's households of the relationship first: Parent or guardian, With a partner and children and Single parent with children; Spouse or partner, With a partner and With a partner and children (`profileOptionsShown`).
- **Options** (the ONS household types, Census 2021, household composition 8a, in plain words) [DEM-14]:
  - Alone
  - With a partner
  - With a partner and children
  - Single parent with children
  - With parents / relatives
  - With friends / housemates
- **The "i" says:**
  - Based on: household types (ONS, Census 2021).
  - Children: children living at home. With parents / relatives includes several generations under one roof.
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
- **The "i" says:**
  - Based on: the ISCO-08 major groups (ILO).
  - Professional: for example a teacher, nurse, engineer or lawyer. Skilled trade: for example an electrician, plumber or chef.
  - Someone who owns and runs a business: Manager / director. Armed forces: choose the group that fits the role.
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
- **The "i" says:**
  - Based on: the seniority levels B2B platforms use (LinkedIn), merged into five.
  - Senior executive: the chief executive, a C-level or a vice president. Trainees and interns: Specialist / team member.
  - It starts the role in buying: an owner or senior executive makes the final decision; a specialist uses it.
- **Saved answers:** a B2B Profile's kind of work saved before reads as a level: Owner to Owner / partner, Manager to Manager / team lead, the others to Specialist / team member.
- **Connections:**
  - *Read by (built):* A5's starting value (Owner / partner or Senior executive: Makes the final decision; Specialist / team member: Uses it); the documents and the exports.
  - *Read by (not built yet):* the Review ("nobody makes the final decision"). The proposed B2B Profiles (2) tick A5 directly and do not set the level.

### A4. Which kind of business is it?

- **Control:** one choice (a radio, or the existing picker where the list is long).
- **Asked when:** the Segment's buyer is a business and its industry is answered.
- **Options:** the level-2 list (doc 34, 5.4) of the Segment's industry, each with its example.
- **The "i" would say:** The finer kind of business within the Segment's industry. If the customer fits another kind, that is another Segment.
- **Connections:**
  - *Comes from:* the Segment's sector and industry; the country's crosswalk (doc 34, 5.3).
  - *Read by (not built yet):* the industry pack's examples for this customer; competitor industry overlap.

### A5. What is this person's role in buying?

- **Control:** ticks, as many as apply.
- **Asked when:** the Segment's buyer is a business, or it has an end-user part (its own relationship's buyer is Proxy or Dual-Intent: a B2C Direct Segment is not asked because the B2B buyer is a Proxy one; owner, 2026-11-08), or its age group includes Minors.
- **Options:**
  - Uses it
  - Influences the decision
  - Places the order
  - Makes the final decision
  - Controls who reaches the decision-maker
- **The "i" says:**
  - The five buying-centre roles credited to Webster and Wind (1972) [CHN-02].
  - "Uses it" is the person who uses the offering day to day; the one who pays and the one who decides can be other people.
- **Connections:**
  - *Comes from:* the Segment's decision authorisation and end-user part. **Starts:** every role where one person decides; on a Proxy Segment, Places the order and Makes the final decision; on a Dual-Intent Segment also Uses it (2026-11-09).
  - *Read by (not built yet):* the Review (nobody makes the final decision); context on the Customer Engagement page. Map: [what each later page reads](../../specifications/business-system/README.md#what-each-later-page-reads-from-page-1-owner-2026-11-08).

### A6. Specialised needs

*Moved from the Segment card (owner, 2026-11-01); the words are the owner's.* Behind one optional tick, **Add specialised accessibility or caregiving profiles**, a block of four questions.

**A6a. Do they have specific accessibility or user needs?** One choice: Standard needs; Temporary needs; Permanent needs. *"i":* Temporary: short-term limitations, for example healing from surgery or acute medical recovery. Permanent: long-term or progressive conditions that affect the tools they use every day. Choosing temporary or permanent opens the functional categories.

**A6b. What is their primary functional limitation category?** Ticks. Asked when the needs are temporary or permanent. Options: Physical and mobility needs; Sensory needs; Cognitive and neurodivergent needs. *"i":* Motor coordination and fine motor limitations; visual impairments, hearing loss and sensory sensitivities; ADHD, autism and age-related slowing. Select all that apply, so that the later parts can adapt the accessibility of what you offer, digital and physical.

**A6c. Do they balance high-intensity caregiving or family life roles?** One choice: No primary caregiving responsibilities; Yes, primary childcare provider; Yes, primary eldercare provider; Yes, specialised care provider; Yes, "Sandwich Generation" provider. *"i":* A parent or legal guardian of minors; ageing parents or senior relatives; a spouse, sibling or child with permanent needs; balancing children and elders at once. The person mainly responsible for daily care and lifestyle choices; "Sandwich Generation" flags extreme time poverty across several generations of one household.

**A6d. What is their household or caregiving structure?** Ticks, up to 2. Asked when A6c is any "Yes". Options: Single-parent / Solo-caregiver household; Multigenerational household; Co-caregiver / Shared support. *"i":* Choose up to two. A multigenerational household shares care with the extended family; co-caregivers share the load with a partner or professional aides.

- **Connections (A6):**
  - *Comes from:* the tick; each question the answer above it.
  - *Read by (not built yet):* flags the owner's text asks for, kept as a thought (doc 33, section 15, row 6): a solo or single-parent household raises a time-poverty and churn-risk note in a customer journey; sensory or physical needs raise a "compliance validation required" badge on an Offering. They would only highlight, never decide. Map: [what each later page reads](../../specifications/business-system/README.md#what-each-later-page-reads-from-page-1-owner-2026-11-08).

## 4. Box B. Psychographics

### A8. How comfortable is the end user online? (the end user's part only)

*Added (2.4; owner, 2026-11-08).*

- **Control:** a rating from 1 (Uneasy) to 5 (Confident), the `RatingScale` of the Segment's own comfort question.
- **Asked when:** the Segment has an end user who is not a Baby (as the Segment's End user, 8).
- **Starts:** the Segment's End user, 8, a starting value the App User can change.
- **The "i" says:** how easily they use websites, apps and online payment; that the Segment's answer starts it.
- **Saved as:** `user.questions.comfort` on the Profile. *Read by (built):* the export, in the end user's part.

### B1. What matters most to this person?

*One phrase for the three questions of list L1 (owner, 2026-11-08, P10): B1, the Competitor's K8 ("How do they do on what matters most to your customers?") and the Offering's O4 ("Which of what matters most to your customers does it do best?").*

- **Control:** ticks, up to 5, then a rating of each ticked value from "Optional" to "Essential" (`RatingScaleGroup`, `selectable`; section 11, built 2026-11-04).
- **Asked when:** always.
- **Options:** the list L1 (doc 34, 5.2):
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
  - 1 = Optional, 5 = Essential.
  - What they weigh when choosing between offers. Tick up to five, then rate how much each matters.
  - For example, a busy parent may weigh Speed and Convenience; a collector, Quality.
  - Affordability: a price they can pay. Convenience: easy to find, buy and use. Reputation: a name they trust. Expertise: deep knowledge.
  - Personalisation: made just for them. Safety / security: low risk, nothing goes wrong. Values: it stands for what they believe in.
  - Write their interests, lifestyle and hopes in the note.
- **Connections:**
  - *Read by (built, 2026-11-05):* the Competitor's K8 shows every value of L1, those ticked here first, the highest rated first, each banded by how many Profiles ticked it, and its K10 weighs each value by its rating here (doc 41).
  - *Comes from:* nothing.
  - *Read by (built, 2026-11-07):* the Value Proposition's open items, Unmet value and Unwanted benefit (B1 against the Offerings' O4, doc 42, 2).
  - *Read by (not built yet):* the Review (against the Offering's benefit and the positioning). (The draft sentence does not read B1: its benefit is O4's, doc 42, 1.)

## 5. Box C. Social & Interest Hubs

What the Segment cannot say: which social media, which communities, which events (the devices, C1, are asked in Box D since 2026-11-08). The Segment asked where they discover new products in general; these name them.

### C2. Which social media does this person use?

- **Control:** ticks, as many as apply.
- **Asked when:** unless the Segment's online comfort is rated 1, Uneasy (doc 35; built 2026-11-04).
- **Options:** the social media channels the app already lists; Other opens a text box under the options, where the App User writes their own, and its words are kept as the answer. (Not built: the ones related to the Segment's ways of discovering ideas, creators, communities and algorithmic discovery, would come first.)
  - Instagram
  - Facebook
  - LinkedIn
  - YouTube
  - TikTok
  - Pinterest
  - X (Twitter)
  - Other
- **The "i" says:**
  - The platforms they actually use, if any.
  - Tick Other to write another.
- **Connections:**
  - *Comes from:* the Segment's discovery ways and online comfort.
  - *Read by (not built yet):* the order of the Discover channels (page 2); the Profile's hubs. Map: [what each later page reads](../../specifications/business-system/README.md#what-each-later-page-reads-from-page-1-owner-2026-11-08).

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
- **The "i" says:**
  - Where they ask, read and recommend.
  - Write the names of the groups in the note.
- **Connections:**
  - *Comes from:* the Segment's discovery ways.
  - *Read by (not built yet):* the Discover channels; the Profile's hubs. Map: [what each later page reads](../../specifications/business-system/README.md#what-each-later-page-reads-from-page-1-owner-2026-11-08).

### C4. Which events does this person attend?

- **Control:** ticks, as many as apply.
- **Asked when:** a people Segment's social environment is a mix of online and in person, or mostly in person; a business Segment's Profile always (a business Segment is not asked how it socialises; owner, 2026-11-08).
- **Options:** the in-person channels the app already lists as events; Other opens a text box under the options, where the App User writes their own, and its words are kept as the answer. A business Segment's Profile is not offered Market / pop-up, a consumer's event (owner, 2026-11-08); the list has no networking option, so a networking event is written under Other:
  - Market / pop-up
  - Trade fair / exhibition
  - Workshop / class
  - Talk / conference
  - Other
- **The "i" says:**
  - The kinds of events a typical person of the Segment goes to.
  - Write the names of the events in the note.
- **Connections:**
  - *Comes from:* the Segment's social environment.
  - *Read by (not built yet):* the In Person channels on page 2; the Profile's hubs. Map: [what each later page reads](../../specifications/business-system/README.md#what-each-later-page-reads-from-page-1-owner-2026-11-08).

## 6. Box D. Information & Shopping Habits

C1 opens the box (owner, 2026-11-08, P8): the devices they find and buy on are a shopping habit, not a place they meet; the code stays C1 (doc 44).

### C1. Which devices does this person use?

- **Control:** ticks, as many as apply.
- **Asked when:** always.
- **Options:** the list L15 (doc 34, 5.2); Other opens a text box under the options, where the App User writes their own, and its words are kept as the answer:
  - Smartphone
  - Laptop / desktop
  - Tablet
  - A shared / public device
  - Other
- **The "i" says:**
  - The devices they use to find and buy.
  - The Segment's choice of where they buy starts this; change it freely.
- **Connections:**
  - *Comes from:* the Segment's where they buy: the setting starts it (Online, on a phone: Smartphone; Online, on a computer: Laptop / desktop; In a shop: none; Both online and in shops: Smartphone and Laptop / desktop), as a starting value the App User can change.
  - *Read by (not built yet):* the Review (make the order and the forms work on a phone; a note where the devices ticked leave out the one the Segment buys on).

### D1. How does this person compare options?

- **Control:** ticks, as many as apply.
- **Asked when:** unless the Segment buys "On impulse" (was "Straight away", the id `impulse` kept) or "When they urgently need it" (2026-11-08: neither compares options first).
- **Starting values:** "After comparing options" starts Online reviews / ratings; "On a recommendation" starts Word of mouth / referrals (the App User can change them). "Out of habit" (2026-11-08) asks D1 with no start: a routine rebuy names no way of comparing.
- **Options:**
  - Your website
  - Online reviews / ratings
  - A demo / trial / sample
  - A quote / proposal
  - Word of mouth / referrals
  - Comparison sites
  - A meeting / call
- **The "i" says:**
  - How they weigh options before choosing.
  - How they pay and where they buy are the Segment's questions.
- **Connections:**
  - *Comes from:* the Segment's path to purchase.
  - *Read by (not built yet):* the Evaluate channels (page 2). Map: [what each later page reads](../../specifications/business-system/README.md#what-each-later-page-reads-from-page-1-owner-2026-11-08).

### D2. How much help does this person want before buying?

- **Control:** one choice (a radio).
- **Asked when:** always.
- **Options:**
  - Works it out alone
  - Likes a little guidance
  - Wants to talk to a person
  - Needs a formal demonstration or proposal
- **The "i" says:**
  - The help a typical person wants before buying; it can differ from how comfortable the Segment is online.
- **Connections:**
  - *Comes from:* the Segment's online comfort. **Starts:** Formal procurement (Segment, Box 4, 9) starts Needs a formal demonstration or proposal; else the online comfort (4 or 5, Works it out alone; 1 or 2, Wants to talk to a person); else, with no other start, D1 (2026-11-09): A demo / trial / sample or A quote / proposal starts Needs a formal demonstration or proposal, A meeting / call Wants to talk to a person. A saved answer wins.
  - *Read by (not built yet):* the relationship type suggested on page 2; the Review (against the help the Offering gives). Map: [what each later page reads](../../specifications/business-system/README.md#what-each-later-page-reads-from-page-1-owner-2026-11-08).

### D3. When does this person usually buy?

*Added (owner, 2026-11-07: "Approve Decisions 2, 3, and 4 as proposed, and for Decision 1, approve Q1–Q6 with two targeted adjustments").*
- **Control:** ticks, as many as apply (optional).
- **Asked when:** the Segment's buyer is people, and not of the end user's own answers (the end user is not asked Box D).
- **Options** (L25, doc 34): Weekday daytime; Evenings; Weekends; Around seasons / holidays.
- **The "i" says:**
  - When they actually buy; the Segment's work schedule says when they work.
- **Connections:** *Read by:* the documents and the export. The habits Notes keep how they buy, in their words.

## 7. Box E. Motivations

### E1. What does this person want to achieve?

*Decided (owner, 2026-11-06): the goals list is unchanged: no Competence, no "Grow without adding staff", no "Look after someone else".*

*Changed (2026-11-08, the options-and-wording research): Governance ("Stay within the rules") merged into Compliance ("Meet a requirement"), the id `meet-a-requirement` kept and a saved `stay-within-the-rules` read as it, once, the higher rating kept (`MERGED`, `asProfileAnswers`, tested); three goals added: Efficiency ("Save time / money", `save-time-money`), Resolution ("Get a problem fixed", `get-a-problem-fixed`) and Enjoyment ("Enjoy themselves", `enjoy-themselves`). Enjoyment is a person's goal: a business Profile is not offered it (`profileOptionsOf`), and a saved tick of it there is removed. Efficiency comes back although "Save time" and "Save money" left on 2026-11-03 as repeats of B1's Speed and Affordability: the "i" keeps the two apart (a result they are after, not what they weigh when choosing).*

- **Control:** ticks, up to 3, then a rating of each ticked goal from "Minor" to "Main" (section 11, built 2026-11-04).
- **Options:** the list L4 (doc 34, 5.2), without Lower risk and Get better results (B1's Safety / security and Quality; owner, 2026-11-03):
  - Accessibility
  - Development
  - Expression
  - Compliance (Governance merged in, 2026-11-08)
  - Revenue
  - Efficiency
  - Resolution
  - Enjoyment (people only)
- **The "i" says:**
  - 1 = Minor, 5 = Main.
  - The results they are after; what they weigh when choosing goes in "What matters most". Choose up to three, then rate each.
  - For example, to learn a new craft, or to win more clients.
  - Accessibility: getting something hard to reach. Development: learning something new. Expression: showing who they are. Revenue: winning customers or income.
  - Compliance: meeting a requirement or staying within the rules, at work or by law. Efficiency: saving time or money.
  - Resolution: getting a specific problem fixed. Enjoyment: having fun or a good time.
  - Based on: gains (Value Proposition Canvas) [FUN-46].
- **Asked when:** always. *Read by (built, 2026-11-07):* the Value Proposition draft (the gains: the goal rated highest across the Segment's Profiles, in its draft phrase; doc 42, 1). *Comes from:* nothing.

### E2. What frustrates this person today?

- **Control:** ticks, up to 3, then a rating of each ticked frustration from "Mild" to "Severe" (section 11, built 2026-11-04).
- **Options:** the list L3 (doc 34, 5.2), seven frustrations (three merged on 2026-11-06):
  - Cost (Unclear prices merged in)
  - Delays
  - Hassle (was Complexity, renamed 2026-11-08; Poor support merged in)
  - Inconsistency
  - Trust
  - Skills gap (was Insecurity, renamed 2026-11-08; Fear of mistakes merged in)
  - Capacity
  - (Renamed 2026-11-08, the options-and-wording research; Complexity was also E3's word for how hard it is to use. Only the words changed: the ids `it-is-too-complicated` and `they-lack-the-know-how` are kept, so saved ticks, ratings and the draft phrases stand.)
- **The "i" says:**
  - 1 = Mild, 5 = Severe.
  - What goes wrong with the way they do it now, before they buy from you. Choose up to three, then rate how much each bothers them.
  - For example, the cheap version breaks too soon, or nobody explains how to start.
  - Cost: too costly, or unclear prices. Delays: it takes too long. Inconsistency: results vary. Trust: hard to find someone reliable.
  - Skills gap: not knowing how, or fearing a mistake. Capacity: no time or staff. Hassle: too complicated, or poor support.
  - Based on: pains (Value Proposition Canvas) [FUN-46].
- **Asked when:** always. *Read by (built, 2026-11-07):* the Value Proposition draft (the pains: the frustration rated highest across the Segment's Profiles, in its draft phrase; doc 42, 1). *Read by (not built yet):* the Review. *Comes from:* nothing.

### E4. Outcome for the end user (the end user's part only)

*Moved here from the Segment's End user, 9 (owner, 2026-11-08: "If the buyer is proxy, the profile should contain questions for both buyer and end user."; 2.4); Positioning's question 10 before that.*

- **Control:** a radio while the stage allows one choice, else ticks that lock at the limit, "2 max" beside the label: Planning 1, Launching 2, Managing 2, Growing free (Positioning's outcome limit, `choiceLimit`); a saved answer over the limit goes back to empty.
- **Asked when:** the Segment has an end user (its own buyer is Proxy or Dual-Intent), in the end user's Goals & Desires, before E1.
- **Wording (owner, 2026-11-09):** named as the rest of the end user's part, by the relationship (`profileUserName`): "Outcome for the child" (Parent or guardian), "the partner", "the person cared for", "the employee", "the client", "the person it serves" (Institution or membership body), else "Outcome for the end user"; on a Dual-Intent Segment "Outcome for a typical user", as E1 and E2. The documents keep "Outcome for the end user".
- **Options:** Enjoyment & fun; Comfort & ease; Safety & care; Learning & growth; Looks & belonging; Practical use, ordered by Positioning's purposes, then the buyer's and the end user's life stages (`userOutcomeOptionsFor`).
- **Starts:** the Segment's End user, 9 saved before, else Positioning's answer saved before 2026-11-08 (`organisation.outcomeUser`), within the stage's limit; the value saved on the Profile wins, even cleared (an empty list).
- **The "i" says:** what matters most to the end user, apart from the buyer's own reasons for paying: the result the end user gets; the meaning of each option; that the Segment's (or Positioning's) answer starts it; the stage's line.
- **Saved as:** `user.questions.outcome` on the Profile. *Read by (built):* the export, in the end user's part.

### E3. What might hold this person back?

- **Control:** ticks, up to 3, then a rating of each ticked worry from "Minor" to "Blocking" (section 11, built 2026-11-04).
- **Options:** the list L2 (doc 34, 5.2), nine worries:
  - Price
  - Credibility
  - Onboarding
  - Complexity
  - Risk
  - Fit
  - Support
  - Migration
  - Image ("What others will think", `what-others-will-think`: the social risk of buying; added 2026-11-08, the options-and-wording research)
- **The "i" says:**
  - 1 = Minor, 5 = Blocking.
  - Their doubts about buying from you; today's frustrations have their own question. Choose up to three, then rate each.
  - For example, whether a beginner can keep up, or whether you will still be there after the sale.
  - Credibility: whether you can be trusted. Onboarding: the time to get started. Complexity: how hard it is to use. Fit: whether it suits their need.
  - Support: help after buying. Migration: the work of leaving what they use now. Risk: risk or security. Image: what others will think of them.
  - Starts with the price where the Segment's household income is rated 1; change it freely.
- **Order (2026-11-09; an order, never a lock):** the worries B1's ticks point to come first, the highest rated value first: Affordability, Price; Reputation, Credibility; Safety / security, Risk; Support, Support (`profileOptionsShown`).
- **Asked when:** always. *Read by (built, 2026-11-07):* the Offering's O8 offers the worries ticked here, so it ticks those it answers (doc 43); the Value Proposition's open item "Worry left open" (doc 42, 2). *Read by (not built yet):* the Evaluation actions suggested on page 2. *Comes from:* the Segment's household income (the starting value). Map: [what each later page reads](../../specifications/business-system/README.md#what-each-later-page-reads-from-page-1-owner-2026-11-08).


**One word for each option (owner, 2026-11-06, replacing the same day's shorter words).** The ids are unchanged where an option is only renamed (`WORDS` in `ProfileQuestions.ts`); what each word means is a line of the question's "i", each within 160 characters. B1: Affordability, Speed, Convenience, Quality, Reputation, Expertise, Personalisation, Support, Safety / security, Values. E1: Accessibility, Development, Expression, Compliance, Revenue, Governance ("Competence" was suggested with no old option: not added, the owner asked); since 2026-11-08 Governance is merged into Compliance and Efficiency, Resolution and Enjoyment are added (E1 above). E2, with three merges: Cost (Unclear prices merged in), Delays, Complexity (Poor support merged in), Inconsistency, Trust, Insecurity (Fear of mistakes merged in), Capacity; a saved tick of a merged option is read as the one kept, once, the higher rating kept (`MERGED`, `asProfileAnswers`, tested); since 2026-11-08 Complexity reads Hassle and Insecurity reads Skills gap, the ids kept (E2 above). E3: Price, Credibility, Onboarding, Complexity, Risk, Fit, Support, Migration; Image added 2026-11-08. The needs: section 10.

**Wording made simpler (owner, 2026-11-05: "Improve the wording to something more simple and concise. Add extra explanations, information and details in their i").** Built in `ProfileQuestions.ts`, the ids unchanged:
- E1 "What does she want to achieve?" (was "What are her main goals?"); E2 "What frustrates her today?" (was "... about how it is done now?"); E3 "What might hold her back?" (was "What might stop her buying from you?"); the Social needs "How does she want to be seen?" (was "How does she want others to see her?").
- Kept: B1 "What matters most to her?" (five words, and the name the Competitor card's values and K10 refer to) and "How does she want to feel?" (already short).
- Each "i" now says what belongs there, how it differs from its neighbour (E1 from B1, E3 from E2), and one example, each point within 160 characters (doc 39).
- The Emotional and Social needs' notes are the shared Notes (`OptionalNote`, titled "Notes") under their ticks, one line a need, kept as the list the Value Proposition reads; what a tick already says is not repeated there (the examples trimmed). Functional stays the numbered list the Offerings pick from.

**Wording reviewed (owner, 2026-11-04: "Improve the wording on the profile card"; doc 28, section 4; doc 39).** Built in `ProfileQuestions.ts`, the ids unchanged:
- A2's "i": "Asked when the Segment's gender mix leans one way (any point but 3); it starts from the mix. Change it freely." (was two points, the second "Nothing reads it but the note", an internal fact).
- A1's "i": "One age within the Segment's age group: a typical person, as you picture them." and "If the Segment's age group changes and this age falls outside it, the age is cleared."
- B1's "i": "Tick up to five things they weigh when choosing, then rate how much each matters." and "Write their interests, lifestyle and hopes in the note." (was "... stay in the note"; the first point replaced 2026-11-05, see B1).
- C3's and C4's "i": "Write the names of the groups / events in the note." (was "... stay in the note").
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
4. **The end user's Profile skips Box D** (2.1); the payer's Profile holds how they compare and what help they want. *(Built 2026-11-08 as the end user's part of each Profile: 2.4.)*

**Answered for the App User and not shown (owner, 2026-11-01).** The same rule as the Segment's (doc 35): where the answers above leave one answer, it is set and the question is not drawn.

| Question | Set when | To |
|---|---|---|
| A3b job level | the Segment's customers are self-employed | Owner / partner (built: not asked; set, so the documents show it) |

**Starting values the App User can change (owner, 2026-11-01).** Each follows the Segment until that field is changed (another answer does not fix it), and the export and the Value Proposition read it too (built 2026-11-08). D1 and D2 start from the Segment's path to purchase and online comfort ("After comparing options": Online reviews / ratings; "On a recommendation": Word of mouth / referrals; online comfort rated 4 or 5: Works it out alone; rated 1 or 2: Wants to talk to a person); D2 starts at a formal proposal where the Segment's decision includes a formal procurement loop; A2 starts from the Segment's gender mix when it leans (60 to 80%) or is mostly (80%+) one way, and stays visible; C1 as in 5. A Segment that buys "On impulse" or "When they urgently need it" skips D1 (2026-11-08). A5 starts with all five roles ticked where the Segment's "Who decides to buy?" includes "One person decides" (which is all it offers for a self-employed customer). **E3** starts with "Price" ticked where the Segment's household income is rated 1, a starting value the App User can change without any validation in the way (owner, 2026-11-01).

**One list for the kinds of work.** A3 and the Segment's end-user question ("What kind of work do your end users do?") take the same nine groups, written once (`JOB_LEVELS`, `SegmentQuestions.ts`), so the words never differ between the two cards or the exports.

**The devices (C1) stay a starting value and a Review note, not a rule.** The Segment's "where they buy" starts C1 (a store: no device; the phone: Smartphone), and the Review notes a contradiction, but C1 is never unticked for the App User: a shopper who buys in a store still finds the shop on a phone. A tendency never removes an option.

**Also decided (owner, 2026-11-01).** A5 is asked only for a business buyer, a Segment with an end-user part, or a group that includes Minors (2.1); an end user's Profile is deleted completely when its Segment loses its end user (2.2).

**Not built.** A4, A6, the proposed Profiles other than the B2B ones by buying role (2), and the reads marked "not built yet", which are built when the Segment's are. (The end user's own Profile is built as the end user's part of each Profile, 2.4.)

## 10. The Needs as choices (decided, 2026-11-03)

The owner asked (2026-11-03) whether the three Needs lists could be choices instead of texts. **Decided (owner, 2026-11-03): Functional stays text; Emotional and Social become ticks**, each with the list's own text kept as the note. This replaces 9.3 for Emotional and Social and is the one place the Needs are decided. **Built (2026-11-04):** each kind's list is a question (`emotional` and `social` for people, `emotional-b2b` and `social-b2b` for a business buyer, `ProfileQuestions.ts`), ticked up to 3 and each tick rated from "Mild" to "Strong" (as the Motivations are, section 11: up to 3 keeps the Value Proposition's first needs few); the numbered lists stay as the notes, so the Offering and the Value Proposition read what they read before.

**Functional (N1): ticks above the numbered list (owner, 2026-11-07: "Approved. Please go ahead and write the updated specification sections"; built the same day, "Update the app").** This updates the decision of 2026-11-03 that Functional stays text. Above the numbered list of the customer's own tasks, which stays as built, the Profile asks "What kind of job do they need done?": tick boxes from L17 (doc 34, 5.2c: Organisation; Integration; Connection; Information; Variety), up to three, each rated 1 to 5 from Mild to Strong, the same Rating Scale as the Emotional and Social needs. Each tick's meaning is a line of its "i". The numbered list keeps the specifics in the customer's words ("Send an invoice in under a minute"), under the question "What does she / he / this person want to achieve?" (owner, 2026-11-10, 18:25: "Make the What is she trying to get done? question to What does she want to achieve?"; the same words as the Goals question, E1, which asks for outcomes as ticks, while this list asks for the tasks in the customer's words; before it, "What is she trying to get done?" (owner, 17:23: "use something as human voice and make it flow naturally as a question"), "Tasks she wants done", and first "Their own tasks" (owner, 2026-11-10: "I was talking about the list text"): the Value Proposition Canvas's customer jobs are the practical tasks a customer is trying to get done, written in their words; its "i" asks for one task a line, a verb first, in their words, says the Offerings tick these lines, and cites Value Proposition Design, 2014); the Offering ticks those lines (doc 43), and the categories are read from the Profile, not ticked again. **As built:** the question `functional` (`ProfileQuestions.ts`), asked of every Profile, people or business; each line of the list has an id (`needs.functionalIds`, `AnswerBusinessFoundation.ts`), kept through edits (`reconcileLineIds`), made from the words for a line saved without one (`functionalNeedId`); the examples tick one to three jobs for each Profile. Both are kept because a list alone is too general (a bakery and an accounting firm have different tasks) and text alone cannot be matched (doc 42, "Unanswered need").

**Why Functional stayed text (2026-11-03, kept as the record).** A functional need is the task itself ("send an invoice in under a minute"), different for every business, so no list fits it. A general list (saves time, simplifies, reduces cost, reduces risk) would ask again what B1 and E1 already ask: L1 is those functional values in the app's words (doc 34). The Offering keeps ticking the functional needs it addresses, by entry, as built. The owner's idea (2026-11-03): a list of functional jobs serves instead to compare an Offering with a Competitor, so it is asked there, not here: L17 (doc 34), doc 43 O13, proposed. (Doc 41's job question was withdrawn on 2026-11-04 as an Offering question.)

**Why Emotional and Social can be ticks.** How people want to feel, and how they want to be seen, falls into a short set that holds across businesses. Bain's *Elements of Value* names it from surveys of 10,000 consumers [FUN-48] and of business buyers [FUN-49]. The lists below are those elements in plain UK words, cut to what a small business can deliver.

**Emotional (N2 for people, N3 for a business): "How do they want to feel?"** Ticks, up to 3. The options follow the Segment's kind (doc 35, the buyer type).
- People (B2C): Calm; Rewarded; Nurtured; Entertained; Attractive; Healthy; Delighted; Nostalgic; Motivated; Hopeful; Fulfilled; Proud.
- **Proud** (added, owner 2026-11-07: "create an option that would work as an umbrella to include all the similar feelings"): a sense of self-worth or achievement in what they own or made. None of the eleven held it: Rewarded is being treated, Fulfilled is growing as a person, Delighted is how it looks. Desmet's 25 positive emotions in human-product interactions name pride as one, "an enjoyable sense of self-worth or achievement", taking in self-satisfaction and triumph [FUN-72]. Id `proud-of-what-they-own-or-made`. The example: the Considered Nester's Note "Pride in owning something handmade" is now the tick Proud (rated 4; her third tick, so nothing was swapped), and the Note is empty.
- Business (B2B): Confident; Glad to work with you; Prosperous; Optimistic; Inspired.

**Social (N4 for people, N5 for a business): "How do they want to be seen?"** Ticks, up to 3.
- People (B2C): Stylish; Included; Exclusive; Altruistic; Impactful.
- Business (B2B): Trusted; Influential; Respected; Responsible.

**The "i" says:** what 1 and 5 mean (1 = Mild, 5 = Strong); the feelings (or ways of being seen) that decide whether they buy, up to three, each rated; one example; what each word means ("Rewarded: treated to something special", "Nurtured: looked after", "Delighted: by how it looks", "Nostalgic: reminded of good times", "Fulfilled: growing as a person", "Proud: a sense of self-worth or achievement in what they own or made (Desmet's 25 product emotions, 2012)"; "Confident: sure they made the right choice", "Prosperous: growing in their work", "Optimistic: hopeful about their business"; "Included: part of a group they value", "Exclusive: one of the few with access", "Altruistic: caring for others or the planet", "Impactful: leaving a legacy"; "Influential: well connected", "Respected: valued in their field"); Bain's Elements of Value (HBR, 2016 and 2018). One word each (owner, 2026-11-06), the ids kept.

**Asked when:** always. **Connections:** *Comes from:* the Segment's kind (the list). *Read by (built, 2026-11-07):* the Value Proposition tile lists the needs ticked on the Segment's Profiles under Emotional Needs and Social Needs, each once, the strongest first, then the lines of the Notes (doc 42; `segmentNeedTicks`). *Read by (not built yet):* the Value Proposition's open items, their one owner (owner, 2026-11-06) (doc 42, "Unanswered need" and "Emotional and social needs").

**What changes for saved work.** Nothing is lost: a Profile's emotional and social texts become the notes of the two questions, and the ticks start empty. The Offering's ticks of functional needs are untouched.

**The option words:** decided, one word each (owner, 2026-11-06).

## 11. Psychographics and Motivations ticked and rated (owner 2026-11-04; built 2026-11-04)

The owner asked that B1 (Psychographics) and E1 to E3 (Motivations) use both ticks and the five rounds: the App User ticks what applies, then rates each ticked item (`RatingScaleGroup` with `selectable`, doc 21). The ids, the lists and the saved ticks stay; an existing tick starts unrated. **As built:** the ratings are kept as `<id>-rating`, one "option:point" each (`ProfileQuestions.ts`); an untick takes its rating with it; the documents and the exports print each tick with its rating, the highest first ("Speed (5/5); Affordability (3/5); Support").

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
| B2C identity or lifestyle (fashion, handmade crafts) | Values, Quality and Personalisation lead; three or four | 4 |
| B2B small-business buyer (the owner buys) | One person weighs price, ease, support and trust | 4 |
| B2B corporate buying group | Each Profile is one role (A5): its concerns are narrow | 3 |
| Public sector or charity | Rules, safety, value for money and trust: several are required at once | 5 |
| Niche hobby market | Expertise, Quality and Values: few and strong | 3 |
| Mass market | Price, ease and trust: few | 3 |

**The rule.** With a rating, no limit is needed to rank: the rating does the ranking. A cap still keeps a Profile focused and readable, and a long list of ticks says less, not more. The scenarios need three to five for what matters (B1) and never more than three for goals, frustrations and worries, whose first items are what the Value Proposition and the Offering read. So: **B1 up to 5; E1, E2 and E3 up to 3**, the same in B2B and B2C (a corporate group's narrower Profiles simply tick fewer). **Decided (owner, 2026-11-04): "The limits are fine."** Five stays within the span a person can hold and compare at once, "somewhere in the neighborhood of seven" (Miller, 1956) [FUN-66]; a more involved buyer searches more (Zaichkowsky, 1985) [FUN-67], which is why a considered purchase needs more than the everyday three.

**What the ratings feed.** Built: B1's ratings weigh the Competitor's K10 (doc 41); B1 → the Competitor's K8 (its rows ordered by the Profiles' highest rating, banded by how many tick each); E1 → the Value Proposition draft's gains and E2 → its pains, the goal and the frustration rated highest first (doc 42, 1; built 2026-11-07). Not built yet:
- B1 → the Value Proposition draft (doc 42): the value rated highest comes first. (As built, the draft's benefit is the Offering's O4; B1 feeds the open items.)
- E2 → the Review.
- E3 → the Offering's O8 (doc 43): the worries rated highest first; a "Blocking" worry no Offering answers is a Review item.
