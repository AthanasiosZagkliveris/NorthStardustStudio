# Classifications

The official industry classifications behind the Organization tile's activity cascade (design document 38, sections 5.7 to 5.10). Extracted on 2026-10-23 from the files named in each JSON file's `sources`. Only the key information is kept: code, level, title, parent, in the **order of the official document**.

| File | Scheme | Edition |
|---|---|---|
| `uk-sic-2007.json` | UK SIC 2007 | 2007, with Companies House's condensed list (`ch`) |
| `ie-nace-rev2.json` | NACE Rev. 2 | the classification named in the Irish Companies Act 2014 |
| `us-naics-2022.json` | NAICS | 2022 |
| `ca-naics-2022.json` | NAICS Canada | 2022 v1.0 |
| `au-anzsic-2006.json` | ANZSIC | 2006 Revision 2.0 |
| `nz-bic-2022.json` | NZ Business Industry Classification | BIC Code List 2022, on the ANZSIC levels |
| `isic-rev4.json` | ISIC | Rev. 4, the default for another country |

Each file: `scheme`, `country`, `edition`, `levels` (the scheme's own level names), `digits`, `counts` (entries per level, equal to the official counts), `sources`, `items`. Each item: `code`, `level` (1 is the top), `title`, `parent` (a code, or null), and `final: true` when it has no children (a code a business may state). UK items carry `classCode` (the four-digit class) from level 4, `ch` (on Companies House's list) for five-digit codes and `chOnly` for the three codes that list adds to the ONS structure.

Nothing here is invented: titles and codes are as published. A trailing T on US titles (the trilateral marker) is removed. The BIC list is valid from 1 April 2022 to 1 April 2023; later changes were not obtained.
