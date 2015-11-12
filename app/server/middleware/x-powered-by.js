module.exports = (ops) => (req, res, next) => {
  const name = !!ops && !!ops.name ? ops.name : 'myApp';
  res.set('X-Powered-By', name);
  next();
};
