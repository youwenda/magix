/*
    author:xinglie.lkf@taobao.com
 */
(function() {
    var D = document;
    var Status = {
        created: '#008B00',
        init: '#FF3030',
        alter: '#BC8F8F',
        isolated: '#FF3030'
    };
    var Consts = {
        width: 500,
        height: 420,
        canvasHeight: 350,
        moreInfoWidth: 240,
        titleHeight: 34,
        circleMargin: 6,
        maxDeepView: 4,
        maxView: 5
    };
    var Lines = [
        'FFC125',
        'C71585',
        '0000AA',
        'CDBA96',
        'FF7F00',
        'BA55D3',
        '8B4726',
        '7CFC00',
        '4A4A4A',
        'EE7AE9'
    ];
    var Heredoc = function(fn) {
        return (fn + '').replace(/^[\s\S]*?\/\*([\S\s]*)\*\/[\s\S]*?$/, '$1');
    };
    var UI = {
        main: Heredoc(function() {
            /*
                <style type="text/css">
                .magix-helper{
                    position:fixed;
                    right:0;
                    top:0;
                    width:{width}px;
                    height:{height}px;
                    z-index:100000;
                    border:solid 1px #ccc;
                    background-color:#fff;
                }
                .magix-helper .m5{margin-left:5px;}
                .magix-helper .fl{
                    float:left
                }
                .magix-helper .fr{
                    float:right
                }
                .magix-helper .cp{
                    cursor:pointer;
                }
                .magix-helper .p8{
                    padding:8px;
                }
                .magix-helper .red{color:red}
                .magix-helper .clearfix:before,
                .magix-helper .clearfix:after {
                    content: "";
                    display: table;
                }
                .magix-helper .clearfix:after {
                    clear: both;
                }
                .magix-helper .clearfix {
                    *zoom: 1;
                }
                #magix_helper_moreinfo{
                    position:absolute;
                    background-color:#eee;
                    padding:8px;
                    width:{moreInfoWidth}px;
                    display:none
                }
                </style>
                <div class="magix-helper" id="magix_helper">
                    <ul class="clearfix">
                        <li class="fl p8 cp">VOM</li>
                        <li class="fl p8 cp">Tracer</li>
                        <!--<li class="fl p8">Manager</li>
                        <li class="fr p8 move" id="magix_helper_mover">※</li>-->
                        <li class="fr p8 cp" id="magix_helper_min">︽</li>
                    </ul>
                    <div id="magix_helper_painter">
                        <canvas width="{width}" height="{canvasHeight}" id="magix_helper_canvas"></canvas>
                    </div>
                    <div id="magix_helper_trancer" style="height:{canvasHeight}px;overflow:scroll;overflow-x:auto;display:none">

                    </div>
                    <ul class="clearfix" id="magix_helper_total">

                    </ul>
                    <div id="magix_helper_moreinfo">

                    </div>
                </div>
             */
        }),
        moreInfo: Heredoc(function() {
            /*
               <ul>
                <li>
                    <b>id:</b>{id}
                </li>
                <li>
                    <b>view:</b>{view}
                </li>
                <li class="red">
                    {ex}
                </li>
                <li>
                    <b>resources:</b>
                </li>
                <li style="{moreInfoWidth}px;overflow:auto;max-height:200px;">
                    {res}
                </li>
               </ul>
             */
        }),
        total: Heredoc(function() {
            /*
                <li class="fl">共{total}个view</li>
                <li class="fl ml5 red">{ex}</li>
                <li class="fl ml5"><b>{suggest}</b></li>
             */
        }),
        setup: function() {
            var div = D.createElement('div');
            div.innerHTML = UI.main.replace(/\{(\w+)\}/g, function(m, v) {
                return Consts[v];
            });
            D.body.appendChild(div);
            UI.attachEvent();
        },
        attachEvent: function() {
            UI.detachEvent();
            var moveTimer;
            var env = Helper.getEnv();
            env.bind('magix_helper_canvas', 'mousemove', UI.$mousemove = function(e) {
                clearTimeout(moveTimer);
                moveTimer = setTimeout(function() {
                    var offset = env.getDOMOffset('magix_helper_canvas');
                    UI.onMousemove({
                        x: e.pageX - offset.left,
                        y: e.pageY - offset.top
                    });
                }, 10);
            });
            env.bind('magix_helper_canvas', 'mouseout', UI.$mouseout = function() {
                clearTimeout(moveTimer);
                UI.onMousemove({
                    x: -1,
                    y: -1
                });
            });
            env.bind('magix_helper_moreinfo', 'mouseover', UI.$imouseover = function() {
                clearTimeout(UI.$hideTimer);
            });
            env.bind('magix_helper_moreinfo', 'mouseout', UI.$imouseout = function() {
                UI.hideMoreInfo();
            });
            env.bind('magix_helper', 'click', UI.$click = function(e) {
                var node;
                if (e.target.id == 'magix_helper_min') {
                    node = D.getElementById('magix_helper');
                    if (e.target.innerHTML == '︽') {
                        node.style.height = Consts.titleHeight + 'px';
                        node.style.overflow = 'hidden';
                        e.target.innerHTML = '︾';
                    } else {
                        node.style.height = Consts.height + 'px';
                        node.style.overflow = 'inherit';
                        e.target.innerHTML = '︽';
                    }
                } else if (e.target.innerHTML == 'VOM') {
                    node = D.getElementById('magix_helper_painter');
                    node.style.display = 'block';
                    node = D.getElementById('magix_helper_trancer');
                    node.style.display = 'none';
                } else if (e.target.innerHTML == 'Tracer') {
                    node = D.getElementById('magix_helper_painter');
                    node.style.display = 'none';
                    node = D.getElementById('magix_helper_trancer');
                    node.style.display = 'block';
                }
            });
            /*env.bind('magix_helper_mover', 'mousedown', UI.$mousedown = function(e) {
                var start = {
                    x: e.pageX,
                    y: e.pageY
                };
                var offset = env.getDOMOffset('magix_helper');
                var node = D.getElementById('magix_helper');
                var mousemove, mouseup;
                env.bind(document, 'mousemove', mousemove = function(e) {
                    node.style.left = offset.left + (e.pageX - start.x) + 'px';
                    node.style.top = offset.top + (e.pageY - start.y) + 'px';
                });
                env.bind(document, 'mouseup', mouseup = function() {
                    env.unbind(document, 'mouseup', mouseup);
                    env.unbind(document, 'mousemove', mousemove);
                });
            });*/
        },
        detachEvent: function() {
            var env = Helper.getEnv();
            env.unbind('magix_helper_canvas', 'mousemove', UI.$mousemove);
            env.unbind('magix_helper_canvas', 'mouseup', UI.$mouseup);
            env.unbind('magix_helper_min', 'click', UI.$click);
            env.unbind('magix_helper_moreinfo', 'mouseoout', UI.$imouseout);
            env.unbind('magix_helper_moreinfo', 'mouseover', UI.$imouseover);
            //env.unbind('magix_helper_mover', 'mousedown', UI.$mousedown);
        },
        showMoreInfo: function(vf, item) {
            clearTimeout(UI.$hideTimer);
            var node = D.getElementById('magix_helper_moreinfo');
            node.style.display = 'block';
            var left = Math.min(item.center.x - Consts.moreInfoWidth / 2, Consts.width - Consts.moreInfoWidth);
            node.style.left = left + 'px';
            node.style.top = item.center.y + item.radius + Consts.titleHeight + 5 + 'px';
            var env = Helper.getEnv();
            node.innerHTML = UI.moreInfo.replace(/\{(\w+)\}/g, function(m, v) {
                switch (v) {
                    case 'id':
                        return item.id;
                    case 'view':
                        return vf ? (vf.path || vf.view && vf.view.path || '') : '';
                    case 'ex':
                        if (item.il) {
                            return '被孤立的节点，好可怜……';
                        }
                        if (!vf) {
                            return 'vframe已被销毁，但未从vom中移除';
                        }
                        if (!vf.path && !vf.view) {
                            return '未加载view';
                        }
                        if (!vf.fcc) {
                            return vf.rC != vf.cC ? '正等待子view加载' : '正等待view加载';
                        }
                        if (vf.fca) {
                            return '等待view渲染';
                        }
                        return '';
                    case 'res':
                        var t = [];
                        var res = vf && vf.view && vf.view.$res;
                        if (res) {
                            t.push('<table style="width:100%"><tr><td>hasKey</td><td>key</td><td>res</td></tr>');
                            for (var p in res) {
                                t.push('<tr><td>', res[p].hasKey || !! (res[p].hk), '</td><td>', p, '</td><td>', env.getResType(res[p]), '</td></tr>');
                            }
                            t.push('</table>');
                        }
                        return t.join('');
                    default:
                        return Consts[v];
                }
            });
        },
        hideMoreInfo: function() {
            var node = D.getElementById('magix_helper_moreinfo');
            UI.$hideTimer = setTimeout(function() {
                node.style.display = 'none';
            }, 150);
        },
        showTotal: function(tree, extra) {
            var node = D.getElementById('magix_helper_total');
            node.innerHTML = UI.total.replace(/\{(\w+)\}/g, function(m, v) {
                switch (v) {
                    case 'total':
                        return tree.vomTotal;
                    case 'ex':
                        if (tree.total != tree.vomTotal) {
                            return '<b style="color:red">vom中共' + tree.vomTotal + '个view，而只有' + tree.total + '个存在关联</b>';
                        }
                        return '';
                    case 'suggest':
                        var sg = '';
                        if (extra.deep > Consts.maxDeepView) {
                            sg = 'view嵌套层级太深，请注意最终显示效果。';
                        }
                        if (extra.maxOne > Consts.maxView || (extra.max / extra.deep > 1.5)) {
                            sg += '请注意view是否拆分的过碎';
                        }
                        return sg;
                }
            });
        },
        onMousemove: function(e) {
            console.log(e);
        }
    };
    var Tracer = {
        log: function(info) {
            var node = D.getElementById('magix_helper_trancer');
            if (Tracer.idle) {
                node.insertBefore(D.createElement('hr'), node.firstChild);
                delete Tracer.idle;
            }
            var d = D.createElement('div');
            d.innerHTML = info;
            node.insertBefore(d, node.firstChild);
            if (node.getElementsByTagName('div').length > 200) {
                node.removeChild(node.lastChild);
                node.removeChild(node.lastChild);
            }
            clearTimeout(Tracer.$timer);
            Tracer.$timer = setTimeout(function() {
                Tracer.idle = true;
            }, 2000);
        }
    };
    var Graphics = {
        captureItmes: function() {
            var g = Graphics;
            g.list = [];
            delete g.$last;
            UI.onMousemove = function(e) {
                var loop, one, dis;
                if (g.$last) {
                    one = g.$last;
                    dis = Math.pow(Math.pow(one.center.x - e.x, 2) + Math.pow(one.center.y - e.y, 2), 1 / 2);
                    if (dis > one.radius) {
                        g.onHoverItme({
                            item: one,
                            action: 'leave'
                        });
                        delete g.$last;
                        loop = true;
                    }
                } else {
                    loop = true;
                }
                if (loop) {
                    for (var i = g.list.length - 1; i >= 0; i--) {
                        one = g.list[i];
                        dis = Math.pow(Math.pow(one.center.x - e.x, 2) + Math.pow(one.center.y - e.y, 2), 1 / 2);
                        if (dis <= one.radius) {
                            if (g.$last != one) {
                                g.$last = one;
                                g.onHoverItme({
                                    item: one,
                                    action: 'enter'
                                });
                            }
                            break;
                        }
                    }
                }
            };
        },
        getBestParams: function(tree, width, height) {
            var maxChildren = 0,
                deep = 0,
                deepMap = {},
                maxOneChildren = 0;
            var walk = function(item, level) {
                item.deep = level;
                if (item.children.length > maxOneChildren) {
                    maxOneChildren = item.children.length;
                }
                if (item.deep > deep) {
                    deep = item.deep;
                }
                if (!deepMap[level]) {
                    deepMap[level] = item.children.length;
                } else {
                    deepMap[level] += item.children.length;
                }
                if (deepMap[level] > maxChildren) {
                    maxChildren = deepMap[level];
                }
                for (var i = item.children.length - 1; i >= 0; i--) {
                    walk(item.children[i], item.deep + 1);
                }
            };
            walk(tree, 1);
            maxChildren = Math.max(maxChildren, tree.isolated.length + 1);
            return {
                max: maxChildren,
                maxOne: maxOneChildren,
                deep: deep,
                margin: Consts.circleMargin,
                radius: Math.floor(Math.min(height / deep - Consts.circleMargin, width / maxChildren - Consts.circleMargin) / 2)
            };
        },
        getChildrenCountByDeep: function(tree, deep) {
            var count = 0;
            var walk = function(item) {
                if (item.deep == deep && item.children.length) {
                    item.leftIndex = count;
                    count += item.children.length;
                }
                for (var i = 0; i < item.children.length; i++) {
                    walk(item.children[i]);
                }
            };
            walk(tree);
            return count;
        },
        drawTree: function(tree) {
            if (tree.id) {
                var width = Consts.width,
                    height = Consts.canvasHeight,
                    g = Graphics;
                g.captureItmes();
                var params = g.getBestParams(tree, width, height);
                var ctx = D.getElementById('magix_helper_canvas').getContext('2d');
                ctx.clearRect(0, 0, width, height);
                var maxTextLen = (function() {
                    var len = 2;
                    ctx.font = 'normal 14px Arial';
                    while (true) {
                        var width = ctx.measureText(new Array(len).join('M')).width;
                        console.log(width, params.radius, len);
                        if (width < params.radius * 2) {
                            len += 2;
                        } else {
                            len -= 2;
                            break;
                        }
                    }
                    console.log(len);
                    return len;
                })();
                console.log(maxTextLen);
                var linecolorIndex = 0;
                var drawCircle = function(item, pos, ppos, lineColor) {
                    if (ppos) {
                        ctx.beginPath();
                        var deg = Math.atan((pos.y - ppos.y) / (pos.x - ppos.x)) * 180 / Math.PI;
                        if (deg < 0) {
                            deg += 180;
                        }
                        var tx = Math.round(ppos.x + params.radius * Math.cos(deg * Math.PI / 180));
                        var ty = Math.round(ppos.y + params.radius * Math.sin(deg * Math.PI / 180));
                        ctx.moveTo(tx, ty); // 设置路径起点，坐标为(20,20)
                        ctx.lineTo(pos.x, pos.y); // 绘制一条到(200,20)的直线
                        ctx.lineWidth = 1.0; // 设置线宽
                        ctx.strokeStyle = lineColor;
                        ctx.stroke(); // 进行线的着色，这时整条线才变得可见
                    }
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y);
                    ctx.arc(pos.x, pos.y, params.radius, 0, Math.PI * 2, true);
                    ctx.fillStyle = item.status;
                    ctx.fill();

                    g.list.push({
                        id: item.id,
                        center: pos,
                        il: item.il,
                        radius: params.radius
                    });
                    //text
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y);
                    ctx.font = 'normal 14px Arial';
                    ctx.fillStyle = '#282828';
                    var id = item.id;
                    if (id.length - 3 > maxTextLen) {
                        id = id.substring(0, maxTextLen) + '...';
                    }
                    var textWidth = Math.round(ctx.measureText(id).width);
                    var left = (2 * params.radius - textWidth) / 2;
                    ctx.fillText(id, pos.x + left - params.radius, pos.y + 4);
                    var count = Graphics.getChildrenCountByDeep(tree, item.deep);
                    if (count) {
                        var space = (width - (count * params.radius * 2 + (count - 1) * params.margin)) / 2;
                        var lcolor = '#' + Lines[linecolorIndex++ % Lines.length]; // Lines[Math.floor(Math.random() * (Lines.length - 1))];
                        for (var i = 0; i < item.children.length; i++) {
                            drawCircle(item.children[i], {
                                x: space + (i + item.leftIndex) * (params.radius * 2 + params.margin) + params.radius,
                                y: pos.y + params.margin + 2 * params.radius
                            }, pos, lcolor);
                        }
                    }
                };
                var temp = tree.isolated;
                var space = width / 2;
                if (temp.length) {
                    space = (width - (temp.length + 1) * params.radius * 2 + temp.length * params.margin) / 2;
                    for (var i = 0; i < temp.length; i++) {
                        drawCircle(temp[i], {
                            x: space + (i + 1) * (params.radius * 2 + params.margin) + params.radius,
                            y: params.margin + params.radius
                        });
                    }
                    space += params.radius;
                }

                drawCircle(tree, {
                    x: space,
                    y: params.margin + params.radius
                });
                UI.showTotal(tree, params);
            }
        },
        onHoverItme: function(e) {
            var env = Helper.getEnv();
            var vom = env.getVOM();
            if (e.action == 'enter') {
                UI.showMoreInfo(vom.get(e.item.id), e.item);
            } else {
                UI.hideMoreInfo();
            }
        }
    };
    var KISSYEnv = {
        prepare: function() {
            KISSY.use('node');
        },
        getRootId: function() {
            var magix = KISSY.require('magix/magix');
            return magix.config('rootId');
        },
        getVOM: function() {
            return KISSY.require('magix/vom');
        },
        isReady: function() {
            var magix = KISSY.Env.mods['magix/magix'];
            var vom = KISSY.Env.mods['magix/vom'];
            var node = KISSY.Env.mods['node'];
            return magix && magix.status === KISSY.Loader.Status.ATTACHED && vom && vom.status === KISSY.Loader.Status.ATTACHED && node && node.status === KISSY.Loader.Status.ATTACHED;
        },
        getDOMOffset: function(id) {
            var node = KISSY.require('node');
            return node.one('#' + id).offset();
        },
        bind: function(id, type, fn) {
            var node = KISSY.require('node');
            if (KISSY.isString(id)) id = '#' + id;
            return node.one(id).on(type, fn);
        },
        unbind: function(id, type, fn) {
            var node = KISSY.require('node');
            if (KISSY.isString(id)) id = '#' + id;
            return node.one(id).detach(type, fn);
        },
        getResType: function(r) {
            var type = '';
            var e = r.res || r.e;
            if (e) {
                if (e.fetchAll) {
                    type = 'Model Manager';
                } else if (e.bricks) {
                    type = 'Pagelet';
                } else if (e.hasOwnProperty('pagelet')) {
                    type = 'Brick';
                } else if (e.__attrs && e.__attrVals) {
                    type = 'extend KISSY Attribute';
                }
            }
            return type;
        }
    };
    var Helper = {
        getEnv: function() {
            if (window.KISSY) {
                return KISSYEnv;
            }
            throw new Error('unsupport');
        },
        getTree: function(env) {
            var rootId = env.getRootId();
            var vom = env.getVOM();
            var tree = {
                total: 0,
                vomTotal: 0,
                children: []
            };
            var all = vom.all();
            var allMap = {};
            for (var a in all) {
                if (vom.get(a)) {
                    tree.vomTotal++;
                }
                allMap[a] = 1;
            }
            var walk = function(id, info) {
                var vf = vom.get(id);
                if (vf) {
                    tree.total++;
                    info.id = vf.id;
                    delete allMap[vf.id];
                    if (vf.fcc) {
                        info.status = Status.created;
                    } else if (vf.fca) {
                        info.status = Status.alter;
                    } else {
                        info.status = Status.init;
                    }
                    for (var p in vf.cM) {
                        var newInfo = {
                            children: []
                        };
                        walk(p, newInfo);
                        if (newInfo.id) {
                            info.children.push(newInfo);
                        }
                    }
                }
            };
            walk(rootId, tree);
            var il = [];
            for (var p in allMap) {
                il.push({
                    id: p,
                    il: true,
                    status: Status.isolated,
                    children: []
                });
            }
            tree.isolated = il;
            return tree;
        },
        prepare: function(callback) {
            var env = Helper.getEnv();
            env.prepare();
            var poll = function() {
                if (D.body) {
                    if (env.isReady()) {
                        callback();
                    } else {
                        setTimeout(poll, 500);
                    }
                } else {
                    setTimeout(poll, 500);
                }
            };
            poll();
        },
        start: function() {
            Helper.prepare(function() {
                UI.setup();
                var env = Helper.getEnv();
                var drawTimer;
                var attachVframe = function(vf) {
                    vf.on('created', function() {
                        Tracer.log('vframe:' + vf.id + '(' + (vf.path || vf.view.path) + ')渲染完毕');
                        drawTree();
                    });
                    vf.on('alter', function() {
                        Tracer.log('vframe:' + vf.id + '或子(孙)view正在更改');
                        drawTree();
                    });
                    vf.on('viewInited', function() {
                        Tracer.log('vframe:' + vf.id + '的view(' + vf.view.path + ')，init调用完毕');
                    });
                    vf.on('viewUnmounted', function() {
                        Tracer.log('vframe:' + vf.id + '的view(' + vf.view.path + ')销毁完毕');
                    });
                    vf.on('viewMounted', function() {
                        Tracer.log('vframe:' + vf.id + '的view(' + vf.view.path + ')，首次渲染完毕');
                    });
                    vf.___mh = true;
                };
                var drawTree = function(e) {
                    if (e) {
                        if (e.type == 'remove') {
                            Tracer.log('销毁vframe:' + e.vframe.id);
                        } else if (e.type == 'created') {
                            var all = vom.all();
                            for (var a in all) {
                                var vf = vom.get(a);
                                if (!vf.___mh) {
                                    attachVframe(vf);
                                }
                            }
                        }
                    }
                    clearTimeout(drawTimer);
                    drawTimer = setTimeout(function() {
                        var tree = Helper.getTree(env);
                        Graphics.drawTree(tree);
                    }, 0);
                };
                var vom = env.getVOM();
                vom.on('add', function(e) {
                    drawTree();
                    if (e.vframe.pId) {
                        Tracer.log('找到vframe:' + e.vframe.pId + '的子vframe:' + e.vframe.id);
                    }
                    Tracer.log('创建vframe:' + e.vframe.id);
                    attachVframe(e.vframe);
                });
                vom.on('remove', drawTree);
                var rootVf = vom.get(env.getRootId());
                if (rootVf) {
                    rootVf.on('created', drawTree);
                }
                drawTree();
            });
        }
    };
    Helper.start();
})();