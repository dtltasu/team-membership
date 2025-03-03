// test.js
const github = {
  context: {
    repo: { owner: 'optimaxdev', repo: 'popups' },
  },
  getOctokit: require('@actions/github').getOctokit,
};

process.env['INPUT_GITHUB_TOKEN'] = '';
process.env['INPUT_USERNAME'] = 'dtltasu';
process.env['INPUT_TEAM'] = 'tl,teamleads,sre';
process.env['INPUT_ORGANIZATION'] = 'optimaxdev';

const mockCore = {
  getInput: (name, options) => {
    const value = process.env[`INPUT_${name.toUpperCase()}`];
    if (options && options.required && !value) {
      throw new Error(`Input required and not supplied: ${name}`);
    }
    return value || '';
  },
  setOutput: (name, value) => {
    console.log(`Output: ${name}=${value}`);
  },
  setFailed: (message) => {
    console.error(`Failed: ${message}`);
    process.exit(1);
  },
};

require('./index.js').run(mockCore, github);