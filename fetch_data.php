<?php
require "config.php";

$apiUrl = "https://api.nextbike.net/maps/nextbike-live.json";

//Daten von der API holen
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true); // Sicherheit: SSL prüfen
$apiData = curl_exec($ch);
curl_close($ch);

//JSON Dekodieren
$data = json_decode($apiData, true);
if ($data === null){
    die("Ungültiges JSON von der API");
}

$city = $data["countries"][127]["cities"][0];

//wichtige Daten erheben
$placesFiltered = [];
foreach ($city["places"] as $place){
    $placesFiltered[] = [
        "location" => $place["name"],
        "velos" => $place["bikes"]
    ];
}

//JSON erstellen
header("Content-Type: application/json");
echo json_encode($placesFiltered);

/*
//Daten pro Ort holen
foreach ($city["places"] as $place){
    $name = $place["name"];
    $bikes = $place["bikes"];
}
    */