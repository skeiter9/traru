module.exports = (Company) => {

  Company.validatesUniquenessOf('socialName');
  Company.validatesUniquenessOf('ruc');

  Company.observe('before save', (ctx, next) => {
    if (!!ctx.instance) ctx.instance.main = !!ctx.instance.main;
    next(null);
  });

};
