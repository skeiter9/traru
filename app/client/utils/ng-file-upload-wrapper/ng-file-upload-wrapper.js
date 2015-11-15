import ngFileUpload from 'ng-file-upload/dist/ng-file-upload-all.min.js';
import styles from './ng-file-uploader-wrapper.css';

export default angular.module('ngFileUploadWrapper', ['ngFileUpload'])

  .directive('fileUploader', ['Upload', '$timeout', '$log', (u, $t, $l) => {
    return {
      scope: {
        fileResult: '=ngModel'
      },
      bindToController: true,
      controller: angular.noop,
      controllerAs: 'ngF',
      template: require('./ng-file-uploader-wrapper.jade')(),
      compile(tE, tA) {
        tE.addClass(styles.ngF);

        tE[0].querySelectorAll('md-icon')[0].setAttribute('md-font-icon',
          tA.fontIconBg || 'mdi mdi-camera');
        tE[0].querySelectorAll('md-icon')[1].setAttribute('md-font-icon',
          tA.fontIcon || 'mdi mdi-star');

        return (s, elem, attrs, ngF) => {

          attrs.url = attrs.url ||
            'https://angular-file-upload-cors-srv.appspot.com/upload';

          let t2 = $t(() => {}, 0);
          const t1 = $t(() => {
            t2 = $t(() => {
              const h = (elem[0].offsetWidth * (9 / 16)) - 4;
              ngF.hCover = {height: h + 'px'};
              /*
              for (let i = 0; i < elem[0].querySelectorAll('.h-cover').length; i++) {
                elem[0].querySelectorAll('.h-cover')[i].style
                  .height = `${h}px`;
              }*/
            }, 0);
          }, 0);

          ngF.upload = (file) => {
            console.log(file);
            if (!!!file) return;
            u.upload({
              url: 'api/pictures/tmp/upload',
              data: {file: file},
            })
            .then(function(response) {
              console.log(response);
              ngF.fileResult = response.data.result.files.file[0].name;
            }, (responseFail) => {

              console.log(responseFail);
              if (responseFail.status > 0
              ) console.warn(responseFail.status + ': ' + responseFail.data);
            }, (evt) => {
              // Math.min is to fix IE which reports 200% sometimes
              if (!!file) file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });

            s.$on('$destroy', () => {
              $t.cancel(t1);
              $t.cancel(t2);
            });

          };

        };
      }
    };
  }]);