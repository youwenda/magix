/**
 * @description https://lark.alipay.com/jintai.yzq/subway/magix1to3
 */
(function(win, S, QUnit, Test, EMPTY) {
  const $ = S.all;
  function Vframe(Magix, Vframe) {
    QUnit.module(' Vframe ');

    QUnit.test('vframe.mountView', assert => {
      let done = assert.async();
      if (isMagix3Shim) {
        Magix.Vframe.on('add', function (data) {
          const vframe = data.vframe;
          vframe.on('mounted', () => {
            assert.ok(vframe.view instanceof Magix.View, 'vframe中存在view对象');
            assert.equal(vframe.view.__proto__.tmpl, '<div>111</div>');
            assert.equal(vframe.view['sign'], vframe.view.$s);
            // View_prepare
            done();
          })
        });
      }
    });
  }
  Test.Vframe = Vframe;
})(window, window.KISSY, window.QUnit, window.Test || (window.Test = {}), '');