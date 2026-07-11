const fs = require('fs');
const path = require('path');
const { rotateBackups } = require('../services/backupRotation');

const BACKUPS_DIR = path.join(__dirname, '../backups');

describe('Backup Rotation Service', () => {
  beforeEach(() => {
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
  });

  it('should rotate backups and keep only the specified number of files', () => {
    // Create 7 dummy backup files
    const now = Date.now();
    for (let i = 0; i < 7; i++) {
      const filePath = path.join(BACKUPS_DIR, `temp_backup_${i}.json`);
      fs.writeFileSync(filePath, JSON.stringify({ index: i }));
      // Adjust modification time so they are distinct
      const mtime = new Date(now - (7 - i) * 60000);
      fs.utimesSync(filePath, mtime, mtime);
    }

    const result = rotateBackups(5);
    expect(result.success).toBe(true);
    expect(result.deletedCount).toBe(2);

    // Verify only 5 files remain
    const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.startsWith('temp_backup_'));
    expect(files.length).toBe(5);

    // Cleanup remaining files
    files.forEach(f => fs.unlinkSync(path.join(BACKUPS_DIR, f)));
  });
});
