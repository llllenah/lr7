<?php
// (Вимога 2.b)
header('Content-Type: application/json');
$logFile = 'server_log.txt'; // Файл для логів

// Встановлюємо часову зону (важливо для порівняння!)
date_default_timezone_set('Europe/Kyiv');

$jsonData = file_get_contents('php://input');
$event = json_decode($jsonData, true);

if ($event && isset($event['num']) && isset($event['msg'])) {
    
    // Фіксуємо серверний час
    $serverTime = date('c'); // 'c' це формат ISO 8601 (2025-10-28T15:23:56+02:00)
    
    // Форматуємо рядок для логу
    // Ми будемо використовувати JSON Lines (JSONL) - один JSON-об'єкт на рядок
    $logEntry = json_encode([
        'num' => $event['num'],
        'client_time' => $event['time'], // Час, який надіслав JS
        'server_time' => $serverTime, // Час, коли сервер ОБРОБИВ запит
        'msg' => $event['msg']
    ]);

    // Додаємо в кінець файлу (FILE_APPEND)
    file_put_contents($logFile, $logEntry . PHP_EOL, FILE_APPEND);
    
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
}
?>