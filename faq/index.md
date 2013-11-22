---
layout: post
title: 常问常答 - Frequently Asked Questions
---

## 什么是 Magix

Magix 是 OPOA 应用框架

## 为什么要有 Magix

Magix 主要解决开发中的以下问题：

1. 页面区块的独立调试、调用、定制、拆分等
2. 基于接口约定，前后台独立开发，独立上线

## Magix 和其他 MVC 的区别

Magix中的两个重心 ：

### Router

负责URL的解析与修改

### View

负责展现页面区块，同时为了应对更大型的页面，抽象出了 VOM(View Object Model) 对象，
管理带有父子关系的 View 的展示生命周期。同时抽象出了 Vframe，可类似 iframe 那样随意拆分
页面并通过 iframe 进行页面整合。

前端特有的异步，使得在页面展现时可能异步还未完成就发生页面切换的需求。Magix
在异步这块深入钻研，整理出自已的一套异步管理机制。包括第三方组件的管理，通常在页面切换时，
当前页面用到的组件需要销毁。Magix中通过引入资源托管的概念，简单的API处理掉这些问题

Magix 中的 Model 和特有的 ModelManager 并非是后端接口的映射，Model 仅提供简单的数据通讯
和数据载体。在大型项目中通常接口的数量也是庞大的，所以 Magix 中未采取接口映射的方式，
而是通过 ModelManager 集中管理，通过 ModelManager 还可以很好的解决任意多个接口组合调用
等情况。

## 更多问题 - More Questions?

请在评论中提出，我们将在五个工作日内答复你的问题。

Please post your questions in the comments below. We'll answer them swiftly.