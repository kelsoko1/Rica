/**
 * Receipt Service
 * 
 * This service handles receipt generation for completed payments.
 */

import paymentHistoryService from './paymentHistoryService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Generate receipt PDF
const generateReceiptPDF = (transactionId) => {
  try {
    // Get payment details
    const payment = paymentHistoryService.getPaymentById(transactionId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.status !== 'COMPLETED') {
      throw new Error('Cannot generate receipt for incomplete payment');
    }
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add Rica logo (placeholder)
    // In a real app, you would add an actual logo
    doc.setFillColor(41, 98, 255);
    doc.rect(14, 10, 30, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('RICA', 20, 17.5);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Add receipt title
    doc.setFontSize(22);
    doc.text('Payment Receipt', 105, 20, { align: 'center' });
    
    // Add receipt number and date
    doc.setFontSize(10);
    doc.text(`Receipt #: ${payment.transactionId}`, 195, 10, { align: 'right' });
    doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`, 195, 15, { align: 'right' });
    
    // Add horizontal line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25);
    
    // Add customer information
    doc.setFontSize(12);
    doc.text('Customer Information', 14, 35);
    
    doc.setFontSize(10);
    doc.text('Customer:', 14, 45);
    doc.text('John Doe', 50, 45); // In a real app, use actual customer name
    
    doc.text('Email:', 14, 50);
    doc.text('john.doe@example.com', 50, 50); // In a real app, use actual email
    
    if (payment.phoneNumber) {
      doc.text('Phone:', 14, 55);
      doc.text(payment.phoneNumber, 50, 55);
    }
    
    // Add payment information
    doc.setFontSize(12);
    doc.text('Payment Information', 14, 70);
    
    doc.setFontSize(10);
    doc.text('Transaction ID:', 14, 80);
    doc.text(payment.transactionId, 50, 80);
    
    doc.text('Payment Method:', 14, 85);
    if (payment.paymentMethod === 'card') {
      doc.text('Credit/Debit Card', 50, 85);
      if (payment.details && payment.details.cardBrand && payment.details.cardLast4) {
        doc.text(`${payment.details.cardBrand} ending in ${payment.details.cardLast4}`, 50, 90);
      }
    } else if (payment.provider) {
      doc.text('Mobile Money', 50, 85);
      doc.text(`${payment.provider}`, 50, 90);
    }
    
    doc.text('Status:', 14, 95);
    doc.text(payment.status, 50, 95);
    
    doc.text('Reference:', 14, 100);
    doc.text(payment.reference || 'N/A', 50, 100);
    
    // Add item details
    doc.setFontSize(12);
    doc.text('Item Details', 14, 115);
    
    // Create table for item details
    const tableColumn = ['Description', 'Amount', 'Currency'];
    const tableRows = [
      [
        payment.description || 'Rica Payment',
        formatAmount(payment.amount),
        payment.currency.toUpperCase()
      ]
    ];
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 120,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [220, 220, 220],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [41, 98, 255],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 40, halign: 'right' },
        2: { cellWidth: 30, halign: 'center' }
      }
    });
    
    // Add total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Total:', 130, finalY);
    doc.text(`${formatAmount(payment.amount)} ${payment.currency.toUpperCase()}`, 180, finalY, { align: 'right' });
    
    // Add footer
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('Thank you for your payment!', 105, finalY + 20, { align: 'center' });
    doc.text('Rica - Advanced Security Intelligence Platform', 105, finalY + 25, { align: 'center' });
    doc.text('www.rica.io', 105, finalY + 30, { align: 'center' });
    
    // Add page number
    doc.setFontSize(8);
    doc.text(`Page 1 of 1`, 105, 285, { align: 'center' });
    
    return doc;
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw error;
  }
};

// Download receipt PDF
const downloadReceiptPDF = (transactionId) => {
  try {
    const doc = generateReceiptPDF(transactionId);
    doc.save(`receipt-${transactionId}.pdf`);
    return true;
  } catch (error) {
    console.error('Error downloading receipt:', error);
    throw error;
  }
};

// Open receipt PDF in new window
const openReceiptPDF = (transactionId) => {
  try {
    const doc = generateReceiptPDF(transactionId);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    return true;
  } catch (error) {
    console.error('Error opening receipt:', error);
    throw error;
  }
};

// Format amount with 2 decimal places
const formatAmount = (amount) => {
  return Number(amount).toFixed(2);
};

export default {
  generateReceiptPDF,
  downloadReceiptPDF,
  openReceiptPDF
};
