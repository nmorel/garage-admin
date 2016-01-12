const app = require('./app.js');
const conf = require('./conf.js');
const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const rmdir = Promise.promisify(require('rimraf'));

const carsFolder = conf.frontendFolder + '/src/data/cars';
const carsIndex = conf.frontendFolder + '/src/data/cars/index.js';

app.get('/api/cars', (req, res) => {
  fs.readdirAsync(carsFolder).filter(fileName => {
    return fs.statAsync(path.join(carsFolder, fileName)).then(stat => stat.isDirectory());
  }).map(fileName => {
    return fs.readFileAsync(path.join(carsFolder, fileName, 'data.json')).then(JSON.parse);
  }).then(result => res.json(result));
});

app.get('/api/cars/:id', (req, res) => {
  fs.readFileAsync(path.join(carsFolder, req.params.id, 'data.json'))
    .then(JSON.parse)
    .then(result => res.json(result));
});

app.post('/api/cars', (req, res) => {
  // TODO
  res.sendStatus(500);
});

app.put('/api/cars/:id', (req, res) => {
  // TODO
  res.sendStatus(500);
});

app.delete('/api/cars/:id', (req, res) => {
  fs.readdirAsync(carsFolder)
    .filter(fileName => {
      // Keeps only the directory different than the one we want to delete
      return fs.statAsync(path.join(carsFolder, fileName))
        .then(stat => stat.isDirectory() && fileName !== req.params.id);
    })
    .then(files => {
      // Updates the index.js referencing all the cars
      const requires = files.map(file => `require('./${file}/data.json')`).join(',\n');
      return fs.writeFileAsync(carsIndex, `module.exports = [${requires}];`);
    })
    .then(() => {
      // Removes the folder
      return rmdir(path.join(carsFolder, req.params.id));
    })
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});
