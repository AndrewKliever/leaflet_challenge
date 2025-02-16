// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map.
let street = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Humanitarian OpenStreetMap Team'
});

// Create the map object with center and zoom options.
let map = L.map('map', {
  center: [20, 0], // Center of the world
  zoom: 2,
  layers: [basemap] // Default layer
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(map);

// OPTIONAL: Step 2
// Create the layer groups for earthquakes and tectonic plates.
let earthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();

// Define base maps (background options).
let baseMaps = {
  "Basemap": basemap,
  "Street Map": street
};

// Define overlay maps (data layers).
let overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

// Add a control to the map that will allow the user to change which layers are visible.
L.control.layers(baseMaps, overlayMaps).addTo(map);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // Function to return the style for each earthquake marker.
  function styleInfo(feature) {
      return {
          radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.geometry.coordinates[2]),
          color: "#000",
          weight: 0.5,
          opacity: 1,
          fillOpacity: 0.8
      };
  }

  // Function to determine marker color based on earthquake depth.
  function getColor(depth) {
      return depth > 90 ? "#ff0000" :
             depth > 70 ? "#ff6600" :
             depth > 50 ? "#ff9900" :
             depth > 30 ? "#ffcc00" :
             depth > 10 ? "#ffff00" :
                          "#00ff00";
  }

  // Function to determine the radius of the earthquake marker based on magnitude.
  function getRadius(magnitude) {
      return magnitude ? magnitude * 4 : 1;
  }

  // Add a GeoJSON layer to the map.
  L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng);
      },
      style: styleInfo,
      onEachFeature: function (feature, layer) {
          layer.bindPopup(`<b>Magnitude:</b> ${feature.properties.mag} <br><b>Location:</b> ${feature.properties.place}`);
      }
  }).addTo(earthquakes);

  // Add the earthquake layer to the map.
  earthquakes.addTo(map);

  // Create a legend control object.
  let legend = L.control({ position: "bottomright" });

  // Define the legend contents.
  legend.onAdd = function () {
      let div = L.DomUtil.create("div", "info legend"),
          depthLevels = [-10, 10, 30, 50, 70, 90],
          colors = ["#00ff00", "#ffff00", "#ffcc00", "#ff9900", "#ff6600", "#ff0000"];

      // Loop through depth intervals and create legend labels.
      for (let i = 0; i < depthLevels.length; i++) {
          div.innerHTML +=
              `<i style="background:${colors[i]}"></i> ${depthLevels[i]}${depthLevels[i + 1] ? "&ndash;" + depthLevels[i + 1] + " km<br>" : "+ km"}`;
      }

      return div;
  };

  // Add the legend to the map.
  legend.addTo(map);

  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
      L.geoJson(plate_data, {
          style: {
              color: "orange",
              weight: 2
          }
      }).addTo(tectonicPlates);

      // Add the tectonic plates layer to the map.
      tectonicPlates.addTo(map);
  });
});
