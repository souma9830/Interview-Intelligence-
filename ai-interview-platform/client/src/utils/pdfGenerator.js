import { jsPDF } from 'jspdf';
import { pdfThemes } from './pdfThemes';

export function generateAssessmentPDF(reportData, role) {
  const theme = pdfThemes.default;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Main Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...theme.primary);
  doc.text('Assessment Feedback Profile', theme.margin.left, theme.margin.top);

  // Divider line
  doc.setDrawColor(...theme.border);
  doc.line(theme.margin.left, theme.margin.top + 5, 210 - theme.margin.right, theme.margin.top + 5);

  // Content
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...theme.text);
  doc.text(`Role: ${role}`, theme.margin.left, theme.margin.top + 15);
  doc.text(`Overall Score: ${reportData.overallScore}%`, theme.margin.left, theme.margin.top + 23);
  doc.text(`Resume Score: ${reportData.resumeScore}%`, theme.margin.left, theme.margin.top + 31);
  doc.text(`Interview Score: ${reportData.interviewScore}%`, theme.margin.left, theme.margin.top + 39);
  doc.text(`Coding Score: ${reportData.codingScore}%`, theme.margin.left, theme.margin.top + 47);

  // Verdict Section
  doc.setFont('Helvetica', 'bold');
  doc.text('Strategic Hiring Verdict', theme.margin.left, theme.margin.top + 60);
  doc.setFont('Helvetica', 'normal');
  const splitVerdict = doc.splitTextToSize(reportData.feedbackReport || 'Verdict not loaded.', 170);
  doc.text(splitVerdict, theme.margin.left, theme.margin.top + 66);

  // Save the PDF
  doc.save(`Assessment_Report_${role.replace(/\s+/g, '_')}.pdf`);
}
