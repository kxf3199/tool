var express = require('express');
var router = express.Router();
var config_db=require('./../public/javascripts/config.js');
var mssql_hander=require('./../public/javascripts/db/db_mssql');
//console.log(config_db.get_db_cfg());
//

function get_enter_info(func)
{	
	var rs=[];
	mssql_hander.initConfigObj(config_db.get_db_cfg());
	//console.log(config_db.get_db_cfg());
	mssql_hander.query('SELECT f_id,f_name,f_parentid FROM t_r_enterprise',function(err,res){
		if (err) {
			console.log(err);
			return false;
		}
		var recordsets=res.recordset;
		//console.log("get_enter_info:"+JSON.stringify(recordsets));
		for (var item in recordsets) {
			var enter_obj={
						"id":recordsets[item].f_id,
						"parent_id":recordsets[item].f_parentid,
						"name":recordsets[item].f_name
					}
			if(!addEnter(enter_obj,rs))
				rs.push(enter_obj);
			
		}
		func(err,rs);
	})
	
}


/* GET home page. */
router.get('/', function(req, res, next) {	

	get_enter_info(function(err,enter_tree){
		res.render('enterprise', 
  			{ title: '欢迎使用长输管道工具',
  				enter_rs:enter_tree});

	}); 
});


function addEnter(enter,enters)
{
	//var bFind=false;
	for(var item in enters)
	{
		if (enters[item].id==enter.parent_id) 
		{
			if (!enters[item].son) enters[item].son=[];			
			enters[item].son.push(enter);
			//bFind=true;
			//break;
			return true;
		}
		if(enters[item].son)
		{
			if(!addEnter(enter,enters[item].son)) 
				continue;
			else
				return true;
		}
	}
	return false;
	//if (!bFind) enters.push(enter);
	//console.log(enters);
}

module.exports = router;
