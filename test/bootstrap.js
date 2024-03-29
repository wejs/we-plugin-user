const projectPath = process.cwd(),
  testTools = require('we-test-tools'),
  path = require('path');

let we;

before(function(cb){
  testTools.copyLocalSQLiteConfigIfNotExists(projectPath, cb);
});

before(function(callback) {
  this.slow(100);

  const We = require('we-core');
  we = new We();

  testTools.init({}, we);

  we.bootstrap({
    i18n: {
      directory: path.join(__dirname, 'locales'),
      updateFiles: true
    }
  }, callback);
});

before(function(cb) {
  we.startServer(cb);
});

//after all tests

after(function (callback) {
  testTools.helpers.resetDatabase(we, callback);
});

after(function () {
  we.exit(process.exit);
});