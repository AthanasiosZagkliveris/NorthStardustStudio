# Shared Workspace: Working Together Without a Server

**Status:** Archive, written 2026-09-26, moved here 2026-10-21 from `specifications/shared-workspace/`. A proposal, not started; nothing in the app has been changed for it. The app is still a single-user app with its data in the browser. **Held only here:** the whole proposal; no other document points to it (`design/core/05-not-done-yet.md` does not list it, and the log has one row).
**Date:** 26 September 2026
**Scope:** North Stardust Studio desktop app (Tauri + React + TypeScript)

---

## 1. Summary

Let a founder, or a small team of co-founders, work on the same organization from their own computers: edit the Foundation and the other Systems, see who is working where, leave comments, look back at earlier versions and restore them, and never lose their work.

The whole feature runs **without any server, account or data held by the app's maker**. The organization is saved as a folder of small files inside a cloud drive the team already uses (Google Drive, OneDrive, Dropbox or iCloud Drive). The drive carries the files between computers and keeps its own backups; the app reads, writes and watches the folder.

A founder working alone keeps using the app exactly as today. The shared workspace is optional.

---

## 2. Context

### 2.1 Who it is for

From *Target Audience Selection*:

- **Tier 1:** knowledge-based service businesses: AI automation agencies, software development agencies, UI/UX and design studios, marketing agencies, business consulting firms.
- **Tier 2:** architecture practices, engineering consultancies, 3D, VFX and game studios, digital product studios, early-stage SaaS companies.

They are mostly **under development or in their early years**, from **one person to small groups**. They work in collaborative, project-based ways and already use digital tools daily, including a shared cloud drive.

### 2.2 The founding constraint

The app's maker does **not** want to be involved in customers' data or operations:

- no accounts to create, verify or recover;
- no servers to run, pay for, monitor or secure;
- no customer data received, stored or processed;
- no support duties for anyone's data.

Every design choice below follows from this.

---

## 3. Goals and non-goals

### Goals

1. Two to about ten people can work on one organization from their own computers.
2. Each person can see who is working on which page.
3. Nobody's work is silently overwritten.
4. Comments on a page or on a specific card, with replies and "Resolve".
5. Version history: who changed what and when, compare, restore, name a version.
6. Backups that survive a lost or broken computer.
7. Works offline; changes travel when the computer is back online.
8. A solo founder notices no change unless they choose to share.

### Non-goals (for this feature)

- Two people typing in the same field at the same moment (live, Google-Docs-style editing).
- A web version in a browser.
- Accounts, sign-in, or permissions beyond what the drive's own sharing provides.
- Any service run by the app's maker.

---

## 4. Options considered

| Option | Maker involved? | Live editing | Setup for customers | Verdict |
|---|---|---|---|---|
| **Shared folder in the team's cloud drive** | **None** | No; changes arrive after the drive syncs (seconds to a minute) | Share one folder | **Chosen** |
| Hosted cloud service (e.g. Supabase) run by the maker | Full: accounts, data, GDPR, uptime, costs | Yes | Sign up | Rejected: breaks the founding constraint |
| Direct Google Drive / Microsoft Graph connection from the app | Partial: the maker registers the app with Google and Microsoft, passes their verification, publishes a privacy policy for it | No | Sign in with Google or Microsoft | Rejected: registration and verification are involvement |
| Git repository (e.g. GitHub) | None | No | Technical; fits software agencies only | Rejected as the default; too technical for most of the audience |
| Peer-to-peer (WebRTC) | Needs someone to run connection servers | Yes, when both are online | Low | Rejected: still needs a server, unreliable when people are offline |
| "Connect your own server" (the team hosts it) | None | Possible | Technical | **Later option** (Section 14) |

---

## 5. How it works for the user

### 5.1 Working alone (unchanged)

The organization is saved on the computer, as today. Import Organization and Export Organization keep working.

### 5.2 Creating a shared workspace

1. On the organization's screen: **Share with co-founders → Create shared workspace**.
2. The app explains in one paragraph: "Choose a folder inside Google Drive, OneDrive, Dropbox or iCloud Drive. Share that folder with your co-founders using the drive's own sharing. Your data stays on your computers and in your drive; nobody else receives it."
3. The founder picks a folder. The app moves the organization into it (keeping a backup copy of the local version).
4. The founder enters **their name** and picks **a colour**. This is how others will see them. It is stored on this computer only.
5. The app shows: "Now share this folder with your co-founders in your drive." with a button to open the folder.

### 5.3 Joining

1. The co-founder accepts the share in their drive and waits for the folder to appear on their computer.
2. In the app: **Open shared workspace** and pick the folder.
3. They enter their name and colour.
4. The organization opens, with everyone's work.

### 5.4 Everyday use

- A small status line: **"Up to date"**, **"Saving…"**, **"Oliver's changes just arrived"**, or **"Waiting for your drive to sync"** when the folder has not changed for a long time while others are known to be editing.
- Each page shows who else is on it: a coloured initial, and "Priya is editing Financial Foundation".
- When someone else is editing a page, it opens **read-only** with a banner: "Priya is editing this page. **Take over** to edit it yourself." Taking over is allowed when Priya's marker is older than 5 minutes, or after a confirmation.

### 5.5 When two people changed the same page

This can still happen: someone edited offline, or took over. The app shows a **Conflict** dialog:

- the two versions side by side, with who and when;
- the differences highlighted field by field;
- **Keep mine**, **Keep theirs**, or **Choose per field**.

Nothing is discarded: the version not kept goes into the page's history.

### 5.6 Comments

- A **Comments** panel per page, and a comment icon on each card and field that has comments.
- A comment: author, time, text, optional @mention of a co-founder by name.
- Replies, **Resolve**, **Reopen**; resolved comments are hidden by default.
- A count per page in the navigation ("3 open comments").

### 5.7 Version history

- A **History** panel per page: a list of versions with author and time.
- **Compare** any version with the current one.
- **Restore** a version: it becomes a new version, so nothing is lost.
- **Name a version** of the whole organization: "Sent to Start Up Loans, Oct 2026". Named versions are never removed.

### 5.8 Backups

Three layers, none of them run by the maker:

1. **The drive**: a copy on every member's computer and in the drive's cloud, plus the drive's own file history (Google Drive, OneDrive and Dropbox all keep earlier versions of files for a period that depends on the plan).
2. **The app's history folder** (Section 5.7).
3. **Automatic backup file** (optional): once a day, a single `.zip` of the whole workspace to a second location the user chooses, keeping the last 30. Plus the existing **Export Organization**.

### 5.9 Leaving and removing

- **Leave workspace**: the app stops using the folder on this computer and, if wanted, keeps a local copy.
- **Removing a co-founder** is done in the drive's sharing settings. The app says clearly that a person who had access may still have a copy on their computer: removing access stops future changes reaching them, it does not delete what they already have.

---

## 6. The workspace folder

### 6.1 Layout

```
Lumen & Loom Studio/                       the folder the team shares
  workspace.json                           the organization and the format version
  systems/
    01-identity/
      page-1.json                          one file per page (section)
      page-2.json
      page-3.json
    02-brand/…
    03-business/
      page-1.json … page-5.json
    04-strategy/…
  comments/
    03-business/page-4/
      2026-10-02T14-31-05Z_oliver_c8f2.json   one file per comment or reply
  history/
    03-business/page-4/
      2026-10-02T14-40-00Z_priya.json         earlier versions of a page
    named/
      2026-10-15_sent-to-start-up-loans.zip    named versions of the whole organization
  editing/
    priya.json                              who is editing what, refreshed every minute
    oliver.json
  .north-stardust                           marks the folder as a workspace
```

**Why one file per page:** two people on different pages never touch the same file, so the drive never has to choose between their changes. Pages are also what the app already saves (answers are keyed by section number).

**Why one file per comment:** two people commenting at the same moment write two different files. Nothing can clash.

### 6.2 Files

`workspace.json`

```json
{
  "format": 1,
  "organizationId": "org-muimc9n5-63b9rc",
  "name": "Lumen & Loom Studio",
  "createdAt": "2026-10-01T09:12:00Z",
  "flags": {
    "financialFoundationPageInserted": true,
    "legacyBusinessPagesRetired": true
  },
  "members": [
    { "id": "priya", "name": "Priya Shah", "colour": "#2a78d6", "lastSeen": "2026-10-02T14:40:00Z" }
  ]
}
```

A page, `systems/03-business/page-4.json`:

```json
{
  "format": 1,
  "system": 3,
  "section": 4,
  "revision": 17,
  "basedOn": 16,
  "editedBy": "priya",
  "editedAt": "2026-10-02T14:40:00Z",
  "value": { "planStart": { "month": "10", "year": "2026" }, "planYears": "3", "costs": [] }
}
```

- `revision` goes up by one on every save.
- `basedOn` is the revision the editor had loaded when they started. If the file on disk has moved past it, someone else saved in between: see Section 7.4.

A comment:

```json
{
  "format": 1,
  "id": "c8f2",
  "page": { "system": 3, "section": 4 },
  "anchor": "needs/initial-operating",
  "replyTo": null,
  "author": "oliver",
  "createdAt": "2026-10-02T14:31:05Z",
  "text": "Does the operating need include the Christmas fair stall?",
  "resolved": false,
  "resolvedBy": null
}
```

- `anchor` points at a card or field inside the page, in the page's own terms (for example a cost id, a Funding Need category, a Segment id). If the card no longer exists, the comment falls back to the page.
- Resolving writes a small follow-up file (`…_resolve.json`) rather than editing the original, so two people can never clash over it.

An editing marker, `editing/priya.json`:

```json
{ "member": "priya", "page": { "system": 3, "section": 4 }, "since": "2026-10-02T14:20:00Z", "heartbeat": "2026-10-02T14:40:00Z" }
```

### 6.3 Format versions

- Every file carries `format`. The app refuses to write to a workspace with a **higher** format than it knows, and opens it read-only with "A co-founder uses a newer version of North Stardust Studio. Update to keep editing."
- Upgrading the format is done by the first up-to-date app that opens the workspace, after taking a named backup ("Before upgrade to format 2").
- The app's existing data migrations (StorageService) run on each page as it is read, exactly as today, and the migrated page is written back once.

---

## 7. Behaviour in detail

### 7.1 Saving

1. The app keeps today's short delay after typing (it already batches writes).
2. It writes the page to a temporary file in the same folder, then renames it over the real one. A half-written file is never seen by the drive or by a co-founder.
3. `revision` + 1, `editedBy`, `editedAt`.
4. It adds a history copy (Section 7.6).

### 7.2 Noticing changes

- The app watches the folder (Tauri file-system watching). Where watching is unreliable (some drives, network folders), it also checks the files it has open every 10 seconds.
- A change to a page **you are not editing**: the page reloads quietly; the status line says whose change arrived.
- A change to the page **you are editing**: see Section 7.4.

### 7.3 Who is editing (presence)

- Opening a page for editing writes your marker; it is refreshed every 60 seconds while the page is open and the app is in use.
- A marker older than **5 minutes** counts as gone (the computer slept, the app closed, the drive stopped syncing).
- Markers are advice, not locks: they prevent almost all clashes; Section 7.4 catches the rest.

### 7.4 Conflicts

**Detected by the app:** when saving, if the page on disk has a `revision` higher than your `basedOn`, someone else saved first.

1. If the two versions changed **different fields**, the app combines them and tells you ("Combined with Oliver's changes to Funding").
2. If they changed the **same field**, the Conflict dialog opens (Section 5.5).

**Created by the drive:** drives keep both copies when two computers change a file at once, under names like:

- Dropbox: `page-4 (Priya's conflicted copy 2026-10-02).json`
- OneDrive: `page-4-PRIYA-LAPTOP.json`
- Google Drive: `page-4 (1).json`

The app looks for these next to each page, opens the Conflict dialog, and removes the extra copy once resolved (keeping it in history).

### 7.5 Comments

- Read: every comment file under the page's folder, sorted by time, grouped into threads.
- Write: a new file; never an edit.
- Mentions: only names from `workspace.json` members; a mention highlights the comment for that person the next time they open the app. There are no emails or notifications outside the app.

### 7.6 History

- A history copy is written on save, but **merged**: the same person's saves to the same page within 10 minutes replace each other, so history shows meaningful steps, not every keystroke.
- Kept: every version for 90 days, then one per week, and named versions forever. Configurable.
- Compare: field-by-field differences, using the page's own labels.
- Restore: writes the old value as a new revision, so the restore itself can be undone.

### 7.7 Offline

Everything is on the computer, so the app works offline as today. The drive sends the changes when the computer reconnects; Section 7.4 handles anything that clashed meanwhile.

---

## 8. Security and privacy

- **The maker receives nothing.** No telemetry, no accounts, no servers.
- **Access is the drive's sharing.** The app shows a short reminder: "Anyone you share this folder with can read and change the organization, including its financial figures."
- **File access is limited.** The app only gets permission to read and write the folder the user picked (Tauri file-system permissions, scoped to that folder).
- **Personal and financial data** stay in the customer's own drive, under their own agreement with the drive provider.
- **Privacy note in the app:** "Your organization is stored on your computer and, if you choose, in a folder of your own cloud drive. North Stardust Studio does not receive, store or process it."

---

## 9. What changes in the code

### 9.1 A storage layer

Today, `OrganizationService` and `StorageService` read and write the browser's local storage directly. The first step puts them behind one interface, so the rest of the app does not care where an organization lives:

```ts
interface OrganizationStore {
    list(): OrganizationSummary[];
    load(organizationId: string): OrganizationDocument | null;
    savePage(organizationId: string, system: number, section: number, value: unknown): void;
    remove(organizationId: string): void;
    /** Pages changed by someone else. */
    onExternalChange(listener: (change: PageChange) => void): () => void;
}
```

- `LocalStore`: today's behaviour, unchanged.
- `FolderStore`: the shared workspace.

This step changes nothing the user sees and can ship on its own.

### 9.2 Tauri additions

- `@tauri-apps/plugin-fs` (with file watching) and `@tauri-apps/plugin-dialog` (folder picker), and their Rust crates.
- Permissions in `src-tauri/capabilities/default.json`, scoped to the chosen folder.

### 9.3 New screens and parts

- Share with co-founders: create, open, leave; name and colour.
- Status line and presence avatars in the page header.
- Read-only banner with Take over.
- Conflict dialog.
- Comments panel and comment markers on cards.
- History panel, compare view, name a version.
- Backup settings.

### 9.4 Tests

- The storage layer: both stores behave the same (shared test suite).
- Conflicts: different fields combine; same field asks; drive conflict copies are found.
- History merging and retention.
- Format versions: newer workspace opens read-only.
- Manual: two computers on each drive (Google Drive, OneDrive, Dropbox, iCloud Drive), including offline edits, simultaneous saves, sleep and wake, and restore.

---

## 10. Phases

| Phase | Contents | Estimate (one developer with AI help) | Done when |
|---|---|---|---|
| 1 | Storage layer (Section 9.1) | 1 to 1.5 weeks | The app works exactly as before on top of `LocalStore`; all tests pass |
| 2 | Shared folder: create, open, save, watch, reload, format versions | 1.5 to 2 weeks | Two computers on one drive see each other's changes to different pages |
| 3 | Presence and conflicts | 1 week | Same-page edits never lose work; drive conflict copies are resolved |
| 4 | Comments | 1 week | Threads, resolve, mentions, markers on cards |
| 5 | History and backups | 1 to 1.5 weeks | Compare, restore, named versions, daily backup file |
| 6 | Guide and polish | 0.5 week | A one-page "Working together" guide in the app |

**Total: about 5 to 8 weeks.** After Phase 2 a team can already share an organization; each later phase is usable on its own.

---

## 11. Risks and how they are handled

| Risk | Handling |
|---|---|
| The drive syncs slowly or stops | Status line warns; presence markers expire; conflicts are caught on save |
| Two people edit the same page offline | Revision check and Conflict dialog; nothing discarded |
| A co-founder on an old app version | Format version check; read-only with "Update" |
| Someone deletes files in the drive by mistake | The drive's own file history; the daily backup file; named versions |
| The folder is shared too widely | In-app reminder of what sharing means; the choice stays with the team |
| Very large histories | Merging and retention (Section 7.6) |
| iCloud Drive "optimised storage" removes local copies | The app asks the drive to keep the folder downloaded, and warns if files are not available offline |

---

## 12. Decisions to make before starting

1. Confirm the shared-folder approach and zero involvement.
2. Which drives to test and support at launch (suggested: Google Drive, OneDrive, Dropbox; iCloud Drive after).
3. History retention defaults (suggested: 90 days, then weekly; named versions kept).
4. Whether "Take over" needs the other person's marker to be stale, or only a confirmation.
5. Whether comments may mention people (no notifications outside the app either way).
6. Whether the daily backup file is on by default.

---

## 13. What stays the maker's job

- Releasing app updates, including the format upgrades.
- The in-app guide and the privacy note.
- If licences are sold: a payment platform that issues licence keys (for example Paddle or Lemon Squeezy), which handles payment data so the maker holds none.

---

## 14. Later option: connect your own server

For teams that want live editing (typically AI and software agencies), a setting **"Connect your own server"** could let a team point the app at a sync service **they** host and own, for example their own Supabase project, set up from a guide. The maker still receives nothing. It would reuse the storage layer from Phase 1 as a third store. Not part of this proposal's estimate.

---

## 15. Glossary

- **Workspace:** the shared folder holding one organization.
- **Page:** one section of a System, saved as one file.
- **Revision:** a page's save counter, used to notice clashes.
- **Presence marker:** the small file saying who is editing which page.
- **Named version:** a snapshot of the whole organization kept forever.
