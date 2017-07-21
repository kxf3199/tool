// JavaScript Document
function get_file_path()
{
	var file=document.getElementById("excel_file");
	file.select();
	file.blur();
	file.value=document.selection.createRange().text
	if(file.files)
	{	if(file.files.item(0)){
		url=file.files.item(0).getAsDataURL();
		}
	}
}
var srcObj_td=document.getElementById("excel_field");
var dstObj_td=document.getElementById("table_field");
function get_src_td(ev)
{
	if(srcObj_td)
	{
		srcObj_td.bgColor="";
		}
	srcObj_td=ev.target;
	srcObj_td.bgColor="#F00";
}
function get_dst_td(ev)
{
	if(dstObj_td)
	{
		dstObj_td.bgColor="";
		}
	dstObj_td=ev.target;
	dstObj_td.bgColor="#0F0";
}
function src_dst()
{
	if(bRead==false)
	{
		read_excel();
	}
	if(srcObj_td)
	{	
		var nIndex=srcObj_td.parentNode.rowIndex;
		var objTmp=dstObj_td.innerHTML;
		dstObj_td.innerHTML=srcObj_td.innerHTML;
		srcObj_td.innerHTML=objTmp;
		if(!srcObj_td.innerHTML)
		{
			srcObj_td.parentNode.parentNode.deleteRow(nIndex);
			}
	}
	if(dstObj_td.innerHTML!=""&&dstObj_td.innerHTML!="&nbsp;")
	{
		//var nIndex=dstObj_td.parentNode.rowIndex;
		var nIndex=dstObj_td.cellIndex;
		table_fields.table_fields[nIndex-1].LinkExcel=dstObj_td.innerHTML;
	}
	
}



/*
function allowDrop(ev)
{
	ev.preventDefault();
}
function drag(ev)
{
	//ev.dataTransfer.setData("test",ev.target.innerHTML);
	srcObj_td=ev.target;
	}
function drop(ev)
{
	ev.preventDefault();
	dstOBJ_td=ev.target;
	var txt=srcObj_td.innerHTML;
	srcObj_td.innerHTML=dstOBJ_td.innerHTML;
	dstOBJ_td.innerHTML=txt;
	//var data=ev.dataTransfer.getData("test");
	//ev.target.innerHTML=data;
}
*/
