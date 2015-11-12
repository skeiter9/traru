exports.checkRoute = (t, $rS, $l, path, $state, stateName, msg) => {
  $rS.$apply(() => $l.path(path));
  t.equal($state.current.name, stateName, msg || `${path} link to state: ${stateName}`);
};
