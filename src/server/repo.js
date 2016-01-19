const app = require('./app.js');
const conf = require('./conf.js');
const Promise = require('bluebird');
const exec = require('child_process').exec;

function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    const child = exec(cmd, {
      cwd: conf.frontendFolder,
    });
    child.stdout.on('data', data => console.log('stdout: ' + data));
    child.stderr.on('data', data => console.log('stderr: ' + data));
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Error when executed cmd '${cmd}'`));
      }
    });
  });
}

/**
 * Updates the frontend code
 */
function pull() {
  return execAsync('git add -A && git stash && git pull --rebase && git stash pop');
}

/**
 * Generates a pre-version
 */
app.post('/api/compile', (req, res, next) => {
  pull()
    .then(() => execAsync(`git pull && ./node_modules/.bin/gulp build --publicPath ${conf.context}front/`))
    .then(() => res.sendStatus(200))
    .catch(next);
});

/**
 * Publish the version
 */
app.post('/api/publish', (req, res, next) => {
  pull()
    .then(() => execAsync('git add -A && git commit -m "Update data" && git push'))
    .then(() => res.sendStatus(200))
    .catch(next);
});
