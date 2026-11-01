# 40. The help texts: what an "i" says, by place and by field

Status: **proposal**, written 2026-11-01, updated 2026-11-01. What the 159 help texts of the app are today, what is written about them (little), and a proposed structure for the "i" of each kind of place and field, with the standard phrases, the size budgets and a way to check them.

Related: doc 22 (the generated list of every help text, from the running app), doc 28 (section 4, the plain wording, and 4.1, the rules for writing questions), docs 36, 38 and 39 (what the "i" of the Segment, the Organization and Positioning say today), doc 21 (the `InfoNote` component), `docs/ai/layout-rules.md` (how the "i" looks and where it opens), `docs/specifications/business-system/page-1-foundation.md` (the owner's texts, which stay).

## 1. What is written today

**There is no document on what an "i" should say.** What exists:

- Doc 28, section 4: *"Every question has a one-line help under the "i" saying what the question is for. A connection that rests on evidence adds one evidence line"*, no jargon, speak to "you" and say "they" for the customer, one idea per question. Section 4.1 holds rules for writing the questions themselves.
- The layout rules say how the "i" looks (the ring and the letter in the card's tint), where it stands (glued to the last word of its label, 6px after it) and where its panel opens (portaled to the dialog's overlay, so nothing clips it). They say nothing of its content.
- The specifications hold the owner's texts (the column instructions, the prompts of a Description's boxes), with the rule *"must be used exactly as provided"*.
- Doc 22 lists what the app draws, and counts it. It does not judge it.

So the content of an "i" has been decided field by field, by whoever wrote the field.

## 2. What the 159 help texts are (doc 22, the Quillfield example, 1920px)

| | |
|---|---|
| Help texts | 159 (66 in tile dialogs, 46 on floating cards, 47 on pages) |
| Median length | 173 characters; 3 points; the 90th percentile is 747 characters and 7 points |
| Over 500 characters | 31 (the longest: Typography 1,740 characters and 15 points; Colours 1,571 and 22; Social Media 1,487 and 13) |
| Over 8 points | 14 |
| One point only | 49 |
| Begin with a question | 47 (the owner's prompts: "What do they sell or provide?") |
| Carry a source line ("Based on", "Source") | 20 |
| Identical text under different labels | 10 (the same line repeated for each of several fields) |

By place, the median is 245 characters in a tile dialog, 74 on a floating card (mostly one sentence) and 180 on a page.

**Five kinds of text are mixed together:**

1. **A prompt**: the question the field asks, in the owner's words ("Where do they live, work or operate?").
2. **An instruction**: what to do ("Divide your Target Audience into segments…").
3. **A definition of the options**, as one long paragraph or a run of "Option: meaning" lines.
4. **Guidance with a reason**: why the field is asked and what it changes.
5. **A source line**: where the idea comes from.

**What goes wrong:**

- A text that holds all five is 1,500 characters long and cannot be scanned; one that holds only a prompt says nothing the label did not.
- Option meanings sit inside one point, so the reader cannot find the option they are on.
- The same opening is worded in several ways ("Choose one", "One answer", "Pick the one that fits").
- Internal words leak: stage names, "locked", "frozen", "tile".
- A text goes stale when the field changes (the Demographics prompt still asked for an "age range" and an "income range" after the box asked an age group and a household income).
- Repeated lines say the same thing under several labels, so nothing says what is special about each.

## 3. The proposal

### 3.1 Principles

1. **An "i" answers one question: "what do I do here?"** It is read by someone about to answer, once, in a few seconds.
2. **It says what is true now.** No feature that is not built, no "will". What a later part will do with the answer is not help for answering; it goes in the design documents (the *Connections* of docs 36 to 39), with one exception: one short line that says *what the answer changes now*, where it changes something the user can see.
3. **It never repeats its label or its options.** If the label says "How comfortable are they with online tools?", the "i" does not say "Choose how comfortable they are".
4. **Details go in the "i", not in the label or the option.** An option says its few words; what is added in brackets, after a colon or as an example stands in the question's "i", under the option's name (rule of 2026-11-01, doc 36).
5. **The owner's texts stay, and come first.** A prompt or an instruction written by the owner is the first point, word for word; anything added is a separate point after it.
6. **One idea per point; a point is a sentence or two.**

### 3.2 The structure of the "i" of a field or question

In this order; a point that has nothing to say is left out.

| # | Point | What it holds | Example |
|---|---|---|---|
| 1 | **What it asks** | One sentence: what the question is for, in the user's words (or the owner's prompt) | "How steady their pay is, not how much it is." |
| 2 | **How to answer** | The rule of the control and what to do when it does not fit | "Choose up to three." / "If they are in more than one place, make another Segment." |
| 3 | **What it changes now** | One line, only where the answer changes what the user sees | "The age groups offered follow the life stage chosen in Positioning." |
| 4 | **Option notes** | One line per option that needs one, "Option: meaning", at most six; the ranges, examples and brackets taken out of the options | "Direct Buyers: purchasing exclusively for their own personal use." |
| 5 | **Source** | Last, only where the idea or a figure rests on evidence: "Based on: …" (the reference id, doc 02) | "Based on: the buying-centre roles of Webster and Wind (1972)." |

### 3.3 The "i" of each kind of place

| Place | What its "i" holds | Size budget |
|---|---|---|
| **A question or field label** (a radio, ticks, a number, a date, a picker) | the structure above | 3 points and the option notes; **a point of at most 160 characters** (owner, 2026-11-01) |
| **A group of questions** (the box of a Description, a section of a tile: Demographics, Purchasing Power & Behaviour) | the owner's prompt first; then what the group asks **of whom**, and what its questions follow (the answers they follow, the stage) | 3 points, each at most 160 characters |
| **A tile or a card title** (Segment Description, Early Positioning, an Offering) | the owner's instructions first; then, in one point, how the questions inside it come and go | the instructions plus 1 point |
| **A column or page instruction** | the owner's text, as it is | as written |
| **An option** | none: its meaning is a line in its question's "i" | none |
| **A list the user builds** (the Needs, a list of channels) | what one line is ("a need is a precise statement"), one example, how many | 2 points |
| **A table's column or row title** | what the column holds, and its unit | 1 point |

Anything over the budget is split: the first part stays in the "i", the rest moves to the documents or becomes a second, nested group "i".

### 3.4 Standard phrases

The same situation is worded the same way everywhere.

| Situation | Phrase |
|---|---|
| One choice | "Choose one." (left out where the control is a radio and nothing else needs saying) |
| Several, with a limit | "Choose up to three." |
| Several, no limit | "Select all that apply." |
| Optional | "Optional." |
| It does not fit one group | "If it is more than one, make another Segment." |
| An option's meaning | "Option name: what it means." (one line) |
| The answer changes what is offered | "The … offered follow …" |
| An answer is removed with another | "A question that no longer applies is not asked, and its answer is removed." |
| An approximate figure | "The ages are approximate (~)." |
| A source | "Based on: …" |
| The owner's text with an addition | the owner's text; the addition in a separate point |

Words to avoid in an "i": *tile, card, locked, frozen, driver, check, Segment frame* (say what the user sees), stage names without saying what they mean once on the page that sets them (the Opening Date's "i"), and any word of a feature that is not built.

### 3.5 Worked examples

**Before** (Demographics, the owner's prompt, as it stood): *"What are their age range, education level, and income range?"*; nothing else.
**After:** *"What are their age group, education, work situation, household income and gender mix?"* then *"Asked when the customers are people. The age groups offered follow the life stage chosen in Positioning, and the questions that do not apply to minors are not asked of them."* then *"Choosing an age group starts the work situation with the one that goes with it, which you can change."* Three points, the first the prompt, none repeating a label.

**Before** (a long definition, 1,700 characters in one block): the Typography text.
**After:** the first sentence (what the Text Hierarchy is for) and how to fill it, three points; each level's meaning becomes one line "Level: meaning"; the rest moves to the documents.

**Option notes.** A radio "Mostly men / Leans men / Balanced mix…" keeps its words; the shares (80%+, 60 to 80%, 40 to 60%) are lines "Leans men: 60 to 80%." in the question's "i".

### 3.6 How to keep them right

1. **When a field changes, its "i" changes in the same commit.** A pull request that changes a label, an option or a condition lists the "i" it touched (add to `docs/ai/review-checklist.md`).
2. **The walk of doc 22 is the check.** It already measures each text. Flag, in the generated list: a text over its budget, a text with more points than its place allows, two labels with identical text, a text with a word of the avoid list. Today's flags would be the 31 over 500 characters, the 14 over 8 points and the 10 identical texts.
3. **A stale prompt is a defect.** The owner's texts are changed only with the owner; the review lists the ones that no longer match what is asked (found on 2026-11-01: Demographics and Purchasing Power & Behaviour, and the Segment's first instruction against the stage limits; all three were reworded with the owner's word).

## 4. Decided (owner, 2026-11-01), and what was built

1. **The size budget** is a point of **at most 160 characters**, for every place.
2. **When texts are rewritten:** only when their field is next changed, one component at a time; the 31 over-long texts are not rewritten in one pass.
3. **The avoid list** (an industry code, or a jargon acronym, in the text; the internal words) is built as a check on the walk of doc 22.
4. **The standard phrases** stand as in 3.4: short, active fragments ("Choose the primary group that pays, not the one that uses it.").
5. **The check lists warnings only; it never fails.** Doc 22 has a *Warnings* section (a point over 160 characters, the same text under several labels, an industry code, a jargon acronym, an internal word), written by `help-texts-doc.mjs`; the docs check does not read it.

Nothing in this document is open except the first rewrite of each text, which waits for its field.

**The questions as they were put (for the record):**

1. **The budgets** (about 300 characters and 3 points for a field, 350 for a group): confirm, or set others.
2. **"What it changes now"** as a point of its own, and the rule that future reads do not belong in an "i" (they stay in the documents).
3. **The 31 long texts** (Typography, Colours, Social Media and others): should they be rewritten to the structure now, or only when the field is next changed?
4. **The avoid list** and **the standard phrases**: confirm, or change.
5. **The lint** of doc 22 (the flags of 3.6): should the walk fail on them, or only list them?
