document.addEventListener("DOMContentLoaded", function () {
    var map = L.map('map').setView([30.3753, 69.3451], 11); // Coordinates of Pakistan as an example

 // Load a base map (ESRI World Imagery)
 L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map); // Add this line to display the layer

    var bounds = [[28.494650644, 70.01325594], [28.542171522, 70.07730582]];
    map.fitBounds(bounds);
    
    var selectedLayer = null; // To store currently selected layer

    // **Interactive Layer** - for click-based interaction
    var interactiveLayer = L.geoJSON(vectorlayer, {
        onEachFeature: function (feature, layer) {
            // Set up click event for each polygon to display field info
            layer.on('click', function () {
                if (selectedLayer) {
                    interactiveLayer.resetStyle(selectedLayer); // Reset the previous selection
                }
                selectedLayer = layer; // Store the currently selected layer

                var area = turf.area(layer.toGeoJSON()); // Calculate area in square meters
                var areaInAcres = area / 4046.86; // Convert area to acres
                
                // Update the field info panel with the selected polygon's properties
                document.getElementById('district').textContent = feature.properties.District;
                document.getElementById('tehsil').textContent = feature.properties.Tehsil;
                document.getElementById('mouza').textContent = feature.properties.Mouza;
                document.getElementById('ownerName').textContent = feature.properties.Owners_Nam;
                document.getElementById('ownerId').textContent = feature.properties.owner_ID;
                document.getElementById('ownerCnic').textContent = feature.properties.CNIC_numbe;
                document.getElementById('contract').textContent = feature.properties.Contract;
                document.getElementById('cropType').textContent = feature.properties.classLabel;
                document.getElementById('area').textContent = areaInAcres.toFixed(2); // Display area in acres
                document.getElementById('cropStatus').textContent = feature.properties.Status || "N/A";

                // Highlight the selected polygon
                layer.setStyle({
                    color: 'red',
                    weight: 3
                });

                // Zoom to the selected polygon
                map.fitBounds(layer.getBounds());
            });
        }
    });

    // **Search Results Layer** - initially empty, will be populated based on search
    var searchResultsLayer = L.geoJSON(null, {
        style: function () {
            return {
                color: 'blue', // Highlight color for search results
                weight: 3 ,
                fillColor: '#f79b39',
                fillOpacity : 0.2
            };
        },
        onEachFeature: function (feature, layer) {
            layer.on('click', function () {
                var area = turf.area(layer.toGeoJSON());
                var areaInAcres = area / 4046.86;

                // Update the field info panel with the clicked search result polygon's properties
                document.getElementById('district').textContent = feature.properties.District;
                document.getElementById('tehsil').textContent = feature.properties.Tehsil;
                document.getElementById('mouza').textContent = feature.properties.Mouza;
                document.getElementById('ownerName').textContent = feature.properties.Owners_Nam;
                document.getElementById('ownerId').textContent = feature.properties.owner_ID;
                document.getElementById('ownerCnic').textContent = feature.properties.CNIC_numbe;
                document.getElementById('contract').textContent = feature.properties.Contract;
                document.getElementById('cropType').textContent = feature.properties.classLabel;
                document.getElementById('area').textContent = areaInAcres.toFixed(2);
                document.getElementById('cropStatus').textContent = feature.properties.Status || "N/A";
            });
        }
    }).addTo(map); // Add the search results layer to the map by default, but it will be hidden.

    // Add layer control to toggle between full geoJSON and search results
    var baseLayers = {
        "Full GeoJSON Layer": interactiveLayer,
        "Search Results": searchResultsLayer
    };
    L.control.layers(baseLayers).addTo(map);

    // Add the interactive layer to the map initially
    interactiveLayer.addTo(map);

    // Search button event listener
    document.getElementById('searchButton').addEventListener('click', function () {
        var searchValue = document.getElementById('searchInput').value.toLowerCase();

        // Clear any previously highlighted layers in the search results
        searchResultsLayer.clearLayers();

        // Find and add matching polygons to the search results layer
        interactiveLayer.eachLayer(function (layer) {
            var feature = layer.feature.properties;
            var ownerName = feature.Owners_Nam.toLowerCase();
            var ownerId = feature.owner_ID.toString();
            var ownerCnic = feature.CNIC_numbe.toString();
            var contract = feature.Contract.toString();
            var cropType = feature.classLabel.toLowerCase();

            // Check if search value matches any of the desired fields
            if (
                ownerName.includes(searchValue) ||
                ownerId.includes(searchValue) ||
                ownerCnic.includes(searchValue) ||
                contract.includes(searchValue) ||
                cropType.includes(searchValue)
            ) {
                searchResultsLayer.addData(layer.toGeoJSON()); // Add matching polygon to the search results layer
            }
        });

        // Hide the interactive layer when showing search results
        if (map.hasLayer(interactiveLayer)) {
            map.removeLayer(interactiveLayer);
        }

        // Show the search results layer
        if (!map.hasLayer(searchResultsLayer)) {
            map.addLayer(searchResultsLayer);
        }
    });

    // Listen for layer control events to reset search and interactive layers
    map.on('overlayadd', function (eventLayer) {
        if (eventLayer.name === 'Full GeoJSON Layer') {
            // Reset search results when switching back to the full geoJSON layer
            searchResultsLayer.clearLayers(); // Clear any search results
            map.addLayer(interactiveLayer); // Ensure interactive layer is added back
        }
    });

    map.on('overlayremove', function (eventLayer) {
        if (eventLayer.name === 'Full GeoJSON Layer') {
            // When interactive layer is turned off, ensure search results layer remains
            if (!map.hasLayer(searchResultsLayer)) {
                map.addLayer(searchResultsLayer);
            }
        }
    });
});
