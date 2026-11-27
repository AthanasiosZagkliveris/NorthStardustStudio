import PressRow from "../components/controls/PressRow.tsx";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import TextLink from "../components/interview/fields/TextLink.tsx";
import CellRemoveButton from "../components/controls/CellRemoveButton.tsx";
import NavArrow from "../components/controls/NavArrow.tsx";
import AddButton from "../components/controls/AddButton.tsx";
import TextBox from "../components/controls/TextBox.tsx";
import { useNavigate } from "react-router-dom";

import AppHeader from "../components/shell/AppHeader";
import UserPreferencesDialog from "../components/shell/UserPreferencesDialog";

import {
    OrganizationService,
    OrganizationSummary,
    UnsupportedFormatVersionError
} from "../services/OrganizationService";
import { PreferencesService } from "../services/PreferencesService.ts";
import { IndexedDbStorage } from "../services/IndexedDbStorage.ts";
import { refreshExampleOrganizations } from "../services/ExampleOrganizations.ts";
import { AppInstallService } from "../services/AppInstallService.ts";
import { TermsService, TERMS_URL, PRIVACY_URL } from "../services/TermsService.ts";
import { openExternal } from "../components/references/HarvardReference.tsx";
import TickField from "../components/controls/TickField.tsx";

import "../styles/global.css";
import "../styles/landing.css";
import "../styles/system-confirmation.css";

/** The user's name box's words, its placeholder and its accessible name: a plain message (owner, 2026-11-22 18:58 UTC+2: "The App User's name - should be a simple
 * message. Do not link it with the organization ownership or founders"): the app's user, whoever owns or founds the Organisations. */
const USER_NAME_WORDS = "Your name";

export default function Landing() {

    const navigate = useNavigate();

    const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Deleting an Organization is irreversible (its saved System
    // progress goes with it), so the "-" button opens this confirmation
    // instead of removing immediately -- set to the pending Organization's
    // id while the dialog is open, null otherwise.
    const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

    // The App's single User Name (one per App, not per
    // Organization) -- freely editable at any time; only the
    // very first time it goes from empty to non-empty does
    // committing it also open the first-run Preferences popup
    // (see `commitUserName`).
    const [userName, setUserName] = useState(() => PreferencesService.getUserName());
    const [preferencesOpen, setPreferencesOpen] = useState(false);

    function commitUserName() {

        const trimmed = userName.trim();

        if (trimmed.length === 0) {
            return;
        }

        const hadNameAlready = PreferencesService.getUserName().trim().length > 0;

        PreferencesService.setUserName(trimmed);

        if (!hadNameAlready) {
            setPreferencesOpen(true);
        }

    }

    // Loads every saved Organization once on mount, and resolves
    // which one (if any) should already be treated as "selected":
    // a previously selected Organization that still exists, or --
    // when there's exactly one Organization -- that one Organization
    // automatically, since there's nothing to choose between. A
    // brand new install (nothing saved at all yet) seeds a single
    // default Organization instead of starting from an empty list,
    // so the common case -- one Organization -- never requires the
    // user to press "+ Add Organization" first.
    useEffect(() => {

        let list = OrganizationService.list();

        if (list.length === 0) {
            const seeded = OrganizationService.create("Organisation 1");
            list = [seeded];
        }

        setOrganizations(list);

        let selected = OrganizationService.getSelected();

        if (selected && !list.some(organization => organization.id === selected)) {
            selected = null;
        }

        if (!selected && list.length === 1) {
            selected = list[0].id;
        }

        OrganizationService.setSelected(selected);
        setSelectedId(selected);

    }, []);

    // Escape closes whichever popup is open here (Landing is the
    // root page -- there's no "Back" destination to fall through
    // to, so unlike every other page's own Escape handler this one
    // only ever closes things, never navigates).
    useEffect(() => {

        function handleKeyDown(event: KeyboardEvent) {

            if (event.key !== "Escape") {
                return;
            }

            if (preferencesOpen) {
                setPreferencesOpen(false);
                return;
            }

            if (pendingRemoveId) {
                setPendingRemoveId(null);
            }

        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [preferencesOpen, pendingRemoveId]);

    function addOrganization() {

        const created = OrganizationService.create(
            `Organisation ${organizations.length + 1}`
        );

        setOrganizations(previous => [...previous, created]);

        OrganizationService.setSelected(created.id);
        setSelectedId(created.id);

    }

    const importInputRef = useRef<HTMLInputElement | null>(null);

    // Says why a chosen file could not be imported, until the next try.
    const [importError, setImportError] = useState<string | null>(null);

    // Whether the browser refused to keep this site's data under storage pressure (IndexedDbStorage.keep: asked once at start).
    // Then the founder is told to keep a copy with Export (Guide 3, section 5, row 2; the review of 2026-11-25, C2).
    const [storageAtRisk, setStorageAtRisk] = useState(false);
    useEffect(() => {
        let live = true;
        void IndexedDbStorage.keep().then(kept => { if (live) setStorageAtRisk(!kept); });
        return () => { live = false; };
    }, []);

    // The Terms of Use, agreed once on a device (TermsService; the user guide, section 2).
    const [termsOpen, setTermsOpen] = useState(() => TermsService.mustAsk());
    const [termsTicked, setTermsTicked] = useState(false);

    // Install and a new version (AppInstallService; the user guide, section 2, items 6 and 7).
    const app = useSyncExternalStore(AppInstallService.subscribe, AppInstallService.state);

    /**
     * Adds an Organization from a JSON file -- one saved from another
     * install or the browser preview. It arrives as a new
     * Organization and is selected, ready to open.
     */
    async function importOrganization(file: File) {

        setImportError(null);

        try {

            const imported = OrganizationService.importDocument(JSON.parse(await file.text()));

            if (!imported) {
                setImportError("That file is not a North Stardust organisation.");
                return;
            }

            setOrganizations(OrganizationService.list());

            OrganizationService.setSelected(imported.id);
            setSelectedId(imported.id);

        } catch (error) {
            // A file from a newer version of the app: said plainly,
            // with what to do, rather than as an unreadable file.
            setImportError(
                error instanceof UnsupportedFormatVersionError
                    ? "That file was saved by a newer version of North Stardust. Update the app, then import it again."
                    : "That file could not be read as an organisation."
            );
        }

    }

    /**
     * Saves the selected Organization -- every System's answers -- as
     * a JSON file: a backup, or a copy to Import on another install.
     */
    function exportOrganization() {

        if (!selectedId) {
            return;
        }

        OrganizationService.flushPendingWrites();

        const document = OrganizationService.exportDocument(selectedId);

        if (!document) {
            return;
        }

        const slug = (document.name || "organization")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "organization";

        const url = URL.createObjectURL(
            new Blob([JSON.stringify(document, null, 2)], { type: "application/json" })
        );

        const link = window.document.createElement("a");
        link.href = url;
        link.download = slug + ".json";
        link.click();

        URL.revokeObjectURL(url);

    }

    function renameOrganization(id: string, name: string) {

        OrganizationService.rename(id, name);

        setOrganizations(previous =>
            previous.map(organization =>
                organization.id === id
                    ? { ...organization, name }
                    : organization
            )
        );

    }

    function requestRemoveOrganization(id: string) {
        setPendingRemoveId(id);
    }

    function cancelRemoveOrganization() {
        setPendingRemoveId(null);
    }

    function confirmRemoveOrganization() {

        if (!pendingRemoveId) {
            return;
        }

        const id = pendingRemoveId;
        setPendingRemoveId(null);

        OrganizationService.remove(id);

        let next = organizations.filter(organization => organization.id !== id);
        const wasSelected = selectedId === id;

        // Deleting the only remaining Organization would otherwise
        // leave an empty list with nothing left to select -- put
        // things back to exactly the same default state a brand-new
        // install starts from, rather than an empty screen.
        if (next.length === 0) {
            const seeded = OrganizationService.create("Organisation 1");
            next = [seeded];
        }

        setOrganizations(next);

        if (wasSelected) {

            const fallback = next.length === 1 ? next[0].id : null;

            OrganizationService.setSelected(fallback);
            setSelectedId(fallback);

        }

    }

    function selectOrganization(id: string) {

        OrganizationService.setSelected(id);
        setSelectedId(id);

    }

    /** An Organisation's arrow: it is selected, and its Capabilities open. */
    function openOrganization(id: string) {

        selectOrganization(id);

        // Renaming an Organization debounces its actual localStorage
        // write (see LocalOrganizationStore) --
        // flush it now so a rename typed right before navigating
        // away is guaranteed to be on disk, not just still queued.
        OrganizationService.flushPendingWrites();

        navigate("/assistant");

    }

  return (
    <main className="landing">

      <AppHeader totalReview />

      {/* The user's name: the words inside the box alone, no label above it (owner, 2026-11-09: the label and the placeholder said the
          same). The app's user, not an Organisation's founder (owner, 2026-11-22). (THE CAPABILITY GENERATOR IS A FUTURE FEATURE (owner, 2026-11-22 18:58 UTC+2:
          "Move the Capability generator to future features"): the Landing page opens System Selection alone; its page stays, unlinked, until it is built.) */}
      <section className="user-name-section">

          <TextBox
              id="user-name-input"
              className="user-name-input"
              placeholder={USER_NAME_WORDS}
              aria-label={USER_NAME_WORDS}
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              onKeyDown={(event) => {
                  if (event.key === "Enter") {
                      commitUserName();
                  }
              }}
              onBlur={commitUserName}
          />

      </section>

      <section className="organization-section">

        <div className="organization-list">

            {organizations.map((organization, index) => (

                <div
                    key={organization.id}
                    className={
                        "organization-row" +
                        (selectedId === organization.id ? " organization-row-selected" : "")
                    }
                >

                    {/*
                        role/tabIndex/onKeyDown mirror SystemItem and
                        CapabilityList: selecting an Organization was
                        mouse-only, so a keyboard user could reach this
                        row's name field and Remove button but had no
                        way to actually switch which Organization is
                        selected.

                        The `target === currentTarget` guard is what
                        those two don't need: this row CONTAINS a text
                        input, and keydown bubbles. Without the guard,
                        typing a space into an Organization's name
                        would both select the row and -- because of
                        preventDefault below -- swallow the space, so
                        names could never contain one. Restricting the
                        handler to keys pressed on the row ITSELF keeps
                        the field behaving normally.
                    */}
                    <PressRow
                        className="organization-row-main"
                        ownKeysOnly
                        onPress={() => selectOrganization(organization.id)}
                    >

                        <h1 className="organization-name">

                            <span className="organization-number">
                                {index + 1}.
                            </span>

                            <TextBox
                                className="organization-name-input"
                                aria-label={`Organisation ${index + 1} name`}
                                placeholder="Organisation name"
                                value={organization.name}
                                onChange={(event) =>
                                    renameOrganization(organization.id, event.target.value)
                                }
                            />

                        </h1>

                        {/* (THE X INSIDE THE CELL (owner, 2026-11-23 16:19 UTC+2: "Instead of having the x (delete) buttons out next to the organisation's cells, place
                            them in, and use the proper x button"): the in-cell x, frameless, at the cell's right end, as a Journey subchannel's line has it.) */}
                        <CellRemoveButton
                            className="organization-cell-remove"
                            aria-label={`Remove ${organization.name || "organization"}`}
                            onClick={(event) => { event.stopPropagation(); requestRemoveOrganization(organization.id); }} />

                    </PressRow>

                    {/* (AN ARROW TO ITS SYSTEMS (owner, 2026-11-23 16:19 UTC+2: "Remove the System Slection button, instead place an arrow next to each organization
                        cell"): it selects the Organisation and opens its Capabilities.) */}
                    <NavArrow
                        direction="next"
                        className="page-arrow organization-open"
                        label={`Open ${organization.name || "the organisation"}`}
                        onClick={() => openOrganization(organization.id)} />

                </div>

            ))}

        </div>

        <div className="organization-actions">

            {/* (Their words short, one line each in a row of three: what they act on is the list above them; their names say it in full. Each with its symbol
                (owner, 2026-11-22 19:31 UTC+2: "for the Add/import/ export use the proper symbols"): the plus, an arrow into a tray (a file comes in), an arrow out of
                it (a file goes out).) */}
            <AddButton
                aria-label="Add Organisation"
                onClick={addOrganization}>
                <svg className="organization-action-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="organization-action-word">Add</span>
            </AddButton>

            {/* (Export before Import: keep a copy first, then bring one in; owner, 2026-11-22 20:41 UTC+2: "Swap export with import, as it seems more logical order".) */}
            <AddButton
                aria-label="Export Organisation"
                disabled={!selectedId}
                title={selectedId ? undefined : "Select an Organisation to export"}
                onClick={exportOrganization}>
                <svg className="organization-action-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 12V3M6.5 6.5 10 3l3.5 3.5M4 13v3h12v-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="organization-action-word">Export</span>
            </AddButton>

            <AddButton
                aria-label="Import Organisation"
                onClick={() => importInputRef.current?.click()}>
                <svg className="organization-action-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v9M6.5 8.5 10 12l3.5-3.5M4 13v3h12v-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="organization-action-word">Import</span>
            </AddButton>

            {/* (RELOAD WITH THE OTHER BUTTONS OF THE LIST (owner, 2026-11-22 20:35 UTC+2: "Place the reload with the other similar buttons"): it refreshes the two
                example Organisations of this list, then reloads the app.) */}
            <AddButton
                aria-label="Reload the app and refresh the examples"
                onClick={async () => { await refreshExampleOrganizations(); await AppInstallService.reload(); }}>
                <svg className="organization-action-icon" viewBox="2 2 16 16" aria-hidden="true"><path d="M16 10a6 6 0 1 1-2-4.5M16 3v3.5h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="organization-action-word">Reload</span>
            </AddButton>

        </div>

        <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            aria-label="Organisation file to import"
            onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) {
                    void importOrganization(file);
                }
            }}
        />

        {importError && (
            <p className="organization-hint" role="alert">{importError}</p>
        )}

        {storageAtRisk && organizations.length > 0 && (
            <p className="organization-hint">
                Export each Organisation to keep a copy: this browser may clear its stored data when space runs low.
            </p>
        )}

        {app.updateReady && (
            <p className="organization-hint" role="status">
                A new version of Tiles is ready: press Reload to use it.
            </p>
        )}

        {app.canInstall && (
            <p className="organization-hint">
                Install Tiles as an app: its own icon and window, and it opens with no connection. <TextLink onClick={() => void AppInstallService.install()}>Install</TextLink>
            </p>
        )}

        {!app.canInstall && app.appleShare && (
            <p className="organization-hint">
                Install Tiles as an app: press Share, then Add to Home Screen.
            </p>
        )}

        {organizations.length === 0 && (
            <p className="organization-hint">
                Create an Organisation to continue.
            </p>
        )}

        {organizations.length > 1 && !selectedId && (
            <p className="organization-hint">
                Open an Organisation with its arrow.
            </p>
        )}

        {/* (THE COPYRIGHT AND THE TWO LEGAL PAGES (owner, 2026-11-27 20:20 UTC+2: "In the app - yes do"): the notes' own line, its links the app's text links,
            opening the pages on the website.) */}
        <p className="organization-hint">
            © 2026 North Stardust ·{" "}
            <TextLink as="a" href={TERMS_URL} target="_blank" rel="noreferrer" onClick={(event) => { event.preventDefault(); openExternal(TERMS_URL); }}>Terms</TextLink>
            {" "}·{" "}
            <TextLink as="a" href={PRIVACY_URL} target="_blank" rel="noreferrer" onClick={(event) => { event.preventDefault(); openExternal(PRIVACY_URL); }}>Privacy</TextLink>
        </p>

      </section>


      {/* THE TERMS, AGREED ONCE (Research 11, section 3, change 2): the app's confirmation dialog; it closes only by agreeing. */}
      {termsOpen && (

        <div className="confirmation-overlay">

            <div className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="terms-title">

                <h2 id="terms-title" className="confirmation-title">
                    Welcome to Tiles
                </h2>

                <p className="confirmation-question">
                    Tiles is free during the Beta. Please read the{" "}
                    <TextLink as="a" href={TERMS_URL} target="_blank" rel="noreferrer" onClick={(event) => { event.preventDefault(); openExternal(TERMS_URL); }}>Terms of Use</TextLink>
                    {" "}and the{" "}
                    <TextLink as="a" href={PRIVACY_URL} target="_blank" rel="noreferrer" onClick={(event) => { event.preventDefault(); openExternal(PRIVACY_URL); }}>Privacy Policy</TextLink>.
                </p>

                <TickField checked={termsTicked} onChange={event => setTermsTicked(event.target.checked)}>
                    I am 18 or over, and I agree to the Terms of Use and the Privacy Policy.
                </TickField>

                <div className="confirmation-actions">

                    <AddButton look="confirmation-button primary"
                        disabled={!termsTicked}
                        onClick={() => { TermsService.agree(); setTermsOpen(false); }}>
                        Continue
                    </AddButton>

                </div>

            </div>

        </div>

      )}

      {pendingRemoveId && (

        <div className="confirmation-overlay" onClick={cancelRemoveOrganization}>

            <div className="confirmation-dialog" onClick={(event) => event.stopPropagation()}>

                <h2 className="confirmation-title">
                    Remove Organisation?
                </h2>

                <p className="confirmation-question">
                    {(organizations.find(organization => organization.id === pendingRemoveId)?.name || "This organisation").trim() || "This organisation"}
                    {" "}and everything saved under it will be permanently deleted.
                </p>

                <div className="confirmation-actions">

                    <AddButton look="confirmation-button secondary"
                        onClick={cancelRemoveOrganization}>
                        Cancel
                    </AddButton>

                    <AddButton look="confirmation-button danger"
                        onClick={confirmRemoveOrganization}>
                        Delete
                    </AddButton>

                </div>

            </div>

        </div>

      )}

      <UserPreferencesDialog
          open={preferencesOpen}
          onClose={() => setPreferencesOpen(false)}
      />

    </main>
  );
}
