#!/usr/bin/env node

/**
 * Continuous Integration Test Runner
 * This script runs tests and ensures they pass before allowing commits/deploys
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

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

console.log(`\n${badges.info} Starting CI Test Runner...\n`);

// Track failures
let hasFailures = false;

// Run typescript checking
try {
  console.log(`${badges.test} Running TypeScript type checking...`);
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log(`${badges.success} TypeScript type checking passed\n`);
} catch (error) {
  console.log(`${badges.error} TypeScript type checking failed\n`);
  hasFailures = true;
}

// Run Jest tests
try {
  console.log(`${badges.test} Running Jest tests...`);
  execSync('node test-runner.js', { stdio: 'inherit' });
  console.log(`${badges.success} All tests passed\n`);
} catch (error) {
  console.log(`${badges.error} Tests failed\n`);
  hasFailures = true;
}

// Check test coverage if tests passed
if (!hasFailures) {
  try {
    console.log(`${badges.test} Checking test coverage...`);
    execSync('npx jest --coverage', { stdio: 'inherit' });
    console.log(`${badges.success} Coverage report generated\n`);
  } catch (error) {
    console.log(`${badges.warning} Failed to generate coverage report\n`);
  }
}

// Final report
if (hasFailures) {
  console.log(`\n${badges.error} CI checks failed. Please fix the issues before deploying.\n`);
  process.exit(1);
} else {
  console.log(`\n${badges.success} All CI checks passed! The application is ready for deployment.\n`);
  process.exit(0);
}