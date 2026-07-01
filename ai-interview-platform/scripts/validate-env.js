const fs = require('fs');
const path = require('path');
const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error("Missing .env file! Create one based on .env.example");
  process.exit(1);
}
const envContent = fs.readFileSync(envPath, 'utf8');
let missing = [];
requiredEnv.forEach(key => {
  if (!envContent.includes(key)) missing.push(key);
});
if (missing.length > 0) {
  console.error("Missing keys in .env:", missing.join(', '));
  process.exit(1);
}
console.log("Environment validation passed!");
