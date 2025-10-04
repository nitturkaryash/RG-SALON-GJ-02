import { formatCurrency } from './formatting/format';
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
    hour12: true,
  });
};

// Generate a customer-friendly order ID
const formatOrderId = (order: any) => {
  if (!order || !order.id) return 'Unknown';

  // Check if this is a salon consumption order
  const isSalonConsumption =
    order.is_salon_consumption === true ||
    order.consumption_purpose ||
    order.client_name === 'Salon Consumption';

  // Create a simple numeric ID for customers
  const timestamp = new Date(order.created_at || Date.now());
  const year = timestamp.getFullYear();

  // Format year as 2526 for 2025-2026 period
  const yearFormat =
    year >= 2025
      ? '2526'
      : `${year.toString().slice(-2)}${Math.floor(year / 100)}`;

  // Create a sequential number from the order ID
  const sequentialId =
    Math.abs(
      order.id.split('').reduce((a: number, b: string) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0)
    ) % 10000;

  const paddedId = sequentialId.toString().padStart(4, '0');

  return isSalonConsumption
    ? `SC${paddedId}/${yearFormat}`
    : `RNG${paddedId}/${yearFormat}`;
};

// Helper to format payment method labels
const getPaymentMethodLabel = (method: string) => {
  const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: 'Cash',
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    upi: 'UPI Payment',
    bnpl: 'Pay Later',
    membership: 'Membership Balance',
    split: 'Multiple Methods',
  };

  return (
    PAYMENT_METHOD_LABELS[method] || method.replace('_', ' ').toUpperCase()
  );
};

// Calculate totals with membership logic
const calculateBillTotals = (bill: any) => {
  // Check if there are membership payments
  const hasMembershipPayment =
    bill.payments &&
    bill.payments.some(
      (payment: any) => payment.payment_method === 'membership'
    );
  const membershipAmount = bill.payments
    ? bill.payments
        .filter((payment: any) => payment.payment_method === 'membership')
        .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)
    : 0;

  // Check for multi-expert orders (various flags used by different parts of the system)
  const isMultiExpert =
    (bill as any).aggregated_multi_expert ||
    (bill as any).is_multi_expert ||
    (bill as any).multi_expert ||
    ((bill as any).expert_count && (bill as any).expert_count > 1) ||
    ((bill as any).total_experts && (bill as any).total_experts > 1);

  let regularPaymentAmount = bill.payments
    ? bill.payments
        .filter((payment: any) => payment.payment_method !== 'membership')
        .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)
    : bill.total_amount || bill.total || 0;

  if (isMultiExpert && bill.payments && bill.payments.length > 0) {
    // Calculate how many experts were involved
    const expertCount =
      (bill as any).expert_count ||
      (bill as any).total_experts ||
      (bill.services
        ? [
            ...new Set(
              bill.services.map((s: any) => s.stylist_name).filter(Boolean)
            ),
          ].length
        : 1);

    regularPaymentAmount =
      bill.payments
        .filter((payment: any) => payment.payment_method !== 'membership')
        .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0) *
      expertCount;
  }

  // Calculate original totals
  let subtotalAmount = bill.subtotal || 0;
  let taxAmount = bill.tax || 0;
  let discountAmount = bill.discount || 0;
  let totalAmount = bill.total_amount || bill.total || 0;

  // For multi-expert orders, calculate correct totals from aggregated services
  if (isMultiExpert && bill.services && bill.services.length > 0) {
    const serviceAggregation: Record<string, { total_price: number }> = {};

    bill.services.forEach((service: any) => {
      const serviceName =
        service.service_name || service.item_name || service.name;
      const quantity = service.quantity || 1;
      const price = service.price || 0;

      if (!serviceAggregation[serviceName]) {
        serviceAggregation[serviceName] = { total_price: 0 };
      }
      serviceAggregation[serviceName].total_price += price * quantity;
    });

    // Calculate the correct totals from aggregated services
    const correctSubtotal = Object.values(serviceAggregation).reduce(
      (sum, item) => sum + item.total_price,
      0
    );
    const correctTax = correctSubtotal * 0.18; // 18% GST
    const correctTotal = correctSubtotal + correctTax - discountAmount;

    subtotalAmount = correctSubtotal;
    taxAmount = correctTax;
    totalAmount = correctTotal;
  }

  // If there are membership payments, we need to show the breakdown
  if (hasMembershipPayment && membershipAmount > 0) {
    // Calculate the original full amount (before membership discount)
    const originalTotal = regularPaymentAmount + membershipAmount;

    // Estimate the membership GST discount (18% GST typically)
    const membershipGSTDiscount = (membershipAmount * 0.18) / 1.18;

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
      sgst: taxAmount / 2,
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
      sgst: taxAmount / 2,
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
  const isSalonConsumption =
    bill.is_salon_consumption === true ||
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
          padding: 8px;
        }
        .header {
          text-align: center;
          margin-bottom: 12px;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        .salon-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 6px;
          color: #2c3e50;
        }
        .salon-details {
          font-size: 9px;
          margin: 1px 0;
          color: #555;
          line-height: 1.3;
        }
        .bill-title {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          margin: 10px 0;
          color: #27ae60;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .customer-details {
          margin-bottom: 12px;
          font-size: 10px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 4px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
          line-height: 1.4;
        }
        .detail-label {
          font-weight: 600;
          color: #2c3e50;
        }
        .section-title {
          font-weight: bold;
          margin: 10px 0 6px 0;
          font-size: 12px;
          text-transform: uppercase;
          color: #2c3e50;
          border-bottom: 1px solid #ddd;
          padding-bottom: 2px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          margin: 8px 0;
        }
        .items-table th, .items-table td {
          text-align: left;
          padding: 4px 3px;
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
          margin: 3px 0;
          font-size: 10px;
          padding: 2px 0;
          line-height: 1.4;
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
          padding: 2px 4px;
          border-radius: 3px;
          margin: 2px 0;
        }
        .total-row {
          font-weight: bold;
          font-size: 12px;
          border-top: 2px solid #2c3e50;
          border-bottom: 2px solid #2c3e50;
          padding: 6px 0;
          margin: 8px 0;
          background: #f8f9fa;
          padding-left: 5px;
          padding-right: 5px;
        }
        .customer-paid-row {
          font-weight: bold;
          font-size: 13px;
          color: #27ae60;
          border: 2px solid #27ae60;
          padding: 6px 4px;
          margin: 6px 0;
          border-radius: 4px;
          background: #d5f4e6;
        }
        .payment-methods {
          margin: 10px 0;
        }
        .payment-method-row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
          font-size: 10px;
          padding: 2px 4px;
          background: #f8f9fa;
          border-radius: 3px;
        }
        .footer {
          text-align: center;
          margin-top: 12px;
          font-size: 8px;
          border-top: 1px dashed #bdc3c7;
          padding-top: 10px;
          color: #7f8c8d;
          line-height: 1.3;
        }
        .thank-you {
          font-size: 13px;
          font-weight: bold;
          color: #27ae60;
          text-align: center;
          margin: 10px 0;
        }
        .next-visit {
          font-size: 9px;
          color: #3498db;
          text-align: center;
          margin: 6px 0;
          font-style: italic;
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            width: 100%;
            max-width: 210mm;
            margin: 0;
            padding: 0;
          }
          .receipt {
            padding: 0;
            page-break-inside: avoid;
          }
          .items-table {
            page-break-inside: auto;
          }
          .items-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="salon-name">${salonConfig.name}</div>
          <div class="salon-details">${salonConfig.address.line1}</div>
          <div class="salon-details">${salonConfig.address.line2}, ${salonConfig.address.state} - ${salonConfig.address.pincode}</div>
          <div class="salon-details">📞 ${salonConfig.contact.phone}</div>
          <div class="salon-details">📧 ${salonConfig.contact.email}</div>
          <div class="salon-details"><strong>GSTIN:</strong> ${salonConfig.gst.number}</div>
        </div>
        
        <div class="bill-title">${isSalonConsumption ? 'Salon Consumption Receipt' : 'Tax Invoice'}</div>
        
        <div class="customer-details">
          <div class="detail-row">
            <span class="detail-label">Invoice Number:</span>
            <span>${formatOrderId(bill)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span>${formatDate(bill.created_at)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Customer Name:</span>
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
              <th>Service/Product</th>
              <th>HSN</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              // Check for multi-expert orders (various flags used by different parts of the system)
              const isMultiExpert =
                (bill as any).aggregated_multi_expert ||
                (bill as any).is_multi_expert ||
                (bill as any).multi_expert ||
                ((bill as any).expert_count &&
                  (bill as any).expert_count > 1) ||
                ((bill as any).total_experts &&
                  (bill as any).total_experts > 1);

              if (isMultiExpert && bill.services && bill.services.length > 0) {
                // Aggregate services by name for multi-expert orders
                const serviceAggregation: Record<
                  string,
                  {
                    service_name: string;
                    total_quantity: number;
                    unit_price: number;
                    total_price: number;
                  }
                > = {};

                bill.services.forEach((item: any) => {
                  const serviceName =
                    item.service_name ||
                    item.item_name ||
                    item.name ||
                    'Service';
                  const quantity = item.quantity || 1;
                  const price = item.price || 0;

                  if (!serviceAggregation[serviceName]) {
                    serviceAggregation[serviceName] = {
                      service_name: serviceName,
                      total_quantity: quantity,
                      unit_price: 0,
                      total_price: 0,
                    };
                  }

                  // Add up the prices from all experts working on this service
                  serviceAggregation[serviceName].unit_price += price;
                  serviceAggregation[serviceName].total_price +=
                    price * quantity;
                });

                return Object.values(serviceAggregation)
                  .map(aggregatedService => {
                    const hsn = '999721';
                    return `
                    <tr>
                      <td>${aggregatedService.service_name}</td>
                      <td>${hsn}</td>
                      <td>${aggregatedService.total_quantity}</td>
                      <td>₹${aggregatedService.unit_price.toFixed(2)}</td>
                      <td>₹${aggregatedService.total_price.toFixed(2)}</td>
                    </tr>
                  `;
                  })
                  .join('');
              } else {
                // Regular order - display services normally
                return (bill.services || [])
                  .map((item: any) => {
                    const itemName =
                      item.service_name || item.name || 'Service';
                    const quantity = item.quantity || 1;
                    const price = item.price || 0;
                    const itemTotal = price * quantity;
                    const hsn =
                      item.type === 'product'
                        ? item.hsn_code || item.product_hsn || item.hsn || ''
                        : '999721';

                    return `
                    <tr>
                      <td>${itemName}</td>
                      <td>${hsn}</td>
                      <td>${quantity}</td>
                      <td>₹${price.toFixed(2)}</td>
                      <td>₹${itemTotal.toFixed(2)}</td>
                    </tr>
                  `;
                  })
                  .join('');
              }
            })()}
          </tbody>
        </table>
        
        <div class="section-title">Payment Summary</div>
        
        <div class="amount-row">
          <span class="amount-label">Subtotal:</span>
          <span class="amount-value">₹${totals.subtotalAmount.toFixed(2)}</span>
        </div>
        
        ${
          totals.discountAmount > 0
            ? `
          <div class="amount-row discount-row">
            <span class="amount-label">Discount Applied:</span>
            <span class="amount-value">-₹${totals.discountAmount.toFixed(2)}</span>
          </div>
        `
            : ''
        }
        
        <div class="amount-row">
          <span class="amount-label">CGST (9%):</span>
          <span class="amount-value">₹${totals.cgst.toFixed(2)}</span>
        </div>
        <div class="amount-row">
          <span class="amount-label">SGST (9%):</span>
          <span class="amount-value">₹${totals.sgst.toFixed(2)}</span>
        </div>
        
        ${
          totals.hasMembershipPayment
            ? `
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
        `
            : `
          <div class="amount-row total-row">
            <span>Total:</span>
            <span>₹${totals.totalAmount.toFixed(2)}</span>
          </div>
        `
        }
        
        <div class="section-title">Payment Mode</div>
        <div class="payment-methods">
          ${(() => {
            // Check for multi-expert orders (various flags used by different parts of the system)
            const isMultiExpert =
              (bill as any).aggregated_multi_expert ||
              (bill as any).is_multi_expert ||
              (bill as any).multi_expert ||
              ((bill as any).expert_count && (bill as any).expert_count > 1) ||
              ((bill as any).total_experts && (bill as any).total_experts > 1);

            if (bill.payments && bill.payments.length > 0) {
              if (isMultiExpert) {
                // For multi-expert orders, calculate the correct payment amounts
                const expertCount =
                  (bill as any).expert_count ||
                  (bill as any).total_experts ||
                  (bill.services
                    ? [
                        ...new Set(
                          bill.services
                            .map((s: any) => s.stylist_name)
                            .filter(Boolean)
                        ),
                      ].length
                    : 1);

                // Group payments by method and multiply by expert count
                const aggregatedPayments: Record<string, number> = {};
                bill.payments
                  .filter(
                    (payment: any) => payment.payment_method !== 'membership'
                  )
                  .forEach((payment: any) => {
                    const method = payment.payment_method;
                    aggregatedPayments[method] =
                      (aggregatedPayments[method] || 0) +
                      payment.amount * expertCount;
                  });

                return Object.entries(aggregatedPayments)
                  .map(
                    ([method, amount]) => `
                  <div class="payment-method-row">
                    <span>${getPaymentMethodLabel(method)}:</span>
                    <span>₹${amount.toFixed(2)}</span>
                  </div>
                `
                  )
                  .join('');
              } else {
                // Regular orders - show payments normally
                return bill.payments
                  .filter(
                    (payment: any) => payment.payment_method !== 'membership'
                  )
                  .map(
                    (payment: any) => `
                    <div class="payment-method-row">
                      <span>${getPaymentMethodLabel(payment.payment_method)}:</span>
                      <span>₹${payment.amount.toFixed(2)}</span>
                    </div>
                  `
                  )
                  .join('');
              }
            } else if (totals.regularPaymentAmount > 0) {
              return `
                <div class="payment-method-row">
                  <span>${getPaymentMethodLabel(bill.payment_method || 'cash')}:</span>
                  <span>₹${totals.regularPaymentAmount.toFixed(2)}</span>
                </div>
              `;
            }
            return '';
          })()}
          
          ${
            totals.hasMembershipPayment
              ? `
            <div class="payment-method-row" style="background: #d5f4e6; border: 1px solid #27ae60;">
              <span>💳 Membership Balance Used:</span>
              <span>₹${totals.membershipAmount.toFixed(2)}</span>
            </div>
          `
              : ''
          }
        </div>
        
        ${
          !isSalonConsumption
            ? `
          <div class="thank-you">Thank You for Visiting!</div>
          <div class="next-visit">🌟 We look forward to serving you again! 🌟</div>
        `
            : ''
        }
        
        <div class="footer">
          <div><strong>Business Hours:</strong> ${salonConfig.business.hours}</div>
          <div><strong>Open:</strong> ${salonConfig.business.workingDays}</div>
          <div>📍 ${salonConfig.contact.website}</div>
          <div>📱 Follow us: ${salonConfig.social.instagram}</div>
          
          <div style="margin-top: 10px; font-size: 9px; color: #95a5a6;">
            ${
              totals.hasMembershipPayment
                ? '• Membership benefits applied • GST saved on membership services'
                : '• All prices include applicable taxes'
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
