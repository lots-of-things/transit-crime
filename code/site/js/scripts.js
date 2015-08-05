function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

$.ajaxSetup({beforeSend: function(xhr){
  if (xhr.overrideMimeType)
  {
    xhr.overrideMimeType("application/json");
  }
}
});

binl = 0.005;
binh = 4;
binm = 3;
storect = [];
flightdb = [];

curdat = new Date()

glob_mn = Math.floor(curdat.getMonth()/binm)*binm
glob_hr = Math.floor(curdat.getHours()/binh)*binh



function disapear(){
	for (i in flightdb){
		flightdb[i].setMap(null)
	}
	for (i in storect){
		storect[i].setMap(null)
	}
	storect=[]
	flightdb = []
        $("#showpred").removeClass("btn-primary")
        $("#showdata").removeClass("btn-primary")
        $("#showpeeps").removeClass("btn-primary")
}

function imageOverlay(imurl){
        var imageBounds = new google.maps.LatLngBounds(new google.maps.LatLng(41.625,-88), new google.maps.LatLng(42.05,-87.5));
        var overlayOpts = {opacity:0.5}
        overlay = new google.maps.GroundOverlay(imurl,imageBounds,overlayOpts);
        overlay.setMap(map);

}

function closeOverlay(){
        overlay.setMap(null);
}

function showIm(){
        imageOverlay('http://transitized.com/wp-content/uploads/2014/12/Capture-d%E2%80%99%C3%A9cran-2014-12-15-%C3%A0-15.31.43.png')
}

function showOverlay(data,mul){
        disapear();
        for (xx in data){
                for(yy in data[xx]){
                        x = xx*binl
                        y = yy*binl
                        var n = data[xx][yy][-1]*mul
                        var R = Math.floor((255 * n) )
                        var G = 0
                        var B = Math.floor((255 * (1 - n)) )
                        var rectangle = new google.maps.Rectangle({
                                strokeOpacity: 0,
                                fillColor: "rgb("+[R, G, B].join(",")+")",
                                fillOpacity: n,
                                map: map,
                                bounds: new google.maps.LatLngBounds(
                                        new google.maps.LatLng(y, -x),
                                        new google.maps.LatLng(y+binl, -x+binl))
                        });
                        storect.push(rectangle);
                }
        }
        
}


function showPred(){
        mull = 4
        if(typeof prediction === 'undefined'){
                $.getJSON( "js/pred.json", function( pre ) {
                        prediction = pre;
                        showOverlay(prediction,mull)
                });
        }else{
                showOverlay(prediction,mull)
	}
	$("#showpred").addClass("btn-primary")
}

function showPeeps(){
        mull = 4
        if(typeof people === 'undefined'){
                $.getJSON( "js/pass.json", function( pre ) {
                        people = pre;
                        showOverlay(people,mull)
                });
        }else{
                showOverlay(people,mull)
	}
        $("#showpeeps").addClass("btn-primary")
}

function showData(){
        mull = 4
        if(typeof stats === 'undefined'){
                $.getJSON( "js/data.json", function( pre ) {
                        stats = pre;
                        showOverlay(stats,mull)
                });
        }else{
                showOverlay(stats,mull)
	}
	$("#showdata").addClass("btn-primary")
}

function createRect( x,  y, n,tlist,llist){
        var nn = Math.min(n,1)
        var R = Math.floor((255 * n) )
        var G = 0
        var B = Math.floor((255 * (1 - n)) )
        var rectangle = new google.maps.Rectangle({
                strokeOpacity: 0,
                fillColor: "rgb("+[R, G, B].join(",")+")",
                fillOpacity: nn,
                map: map,
                bounds: new google.maps.LatLngBounds(
                        new google.maps.LatLng(y, -x),
                        new google.maps.LatLng(y+binl, -x+binl))
        });
        var contentString = "<b>Crime Types:</b> <br>";
        for (i in tlist){
                contentString = contentString + tlist[i]+", "+llist[i]+"<br>";
        }
        rectangle.cs = contentString;
        rectangle.mymap = map;
        storect.push(rectangle);
        google.maps.event.addListener(rectangle, 'click', function(e){
        var ne = rectangle.getBounds().getNorthEast();
        var infoWindow = new google.maps.InfoWindow();
                infoWindow.setContent(contentString);
                infoWindow.setPosition(ne);

                infoWindow.open(map);
        }); 
}

function showData_OLD(){
	  disapear();
	  $.getJSON( "js/data.json", function( pred ) {
	  for (xx in pred){
		for(yy in pred[xx]){
		  x = xx*binl
		  y = yy*binl
		  var n = pred[xx][yy][-1]*5
		  var tlist = pred[xx][yy]['type']
		  var llist = pred[xx][yy]['location']
		  
		  createRect(x,y,n,tlist,llist);
		   
		}
	  }
	});
	
	$("#showdata").addClass("btn-primary")
}




var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var chicago = new google.maps.LatLng(41.87, -87.69);
  var mapOptions = {
    center: chicago,
    scrollWheel: false,
    zoom: 11
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  directionsDisplay.setMap(map);
//  showPred();
  showIm();
}


function crimepred(dat){
	summer = [];
	maxxie = 0
	hr=Math.floor(glob_hr/binh)
    mn=Math.floor(glob_mn/binm)
    for (i in dat[0]['legs'][0]['steps']){
		s = dat[0]['legs'][0]['steps'][i];
		if(s['travel_mode']=='WALKING'){
			for (ii in s['steps']){
			    ss = s['steps'][ii];
			    x1 = ss['start_location'].lng()
				y1 = ss['start_location'].lat()
				x2 = ss['end_location'].lng()
				y2 = ss['end_location'].lat()
				xl = x1/binl
				yl = y1/binl
				xr = x2/binl
				yr = y2/binl
				if(x1>x2){
					xl = x2/binl
					yl = y2/binl
					xr = x1/binl
					yr = y1/binl
				}
				xg = Math.floor(xl)
				xs = Math.ceil(xr)
				for (x = xg; x < xs; x++){
					y = Math.round((yr-yl)/(xr-xl)*(x-xl)+yl)
					if(-x in prediction){
						if(y in prediction[-x]){
							summer.push(prediction[-x][y][mn][hr])
							if(prediction[-x][y][mn][hr]>maxxie){
								maxxie = prediction[-x][y][mn][hr];
							}
						}
					}
				}
			}
		}
	}
	return maxxie;
}
chiBounds = new google.maps.LatLngBounds(new google.maps.LatLng(41.5,-88), new google.maps.LatLng(42,-87.5))
function calcRoute() {
        var start = document.getElementById('from').value;
        if(start.indexOf("hicago") < 0){
                start = start + ", Chicago, IL"
        }
        var end = document.getElementById('to').value;
        if(end.indexOf("hicago") < 0){
                end = end + ", Chicago, IL"
        }
        var request = {
                origin:start,
                destination:end,
                travelMode: google.maps.TravelMode.TRANSIT,
                provideRouteAlternatives:true
        };
        directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                        if(chiBounds.contains(response.routes[0].bounds.getNorthEast()) && chiBounds.contains(response.routes[0].bounds.getSouthWest())){
                                $("#errormess").css("display", "none");
                                data = response.routes;
                                console.log(data)
                                for (i in data){
                                        var decodedPath = google.maps.geometry.encoding.decodePath(data[i]['overview_polyline']);
                                        
                                        n=crimepred(data)
                                        var R = Math.floor(255 * n) 
                                        var B = Math.floor(255 * (1 - n))
                                        var G = 0
                                        var flightPath = new google.maps.Polyline({
                                                path: decodedPath,
                                                geodesic: true,
                                                strokeColor: "rgb("+[R, G, B].join(",")+")",
                                                strokeWeight: 6,
                                                zIndex: 2
                                        });
                                        var flightPath2 = new google.maps.Polyline({
                                                path: decodedPath,
                                                geodesic: true,
                                                strokeColor: '#FFFFFF',
                                                strokeWeight: 10,
                                                zIndex: 1
                                        });
                                        if(typeof oldpoly !== "undefined"){
                                                oldpoly.setMap(null);
                                                oldpoly2.setMap(null);
                                        }
                                        oldpoly = flightPath
                                        oldpoly2 = flightPath2
                                        flightPath2.setMap(map);
                                        flightPath.setMap(map);
                                }
                        }else{
                                $("#errormess").css("display", "block");
                        }
                }else{
                      $("#errormess").css("display", "block");
                }
        });
}

google.maps.event.addDomListener(window, 'load', initialize);
