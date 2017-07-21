var express = require('express');
var router = express.Router();
var config_db=require('./../public/javascripts/config.js');
var db_config_all={};
var db_config_cur={};
if (config_db) {
	db_config_all=config_db.get_all_db_cfg();
	db_config_cur=config_db.get_db_cfg();
}
function get_config()
{
	db_config_all=config_db.get_all_db_cfg();
	db_config_cur=config_db.get_db_cfg();	
}

/* GET home page. */
router.get('/', function(req, res, next) {
	get_config();
  res.render('dbconfig', 
  	{ title: '欢迎使用长输管道工具',
  	db_config_all:db_config_all,
  	db_config_cur:db_config_cur
  	});
});
router.post('/', function(req, res, next) {
  if (req.body) {
  	var db=req.body;
  	console.log(db);
    if (db.func=="修改") {
      config_db.set_db_cfg(db.user,db.password,db.db_name,db.ip,db.port,db.db_type,function(err,had,rs){
      if(rs) 
      { 
        get_config();
        res.render('dbconfig', 
        { title: '欢迎使用长输管道工具',
        db_config_all:db_config_all,
        db_config_cur:db_config_cur
        });
  /*
        var obj={};
        if (had) {
          obj.func="update";
        }else
          obj.func="add"; 
        obj.cfg=rs;        
        res.end(JSON.stringify(obj));
        */
       
      } else  {
       console.log(err);
      }
    });
    }else if (db.func=="删除") {
        config_db.del_db_cfg(db.db_name,function(err,rs)
        {
          if(rs){
            get_config();
            res.render('dbconfig', 
            { title: '欢迎使用长输管道工具',
            db_config_all:db_config_all,
            db_config_cur:db_config_cur
            });
          }else{
            res.setHeader('content-type', 'text/html');
            res.write('<head><meta charset="utf-8"/></head>');
            res.end(JSON.stringify(err));
            console.log(err);
          }
            
        });
    }
  	
  }
});


module.exports = router;