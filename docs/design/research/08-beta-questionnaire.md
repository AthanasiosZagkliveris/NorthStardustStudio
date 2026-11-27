# 8. Beta questionnaire: what the app asks its Beta founders

Status: **proposal**, written 2026-11-21, updated 2026-11-27 (section 8: the base to build, Batch 4a). The questions North Stardust would ask its Beta founders about the app, in sections, with the choices of each; nothing built and nothing collected. Asked by the owner on 2026-11-21 00:56 UTC+2: "Create a questionnaire proposal for the app to the users as part of the Beta version".

**Who answers:** Beta founders (early-stage, solo or a small team) after they have used the app for at least one System, and again after they have exported a document. **How long:** about 10 minutes; every question optional except the consent. **How:** a short form linked from the Workbook (a later build), or a hosted form; answers are anonymous unless the person chooses to leave an email. **Wording:** UK English, affirmative, one question at a time, choices first and a short text box where a choice cannot say it.

## 0. Consent

1. I agree that my answers are used to improve North Stardust. (tick, required)
2. You may contact me about my answers. (tick; then an email box)

## 1. About you and your business

3. Where is your business today? (one choice: An idea / Planning to open / Opened in the last 12 months / Open for 1 to 3 years / Open for longer)
4. How many people run it, you included? (one choice: Just me / 2 / 3 to 5 / 6 or more)
5. Who does it sell to? (ticks: People / Businesses / Public bodies)
6. In which country is it registered, or will it be? (dropdown)
7. Have you written a business plan before? (one choice: Never / Once / Several times)

## 2. Getting started

8. How easy was it to start your first Organisation? (1 Very hard – 5 Very easy)
9. What did you expect the app to do for you? (short text)
10. Which System did you start with? (one choice: Identity / Brand / Business / Strategy)

## 3. The Systems (asked for each System the person used)

11. How clear were the questions on this System? (1 Unclear – 5 Very clear)
12. How often did a question already know part of your answer from earlier pages? (one choice: Never / Sometimes / Often / Almost always)
13. Which question took you longest, and why? (short text)
14. Which question would you add? (short text)

## 4. The documents (asked once a document was opened)

15. Which documents did you open? (ticks: Business Plan / Business Model Canvas / Financial Forecast / Funding Request / Financial Plan)
16. How close was the Business Plan to one you could send to a bank or investor? (1 Far – 5 Ready to send)
17. Did any figure surprise you? Which one? (short text)
18. Which format did you export? (ticks: PDF / Markdown / CSV / None yet)

## 5. Using the app (System Usability Scale)

The ten statements of the System Usability Scale (Brooke, 1996), each 1 Strongly disagree – 5 Strongly agree, in their published order and wording (adapted only by "the app" for "this system"). Scored as published: a score out of 100.

## 6. Reading and access

19. Which Appearance did you use most? (one choice: Light / Sepia / Dark / Auto)
20. Did you use the keyboard, a screen reader or zoom to move around the app? (ticks: Keyboard only / Screen reader / Zoom above 150% / None of these)
21. Was anything hard to read, reach or press? (short text)

## 7. What comes next (the future features)

22. Which of these would help you most? Choose up to three. (ticks, 3 max: An AI assistant that suggests answers and checks the plan / Working on one plan with your team / Answering by voice / The app in your language and country / Saving to the cloud and on more devices / Templates for your industry / A pitch deck from your answers / A link to your accounting software)
23. What would an AI assistant need to do for you to trust its suggestions? (short text)
24. Would you pay for North Stardust? (one choice: Yes, monthly / Yes, once / Only for some features / No)
25. How likely are you to recommend North Stardust to another founder? (0–10)
26. Anything else you would like to tell us? (short text)

## 8. The base, as it will be built (Batch 4a; owner, 2026-11-27 21:45 UTC+2: "Beta questionnaire will change, but you can start and build a base")

The questions will change; the base makes that cheap: **every question is one entry in one list**, and the screen, the checks and the sending are built from the list.

### 8.1 The list (`src/data/betaQuestionnaire.ts`)

- A **version** (sent with the answers, so a changed questionnaire never mixes with an older one) and **sections** in order, each with its questions.
- A question: its **number** (1 to 26 as above, permanent, as the question codes), its **words**, its **kind** and, where it has them, its **options**:
  - `consent`: a tick (question 1 required; question 2 optional, with its email box);
  - `single`: one choice (the app's `FittingRadioChoice`);
  - `multi`: ticks, with an optional most (`max: 3` for question 22) (`TickField`);
  - `scale`: 1 to 5, or 0 to 10 (`RatingScale`), its two ends named;
  - `sus`: the ten System Usability Scale statements, one `RatingScaleGroup`;
  - `text`: a short answer (`TextField`).
- **When** it is asked: always, for each System the founder used (questions 11 to 14), or once a document was opened (questions 15 to 18). The founder's own Organisations answer these conditions; nothing is asked twice.
- **Required:** every question (owner, 2026-11-27 20:06 UTC+2: "every question should be answered"), **except** question 2, the permission to contact and its email: consent to contact must be freely given (GDPR, Research 11, section 1), so it stays a choice.

### 8.2 Where it opens

- The **Workbook's Business Documents and Financial Documents** show every document as today, with their Export button as today; until the questionnaire is sent, a format chosen in Export (PDF, Markdown, CSV) opens the questionnaire. Organisation **Export** on the Organisations screen stays open (owner, 2026-11-27).
- The questionnaire is **a section of the Workbook**, "Beta Questionnaire", after the Financial Documents (built so on 2026-11-27: the Workbook already is the app's dialog with its carousel arrows and its tab of bullets, so the questionnaire needs no new layer): its sections as the Handbook's parts, each question its words over the app's own control, a question still to give marked as a card's missing cell is (`components/workbook/BetaQuestionnaire.tsx`); answers save as they are given, so it can be left and resumed.
- Only in the **Foundation edition during the Beta**: `data/edition.ts` `BETA_QUESTIONNAIRE_ON`, on with `VITE_BETA=on` beside `VITE_EDITION=foundation` in the Cloudflare Pages project, set once the receiver is ready (8.4, step 4); left off, nothing is locked, and it is off for Version 1. The owner's full app never locks.

### 8.3 Sending, offline first

- **Send** is pressed once every required answer is given. Online: the answers go to `POST /api/beta` on app.northstardust.studio (a Cloudflare Pages Function in the repository's `functions/`), checked by Cloudflare Turnstile, kept in a D1 database. The reply's receipt unlocks the downloads **on this device**, kept with the questionnaire's version.
- Offline: "Saved. It will be sent when you are back online"; the app sends it on its own when the connection returns (the `online` event, and at the next start), then unlocks.
- Nothing else leaves the device: not the Organisations, not the documents. The privacy policy's Tiles section is updated before the Beta opens: what is sent, why, how long it is kept, the right to delete it.

### 8.4 What the owner sets up in Cloudflare (once, about 10 minutes, when the receiver is built)

1. **Storage & databases › D1 › Create**: `tiles-beta`, in the EU location.
2. **Turnstile › Add widget** for app.northstardust.studio: its site key (public, in the app) and secret key (a secret of the Pages project).
3. **Workers & Pages › tiles › Settings › Bindings**: the D1 database as `BETA_DB`; **Variables and Secrets**: `TURNSTILE_SECRET` (the secret key) and `VITE_TURNSTILE_SITE_KEY` (the site key), always the two together.
4. **Variables and Secrets**: `VITE_BETA` = `on` (Production), then a new deployment: the downloads wait for the questionnaire from then on.

Built so far (2026-11-27): the list, the screen, the lock, the waiting and sending on the device (`services/BetaQuestionnaireService.ts`) and the receiver (`functions/api/beta.js`: one row per questionnaire in a table `answers`, made on its first use; the email kept only with its permission; a Turnstile token required once `TURNSTILE_SECRET` is set). The human check in the app (`services/TurnstileService.ts`): a fresh Turnstile token asked for as the answers go (a token lasts five minutes, so one never waits offline), the widget out of sight unless Cloudflare needs a press; `challenges.cloudflare.com` allowed in the security policy (`public/_headers`). Still to do: the privacy policy's update.

### 8.5 Build order

1. The list and its tests (every id unique; every required question has its kind's answer shape).
2. The screen from the standard parts; the answers saved on the device.
3. The lock on the download buttons, and the unlock.
4. The receiver, the offline queue, the privacy update; then the owner's Cloudflare steps and a live test.

## How the answers are used

- The SUS score and Q25 (Net Promoter, 0–10) are tracked per Beta round.
- Q11–Q14 point to the questions to change (Questions 6, the register; Questions 3, the question guide).
- Q22–Q23 rank the future features (the app guide and future features document).
- Text answers are read in full; nothing is published with a name.

## References

Brooke, J. (1996) 'SUS: a "quick and dirty" usability scale', in Jordan, P.W. et al. (eds) *Usability Evaluation in Industry*. London: Taylor & Francis, pp. 189–194.

Reichheld, F.F. (2003) 'The one number you need to grow', *Harvard Business Review*, 81(12), pp. 46–54.

W3C (2023) *Web Content Accessibility Guidelines (WCAG) 2.2*. Available at: https://www.w3.org/TR/WCAG22/ (Accessed: 21 November 2026).

Information Commissioner's Office (n.d.) *Consent*. Available at: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/consent/ (Accessed: 21 November 2026).
