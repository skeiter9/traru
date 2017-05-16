export default ['$rootScope', '$state', 'layout', '$log',
($rS, $st, l, $l) => {

  const throttle = (type, name, obj = window) => {
    let running = false;
    const func = () => {
      if (running) return;
      running = true;
      requestAnimationFrame(() => {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };

    obj.addEventListener(type, func);
  };

  throttle('resize', 'optimizedResize');

  $rS.$on('$stateNotFound', (e, unfoundState, fromState, fromParams) => {
    e.preventDefault();
    //$st.go('e404', {failState: unfoundState.to});
    $st.go('home');
  });

  $rS.$on('$stateChangeError', (evt, to, toParams, from, fromParams, error) => {
    console.log(from, to, error)
    if (!!error && error.redirectTo) {
      //$st.go(error.redirectTo);
    } else {
      //$st.go('login')
    }
  });

}];
