const fs = require('fs');
const path = require('path');

class StorageAdapter {
  async saveUser(user) { throw new Error('Not implemented'); }
  async getUserByEmail(email) { throw new Error('Not implemented'); }
  async saveInterview(interview) { throw new Error('Not implemented'); }
  async getInterview(id) { throw new Error('Not implemented'); }
  async listInterviews(userId) { throw new Error('Not implemented'); }
  async saveReport(report) { throw new Error('Not implemented'); }
  async getReport(interviewId) { throw new Error('Not implemented'); }
  async listReports(userId) { throw new Error('Not implemented'); }
  async saveResume(resume) { throw new Error('Not implemented'); }
  async getResume(userId) { throw new Error('Not implemented'); }
  async saveSchedule(schedule) { throw new Error('Not implemented'); }
  async listSchedules(userId) { throw new Error('Not implemented'); }
}

let activeAdapter = null;

function getStorageAdapter() {
  if (activeAdapter) return activeAdapter;

  const mode = process.env.STORAGE_PROVIDER || process.env.STORAGE_MODE || 'file';
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  console.log(`[Storage Factory] Initializing storage in '${mode}' mode.`);

  if (mode === 'mongodb' && mongoUri) {
    const MongoStorage = require('./mongoStorage');
    activeAdapter = new MongoStorage();
  } else if (mode === 'memory') {
    const MemoryStorage = require('./memoryStorage');
    activeAdapter = new MemoryStorage();
  } else {
    const FileStorage = require('./fileStorage');
    activeAdapter = new FileStorage();
  }

  return activeAdapter;
}

module.exports = { StorageAdapter, getStorageAdapter };
