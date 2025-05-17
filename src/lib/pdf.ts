import { PDFDocument, rgb } from 'pdf-lib';
import { Analysis } from '@/types/declarations';
import fs from 'fs';
import path from 'path';

export async function generatePDF(analysis: Analysis): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  // Add title
  page.drawText('Code Analysis Report', {
    x: 50,
    y: height - 50,
    size: 24,
    color: rgb(0, 0, 0),
  });

  // Add repository information
  page.drawText(`Repository: ${analysis.repoName}`, {
    x: 50,
    y: height - 100,
    size: 16,
    color: rgb(0, 0, 0),
  });

  // Add summary
  page.drawText('Summary:', {
    x: 50,
    y: height - 150,
    size: 14,
    color: rgb(0, 0, 0),
  });

  const summaryLines = analysis.summary.split('\n');
  let y = height - 170;
  for (const line of summaryLines) {
    page.drawText(line, {
      x: 50,
      y: y,
      size: 12,
      color: rgb(0, 0, 0),
    });
    y -= 20;
  }

  // Add features
  page.drawText('Detected Features:', {
    x: 50,
    y: y - 30,
    size: 14,
    color: rgb(0, 0, 0),
  });

  const features = JSON.parse(analysis.features);
  for (const feature of features) {
    page.drawText(`- ${feature.name}: ${feature.description}`, {
      x: 50,
      y: y - 50,
      size: 12,
      color: rgb(0, 0, 0),
    });
    y -= 20;
  }

  // Add code statistics
  page.drawText('Code Statistics:', {
    x: 50,
    y: y - 30,
    size: 14,
    color: rgb(0, 0, 0),
  });

  const stats = JSON.parse(analysis.codeStats);
  for (const [key, value] of Object.entries(stats)) {
    page.drawText(`${key}: ${value}`, {
      x: 50,
      y: y - 50,
      size: 12,
      color: rgb(0, 0, 0),
    });
    y -= 20;
  }

  return pdfDoc.save();
}
