# Business System — Page 2: Customers Engagement
## Section 2 — Customer Relationships

> **3. Business System — Page 2 of 5, Section 2 of 2.**
> Follows **Section 1 — Channels** on the same page, and
> references the Channels defined there.

## 1. Purpose

Create a **Customer Relationships** section that defines how the organisation maintains relationships with its Customer Profiles.

The section should answer:

> **What kind of relationship do we maintain with each customer profile, why do we maintain it, for which offerings, at which journey stages, through which channels, how do we approach the customer, and what should the relationship achieve?**

The section must build on information already defined in:

- Customer Segments — Page 1, Foundation
- Customer Profiles — Page 1, Foundation
- Offerings — Page 1, Foundation
- Channels — Page 2, Section 1

Do **not duplicate information that already exists in those sections. Use references/selections instead.

---

# 2. Core Structure

The relationship structure is:

**Customer Profile → Relationship Type → Purpose → Offering → Journey Stage → Channel → Approach → Goal**

A single Customer Profile can have:

- One Relationship Type
- More than one Relationship Type
- One Offering
- More than one Offering
- All relevant Offerings

Each Relationship Type is an individual relationship slot.

Each selected Offering within a Relationship Type is an individual Offering slot.

Each selected Journey Stage within an Offering is an individual Journey Stage slot.

Each Journey Stage is connected to a Channel selected from the existing Channels.

The Approach is individual to each Journey Stage.

The Goal is defined for the relevant relationship interaction.

---

# 3. Customer Profile

Each Customer Relationship is created under a **Customer Profile**.

The Customer Profile must be selected from the profiles already created in the Customer Profiles section.

Do not allow the user to create or rewrite the Profile information here.

Display the selected Profile name as the reference.

Example:

```text
Customer Profile
Founder
```

A profile can have multiple Relationship Types.

---

# 4. Relationship Type

### Field

**Relationship Type ⓘ**

Use a dropdown or multi-selection control.

The user may select more than one Relationship Type for the same Customer Profile.

Each selected Relationship Type creates its **own individual Relationship Type slot**.

### Information / Help

The ⓘ should explain the available options:

| Relationship Type | Explanation |
|---|---|
| **Self-Service** | The customer can find information, make decisions and use the offering independently, with little direct assistance. |
| **Personal Assistance** | A person communicates directly with the customer and provides guidance or help when needed. |
| **Dedicated Support** | The customer receives structured, ongoing support from a designated person or team. |
| **Community** | The relationship is supported through interaction with a community of customers or users. |
| **Automated Service** | Technology provides information, guidance or assistance without direct involvement from a person. |

Do not treat a combination such as **Self-Service + Personal Assistance** as one Relationship Type.

Instead, create two individual Relationship Type slots:

```text
Self-Service
Personal Assistance
```

This allows each type to have its own Purpose, Offerings, Channels, Approaches and Goals.

---

# 5. Purpose

Purpose belongs to each **Relationship Type**.

### Field

**Purpose**

### Question

> Why do we maintain this type of relationship with this customer?

The Purpose should explain the reason the organisation uses this relationship type.

Example:

```text
Relationship Type
Personal Assistance

Purpose
Help the customer make confident decisions and provide assistance when needed.
```

Do not use the Customer Profile's **Goals & Desires** here.

The Profile's Goals & Desires describe what the customer wants to achieve.

The Relationship Purpose describes **why the organisation maintains the relationship**.

---

# 6. Offerings

Within each Relationship Type, allow the user to select the relevant Offerings from the existing Offerings section.

A Customer Profile may be connected to:

- Offering 1 only
- Offering 2 only
- More than one Offering
- All relevant Offerings

Each selected Offering must receive its **own individual slot**.

Do not duplicate the Offering's existing information.

Display only its name as a reference.

Example:

```text
Offering
Brand System
```

If the profile does not use an Offering, do not create an empty slot for it.

---

# 7. Journey Stage

For each Offering within a Relationship Type, allow the user to select one or more Journey Stages.

### Field

**Journey Stage**

Use a dropdown or multi-selection control.

Available options:

1. **Discovery**
2. **Evaluation**
3. **Purchase**
4. **Delivery**
5. **Support & Follow Up**

Journey Stage describes **when the interaction takes place in the customer journey**.

Do not confuse Journey Stage with Action.

---

# 8. Channel

Under each selected Journey Stage, allow the user to select the relevant **Channel** from the existing Channels section.

Do not create new Channel information here.

The existing Channel structure is:

**Channel → Journey Stage → Action**

Customer Relationships should reference the existing Channel and its relevant information.

Example:

```text
Journey Stage
Evaluation

Channel
Website
```

If necessary, display the existing Channel Action as reference information:

```text
Journey Stage
Evaluation

Channel
Website

Action
Present offering information to help customers assess it.
```

Do not rewrite or duplicate the Action.

---

# 9. Keep Journey Stage and Action Separate

These concepts must remain distinct.

### Journey Stage

Answers:

> **When does the interaction happen?**

Examples:

- Discovery
- Evaluation
- Purchase
- Delivery
- Support & Follow Up

### Action

Answers:

> **What does the organisation do through the Channel at that stage?**

Example:

```text
Channel: Email

Journey Stage: Support & Follow Up

Action:
Respond to questions and provide assistance.
```

Do not rename or reinterpret the Action as the Journey Stage.

The Relationship section should reference the existing Channel Action rather than create a second version of it.

---

# 10. Approach

### Field

**Approach**

The Approach must be **individual to each Journey Stage**.

It answers:

> **How will we use this interaction to maintain the relationship with the customer?**

The Approach should be informed by:

- Relationship Type
- Offering
- Journey Stage
- Selected Channel
- Existing Channel Action

Do not simply repeat the Channel or Action.

Example:

```text
Relationship Type
Personal Assistance

Offering
Brand System

Journey Stage
Evaluation

Channel
Website

Existing Action
Present offering information to help customers assess it.

Approach
Provide clear information and help the customer evaluate whether the offering fits their needs.
```

Another example:

```text
Journey Stage
Support & Follow Up

Channel
Email

Action
Respond to questions and provide assistance.

Approach
Provide direct guidance when the customer needs clarification or help with a decision.
```

The Approach therefore explains **how the organisation conducts the relationship through that particular interaction**.

---

# 11. Goals

### Field

**Goal ⓘ**

Goals describe what the organisation wants the relationship to achieve.

Allow the user to select one or more of:

| Goal | Explanation |
|---|---|
| **Get** | Attract and convert suitable customers into customers. |
| **Keep** | Maintain customer satisfaction, trust and continued engagement. |
| **Grow** | Develop the relationship through additional purchases, services or deeper engagement. |

The ⓘ should explain these options directly.

Do not assume the user already understands the terms Get, Keep and Grow.

Where appropriate, allow the user to select more than one.

Example:

```text
Goal ⓘ

☑ Get
☑ Keep
☐ Grow
```

---

# 12. Do Not Duplicate Information

The Customer Relationships section should reuse information from the other Business System pages and sections.

### From Customer Profiles

Reference:

- Customer Profile

Do not repeat:

- Demographics
- Psychographics
- Goals & Desires
- Challenges
- Objections
- Needs

### From Offerings

Reference:

- Offering

Do not repeat:

- Function
- Customer Benefit
- Content & Scope
- Purchase & Delivery

### From Channels

Reference:

- Channel
- Journey Stage
- Action

Do not recreate their definitions.

The Relationship section adds new information:

- Relationship Type
- Purpose
- Approach
- Goal

---

# 13. Dynamic Slot Behaviour

The interface should create slots based on the user's selections.

### Example

The user selects:

```text
Customer Profile
Creative Lead
```

Then selects:

```text
Relationship Types
☑ Self-Service
☑ Personal Assistance
```

Create two independent Relationship Type slots.

### Self-Service

```text
Purpose
[................]

Offering
Brand System

Journey Stage
Evaluation

Channel
Website

Approach
[................]

Goal
Get
```

### Personal Assistance

```text
Purpose
[................]

Offering
Brand System

Journey Stage
Support & Follow Up

Channel
Email

Approach
[................]

Goal
Keep
```

If the user adds Website Development to Personal Assistance, create a separate Offering slot under that Relationship Type.

Do not automatically create Website Development under Self-Service unless the user selects it.

---

# 14. Multiple Relationship Types

A Customer Profile may have multiple Relationship Types.

Example:

```text
Creative Lead

Relationship Type 1
Self-Service
    Purpose
    Offering
        Journey Stage
            Channel
            Approach
        Journey Stage
            Channel
            Approach
    Goal

Relationship Type 2
Personal Assistance
    Purpose
    Offering
        Journey Stage
            Channel
            Approach
        Journey Stage
            Channel
            Approach
    Goal
```

The two Relationship Types must remain independent.

Do not combine them into a single field such as:

```text
Self-Service + Personal Assistance
```

Internally, they are separate Relationship Type selections/slots, even if the interface may display their combination for summary purposes.

---

# 15. Multiple Offerings

The same Relationship Type can apply to multiple Offerings.

Example:

```text
Personal Assistance

Purpose
Help the customer make confident decisions.

Offering 1
Brand System
    Evaluation
        Website
        Approach
    Support & Follow Up
        Email
        Approach

Offering 2
Website Development
    Evaluation
        Website
        Approach
    Support & Follow Up
        Email
        Approach
```

The Approach must be individual to each Journey Stage because the interaction can differ between Offerings.

---

# 16. User Experience Principle

The system should progressively expose information rather than presenting a large empty form.

Recommended interaction:

### Step 1
Select Customer Profile.

### Step 2
Select one or more Relationship Types.

### Step 3
For each Relationship Type, define its Purpose.

### Step 4
Select the relevant Offerings.

### Step 5
For each Offering, select the relevant Journey Stages.

### Step 6
For each Journey Stage, select the relevant existing Channel.

### Step 7
Define the Approach for that specific Journey Stage.

### Step 8
Select the relevant Goal.

Only create slots for information that is relevant to the user's selections.

---

# 17. Final Relationship Model

The final structure should be:

```text
Customer Profile
│
├── Relationship Type 1
│   │
│   ├── Purpose
│   │
│   ├── Offering 1
│   │   │
│   │   ├── Journey Stage 1
│   │   │   ├── Channel
│   │   │   └── Approach
│   │   │
│   │   └── Journey Stage 2
│   │       ├── Channel
│   │       └── Approach
│   │
│   └── Offering 2
│       └── ...
│
└── Relationship Type 2
    │
    ├── Purpose
    │
    ├── Offering 1
    │   └── ...
    │
    └── Goal
```

The conceptual relationship is:

**Profile → Relationship Type → Purpose → Offering → Journey Stage → Channel → Approach → Goal**

This structure should remain flexible enough to represent simple cases such as:

**Profile → Personal Assistance → Offering 1**

as well as more complex cases such as:

**Profile → Self-Service + Personal Assistance → Offering 1 + Offering 2 → different Journey Stages and Channels → different Approaches.**

The system should favour the **simplest valid structure** and only create additional slots when the user's selections require them.