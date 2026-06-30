#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const configCheck = require('../utils/configCheck');

console.log('=========================================');
console.log('   CamSense Env Setup Diagnostics   ');
console.log('=========================================');

const result = configCheck.check();

if (result.valid) {
  console.log('✔ All required environment parameters are configured correctly.');
  process.exit(0);
} else {
  console.error('✖ Critical Configuration Error: Missing environment variables:');
  result.missing.forEach(key => console.error(`  - ${key}`));
  console.error('\nPlease check your .env configuration file before running the application.');
  process.exit(1);
}
