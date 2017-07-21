const fs = require('fs');
var path = require('path');
const { URL } = require('url');
var strPath=path.join(__dirname, "./../../config.json");
const config_file_url = strPath;
//const config_file_url = new URL("file:///"+path.join(__dirname, "./../../config.json"));

var cfg={};



//console.log(config_json);
	var config_buffer=fs.readFileSync(config_file_url);

//var config_str=JSON.stringify(config_buffer);

	var config_json=JSON.parse(config_buffer.toString());
function readConfig(){
	config_buffer=fs.readFileSync(config_file_url);
	config_json=JSON.parse(config_buffer.toString());
};


cfg.get_db_cfg=function(){

	if (config_json) {
	var config_db=	config_json.db_config;
	var cur_db_name=config_db.db_name;
	var config_all=cfg.get_all_db_cfg();
	for (var i = 0; i < config_all.length; i++) {
			if(config_all[i].name==cur_db_name)
				return config_all[i].config;
		}		
	}	
	return null;
};
cfg.get_all_db_cfg=function(){
	if (config_json) {	
	return config_json.db_config.db_info;
	}	
};
var rtCFG={};
rtCFG.db_config={
		db_name:"system",
		db_info:[{
			db_type:"sqlserver",
			user: "cnooc",
			password: "cnooc2008",
			database:"westpipe",
			server: "127.0.0.1", 
			port:"1433",
			encrypt: true
		}]
	}

cfg.set_db_cfg=function(user,password,database,server,port,type,func){
	var err;
	var bHadCfg=false;
	if(user.replace(/(^s*)|(s*$)/g, "").length==0) {
		err='用户名不能为空';
		func(err,bHadCfg,"");
		return ;
	};	
	if(password.replace(/(^s*)|(s*$)/g, "").length==0){
		err='密码不能为空';
		func(err,bHadCfg,"");
		return ;
	};	
	if(database.replace(/(^s*)|(s*$)/g, "").length==0){
		err='连接的数据库不能为空';
		func(err,bHadCfg,"");
		return ;
	};	
	if(server.replace(/(^s*)|(s*$)/g, "").length==0){
		err='数据库IP不能为空';
		func(err,bHadCfg,"");
		return ;
	};	
	if (type.replace(/(^s*)|(s*$)/g, "").length==0) {
		err='数据库类型没有输入，默认：sqlserver';
		type='sqlserver'
	}
	if(port.replace(/(^s*)|(s*$)/g, "").length==0){
		err='端口号没有输入，将采用默认：sqlserver:1433,oracle:1521';
		if (type=='sqlserver') 
			port=1433;
		else if (type=='oracle') 
			port=1521;
	};	
	if (config_json) {
		var config_db=config_json.db_config;
		//console.log(config_db);
		
		var dbs=config_db.db_info;
		
		for (var i = 0; i < dbs.length; i++) {
			var db=dbs[i];
			if (db.name==database) {
				bHadCfg=true;
				db.config.db_type=type;
				db.config.user=user;
				db.config.password=password;
				db.config.server=server;
				db.config.port=port;
				break;
			}
		};		
		config_db.db_name=database;
		if (!bHadCfg) {
			var db={};
			db.name=database;
			db.config={};
			db.config.database=database;
			db.config.db_type=type;
			db.config.user=user;
			db.config.password=password;
			db.config.server=server;
			db.config.port=port;
			config_db.db_info.push(db);
		};	

	}else{
		var db=rtCFG.db_config.db_info[0];
		db.database=database;
		db.db_type=type;
		db.user=user;
		db.password=password;
		db.server=server;
		db.port=port;
		rtCFG.db_config.name=database;
		config_json=rtCFG;
	}
	//console.log(config_file_url);
	//console.log(config_json);

	var content=JSON.stringify(config_json);
	fs.writeFileSync(config_file_url,content);
	readConfig();
	func(err,bHadCfg,config_json);

}
cfg.del_db_cfg=function(database,func){
	if (config_json) {
		var config_db=config_json.db_config;
		//console.log(config_db);
		var bHadCfg=false;
		var dbs=config_db.db_info;
		if ( dbs.length<=1) {
			err="只有一组配置，不能删除！";
			func(err,false);
			return ;
		}
		for (var i = 0; i < dbs.length; i++) {
			var db=dbs[i];
			if (db.name==database) {
				bHadCfg=true;
				dbs.splice(i,1);				
				break;
			}
		};
		config_db.db_name=dbs[0].name;
		var content=JSON.stringify(config_json);
		fs.writeFileSync(config_file_url,content);
		readConfig();
		if (bHadCfg) {
			func("",true);
		}else
			func("不存在要删除的数据库实例配置",false);
		
	}


}
module.exports=cfg;