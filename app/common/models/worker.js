const getApp = require('../utils/utils.js').getApp;

module.exports = function(Worker) {
  //Worker.validatesPresenceOf('title');

  Worker.upsertItem = (data, cb) => {

    getApp(Worker)
    .then((app) => cb(null, data));

  };

  Worker.remoteMethod('upsertItem', {
    description: 'upsert client ',
    http: {verb: 'post'},
    accepts: {
      arg: 'data',
      type: 'object',
      description: 'data from form to upsert client',
      http: {source: 'body'},
      required: true
    },
    returns: {
      arg: 'res',
      type: 'object',
      root: true
    }
  });
};
