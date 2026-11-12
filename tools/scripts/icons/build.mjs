/**
 * THE APP'S ICONS, MADE FROM THE APPROVED FLAT TILES LOGO (owner, 2026-11-12; the approved set is in the project Library,
 * designs/tiles-logo/final/; its flat files are kept in src-tauri/icon-source/). Makes exactly the icons the app uses, and no others:
 *
 *   src-tauri/icons/  32x32.png (the file drawn for 32px), 128x128.png, 128x128@2x.png, icon.png, icon.icns (from the 1024px file,
 *                     by `tauri icon`), icon.ico (the files drawn for 16 and 32px, with 48, 64 and 256px)
 *   public/           tiles-icon-32.png (the tab's PNG) and tiles-icon-180.png (Apple devices), from the 1024px file when missing
 *
 * `tauri icon` also writes the Microsoft Store tiles (Square…Logo.png, StoreLogo.png), 64x64.png and the Android and iOS folders: the
 * app uses none of them (`tauri.conf.json` lists the five it uses), so they are deleted again. Every PNG keeps only the parts that draw
 * it (no embedded credentials or notes) and is packed at the highest level, the same pixels.
 *
 *   npm run icons
 */
import { execSync } from "node:child_process";
import { copyFileSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import zlib from "node:zlib";

const SOURCE = "src-tauri/icon-source";
const ICONS = "src-tauri/icons";
const USED = new Set(["32x32.png", "128x128.png", "128x128@2x.png", "icon.png", "icon.icns", "icon.ico"]);

execSync("npx tauri icon " + SOURCE + "/tiles-flat-1024.png -o " + ICONS, { stdio: "ignore" });

for (const name of readdirSync(ICONS)) {
    if (!USED.has(name)) {
        rmSync(join(ICONS, name), { recursive: true, force: true });
    }
}

copyFileSync(join(SOURCE, "tiles-flat-32.png"), join(ICONS, "32x32.png"));
copyFileSync(join(SOURCE, "tiles-flat-32.png"), "public/tiles-icon-32.png");

// THE WINDOWS ICON: the PNGs as they are, inside one .ico (Windows Vista and later read PNG entries).
const sizes = [16, 32, 48, 64, 256].map(size => readFileSync(join(SOURCE, "tiles-flat-" + size + ".png")));
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
const directory = Buffer.alloc(16 * sizes.length);
let offset = 6 + directory.length;
sizes.forEach((png, index) => {
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20), at = index * 16;
    directory.writeUInt8(width >= 256 ? 0 : width, at);
    directory.writeUInt8(height >= 256 ? 0 : height, at + 1);
    directory.writeUInt16LE(1, at + 4);
    directory.writeUInt16LE(32, at + 6);
    directory.writeUInt32LE(png.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += png.length;
});
writeFileSync(join(ICONS, "icon.ico"), Buffer.concat([header, directory, ...sizes]));

// EVERY PNG SLIMMED: only the chunks that draw the picture, the pixels packed again at the highest level (the same pixels).
const KEEP = new Set(["IHDR", "PLTE", "tRNS", "IEND"]);
const crc32 = buffer => {
    let crc = 0xffffffff;
    for (const byte of buffer) {
        let c = (crc ^ byte) & 0xff;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        crc = (crc >>> 8) ^ c;
    }
    return (crc ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
};
const slim = file => {
    const png = readFileSync(file);
    const kept = [], idat = [];
    for (let at = 8; at < png.length;) {
        const length = png.readUInt32BE(at), type = png.toString("ascii", at + 4, at + 8), data = png.subarray(at + 8, at + 8 + length);
        if (type === "IDAT") idat.push(data); else if (KEEP.has(type)) kept.push([type, data]);
        at += 12 + length;
    }
    const old = Buffer.concat(idat), pixels = zlib.inflateSync(old);
    let packed = zlib.deflateSync(pixels, { level: 9, memLevel: 9 });
    if (packed.length >= old.length) packed = old;
    const parts = [png.subarray(0, 8)];
    for (const [type, data] of kept) {
        if (type === "IEND") parts.push(chunk("IDAT", packed));
        parts.push(chunk(type, data));
    }
    const out = Buffer.concat(parts);
    if (out.length < png.length) writeFileSync(file, out);
};
for (const name of readdirSync(ICONS).filter(name => name.endsWith(".png"))) {
    slim(join(ICONS, name));
}
for (const file of ["public/tiles-icon-32.png", "public/tiles-icon-180.png"].filter(existsSync)) {
    slim(file);
}

console.log("Icons made: " + readdirSync(ICONS).join(", ") + ".");
