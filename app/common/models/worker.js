'use strict';

const async = require('async');
const getApp = require('../utils/utils.js').getApp;

module.exports = function(Worker) {

  //Worker.validatesPresenceOf('title');

  Worker.upsertItem = (data, cb) => {
    let res = {};

    getApp(Worker)
    .then((app) => {

      if (!!!data.person) cb({errCode: 'ERR_WORKER_NO_PERSON'});
      if (!!!data.cargos || data.cargos.length === 0
      ) cb({errCode: 'ERR_WORKER_NO_CARGO'});

      console.log(data);

      return (!!!data.person.id ?
        app.models.person.create(data.person) :
        Promise.resolve(data.person)
      )

      .then((result) => {
        res.person = result;
        return app.models.worker.upsert({
          personId: res.person.id
        });
      })

      .then(results => {
        res.worker = results;
        res.cargoMapping = [];

        return new Promise((resolve, reject) => async.each(data.cargos,
          (cargoId, cbInner) => app.models.cargoMapping.create({
            cargoId: cargoId,
            workerId: res.worker.id
          })
            .then(r => cbInner(null, res.cargoMapping.push(r)))
            .catch(err => async.each(res.cargoMapping,
              (itemInner, cbInner2) => cbInner2(null, itemInner.destroy()),
              err => cbInner({
                errCode: 'ERR_WORKER_FAIL_CARGOS',
                message: 'problem to save cargo in worker'
              })
            )),

          err => !!err ? reject(err) : resolve(res)
        ));
      })

      .then(res => {
        cb(null, res);
      })

      .catch(err => {
        if (!!res.person) res.person.destroy();
        if (!!res.worker) res.worker.destroy();
        cb({errCode: 'ERR_WORKER_NO_SAVE'});
      });

    });

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
