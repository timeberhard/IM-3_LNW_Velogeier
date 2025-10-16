var map = L.map('map', {zoomControl: false}).setView([46.851712, 9.524212], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

let ApiData = [];
let activeMarker = null;

const ctx = document.getElementById('bikeChart').getContext('2d');
const labels = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
let bikeChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            label: 'Velos',
            data: Array(labels.length).fill(0),
            backgroundColor: labels.map(tag =>
                (tag === "Samstag" || tag === "Sonntag")
                ? "rgba(41,41,41,0.6)"
                : "rgba(128,128,128,0.6)"
            ),
            borderWidth: 0
        }]
    },
    options: { plugins: { legend: { display: false } } }
});

fetch("https://api.nextbike.net/maps/nextbike-live.json")
.then(res => res.json())
.then(data => {
    ApiData = data.countries[127].cities[0].places.map(spot => ({
        name: spot.name,
        lat: spot.lat,
        lng: spot.lng,
        bikes: spot.bikes
    }));

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
            if(activeMarker === marker){
                infobox.style.display = 'none';
                activeMarker = null;
                return;
            }
            infobox.style.display = 'flex';

            //Wochentag herausfinden
            let todayIndex = new Date().getDay() - 1;
            if(todayIndex < 0) todayIndex = 6;

            let weekData = Array(labels.length).fill(0);
            weekData[todayIndex] = place.bikes;

            const colors = labels.map((tag,i) => 
                i === todayIndex ? 'rgba(255,0,0,0.4)' :
                (tag === "Samstag" || tag === "Sonntag") ? "rgba(41,41,41,0.6)" : "rgba(128,128,128,0.6)"
            );

            bikeChart.data.datasets[0].data = weekData;
            bikeChart.data.datasets[0].backgroundColor = colors;
            bikeChart.update();

            activeMarker = marker;

            // Durchschnittswerte optional nachladen
            fetch(`get_average.php?location=${encodeURIComponent(place.name)}`)
            .then(res => res.json())
            .then(avgData => {
                const weekData = labels.map(tag => avgData[tag] !== undefined ? parseFloat(avgData[tag]) : 0);
                bikeChart.data.datasets[0].data = weekData;
                bikeChart.update();
            })
            .catch(err => console.error(err));
        });
    });
})
.catch(err => console.error("Fehler beim Laden der API-Daten:", err));

function closeInfoBox() {
    document.getElementById('infobox').style.display = "none";
    activeMarker = null;
}
