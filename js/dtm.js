/*Globals*/
var columns  = ["timestamp","protocolversion","carid","lat","lon","context","varid","varvalue","state"];
var host = "ec2-52-5-123-253.compute-1.amazonaws.com";
var port = "3001";
var population = 44414000;

var contexts = ["no_context","vehicle_status","vehicle_info","ivi_radio_xm","ivi_radio_sir","ivi_opticaldrive","ivi_rearsystem","ivi_remote","phone","ams","ivi_radio_fm","ivi_radio_am"]
var vars     = ["no_vars","sir_channel","xm_channel","artist ","stitle ","album","sir_radio_id","xm_radio_id","os_level","model ","type","carrier","ams_vol","ams_control","ams_balance","ams_fader","ams_rpresets","fm_freq","am_freq"];
var states   = ["no_state","ig1_off","ig1_on","initial","key_off","key_on","scanning","tuned","seeking","next","previous","playing","paused","stop","buffering","usb","hf(handsfree)","bt(bluetooth)","ams_on","ams_off","ams_am","ams_fm","ams_sdars","ams_cd","ams_mp3","ams_bluray","ams_xm"];

/*Functions*/
function getDatetime(unixtime) {
	var date = new Date(unixtime * 1000);
	return date;
}

function getUnixtime(date) {
	var unixtime = date.getTime()/1000;
	return unixtime;
}
	
function getLocationName(latitude, longitude, callback) {
    if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
        return false;
    }

    var locationName="-";
	callback(locationName);
}

/*Init*/
(function() { 
	var underscore = angular.module('underscore', []);
	
	underscore.factory('_', ['$window', function() {
	  return $window._; // assumes underscore has already been loaded on the page
	}]);

	var app = angular.module('dtm', ['underscore']);
	
	/* Controllers */
	app.controller('dtmController',function($scope,$http,$interval) {
		load_fms();
		load_headunits();
		load_years();
		load_months();
		//load_data();
		
		$interval(function(){
			load_data();
		},50000);
		
		function load_data(){
			loadWeeklyIndicators($scope,$http);
		};
		
		function load_headunits() {
			$http({
				method: 'GET',
				url: 'http://'+host+':'+port+'/dtmhusv1/1',
				data: { state: 1 }
			}).success(function (result) {
				console.log('HU loaded successfully ...');
				$scope.cars = result.data;
			});
		};
		
		function load_years() {
			$scope.years = [{year:2015,value:2015},{year:2014,value:2014},{year:2013,value:2013}];
			$scope.selectedYear = (new Date).getFullYear();
		}
		
		function load_months() {
			$scope.months = [{month:"January",value:0},  
			{month:"February",value:1},  
			{month:"March",value:2},  
			{month:"April",value:3},  
			{month:"May",value:4},  
			{month:"June",value:5},  
			{month:"July",value:6},  
			{month:"August",value:7},  
			{month:"September",value:8},  
			{month:"October",value:9},  
			{month:"November",value:10}, 
			{month:"December",value:11}];
			$scope.selectedMonth = (new Date).getMonth();
		}
		
		function load_fms() {
			$http({
				method: 'GET',
				url: 'http://'+host+':'+port+'/dtmfmsv1/1',
				data: { state: 1 }
			}).success(function (result) {
				console.log('FM loaded successfully ...');
				$scope.fms = result.data;
			});
			
			frequencies=$scope.fms;
		};
		
		$scope.loadCaridData = function() {
			if(typeof $scope.fms != "undefined") {
				if(typeof $scope.selectedCar != "undefined") {
					$http.get('http://'+host+':'+port+'/dtmpackagesv1/'+$scope.selectedCar).success(function(res) {
						console.log('Carid filter loaded successfully ...');
						$scope.packages = res.data;
					});
				}
			}
		}
		
		$scope.loadMonthlyData = function() {
			var year = $scope.selectedYear; 
			var month = $scope.selectedMonth;
			
			var lastday  = (new Date(year,month+1,0)).getDate();
			
			$http.get('http://'+host+':'+port+'/dtmstatsv4/'+year+'/'+month).success(function(res) {
				
				var statsid = 0;
				if (res.data.length > 0) {
					
					statsid = res.data[0]["statsid"];
					
					//Rankings
					$http.get('http://'+host+':'+port+'/dtmstatsv2/'+statsid).success(function(res) {
						console.log('Rankings loaded successfully. Searched by '+year+'/'+month+' ...');
						
						$scope.listeners = _.sortBy(res.data,'listeners').reverse();//.slice(0,10);
						$scope.aqhs 	 = _.sortBy(res.data,'aqhshare').reverse();
						$scope.tsls 	 = _.sortBy(res.data,'tsl').reverse();
					});
					
					//Charts
					$http.get('http://'+host+':'+port+'/dtmstatsv3/'+statsid).success(function(res) {
						console.log('Charta loaded successfully. Searched by '+year+'/'+month+' ...');						

						$scope.aqhmonth = res.data;
						
						var chartsAQH = prepareDataChart($scope.aqhmonth, lastday, "aqhpersons");
						drawChart("#stats-aqhs", "AQHs", chartsAQH);
						
						var chartsListener = prepareDataChart($scope.aqhmonth, lastday, "listeners");
						drawChart("#stats-listeners", "Listeners", chartsListener);
						
						var chartsTSL = prepareDataChart($scope.aqhmonth, lastday, "tsl");
						drawChart("#stats-tsls", "Listeners", chartsTSL);
					});
				} else {
					$scope.listeners = [];
					$scope.aqhs = []; 	
					$scope.tsls = [];
					drawChart("#stats-aqhs", "", []);
					drawChart("#stats-listeners", "", []);
					drawChart("#stats-tsls", "", []);
				}
			});
		}
	});

/* ------------------------------------------------------------------------------------------------------------------ */
	/* Functions */
	
	function prepareDataChart(data, lastday, rowname) {
		
		var result = [];
		for (i=1;i <= lastday; i++) {
			var row = _.findWhere(data, {day: i});
			var value = (typeof row != "undefined") ? row[rowname] :  0;
			result.push([i,value]);
		}
		return result;
	}
	
	function loadWeeklyIndicators($scope,$http) {
		var current = new Date;
		var year	= current.getFullYear();
		var month   = current.getMonth();
		var day     = current.getDate();
		
		$http.get('http://'+host+':'+port+'/dtmstatsv5/'+year+'/'+month+'/'+day).success(function(res) {
			
			console.log('Indicators loaded successfully. Searched by '+year+'/'+month+'/'+day+' ...');
			
			var statsid = 0;
			if (res.data.length > 0) {
				
				statsid = res.data[0]["statsid"];
				
				//Rankings
				$http.get('http://'+host+':'+port+'/dtmstatsv6/'+statsid).success(function(res) {
					$scope.inputs 	 = res.data[0]["inputs"];
					$scope.carids 	 = res.data[0]["carids"];
					$scope.carmodels = res.data[0]["carmodels"];
				});
			} else {
				$scope.inputs 	 = -1;
				$scope.carids 	 = -1;
				$scope.carmodels = -1;
			}
		});
		
		$("#gncars").html(((typeof $scope.carids != "undefined")?$scope.carids:'-')+'  <i class="icon-arrow-up"></i>');
		$("#gninputs").html(((typeof $scope.carids != "undefined")?$scope.inputs:'-')+'  <i class="icon-arrow-up"></i>');
		$("#gncarmodels").html(((typeof $scope.carids != "undefined")?$scope.carmodels:'-')+'  <i class="icon-arrow-up"></i>');
	}
	
/* ------------------------------------------------------------------------------------------------------------------ */
	/* Charts */
		
	function drawChart(charid, caption, data) {
		
		/* ---------- Chart with points ---------- */
		if($(charid).length)
		{	
			var plot = $.plot($(charid),
				   [ { data: data,
					   label: caption,
					   lines: { show: true, 
								fill: false,
								lineWidth: 2 
							  },
					   shadowSize: 0	
					  }, {
						data: data,
						label: caption,
						bars: { show: true,
								fill: false, 
								barWidth: 0.1, 
								align: "center",
								lineWidth: 4,
						}
					  }
					], {
					   
					   grid: { hoverable: true, 
							   clickable: true, 
							   tickColor: "rgba(255,255,255,0.05)",
							   borderWidth: 0
							 },
					 legend: {
								show: false
							},	
					   colors: ["rgba(255,255,255,0.8)", "rgba(255,255,255,0.6)", "rgba(255,255,255,0.4)", "rgba(255,255,255,0.2)"],
						xaxis: {ticks:15, tickDecimals: 0, color: "rgba(255,255,255,0.8)" },
						yaxis: {ticks:5, tickDecimals: 0, color: "rgba(255,255,255,0.8)" },
					});
			
			function showTooltip(x, y, contents) {
				$('<div id="tooltip">' + contents + '</div>').css( {
					position: 'absolute',
					display: 'none',
					top: y + 5,
					left: x + 5,
					border: '1px solid #fdd',
					padding: '2px',
					'background-color': '#dfeffc',
					opacity: 0.80
				}).appendTo("body").fadeIn(200);
			}

			var previousPoint = null;
			$(charid).bind("plothover", function (event, pos, item) {
				$("#x").text(pos.x.toFixed(2));
				$("#y").text(pos.y.toFixed(2));

					if (item) {
						if (previousPoint != item.dataIndex) {
							previousPoint = item.dataIndex;

							$("#tooltip").remove();
							var x = item.datapoint[0].toFixed(2),
								y = item.datapoint[1].toFixed(2);

							showTooltip(item.pageX, item.pageY,
										item.series.label + " of day " + x + " = " + y);
						}
					}
					else {
						$("#tooltip").remove();
						previousPoint = null;
					}
			});
		}
	}

/* ------------------------------------------------------------------------------------------------------------------ */
	/* Filters */
	
	app.filter('timestampToLocaleString', function () {		
		return function (timestap) {
			var date = new Date(timestap * 1000);
			var options = { year: '2-digit', month: '2-digit', day: '2-digit', hour:'numeric', minute:'numeric', second:'numeric', hour12: false, timeZone:'UTC' };
			
			return date.toLocaleString('en-US', options);
		};
	});
	
	app.filter('getContext', function () {
		return function (contextId) {
			
			return contexts[contextId];
		};
	});
	
	app.filter('getVar', function () {
		return function (varId) {
			
			return vars[varId];
		};
	});
	
	app.filter('getState', function () {
		return function (stateId) {
			
			return states[stateId];
		};
	});
	
	app.filter('getListenerPercentage', function () {
		return function (value, cumlisteners) {			
			return (cumlisteners > 0) ? (value/cumlisteners)*100 : 0;
		};
	});
	
	app.filter('getAqhSharePercentage', function () {
		return function (value, cumaqhpersons) {
			return (cumaqhpersons > 0) ? (value/cumaqhpersons)*100 : 0;
		};
	});
	
	app.filter('getAqhRatingPercentage', function () {
		return function (value) {
			return (population > 0) ? (value/population)*100 : 0;
		};
	});
	
})();
