import { jsPDF } from 'jspdf';

interface InterviewAnalysis {
  questionAnalysis: {
    question: string;
    answer: string;
    feedback: string;
  }[];
  overallAnalysis: string;
}

export const generateInterviewPDF = async (analysis: InterviewAnalysis): Promise<ArrayBuffer> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const lineHeight = 7;
  let y = margin;

  // Title
  doc.setFontSize(20);
  doc.text('Interview Analysis Report', pageWidth / 2, y, { align: 'center' });
  y += lineHeight * 2;

  // Question Analysis
  doc.setFontSize(16);
  doc.text('Question-by-Question Analysis', margin, y);
  y += lineHeight * 2;

  analysis.questionAnalysis.forEach((qa, index) => {
    // Check if we need a new page
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    // Question
    doc.setFontSize(14);
    doc.text(`Question ${index + 1}:`, margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    doc.text(qa.question, margin + 5, y);
    y += lineHeight * 2;

    // Answer
    doc.setFontSize(14);
    doc.text('Your Answer:', margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    const answerLines = doc.splitTextToSize(qa.answer, pageWidth - margin * 2);
    doc.text(answerLines, margin + 5, y);
    y += lineHeight * (answerLines.length + 1);

    // Feedback
    doc.setFontSize(14);
    doc.text('Feedback:', margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    const feedbackLines = doc.splitTextToSize(qa.feedback, pageWidth - margin * 2);
    doc.text(feedbackLines, margin + 5, y);
    y += lineHeight * (feedbackLines.length + 2);
  });

  // Overall Analysis
  doc.addPage();
  y = margin;
  doc.setFontSize(16);
  doc.text('Overall Analysis', margin, y);
  y += lineHeight * 2;
  doc.setFontSize(12);
  const overallLines = doc.splitTextToSize(analysis.overallAnalysis, pageWidth - margin * 2);
  doc.text(overallLines, margin, y);

  return doc.output('arraybuffer');
}; 