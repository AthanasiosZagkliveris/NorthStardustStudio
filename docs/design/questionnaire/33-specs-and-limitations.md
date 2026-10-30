# 33. Specs and limitations: the first published version (owner, 2026-10-29)

Status: **specification**, written 2026-10-29, updated 2026-10-29, as given by the owner. What the first published version of the app contains and what it does not. The owner's items are written as given; the assistant's checks against the app, doc 28 and doc 31 are marked **Check** and are for the owner to confirm. Nothing here is built. What the first version leaves out is in doc 34.

Related: doc 28 (questionnaire specification), doc 31 (positioning categories), doc 32 (sources), doc 34 (future features), `docs/README.md` (contents), `docs/index.md` (index) and `docs/app/glossary.md` (glossary).

## 1. The scope at a glance

| Area | First published version |
|---|---|
| Language | **English only** |
| Countries | The **six named countries** (UK, Ireland, USA, Canada, Australia, New Zealand) and **Other**, which is any country outside those six |
| Legal form | The six countries: each country's **own complete list**. Other: **five generic forms** |
| Activities and codes | The six countries: each country's **complete list with its codes**. Other: the user **types the activity and the code** |
| Market structure | **Single-sided only** |
| Seller and buyer relationship | **B2C and/or B2B** only |
| Buyer | The **buyer's category** is separate from the **buyer's life stage** |
| Ages | Placed in the **Segment**, and maybe as an "i" |

## 2. Language

English only. Every label, tooltip, document and export is in English; there is no language switch. (Earlier owner constraint, kept: the audience is early-stage, solo or small teams.)

## 3. Countries, legal forms, activities and codes

1. **Six countries:** United Kingdom, Ireland, United States, Canada, Australia, New Zealand. Each has a **complete list of legal forms** and a **complete list of activities with their related codes**, from the country's own scheme (doc 35, 5.3 and 5.8: the classification, its levels and the label of the code; rule 14 of doc 28 for the legal forms).
2. **Other** means **any country outside those six**. For Other:
   - the app user **types the activity and the related code manually**;
   - the **legal form** has four options (public company, nonprofit and cooperative forms are left out: doc 34, section 5):
     1. Sole Proprietorship
     2. General Partnership
     3. Private Limited Company (LLC / Ltd / GmbH)
     4. Limited Liability Partnership (LLP)

**Check, for the owner:**
- **The built app differs.** Today every country in the world can be chosen from a list; some carry a profile with their own legal forms (for example a GmbH entry exists for one of them) and the rest use a neutral profile with free text. In the first version, the six countries keep their profiles; every other country is "Other" with the five forms. Whether the country picker lists the six and Other only, or all countries mapped to Other, is not stated; the first is read here.
- **Do the six countries' built legal-form lists count as "complete"?** The lists in the code are the ones the owner's rule 14 allows only from official documents; whether each is complete and sourced for the six countries has not been re-checked here.
- **The four generic forms are the owner's own list** (not from an official document), allowed because Other has no official source. Option 3 names several countries' forms in one option; the documents that follow the legal form (the "limited company" phrase, capital, registration authority) would follow the option for Other.
- **General Partnership** is new on the list in this form; the built lists name partnership forms per country.

## 4. Market structure and relationships

1. **Single-sided only.** The Market Structure question (I11) has no Multi-sided option in the first version.
2. **B2C and/or B2B only.** The Seller and Buyer Relationship question (I3) offers B2C and B2B; **B2G and G2B are left out** (their information is in doc 34, section 5).

**Check:** what this makes unnecessary in doc 28 8.2: the anchor-side rule and the "side:outcome" per-side answers (no sides), the audience lists for B2G (Administrative Level) and G2B (Regulatory Intensity), the locked audiences (Central Government and Ministries; Heavily Regulated Markets), and the public-sector and government-to-business relationships of doc 31 sections 6.3 and 6.4. The stage limits (1, 1, 2, any) still apply to B2C and B2B. The built app has these options; they are hidden in the first version, not deleted (doc 34).

## 5. The buyer: category and life stage are two separate things

The buyer's category no longer sits inside the life-stage list.

**Buyer's category** (what the buyer buys for):
1. **Direct Buyers**: purchasing exclusively for their own personal use.
2. **Proxy Buyers**: purchasing exclusively on behalf of someone else.
3. **Dual-Intent Buyers**: purchasing a single offering to be used by themselves **and** their dependents.

**Buyer's life stage** (B2C):
1. Students / Young Adults
2. Workers / Professionals / Adults
3. Seniors

**Shown only for Proxy Buyers or Dual-Intent Buyers (a filter):**

**1. Buyer and User relationships**, by the relationship model chosen:

| B2C (personal) | B2B (business) |
|---|---|
| Parent or legal guardian | Employer providing for employees |
| Caregiver or person responsible for their care | Business partner or co-owner |
| Family member or relative | Business serving its clients or customers |
| Spouse or romantic partner | Professional intermediary acting for a client |
| Friend or acquaintance | Sponsor or funder |
| Commercial & Professional relationship (a proxy buyer; added 2026-10-30) | |
| Other personal relationship | Other business relationship |

The B2B list is the six business relationships of doc 31 section 6.2, each with the owner's description of how it positions (doc 31 section 10.6). They split into **Proxy archetypes** (Employer providing for employees; Professional intermediary; Sponsor or funder; Other business relationship, for example a franchise owner buying for franchise operators) and **Dual-Intent archetypes** (Business partner or co-owner; Business serving its clients or customers).

**2. User's life stage (B2C):**
1. Minors
2. Young Adults
3. Adults
4. Seniors

**Then:** Purpose, Differentiation, Outcome. (The owner's list was sent unfinished; see the checks.)

**What the End User block holds in the first version:** the relationship and, for B2C, the user's life stage. The questions "who chooses" (I7f) and "what matters most to the User" (I7g), the routing into the second Profile's ticks, and everything else collected about the End User are **future features** (doc 34).

**Check, for the owner:**
1. **This replaces the I7b design of doc 31 decision 19.** There the life-stage list had five options, with Proxy and Dual-Intent among them. Now **I7b keeps three life-stage options** and **the category is a separate question**. The End User block is shown by the category.
2. **The built app still has "Proxy Buyers / Gifters" inside the life-stage list** (saved value `proxy`). It stays until the new structure is built (doc 31 decision 23); the saved value needs converting then.
3. **The user's life stage has four coarse groups** with no age edges given. Minors is read as under 18 and Seniors as 65 and over (which includes the Dependent seniors of 74 and over). Do the four replace the detailed stages of doc 31 section 1 or group them? Not stated.
4. **B2B users have no life stage.** The user's life stage is read as B2C only; for B2B the relationship is the only End User item.
5. **The buyer's category for B2B:** the archetypes of section 10.6 suggest a category for each relationship (Proxy or Dual-Intent); as decided in doc 31 decisions 8 to 10, the relationship only **suggests** it and the buyer's own answer governs.
6. **Purpose, Differentiation and Outcome are three items** (settled 2026-10-30: the owner asked for the Differentiation to be separate from the Outcome, the Differentiation focused on the offering, and for a different outcome for the buyer and the user where the buyer is a Proxy or Dual-Intent Buyer). Purpose uses the 12 purposes of doc 31 section 7; Differentiation keeps the owner's four words; the Outcome for the buyer is the four results those words name; the Outcome for the user is the six answers of the former "what matters most to the End User".

## 6. Ages

**Ages are placed in the Segment, and maybe as an "i"** (owner). Read as the age information collected in docs 30 and 31, shown on the Segment card (Business 1) and possibly in an "i" beside the relevant answer.

**Check, for the owner:**
- **Which ages?** Three kinds exist: the **legal ages by activity and country** (doc 30: alcohol, tobacco, gambling and so on), the **legal ages for a buyer** (majority, consent, credit; doc 31 section 10.2), and the **life-stage age ranges** (doc 31 section 1; the Segment's age range G6 already exists). The first two were requirements R-1 (Organization card) and R-2 (Positioning card) of doc 31 section 9; they now move to the Segment. Read here as **all three, shown on the Segment**, with the legal ones applied from the customers' country automatically.
- **Where, exactly:** a line in the Segment card, an "i", or both is not decided.

## 7. Limits that already stand (from earlier owner decisions)

- Smallest supported width is 768 px; the app aims at WCAG 2.2 AA.
- Sources follow rule 14 (doc 28): classifications from official bodies, plain lists from business-school or university documents.

## 8. Built on 2026-10-29

The Organization tile and the Early Positioning tile of the app follow this document. What was built, and how the open readings of section 3 to 5 were settled while building (each can be changed):

**Organization tile**
- **Country:** the picker lists the six countries and "Other". "Other" opens a second list, "Other country", of every other country (so the currency and the tax wording still follow the country). The six keep their legal forms, their classification and their registration data.
- **Legal form:** the six countries keep their own lists; every other country has the five generic forms, then "Other" (the way out to a form the list does not carry, kept as in every list).
- **Activities:** for the six countries the official classification (up to four activities); for Other each activity is typed with its code (an "Activity" box and a "Code" box in each row, up to four rows).

**Early Positioning tile**
- **Market Structure** is not asked (single-sided). **Seller and Buyer Relationship** offers B2C and B2B only. The built B2G, G2B and multi-sided features stay in the code and are hidden; an older answer that holds them is read without them.
- **Buyer's Life-Stage** (B2C) has three options; **Audience Specialization & Scale** (B2B) is unchanged. **Buyer's category** (Direct, Proxy, Dual-Intent) is asked for each relationship chosen, one choice.
- For a Proxy or Dual-Intent Buyer: **Buyer and User relationship** (the six personal ones and the Commercial & Professional one for B2C, the six business ones for B2B) and, for B2C only, **User's Life-Stage** (Minors, Young Adults, Adults, Seniors).
- **Purpose** (the twelve purposes) is asked once, with the same limit as the outcome. **Differentiation** (Cost-driven; Convenience-driven; Compliance, Risk & Security; Status & Premium; and, added 2026-10-30, Performance & Innovation; Ecosystem & Integration) is about the offering. **Outcome** (Lower costs; Time saved; Legal and data-protection cover; Higher quality and prestige) is the buyer's result, and where some buyer is a Proxy or Dual-Intent Buyer it is asked as "Outcome for the buyer" beside an **Outcome for the user** (Enjoyment and fun; Comfort and ease; Safety and care; Learning and growth; Looks and belonging; Practical use). The lists of the outcomes are made from the words of the former question (the results it named) and of the former "what matters most"; confirm or send your own.
- **Only the relationships that fit the category are offered** (2026-10-30): a Proxy Buyer is not offered the Spouse or romantic partner; a Dual-Intent Buyer is not offered the Friend or acquaintance or the Commercial & Professional relationship; for a business buyer the proxy ones and the dual ones are told apart in the same way (doc 31, 10.7).
- **A radio reacts under the pointer as a tick box does** (its words underlined, the round's glow ring): doc 18 and the rulebook.
- "Who chooses" and "what matters most to the End User" are no longer asked (future features).

**Arranged on 2026-10-30:** the Early Positioning tile has two columns. Left, every question before the Purpose: the Seller and Buyer Relationship and, for each relationship, its audience (Buyer's Life-Stage or Audience Specialization & Scale), its Buyer's category and the End User (the buyer and user relationship, the user's life stage). Right, the Purpose, the Differentiation and the Outcome. The **Purpose** options are ordered by relevance to the answers so far (the owner's tables, doc 31, 10.7: the buyer and user relationship, else the buyer's category, else the seller and buyer relationship); the purposes the tables call generally less directly relevant are not offered (2026-10-30; one already chosen stays).

**Not built:** the ages in the Segment (section 6), anything in Business 1 that reads the category, the relationship or the purpose, and the second Profile for the user.

**Saved answers:** an older answer is read in the new form: B2G, G2B and multi-sided answers drop; Proxy Buyers / Gifters in the life stage drops (the buyer's category is empty and is asked again); the End User ages fold into the four life stages (three under 18 are Minors, the older adults are Seniors), the relationships rel:parent, rel:family and rel:friend keep their ids, and who-chooses and what-matters-most go. The two example organizations carry a buyer's category and a purpose.

## 9. Open at the end of this document

1. The owner's list was sent **unfinished** more than once. Anything after it is to be added here.
2. The checks of sections 3 to 6, in particular: the country picker; the four coarse life stages; whether B2B users have a life stage; Purpose, Differentiation and Outcome as three questions; which ages go in the Segment and where.

**Closed on 2026-10-30 (the owner: close the open points of the Positioning tile):** the Outcome lists (buyer and user) and the relationships offered for each category are approved as written; a purpose a table does not list is read from the next table; the master matrix stays a reference; no "Recommended" tag is added (doc 31, decision 38). Still future: the routing of the outcome for the user into the second Profile (doc 34, item 13).

**Left out on 2026-10-30 as heavy, public or late-stage institutional (the owner):** the **public company** legal forms (Public Limited Company, PLC, Public Company, Corp, AG) in every country list and in the generic forms; the **Nonprofit Corporation** (United States) and **Cooperative** (Canada) forms. They are listed in doc 34, section 5. A legal form already saved stays as the user's text. **The audience scale is not touched:** Audience Specialization & Scale is the app user's audience (the customers of the business described, from Solopreneurs & Freelancers to Enterprise / Public Sector), a different thing from the app's own audience; the owner corrected the first reading on 2026-10-30.

**A change of country empties the dependent answers (2026-10-30):** the instant the Country changes to another value, the State (the subdivision) and the Address are emptied with the legal form, the activities and the registration numbers, so no address stays under another country's state or postcode. Choosing the same country again changes nothing.

**No "Other" in the Legal Form list (2026-10-30, the owner):** the Legal Form is one of the country's own forms, or one of the four generic forms for Other; the list has no "Other" entry and no free-text name beside it. A legal form saved earlier as "Other" shows with its typed name until the user chooses another.
