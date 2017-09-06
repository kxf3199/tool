var express = require('express');
var router = express.Router();
const fs = require('fs');
var path = require('path');
var multipart=require('connect-multiparty');
var multipartMiddleware=multipart();
var xlsx=require('xlsx');
var config_db=require('./../public/javascripts/config.js');
var mssql_hander=require('./../public/javascripts/db/db_mssql');
var mssql=require('mssql');
/* GET home page. */
router.post('/',multipartMiddleware,function(req, res, next) {
    //console.log(req.body);
	//console.log(req.files);
   //if (req.body.table_name!=undefined) {
    if (req.body.func=='readDB') {
        var strTabName=req.body.table_name;
        console.log(strTabName);
        var o={
            "table_name":strTabName,
            "status":"OK"
        }
        get_table_info(strTabName,"sqlserver",function(err,rs){
            if (rs) {
                //console.log(rs);
                res.send(rs);
            }else{
                //console.log(rs);
                res.send(err);

            }
        })
        
  // }else if (req.body.upfile!=undefined) {
    }else if (req.body.func=='upfile') {
        //获取上传的文件的文件名和绝对路径,注意先引入fs和path模块
        var oriNameOfFile = req.files.upfile.originalFilename || path.basename(req.files.upfile.ws.path);
        var oriPathOfFile = req.files.upfile.path;

        var workbook = xlsx.readFile(oriPathOfFile);
        var sheetNames = workbook.SheetNames; 
        //var wsname = wb.SheetNames[0];
        var ws = workbook.Sheets[sheetNames[0]];

            /* generate HTML */
        var ops={
            header:"<div class='out_table'>",
            footer:"</div>"
        }
        var HTML = xlsx.utils.sheet_to_html(ws,ops); 
        res.end(HTML);
   //}else if (req.body.import_data!=undefined) {
   }else if (req.body.func=='upData') {
        var data=req.body.import_data;
        var dataObj=JSON.parse(data);
        if (dataObj.table_name==undefined) {
            res.send("err");
        }else
        {
            console.log(dataObj.table_name);
            insertDB(dataObj.table_name,dataObj,function(err,rs){
                console.log(err);
                console.log(rs);
            });
            console.log(data);
             res.send("ok");
        }
        
   }
	
});

    router.get('/', function(req, res, next) {      
  res.render('upload', { title: '欢迎使用长输管道工具'});
});


function get_table_info(tabName,dbType,func)
{   
    var sql;
    if (dbType=="sqlserver") {
        sql="SELECT\
         (case when a.colorder=1 then isnull(j.F_TITLE,'') else '' end)   AS F_TABLE_TITLE , \
             a.colorder as F_FLD_ORDER,  \
             a.name as F_FLD_NAME,  \
             (case when COLUMNPROPERTY( a.id,a.name,'IsIdentity')=1 then 1 else 0 end) as F_IDENTITY,  \
             (case when (SELECT count(*) FROM sysobjects  \
                             WHERE (name in  \
                                     (SELECT name FROM sysindexes   \
                                     WHERE (id = a.id)  AND (indid in  \
                                             (SELECT indid FROM sysindexkeys  \
                                               WHERE (id = a.id) AND (colid in  \
                                                 (SELECT colid FROM syscolumns  \
                                                 WHERE (id = a.id) AND (name = a.name))  \
                                 )))))   \
                 AND (xtype = 'PK'))>0 then 1 else 0 end) as F_PK,\
         b.name as F_FLD_TYPE,  \
         a.length as F_SIZE,  \
         COLUMNPROPERTY(a.id,a.name,'PRECISION') as  F_LENGTH,  \
         isnull(COLUMNPROPERTY(a.id,a.name,'Scale'),0) as F_DECIAML_DIGITS,  \
         (case when a.isnullable=1 then 1 else 0 end) as F_ISNULL,  \
         isnull(e.text,'') as F_DEFAULT,  \
         isnull(k.F_TITLE,'')  AS F_FLD_DESC\
         FROM syscolumns a left join systypes b   \
         on a.xtype=b.xusertype  \
         inner join sysobjects d   \
         on a.id=d.id and d.xtype='U' and d.name<>'dtproperties'  \
         left join syscomments e  \
         on a.cdefault=e.id  \
         left join sys.extended_properties g  \
         on a.id=g.major_id AND a.colid = g.minor_id \
        left JOIN T_TAILOR_FORM j ON j.F_FORMNAME='{table_name}'\
        LEFT JOIN T_TAILOR_FIELD k ON k.F_FORMID=j.F_ID AND k.F_FIELDNAME=a.name\
         WHERE d.name='{table_name}'\
         order by a.id,a.colorder"
    };
    sql=sql.replace(/{table_name}/g,tabName);
    console.log(sql);
    var rs=[];
    mssql_hander.initConfigObj(config_db.get_db_cfg());
    mssql_hander.query(sql,function(err,res){
        if (err) {
            console.log(err);
            return false;
        }
        var recordsets=res.recordset;
        //console.log(recordsets)
        func(err,recordsets);
    })
    
}

function insertDB(tabName,data,func){
    console.log("insertDB:"+tabName);
    const table = mssql_hander.createTab(tabName);
    if (table) {
        //console.log(table);
    }else
    {
        console.log("table is not create!");
        func("err");

    }
    //new mssql.Table('tabName') // or temporary table, e.g. #temptable 
    table.create = true;
    data.fields.forEach(function(o,p,q){//分别对应：数组元素，元素的索引，数组本身
        var colName=o;
        var colType=data.field_type[colName];
        if (colType=='numeric'||colType=='decimal'||colType=='smallint'||colType=='int') {
            colType=mssql.Int;
        }else if (colType=='varchar'||colType=='char') {
            colType=mssql.NVarChar;
        }else if (colType=='datetime'||colType=='date'||colType=='time') {
            colType=mssql.DateTime;
        }else if (colType=='binary'||colType=='varbinary') {
            colType=mssql.VarBinary;
        }else {
            colType=mssql.NVarChar;
        }
        table.columns.add(colName, colType, {nullable: false})
    });
    var features=data.features;
    features.forEach(function(f,index,fs){//分别对应：数组元素，元素的索引，数组本身
        var args=[];
        data.fields.forEach(function(o){
            args.push(f.o);
        });
        table.rows.add(args);
    });
    console.log(table);
    mssql_hander.bulkInsert(table,(err, result) => {
        // ... error checks  
        func(err,result);          
    });
}
module.exports = router;
