# The Segment card's earlier design: the G-list of 2026-10-23

Status: **archive**, written 2026-10-23, updated 2026-11-02. The Segment card's questions as first designed (the ids G1 to G25, the worked cases, the reads), kept for what it records. Where its information now lives: the questions as built are doc 36 (`design/questionnaire/36-segment-questions.md`), the design and the map from each old id to the question that replaced it are doc 28, 6.3 and 6.3a (`design/questionnaire/28-questionnaire-specification.md`).

Moved here from document 28, section 6.3, on 2026-11-01. Document 28, 6.3, now holds only the map from each old id to the question that replaced it.

### 6.3 Segment card (tile "Segment Description"): step 1, revised after the owner's review of 2026-10-23


**Where it is.** Business 1 › the frame of a Customer Segment › the tile "Segment Description". The tile opens the **Segment card** and, nested in it, the **Profile cards** (up to three). This step is the Segment card; the Profile cards are step 2.

**Today.** A **Name** and a **Description** of five boxes: *Demographics*, *Geographics*, *Business Data* (behind a tick when the buyer is not known to be a business), *Purchasing Power & Behaviour*, *Market Size & Industry Outlook*. Each box keeps its title and its text (the "i") and asks the choice questions of **6.3a**, laid out as the Positioning card is (two columns with a divider, a band for each question, a double rule between boxes); it has no free-text note; a Proxy or Dual-Intent buyer adds a sixth part, *User*. The questions of 6.3a are **built**; the list G1 to G23 below is the earlier design (2026-10-23): **where it differs from 6.3a, 6.3a governs** (G16, the usual price, is not a Segment question; G2 to G5 are one question and one check; G10, G13, G14, G15 and G23 are worded and answered as 6.3a says).

**Target.** Each box keeps its title and its text (now an optional **note**) and gains the choices below. Questions are written as lists. "Type" says what a question is worth (Appendix B): **driver** (it produces a proposal), **check** (a Review item only) or **note** (not asked).

#### How a question is answered on a Segment

| What it describes | How it is answered | Why |
|---|---|---|
| **Who they are**, in an order (age, education, organisation size) | **A range: From and To** (two existing dropdowns), narrow by design | A Segment is a narrow group. A range wider than three adjacent bands shows "A group this wide is usually two Segments with different needs. Create another Segment?" It warns; it does not block |
| **Who they are**, without an order (work situation, industry, type of organisation, area, language) | **One value** | If more than one applies, that is another Segment (the Foundation allows a primary Segment and one more) |
| **Income** | **One step on a five-step scale** (the currency symbol repeated: £ to £££££) | Shows how well off, without an exact figure |
| **The mix by gender** | **A ramp** (joined buttons) | A share, not a yes or no |
| **What they do or prefer** (what they spend on) | Several, in the Profile; the Segment asks none (G18 is merged into O11) | Preferences overlap; identity does not |

**Each fact is asked once, where it belongs.** G2 is asked here and **nowhere else**; who you sell to is asked **in Identity (I3)** and only read here; where your customers are is not asked in Identity (I4 stays withdrawn). G3 starts from the Legal Entity's country: that is a different fact (where the business is registered), so it is a default the user confirms, not a duplicate question. A second Segment starts from the first one's answers as a default and may change them.

#### Proposals at the top of the card (not questions)

| Proposal | Built from | What the user does |
|---|---|---|
| **Segment name** suggestions (for example "Small hospitality businesses") | the industry pack (I1), I3, G14, G15 | Presses Add, or types their own |
| **A description draft** ("Adults aged 25 to 44 with a bachelor's degree, household income around the typical in the United Kingdom ...") | the answers below | Presses "Use as text"; nothing is overwritten |
| **Profile suggestions**, up to three: one for each band of the age range; for business customers the kinds of business of the industry pack; **for the audience Proxy Buyers / Gifters (I7b), a second Profile for the person who uses it, beside the buyer's** | the ranges and the pack | Presses Add on the ones they want; each starts with its range already set |

#### First question: already answered in Identity (I3, "Seller and Buyer Relationship")

Asked once, on the Early Positioning tile (8.2), so that Business 1 opens with the right layout already arranged; the Segment card reads the answer and does not ask it again (the id G1 is retired). The owner's options: **B2C (Business-to-Consumer)**, **B2B (Business-to-Business)**, **B2G (Business-to-Government)** and **G2B Context (Regulatory/Compliance)**. "Business-to-consumer" is the term in the title of the EU's Directive 2005/29/EC on unfair commercial practices [FUN-18]. The question is about the **economic buyer, the one who pays** (the "i" says so).
- **B2C**: one Segment frame, set for individual people (Box 1).
- **B2B, B2G, G2B**: one Segment frame, set for businesses and organisations (Box 3; B2G asks for the public body and its administrative level, with the tender row; G2B the industry and its regulation).
- **Several relationships** (allowed while Managing and Growing): **one Segment frame for each**, each with its own box set. A Segment is one group; its questions differ for people and for businesses. (The old option "Both" is this case.)

It also sets the default of the tax question on the price card. **I3 describes the buyer (who pays).** A business that sells to two separate audiences (a studio with private clients and companies) has two Segments. Where the person who uses it is not the buyer, it is **one Segment with a second Profile for the user** (P21 "They will use it"), not two Segments and not a Segment question (below).

#### Buyer and user: read from Identity, with no Segment question (owner, 2026-10-25)

The vocabulary: the **customer** is who pays; the **user** (books also say consumer or end user) is who uses it. The app never says "consumer", because in law that word means something else. They can be different people: a baby uses the nappies and the mother pays; in a hospital the buyer is procurement and the user is a surgeon.

**There is no Segment question for it.** Identity already asks it: the audience of a consumer buyer is **"Buyer's Life-Stage and relationship with the User"** (I7b), and its option **Proxy Buyers / Gifters** says the buyer pays and the product is for someone else. The earlier proposals G24 "Who uses it?" and G25 "the user's age range", and the Buyer part and User part they would have created, are **withdrawn** (the owner: "there is no such question"): asking it again on the Segment would break rule 2 (ask each fact once), and the machinery (two parts, a question for each part, the stage cards reading the right part) is more than a Profile already does.

**What the Segment does instead.**

- **The Segment describes the buyer** (the one who pays, I3). G6 to G8, G13, G23, G14 and G15 describe the buyer.
- **The user is a second Profile** in the same Segment (a Profile is a typical person, up to three per Segment): P21 "They will use it" is ticked on it, and its age (P1) is its own. When I7b is Proxy Buyers / Gifters the app **proposes** that second Profile; for a business buyer whose staff use it (an employer, a hospital) the user adds it by hand. It is one Segment, never two.
- **A multi-sided Market Structure (I11) is not a buyer-and-user split.** Each side of a platform is one of the relationships chosen in I3, so **each side is its own Segment frame** (with its own outcome, I7c, asked per side). The Segments of a platform are tied only by the Market Structure; the dependence between the sides is not modelled (11.6).
- **The children's note** ("Selling to children and young people") and the O12 check read the age of a Profile (P1) and the buyer's range (G6): shown when either is below 18.

**What this removes:** G24, G25, the Buyer part and the User part, the two columns of questions "targeted" at each, the Profile limit "up to three per part" (it is up to three per Segment), and the P21 condition "G24 is not the same people".

#### Worked cases: who pays, who uses, who decides (one Segment; the user is a second Profile)

Each case is one Segment. The needs (comfort, safety, cost, prestige) are the owner's examples and become the Profiles' wants and worries (P17 to P19); they are not claims of the app. **Buyer** here means the one who pays.

| Case | Seller and Buyer Relationship | Market Structure; the user | The buyer (the Segment) | The user (a second Profile) | Notes |
|---|---|---|---|---|---|
| Baby products | B2C | Single-sided; the buyer is not the user | Parents: place the order, decide (comfort for the baby, their own peace of mind) | A baby (individual people), 0 to 2 | Nearly all the value proposition is aimed at the Buyer part; the baby has no worries of its own |
| Toys for young children | B2C | Single-sided; the buyer is not the user | Parent: safe, not too noisy; approves | Child: colour, a hero; asks for it | Two sets of worries; the child must want it and the parent must agree |
| Teenagers | B2C | Single-sided; the buyer is the user (own money) or not (a parent pays) | Teenager with a wallet, or the parent (controlled cost) | Teenager: acceptance, trends | G6 includes 13 to 17: the box "Customers under 18 who pay" and O12 apply |
| Gifts (flowers, jewellery, luxury) | B2C | Single-sided; the buyer is not the user | The giver: packaging, prestige, delivery speed | The recipient (optional): look, size, usefulness | The recipient's age is optional |
| HR or recruitment software | B2B | Single-sided; the buyer is not the user | Companies; finance or IT head signs | Recruiters and HR staff (individual people) | Size and industry are asked of the buyer only |
| Medical equipment | B2B | Single-sided; the buyer is not the user | Hospitals and clinics; procurement (cost, depreciation, warranty) | Doctors and surgeons (accuracy, ease, patient safety) | A public body shows the tender row |
| Corporate training | B2B | Single-sided; the buyer is not the user | HR manager or chief executive (productivity) | The employees who attend | |
| Elderly care, care homes | B2C | Single-sided; the buyer is not the user | Adult children: safety, supervision, communication, cost | The older parent, 65 or over: comfort, food, respect, social life | |
| Veterinary services, pet food | B2C | Single-sided; the buyer is not the user | The owner | none: an animal is not modelled as a user | The animal's needs go into the owner's wants and worries |
| Prescription medicines | B2C | Single-sided; the buyer is not the user | The patient (or an insurer or health service; not modelled) | The patient | The doctor who decides is a Profile of the Segment (P21) |
| Free tier of a search, social or music service | B2B and B2C (two sides) | Multi-sided (a platform: advertisers and users) | Advertisers: one Segment frame | The people who use it free: the other Segment frame (B2C) | O3 for the free side's offering is "Free to the customer"; a paid tier is another Offering |
| Delivery or marketplace app | B2B and B2C (two sides) | Multi-sided (a platform: restaurants and diners) | Restaurants: one Segment frame; they pay a commission | Diners: the other Segment frame (B2C) | Each side is its own Segment with its own payer; the diners' payment (food and delivery) is that Segment's, and which side pays the platform is confirmed on the Review page (R40) |

**Multi-sided platforms.** A platform has two or more distinct groups that need each other, and one group's value grows with the number in the other [MSP-03]. The model above covers **who is who, and who pays**: each side is one Segment frame (one for each relationship in I3, with its own outcome in I7c). It does **not** model the dependence between the groups (how one side's size changes the other's value, the start-up problem of needing both sides, subsidising one side); that is listed in 11.6 as not built. A zero price is still a product: the European Commission's 2024 notice says a service supplied at no price does not mean there is no market [MSP-04]. The one-Segment-for-each-side rule is the owner's, not a finding of the sources.

> **For the Profile (owner, 2026-11-01):** the specialized needs moved here from the Segment card, to be specified with the Profile's questions: *Do they have specific accessibility or user needs?* (standard, temporary, permanent), *What is their primary functional limitation category?* (physical and mobility, sensory, cognitive and neurodivergent; ticks), *Do they balance high-intensity caregiving or family life roles?* (none; childcare, eldercare, specialized care, sandwich generation) and *What is their household or caregiving structure?* (single-parent or solo caregiver, multigenerational, co-caregiver or shared support; up to two), behind one optional tick. The words are the owner's text of 2026-11-01.

#### Box 1: Demographics (asked when the relationship includes B2C)

**G6. What is the age range of the customer, the person who pays?** From … To … · Driver. Each band has an "i" line, written by age and development, never by work.
- **0 to 2**, babies and toddlers. *i: Cared for entirely by adults. As a user, never as the one who pays: a parent or carer chooses and pays.*
- **3 to 5**, pre-school children. *i: Learning through play, with an adult always involved. A parent or carer chooses and pays.*
- **6 to 9**, early primary children. *i: Starting to use things alone; family is still the strongest influence. Parents choose and pay; children begin to ask.*
- **10 to 12**, older primary children. *i: Gaining independence, often a first personal device, influenced by friends. Parents usually still pay.*
- **13 to 15**, young teenagers. *i: More say over their own choices. Online services often need a parent's consent below an age that depends on the country (13 to 16).*
- **16 to 17**, older teenagers. *i: Close to adult life but still children in law. Some products and services have age limits at 16 or 18.*
- **18 to 24**, young adults. *i: Adults making their own decisions.*
- **25 to 34**, adults. *i: Early adulthood.*
- **35 to 44**, adults. *i: Mid-adulthood.*
- **45 to 54**, adults. *i: Mid-adulthood.*
- **55 to 64**, adults. *i: Later adulthood, before the usual start of the older-adult group.*
- **65 to 74**, older adults. *i: The start of the older-adult group in official statistics.*
- **75 or older**, older adults. *i: Some need more support.*

Why so many bands below 18: a 10-year-old and a 16-year-old are different customers, and so are a toddler and a teenager. The bands follow the stages of the UK's Children's Code (0 to 5, 6 to 9, 10 to 12, 13 to 15, 16 to 17), with the England early-years stage starting at 3 [AGE-03, AGE-06]; the adult bands are ten-year groups [AGE-14]; the older-adult line is 65 and the next 75, as in the ABS and ONS groups [AGE-14, DEM-12]. All bands below 18 are "children" in the UN Convention on the Rights of the Child, so the app treats them as needing a parent or carer in the decision [AGE-02]. The words are "children and young people", "older people" or "older adults", never "the elderly" [AGE-08].

**When a Profile's age (P1), the user's or the buyer's, is below 18**, the app shows the note **"Selling to children and young people"**: online services and data rules differ by country, and some goods have minimum ages (O12, section 10.3). **When G6 (the customer, who pays) includes a band below 18**, the app asks P21, hides G7 for the bands below 18, shows G13 for any range that includes 13 or older (the likely answer is "in full-time education"), and shows the box "Customers under 18 who pay" below. If G6 includes a band below 13, a line says "Under 13, someone else usually pays. Describe the person who pays here and the child as a second Profile (P21 'They will use it')." It warns; it does not block. The online consent lines:

| Country | Online or data rule | Source status |
|---|---|---|
| UK | 13 for online services; the Children's Code covers everyone under 18 | AGE-03, AGE-04, opened |
| Ireland | 16 (the digital age of consent) | AGE-19, excerpt; the PDF could not be read, re-check |
| USA | Under 13 (COPPA); teenagers are not covered by COPPA | AGE-09, opened |
| Canada | Under 13 needs a parent; 13 to 17 needs an assessment of capacity; Quebec 14 | AGE-12 opened; Quebec excerpt |
| Australia | Under-16 social media minimum age from 10 December 2025 (the duty is on the platforms); a children's online privacy code for under 18 is a draft due by 10 December 2026 | eSafety excerpt; AGE-16 opened |
| New Zealand | No minimum age; the Privacy Act applies to everyone, and a child is under 18 | AGE-18, opened |

#### Customers under 18 who pay, and whose money it is

A person under 18 can be a real customer: they may have pocket money or a wage and a debit card. The app does not guess; it asks (G6, P14) and shows what is known, as "tends to", with its status. Nothing here is legal advice, and nothing blocks the user.

| Case | What is known (status) | What the app does |
|---|---|---|
| A child uses it, an adult pays | The usual case below about 13 | A second Profile for the child (P21 "They will use it"); the Segment describes the payer |
| A teenager pays with pocket money or a part-time wage | Over 7 in 10 UK children aged 7 to 17 get regular money from pocket money or work [excerpt, Money and Pensions Service]. US teens aged 16 to 19: 36.5% employed in July 2026 [opened, BLS]. Canada, 2019, ages 15 to 19: 43.2% employed, more than 95% of full-time students' jobs part-time [opened, Statistics Canada]. **No official body gives a total for teenagers' spending**: any such figure the user types is a note, not evidence | Allowed in G6 (bands 13 to 15 and 16 to 17); P21 is asked; a Review line "Your Segment includes people under 18 who pay" points to O12 and the contract line below |
| When young people can work | Light, limited work from about 13 to 14 in the six countries; full-time only after the school-leaving age, about 16. England 14 [opened, GOV.UK]; Ireland 14 to 15 light work, 16 for full employment [opened, WRC]; USA 14 non-farm, hours limited, 16 unlimited [opened, DOL]; Ontario 14 by workplace, British Columbia 12 to 15 with a permit [opened]; Quebec 14 [excerpt]; New Zealand outside school hours for those 15 or under [opened]; **Australia is set by each state and territory and no page was opened** | Shown in the "i" line of the 13 to 15 band, as "tends to"; G13 offered from 13 |
| Own bank account or debit card | UK children's accounts, debit card from about 11 [excerpt, MoneyHelper]; Ireland teen accounts from 11 or 13, a parent may need to approve [opened, CCPC]; USA needs an adult co-owner or custodian, some states allow independent minor accounts [opened, FDIC, Federal Reserve]; Canada no-cost youth accounts for 18 and under [excerpt]; **Australia and New Zealand: no official source found** | P14 for a range wholly under 18: credit card, buy now pay later and invoice are not offered; debit card, cash and "a parent pays" are. A filter on a list, explained in a line |
| Credit | US credit card under 21 needs own income or a co-signer aged 21 or over [opened, CFPB]; Canada the primary cardholder must be of age [opened, FCAC]; UK 18 [non-official excerpt]; **Ireland, Australia, New Zealand: no official page** | Same filter; for ranges that include 18 or 20, a line "credit is limited under 21 in the USA" |
| Contracts under 18 | UK: a contract cannot generally be enforced against a minor, and a court may order property returned [opened, Minors' Contracts Act 1987]. Scotland: 16 and over have full capacity; under 16 only for transactions typical for their age [opened and excerpt, 1991 Act]. USA: voidable in most states [opened, Cornell]. New Zealand: unenforceable against the minor, a court may cancel [excerpt]. New South Wales: not binding on a minor unless the Act says so [excerpt]. Canada: the age of majority is 18 or 19 by province, and no current provincial rule was verified. **Ireland: not verified** | A note, never a block: "Customers under 18 can often cancel what they sign. Subscriptions and long contracts bind them less. Consider a parent or carer as the contract holder." A Review line when O3 is a subscription, membership or contract and G6 includes a band below 18 |
| Free of parents ("emancipated") | Court routes exist in some places; only California court material was found [excerpt] | Not modelled. The working line is under 18; a note says the age of majority is 19 in some Canadian provinces and that New Zealand's older statute says 20 but its contract law treats under 18 as minors |

Drives: narrows the Profile's age (P1) to the range; proposes a Profile per band (up to three); reveals the who-pays question and the notice for children; shown beside the channel suggestions as context. Evidence line: online use is near-universal below 65 and drops from 65, widest from 75 [DIG-07, DIG-14]; the app never infers skill from age.

**G7. What is their highest level of education?** From … To … (ordered; asked for ranges that include 18 or older) · Driver
- No formal qualifications
- School-level qualifications
- Vocational or trade qualification, apprenticeship or diploma
- Some college or university, no degree yet
- Bachelor's degree or equivalent
- Postgraduate degree (master's or doctorate)
- Not sure yet

Each option shows the customers' country's examples in its "i" (from G3), for example in the UK: *School-level: GCSEs, A levels; Vocational: apprenticeship, NVQ, HND*; in the USA: *School-level: a high-school diploma*; in Australia: *Year 10 to 12; Vocational: Certificate III or IV, Diploma*. **Why this wording.** The lowest option names what the person has, with no judgement, as the statistics offices do ("No qualifications", "No certificate, diploma or degree", "No qualification", "No formal education") [DEM-03, DEM-09, QST-17, QST-11]; "formal" is there because people learn outside school; "school-level" and "vocational" are separate so a trade qualification is not ranked below school; the words "dropout", "uneducated" and "unqualified" are not used (an inference: no style guide was found that names them). "Not sure yet" replaces "Prefer not to say": the founder is describing a group, not answering about themselves. Drives: shown in the Profile's note (P2 merged). Evidence line: digital skill and the way people pay vary more with education than with age (Ireland: basic digital skills 88% with high education against 14% with low [DIG-14]).

**G8. How would you describe their household income?** One step · Driver. The currency symbol of the organisation (£, € or $) is repeated; the "i" of each step shows the typical amount of the country.
- £, lower income: under 60% of the typical household income
- ££, below typical: 60% to 99%
- £££, around typical or somewhat above: 100% to 149%
- ££££, above typical: 150% to 199%
- £££££, higher income: 200% or more
- Not sure yet

**What the "i" shows.** The typical (median) income of the customers' country, with its year and definition, and the amounts of the five steps computed from it. The offices measure different things, so each country shows its own figure and its definition, and the five steps are always 60%, 100%, 150% and 200% of that figure. 60% is the official "relative low income" line in the UK and the at-risk-of-poverty line in Ireland and the EU; 200% is the OECD's upper-income boundary (an excerpt); 100% and 150% are the author's lines [INC-01, INC-08, INC-12, INC-13].

| Country | Typical figure shown | Year | Definition | Source |
|---|---|---|---|---|
| UK | £37,500 a year before housing costs, for a couple (a single adult £25,100) | FYE 2025 | net household income, equivalised | INC-01 |
| Ireland | €31,767 a year per person | 2025 survey (income of 2024) | equivalised disposable income | INC-08 |
| USA | $83,730 a year per household | 2024 | money income before tax, not equivalised | INC-04 |
| Canada | $74,200 a year per household | 2023 | after-tax income, not equivalised | INC-06 |
| Australia | $1,192 a week, about $62,000 a year | 2022-23 | equivalised disposable household income | INC-10 |
| New Zealand | not verified (the one figure found was from an aggregator and is not used) | | | INC-14 |

The scale describes the household, not the person: a student or a non-earning partner in a well-off household sits high on a relative scale. The steps are bands of the distribution, not fifths, so the middle steps hold most people. A higher figure is not a better customer; no source links income to willingness to pay for a service. Drives: shown in the Profile's note (P7 merged; an exact household figure stays in the note). The Segment does not ask for an amount.

**G13. What is their work situation?** One answer (asked for ranges that include 16 or older) · Driver
- Employed full time *i: Includes the armed forces, paid apprentices and trainees, and people on leave from a job (for example parental leave).*
- Employed part time *i: Includes casual work.*
- Self-employed or running their own business *i: Includes freelance and gig work.*
- Not working, looking for work
- In full-time education
- Looking after home or family
- Retired
- Not working because of health or disability
- Not working and not looking for work *i: For example a gap year, travelling or a break. Unpaid volunteering is not a work situation: choose the one that describes their main activity.*

These placements are the author's, following the usual labour-statistics split into employed, unemployed and not in the labour force (the standard was not opened); check them before building. There is no "Other".

If more than one is true of your customers, make another Segment. Drives: the Profile's job level (P6) for the employed and self-employed.

**G10. What is the usual gender mix of your customers?** A ramp of joined buttons · Driver (it reveals P5 and the notice)
- Not relevant to what I offer
- Almost all men (women 0 to 20%)
- Mostly men (women 20 to 40%)
- A mix (women 40 to 60%)
- Mostly women (women 60 to 80%)
- Almost all women (women 80 to 100%)

Help: "This describes your usual customers, not who may buy. Every gender can buy, and non-binary and other genders are welcome in every option." Drives: shows the equality notice (a segment must not be used to refuse, exclude or price people differently because of a protected characteristic, with the law of each customer country); a Profile's gender should fit the mix (Review). Household and nationality are not asked: nothing would read them.

#### Box 2: Geographics

**G2. Where are your customers?** · Driver
- In my local area
- In my region
- Across my country
- In several countries
- Anywhere online
- Not sure yet

Drives: orders the suggested channels (for a local scope, In Person and Community first); reveals G3.

**G3. Which is their main country?** (shown for "In several countries" or "Anywhere online"; otherwise it is the Legal Entity's country; the user confirms) · Driver
- United Kingdom
- Ireland
- United States
- Canada
- Australia
- New Zealand
- Another country *i: Any country outside these six, for example India, Singapore or South Africa. The plain lists are used, and a note says to check that country's law.*

Drives: chooses the country's examples for education, size, industry and area; the equality notice; the language notes. Customers in another country are another Segment.

**G4. What kind of area do they live or work in?** One answer · Check
- City centre or large city
- Large town
- Small town
- Rural area, villages and countryside
- Remote area, far from towns and services

Drives: a Review item when customers are remote or rural and the offering is shipped or delivered in person. Evidence line: the rural gap is small in most data and large only for remoteness [DIG-12, DIG-14].

**G5. Which languages do they use?** One answer · Check
- English only
- English and another language
- Mainly another language

Drives: "who will support them?" (a Capability item); a note on French for Canada. Named places and languages stay in the Geographics note.

#### Box 3: Business Data (asked when the relationship includes B2B, B2G or G2B)

**G23. What type of organisation are they?** One answer · Driver
- Self-employed or freelancer
- A private business *i: Includes co-operatives. A social enterprise belongs here or under non-profit, by how it is owned.*
- A non-profit or charity *i: Includes membership and professional bodies and religious organisations.*
- A public body, for example a government department, council, school or hospital

Drives: a public body reveals the "Contracts or tenders" demand row and a note of the stated tender periods and public payment terms [B2B-02, B2B-06, PAY-03]; non-profit and charity are asked here because no official industry scheme has them [BUS-17].

**G14. How big are they?** From … To … (ordered) · Driver
- Just one person, self-employed with no employees
- 1 to 9 employees, a small team
- 10 to 49 employees, a growing company
- 50 to 249 employees, a mid-sized company
- 250 to 499 employees, a large company
- 500 or more employees, a very large organisation

Drives: channel suggestions by size (P23 merged into it). Evidence line: websites, cloud and AI use rise with size in every country with data (UK: a website for 76% of sole traders and 99% of large firms [B2B-01]).

**G15. What industry do they work in?** One answer · Driver. The 18 industries, each with an example, then "Not sure, or more than one". There is no "Something else": every section of the four industry schemes sits under one of the 18, and what does not look like an industry is explained in the "i" lines. If they work in more than one industry, make another Segment.
- Farming, forestry and fishing, for example crops, livestock, forestry, fishing
- Mining, oil, gas and quarrying
- Manufacturing, for example food and drink, clothing, machinery, electronics, furniture
- Energy, water and waste, for example electricity, gas, water, recycling
- Construction, for example building, civil engineering, trades
- Wholesale and retail trade, for example shops, online stores, wholesalers, vehicle dealers
- Transport, postal and logistics, for example road, air, sea, couriers, warehousing
- Hospitality, for example hotels, restaurants and cafés, bars, catering
- Software, IT, media and telecoms, for example software, apps, web, IT services, film, publishing
- Finance and insurance, for example banks, lenders, insurers, brokers, payments
- Real estate and property, for example agents, landlords, property management, developers
- Professional, scientific and technical services, for example consulting, marketing, design, architecture, engineering, legal, accounting
- Administrative and support services, for example recruitment, cleaning, security, travel, call centres
- Government and public administration *i: Includes embassies and international bodies.*
- Education and training, for example schools, universities, tutors, training providers
- Health and social care, for example clinics, dentists, care homes, social work
- Arts, sport and recreation, for example artists, galleries, gyms, clubs
- Other services, for example repair, personal services, membership organisations *i: Includes households that employ staff, such as cleaners and nannies.*
- Not sure, or more than one *i: A label that spans industries (creative industries, agri-tech) is not one industry: choose the closest, and make another Segment for a second. Non-profits are not an industry either: the next question asks the type of organisation.*

Drives: the Profile's "which kind of business" (P24) shows the finer list of that sector, each with its example (doc 35, 5.4); competitor industry overlap. Evidence line: adoption depends on industry as much as size [B2B-01, B2B-03, B2B-05, B2B-07].

#### Box 4: Purchasing Power & Behaviour

**G16. What do they usually pay for something like yours?** From a number, to a number, in the organisation's currency · Check. The answer can be compared with the price (Review).

**G17. How do they feel about price?** **Withdrawn (merged into I7c, 2026-10-25).** The seller's Differentiation and Outcome (Cost-driven; Status & Premium; Lower costs) already says whether the Segment is reached on price or on quality; asking the customers' attitude again is the same fact twice. The Review compares the outcome with G16 and the price.

**G18. What do they spend most on?** **Withdrawn (merged into O11, 2026-10-25).** The Offering's O11 ("what does the customer spend on when they buy this?", list L12) is the one place the spending category is asked; the Segment-level list had nothing to be compared with except O11.

**G19. How often do they usually buy something like this?** **Withdrawn (merged into O3, 2026-10-25).** How the offering is bought (one purchase, a subscription, a project) is O3; the Segment's frequency was only a check against it.

#### Box 5: Market Size & Industry Outlook

Not part of the customer model (the owner's text, 2026-10-23). The existing box stays as it is (G20 to G22 are notes).

#### What the Segment card gives the next parts

| To | Gets |
|---|---|
| The Profile cards | Their options limited to the range or the one value; a proposed Profile per band, per kind of business, or for the child and the parent or carer |
| The channels (page 2) | The order of suggestions (G2), the country's lists (G3), channels by business size and industry (G14, G15) |
| The demand rows | The tender row for a public body (G23) |
| The Review page | Three checks (G4, G5, G16) and the Profile-fits-Segment checks |
| The documents | A drafted Segment description |

**Not asked, and why.** Buying timing (no seasonality in the model); household, nationality and the owner's "own or household" income question (nothing would read them; the income step is the household's); market size (outside this step). **Counts for the card:** see Appendix B (G9, G11, G12, G17, G18, G19, G24 and G25 are withdrawn, merged or no longer numbered).
