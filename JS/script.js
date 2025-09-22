// Karte erstellen und zentrieren
var map = L.map('map', {zoomControl: false}).setView([46.851712, 9.524212], 13);

// OpenStreetMap Tiles laden
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//API Datenspeicher
let ApiData = [];

//Daten von der API holen und in ApiData speichern
fetch("https://api.nextbike.net/maps/nextbike-live.json")
  .then(res => res.json())
  .then(data => {
    ApiData = data.countries[126].cities[0].places.map(spot => ({
        name: spot.name,
        lat: spot.lat,
        lng: spot.lng,
        bikes: spot.bikes
    })); 
    console.log("fetchen hat funktioniert");

    // Foreach Schleife, um Kreise zu erstellen
    ApiData.forEach(place => {
    L.circleMarker([place.lat, place.lng], {
        radius: Math.max(place.bikes + 1),
        color: "red",
        fillColor: "red",
        fillOpacity: 0.6,
        opacity: 0.3
    })
    .addTo(map)
    })
  })
