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
 
describe('ts-hi function test', () => {
    it('should return 3', () => {
        const result = 3;// add(1, 1);
        expect(result).to.equal(3);
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