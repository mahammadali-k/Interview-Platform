import { saveBlob } from "./files";

const escapeCell = (value) => {
  const text = value === null || value === undefined ? "" : String(value);

  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Downloads rows (an array of objects with the same keys) as a CSV file */
export function downloadCsv(filename, rows) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const lines = [headers, ...rows.map((row) => headers.map((key) => row[key]))].map((line) =>
    line.map(escapeCell).join(",")
  );

  // the BOM makes Excel read UTF-8 names correctly
  saveBlob(new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" }), filename);
}
