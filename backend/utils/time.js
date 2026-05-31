// backend/utils/time.js

function formatForMySQL(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace("T", " ");
}

module.exports = { formatForMySQL };
