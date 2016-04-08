module.exports = (ops) => (req, res, next) => {
  const name = !!ops && !!ops.name ? ops.name : 'traru';
  res.set('X-Powered-By', name);
  next();
};
