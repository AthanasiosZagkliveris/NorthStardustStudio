# The Workbook — References and Glossary

Status: **current design**, written 2026-11-20. Two sections of the Workbook that explain the app's words and its sources.

> **Keep this document true:** whoever changes a term, a place, a source or a funnel changes this file in the same commit, with a row in the log.

## References

Every source the app cites, as a Harvard reference list, from A to Z, filed by the first letter of its first author (`letterOf`). The funnel chooses the letter ranges. Its "i": "Every source the app cites, from A to Z. The funnel shows the letter ranges you choose." (`GLOSSARY_INFO`). The sources are the one list of `src/framework/engine/Sources.ts`; the rule for which sources an option may cite is the collaboration rules' rule 14 (official government documents for classification inputs; business-school or university documents for plain options). A citation in the Glossary opens its reference here.

## Glossary

Every term from A to Z, in two kinds (`GlossaryList.tsx`):

- **The app's words**, in blue, each with its meaning and its sources (`src/data/glossary.ts`) and, where a page or a document says it, its **places**: a place on a page opens that page at its tile; a place in a Financial Document (the break even, the contribution margin, the cash runway, the funding gap) opens the Workbook's Financial Documents at its tab (`document`; "Workbook, Financial Documents").
- **The names the founder gave**, in terracotta (an Organisation, a Segment, an Offering, a card), each with "Open the …"; from the Landing page, every Organisation's names, each named with its Organisation ("Offering of Quillfield Automation").

The funnel chooses the kinds and the letter ranges. Its "i": "Every word the app uses and every name you gave, from A to Z. The funnel shows either kind, or both, and the letter ranges." Wording: UK English, affirmative (the help texts' rules, doc 39).

## Where it is in the code

`src/components/GlossaryList.tsx`, `src/data/glossary.ts`, `src/framework/engine/Sources.ts`, `src/pages/Workbook.tsx`; the test `src/pages/Workbook.test.tsx`.
