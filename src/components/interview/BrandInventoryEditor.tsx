import { CSSProperties, DragEvent, ReactNode, useRef, useState } from "react";
import { brandImageMissing } from "../../framework/engine/SystemCardCompleteness.ts";
import SectionTiles, { DialogHeading, type SectionTile } from "./SectionTiles.tsx";
import PictureBoxes, { type PictureBox } from "./PictureBoxes.tsx";
import type { CardBoxAdd } from "./CardBoxes.tsx";
import { UndoService } from "../../services/UndoService";
import { stableCardHue } from "../../framework/engine/AnswerUtils.ts";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import AssetPreviewImage from "./AssetPreviewImage.tsx";
import { ColumnHeading, GuidanceBullets } from "./ColumnHeads.tsx";
import StrategyTextArea from "./StrategyTextArea.tsx";
import { BusinessCard, BusinessRemove, OptionalNote } from "./BusinessCardFields.tsx";

import {
    BRAND_IMAGE_MAX,
    BRAND_IMAGE_MIN,
    BRAND_INVENTORY_SECTIONS,
    BrandAssetValue,
    BrandInventoryAnswerValue,
    asBrandInventoryValue,
    brandMarkFile
} from "../../framework/engine/AnswerUtils.ts";
import { railId } from "./rails/railItems.ts";
import { inwardOrigin } from "./CardTile.tsx";

interface BrandInventoryEditorProps {

    value: unknown;

    onChange: (value: BrandInventoryAnswerValue) => void;

    disabled?: boolean;

    /** See BrandStyleEditor.startNumber. */
    startNumber?: number;

    /** See BrandStyleEditor.columnsDivider. */
    columnsDivider?: ReactNode;

    /**
     * Whether the bullet guidance above the progress line shows.
     * Toggled by the Help button the page renders just above that
     * line -- see AnswerRendererProps.showInstructions.
     */
    showInstructions?: boolean;

    /** The page drawn as tiles (the page's tile system); the editor's own tests draw the whole page. */
    asTiles?: boolean;

    /** With `asTiles`: the tiles are handed to the page that holds them (the Style page, which carries the Icon & Logo and the Brand Images) instead of being a page of their own. */
    renderTiles?: (tiles: SectionTile[], missing: ReadonlyMap<string, readonly string[]>) => ReactNode;

}

// Everything this app saves goes into localStorage as JSON, and an
// image embedded as a data URL costs ~33% more than its raw bytes
// (base64). Measured headroom is around 12.8MB for the WHOLE origin --
// every Organization, all 24 Systems -- so an Inventory page holding
// up to 9 images needs a hard per-image ceiling, or one photo
// straight off a phone would exhaust the quota and break saving for
// everything else, not just this page.
const MAX_IMAGE_EDGE = 1400;
const RASTER_QUALITY = 0.82;

// Per-slot upload ceilings, checked BEFORE any processing so an
// oversized file is refused immediately rather than after a slow
// decode. Icons and logos are marks, not photographs, so they get
// the smaller budget; brand images are photographic and get the
// larger one.
//
// Worth knowing what a full page now costs: 2 marks at 50kB plus
// 5 images at 500kB is ~2.6MB of file, and base64 inflates that
// to ~3.5MB in localStorage -- roughly a quarter of the ~12.8MB
// measured headroom for the WHOLE origin (every Organization, all
// 24 Systems). Three or four Organizations filling this page to
// the limit would exhaust the quota and break saving app-wide.
const MAX_MARK_BYTES = 50 * 1024;
const MAX_BRAND_IMAGE_BYTES = 500 * 1024;

// Hard ceiling per stored asset, checked AFTER downscaling. An SVG
// is text and is stored as-is, so it gets the same ceiling to stop a
// pathological one doing the same damage.
const MAX_ASSET_BYTES = 900 * 1024;

const SVG_TYPE = "image/svg+xml";

const PNG_TYPE = "image/png";

/** What an icon or a logo may be: one file, an SVG or a PNG. */
const MARK_TYPES = SVG_TYPE + "," + PNG_TYPE;

function formatBytes(bytes: number): string {
    return bytes >= 1024 * 1024
        ? `${Math.round(bytes / (1024 * 1024))}MB`
        : `${Math.round(bytes / 1024)}KB`;
}

function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Could not read the file."));
        reader.readAsDataURL(file);
    });
}

/**
 * Roughly how many bytes a data URL occupies once stored. base64
 * encodes 3 bytes as 4 characters, so the payload is ~3/4 of the
 * string's length; the small header is ignored.
 */
function approximateBytes(dataUrl: string): number {
    const payload = dataUrl.slice(dataUrl.indexOf(",") + 1);
    return Math.round(payload.length * 0.75);
}

/**
 * Downscales a raster image so its longest edge fits MAX_IMAGE_EDGE
 * and re-encodes it as JPEG. SVGs pass through untouched -- they're
 * already small, and rasterizing a vector logo would defeat the
 * point of uploading one.
 */
async function prepareImage(file: File, downscale: boolean): Promise<string> {

    const dataUrl = await readAsDataUrl(file);

    if (file.type === SVG_TYPE) {
        return dataUrl;
    }

    // An icon or logo is stored byte-for-byte. Two reasons: it is
    // already capped at 50KB so there is nothing to save, and
    // re-encoding a PNG as JPEG would flatten its transparency onto
    // black -- which is exactly wrong for a mark meant to sit on any
    // background.
    if (!downscale) {
        return dataUrl;
    }

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error("Could not read that image."));
        element.src = dataUrl;
    });

    const longest = Math.max(image.width, image.height);
    const scale = longest > MAX_IMAGE_EDGE ? MAX_IMAGE_EDGE / longest : 1;

    if (scale === 1 && approximateBytes(dataUrl) <= MAX_ASSET_BYTES) {
        return dataUrl;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const context = canvas.getContext("2d");

    if (!context) {
        return dataUrl;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", RASTER_QUALITY);

}

/* ---------- Help: how to choose (the column "i"s) ---------- */

/** What each common format is for, where the page asks for the icon and logo. */
const MARK_FORMATS: InfoPoint[] = [
    { title: "SVG", text: "a vector file: stays sharp at any size and is tiny, so it is the best format for a logo or icon on screen and on the web." },
    { title: "PNG", text: "a pixel image with a transparent background: use it when you only have the logo or icon as an image, at a large enough size to stay sharp." },
    { title: "PDF", text: "a vector file for print: the format printers and sign makers usually ask for, so keep one for business cards, signage and merchandise (upload the SVG or PNG here)." }
];

const SHAPE_ASSOCIATIONS: InfoPoint[] = [
    { title: "Circle", text: "unity, community, harmony and continuity." },
    { title: "Square", text: "stability, structure, reliability and balance." },
    { title: "Rectangle", text: "order, practicality, structure and professionalism." },
    { title: "Triangle", text: "direction, progress, strength and movement." },
    { title: "Hexagon", text: "balance, connection, efficiency and structure." },
    { title: "Organic shapes", text: "natural, friendly, creative and approachable." },
    { title: "Abstract shapes", text: "distinctive, conceptual and open to interpretation." },
    "These are common visual associations rather than fixed meanings."
];

const IMAGE_TYPES: InfoPoint[] = [
    { title: "Product", text: "shows what the organisation creates or offers." },
    { title: "People", text: "communicates human connection and relationships." },
    { title: "Environment", text: "establishes place, atmosphere and context." },
    { title: "Process", text: "shows making, working or craft." },
    { title: "Lifestyle", text: "shows how the brand fits into people's lives." },
    { title: "Detail", text: "highlights materials, textures, patterns or distinctive features." },
    { title: "Abstract", text: "communicates mood, ideas or visual character without a literal subject." },
    { title: "Editorial", text: "creates a considered and distinctive visual direction." }
];

/**
 * The Brand System's Inventory page (see AnswerType.BrandInventory).
 *
 * Same above/below-the-line arrangement as the Style page and the
 * Identity System's columns: headings and bullet guidance sit above
 * the progress line, the upload controls below it.
 *
 * Uploads are downscaled and embedded as data URLs rather than
 * written to disk, because this app has no filesystem access. An
 * upload that would still be too large after downscaling is REFUSED
 * with a message rather than stored, so a single oversized file can
 * never exhaust the quota and silently break saving across the app.
 */
export default function BrandInventoryEditor({

    value,

    onChange,

    disabled = false,

    startNumber = 1,

    columnsDivider,

    showInstructions = true,

    asTiles = false,

    renderTiles

}: BrandInventoryEditorProps) {

    const inventory = asBrandInventoryValue(value);

    /* The answer as it is now, for a card left blank and taken away later. */
    const latest = useRef({ inventory, onChange });
    latest.current = { inventory, onChange };

    const [error, setError] = useState<string>("");

    async function acceptFile(
        file: File | undefined,
        expected: "mark" | "any",
        apply: (asset: BrandAssetValue) => void
    ) {

        if (!file) {
            return;
        }

        setError("");

        if (expected === "mark" && file.type !== SVG_TYPE && file.type !== PNG_TYPE) {
            setError(`"${file.name}" is not an SVG or a PNG. The icon and the logo each take one SVG or PNG file.`);
            return;
        }

        if (expected === "any" && !file.type.startsWith("image/")) {
            setError(`"${file.name}" is not an image.`);
            return;
        }

        const cap = expected === "any" ? MAX_BRAND_IMAGE_BYTES : MAX_MARK_BYTES;

        if (file.size > cap) {
            setError(
                `"${file.name}" is ${formatBytes(file.size)}. ` +
                `The limit is ${formatBytes(cap)}.`
            );
            return;
        }

        try {

            const dataUrl = await prepareImage(file, expected === "any");

            if (approximateBytes(dataUrl) > cap) {
                setError(
                    `"${file.name}" is still over ${formatBytes(cap)} ` +
                    "after resizing. Please use a smaller file."
                );
                return;
            }

            apply({ dataUrl, fileName: file.name });

        } catch {

            setError(`"${file.name}" could not be read as an image.`);

        }

    }

    /**
     * The one file of a mark, set or removed. Removing leaves `null`,
     * not nothing: an SVG or PNG saved by the page's earlier
     * two-file version stays saved, and `null` is what keeps it from
     * showing again in its place (see BrandMarkValue).
     */
    function setMark(mark: "icon" | "logo", asset: BrandAssetValue | undefined) {
        onChange({ ...inventory, [mark]: { ...inventory[mark], file: asset ?? null } });
    }

    function updateImage(index: number, patch: Partial<BrandInventoryAnswerValue["images"][number]>) {
        onChange({
            ...inventory,
            images: inventory.images.map(
                (image, position) => position === index ? { ...image, ...patch } : image
            )
        });
    }

    /**
     * The control sits in the corner of the holder, so it removes
     * the IMAGE -- not the slot, and not the Name and Short
     * description typed beside it. Those are the user's own words
     * and survive swapping or dropping the picture they were
     * written about; deleting them was never asked for and cannot
     * be undone.
     *
     * The one case where the slot itself goes is when it would be
     * left completely empty -- no image, no text -- and the page
     * is above the two slots it always shows. That is the only way
     * a slot added for a third, fourth or fifth image can be given
     * back, and it destroys nothing, because there is nothing left
     * in it to destroy.
     */
    /**
     * The card's own x (in its head): the whole image goes, its words with it, and the undo toast offers it back. Below the least number of
     * images the slot stays, emptied.
     */
    function removeWholeImage(index: number) {
        const before = inventory.images;
        const emptied = { dataUrl: "", fileName: "", name: "", description: "" };
        onChange({
            ...inventory,
            images: before.length > BRAND_IMAGE_MIN
                ? before.filter((_other, position) => position !== index)
                : before.map((image, position) => position === index ? emptied : image)
        });
        UndoService.offer("Image " + (index + 1) + " removed.", () => latest.current.onChange({ ...latest.current.inventory, images: before }));
    }

    function removeImage(index: number) {

        const image = inventory.images[index];

        const wouldBeEmpty = !image.name.trim() && !image.description.trim();

        if (wouldBeEmpty && inventory.images.length > BRAND_IMAGE_MIN) {

            onChange({
                ...inventory,
                images: inventory.images.filter((_other, position) => position !== index)
            });

            return;

        }

        updateImage(index, { dataUrl: "", fileName: "" });

    }

    function heading(offset: number) {
        return (
            <ColumnHeading
                offset={offset}
                title={BRAND_INVENTORY_SECTIONS[offset]}
                startNumber={startNumber}
            />
        );
    }

    function bullets(lines: ReactNode[]) {
        return <GuidanceBullets lines={lines} show={showInstructions} />;
    }

    function renderMarkSlot(mark: "icon" | "logo", aside?: ReactNode) {

        const label = mark === "icon" ? "Icon" : "Logo";
        const asset = brandMarkFile(inventory[mark]);

        return (

            <DropZone
                key={label}
                label={label}
                shape={mark}
                accept={MARK_TYPES}
                disabled={disabled}
                asset={asset}
                hint={asset?.fileName || `SVG or PNG, up to ${MAX_MARK_BYTES / 1024} KB`}
                onFile={(file) => acceptFile(file, "mark", (next) => setMark(mark, next))}
                onClear={() => setMark(mark, undefined)}
                aside={aside}
            />

        );

    }

    /*
        The two columns share their rows (see "Brand Inventory -- the
        shared rows", conversation.css): row 1 is the Logo beside
        Image 1, row 2 the Icon and its description beside Image 2,
        and every further image a row of its own. Each column spans
        as many rows as the longer of the two has slots.
    */
    const addingImage = inventory.images.every((image) => image.dataUrl) &&
        inventory.images.length < BRAND_IMAGE_MAX;

    const rows = Math.max(2, inventory.images.length + (addingImage ? 1 : 0));

    const rowsStyle = { "--inventory-rows": rows } as CSSProperties;

    /** One image's holder, with its name and description beside it; `key` is its place. */
    function imageZone(image: BrandInventoryAnswerValue["images"][number], index: number) {
        return (
                        <DropZone
                            key={index}
                            label={`Image ${index + 1}`}
                            shape="image"
                            accept="image/*"
                            disabled={disabled}
                            asset={image.dataUrl ? image : undefined}
                            onFile={(file) => acceptFile(file, "any", (asset) => updateImage(index, asset))}
                            onClear={() => removeImage(index)}
                            aside={
                                <div className="brand-image-text">
                                    <input
                                        type="text"
                                        className="interview-input brand-image-name"
                                        aria-label={`Image ${index + 1} name`}
                                        placeholder="Name"
                                        disabled={disabled}
                                        value={image.name}
                                        onChange={(event) => updateImage(index, { name: event.target.value })}
                                    />
                                    <StrategyTextArea
                                        className="interview-input brand-image-note"
                                        ariaLabel={`Image ${index + 1} description`}
                                        placeholder="Short description"
                                        disabled={disabled}
                                        value={image.description}
                                        onChange={(next) => updateImage(index, { description: next })}
                                    />
                                </div>
                            }
                        />
        );
    }

    /**
     * An image's floating card, built as every card is: the head holds the order number inside the name cell and the x at its right (the x takes the
     * image away, as it did in the picture's corner, and keeps the words), then the picture across the card and its words under it.
     */
    function imageCard(image: BrandInventoryAnswerValue["images"][number], index: number) {
        const what = "Image " + (index + 1);
        return (
            <BusinessCard
                key={index}
                className="brand-style-card"
                kind="Image"
                number={index + 1}
                name={image.name}
                onName={(name) => updateImage(index, { name })}
                open
                disabled={disabled}
                actions={<BusinessRemove what={what} disabled={disabled} onRemove={() => removeWholeImage(index)} />}
            >
                <div className="brand-inventory brand-image-card-body">
                    <DropZone
                        label="Image"
                        hint={image.fileName || undefined}
                        onClear={() => removeImage(index)}
                        shape="image"
                        accept="image/*"
                        disabled={disabled}
                        asset={image.dataUrl ? image : undefined}
                        onFile={(file) => acceptFile(file, "any", (asset) => updateImage(index, asset))}
                    />
                    <OptionalNote
                        label="Notes"
                        fieldId="Description"
                        ariaLabel={what + " usage"}
                        placeholder="What the image is used for"
                        disabled={disabled}
                        value={image.description}
                        onChange={(next) => updateImage(index, { description: next })}
                    />
                </div>
            </BusinessCard>
        );
    }

    /* ---------- The page as tiles: each section's guidance and uploads ---------- */

    /** Each section's guidance as the "i" beside its title. */
    const guidance: InfoPoint[][] = [
        [
            `Upload your icon and logo in PNG or SVG formats, with a maximum file size of ${MAX_MARK_BYTES / 1024} KB each.`, ...MARK_FORMATS,
            "Choose an icon and logo that represent your organisation clearly and consistently.", ...SHAPE_ASSOCIATIONS,
            "Icon vs Logo: the icon should remain recognisable at small sizes, while the logo can combine the icon with the organisation name."
        ],
        [
            `Upload ${BRAND_IMAGE_MIN}–${BRAND_IMAGE_MAX} images that represent the visual character of your brand, with a maximum file size of ${MAX_BRAND_IMAGE_BYTES / 1024} KB each.`,
            "Choose images that consistently communicate your brand's visual character, atmosphere and subject matter.", ...IMAGE_TYPES,
            "Image selection: choose images with a recognisable visual character through subject matter, composition, lighting, colour, texture or atmosphere.",
            "Variety: use different subjects or perspectives while maintaining enough consistency for the collection to feel like one brand."
        ]
    ];

    const columnBodies: ReactNode[] = [
        (
            <>

                {/* Row 1: the Logo, on its own, as wide as the column. */}
                {renderMarkSlot("logo")}

                {/* Row 2: the Icon, and beside it what the two show and
                    how they are used -- its top and bottom level with
                    the Icon's box. */}
                {renderMarkSlot("icon", (
                    <OptionalNote
                        label="Notes"
                        fieldId="Description"
                        ariaLabel="Icon and logo description"
                        placeholder="What the logo and icon show, what they mean, and how they should be used"
                        disabled={disabled}
                        value={inventory.markDescription}
                        onChange={(next) => onChange({ ...inventory, markDescription: next })}
                    />
                ))}

            </>
        ),
        (
            <>

                {/*
                    Each image beside ONE text holder: its name on top,
                    its description under it (room for five lines, and
                    growing past them). The image's box is as tall as
                    that holder, so the two end on one line. On screen
                    from the start -- an empty slot shows its holder
                    just as a filled one does.
                */}
                {inventory.images.map((image, index) => imageZone(image, index))}

                {/*
                    The way to go past the two default slots. Held
                    back until both of those are actually filled --
                    otherwise it would sit there as a third empty
                    holder next to two empty ones, which reads as
                    clutter rather than an invitation.
                */}
                {addingImage && (

                    <DropZone
                        label={`Image ${inventory.images.length + 1}`}
                        shape="image"
                        accept="image/*"
                        disabled={disabled}
                        asset={undefined}
                        onFile={(file) => acceptFile(file, "any", (asset) => onChange({
                            ...inventory,
                            images: [...inventory.images, { ...asset, name: "", description: "" }]
                        }))}
                    />

                )}

            </>
        )
    ];

    /* THE PAGE AS TILES (the page's tile system): two LARGE tiles. Icon & Logo carries the icon, in front; Brand Images carries the images. Icon & Logo opens its
       uploads in its dialog; Brand Images opens a box for each image (the image covers it, its title on top), and a box opens that image's card floating. */
    if (asTiles) {
        const imageId = (index: number) => "brand-image-" + index;
        const imageIndex = (id: string) => id.startsWith("brand-image-") ? Number(id.slice("brand-image-".length)) : -1;
        /** A card floating over its tile keeps the page's scope (its holder, its fields). */
        const floating = (card: ReactNode) => (
            <div className="brand-style brand-style-columns" style={{ "--answer-column-count": 1 } as CSSProperties}>
                <div className="brand-style-body brand-style-cards">{card}</div>
            </div>
        );

        const mark = brandMarkFile(inventory.icon) ?? brandMarkFile(inventory.logo);
        const markTile: SectionTile = {
            id: "brand-inventory-0",
            title: BRAND_INVENTORY_SECTIONS[0],
            large: true,
            view: true,
            rail: railId(BRAND_INVENTORY_SECTIONS[0]),
            picture: mark
                ? <img className="brand-tile-icon" src={mark.dataUrl} alt="" />
                : <span className="section-tile-picture-colour section-tile-picture-colour-empty">No icon yet</span>,
            content: () => (
                <div className="column-tile-content brand-inventory" data-rail={railId(BRAND_INVENTORY_SECTIONS[0])}>
                    <div className="business-engagement-section-head"><DialogHeading title={BRAND_INVENTORY_SECTIONS[0]} info={guidance[0]} noteSize="double" /></div>
                    {error && <p className="brand-inventory-error" role="alert">{error}</p>}
                    <div className="brand-style-body brand-inventory-rows" style={rowsStyle}>{columnBodies[0]}</div>
                </div>
            )
        };

        // WHAT A CARD STILL LACKS (SystemCardCompleteness.ts): an image with something written but not its picture and name lights its box and its tile.
        const missingById = new Map<string, readonly string[]>();
        inventory.images.forEach((image, index) => { const lacks = brandImageMissing(image); if (lacks.length > 0) { missingById.set(imageId(index), lacks); } });
        const imageBoxes: PictureBox[] = inventory.images.map((image, index) => ({
            id: imageId(index),
            missing: missingById.get(imageId(index)),
            label: "Image " + (index + 1) + ": " + (image.name.trim() || image.fileName || "no image yet"),
            style: image.dataUrl ? { backgroundImage: "url(" + image.dataUrl + ")" } : undefined,
            className: "picture-box-image" + (image.dataUrl ? "" : " picture-box-image-empty"),
            children: (
                <>
                    <span className="picture-box-name">{image.name.trim() || "Image " + (index + 1)}</span>
                    {!image.dataUrl && <span className="picture-box-line">Drag or click to add the image</span>}
                </>
            )
        }));
        const imageAdd: CardBoxAdd | undefined = inventory.images.length < BRAND_IMAGE_MAX
            ? {
                label: "image",
                disabled,
                onAdd: () => {
                    onChange({ ...inventory, images: [...inventory.images, { dataUrl: "", fileName: "", name: "", description: "" }] });
                    return imageId(inventory.images.length);
                },
                isBlank: (id: string) => {
                    const image = latest.current.inventory.images[imageIndex(id)];
                    return !image || (!image.dataUrl && !image.name.trim() && !image.description.trim());
                },
                onRemove: (ids: string[]) => {
                    const now = latest.current;
                    const off = ids.map(imageIndex);
                    now.onChange({ ...now.inventory, images: now.inventory.images.filter((_image, at) => !off.includes(at)) });
                }
            }
            : undefined;
        const imagesTile: SectionTile = {
            id: "brand-inventory-1",
            note: guidance[1],
            title: BRAND_INVENTORY_SECTIONS[1],
            large: true,
            view: true,
            rail: railId(BRAND_INVENTORY_SECTIONS[1]),
            holds: inventory.images.map((_image, index) => imageId(index)),
            add: imageAdd,
            cardFor: (id: string) => {
                const index = imageIndex(id);
                return index >= 0 && index < inventory.images.length ? floating(imageCard(inventory.images[index], index)) : null;
            },
            picture: inventory.images.some(image => image.dataUrl)
                ? (
                    <span className="brand-mosaic brand-mosaic-images" style={{ "--mosaic-across": Math.ceil(Math.sqrt(inventory.images.length)), "--mosaic-rows": Math.ceil(inventory.images.length / Math.ceil(Math.sqrt(inventory.images.length))) } as CSSProperties}>
                        {inventory.images.map((image, index) => <span key={index} className="brand-mosaic-image" data-card={imageId(index)} style={{ transformOrigin: inwardOrigin(index, inventory.images.length, Math.ceil(Math.sqrt(inventory.images.length))), ...(image.dataUrl ? { backgroundImage: "url(" + image.dataUrl + ")" } : {}) }} />)}
                    </span>
                )
                : <span className="section-tile-picture-colour section-tile-picture-colour-empty">No images yet</span>,
            content: () => (
                <div className="column-tile-content brand-inventory" data-rail={railId(BRAND_INVENTORY_SECTIONS[1])}>
                    <div className="business-engagement-section-head"><DialogHeading title={BRAND_INVENTORY_SECTIONS[1]} info={guidance[1]} noteSize="double" /></div>
                    {error && <p className="brand-inventory-error" role="alert">{error}</p>}
                    <PictureBoxes label="Images" items={imageBoxes} add={imageAdd} />
                </div>
            )
        };

        if (renderTiles) {
            return <>{renderTiles([markTile, imagesTile], missingById)}</>;
        }
        return (
            <div className="answer-columns business-foundation business-engagement business-capability column-tiles-page" style={{ "--answer-column-count": 1 } as CSSProperties}>
                <div
                    className="business-foundation-input business-foundation-card business-engagement-input"
                    data-anchor="column-tiles"
                    style={{ "--strategy-theme-hue": stableCardHue("column-tiles-brand-inventory") } as CSSProperties}
                >
                    <div className="card-scroll">
                        <div className="business-capability-section business-capability-tiles-section">
                            <div className="business-capability-heading-spacer" aria-hidden="true" />
                            <SectionTiles label="Inventory" hue={stableCardHue("column-tiles-brand-inventory")} tiles={[markTile, imagesTile]} incomplete={missingById} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (

        <div
            className="brand-inventory"
            style={{ "--answer-column-count": 2 } as CSSProperties}
        >

            {/*
                Row 1 -- headings, above the line.

                The guidance deliberately does NOT repeat what the
                page already shows: the holders say "Drag or click"
                themselves, and the fields carry Name / Short
                description placeholders. Only the size limits are
                stated here, because nothing else surfaces them until
                an upload is refused.
            */}
            <div className="brand-style-head">
                {heading(0)}
                {bullets([
                    <>
                        <InfoText text={`Upload your icon and logo in PNG or SVG formats, with a maximum file size of ${MAX_MARK_BYTES / 1024} KB each.`}>
                            <InfoNote label="Image formats & their purposes" points={MARK_FORMATS} fullList />
                        </InfoText>
                    </>,
                    <>
                        <InfoText text="Choose an icon and logo that represent your organisation clearly and consistently.">
                            <InfoNote label="Shape characteristics & common associations" points={SHAPE_ASSOCIATIONS} fullList />
                        </InfoText>
                    </>,
                    "Icon vs Logo: the icon should remain recognisable at small sizes, while the logo can combine the icon with the organisation name."
                ])}
            </div>

            <div className="brand-style-head">
                {heading(1)}
                {bullets([
                    `Upload ${BRAND_IMAGE_MIN}–${BRAND_IMAGE_MAX} images that represent the visual character of your brand, with a maximum file size of ${MAX_BRAND_IMAGE_BYTES / 1024} KB each.`,
                    <>
                        <InfoText text="Choose images that consistently communicate your brand's visual character, atmosphere and subject matter.">
                            <InfoNote label="Image types & common purposes" points={IMAGE_TYPES} fullList />
                        </InfoText>
                    </>,
                    "Image selection: choose images with a recognisable visual character through subject matter, composition, lighting, colour, texture or atmosphere.",
                    "Variety: use different subjects or perspectives while maintaining enough consistency for the collection to feel like one brand."
                ])}
            </div>

            {/* Row 2 -- the progress line, spanning both columns */}
            {columnsDivider && (
                <div className="answer-columns-divider">{columnsDivider}</div>
            )}

            {/* Row 3 -- the uploads, below the line */}
            {error && (
                <p className="brand-inventory-error" role="alert">{error}</p>
            )}

            <div className="brand-style-body brand-inventory-rows" data-rail={railId(BRAND_INVENTORY_SECTIONS[0])} style={rowsStyle}>

                {/* Row 1: the Logo, on its own, as wide as the column. */}
                {renderMarkSlot("logo")}

                {/* Row 2: the Icon, and beside it what the two show and
                    how they are used -- its top and bottom level with
                    the Icon's box. */}
                {renderMarkSlot("icon", (
                    <OptionalNote
                        label="Notes"
                        fieldId="Description"
                        ariaLabel="Icon and logo description"
                        placeholder="What the logo and icon show, what they mean, and how they should be used"
                        disabled={disabled}
                        value={inventory.markDescription}
                        onChange={(next) => onChange({ ...inventory, markDescription: next })}
                    />
                ))}

            </div>

            <div className="brand-style-body brand-inventory-rows" data-rail={railId(BRAND_INVENTORY_SECTIONS[1])} style={rowsStyle}>

                {/*
                    Each image beside ONE text holder: its name on top,
                    its description under it (room for five lines, and
                    growing past them). The image's box is as tall as
                    that holder, so the two end on one line. On screen
                    from the start -- an empty slot shows its holder
                    just as a filled one does.
                */}
                {inventory.images.map((image, index) => imageZone(image, index))}

                {/*
                    The way to go past the two default slots. Held
                    back until both of those are actually filled --
                    otherwise it would sit there as a third empty
                    holder next to two empty ones, which reads as
                    clutter rather than an invitation.
                */}
                {addingImage && (

                    <DropZone
                        label={`Image ${inventory.images.length + 1}`}
                        shape="image"
                        accept="image/*"
                        disabled={disabled}
                        asset={undefined}
                        onFile={(file) => acceptFile(file, "any", (asset) => onChange({
                            ...inventory,
                            images: [...inventory.images, { ...asset, name: "", description: "" }]
                        }))}
                    />

                )}

            </div>

        </div>

    );

}

/**
 * One upload slot: its label (with, for the Icon and Logo, the file
 * it holds or what it takes on the same line), then a preview holder
 * that is both the drop target and the button that opens the file
 * dialog, and whatever sits beside the holder.
 *
 * The holder accepts a drag-and-drop, but being a BUTTON is what
 * carries the accessible name and keyboard operation -- a drop
 * target alone is unreachable without a pointer, so the button is
 * the equivalent path rather than a nicety.
 */
function DropZone({

    label,

    shape,

    accept,

    disabled,

    asset,

    onFile,

    onClear,

    hint,

    aside,

    bare = false

}: {

    label: string;

    /**
     * How the holder is sized in its row: the Logo fills its column,
     * the Icon is square, an image shares its row with its text
     * holder (see "Brand Inventory -- the shared rows").
     */
    shape: "logo" | "icon" | "image";

    accept: string;

    disabled: boolean;

    asset: BrandAssetValue | undefined;

    onFile: (file: File | undefined) => void;

    onClear?: () => void;

    /**
     * Beside the label, on its line: the file the slot holds, or
     * what it takes while empty. The Icon and Logo slots carry one.
     */
    hint?: string;

    /**
     * What sits BESIDE the holder, as tall as it: an image's text
     * holder, the Icon's description.
     */
    aside?: ReactNode;

    /** No label row above the holder: a card that names it in its head. */
    bare?: boolean;

    /** The x stands beside the holder, level with its top (in the card's x column), not on a row above it. */

}) {

    const inputRef = useRef<HTMLInputElement | null>(null);

    const [dragging, setDragging] = useState(false);

    function handleDrop(event: DragEvent<HTMLElement>) {

        event.preventDefault();

        setDragging(false);

        if (disabled) {
            return;
        }

        onFile(event.dataTransfer.files?.[0]);

    }

    return (

        <div className={"brand-asset-slot brand-asset-slot-" + shape}>

            {!bare && (
                <div className="brand-slot-label-row">
                    <span className="brand-slot-label">{label}</span>
                </div>
            )}

            <div className="brand-slot-row">

                {/*
                    The holder IS the upload control -- a real <button>,
                    not a clickable div, so it is reachable by Tab and
                    operable with Enter/Space like any other control.
                    That removes the need for a separate Upload/Replace
                    button beside it.

                    Removal stays available as a small control in the
                    holder's own corner rather than a button in a row
                    below: without it there would be no way to clear a
                    wrong logo or drop an image back below the minimum.
                */}
                <div className="brand-holder-wrap">

                    <button
                        type="button"
                        className={
                            "brand-asset-preview brand-dropzone brand-holder-button" +
                            (dragging ? " brand-dropzone-active" : "")
                        }
                        aria-label={asset ? `Replace ${label}` : `Upload ${label}`}
                        disabled={disabled}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                    >

                        {asset
                            ? <AssetPreviewImage dataUrl={asset.dataUrl} />
                            : <span className="brand-asset-empty" aria-hidden="true">
                                {dragging ? "Drop to upload" : "Drag or click"}
                              </span>}

                    </button>


                    {asset && onClear && <BusinessRemove what={label} disabled={disabled} onRemove={onClear} />}

                    {/*
                        The file input -- kept visually hidden and out
                        of the tab order, since the holder button above
                        is what opens it.
                    */}
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        className="brand-file-input"
                        tabIndex={-1}
                        aria-hidden="true"
                        onChange={(event) => {
                            onFile(event.target.files?.[0]);
                            // Cleared so picking the SAME file again still
                            // fires a change event.
                            event.target.value = "";
                        }}
                    />

                </div>

                {/* An image's name and description stand beside it; the Icon's Notes field stands last (below). */}
                {aside && shape === "image" && (
                    <div className="brand-slot-aside">{aside}</div>
                )}

            </div>

            {hint && <span className="brand-slot-hint">{hint}</span>}

            {aside && shape !== "image" && (
                <div className="brand-slot-aside">{aside}</div>
            )}

        </div>

    );

}
