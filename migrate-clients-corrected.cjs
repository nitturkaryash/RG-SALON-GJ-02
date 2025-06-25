const xlsx = require('xlsx');
const { v4: uuidv4 } = require('uuid');

// Function to read and parse the Excel file
function readClientsFromExcel(filePath) {
  try {
    console.log('Reading Excel file:', filePath);
    const workbook = xlsx.readFile(filePath);
    
    if (!workbook.SheetNames.includes('SURAT')) {
      throw new Error('Sheet "SURAT" not found in Excel file');
    }
    
    const worksheet = workbook.Sheets['SURAT'];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Skip header row
    const dataRows = jsonData.slice(1);
    
    console.log(`Found ${dataRows.length} client records in Excel file`);
    
    // Map Excel data to actual database structure
    const clients = dataRows
      .filter(row => row[0] && row[1]) // Filter out empty rows (must have name and mobile)
      .map(row => ({
        id: uuidv4(),
        full_name: (row[0] || '').toString().trim(),
        mobile_number: (row[1] || '').toString().trim(),
        phone: (row[1] || '').toString().trim(), // Use mobile as phone too
        gender: (row[3] || '').toString().toLowerCase().trim() || null,
        email: null,
        birth_date: null,
        anniversary_date: null,
        last_visit: null,
        notes: 'Migrated from Excel on ' + new Date().toISOString().split('T')[0],
        total_spent: 0,
        pending_payment: 0,
        appointment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    
    // Validate data
    const validClients = clients.filter(client => {
      if (!client.full_name || !client.mobile_number) {
        console.warn(`Skipping invalid client: ${JSON.stringify(client)}`);
        return false;
      }
      return true;
    });
    
    console.log(`${validClients.length} valid clients ready for migration`);
    return validClients;
    
  } catch (error) {
    console.error('Error reading Excel file:', error.message);
    throw error;
  }
}

// Function to create SQL INSERT statement for batch insert using actual schema
function createBatchInsertSQL(clients, batchSize = 100) {
  const batches = [];
  
  for (let i = 0; i < clients.length; i += batchSize) {
    const batch = clients.slice(i, i + batchSize);
    
    const values = batch.map(client => 
      `('${client.id}', '${client.full_name.replace(/'/g, "''")}', '${client.mobile_number}', '${client.phone}', ${client.gender ? `'${client.gender}'` : 'NULL'}, ${client.email ? `'${client.email}'` : 'NULL'}, ${client.birth_date ? `'${client.birth_date}'` : 'NULL'}, ${client.anniversary_date ? `'${client.anniversary_date}'` : 'NULL'}, ${client.last_visit ? `'${client.last_visit}'` : 'NULL'}, ${client.notes ? `'${client.notes.replace(/'/g, "''")}'` : 'NULL'}, ${client.total_spent}, ${client.pending_payment}, ${client.appointment_count}, '${client.created_at}', '${client.updated_at}')`
    ).join(',\n  ');
    
    const sql = `
INSERT INTO clients (
  id, full_name, mobile_number, phone, gender, email, birth_date, anniversary_date,
  last_visit, notes, total_spent, pending_payment, appointment_count,
  created_at, updated_at
) VALUES
  ${values};`;
    
    batches.push({
      sql,
      count: batch.length,
      batchNumber: Math.floor(i / batchSize) + 1
    });
  }
  
  return batches;
}

// Main migration function
async function migrateClients() {
  try {
    console.log('=== CORRECTED CLIENT MIGRATION SCRIPT ===\n');
    
    // Read clients from Excel
    const clients = readClientsFromExcel('Clients Migration (1).xlsx');
    
    if (clients.length === 0) {
      console.log('No clients to migrate.');
      return;
    }
    
    // Create batch insert statements
    const batches = createBatchInsertSQL(clients, 50); // Smaller batches for better error handling
    
    console.log(`\nCreated ${batches.length} batches for migration`);
    console.log('Each batch contains up to 50 clients\n');
    
    // Display migration summary
    console.log('=== MIGRATION SUMMARY ===');
    console.log(`Total clients to migrate: ${clients.length}`);
    console.log(`Total batches: ${batches.length}`);
    console.log(`Batch size: 50 clients per batch`);
    
    // Show sample data
    console.log('\n=== SAMPLE CLIENTS ===');
    clients.slice(0, 3).forEach((client, index) => {
      console.log(`Client ${index + 1}:`);
      console.log(`  Name: ${client.full_name}`);
      console.log(`  Mobile: ${client.mobile_number}`);
      console.log(`  Gender: ${client.gender || 'Not specified'}`);
      console.log('');
    });
    
    // Export SQL files for manual execution
    console.log('=== EXPORTING CORRECTED SQL FILES ===');
    const fs = require('fs');
    
    // Create directory for migration files
    if (!fs.existsSync('client-migration-corrected')) {
      fs.mkdirSync('client-migration-corrected');
    }
    
    // Export each batch to separate files
    batches.forEach(batch => {
      const filename = `client-migration-corrected/batch-${batch.batchNumber.toString().padStart(2, '0')}.sql`;
      fs.writeFileSync(filename, batch.sql);
      console.log(`Created: ${filename} (${batch.count} clients)`);
    });
    
    // Create master migration file
    const masterSQL = batches.map(batch => batch.sql).join('\n\n');
    fs.writeFileSync('client-migration-corrected/all-clients-migration.sql', masterSQL);
    console.log('Created: client-migration-corrected/all-clients-migration.sql (all clients)');
    
    console.log('\n=== CORRECTED MIGRATION FILES READY ===');
    console.log('SQL files have been generated in the "client-migration-corrected" directory');
    console.log('These files use the correct database schema and can now be executed with MCP tools.');
    
    return {
      clients,
      batches,
      totalClients: clients.length,
      totalBatches: batches.length
    };
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  migrateClients()
    .then(result => {
      console.log('\n✅ Corrected migration preparation completed successfully!');
      console.log(`📊 ${result.totalClients} clients ready for migration in ${result.totalBatches} batches`);
    })
    .catch(error => {
      console.error('\n❌ Migration preparation failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  readClientsFromExcel,
  createBatchInsertSQL,
  migrateClients
}; 