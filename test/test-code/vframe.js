/**
 * @description https://lark.alipay.com/jintai.yzq/subway/magix1to3
 */
(function (win, S, Test, EMPTY) {
  const $ = S.all;
  const expect = chai.expect;

  function Vframe() {
    describe('Vframe', () => {
      if (isMagix3Shim) {
        it('vframe.mountView', () => {
          const Vframe = Magix.Vframe;
          const vframe = win.addFrameData.vframe;

          const proto = vframe.view.__proto__;

          expect(vframe.view instanceof Magix.View).to.be.ok;
          expect(S.isFunction(proto.tmpl)).to.be.ok;
          expect(vframe.view['sign']).to.be.equal(vframe.view.$s);
          // View_prepare
          expect(S.isFunction(proto['a<click>'])).to.be.ok; // 存在a方法
          expect(proto['a<click>']()).to.be.equal('a0'); // 自身的a方法
          expect(S.isFunction(proto['b<click>'])).to.be.ok; // 存在b方法
          expect(proto['b<click>']()).to.be.equal('b1'); // 一级父view的b方法
          expect(S.isFunction(proto['c<click>'])).to.be.ok; // 存在c方法
          expect(proto['c<click>']()).to.be.equal('c1'); // 一级父view的c方法
          expect(S.isFunction(proto['d<click>'])).to.be.ok; // 存在d方法
          expect(proto['d<click>']()).to.be.equal('d2'); // 二级父view的d方法
          // View_Ctors
          expect(vframe.view.path).to.be.equal(vframe.$j); // view有path属性，与vframe$j相等
          expect(vframe.view.sign).to.be.equal(vframe.view.$s); // view有sign属性，与$s相等
          vframe.view.sign = '?';
          expect(vframe.view.sign).to.be.not.equal('?'); // view的sign参数不能被重写
          // mountZone
          expect(Object.keys(Vframe.all())).to.be.deep.equal(['J_app_main', 'mx_64', 'mx_65']);
          expect(vframe.$d).to.be.equal(0);
        });

        it('vframe.event', function(done) {
          this.timeout(10000);

          const vframe = Magix.Vframe.get('mx_65');
          const testEvent = () => {
            if (vframe.$v) {
              expect(vframe.num).to.be.equal(undefined);
              S.one('input.btn').fire('click');
              expect(vframe.num).to.be.equal(2);
              done();
            } else {
              setTimeout(testEvent, 25);
            }
          };

          testEvent();
        });

        it('vframe.setHTML', function(done) {
          this.timeout(10000);
          const vframe = Magix.Vframe.get('mx_65');

          vframe.on('content2html', () => {
            expect(S.one('#mx_65').html()).to.be.equal('<p>1111</p>');
            done();
          });
        })

        it('vframe.postMessageTo', function(done) {
          this.timeout(10000);
          const vframe1 = Magix.Vframe.get('mx_64');
          const vframe2 = Magix.Vframe.get('mx_65');

          vframe2.on('content2postmessage', () => {
            expect(vframe1.receive).to.be.equal(1);
            done();
          });
        });

        it('View.prototype', () => {
          const view = win.addFrameData.vframe.view;

          expect(view.vom).to.be.deep.equal(Magix.Vframe); // 存在vom
          expect(view.location.get('row')).to.be.equal('4');
          expect(view.$('#J_app_main')).to.be.deep.equal(Magix.node('#J_app_main'));
          expect(view.parentView).to.be.ok;
          expect(view.notifyUpdate()).to.be.equal(view.$s);
          expect(view.wrapEvent).to.be.ok;
          expect(view.wrapMxEvent(1)).to.be.equal('1');

          view.manage('dialog', {id: 1});

          expect(view.$r.dialog).to.be.ok; // dialog被托管
          expect(view.getManaged('dialog')).to.be.deep.equal({id: 1}); // getManaged ok

          view.removeManaged('dialog');

          expect(view.$r.dialog).not.to.be.ok; // removeManaged ok
        });

        it('vframe.unmountView', () => {
          const vframe = win.addFrameData.vframe;
          const view = vframe.view;
          vframe.unmountView();

          expect(S.isObject(view.owner)).to.be.ok;
          expect(view.owner.id).not.to.be.ok;
        });

        it('vframe.defineProperties', () => {
          const Vframe = Magix.Vframe;

          Vframe.prototype.mountZoneVframes = 1
          Vframe.prototype.unmountZoneVframes = 1

          console.log(Object.getOwnPropertyDescriptor(Vframe.prototype, 'mountZoneVframes'));

          expect(Vframe.prototype.mountZoneVframes).not.equal(1); // mountZoneVframes方法不能被重写
          expect(Vframe.prototype.unmountZoneVframes).not.equal(1); // unmountZoneVframes方法不能被重写
        });
      }
    });
  }
  Test.Vframe = Vframe;
})(window, window.KISSY, window.Test || (window.Test = {}), '');