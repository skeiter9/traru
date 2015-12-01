const getApp = require('../utils/utils.js').getApp;

module.exports = function(Department) {

  Department.validatesUniquenessOf('name');

  Department.observe('before delete', (ctx, next) => {
    getApp(Department)
      .then(app => Department.findById(ctx.where.id, {include: 'cargos'}))
      .then(item => item.cargos().length > 0 ?
        next({
          message: `${item.name} has ${item.cargos().length} cargos`,
          code: 'DEPARTMENT_HAS_CARGOS'
        }) :
        next(null))
      .catch((err) => next(err));
  });

  Department.observe('before save', (ctx, next) => {

    if (!!ctx.instance && !!!ctx.instance.companyId
    ) return next(new Error('pass CompanyId field'));

    next(null);

  });

};
