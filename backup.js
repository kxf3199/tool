
    <script type="text/javascript">
    
    	var welds;
      function init(){
      //var json= '<%- locals.ssids %>';
        welds= '<%- JSON.stringify(welds) %>';
        //welds= '<%- welds.toString() %>';        
        welds=JSON.parse(welds);
        var cs = new table({
		    "tableId":"uo_weld",  //必须
		    "headers":["序号","焊缝名称","经度","纬度","高程","埋深","里程","前钢管","后钢管"],  //必须
		    "data":welds,    //必须
		    "displayNum": 20,  //必须  默认 10
		    "groupDataNum":10 //可选  默认 10
		});
		
        /*
        var table=document.getElementById("uo_weld");
       	welds.forEach(function(weld){
        	var tr=document.createElement("tr");
        	var td=document.createElement("td");        	
        	td.innerHTML=weld.id;
        	tr.append(td);
        	var td0=document.createElement("td");        	
        	td0.innerHTML=weld.name;
        	td0.setAttribute("class","td_name")
        	tr.append(td0);
        	var td1=document.createElement("td");
        	td1.innerHTML=weld.f_lon;        	
        	tr.append(td1);
        	var td2=document.createElement("td");
        	td2.innerHTML=weld.f_lat;
        	tr.append(td2);
        	var td3=document.createElement("td");
        	td3.innerHTML=weld.f_height;
        	tr.append(td3);
        	var td4=document.createElement("td");
        	td4.innerHTML=weld.maish;
        	tr.append(td4);
        	var td5=document.createElement("td");
        	td5.innerHTML=weld.mile;
        	tr.append(td5);
        	var td6=document.createElement("td");
        	td6.innerHTML=weld.qiangj;
        	tr.append(td6);
        	var td7=document.createElement("td");
        	td7.innerHTML=weld.hougj;
        	tr.append(td7);        	
        	table.append(tr);
        });
      */
    };
  
    </script>