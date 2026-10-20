import { useEffect, useRef, useState } from "react";
import RemoveButton from "../components/controls/RemoveButton.tsx";
import AddButton from "../components/controls/AddButton.tsx";
import TextBox from "../components/controls/TextBox.tsx";
import { useNavigate } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import UserPreferencesDialog from "../components/UserPreferencesDialog";

import {
    OrganizationService,
    OrganizationSummary,
    UnsupportedFormatVersionError
} from "../services/OrganizationService";
import { PreferencesService } from "../services/PreferencesService.ts";
import { refreshExampleOrganizations } from "../services/ExampleOrganizations.ts";

import "../styles/global.css";
import "../styles/landing.css";
import "../styles/system-confirmation.css";

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
            const seeded = OrganizationService.create("Organization 1");
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
            `Organization ${organizations.length + 1}`
        );

        setOrganizations(previous => [...previous, created]);

        OrganizationService.setSelected(created.id);
        setSelectedId(created.id);

    }

    const importInputRef = useRef<HTMLInputElement | null>(null);

    // Says why a chosen file could not be imported, until the next try.
    const [importError, setImportError] = useState<string | null>(null);

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
                setImportError("That file is not a North Stardust organization.");
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
                    : "That file could not be read as an organization."
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
            const seeded = OrganizationService.create("Organization 1");
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

    const canProceed = organizations.length > 0 && selectedId !== null;

    function handleProceed(path: string) {

        if (!canProceed) {
            return;
        }

        // Renaming an Organization debounces its actual localStorage
        // write (see LocalOrganizationStore) --
        // flush it now so a rename typed right before navigating
        // away is guaranteed to be on disk, not just still queued.
        OrganizationService.flushPendingWrites();

        navigate(path);

    }

  return (
    <main className="landing">

      <AppHeader reloadable onReload={refreshExampleOrganizations} />

      <section className="user-name-section">

          <label className="user-name-label" htmlFor="user-name-input">
              User Name
          </label>

          <TextBox
              id="user-name-input"
              className="user-name-input"
              placeholder="Enter your name"
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
                    <div
                        className="organization-row-main"
                        role="button"
                        tabIndex={0}
                        onClick={() => selectOrganization(organization.id)}
                        onKeyDown={(event) => {
                            if (event.target !== event.currentTarget) {
                                return;
                            }
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                selectOrganization(organization.id);
                            }
                        }}
                    >

                        <h1 className="organization-name">

                            <span className="organization-number">
                                {index + 1}.
                            </span>

                            <TextBox
                                className="organization-name-input"
                                aria-label={`Organization ${index + 1} name`}
                                placeholder="Organization name"
                                value={organization.name}
                                onChange={(event) =>
                                    renameOrganization(organization.id, event.target.value)
                                }
                            />

                        </h1>

                    </div>

                    <RemoveButton
                        aria-label={`Remove ${organization.name || "organization"}`}
                        onClick={() => requestRemoveOrganization(organization.id)} />

                </div>

            ))}

        </div>

        <div className="organization-actions">

            <AddButton
                onClick={addOrganization}>
                + Add Organization
            </AddButton>

            <AddButton
                onClick={() => importInputRef.current?.click()}>
                Import Organization
            </AddButton>

            <AddButton
                disabled={!selectedId}
                title={selectedId ? undefined : "Select an Organization to export"}
                onClick={exportOrganization}>
                Export Organization
            </AddButton>

        </div>

        <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            aria-label="Organization file to import"
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

        {organizations.length === 0 && (
            <p className="organization-hint">
                Create an Organization to continue.
            </p>
        )}

        {organizations.length > 1 && !selectedId && (
            <p className="organization-hint">
                Select an Organization to continue.
            </p>
        )}

      </section>

      <div className="landing-cards">

     <button
    className="landing-card"
    disabled={!canProceed}
    onClick={() => handleProceed("/assistant")}
>
    System Selection
</button>

<button
    className="landing-card"
    disabled={!canProceed}
    onClick={() => handleProceed("/generator")}
>
    Capability Generator
</button>

      </div>

      {pendingRemoveId && (

        <div className="confirmation-overlay" onClick={cancelRemoveOrganization}>

            <div className="confirmation-dialog" onClick={(event) => event.stopPropagation()}>

                <h2 className="confirmation-title">
                    Remove Organization?
                </h2>

                <p className="confirmation-question">
                    {(organizations.find(organization => organization.id === pendingRemoveId)?.name || "This organization").trim() || "This organization"}
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
