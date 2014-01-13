 describe('Magix', function() {
     var Magix;
     before(function(done) {
         KISSY.use('magix/magix', function(S, M) {
             Magix = M;
             done();
         });
     });
     it('Magix.isNumeric', function() {
         expect(Magix.isNumeric(NaN)).to.be(false);
         expect(Magix.isNumeric('1.0')).to.be(true);
         expect(Magix.isNumeric(1.0)).to.be(true);
         expect(Magix.isNumeric('1a')).to.be(false);
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
     });

     it('Magix.pathToObject', function() {
         expect(Magix.pathToObject('/xxx/a.b.c.html?a=b&c=d&e=2')).to.eql({
             pathname: '/xxx/a.b.c.html',
             params: {
                 a: 'b',
                 c: 'd',
                 e: '2'
             }
         });

         expect(Magix.pathToObject('/xxx/a.b.c.html?a=%E6%88%91%E4%BB%AC&c=d&e=2')).to.eql({
             pathname: '/xxx/a.b.c.html',
             params: {
                 a: '%E6%88%91%E4%BB%AC',
                 c: 'd',
                 e: '2'
             }
         });

         expect(Magix.pathToObject('/xxx/a.b.c.html?a=%E6%88%91%E4%BB%AC&c=d&e=2', true)).to.eql({
             pathname: '/xxx/a.b.c.html',
             params: {
                 a: '我们',
                 c: 'd',
                 e: '2'
             }
         });
     });

     it('Magix.objectToPath', function() {
         expect(Magix.objectToPath({
             pathname: '/xxx/a.b.c.html',
             params: {
                 a: 'b',
                 c: 'd',
                 e: '2'
             }
         })).to.eql('/xxx/a.b.c.html?a=b&c=d&e=2');

         expect(Magix.objectToPath({
             pathname: '/xxx/a.b.c.html',
             params: {
                 a: '我们',
                 c: 'd',
                 e: '2'
             }
         })).to.eql('/xxx/a.b.c.html?a=我们&c=d&e=2');

         expect(Magix.objectToPath({
             pathname: '/xxx/a.b.c.html',
             params: {
                 a: '我们',
                 c: 'd',
                 e: '2'
             }
         }, true)).to.eql('/xxx/a.b.c.html?a=%E6%88%91%E4%BB%AC&c=d&e=2');

         expect(Magix.objectToPath({
             pathname: '/xxx/a.b.c.html',
             params: {
                 a: '我们',
                 c: 'd',
                 e: '',
                 f: ''
             }
         }, true, {
             a: 1,
             c: 1
         })).to.eql('/xxx/a.b.c.html?a=%E6%88%91%E4%BB%AC&c=d');

         expect(Magix.objectToPath({
             pathname: '/xxx/a.b.c.html',
             params: {
                 a: '我们',
                 c: 'd',
                 e: '',
                 f: ''
             }
         }, true)).to.eql('/xxx/a.b.c.html?a=%E6%88%91%E4%BB%AC&c=d&e=&f=');
     });

     it('Magix.listToMap', function() {
         expect(Magix.listToMap('a,b,c,d,e,f,g')).to.eql({
             a: 1,
             b: 1,
             c: 1,
             d: 1,
             e: 1,
             f: 1,
             g: 1
         });

         expect(Magix.listToMap([{
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
         expect(cache.x).to.be(30);
         expect(cache.b).to.be(32);
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
     it('Router.parseQH', function() {
         expect(Router.parseQH('/a?a=2#!/b?c=3').params).to.eql({
             a: '2',
             c: '3'
         });

         expect(Router.parseQH('/a?a=2#!/b?a=3').params).to.eql({
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
 });