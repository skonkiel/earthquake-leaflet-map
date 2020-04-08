// Past 30d, all earthquakes 
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
// Tectonic plate boundary data, saved locally from https://github.com/fraxen/tectonicplates/tree/master/GeoJSON
var faultlinesLoc = "boundaries.json";

//////////// IMPORT THE DATA //////////////////
function gatherData(earthquakeData, faultlineData) {
  d3.json(earthquakeURL).then(data => {
    var earthquakesData = data.features;
    // console.log(earthquakes);
  
    d3.json(faultlinesLoc).then(function(lines) {
      var faultlinesData = lines.features;
      // console.log(faultlines);

      // call create features function
      makeFeatures(earthquakesData, faultlinesData);
    });    
  
  });
}

gatherData(earthquakeURL, faultlinesLoc);

//////////// MAKE THE FEATURES //////////////////
function makeFeatures(earthquakesData, faultlinesData) {
  // Create markers for each feature
  // Markers should reflect the magnitude of the earthquake in their size and color. 
  // Earthquakes with higher magnitudes should appear larger and darker in color.

  // A popup describing the place and time of each earthquake
  function makePopups(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.mag +
      "</h3><p>" + feature.properties.place + "<br><br>" + 
      new Date(feature.properties.time).toDateString() + "</p>");
  }

  // create earthquake marker layer
  var earthquakes = L.geoJSON(earthquakesData, {
    // logic adapted from https://maptimeboston.github.io/leaflet-intro/
    style: function(feature) {
      var mag = feature.properties.mag
      if (mag > 5) fillColor = "#e0736f";
      else if (mag > 4) fillColor = "#e5a975";
      else if (mag > 3) fillColor = "#eabb61";
      else if (mag > 2) fillColor = "#efdb67";
      else if (mag > 1) fillColor = "#e5f16a";
      else if (mag > 0) fillColor = "#c4f069";
      return {radius: mag * 3, color: "black", fillColor: fillColor,  weight: 0.5, opacity: 1, fillOpacity: 1};
    },
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng)
    },
    onEachFeature: makePopups
  });

  // create faultline marker layer

  // create feature creation function
  function onEachFeature(feature, layer) {
    L.polyline(feature.geometry.coordinates)
  }
  
  // call feature function "onEachFeature" per https://leafletjs.com/examples/geojson/
  var faultlines = L.geoJSON(faultlinesData, {
    onEachFeature: onEachFeature
  });

  makeMap(earthquakes, faultlines);
  
}

//////////// CREATE THE MAP //////////////////
function makeMap(earthquakes, faultlines) {
  // Define map style option layers
  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Define a baseMaps object for maps layers
  var baseMaps = {
    "Grayscale": grayscale,
    "Sattelite": satellite,
    "Outdoors": outdoors
  };

  // Define overlayMaps for marker layers
  var overlayMaps = {
    "Fault Lines": faultlines,
    "Earthquakes": earthquakes
  };

  // Create a legend
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
    var labels = [];      

    div.innerHTML = "<div class=\"labels\"></div>";

    limits.forEach(function(limit, index) {

      var colors = ["#c4f069", "#e5f16a", "#efdb67", "#eabb61", "#e5a975", "#e0736f"]
      labels.push(`<li><span style=\"background-color: ${colors[index]};\" class="box"> </span><span class=\"legendText\">${limits[index]}</span></li>`);
    }); // TODO: Get numbers to appear alongside color boxes

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  var layerControl = L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  });

  // Create our map object
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5, 
    layers: [grayscale, earthquakes, faultlines]
  });

  // Add legend to the map
  legend.addTo(myMap);
  // Add layer control to the map
  layerControl.addTo(myMap);

}

