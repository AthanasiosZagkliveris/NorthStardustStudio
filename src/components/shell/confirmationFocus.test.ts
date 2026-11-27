import { beforeAll, describe, expect, it } from "vitest";

import { installConfirmationFocus } from "./confirmationFocus";

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

function press(shiftKey = false) {
    const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey, bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    return event.defaultPrevented;
}

/** The keyboard stays in an open confirmation (Interface 7, P6; WCAG 2.2, 2.1.2 and 2.4.3). */
describe("an open confirmation", () => {
    beforeAll(() => installConfirmationFocus(document));

    it("takes the focus, keeps Tab going round its buttons, and gives the focus back when it closes", async () => {
        document.body.innerHTML = "<button id='page'>Remove</button>";
        const page = document.getElementById("page")!;
        page.focus();

        const overlay = document.createElement("div");
        overlay.innerHTML = "<div class='confirmation-dialog'><button id='no'>Cancel</button><button id='yes'>Remove</button></div>";
        document.body.appendChild(overlay);
        await tick();
        expect(document.activeElement?.id).toBe("no");

        document.getElementById("yes")!.focus();
        expect(press()).toBe(true);
        expect(document.activeElement?.id).toBe("no");
        expect(press(true)).toBe(true);
        expect(document.activeElement?.id).toBe("yes");

        page.focus();
        press();
        expect(document.activeElement?.id).toBe("no");

        overlay.remove();
        await tick();
        expect(document.activeElement).toBe(page);
    });

    it("keeps the button that asked for the focus first", async () => {
        document.body.innerHTML = "<div class='confirmation-dialog'><button>Read Terms</button><button id='agree' autofocus>I agree</button></div>";
        document.getElementById("agree")!.focus();
        await tick();
        expect(document.activeElement?.id).toBe("agree");
    });

    it("leaves Tab alone while no confirmation is open", () => {
        document.body.innerHTML = "<button>One</button>";
        expect(press()).toBe(false);
    });
});
