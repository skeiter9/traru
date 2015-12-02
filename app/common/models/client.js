const getApp = require('../utils/utils.js').getApp;

module.exports = function(Client) {
  //Client.validatesPresenceOf('title');

  Client.upsertItem = (data, cb) => {

    getApp(Client)

    .then((app) => data.clientType === 0 ?
      app.models.person.create(data.person) :
      data.clientType === 1 ?
        app.models.company.create(data.company) :
        new Promise((resolve, r) => r(new Error('select person or company'))))

    .then(personOrCompany => {
      data.personOrCompany = personOrCompany;
      return Client.create({
        creationDate: Date.now(),
        type: data.clientType === 0 ? 'person' : 'company',
        typeId: personOrCompany.id
      });
    })

    .then(res => cb(null))

    .catch(err => {
      if (!!data.personOrCompany) getApp(Client)
        .then((app) => data.personOrCompany.destroy())
        .then(() => cb(err))
        .catch(errInner => cb(errInner));
      else cb(err);
    });
  };

  Client.remoteMethod('upsertItem', {
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
