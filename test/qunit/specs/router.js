/**
 * @description https://lark.alipay.com/jintai.yzq/subway/magix1to3
 */
(function(win, S, QUnit, Test, EMPTY) {
  const $ = S.all;
  function Router(Magix, Router) {
    QUnit.module(' Router ');
    
    QUnit.test('router.parse', assert => {
      let parse;
      let result;
      const hrefList = [
        {
          href: 'https://a.b.c.com/?p0=000#!/d/e?p1=111&p2=aaa',
          res: [{
            pathnameDiff: {},
            paramDiff: {},
            hashOwn: {},
            queryOwn: {},
            get: {},
            href: 'https://a.b.c.com/?p0=000#!/d/e?p1=111&p2=aaa',
            srcQuery: 'https://a.b.c.com/?p0=000',
            srcHash: '/d/e?p1=111&p2=aaa',
            query: {
              pathname: '/',
              params: {
                p0: '000'
              }
            },
            hash: {
              pathname: '/d/e',
              params: {
                p1: '111',
                p2: 'aaa'
              }
            },
            params: {
              p0: '000',
              p1: '111',
              p2: 'aaa'
            }
          }, {
            get: {},
            href: 'https://a.b.c.com/?p0=000#!/d/e?p1=111&p2=aaa',
            srcQuery: '/?p0=000',
            srcHash: '/d/e?p1=111&p2=aaa',
            query: {
              pathname: '/',
              path: '/',
              params: {
                p0: '000'
              }
            },
            hash: {
              pathname: '/d/e',
              path: '/d/e',
              params: {
                p1: '111',
                p2: 'aaa'
              }
            },
            params: {
              p0: '000',
              p1: '111',
              p2: 'aaa'
            }
          }, {
            get: {},
            href: 'https://a.b.c.com/?p0=000#!/d/e?p1=111&p2=aaa',
            srcQuery: '/?p0=000',
            srcHash: '/d/e?p1=111&p2=aaa',
            query: {
              path: '/',
              params: {
                p0: '000'
              }
            },
            hash: {
              path: '/d/e',
              params: {
                p1: '111',
                p2: 'aaa'
              }
            },
            params: {
              p0: '000',
              p1: '111',
              p2: 'aaa'
            }
          }]
        }
      ]
      hrefList.forEach( h => {
        if (isMagix1) {
          result = Router.parseQH(h.href);
          assert.propEqual(result, h.res[0]);
        } else if (isMagix3Shim) {
          result = Router.parse(h.href);
          assert.propEqual(result, h.res[1]);
        } else {
          result = Router.parse(h.href);
          assert.propEqual(result, h.res[2]);
        }
      });
    });

    QUnit.test('router.un', assert => {
      if (isMagix1 || isMagix3Shim) {
        assert.ok( Router.un , '存在Router.un');
      } else {
        assert.notOk( Router.un , '不存在Router.un');
        assert.ok( Router.off , '存在Router.off');
      }
    });
    QUnit.test('router.navigate', assert => {
      if (isMagix1 || isMagix3Shim) {
        assert.ok( Router.navigate , '存在Router.navigate');
      } else {
        assert.notOk( Router.navigate , '不存在Router.navigate');
        assert.ok( Router.to , '存在Router.to');
      }
    });
    QUnit.test('router.change', assert => {
      const list = [{
        target: '/list?page=2&rows=20',
        res: {
          get: {}, 
          href: "http://localhost:3001/test/qunit/specs/shim@1.0.html#!/list?page=2&rows=20", 
          srcQuery: "/test/qunit/specs/shim@1.0.html", 
          srcHash: "/list?page=2&rows=20", 
          params: {
            page: "2",
            rows: "20"
          },
          query: {
            params: {},
            path: "/test/qunit/specs/shim@1.0.html",
            pathname: "/test/qunit/specs/shim@1.0.html"
          },
          hash: {
            params: {page: "2", rows: "20"},
            path: "/list",
            pathname: "/list"
          }
        }
      }, {
        target: 'page=3&rows=40',
        res: {
          get: {}, 
          href: "http://localhost:3001/test/qunit/specs/shim@1.0.html#!/list?page=3&rows=40", 
          srcQuery: "/test/qunit/specs/shim@1.0.html", 
          srcHash: "/list?page=3&rows=40", 
          params: {
            page: "3",
            rows: "40"
          },
          query: {
            params: {},
            path: "/test/qunit/specs/shim@1.0.html",
            pathname: "/test/qunit/specs/shim@1.0.html"
          },
          hash: {
            params: {page: "3", rows: "40"},
            path: "/list",
            pathname: "/list"
          }
        }
      }, {
        target: {
          page: 8,
          row: 4
        },
        res: {
          get: {}, 
          href: "http://localhost:3001/test/qunit/specs/shim@1.0.html#!/list?page=8&rows=4", 
          srcQuery: "/test/qunit/specs/shim@1.0.html", 
          srcHash: "/list?page=8&rows=4", 
          params: {
            page: "8",
            rows: "4"
          },
          query: {
            params: {},
            path: "/test/qunit/specs/shim@1.0.html",
            pathname: "/test/qunit/specs/shim@1.0.html"
          },
          hash: {
            params: {page: "8", rows: "4"},
            path: "/list",
            pathname: "/list"
          }
        }
      }];
      if (isMagix3Shim) {
        list.forEach( item => {
          Router.navigate(item.target);
          const locaiton = Magix.View.prototype.location;
          const exp = item.res;
          assert.propEqual(Magix.View.prototype.location, item.res);
        });
      }
      if (isMagix3) {
      }
    });
  }
  Test.Router = Router;
})(window, window.KISSY, window.QUnit, window.Test || (window.Test = {}), '');