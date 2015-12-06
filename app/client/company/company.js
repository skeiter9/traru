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

      const init = () => l.validModule(vm.module)

        .then(() => vm.module.model.find({
          filter: {where: {main: true}, include: {departments: 'cargos'}}
        }).$promise)

        .then((items) => {
          vm.title = traru.name;
          vm.items = items;
          vm.initialize = true;
        })

        .catch(() => vm.initialize = true);

      init();

      vm.formItem = (e, parentModel, item, mN) => l.sidenavRightAction({
        scope: s,
        title: !!item ? 'SENTENCES.EDIT'  : 'SENTENCES.NEW',
        titleVars: {
          moduleName: $tr.instant('MODEL.' + mN.toUpperCase()),
          item: !!item ? item.name : ''
        },
        tag: `${mN}-form`,
        item: item,
        attrs: `
          in-company
          ${mN === 'cargo' ? 'department-id=\'' + parentModel.id + '\'' : ''}
          ${mN === 'department' ? 'company-id=\'' + parentModel.id + '\'' : ''}
          form-success='vm.formSuccess()'
        `,
        theme: mN
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
      formSuccess: '&'
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'mForm',
    template: require(`./templates/${moduleName}-form.jade`)(),
    link(s, elem, attrs, mForm) {

      const init = () => {

        mForm.update = l.isFormUpdate(mForm);

        const isEmbed = angular.isDefined(attrs.isEmbed);
        const initObj = {main: angular.isDefined(attrs.main)};

        mForm.form = isEmbed ? mForm.item :
          mForm.update ? angular.extend(initObj, mForm.item) : initObj;

        mForm.hideSave = isEmbed;

      };

      init();

      mForm.save = (form) => l.saveItem({
        Model: M,
        form: form,
        mForm: mForm,
        modelName: moduleName,
        formSuccess: mForm.formSuccess,
        propTitle: 'socialName'
      });

    }
  })])

	.directive('departmentForm', ['layout', 'Department', '$log',
  (l, M, $l) => ({
    restrict: 'E',
    scope: {
      item: '=',
      formSuccess: '&'
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

