// Karte erstellen und zentrieren
var map = L.map('map', {zoomControl: false}).setView([46.851712, 9.524212], 13);

// OpenStreetMap Tiles laden
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//API Datenspeicher
let ApiData = [];

/* 
------------------------------------------------------
Version mit API
------------------------------------------------------

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
    console.log(ApiData);

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
    */
/*
------------------------------------------------------
Version mit Lokalem File
------------------------------------------------------
*/
   
// JSON von lokalem File holen
fetch("JS/Beispiel.json")
  .then(res => res.json())
  .then(ApiData => {
    console.log("Lokales JSON geladen:", ApiData);

    // Marker erstellen und Klick-Event hinzufügen
    ApiData.forEach(place => {
        const marker = L.circleMarker([place.lat, place.lng], {
            radius: Math.max(place.bikes + 1),
            color: "red",
            fillColor: "red",
            fillOpacity: 0.6,
            opacity: 0.3
        }).addTo(map);

        marker.on('click', () => {
            // Infobox anzeigen
            document.getElementById('infobox').style.display = 'flex';
            
            // Daten für diesen Standort
            const weekData = Object.values(place.bikes_week); // [Mo, Di, Mi,...]
            
            // Chart aktualisieren
            bikeChart.data.datasets[0].data = weekData;
            bikeChart.data.datasets[0].label = `Velos bei ${place.name}`;
            bikeChart.update();
        });
    });
});    


ApiData.forEach(place => {
    const marker = L.circleMarker([place.lat, place.lng], {
        radius: Math.max(place.bikes + 1),
        color: "red",
        fillColor: "red",
        fillOpacity: 0.6,
        opacity: 0.3
    }).addTo(map);

    marker.on('click', () => {
        // Infobox anzeigen
        document.getElementById('infobox').style.display = 'flex';
        
        // Daten für diesen Standort
        const weekData = Object.values(place.bikes_week); // [Mo, Di, Mi,...]
        
        // Chart aktualisieren
        bikeChart.data.datasets[0].data = weekData;
        bikeChart.data.datasets[0].label = `Velos bei ${place.name}`;
        bikeChart.update();
    });
});

// Initialer Chart (leer)
const ctx = document.getElementById('bikeChart').getContext('2d');
let bikeChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
        datasets: [{
            label: 'Velos verfügbar',
            data: [0,0,0,0,0,0,0],
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: { beginAtZero: true, stepSize: 1 }
        }
    }
});