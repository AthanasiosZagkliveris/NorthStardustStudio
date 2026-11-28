# 13. Organising the documents and the code

Status: **research**, written 2026-11-28, updated 2026-11-28. The practices most recommended for organising files, documents and code, the list of ideas they give, and each idea checked against `docs/` and `src/`: what already holds, what was applied on 2026-11-28 and what waits for the owner. Asked by the owner on 2026-11-28 (16:34 UTC+2): "Do online research about best way and practices for organising files and documents. Make a list, and check what could work on the docs folders and files. The idea is to make them well organised, structured and explained, clear, and simple ... Do the same for the code."

Related: the standard of the documents (`standard.md`), the index (`README.md`), AI 4 (the code map), AI 5 (the folder plan), Research 12 (the speed round of the same day).

## Contents

1. [What the sources say](#1-what-the-sources-say)
2. [The list for the documents](#2-the-list-for-the-documents)
3. [The list for the code](#3-the-list-for-the-code)
4. [How the documents and the code were read](#4-how-the-documents-and-the-code-were-read)
5. [What waits for the owner](#5-what-waits-for-the-owner)
6. [Sources](#6-sources)

## 1. What the sources say

Eleven principles come back in every source, from documentation teams, university libraries and the records standard alike.

| # | Principle | What it asks | Sources |
|---|---|---|---|
| P1 | **One purpose for each document** | A document is a tutorial, a how-to guide, a reference or an explanation; each answers one need of the reader, and a page that mixes them serves none of them well. | [1][2] |
| P2 | **An entry point for every folder** | Each folder opens on an index or README that says what is in it and where to start. | [3][4] |
| P3 | **One naming convention, written down** | Short, descriptive, lowercase names with dashes and standard characters; a sortable part (a number or a date) first; the convention itself written in a readme, and kept by everyone. | [3][5][6][7] |
| P4 | **One owner for each fact** | A fact is written once and linked from the other places; repetition is kept only where the reader needs it there (the ARID rule: accept some repetition, on purpose). | [8][9] |
| P5 | **Current, or deleted** | A document changes with the code it describes; a document that describes nothing true is deleted or archived; the date of the last change is visible. | [8][9] |
| P6 | **Skimmable and front-loaded** | Plain English, short sentences, the key fact first, clear headings, a contents list on a long page. | [9][10] |
| P7 | **Shallow folders** | Three or four levels at most; a folder with one document is folded into its parent. | [4][11] |
| P8 | **Stable references** | A decision or a document keeps its id; a replaced one is marked as replaced and points to its successor, and is kept. | [12][13] |
| P9 | **Classify by activity, keep a retention rule** | Records are grouped by what they are for, carry their context (metadata), and older records move to an archive on a written rule. | [14] |
| P10 | **Files that change together sit together** | Code is grouped by the part of the app it serves (colocation), shared code is extracted only once two places need it, and the structure is not over-designed early. | [11] |
| P11 | **Nothing unused** | Files, exports and dependencies nothing uses are found by a tool that reads the whole project at once, and removed. | [15] |

## 2. The list for the documents

Each idea, what `docs/` does today, and what was done. "Holds" means the practice is already in place and checked.

| # | Idea | From | In `docs/` today | Done on 2026-11-28 |
|---|---|---|---|---|
| D1 | Each document has one kind, and the kinds map onto the four needs of a reader | P1 | Holds: the fourteen kinds of the standard, section 2. The user guide is the tutorial, the playbooks are the how-to guides, the references and specifications are the reference, the research and current design are the explanation. | The kinds table of the standard gives each kind its reader's need, so a writer picks the kind from the need. |
| D2 | Every folder opens on an index | P2 | Holds for `docs/` (README and index), each design chapter, `ai/` and the Business System. The small folders (`app/`, `guide/`, `testing/`, `proposals/`, `archive/`) are listed whole in `docs/README.md`. | Kept as it is: a README in a folder of one to three documents repeats the index (P4, P7). |
| D3 | One naming convention, written down | P3 | Holds: two-digit number, dashes, lowercase, the number in the title of a design document (`docs:standard` checks it). | The standard's folder table brought up to date: it still gave the retired numbers (1 to 55), "plain names" for `ai/` and old names for the specification folders. |
| D4 | Every document is in the index | P2, P5 | One was missing: AI 10 (`ai/10-layout-assets.md`, the generated numbers of the shared parts). | Added to the index; the `ai/` list sorted by number. A check that fails on a document missing from the index is in the code list (C5). |
| D5 | A long document opens with its contents | P6 | The rule is in the standard (section 2, item 6); five written documents missed it: AI 2, AI 6, Questions 12, Records 2 and the archived Shared Workspace proposal. | A contents list added to each. The check is in the code list (C5). |
| D6 | One owner for each fact | P4 | The index repeated the list of kinds from the standard, and gave ten of the fourteen. | The index points to the standard's list. |
| D7 | Every link and citation leads where it says | P5, P8 | `docs:standard` checks every link; plain-text citations are outside it. Found stale: Questions 20 named `page-3-*.md` (now Business System 5 and 6); Foundation 2 named Questions 14 for the card links (now the archived proposal `card-links.md`); Research 5 named Questions 2, 8.2 (now Questions 8, section 4); Questions 6 gave its owners by their retired numbers ("doc 37"); the subject index named sections 12 and 13 of the index for the proposals and the archive (they are 13 and 14) and "39" for the help-texts guide (Interface 10). | Each one corrected; Questions 6 through its generator. |
| D8 | Describe the present; history goes to the log | P5 | Holds, with two leftovers: AI 5 and the AI map still said what AI 5 "was" until 2026-11-21. | Both now say what is true; the old number stays in the index's table of old numbers. |
| D9 | Replaced numbers keep pointing to their documents | P8 | Holds: the index's table of the old numbers. Three rows (12, 25, 40) stood at the end out of order. | The table sorted by the old number. |
| D10 | Shallow folders | P7 | Holds: at most three levels below `docs/` (`docs/design/questions/`). | Nothing to do. |
| D11 | Plain, front-loaded writing | P6 | Holds: the standard, section 3. The research chapter's sentence in the index had lost its commas. | Its sentence written again, with Research 13. |
| D12 | Archive on a written rule | P9 | Holds: old log rows move to `archive/log/` by date; a finished proposal moves to `archive/proposals/`. | Nothing to do. |
| D13 | The date of the last change in one place | P4, P5 | Two dates say when a document changed: the "updated" date of its status line (written by hand) and the index's Updated column (the date of its last commit). They differ in about half of the documents (63 of 119 on 2026-11-28). | Left for the owner (section 5, item 1). |

## 3. The list for the code

| # | Idea | From | In `src/` and `tools/` today | Done on 2026-11-28 |
|---|---|---|---|---|
| C1 | Group code by the part of the app | P10 | Decided (AI 5, "The layout to come", owner, 2026-11-11): each page moves into a folder of its own when it is rebuilt as Tiles; the boundaries between the shared parts and the pages are in force and checked (`npm run lint:boundaries`). | Kept to the owner's plan: a move made now would touch every import and change nothing for the user. |
| C2 | No file that nothing uses | P11 | Holds: a scan of the 904 files of `src` (imports, `import.meta.glob`, the stylesheets' imports, the tools) found every file in use. | Nothing to remove. |
| C3 | No export that nothing imports | P11 | About 300 functions, constants and types are exported and read only inside their own file; an export says "used elsewhere", so a reader looks for a second user that is absent. | The `export` taken off each of them; the type check proves the app is unchanged. |
| C4 | A map of the code that names every folder | P2, P5 | Holds: AI 4 gives one line to each folder or group of folders, with the rules for a new file. | Nothing to do. |
| C5 | The documents' rules checked by the code | P5 | `docs:standard` checks the head, the numbers, the links and the anchors. It left two rules of the standard unchecked: every document is in the index (D4), and a long document opens with its contents (D5). | Both added to `docs:standard`. |
| C6 | Leftovers out of the project | P5, P9 | The owner's `delete/` folder holds 862 files (406 MB) waiting to be deleted by the owner. | Left for the owner (section 5, item 2). |

## 4. How the documents and the code were read

- **The documents:** all 118 Markdown files of `docs/` were read by a scan (title, status line, kind, both dates, sections, contents list, the citations by number, the `Related:` lines, every path in backticks, the contrast words of the voice rule) and every written document's head and `Related:` line was read in full. The standard, the index, the subject index, the AI map, AI 4 and AI 5 were read whole. The generated documents and the logs were read by the scan only: they are written by scripts or hold history.
- **The code:** all 904 files of `src` were read by two scans: one for files nothing imports, one for exports nothing imports (each export's name looked for in every other file of `src` and `tools`). `tools/` was checked against AI 4 and AI 5.

## 5. What waits for the owner

1. **One date for the last change (D13).** Recommended: the status line keeps the date the document was written, and the index's Updated column (from git) is the one date of the last change; the "updated" date then leaves the status lines. A smaller step: keep both, and correct the ones that differ. **[D]**
2. **The `delete/` folder (C6):** 406 MB of leftovers, to delete when convenient.

## 6. Sources

1. Procida, D. (2017 onwards) *Diátaxis: a systematic approach to technical documentation*. Available at: https://diataxis.fr/ (Accessed: 28 November 2026).
2. Canonical (2021) *Diátaxis, a new foundation for Canonical documentation*. Available at: https://ubuntu.com/blog/diataxis-a-new-foundation-for-canonical-documentation (Accessed: 28 November 2026).
3. Cloudflare (n.d.) *File conventions*, Cloudflare style guide. Available at: https://developers.cloudflare.com/style-guide/documentation-content-strategy/file-conventions/ (Accessed: 28 November 2026).
4. Umbraco (n.d.) *File names and structure*, documentation style guide. Available at: https://docs.umbraco.com/contributing/documentation/style-guide/structure (Accessed: 28 November 2026).
5. Carnegie Mellon University Libraries (n.d.) *Research data management: file naming*. Available at: https://guides.library.cmu.edu/researchdatamanagement/filenaming (Accessed: 28 November 2026).
6. University of Oregon Libraries (n.d.) *Data management: file naming*. Available at: https://researchguides.uoregon.edu/data-management/filenaming (Accessed: 28 November 2026).
7. Brown University Library (n.d.) *Data management: naming conventions*. Available at: https://libguides.brown.edu/DataManagement/naming (Accessed: 28 November 2026).
8. Google (n.d.) *Documentation best practices*, Google style guides. Available at: https://google.github.io/styleguide/docguide/best_practices (Accessed: 28 November 2026).
9. Write the Docs (n.d.) *Documentation principles*. Available at: https://writethedocs-www.readthedocs.io/guide/writing/docs-principles/ (Accessed: 28 November 2026).
10. Government Digital Service (n.d.) *Writing for GOV.UK*. Available at: https://www.gov.uk/guidance/content-design/writing-for-gov-uk (Accessed: 28 November 2026).
11. React (n.d.) *File structure*, React FAQ. Available at: https://legacy.reactjs.org/docs/faq-structure.html (Accessed: 28 November 2026).
12. Fowler, M. (n.d.) *Architecture decision record*. Available at: https://www.martinfowler.com/bliki/ArchitectureDecisionRecord.html (Accessed: 28 November 2026).
13. Red Hat (n.d.) *Why you should be using architecture decision records*. Available at: https://www.redhat.com/architect/architecture-decision-records (Accessed: 28 November 2026).
14. International Organization for Standardization (2016) *ISO 15489-1:2016 Information and documentation: records management, part 1: concepts and principles*. Geneva: ISO; read through the summary of the Digital Curation Centre, available at: https://www.dcc.ac.uk/node/982 (Accessed: 28 November 2026).
15. Kappert, L. (n.d.) *Knip: declutter your JavaScript and TypeScript projects*. Available at: https://github.com/webpro/knip (Accessed: 28 November 2026).
