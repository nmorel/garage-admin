require('./server/cars');
require('./server/repo');

process.on('SIGINT', () => process.exit());
