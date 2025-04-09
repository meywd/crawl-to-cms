#!/usr/bin/env node

/**
 * Test Runner
 * Runs all tests and reports the results
 */

import { execSync } from 'child_process';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Badges for output
const badges = {
  info: `${colors.blue}[INFO]${colors.reset}`,
  success: `${colors.green}[SUCCESS]${colors.reset}`,
  error: `${colors.red}[ERROR]${colors.reset}`,
  warning: `${colors.yellow}[WARNING]${colors.reset}`,
  test: `${colors.cyan}[TEST]${colors.reset}`
};

function runTests() {
  console.log(`\n${badges.info} Running tests...\n`);
  
  // Run server tests first
  try {
    console.log(`${badges.test} Running server tests...`);
    execSync('npx jest tests/server', { stdio: 'inherit' });
    console.log(`${badges.success} Server tests passed\n`);
  } catch (error) {
    console.log(`${badges.error} Server tests failed\n`);
    process.exit(1);
  }
  
  // Run client tests
  try {
    console.log(`${badges.test} Running client tests...`);
    execSync('npx jest tests/client', { stdio: 'inherit' });
    console.log(`${badges.success} Client tests passed\n`);
  } catch (error) {
    console.log(`${badges.error} Client tests failed\n`);
    process.exit(1);
  }
  
  console.log(`\n${badges.success} All tests passed!\n`);
  process.exit(0);
}

runTests();