1.1.0 / 2013-11-04
==================

1.0 与 1.1 diff:

1. 事件写法：

    1.0 => events:{type:{handler:function(e){}}}
    1.1 => handler<type>:function(e){}

2. 调整fetchX返回参数

    1.0 => MM.fetchAll([{name:'A'}],function(m,e){});
    1.1 => MM.fetchAll([{name:'A'}],function(e,m){});

3. 1.1改进当tagName切换后的查询方法，使用querySelectorAll
4. view增加mixin方法方便扩展
5. 去除VOM中的root方法
6. 修改wrapMxEvent方法，不再添加mx-owner属性而是mx-event="vframeId"
7. 移除对app包配置
8. router对changed参数增加from和to，方便识别是怎样的改变
9. model中移除parse方法，统一在sync方法中处理
10. vframe中mount的几个方法增加callback
11. view的私有方法destroy重命名为oust，防止认为destroy是公用方法
12. mm注册时，可以使用cache:true即可完成缓存
13. mm中，初始化m对象和完成接口请求时，触发inited和done事件
14. model.get方法支持传递默认值


1.0.0 / 2013-07-22
==================

 * 版本稳定版发布
 * 移动版与pc版
 * 增加seajs与requirejs
 * 完善API文档
 * 拆分出magix核心与magix扩展两大块
 * 全新的Router解析引擎，全面支持history state和hash，支持二者之间平滑切换
 * 增强的view，丰富的自定义事件和资源管理，DOM事件全面支持不冒泡的事件
 * 支持底层类库切换，解除对底层类库MVC的依赖
 * 全新的代码组织方式，高内聚，低耦合
 * 改进的渲染流程和事件派发

1.0.0-beta / 2012-11-27
=======================

 * 全面支持 pushState 和 hash
 * 支持动画切换
 * 丰富的事件
 * 资源托管等
 * 拆分magix核心与magix扩展2部分

0.3.0 / 2012-2-6
================

 * 分支归档，开始"0.4.0"版本开发
 * Magix支持多底层切换
 * 完善构建、打包、测试、文档和示例

0.2.0 / 2011-8-22
=================

 * 分支归档，开始"0.3.0"版本开发
 * MagixJS支持在非单页应用网页中使用

0.1.0 / 2011-6-14
=================

 * 分支归档，开始"0.2.0"版本开发
 * 调整目录结构
 * 丰富实例和文档
