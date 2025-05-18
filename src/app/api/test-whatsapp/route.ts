import { NextResponse } from 'next/server';
import { WhatsAppService } from '../../../utils/whatsappService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      phoneNumber,
      clientName,
      appointmentDate,
      services,
      stylist,
      totalAmount,
      messageType
    } = body;

    let result;

    switch (messageType) {
      case 'confirmation':
        result = await WhatsAppService.sendAppointmentConfirmation(
          phoneNumber,
          clientName,
          new Date(appointmentDate),
          services,
          stylist,
          totalAmount
        );
        break;

      case 'update':
        const { oldDate, newDate } = body;
        result = await WhatsAppService.sendAppointmentUpdate(
          phoneNumber,
          clientName,
          new Date(oldDate),
          new Date(newDate),
          services,
          stylist,
          totalAmount
        );
        break;

      case 'reminder':
        result = await WhatsAppService.sendAppointmentReminder(
          phoneNumber,
          clientName,
          new Date(appointmentDate),
          services,
          stylist
        );
        break;

      case 'cancellation':
        result = await WhatsAppService.sendAppointmentCancellation(
          phoneNumber,
          clientName,
          new Date(appointmentDate)
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid message type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error in test-whatsapp route:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
} 