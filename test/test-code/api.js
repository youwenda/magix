/**
 * @description https://lark.alipay.com/jintai.yzq/subway/magix1to3
 */
(function(win, S, Test, EMPTY) {
  function Api() {
    const expect = chai.expect;

    describe('Api', () => {
      // 兼容层API测试
      it('isArray, isFunction, isObject, isRegExp, isString, isNumber', () => {
        if (isMagix1 || isMagix3Shim) {
          S.each('isArray, isFunction, isObject, isRegExp, isString, isNumber'.split(','), fnName => {
            fnName = S.trim(fnName);
            expect(Magix[fnName]).to.be.equal(S[fnName]);
          });
        } 
        if (isMagix3) {
          S.each('isArray, isFunction, isObject, isRegExp, isString, isNumber'.split(','), fnName => {
            fnName = S.trim(fnName);
            expect(Magix[fnName]).not.to.be.ok;
          });
        }
      });

      it('isNumeric', () => {
        if (isMagix1 || isMagix3Shim) {
          expect(Magix.isNumeric).to.be.ok;
          expect(Magix.isNumeric('1')).to.be.ok;
          expect(Magix.isNumeric('1e6')).to.be.ok;
          expect(Magix.isNumeric('abcdefg')).not.to.be.ok;
        } else {
          expect(Magix.isNumeric).not.to.be.ok;
        }
      });

      it('pathToObject(路径字符串转换为对象)', () => {
        const fn = Magix.pathToObject || Magix.parseUrl;
        const uris = [
          ['/xxx/a.b.c.html?a=b&c=d', {
            path: '/xxx/a.b.c.html',
            params: {
              a: 'b',
              c: 'd'
            }
          }],
          ['/xxx/?a=b&c=d', {
            path: '/xxx/',
            params: {
              a: 'b',
              c: 'd'
            }
          }],
          ['/xxx/#?a=b', {
            path: '/xxx/',
            params: {
              a: 'b'
            }
          }],
          ['/xxx/index.html#', {
            path: '/xxx/index.html',
            params: {}
          }],
          ['/xxx/index.html', {
            path: '/xxx/index.html',
            params: {}
          }],
          ['/xxx/#', {
            path: '/xxx/',
            params: {}
          }],
          ['a=b&c=d', {
            path: '',
            params: {
              a: 'b',
              c: 'd'
            }
          }], 
          ['/s?src=b#', {
            path: '/s',
            params: {
              src: 'b'
            }
          }],
          ['ab?a&b', {
            path: 'ab',
            params: {
              a: '',
              b: ''
            }
          }],
          ['a=b&c', {
            path: '',
            params: {
              a: 'b',
              c: ''
            }
          }],
          ['ab=', {
            path: '',
            params: {
              ab: ''
            }
          }]
        ];

        const conflicts = [
          // Magix 1, 3解析不一致
          ['a=YT3O0sPH1No=', {
            path: '',
            params: {
              a: 'YT3O0sPH1No='
            }
          }, {
            pathname: '',
            params: {
              a: 'YT3O0sPH1No'
            }
          }],
          // Magix 1, 3解析不一致
          ['a=YT3O0sPH1No===&b=c', {
            path: '',
            params: {
              a: 'YT3O0sPH1No===',
              b: 'c'
            }
          }, {
            pathname: '',
            params: {
              a: 'YT3O0sPH1No',
              b: 'c'
            }
          }],
          // Magix 1, 3 解析不一致
          ['=abc', {
            path: '=abc',
            params: {}
          }, {
            pathname: '',
            params: {
              abc: ''
            }
          }],
          ['a&b', {
            path: '',
            params: {
              a: '',
              b: ''
            }
          }, {
            pathname: 'a&b',
            params: {}
          }]
        ];

        uris.forEach(([path, ret]) => {
          if (isMagix1) {
            ret = {
              ...ret,
              pathname: ret.path
            };
            delete ret.path;
          } else if (isMagix3Shim) {
            ret.pathname = ret.path;
          }

          expect(fn(path)).to.be.deep.equal(ret);
        });

        if (isMagix3 || isMagix1) {
          conflicts.forEach(([path, mx3, mx1]) => {
            expect(fn(path)).to.be.deep.equal(isMagix3 ? mx3 : mx1);
          });
        }
      });

      it('noop', () => {
        if (isMagix1 || isMagix3Shim) {
          expect(Magix.noop).to.be.ok;
          const noop = function () {};
          expect(Magix.noop()).to.be.deep.equal(noop());
        } else {
          expect(Magix.noop).not.to.be.ok;
        }
      });
  
      it('local', () => {
        if (isMagix1 || isMagix3Shim) {
          expect(Magix.local).to.be.ok;
  
          Magix.local({
            userId: '59067'
          });
  
          Magix.local('userName', 'jintai.yzq');
          expect(Magix.local('userId')).to.be.equal('59067');
          expect(Magix.local()).to.be.deep.equal({ userId: '59067', userName: 'jintai.yzq' });
        } else {
          expect(Magix.local).not.to.be.ok;
        }
      });
  
      it('cache', () => {
        let cache;
  
        if (isMagix1 || isMagix3Shim) {
          cache = Magix.cache();
        } else {
          cache = new Magix.Cache();
        }
  
        expect(cache).to.be.ok;
        expect(cache.get).to.be.ok;
        expect(cache.set).to.be.ok;
        expect(cache.del).to.be.ok;
        expect(cache.has).to.be.ok;
      });
  
      it('safeExec', () => {
        if (isMagix1 || isMagix3Shim) {
          expect(Magix.safeExec).to.be.ok;
        } else {
          expect(Magix.safeExec).not.to.be.ok;
        }
      });
  
      it('listToMap', () => {
        const fn = Magix.listToMap || Magix.toMap;
        const cases = [
          [[[1,2,3,4,5,6]], {1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1}],
          [[[{id:20},{id:30},{id:40}],'id'], {20:{id:20},30:{id:30},40:{id:40}} ]
        ];
        
        const conflicts = [
          [['submit,focusin,focusout,mouseenter,mouseleave,mousewheel,change'], {submit:1,focusin:1,focusout:1,mouseenter:1,mouseleave:1,mousewheel:1,change:1}]
        ];
  
        cases.forEach(( [args, ret] ) => {
          expect(fn.apply(Magix, args)).to.be.deep.equal(ret);
        });
  
        if (isMagix1 || isMagix3Shim) {
          conflicts.forEach(( [args, ret] ) => {
            expect(fn.apply(Magix, args)).to.be.deep.equal(ret);
          });
        }
      });

      // magix3 API测试
      if (isMagix3) {
        it('boot', done => {
      
          //先验证magix config的逻辑
          const config = Magix.config();
      
          expect(config).to.include({
            rootId: 'J_app_main',
            defaultView: 'app/view/default',//默认加载的view
            defaultPath: '/home',
            unmatchView: 'app/view/error'
          });
      
          expect(config.exts).to.have.members(['app/extview']);
          expect(config.error('404')).to.equal('error msg: 404');
          expect(config.routes).to.include({ "/home": "app/view/default" });
      
          //Vframe加载完成
          const vf = addFrameData.vframe;
      
          //app/views/default加载完成，Router绑定changed事件成功，验证 extview 里的逻辑，ini 加载成功
          expect(Magix.View.prototype.setViewPagelet).to.be.a('function');
    
          //验证 rootId配置
          expect(vf.id).to.equal('J_app_main');
  
          //验证dom
          expect(document.querySelector('#loc-param')).to.have.text('loc');
          expect(document.querySelector('#state-param')).to.have.text('state');
  
          //验证 State 监听 changed 事件， Vframe_NotifyChange 方法的执行
          window.location.hash += '&loc-param=1';

          vf.on('canTest', () => {
            //验证 View_IsObserveChanged
            expect(document.querySelector('#loc-param')).to.have.text('1');
            
            Magix.State.digest({
              'state-param': '2'
            });
    
            //验证 State_IsObserveChanged
            expect(document.querySelector('#state-param')).to.have.text('2');
    
            done();
          })
        });

        it('config', done => {
          expect(Magix.config).to.be.a('function');
      
          let error;
      
          Magix.config({
            rootId: 'J_app_main',
            defaultView: 'app/view/default',//默认加载的view
            defaultPath: '/home',
            unmatchView: 'app/view/error',
            exts: ['app/extview'],
            error(e) {
              error = 'error msg: ' + e;
            },
            routes: {
              "/home": "app/view/default"
            }
          });
      
          const config = Magix.config();
      
          config.error('404');
      
          expect(config).to.include({
            rootId: 'J_app_main',
            defaultView: 'app/view/default',//默认加载的view
            defaultPath: '/home',
            unmatchView: 'app/view/error'
          });
      
          expect(config.exts).to.have.members(['app/extview']);
          expect(error).to.equal('error msg: 404');
          expect(config.routes).to.include({ "/home": "app/view/default" });
      
          done();
        });
      }
    });
  }
  Test.Api = Api;
})(window, window.KISSY, window.Test || (window.Test = {}), '');