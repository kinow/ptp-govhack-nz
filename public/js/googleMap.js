var originLat=-43.53;
var originLng=172.63;
var orginTitle="Chirstchurch"
var map;
var directionsService;
var directionsDisplay;

// main layers
var toilets = new google.maps.Data();
var dogEx = new google.maps.Data();
var heritage = new google.maps.Data();
var art;
var picTable;
var walkTrack;
var eventsAug;

// icons for layers
var toiletIcons = new Array();
var dogIcons = new Array();
var heritageIcons = new Array();
var walkIcons = new Array();

var infoWindow = new google.maps.InfoWindow();

function initMaps() {
	var latlng = new google.maps.LatLng(originLat,originLng);
	var mapProps={
		center: latlng,
		zoom:16,
		scrollwheel:false,
		mapTypeControl: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	directionsService = new google.maps.DirectionsService();
	map = new google.maps.Map(document.getElementById("googleMap"),mapProps);  	
	
	picTable = new google.maps.Data();	
	art = new google.maps.Data();
	eventsAug = new google.maps.Data();

	var rendererOptions = { draggable: true };  		
	directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

	/*new google.maps.Marker({
		position: latlng, 
	    map: map, 
	    title:orginTitle
	});*/
	

	//loadLayers();
}
	
function loadLayers(layerId,show){	
	if(layerId==='toilets' && show){
		showPolygonLayer(
			'./data/toilet.geojson',
			'./images/toilet.png',
			toilets,
			toiletIcons,
			'transparent'
		);
	}else if(layerId==='toilets' && !show){
		hidePolygonLayer(toilets,toiletIcons);
	}
	if(layerId==='dogEx' && show){
		showPolygonLayer(
			'./data/dogexerciseareaequipment.geojson',
			'./images/dog.png',
			dogEx,
			dogIcons,
			'black'
		);
	}else if(layerId==='dogEx' && !show){
		hidePolygonLayer(dogEx,dogIcons);
	}
	if(layerId==='heritage' && show){
		showPolygonLayer(
			'./data/districtplanheritageitem.geojson',
			'./images/heritage.png',
			heritage,
			heritageIcons,
			'orange'
		);

	}else if(layerId==='heritage' && !show){
		hidePolygonLayer(heritage,heritageIcons);
	}
	
	if(layerId==='walkTrack' && show){
		if(typeof(walkTrack) == 'undefined'){
			walkTrack = new google.maps.Data();
			walkTrack.loadGeoJson('./data/walkingtrack.geojson'); 
			walkTrack.loadGeoJson(
					'./data/dogexerciseareaequipment.geojson', null, function (feature) {
						walkTrack.forEach(function(feature) {
							addIcon(map,feature,'./images/walking.png',walkIcons);
						});
					}); 
			walkTrack.setStyle({	  
			  strokeWeight:3,
			  strokeColor:'DarkGreen',	
			  fillColor: 'DarkGreen'
			});			
		}	
		walkTrack.setMap(map);
		for (var icon in walkIcons) {
 			walkIcons[icon].setVisible(true);
 		}
	}else if(layerId==='walkTrack' && !show){
		walkTrack.setMap(null);	
		for (var icon in walkIcons) {
 			walkIcons[icon].setVisible(false);
 		}
	}	

	if(layerId==='picTable' && show){
		picTable.loadGeoJson('./data/picnictable.geojson');  
		picTable.setStyle({	  
		  strokeWeight:0,	
		  fillColor: 'transparent',
		  icon: './images/picnic.png'
		});			

		picTable.setMap(map);
	}else if(layerId==='picTable' && !show){
		picTable.setMap(null);	
	}

	if(layerId==='art' && show){
		art.loadGeoJson('./data/artwork.geojson');  
		art.setStyle({	  
		  strokeWeight:0,	
		  fillColor: 'transparent',
		  icon: './images/art.png'
		});			

		art.setMap(map);

		art.addListener('click', function(event) {
			infoWindow.setContent("<div class='popupWindow_main'>" + event.feature.getProperty("Title") + "</div>");
			infoWindow.setPosition(event.latLng);
			infoWindow.open(map);
		});

	}else if(layerId==='art' && !show){
		art.setMap(null);	
	}

	if(layerId==='event' && show){
		debugger;
		eventsAug.loadGeoJson('./data/events_chch_201608.geojson', null, function(feature) {
			// filter for today's date.
			eventsAug.forEach(function(feature) {
				var dt_start = feature.getProperty('datetime_start');
				var dt_end   = feature.getProperty('datetime_end');
				var date_start = dt_start.substring(0,10);
				var date_end = dt_end.substring(0,10);

				var now = new Date();
				
				var date_current = now.getFullYear() + "-" + ("00" + (now.getMonth() + 1)).slice(-2) + '-' + ("00" + (now.getDate())).slice(-2);

				// filter for today's events (and single-day events)
				if (date_start != date_end || date_start != date_current) {
					eventsAug.remove(feature);
				}
				
			});
		});
		eventsAug.setStyle({	  
		  strokeWeight:0,	
		  fillColor: 'transparent',
		  icon: './images/event.png'
		});

		eventsAug.setMap(map);

		eventsAug.addListener('click', function(event) {
			// work out when the event starts
			var dt_start = event.feature.getProperty('datetime_start');
			var time_start = dt_start.substring(11,16);


			infoWindow.setContent("<div class='popupWindow_main'>" + event.feature.getProperty("name") + "<br/>Today at " + time_start + "<br/>" + event.feature.getProperty("location_summary").replace(", Christchurch","") + "</div>");
			infoWindow.setPosition(event.feature.getGeometry().get());
			infoWindow.open(map);
		});
		
	}else if(layerId==='event' && !show){
		eventsAug.setMap(null);	
	}
}

function showPolygonLayer(geojson,image,layer,icons,color) {
	if(typeof(layer.getMap()) == 'undefined'){
		layer.loadGeoJson(
			geojson, null, function (feature) {
				layer.forEach(function(feature) {
					addIcon(map,feature,image,icons);
				});
			});
		layer.setStyle({	  
			strokeWeight:0,	
			fillColor: color,
		});
	}
	layer.setMap(map);
 	for (var icon in icons) {
 		icons[icon].setVisible(true);
 	}
}

function hidePolygonLayer(layer,icons) {
	layer.setMap(null);

 	for (var icon in icons) {
 		icons[icon].setVisible(false);
 	}
}

function addIcon(map, feature, icon, iconArray) {
	// get overall bounds so we can estimate the centre
    var bounds=new google.maps.LatLngBounds();
	var geometry = feature.getGeometry().getType();
	if (geometry==='MultiPolygon') {

		feature.getGeometry().getArray().forEach(function(polys){
            polys.getArray().forEach(function(poly){
				poly.forEachLatLng(function(latLng){
					bounds.extend(latLng);
				});
            });
        });

	}else if (geometry==='Polygon') {

        feature.getGeometry().getArray().forEach(function(path){
            path.getArray().forEach(function(latLng){
				bounds.extend(latLng);
            });
        });
    }

	if (geometry==='MultiPolygon' || geometry == 'Polygon') {
		mkr = new google.maps.Marker(
			{
				position: bounds.getCenter(),
				map: map,
				icon: icon
			}
		);

		iconArray.push(mkr);

		// somewhat hacky way to add descriptions

		// if it has this property then it must be a heritage feature!
		if (typeof(feature.getProperty("HeritageI4") !== 'undefined')) {
			mkr.addListener('click', function(event) {
				infoWindow.setContent("<div class='popupWindow_main'>" + feature.getProperty("HeritageI4").replace("and Setting","") + "</div>");
				infoWindow.setPosition(event.latLng);
				infoWindow.open(map);
			});
		}

	}
}

function getDirections(){
	var travelMode = $('input[name="travelMode"]:checked').val();
	var start = $("#routeStart").val();
	var end = $("#routeEnd").val();
	var waypoints=[];
	var request = {
	origin: start,
	destination: end,
	waypoints: waypoints,
	unitSystem: google.maps.UnitSystem.METRIC,
	travelMode: google.maps.DirectionsTravelMode[travelMode]
	};

	
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById("directionsResults"));

	directionsService.route(request, function(response, status) {
	if (status == google.maps.DirectionsStatus.OK) {
      $('#directionsResults').empty();
      directionsDisplay.setDirections(response);
    }else{
    	if (status == 'ZERO_RESULTS') {
    		alert('No route could be found between the origin and destination.');
    	} else if (status == 'UNKNOWN_ERROR') {
	        alert('A directions request could not be processed due to a server error. The request may succeed if you try again.');
	    } else if (status == 'REQUEST_DENIED') {
	        alert('This webpage is not allowed to use the directions service.');
	    } else if (status == 'OVER_QUERY_LIMIT') {
	        alert('The webpage has gone over the requests limit in too short a period of time.');
	    } else if (status == 'NOT_FOUND') {
	        alert('At least one of the origin, destination, or waypoints could not be geocoded.');
	    } else if (status == 'INVALID_REQUEST') {
	        alert('The DirectionsRequest provided was invalid.');         
	    } else {
	        alert("There was an unknown error in your request. Requeststatus: nn"+status);
	    }
    }
    loadLayers();
});
}
