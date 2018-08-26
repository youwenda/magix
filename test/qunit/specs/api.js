/**
 * @description https://lark.alipay.com/jintai.yzq/subway/magix1to3
 */
(function(win, S, QUnit, Test, EMPTY) {
  function Api(Magix) {
    QUnit.module(' Api ');
    // const isMagix1 = win.Magix || S.Env.mods['magix/magix'];
    // const isMagix3 = !Magix.version && S.Env.mods['magix'];
    // const isMagix3Shim = Magix.version && S.Env.mods['magix'];

    const isMagix1 = magixVersion  === '1'
    const isMagix3 = magixVersion  === '3'
    const isMagix3Shim = Magix.version && S.Env.mods['magix'];
    
    QUnit.test('isArray, isFunction, isObject, isRegExp, isString, isNumber', assert => {
      if (isMagix1 || isMagix3Shim) {
        S.each('isArray, isFunction, isObject, isRegExp, isString, isNumber'.split(','), fnName => {
          fnName = S.trim(fnName);
          assert.deepEqual( Magix[fnName], S[fnName] );
        });
      } 
      if (isMagix3) {
        S.each('isArray, isFunction, isObject, isRegExp, isString, isNumber'.split(','), fnName => {
          fnName = S.trim(fnName);
          assert.deepEqual( Magix[fnName], undefined );
        });
      }
    });

    QUnit.test('isNumeric', assert => {
      if (isMagix1 || isMagix3Shim) {
        assert.ok( Magix.isNumeric, 'magix 1含有isNumeric方法' );
        assert.ok( Magix.isNumeric('1') );
        assert.ok( Magix.isNumeric('1e6') );
        assert.notOk( Magix.isNumeric('abcdefg') );
      } else {
        assert.notOk( Magix.isNumeric  )
      }
    });

    QUnit.test('pathToObject(路径字符串转换为对象)', assert => {
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
        assert.deepEqual( fn(path),  ret);
      });

      if (isMagix3 || isMagix1) {
        conflicts.forEach(([path, mx3, mx1]) => {
          assert.deepEqual( fn(path), isMagix3 ? mx3 : mx1 );
        });
      }

    });

    QUnit.test('noop', assert => {
      if (isMagix1 || isMagix3Shim) {
        assert.ok( Magix.noop, 'magix1存在Magix.noop方法' );
        const noop = function () {};
        assert.deepEqual( Magix.noop(), noop() );
      } else {
        assert.notOk( Magix.noop, 'magix3不存在Magix.noop方法' );
      }
    });

    QUnit.test('local', assert => {
      if (isMagix1 || isMagix3Shim) {
        assert.ok( Magix.local, 'magix1存在Magix.local方法' );
        Magix.local({
          userId: '59067'
        });
        Magix.local('userName', 'jintai.yzq');

        assert.deepEqual( Magix.local('userId'), '59067' );
        assert.deepEqual( Magix.local(), { userId: '59067', userName: 'jintai.yzq' } );

      } else {
        assert.notOk( Magix.local, 'magix3不存在Magix.local方法' );
      }
    });

    QUnit.test('cache', assert => {
      let cache;
      if (isMagix1 || isMagix3Shim) {
        cache = Magix.cache();
      } else {
        cache = new Magix.Cache();
      }
      assert.ok( cache );
      assert.ok( cache.get );
      assert.ok( cache.set );
      assert.ok( cache.del );
      assert.ok( cache.has );
    });

    QUnit.test('safeExec', assert => {
      if (isMagix1 || isMagix3Shim) {
        assert.ok( Magix.safeExec );
      } else {
        assert.notOk( Magix.safeExec );
      }
    });

    QUnit.test('listToMap', assert => {
      const fn = Magix.listToMap || Magix.toMap;
      const cases = [
        [[[1,2,3,4,5,6]], {1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1}],
        [[[{id:20},{id:30},{id:40}],'id'], {20:{id:20},30:{id:30},40:{id:40}} ]
      ];
      
      const conflicts = [
        [['submit,focusin,focusout,mouseenter,mouseleave,mousewheel,change'], {submit:1,focusin:1,focusout:1,mouseenter:1,mouseleave:1,mousewheel:1,change:1}]
      ];

      cases.forEach(( [args, ret] ) => {
        assert.deepEqual( fn.apply(Magix, args), ret );
      });

      if (isMagix1 || isMagix3Shim) {
        conflicts.forEach(( [args, ret] ) => {
          assert.deepEqual( fn.apply(Magix, args), ret );
        });
      }

    });

  }
  Test.Api = Api;
})(window, window.KISSY, window.QUnit, window.Test || (window.Test = {}), '');