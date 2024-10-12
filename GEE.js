// Example of bounding box coordinates from GEE
// var bounds = [[latMin, lonMin], [latMax, lonMax]]; // Replace with your bounding box coordinates

// Fit the map to the image bounds
// map.fitBounds(bounds);


var bounds = [[28.494650644, 70.01325594], [28.542171522, 70.07730582]];
map.fitBounds(bounds);  // Automatically zooms and pans the map to fit the bbox
