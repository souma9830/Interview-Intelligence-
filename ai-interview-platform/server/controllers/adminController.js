const dbBackup = require('../utils/dbBackup');

exports.triggerBackup = async (req, res, next) => {
  try {
    const backup = await dbBackup.exportBackup();
    res.status(200).json({
      success: true,
      message: 'Database snapshot backup completed successfully.',
      data: backup
    });
  } catch (error) {
    next(error);
  }
};
