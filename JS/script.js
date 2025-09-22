// Karte erstellen und zentrieren
    var map = L.map('map', {zoomControl: false}).setView([46.851712, 9.524212], 13);

// OpenStreetMap Tiles laden
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

// Fester Kreismarker
    var circle = L.circleMarker([46.85, 9.53], {
         radius: 20,        // feste Grösse
        color: 'red',      // Randfarbe
        fillColor: 'red', // Füllfarbe
        fillOpacity: 0.6,
        opacity: 0.3
    }).addTo(map);


     var circle = L.circleMarker([46.86, 9.52], {
         radius: 10,        // feste Grösse
        color: 'red',      // Randfarbe
        fillColor: 'red', // Füllfarbe
        fillOpacity: 0.6,
        opacity: 0.3
    }).addTo(map);