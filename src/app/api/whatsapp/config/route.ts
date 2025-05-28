import { NextResponse } from 'next/server';
import { WhatsAppAutomation, AutoMessageConfig } from '@/whatsapp/business-api/utils/whatsappAutomation';

// GET - Get current WhatsApp automation configuration
export async function GET(req: Request) {
  try {
    const config = WhatsAppAutomation.getConfig();

    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error getting WhatsApp config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get configuration' },
      { status: 500 }
    );
  }
}

// POST - Update WhatsApp automation configuration
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const config: Partial<AutoMessageConfig> = body;

    // Validate the configuration
    if (config.enabled !== undefined && typeof config.enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'enabled must be a boolean' },
        { status: 400 }
      );
    }

    if (config.messageTypes) {
      const validTypes = [
        'orderCreated',
        'orderUpdated', 
        'orderDeleted',
        'appointmentCreated',
        'appointmentUpdated',
        'appointmentCancelled',
        'inventoryLow',
        'clientWelcome',
        'paymentReceived'
      ];

      for (const [key, value] of Object.entries(config.messageTypes)) {
        if (!validTypes.includes(key)) {
          return NextResponse.json(
            { success: false, error: `Invalid message type: ${key}` },
            { status: 400 }
          );
        }
        if (typeof value !== 'boolean') {
          return NextResponse.json(
            { success: false, error: `Message type ${key} must be a boolean` },
            { status: 400 }
          );
        }
      }
    }

    // Update the configuration
    WhatsAppAutomation.setConfig(config);
    const updatedConfig = WhatsAppAutomation.getConfig();

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      config: updatedConfig
    });

  } catch (error) {
    console.error('Error updating WhatsApp config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

// PUT - Reset configuration to defaults
export async function PUT(req: Request) {
  try {
    const defaultConfig: AutoMessageConfig = {
      enabled: true,
      messageTypes: {
        orderCreated: true,
        orderUpdated: true,
        orderDeleted: true,
        appointmentCreated: true,
        appointmentUpdated: true,
        appointmentCancelled: true,
        inventoryLow: true,
        clientWelcome: true,
        paymentReceived: true,
      }
    };

    WhatsAppAutomation.setConfig(defaultConfig);

    return NextResponse.json({
      success: true,
      message: 'Configuration reset to defaults',
      config: defaultConfig
    });

  } catch (error) {
    console.error('Error resetting WhatsApp config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset configuration' },
      { status: 500 }
    );
  }
} 