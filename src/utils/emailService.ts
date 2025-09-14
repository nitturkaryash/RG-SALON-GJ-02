// Helper function to format date for email
function formatDateTime(dateTime: string | Date) {
  return new Date(dateTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Helper function to format currency
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

// Helper function to create a styled email template
function createEmailTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Poppins', sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f0f2f5;
          color: #333;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }
        .header {
          background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
          color: white;
          text-align: center;
          padding: 30px;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h20v20H0z" fill="none"/><path d="M10 0l10 10-10 10L0 10z" fill="rgba(255,255,255,0.05)"/></svg>') repeat;
          opacity: 0.4;
        }
        .logo {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 2px;
          position: relative;
        }
        .logo::after {
          content: '';
          display: block;
          width: 60px;
          height: 3px;
          background: #ffd700;
          margin: 10px auto;
          border-radius: 2px;
        }
        .sub-header {
          font-size: 18px;
          font-weight: 300;
          opacity: 0.95;
        }
        .content {
          padding: 40px 30px;
        }
        .appointment-card {
          background: #ffffff;
          border: none;
          border-radius: 16px;
          padding: 30px;
          margin: 20px 0;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .appointment-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(to right, #ffd700, #ffa000);
          border-radius: 16px 16px 0 0;
        }
        .appointment-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px dashed rgba(0, 0, 0, 0.1);
        }
        .appointment-time {
          font-size: 28px;
          color: #1a237e;
          font-weight: 600;
          margin: 15px 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }
        .appointment-date {
          font-size: 20px;
          color: #424242;
          font-weight: 500;
        }
        .service-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 25px 0;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }
        .service-table th {
          background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
          color: white;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          font-size: 15px;
        }
        .service-table td {
          padding: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          font-size: 14px;
        }
        .service-table tr:last-child td {
          border-bottom: none;
        }
        .total-row {
          background: #f5f6ff;
          font-weight: 600;
          font-size: 16px !important;
        }
        .stylist-section {
          margin: 25px 0;
          padding: 25px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border-left: 6px solid #1a237e;
        }
        .stylist-section h3 {
          margin-top: 0;
          color: #1a237e;
          font-size: 20px;
          font-weight: 600;
        }
        .stylist-card {
          display: flex;
          align-items: center;
          margin: 15px 0;
          padding: 15px;
          background: #f8f9ff;
          border-radius: 12px;
          transition: transform 0.2s;
        }
        .stylist-card:hover {
          transform: translateX(5px);
        }
        .stylist-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-right: 20px;
          font-size: 20px;
          box-shadow: 0 4px 10px rgba(26, 35, 126, 0.2);
        }
        .important-info {
          margin: 25px 0;
          padding: 25px;
          background: #fff8e1;
          border-radius: 12px;
          border-left: 6px solid #ffa000;
          box-shadow: 0 4px 20px rgba(255, 160, 0, 0.1);
        }
        .important-info h3 {
          color: #f57c00;
          margin-top: 0;
          font-size: 20px;
          font-weight: 600;
        }
        .important-info ul {
          margin: 0;
          padding-left: 20px;
        }
        .important-info li {
          margin: 10px 0;
          color: #424242;
        }
        .contact-footer {
          background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .contact-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h20v20H0z" fill="none"/><path d="M10 0l10 10-10 10L0 10z" fill="rgba(255,255,255,0.05)"/></svg>') repeat;
          opacity: 0.4;
        }
        .contact-info {
          background: rgba(255, 255, 255, 0.1);
          padding: 25px;
          border-radius: 12px;
          margin: 20px 0;
          backdrop-filter: blur(5px);
        }
        .contact-info strong {
          display: block;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 600;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          display: inline-block;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          margin: 0 10px;
          line-height: 40px;
          color: white;
          text-decoration: none;
          transition: background 0.3s;
        }
        .social-links a:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .status-confirmed {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .status-rescheduled {
          background: #e3f2fd;
          color: #1565c0;
        }
        .status-cancelled {
          background: #ffebee;
          color: #c62828;
        }
        .copyright {
          margin-top: 20px;
          font-size: 14px;
          opacity: 0.9;
          position: relative;
        }
        @media (max-width: 600px) {
          .email-container {
            margin: 10px;
          }
          .content {
            padding: 20px 15px;
          }
          .appointment-card {
            padding: 20px;
          }
          .appointment-time {
            font-size: 24px;
          }
          .service-table th,
          .service-table td {
            padding: 12px;
          }
          .stylist-section,
          .important-info {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">RG SALON</div>
          <div class="sub-header">Your Style, Our Passion</div>
        </div>
        ${content}
        <div class="contact-footer">
          <div class="contact-info">
            <strong>Connect With Us</strong>
            📞 +91 1234567890<br>
            📧 info@rgsalon.com<br>
            📍 Shop No 123, ABC Complex, XYZ Road<br>
            ⏰ Open: 9:00 AM - 9:00 PM (Monday - Sunday)
          </div>
          <div class="social-links">
            <a href="#" title="Facebook">f</a>
            <a href="#" title="Instagram">i</a>
            <a href="#" title="Twitter">t</a>
          </div>
          <div class="copyright">
            © ${new Date().getFullYear()} RG Salon. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendAppointmentEmail(
  to: string,
  clientName: string,
  appointmentTime: string | Date,
  type: 'booked' | 'updated' | 'cancelled' | 'reminder',
  services: Array<{ name: string; duration: number; price: number }> = [],
  stylists: Array<{ name: string }> = [],
  totalAmount: number = 0
) {
  try {
    let content = '';
    const appointmentDate = new Date(appointmentTime);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Create services table
    const servicesTable =
      services.length > 0
        ? `
      <table class="service-table">
        <tr>
          <th>Service</th>
          <th>Duration</th>
          <th>Price</th>
        </tr>
        ${services
          .map(
            service => `
          <tr>
            <td>${service.name}</td>
            <td>${service.duration} mins</td>
            <td>${formatCurrency(service.price)}</td>
          </tr>
        `
          )
          .join('')}
        <tr class="total-row">
          <td colspan="2">Total Amount</td>
          <td>${formatCurrency(totalAmount)}</td>
        </tr>
      </table>
    `
        : '';

    // Create stylists section
    const stylistsSection =
      stylists.length > 0
        ? `
      <div class="stylist-section">
        <h3>Your Expert Stylist(s)</h3>
        ${stylists
          .map(
            stylist => `
          <div class="stylist-card">
            <div class="stylist-avatar">${stylist.name.charAt(0)}</div>
            <div>${stylist.name}</div>
          </div>
        `
          )
          .join('')}
      </div>
    `
        : '';

    switch (type) {
      case 'booked':
        content = `
          <div class="content">
            <h2 style="text-align: center; color: #1a237e;">Appointment Confirmation</h2>
            <p>Dear ${clientName},</p>
            
            <div class="appointment-card">
              <div class="appointment-header">
                <div class="appointment-date">${formattedDate}</div>
                <div class="appointment-time">${formattedTime}</div>
                <div class="status-badge status-confirmed">✓ CONFIRMED</div>
              </div>

              <h3>Services Booked</h3>
              ${servicesTable}
              
              ${stylistsSection}
            </div>

            <div class="important-info">
              <h3>Appointment Instructions</h3>
              <ul>
                <li>Please arrive 10 minutes before your appointment time</li>
                <li>Bring reference photos if you have any specific style in mind</li>
                <li>In case of cancellation, please inform us 2 hours prior</li>
                <li>We accept all major payment methods: Cash, UPI, Cards</li>
              </ul>
            </div>
          </div>
        `;
        break;

      case 'updated':
        content = `
          <div class="content">
            <h2 style="text-align: center; color: #1a237e;">Appointment Update</h2>
            <p>Dear ${clientName},</p>
            
            <div class="appointment-card">
              <div class="appointment-header">
                <div class="appointment-date">${formattedDate}</div>
                <div class="appointment-time">${formattedTime}</div>
                <div class="status-badge status-rescheduled">↻ RESCHEDULED</div>
              </div>

              <h3>Updated Services</h3>
              ${servicesTable}
              
              ${stylistsSection}
            </div>

            <div class="important-info">
              <h3>Important Reminders</h3>
              <ul>
                <li>Your appointment has been successfully rescheduled</li>
                <li>Please arrive 10 minutes before your appointment time</li>
                <li>For any changes, contact us at +91 1234567890</li>
                <li>We accept all major payment methods: Cash, UPI, Cards</li>
              </ul>
            </div>
          </div>
        `;
        break;

      case 'cancelled':
        content = `
          <div class="content">
            <h2 style="text-align: center; color: #1a237e;">Appointment Cancellation</h2>
            <p>Dear ${clientName},</p>
            
            <div class="appointment-card">
              <div class="appointment-header">
                <div class="appointment-date">${formattedDate}</div>
                <div class="appointment-time">${formattedTime}</div>
                <div class="status-badge status-cancelled">✕ CANCELLED</div>
              </div>

              <h3>Cancelled Services</h3>
              ${servicesTable}
              
              ${stylistsSection}
            </div>

            <div class="important-info">
              <h3>Special Offer</h3>
              <ul>
                <li>Your appointment has been cancelled as requested</li>
                <li>Book a new appointment within 24 hours to get 10% off</li>
                <li>Call us at +91 1234567890 to book your next appointment</li>
                <li>We hope to see you again soon!</li>
              </ul>
            </div>
          </div>
        `;
        break;

      case 'reminder':
        content = `
          <div class="content">
            <h2 style="text-align: center; color: #1a237e;">Appointment Reminder</h2>
            <p>Dear ${clientName},</p>
            
            <div class="appointment-card">
              <div class="appointment-header">
                <div class="appointment-date">${formattedDate}</div>
                <div class="appointment-time">${formattedTime}</div>
                <div class="status-badge status-confirmed">⏰ TOMORROW</div>
              </div>

              <h3>Your Scheduled Services</h3>
              ${servicesTable}
              
              ${stylistsSection}
            </div>

            <div class="important-info">
              <h3>Pre-Appointment Checklist</h3>
              <ul>
                <li>Please arrive 10 minutes before your appointment time</li>
                <li>Bring reference photos if you have any specific style in mind</li>
                <li>If you need to reschedule, please inform us at least 2 hours prior</li>
                <li>We accept all major payment methods: Cash, UPI, Cards</li>
                <li>Feel free to call us at +91 1234567890 if you have any questions</li>
              </ul>
            </div>
          </div>
        `;
        break;
    }

    const emailBody = createEmailTemplate(content);

    const response = await fetch(
      'http://localhost:3001/api/notifications/email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          clientName,
          appointmentTime,
          type,
          html: emailBody,
        }),
      }
    );

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
