/**
 * Repaints the footer social glyphs with the brand gradient.
 *
 * The icons ship as flat white 64px PNGs. The email hero above them is a
 * pink → violet → blue gradient, so four white marks at the bottom read as
 * borrowed from somewhere else.
 *
 * ── Why the existing PNGs are recoloured rather than redrawn ────────────────
 *
 * The obvious approach is to re-render the simple-icons paths with a gradient
 * fill. That needs the path data, which is not in this repo and is not a
 * dependency — so it would mean pasting in four long `d` attributes copied from
 * somewhere, with no way to check a typo except by looking at the result.
 *
 * The shapes are already here and already correct. Each PNG is a white glyph on
 * transparency, so its ALPHA is an exact mask of the shape. Painting a gradient
 * and keeping it only where that alpha is gives the same glyph in new colours,
 * with no path data involved and no chance of a redrawn mark being subtly
 * wrong. sharp's `dest-in` blend is precisely this operation.
 *
 * Originals are copied to assets/email/original/ first — the recolour is not
 * reversible from the output, since everything outside the glyph is discarded.
 *
 *   node scripts/gradient-social-icons.js            # report only
 *   node scripts/gradient-social-icons.js --apply
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const DIR = path.join(__dirname, "../assets/email");
const BACKUP = path.join(DIR, "original");
const APPLY = process.argv.includes("--apply");

/* The same three stops as the email hero (see utils/otpemailtemplate.js and the
   three htmltemplate heroes), so the footer belongs to the banner above it.
   Drawn on the diagonal rather than left-to-right: a 64px glyph is mostly empty
   space horizontally, and a horizontal sweep left several of them looking flat
   pink or flat blue depending on where their strokes happened to fall. */
const GRADIENT_SVG = (size) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#FF3CF9"/>
      <stop offset="50%"  stop-color="#7B5CFF"/>
      <stop offset="100%" stop-color="#2F86FF"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#g)"/>
</svg>`);

(async () => {
  const files = fs.readdirSync(DIR).filter((f) => /^social-.*\.png$/.test(f));
  if (!files.length) {
    console.error("no social-*.png found in " + DIR);
    process.exit(1);
  }

  if (APPLY) fs.mkdirSync(BACKUP, { recursive: true });

  for (const file of files) {
    const src = path.join(DIR, file);
    const { width, height, hasAlpha } = await sharp(src).metadata();

    if (!hasAlpha) {
      console.log(`  skip  ${file}  (no alpha channel — nothing to use as a mask)`);
      continue;
    }

    /* dest-in keeps the gradient only where the glyph has alpha. The glyph
       itself contributes nothing but its shape, which is the point: whatever
       colour it was is irrelevant. */
    const out = await sharp(GRADIENT_SVG(width))
      .composite([{ input: src, blend: "dest-in" }])
      .png()
      .toBuffer();

    console.log(`  ${APPLY ? "wrote" : "would write"}  ${file.padEnd(24)} ${width}x${height}  ${out.length}B`);

    if (APPLY) {
      fs.copyFileSync(src, path.join(BACKUP, file));
      fs.writeFileSync(src, out);
    }
  }

  console.log(APPLY
    ? `\ndone — originals kept in assets/email/original/`
    : "\nDRY RUN — nothing written. Re-run with --apply.");
})().catch((e) => { console.error(e); process.exit(1); });
