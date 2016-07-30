var originLat=-43.53;
var originLng=172.63;
var orginTitle="Chirstchurch"
var map;
var directionsService;
var directionsDisplay;
var toilets;
var dogEx;
var picTable;
var walkTrack;

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
	
	toilets = new google.maps.Data();
	dogEx = new google.maps.Data();	
	picTable = new google.maps.Data();	
	walkTrack = new google.maps.Data();	

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
		toilets.loadGeoJson('./data/toilet.geojson',null, function (feature) {
			toilets.forEach(function(feature) {
				addIcon(map,feature,'./images/toilet.png');
			});  	
		});	
		toilets.setStyle({	  
		  strokeWeight:0,	
		  fillColor: 'red',
		});	
		toilets.setMap(map);
	}else if(layerId==='toilets' && !show){
		toilets.setMap(null);		
	}
	if(layerId==='dogEx' && show){
		dogEx.loadGeoJson('./data/dogexerciseareaequipment.geojson');  
		dogEx.setStyle({	  
		  strokeWeight:0,	
		  fillColor: 'black'
		});			
		dogEx.setMap(map);
	}else if(layerId==='dogEx' && !show){
		dogEx.setMap(null);	
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
	if(layerId==='walkTrack' && show){
		walkTrack.loadGeoJson('./data/walkingtrack.geojson');  
		walkTrack.setStyle({	  
		  strokeWeight:1,	
		  fillColor: 'orange'
		});			
		walkTrack.setMap(map);
	}else if(layerId==='walkTrack' && !show){
		walkTrack.setMap(null);	
	}	
}

function addIcon(map, feature, icon) {
	console.log('here');
	if (feature.getGeometry().getType()==='Polygon') {

		// get overall bounds so we can estimate the centre
        var bounds=new google.maps.LatLngBounds();
        feature.getGeometry().getArray().forEach(function(path){
            path.getArray().forEach(function(latLng){
				bounds.extend(latLng);
            });
        });

		mkr = new google.maps.Marker(
			{
				position: bounds.getCenter(),
				map: map,
				icon: icon
			}
		);
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
