/**
 * @description https://lark.alipay.com/jintai.yzq/subway/magix1to3
 */
(function (win, S, QUnit, Test, EMPTY) {
  const $ = S.all;
  function Vframe(Magix, Vframe) {
    QUnit.module(' Vframe ');

    if (isMagix3Shim) {
      Magix.Vframe.on('add', function (data) {
        QUnit.test('vframe.mountView', assert => {
          let done = assert.async();
          const vframe = data.vframe;
          vframe.on('mounted', () => {
            const proto = vframe.view.__proto__;
            assert.ok(vframe.view instanceof Magix.View, 'vframe中存在view对象');
            assert.equal(proto.tmpl, '<div>111</div>');
            assert.equal(vframe.view['sign'], vframe.view.$s);
            // View_prepare
            assert.ok(S.isFunction(proto['a<click>']), '存在a方法');
            assert.equal(proto['a<click>'](), 'a0', '自身的a方法');
            assert.ok(S.isFunction(proto['b<click>']), '存在b方法');
            assert.equal(proto['b<click>'](), 'b1', '一级父view的b方法');
            assert.ok(S.isFunction(proto['c<click>']), '存在c方法');
            assert.equal(proto['c<click>'](), 'c1', '一级父view的c方法');
            assert.ok(S.isFunction(proto['d<click>']), '存在d方法');
            assert.equal(proto['d<click>'](), 'd2', '二级父view的d方法');
            // View_Ctors
            assert.equal(vframe.view.path, vframe.$j, 'view有path属性，与vframe$j相等');
            assert.equal(vframe.view.sign, vframe.view.$s, 'view有sign属性，与$s相等');
            vframe.view.sign = '?';
            assert.notEqual(vframe.view.sign, '?', 'view的sign参数不能被重写');
            done();
          })
        });
        QUnit.test('View.prototype', assert => {
          const view = data.vframe.view;
          assert.deepEqual(view.vom, Magix.Vframe, '存在vom');
          assert.equal(view.location.get('row'), 4);
          assert.deepEqual(view.$('#J_app_main'), Magix.node('#J_app_main'));
          assert.ok(view.parentView);
          assert.equal(view.notifyUpdate(), view.$s, '存在notifyUpdate');
          assert.ok(view.wrapEvent);
          assert.strictEqual(view.wrapMxEvent(1), '1');
          view.manage('dialog', {id: 1});
          assert.ok(view.$r.dialog, 'dialog被托管');
          assert.deepEqual(view.getManaged('dialog'), {id: 1}, 'getManaged ok');
          view.removeManaged('dialog');
          assert.ok(!view.$r.dialog, 'removeManaged ok');
          // view load?  wrapMxEvent?
        });
        QUnit.test('vframe.unmountView', assert => {
          const vframe = data.vframe;
          vframe.unmountView();
          assert.ok(S.isObject(vframe.view.owner), 'ok');
          assert.ok(!vframe.view.owner.id, 'ok');
        });
      });
      QUnit.test('vframe.defineProperties', assert => {
        Vframe.prototype.mountZoneVframes = 1
        Vframe.prototype.unmountZoneVframes = 1
        assert.ok(Vframe.prototype.mountZoneVframes != 1, 'mountZoneVframes方法不能被重写');
        assert.ok(Vframe.prototype.unmountZoneVframes != 1, 'unmountZoneVframes方法不能被重写');
      });
    }
  }
  Test.Vframe = Vframe;
})(window, window.KISSY, window.QUnit, window.Test || (window.Test = {}), '');