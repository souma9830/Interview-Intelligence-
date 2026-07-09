const fs = require('fs');
const path = require('path');
const { StorageAdapter } = require('./storageAdapter');

class FileStorage extends StorageAdapter {
  constructor() {
    super();
    this.dbPath = path.join(__dirname, '../../.db.json');
    this.initDb();
  }

  initDb() {
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify({
        users: [],
        interviews: [],
        reports: [],
        resumes: [],
        schedules: []
      }, null, 2));
    }
  }

  readDb() {
    try {
      this.initDb();
      const content = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading JSON DB:', err.message);
      return { users: [], interviews: [], reports: [], resumes: [], schedules: [] };
    }
  }

  writeDb(data) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Error writing JSON DB:', err.message);
    }
  }

  async saveUser(user) {
    const db = this.readDb();
    const id = user._id || `user_${Date.now()}`;
    const record = { ...user, _id: id };
    
    const idx = db.users.findIndex(u => u._id === id || u.email === user.email);
    if (idx !== -1) db.users[idx] = record;
    else db.users.push(record);

    this.writeDb(db);
    return record;
  }

  async getUserByEmail(email) {
    const db = this.readDb();
    return db.users.find(u => u.email === email) || null;
  }

  async saveInterview(interview) {
    const db = this.readDb();
    const id = interview._id || `interview_${Date.now()}`;
    const record = { ...interview, _id: id, createdAt: interview.createdAt || new Date() };

    const idx = db.interviews.findIndex(i => i._id === id);
    if (idx !== -1) db.interviews[idx] = record;
    else db.interviews.push(record);

    this.writeDb(db);
    return record;
  }

  async getInterview(id) {
    const db = this.readDb();
    return db.interviews.find(i => i._id === id) || null;
  }

  async listInterviews(userId) {
    const db = this.readDb();
    return db.interviews.filter(i => i.user === userId);
  }

  async saveReport(report) {
    const db = this.readDb();
    const id = report._id || `report_${Date.now()}`;
    const record = { ...report, _id: id, createdAt: report.createdAt || new Date() };

    const idx = db.reports.findIndex(r => r._id === id);
    if (idx !== -1) db.reports[idx] = record;
    else db.reports.push(record);

    this.writeDb(db);
    return record;
  }

  async getReport(interviewId) {
    const db = this.readDb();
    return db.reports.find(r => r.interviewId === interviewId || r.interview === interviewId) || null;
  }

  async listReports(userId) {
    const db = this.readDb();
    return db.reports.filter(r => r.user === userId);
  }

  async saveResume(resume) {
    const db = this.readDb();
    const id = resume._id || `resume_${Date.now()}`;
    const record = { ...resume, _id: id };

    const key = resume.user || id;
    const idx = db.resumes.findIndex(r => r.user === key);
    if (idx !== -1) db.resumes[idx] = record;
    else db.resumes.push(record);

    this.writeDb(db);
    return record;
  }

  async getResume(userId) {
    const db = this.readDb();
    return db.resumes.find(r => r.user === userId) || null;
  }

  async saveSchedule(schedule) {
    const db = this.readDb();
    if (!db.schedules) db.schedules = [];
    const id = schedule._id || `schedule_${Date.now()}`;
    const record = { ...schedule, _id: id, createdAt: schedule.createdAt || new Date() };

    const idx = db.schedules.findIndex(s => s._id === id);
    if (idx !== -1) db.schedules[idx] = record;
    else db.schedules.push(record);

    this.writeDb(db);
    return record;
  }

  async listSchedules(userId) {
    const db = this.readDb();
    return (db.schedules || [])
      .filter(s => s.user === userId)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  }

  async deleteSchedule(id) {
    const db = this.readDb();
    db.schedules = (db.schedules || []).filter(s => s._id !== id);
    this.writeDb(db);
    return true;
  }

  async getSchedule(id) {
    const db = this.readDb();
    return (db.schedules || []).find(s => s._id === id) || null;
  }
}

module.exports = FileStorage;
