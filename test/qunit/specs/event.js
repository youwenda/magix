/**
 * @description https://lark.alipay.com/jintai.yzq/subway/magix1to3
 */
(function(win, S, QUnit, Test, EMPTY) {
  function Event(Magix, Event) {
    QUnit.module(' Event ');
    // const isMagix1 = win.Magix || S.Env.mods['magix/magix'];
    // const isMagix3 = !Magix.version && S.Env.mods['magix'];
    // const isMagix3Shim = Magix.version && S.Env.mods['magix'];

    QUnit.test('event.un', assert => {
      console.log(Event);
      if (isMagix1 || isMagix3Shim) {
        assert.ok( Event.un , '存在Event.un');
      } else {
        assert.notOk( Event.un , '不存在Event.un');
        assert.ok( Event.off , '存在Event.off');
      }
    });
  }
  Test.Event = Event;
})(window, window.KISSY, window.QUnit, window.Test || (window.Test = {}), '');