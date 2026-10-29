# 33. Specs and limitations: the first published version (owner, 2026-10-29)

Status: **specification, as given by the owner.** What the first published version of the app contains and what it does not. The owner's items are written as given; the assistant's checks against the app, doc 28 and doc 31 are marked **Check** and are for the owner to confirm. Nothing here is built. What the first version leaves out is in doc 34.

Related: doc 28 (questionnaire specification), doc 31 (positioning categories), doc 32 (sources), doc 34 (future features).

## 1. The scope at a glance

| Area | First published version |
|---|---|
| Language | **English only** |
| Countries | **UK, Ireland, USA, Canada, Australia, New Zealand**, and **Other** |
| Legal form, activities, codes | A **complete list** for each of the six countries; **Other**: the user types the activity and its code by hand |
| Market structure | **Single-sided only** |
| Seller and buyer relationship | **B2C and/or B2B** only |
| Buyer | The **buyer's category** is separate from the **buyer's life stage** |

## 2. Language

English only. Every label, tooltip, document and export is in English; there is no language switch. (Earlier owner constraint, kept: the audience is early-stage, solo or small teams.)

## 3. Countries, legal forms, activities and codes

1. **Six countries:** United Kingdom, Ireland, United States, Canada, Australia, New Zealand. Each has a **complete list of activities with their related codes**, taken from the country's own scheme (doc 28, 5.3 and 5.8: the classification, its levels and the label of the code).
2. **Other** is offered as well. For Other the app user **types the activity and the related code manually**.
3. **Legal form** has five options:
   1. Sole Proprietorship
   2. General Partnership
   3. Private Limited Company (LLC / Ltd / GmbH)
   4. Public Limited Company (PLC / Corp / AG)
   5. Limited Liability Partnership (LLP)

**Check, for the owner:**
- **The built app differs.** Today every country in the world can be chosen; only some carry a profile with their own legal forms (for example a GmbH entry exists for one country), and the rest use a neutral profile. The five-option list replaces the country lists of the app. Whether it replaces them **in all seven choices** (the six countries and Other) is read here as **yes**.
- **"Other" is read as an extra country choice**, with the activity and code typed by hand. If "Other" was meant for the activity inside a listed country, say so.
- **The five names put the country's own forms inside one option** (an LLC, an Ltd and a GmbH are all option 3). The legal-form wording that follows the country in the documents (the "limited company" phrase, capital, registration authority) would then follow the option, not the country. Which documents and requirement texts depend on the country's form is not yet decided.
- **Rule 14 of doc 28** says a country's legal forms are taken from an official document of that country's government. The owner's five generic forms are the owner's own list and **override that rule for the first version**; the country lists stay in the code for later (doc 34).
- **General Partnership** is new on the list in this form; the built lists name partnership forms per country.

## 4. Market structure and relationships

1. **Single-sided only.** The Market Structure question (I11) has no Multi-sided option in the first version.
2. **B2C and/or B2B only.** The Seller and Buyer Relationship question (I3) offers B2C and B2B; **B2G and G2B are left out**.

**Check:** what this makes unnecessary in doc 28 8.2: the anchor-side rule and the "side:outcome" per-side answers (no sides), the audience lists for B2G (Administrative Level) and G2B (Regulatory Intensity), the locked audiences (Central Government and Ministries; Heavily Regulated Markets), and the public-sector and government-to-business relationships of doc 31 section 6.3 and 6.4. The stage limits (1, 1, 2, any) still apply to B2C and B2B. The built app has these options; they would be hidden in the first version, not deleted (see doc 34).

## 5. The buyer: category and life stage are two separate things

The buyer's category no longer sits inside the life-stage list.

**Buyer's category** (what the buyer buys for):
1. **Direct Buyers**: purchasing exclusively for their own personal use.
2. **Proxy Buyers**: purchasing exclusively on behalf of someone else.
3. **Dual-Intent Buyers**: purchasing a single offering to be used by themselves **and** their dependents.

**Buyer's life stage:**
1. Students / Young Adults
2. Workers / Professionals / Adults
3. Seniors

**Shown only for Proxy Buyers or Dual-Intent Buyers (a filter):**
1. **Buyer and User relationships:**
   1. Parent or legal guardian
   2. Caregiver or person responsible for their care
   3. Family member or relative
   4. Spouse or romantic partner
   5. Friend or acquaintance
   6. Other personal relationship
2. **User's life stage:**
   1. Minors
   2. Young Adults
   3. Adults
   4. Seniors

**Then:** Purpose, Differentiation, Outcome. (The list was sent unfinished; see the checks.)

**What the End User block holds in the first version:** the two items above only (the Buyer and User relationship, and the User's life stage). The questions "who chooses" (I7f) and "what matters most to the User" (I7g), the routing into the second Profile's ticks, and everything else collected about the End User are **future features** (doc 34).

**Check, for the owner:**
1. **This replaces the I7b design of doc 31 9J.** There the life-stage list had five options, with Proxy Buyers / Gifters and Dual-Intent Family Buyers among them. Now **I7b has three options** (the life stage) and **the category is a separate question** with the three categories. The End User block is shown by the **category** (Proxy or Dual-Intent), not by an I7b option.
2. **The built app still has "Proxy Buyers / Gifters" inside the life-stage list** (and the saved value `proxy`). It stays until the new structure is built (doc 31 9L); the saved value needs converting then.
3. **The user's life stage has four coarse groups**, while doc 31 section 1 has the detailed stages (Infancy through Late Adolescence, Young, Established, Peak, Mature, Active Retirees, Dependent seniors). The edges of **Minors, Young Adults, Adults, Seniors** are not given. Minors is read as under 18, Seniors as 65 and over (which includes the Dependent seniors of 74 and over, not the buyer's Seniors of 65 to 74). **Do the four replace the detailed stages in the first version, or group them?** Not stated.
4. **The relationships listed are the six personal ones only.** The business ones of doc 31 section 6.2 (employer to employees, business partner, a business serving its clients, intermediary, sponsor) are not in the filter. A B2B buyer who is a Proxy or Dual-Intent buyer has no relationship list. Is the filter for B2C only?
5. **Purpose, Differentiation and Outcome are three items.** Before, Differentiation and Outcome was one question (I7c) and the 12 purposes were information only (doc 31 9C 3). Are they now three questions, and does Purpose use the 12 purposes of doc 31 section 7? Where they sit (every buyer, or only after the filter) is read as **every buyer**.
6. **The earlier routing is unchanged** where it still fits: the End User answers feed the second Profile (doc 31 9H and 9K).

## 6. Limits that already stand (from earlier owner decisions)

- Smallest supported width is 768 px; the app aims at WCAG 2.2 AA.
- Sources follow rule 14 (doc 28): classifications from official bodies, plain lists from business-school or university documents.
- Age-restricted activities and buyers (doc 30; requirements R-1 and R-2 of doc 31 9C) are **not** in this list of the first version unless the owner adds them (see doc 34).

## 7. Open at the end of this document

1. The list of the first version was sent **unfinished** (a bullet with no text after the buyer's category). Anything after it is to be added here.
2. The checks of sections 3 to 5, in particular: Other as a country; the five legal forms for all countries; the four coarse life stages; the relationships for B2B proxy buyers; whether Purpose, Differentiation and Outcome are three questions.
