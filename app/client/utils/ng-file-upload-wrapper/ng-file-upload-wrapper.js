import ngFileUpload from 'ng-file-upload/dist/ng-file-upload-all.min.js';
import styles from './ng-file-uploader-wrapper.css';

export default angular.module('ngFileUploadWrapper', ['ngFileUpload'])

  .directive('fileUploader', ['Upload', '$timeout', '$log', 'appConfig',
  '$window',
  (u, $t, $l, appC, $w) => {
    return {
      scope: {
        fileResult: '=ngModel'
      },
      bindToController: true,
      controller: angular.noop,
      controllerAs: 'ngF',
      template: require('./ng-file-uploader-wrapper.jade')(),
      compile(tE, tA) {

        const iconsPre = tE[0].querySelectorAll('md-icon');

        tE.addClass(styles.ngF);

        iconsPre[0]
          .setAttribute('md-font-icon', tA.fontIconBg || 'mdi mdi-panorama');

        iconsPre[1]
          .setAttribute('md-font-icon', tA.fontIcon || 'mdi mdi-camera');

        return (s, elem, attrs, ngF) => {

          const resize = () => {
            const h = (elem[0].offsetWidth * (9 / 16)) - 4;
            ngF.hCover = {height: h + 'px'};
            ngF.preBg = {height: h + 'px'};
          };

          const init = () => {
            ngF.url = attrs.url || `${appC.apiUrl}/pictures/tmp/upload`;
            ngF.initialize = true;
          };

          let t2 = null;
          const t1 = $t(() => {
            t2 = $t(() => {
              resize();
              init();
              ngF.preBg.backgroundImage = !!!ngF.fileResult ? 'none' :
                `url('${appC.apiUrl}/pictures/${attrs.container}/download/${
                ngF.fileResult}')`;
            }, 0);
          }, 0);

          ngF.upload = (file) => {
            if (!!!file) {
              ngF.errPic = true;
              return;
            }else ngF.errPic = false;

            if (ngF.preBg.backgroundImage !== 'none'
            ) ngF.preBg.backgroundImage = 'none';

            return u.upload({
              url: ngF.url,
              data: {file: file},
            })

            .then(response => {
              //console.log(response);
              ngF.fileResult = response.data.result.files.file[0].name;
            }, responseFail => {

              $l.debug(responseFail);
              if (responseFail.status > 0
              ) console.warn(responseFail.status + ': ' + responseFail.data);
            }, (evt) => {
              // Math.min is to fix IE which reports 200% sometimes
              if (!!file) file.progress = Math
                .min(100, parseInt(100.0 * evt.loaded / evt.total));
            });

          };

          s.$on('$destroy', () => {
            $t.cancel(t1);

            //$t.cancel(t2);
          });

          $w.addEventListener('optimizedResize', resize.bind());

        };
      }
    };
  }]);
