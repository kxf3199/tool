var express = require('express');
var router = express.Router();
var multipart=require('connect-multiparty');
var multipartMiddleware=multipart();


/* GET home page. */
router.post('/', multipartMiddleware,function(req, res, next) {
	console.log(req.body);
	//console.log(req.body.socket);
	//var socket=req.body.socket;
	//console.log(socket);
	//if (socket) {
		//socket.emit('message',"传输完成");
	//}
 	res.end("1");
});
module.exports = router;
