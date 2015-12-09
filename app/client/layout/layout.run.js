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
    $st.go('e404', {failState: unfoundState.to});
  });

  $rS.$on('$stateChangeStart',
  (e, toState, toParams, fromState, fromParams) => {
    $l.debug('start ', toState.name, toParams);

    //l.resolveState(e, toState);

  });

}];

