// Karte erstellen und zentrieren
var map = L.map('map', {zoomControl: false}).setView([46.851712, 9.524212], 13);

// OpenStreetMap Tiles laden
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let ApiData = []; //API Datenspeicher
let activeMarker = null; // merkt sich, welcher Marker gerade aktiv ist

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
    const infobox = document.getElementById('infobox');

    // Toggle: Wenn derselbe Marker wieder angeklickt wird → Infobox schließen
    if (activeMarker === marker) {
        infobox.style.display = 'none';
        document.getElementById('map').style.height = '90vh'; // Originalhöhe wiederherstellen
        activeMarker = null;
    } else {
        // Infobox öffnen
        infobox.style.display = 'flex';

        // Wochen-Daten für den Marker
        const labels = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
        const weekData = labels.map(tag => place.bikes_week[tag] ?? 0);

        // Chart aktualisieren
        bikeChart.data.labels = labels;
        bikeChart.data.datasets[0].data = weekData;
        bikeChart.update();

        activeMarker = marker; // merken, welcher Marker aktiv ist
    }
});

    });
});    



// Initialer aChart (leer)
const ctx = document.getElementById('bikeChart').getContext('2d');
const labels = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

let bikeChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            label: '',
            data: [],
            backgroundColor: labels.map(tag =>
            (tag === "Samstag" || tag === "Sonntag")
            ? "rgba(41, 41, 41, 0.6)"
            :"rgba(128, 128, 128, 0.6)"
          ),
            borderColor: 'rgba(0, 0, 0, 1)',
            borderWidth: 0
        }]
    },
    options: {
        plugins: {
          legend:{
            display: false
          }
        },
        scales: {
          x: {
            grid: {display: false},
            ticks: {
              maxRotation: 0,
              minRotation: 0,
              font: {
                size: 9
              }
            }
          },
            y: { beginAtZero: true, stepSize: 1, grid: {display: false} }
        }
    }
});

function closeInfoBox(){
  document.getElementById('infobox').style.display ="none";
}