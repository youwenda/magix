---
layout: post
title: 使用者 - Who's Using
---

<div class="dib-box justify whos-using">
  {% for category in site.categories %}{% if category[0] == 'whos-using' %}
  {% for post in category[1] %}
  <div class="dib">
    <a href="{{ post.homepage }}">
      {% if post.logo %}<img alt="{{ post.title }}" src="{{ post.logo }}">{% endif %}
      {% if post.iconfont %}{{ post.iconfont }}{% endif %}
    </a>
  </div>
  {% endfor %}
  {% endif %}{% endfor %}
</div>

## Demo via [Mock.js](http://mockjs.com)

以下为产品演示，数据由 Mock.js 模拟。

- [DMP Demo](http://thx.alibaba-inc.com/dmp_demo/)