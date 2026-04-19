import { jsPDF } from 'jspdf';

const CATEGORY_LABELS = {
  office_supplies: 'Office Supplies', travel: 'Travel', meals_entertainment: 'Meals & Entertainment',
  utilities: 'Utilities', software_subscriptions: 'Software', professional_services: 'Professional Services',
  insurance: 'Insurance', vehicle: 'Vehicle', home_office: 'Home Office', medical: 'Medical',
  education: 'Education', charitable: 'Charitable', other: 'Other',
};

const COLORS = {
  primary: [15, 23, 42],      // slate-900
  muted: [100, 116, 139],     // slate-500
  light: [241, 245, 249],     // slate-100
  border: [226, 232, 240],    // slate-200
  emerald: [5, 150, 105],
  blue: [37, 99, 235],
  violet: [124, 58, 237],
  white: [255, 255, 255],
};

function setColor(doc, rgb, type = 'text') {
  if (type === 'text') doc.setTextColor(...rgb);
  if (type === 'fill') doc.setFillColor(...rgb);
  if (type === 'draw') doc.setDrawColor(...rgb);
}

export async function generateTaxPDF({ year, user, expenses, trips, diaryEntries }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();  // 210
  const ph = doc.internal.pageSize.getHeight(); // 297
  const margin = 18;
  const contentW = pw - margin * 2;
  let y = 0;

  // ── helpers ──────────────────────────────────────────────────────────────
  const addPage = () => { doc.addPage(); y = margin; };

  const checkPageBreak = (needed = 10) => {
    if (y + needed > ph - margin) addPage();
  };

  const hline = (yPos, color = COLORS.border) => {
    setColor(doc, color, 'draw');
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pw - margin, yPos);
  };

  const text = (str, x, yPos, opts = {}) => {
    setColor(doc, opts.color || COLORS.primary, 'text');
    doc.setFontSize(opts.size || 10);
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.text(str, x, yPos, { align: opts.align || 'left', maxWidth: opts.maxWidth });
  };

  // ── Cover Header ─────────────────────────────────────────────────────────
  setColor(doc, COLORS.primary, 'fill');
  doc.rect(0, 0, pw, 52, 'F');

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TaxTracker', margin, 22);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tax Summary Report — ${year}`, margin, 32);

  const prepDate = `Prepared: ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  doc.setFontSize(9);
  doc.text(prepDate, pw - margin, 22, { align: 'right' });

  if (user?.full_name || user?.email) {
    doc.text(user.full_name || '', pw - margin, 30, { align: 'right' });
    doc.text(user.email || '', pw - margin, 37, { align: 'right' });
  }

  y = 64;

  // ── Summary Boxes ────────────────────────────────────────────────────────
  const deductibleExpenses = expenses.filter(e => e.is_deductible !== false);
  const deductibleTrips = trips.filter(t => t.is_deductible !== false);
  const deductibleDiary = diaryEntries.filter(d => d.is_deductible !== false);

  const totalExpenses = deductibleExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalMileage = deductibleTrips.reduce((s, t) => s + (t.distance_km || 0), 0);
  const totalDiary = deductibleDiary.reduce((s, d) => s + (d.amount || 0), 0);
  const grandTotal = totalExpenses + totalDiary;

  const boxW = (contentW - 8) / 3;
  const boxes = [
    { label: 'Receipt Expenses', value: `$${totalExpenses.toFixed(2)}`, sub: `${deductibleExpenses.length} items`, color: COLORS.emerald },
    { label: 'Diary Deductions', value: `$${totalDiary.toFixed(2)}`, sub: `${deductibleDiary.length} items`, color: COLORS.violet },
    { label: 'Total Mileage', value: `${totalMileage.toFixed(0)} km`, sub: `${deductibleTrips.length} trips`, color: COLORS.blue },
  ];

  boxes.forEach((box, i) => {
    const bx = margin + i * (boxW + 4);
    setColor(doc, COLORS.light, 'fill');
    setColor(doc, COLORS.border, 'draw');
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, y, boxW, 28, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.muted, 'text');
    doc.text(box.label.toUpperCase(), bx + 5, y + 8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    setColor(doc, box.color, 'text');
    doc.text(box.value, bx + 5, y + 18);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.muted, 'text');
    doc.text(box.sub, bx + 5, y + 24);
  });

  y += 36;

  // Grand total bar
  setColor(doc, COLORS.primary, 'fill');
  doc.rect(margin, y, contentW, 12, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL DEDUCTIBLE AMOUNT (excl. mileage)', margin + 4, y + 8);
  doc.text(`$${grandTotal.toFixed(2)}`, pw - margin - 4, y + 8, { align: 'right' });
  y += 20;

  // ── Section renderer ─────────────────────────────────────────────────────
  const renderSection = (title, items, columns) => {
    if (items.length === 0) return;
    checkPageBreak(20);

    // Section heading
    setColor(doc, COLORS.light, 'fill');
    doc.rect(margin, y, contentW, 9, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(doc, COLORS.primary, 'text');
    doc.text(title.toUpperCase(), margin + 4, y + 6.5);
    y += 12;

    // Column headers
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    setColor(doc, COLORS.muted, 'text');
    columns.forEach(col => doc.text(col.label, col.x, y, { align: col.align || 'left' }));
    y += 2;
    hline(y);
    y += 4;

    // Rows
    items.forEach((item, idx) => {
      checkPageBreak(8);
      if (idx % 2 === 0) {
        setColor(doc, [250, 250, 250], 'fill');
        doc.rect(margin, y - 4, contentW, 8, 'F');
      }
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      columns.forEach(col => {
        const val = col.getter(item);
        setColor(doc, col.color?.(item) || COLORS.primary, 'text');
        doc.setFont('helvetica', col.bold?.(item) ? 'bold' : 'normal');
        doc.text(String(val ?? ''), col.x, y, { align: col.align || 'left', maxWidth: col.maxWidth });
      });
      y += 8;
    });

    // Section subtotal
    const subtotal = items.reduce((s, i) => s + (i.amount || i.distance_km || 0), 0);
    const isMileage = items[0] && 'distance_km' in items[0];
    hline(y - 2);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    setColor(doc, COLORS.muted, 'text');
    doc.text('SUBTOTAL', margin + 4, y + 4);
    setColor(doc, COLORS.emerald, 'text');
    doc.text(isMileage ? `${subtotal.toFixed(0)} km` : `$${subtotal.toFixed(2)}`, pw - margin - 4, y + 4, { align: 'right' });
    y += 12;
  };

  // ── Expenses by category ─────────────────────────────────────────────────
  const expByCategory = {};
  deductibleExpenses.forEach(e => {
    const cat = CATEGORY_LABELS[e.category] || e.category || 'Other';
    if (!expByCategory[cat]) expByCategory[cat] = [];
    expByCategory[cat].push(e);
  });

  Object.entries(expByCategory).forEach(([cat, items]) => {
    renderSection(`Expenses — ${cat}`, items, [
      { label: 'Date', x: margin + 2, getter: i => i.date, maxWidth: 25 },
      { label: 'Vendor', x: margin + 30, getter: i => i.vendor || '', maxWidth: 80 },
      { label: 'Notes', x: margin + 115, getter: i => (i.notes || '').slice(0, 35), maxWidth: 55, color: () => COLORS.muted },
      { label: 'Amount', x: pw - margin - 2, align: 'right', getter: i => `$${(i.amount || 0).toFixed(2)}`, bold: () => true },
    ]);
  });

  // ── Mileage ──────────────────────────────────────────────────────────────
  if (deductibleTrips.length > 0) {
    renderSection('Mileage & Vehicle Trips', deductibleTrips, [
      { label: 'Date', x: margin + 2, getter: t => t.date, maxWidth: 22 },
      { label: 'Purpose', x: margin + 28, getter: t => (t.purpose || '').slice(0, 35), maxWidth: 55 },
      { label: 'Route', x: margin + 90, getter: t => `${t.start_location || ''} → ${t.end_location || ''}`.slice(0, 40), maxWidth: 65, color: () => COLORS.muted },
      { label: 'km', x: pw - margin - 2, align: 'right', getter: t => `${(t.distance_km || 0).toFixed(1)} km`, bold: () => true, color: () => COLORS.blue },
    ]);
  }

  // ── Diary ─────────────────────────────────────────────────────────────────
  if (deductibleDiary.length > 0) {
    renderSection('Deduction Diary Entries', deductibleDiary, [
      { label: 'Date', x: margin + 2, getter: d => d.date, maxWidth: 25 },
      { label: 'Description', x: margin + 30, getter: d => (d.description || '').slice(0, 50), maxWidth: 85 },
      { label: 'Category', x: margin + 120, getter: d => d.category || '', maxWidth: 40, color: () => COLORS.muted },
      { label: 'Amount', x: pw - margin - 2, align: 'right', getter: d => `$${(d.amount || 0).toFixed(2)}`, bold: () => true },
    ]);
  }

  // ── Footer on every page ──────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    hline(ph - 14, COLORS.border);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.muted, 'text');
    doc.text(`TaxTracker — ${year} Tax Summary Report`, margin, ph - 8);
    doc.text(`Page ${p} of ${totalPages}`, pw - margin, ph - 8, { align: 'right' });
  }

  doc.save(`TaxTracker_${year}_Tax_Report.pdf`);
}