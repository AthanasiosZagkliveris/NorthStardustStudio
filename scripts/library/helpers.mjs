/** Shared by the asset modules: the real keyboard, and a wait for the 150ms colour swaps to finish. */

/** Let a transition (the swaps are 150ms) finish before reading a style. */
export const settle = page => page.waitForTimeout(260);

/** Tab from the top of the page until `locator` has the focus (a real keyboard focus, so :focus-visible applies). */
export async function focusByKeyboard(page, locator) {
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.mouse.move(0, 0);
    for (let press = 0; press < 600; press++) {
        await page.keyboard.press("Tab");
        if (await locator.evaluate(element => element === document.activeElement)) return true;
    }
    return false;
}

/** The first palette hue in the gallery, for the checks that do not depend on the hue (hover, focus). */
export const firstHue = page => page.evaluate(() => document.querySelector("[data-sample]").dataset.hue);
