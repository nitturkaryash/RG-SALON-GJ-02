#!/bin/bash

# WhatsApp Bridge Manager Script

BRIDGE_DIR="whatsapp-mcp/whatsapp-bridge"
PID_FILE="whatsapp-bridge.pid"

case "$1" in
    start)
        echo "Starting WhatsApp Bridge..."
        cd "$BRIDGE_DIR"
        nohup go run main.go > bridge.log 2>&1 &
        echo $! > "$PID_FILE"
        echo "Bridge started with PID: $(cat $PID_FILE)"
        echo "Check bridge.log for QR code and status"
        ;;
    stop)
        echo "Stopping WhatsApp Bridge..."
        if [ -f "$BRIDGE_DIR/$PID_FILE" ]; then
            PID=$(cat "$BRIDGE_DIR/$PID_FILE")
            kill $PID 2>/dev/null
            rm "$BRIDGE_DIR/$PID_FILE"
            echo "Bridge stopped"
        else
            echo "No PID file found, trying to kill by process name..."
            pkill -f "go run main.go"
        fi
        ;;
    status)
        if [ -f "$BRIDGE_DIR/$PID_FILE" ]; then
            PID=$(cat "$BRIDGE_DIR/$PID_FILE")
            if ps -p $PID > /dev/null; then
                echo "Bridge is running with PID: $PID"
            else
                echo "Bridge is not running (stale PID file)"
                rm "$BRIDGE_DIR/$PID_FILE"
            fi
        else
            echo "Bridge is not running"
        fi
        ;;
    logs)
        echo "Showing bridge logs..."
        tail -f "$BRIDGE_DIR/bridge.log"
        ;;
    qr)
        echo "Showing recent QR code from logs..."
        cd "$BRIDGE_DIR"
        tail -50 bridge.log | grep -A 20 "Scan this QR code"
        ;;
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
    *)
        echo "Usage: $0 {start|stop|status|logs|qr|restart}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the WhatsApp bridge"
        echo "  stop    - Stop the WhatsApp bridge"
        echo "  status  - Check if bridge is running"
        echo "  logs    - Show live logs"
        echo "  qr      - Show recent QR code from logs"
        echo "  restart - Restart the bridge"
        exit 1
        ;;
esac 