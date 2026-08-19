import * as XLSX from "xlsx";

// Builds a .xlsx file from an array of plain row objects and triggers a
// browser download. Column order follows each row's own key order, so
// callers should build rows with keys already in the order they want as
// columns.
export function downloadExcel(filename, sheetName, rows) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}
