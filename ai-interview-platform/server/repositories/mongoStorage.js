const User = require('../models/User');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const Report = require('../models/Report');
const { StorageAdapter } = require('./storageAdapter');

class MongoStorage extends StorageAdapter {
  async saveUser(user) {
    if (user._id) {
      return await User.findByIdAndUpdate(user._id, user, { new: true, upsert: true }).lean();
    }
    const record = new User(user);
    await record.save();
    return record.toObject();
  }

  async getUserByEmail(email) {
    return await User.findOne({ email }).select('+password').lean();
  }

  async saveInterview(interview) {
    if (interview._id && !interview._id.startsWith('stateless_') && interview._id.length === 24) {
      return await Interview.findByIdAndUpdate(interview._id, interview, { new: true, upsert: true }).lean();
    }
    // Remove stateless id prefix to allow mongo generation
    const cleanData = { ...interview };
    if (cleanData._id && cleanData._id.startsWith('stateless_')) {
      delete cleanData._id;
    }
    const record = new Interview(cleanData);
    await record.save();
    return record.toObject();
  }

  async getInterview(id) {
    return await Interview.findById(id).lean();
  }

  async listInterviews(userId) {
    return await Interview.find({ user: userId }).lean();
  }

  async saveReport(report) {
    if (report._id && report._id.length === 24) {
      return await Report.findByIdAndUpdate(report._id, report, { new: true, upsert: true }).lean();
    }
    const cleanData = { ...report };
    if (cleanData._id) delete cleanData._id;
    const record = new Report(cleanData);
    await record.save();
    return record.toObject();
  }

  async getReport(interviewId) {
    return await Report.findOne({ interviewId }).lean();
  }

  async listReports(userId) {
    return await Report.find({ user: userId }).lean();
  }

  async saveResume(resume) {
    return await Resume.findOneAndUpdate({ user: resume.user }, resume, { new: true, upsert: true }).lean();
  }

  async getResume(userId) {
    return await Resume.findOne({ user: userId }).lean();
  }

  async saveSchedule(schedule) {
    const Schedule = require('../models/Schedule');
    if (schedule._id && schedule._id.length === 24) {
      return await Schedule.findByIdAndUpdate(schedule._id, schedule, { new: true, upsert: true }).lean();
    }
    const cleanData = { ...schedule };
    if (cleanData._id) delete cleanData._id;
    const record = new Schedule(cleanData);
    await record.save();
    return record.toObject();
  }

  async listSchedules(userId) {
    const Schedule = require('../models/Schedule');
    return await Schedule.find({ user: userId }).sort({ scheduledAt: 1 }).lean();
  }

  async getSchedule(id) {
    const Schedule = require('../models/Schedule');
    return await Schedule.findById(id).lean();
  }

  async deleteSchedule(id) {
    const Schedule = require('../models/Schedule');
    await Schedule.findByIdAndDelete(id);
    return true;
  }
}

module.exports = MongoStorage;
