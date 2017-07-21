// JavaScript Document
//默认获取t_uo_lp_*表单
function get_table_list(){
	var service={
			"service_id": "process_data_tool.get_table_list",
           "sql":"select * from T_UO_TYPE_TABLE_REL WHERE F_TABNAME LIKE upper('%t_uo_lp%')",
		   		
		}
	var callback={
		"callbackdata": "$callback_data$",
               "function_name": "callback_table_list",
               "service_id":"page.call_function"
		
		}	
	resafety_call(service, callback);
	}
	
function callback_table_list(cbs)
{
	var table_list =cbs.callbackdata;
	var data_list=document.getElementById("table_list");
	var obj=eval('('+table_list+')');
	var length=data_list.options.length;
	for(var n=0;n<length;n++)
	{
		if(n!=0)
			data_list.options.remove(1);
		}
	for (var k in obj.table_list)
	{
		var option=document.createElement("option");
		option.value=obj.table_list[k];
		option.label=obj.table_list[k];
		option.innerText=obj.table_list[k];
		option.innerHtml=obj.table_list[k];
		data_list.appendChild(option);
		
		}		
}
//获取指定表的字段以及类型
var table_fields;
function callback_table_field(cbs)
{
	var table_field =cbs.callbackdata;
	var tabObj=document.getElementById("table_field");
	table_fields=eval('('+table_field+')');
	//$(#"table_field").remove();
	for(var i=tabObj.rows.length;i>0;i--)
	{
		tabObj.deleteRow(i-1);
	}
	//添加第一行表单描述
	var trTable=document.createElement("tr");
	var tdKey=document.createElement("td");
	var tdValue=document.createElement("td");
	tdKey.innerHTML="表单描述";
	tdValue.innerHTML=table_fields.table_title;
	trTable.appendChild(tdKey);
	trTable.appendChild(tdValue);
	tabObj.appendChild(trTable);
	//添加第二行字段描述
	var field_obj=table_fields.table_fields[0];
	var trField=document.createElement("tr");
	  for (var item in field_obj) 
	  {
		  var thHead=document.createElement("th");
		  thHead.innerHTML=item;
          trField.appendChild(thHead);
         }
	var thLink=document.createElement("th");
	thLink.innerHTML="关联Excel";
	trField.appendChild(thLink);
	tabObj.appendChild(trField);	
	for (var k in table_fields.table_fields)
	{
		var trJson=table_fields.table_fields[k];
		var trObj=document.createElement("tr");
	  for (var item in trJson) 
	  {
		  var tdObj=document.createElement("td");
		  tdObj.innerHTML=trJson[item];
          trObj.appendChild(tdObj);
         }
		var tdLink=document.createElement("td");
		tdLink.innerHTML="&nbsp;";
		tdLink.onclick=function ()
		{get_dst_td(event)};
		trObj.appendChild(tdLink);	
		tabObj.appendChild(trObj);
		}	
		table.box.value=table_fields.table_name;	
}
function get_table_field(){
	
var service={
			"service_id": "process_data_tool.get_table_field",
           "table_name":document.table.box.value,
		   		
		}
	var callback={
		"callbackdata": "$callback_data$",
               "function_name": "callback_table_field",
               "service_id":"page.call_function"
		
		}	
	resafety_call(service, callback);

}
//获取excel表名称以及第一列列题
function get_excel_info(){
	
var service={
			"service_id": "process_data_tool.open_excel",
		   		
		}
	var callback={
		"callbackdata": "$callback_data$",
               "function_name": "callback_excel_info",
               "service_id":"page.call_function"
		
		}	
	resafety_call(service, callback);

}
var excel_path;
var bRead;
function callback_excel_info(cbs)
{
	var callbackdata=cbs.callbackdata;
	var b='\\\\';
	var data=callbackdata.replace(/\\/g,b);
	var obj_data=toJson(data);
	//var obj_data=eval('('+data+')');
	var obj=document.getElementById("file_name");
	obj.value=obj_data.file_path;
	excel_path=obj.value;
	bRead=false;
	var excel_field=document.getElementById("excel_field");
	excel_field.deleteRow(1);
	for (var k in obj_data.column_names)
	{
		var field_obj=obj_data.column_names[k]
		var tr=document.createElement("tr");
		var tdName=document.createElement("td");
		tdName.innerHTML=field_obj;	
		tdName.text=field_obj;	
		/*tdName.draggable="true";	
		tdName.ondrop="drop(event)";
		tdName.ondragover="allowDrop(event)";
		tdName.ondragstart="drag(event)";*/
		tdName.onclick=function ()
		{get_src_td(event)};
		tr.appendChild(tdName);
		excel_field.appendChild(tr);
		}	
}
//向三维发送读取Excel命令
function read_excel()
{
	
var service={
			"service_id": "process_data_tool.read_excel",
		   	"file_path":excel_path
		}	
	resafety_call(service);
	bRead=true;
}
function toJson(str){
	var json=(new Function("return"+str))();
	return json;
}
//指定Excel的列插入指定的表单中
function import_db()
{
	var tabObj=document.getElementById("table_field");
	var nSize=tabObj.rows.length;
	/*
	var fieldJson="[";
	for(var j =1;j<nSize;j++)
	{
		fieldJson+="{\"Field\":\"";
		fieldJson+=data_field.rows[j].cells[0].innerHTML;
		fieldJson+="\"\,";
		fieldJson+="\"Type\":\"";
		fieldJson+=data_field.rows[j].cells[2].innerHTML;
		fieldJson+="\"\,";
		fieldJson+="\"Link\":\"";
		fieldJson+=data_field.rows[j].cells[3].innerHTML;
		fieldJson+="\"}\,";
	}
	fieldJson=fieldJson.substring(0,fieldJson.length-1);
	fieldJson+="]";
	fieldJson=eval('('+fieldJson+')');
	*/
	var trObj=tabObj.rows[1];
	var nColumn=trObj.cells.length;
	for(var j =2;j<nSize;j++)
	{		
		var tdLink=tabObj.rows[j].cells[nColumn-1];
		var linkText=tdLink.innerHTML;
		if(linkText!="&nbsp;")
		{
			table_fields.table_fields[j-2].LinkExcel=linkText;
		}
	}
	var service={
			"service_id": "process_data_tool.import_db",
		   	"fields":table_fields.table_fields,
			"table":document.table.box.value
		}
	resafety_call(service);
}