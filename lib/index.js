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

function generateConfigFile(configPath, specsPath, threads, useDuration) {
  const files = fs.readdirSync(specsPath);
  const specs = files
    .filter((file) => file.endsWith('.spec.js'))
    .map((file) => ({
      path: path.join(specsPath, file),
      name: file,
      weight: 0,
      duration: 0,
    }));

  const config = {
    threads: threads,
    useDuration: useDuration,
    specs: specs,
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

module.exports = {
  runTests,
  generateConfigFile,
};