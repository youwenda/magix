(function (win, S) {
  document.createElement('vframe');
  if (!win.console) {
    win.console = {
      log: S.noop,
      info: S.noop,
      warn: S.noop,
      error: S.noop
    }
  }
  S.add('magix/magix', (S, Magix) => Magix, {
    requires: ['magix']
  });
})(window, window.KISSY);