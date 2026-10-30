# 35. Lists and classifications: the countries, the shared lists, the industries and the codes

Status: **proposal**, updated 2026-10-29; parts are built (as document 28, from which this is section 5, split off on 2026-10-29; the sub-section numbers are unchanged, so "5.7" is still 5.7). Where the first published version differs, doc 33 governs: the six countries and Other, with the five generic legal forms for Other; everything for more countries is a future feature (doc 34).

> **Built on 2026-10-29:** the Country question lists the six countries and Other; Other opens a second list of every other country. For Other the legal form is one of the five generic forms and the activity and its code are typed (they are not chosen from the ISIC cascade described below, which stays in the code and the data files as a future feature, doc 34, item 4).

Related: doc 28 (the questions and the cards that use these lists), doc 02 (the sources), `src/data/classifications/` (the official classification files), doc 33 and doc 34.

## 5. The countries and the shared lists

### 5.1 What differs by country

| | UK | Ireland | USA | Canada | Australia | New Zealand |
|---|---|---|---|---|---|---|
| Sales tax name | VAT | VAT | State and local sales tax (no federal VAT) | GST, HST in five provinces, PST, QST | GST | GST |
| Consumer prices normally | include tax [TAX-01, TAX-03] | include tax [TAX-04] | exclude tax (added at checkout) [TAX-10] | exclude tax (added at checkout) [TAX-08] | include tax [TAX-11, excerpt] | include tax, or clearly say they exclude it [TAX-06] |
| Business-only quotes | may exclude | may exclude | exclude | exclude (practice; no official rule found) | may exclude | may exclude |
| Registration threshold | £90,000 [TAX-02] | €42,500 services, €85,000 goods [TAX-05] | per state | C$30,000 [TAX-09] | A$75,000 [TAX-11, excerpt] | NZ$60,000 [TAX-07] |
| Industry scheme | UK SIC 2007, 21 sections [BUS-01] | NACE Rev. 2, moving to Rev. 2.1 from January 2026 [BUS-05] | NAICS 2022, 20 sectors [BUS-03] | NAICS Canada 2022, 20 sectors [BUS-04] | ANZSIC 2006, 19 divisions [BUS-02] | ANZSIC 2006 [BUS-02] |
| "Small business" starts below | 50 employees [BUS-11] | 50 [BUS-11] | 500 employees or a receipts limit, by industry [BUS-07] | 100 [BUS-09] | 20 (the ABS wording was not verified) [BUS-10] | 20 [BUS-12] |

The tax rates were not checked. The **organisation's** country comes from the Legal Entity (Country) and decides the tax name and the currency; the **customers'** country (G3) decides the education, size, industry and area crosswalks and the equality-law notice.

### 5.2 The shared lists

Each list is one definition used wherever its id appears; counts include "Not sure yet" only where written.

| Id | Name | Plain options | Used by |
|---|---|---|---|
| L1 | **What customers care about** (10) | Lower price; Speed; Ease and convenience; Quality and results; Trust and reputation; Expert knowledge; A service made for them; Good support; Safety and low risk; Shared values or identity | I7, P9, K2, K3, O4, the Value Proposition draft |
| L2 | **Worries that stop a purchase** (8) | The price or their budget; Whether they can trust you; How long it takes to start; How hard it is to use; Risk or security; Whether it fits their needs; Support after they buy; The effort of switching from what they use now | P19, O8 |
| L3 | **Frustrations** (10) | It costs too much; It takes too long; It is too complicated; The quality is inconsistent; It is hard to find someone they trust; They lack the know-how; Support is poor; They worry about mistakes or rules; They have no time or capacity; Prices are unclear | P18 |
| L4 | **Goals** (10) | Save time; Save money; Lower their risk; Get better results; Get easier access; Learn something new; Express who they are; Meet a requirement; Win customers or earn more; Stay within the rules | P17 |
| L5 | **Skill areas** (6) | Delivering your product or service; Marketing; Sales and customer care; Running the business (operations, admin, technology); Money and legal (finance, accounting, legal); Leadership and people (management, hiring) | C1, L2, C4 |
| L6 | **Channels** | the 13 channel categories and their subchannels, as in the app | P11, K4, the journey |
| L7 | **Industries, level 1** (18, then Not sure, or more than one; level 2 in 5.4) | Farming, forestry and fishing; Mining, oil, gas and quarrying; Manufacturing; Energy, water and waste; Construction; Wholesale and retail trade; Transport, postal and logistics; Hospitality (accommodation, food, drink); Software, IT, media and telecoms; Finance and insurance; Real estate and property; Professional, scientific and technical services (law, accounting, consulting, engineering, design); Administrative and support services (staffing, cleaning, security, travel); Government and public administration; Education and training; Health and social care; Arts, sport and recreation; Other services (repair, personal, membership, charity) | I1, I2, G15, P24 |
| L8 | **Organisation size** (6) | Just one person (self-employed, no employees); 1 to 9 employees; 10 to 49; 50 to 249; 250 to 499; 500 or more | G14 |
| L9 | **Age bands** (13) | 0 to 2; 3 to 5; 6 to 9; 10 to 12; 13 to 15; 16 to 17; 18 to 24; 25 to 34; 35 to 44; 45 to 54; 55 to 64; 65 to 74; 75 or older (with an "i" under each, doc 28, 6.3) | G6 |
| L10 | **Education** (6 + Not sure yet) | No formal qualifications; School-level qualifications; Vocational or trade qualification, apprenticeship or diploma; Some college or university, no degree yet; Bachelor's degree or equivalent; Postgraduate degree (master's or doctorate) | G7, P2 |
| L11 | **What the customer must provide** (9) | Access to their systems or information; A clear brief; Approval within an agreed time; A place to work; Their own equipment or software; A minimum commitment or term; Payment upfront; To meet certain conditions; Nothing | O10 |
| L12 | **What they spend on** (10) | Housing and home running costs; Food and groceries; Getting around; Phone, internet and communication; Health and wellbeing; Education and learning; Eating out, travel and accommodation; Leisure, hobbies, sport and entertainment; Clothing, home goods and personal care; Insurance, saving and financial services | G18, O11 |
| L13 | **How they pay** (6) | Debit or credit card; Cash; Bank transfer; Mobile wallet or payment app; Invoice; Buy now, pay later | P14 |
| L14 | **Kind of area** (5) | City centre or large city; Large town; Small town; Rural area; Remote area | G4 |
| L15 | **Devices** (5) | Smartphone; Laptop or desktop; Tablet; A shared or public device; None of these | P15 |
| L16 | **What a figure is based on** (9) | Sales or payments I have had; Website or social-media data; Talking to customers; A signed commitment; A pilot test; A benchmark or a comparison with the market; My costs plus a margin (a price only); My own estimate; Nothing yet | R2, D1 |

L12 follows the UN household-consumption divisions [SPN-01] as customer-friendly labels with the division behind each (housing 04, food 01, transport 07, information and communication 08, health 06, education 10, restaurants and accommodation 11, recreation 09, clothing and furnishings and personal care 03, 05 and 13, insurance and financial services 12). Offices label them differently and the new 2018 split is not yet used everywhere, so each option is a customer label with a code behind it, not a survey category.

### 5.3 The crosswalks (national schemes behind the plain lists)

**Industries (L7), level 1.** The plain list is what the user sees; the national code is stored with it so documents can print the country's own section or code. **Two editions are in use.** The table gives the **division numbers**, which are the same in UK SIC 2007 / NACE Rev. 2 and in UK SIC 2026 / NACE Rev. 2.1 (with the exceptions in the notes), and the section letters of the **2007 edition**. The UK's ONS has published **UK SIC 2026**, aligned to NACE Rev. 2.1, and the Irish CSO is moving to Rev. 2.1 (business register recoded in 2025, outputs from January 2026), so the section letters below are the old edition and the **2026 letters shift** (old J splits into new J, publishing, broadcasting and content, 58–60, and new K, telecoms, computer programming, computing infrastructure and information services, 61–63; finance becomes L, real estate M, professional N, administrative O, public administration P, education Q, health R, arts S, other services T; the letters of P and R are inferred) [BUS-01, BUS-18, BUS-19, BUS-05]. The app therefore **keys the industry on divisions** and stores the code of the edition the country uses. The existing hint on the Organization tile cites SIC 2007 and is to be checked **[D]**. NAICS 2022 is current in the USA and Canada (a 2027 revision is proposed, excerpt only); ANZSIC 2006 Rev 2.0 is current in Australia and New Zealand [BUS-02 to BUS-04, BUS-20].

| Plain industry | SIC 2007 / NACE Rev. 2 section (divisions) | USA, Canada NAICS | Australia, NZ ANZSIC |
|---|---|---|---|
| Farming, forestry and fishing | A (01–03) | 11 | A (01–05) |
| Mining, oil, gas and quarrying | B (05–09) | 21 | B (06–10) |
| Manufacturing | C (10–33) | 31–33 | C (11–25) |
| Energy, water and waste | D, E (35–39) | 22 (waste is in 56) | D (26–29) |
| Construction | F (41–43) | 23 | E (30–32) |
| Wholesale and retail trade | G (45–47) | 42 (Canada 41), 44–45 | F (33–38), G (39–43) |
| Transport, postal and logistics | H (49–53) | 48–49 | I (46–53) |
| Hospitality | I (55–56) | 72 | H (44–45) |
| Software, IT, media and telecoms | J (58–63) | 51 (and computer services in 54) | J (54–60) (and computer services in M, 70) |
| Finance and insurance | K (64–66) | 52 | K (62–64) |
| Real estate and property | L (68) | 53 | L (66–67) |
| Professional, scientific and technical services | M (69–75) | 54 (and 55) | M (69–70) |
| Administrative and support services | N (77–82) | 56 | N (72–73) |
| Government and public administration | O (84) | 92 (Canada 91) | O (75–77) |
| Education and training | P (85) | 61 | P (80–82) |
| Health and social care | Q (86–88) | 62 | Q (84–87) |
| Arts, sport and recreation | R (90–93) | 71 | R (89–92) |
| Other services | S (94–96) | 81 | S (94–96) |

**Is every industry in the table?** Every section of the four schemes is covered: the UK SIC 2007 sections A to S, all 20 NAICS sectors (55, management of companies, sits with Professional; waste in 56 sits with Energy, water and waste), and all 19 ANZSIC divisions. The plain list leaves out households (SIC T) and extraterritorial bodies (SIC U); the activity cascade (5.7) uses every official section. **Not industries in any official scheme, so not in the list:** non-profit, charity and social enterprise (a legal-form question beside the industry question: the schemes classify by activity), creative industries and "-tech" labels (cross-sector groupings; a tag at most). The list offers **"Not sure, or more than one"**; there is no "Something else" (every section of the schemes sits under one of the 18, and the odd cases are placed with an "i"). **The list is too coarse for the target audience**: all five Tier 1 business types land in two rows (Software, IT, media and telecoms; Professional, scientific and technical services), so the user could not narrow; hence the second level (5.4).

**Organisation size (L8).** Counts paid employees, the owner not counted; revenue tests are ignored. [BUS-06 to BUS-12]

| Plain option | UK, Ireland (EU) | USA (Census size classes) | Canada (ISED) | Australia (ABS) | New Zealand (MBIE, Stats NZ) |
|---|---|---|---|---|---|
| Just one person | 0 | non-employer | no employees | non-employing | 0 |
| 1 to 9 | micro | within 0–19 | 1–4 micro, within small | 1–4, part of 5–19 | micro 0–5, 6–9 |
| 10 to 49 | small | within 0–19 and 20–99 | small | part of 5–19 and of 20–199 | 10–19, 20–49 |
| 50 to 249 | medium | 20–99, 100–249 | small 50–99, medium 100–249 | medium | 50–99, 100+ |
| 250 to 499 | large | 250–499 | medium | large (200+) | large (100+) |
| 500 or more | large | 500+ (above most SBA limits) | large | large | large |

The bands are exact for the UK, Ireland and the EU and approximate elsewhere. "Small" means under 20 (New Zealand; Australia, not verified), under 50 (UK, Ireland), under 100 (Canada), under 500 (the SBA, varying by industry): the option names therefore state the headcount, not "small". "Self-employed" is defined differently in each country [BUS-13 to BUS-16]; the first option says "no employees", and anyone with staff takes a size band.

**Education (L10).** The crosswalk is the research's inference, not an official concordance; the weakest cells are the Irish and Australian ones, where no office has a "some college or university, no degree" category. The lowest option names what the person has, in the offices' own words: the ONS "No qualifications", Statistics Canada "No certificate, diploma or degree", the Australian Census "Did not go to school" then "Year 8 or below", Stats NZ "No qualification", the CSO "No formal education"; the US ACS starts at "No schooling completed" [DEM-03, DEM-06, DEM-09, QST-11, QST-17, QST-20]. [DEM-03 to DEM-11]

| Plain option | UK | USA | Canada | Australia | Ireland | New Zealand |
|---|---|---|---|---|---|---|
| No formal qualifications | none | no schooling to grade 11; 12th grade, no diploma | no certificate, diploma or degree | did not go to school up to Year 9 | no formal education, primary only | no qualification |
| School-level qualifications | GCSEs, A levels (Levels 1 to 3) | high school diploma or equivalent | high school diploma or equivalency | Year 10 to 12 | secondary (levels 3 to 5) | Level 1 to 3 certificates (NCEA) |
| Vocational or trade qualification, apprenticeship or diploma | apprenticeship, vocational Level 3, HNC, HND (Levels 4 to 5) | associate's degree (trade certificates are not separate in the ACS) | apprenticeship or trades certificate, college diploma | Certificate III or IV, Diploma, Advanced Diploma | advanced and higher certificates (levels 5 to 6) | Level 4 certificate, Level 5 to 6 diploma |
| Some college or university, no degree yet | some higher education | some college, no degree | university certificate below a bachelor's | (no separate category) | (no separate category) | (no separate category) |
| Bachelor's degree or equivalent | Level 6 | bachelor's | bachelor's | Bachelor, Honours | levels 7 to 8 | Level 7 bachelor's, honours (Level 8) |
| Postgraduate degree (master's or doctorate) | Level 7 to 8 | graduate or professional | master's, doctorate, medicine | Master's, Doctoral | levels 9 to 10 | levels 9 to 10 |

**Age (L9).** Thirteen bands, finer below 18 because a toddler, a ten-year-old and a teenager are different customers, and described by age and development, never by work. Below 18 the bands follow the stages of the UK Children's Code (0 to 5, 6 to 9, 10 to 12, 13 to 15, 16 to 17) with the England early-years stage starting at 3; the adult bands are ten-year groups as in the ABS Age Standard; the older-adult line is 65 and the next is 75. All bands below 18 are children in the UN Convention on the Rights of the Child, while the ICO, the Canadian OPC and the Australian OAIC each ask for treatment by age within it. Wording: "children and young people", "older adults", never "the elderly". The US and New Zealand headline groups (25 to 44, 15 to 39) do not align with ten-year bands, so their five-year tables are used. [AGE-01 to AGE-18, DEM-01, DEM-02]

**Kind of area (L14).** The crosswalk is the research's proposal, to be read as "nearest match" because the thresholds differ. The US has no official remote or suburban class (the Census page does not mention suburban), so the list has neither; a founder who wants "suburban" writes it in the note. [GEO-01 to GEO-06]

| Plain option | UK (England, Wales) | USA | Canada | Australia | Ireland | New Zealand |
|---|---|---|---|---|---|---|
| City centre or large city | Urban (large conurbations) | Urban area | Large urban (100,000+) | Major Cities | City (50,000+) | Major or large urban |
| Large town | Urban | Urban area | Medium (30,000–99,999) | Major Cities (smaller), Inner Regional | Satellite or independent urban town | Medium urban |
| Small town | Larger rural settlement | Urban area (small) | Small (1,000–29,999) | Inner or Outer Regional | Independent town (1,500+) | Small urban |
| Rural area | Smaller rural settlement, nearer | Rural | Rural area | Outer Regional | Rural, high or moderate urban influence | Rural settlements, rural other |
| Remote area | Rural, further | Rural (no remote class) | Rural (no remote class) | Remote, Very Remote | Highly rural or remote | Rural other (no remote class) |

**Income.** No two offices share bands and currencies differ (GBP, USD, CAD, AUD, NZD, EUR; the offices measure person or household, gross or after tax, per week or year) [DEM-12]. The app therefore asks for a **number range in the organisation's own currency** (or in the customers' currency when G3 is one other country, **[D]**), with person or household and per year, not bands.

### 5.4 Industries, level 2: the "more exactly?" list

Level 1 narrows to a sector; level 2 narrows to a kind of business, each with a one-line example the user sees under the option. The codes are the **divisions or groups** in each scheme (where the 2026 edition differs, it is shown as "2026:"); they are stored behind the option so a document prints the country's own code and the Organization tile can **suggest the activity code**. Codes come from the official structures [BUS-01, BUS-18 to BUS-20]; the examples are the author's illustrations. The seven sectors the target audience uses are complete; the other eleven have three to six items and grow later.

**Software, IT, media and telecoms**

| Plain sub-industry | Example | SIC / NACE | NAICS | ANZSIC |
|---|---|---|---|---|
| Custom software and app development | An agency building client apps | 62.01 (2026: 62.12, 62.13) | 541511 | 7000 |
| AI and automation services | An agency building workflows or AI tools for clients | 62.01, 62.02 (2026: 62.13 general AI, 62.12 industry software, 62.20 advice) | 541511, 541512 | 7000 |
| Web design and development | A studio that builds websites | 62.01 if it codes; 74.10 if it only designs (2026: 62.1 or 74.12) | 541511; 541430 for visual design | 7000 |
| IT consulting, managed IT, cybersecurity | A managed-service provider | 62.02, 62.03, 62.09 (2026: 62.20, 62.90) | 541512, 541513, 541519 | 7000 |
| Software products and SaaS | An early-stage subscription app | 58.29 (2026: 58.29, "accessed remotely") | 513210 (Canada 513211) | 5420 |
| Games development and publishing | An indie game studio | 62.01 (development), 58.21 (publishing) (2026: 62.11, 58.21) | 541511 and 513210 (Canada 541515, 513212) | 7000, 5420 |
| Cloud, hosting and data processing | A hosting company | 63.11 (2026: 63.10) | 518210 | 5921 |
| Video, film, animation and VFX | A 3D or VFX studio | 59.11, 59.12 | 512110, 512191 | 5511, 5514 |
| Publishing, music, audio and podcasts | A publisher or label | 58.1, 59.20, 60.10 | 513, 5122 | 541, 552, 570 |
| Broadcasting, streaming and web portals | An online media site | 60.1, 60.2, 63.12 | 5161, 5162, 51929 | 56, 57 |
| Telecoms and internet access | An internet provider | 61 | 517 | 58, 591 |

**Professional, scientific and technical services**

| Plain sub-industry | Example | SIC / NACE | NAICS | ANZSIC |
|---|---|---|---|---|
| Management and business consulting | A strategy or operations firm | 70.22 (2026: 70.20) | 541611, 541618 | 6962 |
| Marketing, advertising and PR agencies | A brand or performance agency | 73.11, 73.12; PR 70.21 (2026: 73.30) | 541810, 541820, 541613 | 6940 |
| Market research | A survey firm | 73.20 | 541910 | 6950 |
| Design studios (graphic, brand, UI/UX, product, interior) | A brand or product design studio | 74.10 (2026: 74.11 to 74.14) | 5414 | 6924 |
| Architecture practices | Architects, landscape architects | 71.11 | 541310, 541320 | 6921 |
| Engineering consultancies | Civil, structural or building services | 71.12 | 541330, 541340 | 6923, 6922 |
| Legal | A law firm | 69.10 | 5411 | 693 |
| Accounting, tax and bookkeeping | An accountancy | 69.20 | 5412 | 693 |
| Scientific research and testing | A laboratory or biotech | 72, 71.20 | 5417, 54138 | 691, 6925 |
| Photography, translation and other | A photo studio | 74.20, 74.30, 74.90 | 541921, 541922, 541930 | 6991, 6999 |
| Head offices and holding companies | A group parent | 70.10 (financial holdings are 64.20) | 5511 | 6961 |

**Administrative and support services**

| Plain sub-industry | Example | SIC / NACE | NAICS | ANZSIC |
|---|---|---|---|---|
| Recruitment and staffing | A recruitment agency | 78 | 5613 | 721 |
| Office administration and virtual assistants | A virtual-assistant firm | 82.1, 82.9 | 5611, 5614 | 7291, 7292, 7299 |
| Call centres and customer-support outsourcing | A support desk | 82.20 | 561422 | 7294 |
| Travel and event organisers | A tour operator, a trade-show organiser | 79, 82.30 | 5615, 561920 | 722, 729 |
| Security and investigation | A guarding company | 80 | 5616 | (group not verified) |
| Cleaning, landscaping and pest control | A facilities-services company | 81 | 5617 | 731 |
| Equipment rental and leasing (offered under Real estate) | Tool hire | 77 | 532 | 66 |

**Education and training**

| Plain sub-industry | Example | SIC / NACE | NAICS | ANZSIC |
|---|---|---|---|---|
| Schools | A primary or secondary school | 85.1 to 85.3 | 6111 | 80 |
| Universities and colleges | A higher-education provider | 85.4 | 6112, 6113 | 81 |
| Business and corporate training | A management-development provider | 85.59 | 6114 | 8219 |
| IT and technical training | A coding bootcamp | 85.32, 85.59 | 6115, 611420 | 81, 8219 |
| Arts, language and sports instruction | A music teacher, a coach | 85.51, 85.52, 85.59 | 6116 | 8211, 8212, 8219 |
| Tutoring, exam preparation and driving | A tutor | 85.59, 85.53 | 611691, 611692 | 8219 |
| Educational support and edtech | A course platform | 85.60 (2026: 85.61, 85.69); the software itself is 58.29 | 6117 | 822 |

**Arts, sport and recreation**

| Plain sub-industry | Example | SIC / NACE | NAICS | ANZSIC |
|---|---|---|---|---|
| Artists, writers and performers | A freelance illustrator | 90 (2026: 90.1, 90.2) | 7111, 7115 | 900 |
| Museums, libraries and heritage | A gallery | 91 | 7121 | 89 |
| Sports clubs and fitness | A gym | 93.1 | 7112, 71394 | 911 |
| Amusement and recreation | A theme park | 93.2 | 7131, 7139 | 91 |
| Gambling and betting | A betting operator | 92 | 7132 | 92 |

**Finance and insurance**

| Plain sub-industry | Example | SIC / NACE | NAICS | ANZSIC |
|---|---|---|---|---|
| Banking and lending | A bank, a credit union | 64.19, 64.92 | 5221, 5222 | 62 |
| Payments and fintech services | A payment processor | 66.19, 64.99 | 522320 | 62, 64 |
| Investment, funds and wealth management | An asset manager | 66.30, 64.30 | 523, 525 | 62, 641 |
| Securities brokerage and advice | A broker | 66.12, 66.19 | 5231, 52393 | 641 |
| Insurance carriers and pensions | An insurer | 65.1, 65.2, 65.30 | 5241, 52511 | 63 |
| Insurance and mortgage brokers | A broker | 66.22, 66.19 | 5242, 52231 | 642, 641 |

**Real estate and property**

| Plain sub-industry | Example | SIC / NACE | NAICS | ANZSIC |
|---|---|---|---|---|
| Estate agents and brokers | An agency | 68.31 | 5312 | 672 |
| Property management | A rental manager | 68.32 | 531311, 531312 | 672 |
| Landlords and property investment | A letting company | 68.20 | 5311 | 671 |
| Property development | A developer | 41.10 (2026: 68.12) | 2361, 2362 | 30 |
| Valuation and surveying | A valuer | 68.31, 71.12 | 531320, 541370 | 672, 6922 |
| Serviced offices and co-working | A co-working operator | 68.20 | 531120 | 671 |

**The other eleven sectors** (level 2, to grow later)

| Sector | Sub-industries | SIC 2007 | NAICS | ANZSIC |
|---|---|---|---|---|
| Farming, forestry and fishing | Crops; livestock; forestry; fishing and aquaculture; support services | 01–03 | 11 | 01–05 |
| Mining, oil, gas and quarrying | Oil and gas; metal ores; quarrying; mining support | 05–09 | 21 | 06–10 |
| Manufacturing | Food and drink; textiles and clothing; machinery; electronics; furniture and other | 10–33 | 31–33 | 11–25 |
| Energy, water and waste | Electricity and gas; water; waste collection and recycling | 35–39 | 22, 562 | 26–29 |
| Construction | Building; civil engineering; trades | 41–43 | 23 | 30–32 |
| Wholesale and retail trade | Wholesale; shops; online retail; vehicle trade | 45–47 | 42, 44–45 | 33–43 |
| Transport, postal and logistics | Road; air and sea; courier; warehousing | 49–53 | 48–49 | 46–53 |
| Hospitality | Hotels; restaurants and cafés; bars; catering | 55–56 | 72 | 44–45 |
| Government and public administration | Local and central government; defence; public safety | 84 | 92 | 75–77 |
| Health and social care | Doctors and clinics; dental; care homes; social work | 86–88 | 62 | 84–87 |
| Other services | Repair; personal services; membership and religious organisations | 94–96 | 81 | 94–96 |

**Where the schemes disagree, and where the plain list places it.**

| Activity | What the schemes do | Placed under |
|---|---|---|
| Software publishing and SaaS | 58.29 / 513210 / 5420; SIC 2026 says 58.29 covers software accessed over a network; hosting is separate (63.1x, 518210, 5921) | Software, IT, media and telecoms. If the customer buys access to an application it is SaaS; if infrastructure, hosting |
| Computer services | SIC 62 and ANZSIC 7000 (Professional) are in different sectors from NAICS 51 (Information) | Software, IT, media and telecoms |
| Games | SIC 2007 splits publishing (58.21) from development (62.01); SIC 2026 has 62.11 and 58.21; Canada splits 541515 and 513212; the US has no video-game class | Software, IT, media and telecoms |
| Web design | A studio that codes: 62.01 / 541511 / 7000; visual design only: 74.10 / 541430 / 6924; SIC 2026 separates 74.12 from 62.1 | Software, IT, media and telecoms; offer UI/UX design under Professional |
| Advertising and marketing | Professional in all schemes (73.11, 5418, 6940); digital marketing consulting is 541613 | Professional, scientific and technical |
| Management consulting | 70.22 / 541611 / 6962 in all; head offices 70.10 / 5511 / 6961 | Professional, scientific and technical |
| Architecture and engineering, design, photography | Professional in all schemes | Professional, scientific and technical |
| Film, animation and VFX | 59.11, 59.12 / 51219 / 5514 (explicitly includes computer graphics, animation and special effects) | Software, IT, media and telecoms, not Arts |
| AI services | No scheme has an AI class; only SIC 2026 names AI and large language models (62.13, 62.12, 62.20) | Software, IT, media and telecoms |
| Rental and leasing | SIC N, ANZSIC L, NAICS 53 | Real estate and property |
| Scientific research and biotech | SIC 72, NAICS 5417, ANZSIC 691 | Professional, scientific and technical |

Not verified: the ANZSIC group codes of Division K groups 62 and 63 and Division O group 77; where ANZSIC places custom games development; the Stats NZ ANZSIC page (404). A "Not sure, or more than one" option ends level 1; "Something else" ends both levels.

### 5.5 Examples under the options

Every option has a one-line example shown under it, so the user understands the choice without leaving the card. The examples are the author's and need the owner's approval **[D]**. The first five lists are written here; the others follow the same pattern.

**L1, what customers care about**

| Option | Example |
|---|---|
| Lower price | A cheaper way to get the same result |
| Speed | Ready in days, not weeks |
| Ease and convenience | Simple to order, nothing to set up |
| Quality and results | Fewer errors, a better finish |
| Trust and reputation | A known name, reviews, guarantees |
| Expert knowledge | Specialist skills they do not have |
| A service made for them | Tailored to their situation |
| Good support | Someone answers when they need help |
| Safety and low risk | Secure, compliant, easy to undo |
| Shared values or identity | Ethical, local, sustainable |

**L2, worries that stop a purchase**

| Option | Example |
|---|---|
| The price or their budget | "Can we afford it?" |
| Whether they can trust you | "Have you done this before?" |
| How long it takes to start | "How soon can we begin?" |
| How hard it is to use | "Will our team cope?" |
| Risk or security | "Is our data safe?" |
| Whether it fits their needs | "Will it work for us?" |
| Support after they buy | "Who helps when it breaks?" |
| The effort of switching | "We already use something else" |

**L3, frustrations**

| Option | Example |
|---|---|
| It costs too much | Fees that keep rising |
| It takes too long | Waiting weeks for an answer |
| It is too complicated | Forms, steps and jargon |
| The quality is inconsistent | Good one time, poor the next |
| It is hard to find someone they trust | Many providers, no way to tell |
| They lack the know-how | No one in the team can do it |
| Support is poor | Calls and emails go unanswered |
| They worry about mistakes or rules | Fines, errors, compliance |
| They have no time or capacity | Busy with the core work |
| Prices are unclear | Hidden extras, vague quotes |

**L4, goals**

| Option | Example |
|---|---|
| Save time | Do in an hour what took a day |
| Save money | Lower running costs |
| Lower their risk | Fewer surprises |
| Get better results | Higher sales, better health, better grades |
| Get easier access | Reach a service from home |
| Learn something new | A skill or a qualification |
| Express who they are | Look and feel like themselves |
| Meet a requirement | A rule, a contract, a deadline |
| Win customers or earn more | Grow the business |
| Stay within the rules | Tax, safety, data protection |

**L5, skill areas**

| Option | Example |
|---|---|
| Delivering your product or service | Design, coding, teaching, making, advising |
| Marketing | Content, advertising, brand, events |
| Sales and customer care | Proposals, follow-up, support |
| Running the business | Admin, tools, scheduling, IT |
| Money and legal | Bookkeeping, tax, contracts |
| Leadership and people | Planning, managing, hiring |

### 5.6 The industry pack: what a sub-industry gives the user

When the user picks a level-2 industry, the app has a **pack** of examples for it, shown as suggestions the user can add with one click (the existing add-tile pattern), never applied by itself:

| Part of the pack | Fills | Shown on |
|---|---|---|
| Example customers (kinds of Segment) | the first Segment's name and description | Business 1, Segment tile |
| Example offerings (name, form, how bought) | the first Offering | Business 1, Offerings tile |
| Skill areas usually needed | the Delivery card's skill areas (W2) | Business 3, Delivery |
| Resource groups shown or hidden | the presets (for example a service business hides Materials and Stock) | Business 3, Resources |
| Channel categories to consider at the Discover stage | the stage suggestions (doc 28, 7.4) | Business 2, Discover tile |
| Activity code of the country | the code field | Identity, Organization tile |
| (parked) Typeface fit for the kind of business | one starting point | Brand, Typography tile |

**A sample pack, marketing, advertising and PR agencies (the author's illustration, to be approved):** customers: small local businesses; funded start-ups; the marketing teams of larger companies. Offerings: a brand identity (project, one purchase); a monthly social-media service (retainer); a website and campaign launch (project). Skill areas: Delivering, Marketing, Sales and customer care, Running the business. Resources: workspace, software and web; no stock or vehicles. Discover channels to consider: Website, Social Media, Email, Referral & Affiliates, Community. The packs for the Tier 1 and Tier 2 business types come first (about twelve); the others show the generic examples. Examples are labelled "for example", never "typical", because no source gives typical customers, offerings or channels by industry.

### 5.7 The activity cascade: levels, how many to pick, and what the data shows

The Organization tile (doc 28, 8.5) asks what the business does as a **cascade of dropdowns in the country's own industry scheme**: an answer opens the next level, down to the final code (the owner, 2026-10-23). The order of the answers is the order of importance: the first activity is the primary, the second the secondary, and so on. Statistics offices classify a business by its **principal activity**, the one with the largest value added [FUN-07; the ABS describes principal and secondary activities, excerpt]; the register's first code is its main activity [FUN-01, secondary sources].

**The levels, by country** (the names are the schemes' own):

| Level | UK | Ireland | USA | Canada | Australia, New Zealand |
|---|---|---|---|---|---|
| 1 | Section (21, letters) | Section (21; Rev. 2.1 has 22) | Sector (20) | Sector (20) | Division (19, letters) |
| 2 | Division (88) | Division (88; Rev. 2.1 has 87) | Subsector (96) | Subsector (99) | Subdivision (86) |
| 3 | Group (272; the file has 274: two Companies House entries, 98000 and 99999) | Group (272; Rev. 2.1 has 287) | Industry group (308) | Industry group (323) | Group (214) |
| 4 | Class (615; the file has 616: one Companies House entry, 74990) | Class (615; Rev. 2.1 has 651) | NAICS industry (689) | Industry (694 in the file; Statistics Canada says 695) | Class (506) |
| 5 | Sub-class (191); the final codes are the five-digit codes (731, the 728 of SIC 2007 and the three Companies House entries) | none | National industry (1,012) | Canadian industry (923 in the file; Statistics Canada says 922) | none (New Zealand: the BIC code, 2,772) |

Counts are from the schemes' pages and the downloaded tables [FUN-02 to FUN-08]; the United States file is NAICS 2022 (its counts, and those of the UK, Ireland and Australia, equal the official ones). **Checked 2026-10-30 (structure, codes, titles, level names):** every file's codes are unique, nest by their parent, and keep one shape for each level; the level names are the schemes' own. **One open point:** the Canadian file has one industry fewer and one Canadian industry more than Statistics Canada's published counts (694 and 923 against 695 and 922): one code sits at the wrong level or is missing; it is to be checked against the Statistics Canada structure file before the Canadian list is called complete.

**Up to four activities, each ending in one final code (owner, 2026-10-23).** The user may choose **any combination of up to four final codes**, each with its own complete hierarchy (Industry, then the country's next levels, to the final code); two codes may share a division, a group or a class, or share nothing. One activity is one path; **there is no "+" inside an activity**. "+ Add activity (n of 4)" adds the next path and disappears at four. An activity that has its code **folds**: the head stays (arrow, name, ×) and below it come only its last category and the bold code. The first activity is the main one. Every option is the official one, in official order. Dropdown cells are the existing option picker, drawn as an input, never as a button; Business model and Market are the radio choice.

**Layout of the activities (owner, 2026-10-23).** Like the Performer rows: one label **Activities**, a sub-label per activity (Primary, Secondary, Tertiary, Quaternary), the cell, and the x column, with the "+" in the first row's x column. The full specification is in doc 28, 8.5.

**How many activities.** UK companies (active private limited companies with a real code, 4,652,231) list one code in 77.8%, two in 12.5%, three in 5.3% and four in 4.4% (90.4% have at most two, 95.6% at most three; four is the register's limit, so the last figure is a floor) [FUN-01]. Counting distinct **industries**, 89.2% list one, 97.7% at most two and 99.7% at most three. Companies set up since 2024 list more: 71.6% one code, against 87.0% before 2016.

**Inside one industry** the smallest number of items that covers 95% of the companies there is: divisions 1 to 2; groups 2 (Real estate 3); classes 2 (Wholesale and retail, Information and communication, Real estate 3); codes 2 (Construction, Wholesale and retail, Information and communication, Real estate 3). The average is 1.04, 1.10, 1.13 and 1.14 items per company for divisions, groups, classes and codes.

**How many options to show** (smallest number covering 80% and 90% of businesses; averages weighted by parent size; counts are companies in the UK, firms in the USA, business locations in Canada, enterprises in Ireland):

| Level | UK | USA | Canada | Ireland |
|---|---|---|---|---|
| 1 (of 21, 20, 20, 16) | 9 and 12 | 9 and 12 | 9 and 12 | 9 and 11 |
| 2 | 2.6 and 3.4 (max 12 and 16: Manufacturing) | 2.6 and 3.2 (11 and 13) | 2.4 and 2.7 (11 and 13) | 2.6 and 2.9 (5 and 7) |
| 3 | 2.1 and 2.6 | 2.8 and 3.8 | 2.4 and 3.2 | 2.3 and 2.5 |
| 4 | 1.8 and 2.1 | 1.8 and 2.2 | 1.9 and 2.5 | not in the data |
| 5 | 1.2 and 1.2 | 1.3 and 1.5 | none | none |

So: show **about 12 industries** plus a way to see all; **about four options** at the lower levels plus "Show all"; **Manufacturing** (21 to 24 children) and, in the United States and Canada, retail trade need grouping. Ireland's CSO table has too little detail below divisions (132 categories, mixed levels) [FUN-06].

**What a primary activity tends to pick up** (share of multi-code UK companies with that main activity that also list the second section): Manufacturing with Retail and wholesale 43%; Information and communication with Professional services 35%; Finance with Professional services 31% and Real estate 27%; Transport with Administrative and support 27%; Professional services with Administrative and support 25%; Construction with Real estate 22%. Shown as "tends to" suggestions the user may ignore.

**Not yet known:** Australia and New Zealand class-level counts (the current ABS release has divisions only; the Stats NZ file was seen only through a mirror) (how each country records activities is settled in 5.8). The UK numbers are **provisional** for the other countries.

**The 18 plain industries (L7) are retired** (rule 14 of doc 28, section 3: they are the author's merge, not an official list). The customers' industry (G15, P24) will use the same official cascade in the customers' country; this follows the owner's rule and is settled when Business 1 is reached. **Until then G15 (doc 28, 6.3) and documents 27 and 29 are still written with the 18 plain industries of L7 and the two-level list of 5.4 [D]**; only the seller's activity cascade (this section, built) is already official. The cascade uses all 21 official sections, including section T, where 89,021 UK companies use code 98000, "Residents property management" [FUN-01].

**Industry connections (not used for the funnel).** The author's 1 to 5 scores of which industries combine in one business correlate 0.54 to 0.57 (Spearman) with the UK register's real combinations, and 0.42 with Swedish skill-relatedness matrices [FUN-01, FUN-10]; the six headings I had proposed are the author's grouping and no SIC code supports them, so they are not used.

### 5.8 The code and the words: what the cascade ends on, and how each country names it

Settled with the owner on 2026-10-23: **the codes are generated by the cascade, and the names and labels switch with the country**, so the user recognises the words of their own registry and feels sure of each choice.

**Rule 1: the code is generated, never typed.** Every option carries the official code of its country and edition; the codes nest (in the UK a division is the first two digits of the code, a group the first three, a class the first four). The final choice sets the code, which appears **at the end of that activity**. The user may still edit it. A user who stops before the last level keeps the partial code, marked incomplete.

**What the cascade ends on, by country** (the codes are examples):

| Country | Scheme and edition | Final level and stored code | What the register does |
|---|---|---|---|
| UK | UK SIC 2007 | Five-digit code, for example 62020 | Companies House: "You must provide at least one code, and you can select up to 4"; a SIC code is "a 5-digit code that describes your company's economic activity"; the codes must come from its condensed list on gov.uk (730 are in use); dormant (99999) and non-trading (74990) companies still give a code. The register still holds 2007 codes although UK SIC 2026 is published (Companies House blog and gov.uk page, opened). |
| Ireland | NACE Rev. 2, named in the Act (Rev. 2.1 from 2026) | Four-digit class, for example 6202 | **Companies Act 2014, section 22(7) and (8): the statement gives "the general nature of the activity" and "the division, group and class" in the classification the Act defines in section 15 as "NACE Rev. 2"; "a precise description of the activity" when none fits; with two or more activities, the principal activity: one code** (the statute, opened). |
| USA | NAICS (2022; the downloaded counts are 2017) | Six-digit national industry, for example 541512 | The IRS form SS-4 asks for the principal activity (one box) and a free-text line of business, and takes no code; Schedule C line B takes one six-digit principal business or professional activity code. The Census Bureau assigns the NAICS code to SS-4 applications (Social Security manual, excerpt). |
| Canada | NAICS Canada 2022 | Six-digit Canadian industry, for example 541510 (a trailing zero means no national detail) | The CRA's tax forms ask one six-digit industry code for the main business activity (opened). **Ontario's business registry requires one "NAICS primary activity code", 2 to 6 digits, at incorporation and registration**, offered after the filer types a word for the activity; it is public only where the Business Names Act or the Limited Partnerships Act requires it (ministry notices, excerpts). Federal articles and BC's incorporation application list no activity code (the federal checklist, excerpt; BC's Corporate Online help page, opened). |
| Australia | ANZSIC 2006 | Four-digit class, for example 7000 | The Australian Business Register: sign in, "Update ABN record", "ANZSIC and business details", then "Additional business activity at"; the user types a short description and picks the closest match, the code and description fill in automatically, then "Declaration and Submit"; a main activity plus up to four additional ones since December 2021 (Western Australian government page, opened; ABR page, excerpt). |
| New Zealand | The government's Business Industry Classification (BIC), built on the ANZSIC 2006 class | BIC code, which begins with the ANZSIC 2006 class: five digits in the ACC guide (01110 Nursery production) or a division letter and six digits (C121450 wine manufacturing, on the NZBN page; A013950) | The NZBN "Industry classification" field records the "class(es)" of business activity as BIC codes; the IRD and ACC ask for the BIC code and its "business industry description" ("Choose or update your BIC code with Inland Revenue", ACC guide, opened); the official search tool is businessdescription.co.nz (named by ACC; its page showed no list when fetched); the IRD updates codes (vapes, April 2025). |
| Another country | ISIC Rev. 4, the international standard (default; the country's own scheme may differ). **First published version (doc 33): Other has the activity and its code typed by the user; the ISIC cascade is built and stays in the code (doc 34, item 4)** | Four-digit class, for example 6202 | Not applicable: the app has no national scheme for it; the "i" says to check the country's own code |

**The registries' own words** (found on the official pages; the status is in the last column):

| Country | What the registry calls the activity | The code's name and form | Where it is said |
|---|---|---|---|
| UK | "Nature of business (SIC)" (the company page); gov.uk: "a description of your company's nature of business" | "SIC code", "a 5-digit code that describes your company's economic activity" (Companies House); shown as "62020 - Information technology consultancy activities"; the lookup is "Find your trade description or nature of business"; the list is `SIC07_CH_condensed_list_en.csv` | Companies House company page, blog and gov.uk page, **opened** |
| Ireland | "The general nature of the activity"; "the principal activity" | "The division, group and class" of NACE Rev. 2 (the Act); "NACE code" (CRO and CSO); "a precise description of the activity" when none fits | Companies Act 2014 sections 15 and 22, **opened**; CRO pages, excerpts |
| USA | SS-4: "the principal activity of the applicant's business" (line 16, one box) and a free-text "principal line of business" (line 17); Schedule C line A: the "business or professional activity" | Schedule C line B: one six-digit code from the IRS "Principal Business or Professional Activity Codes" chart; **no code is entered on the SS-4** | IRS instructions, **opened** |
| Canada | "Main business activity" (CRA); "NAICS primary activity code" (Ontario) | "Industry code", six digits (NAICS) on CRA forms; Ontario: 2 to 6 digits, for example "812116 - unisex hair stylist shops" | CRA page **opened**; Ontario ministry notices, excerpts |
| Australia | "Main business activity"; "Additional business activity at" | "ANZSIC code" with its description, filled in automatically from the activity typed; menu "ANZSIC and business details"; "Declaration and Submit"; not shown on the public ABN Lookup | Western Australian government page **opened**; ABR pages, excerpts |
| New Zealand | "Industry classification" (NZBN); "business industry description" (ACC, IRD) | "BIC code" (Business Industry Classification); "class(es) of business activity" | NZBN page and ACC levy guide, **opened** |
| Another country | "Economic activity" (the UN's term) | "ISIC code" | UNSD, excerpts |

The two words are **activity** (UK, Ireland, Australia, Canada, and the statistics offices' "principal activity") and **industry** (the USA's chart, Canada's "industry code", New Zealand).

**Can one organisation carry more than one code?**

| Country | More than one? | What the sources say |
|---|---|---|
| UK | **Yes, up to four** | Companies House: "at least one code ... up to 4" (its blog, opened); the register has four code fields, the first being the main one [FUN-01] |
| Australia | **Yes, a main one and up to four additional** (since December 2021) | Western Australian government page, opened [FUN-12, FUN-16] |
| New Zealand | **Yes, "class(es)"**; the number is not stated | NZBN page, opened; the ACC guide has rules for the case where more than one classification unit applies [FUN-13, FUN-16] |
| Ireland | **One: the principal activity** | Companies Act 2014 section 22(8): with two or more activities the particulars are those of the principal activity (the statute, opened) [FUN-16] |
| USA | **One** | The IRS form SS-4 asks for the principal business activity; Schedule C takes one code, for the activity with the most revenue (secondary guides) [FUN-12, FUN-14] |
| Canada | **One** | CRA: "use the code that most closely describes your main business activity" (opened); Ontario: one primary code (notices, excerpts); no activity code found for federal or BC incorporation [FUN-12, FUN-16] |
| Another country | **Default: up to four** | Like the UK, the most flexible of the common cases |

The statistical rule behind all of them is one **principal** activity per entity (ANZSIC: the predominant activity; Statistics Canada: the largest value added). **The app keeps four activities in every country**, because a fifth of UK companies list more than one code and the extra activities help the industry pack, and its "i" says which activities the register uses: all four in the UK, five in Australia, only the first in Ireland, the United States and Canada (the others describe the business).

**Default for another country** (the user names the country; the app has no national scheme for it): the international ISIC (Rev. 4, which most national schemes follow; Rev. 5 was endorsed by the UN in 2023 and 2024 [FUN-14]). The levels carry ISIC's own names (Section, Division, Group, Class), the slot label is "Primary activity", the code label "Industry code (ISIC)", and the "i" says that the country's own scheme may differ slightly. That ISIC is the most common is the author's judgement; no ranking source was found.

**Rule 2: the labels switch with the country.** The country is the organisation's (Legal Entity). The wording follows the table above:

| Country | Heading and slot labels | Level names | Code label | The "i" says |
|---|---|---|---|---|
| UK | Nature of business (SIC): Main activity, Additional activity | Industry; Division, Group, Class, Sub-class | SIC code | "Companies House holds up to four codes; the first is the main one." |
| Ireland | Principal activity: Principal activity, Other activity | Industry; Division, Group, Class (the Act's words) | NACE code | "The Companies Act asks for the general nature of the activity and its division, group and class in NACE Rev. 2; with several activities, the principal one; if none fits, a precise description. Only the first is used." |
| USA | Principal business activity: Principal business activity, Other activity | Industry; Subsector, Industry group, Industry, National industry | Principal business activity code | "Tax forms ask for one six-digit code, for your principal business activity. The others describe the business." |
| Canada | Main business activity: Main business activity, Other activity (in Ontario: NAICS primary activity code) | Industry; Subsector, Industry group, Industry, Canadian industry | Industry code (in Ontario: NAICS primary activity code) | "The CRA asks for one six-digit industry code for your main business activity. Ontario's registry asks for one NAICS primary activity code." |
| Australia | Main business activity: Main business activity, Additional business activity | Industry; Subdivision, Group, Class | ANZSIC code | "The Australian Business Register asks for a main activity and allows four additional ones. Your classification is not shown on the public ABN Lookup." |
| New Zealand | Industry classification: Industry classification, Additional classification | Industry; Subdivision, Group, Class, Business industry description | BIC code | "The NZBN register records the class(es) of business activity as BIC codes; the IRD and ACC ask for the BIC code and its business industry description." |
| Another country | Primary activity: Primary activity, Additional activity | Industry; Division, Group, Class | Industry code (ISIC) | "This is the international classification (ISIC); your country's own scheme may differ slightly." |

Every level, the first too, carries the scheme's own official name, **and every entry is printed as the official document prints it, the code first** ("54 Professional, Scientific, and Technical Services", "541 ...", "5415 ..."; owner, 2026-10-24; 5.7): Section (UK, Ireland, ISIC), Sector (United States, Canada), Division (Australia, New Zealand), then Division, Group, Class and Sub-class (UK), Division, Group, Class (Ireland, ISIC), Subsector, Industry group, NAICS industry, National industry (United States), Subsector, Industry group, Industry, Canadian industry (Canada), Subdivision, Group, Class (Australia), Subdivision, Group, Class, BIC code (New Zealand). Titles that repeat on neighbouring levels (NAICS 54 and 541 are both "Professional, Scientific, and Technical Services") are the official ones and stay. In the United States, Canada and Ireland the register holds one code, so the "i" says that only the first activity is used and the others describe the business. **The code is shown at the end of each activity**, with the country's code label and the description (for example "62020 - Information technology consultancy activities", the form Companies House uses).

**Rule 3: a change at a higher level resets the levels below it** (the owner, 2026-10-23). Inside one activity, choosing a different option at any level clears every level under it, empties the generated code at the end of the activity, and reloads the lower dropdowns with the children of the new choice. Choosing the same option again changes nothing. Other activities are untouched. A code the user typed by hand is also cleared by a change above it, and the app's undo restores it.

**Rule 4: a change of country resets every activity** (the owner, 2026-10-23). Whatever the new country's scheme shares with the old one (UK SIC 2007 and Irish NACE Rev. 2 share their codes to four digits, the United States and Canada to five, Australia and New Zealand the ANZSIC class), **nothing is carried over**: all levels of all activities and their codes are cleared, the labels switch to the new country's wording (rule 2), and the user chooses again. The app's undo restores the old choice if the country is changed back at once. The crosswalk of 5.3 is not used to fill anything.

**What was not opened, and where the wording stands.** The research of 2026-10-23 settled the registry terms and the number of codes in all six countries (5.8, FUN-16). Not opened: the CRO's own pages (they returned an error; the Companies Act, which they restate, was opened), the ABR's own page (its steps were read on a state-government page), the Ontario notices (read as search excerpts), the 2022 BIC list (its search site showed no list) and Corporations Canada's own form (the federal checklist was read). The wording carries those limits in the "Where it is said" column.

### 5.9 How many choices at each level (the sufficient numbers)

Each dropdown has two numbers: **how many options it shows** and, as evidence only, **how many items a company usually lists** at that level. They come from the UK register (Companies House, 4,652,231 companies) and, for the options shown, the US, Canadian and Irish tables [FUN-01 to FUN-06]. The activities themselves are the four of 5.7; the only limit is four codes, the rest is guidance in the "i".

| Level | Options shown | Activities under one parent (enough for 95% of companies) | What the data says |
|---|---|---|---|
| 1 Industry | About **12** (they cover 90% of businesses; 9 cover 80%), then "See all" | One industry per activity; two distinct industries cover 97.7% of companies, three 99.7%; four activities in all | UK 9, 12 and 14 of 21 sections cover 80, 90 and 95%; the US, Canada and Ireland the same shape |
| 2 Division | The shortlist that covers 90% of the parent, at most ten, grouped when more (Manufacturing: 16 of 24) | **1 to 2**: divisions of one industry | 3.4 on average (UK), maximum 16 |
| 3 Group | All, when there are six or fewer; else the 90% shortlist | **2** (Real estate **3**) | 2.6 on average, maximum 6 |
| 4 Class | All, when six or fewer | **2** (Wholesale and retail, Information and communication, Real estate **3**) | 2.1 on average, maximum 7 |
| 5 Code | All, when six or fewer | **2** (Construction, Wholesale and retail, Information and communication, Real estate **3**) | 1.2 on average, maximum 4 |

**What a dropdown shows.** All its children when there are six or fewer. Otherwise the shortlist that covers 90% of the businesses under that parent (never more than ten), **in the official order of the classification** (never by popularity), then "Show all", which opens the full list in the same order. This keeps every list within the ABS rule of about ten short items [FUN-11].

**Choices per level, from the classification files (src/data/classifications), counted 2026-10-23.** "Total" = every entry of the level; "per dropdown" = how many options one dropdown holds (the children of its parent): average, 90th percentile (p90), largest.

| Country (scheme) | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 | Total entries |
|---|---|---|---|---|---|---|
| UK (SIC 2007) | Section 21 | Division 88 | Group 274 | Class 616 | Sub-class 191 | 1,190 |
| Ireland (NACE Rev. 2) | Section 21 | Division 88 | Group 272 | Class 615 | none | 996 |
| USA (NAICS 2022) | Sector 20 | Subsector 96 | Industry group 308 | NAICS industry 689 | National industry 1,012 | 2,125 |
| Canada (NAICS Canada 2022) | Sector 20 | Subsector 99 | Industry group 323 | Industry 694 | Canadian industry 923 | 2,059 |
| Australia (ANZSIC 2006) | Division 19 | Subdivision 86 | Group 214 | Class 506 | none | 825 |
| New Zealand (BIC 2022) | Division 19 | Subdivision 86 | Group 214 | Class 506 | BIC code 2,772 | 3,597 |
| Other (ISIC Rev. 4) | Section 21 | Division 88 | Group 238 | Class 419 | none | 766 |

| Country | Dropdown | Average | p90 | Largest |
|---|---|---|---|---|
| UK | Industry (section) | 21 (one list) | 21 | 21 |
| UK | Division | 4.2 | 6 | 24 |
| UK | Group | 3.1 | 6 | 9 |
| UK | Class | 2.3 | 5 | 9 |
| UK | Sub-class | 2.4 | 3 | 6 |
| Ireland | Division / Group / Class | 4.2 / 3.1 / 2.3 | 6 / 6 / 5 | 24 / 9 / 9 |
| USA | Subsector / Group / Industry / National | 4.8 / 3.2 / 2.2 / 1.5 | 11 / 7 / 4 / 3 | 21 / 9 / 9 / 9 |
| Canada | Subsector / Group / Industry / Canadian | 5.0 / 3.3 / 2.1 / 1.3 | 11 / 7 / 4 / 2 | 21 / 9 / 8 / 8 |
| Australia | Subdivision / Group / Class | 4.5 / 2.5 / 2.4 | 8 / 5 / 5 | 15 / 9 / 8 |
| New Zealand | Subdivision / Group / Class / BIC code | 4.5 / 2.5 / 2.4 / 5.6 | 8 / 5 / 5 / 11 | 15 / 9 / 8 / 36 |
| ISIC | Division / Group / Class | 4.2 / 2.7 / 1.8 | 6 / 5 / 4 | 24 / 9 / 9 |

The UK sub-class count is the 191 sub-classes in the file, held under 78 classes; the Companies House list accepts 731 codes in all.

**Why four, and what the numbers mean (re-counted 2026-10-23).** Four is the register's limit of codes, not a figure from the data. Companies House, 4,652,231 active private limited companies, distinct items listed per company at each level: industries 89.2% one, 97.7% up to two, 99.7% up to three; divisions 86.1%, 96.0%, 99.0%; groups 80.4%, 92.7%, 97.9%; classes 78.8%, 91.1%, 96.5%; codes 77.8%, 90.4%, 95.6%, and 100% at four. So most businesses need one or two paths (90.4% of companies list two codes or fewer), and four covers everyone the register allows. The numbers are evidence for the "i" and for the shortlist, **never limits** other than the four codes.

**What the per-level numbers do.** The per-industry table below says how many divisions, groups, classes and codes the businesses of an industry usually list; it feeds the "i" text ("Most businesses in this industry list one or two") and the shortlists. It stops nothing: the only limit is four codes.

**Per industry (UK).** Each industry has its own numbers. Options are the children of each parent that cover 90% of its businesses (the average over the industry's parents, weighted by size, with the largest in brackets); picks are the smallest number covering 95% of the industry's companies, for division, group, class and code.

| Industry | Divisions in use | Divisions to show for 80% / 90% | Groups per division: all / for 90% | Classes per group: all / for 90% | Codes per class: all / for 90% | Picks: division / group / class / code |
|---|---|---|---|---|---|---|
| A Agriculture, forestry, fishing | 3 | 2 / 2 | 6.1 / 3.7 (max 4) | 4.1 / 2.6 (max 6) | 1.1 / 1.1 (max 2) | 1 / 2 / 2 / 2 |
| B Mining and quarrying | 5 | 3 / 3 | 2.0 / 2.0 (max 2) | 1.6 / 1.2 (max 2) | 1.0 / 1.0 (max 2) | 1 / 2 / 2 / 2 |
| C Manufacturing | 24 | 12 / 16 | 4.7 / 3.1 (max 5) | 4.0 / 2.8 (max 6) | 1.2 / 1.1 (max 3) | 2 / 2 / 2 / 2 |
| D Electricity, gas | 1 | 1 / 1 | 3.0 / 2.0 (max 2) | 3.6 / 2.8 (max 3) | 1.0 / 1.0 (max 1) | 1 / 1 / 2 / 2 |
| E Water, sewerage, waste | 4 | 2 / 3 | 2.3 / 2.3 (max 3) | 1.7 / 1.5 (max 2) | 1.0 / 1.0 (max 1) | 2 / 2 / 2 / 2 |
| F Construction | 3 | 2 / 2 | 3.2 / 2.6 (max 3) | 2.4 / 2.2 (max 4) | 1.3 / 1.2 (max 2) | 2 / 2 / 2 / 3 |
| G Wholesale and retail | 3 | 2 / 3 | 8.0 / 5.0 (max 6) | 4.3 / 3.6 (max 7) | 1.1 / 1.1 (max 3) | 2 / 2 / 3 / 3 |
| H Transport and storage | 5 | 2 / 3 | 3.9 / 2.0 (max 3) | 2.5 / 2.0 (max 3) | 1.3 / 1.2 (max 3) | 2 / 2 / 2 / 2 |
| I Accommodation and food | 2 | 1 / 2 | 3.2 / 3.0 (max 3) | 1.2 / 1.2 (max 2) | 2.3 / 2.0 (max 3) | 1 / 2 / 2 / 2 |
| J Information and communication | 6 | 3 / 4 | 1.5 / 1.4 (max 3) | 3.5 / 2.5 (max 3) | 1.4 / 1.2 (max 3) | 2 / 2 / 3 / 3 |
| K Finance and insurance | 3 | 1 / 2 | 3.8 / 2.2 (max 3) | 1.6 / 1.4 (max 3) | 4.6 / 2.0 (max 4) | 1 / 1 / 1 / 2 |
| L Real estate | 1 | 1 / 1 | 3.0 / 3.0 (max 3) | 1.2 / 1.2 (max 2) | 2.0 / 1.0 (max 1) | 1 / 3 / 3 / 3 |
| M Professional, scientific, technical | 7 | 4 / 5 | 2.5 / 1.6 (max 3) | 1.7 / 1.4 (max 2) | 2.1 / 1.6 (max 3) | 2 / 2 / 2 / 2 |
| N Administrative and support | 6 | 3 / 5 | 3.5 / 2.4 (max 3) | 2.4 / 1.4 (max 4) | 1.3 / 1.1 (max 3) | 1 / 2 / 2 / 2 |
| O Public administration | 1 | 1 / 1 | 3.0 / 2.0 (max 2) | 3.8 / 3.0 (max 3) | 1.0 / 1.0 (max 1) | 1 / 1 / 1 / 1 |
| P Education | 1 | 1 / 1 | 6.0 / 4.0 (max 4) | 2.8 / 2.2 (max 3) | 1.0 / 1.0 (max 2) | 1 / 2 / 2 / 2 |
| Q Health and social work | 3 | 2 / 3 | 3.0 / 2.3 (max 4) | 1.7 / 1.7 (max 3) | 1.1 / 1.1 (max 2) | 1 / 2 / 2 / 2 |
| R Arts, entertainment, recreation | 4 | 2 / 2 | 1.5 / 1.5 (max 2) | 3.7 / 3.1 (max 4) | 1.2 / 1.0 (max 2) | 1 / 1 / 2 / 2 |
| S Other services | 3 | 1 / 1 | 1.1 / 1.1 (max 2) | 4.9 / 3.0 (max 5) | 1.0 / 1.0 (max 1) | 1 / 1 / 1 / 1 |
| T Households | 2 | 1 / 1 | 3.0 / 1.0 (max 1) | 1.0 / 1.0 (max 1) | 1.0 / 1.0 (max 1) | 1 / 1 / 1 / 1 |
| U Extraterritorial | 1 | 1 / 1 | 1.0 / 1.0 (max 1) | 1.0 / 1.0 (max 1) | 1.0 / 1.0 (max 1) | 1 / 1 / 1 / 1 |

**The other countries.** The United States, Canada and Ireland show the same pattern (5.7): about nine top industries cover 80%, 2 to 4 options cover most of each lower level, and only Manufacturing (and retail trade in the United States and Canada) runs long. Each country's own counts decide its shortlists. The UK per-level picks are used for all countries until their own data exists (no multi-activity file was found outside the UK, 5.8).

### 5.10 The classification data

The official classifications are extracted into `src/data/classifications/` (one JSON file per scheme and a README), in the **order of the official document**, with the code, level, title and parent of every entry. Only the key information is kept. The counts match the official ones.

| File | Scheme and edition | Levels | Entries | Source |
|---|---|---|---|---|
| `uk-sic-2007.json` | UK SIC 2007 | 21 sections, 88 divisions, 272 groups, 615 classes, 191 sub-classes (+3 Companies House codes) | 1,190 | ONS summary of structure; Companies House condensed list (731 final codes, all flagged) |
| `ie-nace-rev2.json` | NACE Rev. 2 (the Irish Act) | 21, 88, 272, 615 | 996 | CSO correspondence table NACE 2.1 to NACE 2 |
| `us-naics-2022.json` | NAICS 2022 | 20 sectors, 96, 308, 689, 1,012 | 2,125 | Census Bureau structure file |
| `ca-naics-2022.json` | NAICS Canada 2022 v1.0 | 20, 99, 323, 694, 923 | 2,059 | Statistics Canada structure file |
| `au-anzsic-2006.json` | ANZSIC 2006 Rev. 2.0 | 19 divisions, 86, 214, 506 | 825 | ABS codes and titles page |
| `nz-bic-2022.json` | NZ BIC (BIC Code List 2022) on the ANZSIC levels | 19, 86, 214, 506, 2,772 BIC codes | 3,597 | NZBN API portal; ABS for the upper levels |
| `isic-rev4.json` | ISIC Rev. 4 (the default for another country) | 21, 88, 238, 419 | 766 | UN Statistics Division |

Notes. The BIC list is valid from 1 April 2022 to 1 April 2023 (status Released); the IRD has changed codes since (for example vapes in April 2025) and a later list was not obtained. In the BIC list 14 ANZSIC classes carry no BIC code and are themselves final. UK SIC 2007: a class always has a five-digit code; the class codes without sub-classes are final; Companies House's list is the set of final codes it accepts; three of its codes (74990, 98000, 99999) are not in the ONS structure and are placed under the nearest existing parent by code. Options are always shown **in this file order, never by popularity**; the popularity counts of 5.9 only decide which entries a shortlist keeps.
