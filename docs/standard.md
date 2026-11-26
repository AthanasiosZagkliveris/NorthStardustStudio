# The standard of the documents

Status: **rules**, written 2026-10-29, updated 2026-11-21. How a document in `docs/` is named, numbered, headed, written and kept. The check `npm run docs:standard` enforces the parts that can be checked (marked **checked**). The contents of the documents are in `README.md`; the alphabetical index is `index.md`.

## 1. Where a document goes

| Folder | Holds | Naming |
|---|---|---|
| `docs/app/` | The app: contents, index of its places, glossary | plain names |
| `docs/guide/` | The user guide: how a founder uses the app, step by step, and the overview of the app, its specifications and its future features | plain names |
| `docs/design/foundation/` | The single description of the Foundation and its card structure (Foundation 1 and 2) | `NN-name.md` |
| `docs/design/interface/` | What every screen shares: texts, reactions, links, components, help texts and what an "i" says, pop-ups, tooltips, the symbols (16 to 24, 39) | `NN-name.md` |
| `docs/design/questions/` | The first version and what it leaves for later, the plan, the specification and the guide of the questions, the questions of each tile, the register, the legal starts and the answers worked out from earlier ones (27 to 29, 33, 35 to 38, 41 to 50, 52 to 54) | `NN-name.md` |
| `docs/design/research/` | The sources, the research, the owner's data as given, the lists and classifications, and the survey of the Beta founders (2, 3, 30 to 32, 34, 51, 55) | `NN-name.md` |
| `docs/design/records/` | The log, what has not been done, and the generated catalogue record and structure tables (4 to 7) | `NN-name.md` |
| `docs/design/library/` | The assets library with the components' defaults, its generated lists and logs (8 to 11, 13 to 15) | `NN-name.md` |
| `docs/testing/` | What the app's tests check, file by file, and how they run | `NN-name.md` |
| `docs/ai/` | Rules, references and playbooks for an AI assistant, the code map and the folder plan | plain names |
| `docs/specifications/<system>/` | The pages of each System (`identity-system/`, `brand-system/`, `business-system/`, `strategy-system/`). A System of several pages has a README (the Business System); a System of one page opens its page file with what the System holds and what crosses it | `page-N-name.md` (N is the page in the pages rail) |
| `docs/specifications/06-workbook/`, `inventory/`, `settings/` | The Workbook (one section of the file for each of its sections), the Inventory and the Settings (with the Global Settings screen), one README each | `README.md` |
| `docs/proposals/` | Plans still open and not started; one leaves for the archive when it is built or replaced | plain names |
| `docs/archive/` | Finished or replaced documents, kept for their information; the older rows of every log are in `archive/log/` | plain names |

**Numbering** (checked): each design folder has its own sequence, 1 to N with no gap or repeat, in the order the app shows things (the questions run Identity, Brand, Business, Strategy, each in the order of its pages and tiles). The number is in the file name (two digits) and in the title, and a document is cited by its folder and number ("Questions 2", "Interface 1"). A new document goes where it belongs in its folder's order, and the documents after it move up one, with every citation updated in the same change (`docs:check` finds a citation left behind by its broken link or anchor). A document that leaves the numbered set (to `ai/`, `proposals/` or the archive) takes a plain name and the folder closes the gap. Until 2026-11-21 the documents had one sequence for all the folders; the index lists the old numbers. The other folders number their files the same way, by the app's order or a logical one, without the number in the title: `specifications/` (the Systems in the app's order, then the Inventory, the Workbook and the Settings, and each System's pages in the app's order), `ai/` (the rules, then how to work, then the references), `app/`, `guide/` and `testing/` (checked; owner, 2026-11-21: "Number all of them"). A README keeps its name; `proposals/` go by their letter and `archive/` by date. (Owner, 2026-11-21: "Could the files be numbered and named according to the app sequence or a logical order?" and "Every folder should have its own sequences"; this replaces "Keep the numbers" of the same day.)

**Question codes** (checked): codes are permanent ids, not positions. Never renumber; reorder freely; the register (Questions 6) shows the order. A new question takes the next free code; a retired code stays listed as retired with what replaced it. The codes are kept in `tools/scripts/docs/questions-register.mjs`, which writes Questions 6; `npm run docs:check` fails when Questions 6 is stale or when a questionnaire document (27 to 55, without Questions 6) cites an Offering, Competitor, Purpose & Beliefs, Ambassador or Strategy code (O1, K1, PB1, BA1, SW1, SC1), or, in 27 to 43, a Profile code (A1 to E3), that the register does not know; a proposed code waiting to be built is listed in the script's `CITATION_ALLOW`.

## 2. The head of a document

Every document opens with these lines, in this order (checked):

1. **Title**: `# N. Title` for a design document (N is the number of the file; **checked**), `# Title` elsewhere. Sentence case.
2. **Status line**: `Status: **kind**, written YYYY-MM-DD, updated YYYY-MM-DD.` and, after it, one sentence saying what the document holds. The kind is one of the list below; both dates are ISO (checked: the kind and a date).
3. **Generated documents** carry instead (or beside the status) a line that begins "Generated by", names the command and the source, and ends "Do not edit by hand." (checked).
4. **Related line** (optional): `Related: doc N (what), doc M (what).`
5. **Banners** (optional): a block quote `> **Title (owner, date):** text` for a rule that governs the whole document (for example the first-version banner in Questions 1 to 3 and Research 4 to 6).
6. **Contents block**: a list of the sections with links, when the document is longer than 60 KB or has more than 12 sections.

### The kinds

| Kind | Meaning |
|---|---|
| rules | What must hold; a check enforces most of it |
| reference | How things are, to look up (including source registers) |
| research | What was found, with its sources and how they were weighed |
| collection | The owner's data written down as given, before design |
| current design | What the app is today |
| specification | What a page or the first version asks, shows and contains |
| proposal | A plan or design not (or only partly) built; the status line says what is built |
| living list | An open list: an item leaves it when done and the log records it |
| log | A record of changes, newest on top |
| playbook | A procedure |
| index | A list of documents, places or subjects |
| contents | The contents of a part of the app |
| archive | Finished or replaced; the status line says where its information now lives |
| generated | Written by a script (the kind of a document that has a "Generated by" line) |

## 3. How a document is written

- **Present tense.** A document says what is true now. **A change is written in the log** (`design/records/01-log.md`) and nowhere else: no "since", "was changed on" or round-by-round history in a describing document.
- **One owner for each fact.** A fact is written once, in the document that owns it, and the others point to it ("see Interface 1, section 3"). The owner of a topic is named in `index.md`.
- **Sections** of a long document are numbered `## 1.`, `### 1.1`; the numbers do not change once other documents cite them (a section that moves to a new document keeps its numbers, as 5.x did in Research 3).
- **Where the code and a document disagree, the latest dated decision wins** (owner, 2026-11-19: "the doc is the rule"; 2026-11-21: "Check how the app works at the moment and which update was the last one"). A written rule newer than the code's last change to that part makes the app the one to fix; a code change made on a later owner decision makes the document the one to fix, in the same commit, with a row in the log. Names of files, classes, properties and functions in backticks always follow the code and must exist (the document-reference test checks the documents it lists).
- **Affirmative, natural voice** (Thanos, 2026-11-09). Every text, in a document and in everything the app shows or writes (questions, options, "i" texts, notes, empty states, tooltips, generated drafts and exports), uses a natural, flowing human voice and affirmative sentences: it says what something is and does. Contrast and negative framing are avoided: "unlike", "instead of", "rather than", "not X but Y", "unlikely", "as opposed to" and "no longer", where a plain affirmative sentence says the same. Option labels that really are choices ("Do it themselves", "None") stay; code comments are outside this rule.
- **Plain English**, sentence case headings, ISO dates, "doc N" for a design document and "document N" in running prose; a file is named in backticks with its path from `docs/`.
- **Relative links** between documents are written as Markdown links and must resolve, and a link to a heading must find it (both checked).
- **Decisions** the owner has not made are marked **[D]**; a rule of the first version is marked in place and the rest is a future feature (Questions 4).
- **Generated documents** are never edited by hand; the generator and its source are named in the document.

## 4. Each chapter has a README

`docs/design/<chapter>/README.md` is written by `npm run docs:index`: the scope of the chapter, and one row for each document (kind, what it holds, last change). The descriptions are in `tools/scripts/docs/write-index.mjs`, the one place where they are kept; `docs/README.md` and `docs/index.md` are written from the same data.

## 5. Adding a document

1. Pick the folder by what the document holds and its place in that folder's order (section 1); renumber the documents after it and update their citations in the same change.
2. Write the head (section 2).
3. Add the document to the list in `tools/scripts/docs/write-index.mjs` with its kind and a one-sentence description; add subjects to `TOPICS` if people will look it up.
4. Run `npm run docs:index` and `npm run docs:check` (it includes `docs:standard`).
5. Write the change in the log.
