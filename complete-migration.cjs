const fs = require('fs');
const path = require('path');

console.log('🚀 Starting complete client migration process...');

// Read all batch files from batch-02 onwards (since batch-01 is already done)
const migrationDir = 'client-migration-corrected';
const batchFiles = fs.readdirSync(migrationDir)
  .filter(file => file.startsWith('batch-') && file.endsWith('.sql'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/batch-(\d+)/)[1]);
    const numB = parseInt(b.match(/batch-(\d+)/)[1]);
    return numA - numB;
  })
  .slice(1); // Skip batch-01 as it's already migrated

console.log(`📊 Found ${batchFiles.length} remaining batch files to process`);
console.log(`📈 Each batch contains 50 clients (except the last one with 41 clients)`);
console.log(`🎯 Total remaining clients to migrate: ${(batchFiles.length - 1) * 50 + 41} clients`);

// Let's create combined batches of 5 smaller batches each for efficiency
const combinedBatches = [];
for (let i = 0; i < batchFiles.length; i += 5) {
  const batchGroup = batchFiles.slice(i, i + 5);
  combinedBatches.push(batchGroup);
}

console.log(`\n📦 Creating ${combinedBatches.length} combined batch groups:`);

// Generate combined SQL for each group
combinedBatches.forEach((group, index) => {
  let combinedSQL = '';
  let totalRecords = 0;
  
  group.forEach(batchFile => {
    const batchPath = path.join(migrationDir, batchFile);
    const batchContent = fs.readFileSync(batchPath, 'utf8');
    
    // Remove the first line (INSERT statement) from subsequent batches and just keep VALUES
    if (combinedSQL === '') {
      combinedSQL = batchContent;
    } else {
      // Extract just the VALUES part and append with comma
      const valuesMatch = batchContent.match(/VALUES\s+([\s\S]*);/);
      if (valuesMatch) {
        combinedSQL = combinedSQL.replace(/;$/, ',\n  ' + valuesMatch[1] + ';');
      }
    }
    
    // Count records in this batch
    const valueCount = (batchContent.match(/\('\w+/g) || []).length;
    totalRecords += valueCount;
  });
  
  // Write combined batch to file
  const outputFile = `combined-batch-${String(index + 1).padStart(2, '0')}.sql`;
  fs.writeFileSync(outputFile, combinedSQL);
  
  console.log(`   ✅ Group ${index + 1}: ${group.length} batches, ${totalRecords} clients → ${outputFile}`);
});

console.log('\n🎉 Combined batch files created successfully!');
console.log('\n📋 Next steps:');
console.log('1. Execute each combined batch using MCP tools');
console.log('2. Use mcp_supabase_apply_migration for each combined-batch-XX.sql file');
console.log('3. Verify migration after each combined batch');

// Show first combined batch content for immediate execution
const firstCombinedPath = 'combined-batch-01.sql';
if (fs.existsSync(firstCombinedPath)) {
  console.log('\n🔄 Ready to execute first combined batch...');
  console.log('File:', firstCombinedPath);
  console.log('Size:', fs.statSync(firstCombinedPath).size, 'bytes');
} 