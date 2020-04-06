// Past 30d, all earthquakes 

var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Get data
d3.json(url).then(data => {

  // Create markers for each feature
  // Markers should reflect the magnitude of the earthquake in their size and color. 
  // Earthquakes with higher magnitudes should appear larger and darker in color.

  // Add to each marker a popup describing the place and time of each earthquake
  function makePopups(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.mag +
      "</h3><p>" + feature.properties.place + "<br><br>" + 
      new Date(feature.properties.time).toDateString() + "</p>");
  }

  var earthquakes = L.geoJSON(data, {
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

  // Define map style option layers
  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Grayscale": grayscale
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      39.83, -98.58
    ],
    zoom: 5,
    layers: [grayscale, earthquakes]
  });

  // Create a legend that will provide context for your map data.

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [0,1,2,3,4,5];
    var labels = [];

    var legendInfo = 
      "<div class=\"labels\"></div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {

      var colors = ["#c4f069", "#e5f16a", "#efdb67", "#eabb61", "#e5a975", "#e0736f"]
      labels.push(`<li style=\"background-color: ${colors[index]};\"><span class=\"legendText\">${limits[index]} +</span></li>`);
    }); // TODO: Get numbers to appear alongside color boxes; will this help? https://leafletjs.com/examples/choropleth/

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);
});



