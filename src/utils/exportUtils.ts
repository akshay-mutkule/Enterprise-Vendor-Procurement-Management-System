import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export const exportToPDF = (title: string, headers: string[], rows: (string | number)[][], fileName: string) => {
  const doc = new jsPDF();
  
  // Header styling
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(title, 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Nexus Procurement Enterprise Report - Generated on ${new Date().toLocaleDateString()}`, 14, 28);
  
  let y = 38;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  // Draw table header
  let x = 14;
  const colWidth = 180 / headers.length;
  
  headers.forEach(h => {
    doc.text(String(h), x, y);
    x += colWidth;
  });
  
  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 194, y);
  y += 6;
  
  doc.setFont('helvetica', 'normal');
  rows.forEach(row => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    x = 14;
    row.forEach(cell => {
      doc.text(String(cell), x, y);
      x += colWidth;
    });
    y += 8;
  });
  
  doc.save(`${fileName}.pdf`);
};

export const exportToExcel = (data: Record<string, any>[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(amount);
};
