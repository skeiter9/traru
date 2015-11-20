import asyncAm from './async.factory.js';

export default angular
  .module('components.validForm', [asyncAm.name])

  .factory('yeValidFormMessage', [() => {

    return (errorName, field, valueFail, condition) => {

      var msgID = 'FORM.FIELD_SUBMITED_ERROR.';

      switch (errorName) {
        case 'email': msgID += 'EMAIL'; break;
        case 'minlength': msgID += 'MIN_LENGTH'; break;
        case 'maxlength': msgID += 'MAX_LENGTH'; break;
        case 'number': msgID += 'NUMBER'; break;
        case 'pattern': msgID += 'PATTERN'; break;
        case 'required': msgID += 'REQUIRED'; break;
        case 'url': msgID += 'URL'; break;
        case 'date': msgID += 'DATE'; break;
        case 'time': msgID += 'TIME'; break;
        case 'week': msgID += 'WEEK'; break;
        case 'month': msgID += 'MONTH'; break;//loopback errors response
        case 'presence': msgID += 'PRESENCE'; break;
        case 'uniqueness': msgID += 'UNIQUENESS'; break;
        default: msgID += 'ERROR'; break;
      }
      return msgID;

    };

  }])

  .factory('validFormUtils', ['$translate', '$mdToast', ($tr, $mdT) => {
    return {
      catchError({err, modelName, operation}) {
        const errCode = !!err.errorOne ?
          err.errorOne.messageCode :
          !!err.data && !!err.data.error && !!err.data.error.code ?
          `API.${err.data.error.code}` : 'FORM.WRONG';

        const fieldOne = (!!err.errorOne ? err.errorOne.field : '')
          .toUpperCase();

        return $mdT.showSimple($tr.instant(errCode, {
          field: $tr.instant('FIELDS.' + fieldOne),
          operation: $tr.instant(`ACTIONS.${operation.toUpperCase()}`),
          modelPlural: $tr.instant(`MODEL.${modelName.toUpperCase()}_PLURAL`)
        }));
      }
    };
  }])

  .factory('yeValidForm', ['yeValidFormMessage', '$q', 'async', validForm]);

function validForm(yeValidFormMessage, $q, async) {

  return (form) => {

    let errors = {};
    let errorOne = [];

    return form.$invalid ?
      $q((r, reject) => {
        async.forEachOf(form.$error,
          (value, typeError, cb) => {
            async.each(value,
              (inputFail, cbInner) => {

                const condition = 'condition'; //replace
                const errData = {
                  field: inputFail.$name,
                  value: inputFail.$viewValue,
                  error: typeError,
                  messageCode: yeValidFormMessage(typeError, inputFail.$name,
                    inputFail.$viewValue, condition)
                };

                if (!!!errors[inputFail.$name]) errors[inputFail.$name] = [];
                if (errorOne.length === 0) errorOne.push(errData);

                errors[inputFail.$name].push(errData);

                cbInner(null);
              },

              (errInner) => {
                if (errInner) cb(errInner);
                else cb(null);
              });

          },

          (err) => {

            reject(err ? err : {
              status: false,
              errors: errors,
              errorOne: errorOne[0]
            });

          });

      }) : $q.when({status: true});

  };
}
