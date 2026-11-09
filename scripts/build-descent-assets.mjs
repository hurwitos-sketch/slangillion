import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const sourceRoot = process.argv[2] || "/workspace/generated_images";
const out = "public/art/descent";
await mkdir(out, { recursive: true });
const sprites = {
  courier: "exec-34f9fb0d-b929-41f2-bf6d-176ef544be29.png",
  mc: "exec-fadd47a8-0e8a-48cc-bb70-0a28f81766bd.png",
  pathfinder: "exec-c0d145d5-57b6-4371-928a-d2228f372bdb.png",
  tag: "exec-695b7001-fdba-4c37-b2a2-206d22d46f29.png",
  kickflip: "exec-4698d722-76d5-44ff-a288-4939c9b19f51.png",
  dj: "exec-77bcba46-0391-4bf0-b394-ebf60b7dd388.png",
  remix: "exec-a075dfec-2c73-4416-b984-cb203ffb17ad.png",
  echo: "exec-17a6e675-63ac-42d7-bfe0-8c7d74a89212.png",
};
const manifest = {
  columns: 4,
  rows: 3,
  cellSize: 192,
  frames: [
    "idle",
    "walk-a",
    "walk-b",
    "dig-raised",
    "dig-ground",
    "break",
    "fall",
    "land",
    "portal",
    "arrive",
    "walk-pass",
    "dig-mid",
  ],
  sources: { ...sprites },
  alphaVerified: [],
};
for (const [id, file] of Object.entries(sprites)) {
  const input = path.join(sourceRoot, file);
  const metadata = await sharp(input).metadata();
  if (!metadata.hasAlpha) throw new Error(`${id}: source needs real alpha`);
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let transparent = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 16) transparent++;
  const fraction = transparent / (info.width * info.height);
  if (fraction < 0.2)
    throw new Error(
      `${id}: source is not sufficiently transparent; no color-key workaround allowed`,
    );
  const layers = [];
  for (let i = 0; i < 12; i++) {
    const left = Math.floor(((i % 4) * info.width) / 4),
      right = Math.floor((((i % 4) + 1) * info.width) / 4),
      top = Math.floor((Math.floor(i / 4) * info.height) / 3),
      bottom = Math.floor(((Math.floor(i / 4) + 1) * info.height) / 3);
    let last = 0;
    for (let y = top; y < bottom; y++)
      for (let x = left; x < right; x++)
        if (data[(y * info.width + x) * 4 + 3] > 96) last = y - top;
    const cell = await sharp(input)
      .extract({ left, top, width: right - left, height: last + 1 })
      .resize({ width: 384 })
      .png()
      .toBuffer();
    const cellHeight = (await sharp(cell).metadata()).height;
    const normalized = await sharp({
      create: {
        width: 384,
        height: 384,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: cell, left: 0, top: 360 - (cellHeight - 1) }])
      .png()
      .toBuffer();
    layers.push({
      input: normalized,
      left: (i % 4) * 384,
      top: Math.floor(i / 4) * 384,
    });
  }
  const atlas = await sharp({
    create: {
      width: 1536,
      height: 1152,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(layers)
    .png()
    .toBuffer();
  await sharp(atlas)
    .resize(768, 576)
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(`${out}/${id}-actions.webp`);
  manifest.alphaVerified.push(id);
  console.log(id, `${Math.round(fraction * 100)}% transparent`);
}
const combined = path.join(
  sourceRoot,
  "exec-ff5d9b97-e7cd-4304-8602-caac0d4cee87.png",
);
const meta = await sharp(combined).metadata();
const half = Math.floor(meta.height / 2);
for (const [name, top, height] of [
  ["city", 0, half],
  ["subway", half, meta.height - half],
])
  await sharp(combined)
    .extract({ left: 0, top, width: meta.width, height })
    .resize(1200, 750, { fit: "cover" })
    .webp({ quality: 86 })
    .toFile(`${out}/${name}.webp`);
for (const [name, file] of Object.entries({
  caves: "exec-a2d07468-7e8f-466d-beef-abffb0dc47ac.png",
  trenches: "exec-d41ebe35-9d98-4fe6-9b06-670395de12b9.png",
  underground: "exec-7cf6bda7-5ba3-4305-b04b-9c0bfe01ec18.png",
}))
  await sharp(path.join(sourceRoot, file))
    .resize(1200, 750, { fit: "cover" })
    .webp({ quality: 86 })
    .toFile(`${out}/${name}.webp`);
await writeFile(
  `${out}/manifest.json`,
  JSON.stringify(manifest, null, 2) + "\n",
);
