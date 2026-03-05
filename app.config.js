const { execSync } = require('child_process');

const appJson = require('./app.json');

let commitHash = 'dev';
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
  // Not a git repo or git not available
}

const baseUrl = process.env.EXPO_BASE_URL || '';

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    experiments: {
      ...appJson.expo?.experiments,
      ...(baseUrl ? { baseUrl } : {}),
    },
    extra: {
      commitHash,
    },
  },
};
