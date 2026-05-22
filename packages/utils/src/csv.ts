export function CSV_FROM_JSON<T extends object>(data: T[], separator: "," | ";"): string {
  if (data.length === 0) {
    return "";
  }

  const headers = Array.from(
    data.reduce((acc, item) => {
      for (const key of Object.keys(item)) {
        acc.add(key as keyof T);
      }
      return acc;
    }, new Set<keyof T>()),
  );

  const csvRows = [headers.join(separator)];
  const needsQuotes = new RegExp(`[${separator}"\\n]`);
  for (const item of data) {
    const row = headers
      .map((header) => {
        const value = item[header];
        if (value === null || value === undefined) {
          return "";
        }
        const stringValue = String(value);
        // Escape quotes by doubling them
        const escapedValue = stringValue.replace(/"/g, '""');
        // Add quotes if the value contains a separator, a quote, or a newline
        if (needsQuotes.test(escapedValue)) {
          return `"${escapedValue}"`;
        }
        return escapedValue;
      })
      .join(separator);
    csvRows.push(row);
  }

  return csvRows.join("\n");
}
