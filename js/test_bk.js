/*function buildHtmlTable(myList) {
	//var columns = addAllColumnHeaders(myList);	
	//var columns = ["timestamp","oemkey","protocolversion","softwareversion","carmodel","carid","rate","speed","lat","lon","context","varid","varvalue","state"];
	var columns  = ["timestamp","protocolversion","carid","lat","lon","context","varid","varvalue"];
	var contexts = ["no_context","vehicle_status","vehicle_info","ivi_radio_xm","ivi_radio_sir","ivi_opticaldrive","ivi_rearsystem","ivi_remote","phone","ams"]
	var vars     = ["no_vars","sir_channel","xm_channel","artist","stitle", "album","sir_radio_id","xm_radio_id","os_level","model", "type","carrier","ams_vol","ams_control","ams_balance","ams_fader","ams_rpresets"]

	var tbody$ = $('<tbody/>');
	
	for (var i = 0 ; i < myList.length ; i++) {
		var row$ = $('<tr/>');
		for (var colIndex = 0 ; colIndex < columns.length ; colIndex++) {
			var cellValue = myList[i][columns[colIndex]];

			if (cellValue == null) { cellValue = ""; }
			
			if (columns[colIndex] == "timestamp") { cellValue = unixTimetoLocaleString(cellValue); }
			if (columns[colIndex] == "context") { cellValue = contexts[cellValue]; }
			if (columns[colIndex] == "varid") { cellValue = vars[cellValue]; }
			
			row$.append($('<td/>').html(cellValue));
		}
		tbody$.append(row$);
	}
	
	$("#dtmtable").append(tbody$);
}*/

function buildHtmlTable(myList) {
	//var columns = addAllColumnHeaders(myList);	
	//var columns = ["timestamp","oemkey","protocolversion","softwareversion","carmodel","carid","rate","speed","lat","lon","context","varid","varvalue","state"];
	var columns  = ["timestamp","protocolversion","carid","lat","lon","context","varid","varvalue"];
	var contexts = ["no_context","vehicle_status","vehicle_info","ivi_radio_xm","ivi_radio_sir","ivi_opticaldrive","ivi_rearsystem","ivi_remote","phone","ams"]
	var vars     = ["no_vars","sir_channel","xm_channel","artist","stitle", "album","sir_radio_id","xm_radio_id","os_level","model", "type","carrier","ams_vol","ams_control","ams_balance","ams_fader","ams_rpresets"]

	$("#dtmlist").children().remove();
	
	for (var i = 0 ; i < myList.length ; i++) {
		
		var row$;
		if (i % 2 == true) { row$ = $('<tr class="odd"/>'); }
		else { var row$ = $('<tr class="even"/>'); }
			
		for (var colIndex = 0 ; colIndex < columns.length ; colIndex++) {
			var cellValue = myList[i][columns[colIndex]];

			if (cellValue == null) { cellValue = ""; }
			
			if (columns[colIndex] == "timestamp") { cellValue = unixTimetoLocaleString(cellValue); }
			if (columns[colIndex] == "context") { cellValue = contexts[cellValue]; }
			if (columns[colIndex] == "varid") { cellValue = vars[cellValue]; }
			
			if (columns[colIndex] == "timestamp") { row$.append($('<td class="center  sorting_1"/>').html(cellValue)); }
			else { row$.append($('<td class="center "/>').html(cellValue)); }
			
		}
		$("#dtmlist").append(row$);
	}
}

function buildHtmlTable2(myList) {
	var columns  = ["timestamp","protocolversion","carid","lat","lon","context","varid","varvalue"];
	var contexts = ["no_context","vehicle_status","vehicle_info","ivi_radio_xm","ivi_radio_sir","ivi_opticaldrive","ivi_rearsystem","ivi_remote","phone","ams"]
	var vars     = ["no_vars","sir_channel","xm_channel","artist","stitle", "album","sir_radio_id","xm_radio_id","os_level","model", "type","carrier","ams_vol","ams_control","ams_balance","ams_fader","ams_rpresets"]

	for (var ind = 0 ; ind < columns.length ; ind++) {
		
	}
	
	var parent = document.getElementById("#dtmlist");
	var child = document.getElementsByTagName("tr");
	//parent.removeChild(child);
	
	for (var i = 0 ; i < myList.length ; i++) {
		
		var row$;
		if (i % 2 == true) { row$ = $('<tr class="odd"/>'); }
		else { var row$ = $('<tr class="even"/>'); }
			
		for (var colIndex = 0 ; colIndex < columns.length ; colIndex++) {
			var cellValue = myList[i][columns[colIndex]];

			if (cellValue == null) { cellValue = ""; }
			
			if (columns[colIndex] == "timestamp") { cellValue = unixTimetoLocaleString(cellValue); }
			if (columns[colIndex] == "context") { cellValue = contexts[cellValue]; }
			if (columns[colIndex] == "varid") { cellValue = vars[cellValue]; }
			
			if (columns[colIndex] == "timestamp") { row$.append($('<td class="center  sorting_1"/>').html(cellValue)); }
			else { row$.append($('<td class="center "/>').html(cellValue)); }
			
		}
		$("#dtmlist").append(row$);
	}
}
		
/*function addAllColumnHeaders(myList)
{
	var columnSet = [];
	var headerThead$ = $('<thead/>');
	var headerTr$ = $('<tr/>');

	for (var i = 0 ; i < myList.length ; i++) {
		var rowHash = myList[i];
		for (var key in rowHash) {
			if ($.inArray(key, columnSet) == -1 && key != "_validators"	&& key != "_skip_validation"){
				columnSet.push(key);
				headerTr$.append($('<th/>').html(key));
			}
		}
	}
	headerThead$.append(headerTr$);
	$("#dtmtable").append(headerThead$);

	return columnSet;
}*/

get_time_int = function (uuid_str) {
	var uuid_arr = uuid_str.split( '-' ),
		time_str = [
			uuid_arr[ 2 ].substring( 1 ),
			uuid_arr[ 1 ],
			uuid_arr[ 0 ]
		].join( '' );
	return parseInt( time_str, 16 );
};

get_date_obj = function (uuid_str) {
	var int_time = this.get_time_int( uuid_str ) - 122192928000000000,
		int_millisec = Math.floor( int_time / 10000 );
	return new Date( int_millisec );
};

function unixTimetoLocaleString(unixtime)
{
	var date = new Date(unixtime * 1000);
	var options = { year: '2-digit', month: '2-digit', day: '2-digit', hour:'numeric', minute:'numeric', second:'numeric', hour12: false, timeZone:'UTC' };
	
	return date.toLocaleString('en-US', options);
};
	 
function showDataTable(url) {
	$.getJSON( url, function( data ) {
		$.each( data, function( key, val ) {
			if (key == 'data'){
				buildHtmlTable(val);
			};
		});
	});
};

//var updateInterval = 30000;//30 seg.
var updateInterval = 10000;//10 seg.
function showWeeklyData() {
	
	$("#gbcars").html('0,1,2,3,4,5,6');
	$("#gbinputs").html('0,1,2,3,4,5,6');
	$("#gbcarmodels").html('0,1,2,3,4,5,6');
	
	function update() {
		showCount("#gncars",     "http://ec2-52-6-129-243.compute-1.amazonaws.com:3000/dtmpackagesv2/0","carid");
		showCount("#gninputs",   "http://ec2-52-6-129-243.compute-1.amazonaws.com:3000/dtmpackagesv2/0","all");
		showCount("#gncarmodels","http://ec2-52-6-129-243.compute-1.amazonaws.com:3000/dtmpackagesv2/0","carmodel");
		//showCount("#gncars",     "http://localhost:3000/dtmpackagesv2/1431468600","carid");
		//showCount("#gninputs",   "http://localhost:3000/dtmpackagesv2/1431468600","all");
		//showCount("#gncarmodels","http://localhost:3000/dtmpackagesv2/1431468600","carmodel");
		setTimeout(update, updateInterval);
	}

	update();
};

function showListData() {
	function update() {
		showDataTable("http://ec2-52-6-129-243.compute-1.amazonaws.com:3000/dtmpackagesv1/JH23N1B452940");	
		//showDataTable("http://localhost:3000/dtmpackagesv1/JH23N1B452940");
		setTimeout(update, updateInterval);
	}
	
	update();
}

function showCount(id,url, vkey) {
	$.getJSON( url, function( data ) {
		$.each( data, function( key, val ) {
			if (key == 'data'){
				$(id).html(''+calculateDistinctCount(val,vkey)+'<i class="icon-arrow-up"></i>');
			};
		});
	});
};

function calculateDistinctCount(data,vkey) {
	var count = 0;
	var distinct = [];
	
	if (vkey == "all") { return data.length; }
	
	for (var i = 0 ; i < data.length ; i++) {
		var cellValue = data[i][vkey];
		
		if (cellValue == null) { cellValue = ""; }
		
		if (cellValue != "" && distinct.indexOf(cellValue) == -1) { distinct.push(cellValue); }
	}
	
	return distinct.length;
}

(function() {
	showWeeklyData();
	showListData();
	//$('#dtmtable').DataTable();
})();
