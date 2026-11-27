# 9. Kinds of app and what each system requires

Status: **research**, written 2026-11-27, updated 2026-11-27. The kinds of app that exist, what each operating system and store requires of an app, and which of them fit Tiles for the Beta and Version 1. Asked by the owner on 2026-11-27 (14:43 UTC+2): "Understand the app's needs and purpose … Do online research about what kind of apps exists, what they require as an app, per system … Develop a well structured and detailed document."

Related: Records 2, section 5.15 (the decision of 2026-11-27, "All!": an installable web app, store apps through Tauri, the desktop app); Guide 2 (what the app is); Guide 3, section 6 (the local-first roadmap).

## Contents

1. [What Tiles needs from an app](#1-what-tiles-needs-from-an-app)
2. [The kinds of app](#2-the-kinds-of-app)
3. [What each system requires](#3-what-each-system-requires)
4. [The kinds of app matched to Tiles](#4-the-kinds-of-app-matched-to-tiles)
5. [A route by stage (proposal)](#5-a-route-by-stage-proposal)
6. [What the owner has to provide](#6-what-the-owner-has-to-provide)
7. [Open questions for the owner](#7-open-questions-for-the-owner)
8. [How the sources were weighed](#8-how-the-sources-were-weighed)
9. [Sources](#9-sources)

## 1. What Tiles needs from an app

What the app is and does, read from Guide 2, Guide 3, Records 2 and the code on 2026-11-27.

| Need | What the app does today | What it means for the kind of app |
|---|---|---|
| **Purpose** | Interviews an early-stage founder (alone or in a small team) and writes the business documents from the answers: four Systems (Identity, Brand, Business, Strategy) and the Workbook (Business Plan, Business Model Canvas, Financial Forecast, Funding Request, Financial Plan, Review). | Long sessions of reading and typing, tables and figures: the screen size matters more than phone features (camera, sensors, location). |
| **Users** | Early-stage founders, one person to a small team, often freelancers at home; English only; six English-speaking countries. | They use a laptop for the long work and a phone to look things up or answer a few questions. One app on every device fits them better than a store app on one. |
| **Data** | Every answer stays on the founder's device, in the browser's storage (IndexedDB and localStorage: `IndexedDbStorage.ts`, `LocalOrganizationStore.ts`). No account, no server. Export and Import move an Organisation as a file. | Each install keeps its own copy: a phone and a laptop do not share answers until there is sync (Guide 3, section 2). Storage that the system may clear is the main risk (section 3.1). |
| **Exports** | PDF and CSV of the documents. | Every kind of app can save a file; on a phone the file goes to Downloads or the share sheet. |
| **Platform features used** | One: opening a link outside the app (`@tauri-apps/plugin-opener`, the desktop app only). Nothing else of the system. | The app is a web app at heart; it needs no native feature. This matters for Apple's review (section 3.3). |
| **Screens** | Desktop and phone layouts from 320px wide (AI 9, section 23; Records 2, 5.14); WCAG 2.2 AA. | The same layout serves every kind of app below. |
| **Later** (Guide 3) | Accounts and encrypted sync, team mode, an optional AI assistant, more countries. | Sync needs a server whatever the kind of app; a store app with accounts must let the user delete the account in the app (Apple, section 3.3). |

**In one line:** Tiles is a local-first web app with no native needs; any kind of app that shows a modern web page can carry it, and the choice is about reach, storage safety, cost and review rules.

## 2. The kinds of app

Six kinds exist, from the web page to fully native code. All six can show the same screens; they differ in where they are installed from, what they cost, and how much of the existing code they keep.

| Kind | What it is | Installed from | Keeps Tiles' code | Examples of the tools |
|---|---|---|---|---|
| **A. Web app** | A site opened in a browser tab. | Nowhere: a link. | All of it. | What runs on localhost:1420 today. |
| **B. Installable web app (PWA)** | The same site with a web manifest (and usually a service worker): the browser installs it with its own icon and window, without the address bar. | The browser's Install or Add to Home Screen. | All of it, plus a manifest and a service worker. | Chrome, Edge, Safari (Home Screen and Add to Dock), Samsung Internet; Firefox on Windows only (section 3.4). |
| **C. Store-packaged web app** | Kind B wrapped in a thin store package that opens the live site. | Google Play (a Trusted Web Activity), the Microsoft Store. Apple's App Store does not take web apps. | All of it; the site stays the app. | Bubblewrap (Google), PWABuilder (Microsoft). |
| **D. Web view wrapper (hybrid)** | The app's web files shipped inside a native shell that shows them in the system's web view; the shell can call native features. | The stores, or an installer file. | All of it; the files ship inside the app. | **Tauri** (Tiles' desktop app today; Android and iOS since Tauri 2), Capacitor, Electron (desktop only). |
| **E. Cross-platform native** | One code base drawn with native controls or its own engine. | The stores. | Little: the screens are rewritten. | React Native, Flutter. |
| **F. Fully native** | Swift for Apple, Kotlin for Android, C#/WinUI for Windows, one code base each. | The stores. | None. | Xcode, Android Studio, Visual Studio. |

Kinds E and F would mean writing the app again for each system; Tiles needs no native feature that would pay for that, so they are left out from here on.

## 3. What each system requires

### 3.1 The web (every system, kinds A and B)

- **https** is required for an installable app; localhost counts as secure for development [1][2].
- **Chrome's install criteria:** a web manifest with `name` or `short_name`, a 192px and a 512px icon, `start_url`, `display` of `standalone`, `fullscreen`, `minimal-ui` or `window-controls-overlay`, and `prefer_related_applications` not true; the user has clicked the page and stayed 30 seconds before Chrome offers its own prompt [1]. A user can still install from the menu without these [1].
- **Storage:** by default a site's data is "best effort": the browser may clear it when space runs low. `navigator.storage.persist()` asks for persistent storage; once granted, data is cleared only by the user. Chromium decides by heuristics, Firefox asks the user; it is best asked when the user saves something important [5][6].
- **Safari's seven-day rule:** in the Safari browser, script-written storage (IndexedDB, localStorage, service-worker caches) is deleted after seven days of Safari use without a visit to the site. **A web app added to the Home Screen is exempt** [7]. For Tiles on an iPhone, Home Screen use is therefore the safe one, and the tab in Safari is not.

### 3.2 Android

| Route | Requires |
|---|---|
| **Installable web app (B)** | Chrome's criteria (3.1). Installed from Chrome's menu; no account, no fee, no review. |
| **Google Play, store-packaged (C)** | A Trusted Web Activity built with Bubblewrap (an `.aab` file) or PWABuilder; the site must publish `/.well-known/assetlinks.json` with the app's signing fingerprint, or Android shows the site as a browser tab with an address bar [8]. Then every Play rule below. |
| **Google Play, Tauri (D)** | Android Studio with the SDK Platform, Platform-Tools, NDK, Build-Tools and Command-line Tools; `JAVA_HOME`, `ANDROID_HOME`, `NDK_HOME`; the Android Rust targets; then `tauri android init` and `tauri android build` [9]. The app runs in the device's Android System WebView (Chromium, updated by the user's device) [10]. |

**Google Play's rules** (both store routes):

- A developer account: **$25 once** for full distribution; a free limited tier reaches up to 20 devices [11]. An organisation account needs a **D-U-N-S number** (free from Dun & Bradstreet, up to about 30 days to get) with a matching legal name and address [11].
- **New personal accounts:** a closed test with **at least 12 testers opted in for 14 days in a row** before production can be requested; review of the request usually takes up to seven days [12].
- **Target API level:** from 31 August 2026 new apps and updates must target **Android 16 (API 36)** (an extension to 1 November 2026 on request); from August 2027, API 37 [13].
- **Developer verification:** from 30 September 2026 in Brazil, Indonesia, Singapore and Thailand, and worldwide in 2027, apps on certified Android devices must come from a verified developer, Play apps registered in Play Console [13].
- A privacy policy and the Data safety form in Play Console (Play policy [13]).

### 3.3 iPhone and iPad

| Route | Requires |
|---|---|
| **Home Screen web app (B)** | Safari (or, since iOS 16.4, another browser's Share menu) › Add to Home Screen. No account, no fee, no review. Since iOS 16.4 a Home Screen web app can ask for Web Push and show a badge, and the manifest `id` names it [14]. Storage is exempt from the seven-day rule (3.1) [7]. In the EU, Apple announced the removal of Home Screen web apps for the Digital Markets Act and then kept them; they returned with iOS 17.4 [15]. |
| **App Store, Tauri (D)** | **A Mac with full Xcode** (iOS builds are only possible on macOS), the iOS Rust targets, CocoaPods; `tauri ios init` [9]; an Apple Distribution certificate and an App Store Connect provisioning profile, archived and sent through Xcode [16]. |
| **App Store, store-packaged (C)** | Not possible: Apple's App Store does not accept or distribute web apps [17]. |

**Apple's rules** (the App Store route):

- The **Apple Developer Program, 99 USD a year** [18]. A sole proprietorship enrols **as an individual** (no D-U-N-S); a company needs a D-U-N-S number and must be a legal entity [18].
- **Guideline 4.2, Minimum Functionality:** an app must go beyond a repackaged website [17]. Developers whose web-view apps were rejected report reviewers asking for features a browser cannot do (forum reports, not policy) [17]. Tiles ships its files inside the app and works offline, which is more than a website clipping, but **the risk of a 4.2 rejection is real** and is the main uncertainty of this route.
- **Account deletion (5.1.1(v)):** an app that lets people create an account must let them start deleting it, with their data, inside the app [19]. It applies to Tiles only once accounts exist.
- Privacy details in App Store Connect and a privacy policy (App Store rules; not researched further here).

### 3.4 Windows

| Route | Requires |
|---|---|
| **Installable web app (B)** | Chrome or Edge install it as an app with its own window, taskbar icon and Start menu entry. Firefox, since version 143, makes "web apps" on Windows only; they still look like a browser window [20]. |
| **Microsoft Store, store-packaged (C)** | PWABuilder packages the live site for the Store with no code change, after an app name is reserved in Partner Center [21]. |
| **Installer or Microsoft Store, Tauri (D)** | The app runs in WebView2 (Chromium, updated by Windows); on systems before Windows 11 the Tauri installer makes sure WebView2 is installed [10]. **Code signing** is required for the Store and to avoid SmartScreen warnings; Windows 11's Smart App Control blocks unknown unsigned apps. Tauri supports an OV certificate, Azure Key Vault or Azure Artifact Signing [22]. |

- **The Microsoft Store account is free** for individual developers (a personal Microsoft account, identity checked with a government ID and a selfie) and, since May 2026, for companies too [21][23].

### 3.5 macOS

| Route | Requires |
|---|---|
| **Installable web app (B)** | Chrome or Edge install it as an app; Safari 17 and later on macOS Sonoma offer **Add to Dock** for any site, with or without a manifest [1]. |
| **Direct download, Tauri (D)** | Signing with a Developer ID and **notarization** by Apple (through the App Store Connect API or an Apple ID with an app-specific password); a free Apple account cannot notarize, so the app shows as unverified [24]. Needs the paid Apple Developer Program (3.3). |
| **Mac App Store, Tauri (D)** | The **App Sandbox** entitlement, a "Mac App Store Connect" provisioning profile, a PKG signed with a Mac Installer Distribution certificate, built with a separate `tauri.appstore.conf.json` [16]. The app runs in WKWebView [10]. |

### 3.6 Linux

- **Installable web app (B):** Chrome and Edge install web apps on Linux; Firefox's web apps are Windows only [20].
- **Tauri (D):** Debian package, RPM, AppImage, Snap, Flatpak or the AUR; signing is not required (AppImage can carry a GPG signature that the user checks by hand) [22]. The app runs in webkit2gtk, whose version depends on the distribution [10].

### 3.7 Summary: what each system asks

| System | Installable web app (B) | Store-packaged web app (C) | Tauri app (D) | Account and fee for the store | Review |
|---|---|---|---|---|---|
| Android | Chrome's menu | Google Play (TWA) | Google Play or an APK | Google Play, $25 once; 12 testers for 14 days (new personal account) | Yes (Play) |
| iPhone, iPad | Safari, Add to Home Screen | **Not possible** | App Store | Apple, 99 USD a year | Yes, Guideline 4.2 risk |
| Windows | Chrome, Edge (Firefox partly) | Microsoft Store (PWABuilder) | Installer or Microsoft Store | Microsoft Store, free | Yes (Store); signing for SmartScreen |
| macOS | Chrome, Edge, Safari Add to Dock | No | Download (notarized) or Mac App Store | Apple, 99 USD a year | Notarization; App Review for the store |
| Linux | Chrome, Edge | No | Packages, no signing needed | None | None |

## 4. The kinds of app matched to Tiles

| Kind | Fit for Tiles | For | Against |
|---|---|---|---|
| **B. Installable web app** | **Strong** | Every system from one address; no fee, no review; an update reaches everyone at once; the manifest and icons are built (Records 2, 5.15); on an iPhone the Home Screen app keeps its data (3.1). | Needs https hosting; data can be cleared unless persistent storage is granted (ask with `persist()` and keep Export); no listing in the stores; Chrome on Android installs only from https. |
| **C. Store-packaged web app** | Good for Android and Windows | A store listing with little extra work; the site stays the one code base. | No App Store; Play's rules apply in full (3.2); the Android package depends on the hosted site and `assetlinks.json`. |
| **D. Tauri app** | Good for desktop (built today) and possible for phones | The files ship inside the app: it works with no host and no connection; one code base for five systems; store listings everywhere. | Android Studio, a Mac for iOS, signing on Windows and macOS, the developer fees; Apple's 4.2 risk; every update goes through each store's review. |
| **E, F** | Weak | Native look. | The app written again; nothing in Tiles needs it. |

**Storage, whatever the kind:** each install keeps its own Organisations. Until sync exists (Guide 3, section 2), the founder moves an Organisation between a phone and a laptop by Export and Import. The app's own warning on the Organisations screen ("this browser may clear its stored data when space runs low") already says why Export matters.

## 5. A route by stage (proposal)

Following the owner's decision of 2026-11-27 (all three ways), in the order that gives founders the app soonest:

| Stage | Step | Kind |
|---|---|---|
| **Now** | Test on the owner's phone from the dev server (`npm run dev:network`); Install through Chrome's flag for an http address (Records 2, 5.15). | B |
| **Beta** | Host the built app on https; add a service worker (works offline, updates installed copies); ask for persistent storage when the founder saves an Organisation; tell the founder on the Organisations screen to install it and to export a copy. | B |
| **Beta, optional** | Microsoft Store listing through PWABuilder (free account). | C |
| **V1** | Google Play: Tauri Android (works offline, no dependence on the host) or a TWA (less work, depends on the host) **(owner decides)**; start the 12-tester closed test early. | D or C |
| **V1** | App Store: Tauri iOS, built on a Mac; prepare for Guideline 4.2 by showing what the app does offline. | D |
| **V1** | Desktop: Tauri installers signed for Windows and notarized for macOS; Linux packages. | D |

## 6. What the owner has to provide

| For | What | Cost or time |
|---|---|---|
| Beta (web) | A host with https and a domain name | Depends on the provider **(owner decides)** |
| Google Play | A Play Console account (personal, or organisation with a D-U-N-S number); 12 testers for 14 days for a new personal account | $25 once; D-U-N-S free, up to about 30 days |
| App Store and macOS notarization | An Apple Developer Program membership (as an individual for a sole proprietorship); **a Mac with Xcode** for the iOS build | 99 USD a year |
| Microsoft Store | A Microsoft Store developer account, identity checked | Free |
| Windows installers | A code-signing certificate or Azure Artifact Signing | Paid (not priced here) |
| Android builds | Android Studio and its SDK and NDK on the PC | Free |

## 7. Open questions for the owner

1. Which host and domain for the Beta?
2. Google Play: Tauri Android (offline, own files) or a Trusted Web Activity (less work, depends on the host)?
3. Is there a Mac available for the iPhone build, or should the iPhone stay a Home Screen web app until there is one?
4. Personal or organisation developer accounts (an organisation needs a D-U-N-S number at Google and Apple)?
5. Is a Microsoft Store listing wanted for the Beta?

## 8. How the sources were weighed

The app's source rule (Research 1, 2.1) names government and standard-setter sites; for what an operating system or a store requires, the only authority is the platform's owner. So the sources here are the owners' own documentation: Apple (developer.apple.com, webkit.org), Google (developer.android.com, developer.chrome.com, web.dev, support.google.com), Microsoft (learn.microsoft.com, blogs.windows.com), Mozilla (developer.mozilla.org, support.mozilla.org) and Tauri (v2.tauri.app) for Tauri's own requirements. Forum posts are used only where marked as reports, never for a rule. Dates and fees change: check the linked page before acting on a date.

Not verified here: the exact behaviour of `persist()` in Safari (sources disagree [7]); Firefox web apps on Linux (Mozilla's pages disagree [20]); the Microsoft Store route for a Tauri app; the price of a Windows code-signing certificate; how an Android flag for insecure origins behaves on the owner's Chrome version.

## 9. Sources

1. Google, web.dev: [What does it take to be installable?](https://web.dev/articles/install-criteria)
2. Mozilla, MDN: [Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
3. Google, web.dev: [Web app manifest](https://web.dev/learn/pwa/web-app-manifest/)
4. Google, web.dev: [Installation](https://web.dev/learn/pwa/installation)
5. Google, web.dev: [Storage for the web](https://web.dev/articles/storage-for-the-web); [Persistent storage](https://web.dev/articles/persistent-storage)
6. Mozilla, MDN: [Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria); [StorageManager.persist()](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist)
7. WebKit: [Tracking Prevention in WebKit](https://webkit.org/tracking-prevention/); [Full Third-Party Cookie Blocking and More](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
8. Google, Chrome for Developers: [Quick start to Trusted Web Activities](https://developer.chrome.com/docs/android/trusted-web-activity/quick-start/); Android Developers: [Trusted Web Activities](https://developer.android.com/develop/ui/views/layout/webapps/trusted-web-activities)
9. Tauri: [Prerequisites](https://v2.tauri.app/start/prerequisites/)
10. Tauri: [Webview versions](https://v2.tauri.app/reference/webview-versions/)
11. Google, Play Console Help: [Required information to create a Play Console developer account](https://support.google.com/googleplay/android-developer/answer/13628312?hl=en)
12. Google, Play Console Help: [App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
13. Google: [Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en); [Android developer verification](https://developer.android.com/developer-verification); [Policy announcement, 15 July 2026](https://support.google.com/googleplay/android-developer/answer/17134731?hl=en); [Google Play policies](https://developer.android.com/distribute/play-policies)
14. WebKit: [Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/); [WebKit Features in Safari 16.4](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/); [Badging for Home Screen Web Apps](https://webkit.org/blog/14112/badging-for-home-screen-web-apps/)
15. Apple: [Update on apps distributed in the European Union](https://developer.apple.com/support/dma-and-apps-in-the-eu/)
16. Tauri: [App Store](https://v2.tauri.app/distribute/app-store/); [iOS code signing](https://v2.tauri.app/distribute/sign/ios/)
17. Apple: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), 4.2; Apple Developer Forums, [rejections under 4.2](https://developer.apple.com/forums/thread/712221) (reports, not policy)
18. Apple: [Apple Developer Program](https://developer.apple.com/programs/); [Enrollment](https://developer.apple.com/help/account/membership/program-enrollment/); [D-U-N-S Number](https://developer.apple.com/help/account/membership/D-U-N-S/)
19. Apple: [Account deletion within apps](https://developer.apple.com/news/?id=12m75xbj)
20. Mozilla: [Use web apps in Firefox for Windows](https://support.mozilla.org/en-US/kb/web-apps-firefox-windows); [Web Apps in Firefox (source docs)](https://firefox-source-docs.mozilla.org/browser/components/taskbartabs/docs/index.html)
21. Microsoft: [Publish a PWA to the Microsoft Store](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/microsoft-store); [Free developer registration for individual developers](https://learn.microsoft.com/en-us/windows/apps/publish/whats-new-individual-developer)
22. Tauri: [Distribute](https://v2.tauri.app/distribute/); [Windows code signing](https://v2.tauri.app/distribute/sign/windows/); [Linux code signing](https://v2.tauri.app/distribute/sign/linux/)
23. Microsoft: [Publish to Microsoft Store as a company, now with free registration](https://blogs.windows.com/windowsdeveloper/2026/05/07/publish-to-microsoft-store-as-a-company-now-with-free-registration-and-faster-onboarding/)
24. Tauri: [macOS code signing](https://v2.tauri.app/distribute/sign/macos/)
