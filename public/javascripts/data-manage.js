var config_db=require('./config.js');
var mssql_hander=require('./db/db_mssql');

var sql_pipelod="SELECT a.f_id AS view_id,c.f_id AS use_id,c.F_NAME AS line_name,a.F_points AS points,a.F_FILENAME AS texture,a.f_enterid AS enterid,\
a.F_WIDTH AS lod_width,a.F_REPEAT AS repeat,a.F_SPEED AS speed,a.F_WIDTH2 AS land_width,a.F_LON,a.F_LAT,a.F_HEIGHT,\
c.F_WULXL,c.F_START_MILE,c.F_END_MILE FROM T_VO_PIPELOD a \
INNER JOIN t_uovo_link b ON b.f_viewobjid=a.F_ID AND b.f_viewobjtype=196608 \
LEFT JOIN T_UO_LP_ZHANL c ON c.F_ID=b.f_useobjid";

var sql_weld="SELECT   f_id,f_name,f_lon,f_lat,f_height,f_enterid,f_mile,f_qiangj,f_hougj,f_maish FROM t_uo_lp_weld order by f_id";

var data_manage={};


data_manage.get_weld_info=function(socket,func){
	var rs=[];
	var rsSend=[];
	mssql_hander.initConfigObj(config_db.get_db_cfg());
	//console.log(config_db.get_db_cfg());	
	mssql_hander.query(sql_weld,function(err,res){
		if (err) {
			console.log(err);
			return false;
		}
		var recordsets=res[0];
		var nCount=0;
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
			rsSend.push(weld_obj);
			nCount++;
			if (nCount>=500) {
				if (socket) {
					socket.emit('post-welddata',rsSend);   //分批发送，避免数据过大阻塞浏览器
					rsSend.splice(0,rsSend.length);
					nCount=0;
				}

			}
			
		
			
		}
		func(err,rs);
	})
}



data_manage.get_pipelod_info=function(func){
	var rs=[];
	mssql_hander.initConfigObj(config_db.get_db_cfg());
	//console.log(config_db.get_db_cfg());	
	mssql_hander.query(sql_weld,function(err,res){
		if (err) {
			console.log(err);
			return false;
		}
		var recordsets=res[0];
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



module.exports=data_manage;