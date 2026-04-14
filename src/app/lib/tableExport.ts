export type CsvCell = string | number | null | undefined;

export type PdfColumn = {
  label: string;
  width: number;
  align?: "left" | "center" | "right";
};

type PdfTableOptions = {
  fileName: string;
  title: string;
  reportLabel?: string;
  generatedBy?: string;
  dateRangeLabel?: string;
  summary?: Array<{
    label: string;
    value: string;
    detail?: string;
  }>;
  subtitle?: string[];
  columns: PdfColumn[];
  rows: Array<Array<CsvCell>>;
  emptyMessage?: string;
};

function toStringValue(value: CsvCell) {
  return value === null || value === undefined ? "" : String(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeCsvCell(value: CsvCell) {
  const stringValue = toStringValue(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

export function toCsvRow(values: Array<CsvCell>) {
  return values.map(escapeCsvCell).join(",");
}

export function downloadCsvFile(fileName: string, rows: string[]) {
  const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = fileName;
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadPdfTableFile(options: PdfTableOptions) {
  const printWindow = window.open("", "_blank", "width=1200,height=900");

  if (!printWindow) {
    throw new Error("Unable to open the PDF preview window. Please allow pop-ups and try again.");
  }

  const reportLabel = options.reportLabel || "Inventory Management System";
  const generatedAt = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const subtitleLines = options.subtitle?.filter(Boolean) ?? [];
  const summaryCards = options.summary ?? [];
  const rowHtml = options.rows.length > 0
    ? options.rows
        .map(
          (row) => `
            <tr>
              ${row
                .map((cell, index) => {
                  const column = options.columns[index];
                  const alignClass = column?.align === "right" ? "right" : column?.align === "center" ? "center" : "left";
                  return `<td class="${alignClass}">${escapeHtml(String(cell ?? ""))}</td>`;
                })
                .join("")}
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="${options.columns.length}" class="empty">${escapeHtml(options.emptyMessage || "No records available.")}</td></tr>`;

  const headerCells = options.columns
    .map((column) => {
      const alignClass = column.align === "right" ? "right" : column.align === "center" ? "center" : "left";
      return `<th class="${alignClass}">${escapeHtml(column.label)}</th>`;
    })
    .join("");

  const summaryHtml = summaryCards.length > 0
    ? `
      <div class="summary-grid">
        ${summaryCards
          .map(
            (card) => `
              <div class="summary-card">
                <h3>${escapeHtml(card.label)}</h3>
                <p class="value">${escapeHtml(card.value)}</p>
                ${card.detail ? `<p class="detail">${escapeHtml(card.detail)}</p>` : ""}
              </div>
            `
          )
          .join("")}
      </div>
    `
    : "";

  const subtitleHtml = subtitleLines.length > 0
    ? `<div class="subtitle">${subtitleLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</div>`
    : "";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(options.fileName.replace(/\.pdf$/i, ""))}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            background: #eef2e2;
            color: #0f172a;
          }
          .page {
            width: 210mm;
            margin: 0 auto;
            background: #ffffff;
            padding: 18mm 16mm;
          }
          .hero {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: flex-start;
            border-bottom: 3px solid #b0bf00;
            padding-bottom: 18px;
          }
          .logo {
            height: 52px;
            width: auto;
            display: block;
            margin-bottom: 10px;
          }
          .eyebrow {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #7f8f00;
          }
          h1 {
            margin: 8px 0 6px;
            font-size: 28px;
            line-height: 1.1;
          }
          .subtitle {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
            font-size: 11px;
            color: #475569;
          }
          .subtitle span {
            background: #f8fafc;
            border: 1px solid #dbe4f0;
            border-radius: 999px;
            padding: 4px 10px;
          }
          .meta {
            text-align: right;
            font-size: 12px;
            color: #475569;
            line-height: 1.7;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(${Math.max(1, Math.min(4, summaryCards.length || 1))}, 1fr);
            gap: 12px;
            margin: 22px 0;
          }
          .summary-card {
            border: 1px solid #dbe4f0;
            border-radius: 16px;
            padding: 14px;
            background: linear-gradient(180deg, #f8fbeb 0%, #ffffff 100%);
          }
          .summary-card h3 {
            margin: 0 0 8px;
            font-size: 11px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #6b7280;
          }
          .summary-card .value {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
            line-height: 1.1;
            color: #0f172a;
          }
          .summary-card .detail {
            margin: 8px 0 0;
            font-size: 11px;
            color: #64748b;
            line-height: 1.5;
          }
          .section {
            margin-top: 22px;
          }
          .section h2 {
            margin: 0 0 10px;
            font-size: 17px;
            border-bottom: 1px solid #dbe4f0;
            padding-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border-bottom: 1px solid #e7edf5;
            padding: 10px 8px;
            font-size: 12px;
            vertical-align: top;
            text-align: left;
          }
          th {
            background: #eef4fb;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          td.right, th.right { text-align: right; }
          td.center, th.center { text-align: center; }
          .empty {
            text-align: center;
            color: #64748b;
            padding: 18px 8px;
          }
          .footer {
            margin-top: 26px;
            padding-top: 12px;
            border-top: 2px solid #dbe4f0;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #64748b;
          }
          @page { size: A4; margin: 12mm; }
          @media print {
            body { background: #ffffff; }
            .page { width: auto; margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <section class="hero">
            <div>
              <img
                class="logo"
                src="https://cdn.digitalmindsbpo.com/storage/2021/11/cropped-Digital_Minds_Logo_Original.png"
                alt="Digital Minds BPO"
              />
              <div class="eyebrow">${escapeHtml(reportLabel)}</div>
              <h1>${escapeHtml(options.title)}</h1>
              ${subtitleHtml}
            </div>
            <div class="meta">
              <div><strong>Generated on:</strong> ${escapeHtml(generatedAt)}</div>
              ${options.generatedBy ? `<div><strong>Generated by:</strong> ${escapeHtml(options.generatedBy)}</div>` : ""}
              ${options.dateRangeLabel ? `<div><strong>Date range:</strong> ${escapeHtml(options.dateRangeLabel)}</div>` : ""}
            </div>
          </section>

          ${summaryHtml}

          <section class="section">
            <h2>${escapeHtml(options.title)}</h2>
            <table>
              <thead>
                <tr>${headerCells}</tr>
              </thead>
              <tbody>${rowHtml}</tbody>
            </table>
          </section>

          <footer class="footer">
            <span>Digital Minds BPO Services Inc.</span>
            <span>${escapeHtml(options.title)}</span>
          </footer>
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.document.title = options.fileName.replace(/\.pdf$/i, "");
  printWindow.focus();
  window.setTimeout(() => {
    printWindow.print();
  }, 500);
}
