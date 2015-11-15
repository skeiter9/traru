import styles from './form.directive.css';

export default angular
  .module('yeForm', [])

  .directive('yeInput', [() => {
    return {
      restrict: 'E',
      transclude: true,
      compile(tE, tA) {

        const isDefined = angular.isDefined;

        tA.mForm = isDefined(tA.mForm) ? tA.mForm : 'mForm';
        tA.label = isDefined(tA.label) ? tA.label : '';
        tA.field = isDefined(tA.field) ? tA.field : 'field';
        tA.name = isDefined(tA.name) ? tA.name :
          tA.field.lastIndexOf('.') !== -1 ?
          tA.field.slice(tA.field.lastIndexOf('.') + 1) : tA.field;
        tA.theme = isDefined(tA.theme) && tA.theme !== '' &&
          tA.theme !== 'theme' ? tA.theme : 'default';

        let formOrformAux = isDefined(tA.aux) ? 'formAux' : 'form';

        let maxlengthAttr = isDefined(tA.preMdMaxlength) ?
          'md-maxlength = \'' +
            (parseInt(tA.preMdMaxlength) ? tA.preMdMaxlength : 140) + '\'' :
          '';

        let mdInputContainer = angular.element(`
          <md-input-container
            ${isDefined(tA.checkbox) ? 'checkbox' : ''}
            ${isDefined(tA.switch) ? 'switch' : ''}
            ${tA.radio && tA.icon ? 'radio-icon' : ''}
            class = "${tA.icon ? 'md-icon-float' : ''}"
          >
          </md-input-container>
        `);

        let label = isDefined(tA.checkbox) ||
          isDefined(tA.switch)  ||
          isDefined(tA.radio) ?
          tA.label === '' ?
            '' :
            `{{'${tA.label}' |uppercase | translate | capitalize}}` :
          angular.element(`
            <label>
              {{'${tA.label}' |uppercase | translate | capitalize}}
            </label>
            ${tA.icon ? '<md-icon md-font-icon = "' + tA.icon + '"/>' : ''}
          `);

        let inputOTextarea = isDefined(tA.radio) ? angular.element(
          `
            <md-radio-button
              ng-value="${tA.value}"
              name="${tA.name}"
              aria-label="radio for ${label}"
            > ${label}
            </md-radio-button>
          `
          ) : isDefined(tA.checkbox) ? angular.element(
          `<md-checkbox
            ng-model="${tA.mForm}.${formOrformAux}.${tA.field}"
            name="${tA.name}"
            aria-label='chx for ${tA.field}'
          >
            ${label}
          </md-checkbox>`
        ) : isDefined(tA.switch) ? angular.element(
          `<md-switch
            ng-model="${tA.mForm}.${formOrformAux}.${tA.field}"
            name="${tA.name}"
            aria-label='switch for ${tA.field}'>
            ${label}
          </md-switch>`
          ) : isDefined(tA.geoposition) ? angular.element(
            `<input
              gmap-geolocation
              theme = '${tA.theme}'
              ng-model-geo="${tA.mForm}.form.${tA.field}"
              ng-model="${tA.mForm}.${formOrformAux}Aux.${tA.field}"
              name="${tA.name}"
              ${isDefined(tA.required) ? 'required' : ''}
            />`
          ) : isDefined(tA.textarea) ? angular.element(
          `<textarea
            ng-model="${tA.mForm}.${formOrformAux}.${tA.field}"
            name="${tA.name}"
            columns="1"
            ${maxlengthAttr}
            ng-model-options="{ updateOn: 'default', debounce: {'blur': 200} }"
          />`
        ) : isDefined(tA.type) && tA.type === 'date' ? angular.element(
          `<input
            type='date'
            date-picker=''
            theme = '${tA.theme}'
            ${isDefined(tA.min) && tA.min !== '' ?
              'min=\'' + tA.min + '\'' : ''}
            ${isDefined(tA.max) && tA.max !== '' ?
              'max=\'' + tA.max + '\'' : ''}
            ng-model="${tA.mForm}.${formOrformAux}.${tA.field}"
            name="${tA.name}"
            ${isDefined(tA.required) ? 'required' : ''}
          />`
          ) : angular.element(
          `<input
            type="${isDefined(tA.type) ? tA.type : 'text'}"
            ng-model="${tA.mForm}.${formOrformAux}.${tA.field}"
            name="${tA.name}"
            ${isDefined(tA.required) ? 'required' : ''}
            ${isDefined(tA.maxlength) ?
              'maxlength="' + tA.maxlength + '"'  : ''}
            ${maxlengthAttr}
            ng-model-options="{ updateOn: 'default', debounce: {'blur': 200} }"
          />`
        );

        let messages = angular.element(`
          <div ng-messages="form.${tA.name}.$error"
             ng-show="form.${tA.name}.$dirty && form.${tA.name}.$invalid">
          </div>`
        );

        if (isDefined(tA.required)) messages.append(angular.element(`
          <div ng-message="required">
            {{'FORM.FIELD_ERROR.REQUIRED' | translate | capitalize}}
          </div>`
        ));

        if (isDefined(tA.type) && tA.type === 'number') messages
          .append(angular.element(
          `<div ng-message="number">
            {{'FORM.FIELD_ERROR.IS_NUMBER' | translate | capitalize}}
          </div>`
        ));

        if (isDefined(tA.type) && tA.type === 'email') messages
          .append(angular.element(
          `<div ng-message="email">
            {{'FORM.FIELD_ERROR.IS_EMAIL' | translate | capitalize}}
          </div>`
        ));

        if (isDefined(tA.preMdMaxlength)) messages.append(angular.element(
          `<div ng-message="md-maxlength">
            {{'FORM.FIELD_ERROR.MAX_LENGTH'
              | translate: {max: ${tA.preMdMaxlength}} | capitalize}}
          </div>`
        ));

        if (isDefined(tA.maxlength)) messages.append(angular.element(
          `<div ng-message="maxlength">
            {{'FORM.FIELD_ERROR.MAX_LENGTH'
              | translate: {max: ${tA.maxlength}} | capitalize}}
          </div>`
        ));

        if (
          angular.isUndefined(tA.checkbox) &&
          angular.isUndefined(tA.radio) &&
          angular.isUndefined(tA.switch)
        ) mdInputContainer.append(label);

        mdInputContainer.append(inputOTextarea);

        if (
          angular.isUndefined(tA.checkbox) &&
          angular.isUndefined(tA.radio) &&
          angular.isUndefined(tA.switch)
        ) mdInputContainer.append(messages);

        if (isDefined(tA.tooltip)) mdInputContainer.append(angular.element(
          `<md-tooltip>
            {{"${tA.tooltip}" | translate | capitalize}}
          </md-tooltip>`
        ));

        tE.append(mdInputContainer);

      }
    };
  }])

  .directive('formActions', [() => {
    return {
      restrict: 'E',
      compile(tE, tA) {
        //tE.attr('layout', 'row');
        //tE.attr('layout-align', 'end center');
        tA.mForm = angular.isDefined(tA.mForm) ? tA.mForm : 'mForm';
        const label = !!tA.label ?
          `{{'${tA.label}' | translate | capitalize}}` :
          `{{'ACTIONS.' + (${tA.mForm}.update ? 'UPDATE': 'REGISTER') | translate | capitalize}}`;
        tE.append(angular.element(`
          <md-button
            ng-click = '${tA.mForm}.save(form)'
            class = "md-accent mt-8"
            aria-label = "${label}"
          >
            ${label}
          </md-button>
        `));

      }
    };
  }])

  .directive('form', [() => {
    return {
      restrict: 'E',
      compile(tE, tA) {
        //tE.attr('ng-class',
        //  `mForm.showSpinner ? 'ye-fade-form' : 'ye-appear'`);
        /*
        tE.after(angular.element(`
          <aside class='content-spinner'
            ng-class="!mForm.showSpinner ? 'ye-fade' : 'ye-appear'">
            <md-progress-circular
              md-mode="indeterminate"
              md-theme="${tA.mdTheme || 'default'}"/>
          </aside>
        `));
        */
      }
    };
  }]);
