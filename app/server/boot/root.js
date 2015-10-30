module.exports = function(server) {
  // Install a `/` route that returns server status
  //router.get('/', server.loopback.status());
  //server.use(router);

  server.set('view engine', 'jade');
  server.set('views', 'server/views');

  server.use((req, res, next) => {
    res.set('X-Powered-By', 'Traru');
    next();
  });

  const router = server.loopback.Router();
  router.get('/', (req, res) => {
    res.render('index');
  });

  server.use(router);

};
