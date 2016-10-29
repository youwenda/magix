---
title: App模块拆分
layout: tutorial
---

# 4. App模块拆分

## Magix使用树形view嵌套组装页面

Magix的核心是区块(view)管理，一个页面可以划分为n个区块。一个复杂的区块仍然可以再划分子区块，类似传统的iframe，Magix在最初设计的时候也参考了iframe的思路，所以你可以用iframe的思路来理解每个区块

iframe之间是独立的页面，而Magix的vframe是采用的独立的区块（vframe则是包含view的frame）

页面可以使用iframe无限的拆分、嵌套。而Magix包含区块(view)的vframe也有同样的功能。
所以一个页面最终可能是下面这样的结构
![vom](//github.com/thx/magix-inspector/raw/master/snapshot.png)

接下来就介绍view的拆分

## 拆分页面为多个view

Magix通过view组装页面, 将页面拆分为多个view有如下好处:

- 多个页面需要复用同一个区块时可以快速使用
- 单个页面非常复杂, 分治法将页面拆分为多个独立子区块, 方便管理

根据前面的设计稿, todo app分为三个主要模块:

- 所有页面共享的header部分
- 不同功能所在的中间部分
- 所有页面共享的footer

所以我们根据页面布局对页面进行初步拆分为以下部分

- `app/view/common/header`: 通用header
- `magix_vf_main`: 这是内容视图容器, 根据hash加载对应视图
- `app/view/common/footer`: 通用footer

### 拆分步骤

1. 修改`app/view/default.html`, 拆分为多个子view:

        <div class="container">
            <!-- 通用页头 -->
            <div  mx-view="app/view/common/header"></div>

            <!-- 页面主体内容 -->
            <div id="magix_vf_main">
                main content
            </div>


            <!-- 通用页尾 -->
            <div  mx-view="app/view/common/footer"></div>
        </div>

    此时`app/view/default`由三个子view组成: header, footer, main, 其中header, footer内容固定, main根据hash解析加载(后续会实现)

    模块渲染完成后Maigx会检查包含`mx-view="xxx"`属性的节点，获取并加载指定的模块。当指定模块渲染完成后继续执行查找，直到没有嵌套模块。

    上面的`default.html`中指定了header和footer两个模块。Magix会自动加载并渲染。所以需要添加这两个模块。

2. 新建header.html: `mkdir -p tmpl/app/view/common && touch tmpl/app/view/common/header.html`

        <header>
            <h2>header</h2>
        </header>

3. 新建header.js: `touch tmpl/app/view/common/header.js`

        var Magix = require('magix')

        module.exports = Magix.View.extend({
            tmpl: '@header.html',
            render: function() {
                this.setHTML(this.id, this.tmpl)
            }
        })

4. 刷新页面可以看到header和content部分已经渲染


您可以模仿header给页面添加一个footer模块.

## 使用Magix Inspector查看拆分后的页面

当页面特别复杂时, 需要拆分为几十个子view, 手动检查子view的拆分情况变得非常困难, Magix提供了view嵌套可视化工具来解决这一问题.

只需在页面中加载Magix Inspector的js文件, 加载完成后会解析当前页面的视图, 提供树形的可视化显示.

可以通过以下三种方法加载Magix Inspector:

- 在页面最后直接引入`https://thx.github.io/magix-inspector/index.js`

- 新建书签, 在内容填入以下内容:

        javascript:void((function(d,s){s=d.createElement('script');s.src='https://thx.github.io/magix-inspector/index.js';s.charset='utf-8';d.body.appendChild(s)}(document)))

    在需要查看视图结构时访问该书签

- 安装[Magic Inspector Chrome 插件][1], 在需要时点击浏览器上的M图标即可加载


在这里我们使用Chrome插件的方式, 安装好插件, 在todo app页面点击M图标, Magix Inspector显示出当前页面所有视图, 如下图:

![][2]

我们使用Magix Inspector查看所有使用Magix的页面视图, 如:

- [钻石展位营销平台][3]

    ![][8]


## 小结


- 页面拆分为多个模块便于管理
- Magix使用树形结构管理父子模块
- 模板渲染后, Magix解析子view并自动加载
- Maigx Inspector查看页面view划分

[8]: https://gw.alicdn.com/tps/TB1ZKYnNXXXXXciXVXXXXXXXXXX-1257-877.png
[3]: http://zuanshi.taobao.com/
[2]: https://gw.alicdn.com/tps/TB1C9m9NXXXXXX0apXXXXXXXXXX-794-587.png
[1]: https://github.com/qiu-deqing/magix-helper
