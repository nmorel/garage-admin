const conf = require('./conf');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.use('/front', express.static(conf.frontendFolder + '/dist'));
app.use(express.static(__dirname + '/../public'));

app.listen(conf.port, () => console.log(`Server listening on port ${conf.port}!`));

module.exports = app;
