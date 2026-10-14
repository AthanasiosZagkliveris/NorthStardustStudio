/**
 * Helpers installed in the gallery page as window.__lib (page.addInitScript),
 * for the functions the asset modules run inside the page. Colour work goes
 * through a canvas, so any CSS colour the browser understands (hsl(),
 * color-mix(), color(srgb ...)) comes out as plain rgb.
 */
export const INPAGE = `
(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const rgba = value => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = "#000";
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
        return [r, g, b, a];
    };
    const luminance = ([r, g, b]) => {
        const [x, y, z] = [r, g, b].map(c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); });
        return 0.2126 * x + 0.7152 * y + 0.0722 * z;
    };
    const ratio = (one, other) => {
        const [high, low] = [luminance(one), luminance(other)].sort((a, b) => b - a);
        return (high + 0.05) / (low + 0.05);
    };
    /* A CSS colour as [r, g, b]; a translucent colour is laid over "under" ([r, g, b]) first. */
    const rgb = (value, under) => {
        const [r, g, b, a] = rgba(value);
        if (a === 255 || !under) return [r, g, b];
        const k = a / 255;
        return [r * k + under[0] * (1 - k), g * k + under[1] * (1 - k), b * k + under[2] * (1 - k)];
    };
    const same = (one, other) => {
        const x = rgb(one), y = rgb(other);
        return Math.abs(x[0] - y[0]) < 1.5 && Math.abs(x[1] - y[1]) < 1.5 && Math.abs(x[2] - y[2]) < 1.5;
    };
    const transparent = value => rgba(value)[3] === 0;
    window.__lib = { rgba, rgb, ratio, same, transparent };
})();
`;
