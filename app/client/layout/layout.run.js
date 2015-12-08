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
    $l.debug(unfoundState.to); // "lazy.state"
    e.preventDefault();
    $st.go('e404', {failState: unfoundState.to});
  });

  $rS.$on('$stateChangeStart',
  (e, toState, toParams, fromState, fromParams) => {
    $l.debug('start ', toState.name, toParams);

    if ($rS.initialize && !!!toState.auth) return;
    else if ($rS.initialize && toState.auth  && l.isLoggued()) return;
    else if (l.loadStateInProgress) return;

    e.preventDefault();
    l.loadStateInProgress = true;

    l.getDataUser()

      .then(dataUser => l.checkInitCompany(dataUser, toState, fromState))
      .then(newState => {
        $l.debug(fromState.name, toState.name, newState);
        if (newState === toState.name && $rS.initialize) return $st.reload();
        if (newState === fromState.name && $rS.initialize) return $st.reload();
        if (fromState.name === 'login' && $rS.initialize && l.isLoggued()
        ) return $st.go('dashboard');
        else return $st.go(newState, toParams);
      });
  });

  $rS.$on('$stateChangeSuccess', (e, toState) => {
    $l.debug('finish', toState.name);
    if (!!!toState.auth) l.loadStateEnd();
  });

}];

