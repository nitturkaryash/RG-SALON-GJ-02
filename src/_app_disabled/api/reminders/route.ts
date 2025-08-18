import { NextResponse } from 'next/server';
import { 
  processAppointmentReminders, 
  sendManualReminder, 
  getAppointmentsNeedingReminders 
} from '@/utils/appointmentReminders';

// GET - Get appointments needing reminders or check reminder status
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // '24h' or '2h'
    const action = searchParams.get('action'); // 'check' or 'list'

    if (action === 'list') {
      // List appointments needing reminders
      const hours = type === '2h' ? 2 : 24;
      const appointments = await getAppointmentsNeedingReminders(hours);
      
      return NextResponse.json({
        success: true,
        reminderType: `${hours}h`,
        count: appointments.length,
        appointments
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Reminder system is active',
      availableActions: ['check', 'list'],
      availableTypes: ['24h', '2h']
    });

  } catch (error) {
    console.error('Error in reminders GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// POST - Trigger reminder processing or send manual reminders
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, appointmentId, reminderType = '24h' } = body;

    if (action === 'process-all') {
      // Process all reminders
      console.log('📱 Manual trigger for appointment reminder processing...');
      await processAppointmentReminders();
      
      return NextResponse.json({
        success: true,
        message: 'Reminder processing completed',
        timestamp: new Date().toISOString()
      });

    } else if (action === 'send-manual' && appointmentId) {
      // Send manual reminder for specific appointment
      console.log(`📱 Manual reminder request for appointment: ${appointmentId}, type: ${reminderType}`);
      
      const success = await sendManualReminder(appointmentId, reminderType as '24h' | '2h');
      
      if (success) {
        return NextResponse.json({
          success: true,
          message: `${reminderType} reminder sent successfully`,
          appointmentId,
          reminderType
        });
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to send reminder',
            appointmentId,
            reminderType
          },
          { status: 400 }
        );
      }

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action or missing parameters' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in reminders POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process reminder request' },
      { status: 500 }
    );
  }
} 
