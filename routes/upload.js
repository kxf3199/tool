var express = require('express');
var router = express.Router();
const fs = require('fs');
var path = require('path');
var multipart=require('connect-multiparty');
var multipartMiddleware=multipart();
var xlsx=require('xlsx');

/* GET home page. */
router.post('/', multipartMiddleware,function(req, res, next) {
	console.log(req.files);
	//console.log(req.body.socket);
   /* //
	var socket=req.body.socket;
	console.log(socket);
	if (socket) {
		socket.emit('message',"传输完成");
	}
    */
	//将表单中name是name_txt的input元素中的文本内容取出
    var txtFromFront = req.body.name_txt;

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
   res.end(HTML);
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
module.exports = router;
