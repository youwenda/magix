﻿# Magix [![Version Number](https://img.shields.io/npm/v/magix.svg)](https://github.com/thx/magix/ "Version Number") [![THX Team](https://img.shields.io/badge/team-THX-green.svg)](https://thx.github.io/ "THX Team") [![License](https://img.shields.io/badge/license-MIT-orange.svg)](https://opensource.org/licenses/MIT "License") [![download](https://img.shields.io/npm/dm/magix.svg)](https://www.npmjs.com/package/magix "Downloads")

> npm install magix

##  简介

Magix适合用来构建大型的、交互复杂的应用。应用可以是前后端分离的单页应用，也可以是传统的交互复杂的页面。

Magix通过特有的vframe(类似iframe的思路)帮你把页面按区块化拆分(这里有介绍：[magix,区块化管理利器](https://github.com/thx/magix/issues/11))，同时拆分后的区块仍可以再拆分子区块，无限拆分下去。通过mx-view标签属性快速把区块组装起来形成最终的页面，区块可以被任意、多次复用。

拆分再组合后的页面，无法直接看出有哪些区块及区块间的关系，可以通过magix配套的[区块查看器](https://github.com/thx/magix-inspector)来查看页面上区块间的关系、区块渲染情况等，便于分析及调试。

Magix配套的[离线编译工具](https://github.com/thx/magix-combine)帮你更轻松的处理不同加载器、路径转换、样式处理、模板处理等问题


## 开源协议
[Magix 遵循 MIT 协议](https://opensource.org/licenses/MIT)

## 文档
[magix-api](http://thx.github.io/magix/#!/api)

## 组件
[magix-gallery](http://thx.github.io/magix/#!/galleries)

## 示例项目
[magix-project](https://github.com/thx/magix-project) 集成常见组件及开发中的功能，seajs+jquery

[magix-os](https://github.com/thx/magix-os) web桌面系统 KISSY版本

[magix-doc3](https://github.com/thx/magix-doc3) magix文档，seajs独立版本，不使用动态加载

[点击这里查看更多](https://github.com/thx/magix/issues/15)

### 打包及测试

```shell
  npm run build // 只打包shim版本
  npm run test:qunit // 启动单元测试
```