module.exports = (app) => {

  const fs = require('fs');
  const path = require('path');
  const storage = path.resolve(__dirname, '../storage');
  const pathTmpDir = path.join(storage, 'tmp');

  fs.stat(pathTmpDir, (err, stats) => {
    if (err) fs.mkdir(pathTmpDir, (err) => {
      console.log(err);
    });
  });

};
