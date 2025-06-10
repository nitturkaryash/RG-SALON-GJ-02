const fs = require('fs');
const path = require('path');

console.log('Verifying modules...');

// Check if @jridgewell/trace-mapping exists
const traceMappingPath = path.join(process.cwd(), 'node_modules/@jridgewell/trace-mapping');
if (fs.existsSync(traceMappingPath)) {
  console.log('@jridgewell/trace-mapping found at:', traceMappingPath);
  
  // List files in the directory
  const files = fs.readdirSync(traceMappingPath);
  console.log('Files in directory:', files);
  
  // Check if there's a package.json
  const packageJsonPath = path.join(traceMappingPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath);
    console.log('package.json:', JSON.stringify(packageJson, null, 2));
  } else {
    console.log('No package.json found');
  }
  
  // Check if there's a dist directory
  const distPath = path.join(traceMappingPath, 'dist');
  if (fs.existsSync(distPath)) {
    const distFiles = fs.readdirSync(distPath);
    console.log('Files in dist directory:', distFiles);
  } else {
    console.log('No dist directory found');
  }
} else {
  console.log('@jridgewell/trace-mapping not found');
}

// Check if @babel/generator exists
const babelGeneratorPath = path.join(process.cwd(), 'node_modules/@babel/generator');
if (fs.existsSync(babelGeneratorPath)) {
  console.log('@babel/generator found at:', babelGeneratorPath);
  
  // List files in the directory
  const files = fs.readdirSync(babelGeneratorPath);
  console.log('Files in directory:', files);
  
  // Check if there's a package.json
  const packageJsonPath = path.join(babelGeneratorPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath);
    console.log('package.json:', JSON.stringify(packageJson, null, 2));
  } else {
    console.log('No package.json found');
  }
} else {
  console.log('@babel/generator not found');
}

console.log('Module verification completed'); 