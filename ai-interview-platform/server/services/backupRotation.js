const fs = require('fs');
const path = require('path');

const BACKUPS_DIR = path.join(__dirname, '../backups');

exports.rotateBackups = (maxBackups = 5) => {
  if (!fs.existsSync(BACKUPS_DIR)) {
    return { success: true, message: 'Backups directory does not exist' };
  }

  try {
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(BACKUPS_DIR, file);
        return {
          name: file,
          path: filePath,
          time: fs.statSync(filePath).mtime.getTime()
        };
      })
      .sort((a, b) => b.time - a.time); // newest first

    if (files.length <= maxBackups) {
      return { success: true, message: 'No backup rotation required' };
    }

    const filesToDelete = files.slice(maxBackups);
    filesToDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`[Backup Rotation] Deleted old backup file: ${file.name}`);
    });

    return {
      success: true,
      message: `Rotated backups. Deleted ${filesToDelete.length} files.`,
      deletedCount: filesToDelete.length
    };
  } catch (error) {
    console.error('[Backup Rotation] Error during rotation:', error.message);
    throw error;
  }
};
