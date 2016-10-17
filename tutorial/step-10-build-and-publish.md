---
title: 编译, 发布
layout: tutorial

---

# 10. 编译, 发布

项目在本地环境开发完成后, 需要编译发布到生产环境, Magix提供了配套的编译工具, 将源代码编译到可发布状态, 然后修改模块加载器的`basePath`即可

之前的`gulpfile.js`配置了两个编译发布命令:

- `combine`: 编译, 读取`tmpl`目录下的源文件, 编译为模块加载器可识别的模块, 输出到`src`目录
- `build`: 压缩, 将`src`目录下的模块压缩, 输出到`build`目录


# combine编译源文件

`tmpl`目录下的源文件不能直接被模块加载器识别, 模块的模板文件和js文件也是分开的, 不能直接使用.

`combine`命令根据配置将模块编译为目标加载器所需格式, 将模板html文件编译为js文件的对应属性, 这样js文件就可以直接使用模板字符串, 不需要再发送一次请求获取模板, 提高了页面性能, 方便使用.

执行`gulp combine`之后`src`目录下就是完整的模块.

# build压缩文件

`gulp build`将`src`目录下模块压缩, 输出到`build`目录, 供发布上线时使用



# 发布

可以根据实际情况将build目录使用cdn发布或跟随后端代码发布:

- cdn发布

    如果有cdn可以将build目录发布到cdn, 这样从前端性能优化的角度可以获得更好的性能. 在后端配置cdn前缀设置到`basePath`即可.

- 跟随后端代码发布

    如果没有cdn资源, 将build目录跟随后端代码发布到服务器即可, 同样设置项目线上地址前缀到`basePath`. 跟随项目发布性能不如CDN.


# 操作

我们按照以下步骤完成todo app发布：

1. `gulp combine`：打包tmpl下源文件到src目录
2. `gulp build`：将src目录下的文件压缩到build目录
3. 在`index.html`中修改模块加载器配置，指定访问build目录下的文件

        var pathBase = './build/'



