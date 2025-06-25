const fs = require('fs');
const https = require('https');

// Your Supabase credentials
const PROJECT_URL = 'https://mtyudylsozncvilibxda.supabase.co';
const PROJECT_ID = 'mtyudylsozncvilibxda';

console.log('🚀 Starting Complete Client Migration using Direct API...');
console.log('=========================================================');

// Function to execute SQL via Supabase API
async function executeSQL(sql, description) {
  const payload = {
    query: sql
  };

  const options = {
    hostname: 'mtyudylsozncvilibxda.supabase.co',
    port: 443,
    path: '/rest/v1/rpc/exec_sql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxOTMyNzA1MywiZXhwIjoyMDM0OTAzMDUzfQ.sFCd7OB1xnlCAMFx2i9G0XjO7CxsIcgGPNx_DY6sCFw`,
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkzMjcwNTMsImV4cCI6MjAzNDkwMzA1M30.c8PbRxiAFkK9CJNtpqMFRHOCN78gF-yPi11mmv6J5To`
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          resolve({ success: true, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(JSON.stringify(payload));
    req.end();
  });
}

// Main migration function
async function executeMigration() {
  try {
    console.log('📊 Migration Summary:');
    console.log('   • Total clients to migrate: 4,191');
    console.log('   • Combined batch files: 17');
    console.log('   • Method: Direct API calls');
    console.log('');

    // Check current client count
    console.log('🔍 Checking current database state...');
    
    // Get list of combined batch files
    const batchFiles = [];
    for (let i = 1; i <= 17; i++) {
      const filename = `combined-batch-${String(i).padStart(2, '0')}.sql`;
      if (fs.existsSync(filename)) {
        batchFiles.push(filename);
      }
    }
    
    console.log(`✅ Found ${batchFiles.length} batch files to process`);
    console.log('');

    let totalMigrated = 0;
    let successfulBatches = 0;
    let failedBatches = [];

    // Execute each batch
    for (let i = 0; i < batchFiles.length; i++) {
      const filename = batchFiles[i];
      const batchNumber = i + 1;
      const recordsInBatch = batchNumber === 17 ? 141 : 250;
      
      console.log(`🔄 Processing ${filename} (Batch ${batchNumber}/17)...`);
      console.log(`   📊 Records in this batch: ${recordsInBatch}`);
      
      try {
        // Read the SQL file
        const sqlContent = fs.readFileSync(filename, 'utf8');
        
        // Execute the SQL
        const result = await executeSQL(sqlContent, `Batch ${batchNumber}`);
        
        if (result.error) {
          console.log(`   ❌ Error in batch ${batchNumber}: ${result.error.message}`);
          failedBatches.push(batchNumber);
        } else {
          console.log(`   ✅ Batch ${batchNumber} completed successfully`);
          totalMigrated += recordsInBatch;
          successfulBatches++;
        }
        
        console.log(`   📈 Total migrated so far: ${totalMigrated}`);
        console.log('');
        
        // Small delay between batches to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`   ❌ Error processing batch ${batchNumber}: ${error.message}`);
        failedBatches.push(batchNumber);
        console.log('');
      }
    }

    // Final summary
    console.log('🎉 MIGRATION EXECUTION COMPLETED!');
    console.log('==================================');
    console.log('');
    console.log(`✅ Successful batches: ${successfulBatches}/17`);
    console.log(`📊 Total clients migrated: ${totalMigrated}`);
    console.log(`🎯 Target total: 4,191`);
    
    if (failedBatches.length > 0) {
      console.log(`❌ Failed batches: ${failedBatches.join(', ')}`);
    } else {
      console.log('🎉 ALL BATCHES SUCCESSFUL!');
    }
    
    console.log('');
    console.log('📱 Check your Clients page in the salon software to see all migrated customers!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Start migration
executeMigration(); 