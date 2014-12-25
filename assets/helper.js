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
        canvasWidth: 480,
        canvasHeight: 350,
        moreInfoWidth: 440,
        titleHeight: 34,
        circleMargin: 6,
        maxDeepView: 4,
        maxView: 5,
        managerCols: 5,
        managerMargin: 5,
        managerHeight: 40,
        managerGroupSpace: 40
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
    var ManagerColors = {
        cache: '#CC9966',
        cleaned: '#99CCCC',
        cleans: '#FF9999',
        normal: '#CCCC99'
    };
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
                #magix_helper_moreinfo,#magix_helper_manager_moreinfo{
                    position:absolute;
                    background-color:#eee;
                    padding:8px;
                    width:{moreInfoWidth}px;
                    display:none;
                    left:-457px;
                    top:0;
                }
                </style>
                <div class="magix-helper" id="magix_helper">
                    <ul class="clearfix">
                        <li class="fl p8 cp">VOM</li>
                        <li class="fl p8 cp">Tracer</li>
                        <li class="fl p8 cp">Manager</li>
                        <!--<li class="fr p8 move" id="magix_helper_mover">※</li>-->
                        <li class="fr p8 cp" id="magix_helper_min">︽</li>
                    </ul>
                    <div id="magix_helper_painter">
                        <canvas width="{width}" height="{canvasHeight}" id="magix_helper_view_canvas"></canvas>
                        <ul class="clearfix p8" id="magix_helper_view_total"></ul>
                    </div>
                    <div id="magix_helper_trancer" style="height:{canvasHeight}px;overflow:scroll;overflow-x:auto;display:none">
                    </div>
                    <div id="magix_helper_manager" style="height:{canvasHeight}px;overflow:scroll;overflow-x:auto;display:none">
                        <canvas width="{canvasWidth}" height="{canvasHeight}" id="magix_helper_manager_canvas"></canvas>
                        <ul class="clearfix p8" id="magix_helper_manager_total"></ul>
                    </div>
                    <div id="magix_helper_moreinfo">

                    </div>
                    <div id="magix_helper_manager_moreinfo">

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
        moreManagerInfo: Heredoc(function() {
            /*
               <ul>
                <li>
                    <b>key:</b>{id}
                </li>
                <li>
                    <b>url:</b>{url}
                </li>
                <li>
                    <b>描述:</b>{desc}
                </li>
                <li>
                    <b>缓存:</b>{cache}
                </li>
                <li>
                    <b>清理缓存:</b>{cleans}
                </li>
                <li>
                    <b>预处理:</b>{hasAfter}
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
        managerTotal: Heredoc(function() {
            /*
                <li class="fl">{groups}个接口文件，共{total}个接口</li>
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
            env.bind('magix_helper_view_canvas', 'mousemove', UI.$mousemove = function(e) {
                clearTimeout(moveTimer);
                moveTimer = setTimeout(function() {
                    var offset = env.getDOMOffset('magix_helper_view_canvas');
                    UI.onMousemove({
                        x: e.pageX - offset.left,
                        y: e.pageY - offset.top
                    });
                }, 10);
            });
            env.bind('magix_helper_view_canvas', 'mouseout', UI.$mouseout = function() {
                clearTimeout(moveTimer);
                UI.onMousemove({
                    x: -1,
                    y: -1
                });
            });
            env.bind('magix_helper_manager_canvas', 'mousemove', UI.$mangerMousemove = function(e) {
                clearTimeout(moveTimer);
                moveTimer = setTimeout(function() {
                    var offset = env.getDOMOffset('magix_helper_manager_canvas');
                    UI.onManagerMousemove({
                        x: e.pageX - offset.left,
                        y: e.pageY - offset.top
                    });
                }, 10);
            });
            env.bind('magix_helper_manager_canvas', 'mouseout', UI.$managerMouseout = function() {
                clearTimeout(moveTimer);
                UI.onManagerMousemove({
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
                    node = D.getElementById('magix_helper_manager');
                    node.style.display = 'none';
                } else if (e.target.innerHTML == 'Tracer') {
                    node = D.getElementById('magix_helper_painter');
                    node.style.display = 'none';
                    node = D.getElementById('magix_helper_manager');
                    node.style.display = 'none';
                    node = D.getElementById('magix_helper_trancer');
                    node.style.display = 'block';
                } else if (e.target.innerHTML == 'Manager') {
                    node = D.getElementById('magix_helper_painter');
                    node.style.display = 'none';
                    node = D.getElementById('magix_helper_trancer');
                    node.style.display = 'none';
                    node = D.getElementById('magix_helper_manager');
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
            env.unbind('magix_helper_view_canvas', 'mousemove', UI.$mousemove);
            env.unbind('magix_helper_view_canvas', 'mouseout', UI.$mouseout);
            env.unbind('magix_helper_manager_canvas', 'mousemove', UI.$managerMousemove);
            env.unbind('magix_helper_manager_canvas', 'mouseout', UI.$managerMouseout);
            env.unbind('magix_helper_min', 'click', UI.$click);
            env.unbind('magix_helper_moreinfo', 'mouseoout', UI.$imouseout);
            env.unbind('magix_helper_moreinfo', 'mouseover', UI.$imouseover);
            //env.unbind('magix_helper_mover', 'mousedown', UI.$mousedown);
        },
        showMoreInfo: function(vf, item) {
            clearTimeout(UI.$hideTimer);
            var cover = D.getElementById('magix_helper_cover');
            if (!cover) {
                cover = D.createElement('div');
                cover.style.cssText = 'position:absolute;opacity:0.7;background-color:#90EE90;z-index:99999;';
                cover.id = 'magix_helper_cover';
                D.body.appendChild(cover);
            }

            var node = D.getElementById('magix_helper_moreinfo');
            node.style.display = 'block';
            var env = Helper.getEnv();
            var offset = env.getDOMOffset(vf.id);
            var size = env.getDOMSize(vf.id);
            cover.style.left = offset.left + 'px';
            cover.style.top = offset.top + 'px';
            cover.style.width = size.width + 'px';
            cover.style.height = size.height + 'px';
            cover.style.display = 'block';

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
                        if (vf.path && ((vf.cM && !vf.$v) || (vf.$c && !vf.$v))) {
                            return '未加载view';
                        }
                        if (vf.cM) {
                            if (!vf.fcc) {
                                return vf.rC != vf.cC ? '正等待子view加载' : '正等待view加载';
                            }
                        } else {
                            if (!vf.$cr) {
                                return vf.$rc != vf.$cc ? '正等待子view加载' : '正等待view加载';
                            }
                        }
                        if (vf.fca || vf.$ca) {
                            return '等待view渲染';
                        }
                        return '';
                    case 'res':
                        var t = [];
                        var res = vf && vf.view && vf.view.$res;
                        var nKey;
                        if (!res) {
                            nKey = true;
                            res = vf && vf.$v && vf.$v.$res;
                        }
                        if (res) {
                            t.push('<table style="width:100%"><tr><td>hasKey</td><td>key</td><td>res</td></tr>');
                            for (var p in res) {
                                t.push('<tr><td>', nKey || res[p].hasKey || !! (res[p].hk), '</td><td>', p, '</td><td>', env.getResType(res[p]), '</td></tr>');
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
            var cover = D.getElementById('magix_helper_cover');
            UI.$hideTimer = setTimeout(function() {
                node.style.display = 'none';
                cover.style.display = 'none';
            }, 150);
        },
        showManagerMoreInfo: function(item) {
            clearTimeout(UI.$hideManagerTimer);
            var node = D.getElementById('magix_helper_manager_moreinfo');
            node.style.display = 'block';
            node.innerHTML = UI.moreManagerInfo.replace(/\{(\w+)\}/g, function(m, v) {
                switch (v) {
                    case 'id':
                        return item.id;
                    default:
                        return item[v];
                }
            });
        },
        hideManagerMoreInfo: function() {
            var node = D.getElementById('magix_helper_manager_moreinfo');
            UI.$hideManagerTimer = setTimeout(function() {
                node.style.display = 'none';
            }, 150);
        },
        showManagerTotal: function(tree) {
            var node = D.getElementById('magix_helper_manager_total');
            node.innerHTML = UI.managerTotal.replace(/\{(\w+)\}/g, function(m, v) {
                switch (v) {
                    case 'groups':
                        return tree.groups.length;
                    case 'total':
                        return tree.total;
                }
            });
        },
        showTotal: function(tree, extra) {
            var node = D.getElementById('magix_helper_view_total');
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
        updateManagerCanvasHeight: function(height) {
            D.getElementById('magix_helper_manager_canvas').height = height | 0;
        },
        onMousemove: function(e) {
            console.log(e);
        },
        onManagerMousemove: function(e) {
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
                        g.onHoverItem({
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
                                g.onHoverItem({
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
        captureManagerItmes: function() {
            var g = Graphics;
            g.managerList = [];
            delete g.$managerLast;

            UI.onManagerMousemove = function(e) {
                var loop, one, rect;
                if (g.$managerLast) {
                    one = g.$managerLast;
                    rect = one.rect;
                    if (e.x < rect[0] || e.y < rect[1] || e.x > (rect[0] + rect[2]) || e.y > (rect[1] + rect[3])) {
                        g.onHoverManagerItem({
                            item: one,
                            action: 'leave'
                        });
                        delete g.$managerLast;
                        loop = true;
                    }
                } else {
                    loop = true;
                }
                if (loop) {
                    for (var i = g.managerList.length - 1; i >= 0; i--) {
                        one = g.managerList[i];
                        rect = one.rect;
                        if (e.x >= rect[0] && e.y >= rect[1] && e.x <= (rect[0] + rect[2]) && e.y <= (rect[1] + rect[3])) {
                            if (g.$managerLast != one) {
                                g.$managerLast = one;
                                console.log(e, one);
                                g.onHoverManagerItem({
                                    item: one,
                                    action: 'enter'
                                });
                            }
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
                var ctx = D.getElementById('magix_helper_view_canvas').getContext('2d');
                ctx.clearRect(0, 0, width, height);
                var maxTextLen = (function() {
                    var len = 2;
                    ctx.font = 'normal 14px Arial';
                    while (true) {
                        var width = ctx.measureText(new Array(len).join('M')).width;
                        if (width < params.radius * 2) {
                            len += 2;
                        } else {
                            len -= 2;
                            break;
                        }
                    }
                    return len;
                })();
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
        drawManagerTree: function(tree) {
            console.log(tree);
            var gs = Graphics;
            gs.captureManagerItmes();
            var height = Consts.managerMargin * (tree.rows + 1) + tree.rows * Consts.managerHeight + (Consts.managerGroupSpace + Consts.managerMargin) * tree.groups.length;
            UI.updateManagerCanvasHeight(height);
            var ctx = D.getElementById('magix_helper_manager_canvas').getContext('2d');
            ctx.clearRect(0, 0, Consts.canvasWidth, height);
            var top = Consts.managerMargin;
            var managerWidth = ((Consts.canvasWidth - (1 + Consts.managerCols) * Consts.managerMargin) / Consts.managerCols) | 0;
            var oneWidth = (function() {
                ctx.font = 'normal 14px Arial';
                var width = ctx.measureText('M').width;
                return width;
            })();
            var drawRect = function(ctx, rect, one, pname) {
                ctx.beginPath();
                ctx.moveTo(rect[0], rect[1]);
                ctx.fillStyle = one.color;
                ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
                //text
                ctx.beginPath();
                ctx.moveTo(rect[0], rect[1] + 10);
                ctx.font = 'normal 14px Arial';
                ctx.fillStyle = '#282828';
                var id = one.id,
                    tail;
                while ((id.length - 3) * oneWidth > rect[2]) {
                    id = id.slice(0, -1);
                    tail = true;
                }
                if (tail) {
                    id = id.slice(0, -3) + '...';
                }
                ctx.fillText(id, rect[0] + 5, rect[1] + 25);

                one['package'] = pname;
                one.rect = rect;
                gs.managerList.push(one);
            };
            var draw = function(groups) {
                for (var i = 0; i < groups.length; i++) {
                    var g = groups[i];
                    var left = Consts.managerMargin;
                    var pad = false;
                    ctx.beginPath();
                    ctx.moveTo(left, top);
                    ctx.font = 'normal 14px Arial';
                    ctx.fillStyle = '#282828';
                    ctx.fillText(g.name, left + 5, top + 25);
                    top += Consts.managerGroupSpace;
                    var u, one;
                    var max = Math.max(g.maxLeft, g.maxRight);
                    var maps = {};
                    for (u = 0; u < max; u++) {
                        var lo = g.cleans.left[u];
                        var ro = g.cleans.right[u];
                        if (lo) {
                            drawRect(ctx, [left, top, 150, Consts.managerHeight], lo, g.name);
                            maps[lo.id] = lo;
                        }
                        if (ro) {
                            drawRect(ctx, [Consts.canvasWidth - Consts.managerMargin - 150, top, 150, Consts.managerHeight], ro, g.name);
                            maps[ro.id] = ro;
                        }
                        top += Consts.managerMargin + Consts.managerHeight;
                    }
                    for (var p in maps) {
                        one = maps[p];
                        if (one.cleans) {
                            var beginPos = {
                                x: one.rect[0] + one.rect[2],
                                y: one.rect[1] + (one.rect[3] / 2 | 0)
                            };
                            var a = (one.cleans + '').split(',');
                            for (var x = a.length - 1; x >= 0; x--) {
                                var endOne = maps[a[x]];
                                var endPos = {
                                    x: endOne.rect[0],
                                    y: endOne.rect[1] + (endOne.rect[3] / 2 | 0)
                                };
                                console.log(beginPos, endPos);
                                ctx.beginPath();

                                ctx.moveTo(beginPos.x, beginPos.y); // 设置路径起点，坐标为(20,20)
                                ctx.lineTo(endPos.x, endPos.y); // 绘制一条到(200,20)的直线
                                ctx.lineWidth = 1.0; // 设置线宽
                                ctx.strokeStyle = '#996699';
                                ctx.stroke();
                            }
                        }
                    }
                    for (u = 0; u < g.caches.length; u++) {
                        drawRect(ctx, [left, top, managerWidth, Consts.managerHeight], g.caches[u], g.name);
                        if ((u + 1) % Consts.managerCols === 0) {
                            left = Consts.managerMargin;
                            top += Consts.managerMargin + Consts.managerHeight;
                            pad = false;
                        } else {
                            left += managerWidth + Consts.managerMargin;
                            pad = true;
                        }
                    }
                    left = Consts.managerMargin;
                    if (pad) {
                        top += Consts.managerMargin + Consts.managerHeight;
                    }
                    for (u = 0; u < g.items.length; u++) {
                        one = g.items[u];

                        drawRect(ctx, [left, top, managerWidth, Consts.managerHeight], one, g.name);

                        if ((u + 1) % Consts.managerCols === 0) {
                            left = Consts.managerMargin;
                            top += Consts.managerMargin + Consts.managerHeight;
                            pad = false;
                        } else {
                            left += managerWidth + Consts.managerMargin;
                            pad = true;
                        }
                    }
                    left = Consts.managerMargin;
                    if (pad) {
                        top += Consts.managerGroupSpace;
                    }
                }
            };
            draw(tree.groups);
            UI.showManagerTotal(tree);
        },
        onHoverItem: function(e) {
            var env = Helper.getEnv();
            var vom = env.getVOM();
            if (e.action == 'enter') {
                UI.showMoreInfo(vom.get(e.item.id), e.item);
            } else {
                UI.hideMoreInfo();
            }
        },
        onHoverManagerItem: function(e) {
            if (e.action == 'enter') {
                UI.showManagerMoreInfo(e.item);
            } else {
                UI.hideManagerMoreInfo();
            }
        }
    };
    var KISSYEnv = {
        prepare: function() {
            KISSY.use('node');
        },
        getRootId: function() {
            var old = KISSY.Env.mods['magix/magix'];
            var magix;
            if (old) {
                magix = KISSY.require('magix/magix');
            } else {
                magix = KISSY.require('magix');
            }
            return magix.config('rootId');
        },
        getVOM: function() {
            var old = KISSY.Env.mods['magix/magix'];
            if (old) {
                return KISSY.require('magix/vom');
            }
            return KISSY.require('magix').VOM;
        },
        getMangerMods: function() {
            var mods = KISSY.Env.mods;
            var result = [];
            for (var p in mods) {
                var v = mods[p].exports || mods[p].value;
                if (v && v.$mMetas && v.$mCache) {
                    result.push({
                        name: mods[p].name,
                        exports: v
                    });
                }
            }
            return result;
        },
        isReady: function() {
            var magix = KISSY.Env.mods['magix/magix'];
            var node = KISSY.Env.mods['node'];
            if (magix) {
                var vom = KISSY.Env.mods['magix/vom'];
                return magix.status === KISSY.Loader.Status.ATTACHED && vom && vom.status === KISSY.Loader.Status.ATTACHED && node && node.status === KISSY.Loader.Status.ATTACHED;
            } else {
                magix = KISSY.Env.mods['magix'];
                return magix && magix.status === KISSY.Loader.Status.ATTACHED && node && node.status === KISSY.Loader.Status.ATTACHED;
            }
        },
        getDOMOffset: function(id) {
            var node = KISSY.require('node');
            return node.one('#' + id).offset();
        },
        getDOMSize: function(id) {
            var node = KISSY.require('node');
            var n = node.one('#' + id);
            return {
                height: n.outerHeight(),
                width: n.outerWidth()
            };
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
                } else if (e.__attrs && e.__attrVals && e.constructor) {
                    var mods = KISSY.Env.mods,
                        found;
                    for (var p in mods) {
                        var info = mods[p];
                        var v = info.value || info.exports;
                        if (v && e.constructor == v) {
                            type = info.name;
                            found = true;
                            console.log(info);
                            break;
                        }
                    }
                    if (!found) {
                        if (e.hasOwnProperty('pagelet')) {
                            type = 'Brick';
                        } else {
                            type = 'extend KISSY Attribute';
                        }
                    }
                } else if (!KISSY.isFunction(e)) {
                    type = KISSY.type(e);
                } else {
                    type = '函数或构造器';
                }
            } else {
                type = KISSY.type(type);
            }
            return type;
        },
        hookAttachMod: function(callback) {
            var old = KISSY.Loader.Utils.attachMod;
            KISSY.Loader.Utils.attachMod = function() {
                old.apply(KISSY.Loader.Utils, arguments);
                callback();
            };
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
                if (all.hasOwnProperty(a)) {
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
                    if (vf.fcc || vf.$cr) {
                        info.status = Status.created;
                    } else if (vf.fca || vf.$ca) {
                        info.status = Status.alter;
                    } else {
                        info.status = Status.init;
                    }
                    var cm = vf.cM || vf.$c;
                    for (var p in cm) {
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
        getManagerTree: function(env) {
            var managers = env.getMangerMods();
            var result = [],
                rows = 0,

                cleansMap = {}, total = 0;
            for (var i = 0; i < managers.length; i++) {
                var m = managers[i];
                var r = [];
                var cleans = {
                    left: [],
                    right: []
                };
                var caches = [];
                var counter = 0,
                    maxLeft = 0,
                    maxRight = 0,
                    p, info;
                for (p in m.exports.$mMetas) {
                    info = m.exports.$mMetas[p];
                    if (info.cleans) {
                        var a = (info.cleans + '').split(',');
                        for (var j = 0; j < a.length; j++) {
                            cleansMap[a[j]] = p;
                        }
                    }
                }
                for (p in m.exports.$mMetas) {
                    info = m.exports.$mMetas[p];
                    var c = ManagerColors.normal;
                    var ti = {
                        id: p,
                        color: c,
                        url: info.url || info.uri,
                        cache: ((info.cache || info.cacheTime | 0) / 1000) + 'sec',
                        desc: info.desc || '',
                        cleans: info.cleans || '',
                        cleaned: cleansMap[p] || '',
                        hasAfter: !! info.after
                    };
                    if (info.cleans) {
                        c = ManagerColors.cleans;
                        ti.color = c;
                        cleans.left.push(ti);
                        maxLeft++;
                    } else if (cleansMap[p]) {
                        c = ManagerColors.cleaned;
                        ti.color = c;
                        cleans.right.push(ti);
                        maxRight++;
                    } else {
                        if (info.cache || info.cacheTime) {
                            c = ManagerColors.cache;
                            ti.color = c;
                            caches.push(ti);
                        } else {
                            r.push(ti);
                            counter++;
                        }
                    }
                    total++;
                }
                rows += Math.ceil(counter / Consts.managerCols);
                rows += Math.max(maxLeft, maxRight);
                rows += Math.ceil(caches.length / Consts.managerCols);
                result.push({
                    name: m.name,
                    rows: rows,
                    cleans: cleans,
                    caches: caches,
                    maxLeft: maxLeft,
                    maxRight: maxRight,
                    items: r
                });
            }
            return {
                groups: result,
                rows: rows,
                total: total
            };
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
                        Tracer.log('vframe:' + vf.id + '的view(' + (vf.path || (vf.view && vf.view.path || '')) + ')销毁完毕');
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

                var managerTimer;
                var drawManagerTree = function() {
                    clearTimeout(managerTimer);
                    managerTimer = setTimeout(function() {
                        var tree = Helper.getManagerTree(env);
                        Graphics.drawManagerTree(tree);
                    }, 500);
                };
                env.hookAttachMod(drawManagerTree);
                drawManagerTree();
            });
        }
    };
    Helper.start();
})();