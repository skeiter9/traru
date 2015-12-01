exports.getApp = Model => new Promise((resolve, reject) => {
  Model.getApp((err, app) => {
    if (err) reject(err);
    else resolve(app);
  });
});

exports.getError = () => {};

