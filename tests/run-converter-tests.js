#!/usr/bin/env node

/**
 * Test Runner for React Converter Tests
 * Tests the site conversion functionality specifically
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define test paths
const testPaths = [
  'tests/server/react-converter.test.ts',
];

// Define test timeout (in seconds)
const testTimeout = 30;

try {
  console.log('\n🧪 Running React Converter Tests...\n');
  
  // Run tests
  execSync(`npx jest ${testPaths.join(' ')} --verbose --detectOpenHandles --forceExit --testTimeout=${testTimeout * 1000}`, 
    { stdio: 'inherit', timeout: testTimeout * 1000 * 1.5 }); // slightly longer timeout for command than for tests
  
  console.log('\n✅ React Converter Tests completed successfully!\n');
  process.exit(0);
} catch (error) {
  console.error('\n❌ React Converter Tests failed!');
  console.error(`Exit Code: ${error.status}`);
  process.exit(1);
}