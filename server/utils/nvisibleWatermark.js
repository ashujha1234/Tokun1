// utils/invisibleWatermark.js
const ZW = {
  0: "\u200B",   // zero-width space
  1: "\u200C",   // zero-width non-joiner
  sep: "\u200D", // zero-width joiner (boundary marker)
};

function embedWatermark(text, buyerId) {
  const hex = Buffer.from(String(buyerId), "utf8").toString("hex");
  const bits = hex
    .split("")
    .flatMap((h) => parseInt(h, 16).toString(2).padStart(4, "0").split(""));

  const hidden = ZW.sep + bits.map((b) => ZW[b]).join("") + ZW.sep;
  return (text || "") + hidden;
}

function extractWatermark(text) {
  const re = new RegExp(`${ZW.sep}([${ZW[0]}${ZW[1]}]+)${ZW.sep}`);
  const m = (text || "").match(re);
  if (!m) return null;

  const bits = m[1].split("").map((c) => (c === ZW[0] ? "0" : "1")).join("");
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  try {
    return Buffer.from(hex, "hex").toString("utf8");
  } catch {
    return null;
  }
}

module.exports = { embedWatermark, extractWatermark };