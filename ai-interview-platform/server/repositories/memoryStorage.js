const { StorageAdapter } = require('./storageAdapter');

class MemoryStorage extends StorageAdapter {
  constructor() {
    super();
    this.users = new Map();
    this.interviews = new Map();
    this.reports = new Map();
    this.resumes = new Map();
  }

  async saveUser(user) {
    const id = user._id || `user_${Date.now()}`;
    const record = { ...user, _id: id };
    this.users.set(id, record);
    return record;
  }

  async getUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async saveInterview(interview) {
    const id = interview._id || `interview_${Date.now()}`;
    const record = { ...interview, _id: id, createdAt: interview.createdAt || new Date() };
    this.interviews.set(id, record);
    return record;
  }

  async getInterview(id) {
    return this.interviews.get(id) || null;
  }

  async listInterviews(userId) {
    const list = [];
    for (const int of this.interviews.values()) {
      if (int.user === userId) list.push(int);
    }
    return list;
  }

  async saveReport(report) {
    const id = report._id || `report_${Date.now()}`;
    const record = { ...report, _id: id, createdAt: report.createdAt || new Date() };
    this.reports.set(id, record);
    return record;
  }

  async getReport(interviewId) {
    for (const report of this.reports.values()) {
      if (report.interviewId === interviewId || report.interview === interviewId) return report;
    }
    return null;
  }

  async listReports(userId) {
    const list = [];
    for (const rep of this.reports.values()) {
      if (rep.user === userId) list.push(rep);
    }
    return list;
  }

  async saveResume(resume) {
    const id = resume._id || `resume_${Date.now()}`;
    const record = { ...resume, _id: id };
    this.resumes.set(resume.user || id, record);
    return record;
  }

  async getResume(userId) {
    return this.resumes.get(userId) || null;
  }
}

module.exports = MemoryStorage;
