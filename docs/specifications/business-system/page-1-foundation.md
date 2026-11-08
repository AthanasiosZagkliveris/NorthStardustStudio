# Business System — Page 1: Foundation

Status: **specification**, written 2026-09-27, updated 2026-11-08. The text from "Describe and implement" on is the owner's requirement as given (its wording is used exactly); "As built" says how the app draws it today.

> **3. Business System — Page 1 of 5.**
> Pages: **1. Foundation** · 2. Customer Engagement ·
> 3. Infrastructure & Capability · 4. Financial Foundation ·
> 5. Financial Sustainability

## As built

The four columns below are four **tiles**, drawn two by two in one frame for each Customer Segment (the frame's title is the Segment's name, typed there; a Segment is added with "+ Add Segment"):

| Requirement column | Tile in the app | What it opens |
|---|---|---|
| 1. Customer Segments and Profiles | **Segment Description** (listing its Profiles) | The Segment card: its boxes, each asking choice questions, then the section Profiles as small tiles; a Profile is a card that floats over the tile |
| 2. Competitors and Alternatives | **Competitors** | The Competitors as small tiles; each is a card |
| 4. Offerings | **Offerings** | The Offerings as small tiles; each is a card |
| 3. Value Proposition | **Value Proposition** | The one text of the Segment |

The tile order in the frame is Segment Description, Competitors, Offerings, Value Proposition (owner, 2026-11-08: the Offerings before the Value Proposition, which is drafted from them); the page numbers its subsections in that order (1. Customer Segment and Profile, 2. Competitor and Alternative, 3. Offering, 4. Value Proposition).

**What the page asks.**

- The Segment card keeps the five Description parameters below as five boxes, each with its title, its text (the owner's wording), its choice questions and its Notes. Business Data is never optional: a Segment is one group, of people or of businesses. Where Identity chooses both B2C and B2B, the page makes two Segments, the first of people and the second of businesses; a Segment added after them asks "Who is this Segment's customer?". Every question, option and "i" of the Segment card is in doc 35 (`design/questionnaire/35-segment-questions.md`).
- The Profile card keeps its Name and the owner's boxes and asks choice questions in them. Every question, option and "i" of the Profile card is in doc 36 (`design/questionnaire/36-profile-questions.md`), which also says which questions are not built yet.
- The design behind the questions, and the Competitor, Value Proposition and Offering cards, are in doc 28, 6.3 to 6.8 (`design/questionnaire/28-questionnaire-specification.md`).
- The floating cards share one pattern (`ai/tile-and-card-pattern.md`).

The figures of the requirement (one primary Segment, a maximum of 2; up to 3 Profiles each) are **advice** given in the guidance: the Add buttons are always offered and nothing is cut off. A Competitor's Type options read in the singular ("Direct competitor"). The older four-column drawing is in the code (`BusinessFoundationEditor` without `asTiles`) but the app does not use it. The open requirements for this page are in document 5, section 5.5.3.


