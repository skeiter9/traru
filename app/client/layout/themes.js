/*
red -
purple -
green -
grey -
brown -
indigo -
deep-purple -
teal -
cyan -
orange -
blue-grey -
amber -
deep-orange -
lime -
yellow-
pink
blue
light-green -
light-blue -

AMARILLO #F7D358
AZUL #2E64FE

*/
export function themes(mdTP) {

  mdTP
    .theme('default')
      .primaryPalette('yellow2')
      .accentPalette('orange')
      .backgroundPalette('grey');

  mdTP
    .theme('truck')
      .primaryPalette('blue2')
      .accentPalette('purple');

  mdTP
    .theme('route')
      .primaryPalette('blue2')
      .accentPalette('deep-purple');

  mdTP
    .theme('client')
      .primaryPalette('blue2')
      .accentPalette('indigo');

  mdTP
    .theme('person')
      .primaryPalette('blue2')
      .accentPalette('amber');

  mdTP
    .theme('company')
      .primaryPalette('blue2')
      .accentPalette('purple');

  mdTP
    .theme('worker')
      .primaryPalette('blue2')
      .accentPalette('purple');

  mdTP
    .theme('traru')
      .primaryPalette('blue2')
      .accentPalette('green');

  mdTP
    .theme('department')
      .primaryPalette('blue2')
      .accentPalette('indigo');

  mdTP
    .theme('cargo')
      .primaryPalette('blue2')
      .accentPalette('indigo');

}
