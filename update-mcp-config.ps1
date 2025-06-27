# Update MCP Configuration Script
Write-Host "🔧 Updating MCP Configuration..." -ForegroundColor Yellow

# Backup current config
$backupPath = "$env:USERPROFILE\.cursor\mcp.json.backup"
if (Test-Path "$env:USERPROFILE\.cursor\mcp.json") {
    Copy-Item "$env:USERPROFILE\.cursor\mcp.json" $backupPath -Force
    Write-Host "✅ Backed up current config to: $backupPath" -ForegroundColor Green
}

# Copy fixed config
$sourcePath = "mcp-config-fixed.json"
$targetPath = "$env:USERPROFILE\.cursor\mcp.json"

if (Test-Path $sourcePath) {
    Copy-Item $sourcePath $targetPath -Force
    Write-Host "✅ Updated MCP configuration successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 IMPORTANT: Please restart Cursor for changes to take effect" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Available MCP Servers:" -ForegroundColor White
    Write-Host "  • supabase-postgres - SQL queries to your salon database" -ForegroundColor Gray
    Write-Host "  • filesystem - File operations in your project" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🧪 After restarting Cursor, test with:" -ForegroundColor White
    Write-Host "  'Show me all tables in my salon database'" -ForegroundColor Gray
    Write-Host "  'List files in my src/components directory'" -ForegroundColor Gray
} else {
    Write-Host "❌ Could not find $sourcePath" -ForegroundColor Red
    Write-Host "Please run this script from the project directory" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to continue..." 