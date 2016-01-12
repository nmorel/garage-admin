const conf = require('./conf');
const express = require('express');
//const exec = require('child_process').exec;

const app = express();

app.use('/front', express.static(conf.frontendFolder + '/dist'));
app.use(express.static(__dirname + '/../public'));

//app.get('/gen', (req, res) => {
//  const child = exec('./node_modules/.bin/gulp webpack --publicPath /front/', {
//    cwd: conf.frontendFolder,
//  });
//  child.stdout.on('data', data => console.log('stdout: ' + data));
//  child.stderr.on('data', data => console.log('stderr: ' + data));
//  child.on('close', code => {
//    console.log('Generation done: ' + code);
//    res.send('Done!');
//  });
//});

app.listen(conf.port, () => console.log(`Server listening on port ${conf.port}!`));

//const Module = require('module');
//
//Module._extensions['.png'] = (module, fn) => {
//  module._compile(`module.exports='${fn}';`, fn);
//};
//Module._extensions['.jpg'] = (module, fn) => {
//  module._compile(`module.exports='${fn}';`, fn);
//};
//
//app.get('/require', (req, res) => {
//  'use strict';
//
//  let img = require(options.frontendFolder + '/src/data');
//  res.send(img);
//});

module.exports = app;
