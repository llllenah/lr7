<?php
header('Content-Type: application/json');
$logFile = 'local_log.json';

$jsonArrayData = file_get_contents('php://input');

if ($jsonArrayData) {
    file_put_contents($logFile, $jsonArrayData, LOCK_EX);
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'No data received']);
}
?>