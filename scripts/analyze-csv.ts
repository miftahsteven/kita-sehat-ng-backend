import fs from "fs";
import { parse } from "csv-parse/sync";

const CSV_PATH = "/Users/miftahsyarief/MyLab/kita-sehat-ng/kita-sehat-backend/Posts-Export-2026-May-09-1610.csv";

try {
  const content = fs.readFileSync(CSV_PATH);
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true
  });

  const types: Record<string, number> = {};
  records.forEach((r: any) => {
    const type = r["Post Type"] || "UNKNOWN";
    types[type] = (types[type] || 0) + 1;
  });

  console.log("Post Type Distribution:", types);
  console.log("Total Records:", records.length);
} catch (err) {
  console.error("Error parsing CSV:", err);
}
