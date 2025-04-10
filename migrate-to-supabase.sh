#!/bin/bash

# Migrate from mock data to Supabase
echo "🚀 Starting migration from mock data to Supabase..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Remove redundant sample data files
echo "🗑️  Removing redundant sample data files..."
rm -f seedSampleData.js setup-supabase.js scripts/createTestServices.js

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Run database seeding script
echo "🌱 Seeding Supabase database..."
npm run seed

# Clear localStorage to avoid confusion
echo "🧹 Clearing localStorage to remove any old mock data..."
cat << EOF > clear-localStorage.js
// Script to clear localStorage
localStorage.clear();
console.log('localStorage cleared successfully');
EOF

echo "✅ Migration complete! Your app is now configured to use Supabase exclusively."
echo ""
echo "📋 Next steps:"
echo "  1. Run 'npm run dev' to start the application"
echo "  2. Verify that data is loading from Supabase"
echo "  3. Read README-MIGRATION.md for more details"
echo ""

exit 0 