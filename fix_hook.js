const fs = require('fs');
const filePath = './src/pages/POS.tsx';
let content = fs.readFileSync(filePath, 'utf8');
// Find and extract the hook definition at the bottom of the file
