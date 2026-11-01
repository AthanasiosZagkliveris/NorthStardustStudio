# 41. The tile documents: the form, and where each tile stands

Status: **proposal**, written 2026-11-01, updated 2026-11-01. The form every document about a tile or a card takes (so that one can be read like the others), the list of the tiles and the document each one has, and what is still missing.

Related: doc 36 (the Segment), doc 37 (the Profile), doc 38 (the Organization), doc 39 (Positioning), doc 40 (what an "i" says), doc 28 (the design these documents refine), doc 21 (the shared components).

## 1. The form

A tile document is **one document for one tile or card**, in this order:

1. **The head:** the title ("The X: every question and option, as built" or "as proposed"), the status line (specification where it is built, proposal where it is not), a *Related* line.
2. **What the tile is:** where it stands, how it is laid out (the columns, the bands, the groups), the controls it uses (existing ones only) and what makes a question appear or leave.
3. **One section for each box or group**, and in it **one entry for each question or field:**
   - the question as the user reads it (the heading);
   - **Control:** one choice (a radio), ticks (with the limit), a number, a date, a picker, a text box;
   - **Asked when:** the conditions, from Identity and from the tile's own earlier answers;
   - **Options:** the words of each option (what is in brackets or after a colon is in the "i");
   - **The "i" says:** the help text, in the structure of doc 40;
   - **Connections:** *Comes from* (what it takes), *Read by (built)* and *Read by (not built yet)*.
4. **What changes when an answer above changes:** what is removed and what is kept (the rule of every tile: an answer to a question no longer asked, or to an option no longer offered, is removed on the next choice).
5. **Decided, and still to decide:** the owner's decisions with their dates, and what is open.

**Where the words are kept.** The words of a built tile are kept in one place in the code (for the Segment, `SegmentQuestions.ts`), and the document is made from them; where the two differ the code is right.

## 2. Where each tile stands

| Page and tile | Document | Status |
|---|---|---|
| Identity 1: Organization | 38 | built (specification) |
| Identity 1: Early Positioning (Core Market, Corporate and Portfolio by stage) | 39 | built (specification) |
| Identity 1: Mission, Vision, Values and the others | none | not yet |
| Business 1: Segment Description | 36 | built (specification) |
| Business 1: Profile | 37 | proposal |
| Business 1: Competitors | none (doc 28, 6.6) | not yet |
| Business 1: Value Proposition | none (doc 28, 6.7) | not yet |
| Business 1: Offerings | none (doc 28, 6.8) | not yet |
| Business 2: Customer Engagement | none (doc 28, section 7) | not yet |
| Business 3 to 5 | none (doc 28, sections 9 and 10) | not yet |

A tile gets its document when it is built or about to be; the tile's design in doc 28 is then marked as governed by it, as 6.3a, 8.2 and 8.5 are.
