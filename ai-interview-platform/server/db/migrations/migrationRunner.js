const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Migration = require('../../models/Migration');
const logger = require('../../services/logger');

const MIGRATIONS_DIR = path.join(__dirname);

async function getAppliedMigrations() {
  try {
    const migrations = await Migration.find({}).sort({ name: 1 }).lean();
    return new Set(migrations.map(m => m.name));
  } catch {
    return new Set();
  }
}

async function runMigrations() {
  const dbState = mongoose.connection.readyState;
  if (dbState !== 1) {
    logger.info('[Migrations] Database not connected. Skipping migrations.');
    return;
  }

  try {
    const MigrationModel = mongoose.model('Migration');
    const collectionExists = await mongoose.connection.db.listCollections({ name: 'migrations' }).hasNext();
    if (!collectionExists) {
      await MigrationModel.createCollection();
    }
  } catch {
    logger.info('[Migrations] Initializing migrations collection...');
  }

  const applied = await getAppliedMigrations();
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.match(/^\d+_.*\.js$/))
    .sort();

  logger.info(`[Migrations] Found ${files.length} migration files. Applied: ${applied.size}`);

  for (const file of files) {
    const name = file.replace(/\.js$/, '');
    if (applied.has(name)) {
      logger.info(`[Migrations] Skipping already applied: ${name}`);
      continue;
    }

    try {
      const migration = require(path.join(MIGRATIONS_DIR, file));
      logger.info(`[Migrations] Applying: ${name}...`);
      await migration.up();
      await Migration.create({ name, appliedAt: new Date() });
      logger.info(`[Migrations] Applied: ${name}`);
    } catch (err) {
      logger.error(`[Migrations] Failed to apply ${name}`, { error: err.message });
      throw err;
    }
  }

  logger.info('[Migrations] All pending migrations applied.');
}

async function rollbackLastMigration() {
  const last = await Migration.findOne().sort({ appliedAt: -1 });
  if (!last) {
    logger.info('[Migrations] No migrations to rollback.');
    return;
  }

  try {
    const migration = require(path.join(MIGRATIONS_DIR, `${last.name}.js`));
    if (typeof migration.down === 'function') {
      logger.info(`[Migrations] Rolling back: ${last.name}...`);
      await migration.down();
    }
    await Migration.deleteOne({ _id: last._id });
    logger.info(`[Migrations] Rolled back: ${last.name}`);
  } catch (err) {
    logger.error(`[Migrations] Rollback failed for ${last.name}`, { error: err.message });
  }
}

module.exports = { runMigrations, rollbackLastMigration };