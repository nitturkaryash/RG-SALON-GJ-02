// API route handler for appointment notifications
export async function POST(req: Request) {
  try {
    console.log('Received email notification request');
    const body = await req.json();
    console.log('Request body:', { ...body, to: '***@***.com' }); // Log sanitized email

    const { type, to, clientName, action, appointmentTime, html } = body;

    if (!to || !clientName || !type) {
      console.error('Missing required fields:', { type, clientName, hasEmail: !!to });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const mailOptions = {
      from: `"RG Salon" <${process.env.GMAIL_USER || 'pankajhadole4@gmail.com'}>`,
      to,
      subject: `Your Appointment has been ${action || type}`,
      html: html || `Default email content for ${type}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in email notification route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
