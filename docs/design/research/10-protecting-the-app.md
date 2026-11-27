# 10. Protecting the app from copying and digging

Status: **research**, written 2026-11-27, updated 2026-11-27. What can be protected in a web app that runs on the founder's device, the ways to protect it, how well each works, what each costs Tiles, and a recommendation in layers. Asked by the owner on 2026-11-27 (19:21 UTC+2): "Do a deep online research regarding the best ways to secure your app, from digging it."

Related: Research 9 (the kinds of app), the proposal `apps-on-every-system.md` (batches 3b and 4a), Records 2, section 5.15.

## 1. What can be dug, and what cannot

| Part | Who can reach it today | Who can reach it once the repository is private |
|---|---|---|
| The running app (compressed JavaScript, CSS, the example files) | anyone who opens app.northstardust.studio; every web app sends its code to the browser | the same: this does not change, on the website, in Google Play or in the App Store's web view |
| The source code with its comments, names and structure | **anyone: the GitHub repository is public** | the owner and those he invites |
| The 140 design, research and question documents, the tests, the library, the history | **anyone** (the same repository) | the owner |
| Source maps (the files that turn the running app back into source) | none are published (checked 2026-11-27: the address returns the app's page) | none |
| The founder's own answers | only on the founder's device | the same |

**The largest exposure is the public repository**, not the running app.

## 2. The ways to protect the running app

| Way | What it does | How well it works (sources) | Cost to Tiles |
|---|---|---|---|
| **Minify** (built today) | short names, no comments, one long line | stops casual reading only | none |
| **Obfuscate** (for example javascript-obfuscator, Jscrambler) | renames, flattens control flow, encrypts strings | raises the effort; most outputs of the common free obfuscator were turned back close to the original by free automatic tools, a commercial one with string encryption held up better [3]; Google runs an AI deobfuscator in production [4]; vendors themselves call it a deterrent, not a boundary [1][2] | slower start and run (a large app), harder bug reports; strong tools are paid |
| **WebAssembly** for chosen parts | the logic compiled to a binary | harder to read than obfuscated JavaScript, still disassemblable (wasm2wat) [6][7] | the parts rewritten in another language (Rust, C); fits a small core (for example the sealing of export files), never the whole app |
| **Integrity and anti-tamper checks** | the app notices it was changed or debugged | detects; a determined person removes the check [1][2] | small; useful around the download lock and the sealed files |
| **Logic on a server** | the valuable part never reaches the device | the only way the code is truly not dug [1][7] | the app stops working offline; a server to run and secure; the answers leave the device (privacy policy, GDPR); against the local-first plan (Guide 3, section 6) |
| **Store integrity** (Google Play Integrity API) | a server checks the request came from the genuine app from Play | strong for Play installs [8] | a server; only for the Play app; the web app has no equivalent |

## 3. The law

- **Copyright protects the code automatically** in the EU, as a literary work, in any form (source or compiled); it does not protect the ideas or functions behind it [9]. A copy of the code, or a translation of it, is an infringement; an app that does the same thing written anew is not. The Court of Justice confirmed in 2024 that the protection covers the code, not the functionality [9].
- **Trade secrets:** reverse engineering a product that is publicly available or lawfully held is a lawful way to learn its secrets, **unless a contract says otherwise** [10]. So **Terms of Use that forbid reverse engineering, copying and redistribution** matter: they turn digging into a breach of contract. (The software directive's own exceptions, such as decompiling for interoperability, stay allowed whatever a contract says [9].)
- **The design documents and research** are protected as written works, but only if they are not published: a public repository gives them away in practice.

## 4. Recommendation for Tiles, in layers

1. **Make the repository private** (now). It closes the largest exposure: source, documents, research, history. GitHub checks then use the plan's monthly allowance (section 5).
2. **Legal layer** (Batch 3b): a copyright notice in the app and the site, an all-rights-reserved `LICENSE` in the repository, and **Terms of Use** (accepted when the app is first used) that forbid copying, reverse engineering and redistribution.
3. **Accounts** (Batch 3b): two-step sign-in with passkeys on GitHub, Cloudflare, the Gmail address and the store accounts; GitHub secret scanning and Dependabot alerts on; Cloudflare previews behind Access [11].
4. **Light technical layer** (Batch 4a): seal the export files (encrypted, versioned key, tamper-evident); obfuscate only the small module that holds the sealing key and the download lock, with an integrity check around them. The rest of the app stays minified: obfuscating all of it slows every founder and buys little [3][4].
5. **Later, if the value grows:** move what is worth most (for example the document writing or a paid feature) to a server function, accepting that it then needs a connection; and add Play Integrity checks for the Play app [8].

**What stays true whatever is done:** a skilled person can always read and copy the part of the app that runs on their device; the law and the Terms are what make doing so a wrong with consequences.

## 5. GitHub check minutes (measured 2026-11-27)

Billable job minutes from all 470 runs (each job rounded up to the minute, as GitHub bills): August 3, October 254, **November to the 27th 2,909** (the week from 20 November alone 1,775). On a private repository the free plan includes about 2,000 Linux minutes a month and GitHub Pro ($4 a month) about 3,000 [12]. At November's pace the checks would pass the free allowance; dropping the run after each merge to main (86 of the last week's 178 runs) and skipping docs-only pull requests is expected to bring a month near 2,000 to 3,000 minutes, so Pro would cover it.

## 6. Sources

1. Jscrambler (vendor), [Client-side protection](https://jscrambler.com/learning-hub/client-side); Indusface, [OWASP Top 10 client-side risks](https://www.indusface.com/learning/owasp-top-10-client-side-risks/) (secondary, cites OWASP)
2. NHI Mgmt Group, [JavaScript obfuscation still matters, but it cannot stand alone](https://nhimg.org/articles/javascript-obfuscation-still-matters-but-it-cannot-stand-alone) (secondary)
3. BeDefended, [JavaScript obfuscators tested against Webcrack](https://newsroom.bedefended.com/how-good-javascript-obfuscation/) (small informal test)
4. Jiang et al., [CASCADE: LLM-powered JavaScript deobfuscator at Google](https://arxiv.org/pdf/2507.17691) (preprint)
5. [From obfuscated to obvious: a comprehensive JavaScript deobfuscation](https://arxiv.org/pdf/2512.14070) (preprint)
6. [WebAssembly security: the complete guide](https://www.pilecode.com/en/blog/webassembly-security-guide-for-smbs) (secondary)
7. [WASM bot challenges: the reverse-engineering arms race](https://www.systemshardening.com/articles/wasm/wasm-bot-challenge-integrity/) (secondary)
8. Android Developers, [Play Integrity API overview](https://developer.android.com/google/play/integrity/overview)
9. EUR-Lex, [Directive 2009/24/EC on the legal protection of computer programs](https://eur-lex.europa.eu/eli/dir/2009/24/oj/eng); Court of Justice, [C-159/23 Sony v Datel (2024)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:62023CJ0159)
10. EUR-Lex, [Directive (EU) 2016/943 on trade secrets](https://eur-lex.europa.eu/eli/dir/2016/943/oj/eng)
11. Cloudflare, [Pages preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
12. GitHub Docs, [Actions billing and usage](https://docs.github.com/en/actions/concepts/billing-and-usage)

**How the sources were weighed:** the law and the platforms' rules come from the official texts (EUR-Lex, Android Developers, Cloudflare, GitHub). On how well obfuscation works there is no rigorous peer-reviewed comparison: the evidence is preprints, a small informal test and vendors with a stake in the answer, so the document draws only what they all agree on (it raises effort; it does not stop a determined person).
