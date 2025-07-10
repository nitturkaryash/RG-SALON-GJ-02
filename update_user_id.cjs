const fs = require('fs');

function updateUserIdInFiles() {
  const oldUserId = 'f1ab5143-1129-4557-a694-63a010292c14';
  const newUserId = '3f4b718f-70cb-4873-a62c-b8806a92e25b';
  
  // Get all batch files
  const files = fs.readdirSync('.')
    .filter(f => f.startsWith('batch_') && f.endsWith('.sql'));
  
  console.log(`Updating user_id from ${oldUserId} to ${newUserId} in ${files.length} files...`);
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const updatedContent = content.replace(new RegExp(oldUserId, 'g'), newUserId);
    fs.writeFileSync(file, updatedContent);
    console.log(`Updated ${file}`);
  });
  
  console.log('All files updated successfully!');
}

if (require.main === module) {
  updateUserIdInFiles();
} 