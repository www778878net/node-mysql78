# node-mysql78  

>+ 十八年ERP开发经验 十年云开发经验 十五年股票期货投资经验 十年投资分析平台开发经验
>+ 18 years ERP development experience + 10 years cloud development experience +15 years stock futures investment experience + 10 years investment analysis platform development experience
>+ 技术不高 了解业务 擅长解决生产经营实际问题
>+ Good understanding of business and solid knowledge on Solving practical problems 
>+ 逐步把多年开发优化 并且在一直稳定运行中的项目开源
>+ Step by Step Open Sources of steady running projects and consistently optimize them.
>+ 合作 商务 问题 讨论 欢迎联系email:657225485@qq.com qq群:323397913
>+ Welcome to contact my email : 657225485@qq.com or join QQ group : 323397913 for further discuss and cooperations 
>+ [完整框架 开源改造中 未完成...](https://github.com/www778878net/NODE78)
>+ [The open source transformation of the total framework has not yet been completed.](https://github.com/www778878net/NODE78)


>## 框架特色 Frame features
>+ 稳定:运行数年 二台单核1G机器搞定数千并发 
>+ Stable: running for several years on two 1 core CPU 1G memory machines with thousands of concurrency
>+ 开发快:几行代码搞定增删查改 线程池
>+ Fast development:with just a few lines code,you can add, delete, check and change the thread pool
>+ 效率高:有完善的低代码前后端框架 在框架下开发 1后端可轻松配合4前端以上
>+ High efficiency: Perfect low code front and back end framework developed under the framework 1 back end can easily match 4 front end above
>+ 易扩展:业务表与数据表对应 一个目录就是一套小功能 一个文件就是一个数据表
>+ Easy to expand: business table is corresponding with data table , a directory is a set of small functions , a file is a data table
>+ 适应强:同时运行在阿里云和腾迅云 
>+ Strong adaptability: running on Ali cloud and Tecent cloud.
>+ 易调试:可设置追踪某几个用户或某表或某目录的所有调用
>+ Easy to debug: can be set up to trace a few users or a table or a directory of all calls
>+ 易学习:十行代码搞定 想装不会都难
>+ Easy to learn: ten lines of code can be done.
>+ 易运维:有完善的api调用计数和耗时统计 还有出错微信报警机制
>+ Easy operation and maintenance: perfect API call count and time consuming statistics, also  alarm mechanism on wechat
>+ 更新快:主要运营中的项目 如有bug或新功能 必然及时更新
>+ Update quickly: as its main operation projects, will update in time If there is a new bug or new function
>+ 易重构:一个目录一个小系统 一个版本一个路径 新旧api可长期共存 边开车边换胎
>+ Easy to refactor: one directory --one system, one path --one version -- old and new APIs can coexist for a long time. you can Changing tires while driving.
>+ SAAS:同表不同权 完善权限控制 用户只能查询到自己或自己帐套的资料
>+ SAAS:Users with different rights in the same table can only query their own data or their own account sets.

>## 安装 install
```
npm i node-mysql78

```

>## 使用 use   for testing, you can see ./test/test.js.
>>### 初始化 init
```
import Mysql from "node-mysql78";
let  config={host:"127.0.0.1",password:"test",database:"testdb"}
let mysql78 = new Mysql78(config);
```

>>### create test table 
```
CREATE TABLE `test` (
  `cid` varchar(36) NOT NULL,
  `kind` varchar(100) NOT NULL,
  `item` varchar(200) NOT NULL,
  `data` varchar(500) NOT NULL,
  `upby` varchar(50) NOT NULL,
  `uptime` datetime NOT NULL,
  `idpk` int(11) NOT NULL AUTO_INCREMENT,
  `id` varchar(36) NOT NULL,
  PRIMARY KEY (`idpk`),
  UNIQUE KEY `ix_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

```

>>### add
```
let up = new UpInfo().getGuest();//Simulated guest upload
       
let sb = "insert into test(cid,kind,item,data,upby,uptime,id)SELECT ?,?,?,?,?,?,?"
let insertId=await mysql78.doMAdd(sb, ["cidval", "kindval", "itemval"
    , "dataval",   up.uname, up.utime, up.mid],up) 
```

>>### select
```
let up = new UpInfo().getGuest();//Simulated user upload
   
let sb = "select * from test where id=?" 
let tb=await mysql78.doGet(sb, ["id"],up)
```

>>### update
```
let up = new UpInfo().getGuest();//Simulated user upload
   
let sb = "update test set data=? where idpk=?"
let tmp=await mysql78.doM(sb, [up.mid,1], up)
```

>>### The SQL transaction
```
let up = new UpInfo().getGuest();//Simulated user upload
let cmds = ["update test set data=? where idpk=?"
    , "update test set item=? where idpk=?"
]
let values = [[up.getNewid(), "1"]
    , [up.getNewid(), "2"]]
let errtexts = ["If the first command goes wrong, what do we want to see."
    , "What do we want to see if the second command fails."]
let logtext = "What do we want to write in the past journal. Just like a normal call's  cmdText.  "
let logvalues = ["Just like a normal call's  val1", "Just like a normal call's  val2"]

let tmp=await mysql78.doT(cmds, values, errtexts, logtext, logvalues, up)
//tmp="ok" or errtext
```

>>### create system table
```
let up = new UpInfo().getGuest();//Simulated user upload
mysql78.creatTb(up ) 
```

***
>## 框架简要说明
>![后端服务](https://github.com/www778878net/node-date78/blob/main/assets/pic/services.jpeg)
>![后端代码示例](https://github.com/www778878net/node-date78/blob/main/assets/pic/nodejs.png)
>![前端代码示例](https://github.com/www778878net/node-date78/blob/main/assets/pic/js.png)



***
# 以下为非必需内容
+[read more...](https://github.com/www778878net/node-mysql78/READMORE.md)