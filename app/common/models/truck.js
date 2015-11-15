'use strict';

module.exports = function(Truck) {

  const fs = require('fs');
  const path = require('path');

  const storage = path.resolve(__dirname, '../../server/storage');

  Truck.observe('before save', function(ctx, next) {

    let item = ctx.instance ? ctx.instance : ctx.data;
    item.photo = !!item.photo ? item.photo : 'default.jpg';

    if (item.photo === 'default.jpg') return next(null);

    const tmpPhoto = path.join(storage, 'tmp', item.photo);
    const photoName = item.licensePlate + path.extname(item.photo)
      .replace(/ /g, '-');
    const source = fs.createReadStream(tmpPhoto);
    const dest = fs.createWriteStream(path.join(storage, 'trucks', photoName));

    source.pipe(dest);
    source.on('end', () => fs.unlink(tmpPhoto, (err) => {
      if (err) next(err);
      else {
        item.photo = photoName;
        next(err);
      }
    }));
    source.on('error', (err) => next(err));

  });

};
