<?php
require "config.php";

if(!isset($_GET['location']) || !isset($_GET['day'])){
    http_response_code(400);
    echo json_encode(["error"=>"Location oder day fehlt"]);
    exit;
}

$location = $_GET['location'];
$dayOfWeek = intval($_GET['day']); // 1=Sonntag, 2=Montag ...

$sql = "
    SELECT HOUR(`timestamp`) AS stunde, AVG(velos) AS durchschnitt
    FROM IM3Velo
    WHERE location = :location
      AND DAYOFWEEK(`timestamp`) = :day
      AND `timestamp` >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
    GROUP BY stunde
    ORDER BY stunde
";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    'location' => $location,
    'day' => $dayOfWeek
]);

$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$result = [];
for($i=0;$i<24;$i++) $result[$i]=0;

foreach($rows as $row){
    $result[$row['stunde']] = round($row['durchschnitt'],1);
}

header('Content-Type: application/json');
echo json_encode($result);
