const fs = require('fs');

async function loadRemainingBatches() {
  // Disable trigger for bulk insertion
  console.log('🔧 Preparing for bulk insertion...');
  
  // List all batch files that haven't been fully processed
  const batchFiles = [
    'batch_002_insert.sql',
    'batch_003_insert.sql',
    'batch_004_insert.sql',
    'batch_005_insert.sql',
    'batch_006_insert.sql',
    'batch_007_insert.sql',
    'batch_008_insert.sql',
    'batch_009_insert.sql',
    'batch_010_insert.sql'
  ];
  
  console.log(`📊 Found ${batchFiles.length} batch files to process:`);
  
  for (const file of batchFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').length;
      const insertCount = (content.match(/INSERT INTO/g) || []).length;
      const recordCount = (content.match(/uuid_generate_v4\(\)/g) || []).length;
      
      console.log(`   📄 ${file}: ${lines} lines, ${insertCount} INSERT, ~${recordCount} records`);
    } else {
      console.log(`   ❌ ${file}: NOT FOUND`);
    }
  }
  
  console.log('\n🎯 Ready to process these files via Supabase MCP.');
  console.log('💡 Recommended approach: Process 2-3 files at a time to avoid token limits.');
  
  return batchFiles;
}

if (require.main === module) {
  loadRemainingBatches();
} 