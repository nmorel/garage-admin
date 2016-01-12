const minimist = require('minimist');

const options = minimist(process.argv.slice(2), {
  default: {
    port: 3000,
  },
});

module.exports = options;
