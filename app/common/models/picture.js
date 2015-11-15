module.exports = function(Picture) {

  const fs = require('fs');
  const path = require('path');

  const storage = path.resolve(__dirname, '../../server/storage');

  Picture.afterRemote('upload', function(ctx, picture, next) {

    const pictureOriginal = picture.result.files.file[0];

    const ext = path.extname(pictureOriginal.name);

    const originalPath = path.join(storage, 'tmp', pictureOriginal.name);

    const tmpName = Date.now().toString();

    var nameFormalizedPath = path.join(storage, 'tmp', tmpName + ext)
      .replace(/ /g, '-');

    //console.log(picture);

    fs.rename(originalPath, nameFormalizedPath, function(err) {
      if (err) next(err);
      else {
        picture.result.files.file[0].name = tmpName + ext;
        next(null);
      }
    });

  });

  Picture.beforeRemote('download', function(ctx, picture, next) {
    //console.log(ctx.req.params, ctx.req.body);
    var params = ctx.req.params;
    if (params.container === 'agregados' &&
    !fs.existsSync(path.join(storage, 'agregados', params.file))) {
      //console.log(ctx.req, 'not exits', params.file);
      ctx.req.params = {file: 'default-standard.jpg'};

      //ctx.req.params.file = 'default-standard.jpg';
    }

    next();
  });

};
