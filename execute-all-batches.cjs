const fs = require('fs');

console.log('🚀 Executing all combined batches for complete migration...');

// Function to execute a batch via MCP (we'll simulate this by showing the content)
function prepareBatchForMCP(batchNumber) {
  const filename = `combined-batch-${String(batchNumber).padStart(2, '0')}.sql`;
  
  if (!fs.existsSync(filename)) {
    console.log(`❌ File not found: ${filename}`);
    return null;
  }
  
  const content = fs.readFileSync(filename, 'utf8');
  const recordCount = (content.match(/\('\w+/g) || []).length;
  
  console.log(`📦 Batch ${batchNumber}: ${recordCount} clients`);
  console.log(`📄 File: ${filename} (${(fs.statSync(filename).size / 1024).toFixed(1)} KB)`);
  
  return {
    batchNumber,
    filename,
    content,
    recordCount
  };
}

// Prepare all batches
console.log('\n📋 Preparing all combined batches:');
const batches = [];
for (let i = 1; i <= 17; i++) {
  const batch = prepareBatchForMCP(i);
  if (batch) {
    batches.push(batch);
  }
}

console.log(`\n✅ Successfully prepared ${batches.length} combined batches`);
console.log(`🎯 Total clients to migrate: ${batches.reduce((sum, b) => sum + b.recordCount, 0)}`);

// Show instructions for MCP execution
console.log('\n🔧 MCP Execution Instructions:');
console.log('Use the following command for each batch:');
console.log('mcp_supabase_apply_migration with:');
console.log('- project_id: mtyudylsozncvilibxda');
console.log('- name: migrate_clients_combined_batch_XX');
console.log('- query: [content from combined-batch-XX.sql]');

// Let's start by showing the first batch for immediate execution
if (batches.length > 0) {
  console.log('\n🎬 Starting with combined-batch-01:');
  console.log('Ready to execute immediately!');
}

console.log('\n💡 TIP: Execute batches sequentially for best results');
console.log('✨ Each batch will add 250 clients to your database'); 