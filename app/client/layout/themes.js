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
*/
export function themes(mdTP) {

  mdTP
    .theme('default')
      .primaryPalette('teal')
      .accentPalette('orange')
      .backgroundPalette('grey');

  mdTP
    .theme('truck')
      .primaryPalette('orange')
      .accentPalette('purple');

  mdTP
    .theme('route')
      .primaryPalette('deep-purple')
      .accentPalette('brown');

  mdTP
    .theme('client')
      .primaryPalette('green')
      .accentPalette('indigo');

  mdTP
    .theme('person')
      .primaryPalette('cyan')
      .accentPalette('amber');

  mdTP
    .theme('company')
      .primaryPalette('light-blue')
      .accentPalette('lime');

  mdTP
    .theme('worker')
      .primaryPalette('light-green')
      .accentPalette('purple');

  mdTP
    .theme('traru')
      .primaryPalette('blue')
      .accentPalette('light-green');

  mdTP
    .theme('department')
      .primaryPalette('orange')
      .accentPalette('indigo');

  mdTP
    .theme('cargo')
      .primaryPalette('brown')
      .accentPalette('indigo');

}
