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

// Generate a customer-friendly order ID
const formatOrderId = (order: any) => {
  if (!order || !order.id) return 'Unknown';
  
  // Check if this is a salon consumption order
  const isSalonConsumption = order.is_salon_consumption === true || 
                            order.consumption_purpose || 
                            order.client_name === 'Salon Consumption';
  
  // Create a simple numeric ID for customers
  const timestamp = new Date(order.created_at || Date.now());
  const year = timestamp.getFullYear().toString().slice(-2);
  const month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
  const day = timestamp.getDate().toString().padStart(2, '0');
  const randomId = order.id.substring(0, 4).toUpperCase();
  
  return isSalonConsumption ? 
    `SALON-${year}${month}${day}-${randomId}` : 
    `INV-${year}${month}${day}-${randomId}`;
};

// Helper to format payment method labels
const getPaymentMethodLabel = (method: string) => {
  const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: "Cash",
    credit_card: "Credit Card",
    debit_card: "Debit Card", 
    upi: "UPI Payment",
    bnpl: "Pay Later",
    membership: "Membership Balance",
    split: "Multiple Methods"
  };
  
  return PAYMENT_METHOD_LABELS[method] || method.replace('_', ' ').toUpperCase();
};

// Calculate totals with membership logic
const calculateBillTotals = (bill: any) => {
  // Check if there are membership payments
  const hasMembershipPayment = bill.payments && bill.payments.some((payment: any) => payment.payment_method === 'membership');
  const membershipAmount = bill.payments ? 
    bill.payments
      .filter((payment: any) => payment.payment_method === 'membership')
      .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0) : 0;
  
  const regularPaymentAmount = bill.payments ? 
    bill.payments
      .filter((payment: any) => payment.payment_method !== 'membership')
      .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0) : 
    (bill.total_amount || bill.total || 0);

  // Calculate original totals
  let subtotalAmount = bill.subtotal || 0;
  let taxAmount = bill.tax || 0;
  let discountAmount = bill.discount || 0;
  let totalAmount = bill.total_amount || bill.total || 0;

  // If there are membership payments, we need to show the breakdown
  if (hasMembershipPayment && membershipAmount > 0) {
    // Calculate the original full amount (before membership discount)
    const originalTotal = regularPaymentAmount + membershipAmount;
    
    // Estimate the membership GST discount (18% GST typically)
    const membershipGSTDiscount = membershipAmount * 0.18 / 1.18;
    
    return {
      subtotalAmount,
      taxAmount,
      discountAmount,
      totalAmount: originalTotal, // Full original amount
      membershipAmount,
      membershipGSTDiscount,
      regularPaymentAmount, // What customer actually pays
      hasMembershipPayment,
      cgst: taxAmount / 2,
      sgst: taxAmount / 2
    };
  } else {
    return {
      subtotalAmount,
      taxAmount,
      discountAmount,
      totalAmount,
      membershipAmount: 0,
      membershipGSTDiscount: 0,
      regularPaymentAmount: totalAmount,
      hasMembershipPayment: false,
      cgst: taxAmount / 2,
      sgst: taxAmount / 2
    };
  }
};

// Main function to print a customer bill
export const printBill = (bill: any) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to print the bill');
    return;
  }
  
  // Calculate all totals with membership logic
  const totals = calculateBillTotals(bill);
  
  // Check if this is a salon consumption order (don't show to customers typically)
  const isSalonConsumption = bill.is_salon_consumption === true || 
                            bill.consumption_purpose || 
                            bill.client_name === 'Salon Consumption';
  
  // Create customer-friendly content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${salonConfig.name}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 15px;
          color: #333;
          max-width: 80mm;
          margin: 0 auto;
          background: #fff;
        }
        .receipt {
          padding: 10px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
        }
        .salon-name {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #2c3e50;
        }
        .salon-details {
          font-size: 11px;
          margin: 2px 0;
          color: #555;
        }
        .bill-title {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin: 15px 0;
          color: #27ae60;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .customer-details {
          margin-bottom: 20px;
          font-size: 12px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .detail-label {
          font-weight: 600;
          color: #2c3e50;
        }
        .section-title {
          font-weight: bold;
          margin: 15px 0 8px 0;
          font-size: 14px;
          text-transform: uppercase;
          color: #2c3e50;
          border-bottom: 1px solid #ddd;
          padding-bottom: 3px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin: 10px 0;
        }
        .items-table th, .items-table td {
          text-align: left;
          padding: 6px 4px;
          border-bottom: 1px solid #eee;
        }
        .items-table th {
          background: #f1f2f6;
          font-weight: bold;
          color: #2c3e50;
          border-bottom: 2px solid #ddd;
        }
        .items-table td:last-child, .items-table th:last-child {
          text-align: right;
        }
        .amount-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 12px;
          padding: 2px 0;
        }
        .amount-label {
          color: #555;
        }
        .amount-value {
          font-weight: 500;
          color: #2c3e50;
        }
        .discount-row {
          color: #e74c3c;
        }
        .membership-row {
          color: #3498db;
          background: #ecf0f1;
          padding: 3px 5px;
          border-radius: 3px;
          margin: 3px 0;
        }
        .total-row {
          font-weight: bold;
          font-size: 14px;
          border-top: 2px solid #2c3e50;
          border-bottom: 2px solid #2c3e50;
          padding: 8px 0;
          margin: 10px 0;
          background: #f8f9fa;
          padding-left: 5px;
          padding-right: 5px;
        }
        .customer-paid-row {
          font-weight: bold;
          font-size: 15px;
          color: #27ae60;
          border: 2px solid #27ae60;
          padding: 8px 5px;
          margin: 8px 0;
          border-radius: 5px;
          background: #d5f4e6;
        }
        .payment-methods {
          margin: 15px 0;
        }
        .payment-method-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 12px;
          padding: 3px 5px;
          background: #f8f9fa;
          border-radius: 3px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 10px;
          border-top: 1px dashed #bdc3c7;
          padding-top: 15px;
          color: #7f8c8d;
        }
        .thank-you {
          font-size: 16px;
          font-weight: bold;
          color: #27ae60;
          text-align: center;
          margin: 15px 0;
        }
        .next-visit {
          font-size: 11px;
          color: #3498db;
          text-align: center;
          margin: 10px 0;
          font-style: italic;
        }
        @media print {
          body {
            width: 80mm;
            margin: 0;
            padding: 5px;
          }
          .receipt {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="salon-name">${salonConfig.name}</div>
          <div class="salon-details">${salonConfig.address.line1}, ${salonConfig.address.line2}</div>
          <div class="salon-details">${salonConfig.address.city}, ${salonConfig.address.state} - ${salonConfig.address.pincode}</div>
          <div class="salon-details">📞 ${salonConfig.contact.phone}</div>
          <div class="salon-details">📧 ${salonConfig.contact.email}</div>
        </div>
        
        <div class="bill-title">${isSalonConsumption ? 'Salon Consumption Receipt' : 'Service Receipt'}</div>
        
        <div class="customer-details">
          <div class="detail-row">
            <span class="detail-label">Receipt No:</span>
            <span>${formatOrderId(bill)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date & Time:</span>
            <span>${formatDate(bill.created_at)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Customer:</span>
            <span>${bill.client_name || bill.customer_name || 'Walk-in Customer'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Served By:</span>
            <span>${bill.stylist_name || 'Our Team'}</span>
          </div>
        </div>
        
        <div class="section-title">Services & Products</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(bill.services || []).map((item: any) => {
              const itemName = item.service_name || item.name || 'Service';
              const quantity = item.quantity || 1;
              const price = item.price || 0;
              const itemTotal = price * quantity;
              
              return `
                <tr>
                  <td>${itemName}</td>
                  <td>${quantity}</td>
                  <td>₹${price.toFixed(2)}</td>
                  <td>₹${itemTotal.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="section-title">Payment Summary</div>
        
        <div class="amount-row">
          <span class="amount-label">Subtotal:</span>
          <span class="amount-value">₹${totals.subtotalAmount.toFixed(2)}</span>
        </div>
        
        ${totals.discountAmount > 0 ? `
          <div class="amount-row discount-row">
            <span class="amount-label">Discount Applied:</span>
            <span class="amount-value">-₹${totals.discountAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        
        <div class="amount-row">
          <span class="amount-label">CGST (9%):</span>
          <span class="amount-value">₹${totals.cgst.toFixed(2)}</span>
        </div>
        <div class="amount-row">
          <span class="amount-label">SGST (9%):</span>
          <span class="amount-value">₹${totals.sgst.toFixed(2)}</span>
        </div>
        
        ${totals.hasMembershipPayment ? `
          <div class="amount-row total-row">
            <span>Total Bill Amount:</span>
            <span>₹${totals.totalAmount.toFixed(2)}</span>
          </div>
          
          <div class="amount-row membership-row">
            <span>💳 Membership Discount (GST Saved):</span>
            <span>-₹${totals.membershipGSTDiscount.toFixed(2)}</span>
          </div>
          
          <div class="amount-row membership-row">
            <span>💳 Paid via Membership Balance:</span>
            <span>-₹${totals.membershipAmount.toFixed(2)}</span>
          </div>
          
          <div class="amount-row customer-paid-row">
            <span>💰 You Paid:</span>
            <span>₹${totals.regularPaymentAmount.toFixed(2)}</span>
          </div>
        ` : `
          <div class="amount-row total-row">
            <span>Total Amount:</span>
            <span>₹${totals.totalAmount.toFixed(2)}</span>
          </div>
        `}
        
        <div class="section-title">Payment Method</div>
        <div class="payment-methods">
          ${bill.payments && bill.payments.length > 0 ? 
            bill.payments
              .filter((payment: any) => payment.payment_method !== 'membership') // Don't show membership as a payment to customer
              .map((payment: any) => `
                <div class="payment-method-row">
                  <span>${getPaymentMethodLabel(payment.payment_method)}:</span>
                  <span>₹${payment.amount.toFixed(2)}</span>
                </div>
              `).join('') : 
            (totals.regularPaymentAmount > 0 ? `
              <div class="payment-method-row">
                <span>${getPaymentMethodLabel(bill.payment_method || 'cash')}:</span>
                <span>₹${totals.regularPaymentAmount.toFixed(2)}</span>
              </div>
            ` : '')
          }
          
          ${totals.hasMembershipPayment ? `
            <div class="payment-method-row" style="background: #d5f4e6; border: 1px solid #27ae60;">
              <span>💳 Membership Balance Used:</span>
              <span>₹${totals.membershipAmount.toFixed(2)}</span>
            </div>
          ` : ''}
        </div>
        
        ${!isSalonConsumption ? `
          <div class="thank-you">Thank You for Visiting!</div>
          <div class="next-visit">🌟 We look forward to serving you again! 🌟</div>
        ` : ''}
        
        <div class="footer">
          <div><strong>Business Hours:</strong> ${salonConfig.business.hours}</div>
          <div><strong>Open:</strong> ${salonConfig.business.workingDays}</div>
          <div>📍 ${salonConfig.contact.website}</div>
          <div>📱 Follow us: ${salonConfig.social.instagram}</div>
          
          <div style="margin-top: 10px; font-size: 9px; color: #95a5a6;">
            ${totals.hasMembershipPayment ? 
              '• Membership benefits applied • GST saved on membership services' : 
              '• All prices include applicable taxes'
            }
            <br>• This is a computer generated receipt
            <br>• Thank you for choosing ${salonConfig.name}
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