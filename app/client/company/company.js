const moduleName = 'company';
const modelName = moduleName.slice(0, 1).toUpperCase() +
  moduleName.slice(1).toLowerCase();

export default angular.module(`traru${modelName}`, [])

  .directive('traruList', ['layout', 'Company', 'appConfig', '$translate',
  'Cargo', 'Department',
  (l, M, traru, $tr, C, D) => ({
    restrict: 'E',
    scope: {
      module: '=',
      mD: '=moduleDepartment',
      mC: '=moduleCargo'
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'vm',
    template: require('./templates/traru-list.jade')(),
    link(s, elem, attrs, vm) {

      l.validModule(vm.module)
        .catch(() => vm.initialize = true)
        .then(() => M.find({
          filter: {where: {main: true}, include: {departments: 'cargos'}}
        }))
        .then((items) => {
          vm.title = traru.name;
          vm.items = items;
          vm.initialize = true;
        });

      vm.formItem = (e, department, item, modelName) => l.sidenavRightAction({
        scope: s,
        title: !!item ? 'SENTENCES.EDIT'  : 'SENTENCES.NEW',
        titleVars: {
          moduleName: $tr.instant('MODEL.' + modelName.toUpperCase()),
          item: !!item ? item.name : ''
        },
        tag: `${modelName}-form`,
        item: item,
        attrs: `
          in-company
         ${modelName === 'cargo' ? 'department-id=\'' + department.id + '\'' : ''}
         ${modelName === 'department' ? 'company-id=\'' + department.id + '\'' : ''}
          form-success='vm.formSuccess()'
        `,
        theme: 'cargo'
      });

      vm.deleteItem = (e, item, modelN) => l.removeItem({
        evt: e,
        model: modelN === 'cargo' ? C :
          modelN === 'department' ? D :
          modelN === 'company' ? M : null,
        item: item,
        title: item.name,
        modelName: modelN
      });

      vm.formSuccess = (item) => l.closeSidenav('right');

      vm.showItem = (e, item, title, tagModule) => l.sidenavRightAction({
        scope: s,
        title: title,
        theme: tagModule,
        tag: `${tagModule}-show`,
        item: item
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
              mForm.inClient();
              $t.cancel(t1);
            }, 0);
          }) :
        save(form);

    }
  })])

	.directive('departmentForm', ['layout', 'Department', '$log',
  (l, M, $l) => ({
    restrict: 'E',
    scope: {
      item: '=',
      formSuccess: '&',

    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'mForm',
    template: require(`./templates/department-form.jade`)(),
    link(s, elem, attrs, mForm) {

      if (
        angular.isDefined(attrs.inCompany) &&
        (angular.isUndefined(attrs.companyId) || attrs.companyId === '')
      ) {
        $l.debug('pass a company id to register a department');
        return;
      } else mForm.showSelect = true;

      mForm.theme = 'department';

      mForm.form = angular.isObject(mForm.item) ?
        angular.extend({}, mForm.item) :
        {companyId: attrs.companyId};

      mForm.update = !!mForm.form.id ? true : false;

      mForm.loadDepartments = () => D.find().$promise
        .then((items) => mForm.departments = items);

      mForm.save = (form) => l.saveItem({
        form: form,
        Model: M,
        mForm: mForm,
        modelName: 'Department',
        propTitle: 'name',
        showToast: true,
        formSuccess: mForm.formSuccess
      });

    }
  })])

	.directive('cargoForm', ['layout', 'Cargo', '$log',
  (l, M, $l, $mdT) => ({
    restrict: 'E',
    scope: {
      item: '=',
      formSuccess: '&'
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'mForm',
    template: require(`./templates/cargo-form.jade`)(),
    link(s, elem, attrs, mForm) {

      if (
        angular.isUndefined(mForm.item) &&
        angular.isDefined(attrs.inCompany) &&
        (angular.isUndefined(attrs.departmentId) || attrs.departmentId === '')
      ) {
        $l.debug('pass a departmentId to register a Cargo');
        return;
      }

      mForm.theme = 'cargo';

      mForm.form = angular.isObject(mForm.item) ?
        angular.extend({}, mForm.item) :
        {departmentId: attrs.departmentId};

      mForm.update = !!mForm.form.id ? true : false;

      mForm.save = (form) => l.saveItem({
        form: form,
        Model: M,
        mForm: mForm,
        modelName: 'Cargo',
        propTitle: 'name',
        showToast: true,
        formSuccess: mForm.formSuccess
      });
    }
  })])

  .directive('companyShow', [() => ({
    restrict: 'E',
    scope: {
      item: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'vm',
    template: require('./templates/company-show.jade')()
  })])

  .directive('personShow', [() => ({
    restrict: 'E',
    scope: {
      item: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'vm',
    template: require('./templates/person-show.jade')()
  })])

  .directive('cargoShow', [() => ({
    restrict: 'E',
    scope: {
      item: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'vm',
    template: require('./templates/cargo-show.jade')()
  })])

  .directive('departmentShow', [() => ({
    restrict: 'E',
    scope: {
      item: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'vm',
    template: require('./templates/department-show.jade')()
  })]);

