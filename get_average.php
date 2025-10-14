<?php
require "config.php"; // DB-Verbindung

if (!isset($_GET['location'])) {
    http_response_code(400);
    echo json_encode(["error" => "Location fehlt"]);
    exit;
}
$location = $_GET['location'];

// Aktuelle Zeit
$currentHour = date("H");
$currentMinute = date("i");

// Start- und Endzeit für +/- 30 Minuten
$startTime = date("H:i:s", strtotime("-30 minutes"));
$endTime   = date("H:i:s", strtotime("+30 minutes"));


// SQL: Durchschnitt pro Wochentag, gleiche Stunde, letzte 30 Tage
$sql = "
    SELECT 
        DAYOFWEEK(`timestamp`) AS wochentag,
        AVG(velos) AS durchschnitt
    FROM IM3Velo
    WHERE location = :location
      AND `timestamp` >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      AND TIME(`timestamp`) BETWEEN :startTime AND :endTime
    GROUP BY wochentag
    ORDER BY wochentag
";


$stmt = $pdo->prepare($sql);
$stmt->execute([
    'location' => $location,
    'startTime' => $startTime,
    'endTime' => $endTime
]);

$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Mapping DAYOFWEEK
$wochentage = [1=>"Sonntag",2=>"Montag",3=>"Dienstag",4=>"Mittwoch",5=>"Donnerstag",6=>"Freitag",7=>"Samstag"];

// Ergebnisarray vorbereiten
$result = [];
foreach ($wochentage as $num => $tag) {
    $result[$tag] = 0; // Standardwert
}

foreach ($rows as $row) {
    $tagName = $wochentage[$row['wochentag']];
    $result[$tagName] = round($row['durchschnitt'], 1);
}

// JSON ausgeben
header('Content-Type: application/json');
echo json_encode($result);
