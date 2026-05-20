import * as XLSX from "xlsx";

/**
 * Export an array of plain objects to a .xlsx file and trigger a browser download.
 * @param rows     Array of row objects — keys become column headers.
 * @param filename Download filename WITHOUT the .xlsx extension.
 */
export function exportExcel(rows: Record<string, unknown>[], filename: string): void {
  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths based on the longest cell in each column
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.map((r) => String(r[key] ?? "").length)
    );
    return { wch: Math.min(maxLen + 2, 50) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
