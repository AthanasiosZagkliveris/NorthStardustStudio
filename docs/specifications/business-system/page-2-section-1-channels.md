# Business System — Page 2: Customers Engagement

Status: **specification**, updated 2026-10-12.
## Section 1 — Channels

> **3. Business System — Page 2 of 5, Section 1 of 2.**
> Page 2 holds **Channels** (this section), then
> **Customer Relationships**, which references the Channels
> defined here.

## 1. Purpose

Design and develop the **Channels** section: Section 1 of Page 2, Customers Engagement, of the Business System.

The Channels section defines **how the organisation reaches, communicates with, sells to, delivers to, and supports customers** throughout the customer journey.

Channels should be defined based on the relevant **Customer Segments, Customer Profiles, and Offerings** from the Foundation (Page 1).

The section should remain practical and easy to use for early-stage organisations and small teams. It should help the user determine:

- Which channels are relevant.
- Which offerings each channel supports.
- At which customer journey stages each channel is used.
- What action is performed through the channel at each stage.

The section must not become a CRM system, marketing management system, or detailed operational workflow.

---

# 2. Relationship to the Foundation

The Channels section uses information already defined in the Foundation (Page 1):

**Customer Segment → Customer Profiles → Offerings → Channels**

The Channels section should reference this information rather than duplicate it.

The user must be able to access the relevant source information through links.

The Channels section should not require the user to re-enter the Foundation information.

---

# 3. Channel Card Structure

Each Customer Channel Card should contain two main areas:

1. **Information / References**
2. **Channels**

---

# 4. Information / References

## Header

Display:

**Information / References ⓘ**

Help text for the top information icon:

> Visit the Foundation (Page 1) to fill the below information.

This section is a reference area, not a second input form.

---

## Three Equal Columns

Create three equal-width columns:

| Customer Segment | Customer Profiles | Offerings |
|---|---|---|

Display the relevant linked information from the Foundation.

### Customer Segment

Show the selected Customer Segment name as a link.

Under it display:

**Relative Information ⓘ**

When the user selects the information icon, show:

- Where does he live, work or operate?
- What influences purchasing decisions?
- What type and size of organisation does he work in, if any?

The actual relevant information should be displayed underneath the title where appropriate.

---

### Customer Profiles

Show the selected Customer Profile names as links.

Under them display:

**Relative Information ⓘ**

Information help:

- Who is he, and what are his education, interests and background?
- Where does he look for activities and connect with others?
- How does he discover, compare and choose solutions?

---

### Offerings

Show the selected Offering names as links.

Under them display:

**Relative Information ⓘ**

Information help:

- What does he need to know before choosing the offering?
- Where and how will the customer purchase, pay for, and receive it?
- What support or communication will the customer need afterwards?

---

# 5. Channel Structure

Channels should use a nested hierarchy:

**Channel Category → Specific Channel**

The category is a container and should not be repeated for every row.

Example:

```text
Social Media
    ↳ LinkedIn
    ↳ Instagram
```

Not:

```text
Social Media | LinkedIn
Social Media | Instagram
```

The category should appear once, with its channels nested underneath.

---

# 6. Available Channel Categories

Provide a conservative predefined list of channel categories.

Use, in this fixed order (as built):

1. Social Media
2. Community
3. Website
4. Marketplace
5. In Person
6. Email
7. Online / Live
8. Direct Payment
9. File Delivery
10. Physical Delivery
11. Retail & Wholesale (Stockist, Distributor, Wholesale Account, Reseller, Concession / Shop-in-shop; stages Discover, Evaluation, Purchase, Delivery)
12. Referral & Affiliates (Referral Partner, Affiliate, Influencer / Ambassador, Customer Referral; stages Discover, Evaluation, Purchase)
13. Other

Each category lists its own channels as presets (for example Social Media: Instagram, Facebook, LinkedIn, YouTube, TikTok, Pinterest, X) and ends in **Other**, which takes a name typed by the user. The earlier category "File Delivery / Client Portal" is now **File Delivery**.

Do not allow unlimited custom categories unless explicitly required by the implementation.

The categories are intentionally limited to cover the main ways small organisations reach and serve customers.

---

# 7. Adding a Channel

Provide:

**+ ADD CHANNEL**

When adding a channel, the user should first select or specify the **Channel Category**, then define the specific channel.

Examples:

```text
Social Media
    ↳ LinkedIn
    ↳ Instagram

Marketplace
    ↳ Gumroad

File Delivery
    ↳ WeTransfer
    ↳ Client Portal

Direct Payment
    ↳ Stripe
    ↳ Bank Transfer
```

The same category may contain multiple specific channels.

---

# 8. Channel Table

Each channel should contain the following fields:

| Channel | Offerings | Journey Stage | Action |
|---|---|---|---|

As built, the table has these four columns. A channel's **Links** (optional, a list of destinations or access points, placeholder "Links (optional)") sit under its name in the Channel cell, not in a column of their own. A channel has a × to remove it (not on the last channel).

Do not include a separate **Purpose / Description** column.

The purpose of the channel is incorporated into the Action.

---

# 9. Channel

Display the specific channel name.

Examples:

- LinkedIn
- Instagram
- Gumroad
- Website
- Email
- WeTransfer
- Client Portal
- Stripe
- Bank Transfer

The category should be displayed once above its nested channels.

---

# 10. Links

The Links field stores the actual destination or access point for the channel.

Examples:

- Social profile URL
- Community URL
- Website URL
- Product URL
- Payment URL
- File-delivery URL
- Client portal URL
- Email address

A channel may contain more than one relevant link.

For example, a Marketplace channel may contain:

```text
Practical Guide product link
Digital Resource Pack product link
```

Do not repeat the provider name for each link.

---

# 11. Offerings

Allow the user to associate one or more Offerings with the channel.

An Offering may be connected to multiple channels.

A channel can never be without Offerings: a new channel carries "All Offerings" by default, the last remaining Offering cannot be removed (it can only be changed to another), and a saved channel with none is read as "All Offerings".

Examples:

```text
LinkedIn
→ Practical Guide
→ Digital Resource Pack

Gumroad
→ Practical Guide
→ Digital Resource Pack
```

The field should use the Offerings defined in the Foundation.

Do not allow users to create duplicate Offering records inside Channels.

---

# 12. Journey Stage

Journey Stage determines **where in the customer journey the channel is relevant**.

A channel may support more than one Journey Stage.

Use these five stages:

1. **Discover** (labelled "Discover" in the app; the stored id stays `discovery`)
2. **Evaluation**
3. **Purchase**
4. **Delivery**
5. **Support & Follow Up**

Do not combine Purchase and Delivery.

Payment and delivery may happen through completely different channels.

For example:

```text
Stripe
→ Purchase

WeTransfer
→ Delivery
```

A single channel may also support multiple stages.

Example:

```text
Client Portal
→ Evaluation
→ Purchase
→ Delivery
→ Support & Follow Up
```

Journey Stage must therefore support **multiple selections per channel**.

---

# 13. Action

The Action describes:

**What is done through this channel at the selected Journey Stage, and what it is intended to achieve.**

Do not create a separate Purpose field.

The Action should naturally contain both the activity and its intended purpose.

Examples:

```text
Publish educational content to build awareness and attract relevant customers.

Explain offering benefits and provide examples to help customers assess suitability.

Process payment and confirm the customer's order.

Transfer large project files so the customer can access the completed work.
```

Avoid vague actions such as:

```text
Post on LinkedIn.
Send files.
Communicate with customers.
```

Actions should explain enough to understand both **what happens** and **why it happens**.

---

# 14. Journey Stage → Action Relationship

The selected Journey Stages should control the Action structure.

For every selected Journey Stage, create a corresponding Action slot.

Example:

```text
Journey Stage
☑ Discovery
☑ Evaluation
☐ Purchase
☐ Delivery
☑ Support & Follow Up
```

Then display:

```text
Actions

Discovery
    + Add Action

Evaluation
    + Add Action

Support & Follow Up
    + Add Action
```

The user should not create actions for unselected Journey Stages.

This creates the relationship:

**Channel → Journey Stage → Action**

---

# 15. Multiple Actions

Allow more than one Action under a Journey Stage when necessary.

Example:

```text
LinkedIn

Discovery
    • Publish educational content to build awareness.
    • Share relevant work and examples to attract potential customers.

Evaluation
    • Explain offering benefits and scope.
    • Answer questions and direct customers to further information.
```

Do not impose unlimited complexity. Keep the interaction simple and suitable for small organisations.

### Action order numbers, and sharing an action by its number

Every distinct Action of a Segment has a **total order number** ("#12"): the Actions are counted in the order the table is read (Channel Category, channel, Journey Stage, line), each Action taking the next number the first time it appears. An Action shared by several rows (the same Action, placed in more than one channel or stage) has **one** number, shown on every row it stands in, so the numbers run 1..N without gaps. Folding or isolating rows renumbers nothing.

An Action can be shared by typing "#" and its number in an Action line: the Action with that number is offered as the first (only) suggestion and, chosen with Enter or a click, is placed on that line — the same Action, not a copy — exactly as when it is picked from the suggestions of the Segment's other Actions. A number that refers to nothing (or to an Action the row already holds) offers nothing and the text stays as typed. An Action line left empty disappears when focus leaves it, unless it is the only line of its row (which keeps its one empty line to type the first Action in).

### Linking a resource to an action of any channel

A resource's "# Link an action" finds an Action of the Segment's **whole** Customer Channel table, not only of its own channel: type its number ("12" or "#12") or words from it, or choose "Link an action" and click any Action line of that Segment's table. A resource linked to an Action that stands only in another channel stays on the channel it was made on and also shows in the cell of every channel whose rows hold that Action, marked "via shared action": "shared action" is a link that goes to the Action's line (one link per Action, "#3 #7", when it is shared through several). The Channel resources table lists those channels under the resource's home channel.

### The isolated mode

A click on the link or tag symbol of an Action isolates the rows involved (the others collapse away, and a shared Action shows every resource card linked to it in every channel kept). While a Segment is isolated nothing can be created in its table: every Add button is hidden, Enter in an Action line opens no new line, "Link an action" is inert, and the Links tick of a channel cannot open a new box; text already there stays editable. The isolation ends with a second click on the symbol, Escape, the note in the section's title row, or a click on empty space (anywhere that is not a control or a cell's content).

### Column widths

The Journey Stage column is wide enough for its "+ Add Journey Stage" button on one line, and the Channel column for the longest Channel Category ("Physical Delivery") and channel name, whether or not a category is open.

---

# 16. Examples

### Social Media

```text
Social Media
    ↳ LinkedIn
```

| Channel | Links | Offerings | Journey Stage | Action |
|---|---|---|---|---|
| LinkedIn | Profile link | Practical Guide, Digital Resource Pack | Discovery | Publish educational content to build awareness and attract relevant customers. |
|  |  |  | Evaluation | Explain offering benefits and provide examples to help customers assess suitability. |

---

### Marketplace

```text
Marketplace
    ↳ Gumroad
```

| Channel | Links | Offerings | Journey Stage | Action |
|---|---|---|---|---|
| Gumroad | Product links | Practical Guide, Digital Resource Pack | Purchase | Process the customer's order and payment. |
|  |  |  | Delivery | Provide automatic access to the purchased digital product. |

---

### Direct Payment + File Delivery

```text
Direct Payment
    ↳ Stripe

File Delivery / Client Portal
    ↳ WeTransfer
```

| Channel | Links | Offerings | Journey Stage | Action |
|---|---|---|---|---|
| Stripe | Payment link | Custom Offering | Purchase | Collect and confirm payment for the agreed work. |
| WeTransfer | Delivery link | Custom Offering | Delivery | Transfer large project files and final deliverables. |

This separation must be supported by the data model.

---

# 17. Design Principles

The interface should follow these principles:

### Reference, not duplication
Foundation information is referenced and linked rather than recreated.

### Practical progression
The user should naturally move through:

**Who → What → Where → When → What to do**

### Conservative choices
Use predefined Journey Stages and Channel Categories rather than unlimited choices.

### Flexible relationships
One channel may support multiple offerings and multiple Journey Stages.

One Offering may use multiple channels.

One Customer Profile may use multiple channels.

### Clear hierarchy
Use:

**Channel Category → Specific Channel → Journey Stage → Action**

### Minimal complexity
Do not introduce CRM features, campaign planning, analytics, automation, conversion tracking, or detailed customer relationship management.

---

# 18. Final UI Structure

```text
CUSTOMER CHANNELS

Information / References ⓘ
    "Visit the Foundation (Page 1) to fill the below information."

┌────────────────────┬────────────────────┬────────────────────┐
│ Customer Segment   │ Customer Profiles  │ Offerings          │
│                    │                    │                    │
│ [Linked Name]      │ [Linked Name]      │ [Linked Name]      │
│                    │ [Linked Name]      │ [Linked Name]      │
│ Relative Info ⓘ    │ Relative Info ⓘ   │ Relative Info ⓘ   │
│                     │                    │                    │
└────────────────────┴────────────────────┴────────────────────┘


CHANNELS

┌───────────────┬────────┬────────────┬────────────────────┬────────────┐
│ Channel       │ Links  │ Offerings  │ Journey Stage      │ Action     │
├───────────────┼────────┼────────────┼────────────────────┼────────────┤
│ Social Media  │        │            │                    │            │
│   ↳ LinkedIn  │ URL    │ Offering A │ Discovery          │ Action     │
│               │        │            │ Evaluation         │ Action     │
│   ↳ Instagram │ URL    │ Offering B │ Discovery          │ Action     │
│               │        │            │                    │            │
│ Marketplace   │        │            │                    │            │
│   ↳ Gumroad   │ URLs   │ A, B       │ Purchase           │ Action     │
│               │        │            │ Delivery           │ Action     │
└───────────────┴────────┴────────────┴────────────────────┴────────────┘

+ ADD CHANNEL
```

## 19. Core Data Relationship

The implementation should support the following relationship model:

```text
Customer Segment
    ↓
Customer Profile
    ↓
Offering
    ↓
Channel
    ↓
Journey Stage
    ↓
Action
```

However, these relationships are **many-to-many where appropriate**.

For example:

```text
One Channel → Many Offerings
One Channel → Many Journey Stages
One Journey Stage → Many Actions
One Offering → Many Channels
```

The interface should make these relationships easy to manage without exposing unnecessary technical complexity to the user.

## Channel resources table

Under the Customer Channel table, a collapsible "Channel resources" subsection (open by default, hidden while the Segment has no channel resource) lists every resource of the Segment in one read-only, auto-generated table. Its columns are Resource (a button to its card on 3. Infrastructure & Capability, in its colour), Cost (price x quantity and how often), Behaviour (Fixed for one-time, monthly and annual costs, Variable for per-unit, per-order and per-project ones, as the Financial Foundation reads them), Channel (the channel it was made on, first, then each other channel it shows in through an action), Offerings (the names of the Offerings the resource's card links, and "—" when it links none or is an Infrastructure or Workspace card, which has no Offerings field; never "All Offerings"), Journey stages and Actions (by total order number, each a button to that action's line). A cell of Channel, Offerings or Journey stages with two or more values lists them one under the other as bullets, all styled alike; a single value is plain text indented to where the bullets' text starts, so the text of a column begins at one x. The Actions cell has no bullets: its buttons sit side by side and wrap between buttons, never inside one. A footer line adds up the rows shown (Fixed per month, Variable by what it varies with, One-time); it is a summary of those rows, not a forecast, and nothing is stored or counted from it: each resource is still counted once, from its card.

## Channel expenses (as built, batches G and H)

Each channel cell offers two ways to record what the channel costs. Both write Resource cards on Page 3 (the card is the only place the price lives), so nothing is entered twice.

- **+ Add expenses** creates one blank Resource card, linked to the channel. Blank cards stay in the Channel tile on Page 3.
- **Typical costs for this channel** creates, with one press, the set of template cards for that kind of channel (templates T1 to T10 and T12 of the card-structure document), each with its price left blank. A template the company already has is offered as **Link existing: <name>** or **Add new**; a linked card is flagged `existing` and is kept when the channel or the link is removed. Template-made cards live in their own group tile on Page 3, in teal, with the card's name as the link back to the channel and no link symbol.

Removing a channel removes the template cards it made that nothing else uses, and keeps any card the user linked as existing.

The cost of a channel is read by Page 4 from its cards: payment-processor and marketplace fees are calculated lines (Channel Fee Table by card name, rates from Global Settings), and royalties, affiliate and agent commissions are Percentage billing lines whose rate is the card's override, then its price, then the Global Settings default.
