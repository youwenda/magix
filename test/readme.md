## Test BootStrap

## 安装
```
#克隆仓库
git clone http://gitlab.alibaba-inc.com:hubo.hb/tests.git

#安装依赖
npm install 

#全局装一下totoro
npm install totoro -g 
```

## 开始开发
```
./start
```
这样会启动karma和本地服务，会提示打开runner.html，编辑`*Spec.js`和`../src/.js`并且保存，runner.html会自动刷新

## 添加测试文件
测试文件名必须是`xxSpec.js`这样的格式

## 目录说明

```
.
├── Gruntfile.js         grunt文件，自动刷新runner.html
├── karma.conf.js        karma配置文件
├── lib                  测试库
│   ├── expect
│   ├── jquery-1.7.2.min.js
│   ├── jquery.simulate.js
│   └── mocha
├── mainSpec.js          主测试文件
├── node_modules
├── package.json         当前包信息
├── readme.md            正在看的此文件
├── runner.html          在浏览器里看的测试文件
├── start.bat            windows 下的开始文件
├── start.sh             *inux 下的开始文件
└── totoro-config.json   totoro的配置文件

7 directories, 11 files
```

## 相关资料

* [mocha](http://visionmedia.github.io/mocha)
* [expect](https://github.com/LearnBoost/expect.js)
