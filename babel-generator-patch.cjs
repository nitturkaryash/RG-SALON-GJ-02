const fs = require('fs');
const path = require('path');

console.log('Patching @babel/generator...');

const generatorPath = path.join(process.cwd(), 'node_modules/@babel/generator');
if (!fs.existsSync(generatorPath)) {
  console.log('@babel/generator not found, skipping patch');
  process.exit(0);
}

// Patch the source-map.js file
const sourceMapPath = path.join(generatorPath, 'lib/source-map.js');
if (fs.existsSync(sourceMapPath)) {
  console.log('Patching source-map.js...');
  try {
    let content = fs.readFileSync(sourceMapPath, 'utf8');
    
    // Replace the require for trace-mapping with a mock implementation
    content = content.replace(
      /require\(['"]@jridgewell\/trace-mapping['"]\)/g,
      `{
        originalPositionFor: function() { return null; },
        generatedPositionFor: function() { return null; },
        presortedOriginalPositionFor: function() { return null; },
        TraceMap: function() {
          return {
            originalPositionFor: function() { return null; },
            generatedPositionFor: function() { return null; },
            presortedOriginalPositionFor: function() { return null; }
          };
        }
      }`
    );
    
    fs.writeFileSync(sourceMapPath, content);
    console.log('Successfully patched source-map.js');
  } catch (error) {
    console.error('Error patching source-map.js:', error);
  }
} else {
  console.log('source-map.js not found, skipping patch');
}

// Patch any other files that might require trace-mapping
const libFiles = fs.readdirSync(path.join(generatorPath, 'lib'));
for (const file of libFiles) {
  if (file === 'source-map.js') continue; // Already patched
  
  const filePath = path.join(generatorPath, 'lib', file);
  if (fs.statSync(filePath).isFile() && file.endsWith('.js')) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('@jridgewell/trace-mapping')) {
        console.log(`Patching ${file}...`);
        const patchedContent = content.replace(
          /require\(['"]@jridgewell\/trace-mapping['"]\)/g,
          `{
            originalPositionFor: function() { return null; },
            generatedPositionFor: function() { return null; },
            presortedOriginalPositionFor: function() { return null; },
            TraceMap: function() {
              return {
                originalPositionFor: function() { return null; },
                generatedPositionFor: function() { return null; },
                presortedOriginalPositionFor: function() { return null; }
              };
            }
          }`
        );
        fs.writeFileSync(filePath, patchedContent);
        console.log(`Successfully patched ${file}`);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
}

console.log('Patching completed'); 