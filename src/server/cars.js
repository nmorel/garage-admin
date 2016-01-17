const app = require('./app.js');
const conf = require('./conf.js');
const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const rmdir = Promise.promisify(require('rimraf'));

const carsFolder = path.join(conf.frontendFolder, '/src/data/cars');
const carsIndex = path.join(carsFolder, 'index.js');
const carsNextId = path.join(carsFolder, 'nextId.json');

/**
 * Converts a javascript object to json string
 * @param jsObj the object to convert
 */
function jsToString(jsObj) {
  return JSON.stringify(jsObj, null, 2);
}

/**
 * Saves a car
 * @param car the car to save
 * @returns {Promise} the promise
 */
function saveCar(car) {
  const date = new Date();
  if (!car.creationDate) {
    car.creationDate = date.toISOString();
  }
  car.modificationDate = date.toISOString();
  const file = path.join(carsFolder, car.id.toString(), 'data.json');
  return fs.writeFileAsync(file, jsToString(car));
}

/**
 * Updates the index.js that list all the cars
 * @param skipCar optional car id that should be filtered out
 * @returns {Promise} the promise
 */
function updateIndex(skipCar) {
  return fs.readdirAsync(carsFolder)
    .filter(fileName => {
      // Keeps only the directory different than the one we want to skip
      return fs.statAsync(path.join(carsFolder, fileName))
        .then(stat => stat.isDirectory() && fileName !== skipCar);
    })
    .then(files => {
      // Updates the index.js referencing all the cars
      const requires = files.map(file => `  require('./${file}/data.json')`).join(',\n');
      return fs.writeFileAsync(carsIndex, `module.exports = [\n${requires}\n];\n`);
    });
}

/**
 * Returns all the cars
 */
app.get('/api/cars', (req, res, next) => {
  fs.readdirAsync(carsFolder).filter(fileName => {
    return fs.statAsync(path.join(carsFolder, fileName)).then(stat => stat.isDirectory());
  }).map(fileName => {
    return fs.readFileAsync(path.join(carsFolder, fileName, 'data.json')).then(JSON.parse);
  }).then(result => res.json(result))
    .catch(next);
});

/**
 * Returns the car with the id given in parameter
 */
app.get('/api/cars/:id', (req, res, next) => {
  fs.readFileAsync(path.join(carsFolder, req.params.id, 'data.json'))
    .then(JSON.parse)
    .then(result => res.json(result))
    .catch(next);
});

/**
 * Adds a car
 */
app.post('/api/cars', (req, res, next) => {
  const car = req.body;

  fs.readFileAsync(carsNextId)
    .then(data => {
      const id = JSON.parse(data).next;
      car.id = id;
      return fs.mkdirAsync(path.join(carsFolder, id.toString()));
    })
    .then(() => saveCar(car))
    .then(() => updateIndex())
    .then(() => {
      const nextId = {
        next: car.id + 1,
      };
      return fs.writeFileAsync(carsNextId, jsToString(nextId));
    })
    .then(() => res.json(car))
    .catch(next);
});

/**
 * Updates the car with the id given in parameter
 */
app.put('/api/cars/:id', (req, res, next) => {
  saveCar(req.body)
    .then(() => res.sendStatus(200))
    .catch(next);
});

/**
 * Deletes the car with the id given in parameter
 */
app.delete('/api/cars/:id', (req, res, next) => {
  // Removes the car from the index
  updateIndex(req.params.id)
    .then(() => {
      // Removes the folder and everything it contains
      return rmdir(path.join(carsFolder, req.params.id));
    })
    .then(() => res.sendStatus(200))
    .catch(next);
});
