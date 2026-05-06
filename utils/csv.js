'use strict';

/**
 * parseCSV — minimal RFC-4180-compliant CSV parser.
 *
 * Handles quoted fields (commas inside quotes, newlines inside quotes,
 * escaped quotes as ""). Returns an array of rows, each row an array of strings.
 */
function parseCSV(text) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = [];
  let i = 0;

  while (i < normalized.length) {
    const row = [];

    while (true) {
      let field = '';

      if (normalized[i] === '"') {
        i++; // skip opening quote
        while (i < normalized.length) {
          if (normalized[i] === '"') {
            if (normalized[i + 1] === '"') {
              field += '"';
              i += 2;
            } else {
              i++; // skip closing quote
              break;
            }
          } else {
            field += normalized[i++];
          }
        }
      } else {
        while (i < normalized.length && normalized[i] !== ',' && normalized[i] !== '\n') {
          field += normalized[i++];
        }
        field = field.trim();
      }

      row.push(field);

      if (normalized[i] === ',') {
        i++; // next field
      } else {
        break; // end of row (newline or EOF)
      }
    }

    if (normalized[i] === '\n') i++;

    // Skip completely empty rows
    if (row.length > 0 && !(row.length === 1 && row[0] === '')) {
      rows.push(row);
    }
  }

  return rows;
}

/**
 * parseCSVPrompts — parse a CSV string into prompt objects.
 *
 * Expects a header row with at minimum: title, category, body (any order).
 * Rows missing title or category are skipped.
 * Returns an array of { title, category, body }.
 */
function parseCSVPrompts(text) {
  if (typeof text !== 'string') return [];
  const rows = parseCSV(text);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const titleIdx    = headers.indexOf('title');
  const categoryIdx = headers.indexOf('category');
  const bodyIdx     = headers.indexOf('body');

  if (titleIdx === -1 || categoryIdx === -1 || bodyIdx === -1) return [];

  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const title    = (row[titleIdx]    || '').trim();
    const category = (row[categoryIdx] || '').trim();
    const body     = (row[bodyIdx]     || '').trim();
    if (!title || !category) continue;
    results.push({ title, category, body });
  }
  return results;
}
