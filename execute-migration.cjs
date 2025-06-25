const fs = require('fs');
const path = require('path');

console.log('Starting client migration execution...');

// Read all batch files from the corrected migration directory
const migrationDir = 'client-migration-corrected';
const batchFiles = fs.readdirSync(migrationDir)
  .filter(file => file.startsWith('batch-') && file.endsWith('.sql'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/batch-(\d+)/)[1]);
    const numB = parseInt(b.match(/batch-(\d+)/)[1]);
    return numA - numB;
  });

console.log(`Found ${batchFiles.length} batch files to process`);

// Display which batches we'll process
batchFiles.forEach((file, index) => {
  const batchNumber = file.match(/batch-(\d+)/)[1];
  const startRecord = (parseInt(batchNumber) - 1) * 50 + 1;
  const endRecord = Math.min(parseInt(batchNumber) * 50, 4191);
  console.log(`${index + 1}. ${file} - Records ${startRecord} to ${endRecord}`);
});

console.log('\nTo execute each batch via MCP tools, run:');
console.log('node -e "');
console.log('const fs = require(\'fs\');');
console.log('const sqlContent = fs.readFileSync(\'client-migration-corrected/batch-01.sql\', \'utf8\');');
console.log('console.log(sqlContent);');
console.log('"');
console.log('\nThen copy the output and use mcp_supabase_apply_migration');

// Show first batch as example
const firstBatchPath = path.join(migrationDir, 'batch-01.sql');
if (fs.existsSync(firstBatchPath)) {
  const firstBatchContent = fs.readFileSync(firstBatchPath, 'utf8');
  console.log('\n=== FIRST BATCH CONTENT (for copy-paste) ===');
  console.log(firstBatchContent);
} 