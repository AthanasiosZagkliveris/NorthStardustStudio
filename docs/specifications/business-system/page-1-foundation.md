# Business System — Page 1: Foundation

Status: **specification**, written 2026-09-27, updated 2026-11-09. The text from "Describe and implement" on is the owner's requirement as given (its wording is used exactly); "As built" says how the app draws it today.

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
- Every question, option and "i" of the Competitor card is in doc 41 (`design/questionnaire/41-competitor-questions.md`), of the Value Proposition in doc 42 (`42-value-proposition-questions.md`) and of the Offering card in doc 43 (`43-offering-questions.md`). The design behind the questions is in doc 28, section 6 (`design/questionnaire/28-questionnaire-specification.md`); what the later pages read from this page is in the coverage map (`README.md`, "What each later page reads from Page 1").
- The floating cards share one pattern (`ai/tile-and-card-pattern.md`).

The figures of the requirement (one primary Segment, a maximum of 2; up to 3 Profiles each) are **advice** given in the guidance: the Add buttons are always offered and nothing is cut off. A Competitor's Type options read in the singular ("Direct competitor"). The older four-column drawing is in the code (`BusinessFoundationEditor` without `asTiles`) but the app does not use it. The open requirements for this page are in document 5, section 5.5.3.

- **2026-11-15 (owner, 16:26 to 16:43): the channels from the earlier answers.** Where they shop: on a marketplace, "Which marketplaces do your customers shop on?" (Box 4, 7a: Etsy, Amazon, eBay, Not On The High Street, Folksy, Gumroad, Fiverr, Upwork, Other); in a shop or both, "Which shops do they buy from?" (Box 4, 7b: Your own shop or studio; Shops that stock your products; A space inside another shop; Distributors or wholesalers), each tick its subchannel at Purchase (Marketplace › its name; In Person › Studio / Shop; Retail & Wholesale › Retail Stockist, Concession / Shop-in-shop, Distributor). How they pay: "Invoice, bank transfer or purchase order" split into "Invoice or purchase order" and "Bank transfer" (Direct Payment › Bank Transfer; a saved "invoice" reads as both), and, with card or wallets, "Which payment services do you take payments with?" (Box 4, 8a: Stripe, SumUp, Square, Zettle, PayPal, Shopify Payments, Other): each service its "Payment processing fees" card on the Segment's Direct Payment channel, ONE card a service for the Organisation (a second Segment's answer links the same card), by the subchannels' rule -- made once, removed stays removed, an untouched one (no price) goes with its answer, an edited one stays (`withAnswerServiceCards`, `answerCards`); a card with no price is charged in the forecast from its fee row for the country, never twice (`CalculatedLines.ts`). How it reaches them: O20 "How do you send it?" (Courier, Postal service, Local delivery, A fulfilment service), O21 "How do you send the files?" (Email attachment, A download link, Client portal), O22 "Which tool do you meet them on?" (Zoom, Google Meet, Microsoft Teams, Live stream), each with Other, each tick its delivery subchannel; a live or in-person session suggests Website › Booking / Registration Page. **Every Other written in is a numbered list** (`NumberedListInput`, as "Tasks she wants done"; owner 16:43: "Other could be more than 1 channel!"): one name a row, each row its own subchannel or card and, where it pays, its own fee row "Entered by you"; a text saved in one box is read once by its commas, semicolons and lines (`writtenInNames`). The Channel Fee Table's rows appear by themselves from the user's channels (owner 16:37): no "+ Add channel", no x; a row leaves with its channel; the old combined "Wolt, Amazon" row is gone. The fee data adds Square, eBay, Not On The High Street and Folksy, not checked, in each country (data version 2). Codes: O18 and O19 are taken; the new ones are O20 to O22 (doc 44).
