module.exports = function(Settings) {

  const path = require('path');
  const async = require('async');
  const fs = require('fs');

  const pathI18n = path.resolve(__dirname, '../i18n');
  const pathI18nSection = path.join(pathI18n, 'sections');

  const readFile = (dir, part, lang) => new Promise((resolve, reject) => fs
    .readFile(path.join(dir, part, `${part}-${lang}.json`),
      (err, data) => err ? reject(err) : resolve(data))
  );

  Settings.translate = (part, lang, cb) => {

    readFile(pathI18n, part, lang)
      .catch(err => readFile(pathI18nSection, part, lang))
      .then(data => cb(null, JSON.parse(data)))
      .catch(err => cb(null, {msg: `${part}-${lang} is not registered`}));

  };

  Settings.remoteMethod('translate', {
    description: 'i18n translations, get translate for determined section',
    http: {
      path: '/i18n/:part/:lang',
      verb: 'get'
    },
    accepts: [
      {arg: 'part', type: 'string', required: true},
      {arg: 'lang', type: 'string', required: true}
    ],
    returns: {
      arg: 'translate',
      type: 'object',
      root: true
    }
  });

};
