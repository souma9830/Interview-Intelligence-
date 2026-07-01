const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const backupDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

function performBackup() {
  const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interview';
  const backupPath = path.join(backupDir, `backup_${Date.now()}`);
  exec(`mongodump --uri="${dbUri}" --out="${backupPath}"`, (err, stdout, stderr) => {
    if (err) console.error("Backup failed", err);
    else console.log("Backup complete", backupPath);
  });
}

const exportBackup = async () => {
  const collections = mongoose.connection.collections;
  const backupData = {};

  for (const key of Object.keys(collections)) {
    const documents = await collections[key].find({}).toArray();
    backupData[key] = documents;
  }

  return {
    timestamp: new Date().toISOString(),
    database: mongoose.connection.name,
    data: backupData
  };
};

performBackup.exportBackup = exportBackup;
performBackup.performBackup = performBackup;

module.exports = performBackup;

