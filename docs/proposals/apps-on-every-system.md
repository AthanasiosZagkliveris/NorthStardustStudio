# The app on every system: requirements and batches

Status: **proposal**, written 2026-11-27, updated 2026-11-27. Every requirement for the web app, the Android app and the iPhone app, grouped by the work they share, and the work split into batches in the owner's order of priority; nothing in it is built except the web manifest and its icons (Records 2, 5.15). Asked by the owner on 2026-11-27 (15:00 UTC+2): "read the Kinds of app and what each system requires, define what are the requirements for all of them, make a list, and group them. The priority is the Web app, then Android, and last the iPhone … if there is a way to combine workflows … After having a well-structured document, split the work to batches."

Related: Research 9 (the kinds of app and what each system requires; the sources), Records 2, section 5.15 (the decision: all three ways).

## Contents

1. [The aim and the order](#1-the-aim-and-the-order)
2. [The routes covered](#2-the-routes-covered)
3. [Every requirement, grouped](#3-every-requirement-grouped)
4. [The requirements by system](#4-the-requirements-by-system)
5. [Where the workflows combine](#5-where-the-workflows-combine)
6. [The batches](#6-the-batches)
7. [Decisions the owner makes](#7-decisions-the-owner-makes)
8. [To verify before building](#8-to-verify-before-building)

## 1. The aim and the order

- **Aim:** Tiles on every way a founder can get it: in a browser, installed from the browser, from Google Play, from the App Store, and as a desktop app.
- **Order (owner, 2026-11-27):** 1. the web app, 2. Android, 3. the iPhone. The desktop app (built today with Tauri) keeps its place and gets its signed installers last.
- **The rule that saves work:** one code base and one set of built files serve every route. Each route adds only a thin layer: a manifest, a store package or a native shell.

## 2. The routes covered

From Research 9, sections 2 and 3.

| Code | Route | System | Kind (Research 9) | Depends on |
|---|---|---|---|---|
| **W1** | The web app in a browser tab | every system | A | a host on https |
| **W2** | The installed web app (Install, Add to Home Screen, Add to Dock) | Android, iPhone, Windows, macOS, Linux | B | W1 |
| **A1** | Google Play, the web app packaged (Trusted Web Activity) | Android | C | W1, W2 |
| **A2** | Google Play, the Tauri app | Android | D | the built files, no host |
| **I1** | The iPhone's Home Screen web app | iPhone, iPad | B | W2 |
| **I2** | The App Store, the Tauri app | iPhone, iPad | D | a Mac |
| **M1** | The Microsoft Store, the web app packaged (PWABuilder) | Windows | C | W1, W2 |
| **D1** | The desktop installers, the Tauri app (signed, notarized) | Windows, macOS, Linux | D | built today, unsigned |

**Note on I1:** the iPhone is covered as soon as W2 works: a Home Screen web app keeps its data (Research 9, 3.1). So the iPhone is reached early through the web work, and only the App Store route (I2) waits for last.

## 3. Every requirement, grouped

Each requirement has a code, the routes it serves, and who does it: **C** Claude (code, docs, packages), **O** the owner (accounts, payments, devices, decisions), **C+O** both. "Built" marks what exists today.

### G1. The app itself (one code base, every route)

| Code | Requirement | Serves | Who |
|---|---|---|---|
| G1.1 | Phone and desktop layouts from 320px (AI 9, section 23); the phone in landscape (Records 2, 5.14) | all | C (built, landscape not built) |
| G1.2 | Touch: 44px targets, no hover look on tap | all | C (built) |
| G1.3 | WCAG 2.2 AA | all | C (V1 in Records 2) |
| G1.4 | Works with no connection once loaded (no call to a server for the interview) | all | C (true today; kept by a test) |
| G1.5 | One version number shown in the app and used by every package | all | C |
| G1.6 | Safe-area margins for notches and the home bar (`viewport-fit=cover`, built) | phones | C (built) |

### G2. The founder's data (every route)

| Code | Requirement | Serves | Who |
|---|---|---|---|
| G2.1 | Ask for persistent storage (`navigator.storage.persist()`) when an Organisation is first saved | W1, W2, A1, I1, M1 | C |
| G2.2 | Export and Import of an Organisation (built) | all | C (built) |
| G2.3 | A reminder to export, and where the data lives, said on the Organisations screen (the warning is built) | all | C |
| G2.4 | **Save a file the same way on every route:** one shared "save file" service. Today exports use a browser download link (`BusinessDocumentsView.tsx`, `ReviewManager.ts`, `Landing.tsx`); inside a Tauri phone app the service would use the system's save or share sheet | all; needed for A2, I2 | C |
| G2.5 | Open outside links the same way on every route (the desktop app uses `plugin-opener`; the web uses a new tab) | all | C (built for desktop) |

### G3. The web package (W1, W2, A1, I1, M1)

| Code | Requirement | Serves | Who |
|---|---|---|---|
| G3.1 | Web manifest: name, short name, id, start URL, standalone, colours, 192 and 512px icons | W2, A1, I1, M1 | C (built on `feat/installable-app-2026-11-27`, not merged) |
| G3.2 | Service worker: keeps the app's files for use offline, and tells the founder when a new version is ready (one press to reload) | W2, A1, I1, M1 | C |
| G3.3 | Apple's Home Screen details: the 180px touch icon (built), the app's title, the status bar colour | I1 | C |
| G3.4 | An "Install the app" hint for the browsers that offer it, and the Share › Add to Home Screen steps on an iPhone | W2, I1 | C |
| G3.5 | An installability check in the build (the manifest and icons tested) | W2 | C |

### G4. The host (W1 and everything built on it)

| Code | Requirement | Serves | Who |
|---|---|---|---|
| G4.1 | A host on https and a domain name | W1, W2, A1, I1, M1 | O decides, C sets up |
| G4.2 | One command that builds and publishes the site (after the checks pass) | W1 and up | C |
| G4.3 | `/.well-known/assetlinks.json` with the Android app's signing fingerprint | A1 | C |
| G4.4 | The privacy policy page and a contact page on the site | every store; W1 | C writes, O approves |

### G5. The legal and store kit (every store: A1, A2, I2, M1, D1)

Written once, used by every store.

| Code | Requirement | Serves | Who |
|---|---|---|---|
| G5.1 | Privacy policy (G4.4): no account, data on the device, no tracking, what Export does | all stores | C writes, O approves |
| G5.2 | The stores' privacy forms: Google Play's Data safety, Apple's App Privacy details, Microsoft's privacy questions (all answered from G5.1: no data collected) | A1, A2, I2, M1 | C drafts, O submits |
| G5.3 | Store text: name, short and long description, keywords, category (Business or Productivity), age rating | all stores | C drafts, O approves |
| G5.4 | Screenshots for phone, tablet and desktop sizes, made from the example Organisations (one set, cut per store) | all stores | C |
| G5.5 | Store icons and the Play feature graphic, from the approved logo (`npm run icons`) | all stores | C |
| G5.6 | Support contact and a support page | all stores | O gives the address |

### G6. Accounts and identity (the owner's)

| Code | Requirement | Serves | Who |
|---|---|---|---|
| G6.1 | Personal or organisation accounts (an organisation needs a D-U-N-S number at Google and Apple; a sole proprietorship enrols at Apple as an individual) | all stores | O |
| G6.2 | Google Play Console, $25 once; Android developer verification | A1, A2 | O |
| G6.3 | Apple Developer Program, 99 USD a year | I2, D1 (macOS notarization) | O |
| G6.4 | Microsoft Store developer account, free, identity checked | M1 | O |

### G7. The Tauri phone shell (A2, I2)

| Code | Requirement | Serves | Who |
|---|---|---|---|
| G7.1 | Mobile entry point and the shared library Tauri 2 needs for phones (`tauri android init`, `tauri ios init`) | A2, I2 | C |
| G7.2 | The file-saving service of G2.4 wired to the phone's save or share sheet | A2, I2 | C |
| G7.3 | Android tools on the owner's PC: Android Studio, SDK, NDK, Java, the Rust targets | A2 | O installs, C guides |
| G7.4 | Target API level 36 now (37 from August 2027) | A2 | C |
| G7.5 | A Mac with full Xcode, CocoaPods, the iOS Rust targets | I2 | O |
| G7.6 | Signing: an Android upload key; Apple's distribution certificate and provisioning profile | A2, I2 | C+O |
| G7.7 | What Apple's review looks for beyond a website (Guideline 4.2): works offline with its files inside, saves files to the phone, shown in the review notes | I2 | C+O |

### G8. Testing and release

| Code | Requirement | Serves | Who |
|---|---|---|---|
| G8.1 | Test on the owner's phone from the PC (`npm run dev:network`, built) | all | O (built) |
| G8.2 | Google Play closed test: at least 12 testers opted in for 14 days in a row (new personal account) | A1, A2 | O invites, C prepares |
| G8.3 | Apple TestFlight for the iPhone Beta | I2 | O invites, C prepares |
| G8.4 | The Beta questionnaire (Research 8) | Beta | C |
| G8.5 | Release notes for each version, the same text in every store | all stores | C |

### G9. The desktop installers (D1)

| Code | Requirement | Serves | Who |
|---|---|---|---|
| G9.1 | Windows code signing (a certificate, or Azure Artifact Signing) | D1 | O buys, C sets up |
| G9.2 | macOS signing and notarization (needs G6.3) | D1 | C+O |
| G9.3 | Linux packages (no signing needed) | D1 | C |

## 4. The requirements by system

Which groups each system needs, in the owner's order.

| System and route | G1 app | G2 data | G3 web package | G4 host | G5 store kit | G6 accounts | G7 phone shell | G8 testing | G9 desktop |
|---|---|---|---|---|---|---|---|---|---|
| **1. Web** (W1, W2; also Windows, macOS, Linux browsers) | ● | ● | ● | ● | privacy page only | none | none | G8.1, G8.4 | none |
| **2. Android**, packaged web app (A1) | ● | ● | ● | ● + assetlinks | ● | Google | none | G8.2 | none |
| **2. Android**, Tauri (A2) | ● | ● | none | none | ● | Google | Android parts | G8.2 | none |
| **3. iPhone**, Home Screen (I1) | ● | ● | ● + Apple details | ● | none | none | none | G8.1 | none |
| **3. iPhone**, App Store (I2) | ● | ● | none | none | ● | Apple | iOS parts | G8.3 | none |
| Windows Store (M1, optional) | ● | ● | ● | ● | ● | Microsoft | none | none | none |
| Desktop installers (D1) | ● | ● | none | none | partly | Apple for macOS | none | none | ● |

## 5. Where the workflows combine

Seven places where one piece of work serves several routes.

1. **The web package serves five routes.** G3 (manifest, service worker) is the web app, the installed app on every system, the iPhone's Home Screen app, the Android Play package (A1) and the Microsoft Store package (M1). Build it once in Batch 2.
2. **The iPhone comes early, for free.** The Home Screen web app (I1) is ready when the web app is: the owner's third priority is partly met in the first.
3. **Android's packaged app is a wrapper of the hosted web app.** A1 needs only Bubblewrap or PWABuilder and one file on the host (G4.3); every web update reaches it without a new store release.
4. **The Beta testers are the Play testers.** Google's 12 testers for 14 days (G8.2) are the Beta founders of Research 8; inviting them to the closed test runs both at once. TestFlight (G8.3) does the same for the iPhone later.
5. **One store kit for every store.** The privacy policy, the store texts, the screenshots and the icons (G5) are written once; each store takes its own cut.
6. **Tauri Android prepares the iPhone app.** G7.1 and G7.2 (the phone shell and the file-saving service) are the same for Android and iOS: building A2 first leaves I2 with the Mac, the signing and the review.
7. **One Apple account covers the iPhone and macOS.** G6.3 pays for the App Store (I2) and the notarized macOS installer (D1).

**One choice to make (decision 2 in section 7):** Android by the packaged web app (A1, fast, needs the host) or by Tauri (A2, works with no host, prepares the iPhone). The batches below do **A1 first** (it rides on the web work) and **A2 together with the iPhone** (they share G7), so both are covered.

## 6. The batches

In order. Each batch follows the owner's approach: in the project folder first, docs before code, checked in the running app before any push; docs-only parts merge once green, code waits for the owner's yes.

| Batch | Name | Contents | Routes it opens | The owner provides | Size |
|---|---|---|---|---|---|
| **0** | Decisions | Section 7, questions 1 to 6 | none | answers | small |
| **1** | Docs | Research 9 and this proposal into `docs/`; Records 2, 5.15 pointing here; the log | none | review | small |
| **2** | Web package | G3.1 (merge the built manifest), G3.2 service worker and update notice, G3.3 Apple details, G3.4 install hint, G3.5 check; G2.1 persistent storage, G2.3 export reminder; G1.5 version number; tested on the owner's phone (G8.1) | W2 and I1 on the dev server | phone tests | medium |
| **3** | Host and launch of the web app | G4.1 host and domain, G4.2 build-and-publish command, G4.4 and G5.1 privacy policy and contact page | **W1, W2, I1 live** | the host account, the domain | medium |
| **4** | Store kit | G5.2 privacy forms, G5.3 texts, G5.4 screenshots, G5.5 store icons, G5.6 support, G8.5 release notes | none (ready for every store) | approval, support address | medium |
| **5** | Android on Google Play (packaged) | G6.2 account; A1 package (Bubblewrap or PWABuilder); G4.3 assetlinks; G8.2 closed test with the Beta founders and the Beta questionnaire (G8.4) | **A1** | the Play account ($25), 12 testers | medium, plus 14 days of testing |
| **6** | Microsoft Store (optional) | G6.4 account; M1 package with PWABuilder | M1 | the Microsoft account | small |
| **7** | Tauri phone shell | G2.4 and G7.2 the shared file-saving service; G2.5 links; G7.1 phone entry point; G7.3 Android tools; G7.4 target API; an Android build tested on the owner's phone; optionally released as A2 | A2 | installs Android Studio | large |
| **8** | iPhone on the App Store | G6.3 Apple account; G7.5 the Mac; G7.6 signing; G7.7 review notes; G8.3 TestFlight | **I2** | the Apple account (99 USD a year), a Mac | large |
| **9** | Desktop installers | G9.1 Windows signing, G9.2 macOS notarization (uses Batch 8's account), G9.3 Linux packages | D1 | a code-signing certificate | medium |
| **Always** | Layout and accessibility | G1.1 the phone in landscape (Records 2, 5.14), G1.3 WCAG 2.2 AA; they run beside every batch | all | reviews | ongoing |

**Stages:** Batches 0 to 5 are the **Beta** (the web app live, the iPhone through the Home Screen, Android on Google Play in closed test). Batches 6 to 9 are **Version 1** (the App Store, the Tauri Android app, the signed desktop installers).

## 7. Decisions the owner makes

1. **The host and the domain** for the web app (Batch 3).
2. **Android route first:** the packaged web app (A1, as in the batches) or Tauri (A2).
3. **Accounts as a person or as a company** (a company needs a D-U-N-S number, up to about 30 days).
4. **A Mac** for the iPhone build: own one, borrow one, or a cloud Mac.
5. **The Microsoft Store** (Batch 6): wanted or not.
6. **The app's store name:** "Tiles", "Tiles by North Stardust", or another.

## 8. To verify before building

- How a file download behaves inside a Tauri phone app (G2.4): Research 9 did not cover it; check the Tauri dialog, file-system and share plugins before Batch 7.
- How Safari treats `persist()` (Research 9, 3.1: the sources disagree).
- Whether a service worker in the Tauri desktop app needs to be turned off (the files are already local).
- Google's developer verification steps for a personal account (Research 9, 3.2).
- The current Play and App Store fees and dates, on the day each account is opened.
