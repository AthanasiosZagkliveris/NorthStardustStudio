const DATE_FORMAT_KEY = "northstardust-date-format";

export type DateFormat = "US" | "EU";

type Listener = () => void;

const listeners = new Set<Listener>();

function readDateFormat(): DateFormat {

    return localStorage.getItem(DATE_FORMAT_KEY) === "EU" ? "EU" : "US";

}

/**
 * Stores small, app-wide user preferences (currently
 * just the preferred date presentation) in
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
