export default ['$state', 'resolve', '$translatePartialLoader', '$translate',
function($s, r, $tPL, $tr) {

  this.trucks = r;

  //console.log(r, ro);
  /*
  this.trucks = [
    {geoposition: {lat: -6.776864, lng: -79.843937}, photo: 'static/images/photo.jpg', licensePlate: 'QWQQW8', model: 'erer'},
    {geoposition: {lat: -8.108763, lng: -79.028028}, photo: 'https://material.angularjs.org/latest/img/list/60.jpeg', licensePlate: 'MMER78', model: 'viod'},
    {geoposition: {lat: -5.180776, lng: -80.654962}, photo: 'https://material.angularjs.org/latest/img/list/60.jpeg', licensePlate: 'POI980', model: 'loli'},
  ];
  */
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
