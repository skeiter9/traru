const moduleName = 'person';

export default angular.module(`traru${moduleName.toUpperCase()}`, [])

  .directive(`${moduleName}Form`, ['layout', '$log', 'yeValidForm', 'Person',
  '$mdToast', '$translate', 'validFormUtils', '$q', '$timeout',
  (l, $l, vForm, M, $mdT, $tr, vFormU, $q, $t) => ({
    restrict: 'E',
    scope: {
      item: '=',
      formData: '=',
      inClient: '&',
      inWorker: '&'
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'mForm',
    template: require(`./templates/${moduleName}-form.jade`)(),
    link(s, elem, attrs, mForm) {

      const init = () => {

        mForm.update = !!mForm.item;
        mForm.theme = moduleName;
        const inWorker = angular.isDefined(attrs.inWorker);

        const initObj = {nacionalityId: {type: 'dni'}};

        mForm.form = inWorker ? mForm.formData :
          mForm.update ?
            angular.extend(initObj, mForm.item) :
            initObj;

        if (inWorker && !angular.isObject(mForm.form.nacionalityId)
        ) mForm.form.nacionalityId = {type: 'dni'};

        mForm.formAux = {
          nacionality: angular.isObject(mForm.form.nacionalityId) &&
            angular.isString(mForm.form.nacionalityId.type) ?
              mForm.form.nacionalityId.type === 'dni'  ? '1' : '2' :
              '1'
        };

        if (mForm.update
        ) mForm.form.birthdayDate = new Date(mForm.form.birthdayDate);

        mForm.hideSave = inWorker;

      };

      init();

      const save = (form, onlyCheck = false) => l .saveItem({
        Model: M,
        form: form,
        mForm: mForm,
        modelName: moduleName,
        onlyCheck: onlyCheck
      });

      mForm.save = (form) => angular.isDefined(attrs.inClient) ?
        save(form, true)
          .then((formData) => {
            mForm.formData = formData;
            const t1 = $t(() => {
              mForm.inClient();
              $t.cancel(t1);
            }, 0);
          }) :
        save(form);

      mForm.changeNacionality = (nac) => {

        if (angular.isDefined(mForm.form.nacionalityId.number)
        ) delete mForm.form.nacionalityId.number;

        if (angular.isDefined(mForm.form.secondLastName) && nac === '2'
        ) delete mForm.form.secondLastName;

        mForm.form.nacionalityId.type = nac === '1' ? 'dni' : 'foreignId';

      };

    }
  })]);
