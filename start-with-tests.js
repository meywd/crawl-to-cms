#!/usr/bin/env node

/**
 * Start application with tests
 * This script runs tests first and then starts the application if they pass
 */

import { execSync, spawn } from 'child_process';

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
  test: `${colors.cyan}[TEST]${colors.reset}`,
  app: `${colors.magenta}[APP]${colors.reset}`
};

function runTests() {
  console.log(`\n${badges.info} Running tests before starting the application...\n`);
  
  try {
    execSync('node test-runner.js', { stdio: 'inherit' });
    console.log(`\n${badges.success} All tests passed. Starting application...\n`);
    return true;
  } catch (error) {
    console.log(`\n${badges.error} Tests failed. Application will not start.\n`);
    return false;
  }
}

function startApp() {
  console.log(`${badges.app} Starting application...\n`);
  
  const child = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
  
  child.on('close', (code) => {
    if (code !== 0) {
      console.log(`\n${badges.error} Application exited with code ${code}\n`);
      process.exit(code);
    }
  });
  
  // Handle termination signals
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      child.kill(signal);
      process.exit(0);
    });
  });
}

function main() {
  if (process.env.SKIP_TESTS === 'true') {
    console.log(`${badges.warning} Skipping tests due to SKIP_TESTS=true\n`);
    startApp();
  } else {
    const testsPass = runTests();
    if (testsPass) {
      startApp();
    } else {
      process.exit(1);
    }
  }
}

main();