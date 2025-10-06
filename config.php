<?php
// config.php
// ----------------------
// Datenbank-Konfiguration
// ----------------------

// Hostname der Datenbank
define('DB_HOST', 'localhost');

// Datenbank-Benutzername
define('DB_USER', 'dein_benutzername');

// Datenbank-Passwort
define('DB_PASS', 'dein_passwort');

// Name der Datenbank
define('DB_NAME', 'velogeier_db');

// Verbindung zur Datenbank herstellen (PDO)
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8",
        DB_USER,
        DB_PASS
    );
    // Fehler-Modus auf Exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Bei Fehler: Meldung ausgeben
    die("Datenbank-Verbindung fehlgeschlagen: " . $e->getMessage());
}
