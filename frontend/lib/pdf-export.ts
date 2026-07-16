import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PRIMARY_COLOR = '#D85C63';
const TEXT_GRAY = '#4B5563';
const BORDER_GRAY = '#D1D5DB';
const LIGHT_GRAY = '#F3F4F6';

const LOGO_BASE64 = '/logo-banco.png';
const CONTENT_START_Y = 42;
const PAGE_MARGIN_TOP = 20;
const PAGE_MARGIN_BOTTOM = 12;

function getCurrentUser(): string {
  if (typeof window === 'undefined') return 'Usuario';
  try {
    const userJson = localStorage.getItem('bi_user');
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.nombreCompleto || user.username || 'Usuario';
    }
  } catch {
    // ignore
  }
  return 'Usuario';
}

async function loadLogoBase64(): Promise<string> {
  if (typeof window === 'undefined') return '';
  try {
    const response = await fetch(LOGO_BASE64);
    if (!response.ok) return '';
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

function ensureSpace(doc: jsPDF, startY: number, requiredHeight: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (startY + requiredHeight > pageHeight - PAGE_MARGIN_BOTTOM) {
    doc.addPage();
    return PAGE_MARGIN_TOP;
  }
  return startY;
}

export async function createPdfDocument(title: string, subtitle?: string): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  const logoBase64 = await loadLogoBase64();

  const generationDate = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const userName = getCurrentUser();

  let y = margin;

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margin, y, 14, 14);
    } catch {
      // ignore logo errors
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(PRIMARY_COLOR);
  doc.text(title, pageWidth - margin, y + 8, { align: 'right' });

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(TEXT_GRAY);
    doc.text(subtitle, pageWidth - margin, y + 14, { align: 'right' });
  }

  y += 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(TEXT_GRAY);
  doc.text(`Generado el: ${generationDate}`, margin, y);
  doc.text(`Usuario: ${userName}`, pageWidth - margin, y, { align: 'right' });

  y += 8;

  doc.setDrawColor(BORDER_GRAY);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  (doc as any).pdfExportHeaderDrawn = true;
  (doc as any).pdfCurrentY = CONTENT_START_Y;

  return doc;
}

export function addFooter(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageCount = doc.getNumberOfPages();
  const currentPage = (doc as any).getCurrentPageInfo().pageNumber;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(TEXT_GRAY);
  doc.text(
    `Página ${currentPage} de ${pageCount}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 8,
    { align: 'center' }
  );
}

export function addSummaryCards(doc: jsPDF, items: { label: string; value: string }[]): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const gap = 4;
  const availableWidth = pageWidth - margin * 2;
  const cardWidth = (availableWidth - gap * (items.length - 1)) / items.length;
  const cardHeight = 18;
  const sectionMargin = 10;
  let startY = ((doc as any).pdfCurrentY || CONTENT_START_Y) + sectionMargin;

  startY = ensureSpace(doc, startY, cardHeight + sectionMargin);

  items.forEach((item, index) => {
    const x = margin + index * (cardWidth + gap);

    doc.setFillColor(LIGHT_GRAY);
    doc.setDrawColor(BORDER_GRAY);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(PRIMARY_COLOR);
    doc.text(item.value, x + cardWidth / 2, startY + 7, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(TEXT_GRAY);
    doc.text(item.label, x + cardWidth / 2, startY + 13, { align: 'center' });
  });

  (doc as any).pdfCurrentY = startY + cardHeight;
}

export function addDataTable(
  doc: jsPDF,
  columns: string[],
  rows: (string | number)[][],
  options?: {
    title?: string;
    startY?: number;
    columnStyles?: Record<number, { halign?: 'left' | 'center' | 'right' }>;
  }
): void {
  const sectionMargin = 8;
  let startY = options?.startY ?? ((doc as any).pdfCurrentY || CONTENT_START_Y) + sectionMargin;
  const titleHeight = options?.title ? 8 : 0;
  const minTableHeight = 15;

  startY = ensureSpace(doc, options?.title ? startY - 4 : startY, titleHeight + minTableHeight);

  if (options?.title) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(TEXT_GRAY);
    doc.text(options.title, 14, startY - 4);
  }

  autoTable(doc, {
    startY,
    head: [columns],
    body: rows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: TEXT_GRAY,
      cellPadding: 2,
      lineColor: BORDER_GRAY,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: '#FFFFFF',
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: LIGHT_GRAY,
    },
    columnStyles: options?.columnStyles,
    margin: { left: 14, right: 14 },
    didDrawPage: () => {
      addFooter(doc);
    },
  });

  (doc as any).pdfCurrentY = (doc as any).lastAutoTable?.finalY || startY;
}

export function savePdf(doc: jsPDF, filename: string): void {
  addFooter(doc);
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  doc.save(safeFilename);
}

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return '-';
  return `$${Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(value: string | undefined | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-PE');
}

export function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  const row: string[] = [];

  const flushCell = () => {
    row.push(current.trim());
    current = '';
  };

  const flushRow = () => {
    if (current !== '' || row.length > 0) {
      flushCell();
      rows.push([...row]);
      row.length = 0;
    }
  };

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      flushCell();
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      flushRow();
      if (char === '\r' && next === '\n') i++;
    } else {
      current += char;
    }
  }

  flushRow();
  return rows;
}

export async function generateReportFromCsv(
  reportName: string,
  reportDescription: string | undefined,
  csvContent: string,
  filename: string
): Promise<void> {
  const allRows = parseCsv(csvContent);
  if (allRows.length === 0) return;

  const headers = allRows[0];
  const dataRows = allRows.slice(1);
  const totalsRows: string[][] = [];
  const bodyRows: string[][] = [];

  dataRows.forEach((row) => {
    const isTotalsRow = row.some((cell) => cell.toUpperCase().includes('TOTAL'));
    if (isTotalsRow || row.every((cell) => cell === '')) {
      if (row.some((cell) => cell !== '')) totalsRows.push(row);
    } else {
      bodyRows.push(row);
    }
  });

  const doc = await createPdfDocument(reportName, reportDescription);

  addDataTable(doc, headers, bodyRows, {
    title: reportName,
  });

  if (totalsRows.length > 0) {
    let startY = ((doc as any).pdfCurrentY || CONTENT_START_Y) + 10;
    const blockHeight = 8 + totalsRows.length * 5;
    startY = ensureSpace(doc, startY, blockHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(PRIMARY_COLOR);
    doc.text('Totales', 14, startY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(TEXT_GRAY);
    let y = startY + 6;
    totalsRows.forEach((row) => {
      const line = row.filter((cell) => cell !== '').join('  ·  ');
      if (line) {
        doc.text(line, 14, y);
        y += 5;
      }
    });

    (doc as any).pdfCurrentY = y;
  }

  savePdf(doc, filename);
}

export { jsPDF, autoTable };
