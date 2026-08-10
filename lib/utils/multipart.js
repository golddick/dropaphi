// Shared helper to parse multipart/form-data Content-Type and extract boundary
'use strict';

function getMultipartBoundary(header) {
  if (!header) return null;
  // Split into media type and params, trimming whitespace
  const parts = header.split(';').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  const mediaType = parts.shift().toLowerCase();
  if (mediaType !== 'multipart/form-data') return null;

  for (const param of parts) {
    const idx = param.indexOf('=');
    if (idx === -1) continue;
    const name = param.slice(0, idx).trim().toLowerCase();
    let value = param.slice(idx + 1).trim();
    if (name === 'boundary') {
      // strip optional quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      return value === '' ? null : value;
    }
  }

  return null;
}

module.exports = { getMultipartBoundary };
