# 11. The Terms of Use: the law and other apps

Status: **research**, written 2026-11-27, updated 2026-11-27. What the law of Greece and the EU and of the six countries Tiles serves requires of its Terms of Use, what similar business-plan apps put in theirs, and the changes this makes to the draft Terms. Asked by the owner on 2026-11-27 (20:25 UTC+2): "do also a deeper research regarding the laws. Also check online other similar apps, their terms of use, and compare them." Not legal advice: a lawyer should read the final text before Version 1.

Related: Research 10 (protecting the app), the proposal `apps-on-every-system.md` (batch 3b), the privacy policy at northstardust.studio/privacy.

## 1. The law, by country

| Where | What applies to Tiles' Terms | Effect on the draft |
|---|---|---|
| **EU (Greece, Ireland): the law chosen** | A consumer contract may choose a law, but the choice cannot take away the protection of the rules of the consumer's own country that no contract can set aside, where the trader directs its activity there (Rome I, Article 6) [1]. | Greek law can be chosen; the line "nothing takes away rights you have under your country's law" is required in substance. |
| **EU: free digital content** | The digital content directive covers content supplied **for personal data** as well as for a price, unless the data is used only to supply the content [2]. The Beta questionnaire's answers are used to improve the app, so the Beta is likely in scope: the content must conform, and the consumer may end the contract if it does not. | Promise only what the app does; say how to stop using it (and that the data stays on the device). |
| **EU: unfair terms** | A standard term that, against good faith, creates a significant imbalance does not bind the consumer; exclusions of liability for death or personal injury, and terms that hinder the consumer's right to go to court, are on the directive's list [3]. | Liability limited "to the extent the law allows", never for death, injury, intent or gross negligence; no forced arbitration. |
| **UK** | The Consumer Rights Act's fairness and transparency rules apply to digital content **even when it is free**; terms that exclude liability for death or injury from negligence are void; liability for damage the content causes to a device can be limited only fairly [4]. | The same as the EU row; plain wording (transparency). |
| **Australia** | The consumer guarantees cover purchases **by businesses** under A$100,000, and cannot be excluded; a term that tries is void (for business-type services, the remedy may be limited to supplying the service again) [5]. | The "rights you cannot lose" line covers it; avoid any "no guarantees at all" wording. |
| **New Zealand** | The Consumer Guarantees Act can be excluded **only** for business purposes and in writing; the Fair Trading Act's unfair-terms rules apply to standard form consumer and small trade contracts [6]. | Founders mostly act for business: a written "business purposes" clause is allowed, but keep the terms fair. |
| **Canada** | Under PIPEDA, consent must be meaningful: what is collected, who gets it, why, and the risks, shown prominently; express consent where the use is outside reasonable expectations [7]. | The questionnaire's consent (Research 8, question 1) and the privacy policy carry this; the Terms point to them. |
| **US** | No single federal rule on accepting terms; the FTC expects material terms to be clear and conspicuous and close to where the user acts, and courts most often enforce "click to agree" (clickwrap) [8]. | Accept the Terms with a tick or button on first use, not only by browsing. |
| **Greece** | Greek law governs and Greek courts settle disputes, but an EU consumer may still sue, and be sued, in their own country's courts [1]. | Keep "without affecting your rights" next to the courts clause. |

## 2. Other apps' terms

Read on 2026-11-27. LivePlan's terms refused automated reading (HTTP 403), Upmetrics' page was not found, Enloop is retired; IdeaBuddy (updated 30 June 2025) and ProjectionHub were read [9][10].

| Clause | IdeaBuddy | ProjectionHub | Tiles (draft) |
|---|---|---|---|
| Law and courts | Serbian law, Belgrade courts, no arbitration | Indiana law and courts, loser pays | Greek law and courts, own-country rights kept |
| Your content | the company claims no ownership; uses it to run the service | the user owns it, but grants a broad, sublicensable licence | yours, on your device; we have no access |
| Copying and reverse engineering | scraping, resale and harmful code banned | copying banned without permission | copying, reverse engineering, resale, redistribution banned, except where the law allows |
| Not professional advice | only for AI output | none in plain words | yes, in plain words |
| Warranty and liability | "as is"; liability capped at 12 months' fees | "as is"; a broad release | "as it is"; to the extent the law allows |
| Minimum age | 18 (minors with a guardian) | 18 | (to add: 18) |
| Feedback | becomes the company's property, worldwide and perpetual | none | (to add: a licence to use it to improve Tiles) |
| Acceptance | clickwrap ("I Agree", "Start my free trial") | "must agree"; changes by continued use | (to add: tick on first use) |

**What is common practice:** the home country's law and courts; "as is" with no warranty; 18 and over; acceptance by a click; the right to change the terms. **Where Tiles goes further:** the content never leaves the device, so the Terms can promise no access at all; the "not professional advice" clause is in plain words, which the two others lack.

## 3. Changes to the draft Terms

1. **Who may use it:** 18 or over (or the age of full legal capacity where higher), using it to plan a business.
2. **Accepting:** a short first-use message, the app's confirmation, saying that by pressing "I agree" the founder confirms being 18 or over and agrees to the Terms of Use and the Privacy Policy (a press on a clearly labelled button is a click agreement), shown once per device, and again when the Terms change in an important way.
3. **The Beta questionnaire's answers (feedback):** "You give us permission to use your answers and suggestions to improve Tiles. We do not publish anything that identifies you." Less than IdeaBuddy's full assignment, and enough.
4. **Liability:** "To the extent the law allows, North Stardust is not liable for indirect losses, or for decisions made using Tiles' documents. Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else the law does not allow us to limit."
5. **Ending:** "You may stop using Tiles at any time; your data stays on your device until you remove it. We may end the Beta, and we will say so in the app first."
6. **Courts:** "...the courts of Greece, although you may also bring a claim in the courts of the country where you live."

## 4. Sources

1. EUR-Lex, [Regulation (EC) No 593/2008 (Rome I)](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A32008R0593); Court of Justice, [C-821/21](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:62021CJ0821)
2. EUR-Lex, [Directive (EU) 2019/770 on contracts for the supply of digital content](https://eur-lex.europa.eu/eli/dir/2019/770/oj/eng)
3. EUR-Lex, [Directive 93/13/EEC on unfair terms](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:31993L0013); [Commission guidance (2019)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:52019XC0927(01))
4. legislation.gov.uk, [Consumer Rights Act 2015](https://www.legislation.gov.uk/ukpga/2015/15/data.html) and [explanatory notes](https://www.legislation.gov.uk/ukpga/2015/15/notes/division/3/1/4); CMA, [Unfair contract terms guidance](https://assets.publishing.service.gov.uk/media/5a7f8b58ed915d74e33f716e/Unfair_Terms_Main_Guidance.pdf)
5. ACCC, [Consumer rights and guarantees (business)](https://www.accc.gov.au/business/treating-customers-fairly/consumers-rights-obligations); [Small business rights](https://www.accc.gov.au/business/small-business/small-business-toolkit/rights-and-responsibilities-of-your-small-business/small-business-rights-and-responsibilities)
6. NZ legislation, [Consumer Guarantees Act 1993, s 43](https://www.legislation.govt.nz/act/public/1993/0091/latest/DLM312859.html); Commerce Commission, [Unfair contract terms guidelines](https://www.comcom.govt.nz/__data/assets/pdf_file/0021/290190/Unfair-contract-terms-guidelines-August-2022.pdf)
7. Office of the Privacy Commissioner of Canada, [PIPEDA Principle 3, consent](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles/p_consent/)
8. FTC, [letter on the Sears consent order (2009)](https://www.ftc.gov/sites/default/files/documents/cases/2009/09/090909searsletteraustin.pdf); [policy on subscription dark patterns (2021)](https://www.ftc.gov/news-events/news/press-releases/2021/10/ftc-ramp-enforcement-against-illegal-dark-patterns-trick-or-trap-consumers-subscriptions)
9. IdeaBuddy, [Terms of Service](https://ideabuddy.com/terms-of-service/) (updated 30 June 2025)
10. ProjectionHub, [Terms of Use](https://www.projectionhub.com/term-of-use)

**How the sources were weighed:** the law from the official texts (EUR-Lex, legislation.gov.uk, legislation.govt.nz) and the regulators' guidance (CMA, ACCC, Commerce Commission, OPC, FTC); other apps' terms as found on their own sites, two of five readable. Greek national law beyond the EU rules was not researched: the lawyer's review covers it.
