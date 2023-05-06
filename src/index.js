const { readConfig, writeConfig } = require('./config');
const { distributeSpecs, runCypress } = require('./utils');

async function runTests(configPath) {
  const config = readConfig(configPath);
  const testGroups = distributeSpecs(config.specs, config.threads, config.useDuration);

  // Run tests in parallel and update weights or durations.
  const testResults = await Promise.all(testGroups.map(async (group) => {
    const groupResults = [];

    for (const spec of group) {
      const duration = await runCypress(spec.path);
      groupResults.push({ ...spec, duration });
    }

    return groupResults;
  }));

  // Flatten the test results and update the config.
  const updatedSpecs = testResults.flat();
  config.specs = updatedSpecs;
  writeConfig(configPath, config);
}

module.exports = {
  runTests
};
