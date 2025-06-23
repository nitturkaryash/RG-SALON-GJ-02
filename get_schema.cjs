const { Client } = require('pg');

async function main() {
  try {
    const connectionString = "postgresql://postgres:AyEztv3AQ5yfHU2J@db.mtyudylsozncvilibxda.supabase.co:5432/postgres";
    const client = new Client({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    await client.connect();
    console.log('Connected to the database.');

    const query = `
      SELECT n.nspname as "Schema",
        p.proname as "Name",
        pg_get_function_result(p.oid) as "Result data type",
        pg_get_function_arguments(p.oid) as "Argument data types",
       CASE
        WHEN p.prokind = 'f' THEN 'function'
        WHEN p.prokind = 'p' THEN 'procedure'
        WHEN p.prokind = 'a' THEN 'aggregate'
        WHEN p.prokind = 'w' THEN 'window'
       END as "Type"
      FROM pg_proc p
      LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY 1, 2;

      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const res = await client.query(query);
    console.log(res.rows);

    await client.end();
    console.log('Database connection closed.');

  } catch (error) {
    console.error('Failed to get schema:', error);
    process.exit(1);
  }
}

main(); 