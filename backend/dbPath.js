const path = require('path');

function resolveSqlitePath(env = process.env) {
  return env.SQLITE_PATH || path.join(__dirname, 'salon.db');
}

module.exports = { resolveSqlitePath };
