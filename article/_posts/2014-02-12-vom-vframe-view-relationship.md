---
layout: article
title: Magix核心模块之间的关系
---


Magix核心模块分为以下几块

 1. Router(负责URL的解析与更改，包括hash和h5的pushState之间的平滑切换)
 2. VOM(Vframe Object Model，管理页面上的Vframe对象，可类比DOM，但提供的方法较少)
 3. Vframe(负责维护view之间的层级关系，比如某个view中又包含vframe，则这个关系是维护在Vframe上而非view上，类比iframe)
 4. View(仅负责区块的呈现，类比具体的传统页面)
 5. Magix(提供一些常用方法，因Magix需要适应不同的底层类库，所以由该对象负责对接不同的底层类库，供Magix内部公用部分使用)

从具体实现上，Maigx为独立的模块，其它模块均依赖Magix模块。

为了保持依赖关系的简单，Router使用PubSub模式，当URL有变化时，向外派发事件。

VOM持有页面上所有Vframe对象，当需要某个Vframe对象时，可使用VOM对象来查找。Vframe对象可装载不同的View，可类比iframe标签，同一个iframe标签通过修改src来渲染不同的页面。

