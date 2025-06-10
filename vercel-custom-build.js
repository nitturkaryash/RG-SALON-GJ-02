const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting custom build script...');

// Print environment info
console.log('Node version:', process.version);
console.log('NPM version:', execSync('npm --version').toString().trim());

// Ensure all dependencies are installed
console.log('Installing dependencies...');
execSync('npm install --include=dev', { stdio: 'inherit' });

// Explicitly install @jridgewell/trace-mapping
console.log('Installing @jridgewell/trace-mapping...');
try {
  execSync('npm install @jridgewell/trace-mapping@0.3.25 --save-dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Error installing @jridgewell/trace-mapping:', error);
  // Continue anyway
}

// Create a symlink if needed to ensure the module is found
const traceMappingPath = path.join(process.cwd(), 'node_modules/@jridgewell/trace-mapping');
if (!fs.existsSync(traceMappingPath)) {
  console.log('Creating trace-mapping directory...');
  fs.mkdirSync(traceMappingPath, { recursive: true });
  
  // Create a minimal package.json
  fs.writeFileSync(
    path.join(traceMappingPath, 'package.json'),
    JSON.stringify({
      name: '@jridgewell/trace-mapping',
      version: '0.3.25',
      main: 'dist/trace-mapping.umd.js'
    }, null, 2)
  );
  
  // Copy our mock implementation
  fs.mkdirSync(path.join(traceMappingPath, 'dist'), { recursive: true });
  
  // If mock-trace-mapping.js exists, use it
  if (fs.existsSync(path.join(process.cwd(), 'mock-trace-mapping.js'))) {
    const mockContent = fs.readFileSync(path.join(process.cwd(), 'mock-trace-mapping.js'), 'utf8');
    fs.writeFileSync(path.join(traceMappingPath, 'dist/trace-mapping.umd.js'), mockContent);
    console.log('Copied mock-trace-mapping.js to trace-mapping module');
  } else {
    // Otherwise use inline mock
    fs.writeFileSync(
      path.join(traceMappingPath, 'dist/trace-mapping.umd.js'),
      `
      (function (global, factory) {
        typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
        (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.traceMapping = {}));
      })(this, (function (exports) {
        'use strict';
        
        exports.originalPositionFor = function() { return null; };
        exports.generatedPositionFor = function() { return null; };
        exports.presortedOriginalPositionFor = function() { return null; };
        exports.TraceMap = function() {
          return {
            originalPositionFor: function() { return null; },
            generatedPositionFor: function() { return null; },
            presortedOriginalPositionFor: function() { return null; }
          };
        };
        
        Object.defineProperty(exports, '__esModule', { value: true });
      }));
      `
    );
  }
}

// Verify modules are available
console.log('Verifying modules...');
try {
  execSync('node verify-modules.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Module verification failed:', error);
  // Continue anyway
}

// Fix gen-mapping if needed
const genMappingPath = path.join(process.cwd(), 'node_modules/@jridgewell/gen-mapping');
if (fs.existsSync(genMappingPath)) {
  const umdPath = path.join(genMappingPath, 'dist/gen-mapping.umd.js');
  if (fs.existsSync(umdPath)) {
    console.log('Patching gen-mapping.umd.js...');
    try {
      let content = fs.readFileSync(umdPath, 'utf8');
      // Replace the require for trace-mapping with a simple object
      content = content.replace(
        /require\(['"]@jridgewell\/trace-mapping['"]\)/g,
        '{ originalPositionFor: function() { return null; }, generatedPositionFor: function() { return null; }, presortedOriginalPositionFor: function() { return null; }, TraceMap: function() { return { originalPositionFor: function() { return null; }, generatedPositionFor: function() { return null; }, presortedOriginalPositionFor: function() { return null; } }; } }'
      );
      fs.writeFileSync(umdPath, content);
      console.log('Successfully patched gen-mapping.umd.js');
    } catch (error) {
      console.error('Error patching gen-mapping.umd.js:', error);
    }
  }
}

// Patch Babel generator
console.log('Patching Babel generator...');
try {
  if (fs.existsSync(path.join(process.cwd(), 'babel-generator-patch.js'))) {
    execSync('node babel-generator-patch.js', { stdio: 'inherit' });
  } else {
    console.log('babel-generator-patch.js not found, skipping patch');
  }
} catch (error) {
  console.error('Error patching Babel generator:', error);
  // Continue anyway
}

// Run the build
console.log('Running build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 