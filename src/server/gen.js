/*
const exec = require('child_process').exec;

app.get('/gen', (req, res) => {
  const child = exec('./node_modules/.bin/gulp webpack --publicPath /front/', {
    cwd: conf.frontendFolder,
  });
  child.stdout.on('data', data => console.log('stdout: ' + data));
  child.stderr.on('data', data => console.log('stderr: ' + data));
  child.on('close', code => {
    console.log('Generation done: ' + code);
    res.send('Done!');
  });
});

const Module = require('module');

Module._extensions['.png'] = (module, fn) => {
  module._compile(`module.exports='${fn}';`, fn);
};
Module._extensions['.jpg'] = (module, fn) => {
  module._compile(`module.exports='${fn}';`, fn);
};

app.get('/require', (req, res) => {
  'use strict';

  let img = require(options.frontendFolder + '/src/data');
  res.send(img);
});
*/
