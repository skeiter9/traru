module.exports = function(server) {

  const path = require('path');

  // Install a `/` route that returns server status
  //router.get('/', server.loopback.status());
  //server.use(router);

  server.set('view engine', 'jade');
  server.set('views', path.resolve(__dirname, '../views'));
  console.log('vie nov 27 18:21:36 PET 2015');
  /*
  server.use((req, res, next) => {
    res.set('X-Powered-By', 'Traru');
    next();
  });
  server.middleware('routes:before', (req, res, next) => {
    res.set('X-Powered-By', 'Traru');
    next();
  });
  */

  const router = server.loopback.Router();

  const routeRegExp = server.get('env') === 'production' ?
    /^\/(?!(api)(\/|\W)).*/ :
    /^\/(?!(api|explorer|static)(\/|\W)).*/;

  router.get(routeRegExp, (req, res) => {
    res.render('index');
  });

  server.middleware('routes', router);

};
