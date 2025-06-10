import { formatCurrency } from './format';
import { salonConfig } from '../config/salonConfig';

// Define a helper function to format date objects
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Generate a printable order ID
const formatOrderId = (order: any) => {
  if (!order || !order.id) return 'Unknown';
  const date = new Date();
  return `INV/${date.getFullYear()}/${order.id.substring(0, 8)}`;
};

// Helper to format payment method labels
const getPaymentMethodLabel = (method: string) => {
  const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: "Cash",
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    upi: "UPI",
    bnpl: "Pay Later",
    membership: "Membership Balance",
    split: "Split Payment"
  };
  
  return PAYMENT_METHOD_LABELS[method] || method;
};

// Main function to print a bill
export const printBill = (bill: any) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to print the bill');
    return;
  }
  
  // Calculate some values
  const totalAmount = bill.total || 0;
  const taxAmount = bill.tax || 0;
  const subtotalAmount = bill.subtotal || 0;
  const discountAmount = bill.discount || 0;
  const cgst = taxAmount / 2;
  const sgst = taxAmount / 2;
  
  // Create the content for the print window
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Tax Invoice</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          max-width: 80mm; /* Standard receipt width */
          margin: 0 auto;
        }
        .receipt {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 5px;
        }
        .header {
          text-align: center;
          margin-bottom: 15px;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        .salon-name {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .salon-details {
          font-size: 12px;
          margin: 3px 0;
        }
        .bill-title {
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          margin: 10px 0;
          text-transform: uppercase;
        }
        .bill-details {
          margin-bottom: 15px;
          font-size: 12px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        .section-title {
          font-weight: bold;
          margin: 10px 0 5px 0;
          font-size: 14px;
          text-transform: uppercase;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin: 10px 0;
        }
        th, td {
          text-align: left;
          padding: 5px;
          border-bottom: 1px solid #ddd;
        }
        th {
          border-bottom: 2px solid #000;
        }
        .amount-row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
          font-size: 12px;
        }
        .total-row {
          font-weight: bold;
          border-top: 2px solid #000;
          padding-top: 5px;
          margin-top: 5px;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 15px;
          font-size: 11px;
          border-top: 1px dashed #000;
          padding-top: 10px;
        }
        .gst-details {
          font-size: 11px;
          margin: 10px 0;
          padding: 5px;
          background: #f9f9f9;
        }
        .terms {
          font-size: 10px;
          margin-top: 10px;
          color: #666;
        }
        @media print {
          body {
            width: 80mm;
            margin: 0;
            padding: 0;
          }
          .receipt {
            border: none;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="salon-name">${salonConfig.name}</div>
          <div class="salon-details">${salonConfig.address.line1}</div>
          <div class="salon-details">${salonConfig.address.line2}</div>
          <div class="salon-details">${salonConfig.address.city}, ${salonConfig.address.state} - ${salonConfig.address.pincode}</div>
          <div class="salon-details">Phone: ${salonConfig.contact.phone}</div>
          <div class="salon-details">Email: ${salonConfig.contact.email}</div>
          <div class="salon-details">GSTIN: ${salonConfig.gst.number}</div>
        </div>
        
        <div class="bill-title">Tax Invoice</div>
        
        <div class="bill-details">
          <div><strong>Invoice No:</strong> ${formatOrderId(bill)}</div>
          <div><strong>Date:</strong> ${formatDate(bill.created_at)}</div>
          <div><strong>Customer:</strong> ${bill.client_name || bill.customer_name || 'Walk-in Customer'}</div>
          <div><strong>Stylist:</strong> ${bill.stylist_name || 'N/A'}</div>
        </div>
        
        <div class="section-title">Items</div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(bill.services || []).map((item: any) => `
              <tr>
                <td>${item.service_name || item.name || 'Unknown'}</td>
                <td>${item.quantity || 1}</td>
                <td>₹${(item.price || 0).toFixed(2)}</td>
                <td>₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="section-title">Payment Details</div>
        <div class="amount-row">
          <span>Subtotal:</span>
          <span>₹${subtotalAmount.toFixed(2)}</span>
        </div>
        ${discountAmount > 0 ? `
          <div class="amount-row">
            <span>Discount:</span>
            <span>-₹${discountAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="amount-row">
          <span>CGST (9%):</span>
          <span>₹${cgst.toFixed(2)}</span>
        </div>
        <div class="amount-row">
          <span>SGST (9%):</span>
          <span>₹${sgst.toFixed(2)}</span>
        </div>
        <div class="amount-row total-row">
          <span>Total Amount:</span>
          <span>₹${totalAmount.toFixed(2)}</span>
        </div>
        
        <div class="section-title">Payment Method</div>
        ${bill.payments && bill.payments.length > 0 ? `
          ${bill.payments.map((payment: any) => `
            <div class="amount-row">
              <span>${getPaymentMethodLabel(payment.payment_method)}:</span>
              <span>₹${payment.amount.toFixed(2)}</span>
            </div>
          `).join('')}
        ` : `
          <div class="amount-row">
            <span>${getPaymentMethodLabel(bill.payment_method || 'cash')}:</span>
            <span>₹${totalAmount.toFixed(2)}</span>
          </div>
        `}
        
        <div class="gst-details">
          <div>State Code: ${salonConfig.gst.state_code}</div>
          <div>PAN: ${salonConfig.legal.pan}</div>
          <div>CIN: ${salonConfig.legal.cin}</div>
        </div>
        
        <div class="footer">
          <div>Business Hours: ${salonConfig.business.hours}</div>
          <div>${salonConfig.business.workingDays}</div>
          <div>${salonConfig.contact.website}</div>
          <div>Follow us on Instagram: ${salonConfig.social.instagram}</div>
          <div class="terms">
            * This is a computer-generated invoice and does not require a physical signature.
            * All prices are inclusive of GST where applicable.
            * Terms and conditions apply.
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;
  
  // Write the content to the print window
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}; 