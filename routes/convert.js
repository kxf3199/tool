var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log("convert");
  res.render('convert', { title: '欢迎使用长输管道工具'});
});
module.exports = router;
