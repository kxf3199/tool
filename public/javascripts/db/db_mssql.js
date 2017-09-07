var mssql=require('mssql');

var sql={};

//连接参数配置
var config={
    user:"cnooc",
    password:"cnooc2008",
    server:"127.0.0.1", // You can use 'localhost\\instance' to connect to named instance
    database:"westpipe",
    stream:false, // You can enable streaming globally
    option:{
     encrypt:true //Use this if you're on Windows Azure
     },
    pool:{
        min:0,
        idleTimeoutMillis:3000
    }
};


sql.sqlserver=mssql;

//sql参数的类型
sql.direction={
    //输入参数
    Input:"input",
    //输出参数
    Output:"output",
    //返回参数
    Return:"return"
};

/**
 * 初始化连接参数
 * @param {string} user 用户名
 * @param {string} password 密码
 * @param {string} server 服务器地址
 * @param {string} database 数据库名称
 */
sql.initConfig=function(user,password,server,database){
    config={
        user:user,
        password:password,
        server:server, // You can use 'localhost\\instance' to connect to named instance
        database:database,
        stream:false,
        /*option:{
         encrypt:true //Use this if you're on Windows Azure
         },*/
        pool:{
            min:0,
            idleTimeoutMillis: 3000
        }
    };
}
sql.initConfigObj=function(config_obj){
    config={
        user:config_obj.user,
        password:config_obj.password,
        server:config_obj.server, // You can use 'localhost\\instance' to connect to named instance
        database:config_obj.database,
        port:config_obj.port,
        stream:false,
        option:{
         encrypt:true //Use this if you're on Windows Azure
         },
        pool:{
            min:0,
            idleTimeoutMillis: 3000
        }
    };
}
/**
 * 执行存储过程
 * @param {string} procedure 存储过程名称
 * @param {JSON} params 存储过程参数
 * params的定义格式如：
    var params={
    //ID是存储过程的第一个参数，要去掉@符号
    ID:{
        //sqlType是该ID参数在sqlserver中的类型
        sqlType:sql.sqlserver.Int,
        //direction是表明ID参数是输入还是输出(output)参数
        direction:sql.direction.Input,
        //该ID参数的值
        inputValue:1
    },
    //Name是存储过程的第二个参数，要去掉@符号
    Name:{
        sqlType:sqlHelper.sqlserver.Int,
        direction:sqlHelper.direction.Output,
        outputValue:null
    }
};
 * @param {function} func 回调函数 共有四个参数 error:错误信息 recordsets:查询的表结果 returnValue:存储过程的返回值 affected:影响的行数
 */
sql.execute=function(procedure,params,func){
    new mssql.ConnectionPool(config).connect().then(pool => {
        // Query
        const request = pool.request();
        if (params != null) {
                    for (var index in params) {
                        if (params[index].direction == sql.direction.Output) {
                            request.output(index, params[index].sqlType);
                        }
                        else {
                            request.input(index, params[index].sqlType, params[index].inputValue);
                        }
                    }
        };
        console.log("execute:procedure"+procedure);
        return request.execute(procedure)
    }).then((error, recordsets, returnValue, affected) => {        
        if (error)
            func(error);
        else {
            for (var index in params) {
                if (params[index].direction == sql.direction.Output) {
                    params[index].outputValue = request.parameters[index].value;
                }
            }
            func(error, recordsets, returnValue, affected);
        }
        mssql.close();
    }).catch(err => {
        // ... error checks
        func(err);
        mssql.close();
    });

};

/**
 * 执行sql文本(带params参数)
 * @param {string} sqltext 执行的sql语句
 * @param {JSON} params sql语句中的参数
 * @param {function} func 回调函数 共有两个参数 error:错误消息 recordsets:查询的结果
 */
sql.queryWithParams=function(sqltext,params,func){
  //console.log(config);
      new mssql.ConnectionPool(config).connect().then(pool => {
        // Query
        const request = pool.request();
        if(params){
            for(var index in params){
                request.input(index,params[index].sqlType,params[index].inputValue);
            }
        }
        console.log("queryWithParams:sqltext"+sqltext);
        return request.query(sqltext)
    }).then(result => {        
        func("",result);
        mssql.close();
    }).catch(err => {
        // ... error checks
        func(err);
        mssql.close();
    });

    mssql.on('error', err => {
        // ... error handler
    });

};

/**
 * 执行sql文本
 * @param {string} sqltext 执行的sql语句
 * @param {function} func 回调函数 共有三个参数 error:错误消息 recordsets:查询的结果 
 */
sql.query=function(sqltext,func){
    //console.log("数据库查询模块：查询语句："+sqltext);
    sql.queryWithParams(sqltext,null,func);
};
sql.createTab=function(tableName)
{
    console.log("createTab:"+tableName);
    if (tableName) {
        return new mssql.Table(tableName);
    }else{        
        return "";
    }
}
/**
 * 执行大批量数据的插入
 * @param {sqlserver.Table} table 需要插入的数据表
 * 数据表的定义如下：
 var table=new sql.sqlserver.Table('UserInfoTest');
 table.create=true;
 table.columns.add('name',sqlHelper.sqlserver.NVarChar(50),{nullable:true});
 table.columns.add('pwd',sqlHelper.sqlserver.VarChar(200),{nullable:true});
 table.rows.add('张1','jjasdfienf');
 table.rows.add('张2','jjasdfienf');
 table.rows.add('张3','jjasdfienf');
 * @param {function} func 回调函数 共有两个参数 error:错误信息 rowcount:插入数据的行数
 */
sql.bulkInsert=function(table,func){
    try{
        if (table) {
            new mssql.ConnectionPool(config).connect().then(pool => {
            // Query
                const request = pool.request();
                //console.log("bulkInsert"+table)
                request.bulk(table, (err, result) => {
                        // ... error checks 
                        func(err, result);
                });
            }).catch(err => {
                // ... error checks
                func(err);
                mssql.close();
            });
        }else
            func(new ReferenceError('table parameter undefined!'));
    }catch (e){
        func(e);
    }

    mssql.on('error', err => {
        // ... error handler
    });
    mssql.close();
};

/**
 * 如果需要处理大批量的数据行，通常应该使用流
 * @param {string} sqltext 需要执行的sql文本
 * @param {JSON} params 输入参数
 * @param {JSON} func 表示一个回调函数的JSON对象，如下所示：
 * {
    error:function(err){
        console.log(err);
    },
    columns:function(columns){
        console.log(columns);
    },
    row:function(row){
        console.log(row);
    },
    done:function(affected){
        console.log(affected);
    }
 */
sql.queryViaStreamWithParams=function(sqltext,params,func){
    config.stream=true;
    new mssql.ConnectionPool(config).connect().then(pool => {
        // Query
        const request = pool.request();
        request.stream=true;// You can set streaming differently for each request
        if(params){
            for(var index in params){
                request.input(index,params[index].sqlType,params[index].inputValue);
            }
        }
        //console.log("queryWithParams:sqltext"+sqltext);
        request.query(sqltext);
        request.on('recordset',function(columns){
                    //columns是一个JSON对象，表示 返回数据表的整个结构，包括每个字段名称以及每个字段的相关属性
                    //如下所示
                    /*
                    { id:
                       {index: 0,
                        name: 'id',
                        length: undefined,
                        type: [sql.Int],
                        scale: undefined,
                        precision: undefined,
                        nullable: false,
                        caseSensitive: false,
                        identity: true,
                        readOnly: true },
                    name:
                        { index: 1,
                            name: 'name',
                            length: 100,
                            type: [sql.NVarChar],
                            scale: undefined,
                            precision: undefined,
                            nullable: true,
                            caseSensitive: false,
                            identity: false,
                            readOnly: false },
                    Pwd:
                        { index: 2,
                            name: 'Pwd',
                            length: 200,
                            type: [sql.VarChar],
                            scale: undefined,
                            precision: undefined,
                            nullable: true,
                            caseSensitive: false,
                            identity: false,
                            readOnly: false } }
                    */
                    func.columns(columns);
                });

        request.on('row', function(row) {
            //row是一个JSON对象，表示 每一行的数据，包括字段名和字段值
            //如 { id: 1004, name: 'jsw', Pwd: '12345678' }
            //如果行数较多，会多次进入该方法，每次只返回一行
            func.row(row);
        });

        request.on('error', function(err) {
            //err是一个JSON对象，表示 错误信息
            //如下所示：
            /*
            { [RequestError: Incorrect syntax near the keyword 'from'.]
                name: 'RequestError',
                    message: 'Incorrect syntax near the keyword \'from\'.',
                code: 'EREQUEST',
                number: 156,
                lineNumber: 1,
                state: 1,
            class: 15,
                serverName: '06-PC',
                procName: '' }
            */
            func.error(err);
        });

        request.on('done', function(affected) {
            //affected是一个数值，表示 影响的行数
            //如 0
            //该方法是最后一个执行
            func.done(affected);
        });
    }).catch(err => {
        // ... error checks
        func(err);
        mssql.close();
    }).finally ( ()=>{
        config.stream=false;
        mssql.close();
    });
    
    mssql.on('error', err => {
        // ... error handler
    });

};

/**
 * 如果需要处理大批量的数据行，通常应该使用流
 * @param {string} sqltext 需要执行的sql文本
 * @param {JSON} func 表示一个回调函数的JSON对象，如下所示：
 * {
    error:function(err){
        console.log(err);
    },
    columns:function(columns){
        console.log(columns);
    },
    row:function(row){
        console.log(row);
    },
    done:function(affected){
        console.log(affected);
    }
 */
sql.queryViaStream=function(sqltext,func){
    sql.queryViaStreamWithParams(sqltext,null,func);
};

sql.transact=function(sqltext,func){

    new mssql.ConnectionPool(config).connect().then(pool =>{
        const transaction = pool.transaction();
        transaction.begin(err => {
        // ... error checks
            if (err) {
                
                return func(err);
            }
            let rolledBack = false
            
            transaction.on('rollback', aborted => {
                // emited with aborted === true 
         
                rolledBack = true
            })
            
            new mssql.Request(transaction)
            .query(sqltext, (err, result) => {
                // insert should fail because of invalid value                 
                if (err) {
                    console.log("transact:err::"+err); 
                    if (!rolledBack) {
                        transaction.rollback(err => {
                            // ... error checks
                            func(err);                        
                        })
                    }
                } else {
                    transaction.commit(err => {
                        // ... error checks 
                    })                
                }
            })
        })
    })
   

}


module.exports=sql;