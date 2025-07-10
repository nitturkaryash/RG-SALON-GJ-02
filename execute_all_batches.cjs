const fs = require('fs');

async function executeBatches() {
  const batchFiles = fs.readdirSync('.')
    .filter(f => f.startsWith('batch_') && f.endsWith('_insert.sql'))
    .sort();
  
  console.log(`Found ${batchFiles.length} batch files to execute:`);
  batchFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  
  for (let i = 0; i < batchFiles.length; i++) {
    const file = batchFiles[i];
    console.log(`\n🚀 Executing ${file} (${i + 1}/${batchFiles.length})...`);
    
    try {
      const sqlContent = fs.readFileSync(file, 'utf8');
      
      // Show a preview of what's being executed
      const lines = sqlContent.split('\n');
      const totalLines = lines.length;
      const insertStatements = (sqlContent.match(/INSERT INTO/g) || []).length;
      
      console.log(`   📄 File stats: ${totalLines} lines, ${insertStatements} INSERT statements`);
      console.log(`   ✅ Ready to execute ${file}`);
      
    } catch (error) {
      console.error(`❌ Error with ${file}:`, error.message);
    }
  }
  
  console.log('\n🎉 All batch files processed! Ready for execution via Supabase MCP.');
  console.log('\n📊 Summary:');
  console.log(`   Total batch files: ${batchFiles.length}`);
  console.log(`   Expected total records: ~${batchFiles.length * 50}`);
}

if (require.main === module) {
  executeBatches();
} 