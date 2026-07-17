import { jsPDF } from 'jspdf';
import { pdfThemes } from './pdfThemes';

export function generateAssessmentPDF(reportData, role) {
  const theme = pdfThemes.default;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = theme.margin.top;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...theme.primary);
  doc.text('Assessment Feedback Profile', theme.margin.left, y);
  y += 8;

  doc.setDrawColor(...theme.border);
  doc.line(theme.margin.left, y, 210 - theme.margin.right, y);
  y += 10;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...theme.text);

  doc.text(`Role: ${role}`, theme.margin.left, y); y += 8;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, theme.margin.left, y); y += 14;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Score Summary', theme.margin.left, y); y += 9;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);

  doc.text(`Overall Score: ${reportData.overallScore}%`, theme.margin.left, y); y += 7;
  doc.text(`Resume Profile Match: ${reportData.resumeScore}%`, theme.margin.left, y); y += 7;
  doc.text(`Interview & Verbal Round: ${reportData.interviewScore}%`, theme.margin.left, y); y += 7;
  doc.text(`Coding Environment Round: ${reportData.codingScore}%`, theme.margin.left, y); y += 14;

  if (reportData.breakdown) {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Aptitude Breakdown', theme.margin.left, y); y += 9;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const entries = [
      ['Syntax Accuracy', reportData.breakdown.syntaxAccuracy],
      ['System Scalability', reportData.breakdown.systemScalability],
      ['Verbal Communication', reportData.breakdown.verbalCommunication],
      ['Complexity Optimization', reportData.breakdown.complexityOptimization],
    ];
    entries.forEach(([label, score]) => {
      doc.text(`${label}: ${score}%`, theme.margin.left, y);
      const barWidth = (score / 100) * 100;
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(100, 200, 100);
      doc.rect(theme.margin.left + 110, y - 2, barWidth, 4, 'F');
      y += 8;
    });
    y += 6;
  }

  if (reportData.strengths && reportData.strengths.length > 0) {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Core Strengths', theme.margin.left, y); y += 9;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    reportData.strengths.forEach(s => {
      const lines = doc.splitTextToSize(`- ${s}`, 170);
      doc.text(lines, theme.margin.left, y);
      y += lines.length * 5 + 2;
    });
    y += 4;
  }

  if (reportData.weaknesses && reportData.weaknesses.length > 0) {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Areas for Improvement', theme.margin.left, y); y += 9;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    reportData.weaknesses.forEach(w => {
      const lines = doc.splitTextToSize(w, 170);
      doc.text(lines, theme.margin.left, y);
      y += lines.length * 5 + 2;
    });
    y += 4;
  }

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Strategic Hiring Verdict', theme.margin.left, y); y += 9;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  const reportText = reportData.feedbackReport || 'Verdict not loaded.';
  const splitVerdict = doc.splitTextToSize(reportText, 170);
  doc.text(splitVerdict, theme.margin.left, y);

  const fileName = `Assessment_Report_${role.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}
