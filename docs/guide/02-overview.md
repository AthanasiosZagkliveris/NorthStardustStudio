# Overview of the app: its guide and its specifications

Status: **reference**, written 2026-11-21, updated 2026-11-27 (its parts 5 and 6, the future features and their sources, are Guide 3 since 2026-11-27). It describes the app as it is and points to the one document that owns each fact. The future features are Guide 3; the to-do list for the Beta and Version 1 is Records 2. Asked by the owner on 2026-11-21 00:56 UTC+2: "create a new document with the app's guide and specs and its future features … Do online research and check what extra features the app needs now, or it could have in the future".

## Contents

1. [What the app is](#1-what-the-app-is)
2. [The guide](#2-the-guide)
3. [The specifications](#3-the-specifications)
4. [How the answers connect](#4-how-the-answers-connect)

## 1. What the app is

North Stardust interviews an early-stage founder -- on their own or in a small team -- and writes their business documents from the answers. Four Systems, answered in order, each a page or pages of tiles that open their questions in dialogs and floating cards:

| System | Pages | What it asks |
|---|---|---|
| 1. Identity | one page: Definition, Purpose | the organisation, its positioning, founders and ownership, registrations and expenses; mission, vision, values, principles, philosophy, manifesto |
| 2. Brand | one page: Ambassador, Style | the brand as a person; colours, typography, text hierarchy, icon and logo, images |
| 3. Business | three pages: Foundation & Engagement, Infrastructure & Capability, Financials | segments, profiles, competitors, offerings, value propositions, channels, relationships, expected sales; founders' hours, resources, activities, partners and suppliers, capacity and delivery; revenue streams, costs, funding |
| 4. Strategy | one page: Situation & Direction | the current situation, the SWOT, the strategic compass, the strategic period with its themes, goals, objectives, metrics and roadmap |

The **Workbook** records what the answers work out: the Business Documents (Business Plan, Business Model Canvas), the Financial Documents (Financial Forecast, Funding Request, Financial Plan), the Review, the References, the Glossary and the Card Notes. The web and store version is the **Foundation edition**: these four Systems alone, the other capabilities hidden (Records 2, 5.7). The answers stay in the browser on the founder's device; there is no account or server yet. Desktop web, from a window 768px wide; WCAG 2.2 AA; UK English.

## 2. The guide

How a founder uses the app, step by step, is [the user guide](01-user-guide.md) (the one owner): the Organisations screen (section 2), the Systems and their pages (section 3), the header's Menu and Workbook (section 4), the Workbook (section 4.1). This document does not repeat it.

## 3. The specifications

Each page and screen has its specification under `docs/specifications/`:

| Part of the app | Specification |
|---|---|
| Identity System | [identity-system](../specifications/01-identity-system/01-definition.md) |
| Brand System | [brand-system](../specifications/02-brand-system/01-brand.md) |
| Business System | [business-system](../specifications/03-business-system/README.md): page 1, Foundation & Engagement; page 2, Infrastructure & Capability; page 3, Financials (its tiles: Questions 20, section 14) |
| Strategy System | [strategy-system](../specifications/04-strategy-system/01-situation-and-direction.md) |
| The Workbook | [workbook](../specifications/06-workbook/README.md), a file for each section |
| Settings, Appearance (the reading modes), Focus | [settings](../specifications/07-settings/README.md), [Global Settings](../specifications/07-settings/README.md#the-global-settings-screen) |
| The Inventory | [inventory](../specifications/05-inventory/README.md) |

The questions are in `docs/design/questions/` (their register: Questions 6); the layout is the rulebook's (`docs/ai/09-layout-rules.md`).

## 4. How the answers connect

The app fills, starts, offers or works out about 120 answers from earlier ones (drafts, starts, option lists, cards it makes, figures it computes): the list, with each one's source and code, is [Questions 5](../design/questions/05-auto-filled-answers.md). What waits for another answer (a city for its country) is listed in [AI 6, Chained answers](../ai/06-framework-conventions-and-patterns.md#chained-answers).
