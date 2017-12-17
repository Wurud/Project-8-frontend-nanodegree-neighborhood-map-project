//------------VIEWMODEL------------

var markers = [];

function initMap() {

  //constructor to create a new map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 40.713425,
      lng: -74.005524
    },
    zoom: 11,
  });

  positionMarker();
  showListings();

  ko.applyBindings(ViewModel());
}



var marker;
var largeInfoWindow;

function positionMarker() {

  //Initiate a new InfoWindow
  largeInfoWindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();


  //Loop through locations array to create marker array
  for (var i = 0; i < allLocations.length; i++) {
    var position = new google.maps.LatLng(allLocations[i].lat, allLocations[i].lng);
    var title = allLocations[i].title;
    var type = allLocations[i].type;
    var img = allLocations[i].image;


    //Create a marker per location, then add it to markers array
    marker = new google.maps.Marker({
      position: position,
      title: title,
      image: img,
      animation: google.maps.Animation.DROP,
      id: i
    });

    //Add a new marker to array of markers
    markers.push(marker);

    // Extend the bondaries of the map for each marker
    bounds.extend(marker.position);

    showMarker();
  }
}

var url;
var articleList;
var articleUrl;

function showMarker() {
  //Create an onClick event to open an InfoWindow for each marker.
  marker.addListener('click', function() {
    bounce(marker);
    populateInfoWindow(this, largeInfoWindow);
  });
}

function bounce(marker) {
  //Animate the marker when it's clicked
  marker.getAnimation() == google.maps.Animation.DROP ? marker.setAnimation(null) : marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function() {
    marker.setAnimation(null);
  }, 1400);

  populateInfoWindow(marker, largeInfoWindow);
}

//This function is to populate the InfoWindow when the marker is clicked
//Onece the marker is clicked, an InfoWindow will display.
function populateInfoWindow(marker, InfoWindow) {

  // Wikipedia ajax request
  var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' +
    marker.title + '&format=json&callback=wikiCallback';

  var ajax = $.ajax({
    url: wikiUrl,
    dataType: "jsonp",
    success: function(response) {
      console.log(response);
      var articleUrl = response[3][0];
      var articleTitle = response[1][0];

      //Check to make sure the windowInfo is not already opened on this marker
      if (InfoWindow.marker != marker) {
        InfoWindow.marker = marker;

        //Include Wikipedia response in the InfoWindow content
        InfoWindow.setContent('<div><p>Wikipedia Link: <a href="' + articleUrl + '">' +
          articleTitle + '</a></p></div>' + '<img src="' + marker.image +
          '" alt=' + marker.title + 'width="170" height="150" >');

        InfoWindow.open(map, marker);

        //Make sure the marker property is cleared if the InfoWindow is closed
        InfoWindow.addListener('closeclick', function() {
          InfoWindow.setMap(null);
        });
      }
    }
  }).fail(function() {
    alert('Error occured');
  });
}


//This function will loop through the markers array and display them all
function showListings() {
  bounds = new google.maps.LatLngBounds();

  //Extend the boundries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }

  //To display map responsively and make sure markers always fit on screen
  //as user resize their browser window
  google.maps.event.addDomListener(window, 'resize', function() {
    map.fitBounds(bounds);
  });
}


var ViewModel = function() {
  var self = this;

  self.search = ko.observable("");
  self.locationList = ko.observableArray([]);

  // Insert allLocations objects into location list
  for (var i = 0; i < allLocations.length; i++) {
    self.locationList().push(allLocations[i]);
  }

  self.searchFilter = ko.computed(function() {
    var filterWord = self.search().toLowerCase();
    var newArray = [];
    for (var i = 0; i < markers.length; i++) {
      var markerTitle = markers[i].title.toLowerCase();
      if (markerTitle.includes(filterWord)) {
        self.markers[i].setVisible(true);
        newArray.push(markers[i]);
      } else {
        self.markers[i].setVisible(false);
      }
    }
    return newArray;

  }, self);

};

function mapError() {
  alert('Ooops! something happened, the map could not be loaded');
}
