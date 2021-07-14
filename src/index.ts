import UpInfo from "node-upinfo";
const Util = require('util');
const mysql = require('mysql');
import md5 = require("md5");
import { promises } from "fs";
export default class Mysql78 {
    _pool: any;//���ӳ�
    _host: string;//��������ַ
    isLog: boolean;//�Ƿ�׷�ٵ��ü�¼(Ĭ��д��sys_warn�� ��Ӱ������)
    isCount: boolean;//�Ƿ���ü���(Ĭ��д��sys_sql�� ��Ӱ������)
    /*
     * ��Сʾ��
     *let  config={host:"127.0.0.1",password:"test",database:"testdb"}
     * 
     */ 
    constructor(config: any) {
        
        this._host = config["host"] || "127.0.0.1"; 
        let port:number = config.port || 3306;
        let max: number = config.max || 200;
        let user: string = config.user || "root";
        this.isLog = config.isLog || false;
        this.isCount = config.isCount || false;

        this._pool = mysql.createPool({
            'connectionLimit': max,
            'host': this._host,
            'port': port,
            'user': user,
            'password': config.password,
            'database': config.database
            , 'dateStrings': true
            , 'connectTimeout': 30 * 1000
        });
    }
    /**
     * ����ϵͳ���ñ�
     * Create system common table
     * 
     * */
      creatTb(up: UpInfo): Promise<any> {
        let self = this;
        return new Promise(function (resolve, reject) {
            //sys_warn  :Save system debugging information
            let cmdtext = "CREATE TABLE IF NOT EXISTS `sys_warn` (  `uid` varchar(36) NOT NULL DEFAULT '',  `kind` varchar(100) NOT NULL DEFAULT '',  `apisys` varchar(100) NOT NULL DEFAULT '',  `apiobj` varchar(100) NOT NULL DEFAULT '',  `content` text NOT NULL,  `upid` varchar(36) NOT NULL DEFAULT '',  `upby` varchar(50) DEFAULT '',  `uptime` datetime NOT NULL,  `idpk` int(11) NOT NULL AUTO_INCREMENT,  `id` varchar(36) NOT NULL,  `remark` varchar(200) NOT NULL DEFAULT '',  `remark2` varchar(200) NOT NULL DEFAULT '',  `remark3` varchar(200) NOT NULL DEFAULT '',  `remark4` varchar(200) NOT NULL DEFAULT '',  `remark5` varchar(200) NOT NULL DEFAULT '',  `remark6` varchar(200) NOT NULL DEFAULT '',  PRIMARY KEY (`idpk`)) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;";
            self.doM(cmdtext, [], up)
            //sys_sql: Save SQL statistics
            cmdtext = "CREATE TABLE IF NOT EXISTS `sys_sql` (  `cid` varchar(36) NOT NULL DEFAULT '',  `apiv` varchar(50) NOT NULL DEFAULT '',  `apisys` varchar(50) NOT NULL DEFAULT '',  `apiobj` varchar(50) NOT NULL DEFAULT '',  `cmdtext` varchar(200) NOT NULL,  `uname` varchar(50) NOT NULL DEFAULT '',  `num` int(11) NOT NULL DEFAULT '0',  `dlong` int(32) NOT NULL DEFAULT '0',  `downlen` int(32) NOT NULL DEFAULT '0',  `upby` varchar(50) NOT NULL DEFAULT '',  `cmdtextmd5` varchar(50) NOT NULL DEFAULT '',  `uptime` datetime NOT NULL,  `idpk` int(11) NOT NULL AUTO_INCREMENT,  `id` varchar(36) NOT NULL,  `remark` varchar(200) NOT NULL DEFAULT '',  `remark2` varchar(200) NOT NULL DEFAULT '',  `remark3` varchar(200) NOT NULL DEFAULT '',  `remark4` varchar(200) NOT NULL DEFAULT '',  `remark5` varchar(200) NOT NULL DEFAULT '',  `remark6` varchar(200) NOT NULL DEFAULT '',  PRIMARY KEY (`idpk`),  UNIQUE KEY `u_v_sys_obj_cmdtext` (`apiv`,`apisys`,`apiobj`,`cmdtext`) USING BTREE) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;";
            self.doM(cmdtext, [], up)
            
        });
    }

    /**
     * sql get����
     * @param cmdtext sql���
     * @param values ����
     * @param up �û��ϴ�������(��Ҫ������־)
     */
    doGet(cmdtext: string, values: string[], up: UpInfo): Promise<any> {
        values = values || [];
    
        let debug = (up&&up.debug) || false;
        let self = this;

        return new Promise(function (resolve, reject) {
            let dstart = new Date();
            self._pool.getConnection(function (err, client) {
                if (err) {
                    console.error(new Date() + 'mysql pool getcon Error: ' + Util.inspect(err));
                    reject(err);
                    return;
                }
               
                client.query(cmdtext, values, function (err, back) {
                    if (debug) {
                        //console.log(cmdtext + " v:" + values.join(",") + " r:" + Util.inspect(back));

                        self._addWarn(Util.inspect(back) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
                    }
                    //client.release();//.end()
                    self._pool.releaseConnection(client);
                    if (err) {
                        //console.error(new Date() + 'mysql GetData Error: ' + cmdtext + Util.inspect(err));
                        self._addWarn(Util.inspect(err) + " c:" + cmdtext + " v" + values.join(","), "err_" + up.apisys, up);

                        reject(err);
                        return;
                    }
                    else {
                        if (!back) {
                            back = [];
                        }  
                        //����Ϊ��ȥ�����һ������
                        var str = JSON.stringify(back);
                        let lendown = str.length;
                        back = JSON.parse(str);

                        self._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);
                        resolve(back);
                    }
                });
            });
        });
    };

    /**
     * ���񷵻ز����ɹ� ��ʧ����Ϣ
     * @param cmds ���������
     * @param values �������
     * @param errtexts ���������ʾ
     * @param logtext log��
     * @param logvalue log��
     * @param up �û��ϴ�
     */
    doT(cmds: string[], values: string[][], errtexts: string[]
        , logtext: string, logvalue: string[], up: UpInfo): Promise<any> { 
        let debug = (up&&up.debug) || false; 
        let self = this;
        return new Promise((resolve, reject) => {
            this._pool.getConnection((err, con) => {
                if (err) {
                    //console.error(new Date() + 'mysql pool getcon Error: ' + Util.inspect(err));
                    reject(err);
                    return;
                }
                let dstart = new Date();
                con.beginTransaction((err) => {
                    if (err) throw err;

                    let promises: Promise<any>[] = [];
                    for (var i = 0; i < cmds.length; i++) {
                        promises.push(self.doTran(cmds[i], values[i], con, up));
                    }
                    Promise.all(promises).then((back: any[]) => { 
                        self._saveLog(logtext, logvalue, new Date().getTime() - dstart.getTime(), 1, up);
                        var errmsg = "err!";
                        var haveAff0 = false;
                        for (var i = 0; i < back.length; i++) {
                            if (back[i].affectedRows === 0) {
                                errmsg += errtexts[i];
                                //errmsg += i;
                                haveAff0 = true;
                                break;
                            }
                        }
                        if (haveAff0 || back.length < cmds.length) {
                            con.rollback();
                            con.release();
                            resolve(errmsg);
                            return;
                        }
                        con.commit();
                        con.release();
                        resolve("ok");
                    }).catch(function (err) {
                        //console.log(err);
                        resolve(err);
                        //reject(err);
                    })
                });
            });
        }); 
    }

    /**
     * sql update���� ������Ӱ������
     * @param cmdtext sql���
     * @param values ����
     * @param up �û��ϴ�����
     */
    doM(cmdtext: string, values: string[], up: UpInfo): Promise<string | number> {
        const self = this;
        let debug: boolean =(up&& up.debug) || false;

        return new Promise(function (resolve, reject) {
            let dstart = new Date();
            self._pool.getConnection(function (err, client) {
                if (err) {
                    reject(err);
                    return;
                }
                client.query(cmdtext, values, function (err, results) {
                    //client.release();//.end()
                    self._pool.releaseConnection(client);
                    if (err) {
           
                        //console.error(new Date() + 'mysql doM Error: ' + cmdtext + Util.inspect(err) + Util.inspect(values));
                        self._addWarn(Util.inspect(err) + " c:" + cmdtext + " v" + values.join(","), "err" + up.apisys, up);

                        resolve(0);
                    }
                    else {
                       //����Ϊ��ȥ�����һ������
                        let str = JSON.stringify(results);
                        let lendown = str.length;
                        results = JSON.parse(str);
                        self._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);
                        resolve(results.affectedRows);
                    }
                    if (debug) {
                        //console.log(cmdtext + " v:" + Util.inspect(values) + " r:" + Util.inspect(results));
                        self._addWarn(Util.inspect(results) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
                    }
                });
            });
        });
    }

    /**
     * ����һ�� ���ز�����к�   
     * @param cmdtext
     * @param values
     * @param up
     */
    doMAdd(cmdtext: string, values: string[], up: UpInfo): Promise<string | number> {
        const self = this;
        let debug: boolean = (up&&up.debug) || false;

        return new Promise(function (resolve, reject) {
            let dstart = new Date();
            self._pool.getConnection(function (err, client) {
                if (err) {
                    reject(err);
                    return;
                }
                client.query(cmdtext, values, function (err, results) {
                    //client.release();//.end()
                    self._pool.releaseConnection(client);
                    if (err) {
                       
                  
                         console.error(new Date().format() + 'mysql doMAdd Error: ' + cmdtext + Util.inspect(err) + Util.inspect(values));
                        self._addWarn(Util.inspect(err) + " c:" + cmdtext + " v" + values.join(","), "err" + up.apisys, up);

                        resolve(0);
                    }
                    else {
                        //����Ϊ��ȥ�����һ�� 
                        let str = JSON.stringify(results);
                        let lendown = str.length;
                        results = JSON.parse(str);
                        self._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);
                        resolve(results.insertId);
                    }
                    if (debug) {
                        //console.log(cmdtext + " v:" + Util.inspect(values) + " r:" + Util.inspect(results));
                        self._addWarn(Util.inspect(results) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
                    }
                });
            });
        });
    }

 
    /**
     * �����װ һ����ִ��(һ�㲻�� doT���� )
     * ��Ҫ�Լ��ͷ�����
     * �����и��ӵĳ�����Ҫ�õ� �����һ��ִ�гɹ� ����ʲô��������� ����Ҫ�ع�����
     * @param cmdtext
     * @param values
     * @param con
     * @param up
     */
    doTran(cmdtext: string, values: string[], con: any, up: UpInfo): Promise<any> {
        let debug = (up&&up.debug) || false;
        return new Promise(function (resolve, reject) {
            con.query(cmdtext, values, function (err, result) {
                if (debug) {
                    //console.log(cmdtext + " v:" + values.join(",") + " r:" + Util.inspect(result));
                }

                if (err) {
                    //console.error('mysql doTran Error: ' + Util.inspect(err));
                    reject(Util.inspect(err));
                    return;
                }
                else
                    resolve(result);
            });
        });

    };

    /**
     * doget doM����Ҫ�ֶ��ͷ�
     * getConnection����Ҫ
     * */
    releaseConnection(client:any): Promise<any> {
        let self = this;
        return new Promise(function (resolve, reject) {
            self._pool.releaseConnection(client);
            resolve("ok")
        })
    }
    /**
     * ��ȡ����(�ǵ��ͷ�)
     * */
    getConnection(): Promise<any> {
        let self = this;
        return new Promise(function (resolve, reject) { 
            self._pool.getConnection(function (err, client) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(client)
            })
        })
    }
     

    /**
     * debug���� ׷��SQL���� ���ߵ�������(�����ø����û�����Ŀ¼������)
     * �򿪻�Ӱ������ ������Ҫ���ٿ�����Ա�����ڿ�����Ŀ¼ 
     * ����sys_warn ��������ں�����
     * @param info log
     * @param kind �����ѯlog
     * @param up �û��ϴ�����
     */
    _addWarn(info: string, kind: string, up: UpInfo): Promise<any> {
        let self = this;

        return new Promise(function (resolve, reject) {
            if (!self.isLog) {
                resolve("isLog is false");
                return;
            }
            let cmdtext = "INSERT INTO sys_warn (`kind`,apisys,apiobj,`content`,`upby`,`uptime`,`id`,upid)VALUES(?,?,?,?,?,?,?,?)";
            let values = [kind, up.apisys, up.apiobj, info, up.uname, up.uptime, up.getNewid(), up.upid];
            self._pool.getConnection(function (err, client) {
                if (err) {
                    reject(err);
                    return;
                }
                client.query(cmdtext, values, function (err, results) {
                    //client.release();//.end()
                    self._pool.releaseConnection(client);
                    if (err) {
                        //console.error(new Date() + 'mysql doM Error: ' + cmdtext + Util.inspect(err) + Util.inspect(values));
                        reject(err);
                    }
                    else {
                        try {
                            //����Ϊ��ȥ�����һ������
                            let str = JSON.stringify(results); 
                            results = JSON.parse(str);
                            resolve(results.affectedRows);
                        }
                        catch (e) {
                            //console.log(kind + "mysql78__addWarn:" + info);
                            resolve("0");
                        }
                    }
                });
            });
        });
        /*
         * CREATE TABLE `sys_warn` (
  `uid` varchar(36) NOT NULL DEFAULT '',
  `kind` varchar(100) NOT NULL DEFAULT '',
  `apisys` varchar(100) NOT NULL DEFAULT '',
  `apiobj` varchar(100) NOT NULL DEFAULT '',
  `content` text NOT NULL,
  `upid` varchar(36) NOT NULL DEFAULT '',
  `upby` varchar(50) DEFAULT '',
  `uptime` datetime NOT NULL,
  `idpk` int(11) NOT NULL AUTO_INCREMENT,
  `id` varchar(36) NOT NULL,
  `remark` varchar(200) NOT NULL DEFAULT '',
  `remark2` varchar(200) NOT NULL DEFAULT '',
  `remark3` varchar(200) NOT NULL DEFAULT '',
  `remark4` varchar(200) NOT NULL DEFAULT '',
  `remark5` varchar(200) NOT NULL DEFAULT '',
  `remark6` varchar(200) NOT NULL DEFAULT '',
  PRIMARY KEY (`idpk`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;
         */
    }

    
    /**
     * ͳ�ƹ���(����sys_sql ��������ں����� �򿪻�Ӱ������)
     * @param cmdtext SQL���
     * @param values ֵ
     * @param dlong ��ʱ
     * @param lendown �����ֽ�
     * @param up �û��ϴ�����
     */
    _saveLog(cmdtext: string, values: string[], dlong: number, lendown: number, up: UpInfo ): Promise<any> {
        let self = this;
       
        return new Promise(function (resolve, reject) { 
            if (!self.isCount) {
                resolve("isCount is false");
                return;
            }
            self._pool.getConnection(function (err, client) {
                if (err) {
                    reject(err);
                    return;
                }
             
                let cmdtextmd5 = md5(cmdtext); 
                let sb = "INSERT INTO sys_sql(apiv,apisys,apiobj,cmdtext,num,dlong,downlen,id,uptime,cmdtextmd5)VALUES(?,?,?,?,?,?,?,?,?,?)"
                    + "ON DUPLICATE KEY UPDATE num=num+1,dlong=dlong+?,downlen=downlen+?";
                client.query(sb, [up.apiv, up.apisys, up.apiobj, cmdtext, 1, dlong, lendown, up.getNewid(), new Date(), cmdtextmd5
                    , dlong, lendown], function (err, results) {
                        //client.release();//.end()
                        self._pool.releaseConnection(client);
                        if (err) {
                            //console.error(new Date() + 'mysql _saveLog Error: ' + cmdtext + Util.inspect(err) + Util.inspect(values));
                            reject(err);
                            return;
                        }
                        else
                            resolve("ok");
                    });
            });
        });

         /*
         * CREATE TABLE `sys_sql` (
  `cid` varchar(36) NOT NULL DEFAULT '',
  `apiv` varchar(50) NOT NULL DEFAULT '',
  `apisys` varchar(50) NOT NULL DEFAULT '',
  `apiobj` varchar(50) NOT NULL DEFAULT '',
  `cmdtext` varchar(200) NOT NULL,
  `uname` varchar(50) NOT NULL DEFAULT '',
  `num` int(11) NOT NULL DEFAULT '0',
  `dlong` int(32) NOT NULL DEFAULT '0',
  `downlen` int(32) NOT NULL DEFAULT '0',
  `upby` varchar(50) NOT NULL DEFAULT '',
  `cmdtextmd5` varchar(50) NOT NULL DEFAULT '',
  `uptime` datetime NOT NULL,
  `idpk` int(11) NOT NULL AUTO_INCREMENT,
  `id` varchar(36) NOT NULL,
  `remark` varchar(200) NOT NULL DEFAULT '',
  `remark2` varchar(200) NOT NULL DEFAULT '',
  `remark3` varchar(200) NOT NULL DEFAULT '',
  `remark4` varchar(200) NOT NULL DEFAULT '',
  `remark5` varchar(200) NOT NULL DEFAULT '',
  `remark6` varchar(200) NOT NULL DEFAULT '',
  PRIMARY KEY (`idpk`),
  UNIQUE KEY `u_v_sys_obj_cmdtext` (`apiv`,`apisys`,`apiobj`,`cmdtext`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;
         */
    }
}