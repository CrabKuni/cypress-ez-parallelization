const fs = require('fs');

function readConfig(configPath) {
  const rawData = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(rawData);
}

function writeConfig(configPath, config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

module.exports = {
  readConfig,
  writeConfig
};