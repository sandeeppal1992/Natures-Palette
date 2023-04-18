//This file is created by Software Engg. Group 3 Memorial University Students. 
//It contains the map and all the implementation to draw the polygons and the mapping of the coordinates to the markers.

var curLat = null; //user location
var curLon = null;

var placeMarkers = [];
  var input;
  var searchBox;
  var curposdiv;
  var curseldiv;

var isSelected= false;
var currShape ;



var drawingManager;
      var selectedShape;
      var colors = ['#1E90FF', '#FF1493', '#32CD32', '#FF8C00', '#4B0082'];
      var selectedColor;
      var colorButtons = {};

      function clearSelection() {
        if (selectedShape) {
          if (typeof selectedShape.setEditable == 'function') {
            selectedShape.setEditable(false);
            isSelected = false
          }
          selectedShape = null;
        }
      }

      function updateCurSelText(shape) {
        posstr = "" + selectedShape.position;
        if (typeof selectedShape.position == 'object') {
          posstr = selectedShape.position.toUrlValue();
        }
        pathstr = "" + selectedShape.getPath;
        if (typeof selectedShape.getPath == 'function') {
          pathstr = [];
          for (var i = 0; i < selectedShape.getPath().getLength(); i++) {
            const coordinate = selectedShape.getPath().getAt(i).toUrlValue();
            // .toUrlValue(5) limits number of decimals, default is 6 but can do more
            pathstr.push({x : coordinate.split(",")[0], y: coordinate.split(",")[1], });
          }   
          document.getElementById("locationString").value = JSON.stringify(pathstr);
        }
        bndstr = "" + selectedShape.getBounds;
        cntstr = "" + selectedShape.getBounds;
        if (typeof selectedShape.getBounds == 'function') {
          var tmpbounds = selectedShape.getBounds();
          cntstr = "" + tmpbounds.getCenter().toUrlValue();
          bndstr = "[NE: " + tmpbounds.getNorthEast().toUrlValue() + " SW: " + tmpbounds.getSouthWest().toUrlValue() + "]";
        }
        cntrstr = "" + selectedShape.getCenter;
        if (typeof selectedShape.getCenter == 'function') {
          cntrstr = "" + selectedShape.getCenter().toUrlValue();
        }
        radstr = "" + selectedShape.getRadius;
        if (typeof selectedShape.getRadius == 'function') {
          radstr = "" + selectedShape.getRadius();
        }
      }

      function setSelection(shape, isNotMarker) {
        console.log("selected",shape);
       
        clearSelection();
        selectedShape = shape;
        if (isNotMarker){
          shape.setEditable(true);
          isSelected = true;
          debugger;
        }
        selectColor(shape.get('fillColor') || shape.get('strokeColor'));
        updateCurSelText(shape);

      }

      function deleteSelectedShape() {
      
        
        if(selectedShape){
          selectedShape.setMap(null);
          isSelected = false;
          selectedShape=null;
        }
       
      }

      function selectColor(color) {
        selectedColor = color;
        for (var i = 0; i < colors.length; ++i) {
          var currColor = colors[i];
          colorButtons[currColor].style.border = currColor == color ? '2px solid #789' : '2px solid #fff';
        }
      }

      function setSelectedShapeColor(color) {
        if (selectedShape) {
          if (selectedShape.type == google.maps.drawing.OverlayType.POLYLINE) {
            selectedShape.set('strokeColor', color);
          } else {
            selectedShape.set('fillColor', color);
          }
        }
      }

      function makeColorButton(color) {
        var button = document.createElement('span');
        button.className = 'color-button';
        button.style.backgroundColor = color;
        google.maps.event.addDomListener(button, 'click', function() {
          selectColor(color);
          setSelectedShapeColor(color);
        });

        return button;
      }

       function buildColorPalette() {
         var colorPalette = document.getElementById('color-palette');
         for (var i = 0; i < colors.length; ++i) {
           var currColor = colors[i];
           var colorButton = makeColorButton(currColor);
           colorPalette.appendChild(colorButton);
           colorButtons[currColor] = colorButton;
         }
         selectColor(colors[0]);
       }

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
        window.alert("no location");
    }
}
function showPosition(position) {
    curLat = position.coords.latitude;
    curLon = position.coords.longitude;
}
function initMap(){
  getLocation() //finds out user location to fomat the map
  if (curLat == null){
    //curLat = 42.3601;   //if the user location cannot be found, set default ones
    //curLon = -71.0589;   // of boston
    curLat = -1.142307;   //if the user location cannot be found, set default ones
    curLon = -53.370157;
    console.log("random locations");
  }
  var options = {
    zoom:6,
    center:{lat:curLat, lng:curLon},
    disableDefaultUI: false, //added now
    zoomControl: true,
    mapTypeControl: true,
    keyboardShortcuts : false,
    mapTypeId: google.maps.MapTypeId.ROADMAP //added now
  }
 

  function deletePlacesSearchResults() {
    for (var i = 0, marker; marker = placeMarkers[i]; i++) {
      marker.setMap(null);
    }
    placeMarkers = [];
    input.value = ''; // clear the box too
  }

  var map = new google.maps.Map(document.getElementById("map"),options);


  var addMarker = function (results) {
    var marker = new google.maps.Marker({
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      map: map,
      position: {lat: parseFloat(results.decimallatitude),lng: parseFloat(results.decimallongitude)},
      animation: google.maps.Animation.DROP,
    });
      var infoWindow = new google.maps.InfoWindow({
      });

    marker.addListener('click', function(){
      var lat = parseFloat(results.decimallatitude);
      var lng = parseFloat(results.decimallongitude);
      infoWindow.setContent('<h5> latitude =' + lat + ', longitude=' + lng + '</h5>');
      infoWindow.open(map,marker);
    });
  }

  window.addMarker = addMarker;

  curposdiv = document.getElementById('curpos');
  curseldiv = document.getElementById('cursel');

  var polyOptions = {
    strokeWeight: 0,
    fillOpacity: 0.45,
    editable: true
  };
  // Creates a drawing manager attached to the map that allows the user to draw
  // markers, lines, and shapes.
  drawingManager = new google.maps.drawing.DrawingManager({
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.POLYLINE,
      ],
    },
    markerOptions: {
      draggable: true,
      editable: true,
    },
    polylineOptions: {
      editable: true
    },
    map: map
  });

  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
    //~ if (e.type != google.maps.drawing.OverlayType.MARKER) {
      var isNotMarker = (e.type != google.maps.drawing.OverlayType.MARKER);
      // Switch back to non-drawing mode after drawing a shape.
      drawingManager.setDrawingMode(null);

      // Add an event listener that selects the newly-drawn shape when the user
      // mouses down on it.
      var newShape = e.overlay;
      newShape.type = e.type;
      google.maps.event.addListener(newShape, 'click', function() {
        setSelection(newShape, isNotMarker);
      });
      google.maps.event.addListener(newShape, 'drag', function() {
        updateCurSelText(newShape);
      });
      google.maps.event.addListener(newShape, 'dragend', function() {
        updateCurSelText(newShape);
      });
      setSelection(newShape, isNotMarker);
    //~ }// end if
  });


  // Clear the current selection when the drawing mode is changed, or when the
        // map is clicked.
        google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
        google.maps.event.addListener(map, 'click', clearSelection);

        buildColorPalette();      
        
        var DelShapeDiv = document.createElement('div');
        DelShapeDiv.style.backgroundColor = '#007fff';
        DelShapeDiv.style.margin = "10px";
        DelShapeDiv.style.padding = "5px";
        DelShapeDiv.style.cursor = 'pointer';
        DelShapeDiv.innerHTML ='DELETE SHAPE';
        DelShapeDiv.display= 'block';
        DelShapeDiv.position=  'absolute';
        DelShapeDiv.style.height = "30px";
        DelShapeDiv.style.width = "90px";
        DelShapeDiv.style.color = "white";
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(DelShapeDiv);
        google.maps.event.addDomListener(DelShapeDiv, 'click', deleteSelectedShape);
    

        searchBox = new google.maps.places.SearchBox( //var
          /** @type {HTMLInputElement} */(input));

        // Listen for the event fired when the user selects an item from the
        // pick list. Retrieve the matching places for that item.
        google.maps.event.addListener(searchBox, 'places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }
          for (var i = 0, marker; marker = placeMarkers[i]; i++) {
            marker.setMap(null);
          }

          // For each place, get the icon, place name, and location.
          placeMarkers = [];
          var bounds = new google.maps.LatLngBounds();
          for (var i = 0, place; place = places[i]; i++) {
            var image = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            var marker = new google.maps.Marker({
              map: map,
              icon: image,
              title: place.name,
              position: place.geometry.location
            });

            placeMarkers.push(marker);

            bounds.extend(place.geometry.location);
          }

          map.fitBounds(bounds);
        });

        // Bias the SearchBox results towards places that are within the bounds of the
        // current map's viewport.
        google.maps.event.addListener(map, 'bounds_changed', function() {
          var bounds = map.getBounds();
          searchBox.setBounds(bounds);
        }); 
      }
    


