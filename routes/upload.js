var express = require('express');
var router = express.Router();
const fs = require('fs');
var path = require('path');
var multipart=require('connect-multiparty');
var multipartMiddleware=multipart();
var xlsx=require('xlsx');
var config_db=require('./../public/javascripts/config.js');
var mssql_hander=require('./../public/javascripts/db/db_mssql');
/* GET home page. */
router.post('/',multipartMiddleware,function(req, res, next) {
    //console.log(req.body);
	//console.log(req.files);
   if (req.body.table_name!=undefined) {
        var strTabName=req.body.table_name;
        console.log(strTabName);
        var o={
            "table_name":strTabName,
            "status":"OK"
        }
        get_table_info(strTabName,"sqlserver",function(err,rs){
            if (rs) {
                console.log(rs);
                res.send(rs);
            }else{
                console.log(rs);
                res.send(err);

            }
        })
        
   }else if (req.files!=undefined) {
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
   }
	//console.log(req.body.socket);
   /* //
	var socket=req.body.socket;
	console.log(socket);
	if (socket) {
		socket.emit('message',"传输完成");
	}
    */
	//将表单中name是name_txt的input元素中的文本内容取出
    //var txtFromFront = req.body.name_txt;

    
    //console.log(socket)
    //console.log(HTML);
    //console.log(sheetNames);

    /*
    var exBuf=fs.readFileSync(oriPathOfFile);
    ejsExcel.getExcelArr(exBuf).then(exlJson=>{
    console.log("************  read success:getExcelArr");
    let workBook=exlJson;
    let workSheets=workBook[0];
    workSheets.forEach((item,index)=>{
            console.log((index+1)+" row:"+item.join('    '));
    })
}).catch(error=>{
    console.log("************** had error!");
    console.log(error);
});
*/
    //读取和输出文件到目标路径
    /*
    fs.readFile(oriPathOfFile,function (err, data) {
		console.log(data);
    });
    */
   
   //res.render('upload',
            //{ title: '欢迎使用长输管道工具',HTML:HTML});
        /*
        get_weld_info(function(err,welds){
        //var strweld=JSON.stringify(welds);
        //var weldBuf=new Buffer(strweld);  
        //console.log(weldBuf); 
        res.render('pipedata-weld',
            { title: '欢迎使用长输管道工具'
            ,welds:welds});
        }); 
        */
    
 	//res.end("1");
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
        var recordsets=res[0];
        //console.log(recordsets)
        func(err,recordsets);
    })
    
}
module.exports = router;
