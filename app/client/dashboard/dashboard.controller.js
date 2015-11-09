export default ['$state', function($s) {
  //console.log($s);
  this.trucks = [
    {photo: 'static/images/photo.jpg', licensePlate: 'QWQQW8', model: 'erer'},
    {photo: 'https://material.angularjs.org/latest/img/list/60.jpeg', licensePlate: 'MMER78', model: 'viod'},
    {photo: 'https://material.angularjs.org/latest/img/list/60.jpeg', licensePlate: 'POI980', model: 'loli'},
  ];
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
