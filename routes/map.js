var express = require('express');
var router = express.Router();

/*
mssql_hander.initConfigObj(db_config.db_config());

mssql_hander.query('SELECT*FROM t_r_user WHERE F_ID=1100',function(err,res){
	if (err) {
		console.log(err);
		return;
	}
	console.log(res);
})
*/
/* GET home page. */
router.get('/map_bd', function(req, res, next) {
  res.render('map_bd', { title: '欢迎使用长输管道工具'});
});

router.get('/map_gd', function(req, res, next) {
  res.render('map_gd', { title: '欢迎使用长输管道工具'});
});
module.exports = router;
