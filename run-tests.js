#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Available test commands
const commands = {
  'test': 'jest',
  'test:watch': 'jest --watch',
  'test:coverage': 'jest --coverage',
  'test:server': 'jest --testPathPattern=tests/server',
  'test:client': 'jest --testPathPattern=tests/client',
  'test:e2e': 'jest --testPathPattern=tests/e2e'
};

// Run the specified command or default to 'test'
const command = process.argv[2] || 'test';

if (!commands[command]) {
  console.log(`Unknown command: ${command}`);
  console.log('Available commands:');
  Object.keys(commands).forEach(cmd => console.log(`  ${cmd}`));
  process.exit(1);
}

try {
  console.log(`Running: ${commands[command]}`);
  execSync(commands[command], { stdio: 'inherit' });
} catch (error) {
  console.error(`Test command failed: ${error.message}`);
  process.exit(1);
}