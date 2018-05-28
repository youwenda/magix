/**
 * @description https://lark.alipay.com/jintai.yzq/subway/magix1to3
 */
(function(win, S, QUnit, Test, EMPTY) {
  function Event(Magix, Event) {
    QUnit.module(' Event ');
    const isMagix1 = win.Magix || S.Env.mods['magix/magix'];
    const isMagix3 = !Magix.version && S.Env.mods['magix'];
    const isMagix3Shim = Magix.version && S.Env.mods['magix'];
  
  }
  Test.Event = Event;
})(window, window.KISSY, window.QUnit, window.Test || (window.Test = {}), '');