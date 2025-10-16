// =====================
// Karte initialisieren
// =====================
var map = L.map('map', {zoomControl:false}).setView([46.851712, 9.524212], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// =====================
// Variablen
// =====================
let ApiData = [];
let DBData = {};
let activeMarker = null;

// =====================
// Chart.js Wochenchart
// =====================
const ctx = document.getElementById('bikeChart').getContext('2d');
const labels = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
let bikeChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            label: '',
            data: Array(labels.length).fill(0),
            backgroundColor: labels.map(tag =>
                (tag === "Samstag" || tag === "Sonntag") ? "rgba(41,41,41,0.6)" : "rgba(128,128,128,0.6)"
            ),
            borderWidth: 0
        }]
    },
    options: {
        plugins: { legend:{ display:false } },
        scales: {
            x: { grid:{ display:false }, ticks:{ font:{ size:9 }, maxRotation:0, minRotation:0 } },
            y: { beginAtZero:true, stepSize:1, grid:{ display:false } }
        },
        animation: false
    }
});

// =====================
// Chart.js Stundenchart
// =====================
const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
let hourlyChart = new Chart(hourlyCtx, {
    type: 'bar',
    data: {
        labels: Array.from({length:24}, (_,i)=>i+":00"),
        datasets: [{
            label: 'Velos',
            data: Array(24).fill(0),
            backgroundColor: 'rgba(100,150,250,0.6)',
            borderWidth: 0
        }]
    },
    options: {
        plugins: { legend:{ display:false } },
        scales: {
            x: { grid:{ display:false }, ticks:{ font:{ size:9 } } },
            y: { beginAtZero:true, stepSize:1, grid:{ display:false } }
        },
        animation: false
    }
});

// =====================
// Daten aus lokalem JSON
// =====================
fetch("JS/Beispiel.json")
    .then(res => res.json())
    .then(localData => {
        DBData = Object.fromEntries(localData.map(place => [place.name, place.bikes_week]));

        // API-Daten für Marker
        fetch("https://api.nextbike.net/maps/nextbike-live.json")
            .then(res => res.json())
            .then(data => {
                ApiData = data.countries[127].cities[0].places.map(spot => ({
                    name: spot.name,
                    lat: spot.lat,
                    lng: spot.lng,
                    bikes: spot.bikes
                }));

                // Marker erstellen
                ApiData.forEach(place => {
                    const marker = L.circleMarker([place.lat, place.lng], {
                        radius: Math.max(place.bikes+1),
                        color: "red",
                        fillColor: "red",
                        fillOpacity: 0.6,
                        opacity: 0.3,
                        title: place.name
                    }).addTo(map);

                    // Klick auf Marker
                    marker.on('click', () => {
                        const infobox = document.getElementById('infobox');

                        if(activeMarker === marker){
                            infobox.style.display = 'none';
                            activeMarker = null;
                            document.getElementById('hourlyContainer').style.display = 'none';
                            return;
                        }

                        activeMarker = marker;
                        infobox.style.display = 'flex';
                        document.getElementById('hourlyContainer').style.display = 'none';

                        const weekData = DBData[place.name]
                            ? labels.map(tag => DBData[place.name][tag] ?? 0)
                            : Array(labels.length).fill(0);

                        // Heute markieren
                        let todayIndex = new Date().getDay() - 1;
                        if(todayIndex < 0) todayIndex = 6;

                        const colors = labels.map((tag,i) =>
                            i===todayIndex ? 'rgba(255,0,0,0.4)' : (tag==="Samstag"||tag==="Sonntag") ? "rgba(41,41,41,0.6)" : "rgba(128,128,128,0.6)"
                        );

                        bikeChart.data.labels = labels;
                        bikeChart.data.datasets[0].data = weekData;
                        bikeChart.data.datasets[0].backgroundColor = colors;
                        bikeChart.update();
                    });
                });
            });
    });

// =====================
// Wochenchart Balken Klick
// =====================
document.getElementById('bikeChart').onclick = function(evt){
    const points = bikeChart.getElementsAtEventForMode(evt,'nearest',{intersect:true},true);
    if(!points.length) return;

    const firstPoint = points[0];
    const clickedIndex = firstPoint.index;
    const clickedDayLabel = bikeChart.data.labels[clickedIndex];

    if(!activeMarker) return;
    const location = activeMarker.options.title;

    const dayMap = {"Montag":2,"Dienstag":3,"Mittwoch":4,"Donnerstag":5,"Freitag":6,"Samstag":7,"Sonntag":1};
    const dayOfWeek = dayMap[clickedDayLabel];

    fetch(`get_hourly_average.php?location=${encodeURIComponent(location)}&day=${dayOfWeek}`)
        .then(res=>res.json())
        .then(hourlyData=>{
            const hourlyValues = Array.from({length:24}, (_,h)=>hourlyData[h] ?? 0);

            hourlyChart.data.datasets[0].data = hourlyValues;
            hourlyChart.update();

            document.getElementById('hourlyContainer').style.display = 'block';
        })
        .catch(err => console.error("Fehler beim Laden stündlicher Daten:", err));
};

// =====================
// Close Buttons
// =====================
function closeInfoBox(){
    document.getElementById('infobox').style.display = "none";
    activeMarker = null;
    document.getElementById('hourlyContainer').style.display = 'none';
}

function closeHourly(){
    document.getElementById('hourlyContainer').style.display = 'none';
}
