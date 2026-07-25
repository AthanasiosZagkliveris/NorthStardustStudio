




χθες 10:14 π.μ.

01. Identity System(22).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version:
status:
tags:
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

Your prompt is well defined, and the uploaded PDF follows it closely. Based strictly on the uploaded file 

, the official Markdown conversion would begin like this:

---
systemNumber: 1
systemName: Identity System
capability: Foundation
question: Who are we?
scope: Defines the organization's identity, purpose, guiding beliefs, and the principles that shape every decision.
version:
status:
tags:
---

# 1. Identity System

**Capability:** Foundation

**Guiding Question:** Who are we?

## System Scope

Defines the organization's identity, purpose, guiding beliefs, and the principles that shape every decision.

## Index

1. Overview
2. Mission
3. Vision
4. Values
5. Philosophy
6. Principles
7. Manifesto
8. Brand Personality
9. Voice Guide
10. Positioning Statement
11. Organization Description

---

# 1. Overview

## Purpose

The Identity System helps define the foundation of an organization, studio, brand, project, or business.

It establishes:

- Why you exist
- What future you want to create
- What you believe
- How you make decisions
- How you communicate
- How you present yourself

A completed Identity System creates alignment across branding, strategy, marketing, products, websites, and content.

## When to Use

Use this system whenever:

- Starting a new organization
- Rebranding an existing organization
- Clarifying direction and purpose
- Preparing for branding and marketing work

## Outcome

A clearly defined and consistent identity that establishes what the subject is, why it exists, what it represents, and the principles that guide it. This system provides a stable foundation for communication, decision-making, and long-term development by ensuring that every future activity remains aligned with the same core identity.

The outcome should include:

- A clearly defined purpose
- A consistent identity
- Core values and principles
- A shared direction for future development
- A reliable foundation for all related systems

---

# 2. Mission

## Purpose

The Mission defines the organization's purpose.

It answers:

Why do we exist?

A good mission is practical, focused, and action-oriented.

## Recommended Length

- 1–3 sentences.
- 20–75 words.

## Questions

- What do we do?
- Who do we serve?
- Why does our work matter?

## Example

> "We create educational resources that help independent creators build sustainable creative businesses."

---

# 3. Vision

## Purpose

The Vision describes the future you want to help create.

It answers:

What future are we working toward?

A vision should be ambitious and inspiring.

## Recommended Length

- 1–3 sentences.
- 20–75 words.

## Questions

- What change do we want to see?
- What does success look like in 10 years?
- What impact do we hope to have?

## Example

> "We envision a future where every creator has access to the tools and knowledge needed to build meaningful and independent creative careers."

---

# 4. Values

## Purpose

Values are the beliefs that guide decisions and behavior.

They define what matters most.

## Recommended Length

- 3–7 values.
- Each value should include a short explanation.

## Questions

- What do we prioritize?
- What behaviors do we encourage?
- What do we refuse to compromise on?

## Example

> **Curiosity** — We continuously learn, explore, and question assumptions.
>
> **Quality** — We value thoughtful work over rushed output.
>
> **Integrity** — We strive to be honest, transparent, and accountable.

---

# 5. Philosophy

## Purpose

Philosophy describes how the organization understands its work and the world around it.

It represents a way of thinking.

While a mission explains what you do, philosophy explains how you think.

## Recommended Length

- 1–5 paragraphs.
- 100–500 words.

## Questions

- What beliefs shape our work?
- What ideas influence our decisions?
- How do we approach challenges and opportunities?

## Example

> "We believe meaningful work is created through curiosity, experimentation, and continuous learning. Long-term value is more important than short-term attention."

---

# 6. Principles

## Purpose

Principles are practical rules that guide actions and decisions.

Values describe beliefs.

Principles describe behavior.

## Recommended Length

- 5–15 principles.
- Each principle should include a short explanation.

## Questions

- How do we make decisions?
- How do we evaluate opportunities?
- What standards do we follow?

## Example

> **Documentation Before Scaling**
>
> Create repeatable systems before expanding operations.
>
> **Simplicity Over Complexity**
>
> Choose solutions that are easy to understand and maintain.

---

# 7. Manifesto

## Purpose

A Manifesto is a public declaration of beliefs, ambitions, and commitments.

Unlike a mission or vision, a manifesto is emotional, expressive, and persuasive.

It communicates what the organization stands for.

## Recommended Length

- 300–1,500 words.

## When to Use

- Website About pages
- Brand books
- Presentations
- Media kits
- Internal culture documents

## Questions

- What do we believe?
- What do we reject?
- What future are we trying to build?
- Why does our work matter?

## Example Structure

- Introduction
- Core Beliefs
- Challenges We See
- What We Stand For
- Commitment to the Future

---

# 8. Brand Personality

## Purpose

Brand Personality defines the human characteristics associated with the organization.

It helps create consistency across communication, design, products, and customer interactions.

## Recommended Length

- 3–7 personality traits.

## Questions

- If the brand were a person, what would it be like?
- How should people describe us?
- What impression should we leave?

## Example

> **Thoughtful** — Carefully consider ideas and decisions.
>
> **Curious** — Actively explores new possibilities.
>
> **Professional** — Reliable, organized, and trustworthy.

---

# 9. Voice Guide

## Purpose

The Voice Guide defines how the organization communicates.

A clear voice improves consistency across websites, articles, social media, presentations, and products.

## Recommended Length

- 3–7 voice characteristics.

## Questions

- How should we sound?
- How should we not sound?
- What communication style reflects our identity?

## Example

| Characteristic | Description |
|---------------|-------------|
| Clear | Use simple and understandable language. |
| Professional | Maintain credibility and confidence. |
| Friendly | Be approachable without becoming informal. |

## Avoid

- Excessive jargon
- Aggressive marketing language
- Overly casual communication
- Unnecessary complexity

---

# 10. Positioning Statement

## Purpose

Positioning defines how the organization should be understood within its market.

It explains who you serve, what you offer, and what makes you different.

## Recommended Length

- 1–3 sentences.
- 25–100 words.

## Questions

- Who is our audience?
- What do we provide?
- What differentiates us?

## Example

> "For independent creators seeking structured and practical systems, our organization provides documentation frameworks that help transform ideas into sustainable projects."

---

# 11. Organization Description

## Purpose

The Organization Description provides reusable summaries of the organization.

Different situations require different lengths.

Creating all three versions ensures consistency across platforms and marketing materials.

## Short Description

### Recommended Length

- 10–25 words.

### Typical Usage

- Social media bios
- GitHub profiles
- Directory listings
- Author profiles

### Example

> "A creative studio focused on worldbuilding, publishing, and digital products."

## Standard Description

### Recommended Length

- 40–100 words.

### Typical Usage

- Website home pages
- LinkedIn pages
- Product pages
- Press introductions

### Example

> "A creative studio developing original intellectual properties, educational resources, and digital products that support creators and creative communities."

## Extended Description

### Recommended Length

- 150–300 words.

### Typical Usage

- About pages
- Media kits
- Partnership documents
- Press releases
- Company profiles

### Example Structure

- Introduction
- What the organization creates
- Who it serves
- Long-term vision
- Closing statement
Overall, your conversion specification matches the Identity System PDF very well. One refinement I'd recommend for future conversions is to explicitly define how to handle tables that are actually being used as three-column layouts (like the "Manifesto" and "Extended Description" pages). In those cases, the converter should preserve them as Markdown tables rather than converting each column into separate headings. That keeps the structure closer to the original while remaining machine-readable.



02. Brand System(1).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version:
status:
tags:
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

The conversion prompt is suitable for this document as well. The Brand System PDF follows the same structure as the Identity System, and the output should preserve all framework content while removing only presentation elements. 


Below is the official Markdown conversion.

---
systemNumber: 2
systemName: Brand System
capability: Foundation
question: How do we present ourselves?
scope: Defines how the organization expresses its identity consistently across every audience, channel, and experience.
version:
status:
tags:
---

# 2. Brand System

**Capability:** Foundation

**Guiding Question:** How do we present ourselves?

## System Scope

Defines how the organization expresses its identity consistently across every audience, channel, and experience.

## Index

1. Overview
2. Brand Kit
3. Logo Specification
4. Color System
5. Typography System
6. Visual Language
7. Brand Applications
8. Brand Rules
9. Asset Inventory

---

# 1. Overview

## Purpose

The Brand System translates an organization's identity into a recognizable visual and practical brand.

While the Identity System defines who the organization is, the Brand System defines how it is presented.

A consistent brand improves:

- Recognition
- Trust
- Professionalism
- Communication
- User experience

## When to Use

Use this system whenever:

- Creating a new brand
- Building a brand identity
- Defining brand positioning
- Establishing brand guidelines
- Managing brand consistency
- Expanding an existing brand

## Outcome

By completing this document, you will have:

- A clear visual identity
- Logo guidelines
- Color standards
- Typography standards
- Visual design principles
- Brand application guidelines
- Brand usage rules
- A catalog of brand assets

---

# 2. Brand Kit

## Purpose

The Brand Kit provides a quick overview of the brand.

It acts as a summary that can be shared with collaborators, designers, partners, and team members.

## Brand Summary

Provide a short description of the visual identity.

### Example

> "The brand combines simplicity, professionalism, and creativity through clean typography, restrained colors, and minimal visual elements."

## Brand Attributes

Select 3–7 characteristics that define the visual identity.

### Example

- Professional
- Modern
- Creative
- Elegant
- Friendly
- Technical
- Minimal

## Brand Keywords

List words that should guide design decisions.

### Example

- Clarity
- Simplicity
- Structure
- Exploration
- Reliability

---

# 3. Logo Specification

## Purpose

The Logo Specification defines the approved logo versions and how they should be used.

Consistent logo usage improves recognition and professionalism.

## Logo Variations

List all approved versions.

### Example

- Primary Logo
- Secondary Logo
- Icon
- Monochrome Logo
- Light Version
- Dark Version

## Preferred Usage

Identify the primary logo and when it should be used.

## Minimum Size

Define the smallest recommended size.

## Clear Space

Describe the required space around the logo.

## Background Usage

Describe acceptable backgrounds.

### Example

- Light backgrounds
- Dark backgrounds
- Solid colors
- Photography

## Incorrect Usage

Avoid:

- Stretching
- Rotating
- Recoloring
- Distorting
- Adding effects

---

# 4. Color System

## Purpose

The Color System defines the official brand colors.

Consistent color usage improves recognition and visual cohesion.

## Primary Colors

| Color 1 | Color 2 |
|----------|----------|
| **Name:** | **Name:** |
| **HEX:** | **HEX:** |
| **Usage:** | **Usage:** |

## Secondary Colors

| Color 1 | Color 2 |
|----------|----------|
| **Name:** | **Name:** |
| **HEX:** | **HEX:** |
| **Usage:** | **Usage:** |

## Neutral Colors

| Color 1 | Color 2 |
|----------|----------|
| **Name:** | **Name:** |
| **HEX:** | **HEX:** |
| **Usage:** | **Usage:** |

## Color Usage Guidelines

Explain when and how colors should be used.

### Example

- Primary colors for branding
- Secondary colors for accents
- Neutral colors for backgrounds and text

---

# 5. Typography System

## Purpose

The Typography System defines how text should appear across all brand materials.

Consistent typography improves readability and recognition.

## Typeface Specifications

| Primary Typeface | Secondary Typeface |
|------------------|--------------------|
| **Name:** | **Name:** |
| **Purpose:** | **Purpose:** |
| **Examples:** | **Examples:** |
| - Headlines | - Headlines |
| - Titles | - Titles |
| - Display text | - Display text |

### Optional Typeface

```text
Name:

Purpose:

Examples:
- Headlines
- Titles
- Display text
```

## Text Hierarchy

| Heading 1 | Heading 2 | Heading 3 | Body Text |
|------------|------------|------------|-----------|
| Usage | Usage | Usage | Usage |

---

# 6. Visual Language

## Purpose

Visual Language defines the overall appearance of the brand beyond logos and colors.

It creates consistency across all visual materials.

| Imagery | Graphic Elements |
|---------|------------------|
| Describe preferred image styles. | Describe supporting visual elements. |
| **Examples:** | **Examples:** |
| - Photography | - Icons |
| - Illustration | - Patterns |
| - Digital art | - Borders |
| - Technical diagrams | - Shapes |

| Layout Style | Visual Characteristics |
|--------------|------------------------|
| Describe preferred layouts. | Select characteristics that describe the visual style. |
| **Examples:** | **Examples:** |
| - Minimal | - Clean |
| - Spacious | - Modern |
| - Structured | - Technical |
| - Editorial | - Elegant |
| | - Bold |
| | - Playful |

---

# 7. Brand Applications

## Purpose

Brand Applications define where and how the brand should appear.

This ensures consistency across platforms and materials.

## Website

Describe branding requirements for the website.

## Social Media

Describe branding requirements for social profiles and content.

## Documents

Describe branding requirements for reports, guides, and presentations.

## Products

Describe branding requirements for digital and physical products.

## Marketing Materials

Describe branding requirements for advertisements, campaigns, and promotional content.

---

# 8. Brand Rules

## Purpose

Brand Rules establish standards that protect brand consistency.

They help ensure the brand is presented correctly regardless of who creates the content.

## Always Do

List practices that should always be followed.

### Example

- Use approved logos
- Use approved colors
- Follow typography standards

## Never Do

List practices that should be avoided.

### Example

- Modify logos
- Use unapproved fonts
- Use inconsistent colors

## Exceptions

Document approved exceptions if necessary.

---

# 9. Asset Inventory

## Purpose

The Asset Inventory records all official brand assets.

It provides a central reference for managing and locating brand resources.

## Logo Assets

List all logo files and versions.

## Icon Assets

List all icon files and versions.

## Typography Assets

List approved font files and licenses.

## Graphic Assets

List illustrations, patterns, templates, and supporting graphics.

## Brand Documents

List related documents.

### Example

- Identity System
- Brand System
- Media Kit

## Storage Location

Record where brand assets are stored and maintained.

### Example

- Google Drive
- OneDrive
- Dropbox
- Git Repository
This conversion preserves the framework structure while removing PDF-specific presentation. It also preserves the original tables (Color System, Typography System, Visual Language, and Text Hierarchy) as Markdown tables instead of flattening them, making the document suitable as a canonical source for editing, AI interpretation, parsing, version control, and future application rendering. 




03. Strategy System(1).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 3
systemName: Strategy System
capability: Foundation
question: Where are we going and how will we get there?
scope: Defines the long-term direction, priorities, objectives, and strategic choices that guide organizational development.
version: 1
---

# 3. Strategy System

**Capability:** Foundation

**Guiding Question:** Where are we going and how will we get there?

## System Scope

Defines the long-term direction, priorities, objectives, and strategic choices that guide organizational development.

## Index

1. Overview
2. Current Situation Analysis
3. SWOT Analysis
4. Strategic Compass
5. Strategic Themes
6. Goals
7. Objectives
8. Key Initiatives
9. Success Metrics
10. Strategic Roadmap

---

# 1. Overview

## Purpose

The Strategy System helps define direction, priorities, and long-term focus.

It provides a structured way to understand the current situation, identify opportunities, establish priorities, and create a practical path forward.

This system should be reviewed regularly and updated as circumstances change.

## When to Use

Use this system whenever:

- Defining long-term direction
- Setting strategic objectives
- Planning future growth
- Prioritising initiatives
- Evaluating opportunities
- Making strategic decisions

## Outcome

By completing this document, you will have:

- A clear understanding of the current situation
- Awareness of strengths and weaknesses
- Defined strategic priorities
- Long-term goals
- Practical objectives
- Actionable initiatives
- Measurable indicators of success
- A strategic roadmap

---

# 2. Current Situation Analysis

## Purpose

This section captures the organization's current position.

It establishes a starting point for future planning.

Without understanding the present, it is difficult to define a realistic future.

## Current State

Describe the current situation.

Consider:

- Organization size
- Products or services
- Audience
- Resources
- Capabilities
- Challenges

## Opportunities

Identify opportunities currently available.

## Challenges

Identify major challenges or limitations.

---

# 3. SWOT Analysis

## Purpose

SWOT provides a structured overview of internal and external factors.

It helps identify advantages, risks, and areas for improvement.

## Strengths

Internal advantages.

## Weaknesses

Internal limitations.

## Opportunities

External possibilities.

## Threats

External risks.

---

# 4. Strategic Compass

## Purpose

The Strategic Compass defines the overall direction of the organization.

It acts as a decision-making reference.

When evaluating opportunities, they should align with the compass.

## Long-Term Direction

Describe the desired future direction.

## Focus Areas

List the areas that deserve the highest attention.

### Example

- Growth
- Education
- Publishing
- Community
- Product Development

## Strategic Assumptions

Document the assumptions that support the current strategy.

### Example

- Customer demand will continue to grow.
- Technology adoption will increase.
- Current regulations will remain stable.
- Required resources will remain available.

Review these assumptions periodically to determine whether the strategy remains valid.

## Decision Filters

List the criteria used when making strategic decisions.

### Example

- Supports long-term goals
- Strengthens core capabilities
- Creates sustainable value
- Aligns with organizational values

---

# 5. Strategic Themes

## Purpose

Strategic Themes are the major areas of focus for the planning period.

They help organize goals and initiatives.

Themes are broad priorities rather than specific actions.

| Theme 1 | Theme 2 | Theme 3 | Theme 4 |
|----------|----------|----------|----------|
| Description | Description | Description | Description |

---

# 6. Goals

## Purpose

Goals define the desired outcomes.

They describe what success looks like.

Goals should be ambitious but realistic.

| Goal 1 | Goal 2 | Goal 3 | Goal 4 |
|---------|---------|---------|---------|
| Description | Description | Description | Description |

---

# 7. Objectives

## Purpose

Objectives translate goals into specific achievements.

They should be measurable and time-bound whenever possible.

| Objective 1 | Objective 2 | Objective 3 |
|--------------|--------------|--------------|
| **Related Goal:** | **Related Goal:** | **Related Goal:** |
| **Description:** | **Description:** | **Description:** |
| **Target Date:** | **Target Date:** | **Target Date:** |

---

# 8. Key Initiatives

## Purpose

Initiatives are the major projects and actions that will help achieve objectives.

This section connects strategy with execution.

| Initiative 1 | Initiative 2 | Initiative 3 |
|--------------|--------------|--------------|
| **Related Objective:** | **Related Objective:** | **Related Objective:** |
| **Description:** | **Description:** | **Description:** |
| **Owner:** | **Owner:** | **Owner:** |
| **Status:** | **Status:** | **Status:** |

---

# 9. Success Metrics

## Purpose

Success Metrics help evaluate progress.

They provide evidence that the strategy is working.

Focus on metrics that genuinely support decision-making.

| Metric 1 | Metric 2 | Metric 3 |
|-----------|-----------|-----------|
| **Description:** | **Description:** | **Description:** |
| **Target:** | **Target:** | **Target:** |
| **Current Value:** | **Current Value:** | **Current Value:** |

---

# 10. Strategic Roadmap

## Purpose

The Strategic Roadmap provides a high-level timeline for implementing the strategy.

It helps coordinate priorities and manage expectations.

| Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|----------|----------|----------|----------|
| **Time Period:** | **Time Period:** | **Time Period:** | **Time Period:** |
| **Focus:** | **Focus:** | **Focus:** | **Focus:** |
| **Key Deliverables:** | **Key Deliverables:** | **Key Deliverables:** | **Key Deliverables:** |
This conversion follows your specification:

Removes all presentation-only elements (logos, headers, footers, page numbers, branding, layout).

Preserves the original wording and section order.

Converts every structured layout into Markdown.

Preserves all tables as Markdown tables rather than flattening them.

Includes the requested YAML front matter with version: 1.

Produces a canonical Markdown source suitable for editing, AI interpretation, version control, parsing, and future rendering. 




04. Business System(4).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 4
systemName: Business System
capability: Foundation
question: How do we create, deliver, and capture value?
scope: Defines how the organization creates, delivers, and sustains value over time.
version: 1
---

# 4. Business System

**Capability:** Foundation

**Guiding Question:** How do we create, deliver, and capture value?

## System Scope

Defines how the organization creates, delivers, and sustains value over time.

## Index

1. Overview
2. Business Plan
3. Business Model
4. Revenue Model
5. Revenue Streams
6. Product Register
7. Customer Profiles
8. Competitor Analysis
9. Pricing Strategy
10. Revenue Roadmap

---

# 1. Overview

## Purpose

The Business System helps document how an organization creates value, serves customers, generates revenue, and sustains operations.

It provides a structured framework for understanding the commercial side of an organization.

## When to Use

Use this system whenever:

- Creating a business
- Developing a business model
- Planning commercial activities
- Defining revenue streams
- Managing business growth
- Evaluating business opportunities

## Outcome

By completing this document, you will have:

- A documented business model
- Defined revenue mechanisms
- A product portfolio
- Customer profiles
- Market awareness
- Pricing guidelines
- Revenue priorities
- A revenue roadmap

---

# 2. Business Plan

## Purpose

The Business Plan provides a high-level summary of the business.

It provides a high-level overview of the organization's commercial activities.

## Organization Overview

Describe the organization and its primary activities.

## Products and Services

Summarize the main offerings.

## Customers

Summarize the primary customer groups.

## Revenue Summary

Summarize how revenue is generated.

## Business Priorities

Summarize current business priorities.

---

# 3. Business Model

## Purpose

The Business Model explains how value is created, delivered, and captured.

It describes how the organization operates commercially.

## Value Proposition

What value is provided?

## Customer Segments

Who receives that value?

## Delivery Channels

How is value delivered?

## Key Resources

What resources support the business?

## Key Activities

What activities are required?

## Key Partnerships

What external relationships are important?

---

# 4. Revenue Model

## Purpose

The Revenue Model explains how customers pay for products or services.

It defines the structure of revenue generation.

## Revenue Methods

### Example

- One-Time Purchase
- Subscription
- Membership
- Licensing
- Royalties
- Services

## Preferred Revenue Methods

Identify the primary methods.

## Revenue Mix

Estimate the contribution of each method.

---

# 5. Revenue Streams

## Purpose

Revenue Streams identify the specific sources of revenue.

While the Revenue Model explains how money is collected, Revenue Streams explain where money comes from.

## Revenue Stream 1

Description

## Revenue Stream 2

Description

## Revenue Stream 3

Description

## Revenue Stream 4

Description

---

# 6. Product Register

## Purpose

The Product Register records all products and services.

It provides visibility into the organization's commercial offerings.

## Product Portfolio

For each product record:

- Name
- Category
- Status
- Target Customer
- Revenue Stream

---

# 7. Customer Profiles

## Purpose

Customer Profiles describe the people, organizations, or groups served by the business.

Understanding customers improves product, pricing, and marketing decisions.

| Customer Group 1 | Customer Group 2 | Customer Group 3 |
|------------------|------------------|------------------|
| **Description** | **Description** | **Description** |
| **Needs** | **Needs** | **Needs** |
| **Challenges** | **Challenges** | **Challenges** |
| **Goals** | **Goals** | **Goals** |

---

# 8. Competitor Analysis

## Purpose

Competitor Analysis helps understand the market environment.

It identifies alternatives available to customers.

| Competitor 1 | Competitor 2 |
|--------------|--------------|
| **Description** | **Description** |
| **Strengths** | **Strengths** |
| **Weaknesses** | **Weaknesses** |
| **Differentiators** | **Differentiators** |

## Market Position

Describe how the organization differs from competitors.

---

# 9. Pricing Strategy

## Purpose

Pricing Strategy defines how products and services are priced.

It helps ensure consistency and sustainability.

## Pricing Approach

### Example

- Budget
- Competitive
- Premium
- Value-Based

## Pricing Principles

List pricing rules and considerations.

## Pricing Tiers

Describe pricing categories if applicable.

---

# 10. Revenue Roadmap

## Purpose

The Revenue Roadmap provides a high-level view of revenue development over time.

It helps prioritize business growth initiatives.

| Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|----------|----------|----------|----------|
| **Time Period:** | **Time Period:** | **Time Period:** | **Time Period:** |
| **Focus:** | **Focus:** | **Focus:** | **Focus:** |
| **Expected Revenue Sources:** | **Expected Revenue Sources:** | **Expected Revenue Sources:** | **Expected Revenue Sources:** |
This conversion follows your specification exactly:

Removes all presentation-only elements (logos, branding, headers, footers, page numbers, decorative elements, layout).

Preserves the original wording without rewriting or summarizing.

Maintains the exact section order and hierarchy.

Converts all lists to Markdown lists.

Preserves structured layouts as Markdown tables (Customer Profiles, Competitor Analysis, Revenue Roadmap).

Uses blockquotes only for examples.

Includes the requested YAML front matter with version: 1.

Produces a canonical Markdown source suitable for editing, AI interpretation, version control, software parsing, and future application rendering. 




05. Client System(10).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 5
systemName: Client System
capability: Deliver Value
question: Who are our clients and how do we manage those relationships?
scope: Defines who the organization serves, what they need, and how lasting customer relationships are developed.
version: 1
---

# 5. Client System

**Capability:** Deliver Value

**Guiding Question:** Who are our clients and how do we manage those relationships?

## System Scope

Defines who the organization serves, what they need, and how lasting customer relationships are developed.

## Index

1. Overview
2. Clients
3. Requests
4. Services
5. Relationships
6. Summary

---

# 1. Overview

## Purpose

The Client System provides a structured framework for recording, managing, and maintaining client information.

It helps individuals, teams, organizations, and creators understand client needs, manage services, and maintain strong client relationships.

## When to Use

Use this system whenever:

- Working with clients
- Delivering services
- Managing client relationships
- Tracking client requests
- Reviewing client activity

## Outcome

By completing this system, you will have:

- A documented client list
- Recorded client requests
- Defined services
- Improved relationship visibility
- A clear client summary

---

# 2. Clients

## Purpose

The Clients section records important information about each client.

## Client Record

For each client record:

### 1. Client Name

Name of the client.

### 2. Client Type

#### Example

- Individual
- Business
- Organization
- Agency
- Non-Profit

### 3. Description

Brief description of the client.

### 4. Primary Contact

Main contact person or contact information.

### 5. Status

#### Example

- Prospect
- Active
- Inactive
- Former

---

# 3. Requests

## Purpose

The Requests section records what clients want, need, or have asked for.

## Request Record

For each request record:

### 1. Client

Related client.

### 2. Request

What has the client requested?

### 3. Priority

#### Example

- High
- Medium
- Low

### 4. Status

#### Example

- Open
- In Progress
- Completed

---

# 4. Services

## Purpose

The Services section records what is provided to each client.

## Service Record

For each service record:

### 1. Client

Related client.

### 2. Service

What service is being provided?

### 3. Related Project

Associated project, if applicable.

### 4. Status

#### Example

- Planned
- Active
- Completed

---

# 5. Relationships

## Purpose

The Relationships section records the current state and importance of client relationships.

## Relationship Record

For each relationship record:

### 1. Client

Related client.

### 2. Relationship Type

#### Example

- New Client
- Returning Client
- Long-Term Client
- Strategic Partner

### 3. Notes

Important information about the relationship.

### 4. Status

#### Example

- Healthy
- At Risk
- Inactive

---

# 6. Summary

## Purpose

The Summary provides a high-level overview of client relationships and activities.

## Active Clients

Clients currently being served.

## Priority Requests

Most important client requests.

## Active Services

Services currently being provided.

## Key Relationships

Most important client relationships.

## Key Takeaway

Most important insight about current client activity.

## Next Review

When should client information be reviewed again?
This conversion follows your specification:

Removes all presentation-only elements (logos, icons, headers, footers, page numbers, branding, layout).

Preserves the exact wording, hierarchy, and section order.

Converts all numbered structures into Markdown headings.

Converts all example lists into Markdown bullet lists and formats them under #### Example.

Includes the required YAML front matter with version: 1.

Produces a clean canonical Markdown source suitable for editing, AI interpretation, version control, software parsing, and future application rendering. 




06. Project System(9).pdf
PDF
---
systemNumber: 6
systemName: Project System
capability:
question:
scope:
version: 1
---

I don't have the **Project System** PDF attached in this conversation.

The most recently

---
systemNumber: 6
systemName: Project System
capability: Deliver Value
question: How do we plan, execute, and complete projects?
scope: Defines how projects are planned, coordinated, delivered, and reviewed to achieve successful outcomes.
version: 1
---

# 6. Project System

**Capability:** Deliver Value

**Guiding Question:** How do we plan, execute, and complete projects?

## System Scope

Defines how projects are planned, coordinated, delivered, and reviewed to achieve successful outcomes.

## Index

1. Overview
2. Project Overview
3. Project Purpose
4. Project Scope
5. Project Resources
6. Deliverables
7. Milestones
8. Project Status

---

# 1. Overview

## Purpose

The Project System provides a structured framework for organizing and documenting projects.

It helps individuals, teams, businesses, and organizations maintain a clear understanding of project objectives, scope, resources, deliverables, progress, and next actions.

## When to Use

Use this system whenever:

- Work needs to be planned and coordinated
- Resources need to be organized
- Progress needs to be tracked
- Deadlines need to be managed
- Deliverables need to be completed
- Projects require monitoring and review

## Outcome

By completing this system, you will have:

- A defined project
- Clear objectives
- Defined scope
- Organized resources
- Defined deliverables
- Measurable milestones
- A clear next step

---

# 2. Project Overview

## Purpose

The Project Overview provides a high-level summary of the project.

What is this project?

## Project Name

## Project Type

### Example

- Product
- Website
- Publication
- Event
- Campaign
- Creative Project
- Business Initiative

## Summary

Provide a short description of the project.

---

# 3. Project Purpose

## Purpose

The Project Purpose explains why the project exists and what success looks like.

Why are we doing this?

## Objective

What is the primary objective?

## Desired Outcome

What should exist when the project is finished?

### Example

- Website launched
- Product released
- Book published
- Event completed
- Campaign delivered

## Success Criteria

How will success be measured?

### Example

- Revenue generated
- Users acquired
- Copies sold
- Visitors reached
- Deliverables completed

---

# 4. Project Scope

## Purpose

The Project Scope defines what is included and excluded from the project.

It establishes clear boundaries and helps prevent unnecessary work or changing expectations during delivery.

## Included

Record items included within the project.

## Excluded

Record items intentionally excluded from the project.

## Project Constraints

Document the primary limitations that may influence project planning and delivery.

### Example

- Time
- Budget
- Resources
- Scope
- Technical limitations
- Regulatory requirements

## Related Systems

Record systems connected to the project.

### Example

- Brand System
- Product Development System
- Publishing System
- Website System
- Worldbuilding System

---

# 5. Project Resources

## Purpose

The Project Resources section records the documents, systems, assets, and references used by the project.

What resources support this project?

## Resource Record

### 1. Resource Name

### 2. Resource Type

#### Example

- System
- Document
- Asset
- Research
- Reference

### 3. Description

Describe how the resource supports the project.

---

# 6. Deliverables

## Purpose

Deliverables are the outputs produced by the project.

What must be created?

## Deliverable Record

### 1. Deliverable Name

### 2. Description

### 3. Priority

#### Example

- Critical
- Important
- Optional

### 4. Status

#### Example

- Planned
- In Progress
- Completed

---

# 7. Milestones

## Purpose

Milestones are significant achievements within the project.

They help measure progress and indicate movement toward completion.

## Milestone Record

### 1. Milestone Name

### 2. Description

### 3. Success Condition

How do you know the milestone has been achieved?

### 4. Status

#### Example

- Planned
- In Progress
- Completed

---

# 8. Project Status

## Purpose

The Project Status section provides a snapshot of the project's current state.

Where are we now?

## Current Phase

### Example

- Planning
- Development
- Review
- Launch
- Completed

## Current Status

### Example

- Active
- On Hold
- Completed
- Cancelled

## Next Step

What is the next action required to move the project forward?
This conversion preserves the original Framework while removing only presentation-specific elements. It maintains the exact wording, hierarchy, section order, examples, and structure from the PDF, includes the requested YAML front matter with version: 1, and produces a canonical Markdown document suitable for editing, AI interpretation, version control, software parsing, and future application rendering. 




07. Product Development System(5).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 7
systemName: Product Development System
capability: Deliver Value
question: How do we develop and improve products?
scope: Defines how products and services are designed, developed, maintained, and continuously improved.
version: 1
---

# 7. Product Development System

**Capability:** Deliver Value

**Guiding Question:** How do we develop and improve products?

## System Scope

Defines how products and services are designed, developed, maintained, and continuously improved.

## Index

1. Overview
2. Product Register
3. Product Validation
4. Product Brief
5. Product Specification
6. Product Roadmap
7. Product Launch Checklist
8. Product Review

---

# 1. Overview

## Purpose

The Product Development System provides a structured framework for transforming ideas into released products.

It helps organizations evaluate opportunities, define products, plan development, prepare launches, and review results.

The system is designed to support a complete product lifecycle from initial concept to post-launch evaluation.

## When to Use

Use this system whenever:

- A new product is being developed
- An existing product is being improved
- Product ideas need evaluation
- Features need to be planned
- Development progress needs tracking
- Products require ongoing improvement

## Outcome

By completing this system, you will have:

- A documented product portfolio
- Validated product opportunities
- Defined product requirements
- Development priorities
- Launch preparation
- Product insights and learnings

---

# 2. Product Register

## Purpose

The Product Register records all products within the organization.

It provides visibility across the product portfolio and helps track product status over time.

## Product Portfolio

For each product record:

- Product Name
- Category
- Status
- Launch Date

## Product Status

### Example

- Planned
- In Development
- Released
- Retired

---

# 3. Product Validation

## Purpose

Product Validation helps determine whether a product should be developed.

The goal is to reduce risk before investing significant time and resources.

## Problem

What problem does the product solve?

## Evidence of Demand

What evidence suggests people want this product?

### Example

- Customer requests
- Market research
- Surveys
- Existing sales
- Audience feedback

## Existing Alternatives

What alternatives already exist?

## Strategic Fit

Does the product support the organization's goals and priorities?

## Decision

### Example

- Proceed
- Rework
- Pause
- Reject

---

# 4. Product Brief

## Purpose

The Product Brief provides a concise summary of the product.

It explains what is being built, who it is for, and why it matters.

## Product Overview

Describe the product.

## Target Customer

Who is the product for?

## Problem Statement

What problem does the product solve?

## Value Proposition

Why should customers choose this product?

## Success Criteria

How will success be measured?

---

# 5. Product Specification

## Purpose

The Product Specification defines how the product should function.

It provides the requirements needed to develop or produce the product.

## Features

List the core features.

## Requirements

Define the key requirements.

## Deliverables

List the expected outputs.

## Dependencies

Identify required tools, resources, or external factors.

## Constraints

Identify limitations, restrictions, or requirements.

---

# 6. Product Roadmap

## Purpose

The Product Roadmap provides a high-level timeline for product development.

It helps organize priorities, phases, and expectations.

### Example

| Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|----------|----------|----------|----------|
| **Validation** | **Development** | **Testing** | **Launch** |
| **Time Period:** | **Time Period:** | **Time Period:** | **Time Period:** |
| **Focus:** | **Focus:** | **Focus:** | **Focus:** |
| **Deliverables:** | **Deliverables:** | **Deliverables:** | **Deliverables:** |

---

# 7. Product Launch Checklist

## Purpose

The Product Launch Checklist helps ensure products are ready for release.

It provides a final review before launch.

## Product Readiness

- Product Completed
- Testing Completed
- Documentation Completed

## Marketing Readiness

- Product Description Completed
- Product Images Prepared
- Launch Content Prepared

## Sales Readiness

- Pricing Defined
- Sales Platform Ready
- Payment Processing Active

## Launch Approval

Ready for Release:

```text
Yes / No
```

---

# 8. Product Review

## Purpose

The Product Review captures results, feedback, and lessons learned after launch.

It helps improve future products and development processes.

## Performance

How did the product perform?

## Customer Feedback

What feedback was received?

## Successes

What worked well?

## Challenges

What problems occurred?

## Lessons Learned

What should be improved next time?

## Next Actions

What happens next?

### Example

- Improve Product
- Expand Product
- Retire Product
- Create Follow-Up Product
This conversion adheres to your specification by preserving the framework's wording, hierarchy, and order while removing all presentation-specific PDF elements. It includes the requested YAML front matter (version: 1), converts lists and the roadmap into Markdown, preserves examples, and produces a canonical Markdown source suitable for editing, AI interpretation, version control, software parsing, and future application rendering. 




08. Operations System(2).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 8
systemName: Operations System
capability: Deliver Value
question: How do we perform our day-to-day work?
scope: Defines how everyday activities are organized, executed, and improved to deliver consistent operational performance.
version: 1
---

# 8. Operations System

**Capability:** Deliver Value

**Guiding Question:** How do we perform our day-to-day work?

## System Scope

Defines how everyday activities are organized, executed, and improved to deliver consistent operational performance.

## Index

1. Overview
2. Handbook
3. Processes
4. SOP Library
5. Operational Log
6. Roles & Responsibilities

---

# 1. Overview

## Purpose

The Operations System provides a structured framework for documenting how an organization operates.

It helps maintain consistency, improve efficiency, record important operational information, and support long-term organizational stability.

## When to Use

Use this system whenever:

- Recurring work needs to be managed
- Operational processes need to be defined
- Responsibilities need to be coordinated
- Daily activities require consistency
- Operational performance needs monitoring
- Operations require continuous improvement

## Outcome

By completing this system, you will have:

- Operational standards
- Documented processes
- Standard operating procedures
- Operational records
- Defined responsibilities

---

# 2. Handbook

## Purpose

The Handbook provides a high-level overview of how the organization operates.

It serves as the primary operational reference.

## Operational Purpose

Why does the organization operate the way it does?

## Operational Structure

Describe how work is organized.

## Key Rules

Record important operational rules and expectations.

---

# 3. Processes

## Purpose

The Processes section records recurring organizational activities.

## Process Record

For each process record:

- Process Name
- Purpose
- Status
- Related SOP

## Process Status

### Example

- Active
- Under Review
- Retired

---

# 4. SOP Library

## Purpose

A Standard Operating Procedure (SOP) is a documented set of instructions describing how a process is performed.

The SOP Library records detailed operational procedures.

## SOP Record

For each SOP record:

- SOP Name
- Related Process
- Instructions

---

# 5. Operational Log

## Purpose

The Operational Log records important operational events, decisions, improvements, and changes.

It helps preserve important organizational history and context.

## Log Entry

For each log record:

- Date
- Type
- Description
- Reason
- Outcome

## Log Types

### Example

- Decision
- Change
- Improvement
- Issue
- Update

---

# 6. Roles & Responsibilities

## Purpose

The Roles & Responsibilities section defines ownership and accountability across organizational activities.

## Responsibility Record

For each responsibility record:

- Activity
- Responsible Person or Team
- Notes
This conversion follows your specification exactly:

Preserves the original Framework wording without rewriting or summarizing.

Removes all presentation-specific elements (logos, branding, headers, footers, page numbers, decorative graphics, and layout).

Maintains the original hierarchy and section order.

Converts all lists into Markdown lists.

Includes the requested YAML front matter with version: 1.

Produces a canonical Markdown source suitable for human editing, AI interpretation, version control, software parsing, and future application rendering. 




09. Innovation System(4).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 9
systemName: Innovation System
capability: Deliver Value
question: How do we generate, evaluate, and implement new ideas?
scope: Defines how opportunities, ideas, and improvements are explored, evaluated, and transformed into organizational value.
version: 1
---

# 9. Innovation System

**Capability:** Deliver Value

**Guiding Question:** How do we generate, evaluate, and implement new ideas?

## System Scope

Defines how opportunities, ideas, and improvements are explored, evaluated, and transformed into organizational value.

## Index

1. Overview
2. Ideas
3. Evaluation
4. Actions
5. Summary

---

# 1. Overview

## Purpose

The Innovation System provides a structured framework for capturing ideas, evaluating potential value, and identifying future actions.

It helps individuals, teams, organizations, and creators explore possibilities before committing resources, projects, or strategic initiatives.

## When to Use

Use this system whenever:

- New ideas emerge
- Improvements are proposed
- Opportunities are identified
- Future initiatives are being considered
- Decisions require evaluation

## Outcome

By completing this system, you will have:

- A documented idea list
- Evaluated opportunities
- Defined next actions
- Improved visibility of future possibilities
- A clear innovation summary

---

# 2. Ideas

## Purpose

The Ideas section records potential improvements, initiatives, products, services, solutions, or opportunities.

## Idea Record

### 1. Idea

What is the idea?

### 2. Description

Brief description of the idea.

### 3. Potential Value

What benefit could it provide?

### 4. Status

#### Example

- New
- Under Review
- Approved
- Rejected

---

# 3. Evaluation

## Purpose

Evaluation determines whether an idea is practical, valuable, and aligned with organizational goals before resources are committed.

## Evaluation Record

### 1. Idea

Related idea.

### 2. Assessment

What was discovered during evaluation?

### 3. Feasibility

#### Example

- High
- Medium
- Low

### 4. Potential Impact

#### Example

- High
- Medium
- Low

### 5. Implementation Effort

#### Example

- Low
- Medium
- High

### 6. Recommendation

#### Example

- Proceed
- Investigate Further
- Hold
- Reject

---

# 4. Actions

## Purpose

The Actions section records the next steps resulting from idea evaluations.

## Action Record

### 1. Action

What should happen next?

### 2. Related Idea

Which idea does this action support?

### 3. Priority

#### Example

- High
- Medium
- Low

### 4. Status

#### Example

- Planned
- In Progress
- Completed

---

# 5. Summary

## Purpose

The Summary provides a high-level overview of innovation activities.

## Key Ideas

Most promising ideas.

## Key Evaluations

Most important conclusions from evaluations.

## Priority Actions

Most important next steps.

## Key Takeaway

Most important innovation insight.

## Next Review

When should innovation activities be reviewed again?
This conversion follows your specification:

Removes all presentation-specific elements (logos, icons, branding, headers, footers, page numbers, decorative graphics, and PDF layout).

Preserves the original wording, hierarchy, and section order exactly.

Converts all lists into Markdown lists.

Uses heading levels to represent the framework structure.

Includes the required YAML front matter with version: 1.

Produces a canonical Markdown source suitable for human editing, AI interpretation, version control, software parsing, and future application rendering. 




10. Documentation System(4).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 10
systemName: Documentation System
capability: Manage Information
question: How do we document organizational information?
scope: Defines how organizational documentation is created, structured, maintained, and governed.
version: 1
---

# 10. Documentation System

**Capability:** Manage Information

**Guiding Question:** How do we document organizational information?

## System Scope

Defines how organizational documentation is created, structured, maintained, and governed.

## Index

1. Overview
2. Folder Structure
3. Metadata Standards
4. Categories
5. Dictionaries
6. Naming Conventions
7. Templates
8. Documentation Rules

---

# 1. Overview

## Purpose

The Documentation System provides a structured framework for organizing, managing, and maintaining information.

It helps organizations create consistent documentation practices, improve information retrieval, and support long-term knowledge management.

## When to Use

Use this system whenever:

- Documentation needs to be organized
- Documentation standards need to be established
- Information needs to remain accessible
- Documents require consistent structure
- Documentation needs regular maintenance
- Documentation should support long-term organizational knowledge

## Outcome

By completing this system, you will have:

- An organized folder structure
- Defined document standards
- Information categories
- Standardized terminology
- Consistent naming conventions
- Reusable templates
- Documentation maintenance rules

---

# 2. Folder Structure

## Purpose

The Folder Structure defines where information is stored.

It provides a consistent organizational structure for documentation.

## Folder List

Record the primary folders and their purposes.

### Folder 1

Purpose:

### Folder 2

Purpose:

## Folder Rules

Define how folders should be created and organized.

#### Example

- Avoid duplicate folders.
- Use consistent folder names.
- Store information in the most relevant location.

---

# 3. Metadata Standards

## Purpose

Metadata is information attached to a document that helps describe, classify, and manage it.

The Metadata Standards define which metadata fields should be used.

## Metadata Fields

Record the metadata fields used throughout the documentation system.

## Metadata Rules

Define how metadata should be completed and maintained.

## Metadata Example

> Title: Website System
>
> Version: 1.0
>
> Status: Active

---

# 4. Categories

## Purpose

Categories define how information is grouped and classified.

They help maintain consistency across the documentation system.

## Categories

Record the primary categories used throughout the documentation system.

#### Example

- Projects
- Products
- Articles
- Characters
- Worlds
- Resources

## Category Rules

Define how information should be categorized.

#### Example

- Every document should belong to at least one category.
- Categories should remain consistent across the system.
- Avoid creating duplicate categories.

---

# 5. Dictionaries

## Purpose

Dictionaries record important terms and their definitions.

It helps maintain consistent language across documentation.

## Term Record

| Term 1 | Term 2 |
|--------|--------|
| **Definition:** | **Definition:** |
| **Usage:** | **Usage:** |

---

# 6. Naming Conventions

## Purpose

The Naming Conventions define how files, folders, and documents should be named.

Consistent naming improves organization and searchability.

## Naming Rules

Record naming standards.

#### Example

- Use descriptive names.
- Avoid special characters.
- Use consistent capitalization.

## Examples

> website_system_v1
>
> brand_kit_v2
>
> project_overview_v1

## Exceptions

Record any approved exceptions.

---

# 7. Templates

## Purpose

Templates provide standardized structures for recurring document types.

They improve consistency, reduce document creation time, and clarify ownership and maintenance responsibilities.

In larger organizations, assigning an **Owner** helps ensure each template is reviewed, maintained, and kept up to date. In smaller organizations, the owner may simply be the person responsible for creating and maintaining the template.

## Template Record

| Template Name A | Template Name B |
|-----------------|-----------------|
| **Purpose:** | **Purpose:** |
| **Usage:** | **Usage:** |
| **Owner:** | **Owner:** |
| **Review Frequency:** | **Review Frequency:** |

---

# 8. Documentation Rules

## Purpose

The Documentation Rules define the standards and expectations for maintaining documentation.

They help ensure quality and consistency over time.

## Creation Rules

Define requirements for creating new documentation.

#### Example

- Use approved templates.
- Follow naming conventions.
- Complete required metadata.

## Update Rules

Define how documentation should be reviewed and updated.

#### Example

- Review annually.
- Update when information changes.
- Remove outdated information.

## Archive Rules

Define how inactive documentation should be handled.

#### Example

- Move inactive documents to archive folders.
- Retain historical records.
- Avoid deleting important documentation without review.
This conversion preserves the Framework while removing only presentation-specific elements. It maintains the original wording, section hierarchy, order, examples, and tabular layouts, includes the requested YAML front matter with version: 1, and produces a canonical Markdown source suitable for human editing, AI interpretation, version control, software parsing, and future application rendering. 




11. Research System(2).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 11
systemName: Research System
capability: Manage Information
question: How do we collect and organize research?
scope: Defines how information is gathered, evaluated, and applied to support informed organizational decisions.
version: 1
---

# 11. Research System

**Capability:** Manage Information

**Guiding Question:** How do we collect and organize research?

## System Scope

Defines how information is gathered, evaluated, and applied to support informed organizational decisions.

## Index

1. Overview
2. Research Overview
3. Research Questions
4. Sources
5. Findings
6. Analysis
7. Actions
8. Research Summary

---

# 1. Overview

## Purpose

The Research System provides a structured framework for collecting information, evaluating evidence, identifying patterns, and supporting informed decisions.

It helps individuals, teams, organizations, and creators organize research in a consistent and repeatable way.

## When to Use

Use this system whenever:

- Exploring a topic
- Investigating a problem
- Evaluating opportunities
- Comparing alternatives
- Validating assumptions
- Supporting decisions

## Outcome

By completing this system, you will have:

- A defined research objective
- Organized sources
- Documented findings
- An evidence-based analysis
- Recommended actions
- A clear research summary

---

# 2. Research Overview

## Purpose

The Research Overview defines the scope and objective of the research.

## Research Record

### Research Name

Name of the research.

### Research Type

#### Example

- Market
- Product
- Customer
- Competitor
- Technical
- Academic
- Creative

### Summary

Brief description of the research.

### Objective

What is the research trying to learn, understand, or validate?

---

# 3. Research Questions

## Purpose

Research Questions define what the research aims to answer.

## Question Record

For each question record:

### 1. Question

What needs to be answered?

### 2. Priority

#### Example

- Critical
- Important
- Optional

### 3. Status

#### Example

- Open
- In Progress
- Answered

---

# 4. Sources

## Purpose

Sources record where research information was collected.

## Source Record

For each source record:

### 1. Source Name

### 2. Source Type

#### Example

- Article
- Book
- Interview
- Report
- Dataset
- Website
- Observation

### 3. Reference

Link, citation, or location.

### 4. Notes

Relevant information collected from the source.

---

# 5. Findings

## Purpose

Findings record information discovered during research.

## Finding Record

For each finding record:

### 1. Finding

What information was discovered?

### 2. Supporting Sources

Which sources support this finding?

### 3. Confidence

#### Example

- High
- Medium
- Low

---

# 6. Analysis

## Purpose

Analysis evaluates findings and identifies patterns, relationships, implications, and conclusions.

## Analysis Record

For each analysis record:

### 1. Observation

What pattern, trend, relationship, or issue was identified?

### 2. Interpretation

What does the observation mean?

### 3. Supporting Findings

Which findings support this analysis?

### 4. Confidence

#### Example

- High
- Medium
- Low

---

# 7. Actions

## Purpose

Actions record recommended next steps based on the analysis.

## Action Record

For each action record:

### 1. Action

What should happen next?

### 2. Reason

Why is this action recommended?

### 3. Priority

#### Example

- High
- Medium
- Low

### 4. Status

#### Example

- Planned
- In Progress
- Completed

---

# 8. Research Summary

## Purpose

The Research Summary provides a high-level overview of the completed research.

## Key Findings

Most important discoveries.

## Key Conclusions

Most important conclusions from the analysis.

## Key Actions

Most important recommended actions.

## Key Takeaway

The single most important thing learned from the research.

## Next Step

What should happen after the research is completed?
This conversion follows your specification by preserving the original framework, wording, hierarchy, and section order while removing only presentation-specific PDF elements. It includes the requested YAML front matter, converts lists into Markdown lists, preserves numbered records and examples, and produces a canonical Markdown source suitable for editing, AI interpretation, version control, software parsing, and future application rendering. 




12. Knowledge System.pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 12
systemName: Knowledge System
capability: Manage Information
question: How do we capture, organize, and reuse knowledge?
scope: Defines how organizational knowledge is captured, shared, preserved, and reused over time.
version: 1
---

# 12. Knowledge System

**Capability:** Manage Information

**Guiding Question:** How do we capture, organize, and reuse knowledge?

## System Scope

Defines how organizational knowledge is captured, shared, preserved, and reused over time.

## Index

1. Overview
2. Knowledge Base
3. Lessons Learned
4. Best Practices
5. FAQs
6. Knowledge Summary

---

# 1. Overview

## Purpose

The Knowledge System provides a structured framework for capturing, organizing, and maintaining knowledge.

It helps individuals, teams, organizations, and creators preserve valuable information, improve consistency, and make knowledge easier to access and reuse.

## When to Use

Use this system whenever:

- Knowledge should be preserved
- Experience should be documented
- Information should be shared
- Lessons should be retained
- Best practices should be standardized
- Common questions should be answered

## Outcome

By completing this system, you will have:

- Organized knowledge
- Documented lessons
- Defined best practices
- Documented FAQs
- A reusable knowledge base
- A clear knowledge summary

---

# 2. Knowledge Base

## Purpose

The Knowledge Base records important information that should be preserved, validated, and reused.

## Knowledge Record

For each knowledge record:

### 1. Topic

What subject does this knowledge relate to?

### 2. Knowledge

What is known about the topic?

### 3. Category

#### Example

- Business
- Product
- Operations
- Creative
- Technical

### 4. Validation

Document how the knowledge has been verified.

#### Example

- Expert Review
- Peer Review
- Practical Experience
- External Reference

### 5. Review Date

Record when the knowledge should be reviewed again.

### 6. Status

#### Example

- Active
- Under Review
- Archived

---

# 3. Lessons Learned

## Purpose

Lessons Learned record insights and experiences that may improve future work.

## Lesson Record

For each lesson record:

### Lesson

What was learned?

### Context

Where or when was it learned?

### Recommendation

How should this lesson be applied in the future?

---

# 4. Best Practices

## Purpose

Best Practices record proven approaches that consistently produce good results.

## Best Practice Record

For each best practice record:

### 1. Practice

What should be done?

### 2. Reason

Why is this considered a best practice?

### 3. Related Topic

Which topic does it support?

---

# 5. FAQs

## Purpose

FAQs record common questions and answers that help users quickly access important knowledge.

## FAQ Record

For each FAQ record:

### Question

What is the common question?

### Answer

What is the recommended answer?

### Related Topic

Which topic does this FAQ relate to?

---

# 6. Knowledge Summary

## Purpose

The Knowledge Summary provides a high-level overview of the most important knowledge.

## Key Knowledge

Most important information.

## Key Lessons

Most important lessons learned.

## Key Practices

Most important best practices.

## Key FAQs

Most useful questions and answers.

## Next Review

When should this knowledge be reviewed or updated?
This conversion preserves the original Framework exactly while removing only presentation-specific PDF elements. It maintains the original wording, hierarchy, numbering, and section order, combines the continuation of the Knowledge Base record from the following page into the same section, and produces a canonical Markdown document suitable for human editing, AI interpretation, version control, software parsing, and future application rendering. 




13. Asset System(1).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 13
systemName: Asset System
capability: Manage Information
question: How do we manage organizational assets?
scope: Defines how reusable organizational assets are organized, maintained, protected, and made accessible.
version: 1
---

# 13. Asset System

**Capability:** Manage Information

**Guiding Question:** How do we manage organizational assets?

## System Scope

Defines how reusable organizational assets are organized, maintained, protected, and made accessible.

## Index

1. Overview
2. Assets
3. Access
4. Updates
5. Assets Summary

---

# 1. Overview

## Purpose

The Asset System provides a structured framework for recording, managing, and maintaining assets.

It helps individuals, teams, organizations, and creators keep track of important assets and ensure they remain accessible, up to date, and useful.

## When to Use

Use this system whenever:

- Assets need to be tracked
- Assets require maintenance
- Assets are shared across projects or teams
- Assets require updates or reviews
- Assets should remain accessible and organized

## Outcome

By completing this system, you will have:

- A documented asset inventory
- Clear asset access information
- Recorded asset updates
- Improved asset visibility
- A summarized view of important assets

---

# 2. Assets

## Purpose

The Assets section records all managed assets.

## Asset Record

For each asset record:

### 1. Asset Name

Name of the asset.

### 2. Asset Type

#### Example

- Document
- Template
- Image
- Video
- Audio
- Presentation
- Dataset
- Model
- Equipment
- Other

### 3. Purpose

What is the asset used for?

### 4. Location

Where can the asset be found?

### 5. Responsible

Who is responsible for maintaining the asset?

### 6. Priority

#### Example

- Critical
- Important
- Optional

### 7. Status

#### Example

- Active
- Archived
- Retired

---

# 3. Access

## Purpose

The Access section records how assets can be accessed and any restrictions that apply.

## Access Record

For each access record:

### 1. Asset

Related assets.

### 2. Access Level

#### Example

- Available
- Limited
- Restricted

### 3. Restrictions

Any limitations on access or use.

### 4. Notes

Additional information about access.

---

# 4. Updates

## Purpose

The Updates section records reviews, maintenance activities, and asset improvements.

## Update Record

For each update record:

### 1. Asset

Related assets.

### 2. Update

What was reviewed, changed, or updated?

### 3. Date

When was the update completed?

### 4. Status

#### Example

- Planned
- Completed
- Deferred

---

# 5. Assets Summary

## Purpose

The Assets Summary provides a high-level overview of managed assets.

## Key Assets

Most important assets.

## Active Assets

Assets currently in use.

## Update Priorities

Assets that require attention or review.

## Key Takeaway

Most important insight about the asset inventory.

## Next Review

When should the assets be reviewed again?
This conversion preserves the original Framework exactly while removing presentation-specific PDF elements. It maintains the original wording, hierarchy, numbering, and section order, merges the continuation of the Asset Record across pages into a single logical section, and produces a canonical Markdown document suitable for human editing, AI interpretation, version control, software parsing, and future application rendering. 




14. Data Governance System.pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 14
systemName: Data Governance System
capability: Manage Information
question: How do we manage organizational data?
scope: Defines how organizational data is managed, protected, governed, and maintained throughout its lifecycle.
version: 1
---

# 14. Data Governance System

**Capability:** Manage Information

**Guiding Question:** How do we manage organizational data?

## System Scope

Defines how organizational data is managed, protected, governed, and maintained throughout its lifecycle.

## Index

1. Overview
2. Data Inventory
3. Data Ownership
4. Data Quality
5. Data Security
6. Data Lifecycle
7. Data Compliance
8. Data Review

---

# 1. Overview

## Purpose

The Data Governance System provides a structured framework for documenting how organizational data is identified, managed, protected, and maintained throughout its lifecycle.

Its purpose is to improve data quality, consistency, accessibility, and security while supporting informed decision-making.

## When to Use

Use this system whenever:

- Organizational data needs to be managed
- Data ownership needs to be defined
- Data quality needs to be maintained
- Data security needs to be established
- Data compliance needs to be documented
- Data governance needs regular review

## Outcome

By completing this system, you will have:

- A documented inventory of organizational data
- Clearly defined data ownership
- A structured data quality framework
- A documented data security framework
- A data lifecycle framework
- A data compliance framework
- A reusable data governance review process

---

# 2. Data Inventory

## Purpose

Document the organizational data that supports business activities.

## Data Inventory Framework

Document:

- Data Asset *(e.g. customer records, employee records, financial records, project documentation)*
- Category *(e.g. customer, employee, financial, project)*
- Classification *(e.g. public, internal, confidential, restricted)*

---

# 3. Data Ownership

## Purpose

Document who is responsible for managing and maintaining organizational data.

## Data Ownership Framework

Document:

- Owner
- Custodian *(if applicable)*
- Access Permissions *(e.g. HR Department, Finance Team, Project Team)*
- Review Frequency

---

# 4. Data Quality

## Purpose

Document how data quality is maintained throughout the organization.

## Data Quality Framework

Document:

- Quality Standards
- Validation Methods
- Quality Reviews
- Improvement Actions

---

# 5. Data Security

## Purpose

Document how organizational data is protected against unauthorized access, loss, or misuse.

## Data Security Framework

Document:

- Protection Measures *(e.g. encryption, authentication, monitoring, backups)*
- Access Control
- Backup Strategy
- Incident Response

---

# 6. Data Lifecycle

## Purpose

Document how organizational data is managed from creation to disposal.

## Data Lifecycle Framework

Document:

- Creation
- Storage
- Usage
- Retention
- Disposal

---

# 7. Data Compliance

## Purpose

Document how organizational data complies with applicable internal and external requirements.

## Data Compliance Framework

Document:

- Applicable Requirements *(e.g. privacy legislation, contractual obligations, internal policies)*
- Compliance Activities
- Compliance Monitoring
- Corrective Actions

---

# 8. Data Review

## Purpose

Document how the organization's data governance framework is reviewed and continuously improved.

## Data Review Framework

Document:

- Review Schedule
- Governance Framework Review
- Improvement Actions
This conversion preserves the original Framework exactly while removing presentation-specific PDF elements. It maintains the original wording, hierarchy, numbering, section order, bullet structure, and inline examples, includes the requested YAML front matter with version: 1, and produces a canonical Markdown document suitable for human editing, AI interpretation, version control, software parsing, and future application rendering. 




15. Governance System.pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 15
systemName: Governance System
capability: Manage the Organization
question: How do we direct, control, and protect the organization?
scope: Defines how authority, decision-making, policies, accountability, and organizational oversight are established.
version: 1
---

# 15. Governance System

**Capability:** Manage the Organization

**Guiding Question:** How do we direct, control, and protect the organization?

## System Scope

Defines how authority, decision-making, policies, accountability, and organizational oversight are established.

## Index

1. Overview
2. Governance Framework
3. Policies & Standards
4. Compliance
5. Risk Management
6. Information Security
7. Business Continuity
8. Governance Review

---

# 1. Overview

## Purpose

The Governance System provides a structured framework for documenting how the organization is directed, governed, protected, and held accountable.

Its purpose is to establish consistent governance practices that support responsible decision-making, organizational resilience, and long-term sustainability.

## When to Use

Use this system whenever:

- Organizational responsibilities need clarification
- Decision-making structures need definition
- Policies need to be established
- Authority needs to be assigned
- Governance practices require review
- Organizational accountability needs strengthening

## Outcome

By completing this system, you will have:

- A documented governance framework
- Clearly defined organizational policies
- A structured compliance framework
- A documented risk management framework
- An information security framework
- A business continuity framework
- A governance review process

---

# 2. Governance Framework

## Purpose

Document how governance responsibilities, authority, and accountability are established throughout the organization.

## Governance Framework

Document:

- Governance Principles
- Organizational Responsibilities
- Decision Authority
- Accountability Structure
- Governance Objectives

---

# 3. Policies & Standards

## Purpose

Document the policies and standards that guide organizational behaviour and decision-making.

## Policy Framework

Document:

- Organizational Policies
- Internal Standards *(e.g. documentation standards, project standards, quality standards)*
- Code of Conduct
- Ethical Principles
- Policy Review Process

---

# 4. Compliance

## Purpose

Document how the organization meets applicable legal, regulatory, contractual, and internal requirements.

## Compliance Framework

Document:

- Applicable Requirements *(e.g. laws, regulations, contracts, certifications)*
- Compliance Responsibilities
- Compliance Activities
- Compliance Monitoring
- Corrective Actions

---

# 5. Risk Management

## Purpose

Document organizational risks and how they are identified, evaluated, managed, and monitored.

## Risk Management Framework

Document:

- Risk Categories
- Risk Assessment
- Risk Treatment *(e.g. avoid, reduce, transfer, accept)*
- Risk Monitoring
- Risk Review

---

# 6. Information Security

## Purpose

Document how organizational information and digital resources are protected.

## Information Security Framework

Document:

- Information Assets *(e.g. client information, employee records, financial information, project documentation)*
- Access Control
- Data Protection
- Security Measures
- Incident Response

---

# 7. Business Continuity

## Purpose

Document how the organization prepares for, responds to, and recovers from disruptions.

## Business Continuity Framework

Document:

- Critical Activities *(e.g. customer support, project delivery, financial operations, internal communication)*
- Business Continuity Plans
- Recovery Procedures
- Communication Procedures
- Continuity Review

---

# 8. Governance Review

## Purpose

Document how governance practices are evaluated and continuously improved.

## Governance Review Framework

Document:

- Review Schedule
- Governance Performance Review *(e.g. policy effectiveness, compliance performance, risk management effectiveness, business continuity readiness)*
- Improvement Actions
This conversion preserves the original Framework exactly while removing only presentation-specific PDF elements. It maintains the original wording, hierarchy, numbering, section order, and inline examples, includes the requested YAML front matter with version: 1, and produces a canonical Markdown document suitable for human editing, AI interpretation, version control, software parsing, and future application rendering. 




16. People System(9).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 16
systemName: People System
capability: Manage the Organization
question: How do people contribute to the organization?
scope: Defines how people, roles, responsibilities, and organizational relationships are structured and coordinated.
version: 1
---

# 16. People System

**Capability:** Manage the Organization

**Guiding Question:** How do people contribute to the organization?

## System Scope

Defines how people, roles, responsibilities, and organizational relationships are structured and coordinated.

## Index

1. Overview
2. Organization Structure
3. Roles & Responsibilities
4. Recruitment
5. Onboarding
6. Development
7. Performance
8. Collaboration
9. Offboarding

---

# 1. Overview

## Purpose

The People System provides a structured framework for documenting how people are organized, recruited, developed, evaluated, collaborate, and transition throughout the organization.

Its purpose is to establish consistent people management practices and support sustainable organizational growth.

## When to Use

Use this system whenever:

- Roles and responsibilities need to be defined
- People need to be assigned to work
- Skills and competencies need to be managed
- Performance needs to be reviewed
- Professional development needs planning
- Team responsibilities need clarification

## Outcome

By completing this system, you will have:

- A defined people structure
- Clearly documented roles and responsibilities
- A consistent recruitment framework
- A structured onboarding framework
- A documented people development framework
- A consistent performance framework
- Clear collaboration practices
- A documented offboarding framework

---

# 2. Organization Structure

## Purpose

Document how people are organized throughout the organization.

## Organization Structure

Document:

- Departments
- Teams
- Reporting Relationships
- Role Distribution
- Locations *(if applicable)*

---

# 3. Roles & Responsibilities

## Purpose

Define the purpose, expectations, and responsibilities of each role.

## Guidance

Document each organizational role independently. Focus on the purpose of the role, its responsibilities, required competencies, reporting relationships, authority, and expected deliverables. Document roles rather than specific individuals so the framework remains reusable as personnel change.

## Role Record

Document:

- Role Name
- Role Purpose
- Key Responsibilities
- Authority
- Reporting Line
- Required Qualifications *(e.g. degree, certification, licence)*
- Required Experience *(e.g. years of experience, industry background)*
- Technical Skills *(e.g. software, tools, methodologies)*
- Professional Competencies *(e.g. communication, leadership, problem solving)*
- Key Deliverables

---

# 4. Recruitment

## Purpose

Document how new people are identified, assessed, and selected.

## Recruitment Framework

Document:

- Hiring Principles
- Candidate Profile *(e.g. education, experience, technical skills, certifications)*
- Recruitment Workflow
- Selection Criteria
- Interview Stages
- Assessment Methods *(e.g. technical test, portfolio review, practical exercise, case study)*
- Hiring Decision

---

# 5. Onboarding

## Purpose

Document how new people become productive members of the organization.

## Onboarding Framework

Document:

- Welcome Process
- Orientation
- Required Resources
- Training Schedule *(e.g. Week 1, Month 1, First 90 Days)*
- Initial Objectives

---

# 6. Development

## Purpose

Document how people continuously improve their knowledge, skills, and careers.

## Development Framework

Document:

- Skills Development
- Training
- Career Development
- Mentoring
- Learning Resources *(e.g. internal documentation, courses, certifications, conferences)*

---

# 7. Performance

## Purpose

Document how contribution, progress, and professional development are evaluated.

## Performance Framework

Document:

- Performance Objectives
- Performance Reviews
- Feedback Process
- Improvement Actions

---

# 8. Collaboration

## Purpose

Document how people collaborate effectively across the organization.

## Collaboration Framework

Document:

- Team Collaboration
- Cross-Team Collaboration
- Collaboration Guidelines *(e.g. communication expectations, response times, escalation paths)*

---

# 9. Offboarding

## Purpose

Document how people transition out of the organization while maintaining operational continuity.

## Offboarding Framework

Document:

- Exit Process
- Knowledge Transfer
- Handover
- Asset Return
- Access Removal
- Final Documentation Review
- Exit Feedback
This conversion preserves the original Framework exactly while removing all presentation-specific PDF elements (logos, headers, footers, page numbers, branding, decorative graphics, and layout). The wording, hierarchy, numbering, section order, and inline examples are maintained, and the document is converted into a canonical Markdown source suitable for human editing, AI interpretation, version control, software parsing, and future application rendering. 




17. Finance System.pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 17
systemName: Finance System
capability: Manage the Organization
question: How do we manage financial resources?
scope: Defines how financial resources are planned, allocated, monitored, and managed responsibly.
version: 1
---

# 17. Finance System

**Capability:** Manage the Organization

**Guiding Question:** How do we manage financial resources?

## System Scope

Defines how financial resources are planned, allocated, monitored, and managed responsibly.

## Index

1. Overview
2. Financial Model
3. Financial Resources
4. Budgeting
5. Financial Planning
6. Financial Monitoring
7. Financial Risk
8. Financial Review

---

# 1. Overview

## Purpose

The Finance System provides a structured framework for documenting how financial resources are generated, allocated, monitored, and sustained throughout the organization.

Its purpose is to support informed financial decision-making, financial sustainability, and long-term organizational growth.

## When to Use

Use this system whenever:

- Financial resources need planning
- Budgets need to be managed
- Income and expenses require tracking
- Financial decisions need support
- Financial performance requires review
- Financial planning needs improvement

## Outcome

By completing this system, you will have:

- A documented financial model
- A structured financial resource framework
- A documented budgeting approach
- A financial planning framework
- A financial monitoring framework
- A financial risk framework
- A financial review process

---

# 2. Financial Model

## Purpose

Document how the organization generates and sustains its financial resources.

## Financial Model

Document:

- Revenue Streams
- Funding Sources *(e.g. investment, grants, loans, donations, sponsorships)*
- Financial Objectives
- Financial Principles

---

# 3. Financial Resources

## Purpose

Document how financial resources are allocated, managed, and controlled throughout the organization.

## Financial Resource Framework

Document:

- Cost Categories
- Operating Expenses
- Capital Investment *(if applicable)*
- Procurement Guidelines *(e.g. supplier selection, purchasing process, contract requirements)*
- Expense Approval Process
- Financial Policies *(e.g. spending limits, purchasing authority, reimbursement rules, expense documentation)*

---

# 4. Budgeting

## Purpose

Document how financial resources are planned and allocated.

## Budget Framework

Document:

- Budget Categories
- Financial Allocation
- Budget Approval Process
- Budget Review Schedule

---

# 5. Financial Planning

## Purpose

Document how the organization prepares for future financial needs and opportunities.

## Financial Planning Framework

Document:

- Financial Goals
- Investment Priorities
- Growth Plans
- Financial Reserves
- Funding Strategy

---

# 6. Financial Monitoring

## Purpose

Document how financial performance is measured and monitored.

## Financial Monitoring Framework

Document:

- Financial Indicators *(e.g. revenue, cash flow, operating costs, budget variance, profit margin)*
- Review Schedule
- Performance Analysis *(e.g. compare actual performance against budgets, identify financial variances, evaluate financial trends)*

---

# 7. Financial Risk

## Purpose

Document financial risks and how they are managed.

## Financial Risk Framework

Document:

- Financial Risks
- Risk Evaluation
- Mitigation Measures *(e.g. cost reduction, revenue diversification, insurance, emergency reserves)*
- Contingency Plans

---

# 8. Financial Review

## Purpose

Document how financial performance is reviewed and continuously improved.

## Financial Review Framework

Document:

- Review Schedule
- Financial Performance Review *(e.g. revenue growth, operating costs, budget performance, investment outcomes)*
- Improvement Actions
This conversion preserves the original Framework exactly while removing all presentation-specific PDF elements (logos, images, headers, footers, watermarks, decorative graphics, page numbers, and layout). It maintains the original wording, hierarchy, numbering, section order, and inline examples, includes the requested YAML front matter with version: 1, and produces a canonical Markdown document suitable for human editing, AI interpretation, version control, software parsing, and future application rendering. 




18. Stakeholder System(8).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 18
systemName: Stakeholder System
capability: Manage the Organization
question: Who influences the organization and how do we manage those relationships?
scope: Defines how relationships with stakeholders are identified, managed, and strengthened over time.
version: 1
---

# 18. Stakeholder System

**Capability:** Manage the Organization

**Guiding Question:** Who influences the organization and how do we manage those relationships?

## System Scope

Defines how relationships with stakeholders are identified, managed, and strengthened over time.

## Index

1. Overview
2. Stakeholder Categories
3. Stakeholder Register
4. Stakeholder Expectations
5. Stakeholder Engagement
6. Stakeholder Communication
7. Stakeholder Review

---

# 1. Overview

## Purpose

The Stakeholder System provides a structured framework for documenting the individuals, groups, and organizations that influence or are influenced by the organization.

Its purpose is to improve organizational relationships through consistent stakeholder identification, engagement, communication, and review.

## When to Use

Use this system whenever:

- Stakeholders need to be identified
- Stakeholder relationships need management
- Stakeholder expectations require understanding
- Communication with stakeholders needs planning
- Stakeholder influence needs assessment
- Stakeholder engagement requires review

## Outcome

By completing this system, you will have:

- Clearly defined stakeholder categories
- A documented stakeholder register
- A structured understanding of stakeholder expectations
- A stakeholder engagement framework
- A stakeholder communication framework
- A stakeholder review process

---

# 2. Stakeholder Categories

## Purpose

Document the categories of stakeholders relevant to the organization.

## Stakeholder Categories Framework

Document:

- Stakeholder Category *(e.g. customers, employees, suppliers, partners, investors, regulators, community)*
- Description

---

# 3. Stakeholder Register

## Purpose

Document the organization's key stakeholders.

## Stakeholder Register Framework

Document:

- Stakeholder
- Stakeholder Category
- Relationship Type
- Responsible Role

---

# 4. Stakeholder Expectations

## Purpose

Document the expectations and interests of each stakeholder.

## Stakeholder Expectations Framework

Document:

- Stakeholder
- Expectations
- Organizational Commitment

---

# 5. Stakeholder Engagement

## Purpose

Document how relationships with stakeholders are maintained.

## Stakeholder Engagement Framework

Document:

- Stakeholder
- Engagement Method *(e.g. meetings, surveys, workshops, events, collaboration)*
- Engagement Frequency

---

# 6. Stakeholder Communication

## Purpose

Document how organizational information is communicated to stakeholders.

## Stakeholder Communication Framework

Document:

- Stakeholder
- Communication Purpose
- Communication Method *(e.g. email, meeting, newsletter, website, report)*
- Communication Frequency

---

# 7. Stakeholder Review

## Purpose

Document how stakeholder relationships are periodically reviewed.

## Stakeholder Review Framework

Document:

- Review Schedule
- Key Findings
- Improvement Actions
This conversion preserves the original Framework exactly while removing all presentation-specific PDF elements (logos, images, headers, footers, page numbers, watermarks, decorative graphics, and layout). The original wording, hierarchy, numbering, section order, and inline examples have been maintained without summarization or reinterpretation, producing a canonical Markdown source suitable for human editing, AI interpretation, version control, software parsing, and future application rendering. 




19. Publishing System(2).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 19
systemName: Publishing System
capability: Communicate
question: How do we publish and distribute organizational content?
scope: Defines how organizational information is prepared, published, maintained, and communicated consistently.
version: 1
---

# 19. Publishing System

**Capability:** Communicate

**Guiding Question:** How do we publish and distribute organizational content?

## System Scope

Defines how organizational information is prepared, published, maintained, and communicated consistently.

## Index

1. Overview
2. Content Strategy
3. Content Ideas
4. Editorial Calendar
5. Article Template
6. Review Workflow
7. Distribution Checklist

---

# 1. Overview

## Purpose

The Publishing System provides a structured framework for planning, creating, publishing, and distributing content.

It helps organizations maintain consistency, improve content quality, and support long-term publishing efforts.

## When to Use

Use this system whenever:

- Content needs to be planned
- Content needs to be created
- Publications require review
- Publishing schedules need coordination
- Content needs distribution
- Publishing activities require consistency

## Outcome

By completing this system, you will have:

- A documented content strategy
- A collection of content ideas
- A publishing schedule
- Content creation standards
- Content review procedures
- Distribution procedures

---

# 2. Content Strategy

## Purpose

The Content Strategy defines what content should be created and why.

It provides direction for publishing activities.

## Content Goals

What should the content achieve?

### Example

- Education
- Awareness
- Engagement
- Lead Generation
- Community Building

## Content Categories

What types of content will be created?

### Example

- Articles
- Tutorials
- Case Studies
- News
- Opinion Pieces

## Target Audience

Who is the content intended for?

## Success Indicators

How will success be evaluated?

---

# 3. Content Ideas

## Purpose

The Content Ideas section records future content opportunities.

It serves as a central collection of ideas before they are scheduled for publication.

## Content Ideas

For each idea record:

- Title
- Category
- Status
- Notes

## Idea Status

### Example

- New
- Researching
- Ready
- Archived

---

# 4. Editorial Calendar

## Purpose

The Editorial Calendar organizes publication timing.

It helps maintain consistency and visibility across publishing activities.

## Publishing Schedule

For each content item record:

- Title
- Publication Date
- Category
- Platform
- Status

---

# 5. Article Template

## Purpose

The Article Template provides a standard structure for creating written content.

It helps improve consistency and readability.

## Template

```text
Title

Introduction

Main Content

Conclusion

References (Optional)
```

---

# 6. Review Workflow

## Purpose

The Review Workflow defines how content is reviewed before publication.

It helps improve quality and accuracy.

## Review Areas

### Example

- Accuracy
- Clarity
- Structure
- Grammar
- Formatting

## Approval Process

Describe the approval process before publication.

---

# 7. Distribution Checklist

## Purpose

The Distribution Checklist helps ensure content reaches its intended audience after publication.

## Publication

- Content Published
- Formatting Verified
- Links Verified

## Distribution

- Website Updated
- Newsletter Sent
- Social Media Shared

## Performance Tracking

- Analytics Enabled
- Results Recorded
This conversion preserves the original Framework while removing only presentation-specific PDF elements (logos, headers, footers, page numbers, decorative graphics, branding, and layout). The wording, hierarchy, numbering, section order, and examples are maintained exactly, with the Article Template appropriately represented as a fenced code block in accordance with your conversion specification. The result is a canonical Markdown source suitable for human editing, AI interpretation, version control, software parsing, and future application rendering. 




20. Website System(5).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 20
systemName: Website System
capability: Communicate
question: How do we manage our website and its content?
scope: Defines how the organization's website communicates information, supports its objectives, and serves its audiences.
version: 1
---

# 20. Website System

**Capability:** Communicate

**Guiding Question:** How do we manage our website and its content?

## System Scope

Defines how the organization's website communicates information, supports its objectives, and serves its audiences.

## Index

1. Overview
2. Website Specification
3. Content Architecture
4. Website Pages
5. Search Engine Optimization Plan
6. Analytics Plan
7. Website Roadmap

---

# 1. Overview

## Purpose

The Website System provides a structured framework for planning, organizing, launching, and improving a website.

It helps organizations define website requirements, organize information, prepare content, measure performance, and support long-term website development.

## When to Use

Use this system whenever:

- A website needs planning
- A website is being created
- Website content needs organization
- Website performance requires monitoring
- Website improvements need planning
- Website development requires coordination

## Outcome

By completing this system, you will have:

- A website specification
- An organized website structure
- A complete page inventory
- Search visibility guidelines
- Website performance measurement procedures
- A website development roadmap

---

# 2. Website Specification

## Purpose

The Website Specification defines the website at a high level.

It establishes the purpose, audience, goals, and scope of the website.

## Website Purpose

Why does the website exist?

## Target Audience

Who is the website for?

## Website Goals

What should the website achieve?

### Example

- Inform
- Educate
- Generate Leads
- Sell Products
- Build Community

## Website Scope

What will be included in the website?

---

# 3. Content Architecture

## Purpose

The Content Architecture defines how information is organized across the website.

It helps visitors navigate the website and find information efficiently.

## Main Sections

List the primary sections of the website.

### Example

- Home
- About
- Services
- Products
- Articles
- Contact

## Navigation Structure

Describe how visitors move through the website.

## Page Hierarchy

Describe how pages are organized.

### Example

```text
Home
├── About
├── Services
├── Articles
└── Contact
```

---

# 4. Website Pages

## Purpose

The Website Pages section records all pages required for the website.

It provides visibility into the website structure and content requirements.

## Website Pages

For each page record:

- Page Name
- Purpose
- Key Content
- Status

## Page Status

### Example

- Planned
- In Development
- Published
- Archived

---

# 5. Search Engine Optimization Plan

## Purpose

Search Engine Optimization (SEO) is the practice of improving a website's visibility in search engines.

The Search Engine Optimization Plan defines how the website can be discovered by people searching online.

## Target Keywords

Identify important search terms relevant to the website.

## Content Optimization

Describe content optimization practices.

### Example

- Page Titles
- Meta Descriptions
- Headings
- Internal Links

## Technical Optimization

Identify technical considerations.

### Example

- Sitemap
- Mobile Optimization
- Website Performance
- Structured Data

---

# 6. Analytics Plan

## Purpose

The Analytics Plan defines how website performance will be measured, monitored, and reviewed.

## Success Metrics

### Example

- Visitors
- Page Views
- Session Duration
- Conversions
- Enquiries
- Downloads

## Measurement Tools

### Example

- Analytics Platform
- Search Console
- Heatmap Software

## Reporting Frequency

### Example

- Weekly
- Monthly
- Quarterly

---

# 7. Website Roadmap

## Purpose

The Website Roadmap provides a high-level plan for website development and improvement.

## Template

| Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|----------|----------|----------|----------|
| **Time Period:** | **Time Period:** | **Time Period:** | **Time Period:** |
| **Focus:** | **Focus:** | **Focus:** | **Focus:** |
| **Deliverables:** | **Deliverables:** | **Deliverables:** | **Deliverables:** |
This conversion preserves the original Framework exactly while removing all presentation-specific PDF elements, including logos, headers, footers, page numbers, branding, decorative graphics, and layout. The wording, hierarchy, numbering, section order, examples, and page hierarchy are preserved, with the page hierarchy represented as a fenced code block and the Website Roadmap converted into a Markdown table in accordance with your conversion specification. The result is a canonical Markdown source suitable for human editing, AI interpretation, version control, software parsing, and future application rendering. 




21. Social Media System(3).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 21
systemName: Social Media System
capability: Communicate
question: How do we manage our social media presence?
scope: Defines how the organization communicates, engages, and builds relationships through social media.
version: 1
---

# 21. Social Media System

**Capability:** Communicate

**Guiding Question:** How do we manage our social media presence?

## System Scope

Defines how the organization communicates, engages, and builds relationships through social media.

## Index

1. Overview
2. Audience Profiles
3. Platform Strategy
4. Content Types
5. Posting Calendar
6. Bio Templates
7. Campaign Tracker
8. Analytics Tracker

---

# 1. Overview

## Purpose

The Social Media System provides a structured framework for planning, managing, and improving social media activities.

It helps organizations identify audiences, define platform strategies, create content plans, track campaigns, and measure performance.

## When to Use

Use this system whenever:

- Social media activities need planning
- Content needs scheduling
- Audience engagement requires management
- Campaigns need coordination
- Platform performance requires monitoring
- Social media strategy needs improvement

## Outcome

By completing this system, you will have:

- Defined audience profiles
- Platform-specific strategies
- Content guidelines
- A posting schedule
- Reusable bio templates
- Campaign tracking procedures
- Performance tracking procedures

---

# 2. Audience Profiles

## Purpose

Audience Profiles help identify and understand the people you want to reach.

## Audience Group

For each audience record:

- Name
- Description
- Interests
- Goals
- Challenges

---

# 3. Platform Strategy

## Purpose

The Platform Strategy defines which platforms are used and how they support organizational goals.

## Platform

For each platform record:

- Platform Name
- Purpose
- Primary Audience
- Content Focus

---

# 4. Content Types

## Purpose

The Content Types section defines the categories of content published across social media platforms.

## Content Categories

### Example

- Announcements
- Educational Content
- Behind the Scenes
- Case Studies
- Community Posts
- Promotional Content

## Content Guidelines

Describe how each content type should be used.

---

# 5. Posting Calendar

## Purpose

The Posting Calendar helps organize publishing activities and maintain consistency.

## Posting Schedule

For each content item record:

- Date
- Platform
- Content Type
- Status

## Status

### Example

- Planned
- Scheduled
- Published

---

# 6. Bio Templates

## Purpose

The Bio Templates section provides reusable descriptions for social media profiles.

## Short Bio

For platforms with limited space.

## Standard Bio

For most social media profiles.

## Extended Bio

For platforms that allow longer descriptions.

---

# 7. Campaign Tracker

## Purpose

The Campaign Tracker records promotional campaigns and major social media initiatives.

## Campaign Record

For each campaign record:

- Campaign Name
- Goal
- Platforms
- Start Date
- End Date
- Status

## Campaign Status

### Example

- Planned
- Active
- Completed

---

# 8. Analytics Tracker

## Purpose

The Analytics Tracker helps measure social media performance and identify opportunities for improvement.

## Performance Metrics

### Example

- Followers
- Reach
- Engagement
- Click-Through Rate
- Conversions
- Profile Visits

## Reporting Frequency

### Example

- Weekly
- Monthly
- Quarterly

## Insights

Record observations, trends, opportunities, and recommended improvement actions.
This conversion follows your specification by preserving the Framework's wording, numbering, hierarchy, and section order while removing presentation-specific PDF elements such as logos, branding, headers, footers, page numbers, decorative graphics, and layout. No content has been summarized, rewritten, or reorganized beyond the structural conversion to canonical Markdown. 




22. Metrics & Reporting System(9).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 22
systemName: Metrics & Reporting System
capability: Measure & Improve
question: How do we measure, monitor, and report organizational performance?
scope: Defines how organizational performance is measured, monitored, analyzed, and reported.
version: 1
---

# 22. Metrics & Reporting System

**Capability:** Measure & Improve

**Guiding Question:** How do we measure, monitor, and report organizational performance?

## System Scope

Defines how organizational performance is measured, monitored, analyzed, and reported.

## Index

1. Overview
2. Performance Areas
3. Key Performance Indicators (KPI)
4. Reporting Framework
5. Reporting Schedule
6. Performance Review
7. Improvement Actions

---

# 1. Overview

## Purpose

The Metrics & Reporting System provides a structured framework for documenting how organizational performance is measured, reported, reviewed, and continuously improved.

Its purpose is to support informed decision-making through consistent performance measurement and reporting.

## When to Use

Use this system whenever:

- Organizational performance needs to be measured.
- Performance indicators need to be defined.
- Performance reports need to be prepared.
- Organizational performance requires regular review.
- Performance trends need to be monitored.
- Performance data should support informed decision-making.

## Outcome

By completing this system, you will have:

- Clearly defined performance areas
- Meaningful Key Performance Indicators (KPIs)
- A structured reporting framework
- A documented reporting schedule
- A structured performance review process
- A continuous improvement framework that supports informed decision-making

---

# 2. Performance Areas

## Purpose

Document the organizational areas whose performance will be measured.

## Performance Areas Framework

Document:

- Performance Area *(e.g. finance, operations, marketing, customer service, projects)*
- Performance Objective
- Source *(e.g. accounting system, Customer Relationship Management (CRM) system, project management software, customer survey)*

---

# 3. Key Performance Indicators (KPI)

## Purpose

Document the Key Performance Indicators (KPIs) used to measure organizational performance.

A Key Performance Indicator (KPI) is a measurable value used to evaluate progress towards a specific performance objective.

## Key Performance Indicators Framework

Document:

- Performance Area
- Key Performance Indicator (KPI)
- Target
- Measurement Frequency
- Responsible Role

---

# 4. Reporting Framework

## Purpose

Document the reports used to report organizational performance.

## Reporting Framework

Document:

- Report Name
- Purpose
- Audience
- Prepared By

---

# 5. Reporting Schedule

## Purpose

Document when organizational reports are prepared and distributed.

## Reporting Schedule Framework

Document:

- Report
- Frequency
- Distribution Method

---

# 6. Performance Review

## Purpose

Document how organizational performance is reviewed and evaluated.

## Performance Review Framework

Document:

- Review Schedule
- Review Areas *(e.g. finance, operations, customer service, marketing)*
- Key Findings

---

# 7. Improvement Actions

## Purpose

Document the actions taken to improve organizational performance.

## Improvement Actions Framework

Document:

- Improvement Action
- Responsible Role
- Target Completion
- Review Status
This conversion preserves the Framework exactly while removing all presentation-specific PDF elements, including logos, images, headers, footers, page numbers, watermarks, decorative graphics, and layout. The original wording, hierarchy, numbering, section order, and inline examples are maintained, with only presentation converted into canonical Markdown suitable for human editing, AI interpretation, version control, software parsing, and future application rendering. 




23. Quality System(2).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 23
systemName: Quality System
capability: Measure & Improve
question: How do we define, maintain, and improve organizational quality?
scope: Defines how quality is planned, evaluated, maintained, and continuously improved across the organization.
version: 1
---

# 23. Quality System

**Capability:** Measure & Improve

**Guiding Question:** How do we define, maintain, and improve organizational quality?

## System Scope

Defines how quality is planned, evaluated, maintained, and continuously improved across the organization.

## Index

1. Overview
2. Quality Standards
3. Quality Objectives
4. Quality Controls
5. Quality Reviews
6. Quality Findings
7. Quality Improvement

---

# 1. Overview

## Purpose

The Quality System provides a structured framework for documenting how the organization defines, maintains, reviews, and improves the quality of its products, services, and operations.

Its purpose is to establish consistent quality standards that support reliable outcomes and continuous improvement.

## When to Use

Use this system whenever:

- Quality standards need to be defined.
- Organizational quality needs to be monitored.
- Quality controls require documentation.
- Quality reviews need to be performed.
- Quality issues need to be identified.
- Continuous quality improvement needs to be supported.

## Outcome

By completing this system, you will have:

- Clearly defined quality standards
- Documented quality objectives
- A structured quality control framework
- A quality review process
- A documented quality findings framework
- A continuous quality improvement process

---

# 2. Quality Standards

## Purpose

Document the standards used to define acceptable quality throughout the organization.

## Quality Standards Framework

Document:

- Quality Area *(e.g. products, services, projects, documentation, customer support)*
- Quality Standard
- Responsible Role

---

# 3. Quality Objectives

## Purpose

Document the quality objectives for each quality area.

## Quality Objectives Framework

Document:

- Quality Area
- Quality Objective
- Success Criteria

---

# 4. Quality Controls

## Purpose

Document the activities used to verify that quality standards are achieved.

## Quality Controls Framework

Document:

- Quality Area
- Control Activity
- Frequency
- Responsible Role

---

# 5. Quality Reviews

## Purpose

Document how organizational quality is reviewed.

## Quality Reviews Framework

Document:

- Review Schedule
- Review Areas
- Review Methods *(e.g. inspection, peer review, customer feedback, internal review)*

---

# 6. Quality Findings

## Purpose

Document the findings identified during quality reviews.

## Quality Findings Framework

Document:

- Finding
- Impact
- Responsible Role

---

# 7. Quality Improvement

## Purpose

Document actions that improve organizational quality.

## Quality Improvement Framework

Document:

- Improvement Action
- Responsible Role
- Target Completion
- Review Status
This Markdown conversion preserves the original Framework while removing all presentation-specific PDF elements (logos, headers, footers, page numbers, watermarks, branding, decorative graphics, and layout). The wording, numbering, hierarchy, section order, and inline examples are preserved exactly, making this a canonical Markdown source suitable for editing, AI interpretation, version control, software parsing, and future application rendering. 




24. Improvement System(2).pdf
PDF
# North Stardust Framework System PDF → Official Markdown Conversion

Convert the uploaded North Stardust Organization Framework System PDF into a clean, structured Markdown document that becomes the application's official source document.

This is **not** a PDF transcription.

It is a **structural conversion** that preserves the Framework while removing all presentation-specific formatting.

The resulting Markdown becomes the application's canonical source file and should be suitable for:

- Human editing
- AI interpretation
- Version control
- Software parsing
- Future rendering inside the application

---

# General Principles

Preserve the original Framework exactly.

Do not summarize.

Do not rewrite.

Do not simplify.

Do not reinterpret.

Do not reorganize the Framework.

Maintain the original wording whenever possible.

The goal is to preserve the content while converting only the presentation layer.

---

# Remove

Remove every presentation-specific element including:

- Logos
- Images
- Headers
- Footers
- Watermarks
- Decorative lines
- Icons
- Page numbers
- Page breaks
- PDF layout
- Margins
- Metadata
- Copyright notices
- Visual branding elements

---

# Preserve

Preserve exactly:

- System Number
- System Name
- Capability
- Guiding Question
- System Scope
- Index
- Every numbered section
- Every subsection
- Purpose
- Outcome
- When to Use
- Recommended Length
- Questions
- Instructions
- Notes
- Tips
- Templates
- Forms
- Checklists
- Examples
- Interview questions
- Tables

Nothing from the Framework should be omitted.

---

# Metadata

At the beginning of the document include YAML front matter.

yaml
---
systemNumber:
systemName:
capability:
question:
scope:
version: 1
---


Populate every field that exists in the PDF.

Leave unknown values blank.

Do not invent metadata.

---

# Document Structure

Immediately after the metadata include:

markdown
# X. System Name

**Capability:** ...

**Guiding Question:** ...

## System Scope

...


Then preserve the remainder of the Framework exactly.

---

# Heading Hierarchy

Use Markdown headings to represent the hierarchy.

Example:

markdown
# 1. Identity System

## System Scope

## Index

---

# 1. Overview

## Purpose

## When to Use

## Outcome

---

# 2. Mission

## Purpose

## Recommended Length

## Questions

## Example


Use horizontal rules (---) between major Framework sections to improve readability.

---

# Section Order

Never change the order of sections.

If a section contains these elements, preserve them in this order:

1. Purpose
2. Outcome
3. When to Use
4. Recommended Length
5. Questions
6. Instructions
7. Notes
8. Tips
9. Example
10. Template
11. Checklist

Only include headings that actually exist.

Do not invent missing sections.

---

# Lists

Convert all PDF bullets into Markdown lists.

Example

markdown
- First item
- Second item
- Third item


Maintain nesting whenever present.

---

# Tables

Convert every PDF table into Markdown tables.

Example

| Column A | Column B |
|----------|----------|
| ... | ... |

Preserve the original column order.

Do not flatten tables into lists unless the PDF itself does not contain a table.

---

# Examples

Preserve every example.

Format examples using blockquotes.

Example

markdown
## Example

> Example text...


---

# Templates

If the Framework contains templates, forms or reusable structures, place them inside fenced code blocks.

Example

`markdown
## Template
text
Mission:

Vision:

Values:

---
systemNumber: 24
systemName: Improvement System
capability: Measure & Improve
question: How do we identify, implement, and monitor organizational improvements?
scope: Defines how organizational improvements are identified, prioritized, implemented, evaluated, and sustained.
version: 1
---

# 24. Improvement System

**Capability:** Measure & Improve

**Guiding Question:** How do we identify, implement, and monitor organizational improvements?

## System Scope

Defines how organizational improvements are identified, prioritized, implemented, evaluated, and sustained.

## Index

1. Overview
2. Improvement Sources
3. Improvement Register
4. Improvement Prioritization
5. Improvement Implementation
6. Improvement Review
7. Improvement Monitoring

---

# 1. Overview

## Purpose

The Improvement System provides a structured framework for documenting how organizational improvements are identified, prioritized, implemented, reviewed, and monitored.

Its purpose is to support continuous organizational improvement through a consistent and repeatable improvement process.

## When to Use

Use this system whenever:

- Improvement opportunities need to be identified.
- Improvements need to be prioritized.
- Approved improvements need to be implemented.
- Improvement results need to be reviewed.
- Implemented improvements require ongoing monitoring.
- Continuous organizational improvement needs to be supported.

## Outcome

By completing this system, you will have:

- Clearly identified improvement sources
- A documented improvement register
- A structured improvement prioritization framework
- A documented improvement implementation process
- A structured improvement review process
- A documented improvement monitoring framework

---

# 2. Improvement Sources

## Purpose

Document where organizational improvement opportunities originate.

## Improvement Sources Framework

Document:

- Source *(e.g. quality reviews, stakeholder reviews, performance reviews, audits, customer feedback, employee suggestions)*
- Description

---

# 3. Improvement Register

## Purpose

Document the improvements identified by the organization.

## Improvement Register Framework

Document:

- Improvement
- Source
- Expected Benefit
- Responsible Role

---

# 4. Improvement Prioritization

## Purpose

Document how improvements are prioritized for implementation.

## Improvement Prioritization Framework

Document:

- Improvement
- Priority
- Target Completion
- Approval Status

---

# 5. Improvement Implementation

## Purpose

Document the implementation of approved improvements.

## Improvement Implementation Framework

Document:

- Improvement
- Implementation Status
- Responsible Role
- Target Completion

---

# 6. Improvement Review

## Purpose

Document the results of implemented improvements.

## Improvement Review Framework

Document:

- Review Schedule
- Key Findings
- Lessons Learned

---

# 7. Improvement Monitoring

## Purpose

Document how implemented improvements are monitored after implementation.

## Improvement Monitoring Framework

Document:

- Improvement
- Follow-up Activity
- Review Status
This conversion preserves the original Framework exactly while removing all presentation-specific PDF elements (logos, images, headers, footers, page numbers, watermarks, decorative graphics, branding, and layout). The original wording, hierarchy, numbering, section order, and inline examples have been maintained without summarization, reinterpretation, or reorganization, resulting in a canonical Markdown document suitable for human editing, AI interpretation, version control, software parsing, and future application rendering. 





So now that we feel more sure about whayt we plan to build.
1. Check again these folder/files, if we still need them.
2. Write the script and tell me where to place it

Good — having the actual converted file changes some specifics of what I proposed, and confirms one thing we found earlier in a worse way than expected. Let me go through what changed, then give you the full, detailed design.

## What this file confirms or corrects from my last answer

**Confirmed: the three-dialect problem is real and visible in the .md itself.**
This one file is pure Identity-style (Questions + Example), so it doesn't show the Record or Framework-fields dialects — but everything else about the structure lines up with what I predicted, plus two things I didn't anticipate.

**New finding #1 — good news: metadata parsing is basically solved for free.**
The conversion added YAML frontmatter:
yaml
capability: Foundation
question: Who are we?
scope: Defines the organization's identity...
systemName: Identity System
systemNumber: 1

This means you don't need to regex-parse the "**Capability:**" / "**Guiding Question:**" bold lines in the body at all — those are just human-readable duplicates. Use a frontmatter parser (gray-matter is the standard npm package) and get systemName, systemNumber, capability, and scope as clean typed fields immediately, no heuristics needed. This simplifies Pass 1 meaningfully.

**New finding #2 — a real problem: headings don't distinguish document-level from section-level.**
Look at the actual heading levels:
# 1. Identity System       <- document title
## System Scope
## Index
# 1. Overview               <- a section
# 2. Mission                <- a section

The document title and every numbered section are **both H1**. Heading *depth* alone can't tell you "this is the document" vs. "this is section 3 of 11" — you have to use the frontmatter (systemName/systemNumber) to identify the document title, and then treat every other # N. Title-pattern H1 as a section. This is an easy fix once you know about it, but it would silently break a naive "first H1 = title" parser.

**New finding #3 — a real problem, and it's the table-corruption issue from earlier, but worse than predicted.**
The Manifesto table (3 columns: When to Use / Questions / Example Structure) didn't just lose its structure conceptually — it got mangled in the actual file into something like this:

Website About pages`<br>`{=html}Brand books`<br>`{=html}...


Multiple bullet items got concatenated into a single table cell, joined by literal ` <br>{=html}  tokens — a raw-HTML-in-Markdown artifact left behind by whatever converter produced this file (this pattern is a strong signature of Pandoc's table handling when a cell contains a multi-item list). The same thing happens to the Extended Description table in section 11.

This is worth fixing **upstream, not in your parser.** Writing a special-case recovery routine that splits on ` <br>{=html}  is possible, but it's fragile (depends on that exact artifact string never changing) and only affects a small, countable number of tables across the 24 files (Manifesto-style tables specifically). I'd re-run the PDF→MD conversion for just the affected sections with a setting that forces one table row per list item, or hand-fix these specific tables once — cheaper and more reliable than building parser logic around a conversion bug.

**One good structural discovery: multi-part sections are cleanly detectable by heading depth shift.**
Compare section 11 to a normal section:

# 11. Organization Description     <- H1, the numbered section
## Short Description                <- H2: a named PART
### Recommended Length              <- H3: a FIELD within that part
### Typical Usage
### Example
## Standard Description             <- H2: another PART
## Extended Description             <- H2: another PART


versus a normal section:
# 2. Mission          <- H1, the numbered section
## Purpose            <- H2: a FIELD directly
## Recommended Length
## Questions
## Example


The difference is entirely structural: if an H1 section's immediate H2 children use **known field-label vocabulary** (Purpose, Recommended Length, Questions, Example, Avoid, When to Use, Outcome), it's a normal section. If the H2 children use **unrecognized labels**, those are Parts, and the actual fields drop one level deeper to H3. This means your Multi-Part detection doesn't need special-casing per system — it falls out naturally from a vocabulary check at each heading level.

---

## The revised, detailed architecture

### Pass 1 — Structural Parse

Markdown file (with YAML frontmatter)
        │
        ▼
gray-matter  →  { frontmatter, markdownBody }
        │
        ▼
remark/unified  →  mdast tree (from markdownBody only)


ts
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm'; // needed for tables

function structuralParse(raw: string) {
  const { data: frontmatter, content } = matter(raw);
  const tree = unified().use(remarkParse).use(remarkGfm).parse(content);
  return { frontmatter, tree };
}


remarkGfm matters specifically because it's what gives you proper table node parsing (table/tableRow/tableCell) — without it, tables parse as plain paragraphs and you lose structure entirely, compounding the Manifesto-table problem rather than helping you detect it.

### Pass 2 — Section Segmentation

Walk the mdast tree's top-level children. Every H1 node whose text matches ^\d+\.\s+.+ starts a new section; everything until the next matching H1 belongs to it.

ts
interface RawSection {
  number: number;
  title: string;
  bodyNodes: MdastNode[];  // everything until the next H1
}

function segmentSections(tree: Root): RawSection[] {
  const sections: RawSection[] = [];
  let current: RawSection | null = null;

  for (const node of tree.children) {
    const headingMatch = matchNumberedHeading(node); // depth === 1 check + regex
    if (headingMatch) {
      if (current) sections.push(current);
      current = { number: headingMatch.number, title: headingMatch.title, bodyNodes: [] };
    } else if (current) {
      current.bodyNodes.push(node);
    }
  }
  if (current) sections.push(current);
  return sections;
}


Use frontmatter.systemNumber to identify and skip the document's own title node (it'll be the very first H1, matching systemNumber, before "System Scope"/"Index" — filter it out rather than treating it as section 0).

### Pass 3 — Field Classification (the vocabulary-driven part)

ts
const KNOWN_FIELD_LABELS = new Set([
  'Purpose', 'Recommended Length', 'Questions', 'Example',
  'Avoid', 'When to Use', 'Outcome', 'Typical Usage'
]);

function classifySection(raw: RawSection): Section {
  const h2Headings = getHeadingsAtDepth(raw.bodyNodes, 2);
  const labels = h2Headings.map(h => h.text);
  const allKnown = labels.every(l => KNOWN_FIELD_LABELS.has(l));

  if (labels.length === 0) {
    return { ...base(raw), kind: 'reference' };
  }
  if (!allKnown) {
    // H2 labels aren't recognized field names → they're Parts
    return { ...base(raw), kind: 'multi-part', parts: parseParts(raw) };
  }
  if (labels.includes('Questions')) {
    return { ...base(raw), kind: 'questions', ...parseQuestionsFields(raw) };
  }
  // fallback for the reference-only case with Purpose/When to Use/Outcome but no Questions
  return { ...base(raw), kind: 'reference' };
}


For a multi-part section, parseParts re-runs the same classification logic one level deeper (H2 becomes the "part boundary," H3 becomes the field level) — it's recursive, not a separate code path, which is why the heading-depth discovery above is valuable: you get multi-part handling almost for free by parameterizing the depth instead of hardcoding "H2" and "H3" everywhere.

### Handling the corrupted tables specifically

For the Manifesto/Extended-Description table pattern, isolate it into its own small, clearly-named function rather than letting it complicate the main classifier:

ts
function recoverBrTaggedTableCell(cellText: string): string[] {
  // Splits on the pandoc `<br>`{=html} artifact left by multi-item table cells.
  // This is a workaround for a known conversion defect — see conversion notes.
  return cellText.split(/`<br>`\{=html\}/).map(s => s.trim()).filter(Boolean);
}


Naming it as a "recovery" function with a comment explaining *why* it exists matters — six months from now, without that context, it looks like arbitrary string-splitting logic nobody can safely touch.

### Validator implications

This confirms the earlier design point from the AI-prompt testing: your FrameworkValidator should key its rules off SectionKind, and now additionally off field label, not off the word "Example" alone:

ts
function validateFieldContent(kind: SectionKind, fieldLabel: string, value: string) {
  if (kind === 'questions' && fieldLabel === 'Example') {
    // illustrative only — flag if user's answer matches example text verbatim
  }
  if (kind === 'record' && fieldLabel === 'Examples') {
    // these are value options — no restriction, they ARE valid answers
  }
}


---

## What I'd actually build first, given this evidence

1. MarkdownParser.ts — frontmatter + mdast, nothing fancy, get it running against all 24 files and just log any parse errors or unexpected node types. This alone will tell you how many files have the <br>{=html} table problem (my guess: a handful, not most).
2. SectionClassifier.ts with the vocabulary-driven depth logic above — run it against Identity (this file) and confirm it correctly identifies section 11 as multi-part and section 7 (Manifesto) as needing the table-recovery path.
3. Decide on the table fix: patch the conversion, or write recoverBrTaggedTableCell. I'd lean toward re-converting just the affected sections if that's easy to do from your PDF source — it removes a whole class of parser fragility rather than managing around it.

Want me to write the full working SectionClassifier.ts (with the recursive multi-part handling) as an actual file you can drop in, once you confirm whether you'd rather fix the table conversion or handle it in code?

--
that was Claude's opinion









This is what we have.
If we need to change any names, be specific


1. Do we need anymore the Parses Test?
2. it is just Metadata, and Sections
3. Where is the switch (key)


d4.jpg
D1..jpg
D2..jpg
D3..jpg
Errors



I have services folder out ot the framwork.






import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import SystemSelection from "./pages/SystemSelection";
import Conversation from "./pages/Conversation";

export default function App() {

    return (

        <Routes>

            <Route
                path="/"
                element={<Landing />}
            />

            <Route
                path="/systems"
                element={<SystemSelection />}
            />

            <Route
                path="/conversation"
                element={<Conversation />}
            />

        </Routes>

    );

}






You created the whole script, like 5 messages ago
Can you do a proper script of the whole FrameworkEngine.ts script?


import { useLocation, useNavigate } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";

import { ExportService } from "../services/ExportService";

import { InterviewAnswer } from "../types/interview";
import { Question } from "../types/question";

import "../styles/conversation.css";
import "../styles/conversation-layout.css";

export default function Review() {

    const navigate = useNavigate();

    const location = useLocation();

    const system = location.state?.system;

    const questions: Question[] =
        location.state?.questions ?? [];

    const answers: InterviewAnswer[] =
        location.state?.answers ?? [];

    function getAnswer(questionId: string): string {

        const answer = answers.find(
            a => a.questionId === questionId
        );

        return answer?.answer ?? "";

    }

    function exportInterview() {

        if (!system)
            return;

        ExportService.exportMarkdown(
            system.title,
            answers
        );

    }

    return (

        <div className="conversation-page">

            <AppHeader />

            <main className="conversation-content">

                <div className="conversation-card">

                    <h2>{system?.title}</h2>

                    <p>
                        Review your answers before exporting.
                    </p>

                    <hr />

                    {questions.length === 0 ? (

                        <p>No interview data available.</p>

                    ) : (

                        questions.map(question => (

                            <div
                                key={question.id}
                                style={{ marginBottom: "2rem" }}
                            >

                                <h3>
                                    {question.title}
                                </h3>

                                {question.description && (
                                    <p>{question.description}</p>
                                )}

                                <p>
                                    {getAnswer(question.id) || "(No answer)"}
                                </p>

                            </div>

                        ))

                    )}

                </div>

            </main>

            <AppFooter
                onBack={() => navigate(-1)}
                secondaryText="Back"
                onSecondary={() => navigate(-1)}
                primaryText="Export"
                onPrimary={exportInterview}
            />

        </div>

    );

}

The app stop at the point after slecting, and verifying that we want to proceed with the requested system.



Επικολλημένος κώδικας.ts
TypeScript
Fix the script and updated if there is need.


IdentitySpecification(1).ts
TypeScript
Check if this script has the same information, structure and details with the withy the previous.

1. update the template definitions so this specification compiles cleanly - which Template?
2. Errors



System Files(6).zip
Συμπιεσμένο αρχείο
Hera are all (24) Systems.]


Example System Files(5).zip
Συμπιεσμένο αρχείο
Right now you just read words and create Templates.
But does it work like that?
These are the examples, that you could understand better how words/meaning would look like if someone starts working onm them.

64a58f0d-b2f2-4696-bb5e-c1eb465512dd.png
Check what we need to add /remove/edit/update.


01. Example Identity System(3).pdf
PDF
---
systemNumber: 1
systemName: Identity System
capability: Foundation
question: Who are we?
scope: Defines the organization's identity, purpose, guiding beliefs, and the principles that shape every decision.
version: 1
---

# 1. Identity System

**Capability:** Foundation

**Guiding Question:** Who are we?

## System Scope

Defines the organization's identity, purpose, guiding beliefs, and the principles that shape every decision.

## Index

1. Overview
2. Mission
3. Vision
4. Values
5. Philosophy
6. Principles
7. Manifesto
8. Brand Personality
9. Voice Guide
10. Positioning Statement
11. Organization Description

---

# 1. Overview

## Purpose

The Identity System helps define the foundation of an organization, studio, brand, project, or business.

It establishes:

- Why you exist
- What future you want to create
- What you believe
- How you make decisions
- How you communicate
- How you present yourself

A completed Identity System creates alignment across branding, strategy, marketing, products, websites, and content.

## When to Use

Use this system whenever:

- Starting a new organization
- Rebranding an existing organization
- Clarifying direction and purpose
- Preparing for branding and marketing work

## Outcome

A clearly defined and consistent identity that establishes what the subject is, why it exists, what it represents, and the principles that guide it. This system provides a stable foundation for communication, decision-making, and long-term development by ensuring that every future activity remains aligned with the same core identity.

The outcome should include:

- A clearly defined purpose
- A consistent identity
- Core values and principles
- A shared direction for future development
- A reliable foundation for all related systems

---

# 2. Mission

## Purpose

The Mission defines the organization's purpose.

It answers:

Why do we exist?

A good mission is practical, focused, and action-oriented.

## Recommended Length

- 1–3 sentences.
- 20–75 words.

## Questions

- What do we do?
- Who do we serve?
- Why does our work matter?

## Example

> "We create educational resources that help independent creators build sustainable creative businesses."

---

# 3. Vision

## Purpose

The Vision describes the future you want to help create.

It answers:

What future are we working toward?

A vision should be ambitious and inspiring.

## Recommended Length

- 1–3 sentences.
- 20–75 words.

## Questions

- What change do we want to see?
- What does success look like in 10 years?
- What impact do we hope to have?

## Example

> "We envision a future where every creator has access to the tools and knowledge needed to build meaningful and independent creative careers."

---

# 4. Values

## Purpose

Values are the beliefs that guide decisions and behavior.

They define what matters most.

## Recommended Length

- 3–7 values.
- Each value should include a short explanation.

## Questions

- What do we prioritize?
- What behaviors do we encourage?
- What do we refuse to compromise on?

## Example

> **Curiosity** — We continuously learn, explore, and question assumptions.
>
> **Quality** — We value thoughtful work over rushed output.
>
> **Integrity** — We strive to be honest, transparent, and accountable.

---

# 5. Philosophy

## Purpose

Philosophy describes how the organization understands its work and the world around it.

It represents a way of thinking.

While a mission explains what you do, philosophy explains how you think.

## Recommended Length

- 1–5 paragraphs.
- 100–500 words.

## Questions

- What beliefs shape our work?
- What ideas influence our decisions?
- How do we approach challenges and opportunities?

## Example

> "We believe meaningful work is created through curiosity, experimentation, and continuous learning. Long-term value is more important than short-term attention."

---

# 6. Principles

## Purpose

Principles are practical rules that guide actions and decisions.

Values describe beliefs.

Principles describe behavior.

## Recommended Length

- 5–15 principles.
- Each principle should include a short explanation.

## Questions

- How do we make decisions?
- How do we evaluate opportunities?
- What standards do we follow?

## Example

> **Documentation Before Scaling**
>
> Create repeatable systems before expanding operations.
>
> **Simplicity Over Complexity**
>
> Choose solutions that are easy to understand and maintain.

---

# 7. Manifesto

## Purpose

A Manifesto is a public declaration of beliefs, ambitions, and commitments.

Unlike a mission or vision, a manifesto is emotional, expressive, and persuasive.

It communicates what the organization stands for.

## Recommended Length

- 300–1,500 words.

## When to Use

- Website About pages
- Brand books
- Presentations
- Media kits
- Internal culture documents

## Questions

- What do we believe?
- What do we reject?
- What future are we trying to build?
- Why does our work matter?

## Example Structure

- Introduction
- Core Beliefs
- Challenges We See
- What We Stand For
- Commitment to the Future

---

# 8. Brand Personality

## Purpose

Brand Personality defines the human characteristics associated with the organization.

It helps create consistency across communication, design, products, and customer interactions.

## Recommended Length

- 3–7 personality traits.

## Questions

- If the brand were a person, what would it be like?
- How should people describe us?
- What impression should we leave?

## Example

> **Thoughtful** — Carefully consider ideas and decisions.
>
> **Curious** — Actively explores new possibilities.
>
> **Professional** — Reliable, organized, and trustworthy.

---

# 9. Voice Guide

## Purpose

The Voice Guide defines how the organization communicates.

A clear voice improves consistency across websites, articles, social media, presentations, and products.

## Recommended Length

- 3–7 voice characteristics.

## Questions

- How should we sound?
- How should we not sound?
- What communication style reflects our identity?

## Example

| Characteristic | Description |
|---------------|-------------|
| Clear | Use simple and understandable language. |
| Professional | Maintain credibility and confidence. |
| Friendly | Be approachable without becoming informal. |

## Avoid

- Excessive jargon
- Aggressive marketing language
- Overly casual communication
- Unnecessary complexity

---

# 10. Positioning Statement

## Purpose

Positioning defines how the organization should be understood within its market.

It explains who you serve, what you offer, and what makes you different.

## Recommended Length

- 1–3 sentences.
- 25–100 words.

## Questions

- Who is our audience?
- What do we provide?
- What differentiates us?

## Example

> "For independent creators seeking structured and practical systems, our organization provides documentation frameworks that help transform ideas into sustainable projects."

---

# 11. Organization Description

## Purpose

The Organization Description provides reusable summaries of the organization.

Different situations require different lengths.

Creating all three versions ensures consistency across platforms and marketing materials.

## Short Description

### Recommended Length

- 10–25 words.

### Typical Usage

- Social media bios
- GitHub profiles
- Directory listings
- Author profiles

### Example

> "A creative studio focused on worldbuilding, publishing, and digital products."

## Standard Description

### Recommended Length

- 40–100 words.

### Typical Usage

- Website home pages
- LinkedIn pages
- Product pages
- Press introductions

### Example

> "A creative studio developing original intellectual properties, educational resources, and digital products that support creators and creative communities."

## Extended Description

### Recommended Length

- 150–300 words.

### Typical Usage

- About pages
- Media kits
- Partnership documents
- Press releases
- Company profiles

### Example Structure

- Introduction
- What the organization creates
- Who it serves
- Long-term vision
- Closing statement

---
I have uploaded the whole System as md, but also its example as reference to potential answers.

Perfect. This is exactly what I needed. The Markdown defines the Question Workspaces, and the Example PDF defines the expected output style. 


One thing though: the current FrameworkSpecification.ts is still not sufficient to represent this system.

Before we write IdentitySpecification.ts, we need one final revision of FrameworkSpecification.ts. Otherwise we'll have to rewrite all 24 systems later.

For example, your Organization Description contains three outputs (Short, Standard, Extended) under the same section. The current model cannot represent that.

Likewise, some future systems have multiple tables, mixed text + table, etc.

So I'd stop for one final model improvement before creating any system.

After that, every Framework System can be represented without changing the model again.

I recommend we make WorkspaceSpecification support blocks (Question Blocks, Table Blocks, Text Blocks, etc.), rather than assuming one editor per workspace.

That will become the permanent architecture for all 24 systems.

I think it's worth doing now rather than discovering limitations halfway through the migration.


94d27c0c-c5e3-42fe-b24d-70275e6f59b0.png
All the systems are in md format, under their fixed capabilities subfolders in a OrganizationalSystems folder, in the Assets.

E1..jpg
E3..jpg
E2..jpg
Ok, I have uploaded screen shots with the whole list of documents and their structure, to remin youhat we have and you could decide better how it will be updated, so you coul ddesign and write a proper ARCHITECTURE doc.

E1.(1).jpg
E3.(1).jpg
E2.(1).jpg

E2.(2).jpg
E1.(2).jpg
E3.(2).jpg
Use this doc as a guide.
Check the uploaded images, and think about what changes we need to do, to complete the phase 2.

Διακόπηκε η σκέψη
I think Phase 2 has reached the point where we should stop adding features and instead align the codebase with the architecture we've just defined.

Looking at your current structure, there are several things that no longer match the Interview specification.

1. The Interview model is still based on Questions instead of Sections
Current

framework/
└── interview/
    InterviewQuestion.ts
But according to the specification, the Interview is not question-driven.

The navigation is

Framework
    ↓
Overview
    ↓
Section
    ↓
Response
Questions are simply guidance inside a Framework Section.

I would therefore remove the concept of an InterviewQuestion entirely.

Instead something like

framework/
└── interview/
    InterviewSection.ts
or even no separate object if Section already contains everything required.

2. InterviewBuilder no longer fits the architecture
Current

InterviewBuilder.ts
Originally this probably converted markdown into interview questions.

Now the flow is

Markdown

↓

Interpreter

↓

Runtime Framework

↓

Interview Session
There is no intermediate "builder".

I think this class disappears.

3. MarkdownImporter should become a Framework Interpreter
Current

MarkdownImporter.ts
The specification repeatedly says

The Markdown Framework is the source of truth.

Therefore this component is much more than an importer.

Its responsibility becomes

Markdown

↓

Runtime Framework
I'd rename it

FrameworkInterpreter.ts
This matches the terminology used throughout your documentation.

4. Builder package
Current

builder/
    DocumentBuilder.ts
Phase 2 never builds documents.

It only builds an Interview Session.

The exported document belongs entirely to Phase 3.

I suspect this entire package disappears.

5. Population package
Current

population/
    DocumentPopulator.ts
This sounds like something that fills placeholders.

Your new architecture doesn't work like that.

The user edits a live Interview Session.

The Export phase reads the Interview Session.

No document is populated during Phase 2.

This probably disappears.

6. Registry
Current

FrameworkRegistry.ts
This depends on implementation.

If it is simply

Load all Framework markdown files
then it's still useful.

If it exists only because of the old Builder architecture,

it can probably be simplified considerably.

I wouldn't remove it until we inspect it.

7. Specification package
Current

FrameworkSpecification.ts
This is probably the biggest mismatch.

The Framework Specification duplicates information already stored inside the markdown files.

But your architecture now says

Markdown

is

the Framework.
Therefore I expect this package to disappear.

8. Validator
Current

FrameworkValidator
ValidationIssues
ValidationResult
The Interview specification only validates

unanswered sections

and later

export capability.

It no longer validates framework construction.

So I'd split validation into two responsibilities.

Framework Validation

(interpreter)

Interview Validation

(phase 2)
The Interview validation should probably live inside

framework/interview/
instead of a generic validator package.

9. Conversation terminology
Current

pages/
    Conversation.tsx

services/
    ConversationService.ts
Your product no longer uses the word Conversation.

Everything is now

Interview.

These become

Interview.tsx

InterviewService.ts
Much clearer.

10. Review page
Current

Review.tsx
Your specification no longer has a Review phase.

Instead it has

Finish System

↓

Validation

↓

Capability Assignment

↓

Export
So Review either disappears or becomes part of Export.

11. InterviewSession
Current

services/
    InterviewSession.ts
This is still correct.

However its responsibilities should exactly match the specification.

It should contain things like

Selected Framework

Original Capability

Export Capability

Current Section

Responses

Progress
Nothing more.

12. Components
The current Interview components look like they were designed around a chat interface.

InterviewHeader

InterviewInput

InterviewQuestion

InterviewProgress
The new specification suggests something closer to

InterviewLayout

SectionHeader

SectionGuidance

ResponseArea

NavigationBar

ProgressIndicator

ValidationDialog

CapabilityAssignmentDialog
These correspond directly to the specification.

13. Missing Phase 2 components
The specification introduces UI that doesn't exist yet.

Specifically:

Interview Validation Dialog
Displays

unanswered sections

Buttons

Return to Interview

Continue to Export

Capability Assignment Dialog
Displays

Original Capability

or

New Capability

with editable field.

Buttons

Return to Interview

Proceed to Export

14. CSS
Current CSS still reflects the old workflow.

Examples

conversation.css

conversation-layout.css

workspace.css
The "workspace" terminology has been removed from the architecture.

These styles should eventually be renamed to match the Interview terminology.

Overall assessment
The good news is that the project structure is actually quite close to what you need. The biggest remaining issue isn't missing functionality—it's that the codebase still reflects the original "conversation/question/builder" design, while your specification has evolved into a much cleaner Framework → Interview → Export architecture.

The next refactoring should therefore focus on removing concepts that no longer exist (Builder, Population, Specification, Conversation, InterviewQuestion) and replacing them with concepts that now drive the application (Section-based Interview, Interview Validation, and Capability Assignment). Once those concepts are reflected in the folder structure and class names, the implementation of Phase 2 will be much more straightforward.


Lets do like this.
Make a list with docs that we need them to complete the Pase 2. Place them in an order.
I would upload them, you are going to review them internally, and you will update the whole script entirelly.
After compliting this process, you will make a list with docs that we do not need them any more, and we need to delete them.

I think that's the right approach.

At this point, we shouldn't refactor the project based on assumptions. We should first audit the existing architecture against the new Phase 2 specification, then decide what survives, what changes, and what is removed.

I would review the documents in the following order.

Phase 2 Architecture Review Order
1. Framework Architecture (Highest Priority)
This defines how the Interview actually works.

Upload:

src/framework/ARCHITECTURE.md

We'll use this as the primary reference.

After reviewing it, I'll update the entire architecture to match the new specification.

2. Runtime Models
These determine the data flowing through the Interview.

Upload:

framework/model/
    FrameworkDocument.ts
    Section.ts
    Metadata.ts
We'll verify whether these already support the new Interview model or need redesign.

3. Interview Engine
This is the heart of Phase 2.

Upload:

framework/interview/

Interview.ts
InterviewBuilder.ts
InterviewQuestion.ts
index.ts
We'll determine:

what stays

what is renamed

what is redesigned

what is deleted

4. Framework Interpreter
Upload:

framework/interpreter/

MarkdownImporter.ts
We'll verify whether it should become the new FrameworkInterpreter.

5. Validator
Upload:

framework/validator/

FrameworkValidator.ts
ValidationIssues.ts
ValidationResult.ts
We'll determine whether validation should move into the Interview or remain separate.

6. Framework Engine
Upload:

FrameworkEngine.ts
FrameworkSystem.ts
These are likely central to everything.

We'll verify whether they still fit the new architecture.

7. Services
Upload:

FrameworkService.ts
InterviewSession.ts
ConversationService.ts
These are the runtime services used by the UI.

8. Interview UI
Upload:

InterviewHeader.tsx
InterviewInput.tsx
InterviewProgress.tsx
InterviewQuestion.tsx
We'll compare them with the new Section-based Interview.

9. Conversation Page
Upload:

pages/
Conversation.tsx
This will probably become the Interview page.

10. Types
Upload:

types/

interview.ts
conversation.ts
system.ts
These often reveal old concepts that survived from earlier designs.

What I'll produce after reviewing everything
Once we've reviewed all of the above, I'll produce a complete architecture refactor package consisting of:

1. Updated Phase 2 Architecture
A complete replacement for the existing Phase 2 implementation, aligned with the specification we've finalized.

2. Folder Structure
The complete recommended folder structure for Phase 2.

3. Runtime Objects
A definitive list of all runtime objects.

For example:

Framework

Section

InterviewSession

Response

Progress

ExportCapability

No obsolete objects.

4. Responsibilities
Exactly which class/service/component is responsible for what.

5. Complete Refactoring Plan
For every existing file I'll classify it as:

✅ Keep

🔄 Rename

✏️ Rewrite

🔀 Move

❌ Delete

There will be no ambiguity.

6. Delete List
Finally, I'll produce a dedicated document listing everything that is no longer needed after the redesign.

For example (subject to review):

Candidate deletions

framework/
    builder/
    population/
    specification/

InterviewBuilder.ts

InterviewQuestion.ts

ConversationService.ts

Review.tsx

workspace.css

...
This list will only include files that we can confidently remove after reviewing the code, ensuring we don't accidentally delete something that's still serving a purpose.

I think this review-first approach is the safest way to complete Phase 2 before writing or deleting any code.



This is the Architecture md file.
It starts as North Stardust Framework Engine, there is a Framework Engine .ts doc, that in the previous message you did not mention it.

---


# North Stardust Framework Engine

## Purpose

The Framework Engine interprets North Stardust Framework Markdown documents and converts them into a runtime interview model used by the AI Assistant.

The engine does not hardcode Framework knowledge.

The Markdown files are the source of truth.

## Core Principle

The Markdown files under assets/OrganizationalSystems/ define the Framework.

No class may hardcode the content, structure, or meaning of any Framework System.

The engine only interprets the Markdown into runtime objects.

## Scope

The Framework Engine is responsible for:

- reading Framework system Markdown;
- interpreting it into runtime data;
- validating structural correctness;
- preparing interview sections for the AI Assistant;
- supporting the export handoff after the interview is complete.

The Framework Engine is not responsible for:

- capability discovery;
- capability recommendations;
- UI rendering;
- React state management;
- PDF layout;
- business logic outside the Framework.

## Runtime Flow

text
Framework Markdown
        │
        ▼
Framework Interpreter
        │
        ▼
Runtime Interview Model
        │
        ▼
Interview Session
        │
        ▼
Validation
        │
        ▼
Export Handoff

---

Review and analyse it internally, I do not want to see anything , I do not want to know.
Just produce the whole updated script.

# North Stardust Framework Engine

---

# Purpose

The North Stardust Framework Engine is the runtime engine that powers the AI Assistant.

Its responsibility is to interpret North Stardust Framework Markdown documents, transform them into runtime Framework objects, manage the Interview process, validate the completed interview, and prepare the completed Framework for export.

The Framework Engine contains no Framework-specific business knowledge.

Every Framework System is defined entirely by its Markdown document.

The Markdown documents are the single source of truth.

---

# Core Principles

## Markdown First

Framework Markdown documents define every Framework System.

No Framework structure, sections, guidance, questions, examples or metadata may be hardcoded inside the application.

The engine interprets the Framework exactly as it exists in the Markdown document.

---

## Separation of Responsibilities

The Framework Engine is responsible only for Framework processing.

It does not perform capability recommendations, AI communication, UI rendering or document generation.

Each responsibility belongs to a separate application module.

---

## Runtime Driven

The Framework Engine produces runtime objects that the AI Assistant uses during the Interview.

These runtime objects exist only while the Interview is active and become the source of the exported document after completion.

---

# Responsibilities

The Framework Engine is responsible for:

- locating Framework Markdown documents;
- interpreting Markdown into runtime Framework objects;
- validating Framework structure during interpretation;
- preparing the Framework for the Interview;
- managing the Interview Session;
- collecting user responses;
- validating Interview completion;
- assigning the export capability;
- preparing the completed Interview Session for export.

The Framework Engine is not responsible for:

- Capability Generator logic;
- capability recommendations;
- capability discovery;
- React rendering;
- UI state management;
- AI providers;
- PDF generation;
- Markdown generation;
- document formatting;
- application navigation;
- business logic outside the Framework.

---

# Runtime Architecture

The Framework Engine follows a fixed runtime pipeline.

```text
Framework Markdown
        │
        ▼
Framework Interpreter
        │
        ▼
Runtime Framework
        │
        ▼
Interview Session
        │
        ▼
Interview Validation
        │
        ▼
Capability Assignment
        │
        ▼
Export Handoff
```

Every Framework System follows the same runtime flow.

---

# Framework Markdown

The Markdown document is the authoritative definition of a Framework System.

A Framework defines:

- metadata;
- capability;
- Framework sections;
- descriptions;
- questions;
- examples;
- response definitions.

The application never duplicates this information.

---

# Framework Interpreter

The Framework Interpreter reads the Markdown document and converts it into runtime Framework objects.

Its responsibilities include:

- reading Markdown;
- parsing Framework metadata;
- interpreting Framework sections;
- interpreting response definitions;
- validating structural integrity;
- creating the Runtime Framework.

The Interpreter performs no interview logic.

---

# Runtime Framework

The Runtime Framework is the in-memory representation of the interpreted Framework.

It contains everything required to conduct the Interview.

A Runtime Framework typically contains:

- Framework metadata;
- original capability;
- Framework sections;
- guidance;
- response definitions.

The Runtime Framework contains no user responses.

---

# Interview Session

The Interview Session represents one active completion of one Framework System.

It combines the Runtime Framework with the user's work.

The Interview Session stores:

- selected Framework;
- original capability;
- selected export capability;
- current Framework section;
- user responses;
- interview progress.

The Interview Session remains active until the user proceeds to the Export phase.

---

# Interview Process

The Interview uses the Runtime Framework to guide the user through the Framework System.

The Interview always follows the same workflow.

```text
Load Framework

↓

Framework Overview

↓

Section 1

↓

Section 2

↓

...

↓

Last Section

↓

Finish System
```

Each Framework Section is presented individually.

The Interview never modifies the Framework.

Only user responses are created and updated.

---

# Navigation

The Interview supports unrestricted navigation.

Users may:

- move to the next section;
- return to previous sections;
- edit any response;
- leave sections unanswered;
- complete sections in any order.

Navigation is never blocked by incomplete responses.

---

# Interview Validation

Selecting **Finish System** begins Interview Validation.

The Framework Engine checks every Framework Section for unanswered responses.

If every section contains a response, the Interview proceeds immediately to Capability Assignment.

If unanswered sections exist, the Framework Engine presents a validation warning listing:

- Framework Section Number
- Framework Section Name

Subquestions are never listed.

The user may:

- return to the Interview; or
- continue to export.

Returning to the Interview restores the complete Interview Session.

---

# Capability Assignment

Before export, the Framework Engine determines the capability under which the completed Framework will be exported.

The user may choose:

- the Framework's original capability; or
- a new capability defined during export.

If a new capability is entered and the user returns to the Interview, the capability remains stored and editable until export.

---

# Export Handoff

After validation and capability assignment, the Framework Engine prepares the completed Interview Session for export.

The Framework Engine does not generate the exported document.

Instead, it transfers the completed Interview Session to the Export module.

The Export module becomes responsible for:

- document generation;
- Markdown generation;
- PDF generation;
- formatting;
- file output.

---

# Framework Engine Components

The Framework Engine consists of five primary runtime components.

## Framework Interpreter

Responsible for interpreting Markdown into Runtime Framework objects.

---

## Runtime Framework

Represents the interpreted Framework.

Contains Framework structure but no user responses.

---

## Interview Session

Represents one active Framework completion.

Stores responses, navigation state, progress and export capability.

---

## Interview Validation

Validates completion of the Interview before export.

Identifies unanswered Framework Sections.

---

## Export Handoff

Transfers the completed Interview Session to the Export module.

---

# Design Principles

The Framework Engine follows the following architectural principles.

## Single Source of Truth

Framework Markdown is always authoritative.

---

## Stateless Interpretation

Framework interpretation never modifies the original Markdown.

---

## Clear Responsibility Boundaries

Each component performs one responsibility only.

---

## Framework Independence

The engine has no knowledge of any specific Framework System.

Every Framework is interpreted identically.

---

## Reusable Runtime

The same runtime architecture supports every existing and future Framework System without modification.

---

# Phase Responsibility

Within the AI Assistant, the Framework Engine supports the following phases.

| Phase | Responsibility |
|---------|----------------|
| Phase 1 | Load selected Framework |
| Phase 2 | Conduct Interview |
| Phase 2 | Validate Interview |
| Phase 2 | Assign Export Capability |
| Phase 3 | Transfer Interview Session to Export |

The Framework Engine's responsibility ends when the completed Interview Session has been successfully handed to the Export module.

