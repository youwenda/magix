---
layout: post
title: View关系可视化工具
---


## 方式一(推荐) ##

在页面中直接引用http://thx.github.io/magix/assets/helper.js
如

```html
<script src="http://g.tbcdn.cn/??kissy/k/1.4.5/seed.js,thx/brix/2.1.0/brix.js" data-config="{debug:true,combine:false}"></script>


<script type="text/javascript" src="http://thx.github.io/magix/assets/helper.js"></script>
```

**注意**
把helper.js放到kissy的seed.js后面

## 方式二 ##

添加以下链接到书签

<a href="javascript:void((function(d,s){s=d.createElement('script');s.src='http://thx.github.io/magix/assets/helper.js';d.body.appendChild(s)}(document)))">Magix Helper</a>

然后在使用Magix的页面上点击该书签即可