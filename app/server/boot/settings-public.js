module.exports = (app) => {

  app.models.settings.find({where: {id: 'public'}})
    .then(items => items.length > 0 ?
      items[0] :
      app.models.settings.create({
        preferredLanguage: 'es',
        langFallback: 'en',
        langsAvailables: ['en', 'es'],
        userId: 0
      })
    )

    .catch(err => console.log(err));

};
