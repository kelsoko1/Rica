# Rica Receipt Generation Guide

## Overview

This guide provides comprehensive documentation for the receipt generation feature in the Rica landing page. This feature allows users to view, download, and print receipts for completed payments.

## Table of Contents

1. [Receipt Generation](#receipt-generation)
2. [Receipt Service](#receipt-service)
3. [Receipt Viewer Component](#receipt-viewer-component)
4. [Integration with Payment History](#integration-with-payment-history)
5. [Implementation Details](#implementation-details)
6. [Best Practices](#best-practices)
7. [Future Enhancements](#future-enhancements)

## Receipt Generation

The receipt generation feature allows users to:

- View receipts for completed payments
- Download receipts as PDF files
- Print receipts directly from the browser
- Open receipts in a new window

### Receipt Format

Receipts include the following information:

- Rica logo and branding
- Receipt number (transaction ID)
- Date of payment
- Customer information
- Payment information (method, amount, currency)
- Item details
- Total amount
- Footer with contact information

## Receipt Service

The `receiptService` provides methods for generating and handling receipts:

```javascript
// Generate receipt PDF
const doc = receiptService.generateReceiptPDF(transactionId);

// Download receipt PDF
receiptService.downloadReceiptPDF(transactionId);

// Open receipt PDF in new window
receiptService.openReceiptPDF(transactionId);
```

### PDF Generation

The receipt service uses jsPDF and jsPDF-autotable to generate PDF receipts:

```javascript
// Create new PDF document
const doc = new jsPDF();

// Add Rica logo
doc.setFillColor(41, 98, 255);
doc.rect(14, 10, 30, 10, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(16);
doc.text('RICA', 20, 17.5);

// Add receipt title
doc.setFontSize(22);
doc.text('Payment Receipt', 105, 20, { align: 'center' });

// Add receipt content
// ...

// Return the PDF document
return doc;
```

## Receipt Viewer Component

The `ReceiptViewer` component provides a user interface for viewing and managing receipts:

```jsx
<ReceiptViewer 
  transactionId="CP1632145678901" 
  onClose={() => setShowReceipt(false)} 
/>
```

### Component Features

- Display receipt in a dialog
- Download receipt as PDF
- Print receipt
- Open receipt in new window
- Close receipt dialog

### Component Structure

```jsx
<Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
  <DialogTitle>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h6">Receipt</Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          size="small"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadReceipt}
        >
          Download
        </Button>
        <Button
          size="small"
          startIcon={<PrintIcon />}
          onClick={handlePrintReceipt}
        >
          Print
        </Button>
        <Button
          size="small"
          startIcon={<OpenInNewIcon />}
          onClick={handleOpenReceipt}
        >
          Open
        </Button>
      </Box>
    </Box>
  </DialogTitle>
  <DialogContent>
    <ReceiptContainer>
      {/* Receipt content */}
    </ReceiptContainer>
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose}>Close</Button>
  </DialogActions>
</Dialog>
```

## Integration with Payment History

The receipt generation feature is integrated with the payment history system:

### Payment History Component

The `PaymentHistory` component includes buttons to view receipts for completed payments:

```jsx
{payment.status === 'COMPLETED' && (
  <IconButton 
    size="small" 
    onClick={() => handleViewReceipt(payment)}
    title="View Receipt"
    color="primary"
  >
    <ReceiptIcon fontSize="small" />
  </IconButton>
)}
```

### Payment Details Dialog

The payment details dialog includes a button to view the receipt:

```jsx
{selectedPayment.status === 'COMPLETED' && (
  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
    <Button
      variant="outlined"
      color="primary"
      startIcon={<ReceiptIcon />}
      onClick={() => {
        handleCloseDialog();
        handleViewReceipt(selectedPayment);
      }}
    >
      View Receipt
    </Button>
  </Box>
)}
```

## Implementation Details

### Receipt Service

The `receiptService` is implemented in `src/services/receiptService.js`:

```javascript
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
    
    // Add receipt content
    // ...
    
    return doc;
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw error;
  }
};
```

### Receipt Viewer Component

The `ReceiptViewer` component is implemented in `src/components/payments/ReceiptViewer.jsx`:

```javascript
const ReceiptViewer = ({ transactionId, onClose }) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load payment details
  useEffect(() => {
    const loadPayment = () => {
      try {
        const paymentData = paymentHistoryService.getPaymentById(transactionId);
        
        if (!paymentData) {
          throw new Error('Payment not found');
        }
        
        setPayment(paymentData);
      } catch (err) {
        console.error('Error loading payment:', err);
        setError(err.message || 'Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };
    
    loadPayment();
  }, [transactionId]);

  // Handle download receipt
  const handleDownloadReceipt = () => {
    try {
      receiptService.downloadReceiptPDF(transactionId);
    } catch (err) {
      console.error('Error downloading receipt:', err);
      setError('Failed to download receipt');
    }
  };

  // Handle open receipt in new window
  const handleOpenReceipt = () => {
    try {
      receiptService.openReceiptPDF(transactionId);
    } catch (err) {
      console.error('Error opening receipt:', err);
      setError('Failed to open receipt');
    }
  };

  // Handle print receipt
  const handlePrintReceipt = () => {
    try {
      // Open print window
      // ...
    } catch (err) {
      console.error('Error printing receipt:', err);
      setError('Failed to print receipt');
    }
  };

  // Render receipt
  // ...
};
```

## Best Practices

1. **Error Handling**: Properly handle errors in receipt generation and display.
2. **Responsive Design**: Ensure receipts are properly formatted for different screen sizes.
3. **Accessibility**: Make receipt viewer accessible to all users.
4. **Performance**: Optimize PDF generation for performance.
5. **Security**: Ensure receipts are only accessible to authorized users.
6. **Branding**: Include Rica branding in receipts.
7. **Testing**: Test receipt generation with different payment types and amounts.

## Future Enhancements

1. **Email Receipts**: Add the ability to email receipts to users.
2. **Custom Templates**: Allow users to customize receipt templates.
3. **Bulk Download**: Allow users to download multiple receipts at once.
4. **Digital Signatures**: Add digital signatures to receipts for verification.
5. **QR Codes**: Add QR codes to receipts for easy verification.
6. **Multiple Formats**: Support additional formats like CSV or Excel.
7. **Receipt Archive**: Implement a receipt archive for long-term storage.
8. **Receipt Search**: Add search functionality to find specific receipts.
