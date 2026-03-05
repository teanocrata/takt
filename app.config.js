const { execSync } = require('child_process');

const appJson = require('./app.json');

let commitHash = 'dev';
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
  // Not a git repo or git not available
}

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      commitHash,
    },
  },
};
