'use strict';

module.exports = function(server) {

  const async = require('async');

  const privateModels = [
    'user',

    'settings',
    'role',

    'picture',
    'acl',
    'roleMapping',
    'accessToken',

    'User',
    'AccessToken',
    'ACL',
    'RoleMapping',
    'Role'
  ];

  const getModules = () => new Promise((resolve, reject) => async
    .filter(
      server.models(),
      (model, cb) => cb(privateModels.indexOf(model.modelName) === -1 ? true : false),
      (results) => async.map(
        results,
        (model, cb) => cb(null, model.modelName),
        (err, models) => resolve(models)
      )
    )
  );

  const getOperationName = operation => operation === 'u' ? 'updateAttributes' :
    operation === 'r' ? 'find' :
    operation === 'd' ? 'deleteById' : 'create';

  const formateAclToSend = (moduleName, roleName, roleId, operation) => ({
    model: moduleName,
    permission: 'ALLOW',
    principalType: 'ROLE',
    principalId: roleName,
    roleId: roleId,
    accessType: operation === 'r' ? 'READ' : 'WRITE',
    property: getOperationName(operation)
  });

  const parseAclsToSend = (role, modules, acls, operations) => new Promise((resolve, reject) => {
    async.concat(modules,
    (module_, cb) => {
      async.map(operations,
      (operation, cbInner) => {
        cbInner(null, formateAclToSend(module_, role.name, role.id, operation));
      },

      (errInner, results) => cb(null, results)
      );
    },

    (err, results) => {
      async.filter(results,
      (aclToSend, cb) => {
        async.each(acls,
        (acl, cbInner) => {
          //console.log(typeof acl.principalId, typeof aclToSend.principalId.toString());

          //console.log(acl.principalId, aclToSend.principalId.toString());

          //console.log(acl.model === aclToSend.model &&
          //  acl.principalId === aclToSend.principalId &&
          //  acl.property === aclToSend.property);
          if (acl.model === aclToSend.model &&
            acl.principalId === aclToSend.principalId &&
            acl.property === aclToSend.property
          ) cbInner(new Error('already seted'));
          else cbInner(null);
        },

        (err) => {
          if (err) cb(false);
          else cb(true);
        });
      },

      (results) => {
        resolve(results);
      });
    });

  });

  Promise.all([
    server.models.role.find({where: {name: 'root'}}),
    server.models.user.find({where: {username: 'root'}})
  ])

    .then((res) => Promise.all([
      res[0].length === 0 ?
        server.models.role.create({name: 'root', description: 'root user'}) :
        Promise.resolve(res[0][0]),
      res[1].length === 0 ?
        server.models.user.create({
          email: 'dfdfd@gmail.com',
          username: 'root',
          password: '123456'
        }) :
        Promise.resolve(res[1][0])
    ]))

    .then((res) => Promise.all([
      Promise.resolve(res[0]),
      Promise.resolve(res[1]),
      server.models.roleMapping.find({where: {and: [
        {principalType: 'USER'},
        {roleId: res[0].id},
        {principalId: res[1].id}
      ]}}),
      server.models.acl.find({where: {and: [
        {principalType: 'ROLE'}, {roleId: res[0].id}
      ]}}),
      getModules(),
      server.models.settings.find({where: {userId: res[1].id}})
    ]))

    .then((res) => Promise.all([
      Promise.resolve(res[0]),
      Promise.resolve(res[1]),
      res[2].length === 0 ?
        server.models.roleMapping.create({
          principalType: 'USER',
          roleId: res[0].id,
          principalId: res[1].id
        }) :
        Promise.resolve(res[2][0]),
      parseAclsToSend(res[0], res[4], res[3], ['c', 'r', 'u', 'd']),
      res[5].length === 0 ?
        server.models.settings.create({
          userId: res[1].id,
          preferredLanguage: 'en',
          langsAvailables: ['en', 'es'],
          langFallback: 'en'
        }) :
        Promise.resolve(res[5][0])
    ]))

    .then((res) => Promise.all([
      Promise.resolve(res[0]),
      Promise.resolve(res[1]),
      Promise.resolve(res[2]),
      res[3].length > 0 ?
        server.models.acl.create(res[3]) :
        Promise.resolve([]),
      Promise.resolve(res[4])
    ]))
    .catch((err) => {
      console.log(err);
    });

  const Acl = server.models.Acl;
  const User = server.models.User;
  const Role = server.models.Role;

  Role.registerResolver('createRoute', createRoute);

  //--
  function createRoute(role, ctx, cb) {

    // if the target model is not project
    if (ctx.modelName !== 'route') return reject(cb);

    // do not allow anonymous users
    if (!ctx.accessToken.userId) return reject(cb);

    User.findById(userId, {include: 'roles'}, (err, user) => {

      if (err) return reject(cb);

      async.detect(user.roles,
      (role, callback) => {
        Acl.findOne({where: {principalType: 'ROLE', principalId:
          role.name, model: 'route', property: 'create',
          accessType: 'WRITE'}},
        (err, acl) => {
          if (err) callback(false);
          else if (acl === null) callback(false);
          else callback(true);
        });
      },

      (results) => {
        if (results) cb(null, true);
        else reject(cb);
      });

    });
  }

  function reject(cb) {
    process.nextTick(() => cb(null, false));
  }

};
