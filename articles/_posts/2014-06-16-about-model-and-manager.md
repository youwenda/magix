---
layout: post
title: Magix中的Model和ModelManager
---

# Model
---

 1. 对IO（Ajax）的进一步封装
 2. 对返回数据统一格式化
 3. 数据的载体
 4. 各种错误(Error)或异常(Exception)的提前处理
 5. 流程控制的支持

## 返回数据统一格式化

项目中与多个部门合作，比如直通车报表要与量子团队合作，直通车里面数据返回的格式如下：

```js
{
    code:200,
    message:'success',
    result:{
        //...
    }
}
```

量子团队返回的则如下：

```js
{
    ok:true,
    msg:'',
    data:{
        //...
    }
}
```

如果开发者直接使用如KISSY.io请求接口，则开发者要自已处理不同团队接口的差异问题。使用Model则可以统一在sync方法里进行转换处理，如：

```js
return Model.extend({
    sync:function(callback){
        KISSY.io({
            //...
            complete:function(data,msg,xhr){
                if(data){
                    if(data.hasOwnProperty('ok')){//量子
                        data={//对量子的接口进行适配
                            code:data.ok?200:600,
                            message:data.msg,
                            result:data.data
                        };
                    }
                    callback(null,data);
                }else{
                    callback(msg);
                }
            }
        });
    }
});
```

`KISSY.io未看到相关便利的做法`
`关于格式转换在KISSY mvc中也有相应的实现：http://docs.kissyui.com/1.4/docs/html/api/mvc/Model.html#mvc.Model.config.parse`

## 错误异常的提前处理

 1. http请求错误(404,500)
 2. 业务处理失败(异常)

做为开发者，没必要把过多的精力放在这种错误或异常上面，如原来的这种代码：

```js
KISSY.io({
    //...
    success: function(resp) {
        if (resp.info.ok) {
            Helper.showHandleTip('发送激活邮件成功！');
            vom.getElementById(self.vcid).mountView(self.viewName, self.options);
        } else {
            Helper.showHandleTip('发送激活邮件失败：' + resp.info.message, 'error');
        }
    },
    error: function(resp) {
        Helper.showHandleTip('发送激活邮件失败：' + resp.info.message, 'error');
    }
});
```

在项目级别，我们应该对错误统一处理或简单处理，无须开发者把精力过多的放在各种错误上，所以使用Model的开发是这样的：

```js
Manager.fetchAll('Send_Mail',function(error,model){
    if(error){
        Helper.showHandleTip('发送激活邮件失败：' + error.msg, 'error');
    }else{
        Helper.showHandleTip('发送激活邮件成功！');
        vom.getElementById(self.vcid).mountView(self.viewName, self.options);
    }
});
```

相应的Model.sync实现是这样的：

```js
return Model.extend({
    sync:function(callback){
        KISSY.io({
            //...
            complete:function(data,msg,xhr){
                if(data){
                    if(data.hasOwnProperty('ok')){//量子
                        data={//对量子的接口进行适配
                            code:data.ok?200:600,
                            message:data.msg,
                            result:data.data
                        };
                    }
                    if(data.code==200){//业务处理成功
                        callback(null,data);
                    }else{//业务处理失败
                        callback(data.message);
                    }
                }else{//http请求失败
                    callback(msg);
                }
            }
        });
    }
});
```

如上，当业务处理失败的情况比较多时，更应该在某个地方统一处理，从而让开发者更专注业务的开发，而非错误的处理。

如直通车中的code约定

```js
/**
 * 应用中约定的code
 * @type {Object}
 */
var AppCode = {
    OK: 200,
    ERROR: 600,
    LOGIN: 601,
    NEXTCHECK: 603,

    BPLOGIN: 606, //登录taobao但未登录bp,遇到606时登录一次bp

    STARSHOPCLOSE: 612,
    VCODE: 701,

    REDIRECT: 702
};
/**
 * 详细映射
 * @type {Object}
 */
var AppCodeMap = {
    1: AppCode.OK, //报表接口 0 1表示
    0: AppCode.ERROR, //报表
    200: AppCode.OK, //正常
    302: AppCode.OK, //业务中需要重定向到url或弹出的页面url
    601: AppCode.LOGIN, //需要重新登录
    600: AppCode.ERROR, //业务异常
    606: AppCode.BPLOGIN, // 登陆淘宝但未登录直通车code
    609: AppCode.ERROR, //接口临时关闭
    612: AppCode.ERROR, //明星店铺关闭
    603: AppCode.NEXTCHECK,
    701: AppCode.VCODE, //验证码
    702: AppCode.REDIRECT //临时跳转
};
```

## 流程控制的支持

需求：当用户修改计划标题时，防止恶意调用修改接口，在单位时间内做次数限制，当超出限制后，前端弹出验证码验证，验证成功后继续提交

前面提到model是数据的载体，当前model要提交的各种参数信息都在model对象上，所以当检测到需要输入验证码时，可以很方便的把当前model对象保存下来，然后开始验证码的流程，验证成功后取出刚才保存的model对象，再请求一次即可。



# ModelManager
---

 1. 接口的集中管理
 2. 方便的接口数据缓存(cache属性)
 3. 单个接口的特殊定制
 4. 统一的使用方式
 5. 接口依赖(*)
 6. 接口combo(*)

## 接口的特殊定制

在项目中会遇到请求本域的接口和跨域的接口，个人认为不管是哪种形式的接口，开发者无须关心，就像处理错误和异常一样，也应该在某个地方统一处理，最终到业务代码只需要简单的接口调用即可

所以在ModelManager注册接口时，可以对接口进行定制如:

```js
var Manager=BaseManager.create(Model);
Manager.registerModels([{
    name:'Send_Mail',
    url:'/api/mail/send'
},{
    name:'Read_Msg_Count',
    url:'msgcenter/count/:userid',
    jsonp:true//使用jsonp
}]);
```

在相应的Model.sync方法里去根据是否有jsonp属性决定如何请求：

```js
return Model.extend({
    sync:function(callback){
        var params={
            //...
        };
        if(this.get('jsonp')){//根据是否有jsonp属性决定如何请求
            params.jsonp='callback';
            params.dataType='jsonp';
        }
        KISSY.io(params);
    }
});
```

最终使用时：

```js
Manager.fetchAll(['Send_Mail','Read_Msg_Count'],
    function(e,mailModel,countModel){
    //...
});
```

无须关心接口是怎么请求的

当然，这样做对最终开发者隐藏了很多细节，不清楚请求是采用哪种形式。个人认为最终开发者更应该关心数据和业务的实现，有些细节是可以隐藏的。关于调试，Magix仍需努力

类似的方案中Backbone,KISSY MVC或多或少的都隐藏了一些细节，比如Backbone中，对数据保存只需要调用model.save即可，具体的请求，仍需追踪到model.sync方法，进而到Backbone.sync，最后才进入到jQuery的ajax方法中。

## 接口依赖

业务场景：

```
应用服务器A，日志服务器B。
A服务器提供一个用户信息接口(IUserInfo)，返回用户ID，token等

当查看日志列表时(ILogList)，以JSONP的方式向B服务器发请求，并要求带上用户ID，token等信息
```

实现方案一：

```js
//...
render:function(){
    var r=Manager.fetchAll('IUserInfo',function(e,m){
        //...
        return m.get('info',{});
    });
    r.next(function(info){
        r.fetchAll('ILogList',function(e,m){

        });
    });
}
```

实现方案二：

```js
//...
render:function(){
    Manager.fetchAll('ILogList',function(e,m){
        //...
    });
}

//---------------

Manager.registerModels([{
    name:'IUserInfo',
    cache:true
},{
    name:'ILogList',
    deps:['IUserInfo'],
    before:function(m,deps){
        m.setUrlParms('userId','');
    }
}]);
```

 1. 开发时你最关注的是什么？你的目标是什么？
 2. 如果项目中多处用到ILogList接口怎么办？



## 接口combo

考虑一次请求多个接口：

```js
render:function(){
    Manager.fetchAll(['A','B','C'],function(e,ma,mb,mc){

    });
}
```

或许会请求如下的3个接口：

```html
http://domain.com/api/a.json
http://domain.com/api/b.json
http://domain.com/api/c.json
```

类似KISSY在use时的combo，或许我们可以将请求的3个接口combo成

```html
http://domain.com/api/??a.json,b.json,c.json
```

借助ModelManager，开发者无须关心接口是否combo，就像使用KISSY的use方法，不管combo与否，你都能正确的拿到模块。同样，使用ModelManager，你也可以拿到对应的model

