# Business System — Page 2: Customers Engagement
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

Use:

1. Social Media
2. Community
3. Marketplace
4. Website
5. Email
6. File Delivery / Client Portal
7. Direct Payment

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

File Delivery / Client Portal
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

| Channel | Links | Offerings | Journey Stage | Action |
|---|---|---|---|---|

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

1. **Discovery**
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