const app = require('./app.js');
const conf = require('./conf.js');
const path = require('path');
const _ = require('lodash');
const uuid = require('node-uuid');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const rmdir = Promise.promisify(require('rimraf'));
const imagemagick = require('imagemagick-native');

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
 * Retrieves a car with the given id
 * @param id the car's id
 * @returns {Promise} Returns the car
 */
function getCar(id) {
  return fs.readFileAsync(path.join(carsFolder, id, 'data.json'))
    .then(JSON.parse);
}

/**
 * Converts a photo
 * @param data the buffer containing the photo
 * @param file the destination file
 * @param size the maximum width and height of the photo
 * @returns {Promise}
 */
function convertPhoto(data, file, size) {
  return fs.writeFileAsync(path.join(conf.frontendFolder, 'src', file),
    imagemagick.convert({
      srcData: data,
      format: 'JPG',
      quality: 90,
      width: size,
      height: size,
      resizeStyle: 'aspectfit',
    }));
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
  getCar(req.params.id)
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

/**
 * Adds photos to a car
 */
app.post('/api/cars/:id/photos', multipartMiddleware, (req, res, next) => {
  if (!req.files.file || !req.files.file.length) {
    res.sendStatus(200);
    return;
  }

  // For each photo, we create 3 versions (small, medium and large) and return the object containing the id and urls
  Promise.map(req.files.file,
    file => {
      const fileId = uuid.v4();
      const photoFolder = path.join(carsFolder, req.params.id, fileId);
      const result = {
        id: fileId,
        name: file.originalFilename,
        small: path.join('data/cars', req.params.id, fileId, fileId + '_small.jpg'),
        medium: path.join('data/cars', req.params.id, fileId, fileId + '_medium.jpg'),
        large: path.join('data/cars', req.params.id, fileId, fileId + '_large.jpg'),
        verylarge: path.join('data/cars', req.params.id, fileId, fileId + '_verylarge.jpg'),
      };

      return fs.mkdirAsync(photoFolder)
        .then(() => fs.readFileAsync(file.path))
        .then((data) => {
          const small = convertPhoto(data, result.small, 130);
          const medium = convertPhoto(data, result.medium, 260);
          const large = convertPhoto(data, result.large, 520);
          const verylarge = convertPhoto(data, result.verylarge, 780);
          return Promise.all([small, medium, large, verylarge]);
        })
        .then(() => fs.unlinkAsync(file.path))
        .then(() => result);
    })

    // Now, we add the photos to the car
    .then((data) => {
      return getCar(req.params.id)
        .then(car => {
          if (!car.photos) {
            car.photos = data;
          } else {
            car.photos = _.concat(car.photos, data);
          }

          return saveCar(car);
        });
    })
    .then(() => res.sendStatus(200))
    .catch(next);
});

/**
 * Deletes a photo from a car
 */
app.delete('/api/cars/:id/photos/:idPhoto', (req, res, next) => {
  rmdir(path.join(carsFolder, req.params.id, req.params.idPhoto))
    .then(() => getCar(req.params.id))
    .then(car => {
      _.remove(car.photos, photo => photo.id === req.params.idPhoto);
      return saveCar(car);
    })
    .then(() => res.sendStatus(200))
    .catch(next);
});
