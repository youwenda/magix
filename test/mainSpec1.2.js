 describe('Magix', function() {
     var Magix;
     before(function(done) {
         KISSY.use('magix/magix', function(S, M) {
             Magix = M;
             done();
         });
     });
     it('Magix.mix', function() {
         expect(Magix.mix({
             a: 1
         }, {
             b: 2
         })).to.eql({
             a: 1,
             b: 2
         });

         expect(Magix.mix({
             a: 1,
             b: 2
         }, {
             a: 2
         })).to.eql({
             a: 2,
             b: 2
         });

         expect(Magix.mix({
             a: 1,
             b: 2
         }, {
             a: 2,
             b: 3,
             c: 4
         }, {
             a: 1
         })).to.eql({
             a: 1,
             b: 3,
             c: 4
         });

         expect(Magix.mix({
             a: 1,
             b: 2
         }, {
             a: 2,
             b: 3,
             c: 4
         }, {
             a: 1,
             c: 1
         })).to.eql({
             a: 1,
             b: 3
         });
     });
     it('Magix.has', function() {
         var T = function() {
             this.a = 1;
         };
         T.prototype.b = 2;
         var t = new T();

         expect(Magix.has(t, 'a')).to.be(true);
         expect(Magix.has(t, 'b')).to.be(false);
     });

     it('Magix.config', function() {
         Magix.config('a', 'b');
         expect(Magix.config('a')).to.be('b');
         expect(Magix.config('tagName')).to.be('vframe');
     });

     it('Magix.keys', function() {
         expect(Magix.keys({
             a: 1,
             b: 1,
             c: 3
         })).to.eql(['a', 'b', 'c']);

         expect(Magix.keys(['a', 'b'])).to.eql([0, 1]);
     });

     it('Magix.local', function() {
         Magix.local('a', 'b');
         expect(Magix.local('a')).to.be('b');
         expect(Magix.local()).to.eql({
             a: 'b'
         });

         Magix.local('a', 'c');
         expect(Magix.local('a')).to.be('c');
         expect(Magix.local()).to.eql({
             a: 'c'
         });

         Magix.local('b', 2);
         expect(Magix.local()).to.eql({
             a: 'c',
             b: 2
         });
     });

     it('Magix.path', function() {
         expect(Magix.path('http://www.etao.com/list/page/2/rows/3', '../')).to.eql('http://www.etao.com/list/page/2/');
         expect(Magix.path('http://www.etao.com/list/page/2/rows/3/', '../')).to.eql('http://www.etao.com/list/page/2/rows/');

         expect(Magix.path('http://www.etao.com/', '../../../')).to.eql('http://www.etao.com/');
         expect(Magix.path('http://www.etao.com/list/page/2/rows/3', '../../')).to.eql('http://www.etao.com/list/page/');

         expect(Magix.path('http://www.etao.com/list/page/2/rows/3.html?a=b&c=d', '../../')).to.eql('http://www.etao.com/list/page/');

         expect(Magix.path('http://www.etao.com/list/page/2/rows/3.html?a=b&c=d', '.')).to.eql('http://www.etao.com/list/page/2/rows/');
         expect(Magix.path('http://www.etao.com/list/page/2/rows/3.html?a=b&c=d', '..')).to.eql('http://www.etao.com/list/page/2/');

         expect(Magix.path('http://www.etao.com/list/page/2/rows/3.html?a=b&c=d', '...')).to.eql('http://www.etao.com/list/page/2/rows/...');
     });

     it('Magix.toObject', function() {
         expect(Magix.toObject('/xxx/a.b.c.html?a=b&c=d&e=2')).to.eql({
             path: '/xxx/a.b.c.html',
             params: {
                 a: 'b',
                 c: 'd',
                 e: '2'
             }
         });

         expect(Magix.toObject('/xxx/a.b.c.html?a=%E6%88%91%E4%BB%AC&c=d&e=2')).to.eql({
             path: '/xxx/a.b.c.html',
             params: {
                 a: '我们',
                 c: 'd',
                 e: '2'
             }
         });

         expect(Magix.toObject('a=%E6%88%91%E4%BB%AC&c=d&e=2')).to.eql({
             path: '',
             params: {
                 a: '我们',
                 c: 'd',
                 e: '2'
             }
         });
     });

     it('Magix.toUrl', function() {
         expect(Magix.toUrl('/xxx/a.b.c.html', {
             a: 'b',
             c: 'd',
             e: '2'
         })).to.eql('/xxx/a.b.c.html?a=b&c=d&e=2');


         expect(Magix.toUrl('/xxx/a.b.c.html', {
             a: '我们',
             c: 'd',
             e: '2'
         })).to.eql('/xxx/a.b.c.html?a=%E6%88%91%E4%BB%AC&c=d&e=2');

         expect(Magix.toUrl('/xxx/a.b.c.html', {
             a: '',
             c: '',
             e: '',
             f: ''
         }, {
             a: 1,
             c: 1
         })).to.eql('/xxx/a.b.c.html?a=&c=');

         expect(Magix.toUrl('/xxx/a.b.c.html', {
             a: '我们',
             c: 'd',
             e: '',
             f: ''
         }, {})).to.eql('/xxx/a.b.c.html?a=%E6%88%91%E4%BB%AC&c=d');
     });

     it('Magix.toMap', function() {
         expect(Magix.toMap('a,b,c,d,e,f,g'.split(','))).to.eql({
             a: 1,
             b: 1,
             c: 1,
             d: 1,
             e: 1,
             f: 1,
             g: 1
         });

         expect(Magix.toMap('a,b,c,d,e,f,g'.split(','), null, true)).to.eql({
             a: true,
             b: true,
             c: true,
             d: true,
             e: true,
             f: true,
             g: true
         });

         expect(Magix.toMap([{
             id: 1,
             data: {}
         }, {
             id: 2,
             data: {
                 a: 2
             }
         }], 'id')).to.eql({
             1: {
                 id: 1,
                 data: {}
             },
             2: {
                 id: 2,
                 data: {
                     a: 2
                 }
             }
         });
     });

     it('Magix.cache', function() {
         var cache = Magix.cache(30, 2);
         expect(cache.x).to.be(32);
         expect(cache.b).to.be(2);
         var f = {
             a: 2
         };
         cache.set('a', f);
         cache.get('a');
         cache.get('a');
         expect(cache.c[0].f).to.be(3);

         expect( !! cache.has('a')).to.be(true);

         expect( !! cache.has('b')).to.be(false);

         cache.del('a');

         expect( !! cache.has('a')).to.be(false);
     });
 });

 describe('Router', function() {
     this.timeout(5000);
     var Router;
     before(function(done) {
         KISSY.use('magix/router', function(S, R) {
             Router = R;
             done();
         });
     });
     it('Router.parse', function() {
         expect(Router.parse('/a?a=2#!/b?c=3').params).to.eql({
             a: '2',
             c: '3'
         });

         expect(Router.parse('/a?a=2#!/b?a=3').params).to.eql({
             a: '3'
         });
     });
 });

 describe('Event', function() {
     this.timeout(5000);
     var Event;
     before(function(done) {
         KISSY.use('magix/event,magix/magix', function(S, E, Magix) {
             Event = Magix.mix({}, E);
             done();
         });
     });
     it('Event.on', function(done) {
         Event.on('test', function(e) {
             expect(e.type).to.be('test');
             expect(e.a).to.be(undefined);
             done();
         });
         Event.fire('test');
     });

     it('Event.off', function() {
         Event.fire('test');
         Event.off('test');
         Event.fire('test');
     });

     it('Event.once', function(done) {
         Event.once('test', function(e) {
             expect(e.type).to.be('test');
             expect(e.data).to.be('ok');
             done();
         });
         Event.fire('test', {
             data: 'ok'
         });
         Event.fire('test', {
             data: 'bad'
         });
     });
 });

 describe('Model&Manager', function() {
     this.timeout(10000);
     var Model, Manager, TestModel, TestManager;
     before(function(done) {
         KISSY.use('magix/model,magix/mmanager', function(S, M, MM) {
             Model = M;
             Manager = MM;
             done();
         });
     });

     it('Model.params', function(done) {
         TestModel = Model.extend({

         });
         var tm = new TestModel();
         tm.setUrlParams('a', 'b');
         tm.setUrlParams({
             c: 'd',
             e: 'f'
         });
         expect(tm.getUrlParams()).to.be('a=b&c=d&e=f');
         tm.setUrlParams('a', '我');
         expect(tm.getUrlParams()).to.be('a=%E6%88%91&c=d&e=f');
         tm.setUrlParams('c', 20, true);
         expect(tm.getUrlParams()).to.be('a=%E6%88%91&c=d&e=f');
         tm.setUrlParams('g', 30, true);
         expect(tm.getUrlParams()).to.be('a=%E6%88%91&c=d&e=f&g=30');
         tm.setUrlParams('x=y');
         expect(tm.getUrlParams()).to.be('a=%E6%88%91&c=d&e=f&g=30&x=y');
         tm.setUrlParams('z=');
         expect(tm.getUrlParams()).to.be('a=%E6%88%91&c=d&e=f&g=30&x=y&z=');
         tm.setUrlParams('xx=&yy=我');
         expect(tm.getUrlParams()).to.be('a=%E6%88%91&c=d&e=f&g=30&x=y&z=&xx=&yy=我');

         tm.setPostParams('a', 'b');
         tm.setPostParams({
             c: 'd',
             e: 'f'
         });
         expect(tm.getPostParams()).to.be('a=b&c=d&e=f');
         tm.setPostParams('a', '我');
         expect(tm.getPostParams()).to.be('a=%E6%88%91&c=d&e=f');
         tm.setPostParams('c', 20, true);
         expect(tm.getPostParams()).to.be('a=%E6%88%91&c=d&e=f');
         tm.setPostParams('g', 30, true);
         expect(tm.getPostParams()).to.be('a=%E6%88%91&c=d&e=f&g=30');

         done();
     });

     it('Model.request', function(done) {
         TestModel = Model.extend({
             sync: function(callback) {
                 callback(null, {
                     data: 'ok'
                 });
             }
         });
         var tm = new TestModel();
         tm.request(function(err, options) {
             expect(err).to.be(null);
             expect(options).to.eql({
                 type: 'test'
             });
             var data = tm.get('data', '');
             expect(data).to.eql('ok');
             var bad = tm.get('data.count', 20);
             expect(bad).to.eql(20);
             done();
         }, {
             type: 'test'
         });
     });


     it('Model.destroy', function(done) {
         TestModel = Model.extend({
             sync: function(callback) {
                 var me = this;
                 var timeout = me.get('timeout') | 0 || 2;
                 var data = me.get('data') || 'ok';
                 setTimeout(function() {
                     callback(null, {
                         data: data
                     });
                 }, timeout * 1000);
             }
         });
         var tm = new TestModel();
         tm.request(function(err, options) {
             expect(err).to.be('abort');
             expect(options).to.eql({
                 type: 'test'
             });
             var data = tm.get('data', '');
             expect(data).to.eql('');
             var bad = tm.get('data.count', 20);
             expect(bad).to.eql(20);
             done();
         }, {
             type: 'test'
         });
         tm.destroy();
     });

     it('Manager.create', function(done) {
         TestManager = Manager.create(TestModel, 'serKey1,serKey2');
         TestManager.registerModels([{
             name: 'A',
             data: 'fromA',
             timeout: 5
         }, {
             name: 'B',
             data: 'fromB',
             cache: true,
             timeout: 1
         }, {
             name: 'C',
             data: 'fromC',
             timeout: 4
         }]);
         expect(TestManager.$sKeys).to.eql(['serKey1', 'serKey2', 'postParams', 'urlParams']);
         done();
     });

     it('Manager.fetchAll', function(done) {
         TestManager.createMRequest({
             manage: function(mr) { //模拟view
                 //console.log(arguments);
                 return mr;
             }
         }).fetchAll(['A', 'B'], function(e, am, bm) {
             expect(am.get('data')).to.be('fromA');
             expect(bm.get('data')).to.be('fromB');
             done();
         });
     });

     it('Manager.fetchOne', function(done) {
         var counter = 0;
         var map = {
             0: 'fromB',
             1: 'fromC',
             2: 'fromA'
         };
         var time = KISSY.now();
         TestManager.createMRequest({
             manage: function(mr) { //模拟view
                 //console.log(arguments);
                 return mr;
             }
         }).fetchOne(['A', 'B', 'C'], function(e, m) {
             //console.log(e, m, KISSY.now() - time);
             expect(m.get('data')).to.be(map[counter]);
             counter++;
             console.log(m, counter, m.get('data'));
             if (counter > 2) {
                 done();
             }
         });
     });

     it('Manager.fetchOrder', function(done) {
         var counter = 0;
         var map = {
             0: 'fromA',
             1: 'fromB',
             2: 'fromC'
         };
         var time = KISSY.now();
         TestManager.createMRequest({
             manage: function(mr) { //模拟view
                 //console.log(arguments);
                 return mr;
             }
         }).fetchOrder(['A', 'B', 'C'], function(e, m) {
             //console.log(e, m, KISSY.now() - time);
             expect(m.get('data')).to.be(map[counter]);
             counter++;
             console.log(m, counter, m.get('data'));
             if (counter > 2) {
                 done();
             }
         });
     });

     it('Manager.cache', function(done) {
         TestManager.createMRequest({
             manage: function(mr) { //模拟view
                 //console.log(arguments);
                 return mr;
             }
         }).fetchOne('B', function(e, m) {
             expect(m.fromCache).to.be(true);
             done();
         });
     });

     it('Manager.next', function(done) {
         var r = TestManager.createMRequest({
             manage: function(mr) { //模拟view
                 //console.log(arguments);
                 return mr;
             }
         }).fetchOne('B', function(e, m) {
             return 'returned from b';
         });
         r.next(function(e, args) {
             expect(args).to.be('returned from b');
             expect(e).to.be(null);
             r.doNext([{
                 msg: 'some error'
             }, 'next args']);
         });
         r.next(function(e, args) {
             expect(e).to.eql({
                 msg: 'some error'
             });
             expect(args).to.be('next args');
             return {
                 data: 'from next'
             };
         });
         r.next(function(e, args) {
             expect(e).to.be(null);
             expect(args).to.eql({
                 data: 'from next'
             });
         });
         r.next(function(e, args) {
             expect(e).to.be(null);
             expect(args).to.eql({
                 data: 'from next'
             });
             done();
         });
     });
 });