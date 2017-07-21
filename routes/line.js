var express = require('express');
var router = express.Router();
var config_db=require('./../public/javascripts/config.js');
var mssql_hander=require('./../public/javascripts/db/db_mssql');
//console.log(config_db.get_db_cfg());
//
function get_line_info(func){
	var ssids=[];

	mssql_hander.initConfigObj(config_db.get_db_cfg());

	mssql_hander.query('SELECT  a.F_ID AS ssid,a.F_NAME AS ssid_name,b.F_ID AS wulxl,b.f_name AS wulxl_name  FROM T_UO_LP_ZHANL a, T_UO_LP_WULXL b WHERE a.F_WULXL=b.F_ID',function(err,res){
		if (err) {
			console.log(err);
			return;
		}
		var recordsets=res[0];
		//console.log(recordsets);
		for (var item in recordsets) {
			var ssid_obj={
						"id":recordsets[item].ssid,
						"ssid_name":recordsets[item].ssid_name,
						"wulxl":recordsets[item].wulxl,
						"wulxl_name":recordsets[item].wulxl_name
					}
				ssids.push(ssid_obj);
			
		}
		func(err,ssids);
	})
}


/* GET home page. */
router.get('/', function(req, res, next) {
	get_line_info(function(err,line_tree){
		res.render('line',
  			{ title: '欢迎使用长输管道工具',
  				ssids:line_tree});

	}); 
});


module.exports = router;
