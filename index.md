---
layout: post
title: Magix
---

{% include magixBuild.html %}

Magix 适合用来构建大型的，面向前后端开发者以及 IE6 友好的，基于 MVC 结构和 Hash 驱动的
OPOA（One Page One Application）应用。

Magix 对 View 进行了父子结构抽象，通过 VOM（View Object Model）对象，管理带有父子关系的
View 的展示生命周期。

Magix 特别注意避免单页应用的浏览器内存大量积累和内存泄露。包括:

1. 采取Dom节点即用即释放的方法，保障永不持有Dom节点
2. 采用全新的事件代理方案，高效解耦Dom节点与事件响应体

Magix 基于“约定大于配置”设计原则，可以快速构建可扩展的大型单页面Web应用，同时也特别注意
保障可配置性和可扩展性。
