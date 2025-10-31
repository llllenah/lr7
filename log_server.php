<?php
header('Content-Type: application/json');
$logFile = 'server_log.txt';

date_default_timezone_set('Europe/Kyiv');

$jsonData = file_get_contents('php://input');
$event = json_decode($jsonData, true);

if ($event && isset($event['num']) && isset($event['msg'])) {
    
    $serverTime = date('c');     
    
    $logEntry = json_encode([
        'num' => $event['num'],
        'client_time' => $event['time'],
        'server_time' => $serverTime,
        'msg' => $event['msg']
    ]);

    file_put_contents($logFile, $logEntry . PHP_EOL, FILE_APPEND);
    
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
}
?>