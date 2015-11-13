module.exports = function(Settings) {

  const path = require('path');
  const async = require('async');
  const fs = require('fs');

  const pathI18n = path.resolve(__dirname, '../i18n');

  Settings.translate = (part, lang, cb) => {
    fs.readFile(path.join(pathI18n, part, `${part}-${lang}.json`), (err, data) => {
      if (err) cb(null, {msg: `${part}-${lang} is not registered`});
      else cb(null, JSON.parse(data));
    });
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
