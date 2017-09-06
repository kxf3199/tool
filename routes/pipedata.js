var express = require('express');
var router = express.Router();
var config_db=require('./../public/javascripts/config.js');
var mssql_hander=require('./../public/javascripts/db/db_mssql');

router.get('/', function(req, res, next) {
	console.log(req.query);
	if (req.query.table=="T_VO_PIPELOD") {
		get_pipelod_info(function(err,midlines){
			console.log(midlines);
		res.render('pipedata-midline',
  			{ title: '欢迎使用长输管道工具',
  				midlines:midlines});
		}); 
	}else if (req.query.table=="t_uo_lp_weld") {

		res.render('pipedata-weld',
  			{ title: '欢迎使用长输管道工具'});
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
	}
});


router.post('/', function(req, res, next) {
	console.log("req.body");
	console.log(req.body);
	res.end("1");
  });


var sql_pipelod="SELECT a.f_id AS view_id,c.f_id AS use_id,c.F_NAME AS line_name,a.F_points AS points,a.F_FILENAME AS texture,a.f_enterid AS enterid,\
a.F_WIDTH AS lod_width,a.F_REPEAT AS repeat,a.F_SPEED AS speed,a.F_WIDTH2 AS land_width,a.F_LON,a.F_LAT,a.F_HEIGHT,\
c.F_WULXL,c.F_START_MILE,c.F_END_MILE FROM T_VO_PIPELOD a \
INNER JOIN t_uovo_link b ON b.f_viewobjid=a.F_ID AND b.f_viewobjtype=196608 \
LEFT JOIN T_UO_LP_ZHANL c ON c.F_ID=b.f_useobjid";

var sql_weld="SELECT   f_id,f_name,f_lon,f_lat,f_height,f_enterid,f_mile,f_qiangj,f_hougj,f_maish FROM t_uo_lp_weld order by f_id";

function get_pipelod_info(func)
{	
	var rs=[];
	mssql_hander.initConfigObj(config_db.get_db_cfg());
	//console.log(config_db.get_db_cfg());	
	mssql_hander.query(sql_pipelod,function(err,res){
		if (err) {
			console.log(err);
			return false;
		}
		var recordsets=res.recordset;
		for (var item in recordsets) {
			if (recordsets[item].texture.indexOf('\\')>0) {
				console.log(recordsets[item].texture.indexOf('\\'));
				var str=recordsets[item].texture;
				str.replace(/\\/,'/');
				console.log(str);
			}
			var midline_obj={
						"v_id":recordsets[item].view_id,
						"u_id":recordsets[item].use_id,
						"name":recordsets[item].line_name,
						//"points":recordsets[item].points,				
						//"texture":recordsets[item].texture,
						"enterid":recordsets[item].enterid,
						"lod_width":recordsets[item].lod_width,
						"land_width":recordsets[item].land_width,
						"repeat":recordsets[item].repeat,
						"speed":recordsets[item].speed,
						"f_lon":recordsets[item].F_LON,
						"f_lat":recordsets[item].F_LAT,
						"f_height":recordsets[item].F_HEIGHT,
						"f_wulxl":recordsets[item].WULXL,
						"f_start_mile":recordsets[item].START_MILE,
						"f_end_mile":recordsets[item].END_MILE
					}
			rs.push(midline_obj);
			
		}
		func(err,rs);
	})
	
	
}

function get_weld_info(func){
	var rs=[];
	mssql_hander.initConfigObj(config_db.get_db_cfg());
	//console.log(config_db.get_db_cfg());	
	mssql_hander.query(sql_weld,function(err,res){
		if (err) {
			console.log(err);
			return false;
		}
		var recordsets=res.recordset;
		for (var item in recordsets) {			
			var weld_obj={						
						"id":recordsets[item].f_id,
						"name":recordsets[item].f_name,						
						//"enterid":recordsets[item].f_enterid,						
						"f_lon":recordsets[item].f_lon,
						"f_lat":recordsets[item].f_lat,
						"f_height":recordsets[item].f_height,
						"maish":recordsets[item].f_maish,
						"mile":recordsets[item].f_mile,
						"qiangj":recordsets[item].f_qiangj,
						"hougj":recordsets[item].f_hougj
						
					}
			rs.push(weld_obj);
			
		}
		func(err,rs);
	})

}








module.exports = router;