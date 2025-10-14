// Karte erstellen und zentrieren
var map = L.map('map', {zoomControl: false}).setView([46.851712, 9.524212], 13);

// OpenStreetMap Tiles laden
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

// Datenspeicher
let ApiData = [];
let activeMarker = null;

// Chart initialisieren
const ctx = document.getElementById('bikeChart').getContext('2d');
const labels = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
let bikeChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            label: 'Velos',
            data: Array(labels.length).fill(0),
            backgroundColor: labels.map(tag =>
                (tag === "Samstag" || tag === "Sonntag")
                ? "rgba(41, 41, 41, 0.6)"
                : "rgba(128, 128, 128, 0.6)"
            ),
            borderWidth: 0
        }]
    },
    options: {
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { maxRotation: 0, minRotation: 0, font: { size: 9 } } },
            y: {
                beginAtZero: true,
                stepSize: 1,
                grid: { display: false },
                ticks: {
                    callback: function(value) { return Number.isInteger(value) ? value : null; }
                }
            }
        },
        animation: { duration: 500 }
    }
});

// Daten für Marker von API holen
fetch("https://api.nextbike.net/maps/nextbike-live.json")
  .then(res => res.json())
  .then(data => {
      ApiData = data.countries[127].cities[0].places.map(spot => ({
          name: spot.name,
          lat: spot.lat,
          lng: spot.lng,
          bikes: spot.bikes
      }));

      // Marker auf der Karte erstellen
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

        // Toggle: Infobox ausblenden, wenn derselbe Marker
        if (activeMarker === marker) {
            infobox.style.display = 'none';
            activeMarker = null;
            return;
        }

        infobox.style.display = 'flex';

        // fetch: PHP-Skript liefert Durchschnittswerte der letzten 30 Tage +/- 30 Minuten
        fetch(`get_average.php?location=${encodeURIComponent(place.name)}`)
            .then(res => res.json())
            .then(data => {
                const labels = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];

                // Daten korrekt in der Reihenfolge der Labels
                const weekData = labels.map(tag => data[tag] !== undefined ? parseFloat(data[tag]) : 0);

                // Aktueller Tag (0=Montag)
                let todayIndex = new Date().getDay() - 1;
                if(todayIndex < 0) todayIndex = 6; // Sonntag anpassen

                // Farben: heute = rot, Wochenende = dunkelgrau, Wochentage = grau
                const colors = labels.map((tag, i) =>
                    i === todayIndex 
                        ? 'rgba(255, 0, 0, 0.4)' 
                        : ((tag === "Samstag" || tag === "Sonntag") ? "rgba(41,41,41,0.6)" : "rgba(128,128,128,0.6)")
                );

                // Chart aktualisieren
                bikeChart.data.labels = labels;
                bikeChart.data.datasets[0].data = weekData;
                bikeChart.data.datasets[0].backgroundColor = colors;
                bikeChart.update();

                activeMarker = marker;
            })
            .catch(err => console.error("Fehler beim Laden der Durchschnittsdaten:", err));
    });
});

  })
  .catch(err => console.error("Fehler beim Laden der API-Daten:", err));

// Infobox manuell schliessen
function closeInfoBox() {
    document.getElementById('infobox').style.display = "none";
    activeMarker = null;
}
