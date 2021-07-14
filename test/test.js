'use strict';
const expect = require('chai').expect;
const Mysql = require('../dist/index').default;
const UpInfo = require('node-upinfo').default
var iconv = require('iconv-lite');
var fs = require('fs'); 
console.log(process.argv)
var fspath = process.argv[3]
var config = loadjson(fspath);
console.log(config)
function loadjson(filepath) {
    var data;
    try {
        var jsondata = iconv.decode(fs.readFileSync(filepath, "binary"), "utf8");
        data = JSON.parse(jsondata); 
    }
    catch (err) {
        console.log(err);
    }
    return data;
}
let mysql78 = new Mysql(config["mysql"]);
 
describe('test doT ', () => {
    it(' return ok', () => {
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

        return mysql78.doT(cmds, values, errtexts, logtext, logvalues, up).then(function (result) {
            expect(result).to.equal("ok");
        })
        
        //done(); // 通知Mocha测试结束
    });
});

describe('test creatTb ', () => {
    it(' return anything', () => { 
        const result = 1; 
       mysql78.creatTb(null ) 
        expect(result).to.equal(1);
        //done(); // 通知Mocha测试结束
    });
});

describe('test select ', () => {
    it('should return 1 row', () => {
        let up = new UpInfo().getGuest();//Simulated user upload
   
        let sb = "select * from test where id=?" 
       return mysql78.doGet(sb, ["id"],up)
            .then(function (tb) {
                console.log(tb)
            let result = tb.length; 
            expect(result).to.equal(1);
        })
  
        //done(); // 通知Mocha测试结束
    });
});

describe('test mAdd ', () => {
    it('should return insertId', () => {
     
        let up = new UpInfo().getGuest();//Simulated guest upload
       
        let sb = "insert into test(cid,kind,item,data,upby,uptime,id)SELECT ?,?,?,?,?,?,?"
        return mysql78.doMAdd(sb, ["cidval", "kindval", "itemval"
            , "dataval",   up.uname, up.utime, up.mid],up)
            .then(function (result) {
                console.log(result)
                //let result = tb.length;
                expect(result).to.be.a('number');
            })

        //done(); // 通知Mocha测试结束
    });
});

describe('test modify ', () => {
    it('should return affectedRows', () => {

        let up = new UpInfo().getGuest();//Simulated guest upload

        let sb = "update test set data=? where idpk=?"
        return mysql78.doM(sb, [up.mid,1], up)
            .then(function (result) {
                console.log(result)
                //let result = tb.length;
                expect(result).to.equal(1);
            })
 
    });
});