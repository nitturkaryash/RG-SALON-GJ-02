# WhatsApp MCP Setup Guide

This guide will help you set up WhatsApp MCP (Model Context Protocol) integration for your salon management system, enabling you to manage WhatsApp messages, contacts, and chats directly through Cursor.

## Prerequisites

✅ **Installed:**
- UV (Python package manager)
- Go programming language
- WhatsApp MCP repository cloned

## Setup Steps

### 1. WhatsApp Bridge Authentication

The WhatsApp bridge needs to be authenticated with your WhatsApp account:

```bash
# Start the bridge manager
./whatsapp-bridge-manager.sh start

# Check logs for QR code
./whatsapp-bridge-manager.sh logs
```

**To authenticate:**
1. Open WhatsApp on your phone
2. Go to Settings → Linked Devices
3. Tap "Link a Device"
4. Scan the QR code displayed in the terminal

### 2. MCP Configuration

Your MCP configuration is already set up in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres.cpkxkoosykyahuezxela:6Qtaoc18X0wHuA36@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
      ]
    },
    "whatsapp": {
      "command": "/Users/yashnitturkar/.local/bin/uv",
      "args": [
        "--directory",
        "/Users/yashnitturkar/Desktop/Free Lance projects /salon_updated_sales_history/whatsapp-mcp/whatsapp-mcp-server",
        "run",
        "main.py"
      ]
    }
  }
}
```

### 3. Restart Cursor

After setting up the MCP configuration:
1. Close Cursor completely
2. Reopen Cursor
3. The WhatsApp MCP server should now be available

## Available MCP Tools

Once connected, you'll have access to these WhatsApp tools through Cursor:

### Message Management
- `search_contacts` - Search for contacts by name or phone number
- `list_messages` - Retrieve messages with optional filters
- `list_chats` - List available chats with metadata
- `send_message` - Send WhatsApp messages
- `get_message_context` - Get context around specific messages

### Contact Management
- `get_contact_chats` - List all chats involving a specific contact
- `get_direct_chat_by_contact` - Find direct chat with a contact
- `get_last_interaction` - Get most recent message with a contact

### Media Handling
- `send_file` - Send images, videos, documents
- `send_audio_message` - Send voice messages
- `download_media` - Download media from messages

### Chat Management
- `get_chat` - Get information about specific chats

## WhatsApp Manager Component

A comprehensive React component has been created at:
`src/components/whatsapp/WhatsAppManager.tsx`

### Features:
- **Chat Management**: View and manage all WhatsApp chats
- **Message History**: Browse message history with search
- **Contact CRUD**: Add, edit, delete contacts
- **File Sharing**: Send and receive media files
- **Real-time Updates**: Live message updates

### Usage:
```tsx
import WhatsAppManager from '@/components/whatsapp/WhatsAppManager';

function App() {
  return <WhatsAppManager />;
}
```

## API Routes

The following API routes have been created for WhatsApp integration:

- `POST /api/whatsapp/search-contacts` - Search contacts
- `GET /api/whatsapp/list-chats` - List all chats
- `POST /api/whatsapp/list-messages` - Get messages for a chat
- `POST /api/whatsapp/send-message` - Send text message
- `POST /api/whatsapp/send-file` - Send file/media
- `POST /api/whatsapp/download-media` - Download media

## Bridge Management

Use the bridge manager script for easy control:

```bash
# Start the bridge
./whatsapp-bridge-manager.sh start

# Stop the bridge
./whatsapp-bridge-manager.sh stop

# Check status
./whatsapp-bridge-manager.sh status

# View logs
./whatsapp-bridge-manager.sh logs

# Show QR code
./whatsapp-bridge-manager.sh qr

# Restart bridge
./whatsapp-bridge-manager.sh restart
```

## Integration with Salon System

### Appointment Notifications
```typescript
// Send appointment confirmation
await fetch('/api/whatsapp/send-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipient: '+919876543210',
    message: `Hi ${clientName}! Your appointment is confirmed for ${date} at ${time}. See you soon!`
  })
});
```

### Service Reminders
```typescript
// Send service reminder
await fetch('/api/whatsapp/send-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipient: client.phone,
    message: `Hi ${client.name}! Don't forget your appointment tomorrow at ${time}. Reply CONFIRM to confirm.`
  })
});
```

### Promotional Messages
```typescript
// Send promotional offers
await fetch('/api/whatsapp/send-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipient: client.phone,
    message: `🎉 Special offer! Get 20% off on all hair services this week. Book now!`
  })
});
```

## Troubleshooting

### Bridge Issues
1. **QR Code not showing**: Restart the bridge with `./whatsapp-bridge-manager.sh restart`
2. **Authentication timeout**: The QR code expires after ~20 seconds, restart to get a new one
3. **Connection lost**: Check if WhatsApp is still linked in your phone settings

### MCP Issues
1. **Server not connecting**: Restart Cursor after MCP configuration changes
2. **Tools not available**: Check that both bridge and MCP server are running
3. **Permission errors**: Ensure UV has proper permissions

### Database Issues
1. **Messages not syncing**: Delete database files in `whatsapp-mcp/whatsapp-bridge/store/` and re-authenticate
2. **Storage full**: Clean up old message history periodically

## Security Notes

- All messages are stored locally in SQLite database
- No data is sent to external servers except WhatsApp
- Authentication is done directly with WhatsApp Web API
- Media files are stored locally in `public/uploads/`

## Next Steps

1. **Scan the QR code** to authenticate your WhatsApp account
2. **Restart Cursor** to activate the MCP integration
3. **Test the integration** using the WhatsApp Manager component
4. **Integrate with your salon workflows** for automated notifications

## Support

If you encounter issues:
- Check the bridge logs: `./whatsapp-bridge-manager.sh logs`
- Verify MCP server status in Cursor
- Ensure WhatsApp is properly linked on your phone
- Check network connectivity

For more information, refer to the [WhatsApp MCP documentation](https://github.com/lharries/whatsapp-mcp). 