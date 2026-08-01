import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import UserPreferencesDialog from "../components/UserPreferencesDialog";

import { OrganizationService, OrganizationSummary } from "../services/OrganizationService";
import { PreferencesService } from "../services/PreferencesService.ts";

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
        // write (see OrganizationService's DebouncedLocalStorage) --
        // flush it now so a rename typed right before navigating
        // away is guaranteed to be on disk, not just still queued.
        OrganizationService.flushPendingWrites();

        navigate(path);

    }

  return (
    <main className="landing">

      <AppHeader />

      <section className="user-name-section">

          <label className="user-name-label" htmlFor="user-name-input">
              User Name
          </label>

          <input
              id="user-name-input"
              type="text"
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

                    <div
                        className="organization-row-main"
                        onClick={() => selectOrganization(organization.id)}
                    >

                        <h1 className="organization-name">

                            <span className="organization-number">
                                {index + 1}.
                            </span>

                            <input
                                type="text"
                                className="organization-name-input"
                                placeholder="Organization name"
                                value={organization.name}
                                onChange={(event) =>
                                    renameOrganization(organization.id, event.target.value)
                                }
                            />

                        </h1>

                    </div>

                    <button
                        type="button"
                        className="organization-remove"
                        aria-label={`Remove ${organization.name || "organization"}`}
                        title="Remove organization"
                        onClick={() => requestRemoveOrganization(organization.id)}
                    >
                        &minus;
                    </button>

                </div>

            ))}

        </div>

        <button
            type="button"
            className="organization-add-button"
            onClick={addOrganization}
        >
            + Add Organization
        </button>

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

                    <button
                        className="confirmation-button secondary"
                        onClick={cancelRemoveOrganization}
                    >
                        Cancel
                    </button>

                    <button
                        className="confirmation-button danger"
                        onClick={confirmRemoveOrganization}
                    >
                        Delete
                    </button>

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
