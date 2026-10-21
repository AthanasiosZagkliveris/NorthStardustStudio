/**
 * A minimal writer of an Excel file (.xlsx) without any dependency: a ZIP of a few XML files, stored without
 * compression. A sheet has a header row, rows with an outline level (a row of level 1 is grouped under the row
 * above it and can be collapsed with the little minus at the left), column widths and a bold style for the
 * rows that head a group.
 */
import { crc32 } from "node:zlib";
import { writeFileSync } from "node:fs";

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
const col = n => { let s = ""; for (let i = n + 1; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s; return s; };

function zip(files) {
    const parts = [], central = [];
    let offset = 0;
    for (const [name, text] of files) {
        const data = Buffer.from(text, "utf8"), nameBuf = Buffer.from(name, "utf8"), crc = crc32(data);
        const local = Buffer.alloc(30);
        local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(0, 8); local.writeUInt16LE(0, 10); local.writeUInt16LE(0x21, 12);
        local.writeUInt32LE(crc >>> 0, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
        parts.push(local, nameBuf, data);
        const entry = Buffer.alloc(46);
        entry.writeUInt32LE(0x02014b50, 0); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6); entry.writeUInt16LE(0x0800, 8); entry.writeUInt16LE(0, 10); entry.writeUInt16LE(0, 12); entry.writeUInt16LE(0x21, 14);
        entry.writeUInt32LE(crc >>> 0, 16); entry.writeUInt32LE(data.length, 20); entry.writeUInt32LE(data.length, 24); entry.writeUInt16LE(nameBuf.length, 28); entry.writeUInt32LE(offset, 42);
        central.push(entry, nameBuf);
        offset += 30 + nameBuf.length + data.length;
    }
    const size = central.reduce((n, b) => n + b.length, 0);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(size, 12); end.writeUInt32LE(offset, 16);
    return Buffer.concat([...parts, ...central, end]);
}

/**
 * @param {string} path
 * @param {{ name: string, header: string[], rows: { cells: (string|number)[], level?: number, bold?: boolean }[], widths?: number[] }} sheet
 */
export function writeXlsx(path, sheet) {
    const nc = sheet.header.length;
    const cell = (v, r, c, style) => (typeof v === "number" ? `<c r="${col(c)}${r}" s="${style}"><v>${v}</v></c>` : `<c r="${col(c)}${r}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${esc(v)}</t></is></c>`);
    const lines = [`<row r="1" ht="22" customHeight="1">${sheet.header.map((h, c) => cell(h, 1, c, 1)).join("")}</row>`];
    sheet.rows.forEach((row, i) => {
        const r = i + 2;
        const next = sheet.rows[i + 1];
        const collapsed = !(row.level) && next && next.level ? ' collapsed="1"' : "";
        const grouped = row.level ? ` outlineLevel="${row.level}" hidden="1"` : "";
        lines.push(`<row r="${r}"${grouped}${collapsed}>${row.cells.map((v, c) => cell(v, r, c, row.bold ? 2 : 3)).join("")}</row>`);
    });
    const cols = (sheet.widths ?? sheet.header.map(() => 18)).map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("");
    const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetPr><outlinePr summaryBelow="0"/></sheetPr><dimension ref="A1:${col(nc - 1)}${sheet.rows.length + 1}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="18" outlineLevelRow="1"/><cols>${cols}</cols><sheetData>${lines.join("")}</sheetData><autoFilter ref="A1:${col(nc - 1)}${sheet.rows.length + 1}"/></worksheet>`;
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2F6B58"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEAF1EE"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs></styleSheet>`;
    const files = [
        ["[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
        ["_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
        ["xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${esc(sheet.name)}" sheetId="1" r:id="rId1"/></sheets></workbook>`],
        ["xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
        ["xl/worksheets/sheet1.xml", sheetXml],
        ["xl/styles.xml", styles]
    ];
    writeFileSync(path, zip(files));
}
