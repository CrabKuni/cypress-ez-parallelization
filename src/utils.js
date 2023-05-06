const { spawn } = require('child_process');
const fs = require('fs');
const glob = require('glob');


function distributeSpecs(specs, threads, useDuration) {
  // Sort specs by descending weight or duration.
  specs.sort((a, b) => {
    const aValue = useDuration ? a.duration : a.weight;
    const bValue = useDuration ? b.duration : b.weight;

    if (aValue === 0 && bValue === 0) return 0;
    if (aValue === 0) return 1;
    if (bValue === 0) return -1;

    return bValue - aValue;
  });
  // Create an array to store spec groups.
  const groups = Array.from({ length: threads }, () => []);

  // Distribute specs among groups.
  for (const spec of specs) {
    // Find the group with the lowest total weight or duration.
    const groupIndex = groups.reduce((minIndex, currentGroup, currentIndex, groups) => {
      const currentValue = currentGroup.reduce((total, spec) => total + (useDuration ? spec.duration : spec.weight), 0);
      const minValue = groups[minIndex].reduce((total, spec) => total + (useDuration ? spec.duration : spec.weight), 0);

      return currentValue < minValue ? currentIndex : minIndex;
    }, 0);

    // Add the spec to the group.
    groups[groupIndex].push(spec);
  }

  return groups;
}


async function runCypress(specPath) {
  return new Promise((resolve, reject) => {
    const cypress = spawn('npx', ['cypress', 'run', '--spec', specPath]);

    let output = '';

    cypress.stdout.on('data', (data) => {
      output += data.toString();
    });

    cypress.stderr.on('data', (data) => {
      output += data.toString();
    });

    cypress.on('close', (code) => {
      if (code === 0) {
        const durationRegex = /Duration: (\d+\.?\d*)/;
        const match = output.match(durationRegex);

        if (match) {
          const duration = parseFloat(match[1]);
          resolve(duration);
        } else {
          reject('Failed to parse test duration');
        }
      } else {
        reject(`Cypress process exited with code ${code}`);
      }
    });
  });
}

function generateConfigFile(configPath, specsPath, threads, useDuration) {
  const specs = glob.sync(`${specsPath}/**/*.js`).map((path) => ({
    path,
    weight: 0,
    duration: 0
  }));

  const config = {
    specs,
    threads,
    useDuration
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

module.exports = {
  distributeSpecs,
  runCypress,
  generateConfigFile
};
