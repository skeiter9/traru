const moduleName = 'company';
const modelName = moduleName.slice(0, 1).toUpperCase() +
  moduleName.slice(1).toLowerCase();

export default angular.module(`traru${modelName}`, [])

  .directive('traruList', ['layout', 'Company', 'appConfig',
    (l, M, traru) => ({
    restrict: 'E',
    scope: {
      module: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'vm',
    template: require('./templates/traru-list.jade')(),
    link(s, elem, attrs, vm) {

      l.validModule(vm.module)
        .catch(() => vm.initialize = true)
        .then(() => M.find({filter: {where: {main: true}}}))
        .then((items) => {
					vm.title = traru.name;
					vm.items = items;
          vm.initialize = true;
        });
    }
  })])

	.directive(`${moduleName}Form`, ['layout', '$log', 'yeValidForm', 'Company',
  '$mdToast', '$translate', 'validFormUtils', '$q', '$timeout',
  '$state',
  (l, $l, vForm, M, $mdT, $tr, vFormU, $q, $t, $st) => ({
    restrict: 'E',
    scope: {
      item: '=',
      inClient: '&',
      formData: '=',
      formSuccess: '&'
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'mForm',
    template: require(`./templates/${moduleName}-form.jade`)(),
    link(s, elem, attrs, mForm) {

      mForm.theme = moduleName;

      mForm.form = angular.isObject(mForm.item) ?
        angular.extend({}, mForm.item) :
				{main: angular.isDefined(attrs.main)};

      mForm.update = !!mForm.form.id ? true : false;

      const save = (form, onlyCheck = false) => l.saveItem({
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
              console.log(attrs.inClient, mForm);
              mForm.inClient();
              $t.cancel(t1);
            }, 0);
          }) :
        save(form)
          .then(mForm.formSuccess);

    }
  })]);
