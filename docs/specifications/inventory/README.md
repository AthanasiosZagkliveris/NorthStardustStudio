# The Inventory — Infrastructure & Capability's whole list

Status: **current design**, written 2026-11-20. The **Inventory** is the help tile of the Business System's page Infrastructure & Capability (the second of its three pages; Section 3) that holds every card of the page, and of the Legal Entity's expenses, in one place: as tiles or as a table, under one funnel. It asks nothing of its own: it shows and opens what the page's cards hold.

> **Keep this document true:** whoever changes a column, a filter, an order, a count or what a press opens changes this file in the same commit, with a row in the log. The layout is the rulebook's (`ai/layout-rules.md`, section 13, "Where the Inventory and Completed tiles stand" and "The Inventory dialog", and rule 36); this file names it and does not repeat it.

## Contents

1. [The tile](#1-the-tile)
2. [The dialog's bar](#2-the-dialogs-bar)
3. [The tiles view](#3-the-tiles-view)
4. [The table view](#4-the-table-view)
5. [The funnel: filters and orders](#5-the-funnel-filters-and-orders)
6. [What it reads and writes](#6-what-it-reads-and-writes)
7. [Not built yet](#7-not-built-yet)
8. [Where it is in the code](#8-where-it-is-in-the-code)

## 1. The tile

A rectangle with its title only, "INVENTORY", in the footer's band beside the **Completed** tile (which exists only while a card is completed), level with the page's Back link, taking no room above the footer (layout rules, section 13). Under the pointer it grows outwards to the left. It opens the Inventory dialog. The page's chapters and their tiles keep their one size (layout rules, section 23).

## 2. The dialog's bar

The count of cards (its "i" says what is incomplete and left out of every total: an incomplete Resource, Activity, Partner or Supplier, a founder's incomplete pay; `countedCapability`), the legend (Resource, Activity, Partner, Supplier: four text options, pressed = underlined), the view (**Tiles / Table**), the text size (three "Aa": 14, 18 and 24px) and the funnel (layout rules, section 13, "The Inventory dialog": spacing, the funnel window's placement and tint).

## 3. The tiles view

Every Resource, Activity, Partner, Provider, the Workspace, the Founders and the Legal Entity's expenses as tiles of the page's own make (one size, one face), each in the colour of the section it stands in on the page (Infrastructure, Offering's Capability, a Customer Channel's teal; a legal expense in the Legal Entity's neutral ground). A tile says, as labelled lines, where it belongs (Section, Group, Subgroup), then its status and its cost, with a small coloured dot for each link (an activity it made, a Partner, a Provider). A completed card is the Completed grey (rule 36). A press opens the card floating (layout rules, section 8, "One way to present a card"); a legal expense belongs to the Identity System, so its tile is shown only.

## 4. The table view

Columns, in order: Name (always shown, fixed while the table scrolls sideways), Type, Section, Category, Group, Cost (its heading carries the currency's symbol), Frequency, Cost Nature, Behaviour, Status, Offering, Journey, Actions, Linked (`TABLE_COLUMNS`; Offering, Journey and Actions off at first). A Customer Channel is not a column: a channel expense's Group reads the channel over its subchannel. Cost Nature and Behaviour are classified by the same rules as the Financials' Costs (Section 5, `page-3-costs-funding-and-position.md`). Grouped rows merge a group's cell over its rows; the texts wrap, never cut (layout rules, section 13, "The table").

## 5. The funnel: filters and orders

Include (each kind, the Workspace and the Founders among the resources), Sort, Belongs to (several places at once, each row in exactly one; the Organisation's Offerings by name), Columns, then Status, Frequency, Linked and Costs (a range, From and To), and under Costs the **Channel Costs** set-up (only the channel expenses, the highest first, its own columns). Include, Sort, Belongs to and Columns start folded and keep their state while the Inventory is open. The cost order: two arrows, highest or lowest first.

## 6. What it reads and writes

- **Reads:** the Business System's Section 3 (Infrastructure and Offering's Capability: every card, its costs, links and status), Section 2's channel expenses, the Offerings (Section 1), the Legal Entity's expenses and founders (the Identity System), the currency of the registered country.
- **Writes:** nothing of its own; a card opened from it is edited as on the page, saved in the page's answer. The view, the text size and the funnel are the reader's choices, kept while it is open, not saved.

## 7. Not built yet

From the not-done list (doc 05): **I7**, an Offering column and filter are built; the count of missing prices on the tile is not yet. **IN4**, the Costs sub tiles of the Financials opening the Inventory's table filtered to them.

## 8. Where it is in the code

`src/components/interview/tiles/CapabilityOverview.tsx` (the dialog, its tiles, table and funnel), `src/components/interview/editors/BusinessCapabilityEditor.tsx` (the tile in the footer's band), `src/components/interview/editors/ChannelResourceTable.tsx` (the shared table's cells), `src/framework/engine/AnswerBusinessCapability.ts`, `CardCompleteness.ts`.
