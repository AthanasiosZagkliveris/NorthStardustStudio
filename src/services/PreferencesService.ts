const DATE_FORMAT_KEY = "northstardust-date-format";
const USER_NAME_KEY = "northstardust-user-name";

export type DateFormat = "US" | "EU";

type Listener = () => void;

const listeners = new Set<Listener>();

function readDateFormat(): DateFormat {

    return localStorage.getItem(DATE_FORMAT_KEY) === "EU" ? "EU" : "US";

}

function readUserName(): string {

    return localStorage.getItem(USER_NAME_KEY) ?? "";

}

/**
 * Stores small, app-wide user preferences (the
 * preferred date presentation, and the single User
 * Name -- one user per App, see Landing.tsx) in
 * localStorage, and notifies subscribers whenever a
 * preference changes so every open Date field --
 * regardless of which Section/Table it lives in --
 * can update immediately.
 */
export const PreferencesService = {

    /**
     * Returns the user's preferred date presentation:
     * "US" (MM/DD/YYYY) or "EU" (DD/MM/YYYY).
     */
    getDateFormat(): DateFormat {

        return readDateFormat();

    },

    /**
     * Sets the user's preferred date presentation.
     */
    setDateFormat(format: DateFormat): void {

        localStorage.setItem(DATE_FORMAT_KEY, format);

        listeners.forEach(listener => listener());

    },

    /**
     * Toggles between "US" and "EU" date presentation.
     */
    toggleDateFormat(): DateFormat {

        const next: DateFormat = readDateFormat() === "US" ? "EU" : "US";

        PreferencesService.setDateFormat(next);

        return next;

    },

    /**
     * Returns the App's single User Name (there is only
     * ever one -- see Landing.tsx), or "" if none has
     * been entered yet.
     */
    getUserName(): string {

        return readUserName();

    },

    /**
     * Sets the App's single User Name.
     */
    setUserName(name: string): void {

        localStorage.setItem(USER_NAME_KEY, name);

        listeners.forEach(listener => listener());

    },

    /**
     * Subscribes to preference changes. Returns an
     * unsubscribe function.
     */
    subscribe(listener: Listener): () => void {

        listeners.add(listener);

        return () => {
            listeners.delete(listener);
        };

    }

};
