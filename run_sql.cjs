const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const sqlFilePath = path.join(process.cwd(), 'complete_database_setup.sql');

async function main() {
  try {
    // 1. Use the new database configuration
    const connectionString = "postgresql://postgres:AyEztv3AQ5yfHU2J@db.mtyudylsozncvilibxda.supabase.co:5432/postgres";

    // 2. Read the SQL script
    const sql = await fs.readFile(sqlFilePath, 'utf-8');

    // 3. Connect to the database
    const client = new Client({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    await client.connect();
    console.log('Connected to the database.');

    // 4. Execute the SQL script
    console.log('Executing database setup script...');
    await client.query(sql);
    console.log('Database setup script executed successfully.');

    // 5. Close the connection
    await client.end();
    console.log('Database connection closed.');

  } catch (error) {
    console.error('Failed to run SQL script:', error);
    process.exit(1);
  }
}

main(); 