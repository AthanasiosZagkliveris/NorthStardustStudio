# 42. The Value Proposition tile: the draft and the open items, as proposed

Status: **proposal**, written 2026-11-03, updated 2026-11-04. The Value Proposition tile (Business System, page 1): what it asks, the draft sentence it offers, and the open items it lists, with what each reads. The text is built; the draft and the open items are **built** (owner, 2026-11-07: "Update the Value Proposition and Offering card according to their docs"; `OfferingQuestions.ts`), with what is not yet built named in each section.

Related: doc 35 (the Segment), doc 36 (the Profile: the needs, goals, frustrations and worries), doc 38 (Positioning: purpose, differentiation, outcomes), doc 41 (the Competitor: K8 and K10), doc 43 (the Offering: O1, O4, O8 and the needs addressed), doc 34 (the value crosswalk, 5.2a), doc 28 (6.7 and 8.2, the design this refines).

**What the tile is.** There is one Value Proposition per Segment (built). It is a string on the Segment, `valueProposition`. The tile opens one text, with the instructions as built:
- "Define a clear, concise Value Proposition for each Customer Segment."
- "State the specific problem you solve and the key benefits you provide."
- "Explain what makes your offering different or better than competitors."

**It asks no new question.** Everything it needs has already been answered by the time the App User reaches it. A question here would ask a second time what the Profile, the Offering or the Competitor already holds, and break one owner per fact (doc 28, rule 3.1). So the tile gives a **draft** and **open items**, and the text stays the App User's own.

**Why this structure.** The tile follows the Value Proposition Canvas [FUN-46], which fits what a Segment's customers want to what an offering gives them. On the customer's side are their jobs, pains and gains. On the offering's side are its pain relievers and gain creators. The app already asks all of these:

| Canvas | Where it is asked |
|---|---|
| Customer jobs (functional, social, emotional) | the Profile's Needs (doc 36, Needs) |
| Pains | the Profile's E2, frustrations, and E3, worries |
| Gains | the Profile's E1, goals, and B1, what matters most |
| Products and services | the Offering's Type and O1 (doc 43) |
| Pain relievers | the Offering's O8 (the worries it answers) and its needs addressed |
| Gain creators | the Offering's O4 (what it does best) |

The sentence follows Moore's positioning template, as taught at Stanford [FUN-28]: for whom, their need, the product and its category, the key benefit, and unlike whom.

## 1. The draft

- **Control:** a button above the text, "Add a draft". It adds the sentence at the end of the text and never overwrites it.
- **Shown when:** the Segment has a name, at least one of its Profiles has answered E2 or holds a need, and at least one of its Offerings has a Type.
- **The words** (owner, 2026-11-07: "Approved. Please go ahead and write the updated specification sections"): "For [the Segment's name] who [the frustration's draft phrase] and want to [the goal's draft phrase], [the Offering's name] is a [the Offering's form, O1, else its Type] that [the Offering's main benefit, the first ticked in O4]. Unlike [the Competitors], it [the clear opening's value]."
  - The goal and the frustration are the **highest-rated** across the Segment's Profiles (E1 and E2 are rated since 2026-11-04), ties in the list's order; each is written in its draft phrase (doc 34, 5.2d), never its one-word tick box ("who wait too long and want to grow their income").
  - "Unlike …, it …" is taken from the clear opening as built (`clearOpenings`, `CompetitorQuestions.ts`: a value every Competitor of the Segment is weak on and a Profile rates Essential; the Review's second look and the first of K10's openings), not worked out again here. With no clear opening the sentence ends after the benefit.
  - A blank whose answer is missing is left in square brackets, so the App User sees what to add.
  - With several Offerings, one draft link for each Offering with a Type, "Add a draft for [its name]" (built 2026-11-07).
- **The "i" says:**
  - A starting sentence made from your answers on this page. It is yours once added: change it freely.
  - Based on: Moore's positioning template, and the pains and gains of the Value Proposition Canvas.
- **Connections:**
  - *Comes from:* the Segment's name; its Profiles' E1 and E2; its Offerings' O1 and O4 (doc 43); its Competitors' type and K8 (doc 41). Where the words of an answer do not read in the sentence, its crosswalk words are used (doc 34, 5.2a). Positioning's purpose, differentiation and outcomes (doc 38, questions 7 to 10) also come in through the crosswalk.
  - *Read by:* nothing. The text is the user's, and the Business Plan reads the text as built.

**As built (2026-11-07):** one link for each Offering with a Type, "Add a draft" (with several Offerings, "Add a draft for [its name]", the proposal under "Still to decide"), above the text; it adds its sentence at the end, only what is not already there (`draftToAdd`), and goes once added. The sentence: "For [Segment] who [frustration phrase] and want to [goal phrase], [Offering] is [its form, O1, else its Type] that offers [its main benefit]. Unlike its competitors, it offers [the clear opening]." The "i" of the tile carries the two lines of the draft's "i" above. `valuePropositionDraft`, `draftOffered`.

## 2. The open items (read-only, under the text)

Each item names the Profile, Offering or Competitor it is about, and opens it. These come from doc 28, 6.7, and the review of 2026-11-03.

| Item | Shown when |
|---|---|
| **Unmet value** | Something the Profiles care about (B1) that no Offering does best (O4) |
| **Unanswered need** | A numbered functional item of a Profile (by its id) that no Offering ticks; no text is matched, so an item edited on the Profile stays the same item. Matched by id since 2026-11-07 (built). The functional categories (L17) are the Profile's own ticks, also built on 2026-11-07, and are not ticked again on the Offering |
| **Unused offering** | An Offering that answers no need of the Segment |
| **Unwanted benefit** | A benefit an Offering claims (O4) that no Profile cares about (B1) |
| **Worry left open** | A worry a Profile ticked (E3) that no Offering answers (O8). The worry Support is answered when an Offering's O7, the help after the sale, is anything but None (built 2026-11-07) |
| **Job left to a competitor** | Withdrawn (2026-11-04): doc 41's job question was withdrawn as an Offering question, so there is no Competitor's job to compare with O13 (doc 43) |
| **Emotional and social needs** | The Value Proposition is the one owner of these (owner, 2026-11-06; the Offering does not tick them, doc 43): each emotional or social need ticked on the Segment's Profiles (doc 36, section 10), the strongest first, until the text says how it answers it. **Built in part (owner, 2026-11-07):** under the text, Emotional Needs and Social Needs list every need ticked on the Segment's Profiles, each once, the strongest first (its highest rating on any Profile; ties in the options' order), numbered, then the lines of the Profiles' Notes as bullets; "None recorded." only when there are neither (`segmentNeedTicks`, `ProfileQuestions.ts`). The tile's "i": "Say how it meets the emotional and social needs below: those ticked on the Profiles, strongest first, then the lines of their Notes." Still proposed: an item stays until the text answers it. |

- **The "i" says:** Gaps between what your customers want and what your Offerings give. They are reminders, not errors.
- **As built (2026-11-07):** "Open items" under the needs, one bullet each, "[kind]: [what it says]", shown only when there is one: Unmet value and Unwanted benefit from one function (`valueMismatch`, for the Review to read too), Unanswered need by item id, Unused offering (an Offering with a Type that addresses none of the Segment's items), Worry left open (O8; the worry Support is answered by any help after the sale, O7, since 2026-11-07). **Not built:** an item opening the card it is about; the Review listing the same items; "Emotional and social needs" as an item (the needs are listed above the items, as built on 2026-11-07, and nothing yet says when one is answered).
- **Connections:**
  - *Comes from:* doc 36 (B1, E3, the Needs); doc 43 (O4, O8, the needs addressed).
  - *Read by (not built yet):* the Review page, which lists the same items.

## What changes when an answer above changes

Nothing in the text changes: a draft once added is the App User's. The open items are worked out again from the answers as they stand.

## Decided, and still to decide

**Decided (owner, 2026-11-03):**
- The positioning statement is drafted per Segment in this tile.
- No new Positioning cells are added for the pain point, the category or the status quo (doc 28, 8.2).
- Emotional and Social needs are ticks (doc 36, section 10) and the Value Proposition alone answers them (owner, 2026-11-06), so the "Emotional and social needs" item lists the ticked needs, not an Offering's ticks; "Unanswered need" compares the Profiles' numbered functional items by id.

**Built (2026-11-07):**
- "Unanswered need" matched by the items' ids, not their words.
- One draft link for each Offering with a Type ("Add a draft for [its name]" when there are several).

**Still to decide:** nothing for this tile. (With several Offerings, one draft per Offering was the proposal; it is built, above.)
