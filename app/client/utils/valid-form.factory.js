import asyncAm from './async.factory.js';

export default angular.module('components.validForm', [asyncAm.name])

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
      catchError({err, modelName = 'model', operation = 'save'}) {

        const errCode = !!err.errorOne ?
            !!err.errorOne.field && err.errorOne.field.includes('anonymousField') ?
             'FORM.FIELD_ERROR.ANONYMOUS' :
              err.errorOne.messageCode :
          !!err.data && !!err.data.error && !!err.data.error.code ?
            `API.${err.data.error.code}` :
            'FORM.WRONG';

        const fieldOne = (!!err.errorOne ? err.errorOne.field : 'anonymous'
          ).toUpperCase();

        return $mdT.showSimple($tr.instant(errCode, {
          field: $tr.instant('FIELDS.' + fieldOne),
          operation: $tr.instant(`ACTIONS.${operation.toUpperCase()}`),
          modelPlural: $tr.instant(`MODEL.${modelName.toUpperCase()}_PLURAL`)
        }));
      }
    };
  }])

  .factory('yeValidForm', ['yeValidFormMessage', '$q', 'async', '$log',
  (yeValidFormMessage, $q, async, $l) => {

    return (form) => {

      let errors = {};
      let errorOne = [];

      const exeAction = (inputF, prop) => angular.isFunction(inputF[prop]) ?
        inputF[prop]() : '';

      return form.$invalid ?
        $q((r, reject) => {
          async.forEachOf(form.$error,
            (value, typeError, cb) => {
              async.each(value,
                (inputFail, cbInner) => {

                  const condition = 'condition'; //replace
                  const inputFailName = inputFail.$name ||
                    (() => {
                      $l.debug('anonymous field for ' + inputFail.$viewValue);
                      return 'anonymousField' + Date.now().toString();
                    })();

                  const errData = {
                    field: inputFailName,
                    value: inputFail.$viewValue,
                    error: typeError,
                    messageCode: yeValidFormMessage(typeError, inputFailName,
                      inputFail.$viewValue, condition)
                  };

                  if (!!!errors[errData.field]) errors[errData.field] = [];
                  if (errorOne.length === 0) errorOne.push(errData);

                  errors[errData.field].push(errData);

                  exeAction(inputFail, '$setDirty');
                  exeAction(inputFail, '$serTouched');
                  exeAction(inputFail, '$setSubmitted');

                  cbInner(null);
                },

                (errInner) => {
                  cb(null);
                });

            },

            (err) => {

              reject({
                status: false,
                errors: errors,
                errorOne: errorOne[0],
                form: form
              });

            });

        }) : $q.when({status: true});

    };
  }]);

