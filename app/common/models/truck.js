'use strict';

module.exports = function(Truck) {

  const fs = require('fs');
  const path = require('path');

  const storage = path.resolve(__dirname, '../../server/storage');

  Truck.observe('before delete', (ctx, next) => {
    Truck.findById(ctx.where.id, (err, item) => {
      if (err) return next(err);
      if (item.photo === 'default.jpg') return next(null);
      const photoPath = path.join(storage, 'trucks', item.photo);
      fs.unlink(photoPath, (errInner) => {
        next(!!errInner ? errInner : null);
      });
    });
  });

  Truck.observe('before save', function(ctx, next) {

    let item = ctx.instance ? ctx.instance : ctx.data;
    item.photo = !!item.photo ? item.photo : 'default.jpg';

    if (item.photo === 'default.jpg') return next(null);

    const uploadPhoto = () => {
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
    };

    if (!!item.id) fs.exists(path.join(storage, 'trucks', item.photo), (err) => {
      if (!err) uploadPhoto();
      else next(null);
    });
    else uploadPhoto();

  });

};
