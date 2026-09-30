/*
    FOCUS MODE: the interview page alone, at a reading width, without
    the rails, the Help, the header or the progress line
    (FocusModeButton.tsx). The choice is remembered on this device
    until it is exited; storage that cannot be read or written just
    means it is not remembered.
*/

export const FOCUS_KEY = "northstardust-focus-mode";

type Listener = () => void;

const listeners = new Set<Listener>();

function read(): boolean {
    try {
        return localStorage.getItem(FOCUS_KEY) === "on";
    } catch {
        return false;
    }
}

let on = read();

export const FocusModeService = {

    isOn(): boolean {
        return on;
    },

    set(next: boolean): void {
        if (next === on) {
            return;
        }
        on = next;
        try {
            if (next) {
                localStorage.setItem(FOCUS_KEY, "on");
            } else {
                localStorage.removeItem(FOCUS_KEY);
            }
        } catch {
            // Not remembered; still on for now.
        }
        listeners.forEach(listener => listener());
    },

    /** For tests: reads the remembered choice again. */
    reload(): void {
        on = read();
        listeners.forEach(listener => listener());
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }

};
