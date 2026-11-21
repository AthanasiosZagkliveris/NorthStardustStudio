# The Workbook — the page and its specification

Status: **index**, written 2026-11-20. The Workbook is one page of the app drawn as a dialog (layout rules, section 7, "The Workbook"): the title "Workbook" over its rule, one framed panel with the carousel arrows and a tab of bullets, a section a bullet. It opens from the header's **Workbook** button on every page with an Organisation open, and from the Landing page, where it covers every Organisation (`src/pages/Workbook.tsx`).

Each file here describes the app as it is; where it and the code differ, both are mended in one commit with a row in the log (`design/core/04-log.md`). The documents' contents are the engine's (`src/framework/engine/businessDocuments/`); their rules are doc 48, section 14, for the financial ones, and the Business System's specifications for what each page feeds them.

## The sections

| Section | Shown | Specification | Built by |
|---|---|---|---|
| Business Documents | an Organisation open | `business-documents.md` | `BusinessDocumentsView` (`group="business"`) |
| Financial Documents | an Organisation open; second, under Business Documents (owner, 2026-11-20 20:46 UTC+2) | `financial-documents.md` | `BusinessDocumentsView` (`group="financial"`) |
| Review | always; from the Landing page, the **Total review** of every Organisation | `review.md` | `OrganizationReview` |
| References | always | `references-and-glossary.md` | `Workbook.tsx` |
| Glossary | always; from the Landing page, every Organisation's names | `references-and-glossary.md` | `GlossaryList` |
| Card Notes | an Organisation open; last | `card-notes.md` | `Workbook.tsx` |

The rail's order is the order above with an Organisation open (`["documents", "financial-documents", "review", "references", "glossary", "card-notes"]`), and Review, References, Glossary from the Landing page. A section's title is the panel's heading, with its "i" (`GLOSSARY_INFO`) for the Glossary, the References and both kinds of document.

## One page for the Landing page and an Organisation

The same code draws both (`landing` in `Workbook.tsx`): opened from the Landing page, or with no Organisation, the header is the Landing page's, the Review is the Total review with a funnel of the Organisations (two or more), and the Glossary lists every Organisation's names, each with its Organisation; the documents and the Card Notes belong to one Organisation and are left out. Back returns to where it was opened from.

## What the Workbook reads

Every System's saved answers, the Global Settings and the Organisation's name (`OrganizationService`); it writes nothing but the reader's choices (the tab, the funnels, the text size, the Forecast's period), none of them saved with the answers.
