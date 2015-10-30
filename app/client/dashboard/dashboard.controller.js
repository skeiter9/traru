export default [function() {
  //
}];
/*
export default ['layoutFactory', 'yeFindBy', dashboardControllerFn];

function dashboardControllerFn(lF, yeFindBy) {

  lF.appbarTitle = 'SECTIONS.' + (lF.data.loggued ? 'dashboard' : 'initialize');
  lF.ui.content.classContainer = 'section--dashboard';

  this.modules = lF.data.dataUser.modules;
  this.role = yeFindBy(this.modules, 'name', 'role').item;
  this.venta = yeFindBy(this.modules, 'name', 'venta').item;

}
*/
