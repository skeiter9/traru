'use strict';

module.exports = function(Model, ops) {

  const fs = require('fs');
  const path = require('path');

  const storage = path.resolve(__dirname, '../../server/storage');
  const photoDir = Model.settings.plural;
  const pathPhotoDir = path.join(storage, photoDir);

  if (typeof ops.photoName === 'undefined') {
    console.log('set photoname for ' + photoDir);
    return;
  }

  fs.stat(pathPhotoDir, (err, stats) => {
    if (err) fs.mkdir(pathPhotoDir, (err) => {
      console.log(err);
    });
  });

  Model.observe('before delete', (ctx, next) => {
    Model.findById(ctx.where.id, (err, item) => {
      if (err) return next(err);
      if (item.photo === 'default.jpg') return next(null);
      const photoPath = path.join(storage, photoDir, item.photo);
      fs.unlink(photoPath, (errInner) => {
        next(!!errInner ? errInner : null);
      });
    });
  });

  Model.observe('before save', function(ctx, next) {

    let item = ctx.instance ? ctx.instance : ctx.data;
    item.photo = !!item.photo ? item.photo : 'default.jpg';

    if (item.photo === 'default.jpg') return next(null);
    if (item.photo === item[ops.photoName] + path.extname(item.photo)) return next(null);

    const uploadPhoto = (tmpPhoto, photoName) => {
      photoName = photoName.replace(/ /g, '-');
      const source = fs.createReadStream(tmpPhoto);
      const dest = fs.createWriteStream(path.join(storage, photoDir, photoName));

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

    if (!!item.id
    ) fs.access(path.join(storage, photoDir, item.photo), fs.F_OK, (err) => {
      uploadPhoto(
        err ?
          path.join(storage, 'tmp', item.photo) :
          path.join(storage, photoDir, item.photo),
        item[ops.photoName] + path.extname(item.photo)
      );
    });
    else uploadPhoto(
      path.join(storage, 'tmp', item.photo),
      item[ops.photoName] + path.extname(item.photo)
    );

  });

};
