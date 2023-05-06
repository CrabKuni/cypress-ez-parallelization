#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { runTests, generateConfigFile } = require('./index');
const args = process.argv.slice(2);

async function main() {
  const command = args[0];

  if (command === 'generate-config') {
    const configPath = args[1] || 'cypress-ez-parallelization.json';
    const specsPath = args[2] || path.join(process.cwd(), 'cypress', 'e2e');
    const threads = parseInt(args[3], 10) || 2;
    const useDuration = args[4] ? args[4] === 'true' : true;

    generateConfigFile(configPath, specsPath, threads, useDuration);
  } else if (command === 'run-tests') {
    const configPath = args[1] || 'cypress-ez-parallelization.json';
    await runTests(configPath);
  } else {
    console.error('Invalid command. Use "generate-config" or "run-tests".');
    process.exit(1);
  }
}

main();
