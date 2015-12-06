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
  /* init - you can init any event */
  throttle('resize', 'optimizedResize');

  $rS.$on('$stateNotFound', (e, unfoundState, fromState, fromParams) => {
    $l.debug(unfoundState.to); // "lazy.state"
    //$l.debug(unfoundState.toParams); // {a:1, b:2}
    //$l.debug(unfoundState.options); // {inherit:false} + default options
    e.preventDefault();
    $st.go('e404', {failState: unfoundState.to});
  });

  $rS.$on('$stateChangeStart',
  (e, toState, toParams, fromState, fromParams) => {

    $l.debug('start ', toState.name, toParams);

    if (l.initialize && !!!toState.auth) return;
    else if (l.loadStateInProgress) return;

    e.preventDefault();
    l.loadStateInProgress = true;

    l.getDataUser()

      .then(dataUser => l.checkInitCompany(dataUser, toState, fromState))
      .then(newState => {
        $l.debug(fromState.name, toState.name, newState);
        return (newState === toState.name && l.initialize &&
          (fromState.name !== 'login' && (fromState.name !== 'home' && l.isLoggued()))
        ) ||
        (newState === fromState.name) ?
          $st.reload() :
          $st.go(newState, toParams);
      })

      .then((nState) => l.loadStateEnd(nState));

  });

  $rS.$on('$stateChangeSuccess', (e, toState) => {
    $l.debug('finish', toState.name);
    if (!!!l.initialize) {
      l.initialize = true;
      $rS.initialize = true;
    }
    l.finishStateTransition(toState.name);
    /*
    if(!l.isLoggued()) setTimeout(() => {
      l.refreshLanguages(toState.name)
        .then(() => l.loadStateInProgress = false);
    }, 0);
    else l.refreshLanguages(toState.name)
        .then(() => l.loadStateInProgress = false);
    */
  });

}];

