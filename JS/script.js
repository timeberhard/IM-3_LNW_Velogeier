// Karte erstellen und zentrieren
var map = L.map('map', {zoomControl: false}).setView([46.851712, 9.524212], 13);

// OpenStreetMap Tiles laden
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Datenspeicher
let ApiData = [];
let DBData = {};
let activeMarker = null; // aktueller Marker

// Chart initialisieren
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
        animation: { duration: 500 } // Animation bei Updates
    }
});

// Daten aus lokalem JSON holen
fetch("JS/Beispiel.json")
  .then(res => res.json())
  .then(localData => {
    DBData = Object.fromEntries(localData.map(place => [place.name, place.bikes_week]));

    // API-Daten für Marker holen
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

            // Klick-Event für Marker
            marker.on('click', () => {
                const infobox = document.getElementById('infobox');

                // Toggle: Infobox ausblenden, wenn derselbe Marker
                if (activeMarker === marker) {
                    infobox.style.display = 'none';
                    activeMarker = null;
                } else {
                    // Infobox öffnen
                    infobox.style.display = 'flex';

                    // Wochen-Daten aus lokalem JSON
                    const weekData = DBData[place.name] 
                        ? labels.map(tag => DBData[place.name][tag] ?? 0)
                        : Array(labels.length).fill(0);

                    // Aktueller Wochentag (0 = Montag)
                    const todayIndex = new Date().getDay() - 1;
                    if(todayIndex < 0) todayIndex = 6; // Sonntag anpassen

                    // Hintergrundfarben: Standard = grau, heute = rot transparent
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
                }
            });
        });
      });
  });

// Infobox manuell schliessen
function closeInfoBox() {
    document.getElementById('infobox').style.display = "none";
    activeMarker = null;
}
  